import spotipy
from .Exceptions import ErrorHandler
from .Emotion import Emotion
import requests
import base64
import random

class Playlist:
    def add_track(user, playlist, song):
        try:
            user.spotify_user.playlist_add_items(playlist, song)
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)

    def change_image(user, playlist, url):
        jpegString = ""
        try:
            # Download the image from the URL
            response = requests.get(url, timeout=60)
            if response.status_code == 200:
                # Convert the image content to Base64
                image_data = response.content
                base64_image = base64.b64encode(image_data).decode('utf-8')
                jpegString = base64_image
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
            print(playlist)
            print(spotify_uri)
            user.spotify_user.user_playlist_remove_all_occurrences_of_tracks(user.spotify_id, playlist, [spotify_uri])
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)

    def track_replace(user, playlist, spotify_uri):
        try:
            user.spotify_user.user_playlist_replace_items(playlist, spotify_uri)
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)

    def track_reorder(user, playlist):
        try:
            analysis = user.spotify_user.playlist_tracks(playlist_id = playlist)
            length = len(analysis['items'])
            user.spotify_user.user_playlist_reorder_tracks(user, playlist, range_start = round(length/2), insert_before = 0, range_length = round(length/2))
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
            recommendations = user.get_recommendations(seed_genres = genre, max_items = 30)
            for song in recommendations:
                Playlist.add_track(user, playlist, [song['uri']])
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
            analysis = user.spotify_user.playlist_tracks(playlist_id = playlist, limit = 100)
            first_iteration = True    
            genredict = None
            song_list = []
            for song in analysis['items']:
                if song['track'] != None:
                    track = song.get('track').get('id')
                    popularity = song.get('track').get('popularity')
                    song_list.append(track)
            dict_list = Emotion.convert_tracks(user, song_list, popularity)
            for dict in dict_list:
                if first_iteration:
                    genredict = dict
                    first_iteration = False
                else:
                    genredict = Emotion.update_and_average_dict(user, genredict, dict)
            return genredict
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)
        
    def playlist_artist_analysis(user, playlist):
        try:
            analysis = user.spotify_user.playlist_tracks(playlist_id = playlist)
            artistarray = []
            for item in analysis['items']:
                if len(artistarray) < 5 and item['track'] != None:
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
            song_list = []
            for song in analysis['items']:
                if song['track'] != None:
                    album = song['track']['album']['id']
                    albumsongs = user.spotify_user.album_tracks(album, limit=5)
                    for song in albumsongs['items']:
                        if song['id'] != None:
                            track = song['id']
                            song_list.append(track)
                    dict_list = Emotion.convert_tracks(user, song_list)    
                    for dict in dict_list:
                        if first_iteration:
                            genredict = dict
                            first_iteration = False
                        else:
                            genredict = Emotion.update_and_average_dict(user, genredict, dict)
            return genredict
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)
    
    def playlist_get_tracks(user, playlist):
        try: 
            return user.spotify_user.user_playlist_tracks(playlist_id = playlist)
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)

    def playlist_merge(user, name, playlist_1, playlist_2):
        try: 
            first_playlist = user.spotify_user.playlist_tracks(playlist_id = playlist_1, limit = 100)
            second_playlist = user.spotify_user.playlist_tracks(playlist_id = playlist_2, limit = 100)
            song_list_1 = []
            song_list_2 = []
            for song in first_playlist['items']:
                if song['track'] != None:
                    track = song['track']['uri']
                    song_list_1.append(track)
            for song in second_playlist['items']:
                if song['track'] != None:
                    track = song['track']['uri']
                    song_list_2.append(track)
            new_playlist = Playlist.create_playlist(user=user, name=name)
            combined_list = song_list_1 + song_list_2
            random.shuffle(combined_list)
            split_index = len(combined_list)/2
            song_list_1 = combined_list[:split_index]
            song_list_2 = combined_list[split_index:]
            Playlist.add_track(user, new_playlist, song_list_1)
            Playlist.add_track(user, new_playlist, song_list_2)
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)
            
    def playlist_fusion(user, name, playlist_1, playlist_2):
        try: 
            first_playlist = user.spotify_user.playlist_tracks(playlist_id = playlist_1, limit = 15)
            second_playlist = user.spotify_user.playlist_tracks(playlist_id = playlist_2, limit = 15)
            song_list_1 = []
            song_list_2 = []
            song_list_3 = []
            for song in first_playlist['items']:
                if song['track'] != None:
                    track = song['track']['uri']
                    song_list_1.append(track)
            for song in second_playlist['items']:
                if song['track'] != None:
                    track = song['track']['uri']
                    song_list_2.append(track)
            emotion_1 = Playlist.playlist_genre_analysis(user, playlist_1)
            emotion_2 = Playlist.playlist_genre_analysis(user, playlist_2)
            combined_genre = Emotion.update_and_average_dict(user, emotion_1, emotion_2)
            seed_tracks = [first_playlist[0], second_playlist[0]]
            recommended_songs = Emotion.get_emotion_recommendations(user, emotiondict=combined_genre, track=seed_tracks, max_items=80)
            for song in recommended_songs['tracks']:
                uri = song['uri']
                song_list_3.append(uri)
            new_playlist = Playlist.create_playlist(user=user, name=name)
            combined_list = song_list_1 + song_list_2 + song_list_3
            random.shuffle(combined_list)
            split_index = len(combined_list)/2
            song_list_1 = combined_list[:split_index]
            song_list_2 = combined_list[split_index:]
            Playlist.add_track(user, new_playlist, song_list_1)
            Playlist.add_track(user, new_playlist, song_list_2)
        except spotipy.exceptions.SpotifyException as e:
            ErrorHandler.handle_error(e)