"use strict";

// This is called by the music context
// it takes the music context and a song loaded by the music context
// everything should be loaded, all this has to do is play and stop


export default function OMusicPlayer(musicContext, song) {

    this.musicContext = musicContext
    this.audioContext = musicContext.audioContext
    this.song = song

    this.playing = false;

    this.latency = 20;
    this.latencyMonitor = 0;
    this.mp3PlayOffset = 0.052
    
    
    this.auditioningParts = [];

    this.onBeatPlayedListeners = [];
    this.onPlayListeners = [];

    this.iSubBeat = 0;
    this.loopStarted = 0;

    this.nextUp = null;

    this.arrangementI = -1
}



OMusicPlayer.prototype.play = async function (song) {
    if (!this.audioContext)
        return;

    if (this.audioContext.state === "suspended")
        this.audioContext.resume();

    if (!song && !this.song) {
        console.warn("OMusicPlayer.play(), no song passed and no song loaded")
        return
    }
    if (song && !song.loaded) {
        await this.loadSong(song)
        this.song = song
    }

    if (!this.song.sections || !Object.keys(this.song.sections).length) {
        console.warn("no sections to play()");
        return -1;
    }

    this.setupNextSection() //typeof this.startArrangementAt !== "number");

    this.playing = true;
    this.loopStarted = Date.now();
    this.songStarted = this.loopStarted

    this.iSubBeat = 0;
    
    this.nextBeatTime = this.audioContext.currentTime + (this.latency / 1000);
    this.nextCommandI = 0

    // todo chord progressions
    // should rescale for other reasons too
    if (this.section.data.chordProgression) {
        this.section.currentChordI = 0;
        this.musicContext.rescaleSection(this.section, this.section.data.chordProgression[0]);
    }

    if (typeof (this.onPlay) == "function") {
        // should use the listeners array, but still here because its used
        this.onPlay(p);
    }
    for (var il = 0; il < this.onPlayListeners.length; il++) {
        try {
            this.onPlayListeners[il].call(null, true);
        } catch (ex) {
            console.error(ex);
        }
    }

    this._play();
};

OMusicPlayer.prototype._play = function () {
    var beatParams = this.song.data.beatParams;

    if (!this.playing)
        return;

    if (this.stopOnNextBeat) {
        this.stopOnNextBeat = false
        this.stop()
        return
    }

    this.subbeatLength = 1000 / (beatParams.bpm / 60 * beatParams.subbeats);

    if (this.loopSection > -1 && this.loopSection < this.song.sections.length) {
        this.section = this.song.sections[this.loopSection];
        this.sectionI = this.loopSection;
    }
    
    // todo 
    if (this.section.data.chordProgression) {
        if (this.section.chord !== this.section.data.chordProgression[this.section.currentChordI]) {
            this.musicContext.rescaleSection(this.section, this.section.data.chordProgression[this.section.currentChordI]);
        }
    }

    this.playBeat(this.section, this.iSubBeat);

    for (var il = 0; il < this.onBeatPlayedListeners.length; il++) {
        try {
            this.onBeatPlayedListeners[il].call(null, this.iSubBeat, this.section);
        } catch (ex) {
            console.error(ex);
        }
    }

    this.iSubBeat++;

    var timeToPlay = this.nextBeatTime;
    if (this.iSubBeat % 2 === 1) {
        this.nextBeatTime += (this.subbeatLength + beatParams.shuffle * this.subbeatLength) / 1000;
    }
    else {
        this.nextBeatTime += (this.subbeatLength - beatParams.shuffle * this.subbeatLength) / 1000;
    }

    if (this.iSubBeat >= beatParams.beats * beatParams.subbeats * 
                                    beatParams.measures) {
        this.afterSection();

        //this is autolatenecy
        //if we're late, increase the latency (until 250ms)
        //if we're not late, decrease it 1ms (until 20ms)
        if (this.negativeLatencyCounter > 0) {
            if (this.latency < 250) {
                this.latency += 5;
            }
        }
        else if (this.latency > 20) {
            this.latency--;
        }
        this.negativeLatencyCounter = 0;
    }

    if (this.playing) {
        setTimeout(() => {this._play();}, (this.nextBeatTime - this.audioContext.currentTime) * 1000 - this.latency)

        if (this.song.data.commandList && this.song.data.commandList[this.nextCommandI]) {
            if (this.song.data.commandList[this.nextCommandI].t <= Date.now() - this.songStarted) {
                this.processCommand(this.song.data.commandList[this.nextCommandI])
                this.nextCommandI++
            }
        }
    }

    this.latencyMonitor = Math.round((timeToPlay - this.audioContext.currentTime) * 1000);
    if (this.latencyMonitor < 0)
        this.negativeLatencyCounter++
};

