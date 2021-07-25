"use strict";

console.log("Song.js")
// OMGSong wraps an OMG song so things like the player and DAW needs to can be added
// it's for storing anything related to session that can't be stringified 

export default function OMGSong(musicContext, data) {

    this.musicContext = musicContext
    
    // each song has sections (eg intro, verse, chorus) and parts (eg drums, bass, keyboard)
    // each section also has parts
    // song.parts describes the part's soundset and fx and audio nodes
    // song.section.parts describes the part's data (what notes to play when)

    
    this.parts = {}
    this.sections = {}
    this.fx = []
    this.loop = true;
    this.gain = 1

    this.data = data || {}
    this.data.type = this.data.type || "SONG"
    this.data.name = this.data.name || ""
    this.saved = this.data.id ? true : false

    if (!this.data.parts) {
        this.backwardsCompat1 = true
        this.data.parts = []
    }
    if (!this.data.sections) {
        this.data.sections = []
    }
    
    // the song also has an arrangement, an array of which sections to play
    
    this.arrangement = []
    /* if (!this.data.arrangement) {
        this.data.arrangement = []
    } */
    
    // todo come up with a version scheme
    //this.data.omgVersion = Math.max(1, (this.omgVersion || 0));
    
    if (!this.data.fx) {
        this.data.fx = [];
    }
    
    if (!this.data.beatParams) {
        this.data.beatParams = {};
    }
    this.data.beatParams.subbeats = this.data.beatParams.subbeats * 1 || 4;
    this.data.beatParams.beats = this.data.beatParams.beats * 1 || 4;
    this.data.beatParams.measures = this.data.beatParams.measures * 1 || 1;
    this.data.beatParams.bpm = this.data.beatParams.bpm * 1 || 120;
    this.data.beatParams.shuffle = this.data.beatParams.shuffle * 1 || 0;
    if (!this.data.keyParams) {
        this.data.keyParams = {};
    }
    this.data.keyParams.rootNote = this.data.keyParams.rootNote * 1 || 0;
    this.data.keyParams.scale = this.data.keyParams.scale || [0,2,4,5,7,9,11];
    
    this.onKeyChangeListeners = [];
    this.onBeatChangeListeners = [];
    this.onPartAudioParamsChangeListeners = [];
    this.onPartAddListeners = [];
    this.onChordProgressionChangeListeners = [];
    this.onFXChangeListeners = [];
    this.onPartChangeListeners = [];

    this.loadParts()
    this.loadSections()
};


OMGSong.prototype.loadParts = function () {
    for (var part of this.data.parts) {
        this.parts[part.name] = new OMGSongPart(part)
        this.parts[part.name].song = this
    }

    if (!this.backwardsCompat1) {
        //return
    }

    // find any parts that might not be in the header
    // mainly for backwards compat, <2021
    for (var section of this.data.sections) {
        if (section.parts) {
            for (part of section.parts) {
                if (!this.parts[part.name]) {
                    console.log("lateload", part.name)
                    var data = JSON.parse(JSON.stringify(part))
                    delete data.notes
                    delete data.tracks
                    this.data.parts.push(data)
                    var omgpart = new OMGSongPart(part)
                    this.parts[omgpart.data.name] = omgpart
                    this.parts[omgpart.data.name].song = this
                }
            }
        }
    }
    
}

OMGSong.prototype.loadSections = function () {
    var addToArrangement
    if (!this.data.arrangement) {
        this.arrangement = []
        addToArrangement = true
    }
    else {
        this.arrangement = this.data.arrangement
    }
    for (var sectionData of this.data.sections) {
        var section = this.makeSection(sectionData)
        this.sections[sectionData.name] = section
        this.loadSectionParts(section)

        if (addToArrangement) {
            this.arrangement.push({section: sectionData.name, repeats: 1})
        }
    }
}

OMGSong.prototype.loadSectionParts = function (section) {
    for (var partData of section.data.parts) {
        var part = new OMGSongPart(partData)
        part.song = this
        part.section = section
        part.headPart = this.parts[partData.name]
        section.parts[partData.name] = part
    }
}

OMGSong.prototype.addPart = function (data, source) {
    var headPart = new OMGSongPart(data)
    var name = this.getUniqueName(headPart.data.name, this.parts)
    headPart.data.name = name
    this.parts[name] = headPart
    this.parts[name].song = this
    this.data.parts[name] = headPart.data
    this.musicContext.loadPartHeader(headPart)
    
    for (var sectionName in this.sections) {
        var section = this.sections[sectionName]
        let part = new OMGSongPart(headPart.data)
        part.section = section
        part.song = this
        part.headPart = headPart
        section.parts[headPart.data.name] = part
        section.data.parts.push(part.data)
        this.musicContext.loadPart(part)
    }
    
    this.onPartAddListeners.forEach(listener => listener(headPart, source));
    return headPart
}

OMGSong.prototype.addSection = function (copy) {
    var name = (copy && copy.name) ? copy.name : "Section 1"
    name = this.getUniqueName(name, this.sections)
    if (copy) {
        copy = JSON.parse(JSON.stringify(copy))
        copy.name = name
    }
    var section = this.makeSection(copy)
    this.sections[name] = section
    this.data.sections[name] = section.data

    this.loadSectionParts(section)
    this.musicContext.loadSection(section)

    if (!this.data.arrangement) {
        this.arrangement.push({section: name, repeats: 1})
    }
    return section
}

OMGSong.prototype.makeSection = function (data) {
    data = data || {}
    data.name = data.name || "Section"
    data.parts = data.parts || []
    data.measures = data.measures || 1
    data.chordProgression = data.chordProgression|| [0]
    return {data, parts: {}, song: this}
}

