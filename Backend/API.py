#pip install flask
#pip install python-dotenv
#pip install flask-cors
#pip install mysql.connector
from flask import Flask, redirect, request, session, url_for, make_response, render_template, jsonify, render_template_string, Response
from flask_cors import CORS
# import firebase_admin
# from firebase_admin import credentials, auth
from User import User
from Game import GameType, Game
from DatabaseConnector import DatabaseConnector
from DatabaseConnector import db_config
import json
import Exceptions
import os
from Playback import Playback
from PIL import Image
import random
import io
import time
from werkzeug.utils import secure_filename

import spotipy
from spotipy.oauth2 import SpotifyOAuth

run_firebase = False
run_connected = True
spoof_songs = False

current_dir = os.path.dirname(os.getcwd())
lines = []
with open(current_dir + '/Testing/' + 'ClientData.txt', 'r') as file:
    for line in file:
        lines.append(line.strip())

client_id, client_secret, redirect_uri, redirect_uri2, redirect_uri3 = lines

if not run_connected:
    redirect_uri = redirect_uri2
if not run_firebase:
    redirect_uri = redirect_uri3

# Initialize Firebase Admin SDK
#cred = credentials.Certificate(current_dir + "\\Backend\\key.json")
#firebase_admin.initialize_app(cred)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000","http://127.0.0.1:3000"]}}, supports_credentials=True)

app.secret_key = 'your_secret_key'
app.config['SESSION_COOKIE_SAMESITE'] = 'lax'
app.config['SESSION_COOKIE_SECURE'] = False

scopes = [
    #Images
    'ugc-image-upload',

    #Spotify Connect
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',

    #Playback
    'app-remote-control',
    'streaming',

    #Playlists
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-private',
    'playlist-modify-public',

    #Follow
    'user-follow-modify',
    'user-follow-read',
    
    #Listening History
    'user-read-playback-position',
    'user-top-read',
    'user-read-recently-played',

    #Library
    'user-library-read',
    'user-library-modify',

    #Users
    'user-read-email',
    'user-read-private'

    #Open Access
    #user-soa-link
    #user-soa-unlink
    #user-manage-entitlements
    #user-manage-partner
    #user-create-partner
]

scope = ' '.join(scopes)

def get_run_connected():
    global run_connected
    return run_connected

@app.route('/')
def index():
    run_connected = get_run_connected()
    user_id = request.cookies.get('user_id_cookie')
    if (user_id):
        user_exists = False
        with DatabaseConnector(db_config) as conn:
            user_exists = conn.does_user_exist_in_user_DB(user_id)
            if user_exists:
                user = conn.get_user_from_user_DB(spotify_id=user_id)
                session['user'] = user.to_json()

                #return jsonify(message='Login successful! Welcome to your Flask app.')
                if run_connected:
                    return "T"
                else:
                    return redirect(url_for("dashboard"))

    #deleting what's in .cache fucks things up
    #return jsonify(message='Login failed! Welcome to your Flask app.')
    if run_connected:
        return "F"
    else:
        return 'Please <a href="/login">log in with Spotify</a> to continue.'

@app.route('/login')
def login():
    # Create a SpotifyOAuth instance with the necessary parameters
    sp_oauth = SpotifyOAuth(client_id=client_id, 
                            client_secret=client_secret, 
                            redirect_uri=redirect_uri, 
                            scope=scope)
    
    # Generate the authorization URL
    auth_url = sp_oauth.get_authorize_url()

    # Redirect the user to the Spotify login page
    global run_connected
    if (run_connected):
        return auth_url
    else:
        return redirect(auth_url)

