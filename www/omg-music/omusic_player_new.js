if (typeof (omg) !== "object") omg = {};
if (!omg.loadedSounds)         omg.loadedSounds = {};
if (!omg.downloadedSoundSets)  omg.downloadedSoundSets = {};

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

OMusicPlayer.prototype.prepare = function (data) {
    // figure out what this is
    if (!data || !data.type) {
        return false;
    }

    // type should just be part, makes it easier to deal with
    if (data.type === "MELODY" || data.type === "BASSLINE" || data.type === "DRUMBEAT") {
        data.partType = data.type;
        data.type = "PART";
    }
    
    if (data.type !== "SONG" && data.type !== "SECTION" && data.type !== "PART") {
        return false;
    }

    // we need a rootNote, scale, subbeats, beats, measures, and subbeat millis
    if (!data.rootNote)      data.rootNote = 0;
    if (!data.ascale)        data.ascale = [0,2,4,5,7,9,11];
    if (!data.subbeatMillis) data.subbeatMillis = 125;
    if (!data.subbeats)      data.subbeats = 4;
    if (!data.beats)         data.beats = 4;
    if (!data.measures)      data.measures = 2;

    var info = {};
    info.soundsToLoad = {};
    info.totalSubbeats = 0;
    info.data = data;
    info.holder = {data: data};

    if (data.type === "SONG") {
        this.prepareSong(info.holder, info);
    }
    else if (data.type === "SECTION") {
        this.prepareSection(info.holder, info);
    }
    else if (data.type === "PART") {
        this.preparePart(info.holder , info);
    }
    
    return info;
};

OMusicPlayer.prototype.prepareSong = function (holder, info) {
    var p = this;
    var data = holder.data;
    var sectionHolder;
    holder.sections = [];
    data.sections.forEach(function (section) {
        sectionHolder = {data: section};
        p.prepareSection(sectionHolder, info);
        holder.sections.push(sectionHolder);
    });    
};

OMusicPlayer.prototype.prepareSection = function (holder, info) {
    var p = this;
    
    var data = holder.data;
    var partHolder;
    holder.parts = [];

    var chords = holder.data.chordProgression || [0];
    chords.forEach(function (chord) {
        data.parts.forEach(function (part) {
            p.rescale(part, info.data.rootNote, info.data.ascale, chord);

            partHolder = {data: part};
            p.preparePart(partHolder, info);
            holder.parts.push(partHolder);
        });
    });
    //times chords.length?
    info.totalSubbeats += info.data.subbeats * info.data.beats * info.data.measures;
};

OMusicPlayer.prototype.preparePart = function (holder, info) {
    var data = holder.data;
    
    // if this is the top level, iow, there is no section, just a solo part
    if (data === info.data) {
        info.totalSubbeats += info.data.subbeats * info.data.beats * info.data.measures;
    }
    
    if (data.volume === undefined) data.volume = 0.6;
    if (data.pan === undefined)    data.pan = 0;

    if (data.surfaceURL === "PRESET_SEQUENCER") {
        data.soundsetURL = data.soundsetURL || "PRESET_HIPKIT";
        this.prepareDrumbeat(holder, info);
    } else {
        data.soundsetURL = data.soundsetURL || "PRESET_OSC_SINE_SOFT_DELAY";
        this.prepareMelody(holder, info);
    }
};

OMusicPlayer.prototype.prepareDrumbeat = function (holder, info) {
    var tracks = holder.data.tracks;
    for (var i = 0; i < tracks.length; i++) {
        if (tracks[i].sound) {
            this.prepareSound(tracks[i].sound, info);
        }
    }
};
OMusicPlayer.prototype.prepareMelody = function (holder, info) {
    var p = this;
    var data = holder.data;
    
    var whenHasSoundset = function () {
    
        for (var ii = 0; ii < data.notes.length; ii++) {
            var note = data.notes[ii];

            if (note.rest)
                continue;
            if (!note.sound)
                continue;
            if (p.loadedSounds[note.sound])
                continue;

            p.prepareSound(note.sound, info);
        }
    };

    if (typeof data.soundsetURL === "string") {
        p.getSoundSet(data.soundsetURL, function (soundset) {
            p.setupPartWithSoundSet(soundset, holder, whenHasSoundset);
        });
    }
};

OMusicPlayer.prototype.prepareSound = function (sound, info) {
    var p = this;

    if (!sound || !p.context) {
        return;
    }
    
    if (!p.loadedSounds[sound] && !info.soundsToLoad[sound]) {
        info.soundsToLoad[sound] = "load";
    }
};

OMusicPlayer.prototype.load = function (info, callback) {
    // load the sounds determined by the prepare() method    
    if (info.loaded) {
        if (callback) callback(info);
        return;
    }
    
    info.onload = callback;
    info.soundsLoading = 0;
    for (var sound in info.soundsToLoad)  {
        
        if (info.soundsToLoad[sound] !== "load" || this.loadedSounds[sound]) {
            continue;
        }
        
        var url = sound;
        if (sound.indexOf("PRESET_") === 0) {
            var preseturl = "http://mikehelland.com/omg/drums/";
            url = preseturl + sound.substring(7).toLowerCase() + ".mp3";
        }
        
        info.soundsLoading++;
        this.downloadSound(url, sound, info);        
    }
    
    if (!info.soundsLoading > 0) {
        info.loaded = true;
        if (callback) callback(info);
    }
};

