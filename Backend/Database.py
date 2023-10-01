import mysql.connector
from User import User
from User import Theme

class DBHandling:
    #TODO: load in JSON fields from database 
    def get_user_from_DB(spotify_id):
        #get an entire serialized user from the DB
        try:
            # Connect to database
            connection = mysql.connector.connect(host="pulse-sql-server.mysql.database.azure.com",
                                                user="pulse_prototype_users",
                                                password="thisPasswordMeansNothing!!!",
                                                database="pulse")
            cursor = connection.cursor()

            # Get all information from specified user
            sql_fetch_blob_query = """SELECT * from pulse.users where spotify_id = %s"""
            cursor.execute(sql_fetch_blob_query, (spotify_id,))
            record = cursor.fetchall()

            # Print necessary information and save icon in folder 
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

                image = row[3]
                # No icon exists (null in database)
                if (image == None):
                    print ("No icon exists")
                # Icon exists
                else:
                    print("Storing icon on disk \n")
                    write_file(image, icon)
                
        except mysql.connector.Error as error:
            print("Failed to read BLOB data from MySQL table {}".format(error))

        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
                print("MySQL connection is closed")

        return None
    def getUserDataFromDB(userID, field):
        #field will specify what kind of data we need from database, used if we 
        #need simple data and not a whole user object
        return None
    def storeUserInDB(newUser):
        return None