@app.route('/callback')
def callback():
    code = request.args.get('code')
    # Handle the callback from Spotify after user login
    sp_oauth = SpotifyOAuth(client_id=client_id, 
                            client_secret=client_secret, 
                            redirect_uri=redirect_uri, 
                            scope=scope)

    # Validate the response from Spotify
    token_info = sp_oauth.get_access_token(code)

    if token_info:
        # Create a Spotify object and fetch user data
        sp = spotipy.Spotify(auth=token_info['access_token'])
        user_data = sp.me()

        # Create a User object and store it in the session
        user = User(
            display_name=user_data['display_name'],
            login_token=token_info,
            spotify_id=sp.me()['id'],
            spotify_user=sp
        )

        user.refresh_access_token(sp_oauth=sp_oauth)
        
        user_exists = False
        with DatabaseConnector(db_config) as conn:
            user_exists = conn.does_user_exist_in_user_DB(user.spotify_id)
            if not user_exists:
                conn.create_new_user_in_user_DB(user)
                conn.create_new_user_in_stats_DB(user.spotify_id)
            else:
                conn.update_token(user.spotify_id, user.login_token)

        session['user'] = user.to_json()

        global run_connected
        if not run_connected:
            resp = make_response(redirect(url_for('index')))
        else:
            resp = make_response(redirect("http://127.0.0.1:3000/dashboard"))
        resp.set_cookie('user_id_cookie', value=str(user.spotify_id))

        return resp

    else:
        return 'Login failed. Please try again.'

@app.route('/logout')
def logout():
    session.pop('user', None)
    return 'Logged out successfully.'

@app.route('/dashboard')
def dashboard():
    return 'Welcome to the Dashboard! <a href="/test"> Click here to run tests!</a>'

@app.route('/games')
def games():
    return 'Select Game: <a href="/games/guess_the_song"> Play Guess the Song</a>'

@app.route('/statistics')
def statistics():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        data = {'status' : 'Not updated',
                'recent_history' : '',
                'top_songs' : '',
                'top_artists' : '',
                'followed_artists' : '',
                'saved_songs' : '',
                'saved_albums' : '',
                'saved_playlists': '',
                'follower_data' : '',
                'layout_data' : ''}

        try:
            update_data(user)
        except Exception as e:
            print(e)
            return jsonify(data)
        
        with DatabaseConnector(db_config) as conn:
            layout = conn.get_layout_from_DB(user.spotify_id)
        with DatabaseConnector(db_config) as conn:
            followers = conn.get_followers_from_DB(user.spotify_id)

        data['status'] = 'Success'
        data['recent_history'] = user.stringify(user.stats.recent_history)
        data['top_songs'] = user.stringify(user.stats.top_songs)
        data['top_artists'] = user.stringify(user.stats.top_artists)
        data['followed_artists'] = user.stringify(user.stats.followed_artists)
        data['saved_songs'] = user.stringify(user.stats.saved_songs)
        data['saved_albums'] = user.stringify(user.stats.saved_albums)
        data['saved_playlists'] = user.stringify(user.stats.saved_playlists)

        if layout is not None:
            data['layout_data'] = layout

        if followers is not None:
            data['follower_data'] = followers

        return jsonify(data)
        
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    
@app.route('/statistics/shortened')
def statistics_short():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        data = {'status' : 'Not updated',
                'top_songs' : '',
                'top_artists' : '',
                'follower_data' : ''}

        try:
            update_data(user)
        except Exception as e:
            print(e)
            return jsonify(data)
        print("updated data var")
        with DatabaseConnector(db_config) as conn:
            followers = conn.get_followers_from_DB(user.spotify_id)

        data['status'] = 'Success'
        data['top_songs'] = user.stringify(user.stats.top_songs)
        data['top_artists'] = user.stringify(user.stats.top_artists)

        if followers is not None:
            data['follower_data'] = followers

        return jsonify(data)
        
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)

@app.route('/statistics/set_layout', methods=['POST'])
def set_layout():
    data = request.get_json()
    layout = data.get('layout')

    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            return jsonify(conn.update_layout(user.spotify_id, layout))
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)

@app.route('/search_bar', methods=['POST'])
def search_bar():
    data = request.get_json()
    query = data.get('query')
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        results = user.search_for_items(max_items=5, items_type="track", query=query)
        return jsonify(results)

    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)

@app.route('/set_theme', methods=['POST'])
def set_theme():
    data = request.get_json()
    theme = data.get('theme')

    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            return jsonify(conn.update_theme(user.spotify_id, theme))
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)

@app.route('/get_theme')
def get_theme():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            return jsonify(conn.get_theme_from_DB(user.spotify_id))
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)

@app.route('/set_text_size', methods=['POST'])
def set_text_size():
    data = request.get_json()
    text_size = data.get('text_size')

    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            return jsonify(conn.update_text_size(user.spotify_id, text_size))
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)

