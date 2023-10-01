import mysql.connector
from User import User
from User import Theme

class DBHandling:
    #TODO: load in JSON fields from database 

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
                 userFromDB = User(row[1],      #display_name
                                   row[2],      #login _token
                                   row[3],      #spotify_id
                                   None,        #spotify_user
                                   None,        #icon
                                   None,        #TODO friends
                                   None,        #playlists
                                   Theme.Dark,  #theme
                                   None,        #stats
                                   None,        #TODO high_scores
                                   None)        #TODO recommendation_params
                
        except mysql.connector.Error as error:
            print("Failed to read user data from MySQL table {}".format(error))

        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
                #print("MySQL connection is closed")

        return User
    
    #returns a specified field from a specified user. will return none if the field is null
    def getUserDataFromDB(user_id, field):
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
    def storeUserInDB(newUser):
        return None