class SpotifyLinkingError(Exception):
    def __init__(self, message="Error linking Spotify!"):
        self.message = message
        super().__init__(self.message)

class UserNotFoundError(Exception):
    def __init__(self, message="User doesn't exist!"):
        self.message = message
        super().__init__(self.message)