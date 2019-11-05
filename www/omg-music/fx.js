OMusicPlayer.prototype.addFXToPart = function (fxName, part, source) {
    var fx = this.makeFXNodeForPart(fxName, part)
    if (fx) {
        part.data.fx.push(fx.data);

        this.song.fxChanged("add", part, fx, source);
    }
    return fx;
};

OMusicPlayer.prototype.removeFXFromPart = function (fx, part, source) {
    var index = part.fx.indexOf(fx);
    
    var connectingNode = part.fx[index - 1] || part.preFXGain;
    var connectedNode = part.fx[index + 1] || part.postFXGain;
    fx.disconnect();
    connectingNode.disconnect();
    connectingNode.connect(connectedNode);

    part.fx.splice(index, 1);
    index = part.data.fx.indexOf(fx.data);
    part.data.fx.splice(index, 1);

    this.song.fxChanged("remove", part, fx, source);
};

OMusicPlayer.prototype.adjustFX = function (fx, part, property, value, source) {
    //todo isAudioParam should be set in this file
    if (fx.isAudioParam) {
        fx[property].setValueAtTime(value, tg.player.context.currentTime);
    }
    else {
        fx[property] = value;
    }
    
    fx.data[property] = value;
    var changes = {}
    changes[property] =  value
    this.song.fxChanged(changes, part, fx, source);
}


