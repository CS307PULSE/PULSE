-- Actual creation of our user database. 
-- I will run this file to create the database 
-- Then I will put it in database reference folder so table layout/preferences can be referenced by others

-- create database and table
-- please note that spotify_id is their spotify username, not an id column like user_idx1
CREATE DATABASE IF NOT EXISTS pulse;
CREATE TABLE IF NOT EXISTS pulse.users(
    user_idx1 INT(10) NOT NULL PRIMARY KEY AUTO_INCREMENT,       -- Primary key, starting at 0
    display_name VARCHAR(65) NOT NULL,                           -- PULSE display name
    login_token VarChar(200) NOT NULL,                           -- Spotify login token
    spotify_id varChar(200) NOT NULL UNIQUE,                     -- spotify username (always unique)
    token VARCHAR(200),                                          -- Spotify token
    theme INT(2) ZEROFILL NOT NULL,                              -- Chosen theme. Defaults to 0 (dark mode)
    highscores JSON,     -- Highscores for games. format: '{"game1 (string)" : "score1 (string)" , "game2" : "score2" ....}'
    recommendation JSON  -- from tracks audio features. format: '{"acousticness" : "value" , "danceability":"value" ...}'
);