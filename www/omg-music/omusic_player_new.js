if (typeof (omg) !== "object") {
    omg = {};
}
if (!omg.loadedSounds) {
    omg.loadedSounds = {};
}
if (!omg.downloadedSoundSets) {
    omg.downloadedSoundSets = [];
}

function OMusicPlayer() {

    this.dev = omg.dev;

    var p = this;

    p.playing = false;
    p.soundsLoading = 0;
    p.loadedSounds = omg.loadedSounds;
    p.downloadedSoundSets = omg.downloadedSoundSets;

    if (!window.AudioContext)
        window.AudioContext = window.webkitAudioContext;

    try {
        p.context = new AudioContext();
        if (!p.context.createGain)
            p.context.createGain = p.context.createGainNode;

    } catch (e) {
        var nowebaudio = document.getElementById("no-web-audio");
        if (nowebaudio)
            nowebaudio.style.display = "inline-block";
        //return;
    }

    p.compressor = p.context.createDynamicsCompressor();
    p.compressor.threshold.value = -50;
    p.compressor.knee.value = 40;
    p.compressor.ratio.value = 2;
    p.compressor.attack.value = 0;
    p.compressor.release.value = 0.25;
    p.compressor.connect(p.context.destination);

    p.onBeatPlayedListeners = [];

    p.iSubBeat = 0;
    p.loopStarted = 0;

    p.nextUp = null;

    p.loopSection = -1;
}


OMusicPlayer.prototype.play = function (song) {
    var p = this;
    if (!p.context)
        return;

    if (song) {
        if (!p.prepareSong(song)) {
            return;
        }
    }

    p.song.playingSection = 0;

    if (!p.song.sections || !p.song.sections.length) {
        console.log("no sections to play()");
        return -1;
    }
    
    var goTime = function () {
        p.playing = true;
        p.playSection(p.song.playingSection);        
        if (typeof (p.onPlay) === "function") {
            p.onPlay();
        }
    };
    if (p.soundsLoading < 1) {
        goTime();
    }
    else {
        p.goTime = goTime;
    }
    return;

    p.songStarted = p.loopStarted;
    return p.playingIntervalHandle;
};


OMusicPlayer.prototype.playSection = function (isection) {
    var p = this;
    var section = p.song.sections[isection];
    if (!section || !section.data) {
        console.log("can't play section, no data");
        return;
    }
    
    var info = {};
    //get the tempo from the song
    //todo have a way to override this for section's to have individual tempo
    info.subbeatMillis = p.song.data.subbeatMillis;
    //same here
    info.beats = p.song.data.beats;
    info.subbeats = p.song.data.subbeats;
    
    //let the section choose the measures
    info.measures = section.data.measures || p.song.data.measures;
    info.totalSubbeats = info.beats * info.beats * info.measures;

	if (!section.data.chordProgression || !section.data.chordProgression.length) {
		section.data.chordProgression = [0];
	}

    var offset = 0.001;
    info.startTime = p.context.currentTime + offset;

	section.data.chordProgression.forEach(function (chord) {
		p.applyChordToSection(chord, section);

		section.parts.forEach(function (part) {
			part.audioBuffers = [];
			if (part.data.mute) {
				//not playing nothing
			}
			else if (part.data.surfaceURL === "PRESET_SEQUENCER") {
				p.scheduleSequencerPart(part, info); 
			}
			else {
				p.schedulePart(part, info);
			}
		});
		
		info.startTime += (info.totalSubbeats * info.subbeatMillis) / 1000;
	});
};

OMusicPlayer.prototype.scheduleSequencerPart = function (part, info) {
    var subbeatTimeInLoop;
    for (var i = 0; i < part.data.tracks.length; i++) {
        for (var iSubbeat = 0; iSubbeat < info.totalSubbeats; iSubbeat++) {
            if (part.data.tracks[i].data[iSubbeat]) {
                subbeatTimeInLoop = iSubbeat * info.subbeatMillis / 1000;
                this.scheduleSoundAtTime(part.data.tracks[i].sound, 
					part, info.startTime + subbeatTimeInLoop);
            }
        } 
    }
};