OMusicPlayer.prototype.auditionPart = function (part) {
    this.auditioningParts.push(part);
    if (this.auditioningParts.length === 1) {
        this.iSubBeat = 0;
        this.nextBeatTime = this.audioContext.currentTime + (this.latency / 1000);
        this._audition();
    }
};

OMusicPlayer.prototype.auditionEnd = function (part) {
    var index = this.auditioningParts.indexOf(part);
    if (index > -1) {
        this.auditioningParts.splice(index, 1);
    }
};

OMusicPlayer.prototype._audition = function () {
    
    if (this.playing) {
        this.auditioningParts.length = 0;
        return;
    }
    
    var p = this;
    var beatParams = p.song.data.beatParams;

    p.subbeatLength = 1000 / (beatParams.bpm / 60 * beatParams.subbeats);

    for (var part of p.auditioningParts) {
        p.playBeatForMelody(p.iSubBeat, part);
    }

    p.iSubBeat++;

    var timeToPlay = p.nextBeatTime;
    if (p.iSubBeat % 2 === 1) {
        p.nextBeatTime += (p.subbeatLength + beatParams.shuffle * p.subbeatLength) / 1000;
    }
    else {
        p.nextBeatTime += (p.subbeatLength - beatParams.shuffle * p.subbeatLength) / 1000;
    }

    if (p.iSubBeat >= beatParams.beats * beatParams.subbeats * 
                                    beatParams.measures) {
        p.iSubBeat = 0;
    }

    if (p.auditioningParts.length > 0) {
        setTimeout(function () {p._audition ();}, (p.nextBeatTime - p.audioContext.currentTime) * 1000 - p.latency)
    }
};

OMusicPlayer.prototype.afterSection = function () {
    var p = this;
    p.iSubBeat = 0;
    p.loopStarted = Date.now();

    if (p.nextUp) {
        p.song = p.nextUp;
        p.setupNextSection(true);
        p.nextUp = null;
        return;
    }

    var nextChord = false;
    if (p.section.data.chordProgression) {
        p.section.currentChordI++;
        if (p.section.currentChordI < p.section.data.chordProgression.length) {
            nextChord = true;
        }
        else {
            p.section.currentChordI = 0;
        }
        if (p.section.chord !== p.section.data.chordProgression[p.section.currentChordI]) {
            p.musicContext.rescaleSection(p.section, p.section.data.chordProgression[p.section.currentChordI]);
        }
    }

    if (!nextChord) {
        p.lastSection = p.section;

        p.setupNextSection();
    }
};

