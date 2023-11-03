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
from Emotion import Emotion
from Playlist import Playlist
import json
import Exceptions
import os
from Playback import Playback
from PIL import Image
import random
import io
import time
from werkzeug.utils import secure_filename
import re

import spotipy
from spotipy.oauth2 import SpotifyOAuth

run_firebase = False
run_connected = True

current_dir = os.path.dirname(os.getcwd())
lines = []
with open(current_dir + '\\Code\\PULSE\\Testing\\' + 'ClientData.txt', 'r') as file:
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
                conn.create_new_user_in_advanced_stats_DB(user.spotify_id)
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
    start_time = time.time()
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
            start_time2 = time.time()
            update_data(user)
            end_time2 = time.time()
            execution_time2 = end_time2 - start_time2
            print(f"Execution time: {execution_time2} seconds")
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
        end_time = time.time()
        execution_time = end_time - start_time
        print(f"Execution time: {execution_time} seconds")
        return jsonify(data)
        
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    
@app.route('/friend_statistics')
def friend_statistics():
    start_time = time.time()
    data = request.get_json()
    id = data.get('id')
    with DatabaseConnector(db_config) as conn:
        user = conn.get_user_from_user_DB(spotify_id=id)
    user.spotify_user = spotipy.Spotify(auth=user.login_token['access_token'])

    if user is None:
        error_message = "The user is not found! Please try again!"
        return make_response(jsonify({'error': error_message}), 80)

    data = {'status' : 'Not updated',
            'recent_history' : '',
            'top_songs' : '',
            'top_artists' : '',
            'followed_artists' : '',
            'saved_songs' : '',
            'saved_albums' : '',
            'saved_playlists': '',
            'follower_data' : ''}

    try:
        start_time2 = time.time()
        try_refresh(user)
        update_data(user)
        end_time2 = time.time()
        execution_time2 = end_time2 - start_time2
        print(f"Execution time: {execution_time2} seconds")
    except Exception as e:
        print(e)
        return jsonify(data)
    
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

    if followers is not None:
        data['follower_data'] = followers
    end_time = time.time()
    execution_time = end_time - start_time
    print(f"Execution time: {execution_time} seconds")
    return jsonify(data)

@app.route('/get_saved_playlists')
def get_saved_playlists():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        data = {'status' : 'Not updated',
                'saved_playlists': ''}

        try:
            update_data(user,
                update_recent_history=False,
                update_top_songs=False,
                update_top_artists=False,
                update_followed_artists=False,
                update_saved_tracks=False,
                update_saved_albums=False,
                update_saved_playlists=True)
        except Exception as e:
            print(e)
            return jsonify(data)

        data['status'] = 'Success'
        data['saved_playlists'] = user.stringify(user.stats.saved_playlists)

        return jsonify(data)
        
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    
@app.route('/statistics/shortened')
def statistics_short():
    start_time = time.time()
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        data = {'status' : 'Not updated',
                'top_songs' : '',
                'top_artists' : '',
                'follower_data' : ''}

        try:
            update_data(user, update_recent_history=False,
                update_top_songs=True,
                update_top_artists=True,
                update_followed_artists=False,
                update_saved_tracks=False,
                update_saved_albums=False,
                update_saved_playlists=False)
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
        end_time = time.time()
        execution_time = end_time - start_time
        print(f"Execution time: {execution_time} seconds")
        return jsonify(data)
        
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)

