#pip install flask
#pip install python-dotenv
#pip install flask-cors
#pip install mysql.connector
from flask import Flask, redirect, request, session, url_for, make_response, render_template, jsonify, render_template_string, Response, send_from_directory
from flask_cors import CORS, cross_origin
from .User import User
from datetime import datetime, timedelta
from .DatabaseConnector import DatabaseConnector
from .DatabaseConnector import db_config
from .Emotion import Emotion
from .Playlist import Playlist
import json
from .Exceptions import TokenExpiredError
from .Exceptions import UserNotFoundError
import os
from .Playback import Playback
import random
import time
import spotipy
import requests
from spotipy.oauth2 import SpotifyOAuth

app = Flask(__name__, static_folder='../Frontend/build', static_url_path='/')
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000","http://127.0.0.1:3000","https://spotify-pulse-efa1395c58ba.herokuapp.com/"]}}, supports_credentials=True)

app.secret_key = 'your_secret_key'
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Strict',
)

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
@app.route('/')
def index():
    print("RIGHT HERE RIGHT HERE RIGHT HERE")
    return app.send_static_file('index.html'), 200, {'Reason-Phrase': 'OK'}

@app.route('/boot')
def boot():
    user_id = request.cookies.get('user_id_cookie')
    if (user_id):
        user_exists = False
        with DatabaseConnector(db_config) as conn:
            user_exists = conn.does_user_exist_in_user_DB(user_id)
            if user_exists:
                user = conn.get_user_from_user_DB(spotify_id=user_id)
                session['user'] = user.to_json()
                return "T", 200, {'Reason-Phrase': 'OK'}
    
    return "F", 200, {'Reason-Phrase': 'OK'}

@app.route('/login')
def login():
    # Create a SpotifyOAuth instance with the necessary parameters
    sp_oauth = SpotifyOAuth(client_id=os.getenv("CLIENT_ID"), 
                            client_secret=os.getenv("CLIENT_SECRET"), 
                            redirect_uri=os.getenv("REDIRECT_URI"), 
                            scope=scope)
    
    # Generate the authorization URL
    auth_url = sp_oauth.get_authorize_url()

    # Redirect the user to the Spotify login page
    return auth_url, 200, {'Reason-Phrase': 'OK'}

@app.route('/callback')
def callback():
    code = request.args.get('code')
    print(code + "______________________________________________________________")
    # Handle the callback from Spotify after user login
    sp_oauth = SpotifyOAuth(client_id=os.getenv("CLIENT_ID"), 
                            client_secret=os.getenv("CLIENT_SECRET"), 
                            redirect_uri=os.getenv("REDIRECT_URI"), 
                            scope=scope)

    # Validate the response from Spotify
    #token_info = sp_oauth.get_access_token(code)

    authorization_code = code

    token_url = 'https://accounts.spotify.com/api/token'
    payload = {
        'grant_type': 'authorization_code',
        'code': authorization_code,
        'redirect_uri': os.getenv("REDIRECT_URI"),
        'client_id': os.getenv("CLIENT_ID"),
        'client_secret': os.getenv("CLIENT_SECRET"),
        'scopes': scopes,
    }


    response = requests.post(token_url, data=payload)
    print(response.json())
    print("=============================================================")
    if response.status_code == 200:
        token_info = response.json()
        print("Login Token:", token_info)
        print("++++++++++++++++++++++++++++++++++++++++++++++")
    else:
        print("Failed to retrieve Access Token")
        print("++++++++++++++++++++++++++++++++++++++++++++++")
        return "resp" , 200, {'Reason-Phrase': 'OK'}
    
    if token_info:
        # Create a Spotify object and fetch user data
        sp = spotipy.Spotify(auth=token_info['access_token'])
        user_data = sp.me()

        # Create a User object and store it in the session
        user = User(
            display_name=user_data['display_name'],
            login_token=token_info,
            spotify_id=user_data['id'],
            spotify_user=sp
        )
        print (user.spotify_id + "HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE")

        expires_in = token_info['expires_in']
        current_time = int(time.time())  # Current time in seconds since the epoch
        expires_at = current_time + expires_in

        token_info['expires_at'] = expires_at
        user.refresh_access_token(sp_oauth=sp_oauth)
        
        user_exists = False
        with DatabaseConnector(db_config) as conn:
            user_exists = conn.does_user_exist_in_user_DB(user.spotify_id)
            if not user_exists:
                conn.create_new_user_in_user_DB(user)
            else:
                conn.update_token(user.spotify_id, user.login_token)

        session['user'] = user.to_json()

        resp = make_response(redirect(os.getenv("SITE_URI")))
        resp.set_cookie('user_id_cookie', value=str(user.spotify_id),secure=True, httponly=True, samesite='Strict')
        resp.set_cookie('token_cookie', value=str(user.login_token),secure=True, httponly=True, samesite='Strict')

        return resp , 200, {'Reason-Phrase': 'OK'}

    else:
        return 'Login failed. Please try again.' , 200, {'Reason-Phrase': 'OK'}

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
            refresh_token(user)
            update_data(user)
            end_time = time.time()
            execution_time = end_time - start_time
            print(f"Execution time: {execution_time} seconds")
        except Exception as e:
            print(e)
            return jsonify(data), 200, {'Reason-Phrase': 'OK'}
        
        with DatabaseConnector(db_config) as conn:
            layout = conn.get_layout_from_DB(user.spotify_id)
        with DatabaseConnector(db_config) as conn:
            followers = conn.get_followers_from_DB(user.spotify_id)

        data['status'] = 'Success'
        data['recent_history'] = user.stats.recent_history
        data['top_songs'] = user.stats.top_songs
        data['top_artists'] = user.stats.top_artists
        data['followed_artists'] = user.stats.followed_artists
        data['saved_songs'] = user.stats.saved_songs
        data['saved_albums'] = user.stats.saved_albums
        data['saved_playlists'] = user.stats.saved_playlists

        if layout is not None:
            data['layout_data'] = json.loads(layout)

        if followers is not None:
            data['follower_data'] = followers
        end_time = time.time()
        execution_time = end_time - start_time
        print(f"Execution time: {execution_time} seconds")
        return jsonify(data), 200, {'Reason-Phrase': 'OK'}
        
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    
@app.route('/statistics/friend', methods=['POST'])
def friend_statistics():
    start_time = time.time()
    data = request.get_json()
    id = data.get('id')
    with DatabaseConnector(db_config) as conn:
        user = conn.get_user_from_user_DB(spotify_id=id)
    user.spotify_user = spotipy.Spotify(auth=user.login_token['access_token'])

    if user is None:
        error_message = "The user is not found! Please try again!"
        return make_response(jsonify({'error': error_message}), 80), 200, {'Reason-Phrase': 'OK'}

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
        refresh_token(user)
        update_data(user)
        end_time = time.time()
        execution_time = end_time - start_time
        print(f"Execution time: {execution_time} seconds")
    except Exception as e:
        print(e)
        return jsonify(data), 200, {'Reason-Phrase': 'OK'}
    
    with DatabaseConnector(db_config) as conn:
        followers = conn.get_followers_from_DB(user.spotify_id)

    data['status'] = 'Success'
    data['recent_history'] = user.stats.recent_history
    data['top_songs'] = user.stats.top_songs
    data['top_artists'] = user.stats.top_artists
    data['followed_artists'] = user.stats.followed_artists
    data['saved_songs'] = user.stats.saved_songs
    data['saved_albums'] = user.stats.saved_albums
    data['saved_playlists'] = user.stats.saved_playlists

    if followers is not None:
        data['follower_data'] = followers
    end_time = time.time()
    execution_time = end_time - start_time
    print(f"Execution time: {execution_time} seconds")
    return jsonify(data), 200, {'Reason-Phrase': 'OK'}
    
