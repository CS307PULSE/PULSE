from Stats import Stats
from enum import Enum
from array import array
from Exceptions import ErrorHandler
from Exceptions import BadResponseError
from Exceptions import TokenNotStoredError
from datetime import datetime

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
                 recommendation_params=None,
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
        self.recommendation_params= recommendation_params if recommendation_params is not None else []     # Array of Doubles
        self.gender = gender                                                                               # String                                   
        self.location = location                                                                           # String

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

    # Updates list of saved albums with at most max_albums number of objects of type Album
    def update_saved_albums(self, max_albums=200):
        try:
            saved_albums = []

            offset = 0
            limit = min(50, max_albums)

            while len(saved_albums) < max_albums:
                response = self.spotify_user.current_user_saved_albums(limit=limit, offset=offset)
                
                if (
                    response is None
                    or response.get('items') is None
                ):
                    break

                offset += limit

                saved_albums.extend(response['items'])

                if (len(response['items']) < limit):
                    break

            self.stats.saved_albums = saved_albums
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)

     # Updates list of saved playlist with at most max_playlists number of objects of type Playlist
    def update_saved_playlists(self, max_playlists=200):
        try:
            saved_playlists = []

            offset = 0
            limit = min(50, max_playlists)

            while len(saved_playlists) < max_playlists:
                response = self.spotify_user.current_user_playlists(limit=limit, offset=offset)
                
                if (
                    response is None
                    or response.get('items') is None
                ):
                    break

                offset += limit

                saved_playlists.extend(response['items'])

                if (len(response['items']) < limit):
                    break

            self.stats.saved_playlists = saved_playlists
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)

    # Searches for item of type items_type with query query and at most max_items number of items
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
    
    # Returns 2-item array with timestamp and follower number
    def get_followers_with_time(self):
        try:
            userinfo = self.spotify_user.me()
            followers = userinfo['followers']['total']
            now = datetime.now()
            return [now, followers]
        except spotipy.exceptions.SpotifyException as e:
          ErrorHandler.handle_error(e)

    # Returns array of track objects
    def get_recommendations(self, 
                            seed_tracks=[], 
                            seed_artists=[], 
                            seed_genres=[], 
                            max_items=10,
                            min_energy=0,
                            max_energy=1,
                            #target_energy,
                            min_popularity=0,
                            max_populatirty=100,
                            #target_popularity,
                            min_acousticness=0,
                            max_acousticness=1,
                            #target_acousticness,
                            min_danceability=0,
                            max_danceability=1,
                            #target_danceability,
                            #min_duration_ms,
                            #max_duration_ms,
                            #target_duration_ms,
                            min_instrumentalness=0,
                            max_instrumentalness=1,
                            #target_instrumentalness,
                            min_key=0,
                            max_key=1,
                            #target_key,
                            min_liveness=0,
                            max_liveness=1,
                            #target_liveness,
                            #min_loudness,
                            #max_loudness,
                            #target_loudness,
                            min_mode=0,
                            max_mode=1,
                            #target_mode,
                            min_speechiness=0,
                            max_speechiness=1,
                            #target_speechiness,
                            #min_tempo,
                            #max_tempo,
                            #target_tempo,
                            #min_time_signature,
                            #max_time_signature,
                            #target_time_signature,
                            min_valence=0,
                            max_valence=1,
                            #target_valence
                            ):
        try:
            recommendations = self.spotify_user.recommendations(seed_tracks=seed_tracks, 
                                                                seed_artists=seed_artists, 
                                                                seed_genres=seed_genres, 
                                                                max_items=max_items,
                                                                min_energy=min_energy,
                                                                max_energy=max_energy,
                                                                #target_energy=target_energy,
                                                                min_popularity=min_popularity,
                                                                max_populatirty=max_populatirty,
                                                                #target_popularity=max_populatirty,
                                                                min_acousticness=min_acousticness,
                                                                max_acousticness=max_acousticness,
                                                                #target_acousticness=target_acousticness,
                                                                min_danceability=min_danceability,
                                                                max_danceability=max_danceability,
                                                                #target_danceability=target_danceability,
                                                                #min_duration_ms=min_duration_ms,
                                                                #max_duration_ms=max_duration_ms,
                                                                #target_duration_ms=target_duration_ms,
                                                                min_instrumentalness=min_instrumentalness,
                                                                max_instrumentalness=max_instrumentalness,
                                                                #target_instrumentalness=target_instrumentalness,
                                                                min_key=min_key,
                                                                max_key=max_key,
                                                                #target_key=target_key,
                                                                min_liveness=min_liveness,
                                                                max_liveness=max_liveness,
                                                                #target_liveness=target_liveness,
                                                                #min_loudness=min_loudness,
                                                                #max_loudness=max_loudness,
                                                                #target_loudness=target_loudness,
                                                                min_mode=min_mode,
                                                                max_mode=max_mode,
                                                                #target_mode=target_mode,
                                                                min_speechiness=min_speechiness,
                                                                max_speechiness=max_speechiness,
                                                                #target_speechiness=target_speechiness,
                                                                #min_tempo=min_tempo,
                                                                #max_tempo=max_tempo,
                                                                #target_tempo=target_tempo,
                                                                #min_time_signature=min_time_signature,
                                                                #max_time_signature=max_time_signature,
                                                                #target_time_signature=target_time_signature,
                                                                min_valence=min_valence,
                                                                max_valence=max_valence,
                                                                #target_valence=target_valence
                                                                )
            return recommendations['tracks']
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)
            return ['' for _ in range(max_items)]