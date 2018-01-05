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

You can see it in action here: https://openmusic.gallery.

----

## Installation

*(Note: You should have `node.js` and `npm` installed.)*

CD to the directory with the project files and edit `install.sh`. At the top it says:

    ## IMPORANT! Set the password for the database in this environment variable
    ## It is used by the app and by the ./create_database.sh

    export OMG_DB_PW=password_here

Change `password_here` to something better than that. Save the script and run it:

    ./install.sh

**IMPORTANT!:** *This requires Postgresql 9.4 or later!
`install.sh` will install Postgresql only if there isn't another version installed, so you should check to see if it's 9.4 or later, and if not run `./install_database.sh`.*

The last line of the `install.sh` runs the app by doing this:

    node main.js

Now browse to `http://localhost:8080` and make music!

(8080 is the default port, you can also set environment variable *OMG_PORT*) 

## Other

* [OMG Basics](https://openmusic.gallery/omg_basics.htm)
* [OMG Data Formats](https://openmusic.gallery/omg_formats.htm)
* [What is Open Music?](https://openmusic.gallery/what_is_open_music.htm)