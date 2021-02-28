"use strict";

import OMusicPlayer from "./Player.js"
import OMGSong from "./Song.js"

export default function OMusicContext() {

    // a global variable to reuse the soundsets we've downloaded
    if (!window.omgmusic) {
        window.omgmusic = {
            loadedSounds: {},
            downloadedSoundSets: {}
        }
    }
    
    this.loadedSounds = window.omgmusic.loadedSounds;
    this.downloadedSoundSets = window.omgmusic.downloadedSoundSets;
    
    this.audioContext = this.getAudioContext();
}

OMusicContext.prototype.getAudioContext = function () {
    if (window.omgmusic.audioContext) {
        return window.omgmusic.audioContext;
    }

    if (!window.AudioContext) {
        window.AudioContext = window.webkitAudioContext;
    }

    var context
    try {
        context = new AudioContext();
        if (!context.createGain) {
            context.createGain = context.createGainNode;
        }
    } catch (e) {
        console.warn("no web audio");
        this.disableAudio = true
        return null;
    }

    window.omgmusic.audioContext = context

    return context;
};

OMusicContext.prototype.load = async function (data) {
    var song = new OMGSong(data)
    await this.loadSong(song)

    var player = new OMusicPlayer(this, song)

    return {player, song}
}


OMusicContext.prototype.loadSection = function (section, soundsNeeded) {
    section.currentChordI = 0

    var part;
    for (var partName in section.parts) {
        part = section.parts[partName];
        this.loadPart(part, soundsNeeded);
    }
};

OMusicContext.prototype.loadPartHeader = function (part) {
    if (!part.panner && !this.disableAudio) {
        this.makeAudioNodesForPart(part);
    }

    if (part.data.soundSet.soundFont) {
        part.soundFont = part.data.soundSet.soundFont.name
        part.soundFont = part.soundFont.replace(".js", "")
        if (!part.soundFont.startsWith("_tone_")) {
            part.soundFont = "_tone_" + part.soundFont
        }

        if (!this.downloadedSoundSets[part.data.soundSet.soundFont.url]) {
            var soundfontScriptEl = document.createElement("script")
            soundfontScriptEl.src = part.data.soundSet.soundFont.url
            soundfontScriptEl.onload = e => {
                //todo silently hit every note so it's loaded?
                
                this.getSoundFontPlayer().then(sfPlayer => {
                    sfPlayer.loader.decodeAfterLoading(this.audioContext, part.data.soundSet.soundFont.name);
                })
                
            }
            document.body.appendChild(soundfontScriptEl)
            this.downloadedSoundSets[part.data.soundSet.soundFont.url] = true
        }
    }
}

OMusicContext.prototype.loadPart = function (part, soundsNeeded, onload) {
    var p = this;

    // this will pick up the part header
    if (!part.panner && !this.disableAudio) {
        this.makeAudioNodesForPart(part);
    }

    var download = false;
    if (!soundsNeeded) {
        download = true;
        soundsNeeded = {};
    }
    
    if (part.headPart && part.headPart.soundFont) {
        part.soundFont = part.headPart.soundFontPlayer
    }
    else if (part.data.surface.url === "PRESET_SEQUENCER") {
        this.loadDrumbeat(part, soundsNeeded);
    } else if (part.data.surface.url === "PRESET_MIC") {
        this.loadMic(part)
        download = false
    } else {
        this.loadMelody(part, soundsNeeded);
    }
    
    if (download) {
        let downloadsLeft = Object.keys(soundsNeeded).length

        if (downloadsLeft === 0 && onload) {
            onload()
        }
        for (var sound in soundsNeeded) {
            p.loadSound(sound, () => {
                downloadsLeft--
                if (downloadsLeft === 0 && onload) {
                    onload()
                }
            });
        }
    }
};

OMusicContext.prototype.loadMelody = function (part, soundsNeeded) {
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

OMusicContext.prototype.prepareMelody = function (part, soundsNeeded) {
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

OMusicContext.prototype.loadDrumbeat = function (part, soundsNeeded) {

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
                !this.loadedSounds[tracks[i].sound] &&
                !soundsNeeded[tracks[i].sound]) {
            soundsNeeded[tracks[i].sound] = true;
        }
    }

    if (part.data.soundSet && !part.soundSet) {
        part.soundSet = part.data.soundSet;
    }
};