@app.route('/get_text_size')
def get_text_size():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            return jsonify(conn.get_text_size_from_DB(user.spotify_id))
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)

@app.route('/update_followers')
def update_followers():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            follower_data = user.get_followers_with_time()
        except Exception as e:
            if (try_refresh(user, e)):
                follower_data = user.get_followers_with_time()
        with DatabaseConnector(db_config) as conn:
            if (conn.update_followers(user.spotify_id, follower_data[0], follower_data[1]) == 0):
                error_message = "The followers have not been stored! Please try logging in and playing again to save the scores!"
                return make_response(jsonify({'error': error_message}), 6969)

        return jsonify("Success!")
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)

@app.route('/games/playback', methods=['POST'])
def playback():
    data = request.get_json()
    filter_search = data.get('artist')
    timestamp_ms = 20000 #20 seconds playback
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            user.update_spotify_id()
        except Exception as e:
            if not (try_refresh(user, e)):
                return "Failed to reauthenticate token"
        print(f"Starting with filter {filter_search}!")
        
        global spoof_songs
        if (spoof_songs):
            songs = []
            songs.append(user.search_for_items(query="Runaway by Kanye West", items_type='track', max_items=1)[0])
            songs.append(user.search_for_items(query="Born Sinner by J. Cole", items_type='track', max_items=1)[0])
            songs.append(user.search_for_items(query="COFFEE BEAN by Travis Scott", items_type='track', max_items=1)[0])
            songs.append(user.search_for_items(query="Riteous by Juice WRLD", items_type='track', max_items=1)[0])
            songs.append(user.search_for_items(query="Fuck Love by XXXTENTACION", items_type='track', max_items=1)[0])
            songs.append(user.search_for_items(query="XO Tour Llif3 by Lil Uzi Vert", items_type='track', max_items=1)[0])
            random_track = random.choice(songs)
            track_uri = random_track['uri']
        elif filter_search == "":
            if user.stats.saved_songs is None:
                user.update_saved_songs()
            songs = user.stats.saved_songs
            random_track = random.choice(songs)
            track_uri = random_track['track']['uri']
        else:
            results = user.search_for_items(query=filter_search, items_type='artist', max_items=5)
            if results[0]['id']:
                artist_id = results[0]['id']
                songs = user.spotify_user.artist_top_tracks(artist_id)['tracks']
                random_track = random.choice(songs)
                track_uri = random_track['uri']
            else:
                if user.stats.saved_songs is None:
                    user.update_saved_songs()
                songs = user.stats.saved_songs
                random_track = random.choice(songs)
                track_uri = random_track['track']['uri']
                
        user.spotify_user.start_playback(uris=[track_uri], position_ms=timestamp_ms)
        return jsonify("Success!")
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)

@app.route('/games/store_scores', methods=['POST'])
def store_scores():
    data = request.get_json()
    game_code = data.get('gameCode')
    scores = data.get('scores')
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        if len(scores) < 10:
            scores += [-1] * (10 - len(scores))

        with DatabaseConnector(db_config) as conn:
            if (conn.update_scores(user.spotify_id, scores, game_code) == 0):
                error_message = "The scores have not been stored! Please try logging in and playing again to save the scores!"
                return make_response(jsonify({'error': error_message}), 6969)

        return jsonify("Success!")
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    
@app.route('/games/get_scores')
def get_scores():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)

        with DatabaseConnector(db_config) as conn:
            scores = conn.get_scores_from_DB(user.spotify_id)
        
        # Serialize the data to JSON, replacing -1 with an empty string
        serialized_data = [[[str(cell) if cell != -1 else "" for cell in row] for row in matrix] for matrix in scores]

        return jsonify({'scores': serialized_data})

    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    
@app.route('/games/get_settings')
def get_settings():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)

        with DatabaseConnector(db_config) as conn:
            scores = conn.get_game_settings_from_DB(user.spotify_id)
        
        return jsonify(scores)

    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)

