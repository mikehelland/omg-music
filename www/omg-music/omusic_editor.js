"use strict";
/* 
 omgbam.js ported to a class definition  
 */


function OMusicEditor() {
    this.animLength = 500;
    this.borderRadius = 3;
    this.fadingOut = [];

    this.url = "/music";
    this.fileext = ".mp3"; //needsMP3() ? ".mp3" : ".ogg",

    this.loadWhenReady = true;

    this.keys = ["C", "C#/Db", "D", "D#/Eb",
        "E", "F", "F#/Gb", "G", "G#/Ab",
        "A", "A#/Bb", "B"];
    this.scales = [{name: "Major", value: [0, 2, 4, 5, 7, 9, 11]},
        {name: "Minor", value: [0, 2, 3, 5, 7, 8, 10]},
        {name: "Pentatonic", value: [0, 2, 5, 7, 9]},
        {name: "Blues", value: [0, 3, 5, 6, 7, 10]}];

}


OMusicEditor.prototype.setup = function (options) {
    var bam = this;

    if (!options || !options.div) {
        debug("OMusicEditor() needs setup options with a div property");
        return;
    }

    bam.omgservice = omg.server;
    bam.bbody = options.div;

    if (!bam.player) {
        bam.player = new OMusicPlayer();
        bam.player.loopSection = 0;
    }

    bam.soundsets = [];
    bam.soundsetsURLMap = {};

    //omg.ui should exist, obviously. Maybe this should be omg.ui = OMusicUI() 
    omg.ui.setupNoteImages();

    bam.windowWidth = bam.bbody.clientWidth;
    bam.windowHeight = bam.bbody.clientHeight;
    bam.offsetLeft = bam.bbody.clientWidth * 0.1; //bam.bbody.offsetLeft;

    bam.mobile = bam.windowWidth < 1000 && bam.windowWidth < bam.windowHeight;

    bam.offsetTop = 5; //bam.mobile ? 60: 88;

    bam.div = document.getElementById("master");
    bam.keyButton = document.getElementById("omg-music-controls-key-button");
    bam.tempoButton = document.getElementById("omg-music-controls-tempo-button");
    bam.zones = [];

    bam.setupSectionEditor();
    bam.setupSongEditor();

    bam.setupMelodyMaker();

    bam.finishZone = document.getElementById("finish-zone");

    bam.player.onPlay = function () {
        if (bam.showingPlayButton) {
            bam.showingPlayButton.innerHTML = "STOP";
        }
    };
    bam.player.onStop = function () {
        if (bam.showingPlayButton) {
            bam.showingPlayButton.innerHTML = "PLAY";
            bam.showingPlayButton.className = bam.showingPlayButton.className
                    .replace("-blink", "");
        }
    };

    var pauseBlinked = false;
    bam.player.onBeatPlayedListeners.push(function (isubbeat, isection) {

        if (bam.zones[bam.zones.length - 1] == bam.song.div
                && bam.player.song == bam.song) {

            bam.songZoneBeatPlayed(isubbeat, isection);
        } else if (bam.part && bam.zones[bam.zones.length - 1] == bam.part.div) {
            bam.partZoneBeatPlayed(isubbeat);
        } else if (bam.section && bam.zones[bam.zones.length - 1] == bam.section.div) {
            bam.sectionZoneBeatPlayed(isubbeat);
        }

        if (bam.showingPlayButton && isubbeat % 4 == 0) {
            if (!pauseBlinked) {
                if (bam.showingPlayButton.className.indexOf("-blink") == -1) {
                    bam.showingPlayButton.className = bam.showingPlayButton.className
                            + "-blink";
                }
            } else {
                bam.showingPlayButton.className = bam.showingPlayButton.className
                        .replace("-blink", "");
            }
            pauseBlinked = !pauseBlinked;
        }
    });

    var loadSoundSets = function () {
        bam.getSoundSets("", function (soundsets) {
            if (!bam.song)
                return;
            bam.song.sections.forEach(function (section) {
               section.parts.forEach(function (part) {
                   part.controls.selectInstrument.innerHTML = 
                           bam.getSelectInstrumentOptions(part.data.partType);
                   part.controls.selectInstrument.value = part.data.soundsetURL;
               });
            });
        });
    };

    var loadId;
    var loadParams;
    if (this.loadWhenReady) {
        loadParams = bam.getLoadParams();
        loadId = loadParams.id || loadParams.song || loadParams.section || loadParams.part;
        
        if (loadParams.testData) {
            console.log("testData")
            loadParams.song = 1
            loadParams.dataToLoad = testData();
            bam.load(loadParams);
            loadSoundSets();
        }
        else if (!isNaN(loadId) && loadId > 0) {
            bam.omgservice.getId(loadId, function (result) {
                loadParams.dataToLoad = result;
                bam.load(loadParams);
                loadSoundSets();
            });
        } else {
            bam.load(loadParams);
            loadSoundSets();
        }
    }

    window.onresize = function () {
        bam.windowWidth = bam.bbody.clientWidth;
        bam.windowHeight = bam.bbody.clientHeight;
        bam.offsetLeft = bam.bbody.clientWidth * 0.1;

        bam.mobile = bam.windowWidth < 1000 && bam.windowWidth < bam.windowHeight;

        bam.offsetTop = 5; //bam.mobile ? 60 : 88;


        for (var iz = 0; iz < bam.zones.length; iz++) {
            bam.zones[iz].style.height = window.innerHeight + 10 + "px";
            //this offsetleft bit is for if the song gets scrolled left
            bam.zones[iz].style.width = -1 * bam.zones[iz].offsetLeft + window.innerWidth + 10 + "px";
        }

        if (bam.zones[bam.zones.length - 1] == bam.song.div) {
            bam.arrangeSections();
        }
        if (bam.section && bam.section.div &&
                bam.zones[bam.zones.length - 1] == bam.section.div) {
            bam.arrangeParts();
        }
    };

};

OMusicEditor.prototype.playButtonClick = function () {
    var bam = this;

    if (bam.zones[bam.zones.length - 1] == bam.song.div) {
        bam.songEditor.playButtonClick();
    } else if (bam.part && bam.zones[bam.zones.length - 1] == bam.part.div) {
        bam.mm.playButtonClick();
    } else if (bam.section && bam.zones[bam.zones.length - 1] == bam.section.div) {
        bam.sectionEditor.playButtonClick();
    }

};

OMusicEditor.prototype.nextButtonClick = function (callback) {
    var bam = this;

    if (bam.zones[bam.zones.length - 1] == bam.song.div) {
        bam.songEditor.nextButtonClick(callback);
    } else if (bam.part && bam.zones[bam.zones.length - 1] == bam.part.div) {
        bam.mm.nextButtonClick(callback);
    } else if (bam.section && bam.zones[bam.zones.length - 1] == bam.section.div) {
        bam.sectionEditor.nextButtonClick(callback);
    }

};


OMusicEditor.prototype.setupPartDiv = function (part) {
    var bam = this;

    var type = part.data.type;
    var surface = part.data.surfaceURL;

    if (type == "CHORDPROGRESSION") {
        //todo might show this thing?
        return;
    }

    if (part.controls) {
        debug("setupPartDiv: We are already setup!");
        return;
    }

    part.div.omgpart = part; //maybe not the best design, but helpful for in dragndrop

    part.controls = document.createElement("div");
    part.controls.className = "part-controls";
    part.controls.style.height = part.div.clientHeight - 6 + "px";
    part.div.appendChild(part.controls);

    var typeDiv = document.createElement("div");
    typeDiv.className = 'remixer-part-type';
    typeDiv.innerHTML = part.data.partType || type;
    part.controls.appendChild(typeDiv);

    var barDiv = document.createElement("div");
    barDiv.className = 'remixer-part-leftbar';
    part.controls.selectInstrument = document.createElement("select");
    part.controls.selectInstrument.className = "remixer-part-instrument";
    barDiv.appendChild(part.controls.selectInstrument);
    part.controls.appendChild(barDiv);

    part.controls.rightBar = document.createElement("div");
    part.controls.rightBar.className = "remixer-part-rightbar";
    part.controls.appendChild(part.controls.rightBar);

    bam.setupSelectInstrument(part);
    if (part.data.soundsetURL && 
                !bam.soundsetsURLMap[part.data.soundsetURL]) {
        bam.soundsetsURLMap[part.data.soundsetURL] = {}; 
        //todo try to download it?
        //add an option?
    }
    part.controls.selectInstrument.value = part.data.soundsetURL;

    part.controls.appendChild(document.createElement("br"));

    if (surface == "PRESET_SEQUENCER") {
        bam.setupDivForDrumbeat(part);
    } else {
        bam.setupMelodyDiv(part);
    }
    /*
     var muteButton = document.createElement("div");
     muteButton.className = "remixer-part-command";
     muteButton.innerHTML = "mute";
     muteButton.onclick = function(e) {
     bam.toggleMute(part);
     
     e.stopPropagation();
     };
     part.controls.rightBar.appendChild(muteButton);
     part.controls.muteButton = muteButton;*/

    var closePartButton = document.createElement("div");
    closePartButton.innerHTML = "&times;";
    closePartButton.className = "remixer-part-command";
    closePartButton.onclick = function () {
        bam.cancelPart(part, true);

        bam.sectionModified();
        bam.arrangeParts();
    };
    part.controls.rightBar.appendChild(closePartButton);

};

OMusicEditor.prototype.setupDivForDrumbeat = function (part) {
    var bam = this;

    var canvas = document.createElement("canvas");
    part.controls.appendChild(canvas);

    canvas.height = 80; //canvas.parentElement.clientHeight - canvas.offsetTop - 4;
    var rowHeight = canvas.height / part.data.tracks.length;
    canvas.style.height = canvas.height + "px";
    canvas.style.width = canvas.parentElement.clientWidth - 8 + "px";
    canvas.width = canvas.clientWidth;

    part.canvas = canvas;

    canvas.update = function (isubbeat) {
        bam.drawDrumCanvas(part, isubbeat);
    };
    canvas.update();

    canvas.style.cursor = "pointer";
    canvas.onclick = function () {

        if (bam.readOnly) {
            return;
        }

        if (bam.zones[bam.zones.length - 1] != bam.section.div) {
            return;
        }

        if (bam.sectionEditor.mixerMode) {
            // mute?
            return;
        }

        bam.sectionEditor.editPart(part);
    };

    part.isNew = false;

    part.ui = new OMGDrumMachine(canvas, part);
}

