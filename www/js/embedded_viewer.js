"use strict";

if (typeof omg === "undefined") {
    omg = {};
    console.log("No OMG Obejcts for embedded_viewer.js, not good!");
}

function OMGEmbeddedViewer(params) {
    var div = params.div;
    var data = params.data;
    var viewer = this;
    viewer.div = div;
    div.style.position = "relative";
    //div.style.overflowX = "scroll";

    viewer.padding = 8;

    viewer.playButton = document.createElement("div");
    viewer.editButton = document.createElement("div");
    viewer.shareButton = document.createElement("div");
    viewer.tipButton = document.createElement("div");
    viewer.voteButton = document.createElement("div");
    viewer.titleDiv = document.createElement("div");
    viewer.userDiv = document.createElement("div");
    viewer.datetimeDiv = document.createElement("div");

    viewer.playButton.innerHTML = "&#9654";
    viewer.editButton.innerHTML = "Edit";
    viewer.shareButton.innerHTML = "Share";
    viewer.tipButton.innerHTML = "Tip";
    viewer.voteButton.innerHTML = "&#x2B06";
    viewer.voteButton.title = "Upvote";

    viewer.playButton.className = "omg-music-controls-play-button";
    viewer.editButton.className = "omg-music-controls-edit-button";
    viewer.shareButton.className = "omg-music-controls-button";
    viewer.tipButton.className = "omg-music-controls-button";
    viewer.voteButton.className = "omg-music-controls-button";

    viewer.div.appendChild(viewer.playButton);
    if (data.id)
        viewer.div.appendChild(viewer.editButton);
    //viewer.div.appendChild(viewer.shareButton);

    var result = data;
    var resultDiv = viewer.div;
    var resultCaption = result.tags || result.name || "";
    var type = result.partType || result.type || "";
    if (resultCaption.length === 0) {
        resultCaption = "(" + type.substring(0, 1).toUpperCase() +
                type.substring(1).toLowerCase() + ")";
    }

    var resultData = document.createElement("div");
    resultData.className = "omg-thing-title";
    resultData.innerHTML = resultCaption;
    resultDiv.appendChild(resultData);

    resultData = document.createElement("div");
    resultData.className = "omg-thing-user";
    resultData.innerHTML = result.username ? "by " + result.username : "";
    resultDiv.appendChild(resultData);

    var rightData = document.createElement("div");
    rightData.className = "omg-thing-right-data";
    resultDiv.appendChild(rightData);

    rightData.appendChild(viewer.tipButton);
    //rightData.appendChild(viewer.voteButton);

    resultData = document.createElement("span");
    resultData.className = "omg-thing-votes";
    resultData.innerHTML = (result.votes || "0") + " votes";
    //rightData.appendChild(resultData);

    resultData = document.createElement("span");
    resultData.className = "omg-thing-created-at";
    //resultData.innerHTML = getTimeCaption(parseInt(result.created_at));
    resultData.innerHTML = getTimeCaption(parseInt(result.last_modified));
    rightData.appendChild(resultData);

    var height = params.height || 150;

    viewer.shareButton.onclick = function () {
        omg.shareWindow.show();
    };

    viewer.partMargin = 20;
    viewer.sectionMargin = 0;
    viewer.sectionWidth = 200;
    viewer.leftOffset = viewer.sectionMargin;

    viewer.beatMarker = viewer.div.getElementsByClassName("beat-marker")[0];
    viewer.beatMarker.style.display = "none";
    viewer.beatMarker.style.marginTop = viewer.playButton.clientHeight + 8 + "px";
    //viewer.beatMarker.style.height = height + "px";
    viewer.beatMarker.style.marginLeft = viewer.padding / 2 + "px";


    omg.ui.omgUrl = "omg-music/";
    omg.ui.setupNoteImages();
        
    viewer.playButton.onclick = function () {
        
        var pbClass = viewer.playButton.className;
        viewer.player.onStop = function () {
            viewer.playButton.className = pbClass;
            viewer.playButton.innerHTML = "&#9654;";
            if (typeof params.onStop === "function") {
                params.onStop();
            }
        };
        viewer.player.onPlay = function (info) {
            viewer.playButton.className = pbClass;
            viewer.playButton.innerHTML = "&#9642;";        
            if (typeof params.onPlay === "function") {
                params.onPlay(viewer.player, info);
            }
        };

        if (viewer.player.playing) {
            viewer.player.stop();
            viewer.beatMarker.style.display = "none";

        } else {
            viewer.beatMarker.style.display = "block";
            viewer.subbeatsPlayed = 0;
            viewer.playButton.className = pbClass + " loader";
            viewer.player.onloop = function () {
                viewer.subbeatsPlayed = 0;
            };

            if (viewer.prepared) {
                viewer.player.play();
            }
            else {                
                viewer.player.prepareSong(viewer.song, function () {
                    viewer.prepared = true;
                    viewer.player.play();
                });
            }
            
            //viewer.player.load(viewer.info, function (info) {
            //    viewer.player.play(info);
            //});
        }
    };
    
    viewer.titleDiv.innerHTML = data.title || "(untitled)";
    viewer.userDiv.innerHTML = data.username || "(unknown)";
    viewer.datetimeDiv.innerHTML = getTimeCaption(data.created_at);

    viewer.tipButton.onclick = function () {
        window.location = "bitcoin:1Jdam2fBZxfhWLB8yP69Zbw6fLzRpweRjc?amount=0.004";
    };
    viewer.editButton.onclick = function () {
        window.location = "/gauntlet/?id=" + data.id;
    };

    var br = document.createElement("br");
    viewer.div.appendChild(br);
    
    viewer.canvas = document.createElement("canvas");
    viewer.canvas.className = "omg-viewer-canvas";
    viewer.div.appendChild(viewer.canvas);
    viewer.canvas.width = viewer.canvas.clientWidth;
    viewer.canvas.height = viewer.canvas.clientHeight;
    viewer.context = viewer.canvas.getContext("2d");

    viewer.load(data);
}