@app.route('/get_friends_recent_songs', methods=['POST'])
def get_friends_recent_songs():
    data = request.get_json()
    friend_ids = data.get('friend_ids')
    friend_songs = {}
    for friend_id in friend_ids.keys():
        with DatabaseConnector(db_config) as conn:
            user = conn.get_user_from_user_DB(spotify_id=friend_id)
        user.spotify_user = spotipy.Spotify(auth=user.login_token['access_token'])

        try:
            update_data(user,
                update_recent_history=True,
                update_top_songs=False,
                update_top_artists=False,
                update_followed_artists=False,
                update_saved_tracks=False,
                update_saved_albums=False,
                update_saved_playlists=False)
            
            friend_songs[friend_id] = user.stats.recent_history

        except Exception as e:
            print(e)
            friend_songs[friend_id] = {}

    return jsonify(friend_songs)

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
    start_time = time.time()
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            follower_data = user.get_followers_with_time()
        except Exception as e:
            if (try_refresh(user, e)):
                follower_data = user.get_followers_with_time()
        with DatabaseConnector(db_config) as conn:
            if (conn.update_followers(user.spotify_id, follower_data[0], follower_data[1]) == -1):
                error_message = "The followers have not been stored! Please try logging in and playing again to save the scores!"
                return make_response(jsonify({'error': error_message}), 6969)
        end_time = time.time()
        execution_time = end_time - start_time
        print(f"Execution time: {execution_time} seconds")
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
        
        if filter_search == "":
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

@app.route('/games/random_friend', methods=['POST'])
def random_friend():
    data = request.get_json()
    id_dict = data.get('friend_songs')
    random_id = random.choice(list(id_dict.keys()))
    return jsonify(random_id)

@app.route('/games/playback_friends', methods=['POST'])
def playback_friends():
    data = request.get_json()
    songs = data.get('songs')
    timestamp_ms = 20000 #20 seconds playback
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
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
            if (conn.update_scores(user.spotify_id, scores, game_code) == -1):
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
            if (conn.update_game_settings(user.spotify_id, settings, game_code) == -1):
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
            if (conn.update_icon(user.spotify_id, newImage) == -1):
                error_message = "The profile image has not been stored!"
                return make_response(jsonify({'error': error_message}), 6969)
        response_data = 'username updated.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

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

@app.route('/profile/change_displayname', methods=['POST'])
def change_displayname():
    if 'user' in session:
        data = request.get_json()
        newname = data.get('displayname')
        # newname = newname.title()
        user_data = session['user']
        user = User.from_json(user_data)
        user.display_name = newname
        session['user'] = user.to_json()
        with DatabaseConnector(db_config) as conn:
            if (conn.update_display_name(user.spotify_id, user.display_name) == -1):
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
        session['user'] = user.to_json()
        with DatabaseConnector(db_config) as conn:
            if (conn.update_gender(user.spotify_id, user.gender) == -1):
                error_message = "Gender has not been stored!"
                return make_response(jsonify({'error': error_message}), 6969)
        response_data = 'gender updated.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/profile/change_chosen_song', methods=['POST'])
def change_chosen_song():
    if 'user' in session:
        data = request.get_json()
        chosen_song = data.get('chosen_song')
        chosen_song = chosen_song.title()
        user_data = session['user']
        user = User.from_json(user_data)
        user.chosen_song = chosen_song
        session['user'] = user.to_json()
        with DatabaseConnector(db_config) as conn:
            if (conn.update_chosen_song(user.spotify_id, user.chosen_song) == -1):
                error_message = "chosen_song has not been stored!"
                return make_response(jsonify({'error': error_message}), 6969)
        response_data = 'chosen_song updated.'
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
        session['user'] = user.to_json()
        with DatabaseConnector(db_config) as conn:
            if (conn.update_location(user.spotify_id, user.location) == -1):
                error_message = "Location has not been stored!"
                return make_response(jsonify({'error': error_message}), 6969)
        response_data = 'location updated.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/profile/set_background_image', methods=['POST'])
def set_background_image():
    if 'user' in session:
        data = request.get_json()
        background = data.get('background')
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            if (conn.update_custom_background(user.spotify_id, background) == -1):
                error_message = "Location has not been stored!"
                return make_response(jsonify({'error': error_message}), 6969)
        response_data = 'Themes updated.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/profile/set_saved_themes', methods=['POST'])
