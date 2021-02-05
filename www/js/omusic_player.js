(function () {
    if (window._omg_doNotAutoLoadMusicScripts) {
        return
    }

    let el
    let dir = document.currentScript.src.substr(0, document.currentScript.src.lastIndexOf("/") + 1)

    let loadMusicScripts = () => {
        if (!omg.music) {
            el = document.createElement("script")
            el.src = dir + "omgservice_music.js"
            document.body.appendChild(el)
        }
    
        if (typeof OMGSong === "undefined") {
            el = document.createElement("script")
            el.src = dir + "omgclasses.js"
            document.body.appendChild(el)
        }
    
        if (typeof Tuna === "undefined") {
            el = document.createElement("script")
            el.src = dir + "libs/tuna-min.js"
            document.body.appendChild(el)
        }
    
        if (typeof OMusicPlayerFX === "undefined") {
            el = document.createElement("script")
            el.src = dir + "fx.js"
            document.body.appendChild(el)
        }
    
        if (typeof Synth === "undefined") {
            el = document.createElement("script")
            el.src = dir + "libs/viktor/viktor.js"
            document.body.appendChild(el)
        }
    
    }

    if (typeof omg !== "object") {
        el = document.createElement("script")
        el.src = dir + "../../../js/omgservice.js"
        document.body.appendChild(el)
        el.onload = e => {
            loadMusicScripts()
        }
    }
    else {
        loadMusicScripts()
    }

})()


function OMusicPlayer() {

    var p = this;

    p.dev = omg.dev;

    p.playing = false;
    
    if (!omg.loadedSounds) omg.loadedSounds = {};
    if (!omg.downloadedSoundSets) omg.downloadedSoundSets = {};
    p.loadedSounds = omg.loadedSounds;
    p.downloadedSoundSets = omg.downloadedSoundSets;
    
    p.latency = 20;
    p.latencyMonitor = 0;
    p.mp3PlayOffset = 0.052
    
    p.context = p.getAudioContext();
    p.tuna = omg.tuna;

    if (typeof WebAudioFontPlayer !== "undefined") {
        p.soundFontPlayer = new WebAudioFontPlayer();
        p.soundFontPlayer.loader.decodeAfterLoading(p.context, '_tone_0250_SoundBlasterOld_sf2');
    }
    
    this.auditioningParts = [];

    p.onBeatPlayedListeners = [];
    p.onPlayListeners = [];

    p.iSubBeat = 0;
    p.loopStarted = 0;

    p.nextUp = null;

    p.loopSection = -1;
    
    // TODO make loading FX optional, if there's no FX, don't get them
    if (p.setupFX) {
        p.setupFX();
    }
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
    } catch (e) {
        console.warn("no web audio");
        this.disableAudio = true
        return null;
    }

    if (typeof Tuna === "undefined") {
        console.warn("omusic_player wants Tuna.js!")
    }
    else {
        omg.tuna = new Tuna(omg.audioContext);
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
    p.songStarted = p.loopStarted

    p.iSubBeat = 0;
    
    p.nextBeatTime = p.context.currentTime + (p.latency / 1000);
    p.nextCommandI = 0

    p.section.currentChordI = 0;
    p.rescaleSection(p.section, p.section.data.chordProgression[0]);

    if (typeof (p.onPlay) == "function") {
        // should use the listeners array, but still here because its used
        p.onPlay(p);
    }
    for (var il = 0; il < p.onPlayListeners.length; il++) {
        try {
            p.onPlayListeners[il].call(null, true);
        } catch (ex) {
            console.error(ex);
        }
    }

    this._play();
};

