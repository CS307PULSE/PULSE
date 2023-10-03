-- Actual creation of our user database. 
-- I will run this file to create the database 
-- Then I will put it in database reference folder so table layout/preferences can be referenced by others

-- create database and table
-- please note that spotify_id is their spotify username, not an id column like user_idx1
CREATE DATABASE IF NOT EXISTS pulse;
CREATE TABLE IF NOT EXISTS pulse.users(
    user_idx1 INT(10) NOT NULL PRIMARY KEY AUTO_INCREMENT,       -- Primary key, starting at 0
    display_name VARCHAR(65) NOT NULL,                           -- PULSE display name
    login_token JSON,                                            -- Spotify login token in their format
    spotify_id varChar(200) NOT NULL UNIQUE,                     -- spotify username (always unique)
    friends JSON                                                 -- "Friend1,Friend2,Friend3...." (String)
    high_scores JSON,                                            -- "Score1,Score2,Score3..." (String but individual scores can be converted to ints)
    theme INT(2) ZEROFILL NOT NULL,                              -- Chosen theme. Defaults to 0 (dark mode)
    recommendation_params JSON                                   --  "Stat1,Stat2,Stat3,Stat4..." (String but individual stats can be converted to doubles)
);