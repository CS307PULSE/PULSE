import mysql.connector


def write_file(data, filename):
    # Convert binary data to proper format and write it on Hard Disk
    with open(filename, 'wb') as file:
        file.write(data)


def readBLOB(username, icon):
    print("Reading BLOB data from pulsetest")

    try:
        # Connect to database
        connection = mysql.connector.connect(host="pulse-sql-server.mysql.database.azure.com",
                                            user="publicTestUser",
                                            password="thisPasswordIsUseless",
                                            database="pulsetest")
        cursor = connection.cursor()

        # Get all information from specified user
        sql_fetch_blob_query = """SELECT * from pulsetest.users where username = %s"""
        cursor.execute(sql_fetch_blob_query, (username,))
        record = cursor.fetchall()

        # Print necessary information and save icon in folder 
        for row in record:
            print("username = ", row[1], )
            print("token = ", row[2])
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


readBLOB("Bodhi Scott", r"C:\Users\bodhi\OneDrive\Desktop\School Shit\CS 307\Code\PULSE\Testing\Server Tests\fromDatabase.jpg")
