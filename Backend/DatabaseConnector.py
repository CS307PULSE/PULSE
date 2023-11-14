import mysql.connector
from User import User
from User import Theme
import json
from types import SimpleNamespace
import datetime

class DatabaseConnector(object):
    def __init__(self, db_local):
        self.db_local = db_local
        self.db_conn = None
        self.db_cursor = None
    
    def __enter__(self):
        # This ensure, whenever an object is created using "with" that a connection is created
        self.db_conn = mysql.connector.connect(**self.db_local, buffered = True)
        self.db_cursor = self.db_conn.cursor()
        return self
    
    def __exit__(self, exception_type, exception_val, trace):
        # once the with block is over, the __exit__ method is called and connection is closed
        try:
           self.db_cursor.close()
           self.db_conn.close()
        except AttributeError: # isn't closable
           print("Not closable")
           return True # exception handled successfully

    # Deletes a row in user DB. Expects spotify_id and returns None
    def delete_row_in_user_DB_TESTING_ONLY(self, spotify_id):
        sql_delete_user_query = "DELETE FROM pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql_delete_user_query, (spotify_id,))
        self.db_conn.commit()
        return None
    
    #--------------------------------------------------------------------------------------------------------
    # Existence checks

    # Checks if user exists in user DB. Expects spotify_id and returns True or False.
    def does_user_exist_in_user_DB(self, spotify_id):
        sql_check_user_exists_query = "SELECT COUNT(*) AS row_count FROM pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql_check_user_exists_query, (spotify_id,))
        result = self.db_cursor.fetchone()
        row_count = result[0]
        if (row_count == 0):
            return False
        else: 
            return True
        
    # Checks if user exists in stats DB. Expects spotify_id and returns True or False.    
    def does_user_exist_in_stats_DB(self, spotify_id):
        sql_check_user_exists_query = "SELECT COUNT(*) AS row_count FROM pulse.base_stats WHERE spotify_id = %s"
        self.db_cursor.execute(sql_check_user_exists_query, (spotify_id,))
        result = self.db_cursor.fetchone()
        row_count = result[0]
        if (row_count == 0):
            return False
        else: 
            return True

    #--------------------------------------------------------------------------------------------------------
    # User creation

    #Stores a new user in the user DB given the user object. Returns 1 if successful, -1 if not.
    def create_new_user_in_user_DB(self, new_user):
        try:
            sql_store_new_user_query = """INSERT INTO pulse.users (display_name, 
                                login_token, 
                                spotify_id, 
                                friends, 
                                theme, 
                                location,
                                gender) VALUES (%s,%s,%s,%s,%s,%s,%s)"""
        
               
            self.db_cursor.execute(sql_store_new_user_query, (new_user.display_name, 
                                                json.dumps(new_user.login_token),
                                                new_user.spotify_id,
                                                create_friends_string_for_DB(new_user.friends),
                                                int(new_user.theme.value),
                                                new_user.location,
                                                new_user.gender,))

            self.db_conn.commit()
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating token:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed
        
    #Creates a a new row in stats DB containing only the username with all other values being null. Expects spotify_id and returns None
    def create_new_user_in_stats_DB(self, spotify_id):
        try:
            sql_store_new_user_query = """INSERT INTO pulse.base_stats (spotify_id) VALUES (%s)"""
            self.db_cursor.execute(sql_store_new_user_query, (spotify_id,))
            self.db_conn.commit()
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating token:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed

    #Creates a a new row in advanced stats DB containing only the username with all other values being null. Expects spotify_id and returns None    
    def create_new_user_in_advanced_stats_DB(self, spotify_id):
        try:
            sql_store_new_user_query = """INSERT INTO pulse.advanced_stats (spotify_id) VALUES (%s)"""
            self.db_cursor.execute(sql_store_new_user_query, (spotify_id,))
            self.db_conn.commit()
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error creating new user in advanced stats table:", str(e))
            self.db_conn.rollback()
            return 0  # Indicate that the update failed

    #--------------------------------------------------------------------------------------------------------
    # Database retrieval
    
    # Returns a user's advanced stats from DB as a JSON object
    def get_advanced_stats_from_DB(self, spotify_id):
        sql_get_advanced_stats_query = """SELECT advanced_stats_header FROM pulse.advanced_stats WHERE spotify_id = %s"""
        self.db_cursor.execute(sql_get_advanced_stats_query, (spotify_id,))
        header = self.db_cursor.fetchone() 
        DATA = json.loads(header[0])
        Yearly = {}
        
        sql_get_advanced_stats_query = """SELECT advanced_stats_2008 FROM pulse.advanced_stats WHERE spotify_id = %s"""
        self.db_cursor.execute(sql_get_advanced_stats_query, (spotify_id,))
        year = self.db_cursor.fetchone() 
        Yearly['2008'] = json.loads(year[0])

        sql_get_advanced_stats_query = """SELECT advanced_stats_2009 FROM pulse.advanced_stats WHERE spotify_id = %s"""
        self.db_cursor.execute(sql_get_advanced_stats_query, (spotify_id,))
        year = self.db_cursor.fetchone() 
        Yearly['2009'] = json.loads(year[0])

        sql_get_advanced_stats_query = """SELECT advanced_stats_2010 FROM pulse.advanced_stats WHERE spotify_id = %s"""
        self.db_cursor.execute(sql_get_advanced_stats_query, (spotify_id,))
        year = self.db_cursor.fetchone() 
        Yearly['2010'] = json.loads(year[0])

        sql_get_advanced_stats_query = """SELECT advanced_stats_2011 FROM pulse.advanced_stats WHERE spotify_id = %s"""
        self.db_cursor.execute(sql_get_advanced_stats_query, (spotify_id,))
        year = self.db_cursor.fetchone() 
        Yearly['2011'] = json.loads(year[0])

        sql_get_advanced_stats_query = """SELECT advanced_stats_2012 FROM pulse.advanced_stats WHERE spotify_id = %s"""
        self.db_cursor.execute(sql_get_advanced_stats_query, (spotify_id,))
        year = self.db_cursor.fetchone() 
        Yearly['2012'] = json.loads(year[0])

        sql_get_advanced_stats_query = """SELECT advanced_stats_2013 FROM pulse.advanced_stats WHERE spotify_id = %s"""
        self.db_cursor.execute(sql_get_advanced_stats_query, (spotify_id,))
        year = self.db_cursor.fetchone() 
        Yearly['2013'] = json.loads(year[0])

        sql_get_advanced_stats_query = """SELECT advanced_stats_2014 FROM pulse.advanced_stats WHERE spotify_id = %s"""
        self.db_cursor.execute(sql_get_advanced_stats_query, (spotify_id,))
        year = self.db_cursor.fetchone() 
        Yearly['2014'] = json.loads(year[0])

        sql_get_advanced_stats_query = """SELECT advanced_stats_2015 FROM pulse.advanced_stats WHERE spotify_id = %s"""
        self.db_cursor.execute(sql_get_advanced_stats_query, (spotify_id,))
        year = self.db_cursor.fetchone() 
        Yearly['2015'] = json.loads(year[0])

        sql_get_advanced_stats_query = """SELECT advanced_stats_2016 FROM pulse.advanced_stats WHERE spotify_id = %s"""
        self.db_cursor.execute(sql_get_advanced_stats_query, (spotify_id,))
        year = self.db_cursor.fetchone() 
        Yearly['2016'] = json.loads(year[0])

        sql_get_advanced_stats_query = """SELECT advanced_stats_2017 FROM pulse.advanced_stats WHERE spotify_id = %s"""
        self.db_cursor.execute(sql_get_advanced_stats_query, (spotify_id,))
        year = self.db_cursor.fetchone() 
        Yearly['2017'] = json.loads(year[0])

        sql_get_advanced_stats_query = """SELECT advanced_stats_2018 FROM pulse.advanced_stats WHERE spotify_id = %s"""
        self.db_cursor.execute(sql_get_advanced_stats_query, (spotify_id,))
        year = self.db_cursor.fetchone() 
        Yearly['2018'] = json.loads(year[0])

        sql_get_advanced_stats_query = """SELECT advanced_stats_2019 FROM pulse.advanced_stats WHERE spotify_id = %s"""
        self.db_cursor.execute(sql_get_advanced_stats_query, (spotify_id,))
        year = self.db_cursor.fetchone() 
        Yearly['2019'] = json.loads(year[0])

        sql_get_advanced_stats_query = """SELECT advanced_stats_2020 FROM pulse.advanced_stats WHERE spotify_id = %s"""
        self.db_cursor.execute(sql_get_advanced_stats_query, (spotify_id,))
        year = self.db_cursor.fetchone() 
        Yearly['2020'] = json.loads(year[0])

        sql_get_advanced_stats_query = """SELECT advanced_stats_2021 FROM pulse.advanced_stats WHERE spotify_id = %s"""
        self.db_cursor.execute(sql_get_advanced_stats_query, (spotify_id,))
        year = self.db_cursor.fetchone() 
        Yearly['2021'] = json.loads(year[0])

        sql_get_advanced_stats_query = """SELECT advanced_stats_2022 FROM pulse.advanced_stats WHERE spotify_id = %s"""
        self.db_cursor.execute(sql_get_advanced_stats_query, (spotify_id,))
        year = self.db_cursor.fetchone() 
        Yearly['2022'] = json.loads(year[0])

        sql_get_advanced_stats_query = """SELECT advanced_stats_2023 FROM pulse.advanced_stats WHERE spotify_id = %s"""
        self.db_cursor.execute(sql_get_advanced_stats_query, (spotify_id,))
        year = self.db_cursor.fetchone() 
        Yearly['2023'] = json.loads(year[0])

        sql_get_advanced_stats_query = """SELECT advanced_stats_2024 FROM pulse.advanced_stats WHERE spotify_id = %s"""
        self.db_cursor.execute(sql_get_advanced_stats_query, (spotify_id,))
        year = self.db_cursor.fetchone() 
        Yearly['2024'] = json.loads(year[0])

        sql_get_advanced_stats_query = """SELECT advanced_stats_2025 FROM pulse.advanced_stats WHERE spotify_id = %s"""
        self.db_cursor.execute(sql_get_advanced_stats_query, (spotify_id,))
        year = self.db_cursor.fetchone() 
        Yearly['2025'] = json.loads(year[0])


        DATA['Yearly'] = Yearly
        return DATA
        if (results[0] is None or results == [] or results == "[]"):
            return None
        self.resultset = json.loads(results[0])
        if (self.resultset == []) or (self.resultset is None):
            return None
        return self.resultset
    
    
    # Returns the chosen song from DB as a string.
    def get_chosen_song_from_user_DB(self, spotify_id,):
        sql_get_chosen_song_query = "SELECT chosen_song from pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_chosen_song_query, (spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        return self.resultset[0]
    
    # Returns the color_palette from DB an 2D array with 5 rows and 5 columns.
    def get_color_palette_from_user_DB(self, spotify_id,):
        sql_get_color_palette_query = "SELECT color_palette from pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_color_palette_query, (spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        twod = string_to_array_row_by_col(self.resultset[0], 1, 4, False)
        return [twod[0][0], twod[0][1], twod[0][2], twod[0][3]]
    
    # Returns the saved_themes from DB an 2D array with 5 rows and 5 columns.
    def get_saved_themes_from_user_DB(self, spotify_id,):
        sql_get_saved_themes_query = "SELECT saved_themes from pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_saved_themes_query, (spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        packed_str = self.resultset[0]
        if (packed_str is None):
            return []
        count = 0
        for i in range(0, len(packed_str)):
            if packed_str[i] == ' ':
                count +=1
        row = 0
        if count == 4:
            row = 1
        elif count == 0:
            return []
        else:
            row = int(1 + (count - 4) / 5)
        return string_to_array_row_by_col(self.resultset[0], row, 5, False)
    
    # Returns the custom background from DB as a string.
    def get_custom_background_from_user_DB(self, spotify_id,):
        sql_get_custom_background_query = "SELECT custom_background from pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_custom_background_query, (spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        return self.resultset[0]

    # Returns the display name from DB as a string.
    def get_display_name_from_user_DB(self, spotify_id, data = None):
        sql_get_display_name_query = "SELECT display_name from pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_display_name_query, (spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        return self.resultset[0]

    # Returns followers from DB. Returns None if the follower dict is empty, and returns the json object if not
    def get_followers_from_DB(self, spotify_id):
        sql_get_followers_query = "SELECT followers from pulse.base_stats WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_followers_query, (spotify_id,))
        results = self.db_cursor.fetchone()
        if (results[0] is None or results == [] or results == "[]"):
            return None
        self.resultset = json.loads(results[0])
        if (self.resultset == []) or (self.resultset is None):
            return None
        return self.resultset
    
    # Returns friends array from DB in the form of an array.
    def get_friends_from_DB(self, spotify_id):
        sql_get_friends_query = "SELECT friends from pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_friends_query, (spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        if (self.resultset == None):
            return []
        else:
            return create_friends_array_from_DB(self.resultset[0])
    
    
    # Returns friend requests array from DB in the form of an array.
    def get_friend_requests_from_DB(self, spotify_id):
        sql_get_friend_requests_query = "SELECT friend_requests from pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_friend_requests_query, (spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        if (self.resultset == None):
            return []
        else:
            return create_friends_array_from_DB(self.resultset[0])
    
    # Returns game settings array from DB in the form of a 5x5 array.
    def get_game_settings_from_DB(self, spotify_id):
        sql_get_game_settings_query = "SELECT game_settings from pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_game_settings_query, (spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        return string_to_array_row_by_col(self.resultset[0], 5, 5, True)
    
    # Returns the gender from DB as a string.
    def get_gender_from_user_DB(self, spotify_id):
        sql = "SELECT gender from pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql, (spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        return self.resultset[0]
    
    # Returns the has_uploaded from DB as a string.
    def get_has_uploaded_from_user_DB(self, spotify_id):
        sql = "SELECT has_uploaded from pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql, (spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        return self.resultset[0]
    
    # Returns icon string from DB. Returns None if no icon exists, and a string if it does
    def get_icon_from_DB(self, spotify_id):
        sql_fetch_icon_string_query = """SELECT icon from pulse.users where spotify_id = %s"""
        self.db_cursor.execute(sql_fetch_icon_string_query, (spotify_id,))
        icon = self.db_cursor.fetchone()
        return icon[0]
        """
        sql_fetch_blob_query = SELECT icon from pulse.users where spotify_id = %s
        self.db_cursor.execute(sql_fetch_blob_query, (spotify_id,))
        icon = self.db_cursor.fetchall()
        if (icon[0] is None):
            #print ("No icon exists")
            return None
        # Icon exists
        else:
            #print("sending icon \n")
            # Convert binary data to proper format and write it on Hard Disk
            #with open(storage_loc, 'wb') as file:
            #file.write(image)
            return icon[0]
        """

    # Returns the feedback from DB as a string.
    def get_most_recent_individual_feedback_from_feedback_DB(self):
        sql = "SELECT individual_feedback FROM pulse.feedback ORDER BY feedback_idx1 DESC LIMIT 1;"
        self.db_cursor.execute(sql)
        self.resultset = self.db_cursor.fetchone()
        return self.resultset[0]

        

    # Returns layout from DB. Returns None if no layout exists, or the JSON obect if one does.
    def get_layout_from_DB(self, spotify_id):
        sql_get_layout_query = "SELECT layout from pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_layout_query, (spotify_id,))
        results = self.db_cursor.fetchone()
        if (results is [(None,)] or results == "" or results[0] is None):
            return None
        self.resultset = results[0]
        if (self.resultset is None or self.resultset == ""):
            return None
        
        return self.resultset
    
    # Returns the location from DB as a string.
    def get_location_from_user_DB(self, spotify_id):
        sql_get_location_query = "SELECT location from pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_location_query, (spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        return self.resultset[0]
    

    # Returns the song_match_number_swiped from DB as an int.
    def get_number_swiped_from_user_DB(self, spotify_id):
        sql_get_number_swiped_query = "SELECT song_match_number_swiped from pulse.base_stats WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_number_swiped_query, (spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        return self.resultset[0]
    
    # Returns the playlist counter from DB as an int
    def get_playlist_counter_from_base_stats_DB(self, spotify_id):
        sql_get_playlist_counter_query = "SELECT playlist_counter from pulse.base_stats WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_playlist_counter_query, (spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        return self.resultset[0]

    # Returns a whole row for the given spotify_id in the form of an array with elements of the table.   
    def get_row_from_user_DB(self, spotify_id, data = None):
        sql = "SELECT from pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql, (spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        return self.resultset
    
        # Returns a rec params as dict
    def get_recommendation_params_from_user_DB(self, spotify_id, data = None):
        sql = "SELECT recommendation_params from pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql, (spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        results = self.resultset
        if (results[0] is None or results == [] or results == "[]"):
            return None
        return json.loads(results[0])
    
    # Returns a song_match_rejected as a JSON
    def get_rejected_songs_from_DB(self, spotify_id):
        sql = "SELECT song_match_rejected from pulse.base_stats WHERE spotify_id = %s"
        self.db_cursor.execute(sql, (spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        results = self.resultset
        if (results[0] is None or results == [] or results == "[]"):
            return None
        return json.loads(results[0])
    
    # Returns a song_recommendation_queue from db as a JSON
    def get_song_recommendation_queue_from_DB(self, spotify_id):
        sql = "SELECT song_match_queue from pulse.base_stats WHERE spotify_id = %s"
        self.db_cursor.execute(sql, (spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        results = self.resultset
        if (results[0] is None or results == [] or results == "[]"):
            return None
        return json.loads(results[0])
    
    # Returns score array from DB in the form of a 5x10x10 array.
    def get_scores_from_DB(self, spotify_id):
        sql_get_scores_query = "SELECT high_scores from pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_scores_query, (spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        return score_string_to_array(self.resultset[0])
    
    # Returns an array from DB with each spotify_id as a string inside of it.
    def get_spotify_id_from_display_name_from_DB(self, display_name):
        sql_get_spotify_ids_query = "SELECT spotify_id from pulse.users WHERE display_name = %s"
        self.db_cursor.execute(sql_get_spotify_ids_query, (display_name,))
        self.resultset = self.db_cursor.fetchall()
        spotify_ids = []
        for row in self.resultset:
            spotify_ids.append(row[0])
        return spotify_ids
    
    # Returns song_match_swiped from DB in the form of a JSON.
    def get_swiped_songs_from_DB(self, spotify_id):
        sql_get_song_match_swiped_query = "SELECT song_match_swiped from pulse.base_stats WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_song_match_swiped_query, (spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        results = self.resultset
        if (results[0] is None or results == [] or results == "[]"):
            return None
        return json.loads(results[0])
    
    # Returns swiping preferences from DB in the form of a JSON.
    def get_swiping_preferences_from_DB(self, spotify_id):
        sql_get_song_match_preferences_query = "SELECT song_match_preferences from pulse.base_stats WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_song_match_preferences_query, (spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        results = self.resultset
        if (results[0] is None or results == [] or results == "[]"):
            return None
        return json.loads(results[0])
    
    # Returns text_size from DB when given spotify_id. Returns 0,1, or 2            
    def get_text_size_from_DB(self,spotify_id):
        sql_get_text_size_query = "SELECT text_size from pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_text_size_query, (spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        return int(self.resultset[0])
    
    # Returns theme from DB when given spotify_id. Returns 0, or 1.          
    def get_theme_from_DB(self, spotify_id):
        sql_get_theme_query = "SELECT theme from pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_theme_query, (spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        return int(self.resultset[0])

    # Returns a newly created user object recreated from the user database given spotify_id
    def get_user_from_user_DB(self, spotify_id):
        sql_get_full_user_query = """SELECT * from pulse.users where spotify_id = %s"""
        self.db_cursor.execute(sql_get_full_user_query, (spotify_id,))
        record = self.db_cursor.fetchall()
        #TODO no need for loop
        for row in record:
            userFromDB = User(display_name=row[1],                                                              
                         login_token=json.loads(row[2]),                                                               
                         spotify_id=row[3],                                                             
                         friends=create_friends_array_from_DB(row[4]),        
                         theme=Theme(row[5]),
                         location = row[9],
                         gender = row[10],
                         chosen_song = row[15],)       
            return userFromDB

    #--------------------------------------------------------------------------------------------------------
    # Database storage/update 

    # Updates advanced_stats (expected JSON object) in user DB. Returns 1 if successful, -1 if not.
    def update_advanced_stats(self, spotify_id, new_advanced_stats):
        yearly_values = [{}] * 18
        try:
            yearly = new_advanced_stats.get("Yearly", {})
            new_advanced_stats["Yearly"] = {}
            years = [None] * 18
            
            
            for year in yearly.keys():
                year_int = int(year)
                years[year_int - 2008] = yearly[year]
            
            yearly_values = [json.dumps(value) for value in years[:18]]
        except Exception as e:
            print("Error while processing")
            print(str(e))
        
        try:
            sql_update_advanced_stats_query = """UPDATE pulse.advanced_stats SET advanced_stats_header = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_advanced_stats_query, (new_advanced_stats, spotify_id,))
            self.db_conn.commit()
            sql_update_advanced_stats_query = """UPDATE pulse.advanced_stats SET advanced_stats_2008 = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_advanced_stats_query, (yearly_values[0], spotify_id,))
            self.db_conn.commit()
            sql_update_advanced_stats_query = """UPDATE pulse.advanced_stats SET advanced_stats_2009 = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_advanced_stats_query, (yearly_values[1], spotify_id,))
            self.db_conn.commit()
            sql_update_advanced_stats_query = """UPDATE pulse.advanced_stats SET advanced_stats_2010 = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_advanced_stats_query, (yearly_values[2], spotify_id,))
            self.db_conn.commit()
            sql_update_advanced_stats_query = """UPDATE pulse.advanced_stats SET advanced_stats_2011 = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_advanced_stats_query, (yearly_values[3], spotify_id,))
            self.db_conn.commit()
            sql_update_advanced_stats_query = """UPDATE pulse.advanced_stats SET advanced_stats_2012 = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_advanced_stats_query, (yearly_values[4], spotify_id,))
            self.db_conn.commit()
            sql_update_advanced_stats_query = """UPDATE pulse.advanced_stats SET advanced_stats_2013 = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_advanced_stats_query, (yearly_values[5], spotify_id,))
            self.db_conn.commit()
            sql_update_advanced_stats_query = """UPDATE pulse.advanced_stats SET advanced_stats_2014 = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_advanced_stats_query, (yearly_values[6], spotify_id,))
            self.db_conn.commit()
            sql_update_advanced_stats_query = """UPDATE pulse.advanced_stats SET advanced_stats_2015 = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_advanced_stats_query, (yearly_values[7], spotify_id,))
            self.db_conn.commit()
            sql_update_advanced_stats_query = """UPDATE pulse.advanced_stats SET advanced_stats_2016 = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_advanced_stats_query, (yearly_values[8], spotify_id,))
            self.db_conn.commit()
            sql_update_advanced_stats_query = """UPDATE pulse.advanced_stats SET advanced_stats_2017 = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_advanced_stats_query, (yearly_values[9], spotify_id,))
            self.db_conn.commit()
            sql_update_advanced_stats_query = """UPDATE pulse.advanced_stats SET advanced_stats_2018 = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_advanced_stats_query, (yearly_values[10], spotify_id,))
            self.db_conn.commit()
            sql_update_advanced_stats_query = """UPDATE pulse.advanced_stats SET advanced_stats_2019 = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_advanced_stats_query, (yearly_values[11], spotify_id,))
            self.db_conn.commit()
            sql_update_advanced_stats_query = """UPDATE pulse.advanced_stats SET advanced_stats_2020 = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_advanced_stats_query, (yearly_values[12], spotify_id,))           
            self.db_conn.commit()
            sql_update_advanced_stats_query = """UPDATE pulse.advanced_stats SET advanced_stats_2021 = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_advanced_stats_query, (yearly_values[13], spotify_id,))
            self.db_conn.commit()
            sql_update_advanced_stats_query = """UPDATE pulse.advanced_stats SET advanced_stats_2022 = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_advanced_stats_query, (yearly_values[14], spotify_id,))
            self.db_conn.commit()
            sql_update_advanced_stats_query = """UPDATE pulse.advanced_stats SET advanced_stats_2023 = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_advanced_stats_query, (yearly_values[15], spotify_id,))
            self.db_conn.commit()
            sql_update_advanced_stats_query = """UPDATE pulse.advanced_stats SET advanced_stats_2024 = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_advanced_stats_query, (yearly_values[16], spotify_id,))
            self.db_conn.commit()
            sql_update_advanced_stats_query = """UPDATE pulse.advanced_stats SET advanced_stats_2025 = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_advanced_stats_query, (yearly_values[17], spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating advanced stats:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed
        
    # Updates chosen_song (expected string) in user DB. Returns 1 if successful, -1 if not.
    def update_chosen_song(self, spotify_id, new_chosen_song):
        try:
            sql_update_chosen_song_query = """UPDATE pulse.users SET chosen_song = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_chosen_song_query, (new_chosen_song, spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating display name:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed

        
    # Updates saved_themes (expected row x col array) in user DB. Returns 1 if sucessful, -1 if not
    def update_saved_themes(self, spotify_id, new_saved_themes):
        try:
            sql_update_saved_themes = """UPDATE pulse.users SET saved_themes = %s WHERE spotify_id = %s"""
            if (new_saved_themes == []):
                self.db_cursor.execute(sql_update_saved_themes, ("", spotify_id,))
            else:
                self.db_cursor.execute(sql_update_saved_themes, (array_to_string(new_saved_themes), spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating followers:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed
        
    # Updates color_palette (expected row x col array) in user DB. Returns 1 if sucessful, -1 if not
    def update_color_palette(self, spotify_id, new_color_palette):
        try:
            sql_update_color_palette_query = """UPDATE pulse.users SET color_palette = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_color_palette_query, (array_to_string(new_color_palette), spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating followers:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed
        
    # Updates custom_background (expected string) in user DB. Returns 1 if successful, -1 if not.
    def update_custom_background(self, spotify_id, new_custom_background):
        try:
            sql_update_custom_background_query = """UPDATE pulse.users SET custom_background = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_custom_background_query, (new_custom_background, spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating display name:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed

    # Updates display_name (expected string) in user DB. Returns 1 if successful, -1 if not.
    def update_display_name(self, spotify_id, new_display_name):
        try:
            sql_update_display_name_query = """UPDATE pulse.users SET display_name = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_display_name_query, (new_display_name, spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating display name:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed

    
    # Updates followers (expected dictionary) in user DB. Returns 1 if sucessful, 0 if not
    def update_followers(self, spotify_id, new_date, new_count):
        master_followers_dict = self.get_followers_from_DB(spotify_id)
        try:
            sql_update_followers = """UPDATE pulse.base_stats SET followers = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_followers, (json.dumps(update_followers_dictionary(master_followers_dict, new_date, new_count)), spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating followers:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed
    
    # Updates friends in user DB. Expects spotify id and spotify id to be added or removed. addition = true if adding the spotify id and false if removing.
    # Returns 1 if successful, -1 if not.
    def update_friends(self, spotify_id, new_friend_spotify_id, addition):
        master_friends_array_dict = self.get_friends_from_DB(spotify_id)
        try:
            sql_update_friends_query = """UPDATE pulse.users SET friends = %s WHERE spotify_id = %s"""
            if (addition):
                self.db_cursor.execute(sql_update_friends_query, (create_friends_string_for_DB(add_friend(master_friends_array_dict, new_friend_spotify_id)), spotify_id,))
            else:
                self.db_cursor.execute(sql_update_friends_query, (create_friends_string_for_DB(remove_friend(master_friends_array_dict, new_friend_spotify_id)), spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating friends:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed
        
    # Updates friend requests in user DB. Expects spotify id and new friend request spotify id to be added. addition = true if adding the spotify id and false if removing.
    # Returns 1 if successful, -1 if not.
    def update_friend_requests(self, spotify_id, new_friend_request_spotify_id, addition):
        master_friend_requests_array_dict = self.get_friend_requests_from_DB(spotify_id)
        try:
            sql_update_friend_requests_query = """UPDATE pulse.users SET friend_requests = %s WHERE spotify_id = %s"""
            
            if (addition):
                self.db_cursor.execute(sql_update_friend_requests_query, (create_friends_string_for_DB(add_friend(master_friend_requests_array_dict, new_friend_request_spotify_id)), spotify_id,))
            else:
                self.db_cursor.execute(sql_update_friend_requests_query, (create_friends_string_for_DB(remove_friend(master_friend_requests_array_dict, new_friend_request_spotify_id)), spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating friend requests:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed
    
    # Update gender (expected string) in user DB. Returns 1 if successful, -1 if not.
    def update_gender(self, spotify_id, new_gender):
        try:
            sql_update_gender_query = """UPDATE pulse.users SET gender = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_gender_query, (new_gender, spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating gender:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed
        
    # Update has_uploaded (expected int 0 or 1) in user DB. Returns 1 if successful, -1 if not.
    def update_has_uploaded(self, spotify_id, bool):
        try:
            sql_has_uploaded_query = """UPDATE pulse.users SET has_uploaded = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_has_uploaded_query, (bool, spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating gender:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed

    # Updates icon (expected string) in user DB. Returns 1 if successful, -1 if not.
    def update_icon(self, spotify_id, new_icon):
        try:
            sql_update_icon_query = """UPDATE pulse.users SET icon = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_icon_query, (new_icon, spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating icon:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed
        
    
    # Updates individual_feedback (expected string) in feedback DB. Returns 1 if successful, 0 if not.
    def update_individual_feedback(self, new_individual_feedback):
        try:
            sql_update_individual_feedback_query = """INSERT INTO pulse.feedback (individual_feedback) VALUES (%s)"""
            self.db_cursor.execute(sql_update_individual_feedback_query, (new_individual_feedback,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating display name:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed

    # Update layout (expected JSON object) in user DB. Returns 1 if successful, -1 if not.
    def update_layout(self, spotify_id, new_layout):
        try:
            sql_update_layout_query = """UPDATE pulse.users SET layout = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_layout_query, (json.dumps(new_layout), spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating layout:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed
    
    # Update layout (expected string) in user DB. Returns 1 if successful, -1 if not.
    def update_location(self, spotify_id, new_location):
        try:
            sql_update_location_query = """UPDATE pulse.users SET location = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_location_query, (new_location, spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating location:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed
        
    # Update song_match_number_swiped (expected int) in user DB. Returns 1 if successful, -1 if not.
    def update_song_match_number_swiped(self, spotify_id, new_number_swiped):
        try:
            sql_number_swiped_query = """UPDATE pulse.base_stats SET song_match_number_swiped = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_number_swiped_query, (new_number_swiped, spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating location:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed
        
    #Increments playlist_counter by 1 for the given spotify ID    
    def update_playlist_counter(self, spotify_id):
        new_counter = self.get_playlist_counter_from_base_stats_DB(spotify_id) + 1
        try:
            sql_update_playlist_counter_query = """UPDATE pulse.base_stats SET playlist_counter = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_playlist_counter_query, (new_counter, spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating location:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed


    # Update recommendation (expected JSON) in user DB. Returns 1 if successful, -1 if not.
    def update_recommendation_params(self, spotify_id, new_rec_params):
        try:
            sql_update_rec_params_query = """UPDATE pulse.users SET recommendation_params = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_rec_params_query, (json.dumps(new_rec_params), spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating params:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed        
        
    # Update song_match_rejected (expected 1D Array) in base_stats DB. Returns 1 if successful, -1 if not.
    def update_rejected_songs(self, spotify_id, new_rejected):
        try:
            sql_update_song_match_rejected_query = """UPDATE pulse.base_stats SET song_match_rejected = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_song_match_rejected_query, (json.dumps(new_rejected), spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating params:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed     
        
    # Update song_match_queue (expected JSON) in base_stats DB. Returns 1 if successful, -1 if not.
    def update_song_recommendation_queue(self, spotify_id, new_queue):
        try:
            sql_update_song_match_queue_query = """UPDATE pulse.base_stats SET song_match_queue = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_song_match_queue_query, (json.dumps(new_queue), spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating params:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed 
    
    # Updates scores (expected 1D Array and game to update in form of int 0-4) in user DB. Returns 1 if successful, -1 if not. 
    def update_scores(self, spotify_id, new_score_array, game):
        
        master_scores = self.get_scores_from_DB(spotify_id)
        try:
            sql_update_scores_query = """UPDATE pulse.users SET high_scores = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_scores_query, (score_array_to_string(update_new_score_and_delete_oldest(master_scores,new_score_array,game)), spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating scores:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed   

    # Updates song_match_preferences (expected 1JSON) in base_stats DB. Returns 1 if successful, -1 if not. 
    def update_swiping_preferences(self, spotify_id, new_preferences):
        try:
            sql_update_song_match_preferences_query = """UPDATE pulse.base_stats SET song_match_preferences = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_song_match_preferences_query, (json.dumps(new_preferences), spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating scores:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed   
        
    # Updates song_match_swiped (expected JSON) in base_stats DB. Returns 1 if successful, -1 if not. 
    def update_swiped_songs(self, spotify_id, new_swiped):
        try:
            sql_update_song_match_swiped_query = """UPDATE pulse.base_stats SET song_match_swiped = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_song_match_swiped_query, (json.dumps(new_swiped), spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating scores:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed   
    
    # Updates game settings (expected 1D Array and game to update in form of int 0-4) in user DB. Returns 1 if successful, -1 if not. 
    def update_game_settings(self, spotify_id, new_settings_array, game):
        
        master_game_settings = self.get_game_settings_from_DB(spotify_id)
        try:
            sql_update_game_settings_query = """UPDATE pulse.users SET game_settings = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_game_settings_query, (array_to_string(edit_game_settings(master_game_settings,new_settings_array,game)), spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating game_settings:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed   
    # Update text_size (expected int) in user DB. Returns 1 if successful, -1 if not.
    def update_text_size(self, spotify_id, new_text_size):
        try:
            sql_update_text_size_query = """UPDATE pulse.users SET text_size = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_text_size_query, (new_text_size, spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating text size:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed
    
    # Update theme (expected int) in user DB. Returns 1 if successful, -1 if not.
    def update_theme(self, spotify_id, new_theme):
        try:
            sql_update_theme_query = """UPDATE pulse.users SET theme = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_theme_query, (new_theme, spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating theme:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed
        
    # Update token (expected JSON object) in user DB. Returns 1 if successful, -1 if not. 
    def update_token(self, spotify_id, login_token):
        try:
            sql_update_token_query = """UPDATE pulse.users SET login_token = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_token_query, (json.dumps(login_token), spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating token:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed

#--------------------------------------------------------------------------------------------------------
# Conversion functions to and from DB

def create_friends_string_for_DB(friends_input_array):
    friends_string = ""
    for friend in friends_input_array:
        if (friends_string == ""):
            friends_string = friends_string + friend
        else:
            friends_string = friends_string + "," + friend
    return friends_string

def create_highscore_string_for_DB(highscore_input_array):
    highscore_string = ""
    for score in highscore_input_array:
        if (highscore_string == ""):
            highscore_string = highscore_string + str(score)
        else:
            highscore_string = highscore_string + "," + str(score)
    return highscore_string

def create_rec_params_string_for_DB(rec_input_array):
    rec_string = ""
    for rec_value in rec_input_array:
        if (rec_string == ""):
            rec_string = rec_string + str(rec_value)
        else:
            rec_string = rec_string + "," + str(rec_value)
    return rec_string

def create_friends_array_from_DB(friends_input_string):
    if (friends_input_string == "" or friends_input_string == None):
        return []
    return friends_input_string.split(',')

def create_highscores_array_from_DB(highscore_input_string):
    if (highscore_input_string == ""):
        return []
    high_scores = [int(x) for x in highscore_input_string.split(',')]
    return high_scores

def create_rec_params_from_DB(rec_input_string):
    if (rec_input_string == ""):
        return []
    recommendation_params = [float(x) for x in rec_input_string.split(',')]
    return recommendation_params

def array_to_string(game_settings_input_array):
    # Convert the 2D array to a string by flattening it
    flattened = [str(item) for sublist1 in game_settings_input_array for item in sublist1]
    return ' '.join(flattened)

def string_to_array_row_by_col(game_settings_input_string, row, col, is_int):
    # Convert the string back to a 2D array
    elements = game_settings_input_string.split()
    if (is_int):
        flat_list = [int(element) for element in elements]
    else:
        flat_list = [str(element) for element in elements]
    
    # Create a 3D array from the flattened
    arr = []
    index = 0
    for dim1 in range(row):
        sublist1 = []
        for dim2 in range(col):
            sublist1.append(flat_list[index])
            index += 1
        arr.append(sublist1)
    return arr



def score_array_to_string(score_input_array):
    # Convert the 3D array to a string by flattening it
    flattened = [str(item) for sublist1 in score_input_array for sublist2 in sublist1 for item in sublist2]
    return ' '.join(flattened)

def score_string_to_array(score_input_string):
    # Convert the string back to a 3D array
    elements = score_input_string.split()
    flat_list = [int(element) for element in elements]
    
    # Create a 3D array from the flattened
    arr = []
    index = 0
    for dim1 in range(5):
        sublist1 = []
        for dim2 in range(10):
            sublist2 = []
            for dim3 in range(10):
                sublist2.append(flat_list[index])
                index += 1
            sublist1.append(sublist2)
        arr.append(sublist1)
    
    return arr

def update_followers_dictionary(followers_dict, new_date, new_count):
    if (followers_dict is None):
        master_dict = {}
    else:
        master_dict = followers_dict
    date_string = new_date.strftime("%Y-%m-%d %H:%M:%S")
    master_dict[date_string] = new_count
    return master_dict

def add_friend(friends, new_friend):
    if (friends is None):
        master_friends = []
    else:
        master_friends = friends
    master_friends.append(new_friend)
    return master_friends

def remove_friend(friends, friend_to_remove):
    if (friends is None):
        master_friends = []
    else:
        master_friends = friends
    if friend_to_remove in master_friends:
        master_friends.remove(friend_to_remove)
    return master_friends

#game = 0, 1, 2, 3, or 4 
def update_new_score_and_delete_oldest(arr_3d, new_array, game):
    # Update the first array with the new 2D array
    arr_3d[game].insert(0, new_array)
    # Remove the last array
    arr_3d[game].pop()
    return  arr_3d

#game = 0, 1, 2, 3, or 4 
def edit_game_settings(arr_2d, new_array, game):
    # Update the first array with the new 2D array
    arr_2d.insert(game, new_array)
    # Remove the last array
    arr_2d.pop()
    return  arr_2d

db_config =  {
            'host':"pulse-sql-server.mysql.database.azure.com",  # database host
            'port': 3306,                                        # port
            'user':"pulse_admin_userz",                          # username
            'passwd':"PurdueCS307R0cks!&!",                      # password
            'db':"pulse",                                        # database
            'charset':'utf8'                                     # charset encoding
            }

#TODO: 
#requests doesn't update unless page is reloaded. Same with Friends page and friends card