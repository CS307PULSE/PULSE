import spotipy # pip install spotipy
from spotipy.oauth2 import SpotifyOAuth
import os
currentDir = os.getcwd()

lines = []
with open(currentDir + '\\Testing\\' + 'testdata.txt', 'r') as file:
    for line in file:
        lines.append(line.strip())

client_id, client_secret, redirect_uri = lines
print(client_id)
print(client_secret)
print(redirect_uri)

# Create a Spotify OAuth2 object
sp_oauth = SpotifyOAuth(client_id=client_id, client_secret=client_secret, redirect_uri=redirect_uri, scope="user-read-recently-played")

# Authenticate with Spotify (opens a browser window for login)
token_info = sp_oauth.get_cached_token()

if not token_info:
    auth_url = sp_oauth.get_authorize_url()
    print(f"Please visit this URL to authorize your application: {auth_url}")
    response = input("Enter the URL you were redirected to: ")
    token_info = sp_oauth.get_access_token(response)

if token_info:
    # Create a Spotify client
    sp = spotipy.Spotify(auth=token_info['access_token'])

    # Get the user's most recently played tracks
    recently_played = sp.current_user_recently_played()
    
    # Print the most recently played tracks
    print("Your most recently played songs:")
    for track in recently_played['items']:
        print(f"{track['track']['name']} by {track['track']['artists'][0]['name']}")
else:
    print("Failed to authenticate with Spotify.")