@app.route('/games/set_settings', methods=['POST'])
def set_settings():
    data = request.get_json()
    game_code = data.get('gameCode')
    settings = data.get('settings')
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)

        with DatabaseConnector(db_config) as conn:
            if (conn.update_game_settings(user.spotify_id, settings, game_code) == 0):
                error_message = "The settings have not been stored! Please try logging in and playing again to save the scores!"
                return make_response(jsonify({'error': error_message}), 6969)
        
        return jsonify("Success!")
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)

@app.route('/player/play')
def play():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            player = Playback(user)
            player.play()
        except Exception as e:
            if (try_refresh(user, e)):
                player = Playback(user)
                player.play()
            else:
                return "Failed to reauthenticate token"
        
        response_data = 'Music Playing started.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/player/pause')
def pause():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            player = Playback(user)
            player.pause()
        except Exception as e:
            if (try_refresh(user, e)):
                player = Playback(user)
                player.pause()
            else:
                return "Failed to reauthenticate token"
            
        response_data = 'Music player paused.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/player/skip')
def skip():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            player = Playback(user)
            player.skip_forwards()
        except Exception as e:
            if (try_refresh(user, e)):
                player = Playback(user)
                player.skip_forwards()
            else:
                return "Failed to reauthenticate token"
            
        response_data = 'Music skipping.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/player/prev')
def prev():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            player = Playback(user)
            player.skip_backwards()
        except Exception as e:
            if (try_refresh(user, e)):
                player = Playback(user)
                player.skip_backwards()
            else:
                return "Failed to reauthenticate token"
        response_data = "Music skipping backwards."
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/player/shuffle')
def shuffle():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            player = Playback(user)
            player.set_shuffle()
        except Exception as e:
            if (try_refresh(user, e)):
                player = Playback(user)
                player.set_shuffle()
            else:
                return "Failed to reauthenticate token"
        response_data = 'Music changing shuffle.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/player/repeat')
def repeat():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            player = Playback(user)
            player.set_repeat()
        except Exception as e:
            if (try_refresh(user, e)):
                player = Playback(user)
                player.set_repeat()
            else:
                return "Failed to reauthenticate token"
        response_data = 'Music changing repeat.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/player/volume', methods=['POST'])
def volume_change():
    if 'user' in session:
        data = request.get_json()
        volume = int(data.get('volume'))
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            player = Playback(user)
            player.volume_change(volume)
        except Exception as e:
            if (try_refresh(user, e)):
                player = Playback(user)
                player.volume_change(volume)
            else:
                return "Failed to reauthenticate token"
        response_data = 'volume changed to ' + str(volume)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/player/play_playlist', methods=['POST'])
def play_playlist():
    if 'user' in session:
        data = request.get_json()
        playlist_uri = data.get('spotify_uri')
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            player = Playback(user)
            player.play_playlist(playlist_uri)
        except Exception as e:
            if (try_refresh(user, e)):
                player = Playback(user)
                player.play_playlist(playlist_uri)
            else:
                return "Failed to reauthenticate token"
        response_data = 'Artist played with URL ' + str(playlist_uri)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/player/play_artist', methods=['POST'])
def play_artist():
    if 'user' in session:
        data = request.get_json()
        artist_uri = data.get('spotify_uri')
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            player = Playback(user)
            player.play_artist(artist_uri)
        except Exception as e:
            if (try_refresh(user, e)):
                player = Playback(user)
                player.play_artist(artist_uri)
            else:
                return "Failed to reauthenticate token"
        response_data = 'Song playing'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/player/play_album', methods=['POST'])
def play_album():
    if 'user' in session:
        data = request.get_json()
        album_uri = data.get('spotify_uri')
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            player = Playback(user)
            player.play_album(album_uri)
        except Exception as e:
            if (try_refresh(user, e)):
                player = Playback(user)
                player.play_album(album_uri)
            else:
                return "Failed to reauthenticate token"
        response_data = 'Album playing'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/player/play_song', methods=['POST'])
def play_song():
    data = request.get_json()
    song_uri = data.get('spotify_uri')
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            player = Playback(user)
            player.select_song(song=[song_uri])
        except Exception as e:
            if (try_refresh(user, e)):
                player = Playback(user)
                player.select_song(song=[song_uri])
            else:
                return "Failed to reauthenticate token"
        response_data = 'Song playing'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/djmixer/songrec', methods=['POST'])
