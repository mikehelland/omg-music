
var tg = {};
tg.playButton = document.getElementById("play-button");
tg.beatsButton = document.getElementById("beats-button");
tg.keyButton = document.getElementById("key-button");
tg.chordsButton = document.getElementById("chords-button");
tg.mixButton = document.getElementById("mix-button");
tg.saveButton = document.getElementById("save-button");
tg.addPartButton = document.getElementById("add-part-button");
tg.partList = document.getElementById("part-list");

tg.detailFragment = document.getElementById("detail-fragment");
tg.surface = document.getElementById("instrument-surface");
tg.surface.width = tg.surface.clientWidth;
tg.surface.height = tg.surface.clientHeight;

tg.player = new OMusicPlayer();

tg.getSong = function (callback) {
    
    var id = omg.util.getPageParams().id;
    if (!id) {
        var defaultSong = {"name":"","type":"SONG","sections":[{"id":1202,"tags":"t","type":"SECTION","parts":[{"type":"PART","uuid":"52457792-cf35-4fef-8105-e91b14fbc326","notes":[],"octave":3,"surface":{"url":"PRESET_VERTICAL","name":"","skipTop":0,"skipBottom":0},"partType":"PART","soundSet":{"url":"PRESET_OSC_SINE_SOFT_DELAY","name":"Osc Soft Sine Delay","type":"SOUNDSET","octave":5,"lowNote":0,"highNote":108,"chromatic":true},"audioParameters":{"pan":0,"mute":false,"warp":1,"speed":1,"volume":0.75}}],"keyParameters":{"scale":[0,3,5,6,7,10],"rootNote":0},"last_modified":1540221610328,"beatParameters":{"beats":4,"shuffle":0,"measures":2,"subbeats":4,"subbeatMillis":125},"chordProgression":[0]}],"created_at":1541261597433,"keyParameters":{"scale":[0,3,5,6,7,10],"rootNote":0},"last_modified":1541261597433,"beatParameters":{"bpm":120,"beats":4,"shuffle":0,"measures":2,"subbeats":4,"subbeatMillis":125}};
        callback(defaultSong);
    }    
    else {
        omg.server.getId(id, function (response) {
            callback(response);
        });
    }
};

tg.loadSong = function (songData) {
    tg.song = tg.player.makeOMGSong(songData);
    tg.player.prepareSong(tg.song);    
    
    tg.setSongControlsUI();

    var section;
    for (var i = 0; i < tg.song.sections.length; i++) {
        section = tg.song.sections[i];

        for (var j = 0; j < section.parts.length; j++) {
            tg.setupPartButton(section.parts[j]);
        }

        break;
    }
    
    tg.drawPlayButton();
};

tg.playButton.onclick = function () {
    if (tg.player.playing) {
        tg.player.stop();
    }
    else {
        tg.player.play(tg.song);
    }
};

tg.player.onPlay = function () {
    tg.drawPlayButton(0);
};
tg.player.onStop = function () {
    tg.drawPlayButton();
};

tg.setSongControlsUI = function () {
    tg.keyButton.innerHTML = omg.ui.getKeyCaption(tg.song.data.keyParameters);
    tg.beatsButton.innerHTML = tg.song.data.beatParameters.bpm + " bpm";
};
tg.setupPartButton = function (omgpart) {
    partDiv = document.createElement("div");
    partDiv.className = "part";
    
    var button;
    button = document.createElement("div");
    button.className = "part-options-button";
    button.innerHTML = "|||";
    partDiv.appendChild(button);
    
    button = document.createElement("div");
    button.className = "part-button";
    button.innerHTML = omgpart.data.soundSet.name;
    button.onclick = function () {
        tg.showSurface();
        if (omgpart.data.surface.url === "PRESET_SEQUENCER") {
            tg.showDrumMachine(omgpart);
        }
        else if (omgpart.data.surface.url === "PRESET_VERTICAL") {
            tg.showMelodyEditor(omgpart);
        }
    };
    partDiv.appendChild(button);
    
    button = document.createElement("div");
    button.className = "part-mute-button";
    button.innerHTML = "M";
    button.onclick = function () {
        omgpart.data.audioParameters.mute = !omgpart.data.audioParameters.mute;
        button.style.backgroundColor = omgpart.data.audioParameters.mute ? "#800000" : "#008000";
    }
    button.style.backgroundColor = omgpart.data.audioParameters.mute ?
        "#800000" : "#008000";
    partDiv.appendChild(button);
    tg.partList.appendChild(partDiv);

}

