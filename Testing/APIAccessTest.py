import os
currentDir = os.getcwd()

# Keeping the data in testdata.txt blank in the repo and populating it locally
# If you guys think I'm giving you guys my Spotify login details you are crazy ☠️ 

lines = []
with open(currentDir + '\\Testing\\' + 'testdata.txt', 'r') as file:
    for line in file:
        lines.append(line.strip())

username, password = lines
print(username)
print(password)