OMusicPlayer.prototype.setupFX = function () {
    var p = this;
        
    p.fx = {};
    p.fx["EQ"] = {"make" : function (data) {
            var eq = p.makeEQ(data);
            return eq;
        },
        "controls": [
            {"property": "highGain", default: 1, "name": "EQ High", "type": "slider", "min": 0, "max": 1.5, transform: "square"},
            {"property": "midGain", default: 1, "name": "EQ Mid", "type": "slider", "min": 0, "max": 1.5, transform: "square"},
            {"property": "lowGain", default: 1, "name": "EQ Low", "type": "slider", "min": 0, "max": 1.5, transform: "square"}
        ]
    };
    p.fx["CompressorW"] = {"make" : function (data) {
            var compressor = p.context.createDynamicsCompressor();
            compressor.threshold.value = -50;
            compressor.knee.value = 40;
            compressor.ratio.value = 2;
            compressor.attack.value = 0;
            compressor.release.value = 0.25;
            
            Object.defineProperty(compressor, 'bypass', {
                get: function() {
                    return data.bypass;
                },
                set: function(value) {
                    data.bypass = value;
                }
            });
            return compressor;
        },
        "controls": [
            {"property": "threshold", default: -50, "name": "Threshold", "type": "slider", "min": -100, "max": 0},
            {"property": "knee", default: 40, "name": "Knee", "type": "slider", "min": 0, "max": 40},
            {"property": "ratio", default: 2, "name": "Ratio", "type": "slider", "min": 1, "max": 20},
            //{"property": "reduction", "name": "Reduction", "type": "slider", "min": -20, "max": 0},
            {"property": "attack", default: 0, "name": "Attack", "type": "slider", "min": 0, "max": 1},
            {"property": "release", default: 0.25, "name": "Release", "type": "slider", "min": 0, "max": 1}
        ]
    };
    p.fx["DelayW"] = {"make" : function (data) {
            return p.makeDelay(data);
        },
        "controls": [
            {"property": "time", "name": "Delay Time", default: 0.25, "type": "slider", "min": 0, "max": 5, axis:"revx"},
            {"property": "feedback", "name": "Feedback", default: 0.25, "type": "slider", "min": 0, "max": 1.0, axis:"revy"},
        ]
    };    
    p.fx["Delay"] = {"audioClass" : p.tuna.Delay,
        "controls": [
            {"property": "feedback", default: 0.45, "name": "Feedback", "type": "slider", "min": 0, "max": 1},
            {"property": "delayTime", default: 150, "name": "Delay Time", "type": "slider", "min": 1, "max": 1000},
            {"property": "wetLevel", default: 0.25, "name": "Wet Level", "type": "slider", "min": 0, "max": 1},
            {"property": "dryLevel", default: 1, "name": "Dry Level", "type": "slider", "min": 0, "max": 1},
            {"property": "cutoff", default: 2000, "name": "Cutoff", "type": "slider", "min": 20, "max": 22050}
        ]
    };
    p.fx["Chorus"] = {"audioClass": p.tuna.Chorus,
        "controls": [
            {"property": "rate", default: 1.5, "name": "Rate", "type": "slider", "min": 0.01, "max": 8, axis:"x"},
            {"property": "feedback", default: 0.2, "name": "Feedback", "type": "slider", "min": 0, "max": 1},
            {"property": "depth", default: 0.7, "name": "Depth", "type": "slider", "min": 0, "max": 1, axis:"y"},
            {"property": "delay", default: 0.0045, "name": "Delay", "type": "slider", "min": 0, "max": 1}
        ]
    };
    
    p.fx["Phaser"] = {"audioClass": p.tuna.Phaser,

        "controls": [
            {"property": "rate", default: 1.2, "name": "Rate", "type": "slider", "min": 0.01, "max": 12, axis:"x"},
            {"property": "depth", default: 0.3, "name": "Depth", "type": "slider", "min": 0, "max": 1},
            {"property": "feedback", default: 0.2, "name": "Feedback", "type": "slider", "min": 0, "max": 1, axis:"y"},
            {"property": "stereoPhase", default: 30, "name": "Stereo Phase", "type": "slider", "min": 0, "max": 180},
            {"property": "baseModulationFrequeny", default: 700, "name": "Base Modulation Freq", "type": "slider", "min": 500, "max": 1500}
        ]
    };        
    p.fx["Overdrive"] = {"audioClass": p.tuna.Overdrive,
        "controls" : [
            {"property": "outputGain", default: 0.15, "name": "Output Gain", "type": "slider", "min": 0, "max": 1.5},
            {"property": "drive", default: 0.7, "name": "Drive", "type": "slider", "min": 0, "max": 1, axis:"x"},
            {"property": "curveAmount", default: 0.8, "name": "Curve Amount", "type": "slider", "min": 0, "max": 1, axis:"y"},
            {"property": "algorithmIndex", default: 0, "name": "Type", "type": "options", "options": [0,1,2,3,4,5]}
        ]
    };
    p.fx["Compressor"] = {"audioClass": p.tuna.Compressor,
        "controls" : [
            {"property": "threshold", default: -1, "name": "Threshold", "type": "slider", "min": -100, "max": 0},
            {"property": "makeupGain", default: 1, "name": "Makeup Gain", "type": "slider", "min": 0, "max": 10},
            {"property": "attack", default: 1, "name": "Attack", "type": "slider", "min": 0, "max": 1000},
            {"property": "release", default: 0, "name": "Release", "type": "slider", "min": 0, "max": 3000},
            {"property": "ratio", default: 4, "name": "Ratio", "type": "slider", "min": 0, "max": 20},
            {"property": "knee", default: 5, "name": "Knee", "type": "slider", "min": 0, "max": 40},
            {"property": "automakeup", default: true, "name": "Auto Makeup", "type": "options", "options": [false, true]}
        ]
    };
    p.fx["Reverb"] = {"audioClass": p.tuna.Convolver,
        "controls": [
            {"property": "highCut", default: 22050, "name": "High Cut", "type": "slider", "min": 20, "max": 22050, axis:"revy"},
            {"property": "lowCut", default: 20, "name": "Low Cut", "type": "slider", "min": 20, "max": 22050},
            {"property": "dryLevel", default: 1, "name": "Dry Level", "type": "slider", "min": 0, "max": 1},
            {"property": "wetLevel", default: 1, "name": "Wet Level", "type": "slider", "min": 0, "max": 1, axis:"x"},
            {"property": "level", default: 1, "name": "Level", "type": "slider", "min": 0, "max": 1},
            {"property": "impulse", default: "/omg-music/impulses/ir_rev_short.wav", "name": "Impulse", "type": "hidden"},
        ]
    };
    p.fx["Filter"] = {"audioClass": p.tuna.Filter,
        "controls": [
            {"property": "frequency", default: 440, "name": "Frequency", "type": "slider", "min": 20, "max": 22050, axis:"x"},
            {"property": "Q", default: 1, "name": "Q", "type": "slider", "min": 0.001, "max": 100},
            {"property": "gain", default: 0, "name": "Gain", "type": "slider", "min": -40, "max": 40, axis: "y"},
            {"property": "filterType", default: "lowpass", "name": "Filter Type", "type": "options", 
                "options": ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass"]},
        ]
    };
    p.fx["Cabinet"] = {"audioClass": p.tuna.Cabinet,
        "controls": [
            {"property": "makeupGain", default: 1, "name": "Makeup Gain", "type": "slider", "min": 0, "max": 20},
            {"property": "impulse", default: "/omg-music/impulses/impulse_guitar.wav", "name": "Impulse", "type": "hidden"}
        ]
    };
    p.fx["Tremolo"] = {"audioClass": p.tuna.Tremolo,
        "controls": [
            {"property": "intensity", default: 0.3, "name": "Intensity", "type": "slider", "min": 0, "max": 1, axis:"revy"},
            {"property": "rate", default: 4, "name": "Rate", "type": "slider", "min": 0.001, "max": 8, axis:"x"},
            {"property": "stereoPhase", default: 0, "name": "Stereo Phase", "type": "slider", "min": 0, "max": 180}
        ]
    };
    p.fx["Wah Wah"] = {"audioClass": p.tuna.WahWah,
        "controls": [
            {"property": "automode", default: true, "name": "Auto Mode", "type": "options", "options": [false, true]},
            {"property": "baseFrequency", default: 0.5, "name": "Base Frequency", "type": "slider", "min": 0, "max": 1, axis:"x"},
            {"property": "excursionOctaves", default: 2, "name": "Excursion Octaves", "type": "slider", "min": 1, "max": 6},
            {"property": "sweep", default: 0.2, "name": "Sweep", "type": "slider", "min": 0, "max": 1, axis:"y"},
            {"property": "resonance", default: 10, "name": "Resonance", "type": "slider", "min": 1, "max": 10},
            {"property": "sensitivity", default: 0.5, "name": "Sensitivity", "type": "slider", "min": -1, "max": 1}
        ]
    };
    p.fx["Bitcrusher"] = {"audioClass": p.tuna.Bitcrusher,
        "controls": [
            {"property": "bits", default: 4, "name": "Bits", "type": "options", "options": [1,2,4,8,16]},
            {"property": "normfreq", default: 0.1, "name": "Normal Frequency", "type": "slider", "min": 0, "max": 1, "transform": "square", axis:"x"},
            {"property": "bufferSize", default: 4096, "name": "Buffer Size", "type": "options", "options": [256,512,1024,2048,4096,8192,16384]}
        ]
    };
    p.fx["Moog"] = {"audioClass": p.tuna.MoogFilter,
        "controls": [
            {"property": "cutoff", default: 0.065, "name": "Cutoff", "type": "slider", "min": 0, "max": 1},
            {"property": "resonance", default: 3.5, "name": "Resonance", "type": "slider", "min": 0, "max": 4},
            {"property": "bufferSize", default: 4096, "name": "Buffer Size", "type": "options", "options": [256,512,1024,2048,4096,8192,16384]}
        ]
    };
    p.fx["Ping Pong"] = {"audioClass": p.tuna.PingPongDelay,
        "controls": [
            {"property": "wetLevel", default: 0.5, "name": "Wet Level", "type": "slider", "min": 0, "max": 1},
            {"property": "feedback", default: 0.3, "name": "Feedback", "type": "slider", "min": 0, "max": 1},
            {"property": "delayTimeLeft", default: 150, "name": "Delay Time Left", "type": "slider", "min": 1, "max": 10000, axis:"x"},
            {"property": "delayTimeRight", default: 200, "name": "Delay Time Right", "type": "slider", "min": 1, "max": 10000, axis:"revy"}
        ]
    };
    p.fx["Rad Pad"] = {"make" : function (data) {
            return p.makeRadPad(data);
        },
        "controls": [
            {"property": "fx1", default: "None", "name": "FX1", "type": "options", 
                "options": ["None", "DelayW", "Reverb", "Ping Pong"]},
            {"property": "fx2", default: "None", "name": "FX2", "type": "options", 
                "options": ["None", "LPF", "HPF", "BPF"]},
            {"property": "fx3", default: "None", "name": "FX3", "type": "options", 
                "options": ["None", "Tremolo", "Phaser", "Chorus"]},
            {"property": "fx4", default: "None", "name": "FX4", "type": "options", 
                "options": ["None", "Wah Wah", "Bitcrusher", "Overdrive"]},
            {"property": "xy", default: 0.3, "name": "", "type": "xy", "min": 0, "max": 1}
        ]
    };
};

OMusicPlayer.prototype.makeFXNodeForPart = function (fx, part) {
    var fxNode, fxData;
    var fxName = fx;
    if (typeof fx === "object") {
        fxName = fx.name;
        fxData = fx;
    }
    
    var fxNode = this.makeFXNode(fxName, fxData)

    if (fxNode) {
        var connectingNode = part.fx[part.fx.length - 1] || part.preFXGain;
        connectingNode.disconnect(part.postFXGain);
        connectingNode.connect(fxNode);
        fxNode.connect(part.postFXGain);
        part.fx.push(fxNode);
    }
    
    return fxNode;
};

OMusicPlayer.prototype.makeFXNode = function (fxName, fxData) {
    var fxNode;
    var fxInfo = this.fx[fxName];
    if (fxInfo) {
        if (!fxData) {
            fxData = {"name": fxName};
            fxInfo.controls.forEach(control => {
                fxData[control.property] = control.default;
            });
        }
        if (fxInfo.audioClass) {
            fxNode = new fxInfo.audioClass(fxData);
        }
        else {
            fxNode = fxInfo.make(fxData);
        }
        if (fxNode)
            fxNode.data = fxData;
    }
    return fxNode;
};


OMusicPlayer.prototype.makeEQ = function (data) {
    var p = this;
    var input = p.context.createGain();

    // https://codepen.io/andremichelle/pen/RNwamZ/
    // How to hack an equalizer with two biquad filters
    //
    // 1. Extract the low frequencies (highshelf)
    // 2. Extract the high frequencies (lowshelf)
    // 3. Subtract low and high frequencies (add invert) from the source for the mid frequencies.
    // 4. Add everything back together
    //
    // andre.michelle@gmail.com

    var context = this.context;
    
    // EQ Properties
    //
    var gainDb = -40.0;
    var bandSplit = [360,3600];

    input.eqH = context.createBiquadFilter();
    input.eqH.type = "lowshelf";
    input.eqH.frequency.value = bandSplit[0];
    input.eqH.gain.value = gainDb;

    input.eqHInvert = context.createGain();
    input.eqHInvert.gain.value = -1.0;

    input.eqM = context.createGain();

    input.eqL = context.createBiquadFilter();
    input.eqL.type = "highshelf";
    input.eqL.frequency.value = bandSplit[1];
    input.eqL.gain.value = gainDb;

    input.eqLInvert = context.createGain();
    input.eqLInvert.gain.value = -1.0;

    input.connect(input.eqL);
    input.connect(input.eqM);
    input.connect(input.eqH);

    input.eqH.connect(input.eqHInvert);
    input.eqL.connect(input.eqLInvert);

    input.eqHInvert.connect(input.eqM);
    input.eqLInvert.connect(input.eqM);

    input.eqLGain = context.createGain();
    input.eqMGain = context.createGain();
    input.eqHGain = context.createGain();

    if (typeof input.highGain !== "number")
        input.highGain = 1;
    if (typeof input.midGain !== "number")
        input.midGain = 1;
    if (typeof input.lowGain !== "number")
        input.lowGain = 1;
    input.eqHGain.gain.value = input.highGain;
    input.eqMGain.gain.value = input.midGain;
    input.eqLGain.gain.value = input.lowGain;

    input.eqL.connect(input.eqLGain);
    input.eqM.connect(input.eqMGain);
    input.eqH.connect(input.eqHGain);

    input.output = context.createGain();
    input.eqLGain.connect(input.output);
    input.eqMGain.connect(input.output);
    input.eqHGain.connect(input.output);
    
    input.connect = function (to) {
        input.output.connect(to);
    };
    input.disconnect = function (from) {
        input.output.disconnect(from);
    };
    Object.defineProperty(input, 'highGain', {
        set: function(value) {
            data.highGain = value;
            if (!data.bypass) {
                input.eqHGain.gain.value = value;
            }
        }
    });
    Object.defineProperty(input, 'midGain', {
        set: function(value) {
            data.midGain = value;
            if (!data.bypass)
                input.eqMGain.gain.value = value;
        }
    });
    Object.defineProperty(input, 'lowGain', {
        set: function(value) {
            data.lowGain = value;
            if (!data.bypass)
                input.eqLGain.gain.value = value;
        }
    });
    Object.defineProperty(input, 'bypass', {
        get: function() {
            return data.bypass;
        },
        set: function(value) {
            input.eqHGain.gain.value = value ? 1 : data.highGain;
            input.eqMGain.gain.value = value ? 1 : data.midGain;
            input.eqLGain.gain.value = value ? 1 : data.lowGain;
            data.bypass = value;
        }
    });
    input.highGain = data.highGain;
    input.midGain = data.midGain;
    input.lowGain = data.lowGain;
    input.bypass = data.bypass;
    return input;
};

OMusicPlayer.prototype.makeDelay = function (data) {
    var p = this;
    var input = p.context.createGain();
    var output = p.context.createGain();
    var delay  = p.context.createDelay();
    var feedback = p.context.createGain();
    
    feedback.gain.value = data.feedback;
    delay.delayTime.value = data.time;
    
    input.connect(delay);
    input.connect(output);
    delay.connect(feedback);
    feedback.connect(delay);
    feedback.connect(output);
    
    input.connect = function (to) {
        output.connect(to);
    };
    input.disconnect = function (to) {
        output.disconnect(to);
    };
    
    Object.defineProperty(input, 'time', {
        set: function(value) {
            data.time = value;
            //delay.delayTime.setValueAtTime(value, p.context.currentTime);
            delay.delayTime.exponentialRampToValueAtTime(value, p.context.currentTime + p.latency/1000);
        }
    });
    Object.defineProperty(input, 'feedback', {
        set: function(value) {
            data.feedback = value;
            feedback.gain.exponentialRampToValueAtTime(data.bypass ? 0 : value, p.context.currentTime + p.latency/1000);
        }
    });
    Object.defineProperty(input, 'bypass', {
        get: function() {
            return data.bypass;
        },
        set: function(value) {
            data.bypass = value;
            feedback.gain.setValueAtTime(value ? 0 : data.feedback, p.context.currentTime);
        }
    });
    return input;
};



OMusicPlayer.prototype.makeRadPad = function (data) {
    var p = this;
    var input = p.context.createGain();
    var output = p.context.createGain();
    input.connect(output);

    var fxs = [undefined, undefined, undefined, undefined];
    var isTouching = false;

    input.connectWA = input.connect;
    input.disconnectWA = input.disconnect;
    input.connect = function (to) {
        output.connect(to);
    };
    input.disconnect = function (to) {
        output.disconnect(to);
    };

    var getNextNode = function (fxI) {
        for (var i = fxI + 1; i < fxs.length; i++) {
            if (fxs[i]) {
                return fxs[i];
            }
        }
        return output;
    };
    var getPrevNode = function (fxI) {
        for (var i = fxI - 1; i >= 0; i--) {
            if (fxs[i]) {
                return fxs[i];
            }
        }
        return input;
    };
    var initialized = false;
    var setFX = function (value, i) {
        if (data["fx" + (1 + i)] === value && initialized) {
            return;
        }
        data["fx" + (1 + i)] = value;
        
        var prevNode = getPrevNode(i);
        var nextNode = getNextNode(i);
        
        if (fxs[i]) {
            if (prevNode === input) {
                try {input.disconnectWA(fxs[i]);}
                catch (e) {input.disconnectWA();}
            }
            else {
                try {prevNode.disconnect(fxs[i]);} 
                catch (e) {prevNode.disconnect();}
            }
            
            try {fxs[i].disconnect(nextNode);} 
            catch (e) {fxs[i].disconnect();}
        }
        else {
            if (prevNode === input) {
                try {input.disconnectWA(nextNode);}
                catch (e) {input.disconnectWA();}
            }
            else {
                try {prevNode.disconnect(nextNode);} 
                catch (e) {prevNode.disconnect();}
            }
        }
        fxs[i] = undefined;
        
        if (value !== "None") {
            fxs[i] = makeFX(value);
            if (prevNode === input) {
                input.connectWA(fxs[i]);
            }
            else {
                prevNode.connect(fxs[i]);
            }
            fxs[i].connect(nextNode);
        }
        else {
            if (prevNode === input) {
                input.connectWA(nextNode);
            }
            else {
                prevNode.connect(nextNode);
            }
        }
    };
    
    var makeFX = function (value) {
        var name;
        if (p.fx[value]) {
            var node = p.makeFXNode(value);
            name = value;
        }
        if (value === "LPF" || value === "HPF" || value === "BPF") {
            name = "Filter";
            var node = p.makeFXNode(name);
            node.filterType = value === "LPF" ? "lowpass" : value === "HPF" ?
                    "highpass" : "bandpass";
        }
        node.padAxes = {};
        p.fx[name].controls.forEach(function (control) {
            if (control.axis) {
                node.padAxes[control.axis] = control;
            }
        });
        node.bypass = true;
        return node;
    };
    
    Object.defineProperty(input, 'fx1', {
        set: function (value) {
            setFX(value, 0);
        }
    });
    Object.defineProperty(input, 'fx2', {
        set: function (value) {
            setFX(value, 1);
        }
    });
    Object.defineProperty(input, 'fx3', {
        set: function (value) {
            setFX(value, 2);
        }
    });
    Object.defineProperty(input, 'fx4', {
        set: function (value) {
            setFX(value, 3);
        }
    });

    Object.defineProperty(input, 'xy', {
        set: function (xy) {
            fxs.forEach(function (fx) {
                if (!fx) return;
                if (xy[0] === -1) {
                    fx.bypass = true;
                    return;
                }
                if (fx.bypass) {
                    fx.bypass = false;
                }
                if (fx && fx.padAxes.x) {
                    fx[fx.padAxes.x.property] = xy[0] * fx.padAxes.x.max;
                }
                if (fx && fx.padAxes.y) {
                    fx[fx.padAxes.y.property] = xy[1] * fx.padAxes.y.max;
                }                
                if (fx && fx.padAxes.revx) {
                    fx[fx.padAxes.revx.property] = (1 - xy[0]) * fx.padAxes.revx.max;
                }
                if (fx && fx.padAxes.revy) {
                    fx[fx.padAxes.revy.property] = (1 - xy[1]) * fx.padAxes.revy.max;
                }                
            });
        }
    });
    
    Object.defineProperty(input, 'bypass', {
        get: function() {
            return data.bypass;
        },
        set: function(value) {
            data.bypass = value;
        }
    });

    if (data.fx1) setFX(data.fx1, 0);
    if (data.fx2) setFX(data.fx2, 1);
    if (data.fx3) setFX(data.fx3, 2);
    if (data.fx4) setFX(data.fx4, 3);
    initialized = true;

    return input;
};
