import spotipy
import multiprocessing
import time
import User
import webbrowser
from Exceptions import ErrorHandler

class Playback:
    def __init__(self, user = None):
        self.user = user
        self.devices = ""
        self.playback = ""
        self.current_track = ""
        self.shuffle = ""
        self.repeat = ""
        self.current_device = ""
        self.progress = ""
        self.is_playing = ""
        self.volume = ""
        self.volume_support = ""
        self.current_image = ""

    def check_playback(self):
        try:
            self.devices = self.user.spotify_user.devices()
            self.playback = self.user.spotify_user.current_playback()
            self.is_playing = self.playback['is_playing']
            self.volume_support = self.playback['device']['supports_volume']
            self.shuffle = self.playback['shuffle_state']
            self.repeat = self.playback['repeat_state']
            self.current_device = self.playback['device']
            if self.volume_support :
              self.volume = self.playback['device']['volume_percent']
            if self.is_playing : 
              self.current_track = self.playback['item']
              self.progress = self.playback['progress_ms']
              self.current_image = self.current_track['album']['images']['url']
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)

    def player_checker(self):
       try:
        while True:
            self.currentlyplaying = self.check_playback()
            self.print_player()
            time.sleep(1)
       except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)

    def start_thread(self):
        checker = multiprocessing.Process(target=self.player_checker)
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
        self.user.spotify_user.repeat(state)
       except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)
  
    def skip_forward(self):
       try:
        self.user.spotify_user.next_track()
       except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)
        
    def skip_backwards(self):
       try:
        self.user.spotify_user.previous_track()
       except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)
       
    def play(self):
       try:
        self.user.spotify_user.start_playback()
       except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)
       
    def pause(self):
       try:
        self.user.spotify_user.pause_playback()
       except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)
       
    def get_queue(self):
       try:
        self.user.spotify_user.queue()
       except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)
    
    def add_queue(self, song):
       try:
        self.user.spotify_user.add_to_queue(song)
       except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)
    
    def volume_change(self, percent):
       try:
        #volume will be implemented as front end slider volume only changes when slider is moved
        self.user.spotify_user.volume(percent)
       except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)
    
    def switch_device(self, device):
      try:
        if(self.is_playing == True):
          self.user.spotify_user.tranfer_playback(device, True)
        else:
          self.user.spotify_user.transfer_playback(device, False)
      except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)
    
    def get_devices(self):
      try:
        self.devices = self.user.spotify_user.devices()
      except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)
    
    def select_song(self, context, song):
      try:
        #need to research how context, uris, and offset all interact
        self.user.spotify_user.start_playback(None, context, song, None, None)
      except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)

    def seek_to(self, position):
      try:
        self.user.spotify_user.seek_track(position)
      except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)

    def check_support(self):
      try:
        self.playback = self.user.spotify_user.current_playback()
        self.volume_support = self.current_device['supports_volume']
      except spotipy.exceptions.SpotifyException as e:
        ErrorHandler.handle_error(e)

    def play_playlist(self, playlist_uri):
      playlist = self.user.spotify_user.playlist(playlist_uri)
      playlist_first_song = playlist['tracks']['items']['track']['TrackObject']
      self.select_song(playlist_uri, playlist_first_song)
      self.play()

    def open_playlist(self, playlist_uri):
      playlist = self.user.spotify_user.playlist(playlist_uri)
      playlist_link = playlist['external_urls']['spotify']
      webbrowser.open(playlist_link) 
      
    def open_song(self, song_uri):
      tracks = self.user.spotify_user.track(song_uri)
      song_link = tracks[0]['external_urls']['spotify'] 
      webbrowser.open(song_link) 
    
    def print_player(self):
      print(f"User: {self.user}")
      print(f"Devices: {self.devices}")
      print(f"Current Device: {self.current_device}")
      print(f"Current Track: {self.current_track}")
      print(f"Shuffle: {self.shuffle}")
      print(f"Repeat: {self.repeat}")
      print(f"Progress: {self.progress}")
      print(f"Is Playing: {self.is_playing}")
      print(f"Volume: {self.volume}")
      print(f"Volume Support: {self.volume_support}")