OMusicPlayer.prototype.setupNextSection = function (fromStart) {
    var p = this;
    if (fromStart) {
        p.loopSection = null
        if (p.song.arrangement.length > 0) {
            p.arrangementI = 0;
            p.section = p.song.sections[p.song.arrangement[p.arrangementI].section];
            p.song.arrangement[p.arrangementI].repeated = 0;
        }
        else {
            //todo part of the arrangement?
            p.section = Object.values(p.song.sections)[0];
        }
        return;
    }
    
    if (typeof p.queueSection === "number") {
        p.loopSection = p.queueSection;
        p.queSection = undefined;
    }
    else if (typeof p.queueSection === "string") {
        for (var i = 0; i < this.song.sections.length; i++) {
            if (this.song.sections[i].data.name === p.queueSection) {
                p.loopSection = i;
                p.queSection = undefined;
                break;
            }
        }
    }


    if (p.loopSection) {
        p.section = p.loopSection;
        if (p.onloop) p.onloop()
        return;
    }

    // todo arrangement stuff
    /*
    if (p.song.arrangement.length > 0) {
        if (typeof p.startArrangementAt === "number") {
            p.arrangementI = p.startArrangementAt;
            p.startArrangementAt = undefined;
            p.section = p.song.arrangement[p.arrangementI].section;
            p.song.arrangement[p.arrangementI].repeated = 0;
            return;
        }
        if (typeof p.arrangementI !== "number" || p.arrangementI === -1) {
            p.arrangementI = 0;
            p.section = p.song.arrangement[0].section;
            return;
        }
        
        if (p.song.arrangement[p.arrangementI].data.repeat) {
            p.song.arrangement[p.arrangementI].repeated = 
                    (p.song.arrangement[p.arrangementI].repeated || 0);
            if (p.song.arrangement[p.arrangementI].repeated < p.song.arrangement[p.arrangementI].data.repeat) {
                p.song.arrangement[p.arrangementI].repeated++;
                return;
            }
            p.song.arrangement[p.arrangementI].repeated = 0;
        }
        p.arrangementI++;
        if (p.arrangementI >= p.song.arrangement.length) {
            p.arrangementI = 0;
            if (!p.song.loop) {
                p.stopOnNextBeat = true
            }
            else {
                if (p.onloop) p.onloop();
            }
        }
        p.section = p.song.arrangement[p.arrangementI].section;
        p.song.arrangement[p.arrangementI].repeated = 0;
        return;
    }*/

    // todo find the next section in the arrangement
    p.arrangementI++;
    if (p.arrangementI >= p.song.arrangement.length) {
        p.arrangementI = 0
        if (!p.song.loop) {
            p.stop();
        }
        else {
            if (p.onloop) p.onloop();
        }
    }
    p.section = p.song.sections[p.song.arrangement[p.arrangementI].section];
};

OMusicPlayer.prototype.stop = function () {
    var p = this;

    clearInterval(p.playingIntervalHandle);
    p.playing = false;

    if (typeof (p.onStop) == "function") {
        // should use the listeners array, but still here because its used
        p.onStop(p);
    }
    for (var il = 0; il < p.onPlayListeners.length; il++) {
        try {
            p.onPlayListeners[il].call(null, false);
        } catch (ex) {
            console.error(ex);
        }
    }
    
    for (var il = 0; il < p.onBeatPlayedListeners.length; il++) {
        try {
            p.onBeatPlayedListeners[il].call(null, -1, p.section);
        } catch (ex) {console.error(ex);}
    }


    if (p.song && p.song.sections[p.song.playingSection]) {
        var parts = p.song.sections[p.song.playingSection].parts;
        for (var ip = 0; ip < parts.length; ip++) {
            if (parts[ip].osc) {
                parts[ip].osc.finishPart();
            }

        }
    }
};



OMusicPlayer.prototype.playBeat = function (section, iSubBeat) {
    for (var partName in section.parts) {
        this.playBeatForPart(iSubBeat, section.parts[partName]);
    }


};

OMusicPlayer.prototype.playBeatForPart = function (iSubBeat, part) {
    
    if (part.data.surface.url === "PRESET_SEQUENCER") {
        this.playBeatForDrumPart(iSubBeat, part);
    } 
    else if (part.data.surface.url === "PRESET_MIC") {
        //nothing to do
    } else {
        this.playBeatForMelody(iSubBeat, part);
    }
};

OMusicPlayer.prototype.playBeatForDrumPart = function (iSubBeat, part) {
    var tracks = part.data.tracks;

    if (part.data.audioParams.mute)
        return;
    for (var i = 0; i < tracks.length; i++) {
        if (tracks[i].data[iSubBeat]) {
            if (!tracks[i].audioParams.mute) {
                this.playSound(tracks[i].sound, part, tracks[i].audioParams,
                        typeof tracks[i].data[iSubBeat] === "number" ?
                            tracks[i].data[iSubBeat] : undefined);
            }
        }
    }
};

