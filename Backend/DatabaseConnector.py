import mysql.connector
from User import User
from User import Theme
import json
from types import SimpleNamespace

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
         #TODO: handle errors in case of multiple spotify_id existing. THIS SHOULD NEVER HAPPEN 
        if (row_count == 0):
            return False
        else: 
            return True


    #TODO: Delete row based on spotify_id for testing purposes
    #TODO: Retrieve functions for individual fields
    # Returns a whole row for the given spotify_id    
    def get_row(self, field, spotify_id, data = None):
        sql = "SELECT %s from pulse.users where spotify_id = %s"
        self.db_cursor.execute(sql, (field, spotify_id,))
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
                                high_scores, 
                                recommendation_params) VALUES (%s,%s,%s,%s,%s,%s,%s)"""
        
               
        self.db_cursor.execute(sql_store_new_user_query, (new_user.display_name, 
                                                json.dumps(new_user.login_token),
                                                new_user.spotify_id,
                                                create_friends_string_for_DB(new_user.friends),
                                                int(new_user.theme.value),
                                                create_highscore_string_for_DB(new_user.high_scores),
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
                         high_scores=create_highscores_array_from_DB(row[6]),     
                         recommendation_params=create_rec_params_string_for_DB(row[7]),)       
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
            sql_update_token_query = """UPDATE pulse.users SET theme = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_token_query, (new_theme.value, spotify_id,))
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
    def update_high_scores(self, spotify_id, new_high_scores):
        try:
            sql_update_token_query = """UPDATE pulse.users SET high_scores = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_token_query, (create_highscore_string_for_DB(new_high_scores), spotify_id,))
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
        
    def update_recommendation_params(self, spotify_id, new_rec_params):
        try:
            sql_update_token_query = """UPDATE pulse.users SET theme = %s WHERE spotify_id = %s"""
            self.db_cursor.execute(sql_update_token_query, (create_rec_params_string_for_DB(new_rec_params), spotify_id,))
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

db_config =  {
            'host':"pulse-sql-server.mysql.database.azure.com",  # database host
            'port': 3306,                                        # port
            'user':"pulse_admin_userz",                          # username
            'passwd':"PurdueCS307R0cks!&!",                     # password
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
