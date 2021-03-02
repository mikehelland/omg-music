# OMG Music

OMG Music is a "Music Context" that wraps the web browser's AudioContext, designed for the advancement of "open music".

Music created and shared in the OMG Music format contains information like key and time signatures that make the 
modification and mutation of beats and melodies simple.

This app supplies the core music functionality for the [OMG Platform](https://github.com/mikehelland/openmedia.gallery")

This package is an app for the OMG 

## OMG Song File Format

The song and its parts are a JSON file. 

(TODO Link to gist)

## Used in...

* [OpenMedia.Gallery](https://openmedia.gallery) social networking sites
* [Dawesome](https://openmedia.gallery/apps/dawesome) [(github)](https://github.com/mikehelland/dawesome)
* [Techno GAUNTLET](https://openmedia.gallery/apps/gauntlet)
* [OMG Meme Maker](https://openmedia.gallery/apps/meme/editor.htm)
* Song Processor


# Using the Client: Game Dev Example

## How to: https://www.youtube.com/watch?v=TXpPFBkpXp0

(Note, the video has outdated code)

## When the game is loading:

     import OMusicContext from "https://openmedia.gallery/apps/music/js/omusic.js"
     
     var music = new OMusicContext()
     var {song, player} = await music.load("http://openmusic.gallery/data/1333")

## When the game starts:

     game.music.play()

## Increase BPM and key when difficulty increases:

     music.beatParams.bpm += 20

     music.keyParams.rootNote++
     music.rescaleSong()

## When the game ends:

     music.stop()
