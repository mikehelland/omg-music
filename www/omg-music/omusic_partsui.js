if (typeof omg != "object")
    omg = {};

if (!omg.ui)
    omg.ui = {};

omg.ui.omgUrl = "omg-music/";

omg.ui.noteImageUrls = [[2, "note_half", "note_rest_half"],
    [1.5, "note_dotted_quarter", "note_rest_dotted_quarter"],
    [1, "note_quarter", "note_rest_quarter"],
    [0.75, "note_dotted_eighth", "note_rest_dotted_eighth"],
    [0.5, "note_eighth", "note_rest_eighth", "note_eighth_upside"],
    [0.375, "note_dotted_sixteenth", "note_rest_dotted_sixteenth"],
    [0.25, "note_sixteenth", "note_rest_sixteenth", "note_sixteenth_upside"],
    [0.125, "note_thirtysecond", "note_rest_thirtysecond"],
    [-1, "no_file", "no_file"]];

omg.ui.noteNames = ["C-", "C#-", "D-", "Eb-", "E-", "F-", "F#-", "G-", "G#-", "A-", "Bb-", "B-",
    "C0", "C#0", "D0", "Eb0", "E0", "F0", "F#0", "G0", "G#0", "A0", "Bb0", "B0",
    "C1", "C#1", "D1", "Eb1", "E1", "F1", "F#1", "G1", "G#1", "A1", "Bb1", "B1",
    "C2", "C#2", "D2", "Eb2", "E2", "F2", "F#2", "G2", "G#2", "A2", "Bb2", "B2",
    "C3", "C#3", "D3", "Eb3", "E3", "F3", "F#3", "G3", "G#3", "A3", "Bb3", "B3",
    "C4", "C#4", "D4", "Eb4", "E4", "F4", "F#4", "G4", "G#4", "A4", "Bb4", "B4",
    "C5", "C#5", "D5", "Eb5", "E5", "F5", "F#5", "G5", "G#5", "A5", "Bb5", "B5",
    "C6", "C#6", "D6", "Eb6", "E6", "F6", "F#6", "G6", "G#6", "A6", "Bb6", "B6",
    "C7", "C#7", "D7", "Eb7", "E7", "F7", "F#7", "G7", "G#7", "A7", "Bb7", "B7",
    "C8"];

omg.ui.scales = {"Major": "0,2,4,5,7,9,11",
    "Minor": "0,2,3,5,7,8,10",
    "Pentatonic": "0,2,4,7,9",
    "Blues": "0,3,5,6,7,10",
    "Chromatic": "0,1,2,3,4,5,6,7,8,9,10,11"};


omg.ui.getScrollTop = function () {
    return document.body.scrollTop + document.documentElement.scrollTop;
};


omg.ui.totalOffsets = function (element, parent) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;

        if (parent && parent === element) {
            break;
        }

    } while (element);

    return {
        top: top,
        left: left
    };
};


omg.ui.drawDrumCanvas = function (params) {
    
    var drumbeat = params.drumbeat || params.data;
    var canvas = params.canvas;
    var captionWidth = params.captionWidth;
    var rowHeight = params.rowHeight;
    var subbeat = params.subbeat;

    canvas.omusic_refresh = function (subbeat) {
        try {
            params.subbeat = subbeat;
            omg.ui.drawDrumCanvas(params);
        } catch (exp) {
            console.log("error drawing drum canvas");
            console.log(exp);
        }
    };

    if (!drumbeat.tracks || drumbeat.tracks.length == 0)
        return;

    var subbeats = (params.songData && params.songData.subbeats) ? 
        params.songData.subbeats : 4;
    var beats = (params.songData && params.songData.beats) ? 
        params.songData.beats : 4;
    var measures = (params.songData && params.songData.measures) ? 
        params.songData.measures : 2;
    var totalSubbeats = subbeats * beats * measures;

    var top;
    var height, width;

    var left = params.offsetLeft || 0;

    if (typeof (params.offsetTop) == "number") {
        top = params.offsetTop;
    } else {
        top = 0;
    }

    if (typeof (params.width) == "number") {
        width = params.width;
    } else {
        width = canvas.width;
    }

    if (typeof (params.height) == "number") {
        height = params.height;
    } else {
        height = canvas.height - top;
    }

    var context = canvas.getContext("2d");

    var longestCaptionWidth = 0;

    var totalTracks = 0;
    for (var i = 0; i < drumbeat.tracks.length; i++) {
        if (drumbeat.tracks[i].sound) {
            totalTracks++;
        }
        if (captionWidth === undefined && drumbeat.tracks[i].name.length > 0) {
            longestCaptionWidth = Math.max(longestCaptionWidth,
                    context.measureText(drumbeat.tracks[i].name).width);
        }
    }

    if (rowHeight === undefined) {
        rowHeight = height / totalTracks;
    }

    if (captionWidth === undefined) {
        captionWidth = Math.min(canvas.width * 0.2, 50, longestCaptionWidth + 4);
    }
    
    if (totalTracks == 0) {
        return;
    }

    if (!params.keepCanvasDirty) {
        canvas.width = params.width || canvas.clientWidth;
    }

    context.fillStyle = "white";
    context.fillRect(left + captionWidth, top, width - captionWidth, height);

    var columnWidth = (width - captionWidth) / totalSubbeats;

    canvas.rowHeight = rowHeight;
    canvas.columnWidth = columnWidth;
    canvas.captionWidth = captionWidth;

    var ii = 0;
    for (var i = 0; i < drumbeat.tracks.length; i++) {
        if (!drumbeat.tracks[i].sound) {
            continue;
        }
        context.fillStyle = "black";
        context.fillText(drumbeat.tracks[i].name, left, top + rowHeight * (ii + 1) - 2);

        for (var j = 0; j < drumbeat.tracks[i].data.length; j++) {

            context.fillStyle = drumbeat.tracks[i].data[j] ? "black" :
                    (j % subbeats == 0) ? "#C0C0C0" : "#E0E0E0";

            context.fillRect(left + captionWidth + columnWidth * j + 1, top + rowHeight * ii + 1,
                    columnWidth - 2, rowHeight - 2);
        }
        ii++;
    }

    context.globalAlpha = 0.5;
    context.fillStyle = "#4fa5d5";
    if (subbeat != undefined) {
        context.fillRect(captionWidth + columnWidth * subbeat + 1, 0,
                columnWidth - 2, canvas.height);
    }
    context.globalAlpha = 1;
};