OMusicPlayer.prototype.downloadSound = function (url, sound, info) {
    var p = this;
    
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // Decode asynchronously
    request.onload = function () {
        p.context.decodeAudioData(request.response, function (buffer) {
            p.loadedSounds[sound] = buffer;
            p.onSoundLoaded(true, sound, info);
        }, function () {
            console.log("error loading sound url: " + url);
            p.onSoundLoaded(false, sound, info);
        });
    };
    request.send();
};

OMusicPlayer.prototype.onSoundLoaded = function (success, sound, info) {
    var p = this;
    
    info.soundsLoading--;
    info.soundsToLoad[sound] = success ? "loaded" : "error";

    if (info.soundsLoading < 1) {
        info.loaded = true;
        if (info.onload) {
            info.onload(info);
        }
    }
};

OMusicPlayer.prototype.play = function (info) {
    if (!this.context || !info || !info.data || !info.holder)
        return;

    var p = this;

    var offset = 0.001;
    info.startTime = p.context.currentTime + offset;

    var type = info.data.type;
    if (type === "SONG") {
        this.scheduleSong(info.holder, info);
    }
    else if (type === "SECTION") {
        p.scheduleSection(info.holder, info);
    }
    else if (type === "PART") {
        p.schedulePart(info.holder, info);
    }

    p.playing = true;
    if (typeof (p.onPlay) === "function") {
        p.onPlay();
    }

    //leftovers, probably need this tho
    p.songStarted = p.loopStarted;
};

OMusicPlayer.prototype.scheduleSong = function (holder, info) {
    var p = this;
    
    if (!holder || !holder.data) {
        console.log("can't play song, no data");
        return;
    }
    
    holder.sections.forEach(function (section) {
        p.scheduleSection(section, info); 
    });   
 };

OMusicPlayer.prototype.scheduleSection = function (holder, info) {
    var p = this;
    
    if (!holder || !holder.data) {
        console.log("can't play section, no data");
        return;
    }
    
    var data = holder.data;
    (data.chordProgression || [0]).forEach(function (chord) {
        console.log("applying chord " + chord);
        p.applyChordToSection(chord, holder, info);

        data.parts.forEach(function (part) {
            if (part.mute) {
                    //not playing nothing
            }
            else {
                p.schedulePart({data: part}, info);
            }
        });

        info.startTime += (info.data.subbeatMillis * info.data.subbeats *
                info.data.beats * info.data.measures) / 1000;
    });
};

OMusicPlayer.prototype.schedulePart = function (part, info) {
    part.audioBuffers = [];
    if (part.data.surfaceURL === "PRESET_SEQUENCER") {
        this.scheduleSequencerPart(part, info); 
    }
    else {
        this.scheduleNotesPart(part, info);
    }  
};

OMusicPlayer.prototype.scheduleSequencerPart = function (part, info) {
    var subbeatTimeInLoop;
    var tracks = part.data.tracks;
    for (var i = 0; i < tracks.length; i++) {
        for (var iSubbeat = 0; iSubbeat < info.totalSubbeats; iSubbeat++) {
            if (tracks[i].data[iSubbeat]) {
                subbeatTimeInLoop = iSubbeat * info.data.subbeatMillis / 1000;
                this.scheduleSoundAtTime(tracks[i].sound, 
					part, info.startTime + subbeatTimeInLoop);
            }
        } 
    }
};

OMusicPlayer.prototype.scheduleNotesPart = function (part, info) {
    var p = this;
    if (!part || !part.data || !part.data.notes) {
		console.log(part);
        console.log("can't play part, no notes data");
    }
    
    var beatsSoFar = 0;

    part.data.notes.forEach(function (note, i) {
        var playTime = info.startTime + (beatsSoFar * info.data.subbeats * 
                info.data.subbeatMillis) / 1000;
        var duration = (note.beats * info.data.subbeats * 
                info.data.subbeatMillis) / 1000;
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
        p.setupPartWithSoundSet(part.soundset, part);
    }
};

OMusicPlayer.prototype.setupPartWithSoundSet = function (ss, part, callback) {
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
    }
    
    if (callback) callback();
};

OMusicPlayer.prototype.getSoundSet = function (url, callback) {
    var p = this;

    if (typeof url !== "string") {
        return;
    }

    if (!callback) {
        callback = function () {};
    }

    //this soundset may be already downloading, or in the process
    var dl = p.downloadedSoundSets[url];
    if (dl) {
        if (dl === "loading") {
            var pollHandle = setInterval(function () {
                if (p.downloadedSoundSets[url] !== "loading") {
                    clearInterval(pollHandle);
                    callback(p.downloadedSoundSets[url]);
                }
            }, 50);
        }
        else {    
            callback(dl);
        }
        return;
    }

    if (url.indexOf("PRESET_") === 0) {
        dl = p.getPresetSoundSet(url);
        p.downloadedSoundSets[url] = dl;
        callback(dl);
        return;
    }

    p.downloadedSoundSets[url] = "loading";

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


OMusicPlayer.prototype.applyChordToSection = function (chord, section, info) {
    var p = this;
    console.log(section);
    section.parts.forEach(function (part) {
        p.rescale(part, info.data.rootNote,
            info.data.ascale,
            chord || 0);
    });	
};

OMusicPlayer.prototype.setSubbeatMillis = function (subbeatMillis) {
    this.newSubbeatMillis = subbeatMillis;
};
