function OMGMelodyMaker(div, part, player) {

    this.bgCanvas = document.createElement("canvas");
    this.bgCanvas.className = "surface-canvas";
    div.appendChild(this.bgCanvas);
    this.beatCanvas = document.createElement("canvas");
    this.beatCanvas.className = "surface-canvas";
    div.appendChild(this.beatCanvas);
    this.canvas = document.createElement("canvas");
    this.canvas.className = "surface-canvas";
    div.appendChild(this.canvas);
    this.context = this.canvas.getContext("2d");
    this.bgContext = this.bgCanvas.getContext("2d");
    this.beatContext = this.beatCanvas.getContext("2d");
    
    this.bottomFretBottom = 0;
    this.topFretTop = 0;
    this.selectedColor = "#4fa5d5";
    this.autoAddRests = true;
    this.player = player;

    this.readOnly = true;
    
    this.highContrast = true;
    this.backgroundColor = "white";
    this.color = "black";
    
    this.touchingXSection = -1;
    this.touches = [];
    this.notes = [];

    this.skipFretsTop = 0;
    this.skipFretsBottom = 0;

    this.mode = "WRITE";
    this.redoOffsets = true;

    this.noteWidth = 25;
    this.noteHeight = 40;

    if (part)
        this.setPart(part);
    
    this.setCanvasEvents();
}

OMGMelodyMaker.prototype.drawBackground = function (w, h) {
    var canvas = this.bgCanvas;
    var context = this.bgContext;
    canvas.width = w || canvas.clientWidth;
    canvas.height = h || canvas.clientHeight;
    this.beatCanvas.width = w || canvas.clientWidth;
    this.beatCanvas.height = h || canvas.clientHeight;
    this.beatContext.globalAlpha = 0.2;
    this.beatContext.fillStyle = "#4fa5d5";
    
    this.beatWidth = canvas.width / (
            this.beatParams.subbeats * 
            this.beatParams.beats * 
            this.beatParams.measures);
    this.restHeight = canvas.height / 2 - this.noteHeight / 2;
    
    this.frets.height = (canvas.height - this.topFretTop - this.bottomFretBottom) / 
            (this.frets.length - this.skipFretsBottom - this.skipFretsTop);

    context.fillStyle = this.highContrast ? this.color : this.backgroundColor;
    context.fillRect(0, this.topFretTop, canvas.width,
            canvas.height - this.bottomFretBottom - this.topFretTop);

    if (!this.readOnly) {
        this.drawFrets();        
    }
};

OMGMelodyMaker.prototype.draw = function (isubbeat, w, h) {

    if (this.hidden) {
        this.bgCanvas.style.display = "block";
        this.canvas.style.display = "block";
        this.beatCanvas.style.display = "block";
        this.hidden = false;
    }

    if (!this.backgroundDrawn) {
        this.drawBackground(w, h);
        this.backgroundDrawn = true;
    }
    
    this.canvas.width = w || this.canvas.clientWidth;
    this.canvas.height = h || this.canvas.clientHeight;

    this.context.globalAlpha = 0.4;
    if (this.touchingXSection > -1) {
        this.context.fillStyle = "#808080";
        this.context.fillRect(this.touchingXSection * this.canvas.width / 4, this.topFretTop,
                    this.canvas.width / 4, this.canvas.height - this.bottomFretBottom - this.topFretTop);
    }
    for (var i = 0; i < this.touches.length; i++) {
        this.context.fillStyle = "#909090";
        this.context.fillRect(0, this.topFretTop + 
                (this.frets.length - this.touches[i].fret - 1 - this.skipFretsTop) * this.frets.height, 
            this.canvas.width, this.frets.height);
    }
    this.context.globalAlpha = 1;
    
    //todo skip this if the notes haven't changed
    this.setupNotesInfo();

    this.context.fillStyle = this.highContrast ? this.backgroundColor : this.color;
    this.context.font = "28pt arial";

    for (var i = 0; i < this.notesInfo.length; i++) {
        if (omg.ui.useUnicodeNotes) {
            this.context.fillText(this.notesInfo[i].text, this.notesInfo[i].x, this.notesInfo[i].y);
        }
        else {
            this.context.drawImage(this.notesInfo[i].image, this.notesInfo[i].x, this.notesInfo[i].y - this.noteHeight * 0.75);
        }

        if (this.mode === "EDIT") {
            if (this.noteHovering === this.notesInfo[i].note || 
                    this.edittingNoteInfo && this.notesInfo[i].note === this.edittingNoteInfo.note) {
                this.context.strokeStyle = this.highContrast ? this.backgroundColor : this.color;
                this.context.strokeRect(this.notesInfo[i].x, this.notesInfo[i].y - 30, 
                    this.noteWidth, this.noteHeight);
            }
        }
    }

    if (this.mode === "EDIT" && this.noteEdittingDialog) {
        this.drawNoteEdittingDialog();
    }
    
    if (this.part.omglive) {
        this.drawOMGLiveUsers();
    }
};

