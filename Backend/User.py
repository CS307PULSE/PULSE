from Playlist import Playlist
from Stats import Stats
from enum import Enum

import spotipy
from spotipy.oauth2 import SpotifyOAuth

class Theme(Enum):
    DARK = 0
    LIGHT = 1

class User:
    def __init__(self, 
                 display_name="",
                 login_token=None, 
                 spotify_id="", 
                 spotify_user=None,
                 friends=None, 
                 playlists=None, 
                 theme=Theme.DARK, 
                 stats=None, 
                 high_scores=None, 
                 recommendation_params=None):
        self.display_name = display_name                                                                   # String
        self.login_token = login_token                                                                     # Token Info Object
        self.spotify_id = spotify_id                                                                       # String
        self.spotify_user = spotify_user                                                                   # Spotify User
        self.friends = friends if friends is not None else []                                              # Array of spotify_id Strings
        self.playlists = playlists if playlists is not None else []                                        # Array of Playlists
        self.theme = theme                                                                                 # Theme
        self.stats = stats if stats is not None else Stats()                                               # Stats
        self.high_scores = high_scores if high_scores is not None else []                                  # Array of Ints
        self.recommendation_params= recommendation_params if recommendation_params is not None else []     # Array of Doubles

    # Updates the access token and spotify_user object
    def refresh_access_token(self, client_id, client_secret, redirect_uri, cache_path):
        # Define your desired scope (e.g., 'user-library-read' for access to a user's library)
        scopes = [
            #Images
            'ugc-image-upload',

            #Spotify Connect
            'user-read-playback-state',
            'user-modify-playback-state',
            'user-read-currently-playing',

            #Playback
            'app-remote-control',
            'streaming',

            #Playlists
            'playlist-read-private',
            'playlist-read-collaborative',
            'playlist-modify-private',
            'playlist-modify-public',

            #Follow
            'user-follow-modify',
            'user-follow-read',
            
            #Listening History
            'user-read-playback-position',
            'user-top-read',
            'user-read-recently-played',

            #Library
            'user-library-read',
            'user-library-modify',

            #Users
            'user-read-email',
            'user-read-private'

            #Open Access
            #user-soa-link
            #user-soa-unlink
            #user-manage-entitlements
            #user-manage-partner
            #user-create-partner
        ]

        # Convert the array to a space-separated string
        scope = ' '.join(scopes)

        # Create a SpotifyOAuth instance with the necessary parameters
        sp_oauth = SpotifyOAuth(client_id=client_id, 
                                client_secret=client_secret, 
                                redirect_uri=redirect_uri, 
                                scope=scope,
                                cache_path=cache_path)

        # Check if cached token exists and is still valid
        token_info = sp_oauth.get_cached_token()

        if not token_info:
            # If no cached token, request authorization from the user
            auth_url = sp_oauth.get_authorize_url()
            print(f'Please visit this URL to authorize your application: {auth_url}')
            response = input('Enter the URL you were redirected to: ')
            code = sp_oauth.parse_response_code(response)
            token_info = sp_oauth.get_access_token(code)

        # When the access token expires, use the refresh token to obtain a new one
        if sp_oauth.is_token_expired(token_info):
            token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])

        sp = spotipy.Spotify(auth=token_info['access_token'])
        self.login_token = token_info
        self.spotify_user = sp
    
    # Updates user Spotify ID
    def update_spotify_id(self):
        self.spotify_id = self.spotify_user.me()['id']

    # Updates list of recent songs with at most 50 objects of type PlayHistory
    def update_recent_history(self):
        self.stats.recent_history = self.spotify_user.current_user_recently_played()['items']
    
    # Updates array of list of top tracks with at most 99 objects of type Track per array entry
    def update_top_songs(self):
        top_tracks = []
        terms = ["short_term", "medium_term", "long_term"]

        for i in range(3):
            top_tracks_per_term = []
            term = terms[i]

            offset = 0
            top_tracks_per_term.extend(self.spotify_user.current_user_top_tracks(time_range=term, limit=50, offset=0)['items'])
            top_tracks_per_term.extend(self.spotify_user.current_user_top_tracks(time_range=term, limit=50, offset=49)['items'][1:])
            
            top_tracks.append(top_tracks_per_term)

        self.stats.top_songs = top_tracks

    # Updates array of list of top artists with at most 99 objects of type Artist per array entry
    def update_top_artists(self):
        top_artists = []
        terms = ["short_term", "medium_term", "long_term"]

        for i in range(3):
            top_artists_per_term = []
            term = terms[i]

            offset = 0
            top_artists_per_term.extend(self.spotify_user.current_user_top_artists(time_range=term, limit=50, offset=0)['items'])
            top_artists_per_term.extend(self.spotify_user.current_user_top_artists(time_range=term, limit=50, offset=49)['items'][1:])
            
            top_artists.append(top_artists_per_term)

        self.stats.top_artists = top_artists

    # Updates list of followed artists with at most max_artists number of objects of type Artist
    def update_followed_artists(self, max_artists=500):
        followed_artists = []

        after = None
        limit = min(50, max_artists)

        while len(followed_artists) < max_artists:
            artists = self.spotify_user.current_user_followed_artists(limit=limit, after=after)['artists']

            after = artists['cursors']['after']

            followed_artists.extend(artists['items'])

            if not artists['items'] or after is None:
                break

        self.stats.followed_artists = followed_artists