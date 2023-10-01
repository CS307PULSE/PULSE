from User import User
from Database import DBHandling
from Exceptions import SpotifyLinkingError
import os

def start_server():
    #Allow for client connections with socket
    #login (or register) and pass user object to client?
    user = register_user("HI")
    user.update_spotify_id()
    print(user.display_name)
    print(user.login_token)
    print(user.spotify_id)

    run_tests(user)

    return

def register_user(displayName):
    did_connection_fail = False

    #Connect to api and fetch token and spotifyID
    current_dir = os.getcwd()

    lines = []
    with open(current_dir + '\\Testing\\' + 'ClientData.txt', 'r') as file:
        for line in file:
            lines.append(line.strip())

    client_id, client_secret, redirect_uri = lines
    cache_path = current_dir + '\\Testing\\' + 'TokenCache'

    if did_connection_fail:
        raise SpotifyLinkingError()
    
    new_user = User(displayName)
    new_user.update_access_token(client_id=client_id, 
                                 client_secret=client_secret, 
                                 redirect_uri=redirect_uri, 
                                 cache_path=cache_path)

    DBHandling.store_user_in_DB(new_user)
    return new_user

def login_user(userID):
    return DBHandling.get_user_from_DB(userID)

def run_tests(testUser):
    printString = ""
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

if __name__ == "__main__":
    start_server()