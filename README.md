# OpenMusic.Gallery

is...

* A musical instrument
* An audio workstation
* A distribution platform

all in one web app, for **open music**.

**Open music** is like open source software:

* You get the music in "source code format"
* You're allowed to modify and use the music however you want 

That means that with a few taps of your finger, you can remix the music in OpenMusic.Gallery, and use it royalty free.

You can see it in action here: https://openmusic.gallery.

----

## Features

* Simple and Advanced Music Editors
* Public gallery
* Set keys and scales
* Set tempo and beats and measures
* Volume, Pan, Warp, and Shuffle
* Chord Progressions
* MIDI control
* Online Collaboration
* FX and Master FX
* Bitcoin Tip Jar
* Randomizer

----

#Using the Client: Game Dev Example

##How to: https://www.youtube.com/watch?v=TXpPFBkpXp0

##When the game is loading:

     <script src="https://openmusic.gallery/omg.js"></script>

     game.music = new OMusicPlayer()
     game.music.prepareSongFromURL("http://openmusic.gallery/data/1333")
     game.laserSound = game.music.getSound("SFX", "laser")

##When the game starts:

     game.music.play()

##Increase BPM and key when difficulty increases:

     game.music.beatParams.bpm += 20

     game.music.keyParams.rootNote++
     game.music.rescaleSong()

##When the laser is fired:

     game.laserSound.play()

##When the game ends:

     game.music.stop()

## Server Installation

*(Note: You should have `node.js` and `npm` installed.)*

This will install PostGres if you don't have it (you should have 9.4 or later):

    ./install.sh

Run the app:

    node main.js

Now browse to `http://localhost:8080` and make music!

(8080 is the default port, you can also set environment variable *OMG_PORT*) 

## Other

* [OMG Basics](https://openmusic.gallery/docs/omg_basics.htm)
* [OMG Data Formats](https://openmusic.gallery/docs/omg_formats.htm)
* [What is Open Music?](https://openmusic.gallery/docs/what_is_open_music.htm)