OMusicPlayer.prototype.playBeatForMelody = function (iSubBeat, part) {
    var data = part.data;
    var beatToPlay = iSubBeat;
    if (iSubBeat == 0) {
        // this sort of works, for playing melodies longer than 
        // the section goes, but taking it solves problems
        // the one I'm solving now is putting currentI in the right state
        // every time, so it doesn't stop the current section if the same
        // melody is in upnext play list
        //if (part.currentI === -1 || part.currentI === data.notes.length) {
        part.currentI = 0;
        part.nextBeat = 0;
        part.loopedBeats = 0;
        //}
        //else {
        //  if (!part.loopedBeats) part.loopedBeats = 0;
        //  part.loopedBeats += 32;
        //}
    }

    if (part.loopedBeats) {
        beatToPlay += part.loopedBeats;
    }

    if (part.liveNotes && part.liveNotes.length > 0) {
        this.playBeatWithLiveNote(iSubBeat, part);
        return;
    }

    if (part.currentI === -1) {
        part.nextBeat = 0;
        for (var i = 0; i < part.data.notes.length; i++) {
            if (part.nextBeat < this.iSubBeat) {
                part.nextBeat += part.data.notes[i].beats * this.song.data.beatParams.subbeats;
                part.currentI = i + 1;
            }       
        }
    }

    if (beatToPlay === part.nextBeat) {
        if (!data.notes) {
            console.warn("something wrong here");
            return;
        }
        var note = data.notes[part.currentI];

        if (part.data.audioParams.mute) {
            //play solo they can't here ya
        }
        else if (note) {
            this.playNote(note, part, data);
        }
            
        if (note) {
            part.nextBeat += this.song.data.beatParams.subbeats * note.beats;
            part.currentI++;
        }
    }
};

OMusicPlayer.prototype.playBeatWithLiveNote = function (iSubBeat, part) {
    if (!part.liveNotes || !part.liveNotes.length) {
        return;
    }

    if (part.liveNotes.autobeat > 0) {
        if (iSubBeat % part.liveNotes.autobeat === 0) {
            var index = part.liveNotes.nextIndex || 0;
            if (index >= part.liveNotes.length) {
                index = 0;
            }
            
            var note = {note: part.liveNotes[index].note,
                scaledNote: part.liveNotes[index].scaledNote,
                beats: part.liveNotes.autobeat / part.section.song.data.beatParams.subbeats};
            
            this.playNote(note, part);
            if (this.playing && !part.data.audioParams.mute) {
                this.recordNote(part, note);
                part.currentI = part.data.notes.indexOf(note) + 1;
            }
            part.liveNotes.nextIndex = index + 1;
        }
    }
    else {
        this.extendNote(part, part.liveNotes[0]);    
    }
};

OMusicPlayer.prototype.extendNote = function (part, note) {
    for (var i = 0; i < part.data.notes.length; i++) {
        if (part.data.notes[i] === note) {
            note.beats += 0.25;
            if (part.data.notes[i + 1]) {
                if (part.data.notes[i + 1].beats > 0.25) {
                    part.data.notes[i + 1].beats -= 0.25;
                    part.data.notes[i + 1].rest = true;
                }
                else {
                    part.data.notes.splice(i + 1, 1);
                }
            }
            break;
        }
    }
};


OMusicPlayer.prototype.makeFrequency = function (mapped) {
    return Math.pow(2, (mapped - 69.0) / 12.0) * 440.0;
};


