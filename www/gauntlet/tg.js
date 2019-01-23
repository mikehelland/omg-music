
tg.playButton = document.getElementById("play-button-canvas");
tg.playButtonCaption = document.getElementById("play-button-caption");
tg.mixButton = document.getElementById("mix-button");
tg.saveButton = document.getElementById("save-button");
tg.addPartButton = document.getElementById("add-part-button");
tg.detailFragment = document.getElementById("detail-fragment");
tg.backButton = document.getElementById("back-button");

tg.player = new OMusicPlayer();
tg.player.loadFullSoundSets = true;
tg.player.prepareSong(tg.song);


tg.player.onPlay = function () {
    tg.drawPlayButton(0);
    tg.playButtonCaption.innerHTML = "STOP";
};
tg.player.onStop = function () {
    tg.drawPlayButton();
    tg.playButtonCaption.innerHTML = "PLAY";
    var chordsCaption = tg.makeChordsCaption();
    tg.chordsButton.innerHTML = chordsCaption;
    tg.chordsEditorView.innerHTML = chordsCaption;
};

tg.player.onBeatPlayedListeners.push(function (isubbeat, section) {
    tg.drawPlayButton(isubbeat);
    if (isubbeat === 0) {
        if (tg.currentSection !== section) {
            tg.loadSection(section);
        }
        tg.setSongControlsUI();
    }
});
    
omg.server.getHTTP("/user/", function (res) {
    if (res) {
        tg.onlogin(res);
    }
});


/*
 * A couple quick navigation methods
 * 
*/


tg.showFragment = function (fragment, button, params) {
    tg.hideDetails();
    if (button) {
        tg.newChosenButton(button);
    }
    fragment.div.style.display = fragment.display || "block";
    tg.currentFragment = fragment;
    if (fragment.onshow) {
        fragment.onshow(params);
    }
}

tg.hideDetails = function (hideFragment) {
    if (tg.beatsFragment) tg.beatsFragment.style.display = "none";
    if (tg.keyFragment) tg.keyFragment.style.display = "none";
    if (tg.chordsFragment) tg.chordsFragment.style.display = "none";
    if (tg.addPartFragment) tg.addPartFragment.style.display = "none";
    if (tg.surface) tg.surface.style.display = "none";
    if (tg.mixFragment) tg.mixFragment.style.display = "none";
    if (tg.userFragment) tg.userFragment.style.display = "none";
    if (tg.songFragment) tg.songFragment.style.display = "none";
    if (tg.sectionFragment) tg.sectionFragment.div.style.display = "none";
    if (tg.sequencer) tg.sequencer.div.style.display = "none";
    if (tg.instrument) tg.instrument.div.style.display = "none";
    
    if (tg.currentFragment) {
        tg.currentFragment.div.style.display = "none";
        if (tg.currentFragment.onhide)
            tg.currentFragment.onhide();
    }
    tg.currentFragment = null;
    
    if (hideFragment) {
        tg.detailFragment.style.display = "none";
        tg.chosenButton.classList.remove("selected-option");
        tg.chosenButton = undefined;
    }
    else {
        tg.detailFragment.style.display = "flex";
    }
};

tg.newChosenButton = function (button) {
    if (tg.chosenButton) {
        tg.chosenButton.classList.remove("selected-option");
    }
    tg.chosenButton = button;
    button.classList.add("selected-option");
};

tg.backButton.onclick = function () {
    tg.hideDetails(true);
};


/*
 *  SEQUENCER
 * 
*/


tg.sequencer = {
    div: document.getElementById("sequencer-fragment"),
    fullStrengthButton: document.getElementById("sequencer-beat-strength-loud"),
    mediumStrengthButton: document.getElementById("sequencer-beat-strength-medium"),
    softStrengthButton: document.getElementById("sequencer-beat-strength-soft"),
    surface: document.getElementById("sequencer-surface")
};

tg.sequencer.setup = function () {
    var s = tg.sequencer;
    s.currentStrength = s.fullStrengthButton;
    s.currentStrength.classList.add("sequencer-toolbar-beat-strength-selected");
    
    s.fullStrengthButton.onclick = function (e) {
        s.currentStrength.classList.remove("sequencer-toolbar-beat-strength-selected");
        e.target.classList.add("sequencer-toolbar-beat-strength-selected");
        s.currentStrength = e.target;
        s.part.drumMachine.beatStrength = 1;
    };
    s.mediumStrengthButton.onclick = function (e) {
        s.currentStrength.classList.remove("sequencer-toolbar-beat-strength-selected");
        e.target.classList.add("sequencer-toolbar-beat-strength-selected");
        s.currentStrength = e.target;
        s.part.drumMachine.beatStrength = 0.50;
    };
    s.softStrengthButton.onclick = function (e) {
        s.currentStrength.classList.remove("sequencer-toolbar-beat-strength-selected");
        e.target.classList.add("sequencer-toolbar-beat-strength-selected");
        s.currentStrength = e.target;
        s.part.drumMachine.beatStrength = 0.25;
    };
    
    s.onBeatPlayedListener = function (isubbeat, isection) {
        s.part.drumMachine.draw(isubbeat);
    };
};
tg.sequencer.setup();

tg.sequencer.show = function (part) {
    var s = tg.sequencer;
    s.beatStrength = 1;
    if (s.part && s.part.drumMachine) {
        s.beatStrength = s.part.drumMachine.beatStrength;
    }
    s.part = part;

    if (!part.drumMachine) {
        part.drumMachine = new OMGDrumMachine(s.surface, part);
        part.drumMachine.captionWidth = window.innerWidth / 2 / 8;
        part.drumMachine.readOnly = false;
    }
    part.drumMachine.backgroundDrawn = false;

    part.drumMachine.beatStrength = s.beatStrength;
    
    tg.player.onBeatPlayedListeners.push(s.onBeatPlayedListener);
    
    tg.hideDetails();
    s.div.style.display = "flex";
    part.drumMachine.draw();
    tg.currentFragment = tg.sequencer;
};

tg.sequencer.onhide = function () {
    var index = tg.player.onBeatPlayedListeners.indexOf(this.onBeatPlayedListener);
    tg.player.onBeatPlayedListeners.splice(index, 1);
    this.part.drumMachine.hide();
};


/*
 * INSTRUMENT / VERTICAL SURFACE
 * 
*/



tg.instrument = {
    div: document.getElementById("instrument-fragment"),
    editButton: document.getElementById("instrument-edit-button"),
    zoomButton: document.getElementById("instrument-zoom-button"),
    surface: document.getElementById("instrument-surface")
};

tg.instrument.setMode = function (mode) {
    if (mode === "EDIT") {
        this.editButton.classList.add("selected-option");
    }
    else {
        this.editButton.classList.remove("selected-option");
    }
    if (mode === "ZOOM") {
        this.zoomButton.classList.add("selected-option");
    }
    else {
        this.zoomButton.classList.remove("selected-option");
    }
    
    this.mm.mode = mode;
    this.mm.draw();
};

tg.instrument.setup = function () {
    var ti = tg.instrument;
    ti.editButton.onclick = function (e) {
        if (ti.mm.mode === "EDIT") {
            e.target.classList.add("selected-option");
            ti.currentMode = e.target;
        }
    };
    
    this.editButton.onclick = function () {
        ti.setMode(ti.mm.mode !== "EDIT" ? "EDIT" : "LIVE");
    };
    this.zoomButton.onclick = function () {
        ti.setMode(ti.mm.mode !== "ZOOM" ? "ZOOM" : "LIVE");
    };
    
    tg.instrument.onBeatPlayedListener = function (isubbeat, isection) {
        tg.instrument.mm.draw();
    };
};
tg.instrument.setup();

tg.instrument.show = function (part) {
    tg.instrument.div.style.display = "flex";

    tg.player.onBeatPlayedListeners.push(tg.instrument.onBeatPlayedListener);

    tg.currentFragment = tg.instrument;
    if (!part.mm) {
        part.mm = new OMGMelodyMaker(tg.instrument.surface, part, tg.player);
        part.mm.readOnly = false;
    }
    tg.instrument.mm = part.mm;
    tg.instrument.mm.setCanvasEvents();
    tg.instrument.mm.backgroundDrawn = false;
    tg.instrument.setMode("WRITE");
};

tg.instrument.onhide = function () {
    var index = tg.player.onBeatPlayedListeners.indexOf(this.onBeatPlayedListener);
    tg.player.onBeatPlayedListeners.splice(index, 1);
    tg.instrument.mm.hide();

};


/*
 * MAIN FRAGMENT
 * 
*/


tg.playButtonCaption.onclick = function () {
    if (tg.player.playing) {
        tg.player.stop();
    }
    else {
        tg.player.loopSection = tg.song.sections.indexOf(tg.currentSection);
        tg.player.play();
    }
};

tg.playButton.width = tg.playButton.clientWidth;
tg.playButton.height = tg.playButton.clientHeight;
tg.playButtonContext = tg.playButton.getContext("2d");
tg.drawPlayButton = function (subbeat) {
    if (!tg.song) {
        return;
    }
    tg.playButton.width = tg.playButton.width;
    tg.playButtonContext.globalAlpha = 0.6;

    var beatWidth = tg.playButton.width / 
        (tg.song.data.beatParams.measures * tg.song.data.beatParams.beats);

    if (tg.player.playing) {
        tg.playButtonContext.fillStyle = "#00FF00";
        tg.playButtonContext.fillRect(beatWidth * Math.floor(subbeat / tg.song.data.beatParams.subbeats), 
            0, beatWidth, tg.playButton.height);        
    }
    else {
        tg.playButtonContext.fillStyle = "#FF0000";
        tg.playButtonContext.fillRect(0, 0, tg.playButton.width, tg.playButton.height);        
    }

    tg.playButtonContext.fillStyle = "white";
    tg.playButtonContext.strokeStyle = "white";
    tg.playButtonContext.strokeRect(0, 0, tg.playButton.width, tg.playButton.height);
    for (var beat = 1; 
            beat <= tg.song.data.beatParams.beats * tg.song.data.beatParams.measures; 
            beat++) {
        tg.playButtonContext.fillRect(beat * beatWidth, 0, 
                    beat % tg.song.data.beatParams.beats == 0 ? 2 : 1, 
                    tg.playButton.height);
    }
    
    //context.font = "bold 10px sans-serif";
    //context.fillText(tg.player.latencyMonitor, 10, tg.playButton.height / 2 + 10);

};