tg.showDrumMachine = function (omgpart) {
    if (tg.surface.omgdata) {
        tg.surface.omgdata.selectedTrack = -1;
    }
    var drumMachine = new OMGDrumMachine(tg.surface, omgpart);
    omg.ui.drawDrumCanvas({canvas: tg.surface, drumbeat: omgpart.data, 
        captionWidth: window.innerWidth / 2 / 8});
    drumMachine.readOnly = false;
    
    tg.player.onBeatPlayedListeners.push(function (isubbeat, isection) {
        omg.ui.drawDrumCanvas({canvas: tg.surface, drumbeat: omgpart.data, 
            captionWidth: window.innerWidth / 2 / 8});
    });
};
tg.showMelodyEditor = function (omgpart) {
    melodyEditor = new OMGMelodyMaker(tg.surface, omgpart, tg.player);
    tg.player.onBeatPlayedListeners.push(function (isubbeat, isection) {
        melodyEditor.drawCanvas();
    });

};

tg.playButton.width = tg.playButton.clientWidth
tg.playButton.height = tg.playButton.clientHeight
tg.drawPlayButton = function (subbeat) {
    tg.playButton.width = tg.playButton.width;
    var context = tg.playButton.getContext("2d");

    if (!tg.song) {
        console.log("draw loading");
        context.fillStyle = "white";
        context.font = "bold 30px sans-serif";
        var caption = "LOADING...";
        var captionWidth = context.measureText(caption).width;
        context.fillText(caption, tg.playButton.width / 2 - captionWidth / 2, 35);
        return;
    }
    
    context.globalAlpha = 0.6;

    var beatWidth = tg.playButton.width / 
        (tg.song.data.beatParameters.measures * tg.song.data.beatParameters.beats);

    if (tg.player.playing) {
        context.fillStyle = "#00FF00";
        context.fillRect(beatWidth * Math.floor(subbeat / tg.song.data.beatParameters.subbeats), 
            0, beatWidth, tg.playButton.height);        
    }
    else {
        context.fillStyle = "#FF0000";
        context.fillRect(0, 0, tg.playButton.width, tg.playButton.height);        
    }

    context.fillStyle = "white";
    context.strokeStyle = "white";
    context.strokeRect(0, 0, tg.playButton.width, tg.playButton.height);
    for (var beat = 1; 
            beat <= tg.song.data.beatParameters.beats * tg.song.data.beatParameters.measures; 
            beat++) {
        context.fillRect(beat * beatWidth, 0, 
                    beat % tg.song.data.beatParameters.beats == 0 ? 2 : 1, 
                    tg.playButton.height);
    }
    context.globalAlpha = 1.0;    
    
    context.font = "bold 30px sans-serif";
    var caption = tg.player.playing ? "STOP" : "PLAY";
    var captionWidth = context.measureText(caption).width;
    context.fillText(caption, tg.playButton.width / 2 - captionWidth / 2, 35);
};
tg.player.onBeatPlayedListeners.push(function (isubbeat, isection) {
    tg.drawPlayButton(isubbeat);
});
tg.drawPlayButton();

tg.showBeatsFragment = function () {
    tg.hideDetails();
    if (!tg.beatsFragment) {
        tg.beatsFragment = document.getElementById("beats-fragment");
        var bf= tg.beatsFragment;
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
        
        bf.subbeatsRange.onmousemove = function (e) {
            console.log(e);
            bf.subbeatsLabel.innerHTML = bf.subbeatsRange.value;
            tg.song.data.beatParameters.subbeats = bf.subbeatsRange.value;
        };
        bf.beatsRange.onmousemove = function (e) {
            console.log(e);
            bf.beatsLabel.innerHTML = bf.beatsRange.value;
            tg.song.data.beatParameters.beats = bf.beatsRange.value;
        };
        bf.measuresRange.onmousemove = function (e) {
            console.log(e);
            bf.measuresLabel.innerHTML = bf.measuresRange.value;
            tg.song.data.beatParameters.measures = bf.measuresRange.value;
        };
        bf.bpmRange.onmousemove = function (e) {
            console.log(e);
            bf.bpmLabel.innerHTML = bf.bpmRange.value;
            tg.song.data.beatParameters.bpm = bf.bpmRange.value;
            tg.player.newBPM = bf.bpmRange.value;
            tg.setSongControlsUI();
        };
        bf.shuffleRange.onmousemove = function (e) {
            console.log(e);
            bf.shuffleLabel.innerHTML = bf.shuffleRange.value;
            tg.song.data.beatParameters.shuffle = bf.shuffleRange.value;
        };
    }
    tg.refreshBeatsFragment();
    tg.beatsFragment.style.display = "block";
};

