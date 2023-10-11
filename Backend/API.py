#pip install flask
#pip install python-dotenv
#pip install flask-cors
#pip install mysql.connector
from flask import Flask, redirect, request, session, url_for, make_response, render_template, jsonify, render_template_string
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

import spotipy
from spotipy.oauth2 import SpotifyOAuth

run_firebase = False
run_connected = False
spoof_songs = True

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
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

app.secret_key = 'your_secret_key'

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
            user_exists = conn.does_user_exist_in_DB(user_id)
            if user_exists:
                user = conn.get_user_from_DB(spotify_id=user_id)
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
    # Handle the callback from Spotify after user login
    sp_oauth = SpotifyOAuth(client_id=client_id, 
                            client_secret=client_secret, 
                            redirect_uri=redirect_uri, 
                            scope=scope)

    # Validate the response from Spotify
    token_info = sp_oauth.get_access_token(request.args['code'])

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

        resp = make_response(redirect(url_for('index')))
        resp.set_cookie('user_id_cookie', value=str(user.spotify_id))
        
        user_exists = False
        with DatabaseConnector(db_config) as conn:
            user_exists = conn.does_user_exist_in_DB(user.spotify_id)
            if not user_exists:
                conn.store_new_user_in_DB(user)
            else:
                conn.update_token(user.spotify_id, user.login_token)

        return resp

    else:
        return 'Login failed. Please try again.'

@app.route('/logout')
def logout():
    session.pop('user', None)
    return 'Logged out successfully.'

@app.route('/dashboard')
def dashboard():
    return 'Welcome to the Dashboard! <a href="/statistics"> Click here to run tests!</a>'

@app.route('/games')
def games():
    return 'Select Game: <a href="/games/guess_the_song"> Play Guess the Song</a>'

@app.route('/statistics')
def statistics():
    #GET FOLLOWER HISTORY FROM
    #get layout from db
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        result = update_data(user)
        retries = 0
        max_retries = 3

        data = {'status' : 'Not updated',
                'recent_history' : '',
                'top_songs' : '',
                'top_artists' : '',
                'followed_artists' : '',
                'saved_songs' : '',
                'follower_data' : '',
                'layout_data' : ''}

        while (result <= 0):
            if (result == -1):
                return 'didnt work 2'
                return jsonify(data)
            else:
                # Token expired but was successfully refreshed, trying again
                result = update_data(user)
                retries += 1
                if (retries > max_retries):
                    return 'didnt work 1'
                    return jsonify(data)

        data['status'] = 'Success'
        data['recent_history'] = user.stringify(user.stats.recent_history)
        data['top_songs'] = user.stringify(user.stats.top_songs)
        data['top_artists'] = user.stringify(user.stats.top_artists)
        data['followed_artists'] = user.stringify(user.stats.followed_artists)
        data['saved_songs'] = user.stringify(user.stats.saved_songs)
        #data['follower_data']
        #data['layout_data']
        return jsonify(data)
        
    else:
        return 'User session not found. Please log in again.'

@app.route('/statistics/set_layout')
def set_layout(layout):
    #send to db
    return

@app.route('/games/playback', methods=['POST'])
def playback():
    data = request.get_json()
    filter_search = data.get('artist')
    timestamp_ms = 20000 #20 seconds playback
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
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
        elif filter_search == "":
            if user.stats.saved_songs is None:
                user.update_saved_songs()
            songs = user.stats.saved_songs
        else:
            results = user.search_for_items(query=filter_search, items_type='artist', max_items=5)
            if results['artists']['items']:
                artist_id = results['artists']['items'][0]['id']
                songs = user.spotify_user.artist_top_tracks(artist_id)
            else:
                if user.stats.saved_songs is None:
                    user.update_saved_songs()
                songs = user.stats.saved_songs 

        import random
        random_track = random.choice(songs)
        if (spoof_songs):
            track_uri = random_track['uri']
        else:
            track_uri = random_track['track']['uri']
        user.spotify_user.start_playback(uris=[track_uri], position_ms=timestamp_ms)
        result = f'Playing URI {track_uri}'
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