OMusicPlayer.prototype.playNote = function (note, part) {
    
    var fromNow = (note.beats * 4 * this.subbeatLength) / 1000;

    if (part.headPart) {
        part = part.headPart
    }
    if (!note || note.rest) {
        if (part.osc) {
            part.preFXGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.003);
        }
        return;
    }

    //todo should be one call!
    if (part.soundFont) {
        var liveNote = this.musicContext.soundFontPlayer.queueWaveTable(this.audioContext, part.preFXGain,
            window[part.soundFont], 0, note.scaledNote, 20)
        setTimeout(() => {
                if (liveNote) {
                    liveNote.cancel()
                }
            }, this.song.data.beatParams.subbeats * note.beats * this.subbeatLength * 0.85);    
    }
    else if (part.synth) {
        part.baseFrequency = this.makeFrequency(note.scaledNote);
        var noteFrequency = part.baseFrequency * part.data.audioParams.warp
        part.synth.onNoteOn(noteFrequency, 100)
        
        setTimeout(() => {
            part.synth.onNoteOff(noteFrequency)
        }, this.song.data.beatParams.subbeats * note.beats * this.subbeatLength * 0.85);
    }
    else if (part.osc) {
        part.baseFrequency = this.makeFrequency(note.scaledNote);
        part.preFXGain.gain.setTargetAtTime(part.data.audioParams.gain, this.nextBeatTime - 0.003, 0.003);
        part.osc.frequency.setValueAtTime(part.baseFrequency * part.data.audioParams.warp, this.nextBeatTime);
        part.playingI = part.currentI;
        var playingI = part.playingI;
        
        //this should be a timeout so it can be canceled if
        //a different note has played
        setTimeout(() => {
            if (part.osc && part.playingI === playingI) {
                part.preFXGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.003);
            }
        }, this.song.data.beatParams.subbeats * note.beats * this.subbeatLength * 0.85);
    }
    else if (part.soundUrls){
        var sound = part.soundUrls[note.scaledNote]
        var audio = this.playSound(sound, part);
        if (audio) {
            audio.bufferGain.gain.linearRampToValueAtTime(part.data.audioParams.gain, 
                this.audioContext.currentTime + fromNow * 0.995);
            audio.bufferGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + fromNow);
            audio.stop(this.audioContext.currentTime + fromNow);
        }
    }
};



OMusicPlayer.prototype.playSound = function (sound, part, audioParams, strength) {
    if (this.musicContext.loadedSounds[sound] &&
            this.musicContext.loadedSounds[sound] !== "loading") {

        var source = this.audioContext.createBufferSource();
        source.bufferGain = this.audioContext.createGain();
        source.buffer = this.musicContext.loadedSounds[sound];

        var gain = 1;
        var warp = part.data.audioParams.warp;
        if (audioParams) {
            warp = (warp - 1) + (audioParams.warp - 1) + 1;
            gain = audioParams.gain;
        }
        if (audioParams && audioParams.pan) {                        
            source.bufferPanner = this.audioContext.createStereoPanner();            
            source.bufferPanner.pan.setValueAtTime(audioParams.pan, this.audioContext.currentTime);
                        
            source.connect(source.bufferPanner);
            source.bufferPanner.connect(source.bufferGain);
        }
        else {
            source.connect(source.bufferGain);
        }

        if (strength) {
            gain = gain * strength;
        }

        source.bufferGain.gain.setValueAtTime(gain, this.audioContext.currentTime);
        source.bufferGain.connect(part.preFXGain);

        source.playbackRate.value = warp;

        source.start(this.nextBeatTime, source.buffer.omgIsMP3 ? this.mp3PlayOffset : 0);
        
        return source;
    }
};