OMGEmbeddedViewer.prototype.load = function (data) {
    var className = "omg-viewer-" + data.type.toLowerCase();
    this.div.classList.add(className);

    if (data.type === "SOUNDSET") {
        //todo this.loadSoundSet(data);
        return;
    }

    this.player = new OMusicPlayer();
    this.song = this.player.makeOMGSong(data);
    this.song.loop = this.song.arrangement.length === 0;

    this.getDrawingData();
    this.draw();
    
    //var pxPerBeat = (this.div.clientWidth - padding) / this.totalBeatsInSong;
    var pxPerBeat = (this.div.clientWidth - this.padding) / (this.totalSubbeats * this.drawingData.sections.length);
    var viewer = this;
    var beatsInSection = this.song.data.beatParams.measures * this.song.data.beatParams.beats * this.song.data.beatParams.subbeats;
    viewer.subbeatsPlayed = 0;
    viewer.beatMarker.style.width = pxPerBeat + "px";
    viewer.player.onBeatPlayedListeners.push(function (isubbeat, isection) {
         viewer.beatMarker.style.left = pxPerBeat * viewer.subbeatsPlayed++ + "px";
    });

};

OMGEmbeddedViewer.prototype.getDrawingData = function () {
    var viewer = this;
    var beatParams = this.song.data.beatParams;
    this.beatParams = beatParams;
    this.totalSubbeats = beatParams.subbeats * beatParams.beats * beatParams.measures;
    
    this.drawingData = {sections: []};
    this.song.sections.forEach(function (section, isection) {
        var chordedData = [];
        chordedData.sectionName = section.data.name;
        for (var ic = 0; ic < section.data.chordProgression.length; ic++) {
            viewer.player.rescaleSection(section, section.data.chordProgression[ic]);            
            var sectionData = viewer.getSectionDrawingData(section);
            chordedData.push(sectionData);
        }        
        viewer.drawingData.sections.push(chordedData);
    });
    
    var arrangement = [];
    if (this.song.arrangement && this.song.arrangement.length > 0) {
        for (var ia = 0; ia < this.song.arrangement.length; ia++) {
            for (var isection = 0; isection < this.drawingData.sections.length; isection++) {
                if (this.drawingData.sections[isection].sectionName === this.song.arrangement[ia].data.name) {
                    for (var ir = -1; ir < (this.song.arrangement[ia].data.repeat || 0); ir++) {
                        for (var ic = 0; ic < this.drawingData.sections[isection].length; ic++) {
                            arrangement.push(this.drawingData.sections[isection][ic]);
                        }
                    }
                }
            }
        }
    }
    else {
        for (var isection = 0; isection < this.drawingData.sections.length; isection++) {
            for (var ic = 0; ic < this.drawingData.sections[isection].length; ic++) {
                arrangement.push(this.drawingData.sections[isection][ic]);
            }
        }
    }
    this.drawingData.sections = arrangement;
    
    if (this.drawingData.sections.length > 0) {
        this.sectionLength = Math.max(40, this.canvas.width / this.drawingData.sections.length);
        this.measureLength = this.sectionLength / this.beatParams.measures;
        this.subbeatLength = this.sectionLength / this.totalSubbeats;
    }

};