def set_saved_themes():
    if 'user' in session:
        data = request.get_json()
        themes = data.get('themes')
        for theme in themes:
            theme[0] = theme[0].replace(" ", "")
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            if (conn.update_saved_themes(user.spotify_id, themes) == -1):
                error_message = "Location has not been stored!"
                return make_response(jsonify({'error': error_message}), 6969)
        response_data = 'Themes updated.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/profile/set_color_palette', methods=['POST'])
def set_color_palette():
    if 'user' in session:
        data = request.get_json()
        palette = data.get('color_palette')
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            if (conn.update_color_palette(user.spotify_id, palette) == -1):
                error_message = "palette has not been stored!"
                return make_response(jsonify({'error': error_message}), 6969)
        response_data = 'Palette updated.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/profile/get_color_palette', methods=['GET'])
def get_color_palette():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_color_palette_from_user_DB(user.spotify_id)
    else:
        response_data = 'User session not found. Please log in again.'
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

@app.route('/profile/get_chosen_song', methods=['GET'])
def get_chosen_song():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_chosen_song_from_user_DB(user.spotify_id)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/profile/get_background_image')
def get_background_image():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_custom_background_from_user_DB(user.spotify_id)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/profile/get_saved_themes')
def get_saved_themes():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_saved_themes_from_user_DB(user.spotify_id)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/advanced_data_check')
def advanced_data_check():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_has_uploaded_from_user_DB(user.spotify_id)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

@app.route('/import_advanced_stats', methods=['POST'])
def import_advanced_stats():
    from datetime import datetime
    start_time = datetime.now()
    if 'user' in session:
        data = request.get_json()
        filepaths = data.get('filepaths')
        has_error_in_file = False
        user_data = session['user']
        user = User.from_json(user_data)
    
        # Refresh token
        if not try_refresh(user):
            error_message = "Failed to reauthenticate token"
            return make_response(jsonify({'error': error_message}), 10)
    
        DATA = {}
        #time.sleep(30)
        for filepath in filepaths: 
            #time.sleep(5)
            if filepath:
                try: 
                    temp = user.stats.advanced_stats_import(filepath=filepath, 
                                                            token=user.login_token['access_token'], 
                                                            more_data=True, 
                                                            ADVANCED_STATS_DATA=DATA,
                                                            include_podcasts=True)
                except Exception as e:
                    print(e)
                    temp = DATA
                    error_message = f"Invalid file information for file {filepath}!"
                    has_error_in_file = True 
                DATA = temp
            else:
                error_message = f"Invalid filepath for filepath: {filepath}!"
                has_error_in_file = True
                
    
        # Store in DB
        end_time = datetime.now()
        time_elapsed = end_time - start_time
        minutes = time_elapsed.total_seconds() / 60
        DATA["TIME"] = minutes
        
        if DATA != {}:
            with open("advanced_stats_output.json", "w") as json_file:
                json.dump(DATA, json_file, indent=4)

            with DatabaseConnector(db_config) as conn:
                if (conn.update_advanced_stats(user.spotify_id, DATA) == -1):
                    error_message = "Advanced stats has not been stored!"
                    return make_response(jsonify({'error': error_message}), 6969)
                if (conn.update_has_uploaded(user.spotify_id, 1) == -1):
                    error_message = "Advanced stats has updated has not been toggled!"
                    return make_response(jsonify({'error': error_message}), 6969)

        end_time = datetime.now()
        time_elapsed = end_time - start_time
        minutes = time_elapsed.total_seconds() / 60
        response_data = f"File imported in {minutes} minutes!"
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)

    print(response_data)
    return jsonify(has_error_in_file)

@app.route('/get_advanced_stats')
def get_advanced_stats():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        with DatabaseConnector(db_config) as conn:
            # "0ajzwwwmv2hwa3k1bj2z19obr"
            response_data = conn.get_advanced_stats_from_DB(user.spotify_id)
        emotions = get_emotions(user, response_data["Tracks"])
        if emotions is None:
            response_data["Emotions"] = {}
        else:
            response_data["Emotions"] = emotions
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(response_data)