omg.ui.drawMelodyCanvas = function (params) {

    if (!params || !params.canvas || !params.data)
        return;

    //todo why do we just get part.data? why not part?
    //I want it
    var top = 0;
    var left = 0;
    var clear = true;
    var canvas = params.canvas;
    var melody = params.data;
    var beats = params.beats || 4;
    var measures = params.measures || 2;
        
    top = params.offsetTop || 0;
    left = params.offsetLeft || 0;
    var w = params.width || canvas.width;
    var h = params.height || canvas.height;
    clear = !params.keepCanvasDirty;

    var high;
    var low;
    var note;
    for (var im = 0; im < melody.notes.length; im++) {
        note = melody.notes[im];

        if (!note.rest && (low == undefined || note.note < low)) {
            low = note.note;
        }
        if (!note.rest && (high == undefined || note.note > high)) {
            high = note.note;
        }
    }

    var drawNotes = function () {
        var context = canvas.getContext("2d");

        var frets = high - low + 1;
        var fretHeight = h / frets;

        if (clear) {
            canvas.width = canvas.width; //w || canvas.clientWidth;
        }

        //context.fillStyle = "white";
        //context.fillRect(0, fretHeight, canvas.width, canvas.height);

        var upsideDownNoteImage;
        var noteImage = omg.ui.getImageForNote({beats: 1});
        var noteHeight = noteImage.height;
        var noteWidth = noteImage.width;
        if (noteWidth * (melody.notes.length + 2) > w) {
            noteWidth = w / (melody.notes.length + 2);
        }
        canvas.noteWidth = noteWidth;

        var restHeight = h / 2 - noteImage.height / 2;

        /*if (part.playingI > -1 && 
         part.playingI < part.data.notes.length) {
         context.fillStyle = "#4fa5d5";
         context.fillRect(part.playingI * noteWidth + noteWidth + 
         (noteImage.width / 2 - noteWidth / 2),
         (frets - (part.data.notes[part.playingI].note - low)) * 
         fretHeight + fretHeight * 0.5 -
         noteImage.height * 0.75, noteWidth, noteHeight);
         }*/

        var iy;
        var ii;
        var note;
        var beatsUsed = 0;
        var pixelsPerBeat = w / (beats * measures);
        for (var i = 0; i < melody.notes.length; i++) {
            note = melody.notes[i];
            noteImage = omg.ui.getImageForNote(note);
            fretNumber = melody.notes[i].note;
            if (note.rest) {
                iy = restHeight;
            } else {
                iy = ((frets - 1) - (fretNumber - low)) *
                        fretHeight + fretHeight * 0.5 -
                        noteImage.height * 0.75;
            }

            if (iy < 0) {
                upsideDownNoteImage = omg.ui.getImageForNote(note, true);

                if (upsideDownNoteImage != noteImage) {
                    iy = ((frets - 1) - (fretNumber - low)) *
                            fretHeight + fretHeight * 0.5 -
                            noteImage.height * 0.25;
                    context.drawImage(upsideDownNoteImage, left + beatsUsed * pixelsPerBeat, top + iy);
                } else {
                    iy2 = ((fretNumber - low)) *
                            fretHeight + fretHeight * 0.5 -
                            noteImage.height * 0.75;

                    context.save();
                    context.scale(1, -1);
                    context.drawImage(noteImage, left + beatsUsed * pixelsPerBeat, top + iy2 - h);
                    context.restore();
                }

            } else {
                context.drawImage(noteImage, left + beatsUsed * pixelsPerBeat, top + iy);
            }
            beatsUsed += note.beats;
        }
    };

    if (omg.ui.noteImages) {
        drawNotes();
    } else {
        // if the images aren't loaded yet
        var attempts = 0;
        var attemptHandle = setInterval(function () {
            attempts++;
            console.log("attempt " + attempts);
            if (omg.ui.noteImages) {
                drawNotes();
                clearInterval(attemptHandle);
            } else if (attempts > 20) {
                clearInterval(attemptHandle);
            }
        }, 200);
    }

    canvas.omusic_refresh = function (newW, newH) {
        if (newW)
            w = newW;
        if (newH)
            h = newH;
        try {
            drawNotes();
        } catch (exp) {
            console.log("error drawing melody canvas");
            console.log(exp);
        }
    };

};

omg.ui.getImageForNote = function (note, upsideDown) {

    var draw_noteImage = omg.ui.noteImages[8][note.rest ? 1 : 0];
    if (note.beats == 2.0) {
        draw_noteImage = omg.ui.noteImages[0][note.rest ? 1 : 0];
    }
    if (note.beats == 1.5) {
        draw_noteImage = omg.ui.noteImages[1][note.rest ? 1 : 0];
    }
    if (note.beats == 1.0) {
        draw_noteImage = omg.ui.noteImages[2][note.rest ? 1 : 0];
    }
    if (note.beats == 0.75) {
        draw_noteImage = omg.ui.noteImages[3][note.rest ? 1 : 0];
    }
    if (note.beats == 0.5) {
        draw_noteImage = omg.ui.noteImages[4][note.rest ? 1 :
                upsideDown ? 2 : 0];
    }
    if (note.beats == 0.375) {
        draw_noteImage = omg.ui.noteImages[5][note.rest ? 1 : 0];
    }
    if (note.beats == 0.25) {
        draw_noteImage = omg.ui.noteImages[6][note.rest ? 1 :
                upsideDown ? 2 : 0];
    }
    if (note.beats == 0.125) {
        draw_noteImage = omg.ui.noteImages[7][note.rest ? 1 : 0];
    }

    return draw_noteImage;

};

omg.ui.getNoteImageUrl = function (i, j) {
    var fileName = omg.ui.noteImageUrls[i][j];
    if (fileName) {
        return "img/notes/" + fileName + ".png";
    }
};

omg.ui.setupNoteImages = function () {
    if (omg.ui.noteImages)
        return;

    if (!omg.ui.noteImageUrls)
        omg.ui.getImageUrlForNote({beats: 1});

    var noteImages = [];
    var loadedNotes = 0;
    var areAllNotesLoaded = function () {
        loadedNotes++;
        if (loadedNotes == omg.ui.noteImageUrls.length * 2) {
            omg.ui.noteImages = noteImages;
        }
    };

    for (var i = 0; i < omg.ui.noteImageUrls.length; i++) {

        var noteImage = new Image();
        noteImage.onload = areAllNotesLoaded;
        noteImage.src = omg.ui.omgUrl + omg.ui.getNoteImageUrl(i, 1);

        var restImage = new Image();
        restImage.onload = areAllNotesLoaded;
        restImage.src = omg.ui.omgUrl + omg.ui.getNoteImageUrl(i, 2);

        var imageBundle = [noteImage, restImage];
        var upsideDown = omg.ui.getNoteImageUrl(i, 3);
        if (upsideDown) {
            var upsideImage = new Image();
            upsideImage.src = omg.ui.omgUrl + upsideDown;
            imageBundle.push(upsideImage);
        }

        noteImages.push(imageBundle);
    }
};

omg.ui.splitInts = function (string) {
    var ints = string.split(",");
    for (var i = 0; i < ints.length; i++) {
        ints[i] = parseInt(ints[i]);
    }
    return ints;
};


//omg.ui.setupNoteImages();



/*small canvas - edit, currently it's just read only
 * canvas.onclick = function (e) {
 var el = canvas;
 var offsetLeft = 0;
 var offsetTop = 0;
 while (el && !isNaN(el.offsetLeft)) {
 offsetLeft += el.offsetLeft;
 offsetTop += el.offsetTop;
 el = el.parentElement;
 }
 
 var xbox = Math.floor((e.clientX - offsetLeft - canvas.captionWidth) / 
 canvas.columnWidth);
 if (xbox >= 0) {
 var ybox = Math.floor((e.clientY - offsetTop) / 
 canvas.rowHeight);
 
 part.data.tracks[ybox].data[xbox] = part.data.tracks[ybox].data[xbox] ? 0 : 1;
 drawDrumCanvas(part);
 }
 
 part.id = 0;
 sectionModified();
 };*/


// beats are hardcoded?!