tg.drawPlayButton();
tg.playButtonCaption.innerHTML = "PLAY";


/* 
 * BEATS FRAGMENT
 * 
*/

tg.beatsButton.onclick = function () {
    tg.hideDetails();
    tg.showBeatsFragment();
};


tg.showBeatsFragment = function () {
    tg.hideDetails();
    if (!tg.beatsFragment) {
        tg.beatsFragment = document.getElementById("beats-fragment");
        var bf= tg.beatsFragment;
        bf.div = bf;
        
        bf.onhide = function () {
            tg.song.onBeatChangeListeners.splice(
                tg.song.onBeatChangeListeners.indexOf(bf.listener), 1);
        };
        
        bf.subbeatsLabel = document.getElementById("subbeats-label");
        bf.beatsLabel = document.getElementById("beats-label");
        bf.measuresLabel = document.getElementById("measures-label");
        bf.bpmLabel = document.getElementById("bpm-label");
        bf.shuffleLabel = document.getElementById("shuffle-label");
        
        bf.subbeatsRange = document.getElementById("subbeats-range");
        bf.beatsRange = document.getElementById("beats-range");
        bf.measuresRange = document.getElementById("measures-range");
        bf.bpmRange = document.getElementById("bpm-range");
        bf.shuffleRange = document.getElementById("shuffle-range");
        
        var onSubeatsChange = function (e) {
            bf.subbeatsLabel.innerHTML = bf.subbeatsRange.value;
            tg.song.data.beatParams.subbeats = bf.subbeatsRange.value * 1;
        };
        bf.subbeatsRange.ontouchmove = onSubeatsChange;
        bf.subbeatsRange.onmousemove = onSubeatsChange;
        bf.subbeatsRange.onmousedown = onSubeatsChange;
        bf.subbeatsRange.onchange = onSubeatsChange;
        var onBeatsChange = function (e) {
            bf.beatsLabel.innerHTML = bf.beatsRange.value;
            tg.song.data.beatParams.beats = bf.beatsRange.value * 1;
        };
        bf.beatsRange.ontouchmove = onBeatsChange;
        bf.beatsRange.onmousemove = onBeatsChange;
        bf.beatsRange.onmousedown = onBeatsChange;
        bf.beatsRange.onchange = onBeatsChange;
        var onMeasuresChange = function (e) {
            bf.measuresLabel.innerHTML = bf.measuresRange.value;
            tg.song.data.beatParams.measures = bf.measuresRange.value * 1;
        };
        bf.measuresRange.ontouchmove = onMeasuresChange;
        bf.measuresRange.onmousemove = onMeasuresChange;
        bf.measuresRange.onmousedown = onMeasuresChange;
        bf.measuresRange.onchange = onMeasuresChange;
        var onBpmChange = function (e) {
            bf.bpmLabel.innerHTML = bf.bpmRange.value;
            tg.song.data.beatParams.bpm = bf.bpmRange.value * 1;
            tg.player.newBPM = bf.bpmRange.value;
            tg.setSongControlsUI();
        };
        bf.bpmRange.ontouchmove = onBpmChange;
        bf.bpmRange.onmousemove = onBpmChange;
        bf.bpmRange.onmousedown = onBpmChange;
        bf.bpmRange.onchange = onBpmChange;
        var onShuffleChange = function (e) {
            tg.song.data.beatParams.shuffle = bf.shuffleRange.value / 100;
            bf.shuffleLabel.innerHTML = bf.shuffleRange.value * 1;
            
        };
        bf.shuffleRange.ontouchmove = onShuffleChange;
        bf.shuffleRange.onmousemove = onShuffleChange;
        bf.shuffleRange.onmousedown = onShuffleChange;
        bf.shuffleRange.onchange = onShuffleChange;
    }
    tg.refreshBeatsFragment();
    tg.beatsFragment.style.display = "block";
    tg.newChosenButton(tg.beatsButton);
    
    tg.beatsFragment.listener = function () {
        tg.refreshBeatsFragment();
    };
    tg.song.onBeatChangeListeners.push(tg.beatsFragment.listener);
    tg.currentFragment = tg.beatsFragment;
};

tg.refreshBeatsFragment = function () {
    tg.beatsFragment.subbeatsLabel.innerHTML = tg.song.data.beatParams.subbeats;
    tg.beatsFragment.beatsLabel.innerHTML = tg.song.data.beatParams.beats;
    tg.beatsFragment.measuresLabel.innerHTML = tg.song.data.beatParams.measures;
    tg.beatsFragment.bpmLabel.innerHTML = tg.song.data.beatParams.bpm;
    tg.beatsFragment.shuffleLabel.innerHTML = Math.round(tg.song.data.beatParams.shuffle * 100);
    tg.beatsFragment.subbeatsRange.value = tg.song.data.beatParams.subbeats;
    tg.beatsFragment.beatsRange.value = tg.song.data.beatParams.beats;
    tg.beatsFragment.measuresRange.value = tg.song.data.beatParams.measures;
    tg.beatsFragment.bpmRange.value = tg.song.data.beatParams.bpm;
    tg.beatsFragment.shuffleRange.value = tg.song.data.beatParams.shuffle * 100;

};

/*
 * KEY FRAGMENT
 * 
*/

tg.keyButton.onclick = function () {
    tg.hideDetails();
    tg.showKeyFragment();
}

tg.showKeyFragment = function () {
    var kf;
    if (!tg.keyFragment) {
        tg.keyFragment = document.getElementById("key-fragment");
        tg.keyFragment.keyList = document.getElementById("key-list");
        tg.keyFragment.scaleList = document.getElementById("scale-list");
    }
    
    var lastKey;
    var lastScale;
    
    kf = tg.keyFragment;
    kf.keyList.innerHTML = "";
    kf.scaleList.innerHTML = "";
    var keyI = 0;
    omg.ui.keys.forEach(function (key) {
        var keyDiv = document.createElement("div");
        keyDiv.className = "key-select-button";
        if (keyI === tg.song.data.keyParams.rootNote) {
            keyDiv.classList.add("selected-list-item");
            lastKey = keyDiv;
        }
        keyDiv.innerHTML = "<p>" + key + "</p>";;
        keyDiv.onclick = (function (i) {
            return function () {
                tg.song.data.keyParams.rootNote = i;
                tg.keyChanged();

                if (lastKey) {
                    lastKey.classList.remove("selected-list-item");
                }
                lastKey = keyDiv;
                keyDiv.classList.add("selected-list-item");
            }
        }(keyI));

        kf.keyList.appendChild(keyDiv);
        keyI++;
    });
    omg.ui.scales.forEach(function (scale) {
        var scaleDiv = document.createElement("div");
        scaleDiv.className = "scale-select-button";
        if (scale.value.join() === tg.song.data.keyParams.scale.join()) {
            scaleDiv.classList.add("selected-list-item");
            lastScale = scaleDiv;
        }
        scaleDiv.innerHTML = "<p>" + scale.name + "</p>";
        scaleDiv.onclick = (function (newScale) {
            return function () {
                tg.song.data.keyParams.scale = newScale;
                tg.keyChanged();
                
                if (lastScale) {
                    lastScale.classList.remove("selected-list-item");
                }
                lastScale = scaleDiv;
                scaleDiv.classList.add("selected-list-item");
            }
        }(scale.value));

        kf.scaleList.appendChild(scaleDiv);
    });

    tg.keyFragment.style.display = "flex";
    tg.newChosenButton(tg.keyButton);
};

tg.keyChanged = function () {
    tg.currentSection.parts.forEach(function (part) {
        if (part.mm) {
            part.mm.setupFretBoard();
        }
    });
    tg.song.keyChanged();
};


/*
 * CHORDS FRAGMENT
 * 
*/


tg.chordsButton.onclick = function () {
    tg.hideDetails();
    tg.showChordsFragment();
};
tg.showChordsFragment = function () {
    if (!tg.chordsFragment) {
        tg.chordsFragment = document.getElementById("chords-fragment");
        tg.chordsFragment.appendMode = false;
        document.getElementById("chords-fragment-clear-button").onclick = function () {
            tg.currentSection.data.chordProgression = [0];
            tg.setSongControlsUI();
        };
        var appendButton = document.getElementById("chords-fragment-append-button");
        appendButton.onclick = function () {
            tg.chordsFragment.appendMode = !tg.chordsFragment.appendMode;
            if (tg.chordsFragment.appendMode) {
                appendButton.classList.add("selected-option");
            }
            else {
                appendButton.classList.remove("selected-option");
            }
        };

    }
    var chordsList = document.getElementById("chords-fragment-list");
    chordsList.innerHTML = "";
    for (var i = tg.song.data.keyParams.scale.length - 1; i >= 0; i--) {
        chordsList.appendChild(tg.makeChordButton(i));
    }
    for (var i = 1; i < tg.song.data.keyParams.scale.length; i++) {
        chordsList.appendChild(tg.makeChordButton(i * -1));
    }

    tg.chordsFragment.style.display = "flex";
    tg.newChosenButton(tg.chordsButton);
};

tg.makeChordButton = function (chordI) {
    var chordDiv = document.createElement("div");
    chordDiv.className = "chord-select-button";
    chordDiv.innerHTML = "<p>" + tg.makeChordCaption(chordI) + "</p>";
    chordDiv.onclick = function () {
        if (tg.chordsFragment.appendMode) {
            tg.currentSection.data.chordProgression.push(chordI);
        }
        else {
            tg.currentSection.data.chordProgression = [chordI];
        }
        tg.setSongControlsUI();
    };
    return chordDiv;
};