OMusicEditor.prototype.setupMelodyDiv = function (part) {
    var bam = this;
    var div = part.controls;

    part.canvas = document.createElement("canvas");
    div.appendChild(part.canvas);

    part.canvas.style.width = div.clientWidth + "px";
    part.canvas.style.height = "70px";
    part.canvas.height = 70;

    part.canvas.style.width = part.canvas.parentElement.clientWidth - 10 + "px";
    part.canvas.width = part.canvas.clientWidth;

    try {
        omg.ui.drawMelodyCanvas({data: part.data, canvas: part.canvas});
    } catch (exp) {
        debug("error drawing melody canvas");
        debug(exp);
    }

    var beatMarker = document.createElement("div");
    var offsetLeft;
    var width;
    beatMarker.className = "beat-marker";
    console.log(part.canvas.width);
    //todo really sort out where beats subbeats and measures comes from
    //beatMarker.style.width = part.canvas.noteWidth + "px";
    beatMarker.style.width = part.canvas.clientWidth / 32 + "px";
    console.log("beatMarker.style.width");
    console.log(beatMarker.style.width);
    beatMarker.style.height = part.canvas.height + "px";
    beatMarker.style.top = part.canvas.offsetTop + "px";
    div.appendChild(beatMarker);
    var sizeSet = false;

    part.canvas.update = function (isubbeat) {
        if (!sizeSet) {
            beatMarker.style.width = part.canvas.clientWidth / 32 + "px";   
            beatMarker.style.top = part.canvas.offsetTop + "px";
            sizeSet = true;
        }
        if (part.currentI - 1 < part.data.notes.length
                && part.currentI >= 0) {
            offsetLeft = part.canvas.offsetLeft;
            //width = part.canvas.noteWidth;
            width = part.canvas.width;
            //todo hardcoded total subbeats!!
            offsetLeft += width / 32 * isubbeat;
            beatMarker.style.display = "block";
            beatMarker.style.left = offsetLeft + "px";
        } else {
            beatMarker.style.display = "none";
        }
    };

    div.beatMarker = beatMarker;

    part.canvas.style.cursor = "pointer";
    part.canvas.onclick = function () {

        if (bam.readOnly) {
            return;
        }

        if (bam.zones[bam.zones.length - 1] != bam.section.div) {
            return;
        }

        if (bam.sectionEditor.mixerMode) {
            // mute?
            return;
        }

        bam.sectionEditor.editPart(part);
    };

};

OMusicEditor.prototype.setupSectionEditor = function () {
    var bam = this;

    bam.sectionEditor = document.createElement("div");
    bam.sectionEditor.className = "area";
    bam.sectionEditor.style.height = "100%";
    bam.sectionEditor.style.pointerEvents = "none";
    bam.bbody.appendChild(bam.sectionEditor);

    bam.sectionEditor.playButtonClick = function (e) {
        if (bam.player.playing) {
            bam.player.stop();
        } else {
            bam.player.play();
        }

        //TODO ? e doesn't necessarily exist, why is this here again?
        if (e) {
            e.stopPropagation();
        }
    };

    //TODO these should probably be replaced with a canvas soon
    //TODO also suggests a significant refactor
    //eliminating the separation of master/song/section and the editor
    //now uses css pointer-events:none and auto to make it work
    bam.sectionEditor.mixerHints = document.createElement("div");
    var hintDiv;
    hintDiv = document.createElement("div");
    hintDiv.className = "mixer-hint-volume-up";
    hintDiv.innerHTML = "Volume Up";
    bam.sectionEditor.mixerHints.appendChild(hintDiv);
    hintDiv = document.createElement("div");
    hintDiv.className = "mixer-hint-volume-down";
    hintDiv.innerHTML = "Volume Down";
    bam.sectionEditor.mixerHints.appendChild(hintDiv);
    hintDiv = document.createElement("div");
    hintDiv.className = "mixer-hint-pan-left";
    hintDiv.innerHTML = "Pan Left";
    bam.sectionEditor.mixerHints.appendChild(hintDiv);
    hintDiv = document.createElement("div");
    hintDiv.className = "mixer-hint-pan-right";
    hintDiv.innerHTML = "Pan Right";
    bam.sectionEditor.mixerHints.appendChild(hintDiv);
    bam.sectionEditor.mixerHints.style.display = "none";
    bam.sectionEditor.appendChild(bam.sectionEditor.mixerHints);


    bam.sectionEditor.nosection = document.createElement("div");
    bam.sectionEditor.nosection.className = "no-section-message";
    bam.sectionEditor.nosection.innerHTML = "(This Section is empty. Add some things to it!)";
    bam.sectionEditor.nosection.style.position = "absolute";
    bam.sectionEditor.appendChild(bam.sectionEditor.nosection);

    bam.sectionEditor.addButtons = document.createElement("div");
    bam.sectionEditor.addButtons.className = "remixer-add-buttons";
    if (bam.sectionEditor.addButtons) {
        bam.setupSectionAddButtons(bam.sectionEditor.addButtons);
    }
    bam.sectionEditor.appendChild(bam.sectionEditor.addButtons);

    //TODO isn't used
    bam.sectionEditor.clearButtonclick = function () {
        for (ip = bam.section.parts.length - 1; ip > -1; ip--) {
            bam.cancelPart(bam.section.parts[ip], true);
        }
        bam.sectionModified();
        bam.arrangeParts();
    };

    bam.sectionEditor.nextButtonClick = function () {

        bam.sectionEditor.hide(function () {

            if (!bam.section.saved) {
                bam.section.data.id = undefined;
                bam.section.saving = true;
                bam.omgservice.post(bam.section.getData(), function (response) {
                    if (response && response.id) {
                        bam.section.saved = true;
                    }
                    bam.section.saving = false;
                });
            }

            bam.section.partsAreClean = false;

            bam.popZone(bam.section.div);

            bam.songEditor.show(bam.section);

            bam.player.loopSection = -1; //play(bam.song);

            bam.setupSectionDiv(bam.section);
        });
    };

    bam.sectionEditor.hide = function (callback) {
        var fadeOutList = [bam.sectionEditor];
        bam.section.parts.forEach(function (part) {
            fadeOutList.push(part.controls.rightBar);
            fadeOutList.push(part.controls.selectInstrument);
            if (part.controls.beatMarker) {
                fadeOutList.push(part.controls.beatMarker);
            }
        });
        bam.fadeOut(fadeOutList, callback);

    };

    bam.sectionEditor.show = function (callback) {
        bam.section.div.onmousedown = null;
        bam.section.div.ontouchstart = null;

        var fadeInList = [bam.sectionEditor];
        var part;
        for (var ip = bam.section.parts.length - 1; ip > -1; ip--) {
            part = bam.section.parts[ip];
            if (!part.controls) {
                //not entirely sure why this should still be the case
                //controls were formerly hidden from the song view
                console.log("no part.controls: calling setup part div");
                bam.setupPartDiv(part);
                fadeInList.push(part.controls);
            }
            //Probably a better way for this, but fadein makes it opaque
            if (part.controls.beatMarker) {
                part.controls.beatMarker.style.opacity = 0.6;
            }
            fadeInList.push(part.controls.rightBar);
            fadeInList.push(part.controls.selectInstrument);
        }
        bam.fadeIn(fadeInList, callback);

        if (bam.section.parts.length > 0) {
            //
        }

        if (typeof bam.onzonechange == "function") {
            bam.onzonechange(bam.section);
        }
    };

    bam.sectionEditor.startMixerMode = function () {
        bam.sectionEditor.mixerMode = true;
        bam.sectionEditor.dragAndDrop = new OMGDragAndDropHelper();
        bam.sectionEditor.mixerHints.style.display = "block";

        bam.sectionEditor.dragAndDrop.ondrag = function (div, x, y, px, py) {
            div.omgpart.data.volume = 1 - py;
            div.omgpart.data.pan = (px - 0.5) * 2;

            if (bam.player.playing) {
                bam.player.updatePartVolumeAndPan(div.omgpart);
            }
            return true;
        };
        bam.sectionEditor.dragAndDrop.onshortclick = function (div) {
            bam.toggleMute(div.omgpart);
        };

        bam.section.parts.forEach(function (part) {
            bam.sectionEditor.dragAndDrop.setupChildDiv(part.div);
        });

        bam.arrangeParts();
    };

    bam.sectionEditor.endMixerMode = function () {
        bam.sectionEditor.mixerMode = false;
        bam.sectionEditor.mixerHints.style.display = "none";
        bam.sectionEditor.dragAndDrop.disable();

        bam.arrangeParts();
    };

    bam.sectionEditor.showSongEditor = function () {
        bam.sectionEditor.nextButtonClick();
    };

    bam.sectionEditor.editPart = function (part, callback) {
        bam.part = part;

        var fadeList = [bam.sectionEditor];
        //var fadeList = [bam.sectionEditor, part.controls];
        var otherPartsList = bam.section.div.getElementsByClassName("part2");
        for (var ii = 0; ii < otherPartsList.length; ii++) {
            if (otherPartsList.item(ii) !== part.div)
                fadeList.push(otherPartsList.item(ii));
            else
                part.position = ii;
        }

        if (part.data.surfaceURL !== "PRESET_SEQUENCER") {
            bam.mm.setPart(bam.part);
            bam.part.ui = bam.mm.ui;
            bam.fadeIn([bam.mm]);
            fadeList.push(bam.part.controls);
        }

        bam.fadeOut(fadeList);

        bam.sectionEditor.growPart(part, callback)
    };
    
    bam.sectionEditor.growPart = function (part, callback) {
        
        var child = {div: part.controls, 
                    canvas: part.canvas,
                    targetX: 0.10 * bam.bbody.clientWidth,
                    targetW: 0.80 * bam.bbody.clientWidth,
                    targetY: 0,
                    targetH: bam.windowHeight - part.canvas.offsetTop - 15};
        var children = [child];
        part.div.style.zIndex = "1";
        bam.grow(part.div, function () {
            if (callback) 
                callback();
            if (typeof bam.onzonechange === "function") {
                bam.onzonechange(bam.part);
            }
            if (part.ui) {
                part.ui.readOnly = false;
                part.ui.refresh();
            }
            part.div.style.zIndex = "auto";
        }, children);
    };
 };