@app.route('/statistics/short')
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
            refresh_token(user)
            update_data(user, update_recent_history=False,
                update_top_songs=True,
                update_top_artists=True,
                update_followed_artists=False,
                update_saved_tracks=False,
                update_saved_albums=False,
                update_saved_playlists=False)
        except Exception as e:
            print(e)
            return jsonify(data), 200, {'Reason-Phrase': 'OK'}
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
        return jsonify(data), 200, {'Reason-Phrase': 'OK'}
        
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}

@app.route('/statistics/update_followers')
def update_followers():
    start_time = time.time()
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            refresh_token(user)
            follower_data = user.get_followers_with_time()
        except Exception as e:
            print(e)
        with DatabaseConnector(db_config) as conn:
            current_time = follower_data[0]
            followers = conn.get_followers_from_DB(user.spotify_id)
            if followers:
                most_recent_time_str = max(followers.keys())
                most_recent_time = datetime.strptime(most_recent_time_str, '%Y-%m-%d %H:%M:%S')
            else:
                most_recent_time = current_time + timedelta(days=1)
            if current_time - most_recent_time > timedelta(days=1):
                return jsonify("Time less than one day!"), 200, {'Reason-Phrase': 'OK'}

        with DatabaseConnector(db_config) as conn:
            if (conn.update_followers(user.spotify_id, follower_data[0], follower_data[1]) == -1):
                error_message = "The followers have not been stored! Please try logging in and playing again to save the scores!"
                return make_response(jsonify({'error': error_message}), 404), 200, {'Reason-Phrase': 'OK'}
        end_time = time.time()
        execution_time = end_time - start_time
        print(f"Execution time: {execution_time} seconds")
        return jsonify("Success!"), 200, {'Reason-Phrase': 'OK'}
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}

@app.route('/statistics/get_saved_playlists')
def get_saved_playlists():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        data = {'status' : 'Not updated',
                'saved_playlists': ''}

        try:
            refresh_token(user)
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
            return jsonify(data), 200, {'Reason-Phrase': 'OK'}

        data['status'] = 'Success'
        data['saved_playlists'] = user.stringify(user.stats.saved_playlists)

        return jsonify(data), 200, {'Reason-Phrase': 'OK'}
        
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}

@app.route('/statistics/get_friends_recent_songs', methods=['POST'])
def get_friends_recent_songs():
    data = request.get_json()
    friend_ids = data.get('friend_ids')
    friend_songs = {}
    for friend_id in friend_ids.keys():
        try:
            with DatabaseConnector(db_config) as conn:
                user_exists = conn.does_user_exist_in_user_DB(friend_id)
                if user_exists:
                    user = conn.get_user_from_user_DB(spotify_id=friend_id)
                else:
                    return "error", 200, {'Reason-Phrase': 'OK'}
            user.spotify_user = spotipy.Spotify(auth=user.login_token['access_token'])

            refresh_token(user)
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
            return "error", 200, {'Reason-Phrase': 'OK'}
    return jsonify(friend_songs), 200, {'Reason-Phrase': 'OK'}

@app.route('/statistics/set_layout', methods=['POST'])
def set_layout():
    data = request.get_json()
    layout = data.get('layout')

    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            return jsonify(conn.update_layout(user.spotify_id, layout)), 200, {'Reason-Phrase': 'OK'}
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}

@app.route('/search_bar', methods=['POST'])
def search_bar():
    data = request.get_json()
    query = data.get('query')
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        refresh_token(user)
        results = user.search_for_items(max_items=5, items_type="track", query=query)
        return jsonify(results), 200, {'Reason-Phrase': 'OK'}

    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}

@app.route('/games/playback', methods=['POST'])
def playback():
    data = request.get_json()
    filter_search = data.get('artist')
    timestamp_ms = 20000 #20 seconds playback
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)

        refresh_token(user)
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
        return jsonify("Success!"), 200, {'Reason-Phrase': 'OK'}
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}

@app.route('/games/random_friend', methods=['POST'])
def random_friend():
    data = request.get_json()
    id_dict = data.get('friend_songs')
    random_id = random.choice(list(id_dict.keys()))
    return jsonify(random_id), 200, {'Reason-Phrase': 'OK'}

@app.route('/games/playback_friends', methods=['POST'])
def playback_friends():
    data = request.get_json()
    f_songs = data.get('songs')
    id = data.get("id")
    songs = f_songs[id]
    timestamp_ms = 20000 #20 seconds playback
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        random_track = random.choice(songs)
        track_uri = random_track['track']['uri']
                
        refresh_token(user)
        try:
            user.spotify_user.start_playback(uris=[track_uri], position_ms=timestamp_ms)
        except Exception as e:
            return "fail", 200, {'Reason-Phrase': 'OK'}
        return jsonify("Success!"), 200, {'Reason-Phrase': 'OK'}
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}

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
                return make_response(jsonify({'error': error_message}), 404), 200, {'Reason-Phrase': 'OK'}

        return jsonify("Success!"), 200, {'Reason-Phrase': 'OK'}
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    
@app.route('/games/get_scores')
def get_scores():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)

        with DatabaseConnector(db_config) as conn:
            scores = conn.get_scores_from_DB(user.spotify_id)
        
        # Serialize the data to JSON, replacing -1 with an empty string
        serialized_data = [[[str(cell) if cell != -1 else "" for cell in row] for row in matrix] for matrix in scores]

        return jsonify({'scores': serialized_data}), 200, {'Reason-Phrase': 'OK'}

    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    
@app.route('/games/get_settings')
def get_settings():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)

        with DatabaseConnector(db_config) as conn:
            scores = conn.get_game_settings_from_DB(user.spotify_id)
        
        return jsonify(scores), 200, {'Reason-Phrase': 'OK'}

    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}

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
                return make_response(jsonify({'error': error_message}), 404), 200, {'Reason-Phrase': 'OK'}
        
        return jsonify("Success!"), 200, {'Reason-Phrase': 'OK'}
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}

