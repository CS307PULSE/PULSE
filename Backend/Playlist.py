import spotipy
import multiprocessing
import time
import User
from Exceptions import ErrorHandler
import Emotion
import requests
import base64
class Playlist:
    def add_track(user, playlistid, song):
        user.spotify_user.playlist_add_items(playlistid, song)

    def change_image(user, playlist, url):
        try:
            # Download the image from the URL
            response = requests.get(url)
    
            if response.status_code == 200:
                # Convert the image content to Base64
                image_data = response.content
                base64_image = base64.b64encode(image_data).decode('utf-8')

                # Check the image format (you may need to modify this part based on your needs)
                if image_url.endswith('.jpg'):
                    image_format = 'jpeg'
                else:
                    # Handle other image formats as needed
                    raise ValueError("Unsupported image format")

                # Construct the data URI with the Base64-encoded image
                jpegString = f'data:image/{image_format};base64,{base64_image}'
            else:
                print("Failed to retrieve the image from the URL.")
        except Exception as e:
            print(f"An error occurred: {e}")
        user.spotify_user.playlist_upload_cover_image(playlist, jpegString)

    def create_playlist(user, name, public, collaborative, description):
        user.spotify_user.user_playlist_create(user, name, public, collaborative, description)
    
    def track_remove(user, playlist, spotify_uri):
        print("wow")

    def track_replace(user, playlist, spotify_uri):
        print("wow")

    def track_reorder(user, playlist, spotify_uri):
        print("wow")

    def playlist_follow(user, playlist, spotify_uri):
        print("wow")

    def playlist_unfollow(user, playlist, spotify_uri):
        print("wow")

    def playlist_generate(user, playlist, spotify_uri):
        print("wow")

    def playlist_autofill(user, playlist, spotify_uri):
        print("wow")