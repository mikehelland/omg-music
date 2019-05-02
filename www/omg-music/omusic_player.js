if (typeof omg !== "object") omg = {};
if (!omg.loadedSounds) omg.loadedSounds = {};
if (!omg.downloadedSoundSets) omg.downloadedSoundSets = {};

function OMusicPlayer() {

    this.dev = typeof (omg) == "object" && omg.dev;

    var p = this;

    p.playing = false;
    p.loadedSounds = omg.loadedSounds;
    p.downloadedSoundSets = omg.downloadedSoundSets;
    
    p.latency = 20;
    p.latencyMonitor = 0;
    
    p.context = p.getAudioContext();
    p.tuna = omg.tuna;

    this.auditioningParts = [];

    p.onBeatPlayedListeners = [];

    p.iSubBeat = 0;
    p.loopStarted = 0;

    p.nextUp = null;

    p.loopSection = -1;
    
    p.setupFX();
}

OMusicPlayer.prototype.getAudioContext = function () {
    if (omg.audioContext) {
        return omg.audioContext;
    }

    if (!window.AudioContext)
        window.AudioContext = window.webkitAudioContext;

    try {
        omg.audioContext = new AudioContext();
        if (!omg.audioContext.createGain)
            omg.audioContext.createGain = omg.audioContext.createGainNode;
        omg.tuna = new Tuna(omg.audioContext);
    } catch (e) {
        console.warn("no web audio");
        return null;
    }

    return omg.audioContext;
};

OMusicPlayer.prototype.play = function (song) {
    var p = this;
    if (!p.context)
        return;

    if (p.context.state === "suspended")
        p.context.resume();

    if (song) {
        if (!p.prepareSong(song)) {
            return;
        }
    }

    if (!p.song.sections || !p.song.sections.length) {
        console.warn("no sections to play()");
        return -1;
    }

    p.setupNextSection(typeof p.startArrangementAt !== "number");

    p.playing = true;
    p.loopStarted = Date.now();
    p.iSubBeat = 0;
    
    p.nextBeatTime = p.context.currentTime + (p.latency / 1000);

    p.currentChordI = 0;
    p.rescaleSection(p.section, p.section.data.chordProgression[0]);

    this._play();

    if (typeof (p.onPlay) == "function") {
        p.onPlay(p);
    }
};

OMusicPlayer.prototype._play = function () {
    var p = this;
    var beatParams = p.song.data.beatParams;

    if (!p.playing)
        return;

    p.subbeatLength = 1000 / (beatParams.bpm / 60 * beatParams.subbeats);

    if (p.loopSection > -1 && p.loopSection < p.song.sections.length) {
        p.section = p.song.sections[p.loopSection];
        p.sectionI = p.loopSection;
    }

    p.playBeat(p.section, p.iSubBeat);

    for (var il = 0; il < p.onBeatPlayedListeners.length; il++) {
        try {
            p.onBeatPlayedListeners[il].call(null, p.iSubBeat, p.section);
        } catch (ex) {
            console.error(ex);
        }
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
        p.afterSection();

        if (p.negativeLatencyCounter > 0 && p.latency < 500) {
            p.latency += 20;
        }
        p.negativeLatencyCounter = 0;
    }

    if (p.playing) {
        setTimeout(function () {p._play();}, (p.nextBeatTime - p.context.currentTime) * 1000 - p.latency)
    }

    p.latencyMonitor = Math.round((timeToPlay - p.context.currentTime) * 1000);
    if (p.latencyMonitor < 0)
        p.negativeLatencyCounter++
};

