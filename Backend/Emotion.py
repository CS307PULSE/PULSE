import spotipy
import multiprocessing
import time
import User
from Exceptions import ErrorHandler

class Emotion:
    def getangry():
        angry = {
            "target_energy": 50,
            "target_popularity": 70,
            "target_acousticness": 0,
            "target_danceability": 50,
            "target_duration_ms": 0,
            "target_instrumentalness": 0,
            "target_key": 0,
            "target_liveness": 100,
            "target_loudness": 100,
            "target_mode": 0,
            "target_speechiness": 0,
            "target_tempo": 0,
            "target_time_signature": 0,
            "target_valence": 0
        }
        return angry
    
    def gethappy():
        happy = {
            "target_energy": 100,
            "target_popularity": 100,
            "target_acousticness": 0,
            "target_danceability": 100,
            "target_duration_ms": 0,
            "target_instrumentalness": 0,
            "target_key": 0,
            "target_liveness": 100,
            "target_loudness": 0,
            "target_mode": 0,
            "target_speechiness": 0,
            "target_tempo": 0,
            "target_time_signature": 0,
            "target_valence": 0
        }
        return happy
    
    def getsad():   
        sad = {
            "target_energy": 0,
            "target_popularity": 70,
            "target_acousticness": 60,
            "target_danceability": 0,
            "target_duration_ms": 0,
            "target_instrumentalness": 50,
            "target_key": 0,
            "target_liveness": 0,
            "target_loudness": 0,
            "target_mode": 0,
            "target_speechiness": 0,
            "target_tempo": 0,
            "target_time_signature": 0,
            "target_valence": 0
        }
        return sad