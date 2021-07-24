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
    var song = new OMGSong(this, data)
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

    if (part.data.soundSet.soundFont && part.data.soundSet.soundFont.name) {
        part.soundFont = part.data.soundSet.soundFont.name
        part.soundFont = part.soundFont.replace(".js", "")
        if (!part.soundFont.startsWith("_tone_")) {
            part.soundFont = "_tone_" + part.soundFont
        }

        let url = part.data.soundSet.soundFont.url
        let name = part.soundFont //part.data.soundSet.soundFont.name
            
        if (!this.downloadedSoundSets[url]) {
            this.downloadedSoundSets[url] = true
            
            return new Promise((resolve, reject) => {
            
                this.getSoundFontPlayer().then(sfPlayer => {        
                    sfPlayer.loader.startLoad(this.audioContext, url, name);
                    sfPlayer.loader.waitLoad(() => {
                        sfPlayer.loader.decodeAfterLoading(this.audioContext, name)
                        resolve()
                    })
                })

            })
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
        this.rescale(part, part.section.song.data.keyParams, chord, soundsNeeded);
        
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

OMusicContext.prototype.loadSong = async function (song) {

    return new Promise((resolve, reject) => {
        // the song could have FX, sound fonts, synths, get all that ready
        this.getAddOnsForSong(song).then(() => {
            if (!song.madeAudioNodes && !this.disableAudio) {
                this.makeAudioNodesForSong(song);
            }
            
            var soundsNeeded = {}
            var promises = []
    
            for (var partName in song.parts) {
                promises.push(this.loadPartHeader(song.parts[partName]));
            }
    
            for (var sectionName in song.sections) {
                promises.push(this.loadSection(song.sections[sectionName], soundsNeeded));
            }
            
            for (var sound in soundsNeeded) {
                promises.push(this.loadSound(sound));
            }
            Promise.all(promises).then(()=>resolve())

        })
    })
};


OMusicContext.prototype.addFXToPart = function (fxName, part, source) {
    var fx = this.makeFXNodeForPart(fxName, part.nodes || part)
    if (fx) {
        part.data.fx.push(fx.data);

        if (part.song) {
            part.song.fxChanged("add", part, fx, source);
        }
        else {
            // todo probably added FX to the master track (song itself)
        }
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

    if (part.song) {
        part.song.fxChanged("remove", part, fx, source);
    }
    else {
        // master fx
    }
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
        if (part.soundSet && part.soundSet.soundFont) {
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

OMusicContext.prototype.makeSynth = async function (patchData, nodes, partData) {

    await this.getFXFactory()
    var {Synth, patchLoader} = await import("./libs/viktor/viktor.js")
    
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

    return synth
}



OMusicContext.prototype.loadSound = function (sound) {
    if (!sound || !this.audioContext || this.disableAudio) {
        return;
    }
    var key = sound;
    var url = sound;

    if (this.loadedSounds[key]) {
        return;
    }
    
    if (url.startsWith("http:") && !window.location.protocol.startsWith("file:")) {
        url = sound.slice(5);
    }

    this.loadedSounds[key] = "loading";

    return new Promise((resolve, reject) => {
        this.getSavedSound(key, buffer => {
            if (buffer) {
                this.audioContext.decodeAudioData(buffer, (buffer) => {
                    this.loadedSounds[key] = buffer;
                    buffer.omgIsMP3 = url.toLowerCase().endsWith(".mp3");
                    resolve(key);
                }, function () {
                    console.warn("error loading sound url: " + url);
                    resolve(key);
                });
            }
            else {
                this.downloadSound(url, key, () => {
                    resolve(key)   
                });
            }
        })
    })
    
};

OMusicContext.prototype.downloadSound = function (url, key, onload, secondTry) {
    var request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = () => {
        var data = request.response.slice(0);
        this.audioContext.decodeAudioData(request.response, (buffer) => {
            this.loadedSounds[key] = buffer;
            buffer.omgIsMP3 = url.toLowerCase().endsWith(".mp3")
            onload(key);
            this.saveSound(key, data);
        }, () => {
            console.warn("error loading sound url: " + url);
            onload(key);
        });
    }
    request.onerror = (e) => {
        if (secondTry) {
            return;
        }

        url = "https://cors-anywhere.herokuapp.com/" + url;
        this.downloadSound(url, key, onload, true);
    }
    request.send();
};



OMusicContext.prototype.rescaleSection = function (section, chord) {
    if (typeof chord !== "number") {
        chord = section.data.chordProgression[section.currentChordI];
    }
    for (var partName in section.parts) {
        var part = section.parts[partName]
        if (part.data.surface.url === "PRESET_VERTICAL" && part.data.soundSet.chromatic) {
            this.rescale(part, section.song.data.keyParams, chord || 0);
        }
    }
    section.chord = chord;
};

OMusicContext.prototype.rescaleSong = function (song, rootNote, ascale, chord) {
    //todo update this stuff, rigt?
    /*if (rootNote != undefined) {
        song.rootNote = rootNote;
    }
    if (ascale != undefined) {
        song.ascale = ascale;
    }*/
    for (var sectionName in song.sections) {
        this.rescaleSection(song.sections[sectionName], chord || 0);
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

        if (part.data.soundSet.chromatic) {
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

            onote.scaledNote = keyParams.scale[newNote] + octaves2 * 12 + 
                    octave * 12 + keyParams.rootNote;

            // move down if to high 
            while (part.soundUrls && onote.scaledNote >= part.soundUrls.length && onote.scaledNote > 12) {
                onote.scaledNote -= 12
            }
            //todo too low?
        }
        else {
            onote.scaledNote = onote.note
        }
        
        // todo this does the work of prepare melody... maybe it shouldn't be here
        // then this wouldn't need to be called for non-chromatic parts
        if (soundsNeeded && part.soundUrls) {
            var url = part.soundUrls[onote.scaledNote]
            
            if (url && !this.loadedSounds[url] && !soundsNeeded[url]) {
                soundsNeeded[url] = true;
            }
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
            this.makeSynth(part.data.soundSet.patch, nodes, part.data).then(synth => {
                part.synth = synth
            })
            
        }
    }

    part.nodes = nodes
    part.panner = nodes.panner
    part.gain = nodes.gain
    part.preFXGain = nodes.preFXGain
    part.postFXGain = part.gain;
    part.osc = nodes.osc
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

OMusicContext.prototype.loadSoundsFromSoundSet = function (soundSet) {
    for (var i = 0; i < soundSet.data.length; i++) {
        this.loadSound((soundSet.prefix || "") + soundSet.data[i].url + 
            (soundSet.postfix || ""));
    }
};

OMusicContext.prototype.getSavedSound = function (sound, callback) {
    if (this.noDB) {
        callback();
        return;
    }
    try {
    var request = indexedDB.open("omg_sounds", 1);
    request.onupgradeneeded = function (e) {
        var db = e.target.result;
        db.createObjectStore("saved_sounds");
    };
    request.onsuccess = function(e) {
        var db = e.target.result;
        var trans = db.transaction("saved_sounds");
        var request = trans.objectStore("saved_sounds").get(sound);
        request.onsuccess = function (e) {
            callback(request.result);
        }
    };
    request.onerror = function (e) {
        this.noDB = true;
        callback();
    };
    } catch (e) {
        console.warn("getSavedSound threw an error", e);
        this.noDB = true;
        callback();
    }
};

OMusicContext.prototype.saveSound = function (sound, data) {
    if (this.noDB) return;
    try {
    indexedDB.open("omg_sounds").onsuccess = function(e) {
        var db = e.target.result;
        var trans = db.transaction(["saved_sounds"], "readwrite");
        trans.objectStore("saved_sounds").put(data, sound);
    };
    } catch (e) {console.error(e);}
};


OMusicContext.prototype.keys = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];

OMusicContext.prototype.scales = [{name: "Major", value: [0, 2, 4, 5, 7, 9, 11]},
        {name: "Minor", value: [0, 2, 3, 5, 7, 8, 10]},
        {name: "Pentatonic", value: [0, 2, 5, 7, 9]},
        {name: "Blues", value: [0, 3, 5, 6, 7, 10]},
        {name: "Harmonic Minor", value: [0, 2, 3, 5, 7, 8, 11]},
        {name: "Mixolydian", value: [0, 2, 4, 5, 7, 9, 10]},
        {name: "Chromatic", value: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
    ];

OMusicContext.prototype.noteNames = ["C-", "C#-", "D-", "Eb-", "E-", "F-", "F#-", "G-", "G#-", "A-", "Bb-", "B-",
    "C0", "C#0", "D0", "Eb0", "E0", "F0", "F#0", "G0", "G#0", "A0", "Bb0", "B0",
    "C1", "C#1", "D1", "Eb1", "E1", "F1", "F#1", "G1", "G#1", "A1", "Bb1", "B1",
    "C2", "C#2", "D2", "Eb2", "E2", "F2", "F#2", "G2", "G#2", "A2", "Bb2", "B2",
    "C3", "C#3", "D3", "Eb3", "E3", "F3", "F#3", "G3", "G#3", "A3", "Bb3", "B3",
    "C4", "C#4", "D4", "Eb4", "E4", "F4", "F#4", "G4", "G#4", "A4", "Bb4", "B4",
    "C5", "C#5", "D5", "Eb5", "E5", "F5", "F#5", "G5", "G#5", "A5", "Bb5", "B5",
    "C6", "C#6", "D6", "Eb6", "E6", "F6", "F#6", "G6", "G#6", "A6", "Bb6", "B6",
    "C7", "C#7", "D7", "Eb7", "E7", "F7", "F#7", "G7", "G#7", "A7", "Bb7", "B7",
    "C8"];

OMusicContext.prototype.getKeyCaption = function (keyParams) {
    var scaleName = "Major";
    if (keyParams && keyParams.scale) {
        this.scales.forEach(function (scale) {
            if (scale.value.join() == keyParams.scale.join())
                scaleName = scale.name;
        });
    }
    return this.keys[(keyParams.rootNote || 0)] + " " + scaleName;
};