def songrec():
    data = request.get_json()
    track = data.get('track')
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            found = user.search_for_items(max_items=1, query=track)
            track_id = found[0]['id']
            suggested_tracks = user.get_recommendations(seed_tracks=[track_id])
        except Exception as e:
            if (try_refresh(user, e)):
                found = user.search_for_items(max_items=1, query=track)
                track_id = found[0]['id']
                suggested_tracks = user.get_recommendations(seed_tracks=[track_id])
            else:
                return "Failed to reauthenticate token"
        response_data = suggested_tracks
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/profile/upload', methods=['POST'])
def upload_image():
    if 'user' in session:
        data = request.get_json()
        newImage = data.get('filepath')
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            if (conn.update_icon(user.spotify_id, newImage) == 0):
                error_message = "The profile image has not been stored!"
                return make_response(jsonify({'error': error_message}), 6969)
        response_data = 'username updated.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)
# def upload_image():
#     print("IN PROFILE/UPLOAD")
#     if 'user' in session:
#         data = request.get_json()
#         image_og = data['filepath']
#         user_data = session['user']
#         user = User.from_json(user_data)
#         #open image named uncompressed_image.jpg
#         # image_og = secure_filename(image_og.filename)
#         # if image_og.lower().endswith(('.png')) :
#         #     im = Image.open(image_og)
#         #     im.convert('RGB').save("image_name.jpg","JPEG") #this converts png image as jpeg
#         storage_loc = os.getcwd() + "\\Icons\\" + user.spotify_id + ".jpeg"
#         os.rename(image_og, storage_loc)
#         #save image locally
#         response_data = 'Found and uploaded profile.'
#     else:
#         response_data = 'User session not found. Please log in again.'
#     return jsonify(response_data)

@app.route('/profile/get_image', methods=['GET'])
def get_image():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_icon_from_DB(user.spotify_id)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

# def get_image():
#     if 'user' in session:
#         user_data = session['user']
#         user = User.from_json(user_data)
#         storage_loc = os.getcwd().removesuffix('Backend\\') + "\\Icons\\" + user.spotify_id + ".jpeg"
#         response_data =  #storage_loc
#     else:
#         response_data = 'User session not found. Please log in again.'
#     return jsonify(response_data)

@app.route('/profile/change_displayname', methods=['POST'])
def change_displayname():
    if 'user' in session:
        data = request.get_json()
        newname = data.get('displayname')
        # newname = newname.title()
        user_data = session['user']
        user = User.from_json(user_data)
        user.display_name = newname
        with DatabaseConnector(db_config) as conn:
            if (conn.update_display_name(user.spotify_id, user.display_name) == 0):
                error_message = "The display name has not been stored!"
                return make_response(jsonify({'error': error_message}), 6969)
        response_data = 'username updated.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/profile/change_gender', methods=['POST'])
def change_gender():
    if 'user' in session:
        data = request.get_json()
        gender = data.get('gender')
        gender = gender.capitalize()
        user_data = session['user']
        user = User.from_json(user_data)
        user.gender = gender
        with DatabaseConnector(db_config) as conn:
            if (conn.update_gender(user.spotify_id, user.gender) == 0):
                error_message = "Gender has not been stored!"
                return make_response(jsonify({'error': error_message}), 6969)
        response_data = 'gender updated.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/profile/change_location', methods=['POST'])
def change_location():
    if 'user' in session:
        data = request.get_json()
        location = data.get('location')
        location = location.title()
        user_data = session['user']
        user = User.from_json(user_data)
        user.location = location
        with DatabaseConnector(db_config) as conn:
            if (conn.update_location(user.spotify_id, user.location) == 0):
                error_message = "Location has not been stored!"
                return make_response(jsonify({'error': error_message}), 6969)
        response_data = 'location updated.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/profile/get_displayname', methods=['GET'])
def get_displayname():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_display_name_from_user_DB(user.spotify_id)
    else:
        response_data = 'User session not found. Please log in again.'
    return jsonify(response_data)