function OMGDrumMachine(canvas, part) {
    this.canvas = canvas;

    this.readOnly = true;

    this.beats = 8;
    this.subbeats = 4;

    this.ctx = canvas.getContext("2d");

    var omgdrums = this;
    this.isTouching = false;

    this.lastSubbeat = -1;

    this.lastBox = [-1, -1];

    this.currentTrack = 0;

    this.drawTrackColumn = true;

    if (part) {
        this.setPart(part);
    }
    canvas.onmouseup = function (e) {
        e.preventDefault();
        omgdrums.isTouching = false;
    };
    canvas.onmouseout = function () {
        omgdrums.isTouching = false;
    };
    canvas.ontouchend = function (e) {
        e.preventDefault();
        omgdrums.isTouching = false;
    };

    canvas.onmousemove = function (e) {
        e.preventDefault();

        var x = e.clientX - omgdrums.offsetLeft;
        var y = e.clientY - omgdrums.offsetTop;
        canvas.onmove(x, y);
    };

    canvas.ontouchmove = function (e) {
        e.preventDefault();

        var x = e.targetTouches[0].pageX - omgdrums.offsetLeft;
        var y = e.targetTouches[0].pageY - omgdrums.offsetTop;
        canvas.onmove(x, y);
    };


    canvas.onmousedown = function (e) {
        e.preventDefault();

        var x = e.clientX - omgdrums.offsetLeft;
        var y = e.clientY - omgdrums.offsetTop;
        canvas.ondown(x, y);
    };

    canvas.ontouchstart = function (e) {
        e.preventDefault();

        var x = e.targetTouches[0].pageX - omgdrums.offsetLeft;
        var y = e.targetTouches[0].pageY - omgdrums.offsetTop;
        canvas.ondown(x, y);
    };

    canvas.ondown = function (x, y) {
        if (omgdrums.readOnly)
            return;

        var column = Math.floor((x - canvas.captionWidth) / canvas.columnWidth);
        var row = Math.floor(y / canvas.rowHeight);

        console.log({x: x, y: y, column: column, row: row});

        if (column < 0) {
        } else {
            // figure out the subbeat this is
            //var subbeat = column - 1 + row * omgdrums.subbeats;
            var subbeat = column; // - 1 + row * omgdrums.subbeats;

            //var data = omgdrums.part.data.tracks[omgdrums.currentTrack].data;
            console.log(row);
            console.log(omgdrums.part.data.tracks);
            var data = omgdrums.part.data.tracks[row].data;
            data[subbeat] = !data[subbeat];

            lastBox = [column, row];
            omgdrums.isTouching = true;

            if (omgdrums.onchange)
                omgdrums.onchange();
        }

        //omgdrums.drawLargeCanvas();
        omgdrums.canvas.omusic_refresh();
    };

    canvas.onmove = function (x, y) {

        if (omgdrums.readOnly)
            return;

        if (!omgdrums.isTouching)
            return;

        var column = Math.floor((x - canvas.captionWidth) / canvas.columnWidth);
        var row = Math.floor(y / canvas.rowHeight);

        if (column == 0) {
            omgdrums.isTouching = false;
        } else if (lastBox[0] != column || lastBox[1] !== row) {
            // figure out the subbeat this is
            //var subbeat = column - 1 + row * omgdrums.subbeats;
            var subbeat = column;

            //var data = omgdrums.part.data.tracks[omgdrums.currentTrack].data;
            var data = omgdrums.part.data.tracks[row].data;
            data[subbeat] = data[subbeat] ? 0 : 1;

            lastBox = [column, row];

            if (omgdrums.onchange)
                omgdrums.onchange();

        }

        //omgdrums.drawLargeCanvas();
        omgdrums.canvas.omusic_refresh();

    };


};

OMGDrumMachine.prototype.setSize = function (width, height) {
    var canvas = this.canvas;
    canvas.height = height;
    canvas.width = width;
    canvas.style.height = height + "px";
    //canvas.style.width = width + "px";

    this.columnWidth = width / this.columns;
    this.rowHeight = height / this.rows;
    this.drawLargeCanvas();

};

OMGDrumMachine.prototype.setPart = function (part) {

    this.part = part;

    var beats = 4;
    var subbeats = 4;
    var measures = 2;
    if (part.section && part.section.song && part.section.song.data) {
        beats = part.section.song.data.beats || beats;
        subbeats = part.section.song.data.subbeats || subbeats;
        measures = part.section.song.data.measures || measures;
    }
    this.totalSubbeats = measures * beats * subbeats;
    
    this.columns = this.totalSubbeats; //1 + this.subbeats;
    this.rows = this.part.data.tracks.length;

    this.refresh();

    this.captionsAreSetup = false;
};

OMGDrumMachine.prototype.draw = function () {
    
};

OMGDrumMachine.prototype.refresh = function (part) {
    this.columnWidth = this.canvas.clientWidth / this.columns;
    this.rowHeight = this.canvas.clientHeight / this.rows;

    var offsets = omg.ui.totalOffsets(this.canvas);

    this.offsetLeft = offsets.left;
    this.offsetTop = offsets.top;

};

OMGDrumMachine.prototype.drawLargeCanvas = function (iSubBeat) {

    var boxMargin = 6;

    var ctx = this.ctx;
    var width = this.canvas.clientWidth;
    var height = this.canvas.clientHeight;
    this.canvas.width = width;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#8888FF";
    ctx.fillRect(0, 0, this.columnWidth, height);

    if (!this.part)
        return;

    var part = this.part.data;

    var currentBeat;
    if (typeof (iSubBeat) == "number") {
        currentBeat = [(iSubBeat % this.subbeats) + 1,
            Math.floor(iSubBeat / this.subbeats)];
    }

    var captionWidth;
    var halfColumnWidth = this.columnWidth / 2;
    var partCaption;
    if (!this.captionsAreSetup) {
        this.captions = [];
        for (var jj = 0; jj < part.tracks.length; jj++) {
            partCaption = part.tracks[jj].name
            captionWidth = ctx.measureText(partCaption).width;
            this.captions.push({"caption": partCaption, "width": captionWidth,
                "left": halfColumnWidth - captionWidth / 2});
        }
        this.captionsAreSetup = true;
    }

    this.captionRowHeight = height / this.captions.length;

    var x, y, w, h;
    var jj, ii;

    if (this.drawTrackColumn) {
        for (var jj = 0; jj < this.captions.length; jj++) {
            ctx.fillStyle = "#FFFFFF";
            ctx.strokeStyle = "#808080";

            x = boxMargin;
            y = boxMargin + jj * this.captionRowHeight;
            w = this.columnWidth - boxMargin * 2;
            h = this.captionRowHeight - boxMargin * 2;

            if (part.tracks[jj]) {
                if (jj == this.currentTrack) {
                    ctx.fillRect(x, y, w, h);
                    ctx.fillStyle = "black";
                } else {
                    ctx.strokeRect(x, y, w, h);
                    ctx.fillStyle = "white";
                }
                ctx.fillText(this.captions[jj].caption, this.captions[jj].left, y + h / 2);
            }
        }
    }

    ctx.font = "18px sans-serif";
    for (ii = 1; ii < this.columns; ii++) {
        for (jj = 0; jj < this.rows; jj++) {
            ctx.fillStyle = "#FFFFFF";
            ctx.strokeStyle = "#808080";

            x = boxMargin + ii * this.columnWidth;
            y = boxMargin + jj * this.rowHeight;
            w = this.columnWidth - boxMargin * 2;
            h = this.rowHeight - boxMargin * 2;

            if (ii == 0) {
                if (part.tracks[jj]) {
                    if (jj == this.currentTrack) {
                        ctx.fillRect(x, y, w, h);
                        ctx.fillStyle = "black";
                    } else {
                        ctx.strokeRect(x, y, w, h);
                        ctx.fillStyle = "white";
                    }
                    ctx.fillText(this.captions[jj].caption, this.captions[jj].left, y + h / 2);
                }
            } else {

                ctx.fillStyle = "#FFFFFF";

                if (part.tracks[this.currentTrack].data[jj * this.subbeats + ii - 1]) {
                    ctx.fillRect(x, y, w, h);
                    ctx.fillStyle = "black";
                } else {
                    ctx.strokeRect(x, y, w, h);
                    ctx.fillStyle = "white";
                }
                ctx.fillText(ii == 1 ? jj + 1 : ii == 2 ? "e" : ii == 3 ? "+" : "a", x + w / 2 - 6, y + h / 2);

                if (currentBeat != undefined &&
                        ii == currentBeat[0] && jj == currentBeat[1]) {
                    ctx.globalAlpha = 0.5;
                    ctx.fillStyle = "red";
                    ctx.fillRect(x, y, w, h);
                    ctx.globalAlpha = 1;
                    //ctx.fillRect(x - boxMargin, y - boxMargin, 
                    //		w + boxMargin * 2, h + boxMargin * 2);					
                }

            }
        }
    }

};

function OMGMelodyMaker(canvas, part, player) {
    this.canvas = canvas;
    this.bottomFretBottom = 30;
    this.topFretTop = 10;
    this.instrument = "Sine Wave";
    this.selectedColor = "#4fa5d5";
    this.autoAddRests = true;
    this.player = player;

    if (part)
        this.setPart(part);

}