OMusicEditor.prototype.setupSectionAddButtons = function (buttonGroup) {
    var bam = this;

    var mixerButton = document.createElement("div");
    mixerButton.className = "remixer-add-button";
    mixerButton.innerHTML = "Mixer <br/>View";
    buttonGroup.appendChild(mixerButton);
    mixerButton.onclick = function () {
        if (bam.sectionEditor.mixerMode) {
            bam.sectionEditor.endMixerMode();
            mixerButton.innerHTML = "Mixer <br/>View";
        } else {
            bam.sectionEditor.startMixerMode();
            mixerButton.innerHTML = "Standard <br/>View";
        }
    };

    var melodyButton = document.createElement("div");
    melodyButton.className = "remixer-add-button";
    melodyButton.innerHTML = "Add <br/>Melody";
    buttonGroup.appendChild(melodyButton);
    melodyButton.onclick = function () {

        var newdiv = bam.createElementOverElement("part2", melodyButton, bam.bbody);

        var newPart = new OMGPart(newdiv);
        newPart.section = bam.section;
        newPart.data.partType = "MELODY";
        newPart.position = bam.section.parts.length;
        bam.section.parts.push(newPart);

        var otherParts = [];
        var otherPartsList = bam.section.div.getElementsByClassName("part2");
        for (var ii = 0; ii < otherPartsList.length; ii++) {
            otherParts.push(otherPartsList.item(ii));
        }
        bam.fadeOut(otherParts);

        bam.part = newPart;
        bam.section.div.appendChild(newdiv);
        newdiv.style.display = "block";
        newdiv.style.zIndex = "1";

        bam.fadeOut([bam.sectionEditor]);
        bam.grow(newPart.div, function () {
            bam.fadeIn([bam.mm]);
            bam.mm.setPart(newPart);
            newdiv.style.zIndex = "auto";
        });
    };

    var bassButton = document.createElement("div");
    bassButton.className = "remixer-add-button";
    bassButton.innerHTML = "Add <br/>Bassline";
    buttonGroup.appendChild(bassButton);
    bassButton.onclick = function () {

        var newdiv = bam.createElementOverElement("part2", bassButton, bam.bbody);

        var newPart = new OMGPart(newdiv);
        newPart.section = bam.section;
        newPart.data.partType = "BASSLINE";
        newPart.data.soundsetURL = "PRESET_BASS";
        newPart.data.soundsetURL = "PRESET_OSC_SAW";
        newPart.position = bam.section.parts.length;
        bam.section.parts.push(newPart);

        var otherParts = [];
        var otherPartsList = bam.section.div.getElementsByClassName("part2");
        for (var ii = 0; ii < otherPartsList.length; ii++) {
            otherParts.push(otherPartsList.item(ii));
        }

        bam.fadeOut(otherParts);

        bam.section.div.appendChild(newdiv);
        newdiv.style.display = "block";
        newdiv.style.zIndex = "1";
        bam.part = newPart;

        bam.fadeOut([bam.sectionEditor]);
        bam.grow(newPart.div, function () {
            bam.fadeIn([bam.mm]);
            bam.mm.setPart(newPart);
            newdiv.style.zIndex = "auto";
        });
    };

    var drumButton = document.createElement("div");
    drumButton.className = "remixer-add-button";
    drumButton.innerHTML = "Add <br/>Drumbeat";
    buttonGroup.appendChild(drumButton);
    drumButton.onclick = function () {

        var newdiv = bam.createElementOverElement("part2", drumButton, bam.bbody);

        var newPart = new OMGDrumpart(newdiv)
        newPart.section = bam.section;
        newPart.data.partType = "DRUMBEAT";
        newPart.position = bam.section.parts.length;

        var otherParts = [];
        var otherPartsList = bam.section.div.getElementsByClassName("part2");
        for (var ii = 0; ii < otherPartsList.length; ii++) {
            otherParts.push(otherPartsList.item(ii));
        }
        bam.fadeOut(otherParts);

        bam.section.div.appendChild(newPart.div);
        newdiv.style.display = "block";
        bam.part = newPart;
        bam.section.parts.push(newPart);

        bam.setupPartDiv(newPart)

        bam.fadeOut([bam.sectionEditor]);
        bam.sectionEditor.growPart(newPart);

    };

};

OMusicEditor.prototype.setupSongEditor = function () {
    var bam = this;

    bam.songEditor = document.createElement("div");
    bam.songEditor.className = "area";
    bam.bbody.appendChild(bam.songEditor);

    bam.songEditor.editPanel = document.createElement("div");
    bam.songEditor.removeButton = document.createElement("div");
    bam.songEditor.removeButton.className = "horizontal-panel-option";
    bam.songEditor.removeButton.id = "remove-section-button"; //maybe for css?
    bam.songEditor.removeButton.innerHTML = "Remove";
    bam.songEditor.editPanel.className = "song-edit-panel";
    bam.songEditor.editPanel.appendChild(bam.songEditor.removeButton);
    bam.bbody.appendChild(bam.songEditor.editPanel);

    bam.songEditor.sectionWidth = 150;

    bam.songEditor.playButtonClick = function () {
        if (bam.player.playing)
            bam.player.stop();
        else
            bam.player.play(bam.song);
    };

    bam.songEditor.playingSection = 0;

    //TODO remove this if it's not used?
    bam.songEditor.clearButtonClick = function () {
        if (bam.player.playing)
            bam.player.stop();

        var sections = bam.song.sections;
        for (i = 0; i < sections.length; i++) {
            bam.song.div.removeChild(sections[i].div);
            bam.song.sections.splice(i, 1);
            i--;
        }

        bam.songEditor.emptyMessage.style.display = "block";
    };



    bam.songEditor.addSectionButtonClick = function () {

        var lastSection = bam.song.sections[bam.song.sections.length - 1] || new OMGSection();
        bam.copySection(lastSection);
        bam.song.sections.push(bam.section);
        bam.section.song = bam.song;
        bam.section.position = bam.song.sections.length - 1;
        bam.player.loopSection = bam.section.position;

        bam.songEditor.hide(bam.section, function () {
            //todo two animations simultaneously can't be perfomant
            bam.grow(bam.section.div);
            bam.arrangeParts(function () {
                bam.sectionEditor.show();
            });
        });

    };

    bam.songEditor.addSectionButton = document.createElement("div");
    bam.songEditor.addSectionButton.className = "section";
    bam.songEditor.addSectionButton.id = "add-section";
    bam.songEditor.addSectionButton.innerHTML = "+ Add Section";
    bam.songEditor.addSectionButton.style.top = "0px";
    bam.songEditor.appendChild(bam.songEditor.addSectionButton);
    if (bam.songEditor.addSectionButton) {
        bam.songEditor.addSectionButton.onclick = bam.songEditor.addSectionButtonClick;
    }


    bam.songEditor.nextButtonClick = function (saveCallback) {

        if (bam.player.playing)
            bam.player.stop();

        if (!bam.song.saved) {
            bam.song.data.id = undefined;
            bam.omgservice.post(bam.song.getData(), function (response) {
                if (response && response.id) {
                    bam.song.saved = true;
                    bam.song.data.id = response.id;
                    if (saveCallback) {
                        saveCallback();
                    }
                }
            });
        } else {
            if (saveCallback) {
                saveCallback();
            }
        }
    };

    bam.songEditor.hide = function (exceptSection, callback) {
        var fadeOutList = [bam.songEditor];
        bam.song.sections.forEach(function (section) {
            if (!exceptSection || exceptSection !== section) {
                fadeOutList.push(section.div);
            }
        });
        bam.fadeOut(fadeOutList, function () {
            if (exceptSection && exceptSection.beatmarker) {
                exceptSection.beatmarker.style.width = "0px";
            }
            if (callback) {
                callback();
            }
        });

    };

    bam.songEditor.show = function (exceptSection, callback) {

        var fadeInList = [bam.songEditor, bam.songEditor.addSectionButton];
        bam.song.sections.forEach(function (section) {
            if (section.beatMarker) {
                //
            }
            if (!exceptSection || exceptSection != section) {
                fadeInList.push(section.div);
            }
        });

        bam.fadeIn(fadeInList, callback);
        bam.arrangeSections();

        if (typeof bam.onzonechange == "function") {
            bam.onzonechange(bam.song);
        }
    };

    bam.songEditor.editSection = function (section, callback) {
        bam.section = section;
        bam.songEditor.hide(section, function () {
            bam.grow(section.div);
            bam.arrangeParts(function () {
                bam.player.loopSection = section.position;
                bam.sectionEditor.show(callback);
            });
        });
    };

    /*bam.songEditor.songName.onchange = function () {
     bam.song.data.name = bam.songEditor.songName.value;
     };*/

};

OMusicEditor.prototype.cancelPart = function (part) {
    var bam = this;

    bam.pausePart(part);

    var partInArray = bam.section.parts.indexOf(part);
    if (partInArray > -1) {
        bam.section.parts.splice(partInArray, 1);

        if (bam.section.parts.length == 0) {
            bam.player.stop();
            bam.sectionEditor.nosection.style.display = "block";
        }
    }

    bam.section.div.removeChild(part.div);

    if (part.div.onBeatPlayedListener) {
        var index = bam.player.onBeatPlayedListeners
                .indexOf(part.div.onBeatPlayedListener);
        if (index > -1) {
            bam.player.onBeatPlayedListeners.splice(index, 1);
        }
        part.div.onBeatPlayedListener = undefined;
    }

};

OMusicEditor.prototype.pausePart = function (part) {
    var bam = this;
    if (part.osc && part.oscStarted) {

        fadeOut(part.gain.gain, function () {
            part.osc.stop(0);
            part.playingI = null;

            part.osc.disconnect(part.gain);

            part.gain.disconnect(bam.player.context.destination);
            part.oscStarted = false;
            part.osc = null;
        });

    }
};

// wasn't bam
OMusicEditor.prototype.needsMP3 = function () {
    var ua = navigator.userAgent.toLowerCase();
    var iOS = (ua.match(/(ipad|iphone|ipod)/g) ? true : false);
    var safari = ua.indexOf('safari') > -1 && ua.indexOf('chrome') == -1;
    return iOS || safari;
}


OMusicEditor.prototype.sectionModified = function () {
    this.section.id = -1;
}

OMusicEditor.prototype.getLoadParams = function () {

    // see if there's somethign to do here
    var rawParams = document.location.search;
    var nvp;
    var params = {}

    if (rawParams.length > 1) {
        rawParams.slice(1).split("&").forEach(function (param) {
            nvp = param.split("=");
            params[nvp[0]] = nvp[1];
        });
    }
    return params;
};