@app.route('/player/play')
def play():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            refresh_token(user)
            player = Playback(user)
            player.play()
        except Exception as e:
            return f"{e}", 200, {'Reason-Phrase': 'OK'}
        
        response_data = 'Music Playing started.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/player/pause')
def pause():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            refresh_token(user)
            player = Playback(user)
            player.pause()
        except Exception as e:
            return f"{e}"
            
        response_data = 'Music player paused.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/player/skip')
def skip():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            refresh_token(user)
            player = Playback(user)
            player.skip_forwards()
        except Exception as e:
            return f"{e}"
            
        response_data = 'Music skipping.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/player/prev')
def prev():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            refresh_token(user)
            player = Playback(user)
            player.skip_backwards()
        except Exception as e:
            return f"{e}"
        response_data = "Music skipping backwards."
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/player/shuffle')
def shuffle():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            refresh_token(user)
            player = Playback(user)
            player.set_shuffle()
        except Exception as e:
            return f"{e}"
        response_data = 'Music changing shuffle.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/player/repeat')
def repeat():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            refresh_token(user)
            player = Playback(user)
            player.set_repeat()
        except Exception as e:
            return f"{e}"
        response_data = 'Music changing repeat.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/player/volume', methods=['POST'])
def volume_change():
    if 'user' in session:
        data = request.get_json()
        volume = int(data.get('volume'))
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            refresh_token(user)
            player = Playback(user)
            player.volume_change(volume)
        except Exception as e:
            return f"{e}"
        response_data = 'volume changed to ' + str(volume)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/player/play_playlist', methods=['POST'])
def play_playlist():
    if 'user' in session:
        data = request.get_json()
        playlist_uri = data.get('spotify_uri')
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            refresh_token(user)
            player = Playback(user)
            player.play_playlist(playlist_uri)
        except Exception as e:
            return f"{e}"
        response_data = 'Artist played with URL ' + str(playlist_uri)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/player/play_artist', methods=['POST'])
def play_artist():
    if 'user' in session:
        data = request.get_json()
        artist_uri = data.get('spotify_uri')
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            refresh_token(user)
            player = Playback(user)
            player.play_artist(artist_uri)
        except Exception as e:
            return f"{e}"
        response_data = 'Song playing'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/player/play_album', methods=['POST'])
def play_album():
    if 'user' in session:
        data = request.get_json()
        album_uri = data.get('spotify_uri')
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            refresh_token(user)
            player = Playback(user)
            player.play_album(album_uri)
        except Exception as e:
            return f"{e}"
        response_data = 'Album playing'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/player/play_song', methods=['POST'])
def play_song():
    data = request.get_json()
    song_uri = data.get('spotify_uri')
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            refresh_token(user)
            player = Playback(user)
            player.select_song(song=[song_uri])
        except Exception as e:
            return f"{e}"
        response_data = 'Song playing'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/djmixer/songrec', methods=['POST'])
def songrec():
    data = request.get_json()
    track = data.get('track')
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            refresh_token(user)
            found = user.search_for_items(max_items=1, query=track)
            track_id = found[0]['id']
            suggested_tracks = user.get_recommendations(seed_tracks=[track_id])
        except Exception as e:
            return f"{e}"
        response_data = suggested_tracks
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/profile/set_theme', methods=['POST'])
def set_theme():
    data = request.get_json()
    theme = data.get('theme')

    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            return jsonify(conn.update_theme(user.spotify_id, theme)), 200, {'Reason-Phrase': 'OK'}
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}

@app.route('/profile/get_theme')
def get_theme():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            return jsonify(conn.get_theme_from_DB(user.spotify_id)), 200, {'Reason-Phrase': 'OK'}
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}

@app.route('/profile/set_text_size', methods=['POST'])
def set_text_size():
    data = request.get_json()
    text_size = data.get('text_size')

    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            return jsonify(conn.update_text_size(user.spotify_id, text_size)), 200, {'Reason-Phrase': 'OK'}
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}

@app.route('/profile/get_text_size')
def get_text_size():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            return jsonify(conn.get_text_size_from_DB(user.spotify_id)), 200, {'Reason-Phrase': 'OK'}
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}

@app.route('/profile/set_image', methods=['POST'])
def set_image():
    if 'user' in session:
        data = request.get_json()
        newImage = data.get('filepath')
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            if (conn.update_icon(user.spotify_id, newImage) == -1):
                error_message = "The profile image has not been stored!"
                return make_response(jsonify({'error': error_message}), 404), 200, {'Reason-Phrase': 'OK'}
        response_data = 'username updated.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/profile/get_image', methods=['GET'])
def get_image():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_icon_from_DB(user.spotify_id)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/profile/set_displayname', methods=['POST'])
def set_displayname():
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
                return make_response(jsonify({'error': error_message}), 404), 200, {'Reason-Phrase': 'OK'}
        response_data = 'username updated.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/profile/get_displayname', methods=['GET'])
def get_displayname():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_display_name_from_user_DB(user.spotify_id)
    else:
        response_data = 'User session not found. Please log in again.', 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/profile/set_gender', methods=['POST'])
def set_gender():
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
                return make_response(jsonify({'error': error_message}), 404), 200, {'Reason-Phrase': 'OK'}
        response_data = 'gender updated.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/profile/get_gender', methods=['GET'])
def get_gender():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_gender_from_user_DB(user.spotify_id)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/profile/set_chosen_song', methods=['POST'])
def set_chosen_song():
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
                return make_response(jsonify({'error': error_message}), 404), 200, {'Reason-Phrase': 'OK'}
        response_data = 'chosen_song updated.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/profile/get_chosen_song', methods=['GET'])
def get_chosen_song():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_chosen_song_from_user_DB(user.spotify_id)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/profile/set_location', methods=['POST'])
def set_location():
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
                return make_response(jsonify({'error': error_message}), 404), 200, {'Reason-Phrase': 'OK'}
        response_data = 'location updated.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/profile/get_location', methods=['GET'])
def get_location():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_location_from_user_DB(user.spotify_id)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

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
                return make_response(jsonify({'error': error_message}), 404), 200, {'Reason-Phrase': 'OK'}
        response_data = 'Themes updated.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/profile/get_background_image')
def get_background_image():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_custom_background_from_user_DB(user.spotify_id)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

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
                return make_response(jsonify({'error': error_message}), 404), 200, {'Reason-Phrase': 'OK'}
        response_data = 'Themes updated.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/profile/get_saved_themes')
