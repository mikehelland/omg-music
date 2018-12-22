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
    if (!window.AudioContext)
        window.AudioContext = window.webkitAudioContext;

    try {
        p.context = new AudioContext();
        if (!p.context.createGain)
            p.context.createGain = p.context.createGainNode;
        p.tuna = new Tuna(p.context);
    } catch (e) {
        var nowebaudio = document.getElementById("no-web-audio");
        if (nowebaudio)
            nowebaudio.style.display = "inline-block";
        //return;
    }

    /*p.compressor = p.context.createDynamicsCompressor();
    p.compressor.threshold.value = -50;
    p.compressor.knee.value = 40;
    p.compressor.ratio.value = 2;
    p.compressor.attack.value = 0;
    p.compressor.release.value = 0.25;
    p.compressor.connect(p.context.destination);*/

    p.onBeatPlayedListeners = [];

    p.iSubBeat = 0;
    p.loopStarted = 0;

    p.nextUp = null;

    p.loopSection = -1;
    
    p.setupFX();
}

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
        console.log("no sections to play()");
        return -1;
    }

    p.setupNextSection(typeof p.startArrangementAt !== "number");

    p.playing = true;
    p.loopStarted = Date.now();
    p.iSubBeat = 0;
    
    p.nextBeatTime = p.context.currentTime + (p.latency / 1000);

    p.currentChordI = 0;

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
            console.log(ex);
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
            p.rescaleSong(null, null, p.section.data.chordProgression[p.currentChordI]);
            nextChord = true;
        }
        else {
            p.currentChordI = 0;
            //todo rescale section!
            p.rescaleSong(null, null, p.section.data.chordProgression[p.currentChordI]);
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

    if (p.song && p.song.sections[p.song.playingSection]) {
        var parts = p.song.sections[p.song.playingSection].parts;
        for (var ip = 0; ip < parts.length; ip++) {
            if (parts[ip].osc) {
                parts[ip].osc.finishPart();
            }

        }
    }
};

OMusicPlayer.prototype.loadPart = function (part) {
    var p = this;

    var type = part.data.type;
    var surface = part.data.surface ? part.data.surface.url : part.data.surfaceURL;

    part.soundsLoading = 0;
    part.loaded = false;

    if (!part.panner) {
        this.makeAudioNodesForPart(part);
    }

    if (surface === "PRESET_SEQUENCER") {
        this.loadDrumbeat(part);
    } else {
        this.loadMelody(part);
    }
};

OMusicPlayer.prototype.loadMelody = function (part) {
    var p = this;

    var data = part.data;
    
    var section = part.section;
    var song = part.section ? part.section.song : undefined;

    part.currentI = -1;
    p.rescale(part, song.data.keyParams, 0); //section.data.chordProgression[p.currentChordI]

    if (data.soundSet && data.soundSet.data) {
        if (!p.downloadedSoundSets[data.soundSet.name]) {
            p.downloadedSoundSets[data.soundSet.name] = data.soundSet;
            p.loadSoundsFromSoundSet(data.soundSet);
        }
        p.setupPartWithSoundSet(data.soundSet, part, true);
    }
    else if (data.soundSet && typeof data.soundSet.url === "string") {
        p.getSoundSet(data.soundSet.url, function (soundset) {
            p.setupPartWithSoundSet(soundset, part, true);
        });
    }
    var soundsToLoad = 0;

    for (var ii = 0; ii < data.notes.length; ii++) {
        note = data.notes[ii];

        if (note.rest)
            continue;

        if (!note.sound)
            continue;

        if (p.loadedSounds[note.sound])
            continue;

        soundsToLoad++;
        p.loadSound(note.sound, part);
    }

    if (soundsToLoad == 0) {
        part.loaded = true;
    }

};

OMusicPlayer.prototype.loadDrumbeat = function (part) {
    var soundsAlreadyLoaded = 0;

    var tracks = part.data.tracks;

    for (var i = 0; i < tracks.length; i++) {
        if (!tracks[i].sound) {
            soundsAlreadyLoaded++;
        } else if (this.loadedSounds[tracks[i].sound]) {
            //tracks[i].audio = p.loadedSounds[tracks[i].sound];
            soundsAlreadyLoaded++;
        } else {
            this.loadSound(tracks[i].sound, part);
        }
    }
    if (soundsAlreadyLoaded == tracks.length) {
        part.loaded = true;
    }

};

