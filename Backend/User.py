from Icon import Icon
from Playlist import Playlist
from Stats import Stats
from enum import Enum

class Theme(Enum):
    DARK = 0
    LIGHT = 1

class User:
    def __init__(self, 
                 display_name="",
                 login_token="", 
                 userID="", 
                 spotify_user=None,
                 icon=None, 
                 friends_list=None, 
                 playlists=None, 
                 theme=Theme.DARK, 
                 stats=None, 
                 high_scores=None, 
                 recommendation_params=None):
        self.display_name = display_name                                                                   # String
        self.login_token = login_token                                                                     # String
        self.userID = userID                                                                               # String
        self.spotify_user = spotify_user                                                                   # Spotify User
        self.icon = icon                                                                                   # Icon
        self.friends_list = friends_list if friends_list is not None else []                               # Array of userID Strings
        self.playlists = playlists if playlists is not None else []                                        # Array of Playlists
        self.theme = theme                                                                                 # Theme
        self.stats = stats if stats is not None else Stats()                                               # Stats
        self.high_scores = high_scores if high_scores is not None else []                                  # Array of Ints
        self.recommendation_params= recommendation_params if recommendation_params is not None else []     # Array of Doubles

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