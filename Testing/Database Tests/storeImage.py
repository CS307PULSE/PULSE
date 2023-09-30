import mysql.connector

def convertToBinaryData(filename):
    # Convert digital data to binary format
    with open(filename, 'rb') as file:
        binaryData = file.read()
    return binaryData


def insertBLOB(username, token, icon):
    print("Inserting BLOB into pulsetest table")
    try:
        #connect to database
        connection = mysql.connector.connect(host="pulse-sql-server.mysql.database.azure.com",
                                            user="publicTestUser",
                                            password="thisPasswordIsUseless",
                                            database="pulsetest")

        cursor = connection.cursor()
        #insert a new user complete with an icon
        sql_insert_blob_query = """ INSERT INTO pulsetest.users
                          (username, token, icon) VALUES (%s,%s,%s)"""

        iconBinary = convertToBinaryData(icon)

        # Convert data into tuple format
        toInsert = (username, token, iconBinary)
        # Insert data
        result = cursor.execute(sql_insert_blob_query, toInsert)
        connection.commit()
        print("Image successfully as a BLOB into pulsetest table", result)

    except mysql.connector.Error as error:
        print("Failed inserting BLOB data into MySQL table {}".format(error))

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection is closed")

insertBLOB("Bodhi Scott", "token", r"C:\Users\bodhi\OneDrive\Desktop\School Shit\CS 307\Code\PULSE\Testing\Server Tests\uncompressed_image.jpg")
