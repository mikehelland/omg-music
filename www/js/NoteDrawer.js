export default function NoteDrawer() {

    this.useUnicodeNotes = navigator.userAgent.indexOf("Android") === -1 
        && navigator.userAgent.indexOf("iPhone") === -1 
        && navigator.userAgent.indexOf("iPad") === -1 
        && navigator.userAgent.indexOf("Mac OS X") === -1 ;

    //this.useUnicodeNotes = false
    if (!this.useUnicodeNotes) {
        this.setupNoteImages();
    }

}



NoteDrawer.prototype.setupNoteImages = function () {
    if (NoteDrawer.prototype.noteImages)
        return;

    this.noteImageUrls = [
        [2, "note_half", "note_rest_half"],
        [1.5, "note_dotted_quarter", "note_rest_dotted_quarter"],
        [1, "note_quarter", "note_rest_quarter"],
        [0.75, "note_dotted_eighth", "note_rest_dotted_eighth"],
        [0.5, "note_eighth", "note_rest_eighth"], //, "note_eighth_upside"],
        [0.375, "note_dotted_sixteenth", "note_rest_dotted_sixteenth"],
        [0.25, "note_sixteenth", "note_rest_sixteenth"], //, "note_sixteenth_upside"],
        [0.125, "note_thirtysecond", "note_rest_thirtysecond"],
        [-1, "note_no_file", "note_no_file"]
    ];

    var musicUrl = "/apps/music/"; 
    var noteImages = [];
    var loadedNotes = 0;
    var areAllNotesLoaded = () => {
        loadedNotes++;
        if (loadedNotes == this.noteImageUrls.length * 4) {
            NoteDrawer.prototype.noteImages = noteImages;
        }
    };

    for (var i = 0; i < this.noteImageUrls.length; i++) {

        var noteImage = new Image();
        noteImage.onload = areAllNotesLoaded;
        noteImage.src = musicUrl + this.getNoteImageUrl(i, 1);

        var noteWhiteImage = new Image();
        noteWhiteImage.onload = areAllNotesLoaded;
        noteWhiteImage.src = musicUrl + this.getNoteImageUrl(i, 1, true);

        var restImage = new Image();
        restImage.onload = areAllNotesLoaded;
        restImage.src = musicUrl + this.getNoteImageUrl(i, 2);

        var restWhiteImage = new Image();
        restWhiteImage.onload = areAllNotesLoaded;
        restWhiteImage.src = musicUrl + this.getNoteImageUrl(i, 2, true);

        var imageBundle = [noteImage, noteWhiteImage, restImage, restWhiteImage];
        var upsideDown = this.getNoteImageUrl(i, 3);
        if (upsideDown) {
            var upsideImage = new Image();
            upsideImage.src = musicUrl + upsideDown;
            imageBundle.push(upsideImage);
        }

        noteImages.push(imageBundle);
    }
};


NoteDrawer.prototype.getImageForNote = function (note, highContrast) {

    var index = (note.rest ? 2 : 0) + (highContrast ? 1 : 0)
    var draw_noteImage = this.noteImages[8][index];
    if (note.beats == 2.0) {
        draw_noteImage = this.noteImages[0][index];
    }
    if (note.beats == 1.5) {
        draw_noteImage = this.noteImages[1][index];
    }
    if (note.beats == 1.0) {
        draw_noteImage = this.noteImages[2][index];
    }
    if (note.beats == 0.75) {
        draw_noteImage = this.noteImages[3][index];
    }
    if (note.beats == 0.5) {
        draw_noteImage = this.noteImages[4][index];
    }
    if (note.beats == 0.375) {
        draw_noteImage = this.noteImages[5][index];
    }
    if (note.beats == 0.25) {
        draw_noteImage = this.noteImages[6][index];
    }
    if (note.beats == 0.125) {
        draw_noteImage = this.noteImages[7][index];
    }

    return draw_noteImage;

};

NoteDrawer.prototype.getNoteImageUrl = function (i, j, highContrast) {
    var fileName = this.noteImageUrls[i][j];
    if (fileName) {
        return "img/notes/" + (highContrast ? "w_" : "") + fileName + ".png";
    }
};


