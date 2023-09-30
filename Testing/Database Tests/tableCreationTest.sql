/* I am using Microsoft Azure student package to host a MySQL database.
I have already set up and connected MySQL Workbench
I am attempting to connect visual studios code and edit the database
 as follows */


-- create database and table
CREATE DATABASE IF NOT EXISTS pulsetest;
CREATE TABLE IF NOT EXISTS pulsetest.users(
    id INT(10) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(200) NOT NULL,
    token VARCHAR(200)
);

-- insert test values
INSERT INTO pulsetest.users(username,token)
VALUES
('Bodhi Scott','this is my fake token!'),
('Noah Stern','Testing, testing');

-- check if table was created
SELECT * FROM pulsetest.users
LIMIT 1000;

-- it works!!
 

 