import spotipy
import multiprocessing
import time
import User
from Exceptions import ErrorHandler

class Stats:
    def __init__(self,
                 recent_history=None,
                 top_songs=None,
                 top_artists=None,
                 followed_artists=None,
                 saved_songs=None):
        self.recent_history = recent_history
        self.top_songs = top_songs
        self.top_artists = top_artists
        self.followed_artists = followed_artists
        self.saved_songs = saved_songs

    def get_followers(self):
        try:
            userinfo = self.user.spotify_user.currentuser()
            followers = userinfo['followers']
            followers = followers['total']
        except spotipy.exceptions.SpotifyException as e:
          ErrorHandler.handle_error(e)