def get_emotions(user, tracks):
    emotions = {}
    for track_uri in tracks.keys():
        uri = track_uri.split(":")[-1]
        emotion = Emotion.find_song_emotion(user, uri)
        if emotion not in emotions.keys():
            emotions[emotion] = 0
        emotions[emotion] += tracks[track_uri]["Number of Minutes"]
    
    total = 0
    for emotion in emotions.keys():
        if emotion != "undefined":
            total += emotions['emotion']
    
    if total == 0:
        total = 1

    for emotion in emotions.keys():
        emotions['emotion'] /= total

    return emotions

@app.route('/store_advanced_stats')
def store_advanced_stats():
    current_dir = os.path.dirname(os.getcwd())
    id = "0ajzwwwmv2hwa3k1bj2z19obr"
    file_path = "advanced_stats_output.json"
    with open(current_dir + '\\Code\\PULSE\\Backend\\' + file_path, 'r') as file:
        DATA = json.load(file)
    with DatabaseConnector(db_config) as conn:
        if (conn.update_advanced_stats(id, DATA) == -1):
            error_message = "Advanced stats has not been stored!"
            return make_response(jsonify({'error': error_message}), 6969)

@app.route('/advanced_stats_test')
def api_advanced_stats_test():
    if 'user' in session:
        with DatabaseConnector(db_config) as conn:
            user_exists = conn.does_user_exist_in_user_DB("0ajzwwwmv2hwa3k1bj2z19obr")
            if user_exists:
                user = conn.get_user_from_user_DB(spotify_id="0ajzwwwmv2hwa3k1bj2z19obr")
                session['user'] = user.to_json()
        if (try_refresh(user)):
                user = User.from_json(session['user'])

        song_ids = ['4RvWPyQ5RL0ao9LPZeSouE', '70LcF31zb1H0PyJoS1Sx1r', '7w87IxuO7BDcJ3YUqCyMTT', '5ghIJDpPoe3CfHMGu71E6T', '58ge6dfP91o9oXMzq3XkIS', '7hQJA50XrCWABAu5v6QZ4i', '7H0ya83CMmgFcOhw0UB6ow', '63T7DJ1AFDD6Bn8VzG6JE8', '2QjOHCTQ1Jl3zawyYOpxh6', '5FVd6KXrgO9B3JPmC8OPst', '5UWwZ5lm5PKu6eKsHAGxOk', '0d28khcov6AiegSCpG5TuT', '6K4t31amVTZDgR3sKmwUJJ', '003vvx7Niy0yvhvHt4a68B', '0pqnGHJpmpxLKifKRmU6WP', '5XeFesFbtLpXzIVDNQP22n', '086myS9r57YsLbJpU0TgK9', '3USxtqRwSYz57Ewm6wWRMp', '2tznHmp70DxMyr2XhWLOW0', '40riOy7x9W7GXjyGp4pjAv', '6SpLc7EXZIPpy0sVko0aoU', '4bHsxqR3GMrXTxEPLuK5ue', '1CS7Sd1u5tWkstBhpssyjP', '7snQQk1zcKl8gZ92AnueZW', '2K7xn816oNHJZ0aVqdQsha', '3dPQuX8Gs42Y7b454ybpMR', '4BP3uh0hFLFRb5cjsgLqDh', '2374M0fQpWi3dLnB54qaLX', '2TfSHkHiFO4gRztVIkggkE', '57bgtoPSgt236HzfBOd8kj', '3JvrhDOgAt6p7K8mDyZwRd', '5e9TFTbltYBg2xThimr0rU', '6GG73Jik4jUlQCkKg9JuGO', '2LawezPeJhN4AWuSB0GtAU', '3VqHuw0wFlIHcIPWkhIbdQ', '4kbj5MwxO1bq9wjT5g9HaA', '3d8y0t70g7hw2FOWl9Z4Fm', '6me7F0aaZjwDo6RJ5MrfBD', '2m1hi0nfMR9vdGC8UcrnwU', '0ofHAoxe9vBkTCp2UQIavz', '3d9DChrdc6BOeFsbrZ3Is0', '5E30LdtzQTGqRvNd7l6kG5', '20OFwXhEXf12DzwXmaV7fj', '5TgEJ62DOzBpGxZ7WRsrqb', '5ihS6UUlyQAfmp48eSkxuQ', '7zwn1eykZtZ5LODrf7c0tS', '4h9wh7iOZ0GGn8QVp4RAOB', '0qRR9d89hIS0MHRkQ0ejxX', '3yrSvpt2l1xhsV9Em88Pul', '4yugZvBYaoREkJKtbG08Qr']
        song_data = user.stats.get_song_data(song_ids, user.login_token['access_token']).get('tracks', {})
        country_codes = [
            'AD', 'AR', 'AU', 'AT', 'BE', 'BO', 'BR', 'BG', 'CL', 'CO', 'CR', 'CY', 'CZ',
            'DK', 'DO', 'EC', 'SV', 'EE', 'FI', 'FR', 'DE', 'GR', 'GT', 'HN', 'HK', 'HU', 'IS',
            'IE', 'IT', 'LV', 'LI', 'LT', 'LU', 'MY', 'MT', 'MX', 'MC', 'NL', 'NZ', 'NI', 'NO',
            'PA', 'PY', 'PE', 'PH', 'PL', 'PT', 'SG', 'SK', 'ES', 'SE', 'CH', 'TW', 'TR', 'GB', 'UY', 'US'
        ]
        import random
        from datetime import datetime, timedelta
        start_date = datetime(2023, 2, 1)
        end_date = datetime(2023, 2, 28)
        time_span = (end_date - start_date).total_seconds()
        num_streams = random.randint(0, 1000)
        EXPECTED_VALS = {
            "Number of Streams"                 :   0,
            "Number of Minutes"                 :   0,
            "Average Percentage of Streams"     :   0,
            "Tracks"                            :   {}
        }
    
        jsons = []
        for stream_num in range(num_streams):
            song_index = random.randint(0, len(song_ids)-1)
            timecode = country_codes[random.randint(0, len(country_codes)-1)]
            song_id = song_ids[song_index]
            random_seconds = random.uniform(0, time_span)
            time_stamp = start_date + timedelta(seconds=random_seconds)
            skipped = False if random.randint(0, 1) == 0 else True
            ms_track_length = song_data[song_index].get('duration_ms', 300000)
            ms_played = random.randint(0, ms_track_length)
            is_stream = user.stats.is_full_stream(ms_played, ms_track_length)
            
            write_json = {
                "ts":time_stamp.strftime('%Y-%m-%dT%H:%M:%SZ'),
                "ms_played":ms_played,
                "conn_country":timecode,
                "spotify_track_uri":f"spotify:track:{song_id}",
                "skipped":skipped
            }
            jsons.append(write_json)

            if is_stream:
                EXPECTED_VALS["Average Percentage of Streams"] = (EXPECTED_VALS["Average Percentage of Streams"] * EXPECTED_VALS["Number of Streams"] + ms_played / ms_track_length) / (EXPECTED_VALS["Number of Streams"] + 1)
                EXPECTED_VALS["Number of Streams"] += 1
            EXPECTED_VALS["Number of Minutes"] += (ms_played / 1000) / 60

            if f"spotify:track:{song_id}" not in EXPECTED_VALS["Tracks"]:
                EXPECTED_VALS["Tracks"][f"spotify:track:{song_id}"] = {
                    "Number of Streams"                 :   0,
                    "Number of Minutes"                 :   0,
                    "Average Percentage of Streams"     :   0
                }

            if is_stream:
                EXPECTED_VALS["Tracks"][f"spotify:track:{song_id}"]["Average Percentage of Streams"] = (EXPECTED_VALS["Tracks"][f"spotify:track:{song_id}"]["Average Percentage of Streams"] * EXPECTED_VALS["Tracks"][f"spotify:track:{song_id}"]["Number of Streams"] + ms_played / ms_track_length) / (EXPECTED_VALS["Tracks"][f"spotify:track:{song_id}"]["Number of Streams"] + 1)
                EXPECTED_VALS["Tracks"][f"spotify:track:{song_id}"]["Number of Streams"] += 1
            EXPECTED_VALS["Tracks"][f"spotify:track:{song_id}"]["Number of Minutes"] += (ms_played / 1000) / 60
        
        with open("advanced_stats_test.json", 'w') as json_file:
            json.dump(jsons, json_file)
        
        filepath = "C:\\Users\\noahs\\Desktop\\CODINGPRIME\\Spotify PULSE\\PULSE\Backend\\advanced_stats_test.json"
        RECEIVED_VALS = user.stats.advanced_stats_import(filepath=filepath, token=user.login_token['access_token'], more_data=True)
        
        overall_status = "Not Tested"
        num_streams_status = "Not Tested"
        num_mins_status = "Not Tested"
        percentage_status = "Not Tested"
        track_data_status = "Not Tested"

        overall_bool = False
        num_streams_bool = False
        num_mins_bool = False
        percentage_bool = False
        track_data_bool = False
        eps = 1e-10
        if RECEIVED_VALS["Number of Streams"] == EXPECTED_VALS["Number of Streams"]:
            num_streams_bool = True
        if abs(RECEIVED_VALS["Number of Minutes"] - EXPECTED_VALS["Number of Minutes"]) < eps:
            num_mins_bool = True
        if abs(RECEIVED_VALS["Average Percentage of Streams"] - EXPECTED_VALS["Average Percentage of Streams"]) < eps:
            percentage_bool = True
        
        track_data_bool = True
        for track_id in EXPECTED_VALS["Tracks"]:
            if track_id not in RECEIVED_VALS["Tracks"]:
                track_data_bool = False
                break
            passed =            EXPECTED_VALS["Tracks"][track_id]["Number of Streams"] == RECEIVED_VALS["Tracks"][track_id]["Number of Streams"] and \
                                abs(EXPECTED_VALS["Tracks"][track_id]["Number of Minutes"]  - RECEIVED_VALS["Tracks"][track_id]["Number of Minutes"]) < eps  and \
                                abs(EXPECTED_VALS["Tracks"][track_id]["Average Percentage of Streams"] - RECEIVED_VALS["Tracks"][track_id]["Average Percentage of Streams"]) < eps
            if not passed: print(track_id)
            track_data_bool = track_data_bool and passed
        
        overall_bool = num_streams_bool and num_mins_bool and percentage_bool and track_data_bool


        overall_status = "Passed" if overall_bool else "Failed"
        num_streams_status = "Passed" if num_streams_bool else "Failed"
        num_mins_status = "Passed" if num_mins_bool else "Failed"
        percentage_status = "Passed" if percentage_bool else "Failed"
        track_data_status = "Passed" if track_data_bool else "Failed"
        TEST_RESULTS = {
            "OVERALL TEST STATUS"           : overall_status,
            "Num Streams Test Status"       : num_streams_status,
            "Num Mins Test Status"          : num_mins_status,
            "Percentage Test Status"        : percentage_status,
            "Track Data Status"             : track_data_status,
            "More Details"                  : {
                "Expected" : EXPECTED_VALS,
                "Received" : RECEIVED_VALS
            }
        }

        response = Response(json.dumps(TEST_RESULTS, indent=4), mimetype='application/json')
        return response
            
    else:
        return 'User session not found. Please log in again.'

