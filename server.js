var omg = {}
omg.live = {}
omg.live.getPart = function (song, partName) {
    for (var i = 0; i < song.sections[0].parts.length; i++) {
        if (song.sections[0].parts[i].name === partName) {
            return song.sections[0].parts[i];
        }
    }
};
omg.live.updateSong = function (song, data) {
    if (data.action === "partAdd") {
        song.sections[0].parts.push(data.part);
    }
    else if (data.property === "beatParams") {
        song.beatParams.bpm = data.value.bpm;
        song.beatParams.shuffle = data.value.shuffle;
        song.beatParams.subbeats = data.value.subbeats;
        song.beatParams.beats = data.value.beats;
        song.beatParams.measures = data.value.measures;
    }
    else if (data.property === "keyParams") {
        song.keyParams.rootNote = data.value.rootNote;
        song.keyParams.scale = data.value.scale;
    }
    else if (data.property === "chordProgression") {
        song.sections[0].chordProgression = data.value;
    }
    else if (data.property === "audioParams" && data.partName) {
        let part = omg.live.getPart(song, data.partName);
        if (!part) return;
        part.audioParams.mute = data.value.mute;
        part.audioParams.gain = data.value.gain;
        part.audioParams.pan = data.value.pan;
        part.audioParams.warp = data.value.warp;
    }
    else if (data.action === "sequencerChange") {
        let part = omg.live.getPart(song, data.partName);
        part.tracks[data.trackI].data[data.subbeat] = data.value;
    }
    else if (data.action === "verticalChangeNotes") {
        //tg.omglive.onVerticalChangeFrets(data);
    }
    else if (data.action === "fxChange") {
        let part = data.partName ? omg.live.getPart(song, data.partName) : song;
        if (data.fxAction === "add") {
            part.fx.push(data.fxData)
        }
        else if (data.fxAction === "remove") {
            for (var i = 0; i < part.fx.length; i++) {
                if (part.fx[i].name === data.fxName) {
                    part.fx.splice(i, 1)
                    break;
                }
            }
        }
        else if (data.fxAction) {
            for (var i = 0; i < part.fx.length; i++) {
                if (part.fx[i].name === data.fxName) {
                    for (var property in data.fxAction) {
                        part.fx[i][property] = data.fxAction[property]
                    }
                    break;
                }
            }
        }
    }
};
