class Emotion:
    def getangry():
        angry = {
            "name": "angry",
            "amount_songs": 1, 
            "target_energy": 1,
            "target_popularity": 70,
            "target_acousticness": 0,
            "target_danceability": .4,
            "target_duration_ms": 120000,
            "target_instrumentalness": .2,
            "target_liveness": 0,
            "target_loudness": -6,
            "target_mode": 1,
            "target_speechiness": .5,
            "target_tempo": 150,
            "target_valence": .4
        }
        return angry
    
    def gethappy():
        happy = {
            "name": "happy",
            "amount_songs": 1, 
            "target_energy": .7,
            "target_popularity": 100,
            "target_acousticness": .5,
            "target_danceability": .7,
            "target_duration_ms": 120000,
            "target_instrumentalness": .2,
            "target_liveness": 0,
            "target_loudness": -3,
            "target_mode": 1,
            "target_speechiness": .5,
            "target_tempo": 120,
            "target_valence": .8
        }
        return happy
    
    def getsad():   
        sad = {
            "name": "sad",
            "amount_songs": 1, 
            "target_energy": .4,
            "target_popularity": 70,
            "target_acousticness": .6,
            "target_danceability": .2,
            "target_duration_ms": 120000,
            "target_instrumentalness": .5,
            "target_liveness": 0,
            "target_loudness": -2,
            "target_mode": 0,
            "target_speechiness": .5,
            "target_tempo": 80,
            "target_valence": .2
        }
        return sad
    
    def create_new_emotion(name = "new emotion"):
        emptydict = {
            "name" : name,
            "amount_songs": 0, 
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

            if param == "target_energy" or param == "target_valence" or param == "target_dancebility":
                # Calculate the percentage difference
                if abs(value1 + value2) == 0:
                    percentage_difference = 0
                else:
                    percentage_difference = abs(value1 - value2) / abs((value1 + value2) / 2)
                # Accumulate the total distance
                total_distance += percentage_difference
        return total_distance
    
    def get_percentage(user, song, popularity):
        percentage = {
            "percent_happy": 0,
            "percent_angry": 0,
            "percent_sad": 0
        }
        tractdict = Emotion.convert_tracks(user, song, popularity)[0]
        happy = Emotion.gethappy()
        angry = Emotion.getangry()
        sad = Emotion.getsad()
        happydist = Emotion.calculate_total_distance(tractdict, happy)
        angrydist = Emotion.calculate_total_distance(tractdict, angry)
        saddist = Emotion.calculate_total_distance(tractdict, sad)
        totaldist = saddist + angrydist + happydist
        percentage["percent_happy"] = (1 - happydist/totaldist)
        percentage["percent_angry"] = (1 - angrydist/totaldist) 
        percentage["percent_sad"] = (1 - saddist/totaldist)
        totalper = percentage["percent_happy"] + percentage["percent_angry"] + percentage["percent_sad"]
        percentage["percent_happy"] = percentage["percent_happy"] / totalper
        percentage["percent_angry"] = percentage["percent_angry"] / totalper
        percentage["percent_sad"] = percentage["percent_sad"]/ totalper
        return percentage
    """
    def spoof():
        import random
        parameters = [
            {"min": 0, "max": 1, "step": 0.01, "name": 'Energy', "key": 'target_energy'},
            {"min": 0, "max": 100, "step": 1, "name": 'Popularity', "key": 'target_popularity'},
            {"min": 0, "max": 1, "step": 0.01, "name": 'Acousticness', "key": 'target_acousticness'},
            {"min": 0, "max": 1, "step": 0.01, "name": 'Danceability', "key": 'target_danceability'},
            {"min": 0, "max": 10*60*1000, "step": 1, "name": 'Duration (min)', "key": 'target_duration_ms'},
            {"min": 0, "max": 1, "step": 0.01, "name": 'Instrumentalness', "key": 'target_instrumentalness'},
            {"min": 0, "max": 1, "step": 0.01, "name": 'Liveness', "key": 'target_liveness'},
            {"min": -30, "max": 0, "step": 0.5, "name": 'Loudness (dB)', "key": 'target_loudness'},
            {"min": 0, "max": 1, "step": 1, "name": 'Mode', "key": 'target_mode'},
            {"min": 0, "max": 1, "step": 0.01, "name": 'Speechiness', "key": 'target_speechiness'},
            {"min": 30, "max": 300, "step": 1, "name": 'Tempo', "key": 'target_tempo'},
            {"min": 0, "max": 1, "step": 0.01, "name": 'Valence', "key": 'target_valence'}
        ]

        random_values = {}

        for param in parameters:
            min_val = param["min"]
            max_val = param["max"]
            step = param["step"]
            key = param["key"]
            
            # Calculate the number of possible values within the specified range and step size
            num_possible_values = int((max_val - min_val) / step) + 1

            # Generate a random index within the range of possible values
            random_index = random.randint(0, num_possible_values - 1)

            # Calculate the random value based on the random index
            random_value = round(min_val + random_index * step, 2)
            random_values[key] = random_value
        random_values["name"] = "songdict"
        return random_values
    """
    def convert_tracks(user, song_list, popularity = 0):
        #return Emotion.spoof()
        counter = 0
        song_dict_list = []
        song_dict = {
            "name" : "songdict",
            "amount_songs": 0,
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
        song_features = user.spotify_user.audio_features(song_list)
        if song_features is None:
            return None
        for song in song_features:
            song_dict["target_energy"] = song.get("energy", 0)
            song_dict["target_popularity"] = popularity
            song_dict["target_acousticness"] = song.get("acousticness", 0)
            song_dict["target_danceability"] = song.get("danceability", 0)
            song_dict["target_duration_ms"] = song.get("duration_ms", 0)
            song_dict["target_instrumentalness"] = song.get("instrumentalness", 0)
            song_dict["target_liveness"] = song.get("liveness", 0)
            song_dict["target_loudness"] = song.get("loudness", 0)
            song_dict["target_mode"] = song.get("mode", 0)
            song_dict["target_speechiness"] = song.get("speechiness", 0)
            song_dict["target_tempo"] = song.get("tempo", 0)
            song_dict["target_valence"] = song.get("valence", 0)
            song_dict["amount_songs"] = 1
            counter = counter + 1
            song_dict_list.append(song_dict)
        return song_dict_list

    def update_and_average_dict(user, original_dict, song_dict):
        for key in original_dict.keys():
            if key != "name" and key != "amount_songs":
                original_dict[key] = (original_dict[key] * original_dict["amount_songs"] + song_dict[key]) / (original_dict["amount_songs"] + 1)
                original_dict["amount_songs"] = original_dict["amount_songs"] + 1
        return original_dict
    
    def find_song_emotion(user, song_list, popularity = 0):
        emotion_list = []
        song_dict_list = Emotion.convert_tracks(user, song_list, popularity)
        if song_dict is None:
            return None
        for song_dict in song_dict_list:
            happydistance = Emotion.calculate_total_distance(Emotion.gethappy(), song_dict)
            angrydistance = Emotion.calculate_total_distance(Emotion.getangry(), song_dict)
            saddistance = Emotion.calculate_total_distance(Emotion.getsad(), song_dict)
            lowest = min(happydistance, angrydistance, saddistance)
            if(lowest == happydistance):
                emotion_list.append("happy")
            elif (lowest == angrydistance):
                emotion_list.append("angry")
            elif (lowest == saddistance):
                emotion_list.append("sad")
            else:
                emotion_list.append("undefined")
        return emotion_list
        
    def get_emotion_recommendations(user, emotiondict, track = [], artist = [], genre = [], max_items = 10):
        return user.get_recommendations(
                            seed_tracks=track,
                            seed_artists=artist,
                            seed_genres=genre, 
                            max_items=max_items,
                            target_energy=emotiondict["target_energy"],
                            target_popularity=int(round(emotiondict["target_popularity"])),
                            target_acousticness=emotiondict["target_acousticness"],
                            target_danceability=emotiondict["target_danceability"],
                            target_duration_ms=int(round(emotiondict["target_duration_ms"])),
                            target_instrumentalness=emotiondict["target_instrumentalness"],
                            target_liveness=emotiondict["target_liveness"],
                            target_loudness=emotiondict["target_loudness"],
                            target_mode=int(round(emotiondict["target_mode"])),
                            target_speechiness=emotiondict["target_speechiness"],
                            target_tempo=int(round(emotiondict["target_tempo"])),
                            target_valence=emotiondict["target_valence"],
                            extraparameters = True)