OMusicContext.prototype.loadURL = function (url, callback) {
    var p = this;
    fetch(url).then(function (response) {
        response.json().then(data => {
            try {
                var song = OMGSong.prototype.make(data);
                p.prepareSong(song, callback);
            }
            catch (e) {
                console.error(e);
            }
        });
    });

};

OMusicContext.prototype.loadSong = function (song) {

    return new Promise((resolve, reject) => {
        // the song could have FX, sound fonts, synths, get all that ready
        this.getAddOnsForSong(song).then(() => {
            console.log("loading2")
            if (!song.madeAudioNodes && !this.disableAudio) {
                this.makeAudioNodesForSong(song);
            }
            
            var soundsNeeded = {};
    
            for (var partName in song.parts) {
                this.loadPartHeader(song.parts[partName]);
            }
    
            for (var sectionName in song.sections) {
                this.loadSection(song.sections[sectionName], soundsNeeded);
            }

            if (Object.keys(soundsNeeded).length === 0 || this.disableAudio) {
                song.loaded = true
                console.log("loadedddd1")
                resolve()
                return true;
            }
    
            for (var sound in soundsNeeded) {
                this.loadSound(sound, function (sound) {
                    delete soundsNeeded[sound];
                    if (Object.keys(soundsNeeded).length === 0) {
                        song.loaded = true
                        console.log("loadedddd2")
                        resolve()
                    }
                });
            }
        })
    })
};


OMusicContext.prototype.addFXToPart = function (fxName, part, source) {
    var fx = this.makeFXNodeForPart(fxName, part.nodes || part)
    if (fx) {
        part.data.fx.push(fx.data);

        part.song.fxChanged("add", part, fx, source);
    }
    return fx;
};

OMusicContext.prototype.removeFXFromPart = function (fx, part, source) {
    var index = part.fx.indexOf(fx);
    
    var connectingNode = part.fx[index - 1]
    connectingNode = connectingNode ? connectingNode.node : part.preFXGain
    var connectedNode = part.fx[index + 1]
    connectedNode = connectedNode ? connectedNode.node : part.postFXGain
    fx.node.disconnect();
    connectingNode.disconnect();
    connectingNode.connect(connectedNode);

    part.fx.splice(index, 1);
    index = part.data.fx.indexOf(fx.data);
    part.data.fx.splice(index, 1);

    part.song.fxChanged("remove", part, fx, source);
};

OMusicContext.prototype.adjustFX = function (fx, part, property, value, source) {
    //todo isAudioParam should be set in this file
    if (fx.isAudioParam) {
        fx[property].setValueAtTime(value, tg.player.context.currentTime);
    }
    else {
        fx[property] = value;
    }
    
    fx.data[property] = value;
    var changes = {}
    changes[property] =  value
    part.song.fxChanged(changes, part, fx, source);
}

OMusicContext.prototype.makeFXNodeForPart = function (fx, nodes) {
    var fxNode, fxData;
    var fxName = fx;
    if (typeof fx === "object") {
        fxName = fx.name;
        fxData = fx;
    }
    
    var fxInfo = this.fxFactory.makeFXNode(fxName, fxData)

    if (fxInfo && fxInfo.node) {
        fxNode = fxInfo.node
        var connectingNode = nodes.fx.length > 0 ? nodes.fx[nodes.fx.length - 1].node : nodes.preFXGain
        connectingNode.disconnect(nodes.postFXGain);
        connectingNode.connect(fxNode);
        fxNode.connect(nodes.postFXGain);
        nodes.fx.push(fxInfo);
    }
    
    return fxInfo;
};

OMusicContext.prototype.runPlayerScript = function () {
    return new Promise((resolve, reject) => {
        if (!typeof OMusicPlayer === "undefined" && !window._omg_omusicplayerscript) {
            window._omg_omusicplayerscript = document.createElement("script")
            window._omg_omusicplayerscript.src = this.scriptPath + "Player.js"
            document.body.appendChild(window._omg_omusicplayerscript)
        }
    
    })
}