OMusicPlayer.prototype._play = function () {
    var p = this;
    var beatParams = p.song.data.beatParams;

    if (!p.playing)
        return;

    if (p.stopOnNextBeat) {
        p.stopOnNextBeat = false
        p.stop()
        return
    }

    p.subbeatLength = 1000 / (beatParams.bpm / 60 * beatParams.subbeats);

    if (p.loopSection > -1 && p.loopSection < p.song.sections.length) {
        p.section = p.song.sections[p.loopSection];
        p.sectionI = p.loopSection;
    }
    
    if (p.section.chord !== p.section.data.chordProgression[p.section.currentChordI]) {
        p.rescaleSection(p.section, p.section.data.chordProgression[p.section.currentChordI]);
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

        //this is autolatenecy
        //if we're late, increase the latency (until 250ms)
        //if we're not late, decrease it 1ms (until 20ms)
        if (p.negativeLatencyCounter > 0) {
            if (p.latency < 250) {
                p.latency += 5;
            }
        }
        else if (p.latency > 20) {
            p.latency--;
        }
        p.negativeLatencyCounter = 0;
    }

    if (p.playing) {
        setTimeout(function () {p._play();}, (p.nextBeatTime - p.context.currentTime) * 1000 - p.latency)

        if (p.song.data.commandList && p.song.data.commandList[p.nextCommandI]) {
            if (p.song.data.commandList[p.nextCommandI].t <= Date.now() - p.songStarted) {
                p.processCommand(p.song.data.commandList[p.nextCommandI])
                p.nextCommandI++
            }
        }
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
        p.section.currentChordI++;
        if (p.section.currentChordI < p.section.data.chordProgression.length) {
            nextChord = true;
        }
        else {
            p.section.currentChordI = 0;
        }
        if (p.section.chord !== p.section.data.chordProgression[p.section.currentChordI]) {
            p.rescaleSection(p.section, p.section.data.chordProgression[p.section.currentChordI]);
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
        if (p.onloop) p.onloop()
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
                p.stopOnNextBeat = true
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

OMusicPlayer.prototype.loadSection = function (section, soundsNeeded) {
    section.currentChordI = 0

    var part;
    for (var ipart = 0; ipart < section.parts.length; ipart++) {
        part = section.parts[ipart];
        this.loadPart(part, soundsNeeded);
    }
};

OMusicPlayer.prototype.loadPart = function (part, soundsNeeded, onload) {
    var p = this;

    if (!part.panner && !this.disableAudio) {
        this.makeAudioNodesForPart(part);
    }

    var download = false;
    if (!soundsNeeded) {
        download = true;
        soundsNeeded = {};
    }

    if (part.data.surface.url === "PRESET_SEQUENCER") {
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
                var song = OMGSong.prototype.make(data);
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
    
    if (!song.madeAudioNodes && !this.disableAudio) {
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
            p.section = song.sections[0]
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
    } 
    else if (part.data.surface.url === "PRESET_MIC") {
        //nothing to do
    } else {
        p.playBeatForMelody(iSubBeat, part);
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

OMusicPlayer.prototype.makeOsc = function (type) {
    
    if (!this.context) {
        return;
    }

    var osc = this.context.createOscillator()

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

    osc.frequency.setValueAtTime(0, this.context.currentTime);
    osc.start(this.context.currentTime);

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

OMusicPlayer.prototype.makeSynth = function (patchData, nodes, partData) {

    // todo download??
    if (typeof Synth === "undefined") {
        return //todo faill back? this.makeOsc()
    }

    let synth = new Synth(this.context, patchData)
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
                buffer.omgIsMP3 = url.toLowerCase().endsWith(".mp3");
                onload(key);
            }, function () {
                console.warn("error loading sound url: " + url);
                onload(key);
            });
        }
    });
};

OMusicPlayer.prototype.downloadSound = function (url, key, onload, secondTry) {
    var p = this;
    var request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
        var data = request.response.slice(0);
        p.context.decodeAudioData(request.response, function (buffer) {
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


OMusicPlayer.prototype.playNote = function (note, part) {
    var p = this;
    
    var fromNow = (note.beats * 4 * p.subbeatLength) / 1000;

    if (!note || note.rest) {
        if (part.osc) {
            part.preFXGain.gain.setTargetAtTime(0, p.context.currentTime, 0.003);
        }
        return;
    }

    if (part.synth) {
        part.baseFrequency = p.makeFrequency(note.scaledNote);
        var noteFrequency = part.baseFrequency * part.data.audioParams.warp
        part.synth.onNoteOn(noteFrequency, 100)
        
        setTimeout(function () {
            part.synth.onNoteOff(noteFrequency)
        }, p.song.data.beatParams.subbeats * note.beats * p.subbeatLength * 0.85);
    }
    else if (part.osc) {
        part.baseFrequency = p.makeFrequency(note.scaledNote);
        part.preFXGain.gain.setTargetAtTime(part.data.audioParams.gain, p.nextBeatTime - 0.003, 0.003);
        part.osc.frequency.setValueAtTime(part.baseFrequency * part.data.audioParams.warp, p.nextBeatTime);
        part.playingI = part.currentI;
        var playingI = part.playingI;
        
        //this should be a timeout so it can be canceled if
        //a different note has played
        setTimeout(function () {
            if (part.osc && part.playingI === playingI) {
                part.preFXGain.gain.setTargetAtTime(0, p.context.currentTime, 0.003);
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

        source.start(p.nextBeatTime, source.buffer.omgIsMP3 ? p.mp3PlayOffset : 0);
        
        return source;
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
        chord = section.data.chordProgression[this.section.currentChordI];
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

    if (this.context && this.context.state === "suspended")
        this.context.resume();
    
    if (part.liveNotes && part.liveNotes.liveAudio) {
            part.liveNotes.liveAudio.bufferGain.gain.setTargetAtTime(0, this.context.currentTime, 0.001);
            part.liveNotes.liveAudio.stop(this.context.currentTime + 0.015);
    }
    if (part.synth && part.synth.lastFrequency) {
        part.synth.onNoteOff(part.synth.lastFrequency)
        part.synth.lastFrequency = 0
    }
    
    part.liveNotes = notes;
    if (!notes.autobeat) {
        part.playingI = -1;
        if (this.disableAudio) {
            //silence
        }
        else if (part.osc) {
            part.baseFrequency = this.makeFrequency(notes[0].scaledNote);
            part.osc.frequency.setValueAtTime(
                    part.baseFrequency * part.data.audioParams.warp, this.context.currentTime);
            part.preFXGain.gain.setTargetAtTime(part.data.audioParams.gain, this.context.currentTime, 0.003);
        }
        else if (part.synth) {
            part.baseFrequency = this.makeFrequency(notes[0].scaledNote);
            part.synth.lastFrequency = part.baseFrequency * part.data.audioParams.warp
            part.synth.onNoteOn(part.synth.lastFrequency, 100)
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
        if (!this.disableAudio && !this.playing && this.auditioningParts.indexOf(part) == -1) {
            this.auditionPart(part);
        }
        
    }
};

OMusicPlayer.prototype.endLiveNotes = function (part) {
  
    if (part.synth && part.synth.lastFrequency) {
        part.synth.onNoteOff(part.synth.lastFrequency)
        part.synth.lastFrequency = 0
    }
    else if (part.osc) {
        part.preFXGain.gain.setTargetAtTime(0,
                this.context.currentTime, 0.003);
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
    part.section.song.partChanged(part)

};

OMusicPlayer.prototype.makeAudioNodesForPart = function (part) {

    var nodes

    // is this part already in the song?
    if (part.section.song.partNodes[part.data.name]) {
        nodes = part.section.song.partNodes[part.data.name]
    }
    else {
        nodes = {}
        nodes.fx = []
        nodes.panner = this.context.createStereoPanner(); 
        nodes.gain = this.context.createGain();
        nodes.preFXGain = this.context.createGain();
        nodes.postFXGain = nodes.gain;
        nodes.preFXGain.connect(nodes.postFXGain);
        nodes.gain.connect(nodes.panner);
        nodes.panner.connect(part.section.song.preFXGain);
        nodes.gain.gain.setValueAtTime(part.data.audioParams.gain, this.context.currentTime);
        nodes.panner.pan.setValueAtTime(part.data.audioParams.pan, this.context.currentTime);

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

        part.section.song.partNodes[part.data.name] = nodes
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


OMusicPlayer.prototype.getSoundSetForSoundFont = function (name, url) {
  return {"name": name,  "prefix": url, "url": url,
            "type": "SOUNDSET", "soundFont": true, "lowNote": 21, "postfix": "", "chromatic": true, "defaultSurface": "PRESET_VERTICAL", "data": [ { "url": "A0.mp3", "name": "A0" }, { "url": "Bb0.mp3", "name": "Bb0" }, { "url": "B0.mp3", "name": "B0" }, { "url": "C1.mp3", "name": "C1" }, { "url": "Db1.mp3", "name": "Db1" }, { "url": "D1.mp3", "name": "D1" }, { "url": "Eb1.mp3", "name": "Eb1" }, { "url": "E1.mp3", "name": "E1" }, { "url": "F1.mp3", "name": "F1" }, { "url": "Gb1.mp3", "name": "Gb1" }, { "url": "G1.mp3", "name": "G1" }, { "url": "Ab1.mp3", "name": "Ab1" }, { "url": "A1.mp3", "name": "A1" }, { "url": "Bb1.mp3", "name": "Bb1" }, { "url": "B1.mp3", "name": "B1" }, { "url": "C2.mp3", "name": "C2" }, { "url": "Db2.mp3", "name": "Db2" }, { "url": "D2.mp3", "name": "D2" }, { "url": "Eb2.mp3", "name": "Eb2" }, { "url": "E2.mp3", "name": "E2" }, { "url": "F2.mp3", "name": "F2" }, { "url": "Gb2.mp3", "name": "Gb2" }, { "url": "G2.mp3", "name": "G2" }, { "url": "Ab2.mp3", "name": "Ab2" }, { "url": "A2.mp3", "name": "A2" }, { "url": "Bb2.mp3", "name": "Bb2" }, { "url": "B2.mp3", "name": "B2" }, { "url": "C3.mp3", "name": "C3" }, { "url": "Db3.mp3", "name": "Db3" }, { "url": "D3.mp3", "name": "D3" }, { "url": "Eb3.mp3", "name": "Eb3" }, { "url": "E3.mp3", "name": "E3" }, { "url": "F3.mp3", "name": "F3" }, { "url": "Gb3.mp3", "name": "Gb3" }, { "url": "G3.mp3", "name": "G3" }, { "url": "Ab3.mp3", "name": "Ab3" }, { "url": "A3.mp3", "name": "A3" }, { "url": "Bb3.mp3", "name": "Bb3" }, { "url": "B3.mp3", "name": "B3" }, { "url": "C4.mp3", "name": "C4" }, { "url": "Db4.mp3", "name": "Db4" }, { "url": "D4.mp3", "name": "D4" }, { "url": "Eb4.mp3", "name": "Eb4" }, { "url": "E4.mp3", "name": "E4" }, { "url": "F4.mp3", "name": "F4" }, { "url": "Gb4.mp3", "name": "Gb4" }, { "url": "G4.mp3", "name": "G4" }, { "url": "Ab4.mp3", "name": "Ab4" }, { "url": "A4.mp3", "name": "A4" }, { "url": "Bb4.mp3", "name": "Bb4" }, { "url": "B4.mp3", "name": "B4" }, { "url": "C5.mp3", "name": "C5" }, { "url": "Db5.mp3", "name": "Db5" }, { "url": "D5.mp3", "name": "D5" }, { "url": "Eb5.mp3", "name": "Eb5" }, { "url": "E5.mp3", "name": "E5" }, { "url": "F5.mp3", "name": "F5" }, { "url": "Gb5.mp3", "name": "Gb5" }, { "url": "G5.mp3", "name": "G5" }, { "url": "Ab5.mp3", "name": "Ab5" }, { "url": "A5.mp3", "name": "A5" }, { "url": "Bb5.mp3", "name": "Bb5" }, { "url": "B5.mp3", "name": "B5" }, { "url": "C6.mp3", "name": "C6" }, { "url": "Db6.mp3", "name": "Db6" }, { "url": "D6.mp3", "name": "D6" }, { "url": "Eb6.mp3", "name": "Eb6" }, { "url": "E6.mp3", "name": "E6" }, { "url": "F6.mp3", "name": "F6" }, { "url": "Gb6.mp3", "name": "Gb6" }, { "url": "G6.mp3", "name": "G6" }, { "url": "Ab6.mp3", "name": "Ab6" }, { "url": "A6.mp3", "name": "A6" }, { "url": "Bb6.mp3", "name": "Bb6" }, { "url": "B6.mp3", "name": "B6" }, { "url": "C7.mp3", "name": "C7" }, { "url": "Db7.mp3", "name": "Db7" }, { "url": "D7.mp3", "name": "D7" }, { "url": "Eb7.mp3", "name": "Eb7" }, { "url": "E7.mp3", "name": "E7" }, { "url": "F7.mp3", "name": "F7" }, { "url": "Gb7.mp3", "name": "Gb7" }, { "url": "G7.mp3", "name": "G7" }, { "url": "Ab7.mp3", "name": "Ab7" }, { "url": "A7.mp3", "name": "A7" }, { "url": "Bb7.mp3", "name": "Bb7" }, { "url": "B7.mp3", "name": "B7" }, { "url": "C8.mp3", "name": "C8" } ] }  
};


OMusicPlayer.prototype.mutePart = function (part, mute) {
    if (typeof part === "string") {
        part = this.getPart(part);
    }

    if (!part) {
        return
    }

    part.data.audioParams.mute = mute || false;
    this.song.partMuteChanged(part);

    if (part.osc && part.data.audioParams.mute) {
        part.preFXGain.gain.cancelScheduledValues(this.context.currentTime)
        part.preFXGain.gain.setValueAtTime(0, this.context.currentTime)
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

OMusicPlayer.prototype.getSound = function (part, soundName) {
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

OMusicPlayer.prototype.getPart = function (partName) {
    for (var i = 0; i < this.section.parts.length; i++) {
        if (this.section.parts[i].data.name === partName) {
            return this.section.parts[i];
        }
    }
};

OMusicPlayer.prototype.loadMic = function (part) {
    if (!this.allowMic) {
        return
    }
    var p = this
    navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
        part.inputSource = p.context.createMediaStreamSource(stream)
        if (!part.data.audioParams.mute) {
            part.inputSource.connect(part.preFXGain)
        }
        if (part.onmediastream) {
            part.onmediastream()
            part.onmediastream = undefined
        }
    })
}

OMusicPlayer.prototype.disconnectMic = function (part) {
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



OMusicPlayer.prototype.noteOn = function (noteNumber, part, velocity) {
    if (this.disableAudio) {
        return
    }

    if (this.context.state === "suspended") {
        this.context.resume();
    }
    
    if (part.soundFont) {
        part.notesPlaying[noteNumber] = this.soundFontPlayer.queueWaveTable(this.context, this.context.destination
            , _tone_0250_SoundBlasterOld_sf2, 0, noteNumber - 12, 20);
    }
    else if (part.osc) {
        part.baseFrequency = this.makeFrequency(noteNumber);
        part.osc.frequency.setValueAtTime(
                part.baseFrequency * part.data.audioParams.warp, this.context.currentTime);
        part.preFXGain.gain.setTargetAtTime(part.data.audioParams.gain, this.context.currentTime, 0.003);
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
                this.context.currentTime, 0.003);
    }  
    else {
        part.notesPlaying[noteNumber].bufferGain.gain.setTargetAtTime(0, this.context.currentTime, 0.001);
        part.notesPlaying[noteNumber].stop(this.context.currentTime + 0.015);
    }

    delete part.notesPlaying[noteNumber]
    
    part.nextBeat = 0;
    part.currentI = -1;
    
};

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