tg.refreshBeatsFragment = function () {
    tg.beatsFragment.subbeatsLabel.innerHTML = tg.song.data.beatParameters.subbeats;
    tg.beatsFragment.beatsLabel.innerHTML = tg.song.data.beatParameters.beats;
    tg.beatsFragment.measuresLabel.innerHTML = tg.song.data.beatParameters.measures;
    tg.beatsFragment.bpmLabel.innerHTML = tg.song.data.beatParameters.bpm;
    tg.beatsFragment.shuffleLabel.innerHTML = tg.song.data.beatParameters.shuffle;
    tg.beatsFragment.subbeatsRange.value = tg.song.data.beatParameters.subbeats;
    tg.beatsFragment.beatsRange.value = tg.song.data.beatParameters.beats;
    tg.beatsFragment.measuresRange.value = tg.song.data.beatParameters.measures;
    tg.beatsFragment.bpmRange.value = tg.song.data.beatParameters.bpm;
    tg.beatsFragment.shuffleRange.value = tg.song.data.beatParameters.shuffle;

};

tg.beatsButton.onclick = function () {
    tg.hideDetails();
    tg.showBeatsFragment();
};
tg.keyButton.onclick = function () {
    tg.hideDetails();
    tg.showKeyFragment();
}

tg.chordsButton.onclick = function () {
    tg.hideDetails();
    tg.showChordsFragment();
};
tg.addPartButton.onclick = function() {
    tg.hideDetails();
    tg.showAddPartFragment();
};
tg.mixButton.onclick = function () {
    tg.showMixFragment();
};
tg.saveButton.onclick = function () {
    tg.showSaveFragment();
};

tg.showSurface = function () {
    tg.hideDetails();
    tg.surface.style.display = "block";
    tg.surface.width = tg.surface.clientWidth;
    tg.surface.height = tg.surface.clientHeight;
};

tg.showKeyFragment = function () {
    var kf;
    if (!tg.keyFragment) {
        tg.keyFragment = document.getElementById("key-fragment");
        kf = tg.keyFragment;
        kf.keyList = document.getElementById("key-list");
        kf.scaleList = document.getElementById("scale-list");
        var keyI = 0;
        omg.ui.keys.forEach(function (key) {
            var keyDiv = document.createElement("div");
            keyDiv.className = "key-select-button";
            keyDiv.innerHTML = key;
            keyDiv.onclick = (function (i) {
                return function () {
                    tg.song.data.keyParameters.rootNote = i;
                    tg.setSongControlsUI();
                }
            }(keyI));
            
            kf.keyList.appendChild(keyDiv);
            keyI++;
        });
        omg.ui.scales.forEach(function (scale) {
            var scaleDiv = document.createElement("div");
            scaleDiv.className = "scale-select-button";
            scaleDiv.innerHTML = scale.name;
            scaleDiv.onclick = (function (newScale) {
                return function () {
                    tg.song.data.keyParameters.scale = newScale;
                    tg.setSongControlsUI();
                }
            }(scale.value));

            kf.scaleList.appendChild(scaleDiv);
        });
    }
    tg.keyFragment.style.display = "flex";
    
};

tg.showChordsFragment = function () {
    if (!tg.chordsFragment) {
        tg.chordsFragment = document.getElementById("chords-fragment");
        var chordDiv;
        for (var i = 0; i < tg.song.data.keyParameters.scale.length; i++) {
            chordDiv = document.createElement("div");
            chordDiv.className = "chord-select-button";
            chordDiv.innerHTML = i;
            chordDiv.onclick = (function (i) {
                return function () {
                    tg.song.sections[0].data.chordProgression = [i];
                }
            }(i));
            tg.chordsFragment.appendChild(chordDiv);
        }
    }
    tg.chordsFragment.style.display = "flex";
};