OMGMelodyMaker.prototype.drawFrets = function () {

    this.bgContext.font = "12px sans-serif";
    this.bgContext.lineWidth = "2px";
    this.bgContext.strokeStyle = this.highContrast ? this.backgroundColor : this.color;
    this.bgContext.beginPath();
    this.bgContext.moveTo(0, this.topFretTop);
    this.bgContext.lineTo(this.bgCanvas.width, this.topFretTop);
    for (var i = this.skipFretsBottom; i < this.frets.length - this.skipFretsTop; i++) {    
        ii = this.frets.length - i - this.skipFretsTop;;
        
        if (this.frets[i].octaveMarker) {
            this.bgContext.fillStyle = "#333333";
            this.bgContext.fillRect(Math.round(this.bgCanvas.width / 4), Math.round(this.topFretTop + (ii - 1) * this.frets.height),
                Math.round(this.bgCanvas.width / 2), this.frets.height);
        }
        
        if (this.frets.current !== undefined && this.frets.current === i) {
        }
        this.bgContext.moveTo(0, Math.round(this.topFretTop + ii * this.frets.height));
        this.bgContext.lineTo(this.bgCanvas.width, Math.round(this.topFretTop + ii * this.frets.height));
        this.bgContext.fillStyle = this.highContrast ? this.backgroundColor : this.color;
        this.bgContext.fillText(this.frets[i].caption, 4, 
            Math.round(this.topFretTop + ii * this.frets.height - this.frets.height / 3));

    }

    for (i = 1; i < 4; i++) {
        this.bgContext.moveTo(Math.round(i * this.bgCanvas.width / 4), this.topFretTop);
        this.bgContext.lineTo(Math.round(i * this.bgCanvas.width / 4), this.bgCanvas.height - this.bottomFretBottom);
    }
    this.bgContext.stroke();
    this.bgContext.closePath();    
};


OMGMelodyMaker.prototype.setupNotesInfo = function () {
    var beatsUsed = 0;
    this.notesInfo = [];
    var noteInfo;
    for (var i = 0; i < this.data.notes.length; i++) {
        noteInfo = {note: this.data.notes[i]};
        if (omg.ui.useUnicodeNotes) {
            noteInfo.text = omg.ui.getTextForNote(noteInfo.note);
        }
        else {
            noteInfo.image = omg.ui.getImageForNote(noteInfo.note, this.highContrast);
        }

        if (noteInfo.note.rest) {
            noteInfo.y = this.restHeight;
        } else {
            noteInfo.y = this.topFretTop +
                    (this.frets.length - this.data.notes[i].note - this.frets.rootNote - 1 - this.skipFretsTop)
                    * this.frets.height
                    + this.frets.height * 0.5;
        }

        noteInfo.x = this.noteWidth + beatsUsed * this.beatParams.subbeats * this.beatWidth; //i * noteWidth + noteWidth;

        beatsUsed += noteInfo.note.beats;
        this.notesInfo.push(noteInfo);
    }    
};

OMGMelodyMaker.prototype.drawNoteEdittingDialog = function () {

    if (!this.isEditDialogSetup) {
        this.setupEditDialog();
        this.isEditDialogSetup = true;
    }
    
    var context = this.context;
    var canvas = this.canvas;

    var x = this.edittingNoteInfo.x;
    var y = this.edittingNoteInfo.y + 8;// + this.noteHeight;
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

    context.font = "28pt serif";
    this.drawButtons(this.noteButtonRow, x + 2, y + 4, 240, 40);
    this.drawButtons(this.restButtonRow, x + 2, y + 44, 240, 40);
    context.font = "12pt serif";
    this.drawButtons(this.removeButtonRow, x + 40, y + 100, 240, 40);
};

