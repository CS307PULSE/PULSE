import mysql.connector
from User import User
from User import Theme
import json
from types import SimpleNamespace

class DBHandling:
    #gets and returns an entire serialized user from the DB
    def get_user_from_DB(spotify_id):
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
    def get_user_data_from_DB(user_id, field):
        try:
            # Connect to database
            connection = mysql.connector.connect(host="pulse-sql-server.mysql.database.azure.com",
                                                user="pulse_prototype_users",
                                                password="thisPasswordMeansNothing!!!",
                                                database="pulse")
            cursor = connection.cursor()

            # Get specified field from specified user
            sql_fetch_blob_query = """SELECT %s from pulse.users where user_id = %s"""
            
            #TODO throw error if user does not exists
            cursor.execute(sql_fetch_blob_query, (field, user_id,))
            record = cursor.fetchall()
        
                
        except mysql.connector.Error as error:
            print("Failed to read user data from MySQL table {}".format(error))

        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
                #print("MySQL connection is closed")

        return record
    
    def store_new_user_in_DB(newUser):
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
    def get_JSON_data(data):
        
        
        return None