import mysql.connector
from .User import User
from .User import Theme
import json

#SKIPPED ADVANCED STATS

class DBConnector(object):
    USER_INFO_DB = "users"
    USER_BASE_STATS_DB = "base_stats"
    USER_ADVANCED_STATS_DB = "advacanced_stats"
    FEEDBACK_DB = "feedback"
    
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
    
    #Checks if user exists across all tables.
    def does_user_exist(self, spotify_id):
        query = "SELECT COUNT(*) AS row_count FROM pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(query, (spotify_id,))
        result = self.db_cursor.fetchone()
        row_count = result[0]
        if (row_count == 0):
            return False
        else: 
            return True
        
 #--------------------------------------------------------------------------------------------------------
# User creation

    #Stores a new user in the user DB given the user object. Returns 1 if successful, -1 if not.
    def create_new_user_in_every_DB(self, new_user):
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

    #Returns a string from the targetDatabase given the desired field and spotify_id
    def get_string_from_DB(self, spotify_id, field, targetDatabase):
        query = """SELECT %s from pulse.%s WHERE spotify_id = %s"""
        self.db_cursor.execute(query, (field, targetDatabase, spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        return self.resultset[0]
    
    #Returns an int from the targetDatabase given the desired field and spotify_id
    def get_int_from_DB(self, spotify_id, field, targetDatabase):
        query = """SELECT %s from pulse.%s WHERE spotify_id = %s"""
        self.db_cursor.execute(query, (field, targetDatabase, spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        return int(self.resultset[0]) 

    #Returns a python object from the targetDatabase given the desired field and spotify_id
    def get_json_from_DB(self, spotify_id, field, targetDatabase):
        query = """SELECT %s from pulse.%s WHERE spotify_id = %s"""     
        self.db_cursor.execute(query, (field, targetDatabase, spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        results = self.resultset
        if (results[0] is None or results == [] or results == "[]" or results == ""):
            return None
        return json.loads(results[0])
    
    #Returns an array from the given the desired field and spotify_id. 
    #Note that spotify_id is actually display_name when attempting to generate spotify_ids for friend search.
    def get_array_from_DB(self, spotify_id, field):
        match field:
            case 'color_palette':
                query = """SELECT color_palette from pulse.users WHERE spotify_id = %s"""
                self.db_cursor.execute(query, (spotify_id,))
                self.resultset = self.db_cursor.fetchone()
                twod = string_to_array_row_by_col(self.resultset[0], 1, 4, False)
                return [twod[0][0], twod[0][1], twod[0][2], twod[0][3]]
            case 'saved_themes': 
                query = """SELECT saved_themes from pulse.users WHERE spotify_id = %s"""
                self.db_cursor.execute(query, (spotify_id,))
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
            case "friends" | "friend_requests":
                query = """SELECT %s from pulse.users WHERE spotify_id = %s"""
                self.db_cursor.execute(query, (field, spotify_id,))
                self.resultset = self.db_cursor.fetchone()
                if (self.resultset == None):
                    return []
                else:
                    return create_friends_array_from_DB(self.resultset[0])
            case "game_settings":
                query = """SELECT game_settings from pulse.users WHERE spotify_id = %s"""
                self.db_cursor.execute(query, (spotify_id,))
                self.resultset = self.db_cursor.fetchone()
                return string_to_array_row_by_col(self.resultset[0], 5, 5, True)
            case "high_scores":
                query = """SELECT high_scores from pulse.users WHERE spotify_id = %s"""
                self.db_cursor.execute(query, (spotify_id,))
                self.resultset = self.db_cursor.fetchone()
                return score_string_to_array(self.resultset[0])
            case "spotify_id":
                query = """SELECT spotify_id from pulse.users WHERE display_name = %s"""
                self.db_cursor.execute(query, (spotify_id,))
                self.resultset = self.db_cursor.fetchall()
                spotify_ids = []
                for row in self.resultset:
                    spotify_ids.append(row[0])
                return spotify_ids
            case "user_match_queue" | "user_match_swiped" | "user_match_genre_groups":
                query = """SELECT %s from pulse.base_stats WHERE spotify_id = %s"""
                self.db_cursor.execute(query, (field, spotify_id,))
                self.resultset = self.db_cursor.fetchone()
                if (self.resultset == None):
                    return []
                else:
                    return create_friends_array_from_DB(self.resultset[0])
            case _: 
                print("ERROR HOW DID YOU GET HERE")
                return None
             
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
    
    def get_entire_genre_groups_from_DB(self, spotify_id, genre_groups):
        entire_genre_groups = []
        for genre in genre_groups:
            query = """SELECT %s from pulse.user_match_genres WHERE iduser_match_genres = 1"""
            self.db_cursor.execute(query, ("genre" + str(genre),))
            self.resultset = self.db_cursor.fetchone()
            if (self.resultset != None and self.resultset != '' ):
                for spotify_id in create_friends_array_from_DB(self.resultset[0]):
                    entire_genre_groups.append(spotify_id)
        if (entire_genre_groups == []):
            return []
        else:
            no_dupes = []
            [no_dupes.append(x) for x in entire_genre_groups if x not in no_dupes]
            return no_dupes
#--------------------------------------------------------------------------------------------------------
# Database storage/update 

# Updates a given string field in the database given the updated_string and target_table,
    def update_string_in_DB(self, spotify_id, updated_string, field, target_table):
        try:
            query = """UPDATE pulse.%s SET %s = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(query, (target_table, field, updated_string, spotify_id,))
            self.db_conn.commit()
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating string:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed
        
# Updates a given integer field in the database given the updated_int and target_table,
    def update_int_in_DB(self, spotify_id, updated_int, field, target_table):
        try:
            query = """UPDATE pulse.%s SET %s = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(query, (target_table, field, updated_int, spotify_id,))
            self.db_conn.commit()
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating string:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed
    
 # Updates a given json field in the database given the updated_int and target_table,   
    def update_json_in_DB(self, spotify_id, updated_json, field, target_table):
        try:
            query = """UPDATE pulse.%s SET %s = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(query, (target_table, field, json.dumps(updated_json), spotify_id,))
            self.db_conn.commit()
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating layout:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed
    
    def update_array_in_DB(self, spotify_id, updated_array, field, target_table):
        match field:
            case "saved_themes":
                try:
                    query = """UPDATE pulse.%s SET %s = %s WHERE spotify_id = %s"""
                    if (updated_array == []):
                        self.db_cursor.execute(query, (target_table, field, "", spotify_id,))
                    else:
                        self.db_cursor.execute(query, (array_to_string(updated_array), spotify_id,))
                    self.db_conn.commit()
                    affected_rows = self.db_cursor.rowcount
                    return affected_rows
                except Exception as e:
                    # Handle any exceptions that may occur during the database operation.
                    print("Error updating followers:", str(e))
                    self.db_conn.rollback()
                    return -1  # Indicate that the update failed
            case "color_palette":
                try:
                    query = """UPDATE pulse.%s SET %s = %s WHERE spotify_id = %s"""
                    self.db_cursor.execute(query, (target_table, field, array_to_string(updated_array), spotify_id,))
                    self.db_conn.commit()
                    affected_rows = self.db_cursor.rowcount
                    return affected_rows
                except Exception as e:
                    # Handle any exceptions that may occur during the database operation.
                    print("Error updating followers:", str(e))
                    self.db_conn.rollback()
                    return -1  # Indicate that the update failed
            case "user_match_queue" | "user_match_swiped" | "user_match_genre_groups":
                try:
                    query = """UPDATE pulse.base_stats SET friends = %s WHERE spotify_id = %s"""
                    self.db_cursor.execute(query, (create_friends_string_for_DB(updated_array), spotify_id,))
                    self.db_conn.commit()
                    affected_rows = self.db_cursor.rowcount
                    return affected_rows
                except Exception as e:
                    # Handle any exceptions that may occur during the database operation.
                    print("Error updating friends:", str(e))
                    self.db_conn.rollback()
                    return -1  # Indicate that the update failed
            case _:
                print("HOW")
                return
            
    # Updates followers (expected dictionary) in user DB. Returns 1 if sucessful, 0 if not
    def update_followers(self, spotify_id, new_date, new_count):
        master_followers_dict = self.get_followers_from_DB(spotify_id)
        try:
            sql_update_followers = """UPDATE pulse.base_stats SET followers = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_followers, (json.dumps(update_followers_dictionary(master_followers_dict, new_date, new_count)), spotify_id,))
            self.db_conn.commit()
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
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating friend requests:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed
       


# Updates individual_feedback (expected string) in feedback DB. Returns 1 if successful, 0 if not.
    def update_individual_feedback(self, new_individual_feedback):
        try:
            sql_update_individual_feedback_query = """INSERT INTO pulse.feedback (individual_feedback) VALUES (%s)"""
            self.db_cursor.execute(sql_update_individual_feedback_query, (new_individual_feedback,))
            self.db_conn.commit()
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating display name:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed
    
#Increments playlist_counter by 1 for the given spotify ID    
    def update_playlist_counter(self, spotify_id):
        new_counter = self.get_playlist_counter_from_base_stats_DB(spotify_id) + 1
        try:
            sql_update_playlist_counter_query = """UPDATE pulse.base_stats SET playlist_counter = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_playlist_counter_query, (new_counter, spotify_id,))
            self.db_conn.commit()
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating location:", str(e))
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
    
    # Updates game settings (expected 1D Array and game to update in form of int 0-4) in user DB. Returns 1 if successful, -1 if not. 
    def update_game_settings(self, spotify_id, new_settings_array, game):
        
        master_game_settings = self.get_game_settings_from_DB(spotify_id)
        try:
            sql_update_game_settings_query = """UPDATE pulse.users SET game_settings = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_game_settings_query, (array_to_string(edit_game_settings(master_game_settings,new_settings_array,game)), spotify_id,))
            self.db_conn.commit()
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating game_settings:", str(e))
            self.db_conn.rollback()
            return -1  # Indicate that the update failed   
    
    def update_entire_genre_groups(self, spotify_id, genre_groups):
        for genre in genre_groups:
            checker_query = """SELECT %s from pulse.user_match_genres WHERE iduser_match_genres = 1"""
            self.db_cursor.execute(checker_query, ("genre" + str(genre),))
            self.resultset = self.db_cursor.fetchone()
            if (self.resultset != None and self.resultset != '' ):
                id_list = create_friends_array_from_DB(self.resultset[0])
                if (spotify_id not in id_list):
                    id_list.append(spotify_id)
                    adder_query = """UPDATE pulse.user_match_genres SET %s = %s WHERE iduser_match_genres = 1"""
                    try:
                        self.db_cursor.execute(adder_query, ("genre" + str(genre), create_friends_string_for_DB(id_list),))
                        self.db_conn.commit()
                    except Exception as e:
                        # Handle any exceptions that may occur during the database operation.
                        print("Error updating game_settings:", str(e))
                        self.db_conn.rollback()
                        return -1  # Indicate that the update failed   
                    
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
        
        
#--------------------------------------------------------------------------------------------------------
# Array packers and unpackers

def create_friends_string_for_DB(friends_input_array):
    friends_string = ""
    for friend in friends_input_array:
        if (friends_string == ""):
            friends_string = friends_string + friend
        else:
            friends_string = friends_string + "," + friend
    return friends_string

def create_friends_array_from_DB(friends_input_string):
    if (friends_input_string == "" or friends_input_string == None):
        return []
    return friends_input_string.split(',')

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

def array_to_string(game_settings_input_array):
    # Convert the 2D array to a string by flattening it
    flattened = [str(item) for sublist1 in game_settings_input_array for item in sublist1]
    return ' '.join(flattened)

def score_array_to_string(score_input_array):
    # Convert the 3D array to a string by flattening it
    flattened = [str(item) for sublist1 in score_input_array for sublist2 in sublist1 for item in sublist2]
    return ' '.join(flattened)

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