OMGMelodyMaker.prototype.drawCanvas = function () {
    var canvas = this.canvas;

    var backgroundAlpha = 1;
    var noteAlpha = 1;

    var frets = this.frets;
    var fretHeight = frets.height;

    var canvas = this.canvas;
    var context = canvas.getContext("2d");

    canvas.width = canvas.clientWidth;

//	context.fillStyle = "#F4F4F4";
    context.fillStyle = "white";
    context.fillRect(0, this.topFretTop, canvas.width,
            canvas.height - this.bottomFretBottom - this.topFretTop);

    var noteImage;
    var noteHeight;
    var noteWidth;
    if (!omg.ui.rawNoteWidth) {
        noteImage = omg.ui.getImageForNote({
            beats: 1
        });
        noteHeight = noteImage.height;
        noteWidth = noteImage.width;
        omg.ui.rawNoteWidth = noteWidth;
        omg.ui.rawNoteHeight = noteHeight;
    } else {
        noteHeight = omg.ui.rawNoteHeight;
        noteWidth = omg.ui.rawNoteWidth;
    }

    if (noteWidth * (this.data.notes.length + 2) > canvas.width) {
        noteWidth = canvas.width / (this.data.notes.length + 2);
    }
    var restHeight = canvas.height / 2 - noteHeight / 2;

    // for ontouch
    this.noteWidth = noteWidth;

    var now;
    var welcomeAlpha = 1;

    if (this.welcomeStyle) {
        noteAlpha = 0;

        if (this.drawStarted) {
            now = Date.now() - this.drawStarted;
            context.globalAlpha = 0.3;
            //context.fillStyle = this.selectedColor;
            //context.fillRect(0, this.topFretTop, now / 4000 * canvas.width, 
            //		canvas.height - this.bottomFretBottom - this.topFretTop);

            welcomeAlpha = 1 - Math.min(1, now / 4000);
        }

        context.globalAlpha = 1;

        this.drawGettingStartedLines(canvas, context);

        if (this.animationStarted) {
            var halfTime = this.animationLength / 2;
            now = Date.now() - this.animationStarted;
            if (now < 800) {
                backgroundAlpha = now / 800;
            } else if (now >= 1500) {
                noteAlpha = (now - halfTime) / halfTime;
            } else {
                backgroundAlpha = 1;
            }
        } else {

            context.globalAlpha = welcomeAlpha;

            context.shadowBlur = 0;
            context.fillStyle = "black";
            context.font = "bold 30px sans-serif";
            var cap = "Draw something here!";
            context.fillText(cap, canvas.width / 2 - context.measureText(cap).width / 2,
                    canvas.height / 2 - 20);

            /*context.font = "20px sans-serif";
             context.fillStyle = "#808080";
             cap = "You can make Music!";
             context.fillText(cap, canvas.width / 2 - context.measureText(cap).width / 2,
             canvas.height / 2 - 58);
             */
            context.globalAlpha = 1;

            return;
        }
    }

    context.lineWidth = 1;

    context.globalAlpha = backgroundAlpha;

    context.fillStyle = "black";

    if (this.bottomFretBottom) {

        var bottomRowTop = canvas.height - this.bottomFretBottom + 4;

        var margin = 4;
        var buttonWidth;
        var button;
        var nextLeft = margin;
        for (var ibtn = 0; ibtn < canvas.bottomRow.length; ibtn++) {
            button = canvas.bottomRow[ibtn];
            buttonWidth = button.width || (button.image ? button.image.width : 50);


            if (button.button) {
                context.fillStyle = "white";
                context.fillRect(nextLeft, bottomRowTop,
                        buttonWidth, canvas.height - bottomRowTop - 2);

                if (button.selected && button.selected()) {
                    context.fillStyle = this.selectedColor;
                    context.fillRect(nextLeft, bottomRowTop,
                            buttonWidth, canvas.height - bottomRowTop - 2);
                }

                if (this.buttonTouched && this.buttonTouched == button) {
                    context.globalAlpha = 0.3;
                    context.fillStyle = this.selectedColor;
                    context.fillRect(nextLeft, bottomRowTop,
                            buttonWidth, canvas.height - bottomRowTop - 2);
                    context.globalAlpha = 1;
                }

                if (button.image) {
                    context.drawImage(button.image, nextLeft,
                            bottomRowTop - margin, buttonWidth, this.bottomFretBottom);
                }

                context.strokeRect(nextLeft, bottomRowTop, buttonWidth, canvas.height - bottomRowTop - 2);
                if (button.text) {
                    context.fillStyle = "black";
                    context.fillText(button.text,
                            nextLeft + buttonWidth / 2 - context.measureText(button.text).width / 2,
                            canvas.height - 10);
                }
                button.leftX = nextLeft;
                button.rightX = nextLeft + buttonWidth;
            } else if (button.text) {
                buttonWidth = context.measureText(button.text).width + 10 + margin;
                context.fillText(button.text,
                        nextLeft + 10,
                        canvas.height - 10);

            }

            nextLeft += buttonWidth + margin;
        }

    }

    var edittingSelected = false;
    var ii;
    if (!this.animationStarted && frets.current != undefined
            && frets.current < frets.length && frets.current >= 0) {
        context.fillStyle = "orange";
        ii = frets.length - frets.current - 1;
        if (this.canvas.mode == "APPEND") {
            context.fillRect(0, this.topFretTop + ii * fretHeight, canvas.width, fretHeight);
        } else if (this.canvas.mode == "EDIT" && this.noteEditting &&
                frets.current == this.noteEditting.note + this.frets.rootNote) {
            edittingSelected = true;
        }
    }

    var note;
    var y;

    var playingI = this.part.playingI;
    var notes = this.part.data.notes;
    if (playingI > -1 && playingI < notes.length) {
        context.fillStyle = "#4fa5d5";

        note = notes[playingI];
        if (note.rest) {
            y = restHeight;
        } else {
            y = this.topFretTop + (this.frets.length - note.note - this.frets.rootNote - 1)
                    * fretHeight + fretHeight * 0.5 - noteHeight * 0.75;
        }
        context.fillRect(playingI * noteWidth + noteWidth
                + (omg.ui.rawNoteWidth / 2 - omg.ui.rawNoteWidth / 2),
                y, noteWidth,
                noteHeight);
    }

    context.font = "12px sans-serif";
    context.lineWidth = "2px";
    context.strokeStyle = "black";
    context.fillStyle = "black";
    context.beginPath();
    context.moveTo(0, this.topFretTop);
    context.lineTo(canvas.width, this.topFretTop);
    for (var i = 0; i < frets.length; i++) {

        ii = frets.length - i;

        context.moveTo(0, this.topFretTop + ii * fretHeight);
        context.lineTo(canvas.width, this.topFretTop + ii * fretHeight);
        context.fillStyle = "black";
        context.fillText(frets[i].caption, 4, this.topFretTop + ii * fretHeight - fretHeight / 3);
    }
    context.stroke();
    context.closePath();

    context.globalAlpha = noteAlpha;

    var selectedX;
    var selectedY;
    var x;
    if (!this.drawnOnce || noteAlpha > 0) {

        for (var i = 0; i < this.data.notes.length; i++) {
            note = this.data.notes[i]
            noteImage = omg.ui.getImageForNote(note);
            if (note.rest) {
                y = restHeight;
            } else {
                y = this.topFretTop +
                        (this.frets.length - this.data.notes[i].note - this.frets.rootNote - 1)
                        * fretHeight
                        + fretHeight * 0.5
                        - noteImage.height * 0.75;
            }

            if (note.rest || noteAlpha == 1)
                x = i * noteWidth + noteWidth;
            else
                x = note.drawData.x;

            if (this.noteEditting == note && edittingSelected) {
                context.fillStyle = "orange";
                context.fillRect(x, y, noteWidth, noteImage.height);
                selectedX = x + noteWidth;
                selectedY = y + noteImage.height;
            }

            context.drawImage(noteImage, x, y);

            if (this.noteEditting == note) {
                context.strokeRect(x, y, noteWidth, noteImage.height);
            }
        }
    }

    this.drawnOnce = true;

    if (this.noteEdittingDialog) {
        this.drawNoteEdittingDialog(canvas, context, selectedX, selectedY);
    }
};

