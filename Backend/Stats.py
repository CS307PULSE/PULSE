import spotipy
import multiprocessing
import time
import User
import json
from Exceptions import ErrorHandler
from datetime import datetime
import requests
import pytz

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
        
        self.hit_rate_limit = False
    

    # A mapping of Spotify country codes to time zones
    country_timezone_mapping = {
        'AD': 'Europe/Andorra',
        'AE': 'Asia/Dubai',
        'AF': 'Asia/Kabul',
        'AG': 'America/Antigua',
        'AI': 'America/Anguilla',
        'AL': 'Europe/Tirane',
        'AM': 'Asia/Yerevan',
        'AO': 'Africa/Luanda',
        'AR': 'America/Argentina/Buenos_Aires',
        'AT': 'Europe/Vienna',
        'AU': 'Australia/Sydney',
        'AW': 'America/Aruba',
        'AZ': 'Asia/Baku',
        'BA': 'Europe/Sarajevo',
        'BB': 'America/Barbados',
        'BD': 'Asia/Dhaka',
        'BE': 'Europe/Brussels',
        'BF': 'Africa/Ouagadougou',
        'BG': 'Europe/Sofia',
        'BH': 'Asia/Bahrain',
        'BI': 'Africa/Bujumbura',
        'BJ': 'Africa/Porto-Novo',
        'BM': 'Atlantic/Bermuda',
        'BN': 'Asia/Brunei',
        'BO': 'America/La_Paz',
        'BR': 'America/Sao_Paulo',
        'BS': 'America/Nassau',
        'BT': 'Asia/Thimphu',
        'BW': 'Africa/Gaborone',
        'BY': 'Europe/Minsk',
        'BZ': 'America/Belize',
        'CA': 'America/Toronto',
        'CD': 'Africa/Kinshasa',
        'CF': 'Africa/Bangui',
        'CG': 'Africa/Brazzaville',
        'CH': 'Europe/Zurich',
        'CI': 'Africa/Abidjan',
        'CL': 'America/Santiago',
        'CM': 'Africa/Douala',
        'CN': 'Asia/Shanghai',
        'CO': 'America/Bogota',
        'CR': 'America/Costa_Rica',
        'CU': 'America/Havana',
        'CV': 'Atlantic/Cape_Verde',
        'CY': 'Asia/Nicosia',
        'CZ': 'Europe/Prague',
        'DE': 'Europe/Berlin',
        'DJ': 'Africa/Djibouti',
        'DK': 'Europe/Copenhagen',
        'DM': 'America/Dominica',
        'DO': 'America/Santo_Domingo',
        'DZ': 'Africa/Algiers',
        'EC': 'America/Guayaquil',
        'EE': 'Europe/Tallinn',
        'EG': 'Africa/Cairo',
        'EH': 'Africa/El_Aaiun',
        'ER': 'Africa/Asmara',
        'ES': 'Europe/Madrid',
        'ET': 'Africa/Addis_Ababa',
        'FI': 'Europe/Helsinki',
        'FJ': 'Pacific/Fiji',
        'FK': 'Atlantic/Stanley',
        'FM': 'Pacific/Chuuk',
        'FO': 'Atlantic/Faroe',
        'FR': 'Europe/Paris',
        'GA': 'Africa/Libreville',
        'GB': 'Europe/London',
        'GD': 'America/Grenada',
        'GE': 'Asia/Tbilisi',
        'GF': 'America/Cayenne',
        'GG': 'Europe/Guernsey',
        'GH': 'Africa/Accra',
        'GI': 'Europe/Gibraltar',
        'GL': 'America/Godthab',
        'GM': 'Africa/Banjul',
        'GN': 'Africa/Conakry',
        'GP': 'America/Guadeloupe',
        'GQ': 'Africa/Malabo',
        'GR': 'Europe/Athens',
        'GS': 'Atlantic/South_Georgia',
        'GT': 'America/Guatemala',
        'GU': 'Pacific/Guam',
        'GW': 'Africa/Bissau',
        'GY': 'America/Guyana',
        'HK': 'Asia/Hong_Kong',
        'HN': 'America/Tegucigalpa',
        'HR': 'Europe/Zagreb',
        'HT': 'America/Port-au-Prince',
        'HU': 'Europe/Budapest',
        'ID': 'Asia/Jakarta',
        'IE': 'Europe/Dublin',
        'IL': 'Asia/Jerusalem',
        'IM': 'Europe/Isle_of_Man',
        'IN': 'Asia/Kolkata',
        'IO': 'Indian/Chagos',
        'IQ': 'Asia/Baghdad',
        'IR': 'Asia/Tehran',
        'IS': 'Atlantic/Reykjavik',
        'IT': 'Europe/Rome',
        'JE': 'Europe/Jersey',
        'JM': 'America/Jamaica',
        'JO': 'Asia/Amman',
        'JP': 'Asia/Tokyo',
        'KE': 'Africa/Nairobi',
        'KG': 'Asia/Bishkek',
        'KH': 'Asia/Phnom_Penh',
        'KI': 'Pacific/Tarawa',
        'KM': 'Indian/Comoro',
        'KN': 'America/St_Kitts',
        'KP': 'Asia/Pyongyang',
        'KR': 'Asia/Seoul',
        'KW': 'Asia/Kuwait',
        'KY': 'America/Cayman',
        'KZ': 'Asia/Almaty',
        'LA': 'Asia/Vientiane',
        'LB': 'Asia/Beirut',
        'LC': 'America/St_Lucia',
        'LI': 'Europe/Vaduz',
        'LK': 'Asia/Colombo',
        'LR': 'Africa/Monrovia',
        'LS': 'Africa/Maseru',
        'LT': 'Europe/Vilnius',
        'LU': 'Europe/Luxembourg',
        'LV': 'Europe/Riga',
        'LY': 'Africa/Tripoli',
        'MA': 'Africa/Casablanca',
        'MC': 'Europe/Monaco',
        'MD': 'Europe/Chisinau',
        'ME': 'Europe/Podgorica',
        'MF': 'America/Marigot',
        'MG': 'Indian/Antananarivo',
        'MH': 'Pacific/Majuro',
        'MK': 'Europe/Skopje',
        'ML': 'Africa/Bamako',
        'MM': 'Asia/Yangon',
        'MN': 'Asia/Ulaanbaatar',
        'MO': 'Asia/Macau',
        'MP': 'Pacific/Saipan',
        'MQ': 'America/Martinique',
        'MR': 'Africa/Nouakchott',
        'MS': 'America/Montserrat',
        'MT': 'Europe/Malta',
        'MU': 'Indian/Mauritius',
        'MV': 'Indian/Maldives',
        'MW': 'Africa/Blantyre',
        'MX': 'America/Mexico_City',
        'MY': 'Asia/Kuala_Lumpur',
        'MZ': 'Africa/Maputo',
        'NA': 'Africa/Windhoek',
        'NC': 'Pacific/Noumea',
        'NE': 'Africa/Niamey',
        'NF': 'Pacific/Norfolk',
        'NG': 'Africa/Lagos',
        'NI': 'America/Managua',
        'NL': 'Europe/Amsterdam',
        'NO': 'Europe/Oslo',
        'NP': 'Asia/Kathmandu',
        'NR': 'Pacific/Nauru',
        'NU': 'Pacific/Niue',
        'NZ': 'Pacific/Auckland',
        'OM': 'Asia/Muscat',
        'PA': 'America/Panama',
        'PE': 'America/Lima',
        'PF': 'Pacific/Tahiti',
        'PG': 'Pacific/Port_Moresby',
        'PH': 'Asia/Manila',
        'PK': 'Asia/Karachi',
        'PL': 'Europe/Warsaw',
        'PM': 'America/Miquelon',
        'PN': 'Pacific/Pitcairn',
        'PR': 'America/Puerto_Rico',
        'PS': 'Asia/Gaza',
        'PT': 'Europe/Lisbon',
        'PW': 'Pacific/Palau',
        'PY': 'America/Asuncion',
        'QA': 'Asia/Qatar',
        'RE': 'Indian/Reunion',
        'RO': 'Europe/Bucharest',
        'RS': 'Europe/Belgrade',
        'RU': 'Europe/Moscow',
        'RW': 'Africa/Kigali',
        'SA': 'Asia/Riyadh',
        'SB': 'Pacific/Guadalcanal',
        'SC': 'Indian/Mahe',
        'SD': 'Africa/Khartoum',
        'SE': 'Europe/Stockholm',
        'SG': 'Asia/Singapore',
        'SH': 'Atlantic/St_Helena',
        'SI': 'Europe/Ljubljana',
        'SJ': 'Arctic/Longyearbyen',
        'SK': 'Europe/Bratislava',
        'SL': 'Africa/Freetown',
        'SM': 'Europe/San_Marino',
        'SN': 'Africa/Dakar',
        'SO': 'Africa/Mogadishu',
        'SR': 'America/Paramaribo',
        'SS': 'Africa/Juba',
        'ST': 'Africa/Sao_Tome',
        'SV': 'America/El_Salvador',
        'SX': 'America/Lower_Princes',
        'SY': 'Asia/Damascus',
        'SZ': 'Africa/Mbabane',
        'TC': 'America/Grand_Turk',
        'TD': 'Africa/Ndjamena',
        'TF': 'Indian/Kerguelen',
        'TG': 'Africa/Lome',
        'TH': 'Asia/Bangkok',
        'TJ': 'Asia/Dushanbe',
        'TK': 'Pacific/Fakaofo',
        'TL': 'Asia/Dili',
        'TM': 'Asia/Ashgabat',
        'TN': 'Africa/Tunis',
        'TO': 'Pacific/Tongatapu',
        'TR': 'Europe/Istanbul',
        'TT': 'America/Port_of_Spain',
        'TV': 'Pacific/Funafuti',
        'TW': 'Asia/Taipei',
        'TZ': 'Africa/Dar_es_Salaam',
        'UA': 'Europe/Kiev',
        'UG': 'Africa/Kampala',
        'UM': 'Pacific/Wake',
        'US': 'America/New_York',
        'UY': 'America/Montevideo',
        'UZ': 'Asia/Tashkent',
        'VA': 'Europe/Vatican',
        'VC': 'America/St_Vincent',
        'VE': 'America/Caracas',
        'VG': 'America/Tortola',
        'VI': 'America/St_Thomas',
        'VN': 'Asia/Ho_Chi_Minh',
        'VU': 'Pacific/Efate',
        'WF': 'Pacific/Wallis',
        'WS': 'Pacific/Apia',
        'YE': 'Asia/Aden',
        'YT': 'Indian/Mayotte',
        'ZA': 'Africa/Johannesburg',
        'ZM': 'Africa/Lusaka',
        'ZW': 'Africa/Harare',
    }

    def advanced_stats_import(self, filepath, token, more_data=False, ADVANCED_STATS_DATA=None, OVERRIDE=False):
        SONG_IDS = []
        EPISODE_IDS = []

        with open(filepath, 'r', encoding='utf-8') as file:
            data = json.load(file)
                
            for stream in data:
                try:
                    song_uri = stream.get("spotify_track_uri", "")                          
                    episode_uri = stream.get("spotify_episode_uri", "")
                    if song_uri is not None:
                        SONG_IDS.append(song_uri.split(":")[-1])
                    if episode_uri is not None:
                        EPISODE_IDS.append(episode_uri.split(":")[-1])
                except Exception as e:
                    print(f"Exception {e}")
    
        SONGS_TO_API_DATA_MAP = self.populate_song_data_map(uris=list(set(SONG_IDS)), token=token, more_data=more_data)
        EPISODES_TO_API_DATA_MAP = self.populate_episode_data_map(uris=list(set(EPISODE_IDS)), token=token, more_data=more_data)

        if (ADVANCED_STATS_DATA is None):
            ADVANCED_STATS_DATA = {
                "Metadata"                          :   {
                    "Number of Files"               :   0,
                    "Dates Covered"                 :   {},
                    "Files"                         :   {}
                },
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {},
                "Genres"                            :   {},
                "Eras"                              :   {},
                "Yearly"                            :   {}
            }
        
        else:
            # De-normalize Time of Day Breakdown to be in units of ms
            ms_weight = ADVANCED_STATS_DATA["Number of Minutes"] * 60 * 1000 / 100
            ADVANCED_STATS_DATA["Time of Day Breakdown"][0] *= ms_weight
            ADVANCED_STATS_DATA["Time of Day Breakdown"][1] *= ms_weight
            ADVANCED_STATS_DATA["Time of Day Breakdown"][2] *= ms_weight
            ADVANCED_STATS_DATA["Time of Day Breakdown"][3] *= ms_weight
        
            for year in ADVANCED_STATS_DATA["Yearly"]:
                ms_weight = ADVANCED_STATS_DATA["Yearly"][year]["Number of Minutes"] * 60 * 1000 / 100
                ADVANCED_STATS_DATA["Yearly"][year]["Time of Day Breakdown"][0] *= ms_weight
                ADVANCED_STATS_DATA["Yearly"][year]["Time of Day Breakdown"][1] *= ms_weight
                ADVANCED_STATS_DATA["Yearly"][year]["Time of Day Breakdown"][2] *= ms_weight
                ADVANCED_STATS_DATA["Yearly"][year]["Time of Day Breakdown"][3] *= ms_weight

                for month in ADVANCED_STATS_DATA["Yearly"][year]["Monthly"]:
                    ms_weight = ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Number of Minutes"] * 60 * 1000 / 100
                    ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Time of Day Breakdown"][0] *= ms_weight
                    ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Time of Day Breakdown"][1] *= ms_weight
                    ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Time of Day Breakdown"][2] *= ms_weight
                    ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Time of Day Breakdown"][3] *= ms_weight

        try:
            ADVANCED_STATS_DATA["Metadata"] = self.populate_metadata(filepath=filepath, DATA=ADVANCED_STATS_DATA["Metadata"])
        except Exception as e:
            print(f"{e}")
            print("Overlapping coverage! Please override if you wish to proceed!")
            return ADVANCED_STATS_DATA

        min_stamp = None
        max_stamp = None
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
                    timecode = stream.get("conn_country", "")                               # "SE" country code where user played stream
                    time_stamp = stream.get("ts", "")                                       # "YYY-MM-DD 13:30:30" military time with UTC timestamp
                    #No longer use: platform = stream.get("platform", "")                   # "Android OS", "Google Chromecast"
                    #No longer use: did_shuffle = stream.get("shuffle", False)              # Boolean for if shuffle was on while streaming
                    did_skip = stream.get("skipped", False)                                 # Boolean indicating if user skipped to next track
                    episode_name = stream.get("episode_name", "")                           # Name of episode of podcast
                    show_name = stream.get("episode_show_name", "")                         # Name of show of podcast
                    episode_uri = stream.get("spotify_episode_uri", "")                     # A Spotify Episode URI, uniquely identifying the podcast episode in the form of “spotify:episode:<base-62 string>”

                    stamp = datetime.strptime(time_stamp, '%Y-%m-%dT%H:%M:%SZ')
                    if min_stamp is None:
                        min_stamp = stamp
                    elif min_stamp > stamp:
                        min_stamp = stamp
                    if max_stamp is None:
                        max_stamp = stamp
                    elif max_stamp < stamp:
                        max_stamp = stamp

                    if song_uri is not None:
                        track_uri = song_uri
                        track_data = SONGS_TO_API_DATA_MAP.get(track_uri, {})
                        track_name = song_name
                    elif episode_uri is not None:
                        track_uri = episode_uri
                        track_data = EPISODES_TO_API_DATA_MAP.get(track_uri, {})
                        if show_name is not None and episode_name is not None:
                            track_name = f"{show_name}:{episode_name}"
                        elif show_name is not None:
                            track_name = show_name
                        elif episode_name is not None:
                            track_name = episode_name
                        else:
                            track_name = "Unknown"
                    else:
                        track_uri = "Unknown"
                        track_data = SONGS_TO_API_DATA_MAP.get(track_uri, {})
                        track_name = "Unknown"

                    ms_track_length = track_data.get("ms_track_length", 300000)
                    track_link = track_data.get("track_link", "")
                    artists = track_data.get("artists", [["","",""]])
                    genres = track_data.get("genres", [""])
                    album_uri = track_data.get("album_uri", "")
                    album_name = track_data.get("album_name", "")
                    album_link = track_data.get("album_link", "")
                    release_date = track_data.get("release_date", "")

                    if ms_played > ms_track_length:
                        ms_played = ms_track_length # Weird glitch with stats

                    time_of_day_index = self.get_time_of_day_index(time_stamp, timecode)
                    month = self.get_month(time_stamp)
                    year = self.get_year(time_stamp)
                    is_stream = self.is_full_stream(ms_played, ms_track_length)
                    era = self.get_era(release_date)

                    # UPDATE ALL TIME
                    if is_stream: 
                        ADVANCED_STATS_DATA["Average Percentage of Streams"] = (ADVANCED_STATS_DATA["Average Percentage of Streams"] * ADVANCED_STATS_DATA["Number of Streams"] + ms_played / ms_track_length) / (ADVANCED_STATS_DATA["Number of Streams"] + 1)
                        ADVANCED_STATS_DATA["Number of Streams"] += 1
                    ADVANCED_STATS_DATA["Number of Minutes"] += (ms_played / 1000) / 60
                    ADVANCED_STATS_DATA["Time of Day Breakdown"][time_of_day_index] += ms_played

                    # Update Tracks
                    if track_uri not in ADVANCED_STATS_DATA["Tracks"]:
                        ADVANCED_STATS_DATA["Tracks"][track_uri] = {
                            "Name"                              :   track_name,
                            "Number of Streams"                 :   0,
                            "Number of Minutes"                 :   0,
                            "Average Percentage of Streams"     :   0,
                            "Skips"                             :   0,
                            "Link"                              :   track_link
                        }
                    
                    if did_skip:
                         ADVANCED_STATS_DATA["Tracks"][track_uri]["Skips"] += 1

                    if is_stream:
                        ADVANCED_STATS_DATA["Tracks"][track_uri]["Average Percentage of Streams"] = (ADVANCED_STATS_DATA["Tracks"][track_uri]["Average Percentage of Streams"] * ADVANCED_STATS_DATA["Tracks"][track_uri]["Number of Streams"] + ms_played / ms_track_length) / (ADVANCED_STATS_DATA["Tracks"][track_uri]["Number of Streams"] + 1)
                        ADVANCED_STATS_DATA["Tracks"][track_uri]["Number of Streams"] += 1
                    
                    ADVANCED_STATS_DATA["Tracks"][track_uri]["Number of Minutes"] += (ms_played / 1000) / 60

                    # Update Artists
                    for artist in artists:
                        artist_uri, artist_name, artist_link = artist
                        if artist_uri not in ADVANCED_STATS_DATA["Artists"]:
                            ADVANCED_STATS_DATA["Artists"][artist_uri] = {
                                "Name"                              :   artist_name,
                                "Number of Streams"                 :   0,
                                "Number of Minutes"                 :   0,
                                "Average Percentage of Streams"     :   0,
                                "Link"                              :   artist_link,
                            }

                        if is_stream: 
                            ADVANCED_STATS_DATA["Artists"][artist_uri]["Average Percentage of Streams"] = (ADVANCED_STATS_DATA["Artists"][artist_uri]["Average Percentage of Streams"] * ADVANCED_STATS_DATA["Artists"][artist_uri]["Number of Streams"] + ms_played / ms_track_length) / (ADVANCED_STATS_DATA["Artists"][artist_uri]["Number of Streams"] + 1)
                            ADVANCED_STATS_DATA["Artists"][artist_uri]["Number of Streams"] += 1
                        
                        ADVANCED_STATS_DATA["Artists"][artist_uri]["Number of Minutes"] += (ms_played / 1000) / 60

                    # Update Albums
                    if album_uri not in ADVANCED_STATS_DATA["Albums"]:
                        ADVANCED_STATS_DATA["Albums"][album_uri] = {
                            "Name"                              :   album_name,
                            "Number of Streams"                 :   0,
                            "Number of Minutes"                 :   0,
                            "Average Percentage of Streams"     :   0,
                            "Link"                              :   album_link
                        }

                    if is_stream:
                        ADVANCED_STATS_DATA["Albums"][album_uri]["Average Percentage of Streams"] = (ADVANCED_STATS_DATA["Albums"][album_uri]["Average Percentage of Streams"] * ADVANCED_STATS_DATA["Albums"][album_uri]["Number of Streams"] + ms_played / ms_track_length) / (ADVANCED_STATS_DATA["Albums"][album_uri]["Number of Streams"] + 1)
                        ADVANCED_STATS_DATA["Albums"][album_uri]["Number of Streams"] += 1
                    
                    ADVANCED_STATS_DATA["Albums"][album_uri]["Number of Minutes"] += (ms_played / 1000) / 60
                    
                    # Update Genres
                    for genre in genres:
                        if genre not in ADVANCED_STATS_DATA["Genres"]:
                            ADVANCED_STATS_DATA["Genres"][genre] = {
                                "Number of Streams"                 :   0,
                                "Number of Minutes"                 :   0,
                                "Average Percentage of Streams"     :   0,
                                "Tracks"                            :   []
                            }

                        if is_stream: 
                            ADVANCED_STATS_DATA["Genres"][genre]["Average Percentage of Streams"] = (ADVANCED_STATS_DATA["Genres"][genre]["Average Percentage of Streams"] * ADVANCED_STATS_DATA["Genres"][genre]["Number of Streams"] + ms_played / ms_track_length) / (ADVANCED_STATS_DATA["Genres"][genre]["Number of Streams"] + 1)
                            ADVANCED_STATS_DATA["Genres"][genre]["Number of Streams"] += 1
                        
                        ADVANCED_STATS_DATA["Genres"][genre]["Number of Minutes"] += (ms_played / 1000) / 60
                        if track_name not in ADVANCED_STATS_DATA["Genres"][genre]["Tracks"]: 
                            ADVANCED_STATS_DATA["Genres"][genre]["Tracks"].append(track_name)

                    # Update Eras
                    if era not in ADVANCED_STATS_DATA["Eras"]:
                        ADVANCED_STATS_DATA["Eras"][era] = {
                            "Number of Streams"                 :   0,
                            "Number of Minutes"                 :   0,
                            "Average Percentage of Streams"     :   0,
                            "Tracks"                            :   []
                        }

                    if is_stream:
                        ADVANCED_STATS_DATA["Eras"][era]["Average Percentage of Streams"] = (ADVANCED_STATS_DATA["Eras"][era]["Average Percentage of Streams"] * ADVANCED_STATS_DATA["Eras"][era]["Number of Streams"] + ms_played / ms_track_length) / (ADVANCED_STATS_DATA["Eras"][era]["Number of Streams"] + 1)
                        ADVANCED_STATS_DATA["Eras"][era]["Number of Streams"] += 1
                    
                    ADVANCED_STATS_DATA["Eras"][era]["Number of Minutes"] += (ms_played / 1000) / 60
                    if track_name not in ADVANCED_STATS_DATA["Eras"][era]["Tracks"]:
                        ADVANCED_STATS_DATA["Eras"][era]["Tracks"].append(track_name)




                    # UPDATE YEARLY
                    if year not in ADVANCED_STATS_DATA["Yearly"]:
                        ADVANCED_STATS_DATA["Yearly"][year] = {
                            "Number of Streams"                 :   0,
                            "Number of Minutes"                 :   0,
                            "Average Percentage of Streams"     :   0,
                            "Time of Day Breakdown"             :   [0, 0, 0, 0],
                            "Tracks"                            :   {},
                            "Artists"                           :   {},
                            "Albums"                            :   {},
                            "Genres"                            :   {},
                            "Eras"                              :   {},
                            "Monthly"                           :   self.initialize_monthly()
                        }

                    if is_stream:
                        ADVANCED_STATS_DATA["Yearly"][year]["Average Percentage of Streams"] = (ADVANCED_STATS_DATA["Yearly"][year]["Average Percentage of Streams"] * ADVANCED_STATS_DATA["Yearly"][year]["Number of Streams"] + ms_played / ms_track_length) / (ADVANCED_STATS_DATA["Yearly"][year]["Number of Streams"] + 1)
                        ADVANCED_STATS_DATA["Yearly"][year]["Number of Streams"] += 1 
                    ADVANCED_STATS_DATA["Yearly"][year]["Number of Minutes"] += (ms_played / 1000) / 60
                    ADVANCED_STATS_DATA["Yearly"][year]["Time of Day Breakdown"][time_of_day_index] += ms_played

                    # Update Tracks
                    if track_uri not in ADVANCED_STATS_DATA["Yearly"][year]["Tracks"]:
                        ADVANCED_STATS_DATA["Yearly"][year]["Tracks"][track_uri] = {
                            "Name"                              :   track_name,
                            "Number of Streams"                 :   0,
                            "Number of Minutes"                 :   0,
                            "Average Percentage of Streams"     :   0,
                            "Skips"                             :   0,
                            "Link"                              :   track_link
                        }
                    
                    if did_skip:
                         ADVANCED_STATS_DATA["Yearly"][year]["Tracks"][track_uri]["Skips"] += 1

                    if is_stream:
                        ADVANCED_STATS_DATA["Yearly"][year]["Tracks"][track_uri]["Average Percentage of Streams"] = (ADVANCED_STATS_DATA["Yearly"][year]["Tracks"][track_uri]["Average Percentage of Streams"] * ADVANCED_STATS_DATA["Yearly"][year]["Tracks"][track_uri]["Number of Streams"] + ms_played / ms_track_length) / (ADVANCED_STATS_DATA["Yearly"][year]["Tracks"][track_uri]["Number of Streams"] + 1)
                        ADVANCED_STATS_DATA["Yearly"][year]["Tracks"][track_uri]["Number of Streams"] += 1 

                    ADVANCED_STATS_DATA["Yearly"][year]["Tracks"][track_uri]["Number of Minutes"] += (ms_played / 1000) / 60

                    # Update Artists
                    for artist in artists:
                        artist_uri, artist_name, artist_link = artist
                        if artist_uri not in ADVANCED_STATS_DATA["Yearly"][year]["Artists"]:
                            ADVANCED_STATS_DATA["Yearly"][year]["Artists"][artist_uri] = {
                                "Name"                              :   artist_name,
                                "Number of Streams"                 :   0,
                                "Number of Minutes"                 :   0,
                                "Average Percentage of Streams"     :   0,
                                "Link"                              :   artist_link
                            }

                        if is_stream: 
                            ADVANCED_STATS_DATA["Yearly"][year]["Artists"][artist_uri]["Average Percentage of Streams"] = (ADVANCED_STATS_DATA["Yearly"][year]["Artists"][artist_uri]["Average Percentage of Streams"] * ADVANCED_STATS_DATA["Yearly"][year]["Artists"][artist_uri]["Number of Streams"] + ms_played / ms_track_length) / (ADVANCED_STATS_DATA["Yearly"][year]["Artists"][artist_uri]["Number of Streams"] + 1)
                            ADVANCED_STATS_DATA["Yearly"][year]["Artists"][artist_uri]["Number of Streams"] += 1 
                        
                        ADVANCED_STATS_DATA["Yearly"][year]["Artists"][artist_uri]["Number of Minutes"] += (ms_played / 1000) / 60

                    # Update Albums
                    if album_uri not in ADVANCED_STATS_DATA["Yearly"][year]["Albums"]:
                        ADVANCED_STATS_DATA["Yearly"][year]["Albums"][album_uri] = {
                            "Name"                              :   album_name,
                            "Number of Streams"                 :   0,
                            "Number of Minutes"                 :   0,
                            "Average Percentage of Streams"     :   0,
                            "Link"                              :   album_link
                        }

                    if is_stream: 
                        ADVANCED_STATS_DATA["Yearly"][year]["Albums"][album_uri]["Average Percentage of Streams"] = (ADVANCED_STATS_DATA["Yearly"][year]["Albums"][album_uri]["Average Percentage of Streams"] * ADVANCED_STATS_DATA["Yearly"][year]["Albums"][album_uri]["Number of Streams"] + ms_played / ms_track_length) / (ADVANCED_STATS_DATA["Yearly"][year]["Albums"][album_uri]["Number of Streams"] + 1)
                        ADVANCED_STATS_DATA["Yearly"][year]["Albums"][album_uri]["Number of Streams"] += 1 
                    
                    ADVANCED_STATS_DATA["Yearly"][year]["Albums"][album_uri]["Number of Minutes"] += (ms_played / 1000) / 60

                    # Update Genres
                    for genre in genres:
                        if genre not in ADVANCED_STATS_DATA["Yearly"][year]["Genres"]:
                            ADVANCED_STATS_DATA["Yearly"][year]["Genres"][genre] = {
                                "Number of Streams"                 :   0,
                                "Number of Minutes"                 :   0,
                                "Average Percentage of Streams"     :   0,
                                "Tracks"                            :   []
                            }

                        if is_stream: 
                            ADVANCED_STATS_DATA["Yearly"][year]["Genres"][genre]["Average Percentage of Streams"] = (ADVANCED_STATS_DATA["Yearly"][year]["Genres"][genre]["Average Percentage of Streams"] * ADVANCED_STATS_DATA["Yearly"][year]["Genres"][genre]["Number of Streams"] + ms_played / ms_track_length) / (ADVANCED_STATS_DATA["Yearly"][year]["Genres"][genre]["Number of Streams"] + 1)
                            ADVANCED_STATS_DATA["Yearly"][year]["Genres"][genre]["Number of Streams"] += 1
                        
                        ADVANCED_STATS_DATA["Yearly"][year]["Genres"][genre]["Number of Minutes"] += (ms_played / 1000) / 60
                        if track_name not in ADVANCED_STATS_DATA["Yearly"][year]["Genres"][genre]["Tracks"]:
                            ADVANCED_STATS_DATA["Yearly"][year]["Genres"][genre]["Tracks"].append(track_name)

                    # Update Eras
                    if era not in ADVANCED_STATS_DATA["Yearly"][year]["Eras"]:
                        ADVANCED_STATS_DATA["Yearly"][year]["Eras"][era] = {
                            "Number of Streams"                 :   0,
                            "Number of Minutes"                 :   0,
                            "Average Percentage of Streams"     :   0,
                            "Tracks"                            :   []
                        }

                    if is_stream:
                        ADVANCED_STATS_DATA["Yearly"][year]["Eras"][era]["Average Percentage of Streams"] = (ADVANCED_STATS_DATA["Yearly"][year]["Eras"][era]["Average Percentage of Streams"] * ADVANCED_STATS_DATA["Yearly"][year]["Eras"][era]["Number of Streams"] + ms_played / ms_track_length) / (ADVANCED_STATS_DATA["Yearly"][year]["Eras"][era]["Number of Streams"] + 1)
                        ADVANCED_STATS_DATA["Yearly"][year]["Eras"][era]["Number of Streams"] += 1
                    
                    ADVANCED_STATS_DATA["Yearly"][year]["Eras"][era]["Number of Minutes"] += (ms_played / 1000) / 60
                    if track_name not in ADVANCED_STATS_DATA["Yearly"][year]["Eras"][era]["Tracks"]:
                        ADVANCED_STATS_DATA["Yearly"][year]["Eras"][era]["Tracks"].append(track_name)




                    # UPDATE MONTHLY
                    if is_stream: 
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Average Percentage of Streams"] = (ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Average Percentage of Streams"] * ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Number of Streams"] + ms_played / ms_track_length) / (ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Number of Streams"] + 1)
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Number of Streams"] += 1 
                    ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Number of Minutes"] += (ms_played / 1000) / 60
                    ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Time of Day Breakdown"][time_of_day_index] += ms_played

                    # Update Tracks
                    if track_uri not in ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Tracks"]:
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Tracks"][track_uri] = {
                            "Name"                              :   track_name,
                            "Number of Streams"                 :   0,
                            "Number of Minutes"                 :   0,
                            "Average Percentage of Streams"     :   0,
                            "Skips"                             :   0,
                            "Link"                              :   track_link
                        }
                    
                    if did_skip:
                         ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Tracks"][track_uri]["Skips"] += 1

                    if is_stream: 
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Tracks"][track_uri]["Average Percentage of Streams"] = (ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Tracks"][track_uri]["Average Percentage of Streams"] * ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Tracks"][track_uri]["Number of Streams"] + ms_played / ms_track_length) / (ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Tracks"][track_uri]["Number of Streams"] + 1)
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Tracks"][track_uri]["Number of Streams"] += 1
                    
                    ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Tracks"][track_uri]["Number of Minutes"] += (ms_played / 1000) / 60

                    # Update Artists
                    for artist in artists:
                        artist_uri, artist_name, artist_link = artist
                        if artist_uri not in ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Artists"]:
                            ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Artists"][artist_uri] = {
                                "Name"                              :   artist_name,
                                "Number of Streams"                 :   0,
                                "Number of Minutes"                 :   0,
                                "Average Percentage of Streams"     :   0,
                                "Link"                              :   artist_link
                            }

                        if is_stream:
                            ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Artists"][artist_uri]["Average Percentage of Streams"] = (ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Artists"][artist_uri]["Average Percentage of Streams"] * ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Artists"][artist_uri]["Number of Streams"] + ms_played / ms_track_length) / (ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Artists"][artist_uri]["Number of Streams"] + 1)
                            ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Artists"][artist_uri]["Number of Streams"] += 1 
                        
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Artists"][artist_uri]["Number of Minutes"] += (ms_played / 1000) / 60

                    # Update Albums
                    if album_uri not in ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Albums"]:
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Albums"][album_uri] = {
                            "Name"                              :   album_name,
                            "Number of Streams"                 :   0,
                            "Number of Minutes"                 :   0,
                            "Average Percentage of Streams"     :   0,
                            "Link"                              :   album_link
                        }

                    if is_stream:
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Albums"][album_uri]["Average Percentage of Streams"] = (ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Albums"][album_uri]["Average Percentage of Streams"] * ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Albums"][album_uri]["Number of Streams"] + ms_played / ms_track_length) / (ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Albums"][album_uri]["Number of Streams"] + 1)
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Albums"][album_uri]["Number of Streams"] += 1
                    
                    ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Albums"][album_uri]["Number of Minutes"] += (ms_played / 1000) / 60

                    # Update Genres
                    for genre in genres:
                        if genre not in ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Genres"]:
                            ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Genres"][genre] = {
                                "Number of Streams"                 :   0,
                                "Number of Minutes"                 :   0,
                                "Average Percentage of Streams"     :   0,
                                "Tracks"                            :   []
                            }

                        if is_stream: 
                            ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Genres"][genre]["Average Percentage of Streams"] = (ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Genres"][genre]["Average Percentage of Streams"] * ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Genres"][genre]["Number of Streams"] + ms_played / ms_track_length) / (ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Genres"][genre]["Number of Streams"] + 1)
                            ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Genres"][genre]["Number of Streams"] += 1
                        
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Genres"][genre]["Number of Minutes"] += (ms_played / 1000) / 60
                        if track_name not in ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Genres"][genre]["Tracks"]:
                            ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Genres"][genre]["Tracks"].append(track_name)

                    # Update Eras
                    if era not in ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Eras"]:
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Eras"][era] = {
                            "Number of Streams"                 :   0,
                            "Number of Minutes"                 :   0,
                            "Average Percentage of Streams"     :   0,
                            "Tracks"                            :   []
                        }

                    if is_stream:
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Eras"][era]["Average Percentage of Streams"] = (ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Eras"][era]["Average Percentage of Streams"] * ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Eras"][era]["Number of Streams"] + ms_played / ms_track_length) / (ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Eras"][era]["Number of Streams"] + 1)
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Eras"][era]["Number of Streams"] += 1
                    
                    ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Eras"][era]["Number of Minutes"] += (ms_played / 1000) / 60
                    if track_name not in ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Eras"][era]["Tracks"]:
                        ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Eras"][era]["Tracks"].append(track_name)

                except json.JSONDecodeError as e:
                    raise e

        # Normalize Time of Day Breakdown to be percentages relative to each other
        sum_of_breakdowns = ADVANCED_STATS_DATA["Time of Day Breakdown"][0] + ADVANCED_STATS_DATA["Time of Day Breakdown"][1] + ADVANCED_STATS_DATA["Time of Day Breakdown"][2] + ADVANCED_STATS_DATA["Time of Day Breakdown"][3]
        if (sum_of_breakdowns == 0): sum_of_breakdowns = 1
        ADVANCED_STATS_DATA["Time of Day Breakdown"][0] *= (100 / sum_of_breakdowns)
        ADVANCED_STATS_DATA["Time of Day Breakdown"][1] *= (100 / sum_of_breakdowns)
        ADVANCED_STATS_DATA["Time of Day Breakdown"][2] *= (100 / sum_of_breakdowns)
        ADVANCED_STATS_DATA["Time of Day Breakdown"][3] *= (100 / sum_of_breakdowns)
    
        for year in ADVANCED_STATS_DATA["Yearly"]:
            sum_of_breakdowns = ADVANCED_STATS_DATA["Yearly"][year]["Time of Day Breakdown"][0] + ADVANCED_STATS_DATA["Yearly"][year]["Time of Day Breakdown"][1] + ADVANCED_STATS_DATA["Yearly"][year]["Time of Day Breakdown"][2] + ADVANCED_STATS_DATA["Yearly"][year]["Time of Day Breakdown"][3]
            if (sum_of_breakdowns == 0): sum_of_breakdowns = 1
            ADVANCED_STATS_DATA["Yearly"][year]["Time of Day Breakdown"][0] *= (100 / sum_of_breakdowns)
            ADVANCED_STATS_DATA["Yearly"][year]["Time of Day Breakdown"][1] *= (100 / sum_of_breakdowns)
            ADVANCED_STATS_DATA["Yearly"][year]["Time of Day Breakdown"][2] *= (100 / sum_of_breakdowns)
            ADVANCED_STATS_DATA["Yearly"][year]["Time of Day Breakdown"][3] *= (100 / sum_of_breakdowns)

            for month in ADVANCED_STATS_DATA["Yearly"][year]["Monthly"]:
                sum_of_breakdowns = ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Time of Day Breakdown"][0] + ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Time of Day Breakdown"][1] + ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Time of Day Breakdown"][2] + ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Time of Day Breakdown"][3]
                if (sum_of_breakdowns == 0): sum_of_breakdowns = 1
                ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Time of Day Breakdown"][0] *= (100 / sum_of_breakdowns)
                ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Time of Day Breakdown"][1] *= (100 / sum_of_breakdowns)
                ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Time of Day Breakdown"][2] *= (100 / sum_of_breakdowns)
                ADVANCED_STATS_DATA["Yearly"][year]["Monthly"][month]["Time of Day Breakdown"][3] *= (100 / sum_of_breakdowns)

        ADVANCED_STATS_DATA['Metadata'] = self.update_metadata(ADVANCED_STATS_DATA['Metadata'], max_stamp_curr=max_stamp, min_stamp_curr=min_stamp)
        return ADVANCED_STATS_DATA

    def populate_metadata(self, filepath, DATA):
        import os
        DATA["Number of Files"] += 1
        num_files = DATA["Number of Files"]
        filename = os.path.basename(filepath)
        
        DATA["Files"][num_files] = {
            "Import Timestamp"          :   datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ'),
            "File Name"                 :   filename,
            "Start Timestamp"           :   "",
            "End Timestamp"             :   ""
        }

        return DATA
    
    def update_metadata(self, DATA, max_stamp_curr, min_stamp_curr):
        DATA["Files"][DATA["Number of Files"]]["Start Timestamp"] = min_stamp_curr.strftime('%Y-%m-%dT%H:%M:%SZ')
        DATA["Files"][DATA["Number of Files"]]["End Timestamp"] = max_stamp_curr.strftime('%Y-%m-%dT%H:%M:%SZ')
        min_stamp = None
        max_stamp = None
        for file in DATA["Files"].keys():
            curr_start = DATA["Files"][file]["Start Timestamp"]
            curr_end = DATA["Files"][file]["End Timestamp"]
            if min_stamp is None:
                min_stamp = curr_start
            elif min_stamp > curr_start:
                min_stamp = curr_start
            if max_stamp is None:
                max_stamp = curr_end
            elif max_stamp < curr_end:
                max_stamp = curr_end
        
        DATA["Dates Covered"] = {
            "Start Timestamp"           : min_stamp, 
            "End Timestamp"             : max_stamp
        }

        return DATA

    def get_time_of_day_index(self, time_stamp, timecode):
        country = self.country_timezone_mapping.get(timecode, "America/New York")

        # Define the timezone for the specified country
        country_timezone = pytz.timezone(country)
        
        # Convert the timestamp to a datetime object and localize it to the country's timezone
        timestamp_datetime = datetime.strptime(time_stamp, '%Y-%m-%dT%H:%M:%SZ')
        localized_timestamp = country_timezone.localize(timestamp_datetime)
        
        # Extract the hour from the localized timestamp
        hour = localized_timestamp.hour
        
        # Determine the time of day index based on the hour
        if 5 <= hour < 12:
            return 0  # Morning
        elif 12 <= hour < 17:
            return 1  # Afternoon
        elif 17 <= hour < 21:
            return 2  # Evening
        else:
            return 3  # Night

    def get_month(self, time_stamp):
        month_names = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"]
        timestamp_datetime = datetime.strptime(time_stamp, '%Y-%m-%dT%H:%M:%SZ')
        return month_names[timestamp_datetime.month - 1]
    
    def get_year(self, time_stamp):
        timestamp_datetime = datetime.strptime(time_stamp, '%Y-%m-%dT%H:%M:%SZ')
        return str(timestamp_datetime.year)
    
    def is_full_stream(self, ms_played, ms_track_length):
        if ms_track_length == 0:
            return False
        
        if ms_played / ms_track_length > 0.5:
            return True         # Listened to over half the song/podcast
        
        if ms_played > 60000 * 30:
            return True         # Listened to over 30 minutes
        
        if (ms_track_length < 60000 *10 ) and (ms_played > 30000):
            return True         # Track is less than 10 minutes so it's probably a song and user listened to over 30 seconds
        
        return False

    def get_era(self, release_date):
        try:
            year = int(release_date.split('-')[0])
        except ValueError:
            return ''
        
        if year < 500:
            return "Ancient Music"
        elif year < 1150:
            return "Pre-Medieval Music"
        elif year < 1400:
            return "Medieval Music"
        elif year < 1600:
            return "Renaissance Music"
        elif year < 1750:
            return "Baroque Music"
        elif year < 1830:
            return "Classical Music"
        elif year < 1860:
            return "Early Romantic Music"
        elif year < 1920:
            return "Late Romantic Music"
        elif year < 1930:
            return "1920's"
        elif year < 1940:
            return "1930's"
        elif year < 1950:
            return "'40's"
        elif year < 1960:
            return "'50's"
        elif year < 1970:
            return "'60's"
        elif year < 1980:
            return "'70's"
        elif year < 1990:
            return "'80's"
        elif year < 2000:
            return "'90's"
        elif year < 10000:
            decade = int(year) // 10 * 10
            decade_str = str(decade)
            return f"{decade_str[:-1]}0's"
        else:
            return "No way it's the year 10k"

    def initialize_monthly(self):
        return {
            "JANUARY" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {},
                "Genres"                            :   {},
                "Eras"                              :   {}
            },
            "FEBRUARY" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {},
                "Genres"                            :   {},
                "Eras"                              :   {}
            },
            "MARCH" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {},
                "Genres"                            :   {},
                "Eras"                              :   {}
            },
            "APRIL" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {},
                "Genres"                            :   {},
                "Eras"                              :   {}
            },
            "MAY" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {},
                "Genres"                            :   {},
                "Eras"                              :   {}
            },
            "JUNE" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {},
                "Genres"                            :   {},
                "Eras"                              :   {}
            },
            "JULY" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {},
                "Genres"                            :   {},
                "Eras"                              :   {}
            },
            "AUGUST" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {},
                "Genres"                            :   {},
                "Eras"                              :   {}
            },
            "SEPTEMBER" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {},
                "Genres"                            :   {},
                "Eras"                              :   {}
            },
            "OCTOBER" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {},
                "Genres"                            :   {},
                "Eras"                              :   {}
            },
            "NOVEMBER" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {},
                "Genres"                            :   {},
                "Eras"                              :   {}
            },
            "DECEMBER" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {},
                "Genres"                            :   {},
                "Eras"                              :   {}
            }
        }
    
    def populate_song_data_map(self, uris, token, more_data):
        SONGS_TO_API_DATA_MAP = {}
        artists_to_songs_map = {}

        if not more_data:
            return SONGS_TO_API_DATA_MAP
        
        chunk_size = 50
        uri_chunks = [uris[i:i + chunk_size] for i in range(0, len(uris), chunk_size)]

        for chunk in uri_chunks:
            try:
                song_data = self.get_song_data(chunk, token).get('tracks', {})

                for song in song_data:
                    if song is None: song = {}
                    uri = song.get('uri', "Unknown")
                    if uri not in SONGS_TO_API_DATA_MAP:
                        SONGS_TO_API_DATA_MAP[uri] = {
                            "ms_track_length"                   :   300000,
                            "track_link"                        :   "",
                            "artists"                           :   [["","",""]],
                            "genres"                            :   [],
                            "album_uri"                         :   "",
                            "album_name"                        :   "",
                            "album_link"                        :   "",
                            "release_date"                      :   ""
                        }
                    
                    ms_track_length = song.get('duration_ms', 300000)
                    track_link = song.get('external_urls', {}).get('spotify', "")

                    artists = []
                    for artist in song.get('artists', [{}]):
                        artist_uri = artist.get('uri', "")
                        artist_name = artist.get('name', "")
                        artist_link = artist.get('external_urls', {}).get('spotify', "")
                        artists.append([artist_uri, artist_name, artist_link])

                    album_uri = song.get('album', {}).get('uri', "")
                    album_name = song.get('album', {}).get('name', "")
                    album_link = song.get('album', {}).get('external_urls', {}).get('spotify', "")
                    release_date = song.get('album', {}).get('release_date', "")

                    try:
                        ms_track_length_int = int(ms_track_length)
                        SONGS_TO_API_DATA_MAP[uri]["ms_track_length"] = ms_track_length_int
                    except Exception as e:
                        print(e)

                    SONGS_TO_API_DATA_MAP[uri]["track_link"] = track_link
                    SONGS_TO_API_DATA_MAP[uri]["artists"] = artists
                    SONGS_TO_API_DATA_MAP[uri]["album_uri"] = album_uri
                    SONGS_TO_API_DATA_MAP[uri]["album_name"] = album_name
                    SONGS_TO_API_DATA_MAP[uri]["album_link"] = album_link
                    SONGS_TO_API_DATA_MAP[uri]["release_date"] = release_date

                    try:
                        artist_id = artist_uri.split(":")[-1]
                    except Exception as e:
                        return

                    if artist_id not in artists_to_songs_map:
                        artists_to_songs_map[artist_id] = {
                            "tracks"                            :   [uri],
                            "genres"                            :   []
                        }
                    else:
                         artists_to_songs_map[artist_id]["tracks"].append(uri)
                    
            except Exception as ex:
                print(f"Exception in populating song map: {ex}")
                pass
        
        artists_to_songs_map = self.populate_artists_data_map(artists_to_songs_map, token, more_data)

        for artist_id in artists_to_songs_map.keys():
            for uri in artists_to_songs_map[artist_id]['tracks']:
                SONGS_TO_API_DATA_MAP[uri]['genres'].extend(artists_to_songs_map[artist_id]['genres'])

        return SONGS_TO_API_DATA_MAP

    def populate_artists_data_map(self, map, token, more_data):
        if not more_data:
            return map
        
        uris = list(map.keys())
        chunk_size = 50
        uri_chunks = [uris[i:i + chunk_size] for i in range(0, len(uris), chunk_size)]

        for chunk in uri_chunks:
            try:
                artist_data = self.get_artist_data(chunk, token).get('artists', {})

                for artist in artist_data:
                    if artist is None: artist = {}
                    uri = artist.get('uri', "Unknown:").split(":")[-1]
                    genres = artist.get('genres', "Unknown")
                    
                    map[uri]["genres"] = genres       
                    
            except Exception as ex:
                print(f"Exception in populating artist map: {ex}")
                pass
        
        return map

    def populate_episode_data_map(self, uris, token, more_data):
        EPISODES_TO_API_DATA_MAP = {}

        if not more_data:
            return EPISODES_TO_API_DATA_MAP
        
        chunk_size = 50
        uri_chunks = [uris[i:i + chunk_size] for i in range(0, len(uris), chunk_size)]

        for chunk in uri_chunks:
            try:
                episode_data = self.get_episode_data(chunk, token).get('episodes', {})

                for episode in episode_data:
                    if episode is None: episode = {}
                    uri = episode.get('uri', "Unknown")
                    if uri not in EPISODES_TO_API_DATA_MAP:
                        EPISODES_TO_API_DATA_MAP[uri] = {
                            "ms_track_length"                   :   60000*60,
                            "track_link"                        :   "",
                            "artists"                           :   [["","",""]],
                            "genres"                            :   [""],
                            "album_uri"                         :   "",
                            "album_name"                        :   "",
                            "album_link"                        :   "",
                            "release_date"                      :   ""
                        }

                    ms_track_length = episode.get('duration_ms', 60000*60)
                    track_link = episode.get('external_urls', {}).get('spotify', "")

                    try:
                        ms_track_length_int = int(ms_track_length)
                        EPISODES_TO_API_DATA_MAP[uri]["ms_track_length"] = ms_track_length_int
                    except Exception as e:
                        print(e)

                    EPISODES_TO_API_DATA_MAP[uri]["track_link"] = track_link
            except Exception as ex:
                print(f"Exception in populating episode map: {ex}")
                pass
        
        return EPISODES_TO_API_DATA_MAP

    def get_song_data(self, chunk, access_token):
        ids_param = ",".join(chunk)
        url = f'https://api.spotify.com/v1/tracks?ids={ids_param}'
        
        headers = {
            'Authorization': f'Bearer {access_token}'
        }

        data = self.get_data_info_with_retry(url, headers)
        if data is not None:
            return data
        
        return {'tracks' : [{'uri': key} for key in chunk]}

    def get_artist_data(self, chunk, access_token):
        ids_param = ",".join(chunk)
        url = f'https://api.spotify.com/v1/artists?ids={ids_param}'
        
        headers = {
            'Authorization': f'Bearer {access_token}'
        }

        data = self.get_data_info_with_retry(url, headers)
        if data is not None:
            return data
    
        return {'artists' : [{'uri': key} for key in chunk]}

    def get_episode_data(self, chunk, access_token):
        ids_param = ",".join(chunk)
        url = f'https://api.spotify.com/v1/episodes?ids={ids_param}'
        
        headers = {
            'Authorization': f'Bearer {access_token}'
        }

        data = self.get_data_info_with_retry(url, headers)
        if data is not None:
            return data
    
        return {'episodes' : [{'uri': key} for key in chunk]}

    def get_data_info_with_retry(self, url, headers, max_retries=3):
        if self.hit_rate_limit:
            return None

        for attempt in range(max_retries):
            try:
                response = requests.get(url, headers=headers)
                response.raise_for_status()  # Check for HTTP errors
                track_data = response.json()
                return track_data
            except requests.exceptions.RequestException as e:
                print(f"Attempt {attempt + 1} failed: {e}")
                if response.status_code == 429:
                    # If rate-limited, wait and retry
                    retry_after = int(response.headers.get('Retry-After', 1))
                    if retry_after > 30:
                        print(f"{retry_after/60} minutes is too long! Giving up!")
                        self.hit_rate_limit = True
                        return None
                    print(f"Waiting {retry_after} seconds!")
                    time.sleep(retry_after)
                else:
                    break

        print("Max retries reached. Could not fetch track data.")
        return None






