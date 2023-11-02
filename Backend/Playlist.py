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
        try:
            user.spotify_user.playlist_add_items(playlistid, song)
        except spotipy.exceptions.SpotifyException as e:
          ErrorHandler.handle_error(e)

    def change_image(user, playlist, url):
        try:
            # Download the image from the URL
            response = requests.get(url)
    
            if response.status_code == 200:
                # Convert the image content to Base64
                image_data = response.content
                base64_image = base64.b64encode(image_data).decode('utf-8')

                # Check the image format (you may need to modify this part based on your needs)
                if url.endswith('.jpg'):
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
        try:
            user.spotify_user.playlist_upload_cover_image(playlist, jpegString)
        except spotipy.exceptions.SpotifyException as e:
          ErrorHandler.handle_error(e)

    def create_playlist(user, name, public, collaborative, description):
        try:
            user.spotify_user.user_playlist_create(user, name, public, collaborative, description)
        except spotipy.exceptions.SpotifyException as e:
          ErrorHandler.handle_error(e)
    
    def track_remove(user, playlist, spotify_uri):
        try:
            user.spotify_user.user_playlist_remove_all_occurrences_of_items(playlist, spotify_uri)
        except spotipy.exceptions.SpotifyException as e:
          ErrorHandler.handle_error(e)

    def track_replace(user, playlist, spotify_uri):
        try:
            user.spotify_user.user_playlist_replace_items(playlist, spotify_uri)
        except spotipy.exceptions.SpotifyException as e:
          ErrorHandler.handle_error(e)

    def track_reorder(user, playlist, spotify_uri):
        try:
            user.spotify_user.user_playlist_reorder_tracks(user, playlist, 0, 0)
        except spotipy.exceptions.SpotifyException as e:
          ErrorHandler.handle_error(e)

    def playlist_follow(user, playlist, owner_id):
        try:
            user.spotify_user.user_playlist_follow_playlist(playlist_owner_id = owner_id, playlist_id = playlist)
        except spotipy.exceptions.SpotifyException as e:
          ErrorHandler.handle_error(e)

    def playlist_unfollow(user, playlist):
        try:
            user.spotify_user.user_playlist_unfollow(user, playlist)
        except spotipy.exceptions.SpotifyException as e:
          ErrorHandler.handle_error(e)

    def playlist_generate(user, playlist, genre):
        try:
            recommendations = user.spotify_user.get_recommendations(seed_genres = genre, max_items = 30)
            for song in recommendations:
                Playlist.add_track(user, playlist, song['id'])
        except spotipy.exceptions.SpotifyException as e:
          ErrorHandler.handle_error(e)
        
    def playlist_recommendations(user, playlist, field):
        try:
            if field == "genres":
                genres = Playlist.playlist_genre_analysis(user, playlist)
                recommendations = user.spotify_user.get_recommendations(seed_genres = genres)
            elif field == "aritsts":
                artists = Playlist.playlist_artist_analysis(user, playlist)
                recommendations = user.spotify_user.get_recommendations(seed_artists = artists)
            elif field == "albums":
                albumtracks = Playlist.playlist_album_analysis(user, playlist)
                recommendations = user.spotify_user.get_recommendations(seed_tracks = albumtracks)
            return recommendations
        except spotipy.exceptions.SpotifyException as e:
          ErrorHandler.handle_error(e)

    def playlist_genre_analysis(user, playlist):
        try:
            analysis = user.spotify_user.playlist_tracks(playlist_id = playlist)
            genrearray = []
            for item in analysis['items']:
                genre = item['artists'][0]['genres'][0]
                if genre not in genrearray:
                    genrearray.append(genre)
            return genrearray
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)
    
    def playlist_artist_analysis(user, playlist):
        try:
            analysis = user.spotify_user.playlist_tracks(playlist_id = playlist)
            artistarray = []
            for item in analysis['items']:
                artist = item['artists']['id']
                if item not in artistarray:
                    artistarray.append(artist)
            return artistarray
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)
    
    def playlist_album_analysis(user, playlist):
        try:
            analysis = user.spotify_user.playlist_tracks(playlist_id = playlist)
            albumarray = []
            for item in analysis['items']:
                album_id = item['album']['id']
                albumtracks = user.spotify_user.album_tracks(album_id, limit=10)
                for song in albumtracks:
                    if song not in albumarray:
                        albumarray.append(song)
            return albumarray
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)
    
    def playlist_get_tracks(user, playlist):
        try: 
            user.spotify_user.user_playlist_tracks(playlist_id = playlist)
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)