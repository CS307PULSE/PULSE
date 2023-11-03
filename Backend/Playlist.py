import spotipy
import multiprocessing
import time
import User
from Exceptions import ErrorHandler
from Emotion import Emotion
import requests
import base64
import json
class Playlist:
    def add_track(user, playlist, song):
        try:
            user.spotify_user.playlist_add_items(playlist, song)
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

    def create_playlist(user, name, public = True, collaborative = False, description = ''):
        try:
            return user.spotify_user.user_playlist_create(user.spotify_id, name, public, collaborative, description)
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

    def track_reorder(user, playlist):
        try:
            user.spotify_user.user_playlist_reorder_tracks(user, playlist, 0, 0)
        except spotipy.exceptions.SpotifyException as e:
          ErrorHandler.handle_error(e)

    def playlist_follow(user, playlist):
        try:
            user.spotify_user.user_playlist_follow_playlist(user, playlist)
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
            track = []
            recommendations = []
            if field == "genres":
                genresdict = Playlist.playlist_genre_analysis(user, playlist)
                track.append(user.spotify_user.playlist_tracks(playlist_id = playlist, limit = 1)['items'][0]['track']['uri'])
                recommendations = Emotion.get_emotion_recommendations(user, genresdict, track=track)
            elif field == "artists":
                artists = Playlist.playlist_artist_analysis(user, playlist)
                recommendations = user.get_recommendations(seed_artists = artists, max_items = 10)
            elif field == "albums":
                albumdict = Playlist.playlist_album_analysis(user, playlist)
                track.append(user.spotify_user.playlist_tracks(playlist_id = playlist, limit = 1)['items'][0]['track']['uri'])
                recommendations = Emotion.get_emotion_recommendations(user, albumdict, track=track)
            return recommendations
        except spotipy.exceptions.SpotifyException as e:
          ErrorHandler.handle_error(e)

    def playlist_genre_analysis(user, playlist):
        try:
            analysis = user.spotify_user.playlist_tracks(playlist_id = playlist, limit = 20)
            first_iteration = True    
            genredict = None
            
            for song in analysis['items']:
                track = song['track']['id']
                popularity = song['track']['popularity']
                if first_iteration:
                    genredict = Emotion.convert_track(user, track, popularity)
                    first_iteration = False
                else:
                    genredict = Emotion.update_and_average_dict(user, genredict, track, popularity)
            return genredict
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)
        
    def playlist_artist_analysis(user, playlist):
        try:
            analysis = user.spotify_user.playlist_tracks(playlist_id = playlist)
            artistarray = []
            for item in analysis['items']:
                if len(artistarray) < 5:
                    artist = item['track'].get('artists',{})[0].get('id',None)
                    if artist not in artistarray and artist is not None:
                        artistarray.append(artist)
            return artistarray
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)
    
    def playlist_album_analysis(user, playlist):
        try:
            analysis = user.spotify_user.playlist_tracks(playlist_id = playlist, limit = 10)
            first_iteration = True    
            genredict = None
            for song in analysis['items']:
                album = song['track']['album']['id']
                albumsongs = user.spotify_user.album_tracks(album, limit=5)
                for song in albumsongs['items']:
                    track = song['id']
                    popularity = 0
                    if first_iteration:
                        genredict = Emotion.convert_track(user, track, popularity)
                        first_iteration = False
                    else:
                        genredict = Emotion.update_and_average_dict(user, genredict, track, popularity)
            return genredict
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)
    
    def playlist_get_tracks(user, playlist):
        try: 
            return user.spotify_user.user_playlist_tracks(playlist_id = playlist)
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)