OMusicPlayer.prototype.schedulePart = function (part, info) {
    var p = this;
    if (!part || !part.data || !part.data.notes) {
		console.log(part);
        console.log("can't play part, no notes data");
    }
    
    var startTime = info.startTime;
    var beatsSoFar = 0;
    part.data.notes.forEach(function (note, i) {
        var playTime = info.startTime + (beatsSoFar * info.subbeats * info.subbeatMillis) / 1000;
        var duration = (note.beats * info.subbeats * info.subbeatMillis) / 1000;
		if (note.sound && !note.rest) {
            p.scheduleSoundAtTime(note.sound, part, playTime, duration);
        }
        else {
			p.scheduleOscAtTime(note, part, playTime, duration);
		}
        beatsSoFar += note.beats;
    });
};

OMusicPlayer.prototype.scheduleOscAtTime = function (note, part, startTime, duration) {
	if (!part.osc) {
		this.makeOsc(part);
	}
	
	if (!note || note.rest)
		part.osc.frequency.setValueAtTime(0, startTime);
	else {

		var freq = this.makeFrequency(note.scaledNote);
		part.osc.frequency.setValueAtTime(freq, startTime);
		part.osc.frequency.setValueAtTime(0, startTime + duration * 0.995);
	}
};

OMusicPlayer.prototype.scheduleSoundAtTime = function (sound, part, startTime, duration) {
    var p = this;

    if (p.loadedSounds[sound] &&
            p.loadedSounds[sound] !== "loading") {

        var source = p.context.createBufferSource();
        source.buffer = p.loadedSounds[sound];
        part.audioBuffers.push(source);
        
        if (!part.bufferPanner) {
            part.bufferPanner = p.context.createStereoPanner();
            part.bufferGain = p.context.createGain();

            part.bufferGain.connect(part.bufferPanner);
            part.bufferPanner.connect(p.compressor);
        }
        source.connect(part.bufferGain);
        
        part.bufferPanner.pan.setValueAtTime(part.data.pan, p.context.currentTime);
        part.bufferGain.gain.setValueAtTime(part.data.volume, p.context.currentTime);
        
        source.start(startTime);
        
        if (duration) {
			//linearRampToValueAtTime starts at the previous event
			//so this next line is a dummy set to move the event pointer forward to here
			part.bufferGain.gain.linearRampToValueAtTime(part.data.volume, 
					startTime + duration * 0.995);
			part.bufferGain.gain.linearRampToValueAtTime(0, startTime + duration);
			source.stop(startTime + duration);			
		}

        //return source;
    }
};


OMusicPlayer.prototype.stop = function () {
    var p = this;

    if (typeof (p.onStop) === "function") {
        p.onStop();
    }

    clearInterval(p.playingIntervalHandle);
    p.playing = false;

    if (p.song && p.song.sections[p.song.playingSection]) {
        var parts = p.song.sections[p.song.playingSection].parts;
        for (var ip = 0; ip < parts.length; ip++) {
            if (parts[ip].osc) {
                parts[ip].osc.finishPart();
            }
            if (parts[ip].audioBuffers) {
				parts[ip].audioBuffers.forEach(function (audioBuffer) {
					audioBuffer.stop();
				});
				parts[ip].audioBuffers = [];
			}
        }
    }
};

