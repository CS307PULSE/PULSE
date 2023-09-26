from User import User
from Database import DBHandling
from Exceptions import SpotifyLinkingError

def startServer():
    #Allow for client connections with socket
    #login (or register) and pass user object to client?
    return

def registerUser(displayName):
    didConnectionFail = False
    #Connect to api and fetch token and spotifyID
    token = ""
    userID = ""
    if didConnectionFail:
        raise SpotifyLinkingError()
    newUser = User(displayName, token, userID)
    DBHandling.storeUserInDB(newUser)

def loginUser(userID):
    user = DBHandling.getUserFromDB(userID)

if __name__ == "__main__":
    startServer()