def get_saved_themes():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_saved_themes_from_user_DB(user.spotify_id)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

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
                return make_response(jsonify({'error': error_message}), 404), 200, {'Reason-Phrase': 'OK'}

        response_data = 'Palette updated.'
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/profile/get_color_palette', methods=['GET'])
def get_color_palette():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_color_palette_from_user_DB(user.spotify_id)
    else:
        response_data = 'User session not found. Please log in again.'
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/advanced_data_check')
def advanced_data_check():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_has_uploaded_from_user_DB(user.spotify_id)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/import_advanced_stats', methods=['POST'])
def import_advanced_stats():
    start_time = datetime.now()
    if 'user' in session:
        data = request.get_json()
        filepaths = data.get('filepaths')
        has_error_in_file = False
        user_data = session['user']
        user = User.from_json(user_data)
    
        # Refresh token
        if not refresh_token(user):
            error_message = "Failed to reauthenticate token"
            return make_response(jsonify({'error': error_message}), 10), 200, {'Reason-Phrase': 'OK'}
    
        DATA = {}
        #time.sleep(30)
        for filepath in filepaths: 
            #time.sleep(5)
            if filepath:
                if filepath.startswith('"') and filepath.endswith('"'):
                    filepath = filepath[1:-1]
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
        
        if 'Yearly' in DATA:
            with open("advanced_stats_output.json", "w") as json_file:
                json.dump(DATA, json_file, indent=4)

            with DatabaseConnector(db_config) as conn:
                if (conn.update_advanced_stats(user.spotify_id, DATA) == -1):
                    error_message = "Advanced stats has not been stored!"
                    return make_response(jsonify({'error': error_message}), 6969), 200, {'Reason-Phrase': 'OK'}
                if (conn.update_has_uploaded(user.spotify_id, 1) == -1):
                    error_message = "Advanced stats has updated has not been toggled!"
                    return make_response(jsonify({'error': error_message}), 6969), 200, {'Reason-Phrase': 'OK'}

        end_time = datetime.now()
        time_elapsed = end_time - start_time
        minutes = time_elapsed.total_seconds() / 60
        response_data = f"File imported in {minutes} minutes!"
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}

    print(response_data)
    return jsonify(has_error_in_file), 200, {'Reason-Phrase': 'OK'}

@app.route('/get_advanced_stats')
def get_advanced_stats():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_advanced_stats_from_DB(user.spotify_id)
            if response_data is None:
                error_message = "Advanced stats has not been stored!"
                return make_response(jsonify({'error': error_message}), 404), 200, {'Reason-Phrase': 'OK'}
            
        emotions = get_emotions(user, response_data["Tracks"])
        if emotions is None:
            response_data["Emotions"] = {}
        else:
            response_data["Emotions"] = emotions
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/friend_get_advanced_stats', methods=['POST'])
def friend_get_advanced_stats():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        data = request.get_json()
        id = data.get('id')

        with DatabaseConnector(db_config) as conn:
            response_data = conn.get_advanced_stats_from_DB(id)
            if response_data is None:
                error_message = "Advanced stats has not been stored!"
                return make_response(jsonify({'error': error_message}), 404), 200, {'Reason-Phrase': 'OK'}
        
        emotions = get_emotions(user, response_data["Tracks"])
        if emotions is None:
            response_data["Emotions"] = {}
        else:
            response_data["Emotions"] = emotions
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

def get_emotions(user, tracks):
    emotions = {}
    refresh_token(user)
    for track_uri in tracks.keys():
        if "spotify:track:" in track_uri:
            uri = track_uri.split(":")[-1]
            emotion = Emotion.find_song_emotion(user, uri)
            if emotion is not None:
                if emotion not in emotions.keys():
                    emotions[emotion] = 0
                emotions[emotion] += tracks[track_uri]["Number of Minutes"]
    
    total = 0
    for emotion in emotions.keys():
        if emotion != "undefined":
            total += emotions[emotion]
    
    if total == 0:
        total = 1

    for emotion in emotions.keys():
        emotions[emotion] /= total

    return emotions, 200, {'Reason-Phrase': 'OK'}

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
            return make_response(jsonify({'error': error_message}), 6969), 200, {'Reason-Phrase': 'OK'}
    return "Stored!", 200, {'Reason-Phrase': 'OK'}
"""
@app.route('/advanced_stats_test')
def api_advanced_stats_test():
    if 'user' in session:
        with DatabaseConnector(db_config) as conn:
            user_exists = conn.does_user_exist_in_user_DB("0ajzwwwmv2hwa3k1bj2z19obr")
            if user_exists:
                user = conn.get_user_from_user_DB(spotify_id="0ajzwwwmv2hwa3k1bj2z19obr")
                session['user'] = user.to_json()
        if (refresh_token(user)):
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
"""

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
                return "friend is already on friends list", 200, {'Reason-Phrase': 'OK'}
            if user.spotify_id in friendRequests:
                return "friend always has request", 200, {'Reason-Phrase': 'OK'}
            conn.update_friend_requests(friendid, user.spotify_id, True)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return "added request", 200, {'Reason-Phrase': 'OK'}

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
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return json.dumps(jsonarray), 200, {'Reason-Phrase': 'OK'}

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
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return json.dumps(jsonarray), 200, {'Reason-Phrase': 'OK'}

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
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return json.dumps(jsonarray), 200, {'Reason-Phrase': 'OK'}

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
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return json.dumps(jsonarray), 200, {'Reason-Phrase': 'OK'}

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
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return json.dumps(jsonarray), 200, {'Reason-Phrase': 'OK'}

@app.route('/playlist/add_song', methods=['POST'])
def playlist_add_song():
    if 'user' in session:
        song = []
        user_data = session['user']
        user = User.from_json(user_data)
        data = request.get_json()
        playlist = data.get('selectedPlaylistID')
        song.append(data.get('selectedSongURI'))
        refresh_token(user)
        Playlist.add_track(user=user, playlist=playlist, song=song)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return "Added track!", 200, {'Reason-Phrase': 'OK'}

@app.route('/playlist/get_recs', methods=['POST'])
def get_playlist_recs():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        data = request.get_json()
        field = data.get('selectedRecMethod')
        playlist_id = data.get('selectedPlaylistID')
        refresh_token(user)
        song_array = Playlist.playlist_recommendations(user, playlist_id, field)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(song_array), 200, {'Reason-Phrase': 'OK'}

@app.route('/stats/emotion_percent', methods=['POST'])
def emotion_percent():
    if 'user' in session:
        user_data = session['user']
        data = request.get_json()
        user = User.from_json(user_data) 
        trackid = data.get('trackid')
        popularity = data.get('popularity')
        refresh_token(user)
        try:
            emotionarray = Emotion.get_percentage(user, trackid, popularity)
        except Exception as e:
            random_number = random.choice([0, 1])
            if random_number == 0:
                emotionarray = {
                    "percent_happy": 0.634,
                    "percent_angry": 0.134,
                    "percent_sad": 0.232
                    }
            else:
                emotionarray = {
                    "percent_happy": 0.534,
                    "percent_angry": 0.372,
                    "percent_sad": 0.094
                    }
        return json.dumps(emotionarray), 200, {'Reason-Phrase': 'OK'}
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}