"""
@app.route('/games/guess_the_song')
def guess_the_song():
    if 'rounds' not in session:
        session['rounds'] = 5
    if 'players' not in session:
        session['players'] = 1

    session['round_num'] = 1
    session['scores'] = '0'

    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
    else:
        return 'User session not found. Please log in again.'

    scores_html = '<p>User\'s Past Scores:</p><ul>'
    for scores in user.high_scores:
        scores_html += f'<li>Round 1: {scores[0]}, Round 2: {scores[1]}</li>'
    scores_html += '</ul>'

    # Concatenate the scores HTML with the existing HTML
    html = f'''
    <html>
    <head><title>Your Game</title></head>
    <body>
        <h1>Welcome to the Game</h1>
        {scores_html} <!-- Display user's past scores -->
        <p><a href="/games/guess_the_song/play">Play Game</a> or <a href="/games/guess_the_song/settings">Configure Settings</a></p>
    </body>
    </html>
    '''

    # Return the combined HTML as the response
    return html

@app.route('/games/guess_the_song/settings', methods=['GET', 'POST'])
def guess_the_song_settings():
    if request.method == 'POST':
        rounds = int(request.form['rounds'])
        players = int(request.form['players'])

        session['rounds'] = rounds
        session['players'] = players
        session['scores'] = '0,' * (players - 1) + '0'
        return '<a href="/games/guess_the_song/play">Start Game</a> or <a href="/games/guess_the_song/settings">Re-Configure Settings</a></p>'

    return '''
    <html>
    <head><title>Play Game</title></head>
    <body>
        <h1>Play Game</h1>
        <form method="POST">
            <label for="rounds">Number of Rounds (3-10):</label>
            <input type="number" id="rounds" name="rounds" min="3" max="10" required><br>

            <label for="players">Number of Players (1-5):</label>
            <input type="number" id="players" name="players" min="1" max="5" required><br>

            <input type="submit" value="Start Game">
        </form>
    </body>
    </html>
    '''

@app.route('/games/guess_the_song/play')
def guess_the_song_play():
    return 'We will soon play a song that you listen to and you have to guess it! Please make sure your Spotify is on! <a href=/games/guess_the_song/play/round> Click here to start round 1!</a>'

@app.route('/games/guess_the_song/play/round')
def guess_the_song_play_round():
    return '''
    <html>
    <head><title>Guess The Song</title></head>
    <body>
        <h1>Guess The Song</h1>
        <button id="execute-button">Play Song</button>
        <br>
        <a href="/games/guess_the_song/play/correct">Click here if someone guessed correctly</a>
        <br>
        <a href="/games/guess_the_song/play/incorrect">Click here if everyone guessed incorrectly</a>
        
        <script>
            var executing = false; // Flag to track if the Python function is executing

            document.getElementById('execute-button').addEventListener('click', executeFunction);

            function executeFunction() {
                if (!executing) {
                    // Set the flag to true to indicate that the Python function is executing
                    executing = true;

                    // Call the Python function here
                    callPythonFunction();

                    // You can add any other logic you need here

                } else {
                    alert('Song playback has already started');
                }
            }

            // Function to call the Python function
            function callPythonFunction() {
                // Make an AJAX request to execute the Python function
                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/games/guess_the_song/play/playback', true);
                xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        // executing = false;
                        executing = true; // Keep true for now so we don't run it over and over
                    }
                };
                xhr.send(JSON.stringify({}));
            }
        </script>
    </body>
    </html>
    '''

@app.route('/games/guess_the_song/play/playback', methods=['POST'])
def execute_playback():
    timestamp_ms = 20000 #20 seconds playback
    if request.method == 'POST':
        if 'user' in session:
            user_data = session['user']
            user = User.from_json(user_data)
            print(f"Starting Playback on round {session['round_num']} out of {session['rounds']} with player scores {session['scores']}!")
            
            if user.stats.saved_songs is None:
                user.update_saved_songs()

            global spoof_songs
            songs = user.stats.saved_songs
            if (spoof_songs):
                songs = []
                songs.append(user.search_for_items(query="Runaway by Kanye West", items_type='track', max_items=1)[0])
                songs.append(user.search_for_items(query="Born Sinner by J. Cole", items_type='track', max_items=1)[0])
                songs.append(user.search_for_items(query="COFFEE BEAN by Travis Scott", items_type='track', max_items=1)[0])
                songs.append(user.search_for_items(query="Riteous by Juice WRLD", items_type='track', max_items=1)[0])
                songs.append(user.search_for_items(query="Fuck Love by XXXTENTACION", items_type='track', max_items=1)[0])
                songs.append(user.search_for_items(query="XO Tour Llif3 by Lil Uzi Vert", items_type='track', max_items=1)[0])
            import random
            random_track = random.choice(songs)
            if (spoof_songs):
                track_uri = random_track['uri']
            else:
                track_uri = random_track['track']['uri']
            user.spotify_user.start_playback(uris=[track_uri], position_ms=timestamp_ms)
            result = f'Playing URI {track_uri}'
        else:
            result = 'User session not found. Please log in again.'

        return jsonify({'message': result})
    return jsonify({'error': 'Invalid request'})

@app.route('/games/guess_the_song/play/correct', methods=['GET', 'POST'])
def correct_guess():
    error_message = None

    if request.method == 'POST':
        player_number = int(request.form.get('player_number'))
        if 1 <= player_number <= session['players']:
            # Redirect to the correct route based on the player number
            return redirect(f'/games/guess_the_song/play/correct/{player_number}')
        else:
            error_message = 'Invalid player number. Please enter a valid player number.'

    # Render the HTML directly within the function
    html_template = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Correct Guess</title>
    </head>
    <body>
        <h1>Correct Guess</h1>
        
        {f'<p style="color: red;">{error_message}</p>' if error_message else ''}
        
        <form method="post">
            <label for="player_number">Enter Player Number (1 through {session['players']}):</label>
            <input type="number" id="player_number" name="player_number" min="1" max="{session['players']}" required>
            <input type="submit" value="Submit">
        </form>
    </body>
    </html>
    '''
    return render_template_string(html_template)

@app.route('/games/guess_the_song/play/correct/<int:player_number>')
def correct_guess_with_number(player_number):
    # Retrieve scores from the session
    scores = list(map(int, session.get('scores', '').split(',')))

    # Validate the player_number to ensure it's within bounds
    if 1 <= player_number <= len(scores):
        # Increment the score of the player who guessed correctly
        scores[player_number - 1] += 1

        # Update the scores in the session
        session['scores'] = ','.join(map(str, scores))
        session['round_num'] += 1

        if session['round_num'] > session['rounds']:
            return 'Good job, scores have been updated! <a href="/games/guess_the_song/play/display_results"> Click here to go to display the final scores!</a>'

        return 'Good job, scores have been updated! <a href="/games/guess_the_song/play/round"> Click here to go to the next round!</a>'
    
    else:
        return "Invalid player number."

@app.route('/games/guess_the_song/play/incorrect')
def incorrect_guess():
    # Retrieve scores from the session
    scores = list(map(int, session.get('scores', '').split(',')))

    # Decrement one from everyone's score
    scores = [score - 1 for score in scores]

    # Update the scores in the session
    session['scores'] = ','.join(map(str, scores))
    session['round_num'] += 1
    if session['round_num'] > session['rounds']:
        return 'Nobody got it correct, scores have been updated! <a href="/games/guess_the_song/play/display_results"> Click here to go to display the final scores!</a>'

    return 'Nobody got it correct, scores have been updated! <a href="/games/guess_the_song/play/round"> Click here to go to the next round!</a>'

@app.route('/games/guess_the_song/play/display_results')
def display_results():
    scores_str = session.get('scores', '')
    map_vals = map(int, scores_str.split(','))
    scores = list(map_vals)
    from array import array

    updateHighScores = False
    if 'user' in session and updateHighScores:
        user_data = session['user']
        user = User.from_json(user_data)
        user.high_scores.extend(array('i', map_vals))
        with DatabaseConnector(db_config) as conn:
            if (conn.update_high_scores(user.spotify_id, user.high_scores) == 0):
                raise Exceptions.UserNotFoundError
        session["user"] = user.to_json()
        stored_scores_status = "The scores have been stored!"
    else:
        stored_scores_status = "The scores have not been stored! Please try logging in and playing again to save the scores!"
    
    # Calculate and display results here
    # For example, you can show the scores of each player

    # Construct the HTML for displaying the results and prompting to go back to games tab
    html_result = '''
    <html>
    <head><title>Results</title></head>
    <body>
        <h1>Results</h1>
        
        <p>Scores:</p>
        <ul>
    '''

    for i, score in enumerate(scores, start=1):
        html_result += f'<li>Player {i}: {score}</li>'

    html_result += stored_scores_status

    html_result += '''
        </ul>
        
        <p><a href="/games">Go back to the games tab</a></p>
    </body>
    </html>
    '''

    return html_result
"""
    
