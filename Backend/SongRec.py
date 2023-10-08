import spotipy
import multiprocessing
import time
import User
from Exceptions import ErrorHandler

class SongRecs:
    def getSongs(user, ogtrack, amount):
        try:
            user.spotify_user.recommendations(None, None, ogtrack, amount, None, None)
        except spotipy.exceptions.SpotifyException as e:
          ErrorHandler.handle_error(e)
