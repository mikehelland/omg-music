var tg = {
    partList: document.getElementById("part-list"),
    beatsButton: document.getElementById("beats-button"),
    keyButton: document.getElementById("key-button"),
    chordsButton: document.getElementById("chords-button"),
    chordsEditorView: document.getElementById("chords-fragment-chords-view"),
    sectionCaptionDiv: document.getElementById("tool-bar-section-button")

};

tg.setSongControlsUI = function () {
    tg.keyButton.innerHTML = tg.keyHelper.getKeyCaption(tg.song.data.keyParams);
    tg.beatsButton.innerHTML = tg.song.data.beatParams.bpm + " bpm";
    var chordsCaption = tg.makeChordsCaption();
    tg.chordsButton.innerHTML = chordsCaption;
    tg.chordsEditorView.innerHTML = chordsCaption;
    
    tg.sectionCaptionDiv.innerHTML = tg.currentSection.data.name || "(Untitled)";
};

tg.setupPartButton = function (omgpart) {
    partDiv = document.createElement("div");
    partDiv.className = "part";
    
    var obutton;
    obutton = document.createElement("div");
    obutton.className = "part-options-button";
    obutton.innerHTML = "&#9776;";
    partDiv.appendChild(obutton);
    obutton.onclick = function (e) {
        tg.showFragment(tg.partOptionsFragment, obutton, omgpart);
    };
    
    var bigbutton = document.createElement("div");
    bigbutton.className = "part-button";
    bigbutton.innerHTML = omgpart.data.soundSet.name;
    bigbutton.onclick = function (e) {
        tg.hideDetails();
        if (omgpart.data.surface.url === "PRESET_SEQUENCER") {
            tg.sequencer.show(omgpart);            
        }
        else if (omgpart.data.surface.url === "PRESET_VERTICAL") {
            tg.instrument.show(omgpart);
        }
        tg.newChosenButton(bigbutton);
    };
    partDiv.appendChild(bigbutton);
    
    var button = document.createElement("div");
    button.className = "part-mute-button";
    button.innerHTML = "M";
    button.onclick = function () {
        omgpart.data.audioParams.mute = !omgpart.data.audioParams.mute;
        tg.song.partMuteChanged(omgpart);
    }
    button.refresh = function () {
        button.style.backgroundColor = omgpart.data.audioParams.mute ?
            "#800000" : "#008000";
    };
    button.refresh();
    
    partDiv.appendChild(button);
    tg.partList.appendChild(partDiv);
    
    omgpart.div = partDiv;
    omgpart.muteButton = button;
    return partDiv;
};

