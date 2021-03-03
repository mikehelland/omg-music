# OMG Music

OMG Music is a "Music Context" that wraps the web browser's AudioContext. 

Music created and shared in the OMG Music format contains information like key and time signatures that make the 
modification and mutation of beats and melodies simple.

It designed for the advancement of "open music", where music is shared in a "source code" format that promotes remixing.

This app supplies the core music functionality for the [OMG Platform](https://github.com/mikehelland/openmedia.gallery)

## OMG Song File Format

The song and its parts are a JSON file. 

An overview of the file format looks like this:

     let song = {
          parts: [{name: "Piano", ...}],
          sections: [
               {
                    name: "Verse",
                    parts: [{name: "Piano", ...}]
               }
          ],
          beatParams: {...},
          keyParams: {...},
          name: "My Song"
     }

The song is separated "horizontally" into **parts** (such as piano, drums, guitar) and "vertically" into **sections**
(such as Intro, Verse, Chorus).

The `song.parts` array is the *part header*, which contains information about how to make sounds from the part. 
This may contain a list of MP3 or WAV files contained in a **Sound Set**. Or a the part might generate sounds from
Web Audio API's built in oscillators, or the [WebAudioFont](https://surikov.github.io/webaudiofont/).

Each section in `song.sections` also has a `parts` array. This contains information about when to play each sound, producing a melody or a beat.

The `parts` in `song.sections` have either a `notes` array, or a `tracks` array. 

### notes Vs tracks

The `notes` array contains a list of objects that describe what note to play and for how long. Like this:

     notes = [
          {note: 0, scaledNote: 60, beats: 2.0},
          {rest: true, beats: 1.0},
          {note: 1, scaledNote: 62, beats: 1.0}
     ]

The `scaledNote` is a MIDI note determined from the key of the song and octave of the instrument
of the part. In this case a middle C (MIDI note 60) is played for a two beats, then a one beat rest, 
then the D above it (MIDI note 62) is played for one beat.

The `tracks` array can contain multiple tracks (think bass drum, snare drum, high-hat). Each track 
is an array that contains an element for each subbeat in the current part. If the value N is a number between 0 and 1,
the audio sample for that track is played at volume N. The entire audio sample is played.

Use `notes` when you need to determine how long an audio sample is played (such as in a melody or bassline).

### Classes

THe main class is `OMusicContext`. This can `load()` songs or parts in the OMG format, or create blanks.

The `OMGSong` and `OMGSongPart` classes can be thought of as an "exo-skeleton" for the data. For example, the following data:

     let songData = {
          parts: [{name: "Piano", ...}],
          sections: [
               {
                    name: "Verse",
                    parts: [{name: "Piano", ...}]
               }
          ],
          beatParams: {...},
          keyParams: {...},
          name: "My Song"
     }

When loaded becomes:

     omgSong = {
          data: songData,
          parts: {
               "Piano: {data: partHeaderData}
          }
          Sections: {
               "Verse": {
                    data: sectionData,
                    parts: {
                         "Piano": {data: partDetailData}
                    }
               }
          }
     }

The original `songData` still exists as `omgSong.data`. The `parts` and `sections` arrays
of the data have been turned into objects/dictionaries. This is for easier access to parts and sections
by name, which is useful when passing data through websockets and other layers.

All elements of `songData` can be accessed individually through these wrapper objects (`OMGSong` and `OMGSongPart`). 
The wrapper allows the player, and the context, and the user interfaces to attach temporary things which 
do not need to saved are cannot be stringified. For example, the GainNode for each part is on the `OMGSongPart` that 
wraps its the parts data.

These audio nodes needs to be associated with the part, but cannot be stringified, and need to be created for each session.
So they go onto the wrapper.

## Examples

Here are some apps where OMG Music is used:

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
