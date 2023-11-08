import spotipy

class ErrorHandler:
    def handle_error(e):
        print(f"Error: {e}")
        if isinstance(e, spotipy.exceptions.SpotifyException):

            if (e.http_status == 401):
                raise TokenExpiredError
        
class BadResponseError(Exception):
    def __init__(self, status):
        self.status = status
        super().__init__(f"Bad response status: {status}")
        
class SpotifyLinkingError(Exception):
    def __init__(self, message="Error linking Spotify!"):
        self.message = message
        super().__init__(self.message)

class UserNotFoundError(Exception):
    def __init__(self, message="User doesn't exist!"):
        self.message = message
        super().__init__(self.message)

class TokenNotStoredError(Exception):
    def __init__(self, message="Token isn't stored!"):
        self.message = message
        super().__init__(self.message)

class TokenExpiredError(Exception):
    def __init__(self, message="Token expired!"):
        self.message = message
        super().__init__(self.message)

class SpotifyExpiredError(Exception):
    def __init__(self, message="Can't refresh token!"):
        self.message = message
        super().__init__(self.message)