function OMusicPlayer() {
	
	if (typeof(omg) != "object") {
		console.log("there should be an omg object. omg_utils.js is also needed")
	}
	
	var p = this;
	
	p.playing = false;
	p.loadedSounds = {};

    if (!window.AudioContext)
        window.AudioContext = window.webkitAudioContext;

    try {
        p.context = new AudioContext();
        if (!p.context.createGain) 
            p.context.createGain = p.context.createGainNode;

    }
    catch (e) {
    	var nowebaudio = document.getElementById("no-web-audio");
    	if (nowebaudio)
    		nowebaudio.style.display = "inline-block";
        //return;
    }

    p.onBeatPlayedListeners = [];

    p.iSubBeat = 0;
    p.loopStarted = 0;

    p.beats = omg.beats || 8;
    p.subbeats = omg.subbeats || 4;
    
    p.nextUp = null;


}

    
OMusicPlayer.prototype.play = function (song) {
	var p = this;
	if (!p.context)
		return;

	if (song) {

    	p.prepareSong(song);

    	if (p.playing) {
    		p.nextUp = song;
    		return p.playingIntervalHandle;
    	}

    	p.song = song;
	}

	// if there is no song already here, this'll blow
	
    p.song.playingSection = 0;

    if (!p.song.sections || !p.song.sections.length){
    	console.log("no sections to play()");
    	return -1;
	}
    
    p.playing = true;
    p.loopStarted = Date.now();
    p.iSubBeat = 0;

	//todo this bpm thing isn't consistent
    var beatsPerSection = p.beats * p.subbeats;
    if (p.song.data && p.song.data.subbeatMillis)
    	p.subbeatLength = p.song.data.subbeatMillis;
    else if (p.song.sections[0].data && 
    		p.song.sections[0].data.subbeatMillis) {
    	p.subbeatLength = p.song.sections[0].data.subbeatMillis
    }
    else
    	p.subbeatLength = 125; 
    
	var lastSection;
	var nextSection;

	p.playingIntervalHandle = setInterval(function() {

		if (!p.playing)
			return;
        
		p.playBeat(p.song.sections[p.song.playingSection], 
        		p.iSubBeat);

        for (var il = 0; il < p.onBeatPlayedListeners.length; il++) {
        	try {
        		p.onBeatPlayedListeners[il].call(null, p.iSubBeat, p.song.playingSection);	
        	}
            catch (ex) {
            	console.log(ex);
            }
        }
        
        p.iSubBeat++; 
        if (p.iSubBeat == beatsPerSection) {
        
        	lastSection = p.song.sections[p.song.playingSection];
        	
            p.iSubBeat = 0;
            p.loopStarted = Date.now();
            p.song.playingSection++;
            
            if (p.nextUp) {
            	p.song = p.nextUp;
            	p.song.playingSection = 0;
            	p.nextUp = null;
            }
            
            nextSection = p.song.sections[p.song.playingSection];
            
            if (p.song.playingSection >= p.song.sections.length) {
            	if (p.song.loop) {
            		p.song.playingSection = 0;
            		nextSection = p.song.sections[p.song.playingSection];
            	}
            	else {
            		p.stop();
            		nextSection = undefined;
            	}
            }
            
            //cancel all oscilators that aren't used next section
            //TODO make this work right
            var usedAgain;
            for (var ils = 0; ils < lastSection.parts.length; ils++) {
            	if (!lastSection.parts[ils].osc)
            		continue;
            	
            	usedAgain = false;
            	if (nextSection) {
                	for (var ins = 0; ins < nextSection.parts.length; ins++) {
                		if (lastSection.parts[ils] == nextSection.parts[ins]) {
                			usedAgain = true;
                			break;
                		}
                	}                		
            	}
            	if (!usedAgain) {
            		lastSection.parts[ils].osc.finishPart();
            	}
            }
        }
		
	}, p.subbeatLength);
	
    // ??
    p.songStarted = p.loopStarted;
    
    if (typeof(p.onPlay) == "function") {
    	p.onPlay();
    }
    
    return p.playingIntervalHandle;
};

OMusicPlayer.prototype.stop = function () {
	var p = this;

    if (typeof(p.onStop) == "function") {
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
        		
        }
    }
};
    
