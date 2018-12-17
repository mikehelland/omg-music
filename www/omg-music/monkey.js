function OMGMonkey(song, section) {
    
    this.running = true;
    this.song = song;
    this.section = section;
    this.interval = 10000;
    
    var monkey = this;
    this.changeables = [
        {name: "Tempo", probability: 0, functions: monkey.getTempoFunctions()},
        {name: "Mute", probability: 0, functions: monkey.getMuteFunctions()},
        {name: "Volume/Pan", probability: 0, functions: monkey.getVolumePanFunctions()},
        //{name: , probability: 0, functions: },
        //{name: , probability: 0, functions: },
        //{name: , probability: 0, functions: },
        {name: "Key Signature", probability: 0, functions: monkey.getKeyFunctions()}
    ];
        /*
        "Notes and Beats": monkey.changeKeyFunctions, 
        "New Part": monkey.changeKeyFunctions, 
        "Chords": monkey.changeKeyFunctions, */

        
    if (this.running) {
        this.randomize();
    }
}

OMGMonkey.prototype.run = function () {
    this.running = true;
    this.randomize();
    
}
OMGMonkey.prototype.randomize = function () {
    if (!this.running)
        return;
    
    console.log("running randomize")
    
    var monkey = this;
    this.changeables.forEach((changeable) => {
        if (Math.random() < changeable.probability) {
            monkey.change(changeable);
        }
    });
    
    setTimeout(function () {
        monkey.randomize();
    }, monkey.interval);

};

OMGMonkey.prototype.change = function (changeable) {
    var i = Math.floor(Math.random() * changeable.functions.length);
    changeable.functions[i](this.song);
};

OMGMonkey.prototype.getMuteFunctions = function () {
    var monkey = this;
    return [
    function () {
        monkey.forRandomRandomParts(function (part) {
            part.data.audioParameters.mute = 
                    !part.data.audioParameters.mute;
            monkey.song.partMuteChanged(part);
        });
    }
]};

OMGMonkey.prototype.forOneRandomPart = function (callback) {
    if (!this.section.parts.length) return;
    var partI = Math.floor(Math.random() * this.section.parts.length);
    callback(this.section.parts[partI]);
};
OMGMonkey.prototype.forRandomParts = function (callback) {
    if (!this.section.parts.length) return;
    var monkey = this;
    monkey.section.parts.forEach(part => {
        if (Math.random() < 1 / monkey.section.parts.length) {
            callback(part);
        }
    });
};
OMGMonkey.prototype.forRandomRandomParts = function (callback) {
    if (Math.random() > 0.5) {
        this.forOneRandomPart(callback);
    }
    else {
        this.forRandomParts(callback);
    }
};


OMGMonkey.prototype.getKeyFunctions = function () {
    
    return [
    function (song) {
        song.data.keyParameters.rootNote = Math.floor(Math.random() * 12);
        song.keyChanged();
    },
    function (song) {
        song.data.keyParameterskeyChangedrootNote += 1 + Math.floor(Math.random() * 2);
        song.data.keyParameters.rootNote = song.data.keyParameters.rootNote % 12;
        song.keyChanged();
    },
    function (song) {
        song.data.keyParameters.rootNote -= 1 + Math.floor(Math.random() * 2);
        if (song.data.keyParameters.rootNote < 0) song.data.keyParameters.rootNote = 11;
        song.keyChanged();
    },
    function (song) {
        song.data.keyParameterskeyChangedscale = omg.ui.scales[Math.floor(Math.random() * omg.ui.scales.length)].value;
        song.keyChanged();
    },
    function (song) {
        song.data.keyParameters.rootNote = Math.floor(Math.random() * 12);
        song.data.keyParameters.scale = omg.ui.scales[Math.floor(Math.random() * omg.ui.scales.length)].value;
        song.keyChanged();
    }
]};

