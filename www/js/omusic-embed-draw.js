import NoteDrawer from "./NoteDrawer.js"

export default function OMGEmbeddedViewerMusicDrawer() {
    this.noteDrawer = new NoteDrawer()
}

OMGEmbeddedViewerMusicDrawer.prototype.drawCanvas = function (data, canvas, subbeatsToDraw, performanceData) {

    this.noteDrawer.onReady(() => {
        this.song = data
        this.context = canvas.getContext("2d");
        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight
        this.width = canvas.width
        this.height = canvas.height
        this.canvas = canvas

        this.subbeatsToDraw = subbeatsToDraw
        this.performanceData = performanceData

        this.getDrawingData();
        this.draw();
    })
};

OMGEmbeddedViewerMusicDrawer.prototype.getDrawingData = function () {
    var viewer = this;
    var beatParams = this.song.beatParams;
    this.beatParams = beatParams;
    this.totalSubbeats = beatParams.subbeats * beatParams.beats * beatParams.measures;
    this.measuresToDraw = 0

    this.drawingData = {sections: []};
    let sections = this.performanceData || this.song.sections
    for (var sectionName in sections) {
        var section = sections[sectionName]
        var chordedData = [];
        chordedData.sectionName = section.name;
        var chordProgression = section.chordProgression || [0]
        for (var ic = 0; ic < chordProgression.length; ic++) {
            //todo section.rescale(section.chordProgression[ic])
            
            var sectionData = viewer.getSectionDrawingData(section);
            chordedData.push(sectionData);
        }
        viewer.drawingData.sections.push(chordedData);
        this.measuresToDraw += section.measures || 1
    }
    
    // todo figure out this arrangement thing, will need to recount measuresToDraw

    var arrangement = [];
    if (!this.performanceData && this.song.arrangement && this.song.arrangement.length > 0) {
        for (var ia = 0; ia < this.song.arrangement.length; ia++) {
            for (var isection = 0; isection < this.drawingData.sections.length; isection++) {
                if (this.drawingData.sections[isection].sectionName === this.song.arrangement[ia].name) {
                    for (var ir = -1; ir < (this.song.arrangement[ia].repeat || 0); ir++) {
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
        this.measureLength = Math.max(40, this.width / this.measuresToDraw);
        this.subbeatLength = this.measureLength / this.totalSubbeats;
    }

    if (this.subbeatsToDraw) {
        this.subbeatLength = this.width / this.subbeatsToDraw
    }
};

OMGEmbeddedViewerMusicDrawer.prototype.getSectionDrawingData = function (section) {
    var viewer = this;
    var measures = section.measures || 1
    var sectionData = {tracks: [], notes: [], section: section, measures: measures};
    for (var partName in section.parts) {
        var part = section.parts[partName]
        var headPart = this.findHeadPart(part.name)
        if (headPart.audioParams.mute) {
            continue;
        }

        if (headPart.surface.url === "PRESET_SEQUENCER") {
            for (var i = 0; i < part.tracks.length; i++) {
                if (part.tracks[i].audioParams.mute) {
                    continue;
                }
                for (var j = 0; j < viewer.totalSubbeats * measures; j++) {
                    if (part.tracks[i].data[j]) {
                        sectionData.tracks.push(part.tracks[i]);
                        break;
                    }
                }
            }
        }
        else {
            if (part.notes && part.notes.length > 0) {
                sectionData.notes.push(JSON.parse(JSON.stringify(part.notes)));
            }
        }
    }
    
    if (sectionData.tracks.length > 0) {
        if (sectionData.notes.length === 0) {
            sectionData.trackHeight = this.height / sectionData.tracks.length;
        }
        else {
            sectionData.trackHeight = this.height / 2 / sectionData.tracks.length;
            sectionData.notesHeight = this.height / 2;
        }
    }
    else {
        sectionData.notesHeight = this.height;
    }
    return sectionData;
}

OMGEmbeddedViewerMusicDrawer.prototype.draw = function () {
    if (this.predraw) {
        this.predraw();
    }

    this.canvas.width = this.canvas.width
    var subbeatsDrawn = 0

    var noteSize = this.subbeatLength > 30 ? 30 : 20
    var usedBeats;
    var marginX, marginY;
    var value;
    var section
    var subbeatsToDraw
    for (var isection = 0; isection < this.drawingData.sections.length; isection++) {
        section = this.drawingData.sections[isection]
        if (!this.subbeatsToDraw) {
            subbeatsToDraw = this.totalSubbeats * section.measures
        }
        else {
            subbeatsToDraw = (this.subbeatsToDraw - subbeatsDrawn > this.totalSubbeats) ? this.totalSubbeats : (this.subbeatsToDraw - subbeatsDrawn)
        }
        
        for (var itrack = section.tracks.length - 1; itrack >= 0 ; itrack--) {
            for (var i = 0; i < subbeatsToDraw; i++) {
                value = section.tracks[itrack].data[i];
                marginX = 1;
                marginY = this.trackHeight > 5 ? 1 : 0;
                if (typeof value === "number" && value > 0 && value < 1) {
                    this.context.fillStyle =  i % this.beatParams.beats == 0 ? "#DDDDDD" : "white";
                    this.context.fillRect((i + subbeatsDrawn) * this.subbeatLength + marginX, 
                                        this.height - itrack * section.trackHeight - marginY, 
                                        this.subbeatLength - marginX * 2, -1 * section.trackHeight + marginY * 2);
                    marginY = (section.trackHeight - section.trackHeight * value) / 3;
                    marginX = (this.subbeatLength - this.subbeatLength * value) / 3;
                }
                this.context.fillStyle =  value ? "black" : 
                                            (i % this.beatParams.beats == 0 ? "#DDDDDD" : "white");
                this.context.fillRect((i + subbeatsDrawn) * this.subbeatLength + marginX, 
                                    this.height - itrack * section.trackHeight - marginY, 
                                    this.subbeatLength - marginX * 2, -1 * section.trackHeight + marginY * 2);
            }
        }      
        this.context.fillStyle = "black";
        this.context.font = noteSize + "pt serif";
        var y, x, note
        for (var inotes = 0; inotes < section.notes.length; inotes++) {
            usedBeats = 0;
            for (var inote = 0; inote < section.notes[inotes].length; inote++) {
                note = section.notes[inotes][inote].scaledNote
                x = subbeatsDrawn * this.subbeatLength + this.subbeatLength * usedBeats * this.beatParams.subbeats

                y = (109 - note) / 109 * section.notesHeight
                
                this.noteDrawer.drawNote(section.notes[inotes][inote], this.context, x, y)
        
                usedBeats += section.notes[inotes][inote].beats;
                if (usedBeats * this.beatParams.subbeats >= this.totalSubbeats * section.measures) {
                    break;
                }
            }
        }
        
        if (isection > 0 || subbeatsDrawn > 0) {
            this.context.beginPath();
            this.context.lineWidth = 1;
            this.context.strokeStyle = "black";
            this.context.moveTo(subbeatsDrawn * this.subbeatLength, 0);
            this.context.lineTo(subbeatsDrawn * this.subbeatLength, this.height);
            this.context.stroke();
        }

        this.context.beginPath();
        this.context.lineWidth = 1;
        this.context.strokeStyle = "#AAAAAA";
        for (var imeasure = 1; imeasure < this.beatParams.measures; imeasure++) {
            this.context.moveTo(subbeatsDrawn * this.subbeatLength + imeasure * this.measureLength, 0);
            this.context.lineTo(subbeatsDrawn * this.subbeatLength + imeasure * this.measureLength, this.height);
        }
        this.context.stroke();

        subbeatsDrawn += this.beatParams.subbeats * this.beatParams.beats  * this.beatParams.measures
        if (this.subbeatsToDraw && subbeatsDrawn >= this.subbeatsToDraw) {
            return
        }
        if (this.subbeatsToDraw && isection === this.drawingData.sections.length - 1 && subbeatsDrawn < this.subbeatsToDraw) {
            isection = -1
        }
    }
};


// the above does the whole OMGSong, and now I need just a single part
// instead of refactoring, I'm doubling up


OMGEmbeddedViewerMusicDrawer.prototype.drawPartCanvas = function (part, canvas, beatParams, measures) {

    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    if (!part || !part.headPart) {
        console.warn("drawPartCanvas no part/headPart")
        return
    }
    if (part.headPart.data.surface.url === "PRESET_SEQUENCER") {
        this.drawPartBeats(part.data, canvas, beatParams, measures, 0, 0, canvas.width, canvas.height)
    }
    else {
        this.drawPartNotes(part.data, canvas, beatParams, measures, 0, 0, canvas.width, canvas.height)
    }
}

OMGEmbeddedViewerMusicDrawer.prototype.drawPartNotes = function (part, canvas, beatParams, measures, x, y, w, h) {
    
    var y, x, note
    var usedBeats = 0;
    
    var subbeatsDrawn = 0
    var subbeatsToDraw = beatParams.subbeats * beatParams.beats * measures
    var subbeatLength = canvas.width / subbeatsToDraw
    var noteSize = subbeatLength > 30 ? 30 : 20

    var context = canvas.getContext("2d");

    context.fillStyle = "#DDDDDD"
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = "black";
    context.font = noteSize + "pt serif";
    
    for (var note of part.notes) {
        x = subbeatsDrawn * subbeatLength + subbeatLength * usedBeats * beatParams.subbeats

        y = (109 - note.note) / 109 * canvas.height
        
        this.noteDrawer.drawNote(note, context, x, y)

        usedBeats += note.beats;
        if (usedBeats * beatParams.subbeats >= subbeatsToDraw) {
            break;
        }
    }
}

OMGEmbeddedViewerMusicDrawer.prototype.drawPartBeats = function (part, canvas, beatParams, measures, x, y, w, h) {
    var context = canvas.getContext("2d");
    
    var tracks = part.tracks
    var subbeatsDrawn = 0
    var subbeatsToDraw = beatParams.subbeats * beatParams.beats * measures
    var subbeatLength = canvas.width / subbeatsToDraw
    var height = canvas.height / tracks.length
    
    for (var itrack = 0; itrack < tracks.length; itrack++) {
        for (var i = 0; i < subbeatsToDraw; i++) {
            var value = tracks[itrack].data[i];
            var marginX = 1;
            var marginY = 1 //this.trackHeight > 5 ? 1 : 0;
            if (typeof value === "number" && value > 0 && value < 1) {
                context.fillStyle =  i % beatParams.beats == 0 ? "#DDDDDD" : "white";
                context.fillRect((i + subbeatsDrawn) * subbeatLength + marginX, 
                                    itrack * height - marginY, 
                                    subbeatLength - marginX * 2, -1 * height + marginY * 2);
                marginY = (height - height * value) / 3;
                marginX = (subbeatLength - subbeatLength * value) / 3;
            }
            context.fillStyle =  value ? "black" : 
                                        (i % beatParams.beats == 0 ? "#DDDDDD" : "white");
            context.fillRect((i + subbeatsDrawn) * subbeatLength + marginX, 
                                itrack * height - marginY, 
                                subbeatLength - marginX * 2, height + marginY * 2);
        }
    }   
}

OMGEmbeddedViewerMusicDrawer.prototype.findHeadPart = function (partName) {
    for (var i = 0; i < this.song.parts.length; i++) {
        if (partName === this.song.parts[i].name) {
            return this.song.parts[i]
        }
    }
}