/*
 * ADD PART FRAGMENT
 * 
*/


tg.addPartButton.onclick = function() {
    tg.hideDetails();
    tg.showAddPartFragment();
};
tg.showAddPartFragment = function () {
    if (!tg.addPartFragment) {
        tg.addPartFragment = document.getElementById("add-part-fragment");
        tg.soundSetList = document.getElementById("add-part-soundset-list");
        tg.soundFontList = document.getElementById("add-part-soundfont-list");
        tg.setupAddPartTabs();
  
        tg.gallerySelect = document.getElementById("add-part-gallery-select");
        tg.gallerySelect.onchange = function (e) {
            tg.soundSetList.style.display = tg.gallerySelect.value === "omg" ? "block" : "none";
            tg.soundFontList.style.display = tg.gallerySelect.value !== "omg" ? "block" : "none";
        };
  
        var addOscButtonClick = function (e) {
          tg.addOsc(e.target.innerHTML);  
        };
        document.getElementById("add-sine-osc-button").onclick = addOscButtonClick;
        document.getElementById("add-saw-osc-button").onclick = addOscButtonClick;
        document.getElementById("add-square-osc-button").onclick = addOscButtonClick;
        document.getElementById("add-triangle-osc-button").onclick = addOscButtonClick;
        
        fetch(location.origin + "/data/?type=SOUNDSET").then(function (e) {return e.json();}).then(function (json) {
            tg.soundSetList.innerHTML = "";
            json.forEach(function (soundSet) {
                var newDiv = document.createElement("div");
                newDiv.className = "soundset-list-item";
                newDiv.innerHTML = soundSet.name;
                tg.soundSetList.appendChild(newDiv);
                soundSet.url = location.origin + "/data/" + soundSet.id;
                newDiv.onclick = function () {
                    tg.addPart(soundSet);
                };
            });
        });
        
        omg.ui.soundFontNames.forEach(function (name) {
            var newDiv = document.createElement("div");
            newDiv.className = "soundset-list-item";
            newDiv.innerHTML = name.split("_").join(" ");
            tg.soundFontList.appendChild(newDiv);
            newDiv.onclick = function () {
                var soundSet = tg.player.getSoundSetForSoundFont(newDiv.innerHTML, 
                    tg.gallerySelect.value + name + "-mp3/");
                tg.addPart(soundSet);
            };

        });
    }
    tg.soundSetList.style.display = tg.gallerySelect.value === "omg" ? "block" : "none";
    tg.soundFontList.style.display = tg.gallerySelect.value !== "omg" ? "block" : "none";

    tg.addPartFragment.style.display = "block";
    tg.newChosenButton(tg.addPartButton);
};


tg.setupAddPartTabs = function () {
    var f = tg.addPartFragment;
    var galleryTab = document.getElementById("add-part-gallery-button");
    var oscillatorTab = document.getElementById("add-part-oscillator-button");
    var customTab = document.getElementById("add-part-custom-button");
    var gallery = document.getElementById("add-part-gallery");
    var oscillator = document.getElementById("add-part-oscillator");
    var custom = document.getElementById("add-part-custom");
    var lastTab;
    
    galleryTab.onclick = function (e) {
        gallery.style.display = "block";
        oscillator.style.display = "none";
        custom.style.display = "none";
        if (lastTab) {
            lastTab.classList.remove("selected-option");
        }
        lastTab = e.target;
        e.target.classList.add("selected-option");
    };
    oscillatorTab.onclick = function (e) {
        gallery.style.display = "none";
        oscillator.style.display = "block";
        custom.style.display = "none";
        if (lastTab) {
            lastTab.classList.remove("selected-option");
        }
        lastTab = e.target;
        e.target.classList.add("selected-option");
    };
    customTab.onclick = function (e) {
        gallery.style.display = "none";
        oscillator.style.display = "none";
        custom.style.display = "block";
        if (lastTab) {
            lastTab.classList.remove("selected-option");
        }
        lastTab = e.target;
        e.target.classList.add("selected-option");
    };
    
    galleryTab.onclick({target: galleryTab});
    
    document.getElementById("add-custom-soundset-button").onclick = function () {
        tg.addCustomSoundSet();
    };
  
};

tg.addCustomSoundSet = function () {
    var msg = document.getElementById("add-custom-soundset-warning");
    var nameInput = document.getElementById("add-part-custom-name");
    var name = nameInput.value;
    if (!name) {
        msg.style.display = "block";
        return;
    }
    var urls = [];
    var url;
    var caption;
    var paths;
    var dotIndex;
    for (var i = 1; i <= 8; i++) {
        url = document.getElementById("add-part-url-input" + i).value;
        if (url) {
            paths = url.split("/");
            caption = paths[paths.length - 1];
            dotIndex = caption.indexOf(".");
            if (dotIndex > -1) {
                caption = caption.substr(0, dotIndex);
            }
            urls.push({url: url, name: caption});
        }
    }
    if (urls.length === 0) {
        msg.style.display = "block";
        return;
    }

    for (var i = 1; i <= 8; i++) {
        document.getElementById("add-part-url-input" + i).value = "";
    }
    nameInput.value = "";
    msg.style.display = "none";
    
    var soundSet = {type: "SOUNDSET",
        url: "custom",
        name: name,
        data: urls,
        defaultSurface: "PRESET_VERTICAL"
    };
    tg.addPart(soundSet);
};

tg.addPart = function (soundSet) {
    var blankPart = {soundSet: soundSet};
    var part = new OMGPart(undefined,blankPart,tg.currentSection);
    tg.player.loadPart(part);
    var div = tg.loadPart(part)
    div.getElementsByClassName("part-button")[0].onclick();
};

tg.addOsc = function (type) {
  var soundSet = {"url":"PRESET_OSC_" + type.toUpperCase(),"name": type + " Oscillator",
      "type":"SOUNDSET","octave":5,"lowNote":0,"highNote":108,"chromatic":true};
  tg.addPart(soundSet);
};


/*
 * MIX FRAGMENT
 * 
*/


tg.mixButton.onclick = function () {
    tg.showMixFragment();
};
tg.showMixFragment = function () {
    if (!tg.mixFragment) {
        tg.mixFragment = document.getElementById("mix-fragment");
        tg.mixFragment.div = tg.mixFragment;
        tg.mixFragment.onhide = function () {
            tg.song.onPartAudioParamsChangeListeners.splice(
                    tg.song.onPartAudioParamsChangeListeners.indexOf(tg.mixFragment.listener), 1);
        };
    }
    var divs = [];
    tg.mixFragment.innerHTML = "";
    tg.currentSection.parts.forEach(function (part) {
        tg.makeMixerDiv(part, divs);
    });
    
    tg.hideDetails();
    tg.mixFragment.style.display = "flex";
    tg.newChosenButton(tg.mixButton);
    
    divs.forEach(function (child) {
        child.sizeCanvas();
    });
    
    tg.mixFragment.listener = (part) => {
        if (part.mixerDiv) {
            part.mixerDiv.refresh();
        }
    };
    tg.song.onPartAudioParamsChangeListeners.push(tg.mixFragment.listener);
    tg.currentFragment = tg.mixFragment;
};

tg.showSubmixFragment = function (part) {
    if (!tg.mixFragment) {
        tg.mixFragment = document.getElementById("mix-fragment");
    }
    var divs = [];
    tg.mixFragment.innerHTML = "";
    part.data.tracks.forEach(function (track) {
        tg.makeMixerDiv(track, divs);        
    });
    
    tg.hideDetails();
    tg.mixFragment.style.display = "flex";
    
    divs.forEach(function (child) {
        child.sizeCanvas();
    });
};

tg.makeMixerDiv = function (part, divs) {
    var newContainerDiv = document.createElement("div");
    newContainerDiv.className = "mixer-part";

    var audioParams = part.audioParams || part.data.audioParams;
    
    var volumeProperty = {"property": "gain", "name": "Volume", "type": "slider", "min": 0, "max": 1.5, 
            "color": audioParams.mute ?"#880000" : "#008800", transform: "square"};
    var warpProperty = {"property": "warp", "name": "Warp", "type": "slider", "min": 0, "max": 2, resetValue: 1, "color": "#880088"};
    var panProperty = {"property": "pan", "name": "Pan", "type": "slider", "min": -1, "max": 1, resetValue: 0, "color": "#000088"};
    var mixerVolumeCanvas = new SliderCanvas(null, volumeProperty, part.gain, audioParams);
    mixerVolumeCanvas.div.className = "mixer-part-volume";
    var mixerWarpCanvas = new SliderCanvas(null, warpProperty, null, audioParams);
    mixerWarpCanvas.div.className = "mixer-part-warp";
    var mixerPanCanvas = new SliderCanvas(null, panProperty, part.panner, audioParams);
    mixerPanCanvas.div.className = "mixer-part-pan";

    newContainerDiv.appendChild(mixerVolumeCanvas.div);
    newContainerDiv.appendChild(mixerWarpCanvas.div);
    newContainerDiv.appendChild(mixerPanCanvas.div);
    tg.mixFragment.appendChild(newContainerDiv);
    divs.push(mixerVolumeCanvas);
    divs.push(mixerWarpCanvas);
    divs.push(mixerPanCanvas);
    
    var captionDiv = document.createElement("div");
    captionDiv.innerHTML = part.name || (part.data.soundSet ? part.data.soundSet.name : "");
    captionDiv.className = "mixer-part-name";
    newContainerDiv.appendChild(captionDiv);
    
    newContainerDiv.refresh = function () {
        volumeProperty.color = audioParams.mute ? "#880000" : "#008800";
        mixerVolumeCanvas.drawCanvas();
        mixerWarpCanvas.drawCanvas();
        mixerPanCanvas.drawCanvas();
    };
    part.mixerDiv = newContainerDiv;
};


/*
 * SAVE FRAGMENT
 *  
*/

