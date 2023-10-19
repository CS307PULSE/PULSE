import spotipy
import multiprocessing
import time
import User
import json
from Exceptions import ErrorHandler

class Stats:
    def __init__(self,
                 recent_history=None,
                 top_songs=None,
                 top_artists=None,
                 followed_artists=None,
                 saved_songs=None,
                 saved_albums=None,
                 saved_playlists=None):
        self.recent_history = recent_history            # Array of type PlayHistory
        self.top_songs = top_songs                      # [Array of type Track, Array of type Track, Array of type Track] 
        self.top_artists = top_artists                  # [Array of type Artist, Array of type Artist, Array of type Artist] 
        self.followed_artists = followed_artists        # Array of type Artist
        self.saved_songs = saved_songs                  # Array of type Track
        self.saved_albums = saved_albums                # Array of type Album
        self.saved_playlists = saved_playlists          # Array of type Playlists

    def advanced_stats_import(self, filepath):
        song_data = {}  # Dictionary to store song data

        with open(filepath, 'r', encoding='utf-8') as file:
            data = json.load(file)
                
            for stream in data:
                try:
                    track_name = stream.get("master_metadata_track_name", "")               # Name of track
                    artist_name = stream.get("master_metadata_album_artist_name", "")       # Name of artist
                    album_name = stream.get("master_metadata_album_album_name", "")         # Name of album
                    track_uri = stream.get("spotify_track_uri", "")                         # A Spotify URI, uniquely identifying the track in the form of “spotify:track:<base-62 string>”
                    ms_played = stream.get("ms_played", 0)                                  # Millisonds stream was played
                    reason_start = stream.get("reason_start", "")                           # "trackend" reason song was started
                    reason_end = stream.get("reason_end", "")                               # "endplay" reason song was ended
                    country = stream.get("conn_country", "")                                # "SE" country code where user played stream
                    time_stamp = stream.get("ts", "")                                       # "YYY-MM-DD 13:30:30" military time with UTC timestamp
                    platform = stream.get("platform", "")                                   # "Android OS", "Google Chromecast"
                    did_shuffle = stream.get("shuffle", False)                              # Boolean for if shuffle was on while streaming
                    did_skip = stream.get("skipped", False)                                 # Boolean indicating if user skipped to next track
                    episode_name = stream.get("episode_name", "")                           # Name of episode of podcast
                    show_name = stream.get("episode_show_name", "")                         # Name of show of podcast
                    episode_uri = stream.get("spotify_episode_uri", "")                     # A Spotify Episode URI, uniquely identifying the podcast episode in the form of “spotify:episode:<base-62 string>”

                    if track_name is not None:
                        if track_name not in song_data:
                            song_data[track_name] = {
                                "artist_name": artist_name,
                                "album_name": album_name,
                                "track_uri": track_uri,
                                "ms_played": ms_played,
                                "reason_start": reason_start,
                                "reason_end": reason_end,
                                "country": country,
                                "time_stamp": time_stamp,
                                "platform": platform,
                                "did_shuffle": did_shuffle,
                                "did_skip": did_skip,
                                "episode_name": episode_name,
                                "show_name": show_name,
                                "episode_uri": episode_uri
                            }
                        else:
                            song_data[track_name]["ms_played"] += ms_played
                    else:
                        if episode_name not in song_data:
                            song_data[episode_name] = {
                                "artist_name": artist_name,
                                "album_name": album_name,
                                "track_uri": track_uri,
                                "ms_played": ms_played,
                                "reason_start": reason_start,
                                "reason_end": reason_end,
                                "country": country,
                                "time_stamp": time_stamp,
                                "platform": platform,
                                "did_shuffle": did_shuffle,
                                "did_skip": did_skip,
                                "episode_name": episode_name,
                                "show_name": show_name,
                                "episode_uri": episode_uri
                            }
                        else:
                            song_data[episode_name]["ms_played"] += ms_played
                except json.JSONDecodeError:
                    pass

        # Prepare the JSON response
        response_data = {
            "total_songs": len(song_data),
            "songs": song_data
        }

        return json.dumps(response_data, indent=4)  # Return a nicely formatted JSON string






