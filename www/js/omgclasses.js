// todo see how many places call new OMGSong and remove the div parameter
function OMGSong(div, data, headerOnly) {
    this.div = div;
    this.sections = [];
    this.fx = [];
    this.loop = true;
    this.gain = 1;

    this.partNodes = {}
    
    if (headerOnly) {
        this.setHeaderData(data);
    }
    else if (!data) {
        this.data = {type: "SONG", name: ""};
    }
    else if (data.type === "SONG") {
        this.setData(data);
        if (data.id) {
            this.saved = true;
        }
    }
    else if (data.type === "SECTION") {
        this.data = {type: "SONG", name: ""};
        new OMGSection(null, data, this);
    }
    else if (data.type === "PART") {
        this.data = {type: "SONG", name: ""};
        new OMGPart(null, data, new OMGSection(null, null, this));
    }
    else {
        data.type = "SONG";
        this.data = data;
    }

    data = this.data;
    
    this.data.omgVersion = Math.max(1, (this.omgVersion || 0));

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
    this.onFXChangeListeners = [];
};

OMGSong.prototype.keyChanged = function (source) {
    var song = this;
    this.onKeyChangeListeners.forEach(listener => listener(song.data.keyParams, source));
};

OMGSong.prototype.beatsChanged = function (source) {
    var song = this;
    this.onBeatChangeListeners.forEach(listener => listener(song.data.beatParams, source));
};

OMGSong.prototype.partMuteChanged = function (part, source) {
    this.onPartAudioParamsChangeListeners.forEach(listener => listener(part, source));
};

OMGSong.prototype.chordProgressionChanged = function (source) {
    this.onChordProgressionChangeListeners.forEach(listener => listener(source));
};

OMGSong.prototype.partAdded = function (part, source) {
    this.onPartAddListeners.forEach(listener => listener(part, source));
};

OMGSong.prototype.fxChanged = function (action, part, fx, source) {
    this.onFXChangeListeners.forEach(listener => listener(action, part, fx, source));
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

    let data = JSON.parse(JSON.stringify(this.data))
    data.soundSets = {}
    data.sections = [];
    
    for (var section of this.sections) {
        data.sections.push(section.getData(data))
    }

    if (this.arrangement.length > 0) {
        data.arrangement = [];
        for (ip = 0; ip < this.arrangement.length; ip++) {
            data.arrangement[ip] = this.arrangement[ip].data;
        }
    }
    else {
        delete data.arrangement;
    }
    return data;
};

