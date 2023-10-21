import spotipy
import multiprocessing
import time
import User
import json
from Exceptions import ErrorHandler
from datetime import datetime
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

    def advanced_stats_import(self, filepath, sp):

        SONGS_TO_API_DATA_MAP = {}

        ADVANCED_STATS_DATA = {
            "Number of Streams"                 :   0,
            "Number of Minutes"                 :   0,
            "Average Percentage of Streams"     :   0,
            "Time of Day Breakdown"             :   [0, 0, 0, 0],
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
                    timecode = stream.get("conn_country", "")                               # "SE" country code where user played stream
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
                        if track_uri is not None:
                            track_uri = episode_uri
                        else:
                            track_uri = "Unknown"
                        if show_name is not None and episode_name is not None:
                            track_name = f"{show_name}:{episode_name}"
                        elif show_name is not None:
                            track_name = show_name
                        elif episode_name is not None:
                            track_name = episode_name
                        else:
                            track_name = "Unknown"

                    if track_uri not in SONGS_TO_API_DATA_MAP:
                        SONGS_TO_API_DATA_MAP[track_uri] = {
                            "ms_track_length"                   :   0,
                            "track_link"                        :   "",
                            "artists"                           :   [],
                            "album_uri"                         :   "",
                            "album_name"                        :   "",
                            "album_link"                        :   ""
                        }
                        
                        try:
                            # Get track information
                            track_data = sp.track(track_uri)

                            ms_track_length = track_data['duration_ms']
                            track_link = track_data['external_urls']['spotify']

                            artists = []
                            for artist in track_data['artists']:
                                artist_uri = artist['uri']
                                artist_name = artist['name']
                                artist_link = artist['external_urls']['spotify']
                                artists.append([artist_uri, artist_name, artist_link])

                            album_uri = track_data['album']['uri']
                            album_name = track_data['album']['name']
                            album_link = track_data['album']['external_urls']['spotify']

                            SONGS_TO_API_DATA_MAP[track_uri]["ms_track_length"] = ms_track_length
                            SONGS_TO_API_DATA_MAP[track_uri]["track_link"] = track_link
                            SONGS_TO_API_DATA_MAP[track_uri]["artists"] = artists
                            SONGS_TO_API_DATA_MAP[track_uri]["album_uri"] = album_uri
                            SONGS_TO_API_DATA_MAP[track_uri]["album_name"] = album_name
                            SONGS_TO_API_DATA_MAP[track_uri]["album_link"] = album_link
                        except Exception as ex:
                            pass

                    
                    ms_track_length = SONGS_TO_API_DATA_MAP[track_uri]["ms_track_length"]
                    track_link = SONGS_TO_API_DATA_MAP[track_uri]["track_link"]
                    artists = SONGS_TO_API_DATA_MAP[track_uri]["artists"]
                    album_uri = SONGS_TO_API_DATA_MAP[track_uri]["album_uri"]
                    album_name = SONGS_TO_API_DATA_MAP[track_uri]["album_name"]
                    album_link = SONGS_TO_API_DATA_MAP[track_uri]["album_link"]

                    if ms_played > ms_track_length:
                        ms_played = ms_track_length # Weird glitch with stats

                    time_of_day_index = self.get_time_of_day_index(time_stamp, timecode)
                    month = self.get_month(time_stamp)
                    year = self.get_year(time_stamp)
                    is_stream = self.is_full_stream(ms_played, ms_track_length)

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

        return json.dumps(ADVANCED_STATS_DATA, indent=4)  # Return a nicely formatted JSON string

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

    def initialize_monthly(self):
        return {
            "JANUARY" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            },
            "FEBRUARY" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            },
            "MARCH" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            },
            "APRIL" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            },
            "MAY" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            },
            "JUNE" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            },
            "JULY" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            },
            "AUGUST" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            },
            "SEPTEMBER" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            },
            "OCTOBER" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            },
            "NOVEMBER" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
                "Tracks"                            :   {},
                "Artists"                           :   {},
                "Albums"                            :   {}
            },
            "DECEMBER" : {
                "Number of Streams"                 :   0,
                "Number of Minutes"                 :   0,
                "Average Percentage of Streams"     :   0,
                "Time of Day Breakdown"             :   [0, 0, 0, 0],
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