OMGMelodyMaker.prototype.drawNoteEdittingDialog = function (canvas, context, x, y) {

    if (this.noteEdittingDialog.x == undefined) {
        if (x - 120 < 0) {
            x = 0;
        } else {
            x = x - 120;
        }
        if (x + 240 > canvas.width) {
            x = canvas.width - 240;
        }

        this.noteEdittingDialog.x = x;
        this.noteEdittingDialog.y = y;

    }
    x = this.noteEdittingDialog.x;
    y = this.noteEdittingDialog.y;

    context.globalAlpha = 0.15;
    context.fillStyle = "#808080";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.globalAlpha = 1;
    context.fillStyle = "white";
    context.fillRect(x, y, 240, 150);
    context.strokeStyle = "black";
    context.strokeRect(x, y, 240, 150);

    this.drawButtons(context, canvas.noteButtonRow, x + 2, y + 4, 240, 40);
    this.drawButtons(context, canvas.restButtonRow, x + 2, y + 44, 240, 40);
    this.drawButtons(context, canvas.removeButtonRow, x + 60, y + 100, 240, 40);
};

OMGMelodyMaker.prototype.drawButtons = function (context, buttonRow, x, y, width, height) {

    var button;
    var buttonWidth;
    var margin = 4;
    var nextLeft = x + margin;
    var ymargin = y + margin;
    var heightmargin = height - margin * 2;
    for (var ibtn = 0; ibtn < buttonRow.length; ibtn++) {
        button = buttonRow[ibtn];
        buttonWidth = button.width || (button.image ? button.image.width : 50);


        if (button.button) {
            context.fillStyle = "white";
            context.fillRect(nextLeft, ymargin,
                    buttonWidth, heightmargin);

            if (button.selected && button.selected()) {
                context.fillStyle = this.selectedColor;
                context.fillRect(nextLeft, ymargin,
                        buttonWidth, heightmargin);
            }

            if (this.buttonTouched && this.buttonTouched == button) {
                context.globalAlpha = 0.3;
                context.fillStyle = this.selectedColor;
                context.fillRect(nextLeft, ymargin,
                        buttonWidth, heightmargin);
                context.globalAlpha = 1;
            }

            if (button.image) {
                context.drawImage(button.image, nextLeft,
                        ymargin, buttonWidth, heightmargin);
            }

            context.strokeRect(nextLeft, ymargin, buttonWidth, heightmargin);
            if (button.text) {
                context.fillStyle = "black";
                context.fillText(button.text,
                        nextLeft + buttonWidth / 2 - context.measureText(button.text).width / 2,
                        y + height / 2 + 3);
            }
            button.leftX = nextLeft;
            button.rightX = nextLeft + buttonWidth;
            button.topY = ymargin;
            button.bottomY = ymargin + heightmargin;
        } else if (button.text) {
            buttonWidth = context.measureText(button.text).width + 10 + margin;
            context.fillText(button.text,
                    nextLeft + 10,
                    y + height / 2);

        }

        nextLeft += buttonWidth + margin;
    }

};

OMGMelodyMaker.prototype.setupFretBoard = function () {

    //var rootNote = this.selectRootNote.selectedIndex;
    var rootNote = 0;

    var bottomNote;
    var topNote;
    var octaveShift;
    if (this.advanced) {
        //bottomNote = this.selectBottomNote.selectedIndex + 9;
        //topNote = this.selectTopNote.selectedIndex + 9;
        //octaveShift = this.selectOctaveShift.selectedIndex;
    } else {
        octaveShift = this.data.type == "BASSLINE" ? 3 : 5;
        rootNote += octaveShift * 12;
        bottomNote = rootNote - 12;
        topNote = rootNote + +12;
    }

    var fretCount = topNote - bottomNote + 1;

    this.data.bottomNote = bottomNote;
    this.data.rootNote = rootNote;
    this.data.topNote = topNote;
    this.data.octaveShift = octaveShift;
    this.data.scale = "0,2,4,5,7,9,11"; //this.selectScale.value;
    this.data.ascale = omg.ui.splitInts(this.data.scale);

    var scale = this.data.ascale;

    var noteInScale;
    var frets = [];

    for (var i = bottomNote; i <= topNote; i++) {

        if (i == rootNote)
            frets.rootNote = frets.length;

        if (scale.indexOf((i - rootNote % 12) % 12) > -1) {
            frets.push({
                note: i,
                caption: omg.ui.noteNames[i]
            });
        }
    }

    frets.height = (this.canvas.height - this.topFretTop - this.bottomFretBottom) / frets.length;
    this.frets = frets;

    var notes = this.data.notes;
    for (var i = 0; i < notes.length; i++) {
        //console.log(notes[i].note % this.frets.length);
        // todo, crashes, throws a -1 when lower than rootnote (halfway)
        // notes[i].scaledNote =
        // this.frets[notes[i].note % this.frets.length].note;
    }

    this.drawCanvas();
};


OMGMelodyMaker.prototype.addTimeToNote = function (note, thisNote) {
    var skipCount = 0;
    var skipped = 0;
    var omgmm = this;
    var handle = setInterval(function () {

        if (note.beats < 2 && omgmm.lastNewNote == thisNote) {
            if (skipCount == skipped) {
                note.beats += note.beats < 1 ? 0.25 : 0.5;
                omgmm.drawCanvas();

                skipped = 0;
                skipCount++;
            } else {
                skipped++;
            }
        } else {
            clearInterval(handle);
        }
    }, 225);

};

OMGMelodyMaker.prototype.doneTouching = function () {
    this.lastNewNote = Date.now();
    this.frets.touching = -1;
    if (this.part.osc) {
        this.part.osc.frequency.setValueAtTime(0,
                this.player.context.currentTime);
        /*var omgmm = this;
         this.cancelOscTimeout = setTimeout(function () {
         if (omgmm.part.osc) {
         omgmm.part.osc.stop(0);
         //todo this should be in the player!
         omgmm.part.osc.disconnect(omgmm.part.gain);
         omgmm.part.gain.disconnect(omgmm.part.panner);
         if (omgmm.part.delay) {
         omgmm.part.panner.disconnect(omgmm.part.delay);
         omgmm.part.delay.disconnect(omgmm.part.feedback);
         omgmm.part.feedback.disconnect(omgmm.part.delay);
         omgmm.part.delay.disconnect(omgmm.player.context.destination);
         }
         omgmm.part.panner.disconnect(omgmm.player.context.destination);
         
         omgmm.part.oscStarted = false;
         omgmm.part.osc = null;
         }
         }, 2000);*/
    }


    this.buttonTouched = undefined;
    this.drawCanvas();
};

OMGMelodyMaker.prototype.updateOffsets = function () {
    this.offsets = omg.ui.totalOffsets(this.canvas);
};

OMGMelodyMaker.prototype.setSize = function (width, height) {
    var canvas = this.canvas;
    canvas.height = height;
    canvas.width = width;
    canvas.style.height = height + "px";

    if (this.frets) {
        this.frets.height =
                (this.canvas.height - this.topFretTop - this.bottomFretBottom) / this.frets.length;
        this.drawCanvas();
    }

};


