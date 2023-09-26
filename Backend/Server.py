from User import User
from Exceptions import UserNotFoundError
from Database import DBHandling

def startServer():
    return

def fetchUsernamefromID(spotifyUserID):
    foundUser = DBHandling.getUserDataFromDB(spotifyUserID, "username")
    if foundUser is None:
        raise UserNotFoundError()
    return foundUser

def registerUser(spotifyUserID, pulseUsername):
    newUser = User(spotifyUserID, pulseUsername, True)
    DBHandling.storeUserInDB(newUser)

if __name__ == "__main__":
    startServer()