tg.saveButton.onclick = function () {
    tg.showFragment(tg.saveFragment);
};
tg.saveFragment = {
    div: document.getElementById("save-fragment"),
    canvas: document.getElementById("save-fragment-canvas"),
    urlInput: document.getElementById("saved-url"),
    urlLink: document.getElementById("saved-url-link")
            
};
tg.saveFragment.onshow = function () {

    if (tg.song.data.id) {
        // todo THIS SAVE STUFF!
        // what if nothing's changed?
        delete tg.song.data.id;
    }
    var json = tg.song.getData();
    var ok = false;
    try {
        JSON.parse(JSON.stringify(json));
        ok = true;
    }
    catch (e) {}
    
    if (!ok) {
        //??
        return;
    }
    
    omg.server.post(json, function (response) {
        if (response.id) {
            var savedUrl = location.origin + "/play/" + response.id;
            tg.saveFragment.urlInput.value = savedUrl;
            tg.saveFragment.urlLink.href = savedUrl;        
            tg.saveFragment.onSave(response);
        }
        else {
            tg.saveFragment.urlInput.value = "something went wrong";            
        }
    
    });    
};

tg.saveFragment.onSave = function (data) {
    var onloadScript = function () {
        tg.saveFragment.drawAndPostCanvas(data);
    };
    
    if (!tg.saveFragment.downloadedViewer) {
        var scriptTag = document.createElement("script");
        scriptTag.src = "/js/embedded_viewer.js";
        scriptTag.async = false;
        scriptTag.onload = onloadScript;
        document.body.appendChild(scriptTag);
        tg.saveFragment.downloadedViewer = true;
    }
    else {
        onloadScript();
    }
    
};

tg.saveFragment.drawAndPostCanvas = function (data) {
    var viewer = new OMGEmbeddedViewer({canvas: tg.saveFragment.canvas,
        song: tg.song,
        data: data,
        height: 630,
        width: 1200,
        predraw: function () {
            var context = tg.saveFragment.canvas.getContext("2d");
            context.fillStyle = "#99FF99";
            context.fillRect(0, 0, tg.saveFragment.canvas.width, tg.saveFragment.canvas.height);
            //tg.saveFragment.canvas
        }
    });
    tg.saveFragment.canvas.toBlob(function (blob) {
        var fd = new FormData();
        fd.append('id', data.id);
        fd.append('image', blob);
        omg.server.postHTTP("/preview", fd);
    });
};
/*
 * PART OPTIONS FRAGMENT
 * 
*/

tg.partOptionsFragment = {
    div: document.getElementById("part-options-fragment"),
    submixerButton:  document.getElementById("part-options-submixer-button"),
    liveModeButton:  document.getElementById("part-options-omglive-mode"),
    midiButton:  document.getElementById("part-options-midi-button"),
    midiBreak:  document.getElementById("part-options-midi-break"),
    liveUrlInput:  document.getElementById("part-options-omglive-url"),
    liveRoomInput:  document.getElementById("part-options-omglive-room"),
    liveModeDetails:  document.getElementById("part-options-omglive-details"),
    verticalButton:  document.getElementById("part-options-vertical-surface"),
    sequencerButton:  document.getElementById("part-options-sequencer-surface"),
    surfaceArea:  document.getElementById("part-options-surface-area"),
    randomizeButton:  document.getElementById("part-options-randomize"),
    removeButton: document.getElementById("part-options-remove-button"),
    clearButton: document.getElementById("part-options-clear-button")
};
tg.partOptionsFragment.setup = function () {
    var f = this;
        
    f.midiButton.onclick = function () {
        if (!tg.midiParts) {
            tg.turnOnMIDI();
        }
        var index = tg.midiParts.indexOf(f.part);
        var on = false;
        if (index === -1) {
            f.part.activeMIDINotes = [];
            f.part.activeMIDINotes.autobeat = 1;
            tg.midiParts.push(f.part);
            on = true;
        }
        else {
            tg.midiParts.splice(index, 1);
        }
        f.midiButton.innerHTML = "MIDI Input is " + (on ? "ON" : "OFF");
    };

    f.randomizeImg = f.randomizeButton.getElementsByTagName("img")[0];
    f.randomizeButton.onclick = function () {
        if (!tg.monkey) {
            tg.monkey = new OMGMonkey(tg.song, tg.currentSection);
        }
        if (f.part.data.surface.url === "PRESET_VERTICAL") {
            f.part.data.notes = tg.monkey.newMelody();
            tg.player.rescale(f.part, tg.song.data.keyParams, 
                tg.currentSection.data.chordProgression[tg.player.currentChordI]);
        }
        else {
            tg.monkey.getRandomElement(tg.monkey.getSequencerFunctions(f.part))();
        }
        f.randomizeImg.className = "monkey-spin";
        setTimeout(function () {f.randomizeImg.className = "monkey";}, 1100);
    };    
    
    f.liveModeButton.onclick = function () {
        if (f.part.omglive) {
            f.part.socket.disconnect()
            f.part.omglive = null;
        }
        else {
            if (!f.part.liveRoom) {
                f.part.liveRoom = tg.getOMGLiveRoomName(f.part);
            }
            tg.turnOnLiveMode(f.part);
        }
        f.setLiveModeUI();
    };
    
    f.verticalButton.onclick = function () {
        f.part.data.surface.url = "PRESET_VERTICAL";
        if (!f.part.data.notes) {
            f.part.data.notes = [];
        }
        tg.instrument.show(f.part);
    };
    f.sequencerButton.onclick = function () {
        f.part.data.surface.url = "PRESET_SEQUENCER";
        if (!f.part.data.tracks) {
            f.part.makeTracks();
        }
        tg.sequencer.show(f.part);
    };
    
    f.setLiveModeUI =  function () {
        if (f.part.omglive) {
            f.liveModeButton.innerHTML = "OMG Live Mode is ON";
            f.liveModeDetails.style.display = "block";
            
            f.liveRoomInput.value = f.part.liveRoom;
            f.liveUrlInput.value = window.origin + "/live/" + encodeURIComponent(f.part.liveRoom);
        }
        else {
            f.liveModeButton.innerHTML = "OMG Live Mode is OFF";
            f.liveModeDetails.style.display = "none";            
        }
    };
    
    
    f.clearButton.onclick = function () {
        if (f.part.data.notes) {
            f.part.data.notes = [];
        }
        if (f.part.data.tracks) {
            for (var i = 0; i < f.part.data.tracks.length; i++) {
                for (var j = 0; j < f.part.data.tracks[i].data.length; j++) {
                    f.part.data.tracks[i].data[j] = false;
                }
            }
        }
    };
    f.removeButton.onclick = function () {
        var i = tg.currentSection.parts.indexOf(f.part);
        if (i > -1) {
            tg.currentSection.parts.splice(i, 1)
            tg.currentSection.data.parts.splice(i, 1)
            tg.partList.removeChild(tg.partList.children[i])
        }
        tg.hideDetails();
    }
    
    f.submixerButton.onclick = function () {
        tg.showSubmixFragment(f.part);
    };

};
tg.partOptionsFragment.setup();


tg.partOptionsFragment.onshow = function (part) {
    var f = this;
    f.part = part;

    if (!f.randomizeImg.getAttribute("src")) {
        f.randomizeImg.src = "/img/monkey48.png";
    }

    f.midiButton.style.display = omg.midi.api && 
            part.data.surface.url === "PRESET_VERTICAL" && 
            part.data.soundSet.chromatic ? "block" : "none";
    f.midiBreak.style.display = f.midiButton.style.display;
    f.midiButton.innerHTML = "MIDI Input is " + 
            (tg.midiParts && tg.midiParts.indexOf(part) > -1 ? 
            "ON" : "OFF");
    
    if (part.data.surface.url === "PRESET_VERTICAL") {
        f.verticalButton.style.display = "none";
        f.sequencerButton.style.display = "block";
        f.submixerButton.style.display = "none";
        f.liveModeButton.style.display = "block";
    }
    else {
        f.sequencerButton.style.display = "none";
        f.verticalButton.style.display = "block";
        f.submixerButton.style.display = "block";
        f.liveModeButton.style.display = "none";
    }
    if (part.osc) {
        f.sequencerButton.style.display = "none";        
    }

    f.liveRoomInput.onkeypress = function (e) {
        if (e.keyCode === 13) {
            if (f.liveRoomInput.value !== part.liveRoom) {
                tg.switchOMGLiveRoom(part, f.liveRoomInput.value);
                f.liveUrlInput.value = window.origin + "/live/" + encodeURIComponent(part.liveRoom);
            }
        }
    };

    f.surfaceArea.style.display = part.osc ? "none" : "block";

    f.setLiveModeUI();    
    
    tg.partFXListDiv = document.getElementById("part-options-fx-list");
    tg.setupAddFXButtons(part, 
            document.getElementById("part-options-add-fx-button"), 
            document.getElementById("part-options-available-fx"), 
            tg.partFXListDiv);
    tg.setupPartOptionsFX(part, tg.partFXListDiv);
};



/*
 * FX functions used by PART OPTIONS and SONG OPTIONS
 * 
*/



tg.availableFX = ["Delay", "Chorus", "Phaser", "Overdrive", "Compressor", 
    "Reverb", "Filter", "Cabinet", "Tremolo", 
    "Wah Wah", "Bitcrusher", "Moog", "Ping Pong"
];

tg.setupAddFXButtons = function (part, addButton, availableFXDiv, fxList) {
    availableFXDiv.style.display = "none";
    availableFXDiv.innerHTML = "";
    for (let fx in tg.player.fx) {
        var fxDiv = document.createElement("div");
        fxDiv.className = "fx-button"
        fxDiv.innerHTML = fx;
        fxDiv.onclick = function () {
            tg.addFXToPart(fx, part, fxList);
            addButton.onclick();
        };
        availableFXDiv.appendChild(fxDiv);
    }
    
    addButton.innerHTML = "Add FX";
    addButton.onclick = function () {
        if (availableFXDiv.style.display === "none") {
            availableFXDiv.style.display = "flex";
            addButton.innerHTML = "Hide FX";
        }
        else {
            availableFXDiv.style.display = "none"
            addButton.innerHTML = "Add FX";
        }
    };
};