OMusicContext.prototype.getSoundFontPlayer = function () {
    return new Promise((resolve, reject) => {
        if (this.soundFontPlayer) {
            resolve(this.soundFontPlayer)
            return
        }

        if (typeof WebAudioFontPlayer !== "undefined") {
            this.soundFontPlayer = new WebAudioFontPlayer()
            resolve(this.soundFontPlayer)
            return
        }

        if (!this.onsoundfontplayerready) {
            var scriptEl = document.createElement("script")
            scriptEl.src = "https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js"
            scriptEl.onload = () => {
                this.soundFontPlayer = new WebAudioFontPlayer()
                this.onsoundfontplayerready.forEach(resolve => {
                    resolve(this.soundFontPlayer)
                })    
            }
            this.onsoundfontplayerready = []
            document.body.appendChild(scriptEl)
        }
        this.onsoundfontplayerready.push(resolve)
    })
    
}

OMusicContext.prototype.getSoundFontPlayer = function () {
    return new Promise((resolve, reject) => {
        if (this.soundFontPlayer) {
            resolve(this.soundFontPlayer)
            return
        }

        if (typeof WebAudioFontPlayer !== "undefined") {
            this.soundFontPlayer = new WebAudioFontPlayer()
            resolve(this.soundFontPlayer)
            return
        }

        if (!this.onsoundfontplayerready) {
            var scriptEl = document.createElement("script")
            scriptEl.src = "https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js"
            scriptEl.onload = () => {
                this.soundFontPlayer = new WebAudioFontPlayer()
                this.onsoundfontplayerready.forEach(resolve => {
                    resolve(this.soundFontPlayer)
                })    
            }
            this.onsoundfontplayerready = []
            document.body.appendChild(scriptEl)
        }
        this.onsoundfontplayerready.push(resolve)
    })
    
}

OMusicContext.prototype.getFXFactory = function () {
    return new Promise((resolve, reject) => {
        if (this.fxFactory) {
            resolve(this.fxFactory)
            return
        }

        if (typeof OMGAudioFX !== "undefined") {
            this.fxFactory = new OMGAudioFX(this, () => {
                resolve(this.fxFactory)    
            })
            return
        }

        if (!this.onfxfactoryready) {
            var scriptEl = document.createElement("script")
            scriptEl.src = "/apps/music/js/fxfactory.js"
            scriptEl.onload = () => {
                this.fxFactory = new OMGAudioFX(this, () => {
                    this.onfxfactoryready.forEach(resolve => {
                        resolve(this.fxFactory)
                    })    
                })
            }
            this.onfxfactoryready = []
            document.body.appendChild(scriptEl)
        }
        this.onfxfactoryready.push(resolve)
    })
    
}

OMusicContext.prototype.getAddOnsForSong = function (song) {

    var hasFX
    var hasSoundFont
    if (song.data.fx && song.data.fx.length > 0) {
        hasFX = true
    }
    for (var part of song.data.parts) {
        if (part.fx && part.fx.length > 0) {
            hasFX = true
        }
        if (part.soundSet.soundFont) {
            hasSoundFont = true
        }
    }

    var addOns = []
    if (hasFX) {
        addOns.push(this.getFXFactory())
    }
    if (hasSoundFont) {
        addOns.push(this.getSoundFontPlayer())
    }
    console.log(addOns)
    return Promise.all(addOns)
}


OMusicContext.prototype.makeOsc = function (type) {
    
    if (!this.audioContext) {
        return;
    }

    var osc = this.audioContext.createOscillator()

    if (type.indexOf("SAW") > -1) {
        osc.type = "sawtooth";
    } else if (type.indexOf("SINE") > -1) {
        osc.type = "sine";
    } else if (type.indexOf("SQUARE") > -1) {
        osc.type = "square";
    }
    else if (type.indexOf("TRIANGLE") > -1) {
        osc.type = "triangle";
    }

    osc.frequency.setValueAtTime(0, this.audioContext.currentTime);
    osc.start(this.audioContext.currentTime);

    osc.finishPart = function () {
        
        osc.frequency.setValueAtTime(0, this.nextBeatTime);
        //todo keep freq same, reduce volume
        
        //total hack, this is why things should be processed ala AudioContext, not our own thread
        /*setTimeout(function () {
            osc.stop(p.context.currentTime);
            osc.disconnect(preFXGain);

            oscStarted = false;
            osc = null;
            gain = null;
        }, 50);*/
    };

    return osc
};

