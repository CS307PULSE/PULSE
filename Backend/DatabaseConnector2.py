import mysql.connector
from .User import User
from .User import Theme
import json

#SKIPPED ADVANCED STATS

class DatabaseConnector2(object):
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

    #Returns a string from the targetDatabase given the desired field and spotify_id
    def get_string_from_DB(self, spotify_id, field, targetDatabase):
        query = "SELECT %s from pulse.%s WHERE spotify_id = %s"
        self.db_cursor.execute(query, (field, targetDatabase, spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        return self.resultset[0]
    
    #Returns an int from the targetDatabase given the desired field and spotify_id
    def get_int_from_DB(self, spotify_id, field, targetDatabase):
        query = "SELECT %s from pulse.%s WHERE spotify_id = %s"
        self.db_cursor.execute(query, (field, targetDatabase, spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        return int(self.resultset[0]) 

    #Returns a python object from the targetDatabase given the desired field and spotify_id
    def get_json_from_DB(self, spotify_id, field, targetDatabase):
        query = "SELECT %s from pulse.%s WHERE spotify_id = %s"       
        self.db_cursor.execute(query, (field, targetDatabase, spotify_id,))
        self.resultset = self.db_cursor.fetchone()
        results = self.resultset
        if (results[0] is None or results == [] or results == "[]"):
            return None
        return json.loads(results[0])
    
    #Returns an array from the given the desired field and spotify_id. 
    #Note that spotify_id is actually display_name when attempting to generate spotify_ids for friend search.
    def get_array_from_DB(self, spotify_id, field):
        match field:
            case 'color_palette':
                query = "SELECT color_palette from pulse.users WHERE spotify_id = %s"
                self.db_cursor.execute(query, (spotify_id,))
                self.resultset = self.db_cursor.fetchone()
                twod = string_to_array_row_by_col(self.resultset[0], 1, 4, False)
                return [twod[0][0], twod[0][1], twod[0][2], twod[0][3]]
            case 'saved_themes': 
                query = "SELECT saved_themes from pulse.users WHERE spotify_id = %s"
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
                query = "SELECT %s from pulse.users WHERE spotify_id = %s"
                self.db_cursor.execute(query, (field, spotify_id,))
                self.resultset = self.db_cursor.fetchone()
                if (self.resultset == None):
                    return []
                else:
                    return create_friends_array_from_DB(self.resultset[0])
            case "game_settings":
                query = "SELECT game_settings from pulse.users WHERE spotify_id = %s"
                self.db_cursor.execute(query, (spotify_id,))
                self.resultset = self.db_cursor.fetchone()
                return string_to_array_row_by_col(self.resultset[0], 5, 5, True)
            case "high_scores":
                query = "SELECT high_scores from pulse.users WHERE spotify_id = %s"
                self.db_cursor.execute(query, (spotify_id,))
                self.resultset = self.db_cursor.fetchone()
                return score_string_to_array(self.resultset[0])
            case "spotify_id":
                query = "SELECT spotify_id from pulse.users WHERE display_name = %s"
                self.db_cursor.execute(query, (spotify_id,))
                self.resultset = self.db_cursor.fetchall()
                spotify_ids = []
                for row in self.resultset:
                    spotify_ids.append(row[0])
                return spotify_ids
            case _: 
                print("ERROR HOW DID YOU GET HERE")
                return None


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