tg.showAddPartFragment = function () {
    if (!tg.addPartFragment) {
        tg.addPartFragment = document.getElementById("add-part-fragment");
        fetch("http://openmusic.gallery/data/?type=SOUNDSET").then(function (e) {return e.json();}).then(function (json) {
            json.forEach(function (soundSet) {
                var newDiv = document.createElement("div");
                newDiv.innerHTML = soundSet.name;
                tg.addPartFragment.appendChild(newDiv);
                soundSet.url = "http://openmusic.gallery/data/" + soundSet.id;
                newDiv.onclick = function () {
                    tg.addPart(soundSet);
                };
            });
        });
    }
    tg.addPartFragment.style.display = "block";
};

tg.hideDetails = function () {
    if (tg.beatsFragment) tg.beatsFragment.style.display = "none";
    if (tg.keyFragment) tg.keyFragment.style.display = "none";
    if (tg.chordsFragment) tg.chordsFragment.style.display = "none";
    if (tg.addPartFragment) tg.addPartFragment.style.display = "none";
    if (tg.surface) tg.surface.style.display = "none";
    if (tg.mixFragment) tg.mixFragment.style.display = "none";
    if (tg.saveFragment) tg.saveFragment.style.display = "none";
    
  
};


tg.addPart = function (soundSet) {
    var blankPart = {soundSet: soundSet};
    var omgpart = new OMGPart(undefined,blankPart,tg.song.sections[0]);
    console.log(omgpart);
    tg.player.loadPart(omgpart);
    tg.setupPartButton(omgpart);
};

tg.showMixFragment = function () {
    if (!tg.mixFragment) {
        tg.mixFragment = document.getElementById("mix-fragment");
    }
    var divs = [];
    tg.mixFragment.innerHTML = "";
    tg.song.sections[0].parts.forEach(function (part) {
        var newContainerDiv = document.createElement("div");
        newContainerDiv.className = "mixer-part";
        
        var mixerVolumeCanvas = new MixerVolumeCanvas(part);
        mixerVolumeCanvas.div.className = "mixer-part-volume";
        var mixerWarpCanvas = new MixerWarpCanvas(part);
        mixerWarpCanvas.div.className = "mixer-part-warp";
        var mixerPanCanvas = new MixerPanCanvas(part);
        mixerPanCanvas.div.className = "mixer-part-pan";
        
        newContainerDiv.appendChild(mixerVolumeCanvas.div);
        newContainerDiv.appendChild(mixerWarpCanvas.div);
        newContainerDiv.appendChild(mixerPanCanvas.div);
        tg.mixFragment.appendChild(newContainerDiv);
        divs.push(mixerVolumeCanvas);
        divs.push(mixerWarpCanvas);
        divs.push(mixerPanCanvas);
    });
    
    tg.hideDetails();
    tg.mixFragment.style.display = "flex";
    
    divs.forEach(function (child) {
        child.drawCanvas(child);
    });
};

function MixerVolumeCanvas(part, canvas) {
    var m = this;
    if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.onmousedown = function (e) {
            m.onmousedown(e);
        }
        canvas.onmousemove = function (e) {
            m.onmousemove(e);
        }
        canvas.onmouseup = function (e) {
            m.onmouseup(e);
        }
    }
    this.div = canvas;
    this.ctx = canvas.getContext("2d");
    this.part = part;
}

MixerVolumeCanvas.prototype.onmousedown = function (e) {
    this.isTouching = true;
    console.log(this)
    var percent = (e.layerX - this.div.offsetLeft) / this.div.clientWidth;
    this.part.data.audioParameters.volume = percent;
    this.drawCanvas(this.div);
};
MixerVolumeCanvas.prototype.onmousemove = function (e) {
    if (this.isTouching) {
        var percent = (e.layerX - this.div.offsetLeft) / this.div.clientWidth;
        this.part.data.audioParameters.volume = percent;
        this.drawCanvas(this.div);
    }
};
MixerVolumeCanvas.prototype.onmouseup = function (e) {
    this.isTouching = false;
};
MixerVolumeCanvas.prototype.drawCanvas = function () {
    this.div.width = this.div.clientWidth;
    this.div.height = this.div.clientHeight;
    this.ctx.fillStyle = this.part.data.audioParameters.mute ? "#880000" : "#008800";
    this.ctx.fillRect(0, 0, this.part.data.audioParameters.volume * this.div.clientWidth, this.div.height);
    this.ctx.fillStyle = "white";
    this.ctx.fillText(this.part.data.soundSet.name, 10, 10);
};

