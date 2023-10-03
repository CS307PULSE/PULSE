import spotipy
import multiprocessing
import time
import User
from Exceptions import ErrorHandler

class Playback:
    def __init__(self, user = None):
        self.user = user
        self.devices = ""
        self.currently_playing = ""
        self.shuffle = ""
        self.repeat = ""
        self.current_device = ""
        self.progress = ""
        self.is_playing = ""

    def initial_check(self):
        try:
            self.devices = self.user.spotify_user.devices()
            self.currently_playing = self.user.spotify_user.current_playback()
            self.is_playing = self.currently_playing['is_playing']
            if self.is_playing : 
               self.shuffle = self.currently_playing['shuffle_state']
               self.repeat = self.currently_playing['repeat_state']
               self.current_device = self.currently_playing['device']
               self.progress = self.currently_playing['progress_ms']
            else : 
               self.progress = 0
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)

    def player_checker(self):
       try:
        while True:
            self.currentlyplaying = self.user.spotify_user.get_current_playback()
            print("Current Playback:", playback_info)
            time.sleep(1)
       except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)

    def start_thread(self):
        checker = multiprocessing.Process(target = player_checker, args=())
        checker.start()

    def set_shuffle(self):
        if self.shuffle :
           self.user.spotify_user.shuffle(False)
        else :
           self.user.spotify_user.shuffle(True)