OMusicPlayer.prototype.loadPart = function (part) {
	var p = this;

	var type = part.data.type;

   part.soundsLoading = 0;
	part.loaded = false;
   if (type == "DRUMBEAT") {
      this.loadDrumbeat(part);
   }
   if (type == "MELODY" || type == "BASSLINE") {
      this.loadMelody(part);
   }
   if (type == "CHORDPROGRESSION") {
      part.loaded = true;
   }
   if (part.data.volume == undefined) {
      part.data.volume = 0.6;
   }
   if (part.data.pan == undefined) {
      part.data.pan = 0;
   }
};

OMusicPlayer.prototype.loadMelody = function (part) {
	var p = this;

	var data = part.data;
	
	var rootNote;
	var ascale;
	//if (p.arrangement.data.rootNote != undefined) {
	//	rootNote = p.arrangement.data.rootNote;
	//}
	//else {
		rootNote = data.rootNote % 12;
	//}

	//if (p.arrangement.data.ascale != undefined) {
	//	ascale = p.arrangement.data.ascale;
	//}
	//else {
		if (!data.ascale && data.scale) {
			data.ascale = omg.util.splitInts(data.scale);
		}
		ascale = data.ascale;
	//}
	p.rescale(data, rootNote, ascale);
	
	if (typeof data.sound == "string" &&
			data.sound.indexOf("PRESET_") == 0) {
		p.setupPartWithSoundSet(p.getPresetSoundSet(data.sound), part);
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
    	}
    	else if (this.loadedSounds[tracks[i].sound]) {
            //tracks[i].audio = p.loadedSounds[tracks[i].sound];
            soundsAlreadyLoaded++;
        }
        else {
            this.loadSound(tracks[i].sound, part);
        }
    }
    if (soundsAlreadyLoaded == tracks.length) {
    	part.loaded = true;
    }

};

OMusicPlayer.prototype.setNewBpm =  function (bpm) {
	var p = this;
	if (bpm > 40 && bpm < 300) {
		omg.bpm = bpm;

    	if (p.intervalHandle && p.playing) {
    		clearInterval(p.intervalHandle);
        	p.go();        		
    	}
	}
};

OMusicPlayer.prototype.playWhenReady = function (sections) {
	var p = this;
	var allReady = true;

	for (var i = 0; i < sections.length; i++) {
    	for (var j = 0; j < sections[i].parts.length; j++) {
    		if (!sections[i].parts[j].loaded) {
    			allReady = false;
    			omg.util.d("section " + i + " part " + j + " is not ready");
    		}
        }
	}
	if (!allReady) {
		setTimeout(function () {
			p.playWhenReady(sections);
		}, 600);
	}
	else {
		p.play(sections);
	}
};

OMusicPlayer.prototype.prepareSong = function (song) {
	var p = this;
	
	var section;
	var part;

    for (var isection = 0; isection < song.sections.length; isection++) {
    	
    	section = song.sections[isection];
        for (var ipart = 0; ipart < section.parts.length; ipart++) {
        	part = section.parts[ipart];
        	p.loadPart(part, part.data);
        }
    }
};

/*p.prepareArrangementData = function (arrangement) {
	var rawSection;
	var section;
	var rawPart;
	var part;
	
	var parrangement = {raw: arrangement, sections: []};

    for (var isection = 0; isection < arrangement.sections.length; isection++) {
    	
    	rawSection = arrangement.sections[isection];
    	section = {raw: rawSection, parts: []};

        for (var ipart = 0; ipart < rawSection.parts.length; ipart++) {
        	rawPart = rawSection.parts[ipart];
        	part = {raw: rawPart, nextBeat: 0, currentI: -1};
        	section.parts.push(part);

        	p.loadPart(part, rawPart);
        }
    	parrangement.sections.push(section);
    }
    parrangement.prepared = true;
    return parrangement;
};*/
    
OMusicPlayer.prototype.playBeat = function (section, iSubBeat) {
	var p = this;
    for (var ip = 0; ip < section.parts.length; ip++) {
        p.playBeatForPart(iSubBeat, section.parts[ip]);
    }
    

};

OMusicPlayer.prototype.playBeatForPart = function (iSubBeat, part) {
	var p = this;
    if (part.data.type == "DRUMBEAT") {
        p.playBeatForDrumPart(iSubBeat, part);        
    }
    if (part.data.type == "MELODY" || part.data.type == "BASSLINE") {
        p.playBeatForMelody(iSubBeat, part);        
    }
};