OMusicPlayer.prototype.playWhenReady = function (sections) {
    var p = this;
    var allReady = true;

    for (var i = 0; i < sections.length; i++) {
        for (var j = 0; j < sections[i].parts.length; j++) {
            if (!sections[i].parts[j].loaded) {
                allReady = false;
                console.log("section " + i + " part " + j + " is not ready");
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

OMusicPlayer.prototype.prepareSong = function (song) {
    var p = this;
    
    if (!song.madeAudioNodes) {
        p.makeAudioNodesForSong(song);
    }
    
    var section;
    var part;

    for (var isection = 0; isection < song.sections.length; isection++) {

        section = song.sections[isection];
        for (var ipart = 0; ipart < section.parts.length; ipart++) {
            part = section.parts[ipart];
            p.loadPart(part);
        }
    }

    if (p.playing) {
        p.nextUp = song;
        return false;
    }

    p.song = song;
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

    if (!part.loaded) {
        p.loadPart(part);
    }

    var surface = part.data.surface ? part.data.surface.url : part.data.surfaceURL;
    if (surface === "PRESET_SEQUENCER") {
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
            console.log("something wrong here");
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
            if (part.soundSet) {
                note.sound = this.getSound(part.soundSet, part.liveNotes[index]);
            }

            this.playNote(note, part);
            if (!part.data.audioParams.mute) {
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
        console.log("makeOsc, already exists");
        try {
            part.osc.stop(p.context.currentTime);
            part.osc.disconnect(part.gain);
            part.gain.disconnect(part.topAudioNode);
        } catch (e) {
        }
    }

    part.osc = p.context.createOscillator();
    part.osc.onended = () => {
        console.log("HEY BUD! WE ENDED!");
    };

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

    part.osc.connect(part.topAudioNode);

    part.osc.frequency.setValueAtTime(0, p.context.currentTime);
    part.osc.start(p.context.currentTime);

    part.osc.finishPart = function () {
        part.osc.frequency.setValueAtTime(0, p.nextBeatTime);

        //total hack, this is why things should be processed ala AudioContext, not our own thread
        /*setTimeout(function () {
            part.osc.stop(p.context.currentTime);
            part.osc.disconnect(part.gain);
            part.gain.disconnect(part.topAudioNode);

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


OMusicPlayer.prototype.loadSound = function (sound, part) {
    var p = this;

    if (!sound || !p.context) {
        return;
    }
    var key = sound;
    var url = sound;
    
    if (url.startsWith("http:")) {
        url = sound.slice(5);
    }

    p.loadedSounds[key] = "loading";
    
    var saved = omg.util.getSavedSound(key, function (buffer) {
        if (!buffer) {
            p.downloadSound(url, key, part);
        }
        else {
            p.context.decodeAudioData(buffer, function (buffer) {
                p.loadedSounds[key] = buffer;
                p.onSoundLoaded(true, part);
            }, function () {
                console.log("error loading sound url: " + url);
                p.onSoundLoaded(false, part);
            });
        }
    });
};

OMusicPlayer.prototype.downloadSound = function (url, key, part) {
    var p = this;
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    part.soundsLoading++;

    request.onload = function () {
        var data = request.response.slice(0);
        p.context.decodeAudioData(request.response, function (buffer) {
            p.loadedSounds[key] = buffer;
            p.onSoundLoaded(true, part);
            omg.util.saveSound(key, data);
        }, function () {
            console.log("error loading sound url: " + url);
            p.onSoundLoaded(false, part);
        });
    }
    request.send();
};

OMusicPlayer.prototype.onSoundLoaded = function (success, part) {
    var p = this;

    part.soundsLoading--;
    if (part.soundsLoading < 1) {
        part.loaded = true;
    }
};

OMusicPlayer.prototype.rescale = function (part, keyParams, chord) {
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
    }

    if (part.soundSet) {
        p.setupPartWithSoundSet(part.soundSet, part, true);
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
    var note;
    var noteIndex;

    var prefix = ss.prefix || "";
    var postfix = ss.postfix || "";

    for (var ii = 0; ii < part.data.notes.length; ii++) {
        note = part.data.notes[ii];

        if (note.rest)
            continue;

        if (ss.chromatic) {
            noteIndex = note.scaledNote - ss.lowNote;
            if (noteIndex < 0) {
                noteIndex = noteIndex % 12 + 12;
            } else {
                while (noteIndex >= ss.data.length) {
                    noteIndex = noteIndex - 12;
                }
            }
        }
        else {
            noteIndex = note.note;
        }

        if (!ss.data[noteIndex]) {
            continue;
        }
        note.sound = prefix + ss.data[noteIndex].url + postfix;

        if (!note.sound)
            continue;

        if (load && !omg.loadedSounds[note.sound]) {
            p.loadSound(note.sound, part);
        }
    }

};

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
        dl = p.getPresetSoundSet(url);
        p.downloadedSoundSets[url] = dl;
        callback(dl);
        return;
    }

    var xhr2 = new XMLHttpRequest();
    xhr2.open("GET", url, true)
    xhr2.onreadystatechange = function () {

        if (xhr2.readyState == 4) {
            var ojson = JSON.parse(xhr2.responseText);
            if (ojson) {
                p.downloadedSoundSets[url] = ojson;
                p.loadSoundsFromSoundSet(ojson);
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
            (soundSet.postfix || ""), {});
    }
};


OMusicPlayer.prototype.getPresetSoundSet = function (preset) {
    var p = this;

    var oret;
    if (preset == "PRESET_BASS") {
        oret = {"name": "Electric Bass", "id": 1540004, "lowNote": 28, "chromatic": true,
            "data": [
                    {"url": "e", "caption": "E2"}, {"url": "f", "caption": "F2"}, {"url": "fs", "caption": "F#2"}, {"url": "g", "caption": "G2"}, {"url": "gs", "caption": "G#2"}, {"url": "a", "caption": "A2"},
                    {"url": "bf", "caption": "Bb2"}, {"url": "b", "caption": "B2"}, {"url": "c", "caption": "C3"}, {"url": "cs", "caption": "C#3"}, {"url": "d", "caption": "D3"}, {"url": "ds", "caption": "Eb3"},
                    {"url": "e2", "caption": "E3"}, {"url": "f2", "caption": "F3"}, {"url": "fs2", "caption": "F#3"}, {"url": "g2", "caption": "G3"}, {"url": "gs2", "caption": "G#3"}, {"url": "a2", "caption": "A3"},
                    {"url": "bf2", "caption": "Bb3"}, {"url": "b2", "caption": "B3"}, {"url": "c2", "caption": "C4"}
                ], "prefix": "http://mikehelland.com/omg/bass1/bass_",
                "postfix": ".mp3"};

        if (p.dev) {
            oret.data.prefix = "http://localhost/mp3/bass_";
        }
    }
    if (preset == "PRESET_HIP") {
        oret = {"name": "PRESET_HIP", "id": 0,
            "data": {"name": "PRESET_HIP", "data": [
                    {"url": "PRESET_HH_KICK", "caption": "kick"},
                    {"url": "PRESET_HH_CLAP", "caption": "clap"},
                    {"url": "PRESET_ROCK_HIHAT_CLOSED", "caption": "hihat closed"},
                    {"url": "PRESET_HH_HIHAT", "caption": "hihat open"},
                    {"url": "PRESET_HH_TAMB", "caption": "tambourine"},
                    {"url": "PRESET_HH_TOM_MH", "caption": "h tom"},
                    {"url": "PRESET_HH_TOM_ML", "caption": "m tom"},
                    {"url": "PRESET_HH_TOM_L", "caption": "l tom"}
                ]}};

    }
    if (preset == "PRESET_ROCK") {
        oret = {"name": "PRESET_ROCK", "id": 0,
            "data": {"name": "PRESET_ROCK", "data": [
                    {"url": "PRESET_ROCK_KICK", "caption": "kick"},
                    {"url": "PRESET_ROCK_SNARE", "caption": "snare"},
                    {"url": "PRESET_ROCK_HIHAT_CLOSED", "caption": "hihat closed"},
                    {"url": "PRESET_ROCK_HIHAT_OPEN", "caption": "hihat open"},
                    {"url": "PRESET_ROCK_CRASH", "caption": "crash"},
                    {"url": "PRESET_ROCK_TOM_H", "caption": "h tom"},
                    {"url": "PRESET_ROCK_TOM_ML", "caption": "m tom"},
                    {"url": "PRESET_ROCK_TOM_L", "caption": "l tom"}
                ]}};

    }


    return oret;
};

OMusicPlayer.prototype.playNote = function (note, part) {
    var p = this;
    
    var fromNow = (note.beats * 4 * p.subbeatLength) / 1000;

    if (!note || note.rest) {
        if (part.osc) {
            part.osc.frequency.setValueAtTime(0, p.nextBeatTime);
        }
        return;
    }

    if (part.osc) {
        var freq = p.makeFrequency(note.scaledNote) * part.data.audioParams.warp;
        part.osc.frequency.setValueAtTime(freq, p.nextBeatTime);
        part.playingI = part.currentI;
        var playingI = part.playingI;
        
        //this should be a timeout so it can be canceled if
        //a different note has played
        setTimeout(function () {
            if (part.osc && part.playingI === playingI) {
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
        source.bufferGain.connect(part.topAudioNode);

        source.playbackRate.value = warp;

        source.start(p.nextBeatTime);
        
        return source;
    }
};

OMusicPlayer.prototype.getSound = function (soundSet, note) {
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
    var p = this;
    section.parts.forEach(function (part) {
        p.rescale(part, section.song.data.keyParams, chord || 0);
    });
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
    if (notes.autobeat === 0 || !this.playing) {
        part.playingI = -1;
        if (part.osc) {
            part.osc.frequency.setValueAtTime(this
                    .makeFrequency(notes[0].scaledNote) * part.data.audioParams.warp, this.context.currentTime);
        }
        else {
            //var sound = this.getSound(part.data.soundSet, notes[0]);
            notes[0].sound = this.getSound(part.soundSet, notes[0]);
            part.liveNotes.liveAudio = this.playSound(notes[0].sound, part);
        }
    }
    if (this.playing && !part.data.audioParams.mute && notes.autobeat === 0) {
        this.recordNote(part, notes[0]);
        part.currentI = part.data.notes.indexOf(notes[0]) + 1;
    }
};

OMusicPlayer.prototype.endLiveNotes = function (part) {
  
    if (part.osc) {
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
    part.gain.connect(part.panner);
    part.panner.connect(part.section.song.preFXGain);
    part.defaultTopAudioNode = part.gain;
    part.topAudioNode = part.defaultTopAudioNode;
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
    
    song.defaultTopAudioNode = song.preFXGain;
    
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
    
    if (part.preFXGain) {
        var connectingNode = part.fx[index - 1] || part.preFXGain;
        var connectedNode = part.fx[index + 1] || part.postFXGain;
        fx.disconnect();
        connectingNode.disconnect();
        connectingNode.connect(connectedNode);
    
        part.fx.splice(index, 1);
        index = part.data.fx.indexOf(fx.data);
        part.data.fx.splice(index, 1);
        return;
    }
    
    var connectedTo = part.fx[index + 1] || part.defaultTopAudioNode;
    fx.disconnect();
    part.fx.splice(index, 1);
    if (index === 0) {
        part.topAudioNode = part.fx[0] || part.defaultTopAudioNode;
        if (part.osc) {
            part.osc.disconnect();
            part.osc.connect(part.topAudioNode);
        }
    }
    else {
        part.fx[index - 1].disconnect();
        part.fx[index - 1].connect(part.fx[index] || part.defaultTopAudioNode);
    }
    index = part.data.fx.indexOf(fx.data);
    part.data.fx.splice(index, 1);
};

OMusicPlayer.prototype.setupFX = function () {
    var p = this;
    p.fx = {};
    p.fx["Delay"] = {"audioClass" : p.tuna.Delay,
        "makeData": function (init) {
            return {
                name: "Delay",
                feedback: 0.45,    //0 to 1+
                delayTime: 150,    //1 to 10000 milliseconds
                wetLevel: 0.25,    //0 to 1+
                dryLevel: 1,       //0 to 1+
                cutoff: 2000,      //cutoff frequency of the built in lowpass-filter. 20 to 22050
                bypass: 0
            };                        
        },
        "controls": [
            {"property": "feedback", "name": "Feedback", "type": "slider", "min": 0, "max": 1},
            {"property": "delayTime", "name": "Delay Time", "type": "slider", "min": 1, "max": 1000},
            {"property": "wetLevel", "name": "Wet Level", "type": "slider", "min": 0, "max": 1},
            {"property": "dryLevel", "name": "Dry Level", "type": "slider", "min": 0, "max": 1},
            {"property": "cutoff", "name": "Cutoff", "type": "slider", "min": 20, "max": 22050}
        ]
    };
    p.fx["Chorus"] = {"audioClass": p.tuna.Chorus,
        "makeData": function (init) {
            return {
                name: "Chorus",
                rate: 1.5,         //0.01 to 8+
                feedback: 0.2,     //0 to 1+
                delay: 0.0045,     //0 to 1
                depth: 0.7,     //0 to 1
                bypass: 0          //the value 1 starts the effect as bypassed, 0 or 1
            };
        },            
        "controls": [
            {"property": "rate", "name": "Rate", "type": "slider", "min": 0.01, "max": 8},
            {"property": "feedback", "name": "Feedback", "type": "slider", "min": 0, "max": 1},
            {"property": "depth", "name": "Depth", "type": "slider", "min": 0, "max": 1},
            {"property": "delay", "name": "Delay", "type": "slider", "min": 0, "max": 1}
        ]
    };
    
    p.fx["Phaser"] = {"audioClass": p.tuna.Phaser,
        "makeData": function (init) {
            return {
                name: "Phaser",
                rate: 1.2,                     //0.01 to 8 is a decent range, but higher values are possible
                depth: 0.3,                    //0 to 1
                feedback: 0.2,                 //0 to 1+
                stereoPhase: 30,               //0 to 180
                baseModulationFrequency: 700,  //500 to 1500
                bypass: 0
            };
        },
        "controls": [
            {"property": "rate", "name": "Rate", "type": "slider", "min": 0.01, "max": 12},
            {"property": "depth", "name": "Depth", "type": "slider", "min": 0, "max": 1},
            {"property": "feedback", "name": "Feedback", "type": "slider", "min": 0, "max": 1},
            {"property": "stereoPhase", "name": "Stereo Phase", "type": "slider", "min": 0, "max": 180},
            {"property": "baseModulationFrequeny", "name": "Base Modulation Freq", "type": "slider", "min": 500, "max": 1500}
        ]
    };        
    p.fx["Overdrive"] = {"audioClass": p.tuna.Overdrive,
        "makeData": function (init) {
            return {
                name: "Overdrive",
                outputGain: 0.2,         //0 to 1+
                drive: 0.7,              //0 to 1
                curveAmount: 0.8,          //0 to 1
                algorithmIndex: 0,       //0 to 5, selects one of our drive algorithms
                bypass: 0
            };
        },
        "controls" : [
            {"property": "outputGain", "name": "Output Gain", "type": "slider", "min": 0, "max": 1.5},
            {"property": "drive", "name": "Drive", "type": "slider", "min": 0, "max": 1},
            {"property": "curveAmount", "name": "Curve Amount", "type": "slider", "min": 0, "max": 1},
            {"property": "algorithmIndex", "name": "Type", "type": "slider", "min": 0, "max": 5}
        ]
    };
    p.fx["Compressor"] = {"audioClass": p.tuna.Compressor,
        "makeData": function (init) {
            return {
                name: "Compressor",
                threshold: -1,    //-100 to 0
                makeupGain: 1,     //0 and up (in decibels)
                attack: 1,         //0 to 1000
                release: 0,        //0 to 3000
                ratio: 4,          //1 to 20
                knee: 5,           //0 to 40
                automakeup: true,  //true/false
                bypass: 0
            };
        },
        "controls" : [
            {"property": "threshold", "name": "Threshold", "type": "slider", "min": -100, "max": 0},
            {"property": "makeupGain", "name": "Makeup Gain", "type": "slider", "min": 0, "max": 10},
            {"property": "attack", "name": "Attack", "type": "slider", "min": 0, "max": 1000},
            {"property": "release", "name": "Release", "type": "slider", "min": 0, "max": 3000},
            {"property": "ratio", "name": "Ratio", "type": "slider", "min": 0, "max": 20},
            {"property": "knee", "name": "Knee", "type": "slider", "min": 0, "max": 40},
            {"property": "automakeup", "name": "Auto Makeup", "type": "check"}
        ]
    };
    p.fx["Reverb"] = {"audioClass": p.tuna.Convolver,
        "makeData": function (init) {
            return {
                name: "Reverb",
                highCut: 22050,                         //20 to 22050
                lowCut: 20,                             //20 to 22050
                dryLevel: 1,                            //0 to 1+
                wetLevel: 1,                            //0 to 1+
                level: 1,                               //0 to 1+, adjusts total output of both wet and dry
            };
        },
        "controls": [
            {"property": "highCut", "name": "High Cut", "type": "slider", "min": 20, "max": 22050},
            {"property": "lowCut", "name": "Low Cut", "type": "slider", "min": 20, "max": 22050},
            {"property": "dryLevel", "name": "Dry Level", "type": "slider", "min": 0, "max": 1},
            {"property": "wetLevel", "name": "Wet Level", "type": "slider", "min": 0, "max": 1},
            {"property": "level", "name": "Level", "type": "slider", "min": 0, "max": 1},
        ]
    };
    p.fx["Filter"] = {"audioClass": p.tuna.Filter,
        "makeData": function (init) {
            return {
                name: "Filter",
                frequency: 440, //20 to 22050
                Q: 1, //0.001 to 100
                gain: 0, //-40 to 40 (in decibels)
                filterType: "lowpass", //lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass
                bypass: 0
            };
        },
        "controls": [
            {"property": "frequency", "name": "Frequency", "type": "slider", "min": 20, "max": 22050},
            {"property": "Q", "name": "Q", "type": "slider", "min": 0.001, "max": 100},
            {"property": "gain", "name": "Gain", "type": "slider", "min": -40, "max": 40},
            {"property": "filterType", "name": "Filter Type", "type": "options"},
        ]
    };
    p.fx["Cabinet"] = {"audioClass": p.tuna.Cabinet,
        "makeData": function (init) {
            return {
                name: "Cabinet",
                makeupGain: 1,                                 //0 to 20
                impulsePath: "impulses/impulse_guitar.wav",    //path to your speaker impulse
                bypass: 0
            };
        },
        "controls": [
            {"property": "makeupGain", "name": "Makeup Gain", "type": "slider", "min": 0, "max": 20}
        ]
    };
    p.fx["Tremolo"] = {"audioClass": p.tuna.Tremolo,
        "makeData": function (init) {
            return {
                name: "Tremolo",
                intensity: 0.3,    //0 to 1
                rate: 4,         //0.001 to 8
                stereoPhase: 0,    //0 to 180
                bypass: 0
            };
        },
        "controls": [
            {"property": "intensity", "name": "Intensity", "type": "slider", "min": 0, "max": 1},
            {"property": "rate", "name": "Rate", "type": "slider", "min": 0.001, "max": 8},
            {"property": "stereoPhase", "name": "Stereo Phase", "type": "slider", "min": 0, "max": 180}
        ]
    };
    p.fx["Wah Wah"] = {"audioClass": p.tuna.WahWah,
        "makeData": function (init) {
            return {
                name: "Wah Wah",
                automode: true,                //true/false
                baseFrequency: 0.5,            //0 to 1
                excursionOctaves: 2,           //1 to 6
                sweep: 0.2,                    //0 to 1
                resonance: 10,                 //1 to 100
                sensitivity: 0.5,              //-1 to 1
                bypass: 0
            };
        },
        "controls": [
            {"property": "automode", "name": "Auto Mode", "type": "check"},
            {"property": "baseFrequency", "name": "Base Frequency", "type": "slider", "min": 0, "max": 1},
            {"property": "excursionOctaves", "name": "Excursion Octaves", "type": "slider", "min": 1, "max": 6},
            {"property": "sweep", "name": "Sweep", "type": "slider", "min": 0, "max": 1},
            {"property": "resonance", "name": "Resonance", "type": "slider", "min": 1, "max": 10},
            {"property": "sensitivity", "name": "Sensitivity", "type": "slider", "min": -1, "max": 1}
        ]
    };
    p.fx["Bitcrusher"] = {"audioClass": p.tuna.Bitcrusher,
        "makeData": function (init) {
            return {
                name: "Bitcrusher",
                bits: 4,          //1 to 16
                normfreq: 0.1,    //0 to 1
                bufferSize: 4096  //256 to 16384
            };
        },
        "controls": [
            {"property": "bits", "name": "Bits", "type": "slider", "min": 1, "max": 16},
            {"property": "normfreq", "name": "Normal Frequency", "type": "slider", "min": 0, "max": 1}
        ]
    };
    p.fx["Moog"] = {"audioClass": p.tuna.MoogFilter,
        "makeData": function (init) {
            return {
                name: "Moog",
                cutoff: 0.065,    //0 to 1
                resonance: 3.5,   //0 to 4
                bufferSize: 4096  //256 to 16384
            };
        },
        "controls": [
            {"property": "cutoff", "name": "Cutoff", "type": "slider", "min": 0, "max": 1},
            {"property": "resonance", "name": "Resonance", "type": "slider", "min": 0, "max": 4}
        ]
    };
    p.fx["Ping Pong"] = {"audioClass": p.tuna.PingPongDelay,
        "makeData": function (init) {
            return {
                name: "Ping Pong",
                wetLevel: 0.5, //0 to 1
                feedback: 0.3, //0 to 1
                delayTimeLeft: 150, //1 to 10000 (milliseconds)
                delayTimeRight: 200 //1 to 10000 (milliseconds)
            };
        },
        "controls": [
            {"property": "wetLevel", "name": "Wet Level", "type": "slider", "min": 0, "max": 1},
            {"property": "feedback", "name": "Feedback", "type": "slider", "min": 0, "max": 1},
            {"property": "delayTimeLeft", "name": "Delay Time Left", "type": "slider", "min": 1, "max": 10000},
            {"property": "delayTimeRight", "name": "Delay Time Right", "type": "slider", "min": 1, "max": 10000}
        ]
    };
};

OMusicPlayer.prototype.makeFXNodeForPart = function (fx, part) {
    var fxNode, fxData;
    var makeData = true;
    var fxName = fx;
    if (typeof fx === "object") {
        makeData = false;
        fxName = fx.name;
        fxData = fx;
    }
    var fxInfo = this.fx[fxName];
    if (fxInfo) {
        if (makeData) {
            fxData = fxInfo.makeData();
        }
        fxNode = new fxInfo.audioClass(fxData);
    }

    if (fxNode) {
        fxNode.data = fxData;

        if (part.preFXGain) {
            var connectingNode = part.fx[part.fx.length - 1] || part.preFXGain;
            connectingNode.disconnect(part.postFXGain);
            connectingNode.connect(fxNode);
            fxNode.connect(part.postFXGain);
            part.fx.push(fxNode);
            return fxNode;
        }
            
        var lastFX = part.fx[part.fx.length - 1];
        if (lastFX) {
            lastFX.disconnect(part.defaultTopAudioNode);
            lastFX.connect(fxNode);
        }
        else {
            if (part.osc) {
                part.osc.disconnect(part.topAudioNode);
                part.osc.connect(fxNode);
            }
            part.topAudioNode = fxNode;
        }
        fxNode.connect(part.defaultTopAudioNode);
        part.fx.push(fxNode);
    }
    return fxNode;
};

OMusicPlayer.prototype.getSoundSetForSoundFont = function (name, url) {
  return {"name": name,  "prefix": url, "url": url,
            "type": "SOUNDSET", "soundFont": true, "lowNote": 21, "postfix": "", "chromatic": true, "defaultSurface": "PRESET_VERTICAL", "data": [ { "url": "A0.mp3", "name": "A0" }, { "url": "Bb0.mp3", "name": "Bb0" }, { "url": "B0.mp3", "name": "B0" }, { "url": "C1.mp3", "name": "C1" }, { "url": "Db1.mp3", "name": "Db1" }, { "url": "D1.mp3", "name": "D1" }, { "url": "Eb1.mp3", "name": "Eb1" }, { "url": "E1.mp3", "name": "E1" }, { "url": "F1.mp3", "name": "F1" }, { "url": "Gb1.mp3", "name": "Gb1" }, { "url": "G1.mp3", "name": "G1" }, { "url": "Ab1.mp3", "name": "Ab1" }, { "url": "A1.mp3", "name": "A1" }, { "url": "Bb1.mp3", "name": "Bb1" }, { "url": "B1.mp3", "name": "B1" }, { "url": "C2.mp3", "name": "C2" }, { "url": "Db2.mp3", "name": "Db2" }, { "url": "D2.mp3", "name": "D2" }, { "url": "Eb2.mp3", "name": "Eb2" }, { "url": "E2.mp3", "name": "E2" }, { "url": "F2.mp3", "name": "F2" }, { "url": "Gb2.mp3", "name": "Gb2" }, { "url": "G2.mp3", "name": "G2" }, { "url": "Ab2.mp3", "name": "Ab2" }, { "url": "A2.mp3", "name": "A2" }, { "url": "Bb2.mp3", "name": "Bb2" }, { "url": "B2.mp3", "name": "B2" }, { "url": "C3.mp3", "name": "C3" }, { "url": "Db3.mp3", "name": "Db3" }, { "url": "D3.mp3", "name": "D3" }, { "url": "Eb3.mp3", "name": "Eb3" }, { "url": "E3.mp3", "name": "E3" }, { "url": "F3.mp3", "name": "F3" }, { "url": "Gb3.mp3", "name": "Gb3" }, { "url": "G3.mp3", "name": "G3" }, { "url": "Ab3.mp3", "name": "Ab3" }, { "url": "A3.mp3", "name": "A3" }, { "url": "Bb3.mp3", "name": "Bb3" }, { "url": "B3.mp3", "name": "B3" }, { "url": "C4.mp3", "name": "C4" }, { "url": "Db4.mp3", "name": "Db4" }, { "url": "D4.mp3", "name": "D4" }, { "url": "Eb4.mp3", "name": "Eb4" }, { "url": "E4.mp3", "name": "E4" }, { "url": "F4.mp3", "name": "F4" }, { "url": "Gb4.mp3", "name": "Gb4" }, { "url": "G4.mp3", "name": "G4" }, { "url": "Ab4.mp3", "name": "Ab4" }, { "url": "A4.mp3", "name": "A4" }, { "url": "Bb4.mp3", "name": "Bb4" }, { "url": "B4.mp3", "name": "B4" }, { "url": "C5.mp3", "name": "C5" }, { "url": "Db5.mp3", "name": "Db5" }, { "url": "D5.mp3", "name": "D5" }, { "url": "Eb5.mp3", "name": "Eb5" }, { "url": "E5.mp3", "name": "E5" }, { "url": "F5.mp3", "name": "F5" }, { "url": "Gb5.mp3", "name": "Gb5" }, { "url": "G5.mp3", "name": "G5" }, { "url": "Ab5.mp3", "name": "Ab5" }, { "url": "A5.mp3", "name": "A5" }, { "url": "Bb5.mp3", "name": "Bb5" }, { "url": "B5.mp3", "name": "B5" }, { "url": "C6.mp3", "name": "C6" }, { "url": "Db6.mp3", "name": "Db6" }, { "url": "D6.mp3", "name": "D6" }, { "url": "Eb6.mp3", "name": "Eb6" }, { "url": "E6.mp3", "name": "E6" }, { "url": "F6.mp3", "name": "F6" }, { "url": "Gb6.mp3", "name": "Gb6" }, { "url": "G6.mp3", "name": "G6" }, { "url": "Ab6.mp3", "name": "Ab6" }, { "url": "A6.mp3", "name": "A6" }, { "url": "Bb6.mp3", "name": "Bb6" }, { "url": "B6.mp3", "name": "B6" }, { "url": "C7.mp3", "name": "C7" }, { "url": "Db7.mp3", "name": "Db7" }, { "url": "D7.mp3", "name": "D7" }, { "url": "Eb7.mp3", "name": "Eb7" }, { "url": "E7.mp3", "name": "E7" }, { "url": "F7.mp3", "name": "F7" }, { "url": "Gb7.mp3", "name": "Gb7" }, { "url": "G7.mp3", "name": "G7" }, { "url": "Ab7.mp3", "name": "Ab7" }, { "url": "A7.mp3", "name": "A7" }, { "url": "Bb7.mp3", "name": "Bb7" }, { "url": "B7.mp3", "name": "B7" }, { "url": "C8.mp3", "name": "C8" } ] }  
};

function OMGSong(div, data, headerOnly) {
    this.div = div;
    this.sections = [];
    this.fx = [];
    this.loop = true;
    this.gain = 1;

    if (headerOnly) {
        this.setHeaderData(data);
    } else if (data) {
        this.setData(data);
        if (data.id) {
            this.saved = true;
        }
    } else {
        data = {type: "SONG", name: ""};
        this.data = data;
    }

    
    this.arrangement = [];
    if (data.arrangement) {
        for (var i = 0; i < data.arrangement.length; i++) {
            for (var j = 0; j < this.sections.length; j++) {
                if (data.arrangement[i] && this.sections[j].data.name === data.arrangement[i].name) {
                    this.arrangement.push({section: this.sections[j], data: data.arrangement[i]});
                    break;
                }
            }
        }
    }
    
    if (!data.fx) {
        data.fx = [];
    }
    
    if (!data.beatParams) {
        data.beatParams = {};
    }
    data.beatParams.subbeats = data.beatParams.subbeats * 1 || 4;
    data.beatParams.beats = data.beatParams.beats * 1 || 4;
    data.beatParams.measures = data.beatParams.measures * 1 || 1;
    data.beatParams.bpm = data.beatParams.bpm * 1 || 120;
    data.beatParams.shuffle = data.beatParams.shuffle * 1 || 0;
    if (!data.keyParams) {
        data.keyParams = {};
    }
    data.keyParams.rootNote = data.keyParams.rootNote * 1 || 0;
    data.keyParams.scale = data.keyParams.scale || [0,2,4,5,7,9,11];
    
    this.onKeyChangeListeners = [];
    this.onBeatChangeListeners = [];
    this.onPartAudioParamsChangeListeners = [];
    this.onPartAddListeners = [];
    this.onChordProgressionChangeListeners = [];
};

OMGSong.prototype.keyChanged = function () {
    var song = this;
    this.onKeyChangeListeners.forEach(listener => listener(song.data.keyParams));
};

OMGSong.prototype.tempoChanged = function () {
    var song = this;
    this.onBeatChangeListeners.forEach(listener => listener(song.data.beatParams));
};

OMGSong.prototype.partMuteChanged = function (part) {
    this.onPartAudioParamsChangeListeners.forEach(listener => listener(part));
};

OMGSong.prototype.chordProgressionChanged = function (section) {
    this.onChordProgressionChangeListeners.forEach(listener => listener(section));
};

OMGSong.prototype.partAdded = function (part) {
    this.onPartAddListeners.forEach(listener => listener(part));
};


OMGSong.prototype.setData = function (data) {
    this.data = data;

    for (var i = 0; i < data.sections.length; i++) {
        var ooo = new OMGSection(null, data.sections[i], this);
    }

    if (!this.data.name)
        this.data.name = "";
};

OMGSong.prototype.getData = function () {

    this.data.sections = [];
    for (var ip = 0; ip < this.sections.length; ip++) {
        this.data.sections[ip] = this.sections[ip].getData();
    }
    if (this.arrangement.length > 0) {
        this.data.arrangement = [];
        for (ip = 0; ip < this.arrangement.length; ip++) {
            this.data.arrangement[ip] = this.arrangement[ip].data;
        }
    }
    else {
        delete this.data.arrangement;
    }
    return this.data;
};

function OMGSection(div, data, song) {
    var partData;
    var part;

    this.div = div;
    this.parts = [];

    //if there is no song, but the section has key and beat parameters
    //make a song with those parameters
    if (!song) {
        song = new OMGSong();
        if (data && data.beatParams) {
            if (data.beatParams.beats) {
                song.data.beatParams.beats = data.beatParams.beats;
            }
            if (data.beatParams.subbeats) {
                song.data.beatParams.subbeats = data.beatParams.subbeats;
            }
            if (data.beatParams.measures) {
                song.data.beatParams.measures = data.beatParams.measures;
            }
            if (data.beatParams.bpm) {
                song.data.beatParams.bpm = data.beatParams.bpm;
            }
        }
        if (data && data.keyParams) {
            if (typeof data.keyParams.rootNote === "number") {
                song.data.keyParams.rootNote = data.keyParams.rootNote;
            }
            if (data.keyParams.scale) {
                song.data.keyParams.scale = data.keyParams.scale;
            }
        }
    }
    this.song = song;
    this.position = song.sections.length;
    song.sections.push(this);        

    if (data) {
        this.data = data;
        if (data.id) {
            this.saved = true;
        }
    } else {
        this.data = {type: "SECTION", parts: []};
    }
    
    if (!this.data.chordProgression) {
        this.data.chordProgression = [0];
    }

    for (var ip = 0; ip < this.data.parts.length; ip++) {
        partData = this.data.parts[ip];
        part = new OMGPart(null, partData, this);
    }
}

OMGSection.prototype.getData = function () {
    this.data.parts = [];
    for (var ip = 0; ip < this.parts.length; ip++) {
        this.data.parts[ip] = this.parts[ip].data;
    }
    return this.data;
};

function OMGPart(div, data, section) {
    this.div = div;
    this.fx = [];
    if (!section || !section.data) {
        console.log("new OMGPart() called without a section. Not good.");
        try {throw new Exception();}
        catch (e) {console.log(e);}
        var song = new OMGSong();
        section = new OMGSection(null, null, song);
    }

    this.section = section;
    this.position = section.parts.length;
    section.parts.push(this);        

    if (!section.song || !section.song.data) {
        section.song = new OMGSong();
        section.song.sections.push(section.song);
    }

    this.data = data || {type: "PART"};
    if (!this.data.fx) {
        this.data.fx = [];
    }

    if (!this.data.surface) {
        if (this.data.soundSet && this.data.soundSet.defaultSurface) {
            this.data.surface = {url: this.data.soundSet.defaultSurface};
        }
        else {
            this.data.surface = {url: "PRESET_VERTICAL"};
        }
    }
    
    if (!this.data.soundSet) {
        this.data.soundSet = {
            name: "Sine Oscillator",
            url: "PRESET_OSC_SINE",
            highNote: 108,
            lowNote: 0,
            chromatic: true,
            octave: 5
        };
    }
    
    if (this.data.surface.url === "PRESET_VERTICAL") {
        if (!this.data.notes) {
            this.data.notes = [];
        }     
    }
    else {
        if (!this.data.tracks) {
            this.makeTracks();
        }
        for (var i = 0; i < this.data.tracks.length; i++) {
            this.makeAudioParams(this.data.tracks[i]);
        }
    }
    
    this.makeAudioParams(false, this.data.soundSet.url.startsWith("PRESET_OSC"));
    
    if (this.data.id) {
        this.saved = true;
    }
    
}

OMGPart.prototype.makeAudioParams = function (track, osc) {
    var obj = track || this.data;
    if (!obj.audioParams) obj.audioParams = {};
    
    //backwards compat, now we use gain instead of volume
    if (typeof obj.audioParams.volume === "number" && 
            typeof obj.audioParams.gain !== "number") {
        obj.audioParams.gain = Math.pow(obj.audioParams.volume, 2);
    }
    if (typeof obj.audioParams.gain !== "number") {
        obj.audioParams.gain = track ? 1 : osc ? 0.2 : 0.6;
    }
    if (typeof obj.audioParams.pan !== "number")
        obj.audioParams.pan = 0;
    if (typeof obj.audioParams.warp !== "number")
        obj.audioParams.warp = 1;
};

OMGPart.prototype.defaultDrumPart = function () {
    return {"type": "PART", 
            "surface": {"url": "PRESET_SEQUENCER"},
            "soundSet": {"url": "PRESET_HIPKIT", "name": "Hip Hop Drum Kit"},
            "tracks": [{"name": "kick", "sound": "PRESET_HH_KICK",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                {"name": "snare", "sound": "PRESET_HH_CLAP",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                {"name": "closed hi-hat", "sound": "PRESET_ROCK_HIHAT_CLOSED",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                {"name": "open hi-hat", "sound": "PRESET_HH_HIHAT",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                {"name": "tambourine", "sound": "PRESET_HH_TAMB",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                {"name": "h tom", "sound": "PRESET_HH_TOM_MH",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                {"name": "m tom", "sound": "PRESET_HH_TOM_ML",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                {"name": "l tom", "sound": "PRESET_HH_TOM_L",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}
            ]};
};

OMGPart.prototype.makeTracks = function () {
    this.data.tracks = [];
    if (this.data.soundSet && this.data.soundSet.data) {
        var that = this;
        this.data.soundSet.data.forEach(function (sound) {
            var track = {name: sound.name, data: [], 
                    audioParams: {gain: 1, pan: 0, warp: 1}};
            track.sound = (that.data.soundSet.prefix || "") +
                    sound.url + (that.data.soundSet.postfix || "");
            that.data.tracks.push(track);
        });
    }
};

