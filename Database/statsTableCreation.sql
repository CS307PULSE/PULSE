-- Actual creation of our statistics database. 
-- I will run this file to create the database 
-- Then I will put it in database reference folder so table layout/preferences can be referenced by others

-- create database and table
-- please note that spotify_id is their spotify username, not an id column like user_idx1
CREATE DATABASE IF NOT EXISTS pulse;
CREATE TABLE IF NOT EXISTS pulse.base_stats(
    user_idx1 INT(10) NOT NULL PRIMARY KEY AUTO_INCREMENT,       -- Primary key, starting at 0
    spotify_id varChar(200) NOT NULL UNIQUE,                     -- Spotify username (always unique)
    artist_stats JSON,                              -- format: '{"short_term":["artist1","artist2"...] , "medium_term":["artist1","artist2"...]... }'
    song_stats JSON,                                -- format: '{"short_term":["song1","song2"...] , "medium_term":["song1","song2"...]... }'
    followed_artists JSON                          -- format: '{"followed":["artist1","artist2"...]}'
);