tg.addFXToPart = function (fxName, part, fxList) {
    var fxNode = tg.player.addFXToPart(fxName, part);
    tg.setupFXDiv(fxNode, part, fxList);
};

tg.setupPartOptionsFX = function (part, fxListDiv) {
    fxListDiv.innerHTML = "";
    part.fx.forEach(function (fx) {
        tg.setupFXDiv(fx, part, fxListDiv);
    });
};

tg.setupFXDiv = function (fx, part, fxListDiv) {
    var holder = document.createElement("div");
    holder.className = "fx-controls";
    var captionDiv = document.createElement("div");
    captionDiv.className = "fx-controls-caption";
    captionDiv.innerHTML = fx.data.name;
    holder.appendChild(captionDiv);
    fxListDiv.appendChild(holder);
    tg.setupFXControls(fx, part, holder);
    
    var tools = document.createElement("div");
    tools.className = "fx-controls-tools";
    holder.appendChild(tools);
    var bypassButton = document.createElement("div");
    bypassButton.innerHTML = "Bypass FX";
    bypassButton.onclick = function () {
        fx.bypass = !fx.bypass ? 1 : 0;
        fx.data.bypass = fx.bypass ? 1 : 0;
        bypassButton.classList.toggle("selected-option");
    };
    var removeButton = document.createElement("div");
    removeButton.innerHTML = "Remove FX";
    removeButton.onclick = function () {
        fxListDiv.removeChild(holder);
        tg.player.removeFXFromPart(fx, part);
    };
    tools.appendChild(bypassButton);
    tools.appendChild(removeButton);
    
    if (fx.bypass) {
        bypassButton.classList.add("selected-option");
    }
};

tg.setupFXControls = function (fx, part, fxDiv) {
    var controls = tg.player.fx[fx.data.name].controls;
    var divs = [];
    controls.forEach(function (control) {        
        var canvas = document.createElement("canvas");
        canvas.className = "fx-slider";
        fxDiv.appendChild(canvas);
        var div = new SliderCanvas(canvas, control, fx, fx.data);
        divs.push(div);
    });
    fx.controlDivs = divs;
    divs.forEach((div) => {
        div.sizeCanvas();

    });
};


/*
 * SLIDER CANVAS CLASS
 * 
*/



function SliderCanvas(canvas, controlInfo, audioNode, data) {
    var m = this;
    if (!canvas) {
        canvas = document.createElement("canvas");
    }
    var offsets = omg.ui.totalOffsets(canvas);
    canvas.onmousedown = function (e) {
        offsets = omg.ui.totalOffsets(canvas);
        m.ondown(e.clientX - offsets.left);
    };
    canvas.onmousemove = function (e) {
        m.onmove(e.clientX - offsets.left);};
    canvas.onmouseup = function (e) {m.onup();};
    canvas.onmouseout = function (e) {m.onup();};
    canvas.ontouchstart = function (e) {
        offsets = omg.ui.totalOffsets(canvas);
        m.ondown(e.targetTouches[0].pageX - offsets.left);
    };
    canvas.ontouchmove = function (e) {
        m.onmove(e.targetTouches[0].pageX - offsets.left);
    };
    canvas.ontouchend = function (e) {m.onup();};

    this.div = canvas;
    this.ctx = canvas.getContext("2d");
    this.data = data;
    this.audioNode = audioNode;
    this.controlInfo = controlInfo;
    this.percent = 0;
    this.isAudioParam = audioNode && typeof audioNode[controlInfo.property] === "object";
    
    this.frequencyTransformScale = Math.log(controlInfo.max) - Math.log(controlInfo.min);
    
    if (typeof this.controlInfo.resetValue === "number") {
        var slider = this;
        this.div.ondblclick = function () {
            slider.onupdate(slider.controlInfo.resetValue);
        };
    }
}

SliderCanvas.prototype.ondown = function (x) {
    this.isTouching = true;
    this.onnewX(x);
};
SliderCanvas.prototype.onmove = function (x) {
    if (this.isTouching) {
        this.onnewX(x);
    }
};
SliderCanvas.prototype.onnewX = function (x) {
    this.percent = x / this.div.clientWidth;
    
    if (this.controlInfo.type === "options") {
        var i = Math.floor(this.percent * this.controlInfo.options.length);
        this.onupdate(this.controlInfo.options[Math.min(this.controlInfo.options.length - 1, i)]);
        return;
    }

    if (this.controlInfo.transform === "square") {
        this.percent = this.percent * this.percent;
    }
    var value;
    if (this.controlInfo.min === 20 && this.controlInfo.max > 10000) {
        value = Math.exp(this.percent * this.frequencyTransformScale + Math.log(this.controlInfo.min));
    }
    else {
        value = Math.min(this.controlInfo.max, 
                 Math.max(this.controlInfo.min, 
            (this.controlInfo.max - this.controlInfo.min) * this.percent + this.controlInfo.min));
    }
    this.onupdate(value);
};

SliderCanvas.prototype.onupdate = function (value) {
    if (this.audioNode) {
        if (this.isAudioParam) {
            this.audioNode[this.controlInfo.property].setValueAtTime(value, tg.player.context.currentTime);
        }
        else {
            this.audioNode[this.controlInfo.property] = value;
        }
    }
    if (this.data) {
        this.data[this.controlInfo.dataProperty || this.controlInfo.property] = value;
    }
    this.drawCanvas(this.div);    
};
SliderCanvas.prototype.onup = function (e) {
    this.isTouching = false;
};
SliderCanvas.prototype.sizeCanvas = function () {
    this.div.width = this.div.clientWidth;
    this.div.height = this.div.clientHeight;
    this.drawCanvas();
};
SliderCanvas.prototype.drawOptionsCanvas = function () {    
    var value = this.controlInfo.options.indexOf(this.data[this.controlInfo.property]);
    
    this.ctx.fillRect(value * this.div.clientWidth / this.controlInfo.options.length,
        0, this.div.clientWidth / this.controlInfo.options.length, this.div.height);
    this.ctx.fillStyle = "white";
    this.ctx.font = "10pt sans-serif";
    this.ctx.fillText(this.controlInfo.name, 10, this.div.height / 2 + 5);
    var caption = this.controlInfo.options[value];
    
    var valueLength = this.ctx.measureText(caption).width;
    this.ctx.fillText("", 0, 0);
    this.ctx.fillText(caption, this.div.clientWidth - valueLength - 10, this.div.height / 2 + 5);
};
SliderCanvas.prototype.drawCanvas = function () {
    this.div.width = this.div.width;
    this.ctx.fillStyle = this.controlInfo.color || "#008800";
    
    if (this.controlInfo.type === "options") {
        this.drawOptionsCanvas();
        return;
    }
    
    var value = this.data[this.controlInfo.dataProperty || this.controlInfo.property];
    var percent = value;
    percent = (percent - this.controlInfo.min) / (this.controlInfo.max - this.controlInfo.min);
    if (this.controlInfo.transform === "square") {
        percent = Math.sqrt(percent);
    }
    if (this.controlInfo.min === 20 && this.controlInfo.max > 10000) {
        percent = (Math.log(value) - Math.log(this.controlInfo.min)) / this.frequencyTransformScale;
    }
    var startX = this.controlInfo >= 0 ? 0 : 
            ((0 - this.controlInfo.min) / (this.controlInfo.max - this.controlInfo.min));
    startX = startX * this.div.clientWidth;
    if (startX) {
        this.ctx.fillRect(startX - 2, 0, 4, this.div.height);
    }
    this.ctx.fillRect(startX, 0, percent * this.div.clientWidth - startX, this.div.height);
    this.ctx.fillStyle = "white";
    this.ctx.font = "10pt sans-serif";
    this.ctx.fillText(this.controlInfo.name, 10, this.div.height / 2 + 5);
    var suffix = "";
    if (value > 1000) {
        value = value / 1000;
        suffix = "K";
    }
    value = Math.round(value * 100) / 100;
    value = value + "" + suffix;
    var valueLength = this.ctx.measureText(value).width;
    this.ctx.fillText("", 0, 0);
    this.ctx.fillText(value, this.div.clientWidth - valueLength - 10, this.div.height / 2 + 5);

};


/*
 * USER FRAGMENT
 * 
*/


tg.userButton = document.getElementById("main-fragment-user-button");
tg.userButton.onclick = function () {
    tg.hideDetails();
    tg.showUserFragment();
    tg.newChosenButton(tg.userButton);
};
tg.showUserFragment = function () {
    if (!tg.userFragment) {
        tg.userFragment = document.getElementById("user-fragment");
        document.getElementById("user-logout-button").onclick = function () {
            omg.server.logout(() => {
                tg.onlogin(undefined);
            });
        };
        document.getElementById("user-login-button").onclick = function () {
            omg.server.login(
                document.getElementById("user-login-username").value, 
                document.getElementById("user-login-password").value, function (results) {
                    if (results) {
                        document.getElementById("user-login-signup").style.display = "none";
                        tg.onlogin(results);
                        tg.showUserThings();
                    }
                    else {
                        document.getElementById("user-login-invalid").style.display = "inline-block";
                    }
                });
        };
        document.getElementById("user-signup-button").onclick = function () {
            omg.server.signup(
                document.getElementById("user-signup-username").value, 
                document.getElementById("user-signup-password").value, function (results) {
                    if (results) {                        
                        tg.onlogin(results);
                        tg.showUserThings();
                    }
                    else {
                        document.getElementById("user-login-invalid").style.display = "inline-block";
                    }
                });
        };
    }
    
    if (tg.user) {
        document.getElementById("user-login-signup").style.display = "none";
        tg.showUserThings();
    }
    
    tg.userFragment.style.display = "block";
};

