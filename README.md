# OpenMusic.Gallery

is...

* A musical instrument
* An audio workstation
* A distribution platform

all-in-one, based on **open music**.

**Open music** is like open source software:

* You get the music in "source code format"
* You're allowed to modify and use the music however you want 

That means that with a few taps of your finger, you can remix the music in OpenMusic.Gallery, and use it royalty free.

----

## Setup

This is a node.js web app. You can see in action at https://openmusic.gallery.

CD to the directory with the project files and run:

    npm install

## Database

### Requires OMG_DB_PW environment variable to access the database

* You can run **export OMG_DB_PW=password** to set it

### Requires Postgresql 9.4 or later)

* You can install Postgres with the included script **./install_postgres.sh**

### Needs omusic_db in Postgres

* With the Postgres installed and the *OMG_DB_PW* env variable set run **./create_database.sh**

### You're setup!

Now just run:

    node main.js

And browse to localhost:8080 (8080 is the default, you can also set environment variable *OMG_PORT*).

## Other


* [OMG Basics](https://openmusic.gallery/omg_basics.htm)
* [OMG Data Formats](https://openmusic.gallery/omg_formats.htm)
* [What is Open Music?](https://openmusic.gallery/what_is_open_music.htm)