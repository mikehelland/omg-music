if (typeof tg !== "object") var tg = {}; 
/*
 * OMG LIVE!
 * 
*/

tg.omglive = {
    setup: function (callback) {
        
        if (typeof OMGRealTime !== "undefined") {
            callback();
            return;
        }
        
        tg.omglive.username = tg.user ? tg.user.username : "guest" + (Math.round(Math.random() * 1000))
        
        var scriptTag = document.createElement("script");
        scriptTag.src = "/js/omgrtc.js";
        scriptTag.async = false;
        scriptTag.onload = callback;
        document.body.appendChild(scriptTag);    
    },
    turnOnPart: function (part, callback) {

        if (typeof io === "undefined") {
            tg.omglive.setup(function () {
                tg.omglive.turnOnPart(part, callback);
            });
            return;
        }

        part.omglive = {users: {}, notes: []};
        part.omglive.notes.autobeat = 1;

        var url = window.location.origin.replace("http:", "https:");

        part.socket = io(url + "/omg-live");
        part.socket.emit("startBasic", {room: part.liveRoom, user: tg.omglive.username});
        part.socket.on("basic", function (data) {
            if (data.x === -1) {
                tg.omglive.partDataEnd(part, data);
            }
            else {
                tg.omglive.partData(part, data);
            }
            //if (!tg.player.playing && tg.currentFragment === tg.instrument) {
            if (tg.currentFragment === tg.instrument) {
                tg.instrument.mm.draw();
            }
            if (tg.presentationMode && part.presentationUI) {
                part.presentationUI.draw()
            }
        });
        tg.requirePartMelodyMaker(part);
        callback();
    },
    turnOn: function (action, callback) {

        if (typeof OMGRealTime === "undefined") {
            tg.omglive.setup(function () {
                tg.omglive.turnOn(action, callback);
            });
            return;
        }

        if (tg.omglive.socket) {
            //if we're already connected, 
            tg.omglive.socket.emit("leaveSession", {room: tg.liveRoom, user: tg.omglive.username});
            callback()
        }

        //tg.omglive.users = {};
        
        var url = window.location.origin.replace("http:", "https:");

        tg.omglive.socket = new OMGRealTime()
        
        tg.omglive.socket.on("data", function (data) {
            tg.omglive.ondata(data);
        });
        tg.omglive.socket.on("chat", function (data) {
            tg.omglive.onchat(data);
        });
        tg.omglive.socket.onjoined = function (data) {
            tg.omglive.onjoin(data);
        };
        tg.omglive.socket.onnewuser = function (name, data) {
            tg.omglive.onchat({text: "User joined: " + name});
        };
        tg.omglive.socket.onuserleft = function (name) {
            tg.omglive.onchat({text: "User left: " + name});
        };
        tg.omglive.socket.onuserdisconnected = function (name) {
            tg.omglive.onchat({text: "User disconnected: " + name});
        };
        
        tg.sequencer.onchange = tg.omglive.onSequencerChangeListener;
        tg.instrument.onchange = tg.omglive.onVerticalChangeListener;
    
        tg.onLoadSongListeners.push(tg.omglive.onLoadSongListener);

        tg.omglive.socket.onready = () => {
            callback();
        }
    },
    goLive: function (callback) {
        tg.omglive.sendDataToRoom = true
        tg.omglive.sendDataTo = undefined
        tg.omglive.turnOn("goLive", function () {
            var roomName = location.pathname + "?room=" + tg.omglive.username
            tg.omglive.socket.join(roomName, tg.omglive.username, tg.song.getData());            
            if (callback) callback()
        })
    },
    join: function (roomName, callback) {
        tg.omglive.sendDataToRoom = true
        tg.omglive.sendDataTo = undefined
        
        tg.joinLiveRoom = roomName
        roomName = location.pathname + "?room=" + roomName
        tg.omglive.joinCallback = callback
        if (tg.omglive.socket) {
            tg.omglive.removeListeners();
            tg.omglive.socket.leave();
            tg.omglive.socket.join(roomName, tg.omglive.username);
        }
        else {
            tg.omglive.turnOn("join", function () {
                tg.omglive.socket.join(roomName, tg.omglive.username);
            })    
        }
    }
};

