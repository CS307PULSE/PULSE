import mysql.connector
from tabulate import tabulate

#connect to database with a user profile with access only for pulsetest schema
mydb = mysql.connector.connect(
  host="pulse-sql-server.mysql.database.azure.com",
  user="publicTestUser",
  password="thisPasswordIsUseless",
  database="pulsetest"
)

#execute SQL command
sql = "SELECT * FROM pulsetest.users"
mycursor = mydb.cursor()
mycursor.execute(sql)
myresult = mycursor.fetchall()

#Output results to check it worked
print(tabulate(myresult, headers=['username', 'token'], tablefmt='psql'))

#It works!!

