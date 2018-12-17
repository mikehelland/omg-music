/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


    //omgsong
    //backwards compatibility
    if (!data.beatParameters) {
        data.beatParameters = {"beats": data.beats || 4, 
                    "subbeats": data.subbeats || 4,
                    "measures": data.measures || 1, 
                    "shuffle": data.shuffle || 0, 
                    "subbeatMillis": data.subbeatMillis || 125
                };
    }
    if (!data.keyParameters) {
        data.keyParameters = {"rootNote": data.rootNote || 0, 
                    "scale": data.ascale 
                            || (data.scale ? data.scale.split(",") : 0) 
                            || [0,2,4,5,7,9,11]};
    }

    if (!data.beatParameters.bpm && data.beatParameters.subbeatMillis) {
        data.beatParameters.bpm = 1 / data.beatParameters.subbeatMillis * 60000 / 4;
    }


    //omgsection
    //backwards compatibility
    //with technogauntlet and omg < 0.9
    if (data) {
        if (data.beats && !data.beatParameters) {
            data.beatParameters = {"beats": data.beats, "subbeats": data.subbeats,
                        "measures": data.measures || 1, "shuffle": data.shuffle || 0,
                        "subbeatMillis": data.subbeatMillis || 125,
                    };
        }
        if (data.rootNote && !data.keyParameters) {
            data.keyParameters = {"rootNote": data.rootNote, 
                        "scale": data.ascale || data.scale.split(",")};
        }
    }
