if (!omg.ui)
    omg.ui = {};

if (!omg.music) {
    omg.music = {}
}
if (!omg.music.path) {
    omg.music.path = document.currentScript.src.substr(0, document.currentScript.src.lastIndexOf("/"))
    omg.music.path = omg.music.path.substr(0, omg.music.path.lastIndexOf("/") + 1)
}

//todo is this the best spot for this?
//if so player should use it to load its sub-scripts  
omg.ui.omgUrl = "/apps/music/"; 

omg.ui.noteImageUrls = [[2, "note_half", "note_rest_half"],
    [1.5, "note_dotted_quarter", "note_rest_dotted_quarter"],
    [1, "note_quarter", "note_rest_quarter"],
    [0.75, "note_dotted_eighth", "note_rest_dotted_eighth"],
    [0.5, "note_eighth", "note_rest_eighth"], //, "note_eighth_upside"],
    [0.375, "note_dotted_sixteenth", "note_rest_dotted_sixteenth"],
    [0.25, "note_sixteenth", "note_rest_sixteenth"], //, "note_sixteenth_upside"],
    [0.125, "note_thirtysecond", "note_rest_thirtysecond"],
    [-1, "note_no_file", "note_no_file"]];
    
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
    


omg.ui.soundFontNames = ["accordion","acoustic_bass","acoustic_grand_piano","acoustic_guitar_nylon","acoustic_guitar_steel","agogo","alto_sax","applause","bagpipe","banjo","baritone_sax","bassoon","bird_tweet","blown_bottle","brass_section","breath_noise","bright_acoustic_piano","celesta","cello","choir_aahs","church_organ","clarinet","clavinet","contrabass","distortion_guitar","drawbar_organ","dulcimer","electric_bass_finger","electric_bass_pick","electric_grand_piano","electric_guitar_clean","electric_guitar_jazz","electric_guitar_muted","electric_piano_1","electric_piano_2","english_horn","fiddle","flute","french_horn","fretless_bass","fx_1_rain","fx_2_soundtrack","fx_3_crystal","fx_4_atmosphere","fx_5_brightness","fx_6_goblins","fx_7_echoes","fx_8_scifi","glockenspiel","guitar_fret_noise","guitar_harmonics","gunshot","harmonica","harpsichord","helicopter","honkytonk_piano","kalimba","koto","lead_1_square","lead_2_sawtooth","lead_3_calliope","lead_4_chiff","lead_5_charang","lead_6_voice","lead_7_fifths","lead_8_bass__lead","marimba","melodic_tom","music_box","muted_trumpet","oboe","ocarina","orchestra_hit","orchestral_harp","overdriven_guitar","pad_1_new_age","pad_2_warm","pad_3_polysynth","pad_4_choir","pad_5_bowed","pad_6_metallic","pad_7_halo","pad_8_sweep","pan_flute","percussive_organ","piccolo","pizzicato_strings","recorder","reed_organ","reverse_cymbal","rock_organ","seashore","shakuhachi","shamisen","shanai","sitar","slap_bass_1","slap_bass_2","soprano_sax","steel_drums","string_ensemble_1","string_ensemble_2","synth_bass_1","synth_bass_2","synth_brass_1","synth_brass_2","synth_choir","synth_drum","synth_strings_1","synth_strings_2","taiko_drum","tango_accordion","telephone_ring","tenor_sax","timpani","tinkle_bell","tremolo_strings","trombone","trumpet","tuba","tubular_bells","vibraphone","viola","violin","voice_oohs","whistle","woodblock","xylophone"]





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
    var hasImgs = true;
    var img, img2;
    for (var i = 0; i < omg.ui.noteImageUrls.length; i++) {
        img = document.getElementById("omg_" + omg.ui.noteImageUrls[i][1]);
        img2 = document.getElementById("omg_" + omg.ui.noteImageUrls[i][2]);
        if (img && img2) {
            noteImages.push([img, img, img2, img2]);
        }
        else {
            hasImgs = false;
            break;
        }
    }

    if (hasImgs) {
        omg.ui.noteImages = noteImages;
        return;
    }

    noteImages = [];
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

omg.ui.getTextForNote = function (note, highContrast) {

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

/*omg.ui.splitInts = function (string) {
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
};*/


omg.ui.useUnicodeNotes = navigator.userAgent.indexOf("Android") === -1 
    && navigator.userAgent.indexOf("iPhone") === -1 
    && navigator.userAgent.indexOf("iPad") === -1 
    && navigator.userAgent.indexOf("Mac OS X") === -1 ;
if (!omg.ui.useUnicodeNotes) {
    omg.ui.setupNoteImages();
}

