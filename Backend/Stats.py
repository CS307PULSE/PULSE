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
                 saved_songs=None,
                 saved_albums=None,
                 saved_playlists=None):
        self.recent_history = recent_history            # Array of type PlayHistory
        self.top_songs = top_songs                      # [Array of type Track, Array of type Track, Array of type Track] 
        self.top_artists = top_artists                  # [Array of type Artist, Array of type Artist, Array of type Artist] 
        self.followed_artists = followed_artists        # Array of type Artist
        self.saved_songs = saved_songs                  # Array of type Track
        self.saved_albums = saved_albums                # Array of type Album
        self.saved_playlists = saved_playlists          # Array of type Playlists