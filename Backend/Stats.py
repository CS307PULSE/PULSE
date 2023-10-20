import spotipy
import multiprocessing
import time
import User
import json
import math
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

    def advanced_stats_import(self, filepath, sp):

        ADVANCED_STATS_DATA = {
            "Number of Streams"                 :   0,
            "Number of Minutes"                 :   0,
            "Average Percentage of Streams"     :   0,
            "Time of Day Breakdown"             :   [0, 0, 0],
            "Tracks"                            :   {},
            "Artists"                           :   {},
            "Albums"                            :   {},
            "Yearly"                            :   {}
        }

        with open(filepath, 'r', encoding='utf-8') as file:
            data = json.load(file)
                
            for stream in data:
                try:
                    song_name = stream.get("master_metadata_track_name", "")                # Name of track
                    artist_name = stream.get("master_metadata_album_artist_name", "")       # Name of artist
                    album_name = stream.get("master_metadata_album_album_name", "")         # Name of album
                    song_uri = stream.get("spotify_track_uri", "")                          # A Spotify URI, uniquely identifying the track in the form of “spotify:track:<base-62 string>”
                    ms_played = stream.get("ms_played", 0)                                  # Millisonds stream was played
                    #No longer use: reason_start = stream.get("reason_start", "")           # "trackend" reason song was started
                    #No longer use: reason_end = stream.get("reason_end", "")               # "endplay" reason song was ended
                    country = stream.get("conn_country", "")                                # "SE" country code where user played stream
                    time_stamp = stream.get("ts", "")                                       # "YYY-MM-DD 13:30:30" military time with UTC timestamp
                    #No longer use: platform = stream.get("platform", "")                   # "Android OS", "Google Chromecast"
                    #No longer use: did_shuffle = stream.get("shuffle", False)              # Boolean for if shuffle was on while streaming
                    did_skip = stream.get("skipped", False)                                 # Boolean indicating if user skipped to next track
                    episode_name = stream.get("episode_name", "")                           # Name of episode of podcast
                    show_name = stream.get("episode_show_name", "")                         # Name of show of podcast
                    episode_uri = stream.get("spotify_episode_uri", "")                     # A Spotify Episode URI, uniquely identifying the podcast episode in the form of “spotify:episode:<base-62 string>”

                    if song_uri is not None:
                        track_uri = song_uri
                        track_name = song_name
                    else:
                        track_uri = episode_uri
                        track_name = show_name + ":" + episode_name

                    #GET TRACK INFO WITH API
                    ms_track_length = 60000*5
                    artist_uri = ""
                    artist_name = ""
                    album_uri = ""
                    album_name = ""

                    time_of_day_index = self.get_time_of_day_index(time_stamp, country)
                    month = self.get_month(time_stamp)
                    year = self.get_year(time_stamp)
                    is_stream = self.is_full_stream(ms_played, ms_track_length)

                    # UPDATE ALL TIME
                    if is_stream: 
                        ADVANCED_STATS_DATA["Number of Streams"] += 1
                        ADVANCED_STATS_DATA["Average Percentage of Streams"] += ms_played / ms_track_length
                    ADVANCED_STATS_DATA["Number of Minutes"] += (ms_played / 1000) / 60
                    ADVANCED_STATS_DATA["Time of Day Breakdown"][time_of_day_index] += ms_played

                    # Update Tracks
                    if track_uri not in ADVANCED_STATS_DATA["Tracks"]:
                        ADVANCED_STATS_DATA["Tracks"][track_uri] = {
                            "Name"                              :   track_name,
                            "Number of Streams"                 :   0,
                            "Number of Minutes"                 :   0,
                            "Average Percentage of Streams"     :   0,
                            "Skips"                             :   0
                        }
                    
                    if did_skip:
                         ADVANCED_STATS_DATA["Tracks"][track_uri]["Skips"] += 1

                    if is_stream: 
                        ADVANCED_STATS_DATA["Tracks"][track_uri]["Number of Streams"] += 1
                        ADVANCED_STATS_DATA["Tracks"][track_uri]["Average Percentage of Streams"] += ms_played / ms_track_length
                    
                    ADVANCED_STATS_DATA["Tracks"][track_uri]["Number of Minutes"] += (ms_played / 1000) / 60

                    # Update Artists
                    if artist_uri not in ADVANCED_STATS_DATA["Artists"]:
                        ADVANCED_STATS_DATA["Artists"][artist_uri] = {
                            "Name"                              :   artist_name,
                            "Number of Streams"                 :   0,
                            "Number of Minutes"                 :   0,
                            "Average Percentage of Streams"     :   0
                        }

                    if is_stream: 
                        ADVANCED_STATS_DATA["Artists"][artist_uri]["Number of Streams"] += 1
                        ADVANCED_STATS_DATA["Artists"][artist_uri]["Average Percentage of Streams"] += ms_played / ms_track_length
                    
                    ADVANCED_STATS_DATA["Artists"][artist_uri]["Number of Minutes"] += (ms_played / 1000) / 60

                    # Update Artists
                    if album_uri not in ADVANCED_STATS_DATA["Albums"]:
                        ADVANCED_STATS_DATA["Albums"][album_uri] = {
                            "Name"                              :   album_name,
                            "Number of Streams"                 :   0,
                            "Number of Minutes"                 :   0,
                            "Average Percentage of Streams"     :   0
                        }

                    if is_stream: 
                        ADVANCED_STATS_DATA["Albums"][artist_uri]["Number of Streams"] += 1
                        ADVANCED_STATS_DATA["Albums"][artist_uri]["Average Percentage of Streams"] += ms_played / ms_track_length
                    
                    ADVANCED_STATS_DATA["Albums"][artist_uri]["Number of Minutes"] += (ms_played / 1000) / 60





                    # UPDATE YEARLY
                    if year not in ADVANCED_STATS_DATA["Yearly"]:
                        ADVANCED_STATS_DATA["Yearly"][year] = {
                            "Number of Streams"                 :   0,
                            "Number of Minutes"                 :   0,
                            "Average Percentage of Streams"     :   0,
                            "Time of Day Breakdown"             :   [0, 0, 0],
                            "Tracks"                            :   {},
                            "Artists"                           :   {},
                            "Albums"                            :   {},
                            "Monthly"                           :   self.initialize_monthly()
                        }

                    if is_stream: 
                        ADVANCED_STATS_DATA["Yearly"][year]["Number of Streams"] += 1
                        ADVANCED_STATS_DATA["Yearly"][year]["Average Percentage of Streams"] += ms_played / ms_track_length
                    ADVANCED_STATS_DATA["Yearly"][year]["Number of Minutes"] += (ms_played / 1000) / 60
                    ADVANCED_STATS_DATA["Yearly"][year]["Time of Day Breakdown"][time_of_day_index] += ms_played

                    # Update Tracks
                    if track_uri not in ADVANCED_STATS_DATA["Yearly"][year]["Tracks"]:
                        ADVANCED_STATS_DATA["Yearly"][year]["Tracks"][track_uri] = {
                            "Name"                              :   track_name,
                            "Number of Streams"                 :   0,
                            "Number of Minutes"                 :   0,
                            "Average Percentage of Streams"     :   0,
                            "Skips"                             :   0
                        }
                    
                    if did_skip:
                         ADVANCED_STATS_DATA["Yearly"][year]["Tracks"][track_uri]["Skips"] += 1

                    if is_stream: 
                        ADVANCED_STATS_DATA["Yearly"][year]["Tracks"][track_uri]["Number of Streams"] += 1
                        ADVANCED_STATS_DATA["Yearly"][year]["Tracks"][track_uri]["Average Percentage of Streams"] += ms_played / ms_track_length
                    
                    ADVANCED_STATS_DATA["Yearly"][year]["Tracks"][track_uri]["Number of Minutes"] += (ms_played / 1000) / 60

                    # Update Artists
                    if artist_uri not in ADVANCED_STATS_DATA["Yearly"][year]["Artists"]:
                        ADVANCED_STATS_DATA["Yearly"][year]["Artists"][artist_uri] = {
                            "Name"                              :   artist_name,
                            "Number of Streams"                 :   0,
                            "Number of Minutes"                 :   0,
                            "Average Percentage of Streams"     :   0
                        }

                    if is_stream: 
                        ADVANCED_STATS_DATA["Yearly"][year]["Artists"][artist_uri]["Number of Streams"] += 1
                        ADVANCED_STATS_DATA["Yearly"][year]["Artists"][artist_uri]["Average Percentage of Streams"] += ms_played / ms_track_length
                    
                    ADVANCED_STATS_DATA["Yearly"][year]["Artists"][artist_uri]["Number of Minutes"] += (ms_played / 1000) / 60

                    # Update Artists
                    if album_uri not in ADVANCED_STATS_DATA["Yearly"][year]["Albums"]:
                        ADVANCED_STATS_DATA["Yearly"][year]["Albums"][album_uri] = {
                            "Name"                              :   album_name,
                            "Number of Streams"                 :   0,
                            "Number of Minutes"                 :   0,
                            "Average Percentage of Streams"     :   0
                        }

                    if is_stream: 
                        ADVANCED_STATS_DATA["Yearly"][year]["Albums"][artist_uri]["Number of Streams"] += 1
                        ADVANCED_STATS_DATA["Yearly"][year]["Albums"][artist_uri]["Average Percentage of Streams"] += ms_played / ms_track_length
                    
                    ADVANCED_STATS_DATA["Yearly"][year]["Albums"][artist_uri]["Number of Minutes"] += (ms_played / 1000) / 60





                    # UPDATE MONTHLY
                    if is_stream: 
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Number of Streams"] += 1
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Average Percentage of Streams"] += ms_played / ms_track_length
                    ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Number of Minutes"] += (ms_played / 1000) / 60
                    ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Time of Day Breakdown"][time_of_day_index] += ms_played

                    # Update Tracks
                    if track_uri not in ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Tracks"]:
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Tracks"][track_uri] = {
                            "Name"                              :   track_name,
                            "Number of Streams"                 :   0,
                            "Number of Minutes"                 :   0,
                            "Average Percentage of Streams"     :   0,
                            "Skips"                             :   0
                        }
                    
                    if did_skip:
                         ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Tracks"][track_uri]["Skips"] += 1

                    if is_stream: 
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Tracks"][track_uri]["Number of Streams"] += 1
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Tracks"][track_uri]["Average Percentage of Streams"] += ms_played / ms_track_length
                    
                    ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Tracks"][track_uri]["Number of Minutes"] += (ms_played / 1000) / 60

                    # Update Artists
                    if artist_uri not in ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Artists"]:
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Artists"][artist_uri] = {
                            "Name"                              :   artist_name,
                            "Number of Streams"                 :   0,
                            "Number of Minutes"                 :   0,
                            "Average Percentage of Streams"     :   0
                        }

                    if is_stream: 
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Artists"][artist_uri]["Number of Streams"] += 1
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Artists"][artist_uri]["Average Percentage of Streams"] += ms_played / ms_track_length
                    
                    ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Artists"][artist_uri]["Number of Minutes"] += (ms_played / 1000) / 60

                    # Update Artists
                    if album_uri not in ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Albums"]:
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Albums"][album_uri] = {
                            "Name"                              :   album_name,
                            "Number of Streams"                 :   0,
                            "Number of Minutes"                 :   0,
                            "Average Percentage of Streams"     :   0
                        }

                    if is_stream: 
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Albums"][artist_uri]["Number of Streams"] += 1
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Albums"][artist_uri]["Average Percentage of Streams"] += ms_played / ms_track_length
                    
                    ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Albums"][artist_uri]["Number of Minutes"] += (ms_played / 1000) / 60

                    
                except json.JSONDecodeError:
                    pass

        # Normalize Average Percentage of Streams to be an average and Time of Day Breakdown to be percentages relative to each other
        ADVANCED_STATS_DATA["Average Percentage of Streams"] /= ADVANCED_STATS_DATA["Number of Streams"]
        sum_of_breakdowns = math.sqrt(ADVANCED_STATS_DATA["Time of Day Breakdown"][0]**2 + ADVANCED_STATS_DATA["Time of Day Breakdown"][1]**2 + ADVANCED_STATS_DATA["Time of Day Breakdown"][2]**2)
        ADVANCED_STATS_DATA["Time of Day Breakdown"][0] /= sum_of_breakdowns
        ADVANCED_STATS_DATA["Time of Day Breakdown"][1] /= sum_of_breakdowns
        ADVANCED_STATS_DATA["Time of Day Breakdown"][2] /= sum_of_breakdowns
    
        for year in ADVANCED_STATS_DATA["Yearly"]:
            ADVANCED_STATS_DATA["Yearly"][year]["Average Percentage of Streams"] /= ADVANCED_STATS_DATA["Yearly"][year]["Number of Streams"]
            sum_of_breakdowns = math.sqrt(ADVANCED_STATS_DATA["Yearly"][year]["Time of Day Breakdown"][0]**2 + ADVANCED_STATS_DATA["Yearly"][year]["Time of Day Breakdown"][1]**2 + ADVANCED_STATS_DATA["Yearly"][year]["Time of Day Breakdown"][2]**2)
            ADVANCED_STATS_DATA["Yearly"][year]["Time of Day Breakdown"][0] /= sum_of_breakdowns
            ADVANCED_STATS_DATA["Yearly"][year]["Time of Day Breakdown"][1] /= sum_of_breakdowns
            ADVANCED_STATS_DATA["Yearly"][year]["Time of Day Breakdown"][2] /= sum_of_breakdowns

            for month in ADVANCED_STATS_DATA["Yearly"][year]["Monthly"]:
                ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Average Percentage of Streams"] /= ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Number of Streams"]
                sum_of_breakdowns = math.sqrt(ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Time of Day Breakdown"][0]**2 + ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Time of Day Breakdown"][1]**2 + ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Time of Day Breakdown"][2]**2)
                ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Time of Day Breakdown"][0] /= sum_of_breakdowns
                ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Time of Day Breakdown"][1] /= sum_of_breakdowns
                ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Time of Day Breakdown"][2] /= sum_of_breakdowns

        return json.dumps(ADVANCED_STATS_DATA, indent=4)  # Return a nicely formatted JSON string

    def get_time_of_day_index(self, time_stamp, country):
        return 0

    def get_month(self, time_stamp):
        return ""
    
    def get_year(self, time_stamp):
        return ""
    
    def is_full_stream(self, ms_played, ms_track_length):
        if ms_played / ms_track_length > 0.5:
            return True         # Listened to over half the song/podcast
        
        if ms_played > 60000 * 30:
            return True         # Listened to over 30 minutes
        
        if (ms_track_length < 60000 *10 ) and (ms_played > 30000):
            return True         # Track is less than 10 minutes so it's probably a song and user listened to over 30 seconds
        
        return False

    def initialize_monthly(self):
        return {
            "JANUARY" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            },
            "FEBRUARY" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            },
            "MARCH" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            },
            "APRIL" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            },
            "MAY" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            },
            "JUNE" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            },
            "JULY" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            },
            "AUGUST" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            },
            "SEPTEMBER" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            },
            "OCTOBER" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            },
            "NOVEMBER" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            },
            "DECEMBER" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            }
        }

    def advanced_stats_import_test(self, filepath):
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
                    #No longer use: reason_start = stream.get("reason_start", "")                           # "trackend" reason song was started
                    #No longer use: reason_end = stream.get("reason_end", "")                               # "endplay" reason song was ended
                    country = stream.get("conn_country", "")                                # "SE" country code where user played stream
                    time_stamp = stream.get("ts", "")                                       # "YYY-MM-DD 13:30:30" military time with UTC timestamp
                    #No longer use: platform = stream.get("platform", "")                                   # "Android OS", "Google Chromecast"
                    #No longer use: did_shuffle = stream.get("shuffle", False)                              # Boolean for if shuffle was on while streaming
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
                                "country": country,
                                "time_stamp": time_stamp,
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
                                "country": country,
                                "time_stamp": time_stamp,
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