OMusicPlayer.prototype.loadPart = function (part) {
    var p = this;

    var type = part.data.type;
    var surface = part.data.surfaceURL;

    part.soundsLoading = 0;
    part.loaded = false;
    if (type === "PART") {

        if (part.data.volume === undefined) {
            part.data.volume = 0.6;
        }
        if (part.data.pan === undefined) {
            part.data.pan = 0;
        }

        if (surface === "PRESET_SEQUENCER") {
            part.data.soundsetURL = part.data.soundsetURL || "PRESET_HIPKIT";
            this.loadDrumbeat(part);
        } else {
            part.data.soundsetURL = part.data.soundsetURL || "PRESET_OSC_SINE_SOFT_DELAY";
            this.loadMelody(part);
        }

    }
    if (type==="CHORDPROGRESSION") {
        part.loaded = true;
    }
};

OMusicPlayer.prototype.loadMelody = function (part) {
    var p = this;

    var data = part.data;

    var rootNote = 0;
    var ascale = [0, 2, 4, 5, 7, 9, 11];
    
    var section = part.section;
    var song = part.section ? part.section.song : undefined;

    if (song && typeof song.data.rootNote==="number") {
        rootNote = song.data.rootNote;
    } else if (section && typeof section.data.rootNote==="number") {
        rootNote = section.data.rootNote;
    } else if (typeof data.rootNote === "number") {
        rootNote = data.rootNote % 12;
    }

    if (song && song.data.ascale !== undefined) {
        ascale = song.data.ascale;
    } else if (section && section.data.ascale !== undefined) {
        ascale = section.data.ascale;
    } else if (data.ascale) {
        ascale = data.ascale;
    } else if (data.scale) {
        data.ascale = p.splitInts(data.scale);
    }

    p.rescale(part, rootNote, ascale, 0);

    if (typeof data.soundsetURL === "string") {
        p.getSoundSet(data.soundsetURL, function (soundset) {
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

    if (soundsToLoad === 0) {
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
    if (soundsAlreadyLoaded === tracks.length) {
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
    
    if (!song.data.beats) {
        song.data.beats = 4;
    }
    if (!song.data.subbeats) {
        song.data.subbeats = 4;
    }
    if (!song.data.measures) {
        song.data.measures = 1;
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
            part.gain.disconnect(part.panner);
            part.panner.disconnect(p.compressor);
        } catch (e) {
        }
    }

    part.osc = p.context.createOscillator();

    var soundsetURL = part.data.soundsetURL ||
            "PRESET_OSC_SINE_SOFT_DELAY";
    if (soundsetURL.indexOf("SAW") > -1) {
        part.osc.type = "sawtooth";
    } else if (soundsetURL.indexOf("SINE") > -1) {
        part.osc.type = "sine";
    } else if (soundsetURL.indexOf("SQUARE") > -1) {
        part.osc.type = "square";
    }

    if (soundsetURL.indexOf("SOFT") > -1) {
        part.osc.soft = true;
    }
    if (soundsetURL.indexOf("DELAY") > -1) {
        part.osc.delay = true;
    }

    part.gain = p.context.createGain();
    part.osc.connect(part.gain);

    part.panner = p.context.createStereoPanner();

    part.gain.connect(part.panner);
    if (part.osc.delay) {
        part.delay = p.context.createDelay();
        part.delay.delayTime.value = 0.5;
        part.feedback = p.context.createGain();
        part.feedback.gain.value = 0.3;
        part.gain.connect(part.delay);
        part.delay.connect(part.feedback);
        part.feedback.connect(part.delay);
        part.feedback.connect(p.compressor);
    }
    part.panner.connect(p.compressor);
    part.panner.pan.setValueAtTime(part.data.pan, p.context.currentTime);

    var volume = part.data.volume / 10;
    if (part.osc.soft) {
        volume = volume * 0.5;
    }
    if (part.data.mute) {
        part.gain.gain.setValueAtTime(0, p.context.currentTime);
        part.gain.gain.preMuteGain = volume;
    } else {
        part.gain.gain.setValueAtTime(volume, p.context.currentTime);
    }

    part.osc.frequency.setValueAtTime(0, p.context.currentTime);
    part.osc.start(p.context.currentTime);

    part.osc.finishPart = function () {
        part.gain.gain.setValueAtTime(0, p.context.currentTime);

        //total hack, this is why things should be processed ala AudioContext, not our own thread
        setTimeout(function () {
            part.osc.stop(p.context.currentTime);
            part.osc.disconnect(part.gain);
            part.gain.disconnect(part.panner);
            part.panner.disconnect(p.compressor);

            part.oscStarted = false;
            part.osc = null;
            part.gain = null;
        }, 50);
    };

    part.oscStarted = true;

};

OMusicPlayer.prototype.makeFrequency = function (mapped) {
    return Math.pow(2, (mapped - 69.0) / 12.0) * 440.0;
};

OMusicPlayer.prototype.initSound = function () {
    var p = this;
    p.playedSound = true;
    try {
        var osc = p.context.createOscillator();
        osc.connect(p.context.destination);
        osc.frequency.setValueAtTime(0, p.context.currentTime);
        osc.start(p.context.currentTime);

        setTimeout(function () {
            osc.stop(p.context.currentTime);
            osc.disconnect(p.context.destination);

        }, 500);
    } catch (ex) {
        console.log("error initializing web audio api");
    }
};

OMusicPlayer.prototype.loadSound = function (sound, part) {
    var p = this;

    if (!sound || !p.context) {
        return;
    }

    var key = sound;
    var url = sound;
    if (sound.indexOf("PRESET_") === 0) {
        var preseturl;
        if (!p.dev) {
            preseturl = "http://mikehelland.com/omg/drums/";
        } else {
            preseturl = "http://localhost:8888/music/audio/";
            //preseturl = "http://localhost:8889/audio/";
        }
        url = preseturl + sound.substring(7).toLowerCase() + ".mp3";
    }

    p.loadedSounds[key] = "loading";

    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    p.soundsLoading++;
    part.soundsLoading++;
    console.log(part.soundsLoading + " sounds to load now");
    // Decode asynchronously
    request.onload = function () {
        p.context.decodeAudioData(request.response, function (buffer) {
            p.loadedSounds[key] = buffer;
            p.onSoundLoaded(true, part);
        }, function () {
            console.log("error loading sound url: " + url);
            p.onSoundLoaded(false, part);
        });
    };
    request.send();

};

OMusicPlayer.prototype.onSoundLoaded = function (success, part) {
    var p = this;
    p.soundsLoading--;
    part.soundsLoading--;
    console.log(`onSoundLoaded ${p.soundsLoading} left` );
    console.log(`onSoundLoaded ${part.soundsLoading} left` );
    if (part.soundsLoading < 1) {
        part.loaded = true;
    }
    if (p.soundsLoading < 1) {
        if (p.goTime) {
            p.goTime();
        }
    }
};

OMusicPlayer.prototype.rescale = function (part, rootNote, scale, chord) {
    var p = this;

    var data = part.data;
    if (!data || !data.notes) {
        return;
    }

    var octaveShift = data.octave || data.octaveShift;
    var octaves2;
    if (isNaN(octaveShift))
        octaveShift = data.type === "BASSLINE" ? 3 : 5;
    var newNote;
    var onote;
    var note;

    for (var i = 0; i < data.notes.length; i++) {
        octaves2 = 0;

        onote = data.notes[i];
        newNote = onote.note + chord;
        while (newNote >= scale.length) {
            newNote = newNote - scale.length;
            octaves2++;
        }
        while (newNote < 0) {
            newNote = newNote + scale.length;
            octaves2--;
        }

        newNote = scale[newNote] + octaves2 * 12 + octaveShift * 12 + rootNote;

        onote.scaledNote = newNote;
    }

    if (part.soundset) {
        p.setupPartWithSoundSet(part.soundset, part, true);
    }
};

OMusicPlayer.prototype.setupPartWithSoundSet = function (ss, part, load) {
    var p = this;

    if (!ss)
        return;

    part.soundset = ss;
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

        if (load && !p.loadedSounds[note.sound]) {
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

    if (typeof url !== "string") {
        return;
    }

    if (!callback) {
        callback = function () {};
    }

    var dl = p.downloadedSoundSets[url];
    if (dl) {
        callback(dl);
        return;
    }

    if (url.indexOf("PRESET_") === 0) {
        dl = p.getPresetSoundSet(url);
        p.downloadedSoundSets[url] = dl;
        callback(dl);
        return;
    }

    var xhr2 = new XMLHttpRequest();
    xhr2.open("GET", url, true);
    xhr2.onreadystatechange = function () {

        if (xhr2.readyState === 4) {
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



OMusicPlayer.prototype.getPresetSoundSet = function (preset) {
    var p = this;

    var oret;
    if (preset === "PRESET_BASS") {
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
    if (preset === "PRESET_HIP") {
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
    if (preset === "PRESET_ROCK") {
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


OMusicPlayer.prototype.makeOMGSong = function (data) {
    var newSong;
    var newSection;
    var newPart;

    if (!data) {
        return null;
    }

    var className = data.constructor.name;

    if (className === "OMGPart" || className === "OMGDrumpart") {

        newSong = new OMGSong();
        newSection = new OMGSection(null, null, newSong);
        newSection.parts.push(data);
        data.section = newSection;

        if (data.data.beats) {
            newSection.data.beats = data.data.beats;
            newSong.data.beats = newSection.data.beats;
        }            
        if (data.data.subbeats) {
            newSection.data.subbeats = data.data.subbeats;
            newSong.data.subbeats = newSection.data.subbeats;
        }   
        if (data.data.measures) {
            newSection.data.measures = data.data.measures;
            newSong.data.measures = newSection.data.measures;
        }   
        if (data.data.subbeatMillis) {
            newSection.data.subbeatMillis = data.data.subbeatMillis;
            newSong.data.subbeatMillis = newSection.data.subbeatMillis;
        }
        return newSong;
    }

    if (className === "OMGSection") {

        newSong = new OMGSong();
        newSong.sections.push(data);
        if (newSection.data.beats)
            newSong.data.beats = newSection.data.beats;
        if (newSection.data.subbeats)
            newSong.data.subbeats = newSection.data.subbeats;
        if (newSection.data.measures)
            newSong.data.measures = newSection.data.measures;
        if (newSection.data.subbeatMillis)
            newSong.data.subbeatMillis = newSection.data.subbeatMillis;
        
        data.song = newSong;
        return newSong;
    }

    if (!data.type) {
        return null;
    }

    var newSong;
    if (data.type === "SONG") {
        newSong = new OMGSong(null, data);
        return newSong;
    }

    if (data.type === "SECTION") {
        newSong = new OMGSong();
        newSection = new OMGSection(null, data, newSong);

        if (newSection.data.beats)
            newSong.data.beats = newSection.data.beats;
        if (newSection.data.subbeats)
            newSong.data.subbeats = newSection.data.subbeats;
        if (newSection.data.measures)
            newSong.data.measures = newSection.data.measures;
        if (newSection.data.subbeatMillis)
            newSong.data.subbeatMillis = newSection.data.subbeatMillis;
        if (newSection.data.rootNote)
            newSong.data.rootNote = newSection.data.rootNote;
        if (newSection.data.ascale)
            newSong.data.ascale = newSection.data.ascale;

        return newSong;
    }

    newSong = new OMGSong();
    newSection = new OMGSection(null, null, newSong);

    //todo this could go away, we only have type = "PART" now
    //its for back compat with pre-launch data
    if (data.type === "MELODY" || data.type === "BASSLINE"
            || data.partType === "MELODY" || data.partType === "BASSLINE") {
        newPart = new OMGPart(null, data, newSection);
    }
    else if (data.type === "DRUMBEAT"
            || data.partType === "DRUMBEAT") {
        newPart = new OMGDrumpart(null, data, newSection);
    }
    else if (data.type === "PART") {
        newPart = new OMGPart(null, data, newSection);
    }

    
    if (newPart) {
        if (newPart.data.beats) {
            newSection.data.beats = newPart.data.beats;
            newSong.data.beats = newSection.data.beats;
        }            
        if (newPart.data.subbeats) {
            newSection.data.subbeats = newPart.data.subbeats;
            newSong.data.subbeats = newSection.data.subbeats;
        }   
        if (newPart.data.measures) {
            newSection.data.measures = newPart.data.measures;
            newSong.data.measures = newSection.data.measures;
        }   
        if (newPart.data.subbeatMillis) {
            newSection.data.subbeatMillis = newPart.data.subbeatMillis;
            newSong.data.subbeatMillis = newSection.data.subbeatMillis;
        }
        newPart.section = newSection;
        newSection.song = newSong;
        return newSong;
    }

    return null;
};

OMusicPlayer.prototype.updatePartVolumeAndPan = function (part) {

    if (part.gain && part.osc) {
        var oscGain = (part.osc.soft ? 1 : 2) * part.data.volume / 10;
        part.gain.gain.setValueAtTime(oscGain, this.context.currentTime);
    }
    if (part.bufferGain) {
        part.bufferGain.gain.setValueAtTime(part.data.volume, this.context.currentTime);
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

OMusicPlayer.prototype.rescaleSong = function (rootNote, ascale, chord) {
    var p = this;
    var song = this.song.data;
    if (rootNote !== undefined) {
        song.rootNote = rootNote;
    }
    if (ascale !== undefined) {
        song.ascale = ascale;
    }
    this.song.sections.forEach(function (section) {
        section.parts.forEach(function (part) {
            p.rescale(part, song.rootNote || 0,
                    song.ascale || [0, 2, 4, 5, 7, 9, 11],
                    chord || 0);
        });
    });
};

OMusicPlayer.prototype.applyChordToSection = function (chord, section) {
    var p = this;
    var song = this.song.data;
	section.parts.forEach(function (part) {
		p.rescale(part, song.rootNote || 0,
				song.ascale || [0, 2, 4, 5, 7, 9, 11],
				chord || 0);
    });	
};

OMusicPlayer.prototype.setSubbeatMillis = function (subbeatMillis) {
    this.newSubbeatMillis = subbeatMillis;
};



function OMGSong(div, data, headerOnly) {
    this.div = div;
    this.sections = [];
    this.loop = true;

    if (headerOnly) {
        this.setHeaderData(data);
    } else if (data) {
        this.setData(data);
        if (data.id) {
            this.saved = true;
        }
    } else {
        this.data = {type: "SONG", name: "",
            measures: 2, beats: 4, subbeats: 4, subbeatMillis: 125};
    }


    // key? tempo? yes, we need that shit
}
;
OMGSong.prototype.setData = function (data) {
    this.data = data;

    for (var i = 0; i < data.sections.length; i++) {
        var ooo = new OMGSection(null, data.sections[i], this);
    }

    if (!this.data.name)
        this.data.name = "";
};
/*OMGSong.prototype.setHeaderData = function (data) {
    this.measures = data.measures || this, measures;
    this.beats = data.beats || this.beats;
    this.subbeats = data.subbeats || this.subbeats;
    this.subbeatMillis = data.subbeatMillis || this.subbeatMillis;
}*/
OMGSong.prototype.getData = function () {

    this.data.sections = [];
    for (var ip = 0; ip < this.sections.length; ip++) {
        this.data.sections[ip] = this.sections[ip].getData();
    }
    return this.data;
};

function OMGSection(div, data, song) {
    var partData;
    var part;

    this.div = div;

    this.parts = [];
    if (!song || !song.data) {
        song = new OMGSong();
        if (this.data.beats) {
            song.data.beats = this.data.beats;
        }
        if (this.data.subbeats) {
            song.data.subbeats = this.data.subbeats;
        }
        if (this.data.measures) {
            song.data.measures = this.data.measures;
        }
        if (this.data.subbeatMillis) {
            song.data.subbeatMillis = this.data.subbeatMillis;
        }
        if (typeof this.data.rootNote === "number") {
            song.data.rootNote = this.data.rootNote;
        }
        if (this.data.ascale) {
            song.data.ascale = this.data.ascale;
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

    for (var ip = 0; ip < this.data.parts.length; ip++) {
        partData = this.data.parts[ip];
        if (partData.type === "DRUMBEAT" ||
                partData.partType === "DRUMBEAT") {
            part = new OMGDrumpart(null, partData, this);
        } else {
            part = new OMGPart(null, partData, this);
        }
    }
}

OMGSection.prototype.getData = function () {
    this.data.parts = [];
    for (var ip = 0; ip < this.parts.length; ip++) {
        this.data.parts[ip] = this.parts[ip].data;
    }
    return this.data;
};

function OMGDrumpart(div, data, section) {
    this.div = div;
    if (!section || !section.data) {
        console.log("new OMGDrumpart() called without a section. Not good.");
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
    
    if (data) {
        this.data = data;
        if (!data.partType) {
            data.partType = "DRUMBEAT";
            data.type = "PART";
        }
        if (data.id) {
            this.saved = true;
        }
    } else {
        this.data = {"type": "PART", "partType": "DRUMBEAT",
            "surfaceURL": "PRESET_SEQUENCER",
            "soundsetURL": "PRESET_HIPKIT", "soundsetName": "Hip Hop Drum Kit",
            "bpm": 120, "kit": 0,
            isNew: true,
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
    }
    

    if (!this.data.overrideSongBeats) {
        this.data.beats = section.song.data.beats || 
                section.data.beats || this.data.beats || 4;
        this.data.subbeats = section.song.data.subbeats || 
                section.data.subbeats || this.data.subbeats || 4;
        this.data.measures = section.song.data.measures || 
                section.data.measures || this.data.measures || 2;
        this.data.subbeatMillis = section.song.data.subbeatMillis || 
                section.data.subbeatMillis || this.data.subbeatMillis || 125;
    }

}

function OMGPart(div, data, section) {
    this.div = div;
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

    if (data) {
        this.data = data;
        if (!data.partType) {
            //if type is melody or bassline
            data.partType = data.type;
            data.type = "PART";
        }
    } else {
        this.data = {type: "PART",
            partType: "MELODY", surfaceURL: "PRESET_VERTICAL",
            soundsetURL: "PRESET_OSC_SINE_SOFT_DELAY",
            soundsetName: "Osc Soft Sine Delay",
            notes: [], volume: 0.6, pan: 0, 
            rootNote: 0, ascale: [0,2,4,5,7,9,11]
        };
    }

    if (this.data.id) {
        this.saved = true;
    }
    
    if (!this.data.overrideSongKey) {        
        this.data.rootNote = 
                (typeof section.song.data.rootNote === "number") ?
                    section.song.data.rootNote : 
                    (typeof section.data.rootNote === "number") ?
                        section.data.rootNote : 
                            (typeof this.data.rootNote === "number") ?
                                this.data.rootNote : 0;
                            
        this.data.ascale = section.song.data.ascale || section.data.ascale || 
                this.data.ascale || [0,2,4,5,7,9,11];                            
    }
    
    if (!this.data.overrideSongBeats) {
        this.data.beats = section.song.data.beats || 
                section.data.beats || this.data.beats || 4;
        this.data.subbeats = section.song.data.subbeats || 
                section.data.subbeats || this.data.subbeats || 4;
        this.data.measures = section.song.data.measures || 
                section.data.measures || this.data.measures || 2;
        this.data.subbeatMillis = section.song.data.subbeatMillis || 
                section.data.subbeatMillis || this.data.subbeatMillis || 125;
    }
}