@app.route('/friends/friend_request', methods=['POST'])
def friend_requests():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        data = request.get_json()
        friendid = data.get('request')
        #add no friend requests to self
        with DatabaseConnector(db_config) as conn:
            friendRequests = conn.get_friend_requests_from_DB(friendid)
            friends = conn.get_friends_from_DB(friendid)
            if user.spotify_id in friends:
                return "friend is already on friends list"
            if user.spotify_id in friendRequests:
                return "friend always has request"
            conn.update_friend_requests(friendid, user.spotify_id, True)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return "added request"

@app.route('/friends/remove_friend', methods=['POST'])
def remove_friend():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        data = request.get_json()
        friendid = data.get('spotify_id')
        jsonarray = []
        with DatabaseConnector(db_config) as conn:
            conn.update_friends(friendid, user.spotify_id, False)
            conn.update_friends(user.spotify_id, friendid, False)
            response_data = conn.get_friends_from_DB(user.spotify_id)
            for item in response_data:
                frienduser = conn.get_user_from_user_DB(item)
                bufferobject = { }
                bufferobject['name'] = frienduser.display_name
                bufferobject['photoUri'] = conn.get_icon_from_DB(item)
                bufferobject['favoriteSong'] = frienduser.chosen_song
                bufferobject['spotify_id'] = frienduser.spotify_id
                jsonarray.append(bufferobject)
            if len(response_data) == 0:
                jsonarray = []
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return json.dumps(jsonarray)