OMusicContext.prototype.makeSynth = function (patchData, nodes, partData) {

    // todo download??
    if (typeof Synth === "undefined") {
        return //todo faill back? this.makeOsc()
    }

    let synth = new Synth(this.audioContext, patchData)
    let patch = patchLoader.load(patchData)
    synth.loadPatch(patch.instruments.synth)
    synth.outputNode.connect(nodes.preFXGain)

    // the synth has built in fx
    // transfer these to the fx of the part, so the user can change them
    var fx = patchData.daw.fx || []
    fx.forEach((fxData) => {
        partData.fx.push(fxData)
        this.makeFXNodeForPart(fxData, nodes);
    })
    delete patchData.daw.fx

    //todo if (patch.masterVolume) 

    return {synth, fx}
}



OMusicContext.prototype.loadSound = function (sound, onload) {
    var p = this;

    if (!sound || !p.audioContext || p.disableAudio) {
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
            p.audioContext.decodeAudioData(buffer, function (buffer) {
                p.loadedSounds[key] = buffer;
                buffer.omgIsMP3 = url.toLowerCase().endsWith(".mp3");
                onload(key);
            }, function () {
                console.warn("error loading sound url: " + url);
                onload(key);
            });
        }
    });
};

OMusicContext.prototype.downloadSound = function (url, key, onload, secondTry) {
    var p = this;
    var request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
        var data = request.response.slice(0);
        p.audioContext.decodeAudioData(request.response, function (buffer) {
            p.loadedSounds[key] = buffer;
            buffer.omgIsMP3 = url.toLowerCase().endsWith(".mp3")
            onload(key);
            if (omg.util) {
                omg.util.saveSound(key, data);
            }
        }, function () {
            console.warn("error loading sound url: " + url);
            onload(key);
        });
    }
    request.onerror = function (e) {
        if (secondTry) {
            return;
        }

        url = "https://cors-anywhere.herokuapp.com/" + url;
        p.downloadSound(url, key, onload, true);
    }
    request.send();
};



OMusicContext.prototype.rescaleSection = function (section, chord) {
    if (typeof chord !== "number") {
        chord = section.data.chordProgression[this.section.currentChordI];
    }
    var p = this;
    for (var partName in section.parts) {
        var part = section.parts[partName]
        if (part.data.surface.url === "PRESET_VERTICAL" && part.data.soundSet.chromatic) {
            p.rescale(part, section.song.data.keyParams, chord || 0);
        }
    }
    section.chord = chord;
};

OMusicContext.prototype.rescaleSong = function (rootNote, ascale, chord) {
    var p = this;
    var song = this.song.data;
    if (rootNote != undefined) {
        song.rootNote = rootNote;
    }
    if (ascale != undefined) {
        song.ascale = ascale;
    }
    for (var sectionName in this.song.sections) {
        p.rescaleSection(this.song.sections[sectionName], chord || 0);
    }
};

OMusicContext.prototype.rescale = function (part, keyParams, chord, soundsNeeded) {
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
                !this.loadedSounds[onote.sound] &&
                !soundsNeeded[onote.sound]) {
            soundsNeeded[onote.sound] = true;
        }
    }
};


OMusicContext.prototype.makeAudioNodesForPart = function (part) {

    var nodes

    // if there's a head part, use its nodes
    if (part.headPart) {
        nodes = part.headPart.nodes
    }
    else {
        nodes = {}
        nodes.fx = []
        nodes.panner = this.audioContext.createStereoPanner(); 
        nodes.gain = this.audioContext.createGain();
        nodes.preFXGain = this.audioContext.createGain();
        nodes.postFXGain = nodes.gain;
        nodes.preFXGain.connect(nodes.postFXGain);
        nodes.gain.connect(nodes.panner);
        nodes.panner.connect(part.song.preFXGain);
        nodes.gain.gain.setValueAtTime(part.data.audioParams.gain, this.audioContext.currentTime);
        nodes.panner.pan.setValueAtTime(part.data.audioParams.pan, this.audioContext.currentTime);

        for (var i = 0; i < part.data.fx.length; i++) {
            this.makeFXNodeForPart(part.data.fx[i], nodes);        
        }
        
        if (part.data.soundSet.url && part.data.soundSet.url.startsWith("PRESET_OSC")) {
            nodes.osc = this.makeOsc(part.data.soundSet.url);
            nodes.osc.connect(nodes.preFXGain)
        }
        else if (part.data.soundSet.patch) {
            let synth = this.makeSynth(part.data.soundSet.patch, nodes, part.data)
            nodes.synth = synth.synth
        }
    }

    part.nodes = nodes
    part.panner = nodes.panner
    part.gain = nodes.gain
    part.preFXGain = nodes.preFXGain
    part.postFXGain = part.gain;
    part.osc = nodes.osc
    part.synth = nodes.synth
    part.fx = nodes.fx

    if (part.onnodesready) {
        part.onnodesready()
    }
};

