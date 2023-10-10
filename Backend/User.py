from Playlist import Playlist
from Stats import Stats
from enum import Enum
from array import array
from Exceptions import ErrorHandler
from Exceptions import BadResponseError
from Exceptions import TokenNotStoredError

import json
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
                 recommendation_params=None,
                 profile_picture=None,
                 gender=None,
                 location=None):
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
        self.gender = gender
        self.profile_picture = profile_picture
        self.location = location

    def stringify(self, obj):
        if obj is None:
            return ''
        return json.dumps(obj, default=lambda x: x.__dict__)

    def to_json(self):
        # Convert the User object to a JSON-serializable dictionary
        user_data = {
            "display_name": self.display_name,
            "spotify_id": self.spotify_id,
            "login_token": self.login_token,
            "friends": self.friends,
            "theme": self.theme.value,
            "high_scores": self.high_scores,
            "recommendation_params": self.recommendation_params
        }
        return user_data

    @classmethod
    def from_json(cls, user_data):
        # Create a User object from a JSON-serializable dictionary
        return cls(
            display_name=user_data["display_name"],
            spotify_id=user_data["spotify_id"],
            login_token=user_data["login_token"],
            friends=user_data["friends"],
            theme=Theme(user_data["theme"]),
            high_scores=user_data["high_scores"],
            recommendation_params=user_data["recommendation_params"],
            spotify_user=spotipy.Spotify(auth=user_data["login_token"]['access_token'])
        )

    # Updates the access token and spotify_user object
    def refresh_access_token(self, sp_oauth):
        if not self.login_token:
            raise TokenNotStoredError

        # When the access token expires, use the refresh token to obtain a new one
        if sp_oauth.is_token_expired(self.login_token):
            self.login_token = sp_oauth.refresh_access_token(self.login_token['refresh_token'])

        sp = spotipy.Spotify(auth=self.login_token['access_token'])
        self.spotify_user = sp
    
    # Updates user Spotify ID
    def update_spotify_id(self):
        try:
            response = self.spotify_user.me()
            self.spotify_id = response['id']
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)

    # Updates list of recent songs with at most 50 objects of type PlayHistory
    def update_recent_history(self):
        try:
            response = self.spotify_user.current_user_recently_played() 
            self.stats.recent_history = response['items']
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)
    
    # Updates array of list of top tracks with at most 99 objects of type Track per array entry
    def update_top_songs(self):
        try:
            top_tracks = []
            terms = ["short_term", "medium_term", "long_term"]

            for i in range(3):
                top_tracks_per_term = []
                term = terms[i]

                response = self.spotify_user.current_user_top_tracks(time_range=term, limit=50, offset=0)
                top_tracks_per_term.extend(response['items'])
                response = self.spotify_user.current_user_top_tracks(time_range=term, limit=50, offset=49)
                if (
                    response is not None
                    and not response.get('items') is None
                ):
                    top_tracks_per_term.extend(response['items'][1:])
                
                top_tracks.append(top_tracks_per_term)

            self.stats.top_songs = top_tracks
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)

    # Updates array of list of top artists with at most 99 objects of type Artist per array entry
    def update_top_artists(self):
        try:
            top_artists = []
            terms = ["short_term", "medium_term", "long_term"]

            for i in range(3):
                top_artists_per_term = []
                term = terms[i]

                response = self.spotify_user.current_user_top_artists(time_range=term, limit=50, offset=0)             
                top_artists_per_term.extend(response['items'])
                response = self.spotify_user.current_user_top_artists(time_range=term, limit=50, offset=49)
                if (
                    response is not None
                    and not response.get('items') is None
                ):
                    top_artists_per_term.extend(response['items'][1:])
                
                top_artists.append(top_artists_per_term)

            self.stats.top_artists = top_artists
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)

    # Updates list of followed artists with at most max_artists number of objects of type Artist
    def update_followed_artists(self, max_artists=500):
        try:
            followed_artists = []

            after = None
            limit = min(50, max_artists)

            while len(followed_artists) < max_artists:
                response = self.spotify_user.current_user_followed_artists(limit=limit, after=after)
                
                if (
                    response is None
                    or response.get('artists') is None
                    or response['artists'].get('items') is None
                    or response['artists'].get('cursors') is None
                ):
                    break

                artists = response['artists']

                after = artists['cursors']['after']

                followed_artists.extend(artists['items'])

                if (len(artists['items']) < limit):
                    break

            self.stats.followed_artists = followed_artists
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)

    # Updates list of saved songs with at most max_tracks number of objects of type Track
    def update_saved_songs(self, max_tracks=200):
        try:
            saved_tracks = []

            offset = 0
            limit = min(50, max_tracks)

            while len(saved_tracks) < max_tracks:
                response = self.spotify_user.current_user_saved_tracks(limit=limit, offset=offset)
                
                if (
                    response is None
                    or response.get('items') is None
                ):
                    break

                offset += limit

                saved_tracks.extend(response['items'])

                if (len(response['items']) < limit):
                    break

            self.stats.saved_songs = saved_tracks
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)


    def search_for_items(self, max_items=20, items_type="tracks", query=""):
        try:
            items = []
            offset = 0
            limit = min(50, max_items)

            while len(items) < max_items:
                response = self.spotify_user.search(q=query, type=items_type, limit=limit, offset=offset)

                if (
                    response is None
                    or response.get(items_type+"s") is None
                    or response[items_type+"s"].get('items') is None
                ):
                    break

                offset += limit

                items.extend(response[items_type+"s"]['items'])

                if (len(response[items_type+"s"]['items']) < limit):
                    break

            return items
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)
            return ['' for _ in range(max_items)]

    def set_gender(self, set):
        self.gender = set

    def set_location(self, set):
        self.location = set

    def set_picture(self, set):
        self.profile_picture = set

    def set_name(self, set):
        self.display_name = set

    def get_gender(self):
        return self.gender 

    def get_location(self):
        return self.location

    def get_picture(self):
        return self.profile_picture 

    def get_name(self):
        return self.display_name