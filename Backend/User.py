from Icon import Icon
from Playlist import Playlist
from Stats import Stats
from enum import Enum

class Theme(Enum):
    DARK = 0
    LIGHT = 1

class User:
    def __init__(self, 
                 display_name="",
                 login_token="", 
                 userID="", 
                 spotify_user=None,
                 icon=None, 
                 friends_list=None, 
                 playlists=None, 
                 theme=Theme.DARK, 
                 stats=None, 
                 high_scores=None, 
                 recommendation_params=None):
        self.display_name = display_name                                                                   # String
        self.login_token = login_token                                                                     # String
        self.userID = userID                                                                               # String
        self.spotify_user = spotify_user                                                                   # Spotify User
        self.icon = icon                                                                                   # Icon
        self.friends_list = friends_list if friends_list is not None else []                               # Array of userID Strings
        self.playlists = playlists if playlists is not None else []                                        # Array of Playlists
        self.theme = theme                                                                                 # Theme
        self.stats = stats if stats is not None else Stats()                                               # Stats
        self.high_scores = high_scores if high_scores is not None else []                                  # Array of Int
        self.recommendation_params= recommendation_params if recommendation_params is not None else []     # Array of Doubles

    # Updates list of recent songs with at most 50 objects of type Track
    def updateRecentSongs(self):
        self.stats.recent_songs = self.spotify_user.current_user_recently_played()['items']
    
    # Updates list of followed artists with at most max_artists number of objects of type Artist
    def updateFollowedArtists(self,max_artists=500):
        followed_artists = []

        after = None
        limit = min(50, max_artists)

        while len(followed_artists) < max_artists:
            artists = self.spotify_user.current_user_followed_artists(limit=limit, after=after)['artists']

            after = artists['cursors']['after']

            followed_artists.extend(artists['items'])

            if not artists['items'] or after is None:
                break

        self.stats.followed_artists = followed_artists