OMusicPlayer.prototype.playLiveNotes = function (notes, part) {

    if (this.audioContext && this.audioContext.state === "suspended")
        this.audioContext.resume();
    
    var sectionPart = part
    if (part.headPart) {
        part = part.headPart
    }
    
    if (part.liveNotes && part.liveNotes.liveAudio) {
            part.liveNotes.liveAudio.bufferGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.001);
            part.liveNotes.liveAudio.stop(this.audioContext.currentTime + 0.015);
    }
    if (part.synth && part.synth.lastFrequency) {
        part.synth.onNoteOff(part.synth.lastFrequency)
        part.synth.lastFrequency = 0
    }
    else if (part.soundFont && sectionPart.liveNote) {
        sectionPart.liveNote.cancel()
        sectionPart.liveNote = null
    }
    
    sectionPart.liveNotes = notes;
    if (!notes.autobeat) {
        part.playingI = -1;
        if (this.disableAudio) {
            //silence
        }
        else if (part.soundFont) {
            //part.notesPlaying[notes[0].scaledNote]
            sectionPart.liveNote = this.musicContext.soundFontPlayer.queueWaveTable(this.audioContext, this.audioContext.destination
                , window[part.soundFont], 0, notes[0].scaledNote, 20); //_tone_0000_Chaos_sf2_file
        }
        else if (part.osc) {
            part.baseFrequency = this.makeFrequency(notes[0].scaledNote);
            part.osc.frequency.setValueAtTime(
                    part.baseFrequency * part.data.audioParams.warp, this.audioContext.currentTime);
            part.preFXGain.gain.setTargetAtTime(part.data.audioParams.gain, this.audioContext.currentTime, 0.003);
        }
        else if (part.synth) {
            part.baseFrequency = this.makeFrequency(notes[0].scaledNote);
            part.synth.lastFrequency = part.baseFrequency * part.data.audioParams.warp
            part.synth.onNoteOn(part.synth.lastFrequency, 100)
        }
        else if (part.soundUrls) {
            var sound = part.soundUrls[notes[0].scaledNote];
            sectionPart.liveNotes.liveAudio = this.playSound(sound, part);
        }
        
        if (this.playing && !part.data.audioParams.mute) {
            this.recordNote(sectionPart, notes[0]);
            part.currentI = part.data.notes.indexOf(notes[0]) + 1;
        }
    }
    else {
        if (!this.disableAudio && !this.playing && this.auditioningParts.indexOf(sectionPart) == -1) {
            this.auditionPart(sectionPart);
        }
        
    }
};

OMusicPlayer.prototype.endLiveNotes = function (part) {
    var sectionPart = part
    if (part.headPart) {
        part = part.headPart
    }

    //todo make thits a single playNote function call
    
    if (this.disableAudio) {
        //silence
    }
    else if (part.soundFont) {
        if (sectionPart.liveNote) {
            sectionPart.liveNote.cancel()
            sectionPart.liveNote = null
        }
    }
    else if (part.synth && part.synth.lastFrequency) {
        part.synth.onNoteOff(part.synth.lastFrequency)
        part.synth.lastFrequency = 0
    }
    else if (part.osc) {
        part.preFXGain.gain.setTargetAtTime(0,
                this.audioContext.currentTime, 0.003);
    }  
    else {
        if (part.liveNotes && part.liveNotes.liveAudio) {
            part.liveNotes.liveAudio.bufferGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.001);
            part.liveNotes.liveAudio.stop(this.audioContext.currentTime + 0.015);
        }
    }
    part.liveNotes = [];
    
    part.nextBeat = 0;
    part.currentI = -1;
    
    if (!this.playing && this.auditioningParts.indexOf(sectionPart) > -1) {
        this.auditionEnd(sectionPart);
    }
};

OMusicPlayer.prototype.recordNote = function (part, note) {

    var beatsUsed = 0;
    var currentBeat = this.iSubBeat / part.song.data.beatParams.subbeats;
    var index = -1;
    for (var i = 0; i < part.data.notes.length; i++) {
        if (currentBeat === beatsUsed) {
            index = i;
            break;
        }
        if (beatsUsed > currentBeat) {
            part.data.notes[i - 1].beats -= beatsUsed - currentBeat;
            index = i;
            break;
        } 
        beatsUsed += part.data.notes[i].beats;
    }
    if (index > -1) {
        part.data.notes.splice(index, 0, note);
        if (beatsUsed - currentBeat > note.beats) {
            part.data.notes.splice(index + 1, 0, {rest:true, beats: beatsUsed - currentBeat - note.beats});
        }
        else if (beatsUsed - currentBeat < note.beats) {
            beatsUsed = note.beats;
            while (part.data.notes[index + 1] && beatsUsed > 0) {
                if (part.data.notes[index + 1].beats > beatsUsed) {
                    part.data.notes[index + 1].beats -= beatsUsed;
                    part.data.notes[index + 1].rest = true;
                    break;
                }
                else {
                    beatsUsed -= part.data.notes[index + 1].beats;
                    part.data.notes.splice(index + 1, 1);
                }
            }
        }
    }
    else {
        var newBeats;
        //add quarter note rests to take up needed space
        while (currentBeat > beatsUsed) {
            newBeats = Math.min(1, currentBeat - beatsUsed);
            part.data.notes.push({rest:true, beats: newBeats});
            beatsUsed += newBeats;
        }
        part.data.notes.push(note);
    }
    part.song.partChanged(part)

};