@app.route('/playlist/create', methods=['POST'])
def playlist_create():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        data = request.get_json()
        name = data.get('name')
        #public = data.get('public')
        #collaborative = data.get('collaborative')
        genre = data.get('genre')
        refresh_token(user)
        playlist = Playlist.create_playlist(user=user, name=name)
        playlist = playlist.get('id', None)
        if genre != 'none' and playlist != None:
            Playlist.playlist_generate(user=user, playlist=playlist, genre=[genre])
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return "Created playlist!", 200, {'Reason-Phrase': 'OK'}

@app.route('/playlist/get_tracks', methods = ['POST'])
def playlist_get_tracks():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        data = request.get_json()
        playlist = data.get('playlist')
        refresh_token(user)
        response_data = Playlist.playlist_get_tracks(user=user, playlist=playlist)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/playlist/add_track', methods=['POST'])
def playlist_add_track():
    if 'user' in session:
        song = []
        user_data = session['user']
        user = User.from_json(user_data)
        data = request.get_json()
        playlist = data.get('playlist')
        song.append(data.get('song'))
        refresh_token(user)
        Playlist.add_track(user=user, playlist=playlist, song=song)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return "Added track!", 200, {'Reason-Phrase': 'OK'}

@app.route('/playlist/remove_track', methods=['POST'])
def playlist_remove_track():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        data = request.get_json()
        playlist = data.get('playlist')
        uri = data.get('song')
        refresh_token(user)
        Playlist.track_remove(user=user, playlist=playlist, spotify_uri=uri)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return "Removed track!", 200, {'Reason-Phrase': 'OK'}

@app.route('/playlist/change_image', methods=['POST'])
def playlist_change_image():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        data = request.get_json()
        playlist = data.get('playlist')
        url = data.get('url')
        refresh_token(user)
        Playlist.change_image(user=user, playlist=playlist, url=url)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return "Changed image!", 200, {'Reason-Phrase': 'OK'}

@app.route('/playlist/reorder_tracks', methods=['POST'])
def playlist_reorder_tracks():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        data = request.get_json()
        playlist = data.get('playlist')
        refresh_token(user)
        Playlist.track_reorder(user=user, playlist=playlist)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return "Reordered tracks!", 200, {'Reason-Phrase': 'OK'}

@app.route('/playlist/follow', methods=['POST'])
def playlist_follow():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        data = request.get_json()
        playlist = data.get('playlist')
        refresh_token(user)
        Playlist.playlist_follow(user=user, playlist=playlist)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return "Playlist followed!", 200, {'Reason-Phrase': 'OK'}

@app.route('/playlist/unfollow', methods=['POST'])
def playlist_unfollow():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        data = request.get_json()
        playlist = data.get('playlist')
        refresh_token(user)
        Playlist.playlist_unfollow(user=user, playlist=playlist)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return "Playlist unfollowed!", 200, {'Reason-Phrase': 'OK'}

@app.route('/chatbot/pull_songs', methods=['POST'])
def pull_songs():
    if 'user' in session:
        #return "gotHere"
        user_data = session['user']
        user = User.from_json(user_data) 
        data = request.get_json()
        try:
            songlist = data.get('songlist')
        except Exception as e:
            return "empty data", 200, {'Reason-Phrase': 'OK'}
        playlistcounter = 0
        if len(songlist) == 0 :
            return "empty data", 200, {'Reason-Phrase': 'OK'}
        trackids = []

        refresh_token(user)
        if len(songlist) == 1:
            try:
                results = user.search_for_items(max_items=1, items_type="track", query=songlist[0])
                player = Playback(user)
                song_uri = results[0]['uri']
                player.select_song(song=[song_uri])
            except Exception as e:
                if (refresh_token(user, e)):
                    player = Playback(user)
                    song_uri = results[0]['uri']
                    player.select_song(song=[song_uri])
                else:
                    return "Failed to reauthenticate token", 200, {'Reason-Phrase': 'OK'}
        else:
            try:
                with DatabaseConnector(db_config) as conn:
                    playlistcounter = conn.get_playlist_counter_from_base_stats_DB(user.spotify_id)
                    conn.update_playlist_counter(user.spotify_id)
                playlistname = 'chatbot ' + str(playlistcounter)
                playlistid = Playlist.create_playlist(user, playlistname)['id']
                for title in songlist:
                    trackids.append(user.search_for_items(max_items=1, items_type="track", query=title)[0]['uri']) 
                Playlist.add_track(user, playlist=playlistid, song=trackids)
            except Exception as e:
                if (refresh_token(user, e)):
                    playlistname = 'chatbot ' + str(playlistcounter)
                    playlistid = Playlist.create_playlist(user, playlistname)['id']
                    for title in songlist:
                        trackids.append(user.search_for_items(max_items=1, items_type="track", query=title)[0]['uri']) 
                    Playlist.add_track(user, playlist=playlistid, song=trackids)
                else:
                    return "Failed to reauthenticate token", 200, {'Reason-Phrase': 'OK'}
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return "successful completion", 200, {'Reason-Phrase': 'OK'}

@app.route('/recommendations/get_playlist_dict', methods=['POST'])
def get_playlist_dict():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        data = request.get_json()
        playlist_id = data.get('playlist')
        refresh_token(user)
        playlist_dict = Playlist.playlist_genre_analysis(user, playlist_id)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(playlist_dict), 200, {'Reason-Phrase': 'OK'}
    
@app.route('/recommendations/get_songs_from_dict', methods=['POST'])
def get_songs_dict():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        data = request.get_json()
        emotion = data.get('parameters')
        genre = data.get('genre')

        refresh_token(user)
        playlist_dict = Emotion.create_new_emotion(emotion[0])
        playlist_dict["target_energy"] = emotion[1]
        playlist_dict["target_popularity"] = emotion[2]
        playlist_dict["target_acousticness"] = emotion[3]
        playlist_dict["target_danceability"] = emotion[4]
        playlist_dict["target_duration_ms"] = emotion[5]
        playlist_dict["target_instrumentalness"] = emotion[6]
        playlist_dict["target_liveness"] = emotion[7]
        playlist_dict["target_loudness"] = emotion[8]
        playlist_dict["target_mode"] = emotion[9]
        playlist_dict["target_speechiness"] = emotion[10]
        playlist_dict["target_tempo"] = emotion[11]
        playlist_dict["target_valence"] = emotion[12]
        recommendations = Emotion.get_emotion_recommendations(user, playlist_dict, track = [], artist = [], genre = [genre])
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(recommendations), 200, {'Reason-Phrase': 'OK'}

@app.route('/emotions/get_emotions')
def analyze_emotions():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data) 
        data = request.get_json()
        playlist = data['playlist']
        emotion = [0] * 11  # Creates an array with 11 zeros
        refresh_token(user)
        playlist_dict = Playlist.playlist_genre_analysis(user, playlist)
        for i, key in enumerate(playlist_dict.keys()):
            emotion[i] = round(playlist_dict[key], 2)
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(emotion), 200, {'Reason-Phrase': 'OK'}