@app.route('/profile/get_location', methods=['GET'])
def get_location():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_location_from_user_DB(user.spotify_id)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/profile/get_gender', methods=['GET'])
def get_gender():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_gender_from_user_DB(user.spotify_id)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/import_advanced_stats')
def import_advanced_stats():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        filepath = request.args.get('filepath')
        if filepath:
            if (try_refresh(user)):
                try: 
                    response_data = user.stats.advanced_stats_import(filepath, user.spotify_user)
                except Exception as e:
                    error_message = "Invalid file information!"
                    return make_response(jsonify({'error': error_message}), 6969)
                with DatabaseConnector(db_config) as conn:
                    if (conn.update_advanced_stats(user.spotify_id, response_data) == 0):
                        error_message = "Advanced stats has not been stored!"
                        return make_response(jsonify({'error': error_message}), 6969)
                response_data = "File imported!"
            else:
                response_data = "Failed to reauthenticate token"         
        else:
            error_message = "Invalid filepath argument!"
            return make_response(jsonify({'error': error_message}), 40)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/get_advanced_stats')
def get_advanced_stats():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_advanced_stats_from_DB(user.spotify_id)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/api_only/import_advanced_stats_multiple_files')
def api_import_advanced_stats_multiple_files():
    return

@app.route('/api_only/import_advanced_stats_one_file')
def api_import_advanced_stats_one_file():
    if 'user' in session:
        with DatabaseConnector(db_config) as conn:
            user_exists = conn.does_user_exist_in_user_DB("0ajzwwwmv2hwa3k1bj2z19obr")
            if user_exists:
                user = conn.get_user_from_user_DB(spotify_id="0ajzwwwmv2hwa3k1bj2z19obr")
                session['user'] = user.to_json()
        filepath = request.args.get('filepath')
        if filepath:
            if (try_refresh(user)):
                response_data = user.stats.advanced_stats_import(filepath, user.spotify_user)
            else:
                response_data = user.stats.advanced_stats_import(filepath, user.spotify_user)
            #json_data = json.dumps(response_data, indent=4)
            response = Response(response_data, mimetype='application/json')
        else:
            response = "Filepath not provided."

    else:
        response = 'User session not found. Please log in again.'
    
    return response

@app.route('/api_only/advanced_stats_test')
def api_advanced_stats_test():
    return

def print_data(data):
    # Convert the JSON data back to a Python dictionary
    parsed_data = json.loads(data)

    sorted_songs = sorted(parsed_data["songs"].items(), key=lambda x: x[1]["ms_played"], reverse=True)

    # Create an HTML table to display all the data fields
    table = "<table border='1'><tr><th>Track Name</th><th>Artist</th><th>Album</th><th>Play Time (minutes)</th><th>Start Reason</th><th>End Reason</th><th>Country</th><th>Timestamp</th><th>Platform</th><th>Shuffle</th><th>Skip</th><th>URI</th><th>Episode Name</th><th>Show Name</th><th>Episode URI</th></tr>"

    for track_name, details in sorted_songs:
        artist_name = details["artist_name"]
        album_name = details["album_name"]
        play_time_minutes = details["ms_played"] / 1000 / 60  # Convert milliseconds to minutes
        reason_start = details["reason_start"]
        reason_end = details["reason_end"]
        country = details["country"]
        time_stamp = details["time_stamp"]
        platform = details["platform"]
        did_shuffle = details["did_shuffle"]
        did_skip = details["did_skip"]
        uri = details["track_uri"]
        episode_name = details["episode_name"]
        show_name = details["show_name"]
        episode_uri = details["episode_uri"]

        row = f"<tr><td>{track_name}</td><td>{artist_name}</td><td>{album_name}</td><td>{play_time_minutes:.2f}</td><td>{reason_start}</td><td>{reason_end}</td><td>{country}</td><td>{time_stamp}</td><td>{platform}</td><td>{did_shuffle}</td><td>{did_skip}</td><td>{uri}</td><td>{episode_name}</td><td>{show_name}</td><td>{episode_uri}</td></tr>"
        table += row

    table += "</table>"

    return table

@app.route('/test')
def test():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        return run_tests(user)
    else:
        return 'User session not found. Please log in again.'