OMusicPlayer.prototype.auditionPart = function (part) {
    this.auditioningParts.push(part);
    if (this.auditioningParts.length === 1) {
        this.iSubBeat = 0;
        this.nextBeatTime = this.context.currentTime + (this.latency / 1000);
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

    for (part of p.auditioningParts) {
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
        setTimeout(function () {p._audition ();}, (p.nextBeatTime - p.context.currentTime) * 1000 - p.latency)
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
        p.currentChordI++;
        if (p.currentChordI < p.section.data.chordProgression.length) {
            nextChord = true;
        }
        else {
            p.currentChordI = 0;
        }
        if (p.section.chord !== p.section.data.chordProgression[p.currentChordI]) {
            p.rescaleSection(p.section, p.section.data.chordProgression[p.currentChordI]);
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
        //p.loopSection = -1;
        if (p.song.arrangement.length > 0) {
            p.arrangementI = 0;
            p.section = p.song.arrangement[p.arrangementI].section;
            p.song.arrangement[p.arrangementI].repeated = 0;
        }
        else {
            p.sectionI = 0;
            p.section = p.song.sections[p.sectionI];
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


    if (p.loopSection > -1) {
        p.sectionI = p.loopSection;
        p.section = p.song.sections[p.sectionI];
        return;
    }
    
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
                p.stop();
            }
            else {
                if (p.onloop) p.onloop();
            }
        }
        p.section = p.song.arrangement[p.arrangementI].section;
        p.song.arrangement[p.arrangementI].repeated = 0;
        return;
    }

    if (typeof p.sectionI !== "number") {
        p.sectionI = -1; 
    }
    p.sectionI++;
    if (p.sectionI >= p.song.sections.length) {
        p.sectionI = 0;
        if (!p.song.loop) {
            p.stop();
        }
        else {
            if (p.onloop) p.onloop();
        }
    }
    p.section = p.song.sections[p.sectionI];
};

OMusicPlayer.prototype.stop = function () {
    var p = this;

    clearInterval(p.playingIntervalHandle);
    p.playing = false;

    if (typeof (p.onStop) == "function") {
        p.onStop(p);
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

OMusicPlayer.prototype.loadSection = function (section, soundsNeeded) {
    var part;
    for (var ipart = 0; ipart < section.parts.length; ipart++) {
        part = section.parts[ipart];
        this.loadPart(part, soundsNeeded);
    }
};

OMusicPlayer.prototype.loadPart = function (part, soundsNeeded) {
    var p = this;

    if (!part.panner) {
        this.makeAudioNodesForPart(part);
    }

    var download = false;
    if (!soundsNeeded) {
        download = true;
        soundsNeeded = {};
    }

    if (part.data.surface.url === "PRESET_SEQUENCER") {
        this.loadDrumbeat(part, soundsNeeded);
    } else {
        this.loadMelody(part, soundsNeeded);
    }
    
    if (download) {
        for (var sound in soundsNeeded) {
            p.loadSound(sound);
        }
    }
};

OMusicPlayer.prototype.loadMelody = function (part, soundsNeeded) {
    var p = this;

    var data = part.data;
    
    var section = part.section;
    var song = part.section ? part.section.song : undefined;

    part.currentI = -1;

    if (data.soundSet && data.soundSet.data) {
        if (!p.downloadedSoundSets[data.soundSet.name]) {
            p.downloadedSoundSets[data.soundSet.name] = data.soundSet;
        }
        part.soundSet = data.soundSet;
        p.prepareMelody(part, soundsNeeded);
    }
    else if (data.soundSet && typeof data.soundSet.url === "string") {
        if (data.soundSet.url.startsWith("PRESET_OSC")) {
            part.soundSet = {osc: true};
        }
        else {
            p.getSoundSet(data.soundSet.url, function (soundSet) {
                part.soundSet = soundSet;
                p.prepareMelody(part, soundsNeeded);
            });
        }
    }
  
};

OMusicPlayer.prototype.prepareMelody = function (part, soundsNeeded) {
    var p = this;
    
    this.setupPartWithSoundSet(part.soundSet, part);
    
    if (this.loadFullSoundSets) {
        this.loadSoundsFromSoundSet(part.soundSet);
        return;
    }

    var soundsToLoad = 0;
    var chordsDone = [];
    part.section.data.chordProgression.forEach(chord => {
        if (chordsDone.indexOf(chord) > -1) {
            return;
        }
        chordsDone.push(chord);
        p.rescale(part, part.section.song.data.keyParams, chord, soundsNeeded);
        
    });

    if (soundsToLoad == 0) {
        part.loaded = true;
    }

};

OMusicPlayer.prototype.loadDrumbeat = function (part, soundsNeeded) {

    var tracks = part.data.tracks;
    var empty;
    for (var i = 0; i < tracks.length; i++) {
        if (!this.loadFullSoundSets) {
            empty = true;
            for (var j = 0; j < tracks[i].data.length; j++) {
                if (tracks[i].data[j]) {
                    empty = false;
                    break;
                }
            }
            if (empty) {
                continue;
            }
        }

        if (soundsNeeded && tracks[i].sound && 
                !omg.loadedSounds[tracks[i].sound] &&
                !soundsNeeded[tracks[i].sound]) {
            soundsNeeded[tracks[i].sound] = true;
        }
    }

    if (part.data.soundSet && !part.soundSet) {
        part.soundSet = part.data.soundSet;
    }
};

OMusicPlayer.prototype.playWhenReady = function (sections) {
    var p = this;
    var allReady = true;

    for (var i = 0; i < sections.length; i++) {
        for (var j = 0; j < sections[i].parts.length; j++) {
            if (!sections[i].parts[j].loaded) {
                allReady = false;
                console.info("section " + i + " part " + j + " is not ready");
            }
        }
    }
    if (!allReady) {
        setTimeout(function () {
            p.playWhenReady(sections);
        }, 600);
    } else {
        p.play(sections);
    }
};

OMusicPlayer.prototype.prepareSongFromURL = function (url, callback) {
    var p = this;
    fetch(url).then(function (response) {
        response.json().then(data => {
            try {
                var song = p.makeOMGSong(data);
                p.prepareSong(song, callback);
            }
            catch (e) {
                console.error(e);
            }
        });
    });

};

OMusicPlayer.prototype.prepareSong = function (song, callback) {
    var p = this;
    
    if (!song.madeAudioNodes) {
        p.makeAudioNodesForSong(song);
    }
    
    p.keyParams = song.data.keyParams;
    p.beatParams = song.data.beatParams;

    var soundsNeeded = {};

    for (var isection = 0; isection < song.sections.length; isection++) {

        p.loadSection(song.sections[isection], soundsNeeded);
    }

    var finish = function () {
        if (p.playing) {
            p.nextUp = song;
        }
        else {
            p.song = song;
        }
        if (callback) callback();
    };
    
    if (Object.keys(soundsNeeded).length === 0 || p.disableAudio) {
        finish();
        return true;
    }
    
    for (var sound in soundsNeeded) {
        p.loadSound(sound, function (sound) {
            delete soundsNeeded[sound];
            if (Object.keys(soundsNeeded).length === 0) {
                finish();
            }
        });
    }
    return true;
};



OMusicPlayer.prototype.playBeat = function (section, iSubBeat) {
    var p = this;
    for (var ip = 0; ip < section.parts.length; ip++) {
        p.playBeatForPart(iSubBeat, section.parts[ip]);
    }


};

OMusicPlayer.prototype.playBeatForPart = function (iSubBeat, part) {
    var p = this;

    if (part.data.surface.url === "PRESET_SEQUENCER") {
        p.playBeatForDrumPart(iSubBeat, part);
    } else {
        p.playBeatForMelody(iSubBeat, part);
    }
};

OMusicPlayer.prototype.playBeatForDrumPart = function (iSubBeat, part) {
    var tracks = part.data.tracks;

    if (part.data.audioParams.mute)
        return;
    var strength;
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
    var p = this;
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
            p.playNote(note, part, data);
        }
            
        if (note) {
            part.nextBeat += p.song.data.beatParams.subbeats * note.beats;
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
            if (part.soundSet && !part.soundSet.osc) {
                note.sound = this.getSoundURL(part.soundSet, part.liveNotes[index]);
            }

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

OMusicPlayer.prototype.makeOsc = function (part) {
    var p = this;

    if (!p.context) {
        return;
    }

    if (part.osc) {
        console.info("makeOsc, already exists");
        try {
            part.osc.stop(p.context.currentTime);
            part.osc.disconnect(part.gain);
            part.gain.disconnect(part.preFXGain);
        } catch (e) {
        }
    }

    part.osc = p.context.createOscillator();

    var soundsetURL = part.data.soundSet.url ||
            "PRESET_OSC_TRIANGLE_SOFT_DELAY";
    if (soundsetURL.indexOf("SAW") > -1) {
        part.osc.type = "sawtooth";
    } else if (soundsetURL.indexOf("SINE") > -1) {
        part.osc.type = "sine";
    } else if (soundsetURL.indexOf("SQUARE") > -1) {
        part.osc.type = "square";
    }
    else if (soundsetURL.indexOf("TRIANGLE") > -1) {
        part.osc.type = "triangle";
    }

    part.osc.connect(part.preFXGain);

    part.baseFrequency = 0;
    part.osc.frequency.setValueAtTime(0, p.context.currentTime);
    part.osc.start(p.context.currentTime);

    part.osc.finishPart = function () {
        part.osc.frequency.setValueAtTime(0, p.nextBeatTime);
        //todo keep freq same, reduce volume
        part.baseFrequency = 0;

        //total hack, this is why things should be processed ala AudioContext, not our own thread
        /*setTimeout(function () {
            part.osc.stop(p.context.currentTime);
            part.osc.disconnect(part.preFXGain);

            part.oscStarted = false;
            part.osc = null;
            part.gain = null;
        }, 50);*/
    };

    part.oscStarted = true;

};

OMusicPlayer.prototype.makeFrequency = function (mapped) {
    return Math.pow(2, (mapped - 69.0) / 12.0) * 440.0;
};


OMusicPlayer.prototype.loadSound = function (sound, onload) {
    var p = this;

    if (!sound || !p.context || p.disableAudio) {
        return;
    }
    var key = sound;
    var url = sound;
    onload = onload || function () {};
    
    if (p.loadedSounds[key]) {
        onload(key);
        return;
    }
    
    if (url.startsWith("http:") && !window.location.protocol.startsWith("file:")) {
        url = sound.slice(5);
    }

    p.loadedSounds[key] = "loading";

    if (!omg.util) {
        p.downloadSound(url, key, onload);
        return;
    }
    
    var saved = omg.util.getSavedSound(key, function (buffer) {
        if (!buffer) {
            p.downloadSound(url, key, onload);
        }
        else {
            p.context.decodeAudioData(buffer, function (buffer) {
                p.loadedSounds[key] = buffer;
                onload(key);
            }, function () {
                console.warn("error loading sound url: " + url);
                onload(key);
            });
        }
    });
};

OMusicPlayer.prototype.downloadSound = function (url, key, onload) {
    var p = this;
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
        var data = request.response.slice(0);
        p.context.decodeAudioData(request.response, function (buffer) {
            p.loadedSounds[key] = buffer;
            onload(key);
            if (omg.util) {
                omg.util.saveSound(key, data);
            }
        }, function () {
            console.warn("error loading sound url: " + url);
            onload(key);
        });
    }
    request.send();
};


OMusicPlayer.prototype.rescale = function (part, keyParams, chord, soundsNeeded) {
    var p = this;

    var data = part.data;
    if (!data || !data.notes) {
        return;
    }

    var octave = data.soundSet.octave;
    var octaves2;
    var newNote;
    var onote;
    var note;

    for (var i = 0; i < data.notes.length; i++) {
        onote = data.notes[i];
        if (onote.rest || 
                typeof onote.note !== "number" || 
                onote.note !== Math.round(onote.note)) {
            continue;
        }

        newNote = onote.note + chord;
        octaves2 = 0;
        while (newNote >= keyParams.scale.length) {
            newNote = newNote - keyParams.scale.length;
            octaves2++;
        }
        while (newNote < 0) {
            newNote = newNote + keyParams.scale.length;
            octaves2--;
        }

        newNote = keyParams.scale[newNote] + octaves2 * 12 + 
                octave * 12 + keyParams.rootNote;

        onote.scaledNote = newNote;
        
        if (part.soundSet && !part.soundSet.osc) {
            p.updateNoteSound(onote, part.soundSet);
        }
        
        if (soundsNeeded && onote.sound && 
                !omg.loadedSounds[onote.sound] &&
                !soundsNeeded[onote.sound]) {
            soundsNeeded[onote.sound] = true;
        }
    }
};

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


OMusicPlayer.prototype.playNote = function (note, part) {
    var p = this;
    
    var fromNow = (note.beats * 4 * p.subbeatLength) / 1000;

    if (!note || note.rest) {
        if (part.osc) {
            //todo keep freq same, reduce volume
            part.baseFrequency = 0;
            part.osc.frequency.setValueAtTime(0, p.nextBeatTime);
        }
        return;
    }

    if (part.osc) {
        part.baseFrequency = p.makeFrequency(note.scaledNote);
        part.osc.frequency.setValueAtTime(part.baseFrequency * part.data.audioParams.warp, p.nextBeatTime);
        part.playingI = part.currentI;
        var playingI = part.playingI;
        
        //this should be a timeout so it can be canceled if
        //a different note has played
        setTimeout(function () {
            if (part.osc && part.playingI === playingI) {
                //todo keep freq same, reduce volume
                part.baseFrequency = 0;
                part.osc.frequency.setValueAtTime(0,
                        //p.subbeats * note.beats * p.subbeatLength * 0.85)
                        p.nextBeatTime * 0.88);
            }
        }, p.song.data.beatParams.subbeats * note.beats * p.subbeatLength * 0.85);
    }
    else {
        var audio = p.playSound(note.sound, part);
        if (audio) {
            audio.bufferGain.gain.linearRampToValueAtTime(part.data.audioParams.gain, 
                p.context.currentTime + fromNow * 0.995);
            audio.bufferGain.gain.linearRampToValueAtTime(0, p.context.currentTime + fromNow);
            audio.stop(p.context.currentTime + fromNow);
        }
    }
};



OMusicPlayer.prototype.playSound = function (sound, part, audioParams, strength) {
    var p = this;
    if (p.loadedSounds[sound] &&
            p.loadedSounds[sound] !== "loading") {

        var source = p.context.createBufferSource();
        source.bufferGain = p.context.createGain();
        source.buffer = p.loadedSounds[sound];

        var gain = 1;
        var warp = part.data.audioParams.warp;
        if (audioParams) {
            warp = (warp - 1) + (audioParams.warp - 1) + 1;
            gain = audioParams.gain;
        }
        if (audioParams && audioParams.pan) {                        
            source.bufferPanner = p.context.createStereoPanner();            
            source.bufferPanner.pan.setValueAtTime(audioParams.pan, p.context.currentTime);
                        
            source.connect(source.bufferPanner);
            source.bufferPanner.connect(source.bufferGain);
        }
        else {
            source.connect(source.bufferGain);
        }

        if (strength) {
            gain = gain * strength;
        }

        source.bufferGain.gain.setValueAtTime(gain, p.context.currentTime);
        source.bufferGain.connect(part.preFXGain);

        source.playbackRate.value = warp;

        source.start(p.nextBeatTime);
        
        return source;
    }
};

OMusicPlayer.prototype.getSoundURL = function (soundSet, note) {
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

OMusicPlayer.prototype.makeOMGSong = function (data) {
    var newSong;
    var newSection;
    var newPart;

    if (!data) {
        return null;
    }

    var className = data.constructor.name;

    if (className == "OMGSong") {
        return data;
    }

    if (className == "OMGPart") {

        newSong = new OMGSong();
        newSection = new OMGSection(null, null, newSong);
        newSection.parts.push(data);
        data.section = newSection;

        if (data.data.beatParams) {
            newSection.data.beatParams = data.data.beatParams;
            newSong.data.beatParams = newSection.data.beatParams;
        }
        return newSong;
    }

    if (className == "OMGSection") {

        newSong = new OMGSong();
        newSong.sections.push(data);
        if (data.data.beatParams)
            newSong.data.beatParams = data.data.beatParams;
        if (data.data.keyParams)
            newSong.data.keyParams = data.data.keyParams;
        
        data.song = newSong;
        return newSong;
    }

    if (!data.type) {
        return null;
    }

    var newSong;
    if (data.type == "SONG") {
        newSong = new OMGSong(null, data);
        return newSong;
    }

    if (data.type == "SECTION") {
        //newSong = new OMGSong();
        newSection = new OMGSection(null, data);
        return newSection.song;
    }

    if (data.type == "PART") {
        newPart = new OMGPart(null, data);
        return newPart.section.song;
    }

    return null;
};

OMusicPlayer.prototype.updatePartVolumeAndPan = function (part) {

    //todo umm?
    if (part.gain && part.osc) {
        //var oscGain = (part.osc.soft ? 1 : 2) * part.data.volume / 10;
        part.gain.gain.setValueAtTime(Math.pow(part.data.volume, 2), this.context.currentTime);
    }
    if (part.bufferGain) {
        part.bufferGain.gain.setValueAtTime(Math.pow(part.data.volume, 2), this.context.currentTime);
    }
    if (part.panner) {
        part.panner.pan.setValueAtTime(part.data.pan, this.context.currentTime);
    }

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

OMusicPlayer.prototype.rescaleSection = function (section, chord) {
    if (typeof chord !== "number") {
        chord = section.data.chordProgression[this.currentChordI];
    }
    var p = this;
    section.parts.forEach(function (part) {
        if (part.data.surface.url === "PRESET_VERTICAL" && part.data.soundSet.chromatic) {
            p.rescale(part, section.song.data.keyParams, chord || 0);
        }
    });
    section.chord = chord;
};

OMusicPlayer.prototype.rescaleSong = function (rootNote, ascale, chord) {
    var p = this;
    var song = this.song.data;
    if (rootNote != undefined) {
        song.rootNote = rootNote;
    }
    if (ascale != undefined) {
        song.ascale = ascale;
    }
    this.song.sections.forEach(function (section) {
        p.rescaleSection(section, chord || 0);
    });
};

OMusicPlayer.prototype.setSubbeatMillis = function (subbeatMillis) {
    this.newSubbeatMillis = subbeatMillis;
};

OMusicPlayer.prototype.playLiveNotes = function (notes, part) {

    if (this.context.state === "suspended")
        this.context.resume();
    
    if (part.liveNotes && part.liveNotes.liveAudio) {
            part.liveNotes.liveAudio.bufferGain.gain.setTargetAtTime(0, this.context.currentTime, 0.001);
            part.liveNotes.liveAudio.stop(this.context.currentTime + 0.015);
    }
    
    part.liveNotes = notes;
    if (notes.autobeat === 0) {
        part.playingI = -1;
        if (part.osc) {
            part.baseFrequency = this.makeFrequency(notes[0].scaledNote);
            part.osc.frequency.setValueAtTime(
                    part.baseFrequency * part.data.audioParams.warp, this.context.currentTime);
        }
        else {
            //var sound = this.getSound(part.data.soundSet, notes[0]);
            notes[0].sound = this.getSoundURL(part.soundSet, notes[0]);
            part.liveNotes.liveAudio = this.playSound(notes[0].sound, part);
        }
        
        if (this.playing && !part.data.audioParams.mute) {
            this.recordNote(part, notes[0]);
            part.currentI = part.data.notes.indexOf(notes[0]) + 1;
        }
    }
    else {
        if (!this.playing && this.auditioningParts.indexOf(part) == -1) {
            this.auditionPart(part);
        }
        
    }
};

OMusicPlayer.prototype.endLiveNotes = function (part) {
  
    if (part.osc) {
        //todo keep freq same, reduce volume
        part.baseFrequency = 0;
        part.osc.frequency.setValueAtTime(0,
                this.context.currentTime);
    }  
    else {
        if (part.liveNotes && part.liveNotes.liveAudio) {
            part.liveNotes.liveAudio.bufferGain.gain.setTargetAtTime(0, this.context.currentTime, 0.001);
            part.liveNotes.liveAudio.stop(this.context.currentTime + 0.015);
        }
    }
    part.liveNotes = [];
    
    part.nextBeat = 0;
    part.currentI = -1;
    
    if (!this.playing && this.auditioningParts.indexOf(part) > -1) {
        this.auditionEnd(part);
    }
};

OMusicPlayer.prototype.recordNote = function (part, note) {

    var beatsUsed = 0;
    var currentBeat = this.iSubBeat / part.section.song.data.beatParams.subbeats;
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
};

OMusicPlayer.prototype.makeAudioNodesForPart = function (part) {

    var p = this;
    part.panner = p.context.createStereoPanner();
    part.gain = p.context.createGain();
    part.preFXGain = p.context.createGain();
    part.postFXGain = part.gain;
    part.preFXGain.connect(part.postFXGain);
    part.gain.connect(part.panner);
    part.panner.connect(part.section.song.preFXGain);
    part.gain.gain.setValueAtTime(part.data.audioParams.gain, p.context.currentTime);
    part.panner.pan.setValueAtTime(part.data.audioParams.pan, p.context.currentTime);

    for (var i = 0; i < part.data.fx.length; i++) {
        p.makeFXNodeForPart(part.data.fx[i], part);        
    }
    
    if (part.data.soundSet.url && part.data.soundSet.url.startsWith("PRESET_OSC")) {
        p.makeOsc(part);
    }
};

OMusicPlayer.prototype.makeAudioNodesForSong = function (song) {
    var p = this;
    song.preFXGain = p.context.createGain();
    song.postFXGain = p.context.createGain();
    song.preFXGain.connect(song.postFXGain);
    song.postFXGain.connect(p.context.destination);
        
    if (song.data.fx) {
        for (var i = 0; i < song.data.fx.length; i++) {
            p.makeFXNodeForPart(song.data.fx[i], song);        
        }
    }    
    song.madeAudioNodes = true;
};


OMusicPlayer.prototype.addFXToPart = function (fx, part) {
    var node = this.makeFXNodeForPart(fx, part)
    if (node) {
        part.data.fx.push(node.data);
    }
    return node;
};

OMusicPlayer.prototype.removeFXFromPart = function (fx, part) {
    var index = part.fx.indexOf(fx);
    
    var connectingNode = part.fx[index - 1] || part.preFXGain;
    var connectedNode = part.fx[index + 1] || part.postFXGain;
    fx.disconnect();
    connectingNode.disconnect();
    connectingNode.connect(connectedNode);

    part.fx.splice(index, 1);
    index = part.data.fx.indexOf(fx.data);
    part.data.fx.splice(index, 1);

};

OMusicPlayer.prototype.setupFX = function () {
    var p = this;
        
    p.fx = {};
    p.fx["EQ"] = {"make" : function (data) {
            var eq = p.makeEQ(data);
            return eq;
        },
        "controls": [
            {"property": "highGain", default: 1, "name": "EQ High", "type": "slider", "min": 0, "max": 1.5, transform: "square"},
            {"property": "midGain", default: 1, "name": "EQ Mid", "type": "slider", "min": 0, "max": 1.5, transform: "square"},
            {"property": "lowGain", default: 1, "name": "EQ Low", "type": "slider", "min": 0, "max": 1.5, transform: "square"}
        ]
    };
    p.fx["CompressorW"] = {"make" : function (data) {
            var compressor = p.context.createDynamicsCompressor();
            compressor.threshold.value = -50;
            compressor.knee.value = 40;
            compressor.ratio.value = 2;
            compressor.attack.value = 0;
            compressor.release.value = 0.25;
            
            Object.defineProperty(compressor, 'bypass', {
                get: function() {
                    return data.bypass;
                },
                set: function(value) {
                    data.bypass = value;
                }
            });
            return compressor;
        },
        "controls": [
            {"property": "threshold", default: -50, "name": "Threshold", "type": "slider", "min": -100, "max": 0},
            {"property": "knee", default: 40, "name": "Knee", "type": "slider", "min": 0, "max": 40},
            {"property": "ratio", default: 2, "name": "Ratio", "type": "slider", "min": 1, "max": 20},
            //{"property": "reduction", "name": "Reduction", "type": "slider", "min": -20, "max": 0},
            {"property": "attack", default: 0, "name": "Attack", "type": "slider", "min": 0, "max": 1},
            {"property": "release", default: 0.25, "name": "Release", "type": "slider", "min": 0, "max": 1}
        ]
    };
    p.fx["DelayW"] = {"make" : function (data) {
            return p.makeDelay(data);
        },
        "controls": [
            {"property": "time", "name": "Delay Time", default: 0.25, "type": "slider", "min": 0, "max": 5, axis:"revx"},
            {"property": "feedback", "name": "Feedback", default: 0.25, "type": "slider", "min": 0, "max": 1.0, axis:"revy"},
        ]
    };    
    p.fx["Delay"] = {"audioClass" : p.tuna.Delay,
        "controls": [
            {"property": "feedback", default: 0.45, "name": "Feedback", "type": "slider", "min": 0, "max": 1},
            {"property": "delayTime", default: 150, "name": "Delay Time", "type": "slider", "min": 1, "max": 1000},
            {"property": "wetLevel", default: 0.25, "name": "Wet Level", "type": "slider", "min": 0, "max": 1},
            {"property": "dryLevel", default: 1, "name": "Dry Level", "type": "slider", "min": 0, "max": 1},
            {"property": "cutoff", default: 2000, "name": "Cutoff", "type": "slider", "min": 20, "max": 22050}
        ]
    };
    p.fx["Chorus"] = {"audioClass": p.tuna.Chorus,
        "controls": [
            {"property": "rate", default: 1.5, "name": "Rate", "type": "slider", "min": 0.01, "max": 8, axis:"x"},
            {"property": "feedback", default: 0.2, "name": "Feedback", "type": "slider", "min": 0, "max": 1},
            {"property": "depth", default: 0.7, "name": "Depth", "type": "slider", "min": 0, "max": 1, axis:"y"},
            {"property": "delay", default: 0.0045, "name": "Delay", "type": "slider", "min": 0, "max": 1}
        ]
    };
    
    p.fx["Phaser"] = {"audioClass": p.tuna.Phaser,

        "controls": [
            {"property": "rate", default: 1.2, "name": "Rate", "type": "slider", "min": 0.01, "max": 12, axis:"x"},
            {"property": "depth", default: 0.3, "name": "Depth", "type": "slider", "min": 0, "max": 1},
            {"property": "feedback", default: 0.2, "name": "Feedback", "type": "slider", "min": 0, "max": 1, axis:"y"},
            {"property": "stereoPhase", default: 30, "name": "Stereo Phase", "type": "slider", "min": 0, "max": 180},
            {"property": "baseModulationFrequeny", default: 700, "name": "Base Modulation Freq", "type": "slider", "min": 500, "max": 1500}
        ]
    };        
    p.fx["Overdrive"] = {"audioClass": p.tuna.Overdrive,
        "controls" : [
            {"property": "outputGain", default: 0.15, "name": "Output Gain", "type": "slider", "min": 0, "max": 1.5},
            {"property": "drive", default: 0.7, "name": "Drive", "type": "slider", "min": 0, "max": 1, axis:"x"},
            {"property": "curveAmount", default: 0.8, "name": "Curve Amount", "type": "slider", "min": 0, "max": 1, axis:"y"},
            {"property": "algorithmIndex", default: 0, "name": "Type", "type": "options", "options": [0,1,2,3,4,5]}
        ]
    };
    p.fx["Compressor"] = {"audioClass": p.tuna.Compressor,
        "controls" : [
            {"property": "threshold", default: -1, "name": "Threshold", "type": "slider", "min": -100, "max": 0},
            {"property": "makeupGain", default: 1, "name": "Makeup Gain", "type": "slider", "min": 0, "max": 10},
            {"property": "attack", default: 1, "name": "Attack", "type": "slider", "min": 0, "max": 1000},
            {"property": "release", default: 0, "name": "Release", "type": "slider", "min": 0, "max": 3000},
            {"property": "ratio", default: 4, "name": "Ratio", "type": "slider", "min": 0, "max": 20},
            {"property": "knee", default: 5, "name": "Knee", "type": "slider", "min": 0, "max": 40},
            {"property": "automakeup", default: true, "name": "Auto Makeup", "type": "options", "options": [false, true]}
        ]
    };
    p.fx["Reverb"] = {"audioClass": p.tuna.Convolver,
        "controls": [
            {"property": "highCut", default: 22050, "name": "High Cut", "type": "slider", "min": 20, "max": 22050, axis:"revy"},
            {"property": "lowCut", default: 20, "name": "Low Cut", "type": "slider", "min": 20, "max": 22050},
            {"property": "dryLevel", default: 1, "name": "Dry Level", "type": "slider", "min": 0, "max": 1},
            {"property": "wetLevel", default: 1, "name": "Wet Level", "type": "slider", "min": 0, "max": 1, axis:"x"},
            {"property": "level", default: 1, "name": "Level", "type": "slider", "min": 0, "max": 1},
            {"property": "impulse", default: "/omg-music/impulses/ir_rev_short.wav", "name": "Impulse", "type": "hidden"},
        ]
    };
    p.fx["Filter"] = {"audioClass": p.tuna.Filter,
        "controls": [
            {"property": "frequency", default: 440, "name": "Frequency", "type": "slider", "min": 20, "max": 22050, axis:"x"},
            {"property": "Q", default: 1, "name": "Q", "type": "slider", "min": 0.001, "max": 100},
            {"property": "gain", default: 0, "name": "Gain", "type": "slider", "min": -40, "max": 40, axis: "y"},
            {"property": "filterType", default: "lowpass", "name": "Filter Type", "type": "options", 
                "options": ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass"]},
        ]
    };
    p.fx["Cabinet"] = {"audioClass": p.tuna.Cabinet,
        "controls": [
            {"property": "makeupGain", default: 1, "name": "Makeup Gain", "type": "slider", "min": 0, "max": 20},
            {"property": "impulse", default: "/omg-music/impulses/impulse_guitar.wav", "name": "Impulse", "type": "hidden"}
        ]
    };
    p.fx["Tremolo"] = {"audioClass": p.tuna.Tremolo,
        "controls": [
            {"property": "intensity", default: 0.3, "name": "Intensity", "type": "slider", "min": 0, "max": 1, axis:"revy"},
            {"property": "rate", default: 4, "name": "Rate", "type": "slider", "min": 0.001, "max": 8, axis:"x"},
            {"property": "stereoPhase", default: 0, "name": "Stereo Phase", "type": "slider", "min": 0, "max": 180}
        ]
    };
    p.fx["Wah Wah"] = {"audioClass": p.tuna.WahWah,
        "controls": [
            {"property": "automode", default: true, "name": "Auto Mode", "type": "options", "options": [false, true]},
            {"property": "baseFrequency", default: 0.5, "name": "Base Frequency", "type": "slider", "min": 0, "max": 1, axis:"x"},
            {"property": "excursionOctaves", default: 2, "name": "Excursion Octaves", "type": "slider", "min": 1, "max": 6},
            {"property": "sweep", default: 0.2, "name": "Sweep", "type": "slider", "min": 0, "max": 1, axis:"y"},
            {"property": "resonance", default: 10, "name": "Resonance", "type": "slider", "min": 1, "max": 10},
            {"property": "sensitivity", default: 0.5, "name": "Sensitivity", "type": "slider", "min": -1, "max": 1}
        ]
    };
    p.fx["Bitcrusher"] = {"audioClass": p.tuna.Bitcrusher,
        "controls": [
            {"property": "bits", default: 4, "name": "Bits", "type": "options", "options": [1,2,4,8,16]},
            {"property": "normfreq", default: 0.1, "name": "Normal Frequency", "type": "slider", "min": 0, "max": 1, "transform": "square", axis:"x"},
            {"property": "bufferSize", default: 4096, "name": "Buffer Size", "type": "options", "options": [256,512,1024,2048,4096,8192,16384]}
        ]
    };
    p.fx["Moog"] = {"audioClass": p.tuna.MoogFilter,
        "controls": [
            {"property": "cutoff", default: 0.065, "name": "Cutoff", "type": "slider", "min": 0, "max": 1},
            {"property": "resonance", default: 3.5, "name": "Resonance", "type": "slider", "min": 0, "max": 4},
            {"property": "bufferSize", default: 4096, "name": "Buffer Size", "type": "options", "options": [256,512,1024,2048,4096,8192,16384]}
        ]
    };
    p.fx["Ping Pong"] = {"audioClass": p.tuna.PingPongDelay,
        "controls": [
            {"property": "wetLevel", default: 0.5, "name": "Wet Level", "type": "slider", "min": 0, "max": 1},
            {"property": "feedback", default: 0.3, "name": "Feedback", "type": "slider", "min": 0, "max": 1},
            {"property": "delayTimeLeft", default: 150, "name": "Delay Time Left", "type": "slider", "min": 1, "max": 10000, axis:"x"},
            {"property": "delayTimeRight", default: 200, "name": "Delay Time Right", "type": "slider", "min": 1, "max": 10000, axis:"revy"}
        ]
    };
    p.fx["Rad Pad"] = {"make" : function (data) {
            return p.makeRadPad(data);
        },
        "controls": [
            {"property": "fx1", default: "None", "name": "FX1", "type": "options", 
                "options": ["None", "DelayW", "Reverb", "Ping Pong"]},
            {"property": "fx2", default: "None", "name": "FX2", "type": "options", 
                "options": ["None", "LPF", "HPF", "BPF"]},
            {"property": "fx3", default: "None", "name": "FX3", "type": "options", 
                "options": ["None", "Tremolo", "Phaser", "Chorus"]},
            {"property": "fx4", default: "None", "name": "FX4", "type": "options", 
                "options": ["None", "Bitcrusher", "Overdrive"]},
            {"property": "xy", default: 0.3, "name": "", "type": "xy", "min": 0, "max": 1}
        ]
    };
};

OMusicPlayer.prototype.makeFXNodeForPart = function (fx, part) {
    var fxNode, fxData;
    var fxName = fx;
    if (typeof fx === "object") {
        fxName = fx.name;
        fxData = fx;
    }
    
    var fxNode = this.makeFXNode(fxName, fxData)

    if (fxNode) {
        var connectingNode = part.fx[part.fx.length - 1] || part.preFXGain;
        connectingNode.disconnect(part.postFXGain);
        connectingNode.connect(fxNode);
        fxNode.connect(part.postFXGain);
        part.fx.push(fxNode);
    }
    
    return fxNode;
};

OMusicPlayer.prototype.makeFXNode = function (fxName, fxData) {
    var fxNode;
    var fxInfo = this.fx[fxName];
    if (fxInfo) {
        if (!fxData) {
            fxData = {"name": fxName};
            fxInfo.controls.forEach(control => {
                fxData[control.property] = control.default;
            });
        }
        if (fxInfo.audioClass) {
            fxNode = new fxInfo.audioClass(fxData);
        }
        else {
            fxNode = fxInfo.make(fxData);
        }
        if (fxNode)
            fxNode.data = fxData;
    }
    return fxNode;
};

OMusicPlayer.prototype.getSoundSetForSoundFont = function (name, url) {
  return {"name": name,  "prefix": url, "url": url,
            "type": "SOUNDSET", "soundFont": true, "lowNote": 21, "postfix": "", "chromatic": true, "defaultSurface": "PRESET_VERTICAL", "data": [ { "url": "A0.mp3", "name": "A0" }, { "url": "Bb0.mp3", "name": "Bb0" }, { "url": "B0.mp3", "name": "B0" }, { "url": "C1.mp3", "name": "C1" }, { "url": "Db1.mp3", "name": "Db1" }, { "url": "D1.mp3", "name": "D1" }, { "url": "Eb1.mp3", "name": "Eb1" }, { "url": "E1.mp3", "name": "E1" }, { "url": "F1.mp3", "name": "F1" }, { "url": "Gb1.mp3", "name": "Gb1" }, { "url": "G1.mp3", "name": "G1" }, { "url": "Ab1.mp3", "name": "Ab1" }, { "url": "A1.mp3", "name": "A1" }, { "url": "Bb1.mp3", "name": "Bb1" }, { "url": "B1.mp3", "name": "B1" }, { "url": "C2.mp3", "name": "C2" }, { "url": "Db2.mp3", "name": "Db2" }, { "url": "D2.mp3", "name": "D2" }, { "url": "Eb2.mp3", "name": "Eb2" }, { "url": "E2.mp3", "name": "E2" }, { "url": "F2.mp3", "name": "F2" }, { "url": "Gb2.mp3", "name": "Gb2" }, { "url": "G2.mp3", "name": "G2" }, { "url": "Ab2.mp3", "name": "Ab2" }, { "url": "A2.mp3", "name": "A2" }, { "url": "Bb2.mp3", "name": "Bb2" }, { "url": "B2.mp3", "name": "B2" }, { "url": "C3.mp3", "name": "C3" }, { "url": "Db3.mp3", "name": "Db3" }, { "url": "D3.mp3", "name": "D3" }, { "url": "Eb3.mp3", "name": "Eb3" }, { "url": "E3.mp3", "name": "E3" }, { "url": "F3.mp3", "name": "F3" }, { "url": "Gb3.mp3", "name": "Gb3" }, { "url": "G3.mp3", "name": "G3" }, { "url": "Ab3.mp3", "name": "Ab3" }, { "url": "A3.mp3", "name": "A3" }, { "url": "Bb3.mp3", "name": "Bb3" }, { "url": "B3.mp3", "name": "B3" }, { "url": "C4.mp3", "name": "C4" }, { "url": "Db4.mp3", "name": "Db4" }, { "url": "D4.mp3", "name": "D4" }, { "url": "Eb4.mp3", "name": "Eb4" }, { "url": "E4.mp3", "name": "E4" }, { "url": "F4.mp3", "name": "F4" }, { "url": "Gb4.mp3", "name": "Gb4" }, { "url": "G4.mp3", "name": "G4" }, { "url": "Ab4.mp3", "name": "Ab4" }, { "url": "A4.mp3", "name": "A4" }, { "url": "Bb4.mp3", "name": "Bb4" }, { "url": "B4.mp3", "name": "B4" }, { "url": "C5.mp3", "name": "C5" }, { "url": "Db5.mp3", "name": "Db5" }, { "url": "D5.mp3", "name": "D5" }, { "url": "Eb5.mp3", "name": "Eb5" }, { "url": "E5.mp3", "name": "E5" }, { "url": "F5.mp3", "name": "F5" }, { "url": "Gb5.mp3", "name": "Gb5" }, { "url": "G5.mp3", "name": "G5" }, { "url": "Ab5.mp3", "name": "Ab5" }, { "url": "A5.mp3", "name": "A5" }, { "url": "Bb5.mp3", "name": "Bb5" }, { "url": "B5.mp3", "name": "B5" }, { "url": "C6.mp3", "name": "C6" }, { "url": "Db6.mp3", "name": "Db6" }, { "url": "D6.mp3", "name": "D6" }, { "url": "Eb6.mp3", "name": "Eb6" }, { "url": "E6.mp3", "name": "E6" }, { "url": "F6.mp3", "name": "F6" }, { "url": "Gb6.mp3", "name": "Gb6" }, { "url": "G6.mp3", "name": "G6" }, { "url": "Ab6.mp3", "name": "Ab6" }, { "url": "A6.mp3", "name": "A6" }, { "url": "Bb6.mp3", "name": "Bb6" }, { "url": "B6.mp3", "name": "B6" }, { "url": "C7.mp3", "name": "C7" }, { "url": "Db7.mp3", "name": "Db7" }, { "url": "D7.mp3", "name": "D7" }, { "url": "Eb7.mp3", "name": "Eb7" }, { "url": "E7.mp3", "name": "E7" }, { "url": "F7.mp3", "name": "F7" }, { "url": "Gb7.mp3", "name": "Gb7" }, { "url": "G7.mp3", "name": "G7" }, { "url": "Ab7.mp3", "name": "Ab7" }, { "url": "A7.mp3", "name": "A7" }, { "url": "Bb7.mp3", "name": "Bb7" }, { "url": "B7.mp3", "name": "B7" }, { "url": "C8.mp3", "name": "C8" } ] }  
};


OMusicPlayer.prototype.makeEQ = function (data) {
    var p = this;
    var input = p.context.createGain();

    // https://codepen.io/andremichelle/pen/RNwamZ/
    // How to hack an equalizer with two biquad filters
    //
    // 1. Extract the low frequencies (highshelf)
    // 2. Extract the high frequencies (lowshelf)
    // 3. Subtract low and high frequencies (add invert) from the source for the mid frequencies.
    // 4. Add everything back together
    //
    // andre.michelle@gmail.com

    var context = this.context;
    
    // EQ Properties
    //
    var gainDb = -40.0;
    var bandSplit = [360,3600];

    input.eqH = context.createBiquadFilter();
    input.eqH.type = "lowshelf";
    input.eqH.frequency.value = bandSplit[0];
    input.eqH.gain.value = gainDb;

    input.eqHInvert = context.createGain();
    input.eqHInvert.gain.value = -1.0;

    input.eqM = context.createGain();

    input.eqL = context.createBiquadFilter();
    input.eqL.type = "highshelf";
    input.eqL.frequency.value = bandSplit[1];
    input.eqL.gain.value = gainDb;

    input.eqLInvert = context.createGain();
    input.eqLInvert.gain.value = -1.0;

    input.connect(input.eqL);
    input.connect(input.eqM);
    input.connect(input.eqH);

    input.eqH.connect(input.eqHInvert);
    input.eqL.connect(input.eqLInvert);

    input.eqHInvert.connect(input.eqM);
    input.eqLInvert.connect(input.eqM);

    input.eqLGain = context.createGain();
    input.eqMGain = context.createGain();
    input.eqHGain = context.createGain();

    if (typeof input.highGain !== "number")
        input.highGain = 1;
    if (typeof input.midGain !== "number")
        input.midGain = 1;
    if (typeof input.lowGain !== "number")
        input.lowGain = 1;
    input.eqHGain.gain.value = input.highGain;
    input.eqMGain.gain.value = input.midGain;
    input.eqLGain.gain.value = input.lowGain;

    input.eqL.connect(input.eqLGain);
    input.eqM.connect(input.eqMGain);
    input.eqH.connect(input.eqHGain);

    input.output = context.createGain();
    input.eqLGain.connect(input.output);
    input.eqMGain.connect(input.output);
    input.eqHGain.connect(input.output);
    
    input.connect = function (to) {
        input.output.connect(to);
    };
    input.disconnect = function (from) {
        input.output.disconnect(from);
    };
    Object.defineProperty(input, 'highGain', {
        set: function(value) {
            data.highGain = value;
            if (!data.bypass) {
                input.eqHGain.gain.value = value;
            }
        }
    });
    Object.defineProperty(input, 'midGain', {
        set: function(value) {
            data.midGain = value;
            if (!data.bypass)
                input.eqMGain.gain.value = value;
        }
    });
    Object.defineProperty(input, 'lowGain', {
        set: function(value) {
            data.lowGain = value;
            if (!data.bypass)
                input.eqLGain.gain.value = value;
        }
    });
    Object.defineProperty(input, 'bypass', {
        get: function() {
            return data.bypass;
        },
        set: function(value) {
            input.eqHGain.gain.value = value ? 1 : data.highGain;
            input.eqMGain.gain.value = value ? 1 : data.midGain;
            input.eqLGain.gain.value = value ? 1 : data.lowGain;
            data.bypass = value;
        }
    });
    input.highGain = data.highGain;
    input.midGain = data.midGain;
    input.lowGain = data.lowGain;
    input.bypass = data.bypass;
    return input;
};

OMusicPlayer.prototype.makeDelay = function (data) {
    var p = this;
    var input = p.context.createGain();
    var output = p.context.createGain();
    var delay  = p.context.createDelay();
    var feedback = p.context.createGain();
    
    feedback.gain.value = data.feedback;
    delay.delayTime.value = data.time;
    
    input.connect(delay);
    input.connect(output);
    delay.connect(feedback);
    feedback.connect(delay);
    feedback.connect(output);
    
    input.connect = function (to) {
        output.connect(to);
    };
    input.disconnect = function (to) {
        output.disconnect(to);
    };
    
    Object.defineProperty(input, 'time', {
        set: function(value) {
            data.time = value;
            //delay.delayTime.setValueAtTime(value, p.context.currentTime);
            delay.delayTime.exponentialRampToValueAtTime(value, p.context.currentTime + p.latency/1000);
        }
    });
    Object.defineProperty(input, 'feedback', {
        set: function(value) {
            data.feedback = value;
            feedback.gain.exponentialRampToValueAtTime(data.bypass ? 0 : value, p.context.currentTime + p.latency/1000);
        }
    });
    Object.defineProperty(input, 'bypass', {
        get: function() {
            return data.bypass;
        },
        set: function(value) {
            data.bypass = value;
            feedback.gain.setValueAtTime(value ? 0 : data.feedback, p.context.currentTime);
        }
    });
    return input;
};

OMusicPlayer.prototype.mutePart = function (partName, mute) {
    var part = this.getPart(partName);
    if (part) {
        part.data.audioParams.mute = mute || false;
    }
};

OMusicPlayer.prototype.getSound = function (partName, soundName) {
    var part = this.getPart(partName);
    if (!part) {
        return;
    }
    
    var p = this;
    if (part.data.tracks) {
        for (var i = 0; i < part.data.tracks.length; i++) {
            if (part.data.tracks[i].name === soundName) {
                
                return {
                    play: function () {
                        p.playSound(part.data.tracks[i].sound, part);
                    }
                };
            }
        }
    }
};

OMusicPlayer.prototype.getPart = function (partName) {
    for (var i = 0; i < this.section.parts.length; i++) {
        if (this.section.parts[i].data.name === partName) {
            return this.section.parts[i];
        }
    }
};


OMusicPlayer.prototype.makeRadPad = function (data) {
    var p = this;
    var input = p.context.createGain();
    var output = p.context.createGain();
    input.connect(output);

    var fxs = [undefined, undefined, undefined, undefined];
    var isTouching = false;

    input.connectWA = input.connect;
    input.disconnectWA = input.disconnect;
    input.connect = function (to) {
        output.connect(to);
    };
    input.disconnect = function (to) {
        output.disconnect(to);
    };

    var getNextNode = function (fxI) {
        for (var i = fxI + 1; i < fxs.length; i++) {
            if (fxs[i]) {
                return fxs[i];
            }
        }
        return output;
    };
    var getPrevNode = function (fxI) {
        for (var i = fxI - 1; i >= 0; i--) {
            if (fxs[i]) {
                return fxs[i];
            }
        }
        return input;
    };
    var setFX = function (value, i) {
        if (data["fx" + (1 + i)] === value) {
            return;
        }
        data["fx" + (1 + i)] = value;
        
        var prevNode = getPrevNode(i);
        var nextNode = getNextNode(i);
        
        if (fxs[i]) {
            if (prevNode === input) {
                try {input.disconnectWA(fxs[i]);}
                catch (e) {input.disconnectWA();}
            }
            else {
                try {prevNode.disconnect(fxs[i]);} 
                catch (e) {prevNode.disconnect();}
            }
            
            try {fxs[i].disconnect(nextNode);} 
            catch (e) {fxs[i].disconnect();}
        }
        else {
            if (prevNode === input) {
                try {input.disconnectWA(nextNode);}
                catch (e) {input.disconnectWA(nextNode);}
            }
            else {
                try {prevNode.disconnect(nextNode);} 
                catch (e) {prevNode.disconnect();}
            }
        }
        fxs[i] = undefined;
        
        if (value !== "None") {
            fxs[i] = makeFX(value);
            if (prevNode === input) {
                input.connectWA(fxs[i]);
            }
            else {
                prevNode.connect(fxs[i]);
            }
            fxs[i].connect(nextNode);
        }
        else {
            if (prevNode === input) {
                input.connectWA(nextNode);
            }
            else {
                prevNode.connect(nextNode);
            }
        }
    };
    
    var makeFX = function (value) {
        if (p.fx[value]) {
            var node = p.makeFXNode(value);
            node.padAxes = {};
            p.fx[value].controls.forEach(function (control) {
                if (control.axis) {
                    node.padAxes[control.axis] = control;
                }
            });
        }
        node.bypass = true;
        return node;
    };
    
    Object.defineProperty(input, 'fx1', {
        set: function (value) {
            setFX(value, 0);
        }
    });
    Object.defineProperty(input, 'fx2', {
        set: function (value) {
            setFX(value, 1);
        }
    });
    Object.defineProperty(input, 'fx3', {
        set: function (value) {
            setFX(value, 2);
        }
    });
    Object.defineProperty(input, 'fx4', {
        set: function (value) {
            setFX(value, 3);
        }
    });

    Object.defineProperty(input, 'xy', {
        set: function (xy) {
            fxs.forEach(function (fx) {
                if (!fx) return;
                if (xy[0] === -1) {
                    fx.bypass = true;
                    return;
                }
                if (fx.bypass) {
                    fx.bypass = false;
                }
                if (fx && fx.padAxes.x) {
                    fx[fx.padAxes.x.property] = xy[0] * fx.padAxes.x.max;
                }
                if (fx && fx.padAxes.y) {
                    fx[fx.padAxes.y.property] = xy[1] * fx.padAxes.y.max;
                }                
                if (fx && fx.padAxes.revx) {
                    fx[fx.padAxes.revx.property] = (1 - xy[0]) * fx.padAxes.revx.max;
                }
                if (fx && fx.padAxes.revy) {
                    fx[fx.padAxes.revy.property] = (1 - xy[1]) * fx.padAxes.revy.max;
                }                
            });
        }
    });
    
    Object.defineProperty(input, 'bypass', {
        get: function() {
            return data.bypass;
        },
        set: function(value) {
            data.bypass = value;
        }
    });
    
    //setFX("DelayW", 0);
    
    return input;
};
