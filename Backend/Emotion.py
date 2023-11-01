import spotipy
import multiprocessing
import time
import User
from Exceptions import ErrorHandler
import Emotion

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
            "target_valence": 100
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
    
    def createnewemotion():
        emptydict = {
            "target_energy": 0,
            "target_popularity": 0,
            "target_acousticness": 0,
            "target_danceability": 0,
            "target_duration_ms": 0,
            "target_instrumentalness": 0,
            "target_key": 0,
            "target_liveness": 0,
            "target_loudness": 0,
            "target_mode": 0,
            "target_speechiness": 0,
            "target_tempo": 0,
            "target_time_signature": 0,
            "target_valence": 0
        }
        return emptydict
    
    def calculate_total_distance(dict1, dict2):
        # Initialize a variable to store the total distance
        total_distance = 0
        # Calculate the percentage differences for each parameter and accumulate the total distance
        for param in dict1:
            value1 = dict1[param]
            value2 = dict2[param]

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
            "target_energy": 0,
            "target_popularity": 0,
            "target_acousticness": 0,
            "target_danceability": 0,
            "target_duration_ms": 0,
            "target_instrumentalness": 0,
            "target_key": 0,
            "target_liveness": 0,
            "target_loudness": 0,
            "target_mode": 0,
            "target_speechiness": 0,
            "target_tempo": 0,
            "target_time_signature": 0,
            "target_valence": 0
        }
        song_features = user.audio_features(song)
        song_dict["target_energy"] = song_features.get("energy", 0)
        song_dict["target_popularity"] = song["popularity"]
        song_dict["target_acousticness"] = song_features.get("acousticness", 0)
        song_dict["target_danceability"] = song_features.get("danceability", 0)
        song_dict["target_duration_ms"] = song["duration_ms"]
        song_dict["target_instrumentalness"] = song_features.get("instrumentalness", 0)
        song_dict["target_key"] = song_features.get("key", 0)
        song_dict["target_liveness"] = song_features.get("liveness", 0)
        song_dict["target_loudness"] = song_features.get("loudness", 0)
        song_dict["target_mode"] = song_features.get("mode", 0)
        song_dict["target_speechiness"] = song_features.get("speechiness", 0)
        song_dict["target_tempo"] = song_features.get("tempo", 0)
        song_dict["target_time_signature"] = song_features.get("time_signature", 0)
        song_dict["target_valence"] = song_features.get("valence", 0)
        return song_dict

    def update_and_average_dict(self, user, original_dict, song):
        song_dict = self.convert_track(user, song)
        for key in original_dict.items():
            original_dict[key] = (original_dict[key] + song_dict[key]) / 2
        return original_dict

    def find_song_emotion(self, user, original_dict, song):
        song_dict = self.convert_track(song)
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