tg.getSong = function (callback) {
    var id = 0;
    var blank;
    if (document.location.search.length > 1) {
        document.location.search.slice(1).split("&").forEach(function (param) {
            if (param.startsWith("id=")) {
                id = param.split("=")[1];
            }
            if (param.startsWith("blank")) {
                blank = true;
            }
        });
    }

    if (!id) {
        var defaultSong;
        if (blank) {
            defaultSong = tg.newBlankSong();
        }
        else {
            defaultSong = {"fx":[],"name":"default","type":"SONG","sections":[{"name":"Intro","type":"SECTION","parts":[{"fx":[],"type":"PART","notes":[],"surface":{"url":"PRESET_VERTICAL","skipTop":15,"skipBottom":25},"soundSet":{"url":"PRESET_OSC_SINE","name":"Sine Oscillator","type":"SOUNDSET","octave":5,"lowNote":0,"highNote":108,"chromatic":true},"audioParams":{"pan":-0.5654761904761905,"gain":0.24350787067584123,"warp":1,"volume":0.18825301204819278,"delayTime":0.3187702265372168,"delayLevel":0.45307443365695793}},{"fx":[],"type":"PART","tracks":[{"url":"hh_kick","data":[true,null,null,null,0,0,null,0,0,null,null,null,0],"name":"Kick","sound":"http://mikehelland.com/omg/drums/hh_kick.mp3","audioParams":{"pan":0,"gain":1,"warp":1}},{"url":"hh_clap","data":[null,null,null,null,0,null,null,null,null,null,null,null,0],"name":"Clap","sound":"http://mikehelland.com/omg/drums/hh_clap.mp3","audioParams":{"pan":0,"gain":1,"warp":1}},{"url":"rock_hihat_closed","data":[true,null,0,null,true,null,0,null,true,null,0,null,true,null,0],"name":"HiHat Closed","sound":"http://mikehelland.com/omg/drums/rock_hihat_closed.mp3","audioParams":{"pan":0,"gain":1,"warp":1}},{"url":"hh_hihat","data":[null,null,null,null,null,null,false,null,null,null,null,null,null,null,false],"name":"HiHat Open","sound":"http://mikehelland.com/omg/drums/hh_hihat.mp3","audioParams":{"pan":0,"gain":1,"warp":1}},{"url":"hh_tamb","data":[],"name":"Tambourine","sound":"http://mikehelland.com/omg/drums/hh_tamb.mp3","audioParams":{"pan":0,"gain":1,"warp":1}},{"url":"hh_tom_mh","data":[null,null,null,null,null,null,null,null,false,null,null,false,0,false],"name":"Tom H","sound":"http://mikehelland.com/omg/drums/hh_tom_mh.mp3","audioParams":{"pan":0,"gain":1,"warp":1}},{"url":"hh_tom_ml","data":[null,null,null,null,null,null,null,null,null,null,0],"name":"Tom M","sound":"http://mikehelland.com/omg/drums/hh_tom_ml.mp3","audioParams":{"pan":0,"gain":1,"warp":1}},{"url":"hh_tom_l","data":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,false],"name":"Tom L","sound":"http://mikehelland.com/omg/drums/hh_tom_l.mp3","audioParams":{"pan":0,"gain":1,"warp":1}}],"surface":{"url":"PRESET_SEQUENCER"},"soundSet":{"id":1207,"url":"http://openmusic.gallery/data/1207","data":[{"url":"hh_kick","data":[true,null,null,null,true,null,null,null,true,null,null,null,true],"name":"Kick","sound":"http://mikehelland.com/omg/drums/hh_kick.mp3"},{"url":"hh_clap","data":[null,null,null,null,true,null,null,null,null,null,null,null,true],"name":"Clap","sound":"http://mikehelland.com/omg/drums/hh_clap.mp3"},{"url":"rock_hihat_closed","data":[true,null,true,null,true,null,true,null,true,null,true,null,true,null,true],"name":"HiHat Closed","sound":"http://mikehelland.com/omg/drums/rock_hihat_closed.mp3"},{"url":"hh_hihat","data":[null,null,null,null,null,null,false,null,null,null,null,null,null,null,false],"name":"HiHat Open","sound":"http://mikehelland.com/omg/drums/hh_hihat.mp3"},{"url":"hh_tamb","data":[],"name":"Tambourine","sound":"http://mikehelland.com/omg/drums/hh_tamb.mp3"},{"url":"hh_tom_mh","data":[null,null,null,null,null,null,null,null,false,null,null,false,true,false],"name":"Tom H","sound":"http://mikehelland.com/omg/drums/hh_tom_mh.mp3"},{"url":"hh_tom_ml","data":[null,null,null,null,null,null,null,null,null,null,true],"name":"Tom M","sound":"http://mikehelland.com/omg/drums/hh_tom_ml.mp3"},{"url":"hh_tom_l","data":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,true,false],"name":"Tom L","sound":"http://mikehelland.com/omg/drums/hh_tom_l.mp3"}],"name":"Hip Kit","type":"SOUNDSET","prefix":"http://mikehelland.com/omg/drums/","lowNote":72,"postfix":".mp3","user_id":"1","approved":true,"username":"m                   ","chromatic":false,"created_at":1542271035794,"last_modified":1542271055684,"defaultSurface":"PRESET_SEQUENCER"},"audioParams":{"pan":0,"gain":0.7228178904703554,"warp":1,"volume":0.6,"delayTime":0.09870550161812297,"delayLevel":0.12297734627831715}}],"chordProgression":[0]}],"keyParams":{"scale":[0,2,3,5,7,8,10],"rootNote":9},"beatParams":{"bpm":108,"beats":4,"shuffle":0,"measures":1,"subbeats":4},"created_at":1547004419230,"last_modified":1547004419230,"id":409}
        }
        callback(defaultSong);
    }    
    else {
        //omg.server.getId(id, function (response) {
        fetch("/data/" + id).then(function (response) {
            response.json().then(data => callback(data));
        });
    }
};