OMGMelodyMaker.prototype.drawButtons = function (buttonRow, x, y, width, height) {
    var context = this.context;
    var button;
    var buttonWidth, imageWidth;
    var margin = 4;
    var nextLeft = x + margin;
    var ymargin = y + margin;
    var heightmargin = height - margin * 2;
    for (var ibtn = 0; ibtn < buttonRow.length; ibtn++) {
        button = buttonRow[ibtn];
        imageWidth = button.width || (button.image ? button.image.width : 50);
        buttonWidth = imageWidth * 1.33;

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

            if (button.noteImg) {
                context.drawImage(button.noteImg, nextLeft + imageWidth * 0.16,
                        ymargin, imageWidth, heightmargin);
            }

            context.strokeRect(nextLeft, ymargin, buttonWidth, heightmargin);
            if (button.note) {
                context.fillStyle = "black";
                context.fillText(button.note,
                        nextLeft + buttonWidth / 2 - context.measureText(button.note).width / 2 - 7,
                        y + height / 2 + 3 + 11);
            }
            if (button.text) {
                context.fillStyle = "black";
                context.fillText(button.text,
                        nextLeft + buttonWidth / 2 - context.measureText(button.text).width / 2,
                        y + height / 2 + 6);
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
    var keyParams = this.part.section.song.data.keyParams;
    var soundSet = this.data.soundSet;
    var rootNote;
    var bottomNote;
    var topNote;
    var octave;
    var chromatic = soundSet.chromatic;
    this.chromatic = chromatic;
    if (chromatic) {
        rootNote = keyParams.rootNote;
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

    var scale = keyParams.scale; 

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

    this.frets = frets;

    var notes = this.data.notes;
    for (var i = 0; i < notes.length; i++) {
        //console.log(notes[i].note % this.frets.length);
        // todo, crashes, throws a -1 when lower than rootnote (halfway)
        // notes[i].scaledNote =
        // this.frets[notes[i].note % this.frets.length].note;
    }

};


OMGMelodyMaker.prototype.doneTouching = function () {
    
    this.player.endLiveNotes(this.part);
    if (this.onchange) {
        this.onchange(this.part, this.notes);
    }

    this.frets.touching = -1;
    this.buttonTouched = undefined;
    this.touchingXSection = -1;

    if (!this.hidden) {
        this.draw();
    }
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
        this.draw();
    }

};

OMGMelodyMaker.prototype.setupEditDialog = function () {
    
    var omgmm = this;
    this.restButtonRow = [];
    this.noteButtonRow = [];
    this.removeButtonRow = [{button: true, text: "Remove Note", width: 120}];

    this.removeButtonRow[0].onclick = function () {
        var index = omgmm.part.data.notes.indexOf(omgmm.edittingNoteInfo.note);
        omgmm.part.data.notes.splice(index, 1);
        omgmm.draw();
    };

    var restButton;
    var restNoteImage;
    var beats;
    var ib = 0;
    var noteButton, restButton;
    var beatChoices = [4, 3, 2, 1.5, 1, 0.5, 0.25]
    for (var iimg = 0; iimg < beatChoices.length; iimg++) {

        beats = beatChoices[iimg];

        if (omg.ui.useUnicodeNotes) {
            restNoteImage = omg.ui.getTextForNote({rest: true, beats: beats});
            noteImage = omg.ui.getTextForNote({rest: false, beats: beats});
            noteButton = {button: true, note: noteImage, width: 22};
            restButton = {button: true, note: restNoteImage, width: 22};
        }
        else {
            restNoteImage = omg.ui.getImageForNote({rest: true, beats: beats});
            noteImage = omg.ui.getImageForNote({rest: false, beats: beats});
            noteButton = {button: true, noteImg: noteImage, width: 22};
            restButton = {button: true, noteImg: restNoteImage, width: 22};
        }

        this.noteButtonRow.push(noteButton);
        noteButton.onclick = (function (beats) {
            return function () {
                omgmm.edittingNoteInfo.note.rest = false;
                omgmm.edittingNoteInfo.note.beats = beats;
                omgmm.draw();
            };
        })(beats);

        restButton.onclick = (function (beats) {
            return function () {
                omgmm.edittingNoteInfo.note.rest = true;
                omgmm.edittingNoteInfo.note.beats = beats;
                omgmm.draw();
            };
        })(beats);
        this.restButtonRow.push(restButton);
    }
};

OMGMelodyMaker.prototype.onDisplay = function () {
    var omgmm = this;

    if (!this.hasBeenShown) {
        this.hasBeenShown = true;

        var canvas = this.canvas;

        var canvasHeight = canvas.clientHeight; //window.innerHeight - offsetTop - 12 - 38;
        //canvas.height = canvasHeight;
       // canvas.width = canvas.clientWidth;

    }

    
};

OMGMelodyMaker.prototype.setCanvasEvents = function () {
    var canvas = this.canvas;
    var omgmm = this;

    canvas.onmousedown = function (e) {
        if (omgmm.readOnly && omgmm.mode !== "ZOOM") return;
        e.preventDefault();
        
        omgmm.isMouseTouching = true;

        omgmm.mouseTouch = {x: e.clientX - omgmm.offsets.left, 
            y: e.clientY + omg.ui.getScrollTop() - omgmm.offsets.top, 
            identifier: "mouse"
        };
        omgmm.ondown(omgmm.mouseTouch);
    };

    canvas.onmousemove = function (e) {
        if (omgmm.readOnly && omgmm.mode !== "ZOOM") return;
        e.preventDefault();

        if (omgmm.redoOffsets) {
            omgmm.updateOffsets();
            omgmm.redoOffsets = false;
        }

        var x = e.clientX - omgmm.offsets.left;
        var y = e.clientY + omg.ui.getScrollTop() - omgmm.offsets.top;

        if (omgmm.isMouseTouching) {
            omgmm.mouseTouch.lastX = omgmm.mouseTouch.x;
            omgmm.mouseTouch.lastY = omgmm.mouseTouch.y;
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
    
    canvas.onmouseout = function (e) {
        if (omgmm.readOnly && omgmm.mode !== "ZOOM") return;
        e.preventDefault();
        if (omgmm.isMouseTouching) {
            omgmm.isMouseTouching = false;
            omgmm.onup(omgmm.mouseTouch);
        }
    };

    canvas.onmouseup = function (e) {
        if (omgmm.readOnly && omgmm.mode !== "ZOOM") return;
        e.preventDefault();
        if (omgmm.isMouseTouching) {
            omgmm.isMouseTouching = false;
            omgmm.onup(omgmm.mouseTouch);
        }
    };

    canvas.ontouchstart = function (e) {
        if (omgmm.readOnly && omgmm.mode !== "ZOOM") return;
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
        if (omgmm.readOnly && omgmm.mode !== "ZOOM") return;
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
        if (omgmm.readOnly && omgmm.mode !== "ZOOM") return;
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
    this.touches.push(touch);
    if (this.mode === "EDIT") {
        this.ondownInEditMode(touch);
    }
    else if (this.mode === "ZOOM") {
        this.ondownInZoomMode(touch);
    }
    else {
        this.ondownInWriteMode(touch)
    }
    this.draw();
};


OMGMelodyMaker.prototype.onmove = function (touch) {
    if (this.mode === "EDIT") {
        this.onmoveInEditMode(touch);
    }
    else if (this.mode === "ZOOM") {
        this.onmoveInZoomMode(touch);
    }
    else {
        this.onmoveInWriteMode(touch)
    }
    if (!this.hidden) {
        this.draw();
    }
};

OMGMelodyMaker.prototype.onup = function (touch) {
    if (this.mode === "EDIT") {
        this.onupInEditMode(touch);
    }
    else if (this.mode === "ZOOM") {
        this.onupInZoomMode(touch);
    }
    else {
        this.onupInWriteMode(touch)
    }

    var touchIndex = this.touches.indexOf(touch);
    this.touches.splice(touchIndex, 1);

    if (!this.hidden) {
        this.draw();
    }
};    

OMGMelodyMaker.prototype.ondownInWriteMode = function (touch) {
    
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

    this.notes.push(note);    
    this.setTouchingXSection();
        
    this.player.playLiveNotes(this.notes, this.part, 0);
    if (this.onchange) {
        this.onchange(this.part, this.notes);
    }

    this.draw();
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

        if (this.touchingXSection === 3) {
            this.notes.splice(this.notes.indexOf(touch.note), 1);
            touch.note = {};
            this.notes.push(touch.note);
        }
        touch.note.note = fret - this.frets.rootNote;
        touch.note.scaledNote = noteNumber;
        touch.note.beats = 0.25;

        this.player.playLiveNotes(this.notes, this.part);
        if (this.onchange) {
            this.onchange(this.part, this.notes);
        }
        
        this.draw();
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

    this.draw();
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
};


OMGMelodyMaker.prototype.onhoverInEditMode = function (x, y) {

    var noteInfo = this.noteHitTest(x, y);
    if (noteInfo.note !== this.noteHovering) {
        this.noteHovering = noteInfo.note;
        this.draw();
    }
};

OMGMelodyMaker.prototype.ondownInZoomMode = function (touch) {
    touch.originalX = touch.x;
    touch.originalY = touch.y;
    this.originalSkipTop = this.skipFretsTop;
    this.originalSkipBottom = this.skipFretsBottom;
};

OMGMelodyMaker.prototype.onmoveInZoomMode = function (touch) {
    var diff, skipNewFrets;

    diff = touch.originalY - touch.y;
    skipNewFrets = Math.floor(diff / this.frets.height);

    var topTouch;
    var bottomTouch;
    if (this.touches.length > 1) {
        for (var i = 0; i < this.touches.length; i++) {
            if (!topTouch || this.touches[i].y < topTouch.y) {
                topTouch = this.touches[i];
            }
            if (!bottomTouch || this.touches[i].y > bottomTouch.y) {
                bottomTouch = this.touches[i];
            }
        }
        if (touch === topTouch) {
            this.skipFretsTop = Math.max(0, this.originalSkipTop + skipNewFrets);
        }
        if (touch === bottomTouch) {
            this.skipFretsBottom = Math.max(0, this.originalSkipBottom - skipNewFrets);
        }
    }
    
    if (touch.identifier === "mouse") {
        if (touch.originalY < this.canvas.height / 2) {
            this.skipFretsTop = Math.max(0, this.originalSkipTop + skipNewFrets);        
        }
        else {
            this.skipFretsBottom = Math.max(0, this.originalSkipBottom - skipNewFrets);
        }
    }
    this.frets.height = (this.canvas.height - this.topFretTop - this.bottomFretBottom) / 
            (this.frets.length - this.skipFretsBottom - this.skipFretsTop);
    this.backgroundDrawn = false;
};

OMGMelodyMaker.prototype.onupInZoomMode = function (touch) {
    this.part.data.surface.skipTop = this.skipFretsTop;
    this.part.data.surface.skipBottom = this.skipFretsBottom;
};

OMGMelodyMaker.prototype.getFret = function (y) {
    return Math.max(0, Math.min(this.frets.length - 1,
        this.frets.length - 1 - this.skipFretsTop - Math.floor((y - this.topFretTop) / this.frets.height)));
};

OMGMelodyMaker.prototype.noteHitTest = function (x, y) {
    var noteInfo;
    for (var i = 0; i < this.notesInfo.length; i++) {
        noteInfo = this.notesInfo[i];
        if (x >= noteInfo.x - 2 && x <= noteInfo.x + this.noteWidth + 2 &&
                y >= noteInfo.y - 32 && y <= noteInfo.y + 12) {
            return noteInfo;
        }
    }
    return {};
}

OMGMelodyMaker.prototype.setTouchingXSection = function () {
    /*this.touchingXSection = 0;
    for (var t = 0; t < this.touches.length; t++) {
        if (this.touches[t].xsection > this.touchingXSection) {
            this.touchingXSection = this.touches[t].xsection;
        }
    }
    this.notes.autobeat = this.touchingXSection === 1 ? 
        4 : this.touchingXSection === 3 ? 1 : this.touchingXSection;
    return;*/
    
    this.touchingXSection = -1;
    for (var t = 0; t < this.touches.length; t++) {
        if (this.touches[t].xsection < 3 && this.touches[t].xsection > this.touchingXSection) {
            this.touchingXSection = this.touches[t].xsection;
        }
    }
    if (this.touchingXSection === -1) {
        this.touchingXSection = 3;
    }
    this.notes.autobeat = this.touchingXSection === 0 ? 4 :
            this.touchingXSection === 1 ? 2 :
            this.touchingXSection === 2 ? 1 : 0;
};

OMGMelodyMaker.prototype.ondownInEdittingDialog = function (touch) {
    var row;
    var rows = [this.noteButtonRow, this.restButtonRow, this.removeButtonRow];
    for (var ir = 0; ir < rows.length; ir++) {
        row = rows[ir];

        for (var ib = 0; ib < row.length; ib++) {
            if (row[ib].button && row[ib].leftX < touch.x && row[ib].rightX > touch.x &&
                    row[ib].topY < touch.y && row[ib].bottomY > touch.y) {
                this.buttonTouched = row[ib];
                break;
            }
        }
    }
};

OMGMelodyMaker.prototype.onmoveInEdittingDialog = function (touch) {
    var button;
    var row;
    var rows = [this.noteButtonRow, this.restButtonRow, this.removeButtonRow];
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
        this.buttonTouched = undefined;
    }
};


OMGMelodyMaker.prototype.onupInEdittingDialog = function (touch) {
    var button;
    var row;
    var rows = [this.noteButtonRow, this.restButtonRow, this.removeButtonRow];
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
};


OMGMelodyMaker.prototype.refresh = function (part, welcomeStyle) {
    //todo check the key and scale?
    this.draw();
};

OMGMelodyMaker.prototype.setPart = function (part, welcomeStyle) {

    this.part = part;
    this.data = part.data;
    this.beatParams = part.section.song.data.beatParams;

    this.skipFretsTop = this.part.data.surface.skipTop || 0;
    this.skipFretsBottom = this.part.data.surface.skipBottom || 0;
    
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
    this.setupFretBoard();
    
};


OMGMelodyMaker.prototype.drawOMGLiveUsers = function () {
    var user;
    for (var user in this.part.omglive.users) {
        user = this.part.omglive.users[user];
        
        if (user.shape === "circle") {
            this.context.lineWidth = 5;
            this.context.strokeStyle = user.color;
            this.context.beginPath();
            this.context.arc(user.x * this.canvas.width, user.y * this.canvas.height, 20, 0, 2 * Math.PI);
            this.context.stroke();
        }
        if (user.shape === "fill_circle") {
            this.context.fillStyle = user.color;
            this.context.beginPath();
            this.context.arc(user.x * this.canvas.width, user.y * this.canvas.height, 20, 0, 2 * Math.PI);
            this.context.fill();
        }
        if (user.shape === "square") {
            this.context.lineWidth = 5;
            this.context.strokeStyle = user.color;
            this.context.beginPath();
            this.context.moveTo(user.x * this.canvas.width - 20, user.y * this.canvas.height - 20);
            this.context.lineTo(user.x * this.canvas.width + 20, user.y * this.canvas.height - 20);
            this.context.lineTo(user.x * this.canvas.width + 20, user.y * this.canvas.height + 20);
            this.context.lineTo(user.x * this.canvas.width - 20, user.y * this.canvas.height + 20);
            this.context.closePath();
            this.context.stroke();
        }
        if (user.shape === "fill_square") {
            this.context.fillStyle = user.color;
            this.context.beginPath();
            this.context.moveTo(user.x * this.canvas.width - 20, user.y * this.canvas.height - 20);
            this.context.lineTo(user.x * this.canvas.width + 20, user.y * this.canvas.height - 20);
            this.context.lineTo(user.x * this.canvas.width + 20, user.y * this.canvas.height + 20);
            this.context.lineTo(user.x * this.canvas.width - 20, user.y * this.canvas.height + 20);
            this.context.closePath();
            this.context.fill();
        }
        
    }
};

OMGMelodyMaker.prototype.hide = function () {
    this.canvas.style.display = "none";
    this.beatCanvas.style.display = "none";
    this.bgCanvas.style.display = "none";
    this.hidden = true;
};

OMGMelodyMaker.prototype.updateBeatMarker = function (subbeat) {
    
    if (subbeat === -1) {
        this.beatContext.clearRect(0, 0, this.beatCanvas.width, this.beatCanvas.height);
        return;
    }
    
    if (this.touches.length > 0) {
        this.draw();
    }
    
    if (subbeat % this.beatParams.subbeats !== 0 && 
            this.part.currentI - 1 === this.currentI) {
        return;
    }
    
    this.beatContext.clearRect(0, 0, this.beatCanvas.width, this.beatCanvas.height);

    this.beatContext.fillRect((subbeat - subbeat % this.beatParams.subbeats) * this.beatWidth, 0, 
            this.beatWidth * this.beatParams.subbeats, 
            this.beatCanvas.height);
    

    this.currentI = this.part.currentI - 1;
    if (this.notesInfo[this.currentI]) {
        this.beatContext.fillRect(this.notesInfo[this.currentI].x, 
                this.notesInfo[this.currentI].y - 30, 
                this.noteWidth, this.noteHeight);
    }
};