@app.route('/test')
def test():
    if 'user' in session:
        user_data = session['user']
        user = User.from_json(user_data)
        return run_tests(user)
    else:
        return 'User session not found. Please log in again.'

def update_data(user, update_recent_history=True,
                update_top_songs=True,
                update_top_artists=True,
                update_followed_artists=True,
                update_saved_tracks=True):

    print("Updating Data")
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
    time_string = (est_datetime.strftime('%Y-%m-%d %H:%M:%S %Z%z')) + '\n'

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

        print("Updated data")
        return 1

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

                user.refresh_access_token(sp_oauth)

                if not sp_oauth.is_token_expired(user.login_token):
                    #Update token
                    with DatabaseConnector(db_config) as conn:
                        if (conn.update_token(user.spotify_id, user.login_token) == 0):
                            raise Exceptions.UserNotFoundError
                    session["user"] = user.to_json()
                    print("Token successfully refreshed!")
                    return 0
                
            except Exception as ex:
                print(f"An unexpected error occurred: {ex}")

            try_count += 1

        print("Couldn't refresh token")
        return -1

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
    guess_the_song_game = True

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
            testUser.update_saved_songs(max_tracks=10000)
            saved_songs = testUser.stats.saved_songs
            for track in saved_songs:
                printString += (f"{track['track']['name']} by {track['track']['artists'][0]['name']}") + '\n'
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
    app.run(host='0.0.0.0', port=8080)