def update_data(user,
                retries=0,
                update_recent_history=True,
                update_top_songs=True,
                update_top_artists=True,
                update_followed_artists=True,
                update_saved_tracks=True,
                update_saved_albums=True,
                update_saved_playlists=True):

    print("Updating Data")
    try:
        if (update_recent_history):
            user.update_recent_history()

        if (update_top_songs):
            user.update_top_songs()

        if (update_top_artists):
            user.update_top_artists()

        if (update_followed_artists):
            user.update_followed_artists()

        if (update_saved_tracks):
            user.update_saved_songs()

        if (update_saved_albums):
            user.update_saved_albums()

        if (update_saved_playlists):
            user.update_saved_playlists()
        print("Updated!")
        return "Updated Data!"
        

    except Exceptions.TokenExpiredError as e:
        max_retries = 3
        success = try_refresh(user, e)
        print(success)
        print(retries)

        if not success:
            raise Exception
        else:
            if (retries > max_retries):
                raise Exception
            return update_data(retries=retries+1)

def try_refresh(user, e=None):
    if (e is not None): print(f"An unexpected error occurred: {e}")
    try_count = 0
    max_try_count = 5
    while try_count < max_try_count:
        try:
            sp_oauth = SpotifyOAuth(client_id=client_id, 
                        client_secret=client_secret, 
                        redirect_uri=redirect_uri, 
                        scope=scope)

            user.refresh_access_token(sp_oauth)

            if not sp_oauth.is_token_expired(user.login_token):
                #Update token
                with DatabaseConnector(db_config) as conn:
                    if (conn.update_token(user.spotify_id, user.login_token) == 0):
                        raise Exceptions.UserNotFoundError
                session["user"] = user.to_json()
                print("Token successfully refreshed!")
                return True
            
        except Exception as ex:
            print(f"An unexpected error occurred: {ex}")

        try_count += 1

    print("Couldn't refresh token")
    return False

