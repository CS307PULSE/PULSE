class Stats:
    def __init__(self,
                 recent_history=None,
                 top_songs=None,
                 top_artists=None,
                 followed_artists=None,
                 saved_songs=None):
        self.recent_history = recent_history            # Array of type PlayHistory
        self.top_songs = top_songs                      # [Array of type Track, Array of type Track, Array of type Track] 
        self.top_artists = top_artists                  # [Array of type Artist, Array of type Artist, Array of type Artist] 
        self.followed_artists = followed_artists        # Array of type Artist
        self.saved_songs = saved_songs                  # Array of type Track

