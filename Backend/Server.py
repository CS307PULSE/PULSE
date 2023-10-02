from flask import Flask, redirect, request, session, url_for, make_response, render_template
from User import User
from Database import DBHandling
from Exceptions import SpotifyLinkingError
import os
import json

import spotipy
from spotipy.oauth2 import SpotifyOAuth

app = Flask(__name__)
app.secret_key = 'your_secret_key'

current_dir = os.getcwd()
lines = []
with open(current_dir + '\\Testing\\' + 'ClientData.txt', 'r') as file:
    for line in file:
        lines.append(line.strip())

client_id, client_secret, redirect_uri = lines
cache_path = current_dir + '\\Testing\\' + 'TokenCache'

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

# Convert the array to a space-separated string
scope = ' '.join(scopes)

@app.route('/')
def index():
    user_id = request.cookies.get('user_id_cookie')
    if user_id:
        if DBHandling.does_user_exist_in_DB(user_id):
            user = DBHandling.get_user_from_DB(user_id)
            session['user'] = user.to_json()
            return redirect(url_for('test'))

    return 'Please <a href="/login">log in with Spotify</a> to continue.'

@app.route('/login')
def login():
    # Create a SpotifyOAuth instance with the necessary parameters
    sp_oauth = SpotifyOAuth(client_id=client_id, 
                            client_secret=client_secret, 
                            redirect_uri=redirect_uri, 
                            scope=scope,
                            cache_path=cache_path)
    
    # Check if cached token exists and is still valid
    token_info = sp_oauth.get_cached_token()

    if not token_info:
        # Generate the authorization URL
        auth_url = sp_oauth.get_authorize_url()

        # Redirect the user to the Spotify login page
        return redirect(auth_url)

    # When the access token expires, use the refresh token to obtain a new one
    if sp_oauth.is_token_expired(token_info):
        token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])

    sp = spotipy.Spotify(auth=token_info['access_token'])
    user_data = sp.me()

    # Create a User object and store it in the session
    user = User(
        display_name=user_data['display_name'],
        login_token=token_info,
        spotify_id=sp.me()['id'],
        spotify_user=sp
    )
    
    resp = make_response("COOKIE")
    resp.set_cookie('user_id_cookie', user.spotify_id)
    if not DBHandling.does_user_exist_in_DB(user.spotify_id):
        DBHandling.store_new_user_in_DB(user)

    return redirect(url_for('index'))

@app.route('/callback')
def callback():
    # Handle the callback from Spotify after user login
    sp_oauth = SpotifyOAuth(client_id=client_id, 
                            client_secret=client_secret, 
                            redirect_uri=redirect_uri, 
                            scope=scope,
                            cache_path=cache_path)

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

        resp = make_response("COOKIE")
        resp.set_cookie('user_id_cookie', user.spotify_id)
        if not DBHandling.does_user_exist_in_DB(user.spotify_id):
            DBHandling.store_new_user_in_DB(user)

        return redirect(url_for('index'))

    else:
        return 'Login failed. Please try again.'

@app.route('/logout')
def logout():
    session.pop('user', None)
    return 'Logged out successfully.'

@app.route('/test')
def test():
    if 'user' in session:
        user_data = session['user']  # User data is already a dictionary
        user = User.from_json(user_data)
        run_tests(user)
        return f'Welcome, {user.display_name}!'
    else:
        return 'User session not found. Please log in again.'

def run_tests(testUser):
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
    currentDir = os.getcwd()

    recent_history_test = True
    top_songs_test = True
    top_artists_test = True
    followed_artists_tests = True

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

    if (verbose):
        # Open the file in write mode ('w') to clear its contents
        with open(currentDir + '\\Testing\\' + 'TestOutput.txt', 'w', encoding='utf-8') as file:
            file.write(printString)

if __name__ == '__main__':
    app.run(debug=True)