OMusicContext.prototype.makeAudioNodesForSong = function (song) {
    var p = this;
    song.preFXGain = p.audioContext.createGain();
    song.postFXGain = p.audioContext.createGain();
    song.preFXGain.connect(song.postFXGain);
    song.postFXGain.connect(p.audioContext.destination);
        
    if (song.data.fx) {
        for (var i = 0; i < song.data.fx.length; i++) {
            p.makeFXNodeForPart(song.data.fx[i], song);        
        }
    }    
    song.madeAudioNodes = true;
};

OMusicContext.prototype.updatePartVolumeAndPan = function (part) {

    //todo umm?
    if (part.gain && part.osc) {
        //var oscGain = (part.osc.soft ? 1 : 2) * part.data.volume / 10;
        part.gain.gain.setValueAtTime(Math.pow(part.data.volume, 2), this.audioContext.currentTime);
    }
    if (part.bufferGain) {
        part.bufferGain.gain.setValueAtTime(Math.pow(part.data.volume, 2), this.audioContext.currentTime);
    }
    if (part.panner) {
        part.panner.pan.setValueAtTime(part.data.pan, this.audioContext.currentTime);
    }

};



OMusicContext.prototype.mutePart = function (part, mute) {
    part.data.audioParams.mute = mute || false;
    part.song.partMuteChanged(part);

    if (part.osc && part.data.audioParams.mute) {
        part.preFXGain.gain.cancelScheduledValues(this.audioContext.currentTime)
        part.preFXGain.gain.setValueAtTime(0, this.audioContext.currentTime)
    }
    if (part.inputSource) {
        if (part.data.audioParams.mute) {
            part.inputSource.disconnect(part.preFXGain)
        }
        else {
            part.inputSource.connect(part.preFXGain)
        }
    }
};

OMusicContext.prototype.getSound = function (part, soundName) {
    if (typeof part === "string") {

        part = this.getPart(part);
        if (!part) {
            return;
        }
    }
    
    var p = this
    if (part.data.tracks) {
        for (var i = 0; i < part.data.tracks.length; i++) {
            if (part.data.tracks[i].name === soundName) {
                
                return {
                    play: function () {
                        this.source = p.playSound(part.data.tracks[i].sound, part);
                    },
                    stop: function () {
                        this.source.stop()
                    },
                    getBuffer: function () {
                        let sound = part.data.tracks[i].sound
                        if (p.loadedSounds[sound] &&
                            p.loadedSounds[sound] !== "loading") {
                
                            return p.loadedSounds[sound];
                        }
                    }
                };
            }
        }
    }
};

OMusicContext.prototype.getPart = function (partName) {
    for (var i = 0; i < this.section.parts.length; i++) {
        if (this.section.parts[i].data.name === partName) {
            return this.section.parts[i];
        }
    }
};

OMusicContext.prototype.loadMic = function (part) {
    if (!this.allowMic) {
        return
    }
    var p = this
    navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
        part.inputSource = p.audioContext.createMediaStreamSource(stream)
        if (!part.data.audioParams.mute) {
            part.inputSource.connect(part.preFXGain)
        }
        if (part.onmediastream) {
            part.onmediastream()
            part.onmediastream = undefined
        }
    })
}

OMusicContext.prototype.disconnectMic = function (part) {
    if (!part.inputSource) {
        return
    }
    try {
        part.inputSource.disconnect(part.preFXGain)
    }
    catch (e) {}
    part.inputSource.mediaStream.getTracks().forEach(function(track) {
        track.stop();
    });
}