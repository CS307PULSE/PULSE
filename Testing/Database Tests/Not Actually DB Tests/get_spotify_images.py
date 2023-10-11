import requests

# Define your Spotify API credentials
CLIENT_ID = '628df47947a044348edbe22144cdabb7'
CLIENT_SECRET = 'e29d151e153a4a449aaee17e64bb2703'

# Define the base URL for the Spotify API
BASE_URL = 'https://api.spotify.com/v1/'

# Function to get an artist's images
def get_artist_images(artist_name, access_token):
    # Search for the artist by name
    search_url = BASE_URL + 'search'
    search_params = {
        'q': artist_name,
        'type': 'artist',
    }
    headers = {
        'Authorization': f'Bearer {access_token}',
    }
    search_response = requests.get(search_url, params=search_params, headers=headers)
    search_data = search_response.json()

    # Check if there are artists in the response
    if 'artists' in search_data and 'items' in search_data['artists']:
        artists = search_data['artists']['items']
        if artists:
            artist = artists[0]  # Get the first artist
            artist_id = artist['id']

            # Get the images associated with the artist
            artist_url = BASE_URL + f'artists/{artist_id}'
            artist_response = requests.get(artist_url, headers=headers)
            artist_data = artist_response.json()

            # Print the artist's images
            images = artist_data.get('images', [])
            for i, image in enumerate(images):
                print(f'Image {i + 1}: {image["url"]}')
        else:
            print(f'Artist "{artist_name}" not found on Spotify.')
    else:
        print('Error searching for the artist.')

# Function to get the cover art of a song
def get_song_cover_art(song_name, access_token):
    # Search for the track by name
    search_url = BASE_URL + 'search'
    search_params = {
        'q': song_name,
        'type': 'track',
    }
    headers = {
        'Authorization': f'Bearer {access_token}',
    }
    search_response = requests.get(search_url, params=search_params, headers=headers)
    search_data = search_response.json()

    # Check if there are tracks in the response
    if 'tracks' in search_data and 'items' in search_data['tracks']:
        tracks = search_data['tracks']['items']
        if tracks:
            track = tracks[0]  # Get the first track
            cover_art = track['album']['images'][0]['url']

            print(f'Cover Art for "{song_name}": {cover_art}')
        else:
            print(f'Song "{song_name}" not found on Spotify.')
    else:
        print('Error searching for the song.')

        # Function to get the cover art of a playlist
def get_playlist_cover_art(playlist_id, access_token):
    # Get the playlist's details
    playlist_url = BASE_URL + f'playlists/{playlist_id}'
    headers = {
        'Authorization': f'Bearer {access_token}',
    }
    playlist_response = requests.get(playlist_url, headers=headers)
    playlist_data = playlist_response.json()

    # Check if the playlist data contains cover art
    if 'images' in playlist_data:
        cover_art = playlist_data['images'][0]['url']
        print(f'Cover Art for Playlist "{playlist_data["name"]}": {cover_art}')
    else:
        print(f'Playlist "{playlist_id}" not found or does not have cover art.')

if __name__ == '__main__':
    artist_name = 'Artist Name'  # Replace with the artist's name
    song_name = 'Song Name'  # Replace with the song's name
    playlist_id = 'YourPlaylistID'  # Replace with the playlist ID

    # Authenticate with Spotify API
    auth_url = 'https://accounts.spotify.com/api/token'
    auth_data = {
        'grant_type': 'client_credentials',
    }
    auth_response = requests.post(auth_url, auth=(CLIENT_ID, CLIENT_SECRET), data=auth_data)
    auth_response_data = auth_response.json()
    access_token = auth_response_data['access_token']

    get_artist_images('The Rolling Stones', access_token)
    #get_song_cover_art('HEALMODE', access_token)
    #get_playlist_cover_art('5753g6sX7ypz3HD9plew7R?si=5581bb9ff89546d4', access_token)