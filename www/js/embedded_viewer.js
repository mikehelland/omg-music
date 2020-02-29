"use strict";

if (typeof omg === "undefined") {
    omg = {};
    console.log("No OMG Obejcts for embedded_viewer.js, not good!");
}

function OMGEmbeddedViewer(params) {
    this.playChar = "&nbsp;&#9654;"
    this.stopChar = "&#9724;"

    if (params.result) {
        params.data = params.result.body
        params.data.id = params.result.id
    }

    if (!params.useExternalPlayer) {
        this.player = new OMusicPlayer();
    }

    this.song = OMGSong.prototype.make(params.data);
    this.predraw = params.predraw;
    
    if (!params.canvas && params.div) {
        this.setupControls(params);
    }
    else {
        this.canvas = params.canvas;
    }
    
    this.drawCanvas(params.data);
};

OMGEmbeddedViewer.prototype.setupControls = function (params) {
    
    var div = params.div;
    var data = params.data;
    
    if (!data.type) {
        //don't know what to do with this data
        return;
    }
    
    var viewer = this;
    viewer.div = div;
    div.style.position = "relative";
    //div.style.overflowX = "scroll";

    viewer.padding = 0;

    viewer.playButton = document.createElement("div");
    viewer.editButton = document.createElement("a");
    viewer.shareButton = document.createElement("a");
    viewer.tipButton = document.createElement("div");
    viewer.voteButton = document.createElement("div");
    viewer.titleDiv = document.createElement("div");
    viewer.userDiv = document.createElement("div");
    viewer.datetimeDiv = document.createElement("div");

    viewer.playButton.innerHTML = "&nbsp;&#9654";
    viewer.editButton.innerHTML = "Remix";
    viewer.shareButton.innerHTML = "Link";
    viewer.tipButton.innerHTML = "Tip";
    viewer.voteButton.innerHTML = "&#x2B06";
    viewer.voteButton.title = "Upvote";

    viewer.playButton.className = "omg-music-controls-play-button";
    viewer.editButton.className = "omg-music-controls-button";
    viewer.shareButton.className = "omg-music-controls-button";
    viewer.tipButton.className = "omg-music-controls-button";
    viewer.voteButton.className = "omg-music-controls-button";

    viewer.div.appendChild(viewer.playButton);

    var result = data;
    var resultDiv = viewer.div;
    var resultCaption = result.tags || result.name || "";
    var type = result.partType || result.type || "";
    if (resultCaption.length === 0) {
        resultCaption = "(" + type.substring(0, 1).toUpperCase() +
                type.substring(1).toLowerCase() + ")";
    }
    viewer.caption = resultCaption;

    var resultData = document.createElement("div");
    resultData.className = "omg-thing-title";
    resultData.innerHTML = resultCaption;
    resultDiv.appendChild(resultData);

    resultData = document.createElement("div");
    resultData.className = "omg-thing-user";
    resultData.innerHTML = result.username ? "by " + result.username : "";
    viewer.caption += " " + resultData.innerHTML

    resultDiv.appendChild(resultData);

    var rightData = document.createElement("div");
    rightData.className = "omg-thing-right-data";
    resultDiv.appendChild(rightData);

    //rightData.appendChild(viewer.voteButton);

    resultData = document.createElement("span");
    resultData.className = "omg-thing-votes";
    resultData.innerHTML = (result.votes || "0") + " votes";
    //rightData.appendChild(resultData);
    
    resultData = document.createElement("span");
    resultData.className = "omg-thing-created-at";
    //resultData.innerHTML = getTimeCaption(parseInt(result.created_at));
    resultData.innerHTML = omg.util.getTimeCaption(parseInt(result.last_modified));
    rightData.appendChild(resultData);    

    viewer.partMargin = 20;
    viewer.sectionMargin = 0;
    viewer.sectionWidth = 200;
    viewer.leftOffset = viewer.sectionMargin;

    viewer.beatMarker = document.createElement("div");
    viewer.beatMarker.className = "beat-marker";
    viewer.beatMarker.style.display = "none";
    viewer.beatMarker.style.marginLeft = viewer.padding / 2 + "px";
    viewer.div.appendChild(viewer.beatMarker);
        
    viewer.playButton.onclick = function () {
        viewer.playButtonClass = viewer.playButton.className;
        
        if (type === "SOUNDSET") {
            viewer.playSoundSet()
            return
        }

        if (typeof params.onplaybuttonclick === "function") {
            params.onplaybuttonclick(viewer);
            if (!viewer.playButton.hasBeenClicked) {
                viewer.playButton.hasBeenClicked = true;                
                omg.server.postHTTP("/playcount", {id: data.id});
            }
            return
        }

        var pbClass = viewer.playButton.className;
        viewer.player.onStop = function () {
            viewer.playButton.className = pbClass;
            viewer.playButton.innerHTML = "&nbsp;&#9654;";
            viewer.beatMarker.style.display = "none";
            if (typeof params.onStop === "function") {
                params.onStop();
            }
        };
        viewer.player.onPlay = function (info) {
            viewer.playButton.className = pbClass;
            viewer.playButton.innerHTML = "&#9724;";
            if (typeof params.onPlay === "function") {
                params.onPlay(viewer.player, info);
            }
        };

        if (viewer.player.playing) {
            viewer.player.stop();
        } else {
            viewer.beatMarker.style.display = "block";
            viewer.subbeatsPlayed = 0;
            viewer.playButton.className = pbClass + " loader";
            viewer.player.onloop = () => viewer.onloop();

            if (viewer.prepared) {
                viewer.player.play();
            }
            else {                
                viewer.player.prepareSong(viewer.song, function () {
                    viewer.prepared = true;
                    viewer.player.play();
                });
            }
            
            if (!viewer.playButton.hasBeenClicked) {
                viewer.playButton.hasBeenClicked = true;                
                omg.server.postHTTP("/playcount", {id: data.id}, result=>console.log(result));
            }
        }
    };
    
    viewer.titleDiv.innerHTML = data.title || "(untitled)";
    viewer.userDiv.innerHTML = data.username || "(unknown)";
    viewer.datetimeDiv.innerHTML = omg.util.getTimeCaption(data.created_at);

    var url = 'bitcoin:' + (data.btc_address || '37WEyjvqgY6mEZDMiSTN11YWy5BYP8rP6e') + '?amount=0.00100000&label=OMG%20Tip%20Jar';
    var makeTipJar = function () {
        viewer.tipJar = document.createElement("div");
        viewer.tipJar.className = "tip-jar";

        viewer.qrCanvas = document.createElement("canvas");
        var canvasDiv = document.createElement("div");
        canvasDiv.className = "tip-jar-canvas";

        viewer.tipJarLink = document.createElement("div");
        viewer.tipJarLink.innerHTML = "<a href='" + url + "'>" + url + "</a>";

        viewer.qr = new QRious({
            element: viewer.qrCanvas,
            value: url
        });
        
        canvasDiv.appendChild(viewer.qrCanvas);
        viewer.tipJar.appendChild(canvasDiv)
        viewer.tipJar.appendChild(viewer.tipJarLink)

        viewer.qr.element.onclick = function () {
            window.location = url;
        };
        omg.ui.showDialog(viewer.tipJar)
    };

    viewer.tipButton.onclick = function () {
        
        if (viewer.tipJar) {
            omg.ui.showDialog(viewer.tipJar)
            return;
        }
        
        if (typeof QRious === "undefined") {
            var scriptTag = document.createElement("script");
            scriptTag.onload = makeTipJar;
            scriptTag.src = "https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js";
            scriptTag.async = true;
            document.body.appendChild(scriptTag);
        }
        else {
            makeTipJar();
        }
        
    };

    //todo edit the soundset if its the current users
    //if (data.type === "SOUNDSET") {
    //    viewer.editButton.href = "/soundset-editor.htm?id=" + data.id;
    //    viewer.shareButton.href = "/soundset.htm?id=" + data.id;    
    //}
    if (data.type === "PLAYLIST") {
        viewer.editButton.href = "/playlist.htm?id=" + data.id;
        viewer.shareButton.href = "/play/" + data.id;
    }
    else {
        viewer.editButton.href = "/gauntlet/?id=" + data.id;
        viewer.shareButton.href = "/play/" + data.id;    
    }

    var br = document.createElement("br");
    viewer.div.appendChild(br);
    
    var height = params.height || 150;

    if (data.type === "SOUNDSET" || data.type === "PLAYLIST") {
        viewer.flexBox = document.createElement("div")
        viewer.flexBox.className = "omg-viewer-" + data.type.toLowerCase() + "-data"
        viewer.div.appendChild(viewer.flexBox)

    }
    else {
        viewer.canvas = document.createElement("canvas");
        viewer.canvas.className = "omg-viewer-canvas";
        viewer.div.appendChild(viewer.canvas);
        viewer.canvas.width = viewer.canvas.clientWidth;
        viewer.canvas.height = height; //viewer.canvas.clientHeight;    
        viewer.beatMarker.style.height = height + "px";
        viewer.beatMarker.style.marginTop = viewer.canvas.offsetTop + "px";
    }

    var className = "omg-viewer-" + data.type.toLowerCase();
    this.div.classList.add("omg-viewer");
    this.div.classList.add(className);
    
    if (this.song) {
        this.song.loop = this.song.arrangement.length === 0;
    }

    var bottomRow = document.createElement("div")
    if (data.id) {
        bottomRow.appendChild(viewer.editButton);
    }
    bottomRow.appendChild(viewer.tipButton);
    bottomRow.appendChild(viewer.shareButton);

    if (data.type === "SONG" || data.type === "PART" || data.type === "SECTION") {
        resultData = document.createElement("span");
        resultData.className = "omg-music-controls-button";
        resultData.innerHTML = "Add To Playlist";
        resultData.onclick = function () {
            omg.util.addToPlaylist(result)
        }    
        bottomRow.appendChild(resultData);    
    }

    if (params.deleteButton) {
        resultData = document.createElement("span");
        resultData.className = "omg-music-controls-button";
        resultData.innerHTML = "Delete &times;";
        resultData.onclick = () => {
            omg.server.deleteId(result.id, function () {
                viewer.div.parentElement.removeChild(viewer.div)
            });
        }
        resultData.style.float = "right"
        bottomRow.appendChild(resultData);
    }

    if (params.result && params.result.playcount) {
        resultData = document.createElement("span");
        resultData.className = "omg-thing-playcount";
        resultData.innerHTML = params.result.playcount + " &#9658;";
        bottomRow.appendChild(resultData);        
    }

    viewer.div.appendChild(bottomRow)
};