function MixerWarpCanvas(part, canvas) {
    var m = this;
    if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.onmousedown = function (e) {
            m.onmousedown(e);
        }
        canvas.onmousemove = function (e) {
            m.onmousemove(e);
        }
        canvas.onmouseup = function (e) {
            m.onmouseup(e);
        }
    }
    this.div = canvas;
    this.ctx = canvas.getContext("2d");
    this.part = part;
}

MixerWarpCanvas.prototype.onmousedown = function (e) {
    this.isTouching = true;
    console.log(this)
    var percent = (e.layerX - this.div.offsetLeft) / this.div.clientWidth * 2;
    this.part.data.audioParameters.warp = percent;
    this.drawCanvas(this.div);
};
MixerWarpCanvas.prototype.onmousemove = function (e) {
    if (this.isTouching) {
        var percent = (e.layerX - this.div.offsetLeft) / this.div.clientWidth * 2;
        this.part.data.audioParameters.warp = percent;
        this.drawCanvas(this.div);
    }
};
MixerWarpCanvas.prototype.onmouseup = function (e) {
    this.isTouching = false;
};
MixerWarpCanvas.prototype.drawCanvas = function () {
    this.div.width = this.div.clientWidth;
    this.div.height = this.div.clientHeight;
    this.ctx.fillStyle = "#DDDD00";
    this.ctx.fillRect(0, 0, this.part.data.audioParameters.warp * this.div.clientWidth / 2, this.div.height);
    this.ctx.fillStyle = "white";
    this.ctx.fillText("warp", 10, 10);
};

function MixerPanCanvas(part, canvas) {
    var m = this;
    if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.onmousedown = function (e) {
            m.onmousedown(e);
        }
        canvas.onmousemove = function (e) {
            m.onmousemove(e);
        }
        canvas.onmouseup = function (e) {
            m.onmouseup(e);
        }
    }
    this.div = canvas;
    this.ctx = canvas.getContext("2d");
    this.part = part;
}

MixerPanCanvas.prototype.onmousedown = function (e) {
    this.isTouching = true;
    var percent = (e.layerX - (this.div.clientWidth / 2)) / this.div.clientWidth * 2;
    this.part.data.audioParameters.pan = percent;
    this.drawCanvas(this.div);
};
MixerPanCanvas.prototype.onmousemove = function (e) {
    if (this.isTouching) {
        var percent = (e.layerX - (this.div.clientWidth / 2)) / this.div.clientWidth * 2;
        this.part.data.audioParameters.pan = percent;
        this.drawCanvas(this.div);
    }
};
MixerPanCanvas.prototype.onmouseup = function (e) {
    this.isTouching = false;
};
MixerPanCanvas.prototype.drawCanvas = function () {
    this.div.width = this.div.clientWidth;
    this.div.height = this.div.clientHeight;
    this.ctx.fillStyle = "#000088";
    this.ctx.fillRect(this.div.clientWidth / 2 - 2, 0, 4, this.div.height);
    this.ctx.fillRect(this.div.clientWidth / 2, 0, this.part.data.audioParameters.pan * this.div.clientWidth / 2, this.div.height);
    this.ctx.fillStyle = "white";
    this.ctx.fillText("Pan", 10, 10);
};

tg.showSaveFragment = function () {
    if (!tg.saveFragment) {
        tg.saveFragment = document.getElementById("save-fragment");
    }
    
    tg.hideDetails();
    tg.saveFragment.style.display = "block";
    
    if (tg.song.data.id) {
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
        var saved = true; //??
        var savedUrl = location.origin + "/techno-gauntlet/?id=" + response.id;
        var div = document.getElementById("saved-url");
        div.value = savedUrl;
            //if (callback) {
            //    callback(response.id);
            //}
    });
};



// away we go
tg.getSong(function (song) {
    tg.loadSong(song);
});