@app.route('/friends/friend_request_choice', methods=['POST'])
def request_choice():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        data = request.get_json()
        friendid = data.get('spotify_id')
        choice = data.get('accepted')
        jsonarray = []
        with DatabaseConnector(db_config) as conn:
            if choice:
                conn.update_friends(user.spotify_id, friendid, True)
                conn.update_friends(friendid, user.spotify_id, True)
                conn.update_friend_requests(user.spotify_id, friendid, False)
                conn.update_friend_requests(friendid, user.spotify_id, False)
            else:
                conn.update_friend_requests(user.spotify_id, friendid, False)
            response_data = conn.get_friend_requests_from_DB(user.spotify_id)
            for item in response_data:
                frienduser = conn.get_user_from_user_DB(item)
                bufferobject = { }
                bufferobject['name'] = frienduser.display_name
                bufferobject['photoUri'] = conn.get_icon_from_DB(item)
                bufferobject['favoriteSong'] = frienduser.chosen_song
                bufferobject['spotify_id'] = frienduser.spotify_id
                jsonarray.append(bufferobject)
            if len(response_data) == 0:
                jsonarray = []
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return json.dumps(jsonarray)


@app.route('/friends/add_friends_search', methods=['POST'])
def friend_request_search():
    if 'user' in session:
        data = request.get_json()
        friendname = data.get('query')
        jsonarray = []
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_spotify_id_from_display_name_from_DB(friendname)
            for item in response_data:
                frienduser = conn.get_user_from_user_DB(item)
                bufferobject = { }
                bufferobject['name'] = frienduser.display_name
                bufferobject['photoUri'] = conn.get_icon_from_DB(item)
                bufferobject['favoriteSong'] = frienduser.chosen_song
                bufferobject['spotify_id'] = frienduser.spotify_id
                jsonarray.append(bufferobject)
            if len(response_data) == 0:
                jsonarray = []
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return json.dumps(jsonarray)