OMusicPlayer.prototype.noteOn = function (noteNumber, part, velocity) {
    if (this.disableAudio) {
        return
    }

    if (this.audioContext.state === "suspended") {
        this.audioContext.resume();
    }
    
    if (part.soundFont) {
        part.notesPlaying[noteNumber] = this.musicContext.soundFontPlayer.queueWaveTable(this.audioContext, this.audioContext.destination
            , window[part.soundFont], 0, noteNumber, 20);
    }
    else if (part.osc) {
        part.baseFrequency = this.makeFrequency(noteNumber);
        part.osc.frequency.setValueAtTime(
                part.baseFrequency * part.data.audioParams.warp, this.audioContext.currentTime);
        part.preFXGain.gain.setTargetAtTime(part.data.audioParams.gain, this.audioContext.currentTime, 0.003);
    }
    else if (part.synth) {
        part.baseFrequency = this.makeFrequency(noteNumber);
        part.synth.lastFrequency = part.baseFrequency * part.data.audioParams.warp
        part.synth.onNoteOn(part.synth.lastFrequency, velocity)
        part.notesPlaying[noteNumber] = part.synth.lastFrequency
    }
    else {
        part.notesPlaying[noteNumber] = this.playSound(part.soundUrls[noteNumber], part, undefined, velocity / 120);
    }
        
};

OMusicPlayer.prototype.noteOff = function (noteNumber, part) {
  
    if (!part.notesPlaying[noteNumber]) {
        return
    }
    else if (part.soundFont) {
        part.notesPlaying[noteNumber].cancel()
    }
    else if (part.synth) {
        part.synth.onNoteOff(part.notesPlaying[noteNumber])
    }
    else if (part.osc) {
        part.preFXGain.gain.setTargetAtTime(0,
                this.audioContext.currentTime, 0.003);
    }  
    else {
        part.notesPlaying[noteNumber].bufferGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.001);
        part.notesPlaying[noteNumber].stop(this.audioContext.currentTime + 0.015);
    }

    delete part.notesPlaying[noteNumber]
    
    part.nextBeat = 0;
    part.currentI = -1;
    
};