tg.showUserThings = function () {
    var listDiv = document.getElementById("user-fragment-detail-list");
    listDiv.innerHTML = "";
    omg.util.getUserThings(tg.user, listDiv, function (thing) {
        if (thing.type && thing.type === "SOUNDSET") {
            tg.addPart(thing);
        }
        else {
            tg.loadSong(thing);
            if (window.innerWidth < window.innerHeight) {
                tg.hideDetails(true);
            }
        }
    });
};

tg.onlogin = function (user) {
    tg.user = user;
    document.getElementById("tool-bar-user-button").innerHTML = user ? user.username : "Login";
    document.getElementById("user-login-signup").style.display = user ? "none" : "block";
    document.getElementById("user-info").style.display = user ? "block" : "none";
    document.getElementById("user-info-username").innerHTML = user ? user.username : "Login";
};


/*
 * SONG FRAGMENT
 * 
*/


tg.songButton = document.getElementById("main-fragment-song-button");
tg.songButton.onclick = function () {
    tg.hideDetails();
    tg.showSongFragment();
    tg.newChosenButton(tg.songButton);
};
tg.showSongFragment = function () {
    if (!tg.songFragment) {
        tg.songFragment = document.getElementById("song-fragment");
        tg.songFragment.nameInput = document.getElementById("song-info-name");
        tg.songFragment.tagsInput = document.getElementById("song-info-tags");
        document.getElementById("song-info-update").onclick = function () {
            tg.song.data.name = tg.songFragment.nameInput.value;
            document.getElementById("tool-bar-song-button").innerHTML = tg.songFragment.nameInput.value;
            tg.song.data.tags = tg.songFragment.tagsInput.value;
        };
    }
    tg.songFragment.nameInput.value = tg.song.data.name || "";
    tg.songFragment.tagsInput.value = tg.song.data.tags || "";
    
    document.getElementById("create-new-song-button").onclick = function () {
        tg.loadSong(tg.newBlankSong());
    };
    var randomizeButton = document.getElementById("create-random-song-button");
    var randomizeImg = randomizeButton.getElementsByTagName("img")[0];
    if (!randomizeImg.getAttribute("src")) {
        randomizeImg.src = "/img/monkey48.png";
    }
    
    randomizeButton.onclick = function () {
        var rs = OMGMonkey.prototype.newSong();
        console.log(rs);
        tg.loadSong(rs);
        
        randomizeImg.className = "monkey-spin";
        setTimeout(()=> randomizeImg.className = "monkey", 1100);
    };
        
    tg.songFragment.style.display = "block";
};

tg.newBlankSong = function () {
    return {
        "name":"","type":"SONG","sections":[
            {"name": "Intro", "type":"SECTION","parts":[],"chordProgression":[0]}
        ],
        "keyParams":{"scale":[0,2,4,5,7,9,11],"rootNote":0},
        "beatParams":{"bpm":120,"beats":4,"shuffle":0,"measures":1,"subbeats":4}
    };
};

/*
 * SECTION FRAGMENT
 */


tg.sectionButton = document.getElementById("main-fragment-section-button");
tg.sectionButton.onclick = function () {
    tg.hideDetails();
    tg.showSectionFragment();
    tg.newChosenButton(tg.sectionButton);
};
tg.sectionFragment = {};
tg.sectionFragment.div = document.getElementById("section-fragment");
tg.sectionFragment.div.onclick = function () {
    tg.sectionFragment.presetNameMenuDiv.style.display = "none";
    tg.sectionFragment.contextMenuNameDiv = null;
};
tg.sectionFragment.listDiv = document.getElementById("section-fragment-list");
tg.sectionFragment.arrangementDiv = document.getElementById("section-arrangement-list");
tg.sectionFragment.presetNameMenuDiv = document.getElementById("preset-section-name-menu");
tg.sectionFragment.presetNameListDiv = document.getElementById("preset-section-name-list");
document.getElementById("copy-section-button").onclick = function () {
    var section = tg.copySection();
    tg.sectionFragment.addSectionListItem(section)
};
tg.sectionFragment.renameInput = document.getElementById("section-rename-input");
tg.sectionFragment.renameInput.onclick = function () {
    //?
    //tg.currentSection.name = tg.sectionFragment.renameInput.value;
    //tg.setSongControlsUI();
};
["Intro", "Preverse", "Verse", "Prechorus", 
    "Chorus", "Bridge", "Solo", "Breakdown", 
    "Refrain", "Outro"].forEach(sectionName => {
        var presetNameDiv = document.createElement("div");
        presetNameDiv.className = "preset-name-list-item";
        presetNameDiv.innerHTML = sectionName;
        presetNameDiv.onclick = function () {
            if (sectionName !== tg.sectionFragment.contextMenuSection.data.name) {
                tg.sectionFragment.updateSectionName(sectionName);
            }
        };
        tg.sectionFragment.presetNameListDiv.appendChild(presetNameDiv);
    });
tg.sectionFragment.contextMenuRemove = document.createElement("button");
tg.sectionFragment.contextMenuRemove.innerHTML = "Remove Section";
tg.sectionFragment.contextMenuRemove.onclick = function (e) {
    e.stopPropagation();
    tg.sectionFragment.presetNameMenuDiv.style.display = "none";
    var index = tg.song.sections.indexOf(tg.sectionFragment.contextMenuSection);
    if (tg.song.sections.length > 1) {
        tg.song.sections.splice(index, 1);
        tg.sectionFragment.listDiv.removeChild(tg.sectionFragment.contextMenuSectionDiv);
    }
    
};
tg.sectionFragment.presetNameListDiv.appendChild(tg.sectionFragment.contextMenuRemove);
tg.sectionFragment.renameInput.onclick = function (e) {
    e.stopPropagation();
};
tg.sectionFragment.renameInput.onkeypress = function (e) {
    if (e.keyCode === 13) {
        if (e.target.value !== tg.sectionFragment.contextMenuSection.data.name) {
            tg.sectionFragment.updateSectionName(e.target.value);
        }
        tg.sectionFragment.presetNameMenuDiv.style.display = "none";
    }
};

tg.sectionFragment.updateSectionName = (sectionName) => {
    var names = tg.song.sections.map(section => section.data.name);
    sectionName = omg.util.getUniqueName(sectionName, names);
  
    for (var i = 0; i < tg.song.arrangement.length; i++) {
        if (tg.song.arrangement[i].data.name === tg.sectionFragment.contextMenuSection.data.name) {
            tg.song.arrangement[i].data.name = sectionName;
            tg.song.arrangement[i].updateCaption();
        }
    }
    tg.sectionFragment.contextMenuSection.data.name = sectionName;
    tg.sectionFragment.contextMenuNameDiv.innerHTML = sectionName;
    tg.sectionFragment.presetNameMenuDiv.style.display = "none";
    tg.setSongControlsUI();
};

tg.sectionFragment.updateSelectedSection = (sectionDiv, section) => {
    if (tg.sectionFragment.selectedSection) {
        tg.sectionFragment.selectedSection.classList.remove("selected-option");
    }
    sectionDiv.classList.add("selected-option");
    tg.sectionFragment.selectedSection = sectionDiv;
    tg.sectionFragment.lastSelectedSection = section;
};
tg.sectionFragment.addSectionListItem = (section) => {
    var sectionDiv = document.createElement("div");
    sectionDiv.className = "section-list-item";

    var sectionNameDiv = document.createElement("div");
    sectionNameDiv.className = "section-list-item-name";
    sectionNameDiv.innerHTML = section.data.name || "(Untitled)";

    var sectionRenameDiv = document.createElement("div");
    sectionRenameDiv.className = "section-list-item-rename";
    sectionRenameDiv.innerHTML = "&#9776;";
    sectionRenameDiv.onclick = function (e) {
        e.stopPropagation();
        if (tg.sectionFragment.contextMenuNameDiv === sectionNameDiv) {
            tg.sectionFragment.presetNameMenuDiv.style.display = "none";
            tg.sectionFragment.contextMenuNameDiv = null;
            return;
        }
        //var offsets = omg.ui.totalOffsets(sectionDiv, tg.sectionFragment.div);
        var offsets = {top: sectionDiv.offsetTop, left: sectionDiv.offsetLeft};
        tg.sectionFragment.presetNameMenuDiv.style.left = offsets.left + "px";
        tg.sectionFragment.presetNameMenuDiv.style.top = offsets.top + sectionDiv.clientHeight + "px";
        tg.sectionFragment.presetNameMenuDiv.style.width = sectionDiv.clientWidth / 2 + "px";
        tg.sectionFragment.presetNameMenuDiv.style.display = "block";

        tg.sectionFragment.contextMenuSection = section;
        tg.sectionFragment.contextMenuNameDiv = sectionNameDiv;
        tg.sectionFragment.contextMenuSectionDiv = sectionDiv;
        tg.sectionFragment.renameInput.value = section.data.name;
        
        var inArrangement = false;
        for (var i = 0; i < tg.song.arrangement.length; i++) {
            if (tg.song.arrangement[i].data.name === section.data.name) {
                inArrangement = true;
                break;
            }
        }
        if (inArrangement || tg.song.sections.length === 1) {
            tg.sectionFragment.contextMenuRemove.style.display = "none";
        }
        else {
            tg.sectionFragment.contextMenuRemove.style.display = "block";
        }
    };

    sectionDiv.onclick = function () {
        tg.loadSection(section);
        tg.player.loopSection = tg.song.sections.indexOf(section);
        tg.sectionFragment.updateSelectedSection(sectionDiv, section);
        tg.setSongControlsUI();
    };
    if (section === tg.currentSection) {
        tg.sectionFragment.updateSelectedSection(sectionDiv, section);
    }
    sectionDiv.appendChild(sectionRenameDiv);
    sectionDiv.appendChild(sectionNameDiv);
    
    var addToArrangementButton = document.createElement("div");
    addToArrangementButton.innerHTML = "+";
    addToArrangementButton.className = "section-list-item-add-to-arrangement";
    addToArrangementButton.onclick = function (e) {
        e.stopPropagation();
        if (!tg.song.arrangement) {
            tg.song.arrangement = [];
        }
        tg.song.arrangement.push({section: section, data: {repeat: 0, name: section.data.name}});
        tg.sectionFragment.addArrangementListItem(tg.song.arrangement[tg.song.arrangement.length - 1]);
        tg.sectionFragment.updateArrangementElements();
    };
    sectionDiv.appendChild(addToArrangementButton);
    
    tg.sectionFragment.listDiv.appendChild(sectionDiv);
    return sectionDiv;
};