tg.loadSong = function (songData) {
    var className = songData.constructor.name;
    if (className === "OMGSong") {
        tg.song = songData;
    }
    else {
        tg.song = new OMGSong(null, songData);
    }
    
    tg.loadSection(tg.song.sections[0])
        
    document.getElementById("tool-bar-song-button").innerHTML = tg.song.data.name || "(Untitled)";
    
    tg.song.onKeyChangeListeners.push(function () {
        tg.player.rescaleSection(tg.currentSection);
        tg.setSongControlsUI();
    });
    tg.song.onBeatChangeListeners.push(function () {
        tg.setSongControlsUI();
    });
    tg.song.onChordProgressionChangeListeners.push(function () {
        tg.setSongControlsUI();
    });
    tg.song.onPartAudioParamsChangeListeners.push(function (part) {
        if (part.muteButton) {
            part.muteButton.refresh();
        }
    });
    tg.song.onPartAddListeners.push(function (part) {
        tg.loadPart(part);
    });
    
    if (tg.player) {
        tg.player.prepareSong(tg.song);
        tg.songOptionsFragment.isSetupForSong = false;
    }

};

tg.loadSection = function (section) {
    tg.currentSection = section;
    tg.partList.innerHTML = "";
    for (var j = 0; j < section.parts.length; j++) {
        tg.loadPart(section.parts[j]);        
    }
    //if (tg.player.loopSection)
    tg.setSongControlsUI();
};

tg.loadPart = function (part) {
    var div = tg.setupPartButton(part);

    if (part.data.surface.url === "PRESET_VERTICAL" && !part.mm && typeof OMGMelodyMaker !== "undefined") {
        part.mm = new OMGMelodyMaker(tg.instrument.surface, part, tg.player, tg.instrument.backgroundCanvas);
        part.mm.readOnly = false;
    }

    return div;
};

tg.makeChordsCaption = function (chordI) {
    var chordsCaption = "";
    tg.currentSection.data.chordProgression.forEach(function (chordI, i) {
        if (tg.player && tg.player.playing && i === tg.player.currentChordI) {
            chordsCaption += "<span class='current-chord'>";
        }
        chordsCaption += tg.makeChordCaption(chordI);
        if (tg.player && tg.player.playing && i === tg.player.currentChordI) {
            chordsCaption += "</span>";
        }
        chordsCaption += " "
    });
    return chordsCaption;
};

tg.makeChordCaption = function (chordI) {
    var index = chordI < 0 ? tg.song.data.keyParams.scale.length + chordI : chordI;
    var chord = tg.song.data.keyParams.scale[index];
    var sign = chordI < 0 ? "-" : "";
    if (chord === 0) return sign + "I";
    if (chord === 2) return sign + "II";
    if (chord === 3 || chord === 4) return sign + "III";
    if (chord === 5) return sign + "IV";
    if (chord === 6) return sign + "Vb";
    if (chord === 7) return sign + "V";
    if (chord === 8 || chord === 9) return sign + "VI";
    if (chord === 10 || chord === 11) return sign + "VII";
    return sign + "?";
}

tg.keyHelper = {keys: ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"],
    scales: [{name: "Major", value: [0, 2, 4, 5, 7, 9, 11]},
        {name: "Minor", value: [0, 2, 3, 5, 7, 8, 10]},
        {name: "Pentatonic", value: [0, 2, 5, 7, 9]},
        {name: "Blues", value: [0, 3, 5, 6, 7, 10]}],
    getKeyCaption: function (keyParams) {
        var scaleName = "Major";
        if (keyParams && keyParams.scale) {
            tg.keyHelper.scales.forEach(function (scale) {
                if (scale.value.join() == keyParams.scale.join())
                    scaleName = scale.name;
            });
        }
        return tg.keyHelper.keys[(keyParams.rootNote || 0)] + " " + scaleName;
    }
};

tg.getSong(function (song) {
    try {
    tg.loadSong(song);
    }
    catch (e) {console.log(e)}

    var scriptTag;
    ["/js/omgservice.js","/omg-music/tuna-min.js","/omg-music/omusic_player.js",
    "tg.js",
    ].forEach(js => {
        scriptTag = document.createElement("script");
        scriptTag.src = js;
        scriptTag.async = false;
        document.body.appendChild(scriptTag);
    });        
});