OMGSong.prototype.make = function (data) {
    var newSong;
    var newSection;
    var newPart;

    if (!data) {
        return null;
    }

    var className = data.constructor.name;

    if (className === "OMGSong") {
        return data;
    }

    if (className === "OMGPart") {

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

    if (className === "OMGSection") {

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
    if (data.type === "SONG") {
        newSong = new OMGSong(null, data);
        return newSong;
    }

    if (data.type === "SECTION") {
        //newSong = new OMGSong();
        newSection = new OMGSection(null, data);
        return newSection.song;
    }

    if (data.type === "PART") {
        newPart = new OMGPart(null, data);
        return newPart.section.song;
    }

    if (data.type === "SOUNDSET") {
        newPart = new OMGPart(null, {soundSet: data});
        return newPart.section.song;
    }

    return null;
}

OMGSong.prototype.rescale = function () {

    for (var i = 0; i < this.sections.length; i++) {
        this.sections[i].rescale()
    }

}

function OMGSection(div, data, song) {
    var partData;
    var part;

    this.div = div;
    this.parts = [];
    this.partLookup = {};

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

    if (!this.data.parts) {
        this.data.parts = []
    }
    for (var ip = 0; ip < this.data.parts.length; ip++) {
        partData = this.data.parts[ip];
        part = new OMGPart(null, partData, this);
    }
}

OMGSection.prototype.getData = function (songData) {
    let data = JSON.parse(JSON.stringify(this.data))

    data.parts = []
    for (var part of this.parts) {
        
        var partData = JSON.parse(JSON.stringify(part.data))
        data.parts.push(partData)

        if (songData) {
            //if we're getting data for the whole song, store the parts' soundsets there
            songData.soundSets[part.data.name] = partData.soundSet
            delete partData.soundSet
        }
    }

    return data;
};

OMGSection.prototype.getPart = function (partName) {
    if (this.partLookup[partName]) {
        return this.partLookup[partName];
    }
    
    for (var ip = 0; ip < this.parts.length; ip++) {
        if (this.parts[ip].data.name === partName) {
            this.partLookup[partName] = this.parts[ip];
            return this.parts[ip];
        }
    }
};

OMGSection.prototype.rescale = function (chord) {

    for (var i = 0; i < this.parts.length; i++) {
        this.parts[i].rescale(this.song.data.keyParams, chord || 0)
    }

}

OMGSection.prototype.addPart = function (data, source) {
    var part = new OMGPart(undefined,data,this);
    
    // add the new part's data to the underlying data
    this.data.parts.push(part.data)

    this.song.partAdded(part, source);
    return part
}


function OMGPart(div, data, section) {
    this.div = div;
    this.fx = [];
    if (!section || !section.data) {
        console.warn("new OMGPart() called without a section.");
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

    this.data = data || {};
    this.data.type = this.data.type || "PART";
    
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

        // there might be a soundSet for this part in the song's data
        if (this.section.song.data.soundSets && this.section.song.data.soundSets[this.data.name]) {
            this.data.soundSet = this.section.song.data.soundSets[this.data.name]
        }
        else {
            this.data.soundSet = {
                name: "Sine Oscillator",
                url: "PRESET_OSC_SINE",
                highNote: 108,
                lowNote: 0,
                chromatic: true,
                octave: 5
            };
        }
    }

    this.setupSoundSet()
    
    if (!this.data.name) {
        this.data.name = this.data.soundSet.name;
    }
    
    if (this.data.surface.url === "PRESET_VERTICAL") {
        if (!this.data.notes) {
            this.data.notes = [];
        }     
    }
    else if (this.data.surface.url === "PRESET_SEQUENCER") {
        if (!this.data.tracks) {
            this.makeTracks();
        }
        for (var i = 0; i < this.data.tracks.length; i++) {
            this.makeAudioParams(this.data.tracks[i]);
        }
    }

    this.notesPlaying = {}
    
    this.makeAudioParams(false, (this.data.soundSet.url || "").startsWith("PRESET_OSC"));
    
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
            "soundSet": {"url": "HIPKIT", "name": "Hip Hop Drum Kit"},
            "tracks": [{"name": "kick", "sound": "http://mikehelland.com/omg/drums/hh_kick.mp3",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                {"name": "snare", "sound": "//mikehelland.com/omg/drums/hh_clap.mp3",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                {"name": "closed hi-hat", "sound": "//mikehelland.com/omg/drums/rock_hihat_closed.mp3",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                {"name": "open hi-hat", "sound": "//mikehelland.com/omg/drums/hh_hihat.mp3",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                {"name": "tambourine", "sound": "//mikehelland.com/omg/drums/hh_tamb.mp3",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                {"name": "h tom", "sound": "//mikehelland.com/omg/drums/hh_tom_mh.mp3",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                {"name": "m tom", "sound": "//mikehelland.com/omg/drums/hh_tom_ml.mp3",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                {"name": "l tom", "sound": "//mikehelland.com/omg/drums/hh_toml.mp3",
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

// one for OMGSong and one for OMGPart
OMGSong.prototype.getFX = function (name) {
    for (var ip = 0; ip < this.fx.length; ip++) {
        if (this.fx[ip].data.name === name) {
            return this.fx[ip];
        }
    }
};
OMGPart.prototype.getFX = function (name) {
    for (var ip = 0; ip < this.fx.length; ip++) {
        if (this.fx[ip].data.name === name) {
            return this.fx[ip];
        }
    }
};

OMGPart.prototype.rescale = function (keyParams, chord) {

    var data = this.data;
    if (!data || !data.notes) {
        return;
    }

    if (typeof data.soundSet.octave !== "number") {

    }

    var octave = data.soundSet.octave;
    var octaves2;
    var newNote;
    var onote;

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
};

OMGPart.prototype.setupSoundSet = function () {
    
    let ss = this.data.soundSet
    if (!ss || !ss.data)
        return;

    var topNote = ss.highNote;
    if (!topNote && ss.data.length) {
        topNote = ss.lowNote + ss.data.length - 1;
    }
    if (!ss.octave) {
        ss.octave = Math.floor((topNote + ss.lowNote) / 2 / 12);
    }

    // do we really need this? It's used... but shouldn't be
    this.soundSet = ss;
};
