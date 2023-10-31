import spotipy
import multiprocessing
import time
import User
from Exceptions import ErrorHandler

class Emotion:
    def __init__(self, 

                genres = None, 
                target_energy=0,
                target_popularity=0,
                target_acousticness=0,
                target_danceability=0,
                target_duration_ms=0,
                target_instrumentalness=0, 
                target_key=0,
                target_liveness=0,
                target_loudness=0,
                target_mode=0,
                target_speechiness=0,
                target_tempo=0,
                target_time_signature=0,
                target_valence=0):
        self.target_energy = target_energy
        self.target_popularity = target_popularity
        self.target_acousticness = target_acousticness
        self.target_danceability = target_danceability
        self.target_duration_ms = target_duration_ms
        self.target_instrumentalness = target_instrumentalness
        self.target_key = target_key
        self.target_liveness = target_liveness
        self.target_loudness = target_loudness
        self.target_mode = target_mode
        self.target_speechiness = target_speechiness
        self.target_tempo = target_tempo
        self.target_time_signature = target_time_signature
        self.target_valence = target_valence
    
    def average(self, addedsong):
        print("average")

    def calcdistance(self, targetsong):
        print("distance")
    
    def getrecs():
        print("getting recommendations")

    def getangry():
        thisdict = {
            "brand": "Ford",
            "model": "Mustang",
            "year": 1964
        }
    
    def gethappy():
        thisdict = {
            "brand": "Ford",
            "model": "Mustang",
            "year": 1964
        }
    
    def getsad():   
        thisdict = {
            "brand": "Ford",
            "model": "Mustang",
            "year": 1964
        }