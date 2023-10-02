import mysql.connector
from User import User
from User import Theme
import json
from types import SimpleNamespace
import os

class DBHandling:
    def erase():
        db_file = os.getcwd() + '\\Backend\\' + 'DBTempStorage.txt'
        open(db_file, 'w').close()

    def temp_is_user_in_DB(spotify_id):
        db_file = os.getcwd() + '\\Backend\\' + 'DBTempStorage.txt'
        # Check if a user with the given Spotify ID exists in the database
        with open(db_file, 'r') as file:
            for line in file:
                user_data = json.loads(line)
                if user_data["spotify_id"] == spotify_id:
                    return True
        return False

    def temp_is_user_in_DB(spotify_id):
        db_file = os.getcwd() + '\\Backend\\' + 'DBTempStorage.txt'
        # Check if a user with the given Spotify ID exists in the database
        with open(db_file, 'r') as file:
            for line in file:
                user_data = json.loads(line)
                if user_data.get("spotify_id") == spotify_id:
                    return True
        return False

    def temp_store_user_in_DB(user):
        # Store a user in the database file
        db_file = os.getcwd() + '\\Backend\\' + 'DBTempStorage.txt'
        with open(db_file, 'a') as file:
            user_data = user.to_json()
            user_json = json.dumps(user_data)
            file.write(user_json + '\n')

    def temp_get_user_from_DB(spotify_id):
        # Retrieve a user by Spotify ID from the database
        db_file = os.getcwd() + '\\Backend\\' + 'DBTempStorage.txt'
        with open(db_file, 'r') as file:
            for line in file:
                user_data = json.loads(line)
                user = User.from_json(user_data)
                if user.spotify_id == spotify_id:
                    return user
        return None

    #gets and returns an entire serialized user from the DB
    def get_user_from_DB(spotify_id):
        return DBHandling.temp_get_user_from_DB(spotify_id)
        try:
            # Connect to database
            connection = mysql.connector.connect(host="pulse-sql-server.mysql.database.azure.com",
                                                user="pulse_prototype_users",
                                                password="thisPasswordMeansNothing!!!",
                                                database="pulse")
            cursor = connection.cursor()

            # Get all information from specified user
            sql_fetch_blob_query = """SELECT * from pulse.users where spotify_id = %s"""
            
            #TODO throw error if user does not exists
            cursor.execute(sql_fetch_blob_query, (spotify_id,))
            record = cursor.fetchall()
 
            for row in record:
                 userFromDB = User(row[1],                                                                #display_name
                                   row[2],                                                                #login _token
                                   row[3],                                                                #spotify_id
                                   None,                                                                  #spotify_user
                                   None,                                                                  #icon
                                   json.loads(row[4], object_hook=lambda d: SimpleNamespace(**d)),        #friends
                                   None,                                                                  #playlists 
                                   Theme(row[5]),                                                         #theme
                                   None,                                                                  #stats
                                   json.loads(row[6], object_hook=lambda d: SimpleNamespace(**d)),        #high_scores
                                   json.loads(row[7], object_hook=lambda d: SimpleNamespace(**d)))        #recommendation_params
                
        except mysql.connector.Error as error:
            print("Failed to read user data from MySQL table {}".format(error))

        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
                #print("MySQL connection is closed")

        return User
    
    #TODO: load in JSON fields from the database
    #returns a specified field from a specified user. will return none if the field is null
    def get_user_data_from_DB(spotify_id, field):
        try:
            # Connect to database
            connection = mysql.connector.connect(host="pulse-sql-server.mysql.database.azure.com",
                                                user="pulse_prototype_users",
                                                password="thisPasswordMeansNothing!!!",
                                                database="pulse")
            cursor = connection.cursor()

            # Get specified field from specified user
            sql_fetch_blob_query = """SELECT %s from pulse.users where spotify_id = %s"""
            
            #TODO throw error if user does not exists
            cursor.execute(sql_fetch_blob_query, (field, spotify_id,))
            record = cursor.fetchall()
        
                
        except mysql.connector.Error as error:
            print("Failed to read user data from MySQL table {}".format(error))

        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
                #print("MySQL connection is closed")

        return record
    
    #TODO: Ensure user doesn't already exist
    def store_new_user_in_DB(newUser):
        return DBHandling.temp_store_user_in_DB(newUser)
        try:
            # Connect to database
            connection = mysql.connector.connect(host="pulse-sql-server.mysql.database.azure.com",
                                                user="pulse_prototype_users",
                                                password="thisPasswordMeansNothing!!!",
                                                database="pulse")
            cursor = connection.cursor()

            # Upload user information
            sql_fetch_blob_query = """INSERT INTO pulse.users (display_name, 
                                    login_token, 
                                    spotify_id, 
                                    friends, 
                                    theme, 
                                    highscores, 
                                    recommendation) VALUES (%s,%s,%s,%s,%s,%s,%s)"""
            
            #TODO throw error if user does not exists
            cursor.execute(sql_fetch_blob_query, (newUser.display_name, 
                                                 json.dumps(newUser.login_token),
                                                 newUser.spotify_id),
                                                 json.dumps(newUser.friends),
                                                 int(newUser.theme.value),
                                                 json.dumps(newUser.highscores),
                                                 json.dumps(newUser.recommendation))
            record = cursor.fetchall()
        except mysql.connector.Error as error:
            print("Failed to read user data from MySQL table {}".format(error))

        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
                #print("MySQL connection is closed")
        return None
    
    def update_user(user, field):
        return None
    
    def does_user_exist_in_DB(spotify_id):
        return DBHandling.temp_is_user_in_DB(spotify_id)
        try:
            # Connect to database
            connection = mysql.connector.connect(host="pulse-sql-server.mysql.database.azure.com",
                                                user="pulse_prototype_users",
                                                password="thisPasswordMeansNothing!!!",
                                                database="pulse")
            cursor = connection.cursor()

            # Get specified field from specified user
            sql_fetch_blob_query = """SELECT spotify_id, COUNT(*) FROM pulse.users WHERE spotify_id = %s"""
            
            cursor.execute(sql_fetch_blob_query, (spotify_id,))
            num_exists = cursor.rowcount()
            if (num_exists == 0):
                return 0
            elif (num_exists == 1):
                return 1
            elif (num_exists > 1):
                #TODO: handle errors in case of multiple spotify_id existing. THIS SHOULD NEVER HAPPEN 
                return 0
                
        except mysql.connector.Error as error:
            print("Failed to read user data from MySQL table {}".format(error))

        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
                #print("MySQL connection is closed")
        #This should never be reached
        return 0
    def get_JSON_data(data):
        
        return None
