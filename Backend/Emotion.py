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
    
    def create_new_emotion(name = "new emotion"):
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

            if param != "name" and param != "target_duration_ms":
                # Calculate the percentage difference
                if abs(value1 + value2) == 0:
                    percentage_difference = 0
                else:
                    percentage_difference = abs(value1 - value2) / abs((value1 + value2) / 2)
                # Accumulate the total distance
                total_distance += percentage_difference
        return total_distance
    
    def get_percentage(user, song, popularity):
        percentage = []
        tractdict = Emotion.convert_track(user, song, popularity)
        happy = Emotion.gethappy()
        angry = Emotion.getangry()
        sad = Emotion.getsad()
        happydist = Emotion.calculate_total_distance(tractdict, happy)
        angrydist = Emotion.calculate_total_distance(tractdict, angry)
        saddist = Emotion.calculate_total_distance(tractdict, sad)
        totaldist = saddist + angrydist + happydist
        percentage.append(happydist/totaldist)
        percentage.append(angrydist/totaldist)
        percentage.append(saddist/totaldist)
        percentage[0] = 1 - percentage[0] 
        percentage[1] = 1 - percentage[1] 
        percentage[2] = 1 - percentage[2] 
        return percentage
        
    def convert_track(user, song, popularity = 0, duration = 0):
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
        song_features = user.spotify_user.audio_features(song)
        song_features = song_features[0]
        song_dict["target_energy"] = song_features.get("energy", 0)
        song_dict["target_popularity"] = popularity
        song_dict["target_acousticness"] = song_features.get("acousticness", 0)
        song_dict["target_danceability"] = song_features.get("danceability", 0)
        song_dict["target_duration_ms"] = duration
        song_dict["target_instrumentalness"] = song_features.get("instrumentalness", 0)
        song_dict["target_liveness"] = song_features.get("liveness", 0)
        song_dict["target_loudness"] = song_features.get("loudness", 0)
        song_dict["target_mode"] = song_features.get("mode", 0)
        song_dict["target_speechiness"] = song_features.get("speechiness", 0)
        song_dict["target_tempo"] = song_features.get("tempo", 0)
        song_dict["target_valence"] = song_features.get("valence", 0)
        return song_dict

    def update_and_average_dict(user, original_dict, song, popularity, duration):
        song_dict = Emotion.convert_track(user, song, popularity, duration)
        for key in original_dict.keys():
            if key != "name":
                original_dict[key] = (original_dict[key] + song_dict[key]) / 2
        return original_dict

    def find_song_emotion(user, song, popularity):
        song_dict = Emotion.convert_track(user, song, popularity)
        happydistance = Emotion.calculate_total_distance(Emotion.gethappy, song_dict)
        angrydistance = Emotion.calculate_total_distance(Emotion.getangry, song_dict)
        saddistance = Emotion.calculate_total_distance(Emotion.getsad, song_dict)
        lowest = min(happydistance, angrydistance, saddistance)
        if(lowest == happydistance):
            return "happy"
        elif (lowest == angrydistance):
            return "angry"
        elif (lowest == saddistance):
            return "sad"
        else:
            return "undefined"
        
    def get_emotion_recommendations(user, emotiondict, track = [], artist = [], genre = []):
        return user.get_recommendations(
                            seed_tracks=track,
                            seed_artists=artist,
                            seed_genres=genre, 
                            max_items=10,
                            target_energy=emotiondict["target_energy"],
                            target_popularity=emotiondict["target_popularity"],
                            target_acousticness=emotiondict["target_acousticness"],
                            target_danceability=emotiondict["target_danceability"],
                            target_duration_ms=emotiondict["target_duration_ms"],
                            target_instrumentalness=emotiondict["target_instrumentalness"],
                            target_liveness=emotiondict["target_liveness"],
                            target_loudness=emotiondict["target_loudness"],
                            target_mode=emotiondict["target_mode"],
                            target_speechiness=emotiondict["target_speechiness"],
                            target_tempo=emotiondict["target_tempo"],
                            target_valence=emotiondict["target_valence"],
                            extraparameters = True)