tg.sectionFragment.addArrangementListItem = (arrangementItem) => {
    var section = arrangementItem.section;
    var sectionDiv = document.createElement("div");
    sectionDiv.className = "section-list-item";
    arrangementItem.div = sectionDiv;

    arrangementItem.sectionNameDiv = document.createElement("div");
    arrangementItem.sectionNameDiv.className = "section-list-item-name";
    arrangementItem.updateCaption = function () {
        var caption = (arrangementItem.data.name || "(Untitled)");
        if (arrangementItem.data.repeat > 0) {
            caption += " x" + (arrangementItem.data.repeat + 1);
        }
        arrangementItem.sectionNameDiv.innerHTML = caption;
    };
    arrangementItem.updateCaption();

    var moveUpDiv = document.createElement("div");
    moveUpDiv.className = "arrangement-move-button";
    moveUpDiv.innerHTML = "&uarr;";
    moveUpDiv.onclick = function (e) {
        e.stopPropagation();
        var index = tg.song.arrangement.indexOf(arrangementItem);
        if (index > 0) {
            tg.song.arrangement.splice(index, 1);
            tg.song.arrangement.splice(index - 1, 0, arrangementItem);
            tg.sectionFragment.arrangementDiv.insertBefore(arrangementItem.div, 
                        tg.song.arrangement[index].div);
        }
    };
    var moveDownDiv = document.createElement("div");
    moveDownDiv.className = "arrangement-move-button";
    moveDownDiv.innerHTML = "&darr;";
    moveDownDiv.onclick = function (e) {
        e.stopPropagation();
        var index = tg.song.arrangement.indexOf(arrangementItem);
        if (index < tg.song.arrangement.length - 1) {
            tg.song.arrangement.splice(index, 1);
            tg.song.arrangement.splice(index + 1, 0, arrangementItem);
            tg.sectionFragment.arrangementDiv.insertBefore(arrangementItem.div, 
                        tg.song.arrangement[index].div.nextSibling);
        }
    };

    var repeatUpDiv = document.createElement("div");
    repeatUpDiv.className = "arrangement-move-button";
    repeatUpDiv.innerHTML = "&plus;";
    repeatUpDiv.onclick = function (e) {
        e.stopPropagation();
        arrangementItem.data.repeat++;
        arrangementItem.updateCaption();
    };
    var repeatDownDiv = document.createElement("div");
    repeatDownDiv.className = "arrangement-move-button";
    repeatDownDiv.innerHTML = "&minus;";
    repeatDownDiv.onclick = function (e) {
        e.stopPropagation();
        if (arrangementItem.data.repeat > 0) {
            arrangementItem.data.repeat--;
            arrangementItem.updateCaption();
        }
    };

    sectionDiv.onclick = function () {
        tg.loadSection(section);
        tg.player.loopSection = -1;
        tg.song.loop = true;
        if (!tg.player.playing) {
            tg.player.startArrangementAt = tg.song.arrangement.indexOf(arrangementItem);
            tg.player.play();
        }
        else {
            tg.player.arrangementI = tg.song.arrangement.indexOf(arrangementItem);
            tg.player.section = tg.song.arrangement[tg.player.arrangementI].section;
        }
        tg.sectionFragment.updateSelectedSection(sectionDiv, section);
        tg.setSongControlsUI();
    };
    sectionDiv.appendChild(moveUpDiv);
    sectionDiv.appendChild(moveDownDiv);
    sectionDiv.appendChild(repeatDownDiv);
    sectionDiv.appendChild(repeatUpDiv);
    sectionDiv.appendChild(arrangementItem.sectionNameDiv);
    
    var removeFromArrangementButton = document.createElement("div");
    removeFromArrangementButton.innerHTML = "&times;";
    removeFromArrangementButton.className = "arrangement-item-remove";
    removeFromArrangementButton.onclick = function () {
        tg.song.arrangement.splice(tg.song.arrangement.indexOf(arrangementItem), 1);
        tg.sectionFragment.arrangementDiv.removeChild(sectionDiv);
        tg.sectionFragment.updateArrangementElements();
    };
    sectionDiv.appendChild(removeFromArrangementButton);
    
    tg.sectionFragment.arrangementDiv.appendChild(sectionDiv);
    return sectionDiv;
};

tg.sectionFragment.playArrangementButton = document.getElementById("section-arrangement-play");
tg.sectionFragment.playArrangementButton.onclick = function () {
    tg.player.loopSection = -1;
    tg.player.arrangementI = -1;
    tg.song.loop = false;
    if (!tg.player.playing) {
        tg.player.play();
    }
};
tg.sectionFragment.emptyMessage = document.getElementById("section-arrangement-empty-message");

tg.sectionFragment.onBeatPlayedListener = function (subbeat, section) {
    if (subbeat > 0 || tg.sectionFragment.lastSelectedSection === section) {
        return;
    }
    var div;
    if (tg.player.loopSection === -1 ) {
        div = tg.sectionFragment.arrangementDiv.children[tg.player.arrangementI];
    }
    else {
        div = tg.sectionFragment.listDiv.children[tg.song.sections.indexOf(section)];
    }
    
    if (div) {
        tg.sectionFragment.updateSelectedSection(div, section);
    }
    else {
        tg.sectionFragment.lastSelectedSection = section;
    }
};

tg.showSectionFragment = function () {
    tg.sectionFragment.lastSelectedSection = tg.currentSection;
    tg.sectionFragment.presetNameMenuDiv.style.display = "none";
    tg.sectionFragment.listDiv.innerHTML = "";
    tg.song.sections.forEach(section => {
        tg.sectionFragment.addSectionListItem(section);
    });
    tg.sectionFragment.arrangementDiv.innerHTML = "";
    tg.song.arrangement.forEach(section => {
        tg.sectionFragment.addArrangementListItem(section);
    });
    tg.sectionFragment.updateArrangementElements();
    tg.sectionFragment.div.style.display = "block";
    
    tg.player.onBeatPlayedListeners.push(tg.sectionFragment.onBeatPlayedListener);
    
    tg.currentFragment = tg.sectionFragment;
};

tg.sectionFragment.onhide = function () {
    var index = tg.player.onBeatPlayedListeners.indexOf(this.onBeatPlayedListener);
    tg.player.onBeatPlayedListeners.splice(index, 1);
};

tg.sectionFragment.updateArrangementElements = function () {
    tg.sectionFragment.playArrangementButton.style.display = tg.song.arrangement.length > 0 ?
            "block" : "none";
    tg.sectionFragment.emptyMessage.style.display = tg.song.arrangement.length > 0 ?
            "none" : "block";
};

tg.copySection = function (name) {
    var newSectionData = JSON.parse(JSON.stringify(tg.currentSection.getData()));
    if (name) newSectionData.name = name;
    var names = tg.song.sections.map(section => section.data.name);
    newSectionData.name = omg.util.getUniqueName(newSectionData.name, names);
    var newSection = new OMGSection(null, newSectionData, tg.song);
    tg.loadSection(newSection);
    tg.player.loadSection(newSection);
    tg.player.loopSection = tg.song.sections.indexOf(newSection);
    return newSection;
};



/*
 * SONG OPTIONS FRAGMENT
 * 
*/


tg.songOptionsButton = document.getElementById("song-options-button");
tg.songOptionsButton.onclick = function () {
    tg.showFragment(tg.songOptionsFragment, tg.songOptionsButton);
};
tg.songOptionsFragment = {
    div: document.getElementById("song-options-fragment"),
    fxTab: document.getElementById("song-options-fx-tab"),
    randomTab: document.getElementById("song-options-random-tab"),
    fx: document.getElementById("song-options-fx"),
    random: document.getElementById("song-options-random"),
    addFXButton: document.getElementById("song-options-add-fx-button"),
    availableFXList: document.getElementById("song-options-available-fx"),
    fxList: document.getElementById("song-options-fx-list"),
    volumeCanvas: document.getElementById("song-options-master-gain"),
    changeableList: document.getElementById("song-options-changeable-list"),
    updateTabs: function (e) {
        if (tg.songOptionsFragment.lastTab) {
            tg.songOptionsFragment.lastTab.classList.remove("selected-option");
        }
        tg.songOptionsFragment.lastTab = e.target;
        e.target.classList.add("selected-option");
    },
    onshow: function () {
        
        if (!tg.songOptionsFragment.isSetup) {
            tg.songOptionsFragment.setup();
            tg.songOptionsFragment.isSetup = true;
        }
        
        if (!tg.songOptionsFragment.isSetupForSong) {
            tg.songOptionsFragment.setupForSong();
            tg.songOptionsFragment.isSetupForSong = true;
        }
    }
};
tg.songOptionsFragment.setup = function () {

    tg.songOptionsFragment.isSetup = true;

    tg.songOptionsFragment.fxTab.onclick = function (e) {
        tg.songOptionsFragment.fx.style.display = "block";
        tg.songOptionsFragment.random.style.display = "none";
        tg.songOptionsFragment.updateTabs(e);
    };
    tg.songOptionsFragment.randomTab.onclick = function (e) {
        tg.songOptionsFragment.fx.style.display = "none";
        tg.songOptionsFragment.random.style.display = "block";
        tg.songOptionsFragment.updateTabs(e);
    };
    
    tg.songOptionsFragment.fxTab.onclick({target: tg.songOptionsFragment.fxTab});
};
tg.songOptionsFragment.setupForSong = function () {
    tg.setupAddFXButtons(tg.song, this.addFXButton, this.availableFXList, this.fxList);

    this.fxList.innerHTML = "";
    tg.setupPartOptionsFX(tg.song, this.fxList);

    tg.song.fx.forEach(fx => {
        fx.controlDivs.forEach((div) => {
            div.sizeCanvas();
        });
    });

    var volumeProperty = {"property": "gain", "name": "Volume", "type": "slider", "min": 0, "max": 1.5, 
            "color": "#008800", transform: "square"};
    this.volumeControl = new SliderCanvas(this.volumeCanvas, volumeProperty, tg.song.postFXGain, tg.song);
    this.volumeControl.div.className = "fx-slider";
    this.volumeControl.sizeCanvas();

    this.changeableList.innerHTML = "";
    
    tg.monkey = new OMGMonkey(tg.song, tg.currentSection);
    this.setupMonkeyWaitTime();
    tg.monkey.changeables.forEach(changeable => {
        tg.songOptionsFragment.setupMonkeyChangeable(changeable);
    });
};
tg.songOptionsFragment.setupMonkeyChangeable = function (changeable) {
    if (!tg.monkey.headDivs) {
        tg.monkey.headDivs = [];
    }
    var div = document.createElement("div");
    var titleDiv = document.createElement("div");
    titleDiv.className = "randomizer-title";
    titleDiv.innerHTML = changeable.name;
    var img = document.createElement("img");
    tg.monkey.headDivs.push(img);
    img.className = "monkey";
    img.src = "/img/monkey48.png";
    img.onclick = function () {
        img.className = "monkey-spin";
        setTimeout(function () {
            img.className = "monkey";
        }, 1100);
        tg.monkey.getRandomElement(changeable.functions)();
    };
    var input = document.createElement("input");
    input.type = "range";
    input.value = 0;
    input.onchange = function () {
        changeable.probability = input.value / 100;
    };
    div.appendChild(titleDiv);
    div.appendChild(img);
    div.appendChild(input);
    this.changeableList.appendChild(div);
};

