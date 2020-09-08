var tg = {
    partList: document.getElementById("part-list"),
    partArea: document.getElementById("part-area"),
    beatsButton: document.getElementById("beats-button"),
    keyButton: document.getElementById("key-button"),
    chordsButton: document.getElementById("chords-button"),
    chordsEditorView: document.getElementById("chords-fragment-chords-view"),
    sectionCaptionDiv: document.getElementById("tool-bar-section-button"),
    onLoadSongListeners: []
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
    var partDiv = document.createElement("div");
    partDiv.className = "part";
    
    var obutton;
    obutton = document.createElement("div");
    obutton.className = "part-options-button";
    obutton.innerHTML = "&#9776;";
    obutton.onclick = function (e) {
        tg.showFragment(tg.partOptionsFragment, obutton, omgpart);
    };
    
    var bigbutton = document.createElement("div");
    bigbutton.className = "part-button";
    bigbutton.innerHTML = omgpart.data.name;
    omgpart.mainFragmentButtonOnClick = function (e) {
        if (omgpart.data.surface.url === "PRESET_SEQUENCER") {
            tg.sequencer.show(omgpart);            
        }
        else if (omgpart.data.surface.url === "PRESET_VERTICAL") {
            tg.instrument.show(omgpart);
        }
        else if (omgpart.data.surface.url === "PRESET_MIC") {
            tg.showFragment(tg.micFragment, undefined, omgpart);
        }
        tg.newChosenButton(bigbutton);
    };
    bigbutton.onmousedown = function () {
        tg.partButtonOnDown(bigbutton, omgpart)
    }
    bigbutton.addEventListener("touchstart", function (e) {
        e.preventDefault()
        tg.partButtonOnDown(bigbutton, omgpart)
    })
    omgpart.mainFragmentButton = bigbutton;
    
    var muteButton = document.createElement("div");
    muteButton.className = "part-mute-button";
    muteButton.innerHTML = "M";
    muteButton.onclick = function () {
        tg.player.mutePart(omgpart, !omgpart.data.audioParams.mute)
    }
    muteButton.refresh = function () {
        muteButton.style.backgroundColor = omgpart.data.audioParams.mute ?
            "#800000" : "#008000";
    };
    muteButton.refresh();
    
    partDiv.appendChild(muteButton);
    partDiv.appendChild(bigbutton);
    partDiv.appendChild(obutton);
    
    tg.partList.appendChild(partDiv);
    
    omgpart.div = partDiv;
    omgpart.muteButton = muteButton;
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
            else if (param === "blank") {
                blank = true;
            }
            else if (param === "singlePanel") {
                tg.singlePanel = true;
            }
            else if (param.startsWith("remoteTo=")) {
                tg.remoteTo = param.split("=")[1];
                blank = true
            }
            else if (param.startsWith("room=")) {
                tg.joinLiveRoom = param.split("=")[1];
                blank = true
            }
            else if (param === "goLive") {
                tg.goLive = true
            }
            else if (param.startsWith("use")) {
                //todo this param gonna have to be parse to an array
                tg.use = [param.split("=")[1]];
                blank = true
            }
        });
    }

    if (!id) {
        var defaultSong;
        if (blank) {
            defaultSong = JSON.parse("{\"name\":\"\",\"type\":\"SONG\",\"sections\":[{\"name\":\"Intro\",\"type\":\"SECTION\",\"parts\":[],\"chordProgression\":[0]}],\"keyParams\":{\"scale\":[0,2,4,5,7,9,11],\"rootNote\":0},\"beatParams\":{\"bpm\":120,\"beats\":4,\"shuffle\":0,\"measures\":1,\"subbeats\":4}}")
        }
        else {
            defaultSong = JSON.parse("{\"fx\":[],\"name\":\"default\",\"type\":\"SONG\",\"sections\":[{\"name\":\"Intro\",\"type\":\"SECTION\",\"parts\":[{\"fx\":[],\"type\":\"PART\",\"notes\":[],\"surface\":{\"url\":\"PRESET_VERTICAL\",\"skipTop\":10,\"skipBottom\":15},\"soundSet\":{\"url\":\"PRESET_OSC_SINE\",\"name\":\"Sine Oscillator\",\"type\":\"SOUNDSET\",\"octave\":5,\"lowNote\":0,\"highNote\":108,\"chromatic\":true},\"audioParams\":{\"pan\":-0.5654761904761905,\"gain\":0.24350787067584123,\"warp\":1,\"volume\":0.18825301204819278,\"delayTime\":0.3187702265372168,\"delayLevel\":0.45307443365695793}},{\"fx\":[],\"type\":\"PART\",\"tracks\":[{\"url\":\"hh_kick\",\"data\":[1,0,0,0,0,0,0,0,0,0,0,0,0],\"name\":\"Kick\",\"sound\":\"http://mikehelland.com/omg/drums/hh_kick.mp3\",\"audioParams\":{\"pan\":0,\"gain\":1,\"warp\":1}},{\"url\":\"hh_clap\",\"data\":[0,0,0,0,0,0,0,0,0,0,0,0,0],\"name\":\"Clap\",\"sound\":\"http://mikehelland.com/omg/drums/hh_clap.mp3\",\"audioParams\":{\"pan\":0,\"gain\":1,\"warp\":1}},{\"url\":\"rock_hihat_closed\",\"data\":[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0],\"name\":\"HiHat Closed\",\"sound\":\"http://mikehelland.com/omg/drums/rock_hihat_closed.mp3\",\"audioParams\":{\"pan\":0,\"gain\":1,\"warp\":1}},{\"url\":\"hh_hihat\",\"data\":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],\"name\":\"HiHat Open\",\"sound\":\"http://mikehelland.com/omg/drums/hh_hihat.mp3\",\"audioParams\":{\"pan\":0,\"gain\":1,\"warp\":1}},{\"url\":\"hh_tamb\",\"data\":[],\"name\":\"Tambourine\",\"sound\":\"http://mikehelland.com/omg/drums/hh_tamb.mp3\",\"audioParams\":{\"pan\":0,\"gain\":1,\"warp\":1}},{\"url\":\"hh_tom_mh\",\"data\":[0,0,0,0,0,0,0,0,0,0,0,0,0,false],\"name\":\"Tom H\",\"sound\":\"http://mikehelland.com/omg/drums/hh_tom_mh.mp3\",\"audioParams\":{\"pan\":0,\"gain\":1,\"warp\":1}},{\"url\":\"hh_tom_ml\",\"data\":[0,0,0,0,0,0,0,0,0,0,0],\"name\":\"Tom M\",\"sound\":\"http://mikehelland.com/omg/drums/hh_tom_ml.mp3\",\"audioParams\":{\"pan\":0,\"gain\":1,\"warp\":1}},{\"url\":\"hh_tom_l\",\"data\":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],\"name\":\"Tom L\",\"sound\":\"http://mikehelland.com/omg/drums/hh_tom_l.mp3\",\"audioParams\":{\"pan\":0,\"gain\":1,\"warp\":1}}],\"surface\":{\"url\":\"PRESET_SEQUENCER\"},\"soundSet\":{\"id\":1207,\"url\":\"http://openmusic.gallery/data/1207\",\"data\":[{\"url\":\"hh_kick\",\"name\":\"Kick\",\"sound\":\"http://mikehelland.com/omg/drums/hh_kick.mp3\"},{\"url\":\"hh_clap\",\"name\":\"Clap\",\"sound\":\"http://mikehelland.com/omg/drums/hh_clap.mp3\"},{\"url\":\"rock_hihat_closed\",\"name\":\"HiHat Closed\",\"sound\":\"http://mikehelland.com/omg/drums/rock_hihat_closed.mp3\"},{\"url\":\"hh_hihat\",\"name\":\"HiHat Open\",\"sound\":\"http://mikehelland.com/omg/drums/hh_hihat.mp3\"},{\"url\":\"hh_tamb\",\"name\":\"Tambourine\",\"sound\":\"http://mikehelland.com/omg/drums/hh_tamb.mp3\"},{\"url\":\"hh_tom_mh\",\"name\":\"Tom H\",\"sound\":\"http://mikehelland.com/omg/drums/hh_tom_mh.mp3\"},{\"url\":\"hh_tom_ml\",\"name\":\"Tom M\",\"sound\":\"http://mikehelland.com/omg/drums/hh_tom_ml.mp3\"},{\"url\":\"hh_tom_l\",\"name\":\"Tom L\",\"sound\":\"http://mikehelland.com/omg/drums/hh_tom_l.mp3\"}],\"name\":\"Hip Kit\",\"type\":\"SOUNDSET\",\"prefix\":\"http://mikehelland.com/omg/drums/\",\"lowNote\":72,\"postfix\":\".mp3\",\"user_id\":\"1\",\"approved\":true,\"username\":\"m                   \",\"chromatic\":false,\"created_at\":1542271035794,\"last_modified\":1542271055684,\"defaultSurface\":\"PRESET_SEQUENCER\"},\"audioParams\":{\"pan\":0,\"gain\":0.7228178904703554,\"warp\":1,\"volume\":0.6,\"delayTime\":0.09870550161812297,\"delayLevel\":0.12297734627831715}}],\"chordProgression\":[0]}],\"keyParams\":{\"scale\":[0,2,3,5,7,8,10],\"rootNote\":9},\"beatParams\":{\"bpm\":108,\"beats\":4,\"shuffle\":0,\"measures\":1,\"subbeats\":4},\"created_at\":1547004419230,\"last_modified\":1547004419230}")
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

tg.preloadSong = function (songData) {
    tg.song = OMGSong.prototype.make(songData);
    document.getElementById("tool-bar-song-button").innerHTML = tg.song.data.name || "(Untitled)";
    
    var section = tg.song.sections[0];
    tg.currentSection = section;
    tg.partList.innerHTML = "";
    for (var j = 0; j < section.parts.length; j++) {
        tg.setupPartButton(section.parts[j]);
    }
    tg.setSongControlsUI();
};


tg.makeChordsCaption = function (chordI) {
    var chordsCaption = "";
    tg.currentSection.data.chordProgression.forEach(function (chordI, i) {
        if (tg.player && tg.player.playing && i === tg.currentSection.currentChordI) {
            chordsCaption += "<span class='current-chord'>";
        }
        chordsCaption += tg.makeChordCaption(chordI);
        if (tg.player && tg.player.playing && i === tg.currentSection.currentChordI) {
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
        {name: "Blues", value: [0, 3, 5, 6, 7, 10]},
        {name: "Harmonic Minor", value: [0, 2, 3, 5, 7, 8, 11]},
        {name: "Mixolydian", value: [0, 2, 4, 5, 7, 9, 10]},
        {name: "Chromatic", value: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
    ],
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
    tg.preloadSong(song);
    }
    catch (e) {console.log(e)}

    // load all scripts manually
    window._omg_doNotAutoLoadMusicScripts = true

    var scriptTag;
    let scripts = ["/js/omgservice.js",
        "../js/omgservice_music.js",
        "../js/libs/tuna-min.js", 
        "../js/omusic_player.js", 
        //todo music player should load tuna, fx, and viktor
        "../js/fx.js",
        "../js/libs/viktor/viktor.js",
        "tg.js",
    ]
    
    // we might be in an iframe, we can use the omg object to share audio context
    if (parent && parent.omg) {
        window.omg = parent.omg
        scripts.splice(0, 1)
    }

    scripts.forEach(js => {
        scriptTag = document.createElement("script");
        scriptTag.src = js;
        scriptTag.async = false;
        document.body.appendChild(scriptTag);
    });        
});