OMGMelodyMaker.prototype.onDisplay = function () {
    var omgmm = this;

    if (!this.hasBeenShown) {
        this.hasBeenShown = true;

        var canvas = this.canvas;
        canvas.mode = "APPEND";
        canvas.bottomRow = [];

        canvas.restButtonRow = [];
        canvas.noteButtonRow = [];
        canvas.removeButtonRow = [{button: true, text: "Remove Note", width: 120}];

        canvas.removeButtonRow[0].onclick = function () {
            for (var inote = 0; inote < omgmm.part.data.notes.length; inote++) {

                if (omgmm.part.data.notes[inote] == omgmm.noteSelecting) {
                    omgmm.part.data.notes.splice(inote, 1);
                    break;
                }
            }
            omgmm.drawCanvas();
        };

        canvas.bottomRow.push({button: true, width: 80, text: "Sine Wave"});

        canvas.bottomRow.push({text: "Mode:"});

        var writeButton = {button: true, selected: function () {
                return canvas.mode == "APPEND"
            }, text: "Append"};
        var editButton = {button: true, selected: function () {
                return canvas.mode == "EDIT"
            }, text: "Edit"};
        writeButton.onclick = function () {
            canvas.mode = canvas.mode == "APPEND" ? "EDIT" : "APPEND";
            omgmm.drawCanvas();
        };
        editButton.onclick = writeButton.onclick;
        canvas.bottomRow.push(writeButton);
        canvas.bottomRow.push(editButton);

        canvas.bottomRow.push({text: "Add:"});

        var restButton;
        var restNoteImage;
        var beats;
        var ib = 0;
        for (var iimg = 0; iimg < omg.ui.noteImageUrls.length; iimg++) {
            beats = omg.ui.noteImageUrls[iimg][0];
            restNoteImage = omg.ui.getImageForNote({rest: true, beats: beats});
            noteImage = omg.ui.getImageForNote({rest: false, beats: beats});

            var noteButton = {button: true, image: noteImage};
            canvas.noteButtonRow.push(noteButton);
            noteButton.onclick = (function (beats) {
                return function () {
                    omgmm.noteSelecting.rest = false;
                    omgmm.noteSelecting.beats = beats;
                    omgmm.drawCanvas();
                };
            })(beats);

            var restButton = {button: true, image: restNoteImage};

            restButton.onclick = (function (beats) {
                return function () {
                    omgmm.noteSelecting.rest = true;
                    omgmm.noteSelecting.beats = beats;
                    omgmm.drawCanvas();
                };
            })(beats);
            canvas.restButtonRow.push(restButton);

            if (!(beats % 0.25 == 0)) {
                continue;
            }

            restButton = {button: true, image: restNoteImage};

            restButton.onclick = (function (beats) {
                return function () {
                    omgmm.part.data.notes.push({rest: true, beats: beats});
                    omgmm.drawCanvas();
                };
            })(beats);
            canvas.bottomRow.push(restButton);

        }

        var autoButton = {button: true, selected: function () {
                return omgmm.autoAddRests
            }, text: "auto"};
        autoButton.onclick = function () {
            omgmm.autoAddRests = !omgmm.autoAddRests;
        };
        canvas.bottomRow.push(autoButton);

        canvas.bottomRow.push({text: "Key:"});

        var rootNoteButton = {button: true, width: 30, text: "C"};
        var scaleButton = {button: true, width: 65, text: "Major"};
        canvas.bottomRow.push(rootNoteButton);
        canvas.bottomRow.push(scaleButton);

        this.redoOffsets = true;

        var canvasHeight = canvas.clientHeight; //window.innerHeight - offsetTop - 12 - 38;
        canvas.height = canvasHeight;
        canvas.width = canvas.clientWidth;

        canvas.onmousemove = function (e) {
            e.preventDefault();

            if (omgmm.redoOffsets) {
                omgmm.updateOffsets();
                omgmm.redoOffsets = false;
            }

            var x = e.clientX - omgmm.offsets.left;
            var y = e.clientY + omg.ui.getScrollTop() - omgmm.offsets.top;
            canvas.onmove(x, y);
        };

        canvas.ontouchmove = function (e) {
            e.preventDefault();

            var x = e.targetTouches[0].pageX - omgmm.offsets.left;
            var y = e.targetTouches[0].pageY + omg.ui.getScrollTop() - omgmm.offsets.top;
            canvas.lastX = x;
            canvas.lastY = y;
            canvas.onmove(x, y);
        };

        canvas.onmove = function (x, y) {

            if (omgmm.noteEdittingDialog) {
                omgmm.onmoveInEdittingDialog(x, y);
                return;
            }

            if (y > canvas.height - omgmm.bottomFretBottom) {
                omgmm.moveBottomRow(x);
                return;
            }


            var oldCurrent = omgmm.frets.current;
            var fret = omgmm.frets.length -
                    1 - Math.floor((y - omgmm.topFretTop) / omgmm.frets.height);
            if (fret >= omgmm.frets.length) {
                fret = omgmm.frets.length - 1;
            }

            omgmm.frets.current = fret;

            var note;
            if (canvas.mode == "EDIT") {
                note = omgmm.part.data.notes[
                        Math.floor((x - omg.ui.rawNoteWidth) / omgmm.noteWidth)];
                omgmm.noteEditting = note;
                omgmm.drawCanvas();
                return;
            }

            if (fret > -1 && omgmm.frets.touching > -1) {
                var note = omgmm.data.notes[omgmm.data.notes.length - 1];

                if (omgmm.frets.touching != fret) {

                    var noteNumber = omgmm.frets[fret].note;

                    if (omgmm.part.osc)
                        omgmm.part.osc.frequency.setValueAtTime(
                                omgmm.player.makeFrequency(noteNumber),
                                omgmm.player.context.currentTime);

                    note = {
                        note: fret - omgmm.frets.rootNote,
                        scaledNote: noteNumber,
                        beats: 0.25
                    };
                    omgmm.data.notes.push(note);
                    omgmm.lastNewNote = Date.now();
                    omgmm.addTimeToNote(note, omgmm.lastNewNote);

                    omgmm.frets.touching = fret;
                }

                if (omgmm.welcomeStyle && note) {
                    if (!note.drawData) {
                        note.drawData = [];
                    }
                    note.drawData.push({
                        x: x,
                        y: y,
                        originalX: x,
                        originalY: y
                    });
                }
            }

            if (oldCurrent != omgmm.frets.current) {
                omgmm.drawCanvas();
            }

        };

        canvas.onmouseout = function () {
            omgmm.frets.current = -1;
            omgmm.doneTouching();
        };

        canvas.onmousedown = function (e) {
            e.preventDefault();

            var x = e.clientX - omgmm.offsets.left;
            var y = e.clientY + omg.ui.getScrollTop() - omgmm.offsets.top;
            canvas.ondown(x, y);
        };

        canvas.ontouchstart = function (e) {
            e.preventDefault();

            if (omgmm.redoOffsets) {
                omgmm.updateOffsets();
                omgmm.redoOffsets = false;
            }

            var x = e.targetTouches[0].pageX - omgmm.offsets.left;
            var y = e.targetTouches[0].pageY + omg.ui.getScrollTop() - omgmm.offsets.top;
            canvas.lastX = x;
            canvas.lastY = y;

            canvas.ondown(x, y);
        };

        canvas.ondown = function (x, y) {

            if (omgmm.player && !omgmm.player.playedSound)
                omgmm.player.initSound();

            if (omgmm.animationStarted)
                return;

            if (omgmm.noteEdittingDialog) {
                omgmm.ondownInEdittingDialog(x, y);
                return;
            }

            if (y > canvas.height - omgmm.bottomFretBottom) {
                omgmm.touchingBottomRow(x);
                return;
            }

            clearTimeout(omgmm.cancelOscTimeout);

            var fret = omgmm.frets.length - 1 -
                    Math.floor((y - omgmm.topFretTop) / omgmm.frets.height);
            if (fret >= omgmm.frets.length)
                fret = omgmm.frets.length - 1;

            var noteNumber = omgmm.frets[fret].note;

            var note;

            if (canvas.mode == "EDIT") {
                if (omgmm.noteEditting) {

                    if (fret == omgmm.noteEditting.note + omgmm.frets.rootNote) {
                        omgmm.noteSelecting = omgmm.noteEditting;
                    } else {
                        omgmm.noteEditting.note = fret - omgmm.frets.rootNote;
                        omgmm.noteEditting.scaledNote = noteNumber;
                    }
                }
                return;
            }

            if (omgmm.autoAddRests && omgmm.lastNewNote) {
                var lastNoteTime = Date.now() - omgmm.lastNewNote;

                if (lastNoteTime < 210) {

                } else if (lastNoteTime < 300) {
                    /*note = {
                     rest : true,
                     beats : 0.25
                     };*/
                } else if (lastNoteTime < 450) {
                    note = {
                        rest: true,
                        beats: 0.5
                    };
                } else if (lastNoteTime < 800) {
                    note = {
                        rest: true,
                        beats: 1
                    };
                } else if (lastNoteTime < 1200) {
                    note = {
                        rest: true,
                        beats: 1.5
                    };
                } else if (lastNoteTime < 4000) {
                    note = {
                        rest: true,
                        beats: 2
                    };
                }

                if (note) {
                    omgmm.data.notes.push(note);
                }
            }

            omgmm.frets.touching = fret;


            if (!omgmm.part.osc)
                omgmm.player.makeOsc(omgmm.part);

            if (omgmm.part.osc)
                omgmm.part.osc.frequency.setValueAtTime(omgmm.player
                        .makeFrequency(noteNumber), 0);

            note = {
                note: fret - omgmm.frets.rootNote,
                scaledNote: noteNumber,
                beats: 0.25
            };
            omgmm.data.notes.push(note);

            omgmm.lastNewNote = Date.now();
            var skip = false;

            omgmm.addTimeToNote(note, omgmm.lastNewNote);

            if (omgmm.welcomeStyle) {
                if (!note.drawData) {
                    note.drawData = [];
                }

                if (!omgmm.drawStarted && !omgmm.animationStarted) {
                    omgmm.startDrawCountDown();
                }

                note.drawData.push({
                    x: x,
                    y: y,
                    originalX: x,
                    originalY: y
                });
            } else {
                if (omgmm.hasDataCallback) {
                    omgmm.hasDataCallback();
                }
            }

            omgmm.drawCanvas();
        };

        canvas.onmouseup = function (e) {
            e.preventDefault();

            var x = e.clientX - omgmm.offsets.left;
            var y = e.clientY + omg.ui.getScrollTop() - omgmm.offsets.top;
            canvas.onup(x, y);

        };

        canvas.ontouchend = function (e) {
            e.preventDefault();

            //var x = e.targetTouches[0].pageX - omgmm.offsets.left;
            //var y = e.targetTouches[0].pageY + omg.ui.getScrollTop() - omgmm.offsets.top;
            canvas.onup(canvas.lastX, canvas.lastY);

        };

        canvas.onup = function (x, y) {

            if (omgmm.noteEdittingDialog) {
                omgmm.onupInEdittingDialog(x, y);
                omgmm.noteEdittingDialog = undefined;
                omgmm.noteSelecting = undefined;
                omgmm.noteEditting = undefined;
                omgmm.drawCanvas();
                return;
            }

            if (y > canvas.height - omgmm.bottomFretBottom) {
                omgmm.finishBottomRow(x);
            } else {
                if (canvas.mode == "EDIT" && omgmm.noteEditting &&
                        omgmm.noteEditting == omgmm.noteSelecting) {

                    omgmm.noteEdittingDialog = {note: omgmm.noteSelecting};

                    //omgmm.noteSelecting = undefined;
                }

            }

            omgmm.doneTouching();

        };
    }

    this.setupFretBoard();
};