OMGEmbeddedViewer.prototype.getSectionDrawingData = function (section) {
    var viewer = this;
    var sectionData = {tracks: [], notes: [], section: section};
    section.parts.forEach(function (part) {
        if (part.data.audioParams.mute) {
            return;
        }

        if (part.data.surface.url === "PRESET_SEQUENCER") {
            for (var i = 0; i < part.data.tracks.length; i++) {
                if (part.data.tracks[i].audioParams.mute) {
                    continue;
                }
                for (var j = 0; j < viewer.totalSubbeats; j++) {
                    if (part.data.tracks[i].data[j]) {
                        sectionData.tracks.push(part.data.tracks[i]);
                        break;
                    }
                }
            }
        }
        else {
            if (part.data.notes && part.data.notes.length > 0) {
                sectionData.notes.push(JSON.parse(JSON.stringify(part.data.notes)));
            }
        }
    });
    
    if (sectionData.tracks.length > 0) {
        if (sectionData.notes.length === 0) {
            sectionData.trackHeight = viewer.canvas.height / sectionData.tracks.length;
        }
        else {
            sectionData.trackHeight = viewer.canvas.height / 2 / sectionData.tracks.length;
            sectionData.notesHeight = viewer.canvas.height / 2;
        }
    }
    else {
        sectionData.notesHeight = viewer.canvas.height;
    }
    return sectionData;
}

OMGEmbeddedViewer.prototype.draw = function () {
    var usedBeats;
    var marginX, marginY;
    var value;
    for (var isection = 0; isection < this.drawingData.sections.length; isection++) {
        
        for (var itrack = this.drawingData.sections[isection].tracks.length - 1; itrack >= 0 ; itrack--) {
            for (var i = 0; i < this.totalSubbeats; i++) {
                value = this.drawingData.sections[isection].tracks[itrack].data[i];
                marginX = 1;
                marginY = this.trackHeight > 5 ? 1 : 0;
                if (typeof value === "number" && value > 0 && value < 1) {
                    this.context.fillStyle =  i % this.beatParams.beats == 0 ? "#DDDDDD" : "white";
                    this.context.fillRect(isection * this.sectionLength + i * this.subbeatLength + marginX, 
                                        this.canvas.height - itrack * this.drawingData.sections[isection].trackHeight - marginY, 
                                        this.subbeatLength - marginX * 2, -1 * this.drawingData.sections[isection].trackHeight + marginY * 2);
                    marginY = (this.drawingData.sections[isection].trackHeight - this.drawingData.sections[isection].trackHeight * value) / 3;
                    marginX = (this.subbeatLength - this.subbeatLength * value) / 3;
                }
                this.context.fillStyle =  value ? "black" : 
                                            (i % this.beatParams.beats == 0 ? "#DDDDDD" : "white");
                this.context.fillRect(isection * this.sectionLength + i * this.subbeatLength + marginX, 
                                    this.canvas.height - itrack * this.drawingData.sections[isection].trackHeight - marginY, 
                                    this.subbeatLength - marginX * 2, -1 * this.drawingData.sections[isection].trackHeight + marginY * 2);
            }
        }
        for (var inotes = 0; inotes < this.drawingData.sections[isection].notes.length; inotes++) {
            usedBeats = 0;
            for (var inote = 0; inote < this.drawingData.sections[isection].notes[inotes].length; inote++) {
                
                this.context.drawImage(
                    omg.ui.getImageForNote(this.drawingData.sections[isection].notes[inotes][inote]),
                    isection * this.sectionLength + this.subbeatLength * usedBeats * this.beatParams.subbeats, 
                    (88 - this.drawingData.sections[isection].notes[inotes][inote].scaledNote) / 88 * this.drawingData.sections[isection].notesHeight
                );
                usedBeats += this.drawingData.sections[isection].notes[inotes][inote].beats;
                if (usedBeats * this.beatParams.subbeats >= this.totalSubbeats) {
                    break;
                }
            }
        }
        
        if (isection > 0) {
            this.context.beginPath();
            this.context.lineWidth = 1;
            this.context.strokeStyle = "black";
            this.context.moveTo(isection * this.sectionLength, 0);
            this.context.lineTo(isection * this.sectionLength, this.canvas.height);
            this.context.stroke();
        }

        this.context.beginPath();
        this.context.lineWidth = 1;
        this.context.strokeStyle = "#AAAAAA";
        for (var imeasure = 1; imeasure < this.beatParams.measures; imeasure++) {
            this.context.moveTo(isection * this.sectionLength + imeasure * this.measureLength, 0);
            this.context.lineTo(isection * this.sectionLength + imeasure * this.measureLength, this.canvas.height);
        }
        this.context.stroke();

    }
};




function getTimeCaption(timeMS) {

    if (!timeMS) {
        return "";
    }

    var seconds = Math.round((Date.now() - timeMS) / 1000);
    if (seconds < 60)
        return seconds + " sec ago";

    var minutes = Math.floor(seconds / 60);
    if (minutes < 60)
        return minutes + " min ago";

    var hours = Math.floor(minutes / 60);
    if (hours < 24)
        return hours + " hr ago";

    var days = Math.floor(hours / 24);
    if (days < 7)
        return days + " days ago";

    var date = new Date(timeMS);
    var months = ["Jan", "Feb", "Mar", "Apr", "May",
        "Jun", "Jul", "Aug", "Sep", "Oct",
        "Nov", "Dec"];
    var monthday = months[date.getMonth()] + " " + date.getDate();
    if (days < 365) {
        return monthday;
    }
    return monthday + " " + date.getYear();
};
