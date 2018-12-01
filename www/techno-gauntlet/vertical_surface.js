if (typeof omg != "object")
    omg = {};

if (!omg.ui)
    omg.ui = {};

omg.ui.omgUrl = ""; // omg-music/";

omg.ui.noteImageUrls = [[2, "note_half", "note_rest_half"],
    [1.5, "note_dotted_quarter", "note_rest_dotted_quarter"],
    [1, "note_quarter", "note_rest_quarter"],
    [0.75, "note_dotted_eighth", "note_rest_dotted_eighth"],
    [0.5, "note_eighth", "note_rest_eighth"], //, "note_eighth_upside"],
    [0.375, "note_dotted_sixteenth", "note_rest_dotted_sixteenth"],
    [0.25, "note_sixteenth", "note_rest_sixteenth"], //, "note_sixteenth_upside"],
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

omg.ui.keys = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
    
omg.ui.scales = [{name: "Major", value: [0, 2, 4, 5, 7, 9, 11]},
        {name: "Minor", value: [0, 2, 3, 5, 7, 8, 10]},
        {name: "Pentatonic", value: [0, 2, 5, 7, 9]},
        {name: "Blues", value: [0, 3, 5, 6, 7, 10]}];

omg.ui.getKeyCaption = function (keyParameters) {
    var scaleName = "Major";
    if (keyParameters && keyParameters.scale) {
        omg.ui.scales.forEach(function (scale) {
            if (scale.value.join() == keyParameters.scale.join())
                scaleName = scale.name;
        });
    }
    return omg.ui.keys[(keyParameters.rootNote || 0)] + " " + scaleName;
};


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


omg.ui.getImageForNote = function (note, highContrast) {

    var index = (note.rest ? 2 : 0) + (highContrast ? 1 : 0)
    var draw_noteImage = omg.ui.noteImages[8][index];
    if (note.beats == 2.0) {
        draw_noteImage = omg.ui.noteImages[0][index];
    }
    if (note.beats == 1.5) {
        draw_noteImage = omg.ui.noteImages[1][index];
    }
    if (note.beats == 1.0) {
        draw_noteImage = omg.ui.noteImages[2][index];
    }
    if (note.beats == 0.75) {
        draw_noteImage = omg.ui.noteImages[3][index];
    }
    if (note.beats == 0.5) {
        draw_noteImage = omg.ui.noteImages[4][index];
    }
    if (note.beats == 0.375) {
        draw_noteImage = omg.ui.noteImages[5][index];
    }
    if (note.beats == 0.25) {
        draw_noteImage = omg.ui.noteImages[6][index];
    }
    if (note.beats == 0.125) {
        draw_noteImage = omg.ui.noteImages[7][index];
    }

    return draw_noteImage;

};

omg.ui.getNoteImageUrl = function (i, j, highContrast) {
    var fileName = omg.ui.noteImageUrls[i][j];
    if (fileName) {
        return "img/notes/" + (highContrast ? "w_" : "") + fileName + ".png";
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
        if (loadedNotes == omg.ui.noteImageUrls.length * 4) {
            omg.ui.noteImages = noteImages;
        }
    };

    for (var i = 0; i < omg.ui.noteImageUrls.length; i++) {

        var noteImage = new Image();
        noteImage.onload = areAllNotesLoaded;
        noteImage.src = omg.ui.omgUrl + omg.ui.getNoteImageUrl(i, 1);

        var noteWhiteImage = new Image();
        noteWhiteImage.onload = areAllNotesLoaded;
        noteWhiteImage.src = omg.ui.omgUrl + omg.ui.getNoteImageUrl(i, 1, true);

        var restImage = new Image();
        restImage.onload = areAllNotesLoaded;
        restImage.src = omg.ui.omgUrl + omg.ui.getNoteImageUrl(i, 2);
        
        var restWhiteImage = new Image();
        restWhiteImage.onload = areAllNotesLoaded;
        restWhiteImage.src = omg.ui.omgUrl + omg.ui.getNoteImageUrl(i, 2, true);

        var imageBundle = [noteImage, noteWhiteImage, restImage, restWhiteImage];
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

omg.ui.getChordText = function (chord, ascale) {
    while (chord < 0) {
        chord += ascale.length;
    }
    while (chord >=  ascale.length) {
        chord -= ascale.length;
    }
    var chordInterval = ascale[chord];
    if (chordInterval === 0) {
        return "I";
    }
    else if (chordInterval === 2) return "II";
    else if (chordInterval === 3 || chordInterval === 4) return "III";
    else if (chordInterval === 5) return "IV";
    else if (chordInterval === 6) return "Vb";
    else if (chordInterval === 7) return "V";
    else if (chordInterval === 8 || chordInterval === 9) return "VI";
    else if (chordInterval === 10 || chordInterval === 11) return "VII";
    return "?";
}

omg.ui.getChordProgressionText = function (section) {
    var chordsText = "";
    if (section.data.chordProgression) {
        var chords = section.data.chordProgression;
        for (var i = 0; i < chords.length; i++) {
            if (i > 0) {
                chordsText += " - ";
            }
            chordsText += omg.ui.getChordText(chords[i], section.data.ascale);
        }
    }  
    return chordsText;
};


omg.ui.setupNoteImages();


function OMGMelodyMaker(canvas, part, player) {
    this.canvas = canvas;
    this.bottomFretBottom = 30;
    this.topFretTop = 10;
    this.instrument = "Sine Wave";
    this.selectedColor = "#4fa5d5";
    this.autoAddRests = true;
    this.player = player;
    
    this.highContrast = true;
    this.backgroundColor = "white";
    this.color = "black";
    
    this.touchingXSection = -1;
    this.touches = [];
    this.notes = [];

    if (part)
        this.setPart(part);
    
    this.setCanvasEvents();
}

OMGMelodyMaker.prototype.drawCanvas = function () {
    var canvas = this.canvas;

    var backgroundAlpha = 1;

    var frets = this.frets;
    var fretHeight = frets.height;

    var canvas = this.canvas;
    var context = canvas.getContext("2d");

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
 
    context.fillStyle = this.highContrast ? this.color : this.backgroundColor;
    context.fillRect(0, this.topFretTop, canvas.width,
            canvas.height - this.bottomFretBottom - this.topFretTop);

    var subbeats = this.part.section.song.data.beatParameters.subbeats;
    this.beatWidth = canvas.width / (
            subbeats * 
            this.part.section.song.data.beatParameters.beats * 
            this.part.section.song.data.beatParameters.measures);
    

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
    this.restHeight = canvas.height / 2 - noteHeight / 2;

    // for ontouch
    this.noteWidth = noteWidth;
    this.noteHeight = noteHeight;

    context.lineWidth = 1;
    context.fillStyle = this.highContrast ? this.backgroundColor : this.color;
    
    if (this.touchingXSection > -1) {
        context.fillStyle = "#808080";
        context.fillRect(this.touchingXSection * this.canvas.width / 4, this.topFretTop,
                    this.canvas.width / 4, this.canvas.height - this.bottomFretBottom - this.topFretTop);
    }

    var edittingSelected = false;
    var ii;

    var note;
    var y;

    var playingI = this.part.currentI - 1;
    var notes = this.part.data.notes;

    var fret;
    for (var i = 0; i < this.touches.length; i++) {
        fret = this.touches[i].fret;
        ii = frets.length - fret;
        context.fillStyle = "#707070";
        context.fillRect(0, this.topFretTop + (ii - 1)* fretHeight, canvas.width, fretHeight);
    }

    context.font = "12px sans-serif";
    context.lineWidth = "2px";
    context.strokeStyle = this.highContrast ? this.backgroundColor : this.color;
    context.beginPath();
    context.moveTo(0, this.topFretTop);
    context.lineTo(canvas.width, this.topFretTop);
    for (var i = 0; i < frets.length; i++) {    
        ii = frets.length - i;
        
        if (frets[i].octaveMarker) {
            context.fillStyle = "#333333";
            context.fillRect(canvas.width / 4, this.topFretTop + (ii - 1) * fretHeight,
             canvas.width / 2, fretHeight);
        }
        
        if (frets.current !== undefined && frets.current === i) {
        }
        context.moveTo(0, this.topFretTop + ii * fretHeight);
        context.lineTo(canvas.width, this.topFretTop + ii * fretHeight);
        context.fillStyle = this.highContrast ? this.backgroundColor : this.color;
        context.fillText(frets[i].caption, 4, this.topFretTop + ii * fretHeight - fretHeight / 3);

    }

    for (i = 1; i < 4; i++) {
        context.moveTo(i * canvas.width / 4, this.topFretTop);
        context.lineTo(i * canvas.width / 4, canvas.height - this.bottomFretBottom);
    }
    context.stroke();
    context.closePath();

    var selectedX;
    var selectedY;
    var x;

    this.setupNotesInfo();
    //this.drawNotes();
    
    for (var i = 0; i < this.notesInfo.length; i++) {
        context.drawImage(this.notesInfo[i].image, this.notesInfo[i].x, this.notesInfo[i].y);

        if (playingI == i) {
            context.fillStyle = "#4fa5d5";

            note = notes[playingI];

            var oldAlpha = context.globalAlpha;
            context.globalAlpha = 0.4;
            context.fillRect(this.notesInfo[i].x,
                    this.notesInfo[i].y, this.noteWidth,
                    noteHeight);
            context.globalAlpha = oldAlpha;
        }

        if (this.noteEditting === note && edittingSelected) {
            context.fillStyle = "orange";
            context.fillRect(x, y, noteWidth, noteImage.height);
            selectedX = x + noteWidth;
            selectedY = y + noteImage.height;
        }

        if (this.noteHovering === this.notesInfo[i].note || 
                this.edittingNoteInfo && this.notesInfo[i].note === this.edittingNoteInfo.note) {
            context.strokeRect(this.notesInfo[i].x, this.notesInfo[i].y, 
                this.noteWidth, this.noteHeight);
        }

    }

    if (this.noteEdittingDialog) {
        this.drawNoteEdittingDialog(canvas, context);
    }
};

OMGMelodyMaker.prototype.setupNotesInfo = function () {
    var beatsUsed = 0;
    this.notesInfo = [];
    var noteInfo;
    for (var i = 0; i < this.data.notes.length; i++) {
        noteInfo = {note: this.data.notes[i]};
        noteInfo.image = omg.ui.getImageForNote(noteInfo.note, this.highContrast);

        if (noteInfo.note.rest) {
            noteInfo.y = this.restHeight;
        } else {
            noteInfo.y = this.topFretTop +
                    (this.frets.length - this.data.notes[i].note - this.frets.rootNote - 1)
                    * this.frets.height
                    + this.frets.height * 0.5
                    - noteInfo.image.height * 0.75;
        }

        noteInfo.x = this.noteWidth + beatsUsed * this.beatParameters.subbeats * this.beatWidth; //i * noteWidth + noteWidth;

        beatsUsed += noteInfo.note.beats;
        this.notesInfo.push(noteInfo);
    }    
};

OMGMelodyMaker.prototype.drawNoteEdittingDialog = function (canvas, context) {

    var x = this.edittingNoteInfo.x;
    var y = this.edittingNoteInfo.y + this.noteHeight;
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
    var keyParameters = this.part.section.song.data.keyParameters;
    var soundSet = this.data.soundSet;
    var rootNote;
    var bottomNote;
    var topNote;
    var octave;
    var chromatic = soundSet.chromatic;
    this.chromatic = chromatic;
    if (chromatic) {
        rootNote = keyParameters.rootNote;
        bottomNote = soundSet.lowNote;
        topNote = soundSet.highNote;
        if (!topNote && soundSet.data && soundSet.data.length) {
            topNote = bottomNote + soundSet.data.length - 1;
        }
        octave = soundSet.octave;
    }
    else {
        rootNote = 0;
        bottomNote = 0;
        topNote = soundSet.data.length - 1;
        octave = 0;
    }

    var scale = keyParameters.scale; 

    var frets = [];

    for (var i = bottomNote; i <= topNote; i++) {

        if (i == rootNote + octave * 12)
            frets.rootNote = frets.length;

        if (!chromatic || scale.indexOf((i - rootNote % 12) % 12) > -1) {
            frets.push({
                note: i,
                caption: chromatic ? omg.ui.noteNames[i] : soundSet.data[i].name,
                octaveMarker: chromatic && i % 12 === rootNote
            });
        }
    }

    if (frets.rootNote === undefined) {
        frets.rootNote = 0;
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


OMGMelodyMaker.prototype.doneTouching = function () {
    
    this.player.endLiveNotes(this.part);

    this.frets.touching = -1;
    this.buttonTouched = undefined;
    this.touchingXSection = -1;
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
        this.mode = "APPEND";
        canvas.bottomRow = [];

        canvas.restButtonRow = [];
        canvas.noteButtonRow = [];
        canvas.removeButtonRow = [{button: true, text: "Remove Note", width: 120}];

        canvas.removeButtonRow[0].onclick = function () {
            for (var inote = 0; inote < omgmm.part.data.notes.length; inote++) {

                if (omgmm.part.data.notes[inote] == omgmm.edittingNoteInfo.note) {
                    omgmm.part.data.notes.splice(inote, 1);
                    break;
                }
            }
            omgmm.drawCanvas();
        };

        //canvas.bottomRow.push({button: true, width: 80, text: "Sine Wave"});

        canvas.bottomRow.push({text: "Mode:"});

        var writeButton = {button: true, selected: function () {
                return omgmm.mode == "APPEND"
            }, text: "Append"};
        var editButton = {button: true, selected: function () {
                return omgmm.mode == "EDIT"
            }, text: "Edit"};
        writeButton.onclick = function () {
            omgmm.mode = omgmm.mode == "APPEND" ? "EDIT" : "APPEND";
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
        for (var iimg = 0; iimg < omg.ui.noteImageUrls.length - 1; iimg++) {
            beats = omg.ui.noteImageUrls[iimg][0];
            restNoteImage = omg.ui.getImageForNote({rest: true, beats: beats});
            noteImage = omg.ui.getImageForNote({rest: false, beats: beats});

            var noteButton = {button: true, image: noteImage};
            canvas.noteButtonRow.push(noteButton);
            noteButton.onclick = (function (beats) {
                return function () {
                    omgmm.edittingNoteInfo.note.rest = false;
                    omgmm.edittingNoteInfo.note.beats = beats;
                    omgmm.drawCanvas();
                };
            })(beats);

            var restButton = {button: true, image: restNoteImage};

            restButton.onclick = (function (beats) {
                return function () {
                    omgmm.edittingNoteInfo.note.rest = true;
                    omgmm.edittingNoteInfo.note.beats = beats;
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
        
        this.redoOffsets = true;

        var canvasHeight = canvas.clientHeight; //window.innerHeight - offsetTop - 12 - 38;
        canvas.height = canvasHeight;
        canvas.width = canvas.clientWidth;

    }

    this.setupFretBoard();
};

OMGMelodyMaker.prototype.setCanvasEvents = function () {
    var canvas = this.canvas;
    var omgmm = this;

    canvas.onmousedown = function (e) {
        e.preventDefault();
        
        omgmm.isMouseTouching = true;

        omgmm.mouseTouch = {x: e.clientX - omgmm.offsets.left, 
            y: e.clientY + omg.ui.getScrollTop() - omgmm.offsets.top, 
            identifier: "mouse"
        };
        omgmm.ondown(omgmm.mouseTouch);
    };

    canvas.onmousemove = function (e) {
        e.preventDefault();

        if (omgmm.redoOffsets) {
            omgmm.updateOffsets();
            omgmm.redoOffsets = false;
        }

        var x = e.clientX - omgmm.offsets.left;
        var y = e.clientY + omg.ui.getScrollTop() - omgmm.offsets.top;

        if (omgmm.isMouseTouching) {
            omgmm.mouseTouch.x = x;
            omgmm.mouseTouch.y = y;
            omgmm.onmove(omgmm.mouseTouch);
        }
        else {
            if (omgmm.mode === "EDIT") {
                omgmm.onhoverInEditMode(x, y);
            }
        }        
    };
    
    canvas.onmouseout = function () {
        if (omgmm.isMouseTouching) {
            omgmm.isMouseTouching = false;
            omgmm.doneTouching();
        }
    };

    canvas.onmouseup = function (e) {
        e.preventDefault();
        if (omgmm.isMouseTouching) {
            omgmm.isMouseTouching = false;
            omgmm.onup(omgmm.mouseTouch);
        }
    };

    canvas.ontouchstart = function (e) {
        e.preventDefault();

        if (omgmm.redoOffsets) {
            omgmm.updateOffsets();
            omgmm.redoOffsets = false;
        }

        for (var i = 0; i < e.changedTouches.length; i++) {
            omgmm.ondown({x: e.changedTouches[i].pageX - omgmm.offsets.left,
                    y: e.changedTouches[i].pageY + omg.ui.getScrollTop() - omgmm.offsets.top,
                    identifier: e.changedTouches[i].identifier});
        }
    };

    canvas.ontouchmove = function (e) {
        e.preventDefault();

        for (var i = 0; i < e.changedTouches.length; i++) {
            for (var j = 0; j < omgmm.touches.length; j++) {
                var touch = omgmm.touches[j];
                if (e.changedTouches[i].identifier === touch.identifier) {
                    touch.lastX = touch.x;
                    touch.lastY = touch.y;
                    touch.x = e.changedTouches[i].pageX - omgmm.offsets.left;
                    touch.y = e.changedTouches[i].pageY + omg.ui.getScrollTop() - omgmm.offsets.top;
                    omgmm.onmove(touch);
                    break;
                }
            }
        }
    };

    canvas.ontouchend = function (e) {
        e.preventDefault();
        for (var i = 0; i < e.changedTouches.length; i++) {
            for (var j = 0; j < omgmm.touches.length; j++) {;
                if (e.changedTouches[i].identifier === omgmm.touches[j].identifier) {
                    omgmm.onup(omgmm.touches[j]);
                    break;
                }
            }
        }
    };

}

OMGMelodyMaker.prototype.ondown = function (touch) {
    if (this.mode === "EDIT") {
        return this.ondownInEditMode(touch);
    }
    else if (this.mode === "ZOOM") {
        return this.ondownInZoomMode(touch);
    }
    else {
        this.ondownInWriteMode(touch)
    }
};


OMGMelodyMaker.prototype.onmove = function (touch) {
    if (this.mode === "EDIT") {
        return this.onmoveInEditMode(touch);
    }
    else if (this.mode === "ZOOM") {
        return this.onmoveInZoomMode(touch);
    }
    else {
        this.onmoveInWriteMode(touch)
    }
};

OMGMelodyMaker.prototype.onup = function (touch) {
    if (this.mode === "EDIT") {
        return this.onupInEditMode(touch);
    }
    else if (this.mode === "ZOOM") {
        return this.onupInZoomMode(touch);
    }
    else {
        this.onupInWriteMode(touch)
    }

    var touchIndex = this.touches.indexOf(touch);
    this.touches.splice(touchIndex, 1);
};    

OMGMelodyMaker.prototype.ondownInWriteMode = function (touch) {
    //auto play policy?
    //if (omgmm.player && !omgmm.player.playedSound) omgmm.player.initSound();
    
    var fret = this.getFret(touch.y);
    var noteNumber = this.frets[fret].note;

    var note = {
        note: fret - this.frets.rootNote,
        scaledNote: noteNumber,
        beats: 0.25
    };

    touch.fret = fret;
    var xsection = Math.floor(touch.x / (this.canvas.width / 4));
    touch.xsection = xsection;
    touch.note = note;

    this.touches.push(touch);
    this.notes.push(note);    
    this.setTouchingXSection();
        
    this.player.playLiveNotes(this.notes, this.part, 0);

    this.drawCanvas();
    this.part.saved = false;

};

OMGMelodyMaker.prototype.onmoveInWriteMode = function (touch) {

    var fret = this.getFret(touch.y);
    var xsection = Math.floor(touch.x / (this.canvas.width / 4));

    if (fret !== touch.fret || xsection !== touch.xsection) {

        var noteNumber = this.frets[fret].note;

        touch.xsection = xsection;
        touch.fret = fret;

        this.setTouchingXSection();

        if (this.touchingXSection === 0) {
            this.notes.splice(this.notes.indexOf(touch.note), 1);
            touch.note = {};
            this.notes.push(touch.note);
        }
        touch.note.note = fret - this.frets.rootNote;
        touch.note.scaledNote = noteNumber;
        touch.note.beats = 0.25;

        this.player.playLiveNotes(this.notes, this.part);
        
        this.drawCanvas();
    }
};

OMGMelodyMaker.prototype.onupInWriteMode = function (touch) {

    var noteIndex = this.notes.indexOf(touch.note);
    this.notes.splice(noteIndex, 1);

    this.setTouchingXSection();

    if (this.touches.length === 1) {
        this.doneTouching();
    }
};


OMGMelodyMaker.prototype.ondownInEditMode = function (touch) {
    if (this.noteEdittingDialog) {
        this.ondownInEdittingDialog(touch);
        return;
    }

    var noteInfo = this.noteHitTest(touch.x, touch.y);
    if (noteInfo.note) {
        var fret = this.getFret(touch.y);
        noteInfo.startingFret = fret;
        this.edittingNoteInfo = noteInfo;
        this.edittingNoteInfo.changed = false;
        this.touches.push(touch);
    }
};

OMGMelodyMaker.prototype.onmoveInEditMode = function (touch) {
    if (!this.edittingNoteInfo) {
        return;
    }

    if (this.noteEdittingDialog) {
        this.onmoveInEdittingDialog(touch);
        return;
    }

    var fret = this.getFret(touch.y);
    var diff = fret - this.edittingNoteInfo.startingFret;
    if (!diff) {
        return;
    }

    this.edittingNoteInfo.changed = true;
    var noteNumber = this.frets[fret + diff].note;
    this.edittingNoteInfo.note.note = fret - this.frets.rootNote;
    this.edittingNoteInfo.note.scaledNote = noteNumber;
    this.edittingNoteInfo.startingFret += diff;

    this.drawCanvas();
};

OMGMelodyMaker.prototype.onupInEditMode = function (touch) {
    if (!this.edittingNoteInfo) {
        return;
    }
    
    if (this.noteEdittingDialog) {
        this.onupInEdittingDialog(touch);
        return;
    }

    if (!this.edittingNoteInfo.changed) {
        this.noteEdittingDialog = {note: this.edittingNoteInfo.note};
    }
    else {
        this.edittingNoteInfo = undefined;
    }
    
    this.drawCanvas();
};


OMGMelodyMaker.prototype.onhoverInEditMode = function (x, y) {

    var noteInfo = this.noteHitTest(x, y);
    if (noteInfo.note !== this.noteHovering) {
        this.noteHovering = noteInfo.note;
        this.drawCanvas();
    }
};

OMGMelodyMaker.prototype.getFret = function (y) {
    return Math.max(0, Math.min(this.frets.length - 1,
        this.frets.length - 1 -Math.floor((y - this.topFretTop) / this.frets.height)));
};

OMGMelodyMaker.prototype.noteHitTest = function (x, y) {
    var noteInfo;
    for (var i = 0; i < this.notesInfo.length; i++) {
        noteInfo = this.notesInfo[i];
        if (x >= noteInfo.x && x <= noteInfo.x + this.noteWidth &&
                y >= noteInfo.y && y <= noteInfo.y + this.noteHeight) {
            return noteInfo;
        }
    }
    return {};
}

OMGMelodyMaker.prototype.setTouchingXSection = function () {
    this.touchingXSection = 0;
    for (var t = 0; t < this.touches.length; t++) {
        if (this.touches[t].xsection > this.touchingXSection) {
            this.touchingXSection = this.touches[t].xsection;
        }
    }
    this.notes.autobeat = this.touchingXSection === 1 ? 
        4 : this.touchingXSection === 3 ? 1 : this.touchingXSection;

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


OMGMelodyMaker.prototype.ondownInEdittingDialog = function (touch) {
    var button;
    var row;
    var rows = [this.canvas.noteButtonRow, this.canvas.restButtonRow, this.canvas.removeButtonRow];
    for (var ir = 0; ir < rows.length; ir++) {
        row = rows[ir];

        for (var ib = 0; ib < row.length; ib++) {
            if (row[ib].button && row[ib].leftX < touch.x && row[ib].rightX > touch.x &&
                    row[ib].topY < touch.y && row[ib].bottomY > touch.y) {
                this.buttonTouched = row[ib];
                this.touches.push(touch);
                break;
            }
        }
    }
    this.drawCanvas();
};

OMGMelodyMaker.prototype.onmoveInEdittingDialog = function (touch) {
    var button;
    var row;
    var rows = [this.canvas.noteButtonRow, this.canvas.restButtonRow, this.canvas.removeButtonRow];
    for (var ir = 0; ir < rows.length; ir++) {
        row = rows[ir];
        for (var ib = 0; ib < row.length; ib++) {
            if (row[ib].button && row[ib].leftX < touch.x && row[ib].rightX > touch.x &&
                    row[ib].topY < touch.y && row[ib].bottomY > touch.y) {
                button = row[ib];
                break;
            }
        }
    }
    if (!(button && this.buttonTouched && button == this.buttonTouched)) {
        console.log("tt")
        this.buttonTouched = undefined;
    }
    this.drawCanvas();
};


OMGMelodyMaker.prototype.onupInEdittingDialog = function (touch) {
    var button;
    var row;
    var rows = [this.canvas.noteButtonRow, this.canvas.restButtonRow, this.canvas.removeButtonRow];
    for (var ir = 0; ir < rows.length; ir++) {
        row = rows[ir];

        for (var ib = 0; ib < row.length; ib++) {

            if (row[ib].button && row[ib].leftX < touch.x && row[ib].rightX > touch.x &&
                    row[ib].topY < touch.y && row[ib].bottomY > touch.y) {
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
    
    this.noteEdittingDialog = undefined;
    this.edittingNoteInfo = undefined;

    this.drawCanvas();
};


OMGMelodyMaker.prototype.refresh = function (part, welcomeStyle) {
    //todo check the key and scale?
    this.drawCanvas();
};

OMGMelodyMaker.prototype.setPart = function (part, welcomeStyle) {

    this.part = part;
    this.data = part.data;
    this.beatParameters = part.section.song.data.beatParameters;
    
    if (this.data.notes.length == 0) {
        this.mode = "APPEND";
    } else {
        this.mode = "EDIT";
    }

    var visibility;
    this.welcomeStyle = welcomeStyle;
    if (welcomeStyle) {
        this.playAfterAnimation = true;
        this.drawnOnce = false;
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