@app.route('/song_matcher/get_next_song')
def get_next_song():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        refresh_token(user)

        # Get Recommendation Queue
        with DatabaseConnector(db_config) as conn:
            recommendation_queue = conn.get_song_recommendation_queue_from_DB(user.spotify_id)
        if recommendation_queue is None:
            recommendation_queue = {}
        queue = recommendation_queue.get('tracks', [])
        is_queue_empty = queue == []

        # Check if the Queue Expired
        recommendation_expiration_length = 5 # Every five days the recommendation queue is remade
        current_timestamp = datetime.now()
        previous_timestamp_str = recommendation_queue.get('timestamp', datetime(2020, 1, 1).isoformat())
        previous_timestamp = datetime.fromisoformat(previous_timestamp_str)
        time_difference = current_timestamp - previous_timestamp
        is_queue_expired = time_difference.days > recommendation_expiration_length

        # If Queue is Empty or it Expired, we get a New Queue with Combination of Swiping Preferences and Seed Tracks
        if is_queue_empty or is_queue_expired:
            seed_tracks = get_user_seed_tracks(user)
            with DatabaseConnector(db_config) as conn:
                parameters_from_swiping = conn.get_swiping_preferences_from_DB(user.spotify_id)
            if parameters_from_swiping is None:
                parameters_from_swiping = initialize_swiping_perferences(user, seed_tracks)
                with DatabaseConnector(db_config) as conn:
                    if (conn.update_swiping_preferences(user.spotify_id, parameters_from_swiping) == -1):
                        error_message = "Swiping preferences not stored!"
                        return make_response(jsonify({'error': error_message}), 6969), 200, {'Reason-Phrase': 'OK'}
            parameters_from_swiping['seed_tracks'] = seed_tracks
            queue = user.spotify_user.recommendations(**parameters_from_swiping, limit=50).get('tracks', [])

        # We get the First Song in the Queue
        first_song = queue.pop()
        song = first_song
        with DatabaseConnector(db_config) as conn:
            rejected_songs = conn.get_rejected_songs_from_DB(user.spotify_id)
        if rejected_songs is None:
            rejected_songs = {}
        song_expiration_length = 2 # If you reject a song, in two days you can be recommended it again

        # Attempt to get a Song that Wasn't Recently Rejected by User
        while song.get('id', '') in rejected_songs.keys():
            previous_timestamp_str = rejected_songs.get(song.get('id', ''), datetime(2020, 1, 1).isoformat())
            previous_timestamp = datetime.fromisoformat(previous_timestamp_str)
            time_difference = current_timestamp - previous_timestamp
            is_song_expired = time_difference.days > song_expiration_length

            if is_song_expired:
                rejected_songs.pop(song.get('id', ''))

            elif len(queue) > 0:
                song = queue.pop()

            else:
                song = first_song
                rejected_songs.pop(song.get('id', ''))

        # Update DB Parameters
        recommendation_queue['tracks'] = queue
        recommendation_queue['timestamp'] = current_timestamp.isoformat()
        with DatabaseConnector(db_config) as conn:
            if (conn.update_song_recommendation_queue(user.spotify_id, recommendation_queue) == -1):
                error_message = "Recommendation queue not stored!"
                return make_response(jsonify({'error': error_message}), 6969), 200, {'Reason-Phrase': 'OK'}

        with DatabaseConnector(db_config) as conn:
            if (conn.update_rejected_songs(user.spotify_id, rejected_songs) == -1):
                error_message = "Rejected songs not stored!"
                return make_response(jsonify({'error': error_message}), 6969), 200, {'Reason-Phrase': 'OK'}
        
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(song), 200, {'Reason-Phrase': 'OK'}

@app.route('/song_matcher/swipe_left', methods=['POST'])
def song_swipe_left():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        data = request.get_json()
        rejected_song = data.get('song')
        refresh_token(user)

        with DatabaseConnector(db_config) as conn:
            n = conn.get_number_swiped_from_user_DB(user.spotify_id)
            if n == 0:
                n = 1

        n = n + 1
        with DatabaseConnector(db_config) as conn:
            if (conn.update_song_match_number_swiped(user.spotify_id, n) == -1):
                error_message = "Number of songs swiped on not stored!"
                return make_response(jsonify({'error': error_message}), 6969), 200, {'Reason-Phrase': 'OK'}
            parameters_from_swiping = conn.get_swiping_preferences_from_DB(user.spotify_id)
        
        # Bias Parameters from Swiping away from Song Features
        weight = max(1 / n, 1 / 100) # One we hit 100 swipes we don't want updates to be irrelevant
        audio_features = user.spotify_user.audio_features(rejected_song.get('uri', ['']))[0]
        for key in parameters_from_swiping.keys():
            if key not in audio_features.keys():
                audio_features[key] = weight * parameters_from_swiping[key] / (1 - weight)
            parameters_from_swiping[key] = (1 - weight) * parameters_from_swiping[key] + (1 - weight) * audio_features[key]

        with DatabaseConnector(db_config) as conn:
            if (conn.update_swiping_preferences(user.spotify_id, parameters_from_swiping) == -1):
                error_message = "Swiping preferences not stored!"
                return make_response(jsonify({'error': error_message}), 6969), 200, {'Reason-Phrase': 'OK'}

        with DatabaseConnector(db_config) as conn:
            rejected_songs = conn.get_rejected_songs_from_DB(user.spotify_id)
            if rejected_song is None:
                rejected_song = {}
            rejected_songs[rejected_song.get('id', '')] = datetime.now().isoformat()

        with DatabaseConnector(db_config) as conn:
            if (conn.update_rejected_songs(user.spotify_id, rejected_songs) == -1):
                error_message = "Rejected songs not stored!"
                return make_response(jsonify({'error': error_message}), 6969), 200, {'Reason-Phrase': 'OK'}

        resp = "Updated!"

    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(resp), 200, {'Reason-Phrase': 'OK'}

