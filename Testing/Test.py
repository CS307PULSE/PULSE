import spotipy # pip install spotipy
from spotipy.oauth2 import SpotifyOAuth
import os
import sys
import user
currentDir = os.getcwd()

sys.path.append(currentDir + '/Backend')  # Add the parent directory to the Python path
from User import User # Now you can import the User class

lines = []
with open(currentDir + '\\Testing\\' + 'ClientData.txt', 'r') as file:
    for line in file:
        lines.append(line.strip())

client_id, client_secret, redirect_uri = lines

# Define your desired scope (e.g., 'user-library-read' for access to a user's library)
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

# Create a SpotifyOAuth instance with the necessary parameters
sp_oauth = SpotifyOAuth(client_id=client_id, 
                        client_secret=client_secret, 
                        redirect_uri=redirect_uri, 
                        scope=scope,
                        cache_path = currentDir + '\\Testing\\' + 'TokenCache')

# Check if cached token exists and is still valid
token_info = sp_oauth.get_cached_token()

if not token_info:
    # If no cached token, request authorization from the user
    auth_url = sp_oauth.get_authorize_url()
    print(f'Please visit this URL to authorize your application: {auth_url}')
    response = input('Enter the URL you were redirected to: ')
    code = sp_oauth.parse_response_code(response)
    token_info = sp_oauth.get_access_token(code)

# Create a Spotify client using the obtained access token
sp = spotipy.Spotify(auth=token_info['access_token'])

# When the access token expires, use the refresh token to obtain a new one
if sp_oauth.is_token_expired(token_info):
    token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
    sp = spotipy.Spotify(auth=token_info['access_token'])

testUser = User(spotify_user=sp)
printString = ""
verbose = True

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
