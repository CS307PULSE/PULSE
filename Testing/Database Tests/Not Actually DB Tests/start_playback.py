import json 
import spotipy 
import webbrowser 
  
username = "username"
clientID = "CLIENTID"
clientSecret = "CLIENTSECRET"
redirect_uri = "http://google.com/callback/"
oauth_object = spotipy.SpotifyOAuth(clientID, clientSecret, redirect_uri) 
token_dict = oauth_object.get_access_token() 
token = token_dict["access_token"] 
spotifyObject = spotipy.Spotify(auth=token) 
user_name = spotifyObject.current_user() 
  
# To print the JSON response from  
# browser in a readable format. 
# optional can be removed 
print(json.dumps(user_name, sort_keys=True, indent=4)) 
  
while True: 
    print("Welcome to the project, " + user_name['display_name']) 
    print("0 - Exit the console") 
    print("1 - Search for a Song") 
    user_input = int(input("Enter Your Choice: ")) 
    if user_input == 1: 
        search_song = input("Enter the song name: ") 
        results = spotifyObject.search(search_song, 1, 0, "track") 
        songs_dict = results['tracks'] 
        song_items = songs_dict['items'] 
        song = song_items[0]['external_urls']['spotify'] 
        webbrowser.open(song) 
        print('Song has opened in your browser.') 
    elif user_input == 0: 
        print("Good Bye, Have a great day!") 
        break
    else: 
        print("Please enter valid user-input.") 


"""
def play_song(uri):
    sp.start_playback(uris=[uri])

song_uri = "2rBHnIxbhkMGLpqmsNX91M?si=f52d21e4f1ac4040"  # Replace with the URI of the song you want to play
play_song(song_uri)
"""