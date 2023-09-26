from Exceptions import SpotifyLinkingError
from Database import DBHandling
from enum import Enum

class Theme(Enum):
    DARK = 0
    LIGHT = 1

class User:
    def __init__(self, spotifyUserID, pulseUsername, isNewUser):
        try:
            if (isNewUser):
                self.token = self.linkSpotify(spotifyUserID)
            else:
                self.token = self.fetchToken(spotifyUserID)
            self.spotifyUserID = spotifyUserID
            self.pulseUsername = pulseUsername

        except Exception as e:
            raise e
        
    def populateBasicInformation(self):
        self.icon = DBHandling.getUserDataFromDB(self.spotifyUserID, "icon")
        self.friends = DBHandling.getUserDataFromDB(self.spotifyUserID, "friends") #Friends will be array of spotifyIDs
        self.playlists = DBHandling.getUserDataFromDB(self.spotifyUserID, "playlists") #Query API for playlists?
        self.theme = DBHandling.getUserDataFromDB(self.spotifyUserID, "theme")

    def linkSpotify(self):
        didConnectionFail = True
        token = ""
        #Connect to api and fetch token
        if didConnectionFail:
            raise SpotifyLinkingError()
        return token
    
    def fetchToken(self):
        token = ""
        return token