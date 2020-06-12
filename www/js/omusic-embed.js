function OMGEmbeddedViewerMusic(viewer) {
    this.canvas = document.createElement("canvas")
    this.canvas.className = "omg-viewer-canvas"
    viewer.embedDiv.appendChild(this.canvas)

    this.data = viewer.data

    viewer.loadScriptsForType(
        ["/apps/music/js/omgclasses.js",
        "/apps/music/js/omgservice_music.js"],
        this.data.type,
        () => {
            this.song = OMGSong.prototype.make(this.data);
            console.log(this.song)
            this.drawCanvas(this.data)
        }
    )
}
if (typeof omg === "object" && omg.types && omg.types["SONG"])
    omg.types["SONG"].embedClass = OMGEmbeddedViewerMusic

OMGEmbeddedViewerMusic.prototype.drawCanvas = function (data) {

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
            viewer.beatMarker.style.left = pxPerBeat * viewer.subbeatsPlayed + "px";
            if (isubbeat > -1) {
                viewer.subbeatsPlayed++
            }
        };
        if (this.player) {
            this.player.onBeatPlayedListeners.push(viewer.onBeatPlayedListener)
        }
    }

};

OMGEmbeddedViewerMusic.prototype.getDrawingData = function () {
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

OMGEmbeddedViewerMusic.prototype.getSectionDrawingData = function (section) {
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

OMGEmbeddedViewerMusic.prototype.draw = function () {
    if (this.predraw) {
        this.predraw();
    }
    
    var noteSize = this.subbeatLength > 30 ? 30 : 20
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
        this.context.font = noteSize + "pt serif";
        var y, x, note
        for (var inotes = 0; inotes < this.drawingData.sections[isection].notes.length; inotes++) {
            usedBeats = 0;
            for (var inote = 0; inote < this.drawingData.sections[isection].notes[inotes].length; inote++) {
                note = this.drawingData.sections[isection].notes[inotes][inote].scaledNote
                x = isection * this.sectionLength + this.subbeatLength * usedBeats * this.beatParams.subbeats

                y = (109 - note) / 109 * (this.drawingData.sections[isection].notesHeight - 
                    (omg.ui.useUnicodeNotes ? 0 : noteSize))
                if (y < 30) {
                    this.context.save()
                    this.context.translate(x, y)
                    this.context.scale(1, -1)
                    x = 0
                    y = 0
                }

                if (omg.ui.useUnicodeNotes) {
                    this.context.fillText(
                        omg.ui.getTextForNote(this.drawingData.sections[isection].notes[inotes][inote]),
                        x, y);
                }
                else {
                    this.context.drawImage(
                        omg.ui.getImageForNote(this.drawingData.sections[isection].notes[inotes][inote]),
                        x, y - noteSize, noteSize, noteSize);
                }
                if (y < 30) {
                    this.context.restore()
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