OMGEmbeddedViewer.prototype.drawCanvas = function (data) {
    
    if (data.type === "SOUNDSET") {
        this.loadSoundSet(data);
        return;
    }
    if (data.type === "PLAYLIST") {
        this.loadPlayList(data);
        return;
    }

    this.context = this.canvas.getContext("2d");

    this.getDrawingData();
    this.draw();
    
    //var pxPerBeat = (this.div.clientWidth - padding) / this.totalBeatsInSong;
    if (this.div) {
        var pxPerBeat = (this.div.clientWidth - this.padding) / (this.totalSubbeats * this.drawingData.sections.length);
        var viewer = this;
        var beatsInSection = this.song.data.beatParams.measures * this.song.data.beatParams.beats * this.song.data.beatParams.subbeats;
        viewer.subbeatsPlayed = 0;
        viewer.beatMarker.style.width = pxPerBeat + "px";
        viewer.onBeatPlayedListener = function (isubbeat, isection) {
             viewer.beatMarker.style.left = pxPerBeat * viewer.subbeatsPlayed++ + "px";
        };
        if (this.player) {
            this.player.onBeatPlayedListeners.push(viewer.onBeatPlayedListener)
        }
    }

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
            if (viewer.player) { //todo make this work without a player? maybe just move up and down
                viewer.player.rescaleSection(section, section.data.chordProgression[ic]);            
            }
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
    if (this.predraw) {
        this.predraw();
    }
    
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
        this.context.fillStyle = "black";
        this.context.font = "28pt serif";
        for (var inotes = 0; inotes < this.drawingData.sections[isection].notes.length; inotes++) {
            usedBeats = 0;
            for (var inote = 0; inote < this.drawingData.sections[isection].notes[inotes].length; inote++) {
                if (omg.ui.useUnicodeNotes) {
                    this.context.fillText(
                        omg.ui.getTextForNote(this.drawingData.sections[isection].notes[inotes][inote]),
                        isection * this.sectionLength + this.subbeatLength * usedBeats * this.beatParams.subbeats, 
                        30 + (88 - this.drawingData.sections[isection].notes[inotes][inote].scaledNote) / 88 * this.drawingData.sections[isection].notesHeight
                    );
                }
                else {
                    this.context.drawImage(
                        omg.ui.getImageForNote(this.drawingData.sections[isection].notes[inotes][inote]),
                        isection * this.sectionLength + this.subbeatLength * usedBeats * this.beatParams.subbeats, 
                        (88 - this.drawingData.sections[isection].notes[inotes][inote].scaledNote) / 88 * this.drawingData.sections[isection].notesHeight
                    );
                }
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

OMGEmbeddedViewer.prototype.loadPlayList = function (data) {
    data.data.forEach((item) => {
        var div = document.createElement("div")
        div.innerHTML = item.name
        this.flexBox.appendChild(div)
    })
}

OMGEmbeddedViewer.prototype.loadSoundSet = function (data) {
    this.audioSamples = []
    data.data.forEach((item) => {
        var div = document.createElement("div")
        var audio = document.createElement("audio")
        var link = document.createElement("a")
        var playButton = document.createElement("div")
        var duration = document.createElement("div")
        playButton.className = "omg-soundset-audio-play"
        duration.className = "omg-soundset-audio-duration"
        playButton.innerHTML = this.playChar
        div.appendChild(playButton)
        link.src = data.prefix + item.url + data.postfix
        link.innerHTML = item.name
        div.appendChild(link)
        div.appendChild(duration)
        div.className = "omg-soundset-audio-sample"
        this.flexBox.appendChild(div)

        var isPlaying = false
        audio.oncanplaythrough = () => {
            var min = Math.floor(audio.duration / 60)
            duration.innerHTML = min + ":" + Math.round(audio.duration - min * 60).toString().padStart(2, "0")
        }
        audio.src = data.prefix + item.url + data.postfix
        audio.onended = () => {
            playButton.innerHTML = this.playChar
            isPlaying = false
        }
        div.onclick = () => {
            if (isPlaying) {
                audio.pause()
                audio.currentTime = 0
                playButton.innerHTML = this.playChar
            }
            else{
                audio.play()
                playButton.innerHTML = this.stopChar
            }
            isPlaying = !isPlaying
        }
        console.log(this)
        this.audioSamples.push({div: div, audio: audio})
    })
}

OMGEmbeddedViewer.prototype.playSoundSet = function () {
    if (this.playingSample) {
        this.playingSample.audio.removeEventListener("ended", this.playingSoundSetListener)
        this.playingSample.div.onclick()
        this.showStopped()
        return
    }

    this.showPlaying()
    var i = 0
    var playNext = () => {
        this.playingSoundSetListener = () => {
            this.audioSamples[i].audio.removeEventListener("ended", this.playingSoundSetListener)
            i++
            if (i < this.audioSamples.length) {
                playNext()
            }
            else {
                this.showStopped()
            }
        }
        this.audioSamples[i].audio.addEventListener("ended", this.playingSoundSetListener)
        this.audioSamples[i].div.onclick()
        this.playingSample = this.audioSamples[i]
    }
    playNext()
}

OMGEmbeddedViewer.prototype.showLoading = function () {
    this.playButton.className = this.playButtonClass + " loader";
}
OMGEmbeddedViewer.prototype.showPlaying = function () {
    this.playButton.className = this.playButtonClass;
    this.isPlaying = true
    this.playButton.innerHTML = this.stopChar;
    this.beatMarker.style.display = "block"
    this.subbeatsPlayed = 0;
}
OMGEmbeddedViewer.prototype.showStopped = function () {
    this.playButton.className = this.playButtonClass;
    this.isPlaying = false
    this.playButton.innerHTML = this.playChar;
    this.beatMarker.style.display = "none"
    this.playingSample = undefined
}
OMGEmbeddedViewer.prototype.onloop = function () {
    this.subbeatsPlayed = 0
}