def run_tests(testUser):
    print("Starting Tests!")
    import time
    timestamp = (time.time())
    import datetime
    import pytz

    # Create a datetime object from the Unix timestamp in UTC
    utc_datetime = datetime.datetime.utcfromtimestamp(timestamp)

    # Set the timezone to Eastern Time (US/Eastern)
    eastern_timezone = pytz.timezone('US/Eastern')
    est_datetime = utc_datetime.replace(tzinfo=pytz.utc).astimezone(eastern_timezone)

    # Print the datetime in EDT format
    printString = (est_datetime.strftime('%Y-%m-%d %H:%M:%S %Z%z')) + '\n'
    verbose = True
    currentDir = os.path.dirname(os.getcwd())

    recent_history_test = True
    top_songs_test = True
    top_artists_test = True
    followed_artists_tests = True
    search_feature_test = False
    saved_tracks_test = True
    saved_albums_test = True
    followers_test = True
    saved_playlists_test = True
    guess_the_song_game = False

    try:
        if (recent_history_test):
            printString += "RECENT HISTORY:\n" + '\n'
            testUser.update_recent_history()
            recent_history = testUser.stats.recent_history
            for history in recent_history:
                context = "None"
                if history['context'] is not None:
                    context = history['context']['type']
                printString += (f"{history['track']['name']} by {history['track']['artists'][0]['name']} at {history['played_at']} on {context}") + '\n'
            printString += '\n\n'

        if (top_songs_test):
            printString += "TOP SONGS:\n" + '\n'
            periods = ["Short Term", "Medium Term", "Long Term"]
            testUser.update_top_songs()
            tracks_by_period = testUser.stats.top_songs
            for i, period in enumerate(tracks_by_period):
                printString += periods[i] + '\n'
                for track in period:
                    printString += (f"{track['name']} by {track['artists'][0]['name']}") + '\n'
                printString += '\n'
            printString += '\n'

        if (top_artists_test):
            printString += "TOP ARTISTS:\n" + '\n'
            periods = ["Short Term", "Medium Term", "Long Term"]
            testUser.update_top_artists()
            artists_by_period = testUser.stats.top_artists
            for i, period in enumerate(artists_by_period):
                printString += periods[i] + '\n'
                for artist in period:
                    printString += (artist['name']) + '\n'
                printString += '\n'
            printString += '\n'

        if (followed_artists_tests):
            printString += "FOLLOWED ARTISTS:\n" + '\n'
            testUser.update_followed_artists()
            artists = testUser.stats.followed_artists
            for artist in artists:
                printString += (artist['name']) + '\n'
            printString += '\n\n'

        if (saved_tracks_test):
            printString += "SAVED TRACKS:\n" + '\n'
            testUser.update_saved_songs(max_tracks=100)
            saved_songs = testUser.stats.saved_songs
            for track in saved_songs:
                printString += (f"{track['track']['name']} by {track['track']['artists'][0]['name']}") + '\n'
            printString += '\n\n'
        
        if (saved_albums_test):
            printString += "SAVED ABLUMS:\n" + '\n'
            testUser.update_saved_albums(max_albums=100)
            saved_albums = testUser.stats.saved_albums
            for album in saved_albums:
                printString += (f"{album['album']['name']}") + '\n'
            printString += '\n\n'
        
        if (saved_playlists_test):
            printString += "PLAYLISTS\n" + '\n'
            testUser.update_saved_playlists(max_playlists=100)
            saved_playlists = testUser.stats.saved_playlists
            for playlist in saved_playlists:
                printString += (f"{playlist['name']}") + '\n'
            printString += '\n\n'
        
        if (followers_test):
            printString += "FOLLOWER INFO:\n" + '\n'
            result = testUser.get_followers_with_time()
            printString += str(result[1]) + " at " + str(result[0])
            printString += '\n\n'

        if (search_feature_test):
            printString += "SEARCH RESULTS:\n" + '\n'
            q = "Noah Stern"
            max_items = 100
            items_types = ["track", "artist", "album", "playlist", "show", "episode", "audiobook"]
            result_strings = [["" for _ in range(len(items_types)+1)] for _ in range(max_items+1)]
            i = 1
            for items_type in items_types:
                results = testUser.search_for_items(query=q, items_type=items_type, max_items=max_items)
                res_num = 1
                for result in results:
                    item_name = result['name'] if 'name' in result else ""
                    result_strings[res_num][i] = item_name
                    res_num += 1
                i+=1

            import math
            max_log = math.floor(math.log10(max_items))

            for j in range(len(items_types)):
                result_strings[0][j+1] = (items_types[j] +"s").upper()
            for k in range(len(result_strings)):
                if (k != 0):
                    str_int = str(k) + " " * (max_log-math.floor(math.log10(k)))
                    result_strings[k][0] = str_int
                else:
                    result_strings[k][0] = " " * (max_log + 1)

            # Find the maximum length of elements in each column
            max_lengths = [
                max(len(row[col].rstrip()) for row in result_strings)
                for col in range(len(result_strings[0]))
            ]

            # Iterate through the array and print with padding
            for row in result_strings:
                formatted_row = [f"{element:{max_lengths[i]}}" for i, element in enumerate(row)]
                printString += " | ".join(formatted_row) + '\n'
            printString += '\n\n'   

        if (verbose):
            # Open the file in write mode ('w') to clear its contents
            with open(currentDir + '\\Testing\\' + 'TestOutput.txt', 'w', encoding='utf-8') as file:
                file.write(printString)
            
        if (guess_the_song_game):
            return redirect(url_for("games"))

        return f'Welcome, {testUser.display_name}! Successfully ran tests!'

    except Exceptions.TokenExpiredError as e:
        print(f"An unexpected error occurred: {e}")
        try_count = 0
        max_try_count = 5
        while try_count < max_try_count:
            try:
                sp_oauth = SpotifyOAuth(client_id=client_id, 
                            client_secret=client_secret, 
                            redirect_uri=redirect_uri, 
                            scope=scope)

                testUser.refresh_access_token(sp_oauth)

                if not sp_oauth.is_token_expired(testUser.login_token):
                    #Update token
                    with DatabaseConnector(db_config) as conn:
                        if (conn.update_token(testUser.spotify_id, testUser.login_token) == 0):
                            raise Exceptions.UserNotFoundError
                    session["user"] = testUser.to_json()
                    print("Token successfully refreshed!")
                    return redirect(url_for('dashboard'))
                
            except Exception as ex:
                print(f"An unexpected error occurred: {ex}")

            try_count += 1

        print("Couldn't refresh token")
        return redirect(url_for('index'))

if __name__ == '__main__':
    #app.run(debug=True)
    app.run(host='127.0.0.1', port=5000)

