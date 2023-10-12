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
    
    # Checks if user exists. Returns 0, or 1. If multiple users exist, returns 0 with an error message
    def does_user_exist_in_DB(self, spotify_id):
        sql_check_user_exists_query = "SELECT COUNT(*) AS row_count FROM pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql_check_user_exists_query, (spotify_id,))
        result = self.db_cursor.fetchone()
        row_count = result[0]
        if (row_count == 0):
            return False
        else: 
            return True
        
    def does_user_exist_in_stats_DB(self, spotify_id):
        sql_check_user_exists_query = "SELECT COUNT(*) AS row_count FROM pulse.base_stats WHERE spotify_id = %s"
        self.db_cursor.execute(sql_check_user_exists_query, (spotify_id,))
        result = self.db_cursor.fetchone()
        row_count = result[0]
        if (row_count == 0):
            return False
        else: 
            return True

    def create_new_user_in_stats_DB(self, spotify_id):
        sql_store_new_user_query = """INSERT INTO pulse.base_stats (spotify_id) VALUES (%s)"""
        self.db_cursor.execute(sql_store_new_user_query, (spotify_id,))
        self.db_conn.commit()

    def delete_row_TESTING_ONLY(self, spotify_id):
        sql_delete_user_query = "DELETE FROM pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql_delete_user_query, (spotify_id,))
        self.db_conn.commit()

    # Returns a whole row for the given spotify_id    
    def get_row(self, spotify_id, data = None):
        sql = "SELECT from pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql, (spotify_id,))
        self.resultset = self.db_cursor.fetchall()
        return self.resultset
    
    #Retrieves an icon for the given spotify_id and stores it to storage_loc
    def retrieve_image(self, spotify_id, storage_loc):
        sql_fetch_blob_query = """SELECT * from pulse.users where spotify_id = %s"""
        self.db_cursor.execute(sql_fetch_blob_query, (spotify_id,))
        record = self.db_cursor.fetchall()
        for row in record:
            print("spotify_id = ", row[1], )
            print("token = ", row[2])
            image = row[3]
            # No icon exists (null in database)
            if (image == None):
                print ("No icon exists")
            # Icon exists
            else:
                print("Storing icon on disk \n")
                # Convert binary data to proper format and write it on Hard Disk
                with open(storage_loc, 'wb') as file:
                    file.write(image)

    #Stores a new user in the DB given the user object
    def store_new_user_in_DB(self, new_user):
        # Upload user information
        sql_store_new_user_query = """INSERT INTO pulse.users (display_name, 
                                login_token, 
                                spotify_id, 
                                friends, 
                                theme, 
                                location,
                                gender
                                recommendation_params) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)"""
        
               
        self.db_cursor.execute(sql_store_new_user_query, (new_user.display_name, 
                                                json.dumps(new_user.login_token),
                                                new_user.spotify_id,
                                                create_friends_string_for_DB(new_user.friends),
                                                int(new_user.theme.value),
                                                new_user.location,
                                                new_user.gender,
                                                create_rec_params_string_for_DB(new_user.recommendation_params),))

        self.db_conn.commit()
    # Returns a newly created user object recreated from the database given spotify_id
    def get_user_from_DB(self, spotify_id):
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
                         recommendation_params=create_rec_params_string_for_DB(row[7]),
                         location = row[9],
                         gender = row[10])       
            return userFromDB
               
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
            return 0  # Indicate that the update failed
    def update_display_name(self, spotify_id, new_display_name):
        try:
            sql_update_token_query = """UPDATE pulse.users SET display_name = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_token_query, (new_display_name, spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating token:", str(e))
            self.db_conn.rollback()
            return 0  # Indicate that the update failed

    def update_friends(self, spotify_id, new_friends):
        try:
            sql_update_token_query = """UPDATE pulse.users SET friends = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_token_query, (create_friends_string_for_DB(new_friends), spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating token:", str(e))
            self.db_conn.rollback()
            return 0  # Indicate that the update failed
        
    def update_theme(self, spotify_id, new_theme):
        try:
            sql_update_theme_query = """UPDATE pulse.users SET theme = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_theme_query, (int(new_theme.value), spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating token:", str(e))
            self.db_conn.rollback()
            return 0  # Indicate that the update failed
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
            print("Error updating token:", str(e))
            self.db_conn.rollback()
            return 0  # Indicate that the update failed
    
    def get_text_size(self,spotify_id):
        sql_get_text_size_query = "SELECT text_size from pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_text_size_query, (spotify_id,))
        self.resultset = self.db_cursor.fetchall()
        return self.resultset
    
    def get_theme(self, spotify_id):
        sql_get_theme_query = "SELECT theme from pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_theme_query, (spotify_id,))
        self.resultset = self.db_cursor.fetchall()
        return self.resultset
    
    def update_recommendation_params(self, spotify_id, new_rec_params):
        try:
            sql_update_rec_params_query = """UPDATE pulse.users SET theme = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_rec_params_query, (create_rec_params_string_for_DB(new_rec_params), spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating params:", str(e))
            self.db_conn.rollback()
            return 0  # Indicate that the update failed
    
    # Update layout for the given spotify_id
    def update_layout(self, spotify_id, new_layout):
        try:
            sql_update_layout_query = """UPDATE pulse.users SET layout = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_layout_query, (new_layout, spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating layout:", str(e))
            self.db_conn.rollback()
            return 0  # Indicate that the update failed
        
    # Returns layout JSON object
    def get_layout(self, spotify_id):
        sql_get_layout_query = "SELECT layout from pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_layout_query, (spotify_id,))
        self.resultset = self.db_cursor.fetchall()
        return self.resultset

    def get_follower_numbers_from_DB(self, spotify_id):
        sql_get_follower_numbers_query = "SELECT follower_numbers from pulse.base_stats WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_follower_numbers_query, (spotify_id,))
        self.resultset = self.db_cursor.fetchall()
        return create_follower_number_array_from_DB(self.resultset)
    
    def get_follower_dates_from_DB(self, spotify_id):
        sql_get_follower_dates_query = "SELECT follower_dates from pulse.base_stats WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_follower_dates_query, (spotify_id,))
        self.resultset = self.db_cursor.fetchall()
        return create_follower_dates_array_from_DB(self.resultset)

    def update_follower_numbers(self, spotify_id, follower_numbers):
        try:
            sql_update_follower_numbers_query = """UPDATE pulse.base_stats SET follower_numbers = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_follower_numbers_query, (create_follower_number_string_for_DB(follower_numbers), spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating layout:", str(e))
            self.db_conn.rollback()
            return 0  # Indicate that the update failed

    def update_follower_dates(self, spotify_id, follower_dates):
        try:
            sql_update_follower_dates_query = """UPDATE pulse.base_stats SET follower_dates = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_follower_dates_query, (create_follower_dates_string_for_DB(follower_dates), spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating layout:", str(e))
            self.db_conn.rollback()
            return 0  # Indicate that the update failed
    
    def get_scores(self, spotify_id):
        sql_get_scores_query = "SELECT high_scores from pulse.users WHERE spotify_id = %s"
        self.db_cursor.execute(sql_get_scores_query, (spotify_id,))
        self.resultset = self.db_cursor.fetchall()
        return score_string_to_array(self.resultset)
    
    def update_scores(self, spotify_id, score_array, game):
        
        master_scores = self.get_scores(spotify_id)
        try:
            sql_update_scores_query = """UPDATE pulse.users SET high_scores = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_scores_query, (score_array_to_string(update_new_score_and_delete_oldest(master_scores,score_array,game)), spotify_id,))
            self.db_conn.commit()
            # Optionally, you can check if any rows were affected by the UPDATE operation.
            # If you want to fetch the updated record, you can do it separately.
            affected_rows = self.db_cursor.rowcount
            return affected_rows
        except Exception as e:
            # Handle any exceptions that may occur during the database operation.
            print("Error updating layout:", str(e))
            self.db_conn.rollback()
            return 0  # Indicate that the update failed   
    
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

def create_follower_number_string_for_DB(follower_number_input_array):
    follower_number_string = ""
    for follower_number in follower_number_input_array:
        if (follower_number_string == ""):
            follower_number_string = follower_number_string + str(follower_number)
        else:
            follower_number_string = follower_number_string + "," + str(follower_number)
    return follower_number_string

def create_follower_dates_string_for_DB(follower_dates_input_array):
    follower_dates = ""
    for date in follower_dates_input_array:
        if (follower_dates == ""):
            follower_dates = follower_dates + date.strftime("%Y-%m-%d %H:%M:%S")
        else:
            follower_dates = follower_dates + "," + date.strftime("%Y-%m-%d %H:%M:%S")
    return follower_dates

def create_friends_array_from_DB(friends_input_string):
    if (friends_input_string == ""):
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

def create_follower_number_array_from_DB(follower_number_string):
    if (follower_number_string == ""):
        return []
    follower_numbers = [int(x) for x in follower_number_string.split(',')]
    return follower_numbers

def create_follower_dates_array_from_DB(follower_dates_string):
    if (follower_dates_string == ""):
        return []
    follower_dates = [x.strftime("%Y-%m-%d %H:%M:%S") for x in follower_dates_string.split(',')]
    return follower_dates

def score_array_to_string(arr):
    # Convert the 3D array to a string by flattening it
    flattened = [str(item) for sublist1 in arr for sublist2 in sublist1 for item in sublist2]
    return ' '.join(flattened)

def score_string_to_array(s):
    # Convert the string back to a 3D array
    elements = s.split()
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

#game = 0, 1, 2, 3, or 4 
def update_new_score_and_delete_oldest(arr_3d, new_array, game):
    # Update the first array with the new 2D array
    arr_3d[game].insert(0, new_array)
    # Remove the last array
    arr_3d[game].pop()

db_config =  {
            'host':"pulse-sql-server.mysql.database.azure.com",  # database host
            'port': 3306,                                        # port
            'user':"pulse_admin_userz",                          # username
            'passwd':"PurdueCS307R0cks!&!",                      # password
            'db':"pulse",                                        # database
            'charset':'utf8'                                     # charset encoding
            }


r"""
# does_user_exist_in_DB test
with Database_Connector(db_config) as test:
    spotify_id = "Bodhi Scott"
    num_users = test.does_user_exist_in_DB(spotify_id)
    print(num_users)
"""

r"""
# Fetch row test
with Database_Connector(db_config) as test: 
    display_name = <>
    spotify_id =   <>
    resultSet = test.get_row(display_name, spotify_id)
    print(resultSet)
"""

r"""
# Retrieve image test
with Database_Connector(db_config) as test:
    test.retrieve_image("Bodhi Scott", r"C:\Users\bodhi\OneDrive\Desktop\School Shit\CS 307\Code\PULSE\Testing\Database Tests\fromDatabase.jpg")
"""