OMGMelodyMaker.prototype.touchingBottomRow = function (x) {
    var row = this.canvas.bottomRow;
    for (var ib = 0; ib < row.length; ib++) {
        if (row[ib].button && row[ib].leftX < x && row[ib].rightX > x) {
            this.buttonTouched = row[ib];
            break;
        }
    }
    this.drawCanvas();
};

OMGMelodyMaker.prototype.moveBottomRow = function (x) {
    var button;
    var row = this.canvas.bottomRow;
    for (var ib = 0; ib < row.length; ib++) {
        if (row[ib].button && row[ib].leftX < x && row[ib].rightX > x) {
            button = row[ib];
            break;
        }
    }
    if (!(button && this.buttonTouched && button == this.buttonTouched)) {
        this.buttonTouched = undefined;
    }
    this.drawCanvas();
};

OMGMelodyMaker.prototype.finishBottomRow = function (x) {
    var button;
    var row = this.canvas.bottomRow;
    for (var ib = 0; ib < row.length; ib++) {
        if (row[ib].button && row[ib].leftX < x && row[ib].rightX > x) {
            button = row[ib];
            break;
        }
    }

    if (button && this.buttonTouched && button == this.buttonTouched) {
        if (button.onclick) {
            button.onclick();
        }
    }
    this.buttonTouched = undefined;
    this.drawCanvas();
};


OMGMelodyMaker.prototype.ondownInEdittingDialog = function (x, y) {
    var button;
    var row;
    var rows = [this.canvas.noteButtonRow, this.canvas.restButtonRow, this.canvas.removeButtonRow];
    for (var ir = 0; ir < rows.length; ir++) {
        row = rows[ir];

        for (var ib = 0; ib < row.length; ib++) {
            if (row[ib].button && row[ib].leftX < x && row[ib].rightX > x &&
                    row[ib].topY < y && row[ib].bottomY > y) {
                this.buttonTouched = row[ib];
                break;
            }
        }
    }
    this.drawCanvas();
};

OMGMelodyMaker.prototype.onmoveInEdittingDialog = function (x, y) {
    var button;
    var row;
    var rows = [this.canvas.noteButtonRow, this.canvas.restButtonRow, this.canvas.removeButtonRow];
    for (var ir = 0; ir < rows.length; ir++) {
        row = rows[ir];
        for (var ib = 0; ib < row.length; ib++) {
            if (row[ib].button && row[ib].leftX < x && row[ib].rightX > x &&
                    row[ib].topY < y && row[ib].bottomY > y) {
                button = row[ib];
                break;
            }
        }
    }
    if (!(button && this.buttonTouched && button == this.buttonTouched)) {
        this.buttonTouched = undefined;
    }
    this.drawCanvas();
};


OMGMelodyMaker.prototype.onupInEdittingDialog = function (x, y) {
    var button;
    var row;
    var rows = [this.canvas.noteButtonRow, this.canvas.restButtonRow, this.canvas.removeButtonRow];
    for (var ir = 0; ir < rows.length; ir++) {
        row = rows[ir];

        for (var ib = 0; ib < row.length; ib++) {

            if (row[ib].button && row[ib].leftX < x && row[ib].rightX > x &&
                    row[ib].topY < y && row[ib].bottomY > y) {
                button = row[ib];
                break;
            }
        }
    }

    if (button && this.buttonTouched && button == this.buttonTouched) {
        if (button.onclick) {
            button.onclick();
        }
    }
    this.buttonTouched = undefined;
    this.drawCanvas();
};


OMGMelodyMaker.prototype.startDrawCountDown = function () {
    this.drawStarted = Date.now();

    var secondsToGo = 4;


    var opacity = 0;

    var omgmm = this;

    var now;
    var fadeInterval = setInterval(function countdown() {
        now = Date.now() - omgmm.drawStarted;

        if (now < 2000) {
            opacity = Math.min(1, now / 2000);
        } else {
            opacity = Math.min(1, (now - 2000) / 2000);
        }

        if (now >= 4000) {
            omgmm.drawStarted = 0;

            clearInterval(fadeInterval);
            omgmm.doneTouching();
            omgmm.animateDrawing();
        } else {
            // omg.gettingStartedCountdown.innerHTML = 4 - Math.floor(now /
            // 1000);
        }

        omgmm.drawCanvas();

    }, 1000 / 60);
};