@app.route('/friends/get_friends', methods=['GET'])
def get_friends():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        jsonarray = []
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_friends_from_DB(user.spotify_id)
            for item in response_data:
                frienduser = conn.get_user_from_user_DB(item)
                bufferobject = { }
                bufferobject['name'] = frienduser.display_name
                bufferobject['photoUri'] = conn.get_icon_from_DB(item)
                bufferobject['favoriteSong'] = frienduser.chosen_song
                bufferobject['spotify_id'] = frienduser.spotify_id
                jsonarray.append(bufferobject)
            if len(response_data) == 0:
                jsonarray = []
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return json.dumps(jsonarray)

@app.route('/friends/get_requests', methods=['GET'])
def get_requests():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        jsonarray = []
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_friend_requests_from_DB(user.spotify_id)
            for item in response_data:
                frienduser = conn.get_user_from_user_DB(item)
                bufferobject = { }
                bufferobject['name'] = frienduser.display_name
                bufferobject['photoUri'] = conn.get_icon_from_DB(item)
                bufferobject['favoriteSong'] = frienduser.chosen_song
                bufferobject['spotify_id'] = frienduser.spotify_id
                jsonarray.append(bufferobject)
            if len(response_data) == 0:
                jsonarray = []
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return json.dumps(jsonarray)