// this was a pretty large function, still big though
OMusicEditor.prototype.load = function (params) {
    var bam = this;

    //hmmmm, why is this does here?
    if (!bam.windowWidth || bam.windowWidth < 0) {
        bam.windowWidth = bam.bbody.clientWidth;
        bam.windowHeight = bam.bbody.clientHeight;
        //bam.offsetLeft = bam.bbody.offsetLeft;
        //TODO figure out how mobile is used and if still needed
        bam.mobile = bam.windowWidth < 1000;
    }

    if (params.dataToLoad && params.dataToLoad.type) {
        params.type = params.dataToLoad.type;
    }
    if (params.type) {
        params.type = params.type.toUpperCase();
    } else {
        params.type = "MELODY";
        params.welcome = true;
    }

    // to make the beginning as pretty as possible (no weird flickers)
    // we whiteout the container divs and add their color after 
    // the current zone is setup
    var songBG;
    var sectionBG;
    var restoreColors = function () {
        if (bam.song)
            bam.song.div.style.backgroundColor = songBG;
        if (bam.section)
            bam.section.div.style.backgroundColor = sectionBG;
    };

    var songDiv = bam.div.getElementsByClassName("song")[0];
    bam.zones.push(songDiv);

    if (params.type == "SONG") {
        bam.fadeIn([songDiv, bam.songEditor, bam.songEditor.addSectionButton], restoreColors);
        params.songDiv = songDiv;
        bam.loadSong(params);
        return;
    }

    bam.song = new OMGSong(songDiv);
    bam.player.prepareSong(bam.song);

    var newDiv = document.createElement("div");
    newDiv.className = "section";
    bam.song.div.appendChild(newDiv);
    bam.zones.push(newDiv);

    songBG = window.getComputedStyle(bam.song.div, null).backgroundColor;
    bam.song.div.style.backgroundColor = "white";
    bam.song.div.style.display = "block";

    if (params.type == "SECTION") {
        params.sectionDiv = newDiv;
        params.callback = restoreColors;
        bam.loadSection(params);
        return;
    }

    bam.section = new OMGSection(newDiv);
    bam.section.song = bam.song;
    bam.song.sections.push(bam.section);

    sectionBG = window.getComputedStyle(bam.section.div, null).backgroundColor;
    bam.section.div.style.backgroundColor = "white";
    bam.section.div.style.display = "block";

    newDiv = document.createElement("div");
    newDiv.className = "part2";
    bam.section.div.appendChild(newDiv);
    bam.zones.push(newDiv);

    var loadPartCallback = function () {
        restoreColors();
        bam.initialized = true;
    };
    if (params.type == "DRUMBEAT" ||
            (params.dataToLoad && params.dataToLoad.partType == "DRUMBEAT")) {
        if (params.dataToLoad) {
            bam.part = new OMGDrumpart(newDiv, params.dataToLoad);
        } else {
            bam.part = new OMGDrumpart(newDiv);
            var ppart = bam.part;
            if (params.soundset) {
                bam.getSoundSet(params.soundset, function (ss) {
                    bam.player.setupDrumPartWithSoundSet(ss, ppart, true);
                });
            }
        }
        bam.setupPartDiv(bam.part);
        bam.part.div.style.display = "block";
        bam.part.controls.style.marginLeft = "10%";
        bam.part.controls.style.width = "80%";
        bam.part.controls.style.height = bam.windowHeight - 
                            bam.part.canvas.offsetTop - 15 + "px";
        bam.part.canvas.width = bam.part.controls.clientWidth;
        bam.part.canvas.height = bam.part.controls.clientHeight;
        bam.part.canvas.style.width = bam.part.canvas.width + "px";
        bam.part.canvas.style.height = bam.part.canvas.height + "px";
        bam.part.ui.refresh();
        bam.part.canvas.omusic_refresh();
        bam.part.ui.readOnly = false;

        bam.fadeIn([bam.part.div], function () {
            loadPartCallback();
        });
    } else {
        var welcome = false;
        if (params.dataToLoad) {
            bam.part = new OMGPart(newDiv, params.dataToLoad);
        } else {
            bam.part = new OMGPart(newDiv);
            bam.part.data.partType = params.type;
            welcome = true;
        }
        bam.fadeIn([bam.part.div, bam.mm], loadPartCallback);
        bam.mm.setPart(bam.part, welcome);
    }
    bam.part.section = bam.section;
    bam.section.parts.push(bam.part);

    if (typeof bam.onzonechange === "function")
        bam.onzonechange(bam.part);

    bam.refreshKeyTempoChordsButtons();
};

OMusicEditor.prototype.loadSong = function (params) {
    var bam = this;
    if (params.dataToLoad) {
        bam.song = new OMGSong(params.songDiv, params.dataToLoad);
        var newSection;
        var newSections = [];
        bam.song.sections.forEach(function (section) {
            newSections.push(bam.makeSectionDiv(section));
            section.parts.forEach(function (part) {
                bam.setupPartDiv(part);
                part.controls.rightBar.style.display = "none";
                part.controls.selectInstrument.style.display = "none";
                newSections.push(part.controls);
            });
        });
        bam.player.prepareSong(bam.song);
        bam.fadeIn(newSections);
        bam.arrangeSections(function () {
            if (params.section) {
                bam.editSectionOnLoad(params);
            } else {
                bam.initialized = true;
            }
        });
    }

    //if (!params.section && typeof bam.onzonechange == "function") {
    if (typeof bam.onzonechange == "function") {
        //needs this because songEditor.show() isn't called
        bam.onzonechange(bam.song);
    }

    bam.refreshKeyTempoChordsButtons();
};

OMusicEditor.prototype.editSectionOnLoad = function (params) {
    var bam = this;
    bam.song.sections.forEach(function (section) {
        if (params.section == section.data.id) {
            bam.songEditor.editSection(section, function () {
                if (params.part) {
                    bam.editPartOnLoad(params);
                } else {
                    bam.initialized = true;
                }
            });
        }
    });
};

OMusicEditor.prototype.editPartOnLoad = function (params) {
    var bam = this;
    bam.section.parts.forEach(function (part) {
        if (params.part == part.data.id) {
            bam.sectionEditor.editPart(part, function () {
                bam.initialized = true;    
            });
        }
    });
};

OMusicEditor.prototype.loadSection = function (params) {
    var bam = this;

    var newPart;
    var fadeIn = [params.sectionDiv, bam.sectionEditor];
    if (params.dataToLoad) {
        bam.section = new OMGSection(params.sectionDiv, params.dataToLoad);
        for (var ip = 0; ip < bam.section.parts.length; ip++) {
            newPart = bam.makePartDiv(bam.section.parts[ip]);
            if (newPart)
                fadeIn.push(newPart.div);
        }
        ;
    } else {
        bam.section = new OMGSection(params.sectionDiv);
    }
    bam.fadeIn(fadeIn, params.callback);
    bam.section.song = bam.song;
    bam.song.sections.push(bam.section);
    bam.arrangeParts(function () {
        if (params.part) {
            bam.editPartOnLoad(params);
        } else {
            bam.initialized = true;
        }
    });

    if (typeof bam.onzonechange == "function") {
        bam.onzonechange(bam.section);
    }

    bam.refreshKeyTempoChordsButtons();
}

OMusicEditor.prototype.clear = function () {
    var bam = this;

    if (bam.player.playing) {
        bam.player.stop();
    }

    bam.songEditor.style.display = "none";
    bam.sectionEditor.style.display = "none";
    bam.mm.style.display = "none";

    bam.song.div.innerHTML = "";
    bam.section = undefined;
    bam.part = undefined;
};

OMusicEditor.prototype.toggleMute = function (part, newMute) {
    if (newMute == undefined) {
        newMute = !part.muted;
    }
    if (newMute) {
        part.muted = true;

        part.controls.style.backgroundColor = "#FF8888";

        if (part.gain) {
            part.preMuteGain = part.gain.gain.value;
            part.gain.gain.value = 0;
        }
    } else {
        part.muted = false;

        part.controls.style.backgroundColor = "";

        if (part.gain && part.preMuteGain) {
            part.gain.gain.value = part.preMuteGain;
        }
    }
};




function fadeOut(gain, callback) {

    var level = gain.value;
    var dpct = 0.015;
    var interval = setInterval(function () {
        if (level > 0) {
            level = level - dpct;
            gain.setValueAtTime(level, 0);
        } else {
            clearInterval(interval);

            if (callback)
                callback();
        }
    }, 1);
}