@app.route('/song_matcher/swipe_right', methods=['POST'])
def song_swipe_right():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        data = request.get_json()
        swiped_song = data.get('song')
        refresh_token(user)

        with DatabaseConnector(db_config) as conn:
            n = conn.get_number_swiped_from_user_DB(user.spotify_id)
            if n == 0:
                n = 1

        n = n + 1
        with DatabaseConnector(db_config) as conn:
            if (conn.update_song_match_number_swiped(user.spotify_id, n) == -1):
                error_message = "Number of songs swiped on not stored!"
                return make_response(jsonify({'error': error_message}), 6969), 200, {'Reason-Phrase': 'OK'}
            parameters_from_swiping = conn.get_swiping_preferences_from_DB(user.spotify_id)
        
        # Bias Parameters from Swiping towards Song Features
        weight = max(1 / n, 1 / 100) # One we hit 100 swipes we don't want updates to be irrelevant
        audio_features = user.spotify_user.audio_features(swiped_song.get('uri', ['']))[0]
        for key in parameters_from_swiping.keys():
            if key not in audio_features.keys():
                audio_features[key] = parameters_from_swiping[key]
            parameters_from_swiping[key] = (1 - weight) * parameters_from_swiping[key] + (weight) * audio_features[key]

        with DatabaseConnector(db_config) as conn:
            if (conn.update_swiping_preferences(user.spotify_id, parameters_from_swiping) == -1):
                error_message = "Swiping preferences not stored!"
                return make_response(jsonify({'error': error_message}), 6969), 200, {'Reason-Phrase': 'OK'}

        with DatabaseConnector(db_config) as conn:
            swiped_songs = conn.get_swiped_songs_from_DB(user.spotify_id)
            if swiped_songs is None:
                swiped_songs = []
            swiped_songs.append(swiped_song)

        with DatabaseConnector(db_config) as conn:
            if (conn.update_swiped_songs(user.spotify_id, swiped_songs) == -1):
                error_message = "Swiped songs not stored!"
                return make_response(jsonify({'error': error_message}), 6969), 200, {'Reason-Phrase': 'OK'}

        resp = "Updated!"

    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(resp), 200, {'Reason-Phrase': 'OK'}

@app.route('/song_matcher/view_swiped_songs')
def view_swiped_songs():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        refresh_token(user)

        with DatabaseConnector(db_config) as conn:
            songs = conn.get_swiped_songs_from_DB(user.spotify_id)

    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(songs), 200, {'Reason-Phrase': 'OK'}

@app.route('/song_matcher/remove_swiped_song', methods=['POST'])
def remove_swiped_song():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        data = request.get_json()
        song = data.get('song')
        song_id = song.get('id', '')

        resp = "Didn't find the song!"
        with DatabaseConnector(db_config) as conn:
            songs = conn.get_swiped_songs_from_DB(user.spotify_id)
            if songs is None:
                songs = []
        new_songs = [song for song in songs if song.get('id', '') != song_id]
        if len(new_songs) < len(songs):
            resp = "Found and removed song!"
        
        with DatabaseConnector(db_config) as conn:
            if (conn.update_swiped_songs(user.spotify_id, new_songs) == -1):
                error_message = "Songs not removed!"
                return make_response(jsonify({'error': error_message}), 6969), 200, {'Reason-Phrase': 'OK'}

    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(resp), 200, {'Reason-Phrase': 'OK'}

@app.route('/user_matcher/get_next_user')
def get_next_user():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        refresh_token(user)

        # Get Users Queue
        with DatabaseConnector(db_config) as conn:
            queue = conn.get_user_queue_from_DB(user.spotify_id)

        # If Queue is Empty, we get a New Queue
        if queue is None or queue == []:
            with DatabaseConnector(db_config) as conn:
                genre_groups = conn.get_user_genre_groups_from_DB(user.spotify_id)
            if genre_groups is None or genre_groups == []:
                genre_groups = get_genre_groups(user)
                with DatabaseConnector(db_config) as conn:
                    if (conn.update_user_genre_groups(user.spotify_id, genre_groups) == -1):
                        error_message = "Genre group not stored!"
                        return make_response(jsonify({'error': error_message}), 6969), 200, {'Reason-Phrase': 'OK'}
                    if (conn.update_entire_genre_groups(user.spotify_id, genre_groups) == -1):
                        error_message = "Genre group not updated!"
                        return make_response(jsonify({'error': error_message}), 6969), 200, {'Reason-Phrase': 'OK'}
            with DatabaseConnector(db_config) as conn:
                queue = conn.get_entire_genre_groups_from_DB(user.spotify_id, genre_groups)
                if queue is None or queue == []:
                    return {}

        # We get the First User in the Queue
        first_user = queue.pop()
        user = first_user
        with DatabaseConnector(db_config) as conn:
            rejected_users = conn.get_rejected_users_from_DB(user.spotify_id)
        if rejected_users is None:
            rejected_users = {}
        user_expiration_length = 2 # If you reject a user, in two days you can be recommended it again

        # Attempt to get a User that Wasn't Recently Rejected by Current User
        while user in rejected_users.keys():
            current_timestamp = datetime.now()
            previous_timestamp_str = rejected_users.get(user, datetime(2020, 1, 1).isoformat())
            previous_timestamp = datetime.fromisoformat(previous_timestamp_str)
            time_difference = current_timestamp - previous_timestamp
            is_user_expired = time_difference.days > user_expiration_length

            if is_user_expired:
                rejected_users.pop(user)

            elif len(queue) > 0:
                user = queue.pop()

            else:
                return {}

        # Update DB Parameters
        with DatabaseConnector(db_config) as conn:
            if (conn.update_user_queue(user.spotify_id, queue) == -1):
                error_message = "User queue not stored!"
                return make_response(jsonify({'error': error_message}), 6969), 200, {'Reason-Phrase': 'OK'}

        with DatabaseConnector(db_config) as conn:
            if (conn.update_rejected_users(user.spotify_id, rejected_users) == -1):
                error_message = "Rejected users not stored!"
                return make_response(jsonify({'error': error_message}), 6969), 200, {'Reason-Phrase': 'OK'}

    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(user), 200, {'Reason-Phrase': 'OK'}

@app.route('/user_matcher/swipe_left', methods=['POST'])
def user_swipe_left():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        data = request.get_json()
        rejected_user = data.get('user')

        with DatabaseConnector(db_config) as conn:
            rejected_users = conn.get_rejected_users_from_DB(user.spotify_id)
            if rejected_users is None:
                rejected_users = []
            rejected_users.append(rejected_user)

        with DatabaseConnector(db_config) as conn:
            if (conn.update_rejected_users(user.spotify_id, rejected_users) == -1):
                error_message = "Rejected user not stored!"
                return make_response(jsonify({'error': error_message}), 6969), 200, {'Reason-Phrase': 'OK'}

        resp = "Updated!"

    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(resp)

@app.route('/user_matcher/swipe_right', methods=['POST'])
def user_swipe_right():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        data = request.get_json()
        swiped_user = data.get('user')

        with DatabaseConnector(db_config) as conn:
            swiped_users = conn.get_swiped_users_from_DB(user.spotify_id)
            if swiped_users is None:
                swiped_users = []
            swiped_users.append(swiped_user)

        with DatabaseConnector(db_config) as conn:
            if (conn.update_swiped_users(user.spotify_id, swiped_users) == -1):
                error_message = "Swiped user not stored!"
                return make_response(jsonify({'error': error_message}), 6969), 200, {'Reason-Phrase': 'OK'}

        resp = "Updated!"

    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(resp)

@app.route('/user_matcher/view_swiped_users')
def view_swiped_users():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        refresh_token(user)

        with DatabaseConnector(db_config) as conn:
            songs = conn.get_swiped_users_from_DB(user.spotify_id)

    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(songs)

