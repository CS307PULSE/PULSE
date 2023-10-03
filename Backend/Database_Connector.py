import mysql.connector
from User import User
from User import Theme
import json
from types import SimpleNamespace

class Database_Connector(object):
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
        sql_check_user_exists_query = "SELECT COUNT(*), username FROM pulse.users WHERE spotify_id = %s GROUP BY username"
        cursor = self.db_cursor.execute(sql_check_user_exists_query, (spotify_id,))
        num_exists = self.db_cursor.fetchone()[0]
        if (num_exists == 0):
            print("User does not exist")
            return 0
        elif (num_exists == 1):
            print("User exists")
            return 1
        elif (num_exists > 1):
            #TODO: handle errors in case of multiple spotify_id existing. THIS SHOULD NEVER HAPPEN 
            print("ERROR: Multiple users exist")
            return 0


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
                                highscores, 
                                recommendation) VALUES (%s,%s,%s,%s,%s,%s,%s)"""
            
        #TODO throw error if user does not exists
        self.db_cursor.execute(sql_store_new_user_query, (new_user.display_name, 
                                                json.dumps(new_user.login_token),
                                                new_user.spotify_id),
                                                json.dumps(new_user.friends),
                                                int(new_user.theme.value),
                                                json.dumps(new_user.highscores),
                                                json.dumps(new_user.recommendation),)
        record = self.db_cursor.fetchall()

    def update_token(self, spotify_id, login_token):
        sql_update_token_query = """UPDATE pulse.users SET login_token = %s WHERE spotify_id = %s """
        self.db_cursor.execute(sql_update_token_query, (login_token, spotify_id,))
        record = self.db_cursor.fetchall()


db_config =  {
            'host':"pulse-sql-server.mysql.database.azure.com",  # database host
            'port': 3306,                                        # port
            'user':"pulse_prototype_users",                      # username
            'passwd':"thisPasswordMeansNothing!!!",              # password
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
    display_name = 
    spotify_id =
    resultSet = test.get_row(display_name, spotify_id)
    print(resultSet)
"""

r"""
# Retrieve image test
with Database_Connector(db_config) as test:
    test.retrieve_image("Bodhi Scott", r"C:\Users\bodhi\OneDrive\Desktop\School Shit\CS 307\Code\PULSE\Testing\Database Tests\fromDatabase.jpg")
"""