function rescale(part, rootNote, scale) {

    var octaveShift = part.data.octave || part.data.octaveShift;
    var octaves2;
    if (isNaN(octaveShift))
        octaveShift = part.data.type == "BASSLINE" ? 3 : 5;
    var newNote;
    var onote;
    var note;
    for (var i = 0; i < part.data.notes.length; i++) {
        octaves2 = 0;

        onote = part.data.notes[i];
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

}


OMusicEditor.prototype.drawDrumCanvas = function (part, subbeat) {

    if (part.data.tracks.length == 0)
        return;

    var params = {};
    params.drumbeat = part.data;
    params.canvas = part.canvas;
    params.subbeat = subbeat;
    params.songData = this.song.data;

    omg.ui.drawDrumCanvas(params);

}

OMusicEditor.prototype.getSelectInstrumentOptions = function (type) {
    var select = "";
    if (type == "BASSLINE") {
        select += "<option value='DEFAULT'>Saw Wave</option>";
    } else if (type == "MELODY") {
        select += "<option value='DEFAULT'>Sine Wave</option>";
    } else if (type == "DRUMBEAT") {
        select += "<option value='PRESET_HIPKIT'>Hip Hop Drum Kit</option>";
        select += "<option value='PRESET_ROCKKIT'>Rock Drum Kit</option>";
    }

    this.soundsets.forEach(function (soundset) {
        select += "<option value='" + soundset.url + "'>" +
                soundset.name + "</option>";
    });

    return select;

};

function debug(out) {
    console.log(out);
}

/* bam components */

OMusicEditor.prototype.setupMelodyMaker = function () {
    var bam = this;

    bam.mm = document.createElement("div");
    bam.mm.className = "area";
    bam.bbody.appendChild(bam.mm);

    var canvas = document.createElement("canvas");
    bam.mm.appendChild(canvas);

    canvas.style.width = "80%";
    canvas.style.marginLeft = "10%";
    bam.mm.canvas = canvas;

    bam.mm.ui = new OMGMelodyMaker(canvas, undefined, bam.player);

    bam.mm.setSize = function (width, height) {
        if (width == undefined) {
            width = canvas.clientWidth;
        }
        if (height == undefined) {
            height = bam.windowHeight - canvas.offsetTop - 15;
        }

        bam.mm.ui.setSize(width, height);
    };

    bam.mm.setSize();

    bam.mm.ui.hasDataCallback = function () {
        //TODO if the welcome screen is up, this should fade in the the controls
        //actually, should be a callback to music-maker, cause this file shouldn't know
        //what the external controls are
    };

    bam.mm.setPart = function (part, welcomeStyle) {

        /*if (welcomeStyle)
         bam.mm.caption.style.opacity = 0;
         else
         bam.mm.caption.style.opacity = 1;
         */
        bam.mm.ui.setPart(part, welcomeStyle);

        if (typeof bam.onzonechange == "function") {
            bam.onzonechange(part);
        }
    };

    bam.mm.playButtonClick = function () {
        if (bam.player.playing) {
            bam.player.stop();
            return;
        }
        bam.player.play();
    };

    bam.mm.nextButtonClick = function () {

        var part = bam.part;

        var type = bam.part.data.type;
        var surface = bam.part.data.surfaceURL;

        if (bam.sectionEditor.mixerMode) {
            bam.sectionEditor.dragAndDrop.setupChildDiv(part.div);
        }

        if (!part.saved) {
            part.saving = true;
            bam.omgservice.post(part.data, function (response) {
                if (response && response.id) {
                    part.saved = true;
                } else {
                    debug(response);
                }
                part.saving = false;
            });

            //TODO THIS NEEDS TO CHECK TO SEE IF THE USER IS LOGGED IN

        }

        var shrinkPart = function () {
            if (typeof bam.onzonechange == "function") {
                bam.onzonechange(bam.section);
            }
            part.div.style.zIndex = "1";

            bam.popZone(bam.part.div);
            bam.setupPartDiv(part);

            var otherParts = [];
            if (part.data.partType !== "DRUMBEAT")
                otherParts.push(part.controls);
            var otherPart;
            var otherPartsList = bam.section.div
                    .getElementsByClassName("part2");
            for (var ii = 0; ii < otherPartsList.length; ii++) {
                otherPart = otherPartsList.item(ii)
                if (bam.part.div != otherPart) {
                    otherParts.push(otherPart);
                }
            }

            otherParts.push(bam.sectionEditor);
            bam.fadeIn(otherParts);

            bam.arrangeParts();
        };

        if (surface == "PRESET_SEQUENCER") {
            bam.part.ui.readOnly = true;
            shrinkPart();
        } else {
            //todo not fade out the whole melody maker, just the edit parts
            bam.fadeOut([bam.mm], shrinkPart);
            bam.mm.playAfterAnimation = false;
        }
    };

    //TODO not used, use it, or lose it
    bam.mm.clearButtonClick = function () {
        if (bam.part.data.type == "DRUMBEAT") {
            var track;
            for (var i = 0; i < bam.part.data.tracks.length; i++) {
                track = bam.part.data.tracks[i];
                for (var j = 0; j < track.data.length; j++) {
                    track.data[j] = 0;
                }
            }
        } else {
            bam.part.data.notes = [];
            bam.mm.lastNewNote = 0;
            bam.mm.ui.canvas.mode = "APPEND";
            bam.mm.ui.drawCanvas();

        }
    };
};

/* bam ui stuff */
OMusicEditor.prototype.popZone = function (div) {
    var bam = this;

    // remove us from the zone hierarchy
    bam.zones.pop();

    div.style.borderWidth = "1px";
    div.style.borderRadius = bam.borderRadius + "px";
    div.style.cursor = "pointer";

};

OMusicEditor.prototype.grow = function (div, callback, children) {
    var bam = this;

    bam.zones.push(div);

    if (div.captionDiv)
        div.captionDiv.style.display = "none";

    var originalH = div.clientHeight;
    var originalW = div.clientWidth;
    var originalX = div.offsetLeft;
    var originalY = div.offsetTop;
    
    if (children) {
        children.forEach(function (child) {
            child.originalH = child.div.clientHeight;
            child.originalW = child.div.clientWidth;
            child.originalX = child.div.offsetLeft;
            child.originalY = child.div.offsetTop;
        });
    }

    var startedAt = Date.now();

    // mainly if the song is slid left, the section needs to be the in right spot
    var leftOffset = 0;
    if (div.parentElement && div.parentElement.offsetLeft < 0) {
        leftOffset = -1 * div.parentElement.offsetLeft;
    }

    var interval = setInterval(function () {
        var now = Date.now() - startedAt;
        var now = Math.min(1, now / bam.animLength);

        div.style.left = originalX + (leftOffset - originalX) * now + "px";
        div.style.top = originalY + (0 - originalY) * now + "px";

        div.style.width = originalW + (bam.windowWidth - originalW)
                * now + "px";
        div.style.height = originalH + (bam.windowHeight - originalH)
                * now + "px";


        if (children) {
            children.forEach(function (child) {
                child.div.style.marginLeft = child.originalX + (child.targetX - child.originalX) * now + "px";
                child.div.style.top = child.originalY + (0 - child.originalY) * now + "px";

                child.width = child.originalW + (child.targetW - child.originalW) * now;
                child.height = child.originalH + (child.targetH - child.originalH) * now;
                child.div.style.width = child.width + "px";
                child.div.style.height = child.height + "px";
                
                if (child.canvas) {
                    child.canvas.style.width = child.width + "px";
                    child.canvas.style.height = child.height + "px";
                    child.canvas.width = child.width;
                    child.canvas.height = child.height;
                    child.canvas.omusic_refresh();
                }
            });
        }

        if (now == 1) {
            clearInterval(interval);
            div.style.borderWidth = "0px";
            div.style.borderRadius = "0px";
            div.style.cursor = "auto";
            if (callback)
                callback();
        }
    }, 1000 / 60);
};


OMusicEditor.prototype.arrangeParts = function (callback) {
    var bam = this;

    var div = bam.section.div;

    if (bam.section.parts.length == 0) {
        bam.sectionEditor.nosection.style.display = "block";
    } else {
        bam.sectionEditor.nosection.style.display = "none";
    }

    var children = [];
    var child;

    var top = bam.offsetTop; //bam.mobile ? 60 : 88; 
    var height = bam.mobile ? 75 : 105;
    var width = Math.min((bam.windowWidth - bam.offsetLeft) * 0.7);

    if (bam.sectionEditor.mixerMode) {
        width = height;
        height = height * 0.8;
    }

    var spaceBetween = 18;

    var extraRows = 0.2; //bam.mobile ? 2.7 : 1;
    if (top + (height + spaceBetween) * (bam.section.parts.length + extraRows) > bam.windowHeight) {
        height = (bam.windowHeight - top) / (bam.section.parts.length + extraRows);
        spaceBetween = height * 0.1;
        height = height * 0.9;
    }

    var volume, pan;
    var parts = div.getElementsByClassName("part2");
    for (var ip = 0; ip < parts.length; ip++) {
        child = {
            div: parts.item(ip)
        };
        child.originalH = child.div.clientHeight;
        child.originalW = child.div.clientWidth;
        child.originalX = child.div.offsetLeft;
        child.originalY = child.div.offsetTop;

        if (bam.sectionEditor.mixerMode) {
            volume = bam.section.parts[ip].data.volume || 0.6;
            pan = bam.section.parts[ip].data.pan || 0;
            child.targetX = bam.windowWidth * (pan / 2 + 0.5) - width / 2; //;
            child.targetY = bam.windowHeight * (1 - volume) - height / 2;
        } else {
            child.targetX = bam.bbody.clientWidth * 0.1; //bam.offsetLeft;
            child.targetY = top + ip * (height + spaceBetween);
        }
        child.targetW = width;
        child.targetH = height;

        child.controls = child.div.getElementsByClassName("part-controls").item(0);
        child.canvas = child.div.getElementsByTagName("canvas").item(0);
        child.canvasOriginalX = child.canvas.offsetLeft;
        child.canvasOriginalW = child.canvas.clientWidth;

        children.push(child);
        
    }

    child = {
        div: bam.sectionEditor.nosection
    };
    child.originalH = child.div.clientHeight;
    child.originalW = child.div.clientWidth;
    child.originalX = child.div.offsetLeft;
    child.originalY = child.div.offsetTop;
    child.targetH = child.div.clientHeight;
    child.targetW = bam.bbody.clientWidth;
    child.targetX = bam.bbody.clientWidth * 0.1;
    child.targetY = child.div.offsetTop;
    children.push(child);



    if (bam.sectionEditor.addButtons) {
        child = {
            div: bam.sectionEditor.addButtons
        };
        child.originalH = child.div.clientHeight;
        child.originalW = child.div.clientWidth;
        child.originalX = bam.bbody.clientWidth * 0.9 - 140;
        child.originalY = child.div.offsetTop;
        child.targetX = bam.bbody.clientWidth * 0.9 - 140;
        child.targetY = 0;
        child.targetW = 50; //child.div.clientWidth;
        child.targetH = child.div.clientHeight;
        children.push(child);
    }

    var startedAt = Date.now();

    var interval = setInterval(function () {
        var now = Date.now() - startedAt;
        var now = Math.min(1, now / bam.animLength);
        var cwidth, cheight;

        for (ip = 0; ip < children.length; ip++) {
            child = children[ip];
            child.div.style.left = child.originalX
                    + (child.targetX - child.originalX) * now + "px";
            child.div.style.top = child.originalY
                    + (child.targetY - child.originalY) * now + "px";

            cwidth = child.originalW + (child.targetW - child.originalW) * now;
            cheight = child.originalH + (child.targetH - child.originalH) * now
            child.div.style.width = cwidth + "px";
            child.div.style.height = cheight + "px";

            if (child.canvas) {
                
                cwidth = child.canvasOriginalW + (child.targetW - child.canvasOriginalW) * now;

                child.controls.style.width = cwidth + "px";
                child.controls.style.height = cheight - child.canvas.offsetTop + "px";
                child.canvas.style.width = cwidth + "px";
                child.canvas.style.height = cheight - child.canvas.offsetTop + "px";
                child.canvas.width = cwidth;
                child.canvas.height = cheight - child.canvas.offsetTop;

                //child.canvas.style.marginLeft = child.canvasOriginalX
                //                - child.canvasOriginalX * now + "px";
                child.controls.style.marginLeft = child.canvasOriginalX
                                - child.canvasOriginalX * now + "px";

                if (typeof (child.canvas.omusic_refresh) === "function") {
                    child.canvas.omusic_refresh(cwidth, cheight - child.canvas.offsetTop);
                }
            }
        }

        if (now == 1) {
            for (var ip = 0; ip < parts.length; ip++) {
                parts.item(ip).style.zIndex = "auto";
            }
    
            clearInterval(interval);
            if (callback)
                callback();
        }
    }, 1000 / 60);
};



OMusicEditor.prototype.arrangeSections = function (callback, animLength) {

    var bam = this;

    if (bam.arrangeSectionsHandle > 0) {
        clearInterval(bam.arrangeSectionsHandle);
        bam.arrangeSectionsHandle = 0;
    }

    var div = bam.song.div;

    if (!bam.song.slidLeft)
        bam.song.slidLeft = 0;

    var children;
    var child;
    var grandchild;
    var partCanvas;

    var top = bam.offsetTop;

    var windowHeight = bam.windowHeight || window.innerHeight;

    var height = Math.min(300, windowHeight - top - 100);

    var sectionWidth = bam.songEditor.sectionWidth;

    children = [];
    var parts;
    var sections = bam.song.sections;
    for (var ip = 0; ip < sections.length; ip++) {
        sections[ip].position = ip;
        child = {
            div: sections[ip].div
        };
        child.originalH = child.div.clientHeight;
        child.originalW = child.div.clientWidth;
        child.originalX = child.div.offsetLeft;
        child.originalY = child.div.offsetTop;

        child.targetX = bam.offsetLeft + ip * (10 + sectionWidth);
        child.targetY = top;
        child.targetW = sectionWidth;
        child.targetH = height;

        children.push(child);
        if (!sections[ip].partsAreClean) {
            sections[ip].partsAreClean = true;

            child.children = [];
            parts = child.div.getElementsByClassName("part2");
            for (var ipp = 0; ipp < parts.length; ipp++) {
                grandchild = {
                    div: parts.item(ipp)
                };
                grandchild.originalH = grandchild.div.clientHeight;
                grandchild.originalW = grandchild.div.clientWidth;
                grandchild.originalX = grandchild.div.offsetLeft;
                grandchild.originalY = grandchild.div.offsetTop;

                bam.setTargetsSmallParts(grandchild, ipp, parts.length, child.targetW, child.targetH, sectionWidth);
                child.children.push(grandchild);

                grandchild.canvas = grandchild.div.getElementsByTagName("canvas").item(0);
            }
        }
    }

    if (bam.songEditor.addSectionButton) {
        child = {
            div: bam.songEditor.addSectionButton
        };
        child.originalH = child.div.clientHeight - 100; // padding does the rest;
        child.originalW = 60; // padding does the rest;
        child.originalX = child.div.offsetLeft;
        child.originalY = child.div.offsetTop;
        child.targetX = bam.offsetLeft + 5 + bam.song.sections.length * (10 + sectionWidth) - bam.song.slidLeft;
        child.targetY = bam.offsetTop;
        child.targetW = child.originalW;

        child.targetH = height - 100;
        children.push(child);
    }

    var startedAt = Date.now();

    if (!animLength)
        animLength = bam.animLength;

    var intervalFunction = function () {
        var now = Date.now() - startedAt;
        now = Math.min(1, now / animLength);

        for (var ip = 0; ip < children.length; ip++) {
            child = children[ip];
            child.div.style.left = child.originalX
                    + (child.targetX - child.originalX) * now + "px";
            child.div.style.top = child.originalY
                    + (child.targetY - child.originalY) * now + "px";
            child.div.style.width = child.originalW
                    + (child.targetW - child.originalW) * now + "px";
            child.div.style.height = child.originalH
                    + (child.targetH - child.originalH) * now + "px";

            if (child.children) {
                var gchild, gwidth, gheight;
                for (var ipp = 0; ipp < child.children.length; ipp++) {
                    gchild = child.children[ipp];
                    gchild.div.style.left = gchild.originalX
                            + (gchild.targetX - gchild.originalX) * now + "px";
                    gchild.div.style.top = gchild.originalY
                            + (gchild.targetY - gchild.originalY) * now + "px";
                    gwidth = gchild.originalW + (gchild.targetW - gchild.originalW) * now;
                    gheight = gchild.originalH + (gchild.targetH - gchild.originalH) * now;

                    gchild.div.style.width = gwidth + "px"
                    gchild.div.style.height = gheight + "px";

                    if (gchild.canvas) {
                        gchild.canvas.style.width = gwidth + "px";
                        gchild.canvas.style.height = gheight + "px";
                        gchild.canvas.width = gwidth;
                        gchild.canvas.height = gheight;

                        if (gchild.canvas.omusic_refresh)
                            gchild.canvas.omusic_refresh(gwidth, gheight);

                    }
                }

            }
        }

        if (now == 1) {
            clearInterval(interval);
            if (callback)
                callback();
        }
    };

    var interval = setInterval(intervalFunction, 1000 / 60);
    bam.arrangeSectionsHandle = interval;
};


OMusicEditor.prototype.fadeOut = function (divs, callback) {
    var bam = this;

    for (var ii = 0; ii < divs.length; ii++) {
        bam.fadingOut.push(divs[ii]);
        divs[ii].cancelFadeOut = false;
    }

    var startedAt = Date.now();

    var interval = setInterval(function () {

        var now = Date.now() - startedAt;
        now = Math.min(1, now / bam.animLength);

        for (var ii = 0; ii < divs.length; ii++) {
            if (!divs[ii].cancelFadeOut) {
                divs[ii].style.opacity = 1 - now;
            }
        }

        if (now == 1) {
            var foI;
            for (var ii = 0; ii < divs.length; ii++) {
                if (!divs[ii].cancelFadeOut) {
                    divs[ii].style.display = "none";
                }

                foI = bam.fadingOut.indexOf(divs[ii]);
                if (foI > -1) {
                    bam.fadingOut.splice(foI, 1);
                }
            }

            clearInterval(interval);
            if (callback) {
                callback();
            }
        }
    }, 1000 / 60);
};

OMusicEditor.prototype.fadeIn = function (divs, callback) {
    var bam = this;

    var fadingOutI;
    var startedAt = Date.now();
    var div;
    for (var ii = 0; ii < divs.length; ii++) {
        div = divs[ii];

        if (!div) {
            divs.splice(ii, 1);
            ii--;
            continue;
        }

        div.style.opacity = 0
        div.style.display = "block";

        //quick way to avoid a fadeout display=none'ing a div
        // a fadeout finishing mid fadein
        fadingOutI = bam.fadingOut.indexOf(div);
        if (fadingOutI > -1) {
            div.cancelFadeOut = true;
        }
    }

    var interval = setInterval(function () {

        var now = Date.now() - startedAt;
        now = Math.min(1, now / bam.animLength);

        for (var ii = 0; ii < divs.length; ii++) {
            divs[ii].style.opacity = now;
        }

        if (now == 1) {
            clearInterval(interval);

            if (callback)
                callback();

        }
    }, 1000 / 60);
};

OMusicEditor.prototype.createElementOverElement = function (classname, button, parent) {
    var offsets = omg.ui.totalOffsets(button, parent)

    var newPartDiv = document.createElement("div");
    newPartDiv.className = classname;

    newPartDiv.style.left = offsets.left + "px";
    newPartDiv.style.top = offsets.top + "px";
    newPartDiv.style.width = button.clientWidth + "px";
    newPartDiv.style.height = button.clientHeight + "px";

    newPartDiv.style.borderRadius = this.borderRadius + "px";
    newPartDiv.style.borderWidth = "1px";
    return newPartDiv;
};

OMusicEditor.prototype.copySection = function (section) {
    var bam = this;

    var newDiv = bam.createElementOverElement("section",
            bam.songEditor.addSectionButton, bam.bbody);
    var newSection = new OMGSection(newDiv);
    bam.song.div.appendChild(newDiv);

    newDiv.style.left = bam.songEditor.addSectionButton.offsetLeft + //bam.offsetLeft + 
            bam.song.slidLeft + "px";

    newSection.div.style.borderWidth = "1px";
    newSection.div.style.borderRadius = bam.borderRadius + "px";

    bam.fadeIn([newDiv]);

    var newPartDiv;
    var newPart;
    var targets;

    for (var ip = 0; ip < section.parts.length; ip++) {
        newPartDiv = document.createElement("div");
        newPartDiv.className = "part2";
        newPartDiv.style.display = "block";
        newPartDiv.style.borderWidth = "1px";
        newPartDiv.style.borderRadius = bam.borderRadius + "px";
        newDiv.appendChild(newPartDiv);

        targets = bam.setTargetsSmallParts(null, ip, section.parts.length,
                newDiv.clientWidth, newDiv.clientHeight);

        newPart = new OMGPart(newPartDiv);
        newSection.parts.push(newPart);
        newPart.section = newSection;
        newPart.position = ip;

        bam.reachTarget(newPartDiv, targets);

        newPart.data = JSON.parse(JSON.stringify(section.parts[ip].data));

        bam.setupPartDiv(newPart);
        newPart.controls.rightBar.style.display = "none";
        newPart.controls.selectInstrument.style.display = "none";
    }

    bam.section = newSection;
    bam.setupSectionDiv(newSection);

    return newSection;
};

OMusicEditor.prototype.setTargetsSmallParts = function (targets, partNo, partCount, w, h, sectionWidth) {
    var bam = this;

    if (!targets)
        targets = {};

    //imma just do this
    w = sectionWidth || 100;
    h = h || 300;

    targets.targetX = 15;
    targets.targetY = 15 + partNo * (h - 15) / partCount;
    targets.targetW = w - 30 - 4; // margin and padding
    targets.targetH = (h - 15) / partCount - 15;

    return targets;
}

OMusicEditor.prototype.reachTarget = function (div, target) {
    div.style.left = target.targetX + "px";
    div.style.top = target.targetY + "px";
    div.style.width = target.targetW + "px";
    div.style.height = target.targetH + "px";
};

OMusicEditor.prototype.setupSectionDiv = function (section) {
    var bam = this;

    if (!section.div) {

    }

    //todo we should not do this here, we still want to allow scrolling
    if (bam.readOnly) {
        return;
    }

    section.setup = true;

    section.div.style.cursor = "pointer";

    var addButton = bam.songEditor.addSectionButton;
    var removeButton = bam.songEditor.removeButton;
    var editPanel = bam.songEditor.editPanel;

    var downTimeout;

    var lastXY = [-1, -1];
    var overCopy = false;
    var overRemove = false;
    section.div.onmousedown = function (event) {
        event.preventDefault();
        section.div.ondown(event.clientX, event.clientY);
    };
    section.div.ontouchstart = function (event) {
        event.preventDefault();
        section.div.ondown(event.targetTouches[0].pageX, event.targetTouches[0].pageY);
    };

    section.div.ondown = function (x, y) {
        if (bam.zones[bam.zones.length - 1] != bam.song.div) {
            return;
        }

        bam.song.firstX = x;
        bam.song.lastX = x;

        bam.song.doClick = true;

        bam.startSongSliding();

        // if 250 ms go by with little movement, cancel the click
        // and move the individual section instead of all       
        downTimeout = setTimeout(function () {

            bam.song.doClick = false;

            if (Math.abs(bam.song.lastX - bam.song.firstX) < 15) {

                bam.song.div.sliding = false;
                bam.setOnMove(bam.song.div, undefined);
                bam.setOnUp(bam.song.div, undefined);

                dragOneSection();
            }

        }, 250);

        var dragOneSection = function () {
            section.dragging = true;
            section.div.style.zIndex = "1";

            addButton.innerHTML = "(Copy Section)";

            bam.fadeIn([editPanel]);

            section.doneDragging = function () {
                addButton.innerHTML = "+ Add Section";
                addButton.style.backgroundColor = section.div.style.backgroundColor;
                section.dragging = false;
                overCopy = false;

                bam.arrangeSections(function () {
                    section.div.style.zIndex = "0";
                });

                bam.fadeOut([editPanel]);
                bam.song.div.onmousemove = undefined;
                bam.song.div.ontouchmove = undefined;

            };
            bam.song.div.onmousemove = function (event) {
                bam.song.div.onmove([event.clientX, event.clientY]);
            };
            bam.song.div.ontouchmove = function (e) {
                bam.song.div.onmove([e.targetTouches[0].pageX,
                    e.targetTouches[0].pageY]);
            };


            bam.song.div.onmove = function (xy) {

                if (bam.zones[bam.zones.length - 1] != bam.song.div) {
                    bam.song.div.onmousemove = undefined;
                    return;
                }

                if (section.dragging) {

                    section.div.style.left = section.div.offsetLeft
                            + xy[0] - lastXY[0] + "px";
                    section.div.style.top = section.div.offsetTop
                            + xy[1] - lastXY[1] + "px";
                    lastXY = xy;

                    var centerX = section.div.clientWidth / 2
                            + section.div.offsetLeft;
                    var centerY = section.div.clientHeight / 2
                            + section.div.offsetTop;

                    var addOffsets = omg.ui.totalOffsets(addButton);
                    var removeOffsets = omg.ui.totalOffsets(removeButton);
                    var slidLeft = bam.song.slidLeft;
                    if (centerX > addOffsets.left + slidLeft
                            && centerX < addOffsets.left
                            + addButton.clientWidth + slidLeft
                            && centerY > addOffsets.top
                            && centerY < addOffsets.top
                            + addButton.clientHeight) {
                        addButton.style.backgroundColor = "white";
                        overCopy = true;
                    } else {
                        addButton.style.backgroundColor = section.div.style.backgroundColor;
                        overCopy = false;
                    }
                    if (centerX > removeOffsets.left + slidLeft
                            && centerX < removeOffsets.left
                            + removeButton.clientWidth + slidLeft
                            && centerY > removeOffsets.top
                            && centerY < removeOffsets.top
                            + removeButton.clientHeight * 2) {
                        removeButton.style.backgroundColor = "red";
                        overRemove = true;
                    } else {
                        removeButton.style.backgroundColor = "#FFCCCC";
                        overRemove = false;
                    }
                }
            };

            lastXY = [x, y];
        };
    };

    section.div.ontouchend = function () {
        section.div.onmouseup();
    }
    section.div.onmouseup = function () {
        section.div.onup();
    }
    section.div.onup = function () {

        if (bam.zones[bam.zones.length - 1] != bam.song.div) {
            return;
        }

        if (section.dragging) {
            if (overCopy) {
                bam.song.sections.push(bam.copySection(section));
            }
            if (overRemove) {
                bam.song.sections.splice(section.position, 1);
                bam.song.div.removeChild(section.div);
                bam.arrangeSections();
            }

            section.doneDragging();
        }

        if (!bam.song.doClick)
            return;

        clearTimeout(downTimeout);

        //arrangeparts needs this
        bam.section = section;

        bam.player.loopSection = section.position;
        bam.songEditor.hide(section, function () {

            bam.grow(section.div);

            bam.arrangeParts(function () {

                bam.sectionEditor.show();

            });
        });
        section.div.onclick = null;
    };
}

OMusicEditor.prototype.startSongSliding = function () {
    var bam = this;

    bam.song.div.sliding = true;

    bam.setOnMove(bam.song.div, function (x_move, y_move) {
        if (!bam.song.div.sliding) {
            return;
        }

        bam.slideSong(x_move);
    });
    bam.setOnUp(bam.song.div, function () {
        bam.setOnMove(bam.song.div, undefined);
        bam.setOnUp(bam.song.div, undefined);
        bam.song.div.sliding = false;
    });

    if (bam.songEditor.addSectionButton) {
        bam.setOnMove(bam.songEditor.addSectionButton, function (x_move) {
            if (bam.song.div.sliding) {
                bam.slideSong(x_move);
            }
            return false;
        });
        bam.setOnUp(bam.songEditor.addSectionButton, function () {
            if (bam.song.div.sliding) {
                bam.setOnMove(bam.song.div, undefined);
                bam.setOnUp(bam.song.div, undefined);
                bam.song.div.sliding = false;
            }
            return false;
        });
    }

};

OMusicEditor.prototype.slideSong = function (x_move) {
    var bam = this;

    if (Math.abs(bam.song.lastX - bam.song.firstX) > 15) {
        bam.song.doClick = false;
    }

    if (!bam.song.slidLeft)
        bam.song.slidXLeft = 0;

    bam.song.slidLeft += bam.song.lastX - x_move;
    bam.song.slidLeft = Math.max(0, bam.song.slidLeft);

    bam.song.div.style.width = bam.windowWidth + bam.song.slidLeft + "px";
    bam.song.div.style.left = -1 * bam.song.slidLeft + "px";

    bam.songEditor.addSectionButton.style.left = bam.offsetLeft +
            5 + bam.song.sections.length * (10 + bam.songEditor.sectionWidth) - bam.song.slidLeft + "px";

    bam.song.lastX = x_move;

};

OMusicEditor.prototype.makePartDiv = function (part) {
    var bam = this;

    var newDiv = document.createElement("div");
    newDiv.className = "part2";
    newDiv.style.display = "block";
    newDiv.style.borderWidth = "1px";
    newDiv.style.borderRadius = bam.borderRadius + "px";

    part.div = newDiv;

    if (part) {
        bam.section.div.appendChild(newDiv);
        //bam.section.parts.push(part);
        bam.setupPartDiv(part);

    }

    return part;
};

OMusicEditor.prototype.makeSectionDiv = function (section) {
    var bam = this;

    var newDiv = document.createElement("div");
    newDiv.className = "section";
    newDiv.style.display = "block";
    bam.song.div.appendChild(newDiv);

    section.div = newDiv;

    section.div.style.borderWidth = "1px";
    section.div.style.borderRadius = bam.borderRadius + "px";

    //I think makeParts() wants this
    bam.section = section;

    var targets;
    var newPart;
    var newParts = [];
    var newPartDiv;
    for (var ip = 0; ip < section.parts.length; ip++) {

        newPart = bam.makePartDiv(section.parts[ip]);

        if (newPart) {
            newPartDiv = newPart.div;
            newParts.push(newPartDiv);

            newPart.controls.style.display = "none";
            targets = bam.setTargetsSmallParts(null, ip, section.parts.length,
                    newDiv.clientWidth, newDiv.clientHeight);

            bam.reachTarget(newPartDiv, targets);
        }
    }

    bam.setupSectionDiv(section);

    bam.fadeIn(newParts);
    return newDiv;
};


OMusicEditor.prototype.songZoneBeatPlayed = function (isubbeat, isection) {
    var bam = this;

    if (isubbeat === 0 && isection === 0) {
        bam.song.sections.forEach(function (section) {
            if (section.beatmarker) {
                section.beatmarker.style.width = "0px";
            }
        });
    }

    var section = bam.song.sections[isection];
    if (!section)
        return;


    if (!section.beatmarker) {
        section.beatmarker = document.createElement("div");
        section.beatmarker.className = "beat-marker";
        section.div.appendChild(section.beatmarker);
        section.beatmarker.style.left = "0px";
        section.beatmarker.style.top = "0px";
        section.beatmarker.style.height = "100%";
        section.beatmarker.style.zIndex = 1;
    }

    section.beatmarker.style.display = "block";
    if (isubbeat == 0 && isection > 0) {
        bam.song.sections[isection - 1].beatmarker.style.width = "100%";
    }
    //section.beatmarker.style.width = isubbeat / this.player.getTotalSubbeats() * 100 + "%";
    if (isubbeat % 4 == 0) {
        //if we wanted to do it only the downbeats
    }
};

OMusicEditor.prototype.partZoneBeatPlayed = function (isubbeat) {
    var bam = this;

    //dec2017, I think partType is the way to go
    if (bam.part.data.type == "DRUMBEAT" ||
            bam.part.data.partType == "DRUMBEAT" ||
            bam.part.data.surfaceURL == "PRESET_SEQUENCER") {
        bam.part.canvas.omusic_refresh(isubbeat);
    } else {
        bam.mm.ui.drawCanvas();

    }
};

OMusicEditor.prototype.sectionZoneBeatPlayed = function (isubbeat) {
    var bam = this;

    bam.section.parts.forEach(function (part) {
        if (part.canvas)
            part.canvas.update(isubbeat);
    });
};


OMusicEditor.prototype.makeTargets = function (thingsOfAType, setTarget) {
    var children = [];
    thingsOfAType.forEach(function (thing, ii) {
        thing.position = ii;

        child = {div: thing.div};

        child.originalH = child.div.clientHeight;
        child.originalW = child.div.clientWidth;
        child.originalX = child.div.offsetLeft;
        child.originalY = child.div.offsetTop;

        setTarget(child, ii);

        children.push(child);
    });

    return children;
};



OMusicEditor.prototype.setOnMove = function (element, callback) {

    if (callback) {
        element.onmousemove = function (event) {
            event.preventDefault();
            callback(event.clientX, event.clientY);
        };
        element.ontouchmove = function (event) {
            event.preventDefault();
            callback(event.targetTouches[0].pageX,
                    event.targetTouches[0].pageY);
        };
    } else {
        element.onmousemove = callback;
        element.ontouchmove = callback;
    }

};
OMusicEditor.prototype.setOnUp = function (element, callback) {

    if (callback) {
        /*element.onmouseout = function(event) {
         event.preventDefault();
         callback(-1, -1);
         };*/
        element.onmouseup = function (event) {
            event.preventDefault();
            callback(event.clientX, event.clientY);
        };
        element.ontouchend = function (event) {
            event.preventDefault();
            callback(-1, -1);
        };
    } else {
        element.onmouseup = undefined;
        element.ontouchend = undefined;
        element.onmouseout = undefined;
    }

};

OMusicEditor.prototype.showKeyChooser = function (e) {
    var bam = this;

    if (this.keyChooser) {
        this.keyChooser.parentElement.removeChild(this.keyChooser);
        this.keyChooser = undefined;
        return;
    }

    var thing = bam.zones[bam.zones.length - 1] == bam.song.div ? bam.song :
            (bam.section && bam.zones[bam.zones.length - 1] == bam.section.div) ?
            bam.section : bam.part;

    var chooserDiv = document.createElement("div");
    chooserDiv.style.position = "absolute";
    chooserDiv.style.backgroundColor = "white";
    chooserDiv.style.top = e.target.offsetTop + e.target.clientHeight +
            e.target.parentElement.offsetTop + "px";
    chooserDiv.style.left = e.target.offsetLeft + "px";
    var div = document.createElement("div");
    div.style.display = "inline-block";
    div.style.verticalAlign = "top";
    div.style.borderWidth = "1px";
    div.style.borderStyle = "solid";
    var keyDiv;
    var selectedKeyDiv;
    for (var i = 0; i < this.keys.length; i++) {
        keyDiv = document.createElement("div");
        keyDiv.innerHTML = this.keys[i];
        keyDiv.style.padding = "5px";
        keyDiv.style.paddingLeft = "10px";
        keyDiv.style.paddingRight = "10px";
        keyDiv.style.borderBottomStyle = "solid";
        keyDiv.style.borderBottomWidth = "1px";

        if ((bam.song.data.rootNote || 0) == i) {
            selectedKeyDiv = keyDiv;
            keyDiv.style.backgroundColor = "lightgreen";
        }

        keyDiv.onclick = (function (keyDiv, i) {
            return function () {
                if (selectedKeyDiv) {
                    selectedKeyDiv.style.backgroundColor = "white";
                }
                selectedKeyDiv = keyDiv;
                bam.song.data.rootNote = i;
                bam.player.rescaleSong(i)
                keyDiv.style.backgroundColor = "lightgreen";
                e.target.innerHTML = bam.getKeyCaption();
            };
        }(keyDiv, i));
        keyDiv.onmousemove = function (e) {
            e.target.style.backgroundColor = "orange";
        };
        keyDiv.onmouseout = function (e) {
            e.target.style.backgroundColor =
                    e.target == selectedKeyDiv ? "lightgreen" : "white";
        };
        div.appendChild(keyDiv);
    }
    chooserDiv.appendChild(div);

    div = document.createElement("div");
    div.style.display = "inline-block";
    div.style.verticalAlign = "top";
    div.style.borderWidth = "1px";
    div.style.borderStyle = "solid";
    var selectedScaleDiv;
    this.scales.forEach(function (scale) {
        var scaleDiv = document.createElement("div");
        scaleDiv.innerHTML = scale.name;
        scaleDiv.onclick = function () {
            if (selectedScaleDiv) {
                selectedScaleDiv.style.backgroundColor = "white";
            }
            selectedScaleDiv = scaleDiv;
            bam.song.data.ascale = scale.value;
            bam.player.rescaleSong(undefined, scale.value)
            scaleDiv.style.backgroundColor = "lightgreen";
            e.target.innerHTML = bam.getKeyCaption();
        };
        scaleDiv.style.padding = "35px";
        scaleDiv.style.borderBottomStyle = "solid";
        scaleDiv.style.borderBottomWidth = "1px";
        div.appendChild(scaleDiv);

        scaleDiv.onmousemove = function () {
            scaleDiv.style.backgroundColor = "orange";
        };
        scaleDiv.onmouseout = function () {
            scaleDiv.style.backgroundColor = "white";
        };
    });
    chooserDiv.appendChild(div);
    this.showPopUpWindow(chooserDiv);
    e.target.parentElement.parentElement.appendChild(chooserDiv);
};

OMusicEditor.prototype.showPopUpWindow = function (popup) {
    var backgroundDiv = document.createElement("div");
    backgroundDiv.style.position = "absolute";
    backgroundDiv.style.top = "0px";
    backgroundDiv.style.width = "100%";
    backgroundDiv.style.height = "100%";
    backgroundDiv.style.backgroundColor = "#777777";
    backgroundDiv.style.opacity = "0.5";
    document.body.appendChild(backgroundDiv);
    backgroundDiv.onclick = function () {
        document.body.removeChild(backgroundDiv);
        popup.parentElement.removeChild(popup);
    }
}

OMusicEditor.prototype.getKeyCaption = function () {
    var bam = this;
    var scaleName = "Major";
    if (bam.song.data.ascale) {
        this.scales.forEach(function (scale) {
            if (scale.value.join() == bam.song.data.ascale.join())
                scaleName = scale.name;
        });
    }
    return this.keys[(this.song.data.rootNote || 0)] + " " + scaleName;
};

OMusicEditor.prototype.refreshKeyTempoChordsButtons = function () {
    if (this.keyButton)
        this.keyButton.innerHTML = this.getKeyCaption();

    if (this.tempoButton)
        this.tempoButton.innerHTML = this.getBPM() + "bpm";

    if (this.chordsButton)
        this.chordsButton.innerHTML = this.getChordsCaption();


};


OMusicEditor.prototype.showTempoChooser = function (e) {
    var bam = this;

    var thing = bam.zones[bam.zones.length - 1] == bam.song.div ? bam.song :
            (bam.section && bam.zones[bam.zones.length - 1] == bam.section.div) ?
            bam.section : bam.part;

    var chooserDiv = document.createElement("div");
    chooserDiv.style.position = "absolute";
    chooserDiv.style.backgroundColor = "white";
    chooserDiv.style.top = e.target.offsetTop + e.target.clientHeight +
            e.target.parentElement.offsetTop + "px";
    chooserDiv.style.left = e.target.offsetLeft + "px";
    chooserDiv.style.borderWidth = "1px";
    chooserDiv.style.borderStyle = "solid";

    var div;
    for (var i = 20; i <= 220; i += 20) {
        div = document.createElement("button");
        div.style.display = "inline-block";
        div.style.verticalAlign = "top";
        div.innerHTML = i;

        div.onclick = (function (div, i) {
            return function () {
                e.target.innerHTML = i + "bpm";
                bam.song.data.subbeatMillis =
                        Math.round(1000 / (i / 60 * (bam.song.data.subbeats || 4)));
                if (bam.player.playing) {
                    bam.player.setSubbeatMillis(bam.song.data.subbeatMillis);
                }
                if (thing.data) {
                    thing.data.subbeatMillis = bam.song.data.subbeatMillis;
                    if (thing == bam.part)
                        bam.section.data.subbeatMillis = thing.data.subbeatMillis;
                }
            };
        }(div, i));

        div.onmousemove = function (e) {
        };
        div.onmouseout = function (e) {
        };
        chooserDiv.appendChild(div);
    }


    chooserDiv.appendChild(div);
    this.showPopUpWindow(chooserDiv);
    e.target.parentElement.parentElement.appendChild(chooserDiv);
};

OMusicEditor.prototype.getBPM = function () {
    return Math.round(60000 / ((this.song.data.subbeatMillis || 125) *
            (this.song.data.subbeats || 4)));
};

OMusicEditor.prototype.getSoundSets = function (type, callback) {
    // we want to get the productions servers soundsets
    var bam = this;
    var dev = this.omgservice.dev;
    var url = dev ? "soundsets.json" : "data/?type=SOUNDSET";

    this.omgservice.getHTTP(url, function (soundsets) {
        bam.soundsets = soundsets;
        var url;
        soundsets.forEach(function (soundset) {
            //url = (bam.omgservice.dev ? "http://openmusic.gallery/" : "") +
            url = "http://openmusic.gallery/" +
                    "data/" + soundset.id;
            bam.soundsetsURLMap[url] = soundset;
            soundset.url = url;
        });
        if (typeof callback === "function") {
            callback();
        }
    });
};

OMusicEditor.prototype.setupSelectInstrument = function (part) {
    var bam = this;
    part.controls.selectInstrument.innerHTML = bam.getSelectInstrumentOptions(part.data.partType);
    part.controls.selectInstrument.onchange = function () {
        var soundsetURL = part.controls.selectInstrument.value;

        if (soundsetURL == "DEFAULT") {
            for (var ii = 0; ii < part.data.notes.length; ii++) {
                if (part.data.notes[ii].hasOwnProperty("sound")) {
                    delete part.data.notes[ii].sound;
                }
            }
            delete part.sound;
            return;
        }

        var soundset = bam.soundsetsURLMap[soundsetURL];
        if (!soundset) {
            //todo get the soundset if we can't find it
        }
        
        part.data.soundsetURL = soundsetURL;
        part.data.soundsetName = part.controls.selectInstrument.options
                    [part.controls.selectInstrument.selectedIndex].text;
        
        if (part.data.partType === "DRUMBEAT") {
            bam.player.setupDrumPartWithSoundSet(soundset, part, true);
            part.canvas.omusic_refresh();
        } else {
            bam.player.setupPartWithSoundSet(soundset, part, true);
        }
    };
  
};

function testData() {
    return {"tags":"jam power","type":"SECTION","beats":4,"parts":[{"type":"PART","notes":[{"note":0,"rest":false,"beats":0.5},{"note":0,"rest":false,"beats":0.5},{"note":0,"rest":false,"beats":0.5},{"note":0,"rest":false,"beats":0.5},{"note":0,"rest":false,"beats":0.5},{"note":0,"rest":false,"beats":0.5},{"note":0,"rest":false,"beats":0.5},{"note":0,"rest":false,"beats":0.5},{"note":0,"rest":false,"beats":0.5},{"note":0,"rest":false,"beats":0.5},{"note":0,"rest":false,"beats":0.5},{"note":0,"rest":false,"beats":0.5},{"note":0,"rest":false,"beats":0.5},{"note":0,"rest":false,"beats":0.5},{"note":0,"rest":false,"beats":0.5},{"note":0,"rest":false,"beats":0.5}],"scale":"0,3,5,6,7,10","ascale":[0,3,5,6,7,10],"octave":3,"volume":0.97115535,"rootNote":0,"surfaceURL":"PRESET_VERTICAL","soundsetURL":"PRESET_BASS","soundsetName":"Electric Bass"},{"type":"PART","notes":[],"scale":"0,3,5,6,7,10","ascale":[0,3,5,6,7,10],"octave":3,"tracks":[{"data":[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],"name":"kick","sound":"PRESET_ROCK_KICK"},{"data":[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],"name":"snare","sound":"PRESET_ROCK_SNARE"},{"data":[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],"name":"hi-hat","sound":"PRESET_ROCK_HIHAT_MED"},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],"name":"open hi-hat","sound":"PRESET_ROCK_HIHAT_OPEN"},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"crash","sound":"PRESET_ROCK_CRASH"},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"h tom","sound":"PRESET_ROCK_TOM_MH"},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"m tom","sound":"PRESET_ROCK_TOM_ML"},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"l tom","sound":"PRESET_ROCK_TOM_L"}],"volume":0.75,"rootNote":0,"surfaceURL":"PRESET_SEQUENCER","soundsetURL":"PRESET_ROCKKIT","soundsetName":"Rock Drum Kit"},{"type":"PART","notes":[],"scale":"0,3,5,6,7,10","ascale":[0,3,5,6,7,10],"octave":3,"tracks":[{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"bongo l","sound":"PRESET_bongol"},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"bongo l","sound":"PRESET_bongoh"},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"click l","sound":"PRESET_clickl"},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"click h","sound":"PRESET_clickh"},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"shhk","sound":"PRESET_shhk"},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"scrape","sound":"PRESET_scrape"},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"whoop","sound":"PRESET_whoop"},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"chimes","sound":"PRESET_chimes"}],"volume":0.75,"rootNote":0,"surfaceURL":"PRESET_SEQUENCER","soundsetURL":"PRESET_PERCUSSION_SAMPLER","soundsetName":"Percussion Sampler"},{"type":"PART","notes":[{"note":0,"rest":false,"beats":1},{"note":0,"rest":false,"beats":1},{"note":0,"rest":false,"beats":1},{"note":0,"rest":false,"beats":1},{"note":0,"rest":false,"beats":1},{"note":0,"rest":false,"beats":1},{"note":1,"rest":false,"beats":0.5},{"note":1,"rest":false,"beats":0.5},{"note":1,"rest":false,"beats":0.5},{"note":1,"rest":false,"beats":0.25},{"note":1,"rest":false,"beats":0.25}],"scale":"0,3,5,6,7,10","ascale":[0,3,5,6,7,10],"octave":3,"volume":0.5045179,"rootNote":0,"surfaceURL":"PRESET_VERTICAL","soundsetURL":"http://openmusic.gallery/data/401","soundsetName":"Guitar Power Chords"},{"type":"PART","notes":[{"note":2,"rest":false,"beats":0.5},{"note":2,"rest":false,"beats":0.5},{"note":2,"rest":false,"beats":0.5},{"note":2,"rest":false,"beats":0.5},{"note":2,"rest":false,"beats":0.5},{"note":2,"rest":false,"beats":0.5},{"note":2,"rest":false,"beats":0.5},{"note":2,"rest":false,"beats":0.5},{"note":2,"rest":false,"beats":0.5},{"note":2,"rest":false,"beats":0.25},{"note":2,"rest":false,"beats":0.25},{"note":2,"rest":false,"beats":0.25},{"note":2,"rest":false,"beats":0.25},{"note":2,"rest":false,"beats":0.25},{"note":2,"rest":false,"beats":0.25},{"note":2,"rest":false,"beats":0.25},{"note":2,"rest":false,"beats":0.25},{"note":2,"rest":false,"beats":0.25},{"note":2,"rest":false,"beats":0.25},{"note":2,"rest":false,"beats":0.25},{"note":2,"rest":false,"beats":0.25},{"note":2,"rest":false,"beats":0.25}],"scale":"0,3,5,6,7,10","ascale":[0,3,5,6,7,10],"octave":3,"tracks":[{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"A","sound":"http://mikehelland.com/omg/joe/THICKAS/A.mp3"},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"B","sound":"http://mikehelland.com/omg/joe/THICKAS/B.mp3"},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"C","sound":"http://mikehelland.com/omg/joe/THICKAS/C.mp3"},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"D","sound":"http://mikehelland.com/omg/joe/THICKAS/D.mp3"},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"E","sound":"http://mikehelland.com/omg/joe/THICKAS/E.mp3"},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"F","sound":"http://mikehelland.com/omg/joe/THICKAS/F.mp3"},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"G","sound":"http://mikehelland.com/omg/joe/THICKAS/G.mp3"},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"RIBBIT","sound":"http://mikehelland.com/omg/joe/THICKAS/RIBBIT.mp3"}],"volume":0.91942555,"rootNote":0,"surfaceURL":"PRESET_VERTICAL","soundsetURL":"http://openmusic.gallery/data/62","soundsetName":"THICK"}],"scale":"0,3,5,6,7,10","ascale":[0,3,5,6,7,10],"shuffle":0,"measures":2,"rootNote":0,"subbeats":4,"created_at":1513287123361,"last_modified":1513287123361,"subbeatMillis":125,"chordProgression":[0,1],"id":405};
}