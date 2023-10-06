import spotipy
import multiprocessing
import time
import User
from Exceptions import ErrorHandler

class Playback:
    def __init__(self, user = None):
        self.user = user
        self.devices = ""
        self.current_device = ""
        self.current_track = ""
        self.shuffle = ""
        self.repeat = ""
        self.current_device = ""
        self.progress = ""
        self.is_playing = ""
        self.volume = ""
        self.volume_support = ""

    def initial_check(self):
        try:
            self.devices = self.user.spotify_user.devices()
            self.current_device = self.user.spotify_user.current_playback()
            self.is_playing = self.current_device['is_playing']
            self.volume_support = self.current_device['supports_volume']
            if self.volume_support :
              self.volume = self.current_device['volume_percent']
            if self.is_playing : 
              self.current_track = self.current_device['item']
              self.shuffle = self.current_device['shuffle_state']
              self.repeat = self.current_device['repeat_state']
              self.current_device = self.current_device['device']
              self.progress = self.current_device['progress_ms']
            else : 
              self.progress = 0
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)

    def player_checker(self):
       try:
        while True:
            self.currentlyplaying = self.user.spotify_user.get_current_playback()
            time.sleep(1)
       except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)

    def start_thread(self):
        checker = multiprocessing.Process(target = 'player_checker', args=())
        checker.start()

    def set_shuffle(self):
        try:
          if self.shuffle :
            self.user.spotify_user.shuffle(False)
          else :
            self.user.spotify_user.shuffle(True)
        except spotipy.exceptions.SpotifyException as e:
          ErrorHandler.handle_error(e)

    def set_repeat(self, state):
       try:
          
       except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)
    def skip_forward(self):
       try:
        self.user.next_track()
       except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)
        
    def skip_backwards(self):
       try:
        self.user.previous_track()
       except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)
       
    def play(self):
       try:
        self.user.start_playback()
       except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)
       
    def pause(self):
       try:
        self.user.pause_playback()
       except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)
       
    def get_queue(self):
       try:
        self.user.queue()
       except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)
    
    def add_queue(self, song):
       try:
        self.user.add_to_queue(song)
       except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)
    
    def volume_change(self, percent):
       try:
        #volume will be implemented as front end slider volume only changes when slider is moved
        self.user.volume(percent)
       except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)
    
    def switch_device(self, device):
      try:
        if(self.is_playing == True):
          self.user.tranfer_playback(device, True)
        else:
          self.user.transfer_playback(device, False)
      except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)
    
    def get_devices(self):
      try:
        self.user.devices()
      except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)
    
    def select_song(self, context, song):
      try:
        #need to research how context, uris, and offset all interact
        self.user.start_playback(None, context, song, None, None)
      except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)

    def seek_to(self, position):
      try:
        self.user.seek_track(position)
      except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)

    def check_support(self):
      try:
        self.current_device = self.user.spotify_user.current_playback()
        self.volume_support = self.current_device['supports_volume']
      except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)