/*

OMusicPlayer.prototype.processCommand = function (data) {
    if (data.action === "sequencerChange") {
        let part = this.section.getPart(data.partName);
        part.data.tracks[data.trackI].data[data.subbeat] = data.value;

        if (part.drumMachine && !part.drumMachine.hidden) part.drumMachine.draw();
        //todo if (part.presentationUI) part.presentationUI.draw();
    }
    else if (data.action === "verticalChangeFrets") {
        var part = this.section.getPart(data.partName);
        if (data.value.length > 0) {
            data.value.autobeat = data.autobeat;
            this.playLiveNotes(data.value, part, 0);
        }
        else {
            this.endLiveNotes(part);
        }
        if (part.mm && !part.mm.hidden) part.mm.draw();
    }
}





//todo this has been moved to OMGPart so delete it
OMusicPlayer.prototype.setupPartWithSoundSet = function (ss, part, load) {
    var p = this;

    if (!ss)
        return;

    var topNote = ss.highNote;
    if (!topNote && ss.data.length) {
        topNote = ss.lowNote + ss.data.length - 1;
    }
    if (!ss.octave) {
        ss.octave = Math.floor((topNote + ss.lowNote) / 2 / 12);
    }
    if (part.data.soundSet && !part.data.soundSet.octave) {
        part.data.soundSet.octave = ss.octave;
    }

    part.soundSet = ss;
};



OMusicPlayer.prototype.updateNoteSound = function (note, soundSet) {
    var noteIndex;

    if (note.rest)
        return;

    if (soundSet.chromatic) {
        noteIndex = note.scaledNote - soundSet.lowNote;
        if (noteIndex < 0) {
            noteIndex = noteIndex % 12 + 12;
        } else {
            while (noteIndex >= soundSet.data.length) {
                noteIndex = noteIndex - 12;
            }
        }
    }
    else {
        noteIndex = note.note;
    }

    if (!soundSet.data[noteIndex]) {
        return;
    }
    note.sound = (soundSet.prefix || "") + 
                soundSet.data[noteIndex].url + 
                (soundSet.postfix || "");

};

//is this used?
OMusicPlayer.prototype.setupDrumPartWithSoundSet = function (ss, part, load) {
    var p = this;

    if (!ss)
        return;

    var prefix = ss.prefix || "";
    var postfix = ss.postfix || "";

    var track;

    for (var ii = 0; ii < Math.max(part.data.tracks.length, ss.data.length); ii++) {
        track = part.data.tracks[ii];
        if (!track) {
            track = {};
            track.data = [];
            track.data[p.getTotalSubbeats()] = false;
            part.data.tracks.push(track);
        }

        if (ii < ss.data.length) {
            track.sound = prefix + ss.data[ii].url + postfix;
            track.name = ss.data[ii].name;            
        }
        else {
            track.sound = "";
            track.name = "";
        }

        if (!track.sound)
            continue;

        if (load && !p.loadedSounds[track.sound]) {
            p.loadSound(track.sound, part);
        }
    }

};


OMusicPlayer.prototype.getSoundSet = function (url, callback) {
    var p = this;

    if (typeof url != "string") {
        return;
    }

    if (!callback) {
        callback = function () {};
    }

    var dl = p.downloadedSoundSets[url];
    if (dl) {
        callback(dl)
        return;
    }

    if (url.indexOf("PRESET_") == 0) {
        callback(url);
        return;
    }

    var xhr2 = new XMLHttpRequest();
    xhr2.open("GET", url, true)
    xhr2.onreadystatechange = function () {

        if (xhr2.readyState == 4) {
            var ojson = JSON.parse(xhr2.responseText);
            if (ojson) {
                p.downloadedSoundSets[url] = ojson;
                callback(ojson);
            } else {
                callback(ojson);
            }
        }
    };
    xhr2.send();

};

OMusicPlayer.prototype.loadSoundsFromSoundSet = function (soundSet) {
    for (var i = 0; i < soundSet.data.length; i++) {
        this.loadSound((soundSet.prefix || "") + soundSet.data[i].url + 
            (soundSet.postfix || ""));
    }
};

OMusicPlayer.prototype.getSoundURL = function (soundSet, note) {
    console.warn("deprecrating omuisplayer getSoundUrl")
    var noteIndex;
    if (soundSet.chromatic) {
        noteIndex = note.scaledNote - soundSet.lowNote;
        if (noteIndex < 0) {
            noteIndex = noteIndex % 12 + 12;
        } else {
            while (noteIndex >= soundSet.data.length) {
                noteIndex = noteIndex - 12;
            }
        }
    }
    else {
        noteIndex = note.note;
    }

    if (!soundSet.data[noteIndex]) {
        return "";
    }

    //kinda hacky place for this
    note.sound = (soundSet.prefix || "") + soundSet.data[noteIndex].url + 
            (soundSet.postfix || "");    
    
    return note.sound;
};


OMusicPlayer.prototype.splitInts = function (input) {
    var newInts = [];
    var elements = input.split(",");
    elements.forEach(function (el) {
        newInts.push(parseInt(el));
    });
    return newInts;
};

OMusicPlayer.prototype.getTotalSubbeats = function () {
    return this.beats * this.subbeats * this.measures;
};
*/