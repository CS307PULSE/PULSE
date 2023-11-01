import spotipy
import multiprocessing
import time
import User
from Exceptions import ErrorHandler
import Emotion

class Emotion:
    def getangry():
        angry = {
            "name" : "angry", 
            "target_energy": 50,
            "target_popularity": 70,
            "target_acousticness": 0,
            "target_danceability": .5,
            "target_duration_ms": 120000,
            "target_instrumentalness": .2,
            "target_liveness": 0,
            "target_loudness": -6,
            "target_mode": 1,
            "target_speechiness": .5,
            "target_tempo": 150,
            "target_valence": .5
        }
        return angry
    
    def gethappy():
        happy = {
            "name" : "happy", 
            "target_energy": .7,
            "target_popularity": 1,
            "target_acousticness": .5,
            "target_danceability": .1,
            "target_duration_ms": 120000,
            "target_instrumentalness": .2,
            "target_liveness": 0,
            "target_loudness": -3,
            "target_mode": 1,
            "target_speechiness": .5,
            "target_tempo": 145,
            "target_valence": 1
        }
        return happy
    
    def getsad():   
        sad = {
            "name" : "sad", 
            "target_energy": .3,
            "target_popularity": .7,
            "target_acousticness": .6,
            "target_danceability": .3,
            "target_duration_ms": 120000,
            "target_instrumentalness": 50,
            "target_liveness": 0,
            "target_loudness": -2,
            "target_mode": 0,
            "target_speechiness": .5,
            "target_tempo": 65,
            "target_valence": .3
        }
        return sad
    
    def createnewemotion(name = "new emotion"):
        emptydict = {
            "name" : name, 
            "target_energy": 0,
            "target_popularity": 0,
            "target_acousticness": 0,
            "target_danceability": 0,
            "target_duration_ms": 120000,
            "target_instrumentalness": 0,
            "target_liveness": 0,
            "target_loudness": 0,
            "target_mode": 0,
            "target_speechiness": 0,
            "target_tempo": 0,
            "target_valence": .5
        }
        return emptydict
    
    def minutes_to_milliseconds(minutes):
        return minutes * 60 * 1000

    def milliseconds_to_minutes(milliseconds):
        return milliseconds / (60 * 1000)

    def editemotion(originaldict, key, value):
        originaldict[key] = value
        return originaldict
    
    def calculate_total_distance(dict1, dict2):
        # Initialize a variable to store the total distance
        total_distance = 0
        # Calculate the percentage differences for each parameter and accumulate the total distance
        for param in dict1.keys():
            value1 = dict1[param]
            value2 = dict2[param]

            if param != "name":
                # Calculate the percentage difference
                percentage_difference = abs(value1 - value2)
                # Accumulate the total distance
                total_distance += percentage_difference
        return total_distance
    
    def get_percentage(self, user, song):
        percentage = []
        tractdict = self.convert_track(user, song)
        happy = self.gethappy()
        angry = self.getangry()
        sad = self.getsad()
        happydist = self.calculate_total_distance(tractdict, happy)
        angrydist = self.calculate_total_distance(tractdict, angry)
        saddist = self.calculate_total_distance(tractdict, sad)
        totaldist = saddist + angrydist + happydist
        percentage.append(happydist/totaldist)
        percentage.append(angrydist/totaldist)
        percentage.append(saddist/totaldist)
        return percentage
        
    def convert_track(user, song):
        song_dict = {
            "name" : "songdict",
            "target_energy": 0,
            "target_popularity": 0,
            "target_acousticness": 0,
            "target_danceability": 0,
            "target_duration_ms": 0,
            "target_instrumentalness": 0,
            "target_liveness": 0,
            "target_loudness": 0,
            "target_mode": 0,
            "target_speechiness": 0,
            "target_tempo": 0,
            "target_valence": 0
        }
        song_features = user.audio_features(song)
        song_dict["target_energy"] = song_features.get("energy", 0)
        song_dict["target_popularity"] = song["popularity"]
        song_dict["target_acousticness"] = song_features.get("acousticness", 0)
        song_dict["target_danceability"] = song_features.get("danceability", 0)
        song_dict["target_duration_ms"] = song["duration_ms"]
        song_dict["target_instrumentalness"] = song_features.get("instrumentalness", 0)
        song_dict["target_liveness"] = song_features.get("liveness", 0)
        song_dict["target_loudness"] = song_features.get("loudness", 0)
        song_dict["target_mode"] = song_features.get("mode", 0)
        song_dict["target_speechiness"] = song_features.get("speechiness", 0)
        song_dict["target_tempo"] = song_features.get("tempo", 0)
        song_dict["target_valence"] = song_features.get("valence", 0)
        return song_dict

    def update_and_average_dict(self, user, original_dict, song):
        song_dict = self.convert_track(user, song)
        for key in original_dict.keys():
            if key != "name":
                original_dict[key] = (original_dict[key] + song_dict[key]) / 2
        return original_dict

    def find_song_emotion(self, user, song):
        song_dict = self.convert_track(user, song)
        happydistance = self.calculate_total_distance(self.gethappy, song_dict)
        angrydistance = self.calculate_total_distance(self.getangry, song_dict)
        saddistance = self.calculate_total_distance(self.getsad, song_dict)
        lowest = min(happydistance, angrydistance, saddistance)
        if(lowest == happydistance):
            return "happy"
        elif (lowest == angrydistance):
            return "angry"
        elif (lowest == saddistance):
            return "sad"
        else:
            return "undefined"