OMusicPlayer.prototype.playBeatForDrumPart = function (iSubBeat, part) {
    var tracks = part.data.tracks;

	if (part.muted)
		return;

    for (var i = 0; i < tracks.length; i++) {
        if (tracks[i].data[iSubBeat]) {
        	this.playSound(tracks[i].sound, part.data.volume);
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
    	//	if (!part.loopedBeats) part.loopedBeats = 0;
		//	part.loopedBeats += 32;
    	//}
    }

    if (part.loopedBeats) {
    	beatToPlay += part.loopedBeats;
    }

    if (beatToPlay == part.nextBeat) {
        var note = data.notes[part.currentI];
        
//            if (part.soundset) {
    	if (note && note.sound) {
    	    if (!part.muted) {
        		p.playNote(note, part, data);
    		}
        }
        else {
            if (!part.osc) {
            	p.makeOsc(part);
            }

            if (!note || note.rest)
                part.osc.frequency.setValueAtTime(0, 0);
            else {
            	
            	var freq = p.makeFrequency(note.scaledNote);
            	part.osc.frequency.setValueAtTime(freq, 0);
            	part.playingI = part.currentI;
            	var playingI = part.playingI;
            	setTimeout(function () {
            		if (part.osc && part.playingI == playingI) {
            			part.osc.frequency.setValueAtTime(0, 0);
            		}
            	}, p.subbeats * note.beats * p.subbeatLength * 0.85);
            }
        }
    	
        if (note) {
            part.nextBeat += p.subbeats * note.beats;
            part.currentI++;
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
			part.osc.stop(0);
			part.osc.disconnect(part.gain);
			part.gain.disconnect(part.panner);
			part.panner.disconnect(p.context.destination);
		}
		catch (e) {}
	}

	part.osc = p.context.createOscillator();

    if (part.data.type == "BASSLINE") {
        part.osc.type = part.osc.SAWTOOTH || "sawtooth";
    }

    part.gain = p.context.createGain();
    part.osc.connect(part.gain);

    //Mock for the old browsers I have
    if (!p.context.createStereoPanner) {
        part.panner = p.context.createPanner();
        part.panner.setValue = function (x) {
            part.panner.setPosition(0, 0, (x - 0.5) * 10)
        };
    } else {
        part.panner = p.context.createStereoPanner();
        part.panner.setValue = function (x) {
            part.panner.pan.value = x || 0;
        };
    }

    part.gain.connect(part.panner);
    part.panner.connect(p.context.destination);
    part.panner.setValue(part.data.pan);

    if (part.muted) {
    	part.gain.gain.value = 0;
    	part.gain.gain.preMuteGain = part.data.volume;
    }
    else {
        part.gain.gain.value = part.data.volume;    	
    }
 
    part.osc.frequency.setValueAtTime(0, 0);
    if (part.osc.start)
        part.osc.start(0);
    else {
    	part.osc.noteOn(0);
    	part.osc.stop = function (iii) {
    		part.osc.noteOff(iii);
    	};
    }
    
    part.osc.finishPart = function () {
      part.gain.gain.value = 0;

      //total hack, this is why things should be processed ala AudioContext, not our own thread
      setTimeout(function () {
		   part.osc.stop(0);
		   part.osc.disconnect(part.gain);
		   part.gain.disconnect(p.context.destination);
		
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
        osc.frequency.setValueAtTime(0, 0);
        if (osc.start) {
            osc.start(0);
        }
        else {
            osc.noteOn(0);
        }
        setTimeout(function () {
            if (osc.stop) {
                osc.stop(0);
            }
            else {
                osc.noteOff(0);
            }
            osc.disconnect(p.context.destination);

        }, 500);
    }
    catch (ex) {
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
    if (sound.indexOf("PRESET_") == 0) {
    	var preseturl;
    	if (!omg.dev) {
    		preseturl = "https://dl.dropboxusercontent.com/u/24411900/omg/drums/";
    	}
    	else {
    		preseturl = "http://localhost:8888/music/audio/";
    		//preseturl = "http://localhost:8889/audio/";
    	}
        url = preseturl + sound.substring(7).toLowerCase() + ".mp3";
    }
    
    p.loadedSounds[key] = "loading";
    
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    part.soundsLoading++;

    // Decode asynchronously
    request.onload = function() {
        p.context.decodeAudioData(request.response, function(buffer) {
            p.loadedSounds[key] = buffer;
            p.onSoundLoaded(true, part);
        }, function () {
            omg.util.d("error loading sound url:");
            omg.util.d(url)
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

OMusicPlayer.prototype.rescale = function (data, rootNote, scale) {
	var p = this;

	var octaveShift = data.octave || data.octaveShift;
	var octaves2;
	if (isNaN(octaveShift)) 
		octaveShift = data.type == "BASSLINE" ? 3 : 5;
	var newNote;
	var onote;
	var note;
	
	for (var i = 0; i < data.notes.length; i++) {
		octaves2 = 0;
		
		onote = data.notes[i];
		newNote = onote.note;
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
	
};

OMusicPlayer.prototype.setupPartWithSoundSet = function (ss, part, load) {
	var p = this;

	if (!ss)
		return;
	
	//part.soundset = ss;
	var note;
	var noteIndex;
	
	var prefix = ss.data.prefix || "";
	var postfix = ss.data.postfix || "";

	console.log(ss);
	for (var ii = 0; ii < part.data.notes.length; ii++) {
		note = part.data.notes[ii];
		
		if (note.rest)
			continue;

		noteIndex = note.scaledNote - ss.bottomNote;
		if (noteIndex < 0) {
			noteIndex = noteIndex % 12 + 12;
		}
		else {
			while (noteIndex >= ss.data.data.length) {
				noteIndex = noteIndex - 12;
			}
		}

		note.sound = prefix + ss.data.data[noteIndex].url + postfix;

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
	    	
	var prefix = ss.data.prefix || "";
	var postfix = ss.data.postfix || "";

	var track;
	
	for (var ii = 0; ii < part.data.tracks.length; ii++) {
		track = part.data.tracks[ii];
		
		track.sound = prefix + ss.data.data[ii].url + postfix;

		if (!track.sound)
			continue;
		
        if (load && !p.loadedSounds[track.sound]) {
            p.loadSound(track.sound, part);
        }
	}

};

OMusicPlayer.prototype.getPresetSoundSet = function (preset) {
	var p = this;
	
	var oret;
	if (preset == "PRESET_SYNTH1") {
		oret = {"name" : "Keyboard", 
				"id" : -101, "bottomNote" : 33, 
				"data" : {"name":"PRESET_SYNTH1",
				"data":[
		        {"url":"a1","caption":"A1"},{"url":"bf1","caption":"Bb1"},{"url":"b1","caption":"B1"},{"url":"c2","caption":"C2"},{"url":"cs2","caption":"C#2"},{"url":"d2","caption":"D2"},
		    	{"url":"ds2","caption":"D#2"},{"url":"e2","caption":"E3"},{"url":"f2","caption":"F2"},{"url":"fs2","caption":"F#2"},{"url":"g2","caption":"G2"},{"url":"gs2","caption":"G#2"},
		        {"url":"a2","caption":"A2"},{"url":"bf2","caption":"Bb2"},{"url":"b2","caption":"B2"},{"url":"c3","caption":"C3"},{"url":"cs3","caption":"C#3"},{"url":"d3","caption":"D3"},
		        {"url":"ds3","caption":"D#3"},{"url":"e3","caption":"E3"},{"url":"f3","caption":"F3"},{"url":"fs3","caption":"F#3"},{"url":"g3","caption":"G3"},{"url":"gs3","caption":"G#3"},
		        {"url":"a3","caption":"A3"},{"url":"bf3","caption":"Bb3"},{"url":"b3","caption":"B3"},{"url":"c4","caption":"C4"},{"url":"cs4","caption":"C#4"},{"url":"d4","caption":"D4"},
		        {"url":"ds4","caption":"D#4"},{"url":"e4","caption":"E4"},{"url":"f4","caption":"F4"},{"url":"fs4","caption":"F#4"},{"url":"g4","caption":"G4"},{"url":"gs4","caption":"G#4"},
		        {"url":"a4","caption":"A4"},{"url":"bf4","caption":"Bb4"},{"url":"b4","caption":"B4"},{"url":"c5","caption":"C5"},{"url":"cs5","caption":"C#5"},{"url":"d5","caption":"D5"},
	        	{"url":"ds5","caption":"D#5"},{"url":"e5","caption":"E5"},{"url":"f5","caption":"F5"},{"url":"fs5","caption":"F#5"},{"url":"g5","caption":"G5"},{"url":"gs5","caption":"G#5"},		
		        {"url":"a5","caption":"A5"},{"url":"bf5","caption":"Bb5"},{"url":"b5","caption":"B5"},{"url":"c6","caption":"C6"},{"url":"cs6","caption":"C#6"},{"url":"d6","caption":"D6"},
		        {"url":"ds6","caption":"D#6"},{"url":"e6","caption":"E6"},{"url":"f6","caption":"F6"},{"url":"fs6","caption":"F#6"},{"url":"g6","caption":"G6"},{"url":"gs6","caption":"G#6"},
	        	{"url":"a6","caption":"A6"}
		        ],
		        "prefix":"https://dl.dropboxusercontent.com/u/24411900/omg/kb/kb1_",
		        "postfix":".mp3","bottomNote":33} };
		if (omg.dev) {
			oret.data.prefix = "http://localhost/mp3/kb/kb1_";
		}
	}
	if (preset == "PRESET_GUITAR1") {
		oret = {"name" : "Electric Guitar", 
			"id" : -201, "bottomNote" : 40, 
			"data" : {"name":"PRESET_GUITAR1",
			"data":[
	        {"url":"e","caption":"E2"},{"url":"f","caption":"F2"},{"url":"fs","caption":"F#2"},{"url":"g","caption":"G2"},{"url":"gs","caption":"G#2"},{"url":"a","caption":"A2"},
	    	{"url":"bf","caption":"Bb2"},{"url":"b","caption":"B2"},{"url":"c","caption":"C3"},{"url":"cs","caption":"C#3"},{"url":"d","caption":"D3"},{"url":"ds","caption":"D#3"},
	        {"url":"e2","caption":"E3"},{"url":"f2","caption":"F3"},{"url":"fs2","caption":"F#2"},{"url":"g2","caption":"G2"},{"url":"gs2","caption":"G#2"},{"url":"a2","caption":"A3"},
	    	{"url":"bf2","caption":"Bb3"},{"url":"b2","caption":"B3"},{"url":"c2","caption":"C4"},{"url":"cs2","caption":"C#4"},{"url":"d2","caption":"D4"},{"url":"ds2","caption":"D#4"},
	        {"url":"e3","caption":"E4"},{"url":"f3","caption":"F4"},{"url":"fs3","caption":"F#4"},{"url":"g3","caption":"G4"},{"url":"gs3","caption":"G#4"},{"url":"a3","caption":"A4"},
	    	{"url":"bf3","caption":"Bb4"},{"url":"b3","caption":"B4"},{"url":"c3","caption":"C5"},{"url":"cs3","caption":"C#5"},{"url":"d3","caption":"D5"},{"url":"ds3","caption":"D#5"},
	        {"url":"e4","caption":"E5"},{"url":"f4","caption":"F5"},{"url":"fs4","caption":"F#5"},{"url":"g4","caption":"G5"},{"url":"gs4","caption":"G#5"},{"url":"a4","caption":"A5"},
	    	{"url":"bf4","caption":"Bb5"},{"url":"b4","caption":"B5"},{"url":"C4","caption":"C6"},{"url":"cs4","caption":"C#6"}
	        ],
	        "prefix":"https://dl.dropboxusercontent.com/u/24411900/omg/electric/electric_",
	        "postfix":".mp3","bottomNote":40} };
		if (omg.dev) {
//    			oret.data.prefix = "http://localhost/mp3/kb/kb1_";
		}
	}
	if (preset == "PRESET_BASS") {
		oret = {"name" : "Bass1", "id" : 1540004, "bottomNote" : 28, 
				"data" : {"name":"Bass1","data":[
                 {"url":"e","caption":"E2"},{"url":"f","caption":"F2"},{"url":"fs","caption":"F#2"},{"url":"g","caption":"G2"},{"url":"gs","caption":"G#2"},{"url":"a","caption":"A2"},
                 {"url":"bf","caption":"Bb2"},{"url":"b","caption":"B2"},{"url":"c","caption":"C3"},{"url":"cs","caption":"C#3"},{"url":"d","caption":"D3"},{"url":"ds","caption":"Eb3"},
                 {"url":"e2","caption":"E3"},{"url":"f2","caption":"F3"},{"url":"fs2","caption":"F#3"},{"url":"g2","caption":"G3"},{"url":"gs2","caption":"G#3"},{"url":"a2","caption":"A3"},
                 {"url":"bf2","caption":"Bb3"},{"url":"b2","caption":"B3"},{"url":"c2","caption":"C4"}
                 ],"prefix": "https://dl.dropboxusercontent.com/u/24411900/omg/bass1/bass_",
                 "postfix": ".mp3",
                 "bottomNote":19} };
		
		if (omg.dev) {
			oret.data.prefix = "http://localhost/mp3/bass_";
		}
	}
	if (preset == "PRESET_HIP") {
		oret = {"name" : "PRESET_HIP", "id" : 0,  
				"data" : {"name":"PRESET_HIP","data":[
                 {"url":"PRESET_HH_KICK","caption":"kick"},
                 {"url":"PRESET_HH_CLAP","caption":"clap"},
                 {"url":"PRESET_ROCK_HIHAT_CLOSED","caption":"hihat closed"},
                 {"url":"PRESET_HH_HIHAT","caption":"hihat open"},
                 {"url":"PRESET_HH_TAMB","caption":"tambourine"},
                 {"url":"PRESET_HH_TOM_MH","caption":"h tom"},
                 {"url":"PRESET_HH_TOM_ML","caption":"m tom"},
                 {"url":"PRESET_HH_TOM_L","caption":"l tom"}
                 ]} };
		
	}
	if (preset == "PRESET_ROCK") {
		oret = {"name" : "PRESET_ROCK", "id" : 0,  
				"data" : {"name":"PRESET_ROCK","data":[
                 {"url":"PRESET_ROCK_KICK","caption":"kick"},
                 {"url":"PRESET_ROCK_SNARE","caption":"snare"},
                 {"url":"PRESET_ROCK_HIHAT_CLOSED","caption":"hihat closed"},
                 {"url":"PRESET_ROCK_HIHAT_OPEN","caption":"hihat open"},
                 {"url":"PRESET_ROCK_CRASH","caption":"crash"},
                 {"url":"PRESET_ROCK_TOM_H","caption":"h tom"},
                 {"url":"PRESET_ROCK_TOM_ML","caption":"m tom"},
                 {"url":"PRESET_ROCK_TOM_L","caption":"l tom"}
                 ]} };
		
	}


	return oret;
};

OMusicPlayer.prototype.playNote = function (note, part, data) {
	var p = this;

	var audio = p.playSound(note.sound, data.volume);
	var fromNow = (note.beats * 4 * p.subbeatLength)/1000;

	//setTimeout(function () {
	//	fadeOut(audio.gain2.gain, function () {
	//		audio.stop(0);
	//	});
	//}, fromNow - 100);

	if (audio)
		audio.stop(p.context.currentTime + fromNow * 0.98);
	
    if (part)
    	part.currentAudio = audio;
};



OMusicPlayer.prototype.playSound = function (sound, volume) {
	var p = this;
    if (p.loadedSounds[sound] && 
    		p.loadedSounds[sound] !== "loading") {
    	    	
        var source = p.context.createBufferSource();
        source.buffer = p.loadedSounds[sound];                   

        if (source.start)
            source.start(0);
        else {
        	source.noteOn(0);
        	source.stop = function () {
        		source.noteOff(0);
        	};
        } 

        source.gain2 = p.context.createGain();
        source.connect(source.gain2);
        source.gain2.connect(p.context.destination);
        
        source.gain2.gain.value = volume; 

        return source;
    }
};

OMusicPlayer.prototype.makeOMGSong = function (data) {
	var newSong;
	var newSection;
	
	if (!data) {
		return null;
	}

	var className = data.constructor.name;

	if (className == "OMGPart" || className == "OMGDrumpart") {

		newSong = new OMGSong();
		newSection = new OMGSection();
		newSection.parts.push(data);
		newSong.sections.push(newSection);
		return newSong;
	}

	if (className == "OMGSection") {

		newSong = new OMGSong();
		newSong.sections.push(data);
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
		newSong = new OMGSong();
		newSection = new OMGSection(null, data);
		newSong.sections.push(newSection);
		return newSong;
	}
	
	if (data.type == "MELODY" || data.type == "BASSLINE") {
		newPart = new OMGPart(null, data);
		newSong = new OMGSong();
		newSection = new OMGSection();
		newSection.parts.push(newPart);
		newSong.sections.push(newSection);
		
		return newSong;
	}
	
	if (data.type == "DRUMBEAT") {
		newPart = new OMGDrumpart(null, data);
		newSong = new OMGSong();
		newSection = new OMGSection();
		newSection.parts.push(newPart);
		newSong.sections.push(newSection);
		
		return newSong;
	}
	
	return null;
};

OMusicPlayer.prototype.updatePartVolumeAndPan = function (part) {

    if (part.gain) {
        part.gain.gain.value = part.data.volume;
    }
    if (part.panner) {
        part.panner.setValue(part.data.pan);
    }

};    

function OMGSong(div, data) {
	this.div = div;
	this.sections = [];
	this.loop = true;
	
	if (data) {
		this.setData(data);
	}
	else {
		this.data = {type: "SONG", name: "(untitled)"};		
	}

	
	// key? tempo? yes, we need that shit
};
OMGSong.prototype.setData = function (data) {
	this.data = data;
	
	for (var i = 0; i < data.sections.length; i++) {
		this.sections.push(new OMGSection(null, data.sections[i]));
	}
	
	if (!this.data.name)
		this.data.name = "(untitled)";
};
OMGSong.prototype.getData = function () {

	this.data.sections = [];
	for (var ip = 0; ip < this.sections.length; ip++) {
		this.data.sections[ip] = this.sections[ip].getData();
	}
	return this.data;
};

function OMGSection(div, data) {
	var partData;
	var part;
	
	this.div = div;
	
	this.parts = [];
	
	// key? tempo? we need it here too, I guess
	
	if (data) {
		this.data = data;

		for (var ip = 0; ip < data.parts.length; ip++) {
			partData = data.parts[ip];
			if (partData.type == "DRUMBEAT") {
				part = new OMGDrumpart(null, partData);
			} 
			else if (partData.type == "MELODY" || partData.type == "BASSLINE") {
				part = new OMGPart(null, partData);
			}
			else {
				part = new OMGPart(null, partData);
			}

			this.parts.push(part);
		}
	}
	else {
		this.data = {type: "SECTION"};
	}
}

OMGSection.prototype.getData = function () {
	this.data.parts = [];
	for (var ip = 0; ip < this.parts.length; ip++) {
		this.data.parts[ip] = this.parts[ip].data;
	}
	return this.data;
};

function OMGDrumpart(div, data) {
	this.div = div;	
	
	if (data) {
		this.data = data;
	}
	else {
		this.data = {"type":"DRUMBEAT","bpm":120,"kit":0,
			    isNew: true,
				"tracks":[{"name":"kick","sound":"PRESET_HH_KICK",
				"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},
		        {"name":"snare","sound":"PRESET_HH_CLAP",
	        	"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	        	        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},
		        {"name":"closed hi-hat","sound":"PRESET_ROCK_HIHAT_CLOSED",
	        	"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	        	        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},
		        {"name":"open hi-hat","sound":"PRESET_HH_HIHAT",
	        	"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	        	        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},
		        {"name":"tambourine","sound":"PRESET_HH_TAMB",
	        	"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	        	        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},
		        {"name":"h tom","sound":"PRESET_HH_TOM_MH",
	        	"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	        	        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},
		        {"name":"m tom","sound":"PRESET_HH_TOM_ML",
	        	"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	        	        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},
		        {"name":"l tom","sound":"PRESET_HH_TOM_L",
	        	"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	        	        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}
		      ]};
	}

	//not used i dont think, should be soon
	this.loadSoundSet = function (soundSet) {
		var emptyBeat = {"type":"DRUMBEAT","bpm":120,"kit":soundSet.id,
				    isNew: true, data: []};
				    
	    var prefix = soundSet.data.prefix || "";
	    var postfix = soundSet.data.postfix || "";

		var sound;
		for (var i = 0; i < soundSet.data.data.length; i++) {
			sound = soundSet.data.data[i];
			emptyBeat.data.push({"name": sound.caption,"sound":prefix + sound.url + postfix,
					"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
					        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]});
		}
		return emptyBeat;
	};

	// key? tempo? we need it here too, I guess
	
}

function OMGPart(div, data) {
	this.div = div;
	if (data) {
		this.data = data;
	}
	else {
		this.data = {type: "MELODY", notes: [], volume: 0.6, pan: 0};	
	}
	
		
	// key? tempo? we need it here too, I guess
	
}
