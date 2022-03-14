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

    this.setupNextSection(true)
}



OMusicPlayer.prototype.play = async function () {
    if (!this.audioContext)
        return;

    if (this.audioContext.state === "suspended")
        this.audioContext.resume();

    if (!this.song) {
        console.warn("OMusicPlayer.play(), no song loaded")
        return
    }
    
    if (!this.song.sections || !Object.keys(this.song.sections).length) {
        console.warn("no sections to play()");
        return -1;
    }

    if (!this.section) {
        // could have been added after we loaded
        this.setupNextSection(this.arrangementI === 0)
    }

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
            this.onBeatPlayedListeners[il].call(null, this.iSubBeat, this.section, this.section.currentChordI);
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
                                    this.section.data.measures) {
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
    
    var beatParams = this.song.data.beatParams;

    this.subbeatLength = 1000 / (beatParams.bpm / 60 * beatParams.subbeats);

    for (var part of this.auditioningParts) {
        this.playBeatForMelody(this.iSubBeat, part);
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
        this.iSubBeat = 0;
    }

    if (this.auditioningParts.length > 0) {
        setTimeout(() => {this._audition ();}, (this.nextBeatTime - this.audioContext.currentTime) * 1000 - this.latency)
    }
};

OMusicPlayer.prototype.afterSection = function () {
    this.iSubBeat = 0;
    //this.loopStarted = Date.now();

    // is this ever used? some kind of queue
    if (this.nextUp) {
        this.iSubBeat = 0;
        this.loopStarted = Date.now();
        this.song = this.nextUp;
        this.setupNextSection(true);
        this.nextUp = null;
        return;
    }

    var nextChord = false;
    if (this.section.data.chordProgression) {
        this.section.currentChordI++;
        if (this.section.currentChordI < this.section.data.chordProgression.length) {
            nextChord = true;
        }
        else {
            this.section.currentChordI = 0;
        }
        if (this.section.chord !== this.section.data.chordProgression[this.section.currentChordI]) {
            this.musicContext.rescaleSection(this.section, this.section.data.chordProgression[this.section.currentChordI]);
        }
    }

    if (!nextChord) {
        this.lastSection = this.section;

        var movingOn = this.setupNextSection();
        if (movingOn) {
            this.iSubBeat = 0;
            this.loopStarted = Date.now();
        }
    }
};

// this function will return false if we're at the end
// and the onreachend() hook adds more and returns true
OMusicPlayer.prototype.setupNextSection = function (fromStart) {

    if (fromStart) {
        this.loopSection = null
        this.arrangementI = 0;
        if (this.song.arrangement.length > 0) {
            this.arrangementSection = this.song.arrangement[this.arrangementI]
            this.section = this.arrangementSection.section;

            //todo this arrangement stuff is all half baked
            if (!this.section) this.section = Object.values(this.song.sections)[0];
            this.arrangementSection.repeated = 0;
        }
        else {
            // there is no arrangement
            this.section = Object.values(this.song.sections)[0];
        }
        return true;
    }
    
    if (typeof this.queuedSection === "number") {
        this.loopSection = this.queuedSection;
        this.queuedSection = undefined;
    }
    else if (typeof this.queuedSection === "string") {
        for (var i = 0; i < this.song.sections.length; i++) {
            if (this.song.sections[i].data.name === this.queuedSection) {
                this.loopSection = i;
                this.queuedSection = undefined;
                break;
            }
        }
    }


    if (this.loopSection) {
        this.section = this.loopSection;
        if (this.onloop) this.onloop()
        return true;
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
    this.arrangementI++;
    if (this.arrangementI >= this.song.arrangement.length) {

        // a hook for clients that want to keep going
        if (this.onreachedend && this.onreachedend()) {
            this.arrangementI-- //undo the increment
            this.section.currentChordI = 0
            return false 
        }
        else {
            this.arrangementI = 0
            if (!this.song.loop) {
                this.stop();
            }
            else {
                if (this.onloop) this.onloop();
            }
        }
    }
    this.arrangementSection = this.song.arrangement[this.arrangementI]
    this.section = this.arrangementSection.section;
    return true
};

OMusicPlayer.prototype.stop = function () {
    
    clearInterval(this.playingIntervalHandle);
    this.playing = false;

    for (var il = 0; il < this.onPlayListeners.length; il++) {
        try {
            this.onPlayListeners[il].call(null, false);
        } catch (ex) {
            console.error(ex);
        }
    }
    
    for (var il = 0; il < this.onBeatPlayedListeners.length; il++) {
        try {
            this.onBeatPlayedListeners[il].call(null, -1, this.section);
        } catch (ex) {console.error(ex);}
    }


    if (this.song && this.song.sections[this.song.playingSection]) {
        var parts = this.song.sections[this.song.playingSection].parts;
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
    
    if (part.surface.url === "PRESET_SEQUENCER") {
        this.playBeatForDrumPart(iSubBeat, part);
    } 
    else if (part.surface.url === "PRESET_MIC") {
        //nothing to do
    } else {
        this.playBeatForMelody(iSubBeat, part);
    }
};

OMusicPlayer.prototype.playBeatForDrumPart = function (iSubBeat, part) {
    var tracks = part.data.tracks;

    if (part.headPart && part.headPart.data.audioParams.mute)
        return;
    
    //todo figure out audioParams per sectionPart
    //if (part.data.audioParams.mute)
    //    return;
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

        //todo mute individual section parts
        //if (part.data.audioParams.mute) {
            //play solo they can't here ya
        //}
        if (part.headPart && part.headPart.data.audioParams.mute) {
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
                beats: part.liveNotes.autobeat / part.song.data.beatParams.subbeats};
            
            this.playNote(note, part);
            if (this.playing && !part.headPart.data.audioParams.mute) {
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
        //todo sectionpart vs headpart?
        var warp = (part.headPart || part).data.audioParams.warp;
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
    
    if (sectionPart.liveNotes && sectionPart.liveNotes.liveAudio) {
            sectionPart.liveNotes.liveAudio.bufferGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.001);
            sectionPart.liveNotes.liveAudio.stop(this.audioContext.currentTime + 0.015);
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
            sectionPart.liveNote = this.musicContext.soundFontPlayer.queueWaveTable(this.audioContext, part.preFXGain,
                window[part.soundFont], 0, notes[0].scaledNote, 20);
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
            part.currentI = sectionPart.data.notes.indexOf(notes[0]) + 1;
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
        if (sectionPart.liveNotes && sectionPart.liveNotes.liveAudio) {
            sectionPart.liveNotes.liveAudio.bufferGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.001);
            sectionPart.liveNotes.liveAudio.stop(this.audioContext.currentTime + 0.015);
        }
    }
    sectionPart.liveNotes = [];
    
    sectionPart.nextBeat = 0;
    sectionPart.currentI = -1;
    
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

OMusicPlayer.prototype.queueSection = function (arrangementSection) {

    if (!this.playing) {
        this.arrangementSection = arrangementSection
        this.section = arrangementSection.section
        this.arrangementI = this.song.arrangement.indexOf(arrangementSection)
        this.arrangementSection.repeated = 0
    }

    //todo ?
    // set chord progression to 0
}



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

*/