@app.route('/playlist/get_recs', methods=['POST'])
def getPlaylistRecs():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        data = request.get_json()
        field = data.get('selectedRecMethod')
        playlist_id = data.get('selectedPlaylistID')
        songarray = Playlist.playlist_recommendations(user, playlist_id, field)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return json.dumps(songarray)


@app.route('/stats/emotion_percent', methods=['GET'])
def emotion_percent():
    if 'user' in session:
        user_data = session['user']
        data = request.get_json()
        user = User.from_json(user_data) 
        trackid = data.get('trackid')
        popularity = data.get('popularity')
        emotionarray = Emotion.get_percentage(user, trackid, popularity)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return jsonify(emotionarray)


@app.route('/chatbot/pull_songs', methods=['POST'])
def pullsongs():
    if 'user' in session:
        #return "gotHere"
        user_data = session['user']
        user = User.from_json(user_data) 
        data = request.get_json()
        try:
            songlist = data.get('songlist')
        except Exception as e:
            return "empty data"
        playlistcounter = 0    
        # Split the string into an array using regular expressions
        #titles = re.split(r'\d+\.', songlist)
        # Remove any leading or trailing whitespace from each item
        #titles = [item.strip() for item in titles if item.strip()]
        # Display the resulting array
        trackids = []
        if len(songlist) == 1:
            try:
                results = user.search_for_items(max_items=1, items_type="track", query=songlist[0])
                player = Playback(user)
                song_uri = results[0]['uri']
                player.select_song(song=[song_uri])
            except Exception as e:
                if (try_refresh(user, e)):
                    player = Playback(user)
                    song_uri = results[0]['uri']
                    player.select_song(song=[song_uri])
                else:
                    return "Failed to reauthenticate token"
        else:
            try:
                with DatabaseConnector(db_config) as conn:
                    playlistcounter = conn.get_playlist_counter_from_base_stats_DB(user.spotify_id)
                    conn.update_playlist_counter(user.spotify_id)
                playlistname = 'chatbot ' + str(playlistcounter)
                playlistid = Playlist.create_playlist(user, playlistname)['id']
                for title in songlist:
                    trackids.append(user.search_for_items(max_items=1, items_type="track", query=title)[0]['uri']) 
                Playlist.add_track(user, playlistid=playlistid, song=trackids)
            except Exception as e:
                if (try_refresh(user, e)):
                    playlistname = 'chatbot ' + str(playlistcounter)
                    playlistid = Playlist.create_playlist(user, playlistname)['id']
                    for title in songlist:
                        trackids.append(user.search_for_items(max_items=1, items_type="track", query=title)[0]['uri']) 
                    Playlist.add_track(user, playlistid=playlistid, song=trackids)
                else:
                    return "Failed to reauthenticate token"
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69)
    return "successful completion"

@app.route('/feedback', methods=['POST'])
def feedback():
    data = request.get_json()
    feedback = data.get('feedback')
    print("1")
    with DatabaseConnector(db_config) as conn:
        if (conn.update_individual_feedback(feedback) == -1):
            return "Failed"
    return "Success"

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
            return update_data(user, retries=retries+1)

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
            
            if not sp_oauth.is_token_expired(user.login_token): return True

            user.refresh_access_token(sp_oauth)

            if not sp_oauth.is_token_expired(user.login_token):
                #Update token
                with DatabaseConnector(db_config) as conn:
                    if (conn.update_token(user.spotify_id, user.login_token) == -1):
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
                        if (conn.update_token(testUser.spotify_id, testUser.login_token) == -1):
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

