import spotipy
import multiprocessing
import time
import User
from Exceptions import ErrorHandler
import Emotion

class Playlist:
    def add_track(user, playlistid, song):
        user.playlist_add_items(playlistid, song)

    def change_image(user, playlist, jpegString):
        user.playlist_upload_cover_image(playlist, jpegString)

    def create_playlist(user, name, public, collaborative, description):
        user.user_playlist_create(user, name, public, collaborative, description)
    
    def track_remove():
        print("wow")

    def track_replace():
        print("wow")

    def track_reorder():
        print("wow")

    def playlist_follow():
        print("wow")

    def playlist_unfollow():
        print("wow")

    def playlist_generate():
        print("wow")

    def playlist_autofill():
        print("wow")