OMGMonkey.prototype.getTempoFunctions = function () {
    var monkey = this;
    return [
    function (song) {
        if (monkey.song.data.beatParameters.shuffle == 0) {
            monkey.changeShuffle(30);
        }
        else if (monkey.song.data.beatParameters.shuffle > 0.15) {
            monkey.changeShuffle(monkey.song.data.beatParameters.shuffle * -100);
        }
        else {
            monkey.changeShuffle(2);
        }
    },
    function (song) {
        monkey.changeShuffle(Math.round(Math.random() * 2) - 1);
    },
    function (song) {
        monkey.changeShuffle(Math.round(Math.random() * 4) - 2);
    },
    function (song) {
        monkey.changeShuffle(Math.round(Math.random() * 10) - 5);
    },
    function (song) {
        monkey.changeTempo(Math.round(Math.random() * 2) - 1);
    },
    function (song) {
        monkey.changeTempo(Math.round(Math.random() * 4) - 2);
    },
    function (song) {
        monkey.changeTempo(Math.round(Math.random() * 10) - 5);
    },
    function (song) {
        monkey.changeTempo(Math.round(Math.random() * 20) - 10);
    },
    function (song) {
        monkey.changeTempo(Math.round(Math.random() * 40) - 20);
    }
]};

OMGMonkey.prototype.changeTempo = function (bpmChange) {
    this.song.data.beatParameters.bpm = Math.min(Math.max(this.song.data.beatParameters.bpm + bpmChange, 40), 200);
    this.song.tempoChanged();
};
OMGMonkey.prototype.changeShuffle = function (change) {
    this.song.data.beatParameters.shuffle = Math.min(Math.max(this.song.data.beatParameters.shuffle + change / 100, 0), 0.50);
    this.song.tempoChanged();
};

OMGMonkey.prototype.getVolumePanFunctions = function () {
    var monkey = this;
    return [
    function () {
        monkey.forRandomRandomParts(function (part) {
            monkey.changePan(part, Math.random() * Math.random() > 0.5 ? 1 : -1);
        });
    },
    function () {
        monkey.forRandomRandomParts(function (part) {
            monkey.changeVolume(part, Math.random() * Math.random() > 0.5 ? 1 : -1);
        });
    },
    function () {
        monkey.forRandomRandomParts(function (part) {
            monkey.changePan(part, Math.round(Math.random() * 2) - 1);
        });
    },
    function () {
        monkey.forRandomRandomParts(function (part) {
            monkey.changePan(part, Math.round(Math.random() * 4) - 2);
        });
    },
    function () {
        monkey.forRandomRandomParts(function (part) {
            monkey.changePan(part, Math.round(Math.random() * 10) - 5);
        });
    },
    function () {
        monkey.forRandomRandomParts(function (part) {
            monkey.changeVolume(part, Math.round(Math.random() * 2) - 1);
        });
    },
    function () {
        monkey.forRandomRandomParts(function (part) {
            monkey.changeVolume(part, Math.round(Math.random() * 4) - 2);
        });
    },
    function () {
        monkey.forRandomRandomParts(function (part) {
            monkey.changeVolume(part, Math.round(Math.random() * 10) - 5);
        });
    },
    function () {
        monkey.forRandomRandomParts(function (part) {
            monkey.changeVolume(part, Math.round(Math.random() * 20) - 10);
        });
    },
    function () {
        monkey.forRandomRandomParts(function (part) {
            monkey.changeVolume(part, Math.round(Math.random() * 40) - 20);
        });
    }
];
};

OMGMonkey.prototype.changeVolume = function (part, change) {
    part.data.audioParameters.gain = Math.min(Math.max(part.data.audioParameters.gain + change / 10, 0.1), 0.95);
    this.song.partMuteChanged(part);
};
OMGMonkey.prototype.changePan = function (part, change) {
    part.data.audioParameters.pan = Math.min(Math.max(part.data.audioParameters.pan + change / 10, -1), 1);
    this.song.partMuteChanged(part);
};