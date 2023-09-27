from Icon import Icon
from Playlist import Playlist
from Stats import Stats
from enum import Enum

class Theme(Enum):
    DARK = 0
    LIGHT = 1

class User:
    def __init__(self, 
                 displayName="",
                 loginToken="", 
                 userID="", 
                 icon=None, 
                 friendsList=None, 
                 playlists=None, 
                 theme=Theme.DARK, 
                 AllStats=None, 
                 highScores=None, 
                 recommendationParams=None):
        self.displayName = displayName                                                                  # String
        self.loginToken = loginToken                                                                    # String
        self.userID = userID                                                                            # String
        self.icon = icon                                                                                # Icon
        self.friendsList = friendsList if friendsList is not None else []                               # Array of userID Strings
        self.playlists = playlists if playlists is not None else []                                     # Array of Playlists
        self.theme = theme                                                                              # Theme
        self.AllStats = AllStats if AllStats is not None else {}                                        # Dict<Key:String,Value:Stats>
        self.highScores = highScores if highScores is not None else []                                  # Array of Int
        self.recommendationParams= recommendationParams if recommendationParams is not None else []     # Array of Doubles