NoteDrawer.prototype.getTextForNote = function (note, highContrast) {

    switch (note.beats) {
        case 4.0: return note.rest ? "\u{1D13B}" : "\u{1D15D}";
        case 3.75: return note.rest ? "\u{1D13C} \u{1D13D} \u{1D13E} \u{1D13F}" : "\u{1D15E} \u{1D16D} \u{1D16D} \u{1D16D}";
        case 3.5: return note.rest ? "\u{1D13C} \u{1D13D} \u{1D13E}" : "\u{1D15E} \u{1D16D} \u{1D16D}";
        case 3.25: return note.rest ? "\u{1D13C} \u{1D13D} \u{1D13F}" : "\u{1D15E} \u{1D16D} \u{1D161}";
        case 3.0: return note.rest ? "\u{1D13C} \u{1D13D}" : "\u{1D15E} \u{1D16D}";
        case 2.75: return note.rest ? "\u{1D13C} \u{1D13E} \u{1D13F}" : "\u{1D15E} \u{1D160} \u{1D161}";
        case 2.5: return note.rest ? "\u{1D13C} \u{1D13E}" : "\u{1D15E} \u{1D160}";
        case 2.25: return note.rest ? "\u{1D13C} \u{1D13F}" : "\u{1D15E} \u{1D161}";
        case 2.0: return note.rest ? "\u{1D13C}" : "\u{1D15E}";
        case 1.75: return note.rest ? "\u{1D13D} \u{1D13E} \u{1D13F}" : "\u{1D15F} \u{1D16D} \u{1D16D}";
        case 1.5: return note.rest ? "\u{1D13D} \u{1D13E}" : "\u{1D15F} \u{1D16D}";
        case 1.25: return note.rest ? "\u{1D13D} \u{1D13F}" : "\u{1D15F} \u{1D161}";
        case 1.0: return note.rest ? "\u{1D13D}" : "\u{1D15F}";
        case 0.75: return note.rest ? "\u{1D13E} \u{1D13F}" : "\u{1D160} \u{1D16D}";
        case 0.5: return note.rest ? "\u{1D13E}" : "\u{1D160}";
        case 0.375: return note.rest ? "\u{1D13F} \u{1D140}" : "\u{1D161} \u{1D16D}";
        case 0.25: return note.rest ? "\u{1D13F}" : "\u{1D161}";
        case 0.125: return note.rest ? "\u{1D140}" : "\u{1D162}";
    }

    return note.beats > 4 ? (note.rest ? "\u{1D13B} \u{1D144}" : "\u{1D15D} \u{1D144}") : "?";
};

NoteDrawer.prototype.noteSize = 30
NoteDrawer.prototype.drawNote = function (note, ctx, x, y) {
 
    ctx.font = this.noteSize + "pt serif";
    
    // todo don't hard code this value
    if (y < 30) {
        ctx.save()
        ctx.translate(x, y)
        ctx.scale(1, -1)
        x = 0
        y = 0
    }
    
    if (this.useUnicodeNotes) {
        ctx.fillText(this.getTextForNote(note), x, y);
    }
    else {
        ctx.drawImage(this.getImageForNote(note), x, y - this.noteSize, this.noteSize, this.noteSize);
    }

    if (y < 30) {
        ctx.restore()
    }

}

/*this.splitInts = function (string) {
    var ints = string.split(",");
    for (var i = 0; i < ints.length; i++) {
        ints[i] = parseInt(ints[i]);
    }
    return ints;
};

NoteDrawer.prototype.getChordText = function (chord, ascale) {
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

NoteDrawer.prototype.getChordProgressionText = function (section) {
    var chordsText = "";
    if (section.data.chordProgression) {
        var chords = section.data.chordProgression;
        for (var i = 0; i < chords.length; i++) {
            if (i > 0) {
                chordsText += " - ";
            }
            chordsText += this.getChordText(chords[i], section.data.ascale);
        }
    }  
    return chordsText;
};*/