tg.songOptionsFragment.setupMonkeyWaitTime = function (changeable) {
    var div = document.createElement("div");
    var titleDiv = document.createElement("div");
    titleDiv.className = "randomizer-title";
    titleDiv.innerHTML = "Auto Off";
    var img = document.createElement("img");
    img.className = "monkey";
    img.src = "/img/monkey48.png";
    img.onclick = function () {
        img.className = "monkey-spin";
        setTimeout(function () {
            img.className = "monkey";
        }, 1100);
        tg.monkey.headDivs.forEach(div => {
             div.className = "monkey-spin";
             setTimeout(function () {
                 div.className = "monkey";
             }, 1100);
        });
        tg.monkey.randomize();
    };
    var input = document.createElement("input");
    input.type = "range";
    input.value = 0;
    input.min = 0;
    input.max = 60 * 5;
    input.onchange = function () {
        var start = false;
        titleDiv.innerHTML = "Auto " + (input.value > 0 ? input.value + " seconds" : "Off");
        if (!tg.monkey.loop && input.value > 0) {
            start = true;
        }
        tg.monkey.loop = input.value * 1;
        if (start) {
            tg.monkey.randomize();
        }
    };
    div.appendChild(titleDiv);
    div.appendChild(img);
    div.appendChild(input);
    this.changeableList.appendChild(div);
};

/*
 * OMG LIVE!
 * 
*/

tg.turnOnLiveMode = function (part) {
    part.omglive = {users: {}, notes: []};
    part.omglive.notes.autobeat = 1;

    var onready = function () {
        part.socket = io("/omg-live");
        part.socket.emit("startSession", part.liveRoom);
        part.socket.on("basic", function (data) {
            if (data.x === -1) {
                tg.omgLiveDataEnd(part, data);
            }
            else {
                tg.omgLiveData(part, data);
            }
            if (!tg.player.playing && tg.currentFragment === tg.instrument) {
                tg.instrument.mm.draw();
            }
        });
    };

    if (typeof io !== "undefined") {
        onready();
        return;
    }
    var scriptTag = document.createElement("script");
    scriptTag.src = "/js/socketio.js";
    scriptTag.async = false;
    document.body.appendChild(scriptTag);    

    var attempts = 20, attempt = 0;
    var interval = setInterval(function () {
        if (typeof io !== "undefined") {
            onready();
            clearInterval(interval);
        }
        if (attempt++ === attempts) {
            clearInterval(interval);
        }
    }, 1000);
};

tg.omgLiveData = function (part, data) {
    
    tg.requirePartMelodyMaker(part);
    
    var fret = Math.max(0, Math.min(part.mm.frets.length - 1,
        part.mm.skipFretsBottom + Math.round((1 - data.y) * 
            (part.mm.frets.length - 1 - part.mm.skipFretsTop - part.mm.skipFretsBottom))));

    var noteNumber = part.mm.frets[fret].note;

    var note = {beats: 0.25};
    if (part.omglive.users[data.user]) {
        if (part.omglive.users[data.user].note.scaledNote === noteNumber) {
            part.omglive.users[data.user].x = data.x;
            part.omglive.users[data.user].y = data.y;
            return;
        }
        note = part.omglive.users[data.user].note;
    }
    else {
        part.omglive.notes.push(note);
    }
    note.note = fret - part.mm.frets.rootNote,
    note.scaledNote = noteNumber;
    data.note = note;

    part.omglive.users[data.user] = data;
    
    tg.player.playLiveNotes(part.omglive.notes, part, 0);    
};

tg.omgLiveDataEnd = function (part, data) {
    var noteIndex = part.omglive.notes.indexOf(part.omglive.users[data.user].note);
    part.omglive.notes.splice(noteIndex, 1);
    delete part.omglive.users[data.user];
    
    if (part.omglive.notes.length > 0) {
        tg.player.playLiveNotes(part.omglive.notes, part, 0);
    }
    else {
        tg.player.endLiveNotes(part);
    }   
};

tg.getOMGLiveRoomName = function (part) {
    var roomName = "";
    if (tg.user && tg.user.username) {
        roomName += tg.user.username.trim() + "-";
    }
    if (tg.song.data.name) {
        roomName += tg.song.data.name + "-";
    }
    roomName += part.data.soundSet.name.substr(0, part.data.soundSet.name.indexOf(" "));
    return roomName;
};

tg.switchOMGLiveRoom = function (part, newRoom) {
    part.socket.emit("leaveSession", part.liveRoom);
    part.liveRoom = newRoom;
    part.socket.emit("startSession", part.liveRoom);
};


/*
 * MIDI!
 * 
*/

tg.turnOnMIDI = function () {
    if (navigator.requestMIDIAccess && !omg.midi.api) {
        navigator.requestMIDIAccess().then(omg.midi.onSuccess, omg.midi.onFailure );
    }
    tg.midiParts = [];
    omg.midi.onnoteoff = tg.onmidinoteoff;
    omg.midi.onnoteon = tg.onmidinoteon;
    omg.midi.onmessage = tg.onmidimessage;
    omg.midi.onplay = tg.onmidiplay;
    omg.midi.onstop = tg.onmidistop;
}

tg.onmidinoteoff = function (noteNumber) {
    tg.midiParts.forEach(part => {
        for (var i = 0; i< part.activeMIDINotes.length; i++) {
            if (part.activeMIDINotes[i].scaledNote === noteNumber) {
                part.activeMIDINotes.splice(i, 1);
                break;
            }
        }
        if (part.activeMIDINotes.length === 0) {
            tg.player.endLiveNotes(part);
        }
        else if (i === 0 || 
                (tg.player.playing && part.activeMIDINotes.autobeat > 0)) {
            tg.player.playLiveNotes(part.activeMIDINotes, part, 0); 
        }
    });
};

tg.onmidinoteon = function (noteNumber) {
    tg.midiParts.forEach(part => {
        var note = {beats: 0.25, scaledNote: noteNumber};
        part.activeMIDINotes.splice(0, 0, note);    
        tg.player.playLiveNotes(part.activeMIDINotes, part, 0); 
        for (var i = 0; i < part.mm.frets.length; i++) {
            if (part.mm.frets[i].note === noteNumber) {
                note.note = i - part.mm.frets.rootNote;
                break;
            }
            if (part.mm.frets[i].note > noteNumber) {
                note.note = i - part.mm.frets.rootNote - 0.5;
                break;
            }
        }
    });
};

tg.onmidiplay = function () {
    if (!tg.player.playing) {
        tg.player.play();
    }
};

tg.onmidistop = function () {
    if (tg.player.playing) {
        tg.player.stop();
    }
};

tg.onmidimessage = function (control, value) {
    if (control === 91) {
        value = Math.floor(value / 128 * 4);
        if (value === 1) value = 4;
        else if (value === 3) value = 1;
        tg.midiParts.forEach(part => part.activeMIDINotes.autobeat = value);
    }
    else if (control === 7) {
        tg.midiParts.forEach(part => {
            part.data.audioParams.gain = 1.5 * Math.pow(value / 127, 2);
            part.gain.gain.value = part.data.audioParams.gain;
            tg.song.partMuteChanged(part);
        });
    }
    else if (control === 10) {
        tg.midiParts.forEach(part => {
            part.data.audioParams.pan = (value - 64) / 64;
            part.panner.pan.value = part.data.audioParams.pan;
            tg.song.partMuteChanged(part);
        });
    }
};

["/omg-music/sequencer_surface.js", "/omg-music/vertical_surface.js","/omg-music/monkey.js"].forEach(js => {
    scriptTag = document.createElement("script");
    scriptTag.src = js;
    scriptTag.async = true;
    document.body.appendChild(scriptTag);
});

tg.requirePartMelodyMaker = function (part) {
    if (part.data.surface.url === "PRESET_VERTICAL" && !part.mm && typeof OMGMelodyMaker !== "undefined") {
        part.mm = new OMGMelodyMaker(tg.instrument.canvas, part, tg.player, tg.instrument.backgroundCanvas);
        part.mm.readOnly = false;
    }
};

