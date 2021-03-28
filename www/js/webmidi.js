function OMGMIDI() {
    this.parts = []
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess().then(midi => {
            this.midi = midi; 
            midi.inputs.forEach(entry => entry.onmidimessage = event => this.onMessage(event));             
        }, 
        e => {
            console.log( "Failed to get MIDI access", e );
        })
    }
}


OMGMIDI.prototype.onMessage = function (event) {

    var channel = (event.data[0] & 0x0f) + 1;
    switch (event.data[0] & 0xf0) {
        case 0x90:
            if (event.data[2]!=0) {  // if velocity != 0, this is a note-on message
                this.onnoteon(event.data[1], event.data[2], channel);
                return;
            }
            // if velocity == 0, fall thru: it's a note-off.  MIDI's weird, y'all.
        case 0x80:
            this.onnoteoff(event.data[1], channel);
            return;
        case 0xb0:
            switch (event.data[1]) {
                case 24:
                    this.onplay();
                    return;
                case 23:
                    this.onstop();
                    return;
                default:
                    this.onmessage(event.data[1], event.data[2], channel);
            }
            return;
        case 0xE0:
            this.onmessage("pitchbend", event.data[2], channel);
            return;
    }
}

OMGMIDI.prototype.onnoteon = function (note) {console.log(note)}
OMGMIDI.prototype.onnoteoff = function (note) {console.log(note)}
OMGMIDI.prototype.onmessage = function (control, value) {console.log(control, value)}
OMGMIDI.prototype.onplay = function () {}
OMGMIDI.prototype.onstop = function () {}


OMGMIDI.prototype.listInputsAndOutputs = function () {
    for (var input in this.midi.inputs) {
        console.log( "Input port [type:'" + input.type + "'] id:'" + input.id +
        "' manufacturer:'" + input.manufacturer + "' name:'" + input.name +
        "' version:'" + input.version + "'" );
    }

    for (var output in this.midi.outputs) {
        console.log( "Output port [type:'" + output.type + "'] id:'" + output.id +
        "' manufacturer:'" + output.manufacturer + "' name:'" + output.name +
        "' version:'" + output.version + "'" );
    }
}


OMGMIDI.prototype.onnoteoff = function (noteNumber, channel) {
    if (!this.player) return 

    for (var part of this.parts) {
        if (!(part.midiChannel === channel || part.midiChannel === "All")) {
            return;
        }
        if (part.data.surface.url === "PRESET_SEQUENCER") {
            return
        }

        for (var i = 0; i< part.activeMIDINotes.length; i++) {
            if (part.activeMIDINotes[i].scaledNote === noteNumber) {
                part.activeMIDINotes.splice(i, 1);
                break;
            }
        }
        if (part.activeMIDINotes.length === 0) {
            this.player.endLiveNotes(part);
        }
        else if (i === 0 || 
                (this.player.playing && part.activeMIDINotes.autobeat > 0)) {
            this.player.playLiveNotes(part.activeMIDINotes, part, 0); 
        }
    }
};

OMGMIDI.prototype.onnoteon = function (noteNumber, velocity, channel) {
    if (!this.player) return 
    
    for (part of this.parts) {
        if (!(part.midiChannel === channel || part.midiChannel === "All")) {
            return;
        }
        var note = {beats: 0.25, scaledNote: noteNumber};
        part.activeMIDINotes.splice(0, 0, note);    
        if (!part.data.soundSet.chromatic) {
            note.note = noteNumber % part.soundSet.data.length;
        }
        else {
            /*
            //todo this looks horribly inneficient
            for (var i = 0; i < part.mm.frets.length; i++) {
                if (part.mm.frets[i].note === noteNumber) {
                    note.note = i - part.mm.frets.rootNote;
                    break;
                }
                if (part.mm.frets[i].note > noteNumber) {
                    note.note = i - part.mm.frets.rootNote - 0.5;
                    break;
                }
            }
            */
        }
        if (part.data.surface.url === "PRESET_SEQUENCER") {
            this.player.playSound(part.data.tracks[note.note].sound, part, 
                part.data.tracks[note.note].audioParams, velocity / 120)
                //todo omglive?
                /*if (tg.omglive && tg.omglive.socket) {
                    tg.omglive.sendPlaySound(note.note, velocity / 120, part)
                }*/
        }
        else {
            this.player.playLiveNotes(part.activeMIDINotes, part, 0); 
            //tg.player.noteOn(note, part, velocity); 
        }

    }
};

/*tg.onmidiplay = function () {
    if (!tg.player.playing) {
        tg.player.play();
    }
};

tg.onmidistop = function () {
    if (tg.player.playing) {
        tg.player.stop();
    }
};


tg.onmidimessage = function (control, value, channel) {
    if (control === 91) {
        value = Math.floor(value / 128 * 4);
        if (value === 1) value = 4;
        else if (value === 3) value = 1;
        tg.midiParts.forEach(part => {
            if (!(part.midiChannel === channel || part.midiChannel === "All")) {
                return;
            }
            part.activeMIDINotes.autobeat = value;
        });
    }
    else if (control === 7) {
        tg.midiParts.forEach(part => {
            if (!(part.midiChannel === channel || part.midiChannel === "All")) {
                return;
            }
            part.data.audioParams.gain = 1.5 * Math.pow(value / 127, 2);
            part.gain.gain.value = part.data.audioParams.gain;
            tg.song.partMuteChanged(part);
        });
    }
    else if (control === 10) {
        tg.midiParts.forEach(part => {
            if (!(part.midiChannel === channel || part.midiChannel === "All")) {
                return;
            }
            part.data.audioParams.pan = (value - 64) / 64;
            part.panner.pan.value = part.data.audioParams.pan;
            tg.song.partMuteChanged(part);
        });
    }
    else if (control === "pitchbend" || control === 5) {
        if (value === 64) {
            value = 1;
        }
        else if (value < 64) {
            value = value / 64 / 2 + 0.5;
        }
        else {
            value = 1 + (value - 64) / 63;
        }
        tg.midiParts.forEach(part => {
            if (!(part.midiChannel === channel || part.midiChannel === "All")) {
                return;
            }
            part.data.audioParams.warp = value;
            //part.panner.warp.value = part.data.audioParams.warp;
            if (part.osc) {
                part.osc.frequency.value = part.baseFrequency * value;
            }
            tg.song.partMuteChanged(part);
        });
    }
    else if (control === 71) {
        tg.song.gain = value / 127 * 1.5;
        tg.song.postFXGain.gain.value = tg.song.gain;
    }
    else if (control === 74) {
        tg.song.data.beatParams.bpm = Math.round(value / 127 * 200 + 20);
        tg.song.beatsChanged();
    }
};
*/