OMGSong.prototype.keyChanged = function (source) {
    this.onKeyChangeListeners.forEach(listener => listener(this.data.keyParams, source));
};

OMGSong.prototype.beatsChanged = function (source) {
    this.onBeatChangeListeners.forEach(listener => listener(this.data.beatParams, source));
};

OMGSong.prototype.partMuteChanged = function (part, source) {
    this.onPartAudioParamsChangeListeners.forEach(listener => listener(part, source));
};

OMGSong.prototype.chordProgressionChanged = function (source) {
    this.onChordProgressionChangeListeners.forEach(listener => listener(source));
};

OMGSong.prototype.fxChanged = function (action, part, fx, source) {
    this.onFXChangeListeners.forEach(listener => listener(action, part, fx, source));
};


OMGSong.prototype.partChanged = function (part, track, subbeat, value, source) {
    if (this.onPartChangeListeners.length === 0) {
        return
    }
    for (var listener of this.onPartChangeListeners) {
        listener(part, track, subbeat, value, source)
    }
};




OMGSong.prototype.getData = function () {

    var data = this.data
    
    data.parts = []
    data.sections = [];
    
    for (var sectionName in this.sections) {
        var section = this.sections[sectionName]
        section.data.parts = []
        for (var part in section.parts) {
            section.data.parts.push(section.parts[part].data)
        }

        data.sections.push(section.data)
    }

    for (var part in this.parts) {
        data.parts.push(this.parts[part].data)
    }

    return JSON.parse(JSON.stringify(data));
};


OMGSong.prototype.rescale = function () {

    for (var i = 0; i < this.sections.length; i++) {
        this.sections[i].rescale()
    }

}

OMGSong.prototype.setKey = function (rootNote, scale, source) {
    this.data.keyParams.scale = scale;
    this.data.keyParams.rootNote = rootNote;
    this.keyChanged(source);
}

OMGSong.prototype.getUniqueName = function (name, names) {

    if (!names[name]) {
        return name
    }
    
    var ending;
    var i = name.lastIndexOf(" ");
    if (i > -1 && i < name.length) {
        ending = name.substr(i + 1);
        if (!isNaN(ending * 1)) {
            return this.getUniqueName(name.substr(0, i + 1) + (ending * 1 + 1), names);
        }
    }
    return this.getUniqueName(name + " 2", names);
};


OMGSong.prototype.removeSection = function (sectionToRemove) {
    if (!sectionToRemove || !sectionToRemove.data || 
        !this.sections[sectionToRemove.data.name]) {
        return 
    }

    delete this.sections[sectionToRemove.data.name]

    for (var i = this.arrangement.length - 1; i >= 0; i--) {
        if (this.arrangement[i].section === sectionToRemove.data.name) {
            this.arrangement.splice(i, 1)
        }
    }
    // todo check the arrangement data?
    // todo fire change listener
    
}


function OMGSongPart(data) {
    
    this.fx = [];

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
        /*if (this.section.song.data.soundSets && this.section.song.data.soundSets[this.data.name]) {
            this.data.soundSet = this.section.song.data.soundSets[this.data.name]
        }
        else {*/
            this.data.soundSet = {
                name: "Sine Oscillator",
                url: "PRESET_OSC_SINE",
                highNote: 108,
                lowNote: 0,
                chromatic: true,
                octave: 5
            };
        //}
    }

    this.setSoundSet(this.data.soundSet)
    
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

OMGSongPart.prototype.makeAudioParams = function (track, osc) {
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


OMGSongPart.prototype.makeTracks = function () {
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

// one for OMGSong and one for OMGSongPart
OMGSong.prototype.getFX = function (name) {
    for (var ip = 0; ip < this.fx.length; ip++) {
        if (this.fx[ip].data.name === name) {
            return this.fx[ip];
        }
    }
};
OMGSongPart.prototype.getFX = function (name) {
    for (var ip = 0; ip < this.fx.length; ip++) {
        if (this.fx[ip].data.name === name) {
            return this.fx[ip];
        }
    }
};

OMGSongPart.prototype.rescale = function (keyParams, chord) {

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

OMGSongPart.prototype.setSoundSet = function (ss) {

    if (!ss || !ss.data)
        return;

    this.data.soundSet = ss

    var topNote = ss.highNote;
    if (!topNote && ss.data.length) {
        topNote = ss.lowNote + ss.data.length - 1;
    }
    if (!ss.octave) {
        ss.octave = Math.floor((topNote + ss.lowNote) / 2 / 12);
    }

    this.soundUrls = []
    var noteIndex
    for (var i = 0; i < ss.data.length; i++) {
        if (ss.chromatic) {
            noteIndex = i + ss.lowNote
        }
        else {
            noteIndex = i
        }    
        
        if (ss.data[i]) {
            this.soundUrls[noteIndex] = (ss.prefix || "") + ss.data[i].url + (ss.postfix || "");    
        }
    }

    // todo do we really need this? It's used... but shouldn't be
    this.soundSet = ss;
};

OMGSongPart.prototype.getData = function (options) {
    var json = JSON.parse(JSON.stringify(this.data))
    if (options && options.standalone) {
        json.beatParams = JSON.parse(JSON.stringify(this.section.song.data.beatParams))
        json.keyParams = JSON.parse(JSON.stringify(this.section.song.data.keyParams))
    }
    return json
}

OMGSongPart.prototype.change = function (track, subbeat, value) {
    //TODO are we gonna change it?
    this.section.song.partChanged(this, track, subbeat, value)
}