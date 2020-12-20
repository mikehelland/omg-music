function OMGMIDI() {
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