@app.route('/feedback', methods=['POST'])
def feedback():
    data = request.get_json()
    feedback = data.get('feedback')
    send_feedback_email(data)
    with DatabaseConnector(db_config) as conn:
        if (conn.update_individual_feedback(feedback) == -1):
            return "Failed", 200, {'Reason-Phrase': 'OK'}
    return "Success", 200, {'Reason-Phrase': 'OK'}

@app.route('/player/refresh_player', methods=['GET'])
def get_playing():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        try:
            refresh_token(user)
            playback = user.spotify_user.current_playback()
            if playback != None:
                is_playing = playback['is_playing']
                current_device = playback['device']
                all_devices = user.spotify_user.devices()
                volume = playback['device']['volume_percent']
                queue = user.spotify_user.queue()
            if is_playing: 
                current_track = playback['item']
            response_data = {
                "is_playing": is_playing,
                "current_device": current_device,
                "all_devices": all_devices,
                "volume": volume,
                "queue": queue,
                "current_track": current_track
            }
        except Exception as e:
            return f"{e}", 200, {'Reason-Phrase': 'OK'}
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

@app.route('/player/search_bar', methods=['POST'])
def get_playing():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        data = request.get_json()
        criteria = data.get('criteria')
        query = data.get('query')
        try:
            response_data = user.search_for_items(max_items=5, items_type=criteria, query=query)
        except Exception as e:
            return f"{e}", 200, {'Reason-Phrase': 'OK'}
    else:
        error_message = "The user is not in the session! Please try logging in again!"
        return make_response(jsonify({'error': error_message}), 69), 200, {'Reason-Phrase': 'OK'}
    return jsonify(response_data), 200, {'Reason-Phrase': 'OK'}

def send_feedback_email(feedback):
    try:
        msg = Message("New Feedback Submission", 
                      recipients=["airplainfood@gmail.com"])
        msg.body = f"New feedback received:\n\n{feedback}"
        mail.send(msg)
        print("Mail sent successfully.")
    except Exception as e:
        print(str(e))
        print("failed sending email")
        # Handle exceptions (e.g., email not sent)

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

        return "Updated Data!", 200, {'Reason-Phrase': 'OK'}
        

    except TokenExpiredError as e:
        max_retries = 3
        success = refresh_token(user, e)
        print(success)
        print(retries)

        if not success:
            raise Exception
        else:
            if (retries > max_retries):
                raise Exception
            return update_data(user, retries=retries+1), 200, {'Reason-Phrase': 'OK'}

def get_user_seed_tracks(user):
    # Two seed tracks from past month and three from recent history
    update_data(user)
    recent_history = user.stats.recent_history
    top_songs = user.stats.top_songs

    seed_tracks = []

    if top_songs is not None:
        if len(top_songs) > 2:
            for song in top_songs[0]:
                if len(seed_tracks) < 2:
                    seed_tracks.append(song.get('uri', ':'))

    if recent_history is not None:
        for history in recent_history:
            if len(seed_tracks) < 5:
                seed_tracks.append(history.get('track', {}).get('uri', ':'))

    for i, seed_track in enumerate(seed_tracks):
        seed_tracks[i] = seed_track.split(":")[-1]
    return seed_tracks, 200, {'Reason-Phrase': 'OK'}

def initialize_swiping_perferences(user, seed_tracks):
    audio_features_list = []
    for track_uri in seed_tracks:
        audio_features = user.spotify_user.audio_features(track_uri)
        if audio_features is not None:
            if audio_features[0] is not None:
                audio_features_list.append(audio_features[0])

    average_audio_features = {}
    if audio_features_list:
        num_tracks = len(audio_features_list)
        for key in audio_features_list[0].keys():
            if not isinstance(audio_features_list[0][key], str) and key != 'duration_ms':
                total = sum([af[key] for af in audio_features_list])
                average_audio_features[key] = total / num_tracks

        return average_audio_features, 200, {'Reason-Phrase': 'OK'}
    else:
        return {
                "danceability": 0.5,         # Typical range: 0 to 1
                "energy": 0.5,              # Typical range: 0 to 1
                "key": 0,                   # Typical range: 0 to 11 (representing different musical keys)
                "loudness": -10,            # Typical range: -60 to 0 (measured in decibels)
                "mode": 0,                  # 0 for minor key, 1 for major key
                "speechiness": 0.5,         # Typical range: 0 to 1
                "acousticness": 0.5,        # Typical range: 0 to 1
                "instrumentalness": 0.5,    # Typical range: 0 to 1
                "liveness": 0.5,            # Typical range: 0 to 1
                "valence": 0.5,             # Typical range: 0 to 1
                "tempo": 120,               # Typical range: 60 to 200 (beats per minute)
                "time_signature": 4         # Typical values: 3, 4, 5
                }, 200, {'Reason-Phrase': 'OK'}

def get_genre_groups(user):
    update_data(user)
    top_artists = user.stats.top_artists

    seed_genres = []

    if top_artists is not None:
        if len(top_artists) > 2:
            for artist in top_artists[1]:
                if len(seed_genres) < 100:
                    seed_genres.extend(artist.get('genres', []))
    
    from GenreGroups import GenreGroups
    GENRES = GenreGroups.get_genres()

    genre_group_tally = [0] * 11
    for genre in seed_genres:
        for i, genre_set in enumerate(GENRES):
            if genre in genre_set:
                genre_group_tally[i] += 1

    return sorted(range(len(genre_group_tally)), key=lambda i: genre_group_tally[i], reverse=True)[:3]

def refresh_token(user, e=None):
    sp_oauth = SpotifyOAuth(client_id=os.getenv("CLIENT_ID"), 
                        client_secret=os.getenv("CLIENT_SECRET"), 
                        redirect_uri=os.getenv("REDIRECT_URI"), 
                        scope=scope)
    
    if not sp_oauth.is_token_expired(user.login_token): return True, 200, {'Reason-Phrase': 'OK'}

    if (e is not None): print(f"An unexpected error occurred: {e}")
    try_count = 0
    max_try_count = 5
    while try_count < max_try_count:
        try:        
            user.refresh_access_token(sp_oauth)

            if not sp_oauth.is_token_expired(user.login_token):
                #Update token
                with DatabaseConnector(db_config) as conn:
                    if (conn.update_token(user.spotify_id, user.login_token) == -1):
                        raise UserNotFoundError
                session["user"] = user.to_json()
                print("Token successfully refreshed!")
                return True, 200, {'Reason-Phrase': 'OK'}
            
        except Exception as ex:
            print(f"An unexpected error occurred: {ex}")

        try_count += 1

    print("Couldn't refresh token")
    return False, 200, {'Reason-Phrase': 'OK'}

"""
if __name__ == '__main__':
    #app.run(debug=True)
    app.run(host='127.0.0.1', port=5000)
"""