tg.omglive.setupClient = function (message) {
    var onerror = tg.omglive.onerror;

    tg.omglive.socket.on("rtc", function (message) {
        if(message.type && message.type === 'answer') {
            var answer = new RTCSessionDescription(message);
            rtcpeerconn.setRemoteDescription(answer, function() {/* handler required but we have nothing to do */}, onerror);
        } else if(rtcpeerconn.remoteDescription) {
            // ignore ice candidates until remote description is set
            rtcpeerconn.addIceCandidate(new RTCIceCandidate(message.candidate));
        }
    });
    
    tg.omglive.peerConnection = new RTCPeerConnection(
        {iceServers: [{ 'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]}, 
        {optional: [{RtpDataChannels: false}]}
    );
    
    tg.omglive.peerConnection.ondatachannel = function(event) {
        tg.omglive.peerDataChannel = event.channel;
        tg.omglive.peerDataChannel.onmessage = function(event) {
            console.log('RTCDataChannel peer ' + peerId + ' says: ' + event.data);    
        }
        tg.omglive.peerDataChannel.onerror = onerror;
        tg.omglive.onchat({text: "WebRTC enabled as client"});
    };

    var offer = new RTCSessionDescription(message.message);
    var rtcpeerconn = tg.omglive.peerConnection;
    rtcpeerconn.setRemoteDescription(offer, function() {
        rtcpeerconn.createAnswer(function(answer) {
            rtcpeerconn.setLocalDescription(answer, function() {

                tg.omglive.socket.emit("rtc", {
                    user: tg.omglive.username,
                    message: answer
                });
            }, onerror);
        }, onerror);                
    }, onerror);

    rtcpeerconn.onicecandidate = function (event) {
        if (!event || !event.candidate) return;
        tg.omglive.socket.emit("rtc", {
            peerId: peerId,
            message: {candidate: event.candidate}
        });
    };

};

tg.omglive.setupServer = function () {
    tg.omglive.rtcClients = [];
    var rtcpeerconn = new RTCPeerConnection(
        {iceServers: [{ 'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]}, 
        {optional: [{RtpDataChannels: false}]}
    );

    tg.omglive.serverConnection = rtcpeerconn;

    var rtcdatachannel;
    rtcpeerconn.ondatachannel = function(event) {
        console.log("ondatachannel !!!!!!!!!!!!!! Shouldn't happen, right?", event)
        /*rtcdatachannel = event.channel;
        rtcdatachannel.onopen = tg.omglive.onreadyrtc;
        rtcdatachannel.onerror = onerror;*/
    };
    
    tg.omglive.socket.on("rtc", function (data) {
        if(data.message && data.message.type === 'answer') {
            var answer = new RTCSessionDescription(data.message);
            rtcpeerconn.setRemoteDescription(answer, function() {/* handler required but we have nothing to do */}, tg.omglive.onerror);
        } else if(rtcpeerconn.remoteDescription) {
            // ignore ice candidates until remote description is set
            rtcpeerconn.addIceCandidate(new RTCIceCandidate(data.message.candidate));
        }
    });

    rtcpeerconn.onicecandidate = function (event) {
        if (!event || !event.candidate) return;
        tg.omglive.socket.emit("rtc", {
            peerId: peerId,
            message: {candidate: event.candidate}
        });
    };
    
    
    rtcdatachannel = rtcpeerconn.createDataChannel("test");
    rtcdatachannel.onopen = function () {
        tg.omglive.onreadyrtc(rtcdatachannel);
    }
    rtcdatachannel.onerror = tg.omglive.onerror;
    tg.omglive.serverDataChannel = rtcdatachannel;

    rtcpeerconn.createOffer(function(offer) {
        rtcpeerconn.setLocalDescription(offer, function() {
            //var output = offer.toJSON();
            //if(typeof output === 'string') output = JSON.parse(output); // normalize: RTCSessionDescription.toJSON returns a json str in FF, but json obj in Chrome

            tg.omglive.socket.emit("rtc", {
                inst: 'send', 
                peerId: peerId, 
                message: offer
            });
        }, tg.omglive.onerror);
    }, tg.omglive.onerror);
};

tg.omglive.onerror = function(e) {
    console.error('====== WEBRTC ERROR ======', arguments);
    throw new Error(e);
};
tg.omglive.onreadyrtc = function(rtcdatachannel) {
    tg.omglive.onchat({text: "WebRTC enabled as server"});
    rtcdatachannel.onmessage = function(event) {
        var data = JSON.parse(event.data);
        if (data.action === "verticalChangeFrets") {
            tg.omglive.onVerticalChangeFrets(data);
            //if (tg.presentationMode) part.presentationUI.draw();
            
        }
    };
};


var peerId = "";

tg.omglive.emit = (type, data) => {
    if (tg.omglive.sendDataToRoom) {
        data.room = true
    }
    else {
        // todo send to one host
    }
    tg.omglive.socket.emit(type, data)
}

tg.omglive.setupListeners = function () {
    tg.player.onPlayListeners.push(tg.omglive.onPlayListener);
    tg.song.onBeatChangeListeners.push(tg.omglive.onBeatChangeListener);
    tg.song.onKeyChangeListeners.push(tg.omglive.onKeyChangeListener);
    tg.song.onChordProgressionChangeListeners.push(tg.omglive.onChordProgressionChangeListener);
    tg.song.onPartAudioParamsChangeListeners.push(tg.omglive.onPartAudioParamsChangeListener);
    tg.song.onPartAddListeners.push(tg.omglive.onPartAddListener);
    tg.song.onFXChangeListeners.push(tg.omglive.onFXChangeListener)
};

tg.omglive.removeListeners = function () {
    tg.omglive.removeListener(tg.player.onPlayListeners, tg.omglive.onPlayListener);
    tg.omglive.removeListener(tg.song.onBeatChangeListeners, tg.omglive.onBeatChangeListener);
    tg.omglive.removeListener(tg.song.onKeyChangeListeners, tg.omglive.onKeyChangeListener);
    tg.omglive.removeListener(tg.song.onChordProgressionChangeListeners, tg.omglive.onChordProgressionChangeListener);
    tg.omglive.removeListener(tg.song.onPartAudioParamsChangeListeners, tg.omglive.onPartAudioParamsChangeListener);
    tg.omglive.removeListener(tg.song.onPartAddListeners, tg.omglive.onPartAddListener);
    tg.omglive.removeListener(tg.song.onFXChangeListeners, tg.omglive.onFXChangeListener);

};

tg.omglive.removeListener = function (listeners, listener) {
    listeners.splice(listeners.indexOf(listener), 1);
};

tg.omglive.onLoadSongListener = function (source) {
    if (source === "omglive") return;

    tg.omglive.setupListeners();

    tg.omglive.emit("data", {
        action: "loadSong", 
        value: tg.song.getData()
    });
};

tg.omglive.onFXChangeListener = function (action, part, fx, source) {
    if (source === "omglive") return;

    tg.omglive.emit("data", {
        action: "fxChange",
        fxAction: action, 
        partName: part === tg.song ? undefined : part.data.name,
        fxName: fx.data.name,
        fxData: action === "add" ? fx.data : undefined
    });
};

tg.omglive.onBeatChangeListener = function (beatParams, source) {
    if (source === "omglive") return;

    tg.omglive.emit("data", {
        property: "beatParams", 
        value: beatParams
    });
};

tg.omglive.onKeyChangeListener = function (keyParams, source) {
    if (source === "omglive") return;

    tg.omglive.emit("data", {
        property: "keyParams", 
        value: keyParams
    });
};

tg.omglive.onChordProgressionChangeListener = function (source) {
    if (source === "omglive") return;

    tg.omglive.emit("data", {
        property: "chordProgression", 
        value: tg.currentSection.data.chordProgression
    });
};

tg.omglive.onPartAudioParamsChangeListener = function (part, source) {
    if (source === "omglive") return;

    tg.omglive.emit("data", {
        property: "audioParams", 
        partName: part.data.name,
        value: part.data.audioParams
    });
};

tg.omglive.onPartAddListener = function (part, source) {
    if (source === "omglive") return;

    tg.omglive.emit("data", {
        action: "partAdd", 
        part: part.data,
    });
};

tg.omglive.onSequencerChangeListener = function (part, trackI, subbeat) {
    var data = {
        action: "sequencerChange", 
        partName: part.data.name,
        value: part.data.tracks[trackI].data[subbeat],
        trackI: trackI,
        subbeat: subbeat
    };
    tg.omglive.emit("data", data);
};

tg.omglive.onVerticalChangeListener = function (part, frets, autobeat) {
    if (tg.omglive.peerDataChannel) {
        tg.omglive.peerDataChannel.send(JSON.stringify({
            action: "verticalChangeFrets", 
            partName: part.data.name,
            value: frets,
            autobeat: frets.autobeat
        }));
        return;
    }
    
    if (tg.omglive.calculateNotesLocally) {
        tg.omglive.emit("data", {
            action: "verticalChangeNotes", 
            partName: part.data.name,
            value: part.data.notes
        });
    }
    else {
        tg.omglive.emit("data", {
            action: "verticalChangeFrets", 
            partName: part.data.name,
            value: frets,
            autobeat: frets.autobeat
        });        
    }
};

tg.omglive.onPlayListener = function (play) {
    if (tg.remoteTo) {
        return
    }
    var data = {
        action: play ? "play" : "stop"
    };
    tg.omglive.emit("data", data);
};

tg.omglive.onjoin = function (data) {
    tg.omglive.onchat({text: Object.keys(data.users).length + " users here"})
    if (data.thing && (tg.remoteTo || tg.joinLiveRoom)) {
        tg.loadSong(data.thing, "omglive", tg.omglive.joinCallback);
        tg.omglive.joinCallback = undefined
    }
    if (data.offer) {
        tg.omglive.setupClient(data.offer);
    }
    tg.omglive.setupListeners();
};

tg.omglive.ondata = function (data) {
    if (data.action === "loadSong") {
        tg.omglive.removeListeners();
        tg.loadSong(data.value, "omglive");
        tg.omglive.setupListeners();
    }
    else if (data.property === "beatParams") {
        tg.song.data.beatParams.bpm = data.value.bpm;
        tg.song.data.beatParams.shuffle = data.value.shuffle;
        tg.song.data.beatParams.subbeats = data.value.subbeats;
        tg.song.data.beatParams.beats = data.value.beats;
        tg.song.data.beatParams.measures = data.value.measures;
        tg.song.beatsChanged("omglive");
    }
    else if (data.property === "keyParams") {
        tg.song.data.keyParams.rootNote = data.value.rootNote;
        tg.song.data.keyParams.scale = data.value.scale;
        tg.song.keyChanged("omglive");
    }
    else if (data.property === "chordProgression") {
        tg.currentSection.data.chordProgression = data.value;
        tg.song.chordProgressionChanged("omglive");
    }
    else if (data.property === "audioParams" && data.partName) {
        let part = tg.currentSection.getPart(data.partName);
        if (!part) return;
        part.data.audioParams.mute = data.value.mute;
        part.data.audioParams.gain = data.value.gain;
        part.data.audioParams.pan = data.value.pan;
        part.data.audioParams.warp = data.value.warp;
        tg.song.partMuteChanged(part, "omglive");
    }
    else if (data.action === "partAdd") {
        tg.addPart(data.part.soundSet, "omglive");
    }
    else if (data.action === "sequencerChange") {
        let part = tg.currentSection.getPart(data.partName);
        part.data.tracks[data.trackI].data[data.subbeat] = data.value;
        if (part.drumMachine && !part.drumMachine.hidden) part.drumMachine.draw();
        if (tg.presentationMode) part.presentationUI.draw();
    }
    else if (data.action === "verticalChangeFrets") {
        tg.omglive.onVerticalChangeFrets(data);
        if (tg.presentationMode) part.presentationUI.draw();
    }
    else if (data.action === "fxChange") {
        tg.omglive.onFXChange(data);
    }
    else if (data.action === "play") {
        if (tg.remoteTo && !tg.player.playing) {
            tg.player.play()
        }
    }
    else if (data.action === "stop") {
        if (tg.remoteTo && tg.player.playing) {
            tg.player.stop()
        }
    }
    else if (data.action === "playSound") {
        //store the part so not searching everytime
        if (tg.omglive.lastPartName !== data.partName) {
            tg.omglive.lastPart = tg.currentSection.getPart(data.partName)
            tg.omglive.lastPartName = data.partName
        }
        tg.player.playSound(tg.omglive.lastPart.data.tracks[data.noteNumber].sound, 
                tg.omglive.lastPart, 
                tg.omglive.lastPart.data.tracks[data.noteNumber].audioParams, data.strength)
    }
};

tg.omglive.onchat = function (data) {
    tg.liveFragment.chatArea.append("\n" + (data.user ? data.user + ": " : "") + data.text);
    tg.liveFragment.chatArea.scrollTop = tg.liveFragment.chatArea.scrollHeight;
};

tg.omglive.onVerticalChangeFrets = function (data) {
    var part = tg.currentSection.getPart(data.partName);
    if (data.value.length > 0) {
        data.value.autobeat = data.autobeat;
        tg.player.playLiveNotes(data.value, part, 0);
    }
    else {
        tg.player.endLiveNotes(part);
    }
    if (part.mm && !part.mm.hidden) part.mm.draw();
};

tg.omglive.onFXChange = function (data) {
    let part = data.partName ? tg.currentSection.getPart(data.partName) : tg.song;
    if (!part) return;

    if (data.fxAction === "add") {
        tg.player.addFXToPart(data.fxName, part, "omglive");
    }
    else if (data.fxAction === "remove") {
        var fx = part.getFX(data.fxName)
        tg.player.removeFXFromPart(fx, part, "omglive");
    }
    else if (data.fxAction) {
        var fx = part.getFX(data.fxName)
        for (var property in data.fxAction) {
            tg.player.adjustFX(fx, part, property, data.fxAction[property], "omglive");
        }
    }
}

tg.omglive.partData = function (part, data) {
    
    var fret = Math.max(0, Math.min(part.mm.frets.length - 1,
        part.mm.skipFretsBottom + Math.round((1 - data.y) * 
            (part.mm.frets.length - 1 - part.mm.skipFretsTop - part.mm.skipFretsBottom))));

    var noteNumber = part.mm.frets[fret].note;

    var note = {beats: 0.25};
    if (part.omglive.users[data.user]) {
        if (part.omglive.users[data.user].note.scaledNote === noteNumber) {
            part.omglive.users[data.user].x = data.x;
            part.omglive.users[data.user].y = data.y;
            return;
        }
        note = part.omglive.users[data.user].note;
    }
    else {
        part.omglive.notes.push(note);
    }
    note.note = fret - part.mm.frets.rootNote,
    note.scaledNote = noteNumber;
    data.note = note;

    part.omglive.users[data.user] = data;
    
    tg.player.playLiveNotes(part.omglive.notes, part, 0);    
};

tg.omglive.partDataEnd = function (part, data) {
    var noteIndex = part.omglive.notes.indexOf(part.omglive.users[data.user].note);
    part.omglive.notes.splice(noteIndex, 1);
    delete part.omglive.users[data.user];
    
    if (part.omglive.notes.length > 0) {
        tg.player.playLiveNotes(part.omglive.notes, part, 0);
    }
    else {
        tg.player.endLiveNotes(part);
    }   
};

tg.omglive.getRoomName = function () {
    var roomName = "";
    if (tg.user && tg.user.username) {
        roomName += tg.user.username.trim() + "-";
    }
    if (tg.song.data.name) {
        roomName += tg.song.data.name;
    }
    return roomName;
};

tg.omglive.getRoomNamePart = function (part) {
    var roomName = tg.omglive.getRoomName();
    if (roomName) {
        roomName += "-";
    }
    roomName += part.data.name.substr(0, part.data.name.indexOf(" "));
    return "gauntlet" //todo put this back to roomName;
};

tg.omglive.switchRoom = function (newRoom) {
    if (tg.omglive.socket) {
        tg.omglive.socket.emit("leaveSession", {room: tg.liveRoom, user: tg.omglive.username});
        tg.omglive.socket.join(newRoom, tg.omglive.username, tg.song.getData());
    }
    tg.liveRoom = newRoom;
};

tg.omglive.switchRoomPart = function (part, newRoom) {
    part.socket.emit("leaveSession", {room: part.liveRoom, user: tg.omglive.username});
    part.liveRoom = newRoom;
    part.socket.join(part.liveRoom, tg.omglive.username);
};

tg.omglive.chat = function (text) {
    if (!text) return;
    tg.omglive.socket.emit("chat", {
        user: tg.omglive.username, 
        text: text,
        room: true
    });
    tg.omglive.onchat({text: text, user: tg.omglive.username})
};

tg.omglive.sendPlaySound = function (noteNumber, strength, part) {
    tg.omglive.emit("data", {
        action: "playSound",
        partName: part.data.name,
        user: tg.omglive.username, 
        noteNumber: noteNumber,
        strength: strength
    });
}