OMGMelodyMaker.prototype.drawGettingStartedLines = function (canvas, context) {

    if (!this.animationStarted)
        context.lineWidth = 4;
    else {
        context.lineWidth = 4 * (1 - ((Date.now() - this.animationStarted) / this.animationLength));
    }

    context.beginPath();
    var note;
    for (var i = 0; i < this.data.notes.length; i++) {
        note = this.data.notes[i];

        if (!note.drawData)
            continue;

        for (var j = 0; j < note.drawData.length; j++) {

            if (j == 0) {
                context.moveTo(note.drawData[j].x, note.drawData[j].y);
                if (note.drawData.length == 1) {
                    context.lineTo(note.drawData[j].x, note.drawData[j].y + 5);
                }
            } else {
                context.lineTo(note.drawData[j].x, note.drawData[j].y);
            }
        }

    }
    context.stroke();
    context.closePath();
};

OMGMelodyMaker.prototype.animateDrawing = function () {
    this.animationLength = 700;
    if (typeof (bam) == "object" && bam.animLength)
        this.animationLength = bam.animLength;

    var canvas = this.canvas;
    var context = canvas.getContext("2d");

    var animationStarted = Date.now();
    this.animationStarted = animationStarted;
    var now;
    var nowP;
    var i;
    var j;
    var notes = this.data.notes;
    var noteCount = notes.length;
    var drawData;
    var startX;
    var finishX;
    var dx;
    var dx2;

    var noteWidth = omg.ui.rawNoteWidth;
    if (noteWidth * (noteCount + 2) > canvas.width) {
        noteWidth = canvas.width / (noteCount + 2);
    }
    var omgmm = this;
    var animateInterval = setInterval(function () {

        now = Date.now() - omgmm.animationStarted;
        nowP = now / omgmm.animationLength;

        for (i = 0; i < noteCount; i++) {
            drawData = notes[i].drawData;

            if (!drawData)
                continue;

            for (j = 0; j < drawData.length; j++) {
                startX = drawData[j].originalX;
                finishX = (i + 1) * noteWidth;

                dx = startX - finishX;
                dx2 = dx - omg.ui.rawNoteWidth * 0.58;
                drawData.x = startX - dx * nowP;
                drawData[j].x = startX - dx2 * nowP;
                drawData[j].y = drawData[j].originalY;// - 10 * nowP;
            }

        }

        if (now >= omgmm.animationLength) {
            for (i = 0; i < noteCount; i++) {
                delete notes[i].drawData;
            }

            omgmm.welcomeStyle = false;
            clearInterval(animateInterval);
            omgmm.animationStarted = 0;

            if (omgmm.hasDataCallback) {
                omgmm.hasDataCallback();
            }

            if (!omgmm.player.playing) {
                //var newSong = omgmm.player.makeOMGSong(omgmm.part);
                omgmm.player.play();
            }

        }

        omgmm.drawCanvas();

    }, 1000 / 60);
};

OMGMelodyMaker.prototype.refresh = function (part, welcomeStyle) {
    //todo check the key and scale?
    this.drawCanvas();
};

OMGMelodyMaker.prototype.setPart = function (part, welcomeStyle) {

    this.part = part;
    this.data = part.data;
    this.lastNewNote = 0;
    //this.captionsAreSetup = false;

    if (this.data.notes.length == 0) {
        this.canvas.mode = "APPEND";
    } else {
        this.canvas.mode = "EDIT";
    }

    var visibility;
    this.welcomeStyle = welcomeStyle;
    if (welcomeStyle) {
        this.playAfterAnimation = true;
        this.drawnOnce = false;
    }

    var type = part.data.type;

    if (type == "BASSLINE") {
        this.bottomNote = 19;
        this.topNote = 39;
    } else {
        this.bottomNote = 39;
        this.topNote = 70;
    }

    this.offsets = omg.ui.totalOffsets(this.canvas);

    var mm = this;

    if (omg.ui.noteImages) {
        this.onDisplay();
        this.drawCanvas();
    } else {
        var attempts = 0;
        var attemptHandle = setInterval(function () {
            console.log("Still haven't downloaded note images!");
            if (omg.ui.noteImages) {
                mm.onDisplay();
                mm.drawCanvas();
                clearInterval(attemptHandle);
            } else if (attempts > 20) {
                clearInterval(attemptHandle);
            }
            attempts++;
        }, 100);
    }
};

function OMGDragAndDropHelper() {

    // caller hooks
    this.ondrag = function (div, x, y) {
        return true; // return false to manually handle dragging
    };
    this.onstartnewlevel = function () {};
    this.onshortclick = function (div) {};

    this.longClickTimeMS = 250;
    this.children = [];
}

OMGDragAndDropHelper.prototype.disable = function () {
    this.children.forEach(function (div) {
        div.onmousedown = undefined;
        div.ontouchstart = undefined;
    });
};

OMGDragAndDropHelper.prototype.setupChildDiv = function (div) {

    this.children.push(div);
    ddh = this;
    div.omgdd = {dragLevel: 0};

    div.onmousedown = function (event) {
        event.preventDefault();
        ddh.ondown(div, event.clientX, event.clientY);
    };
    div.ontouchstart = function (event) {
        event.preventDefault();
        ddh.ondown(div, event.targetTouches[0].pageX, event.targetTouches[0].pageY);
    };

    div.omgdd.parentOffsets = omg.ui.totalOffsets(div.parentElement);

    div.omgdd.onclick = div.onclick;
    div.onclick = undefined;
};

OMGDragAndDropHelper.prototype.ondown = function (div, x, y) {

    var ddh = this;
    var divdd = div.omgdd;

    divdd.dragLevel = 1; // 0 for off, 1 for short click then drag, 2 for long click and drag

    divdd.firstX = x;
    divdd.lastX = x;
    divdd.lastY = y;

    divdd.doClick = true;

    ddh.onstartnewlevel(div);

    // sense for a long click, and then move the drag level up and cancel the click
    divdd.downTimeout = setTimeout(function () {

        divdd.doClick = false;

        if (Math.abs(divdd.lastX - divdd.firstX) < 15) {

            divdd.dragLevel = 2;
            ddh.onstartnewlevel(div);
        }

    }, ddh.longClickTimeMS);


    div.parentElement.onmousemove = function (event) {
        ddh.onmove(div, event.clientX, event.clientY);
    };
    div.parentElement.ontouchmove = function (e) {
        ddh.onmove(div, e.targetTouches[0].pageX, e.targetTouches[0].pageY);
    };
    div.parentElement.ontouchend = function () {
        ddh.onmouseup(div);
    };
    div.parentElement.onmouseup = function () {
        ddh.onup(div);
    };

};


OMGDragAndDropHelper.prototype.onmove = function (div, x, y) {

    var px = (x - div.omgdd.parentOffsets.left) / div.parentElement.clientWidth;
    var py = (y - div.omgdd.parentOffsets.top) / div.parentElement.clientHeight;
    if (this.ondrag(div, x, y, px, py)) {
        div.omgdd.resetZ = true;
        div.style.zIndex = "1";
        div.style.left = div.offsetLeft + x - div.omgdd.lastX + "px";
        div.style.top = div.offsetTop + y - div.omgdd.lastY + "px";
    }

    div.omgdd.lastX = x;
    div.omgdd.lastY = y;
};

OMGDragAndDropHelper.prototype.onup = function (div) {

    div.omgdd.dragLevel = 0;

    if (div.omgdd.resetZ) {
        div.style.zIndex = "0";
    }
    div.parentElement.onmousemove = undefined;
    div.parentElement.ontouchmove = undefined;
    div.parentElement.ontouchend = undefined;
    div.parentElement.onmouseup = undefined;

    if (!div.omgdd.doClick)
        return;

    clearTimeout(div.omgdd.downTimeout);

    this.onshortclick(div);
    //div.omgdd.onclick();
};

