
var tg = {};
tg.playButton = document.getElementById("play-button");
tg.beatsButton = document.getElementById("beats-button");
tg.keyButton = document.getElementById("key-button");
tg.chordsButton = document.getElementById("chords-button");
tg.mixButton = document.getElementById("mix-button");
tg.saveButton = document.getElementById("save-button");
tg.addPartButton = document.getElementById("add-part-button");
tg.partList = document.getElementById("part-list");

tg.detailFragment = document.getElementById("detail-fragment");
tg.surface = document.getElementById("instrument-surface");
tg.surface.width = tg.surface.clientWidth;
tg.surface.height = tg.surface.clientHeight;

tg.player = new OMusicPlayer();

tg.getSong = function (callback) {
    
    var id = omg.util.getPageParams().id;
    if (!id) {
        //var defaultSong = {"tags":"t","type":"SECTION","parts":[{"type":"PART","uuid":"0d8ba593-8e3c-49cd-b208-680dcb5c8e47","notes":[],"octave":3,"surface":{"url":"PRESET_VERTICAL","name":"","skipTop":0,"skipBottom":0},"soundSet":{"url":"PRESET_OSC_SINE_SOFT_DELAY","name":"Osc Soft Sine Delay","type":"SOUNDSET","octave":5,"lowNote":0,"highNote":108,"chromatic":true},"audioParameters":{"pan":0,"mute":false,"speed":1,"volume":0.75}},{"type":"PART","uuid":"b6be19c3-02ef-45ca-883c-99404613305d","notes":[],"octave":3,"surface":{"url":"PRESET_VERTICAL","name":"","skipTop":0,"skipBottom":0},"soundSet":{"url":"http://openmusic.gallery/data/413","data":[{"url":"PRESET_slapa1","preset_id":2131558446},{"url":"PRESET_slapbf1","preset_id":2131558451},{"url":"PRESET_slapb1","preset_id":2131558449},{"url":"PRESET_slapc1","preset_id":2131558453},{"url":"PRESET_slapcs1","preset_id":2131558455},{"url":"PRESET_slapd1","preset_id":2131558457},{"url":"PRESET_slapds1","preset_id":2131558459},{"url":"PRESET_slape1","preset_id":2131558461},{"url":"PRESET_slapf1","preset_id":2131558463},{"url":"PRESET_slapfs1","preset_id":2131558465},{"url":"PRESET_slapg1","preset_id":2131558467},{"url":"PRESET_slapgs1","preset_id":2131558469},{"url":"PRESET_slapa2","preset_id":2131558447},{"url":"PRESET_slapbf2","preset_id":2131558452},{"url":"PRESET_slapb2","preset_id":2131558450},{"url":"PRESET_slapc2","preset_id":2131558454},{"url":"PRESET_slapcs2","preset_id":2131558456},{"url":"PRESET_slapd2","preset_id":2131558458},{"url":"PRESET_slapds2","preset_id":2131558460},{"url":"PRESET_slape2","preset_id":2131558462},{"url":"PRESET_slapf2","preset_id":2131558464},{"url":"PRESET_slapfs2","preset_id":2131558466},{"url":"PRESET_slapg2","preset_id":2131558468},{"url":"PRESET_slapgs2","preset_id":2131558470},{"url":"PRESET_slapa3","preset_id":2131558448}],"name":"Slap Bass","type":"SOUNDSET","octave":2,"lowNote":21,"highNote":45,"chromatic":true,"defaultSurface":"PRESET_VERTICAL"},"audioParameters":{"pan":0,"mute":false,"speed":1,"volume":0.75}},{"type":"PART","uuid":"53530a96-0971-440f-9261-afadac53eacd","tracks":[{"data":[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"kick","sound":"PRESET_HH_KICK","audioParameters":{"pan":0,"mute":false,"speed":1,"volume":0.75}},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"clap","sound":"PRESET_HH_CLAP","audioParameters":{"pan":0,"mute":false,"speed":1,"volume":0.75}},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"closed hi-hat","sound":"PRESET_ROCK_HIHAT_CLOSED","audioParameters":{"pan":0,"mute":false,"speed":1,"volume":0.75}},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"open hi-hat","sound":"PRESET_HH_HIHAT","audioParameters":{"pan":0,"mute":false,"speed":1,"volume":0.75}},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"tambourine","sound":"PRESET_HH_TAMB","audioParameters":{"pan":0,"mute":false,"speed":1,"volume":0.75}},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"h tom","sound":"PRESET_HH_TOM_MH","audioParameters":{"pan":0,"mute":false,"speed":1,"volume":0.75}},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"m tom","sound":"PRESET_HH_TOM_ML","audioParameters":{"pan":0,"mute":false,"speed":1,"volume":0.75}},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"l tom","sound":"PRESET_HH_TOM_L","audioParameters":{"pan":0,"mute":false,"speed":1,"volume":0.75}}],"surface":{"url":"PRESET_SEQUENCER","name":"","skipTop":0,"skipBottom":0},"soundSet":{"url":"PRESET_HIPKIT","data":[{"url":"PRESET_HH_KICK","name":"kick","preset_id":2131558423},{"url":"PRESET_HH_CLAP","name":"clap","preset_id":2131558421},{"url":"PRESET_ROCK_HIHAT_CLOSED","name":"closed hi-hat","preset_id":2131558431},{"url":"PRESET_HH_HIHAT","name":"open hi-hat","preset_id":2131558422},{"url":"PRESET_HH_TAMB","name":"tambourine","preset_id":2131558425},{"url":"PRESET_HH_TOM_MH","name":"h tom","preset_id":2131558427},{"url":"PRESET_HH_TOM_ML","name":"m tom","preset_id":2131558428},{"url":"PRESET_HH_TOM_L","name":"l tom","preset_id":2131558426}],"name":"Hip Hop Drum Kit","type":"SOUNDSET","chromatic":false,"defaultSurface":"PRESET_SEQUENCER"},"audioParameters":{"pan":0,"mute":false,"speed":1,"volume":0.75}},{"type":"PART","uuid":"49572b74-ed91-42ae-a586-6fafb016bb69","tracks":[{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"bongo l","sound":"PRESET_bongol","audioParameters":{"pan":0,"mute":false,"speed":1,"volume":0.75}},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"bongo l","sound":"PRESET_bongoh","audioParameters":{"pan":0,"mute":false,"speed":1,"volume":0.75}},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"click l","sound":"PRESET_clickl","audioParameters":{"pan":0,"mute":false,"speed":1,"volume":0.75}},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"click h","sound":"PRESET_clickh","audioParameters":{"pan":0,"mute":false,"speed":1,"volume":0.75}},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"shhk","sound":"PRESET_shhk","audioParameters":{"pan":0,"mute":false,"speed":1,"volume":0.75}},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"scrape","sound":"PRESET_scrape","audioParameters":{"pan":0,"mute":false,"speed":1,"volume":0.75}},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"whoop","sound":"PRESET_whoop","audioParameters":{"pan":0,"mute":false,"speed":1,"volume":0.75}},{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"name":"chimes","sound":"PRESET_chimes","audioParameters":{"pan":0,"mute":false,"speed":1,"volume":0.75}}],"surface":{"url":"PRESET_SEQUENCER","name":"","skipTop":0,"skipBottom":0},"soundSet":{"url":"PRESET_PERCUSSION_SAMPLER","data":[{"url":"PRESET_bongol","name":"bongo l","preset_id":2131558445},{"url":"PRESET_bongoh","name":"bongo l","preset_id":2131558444},{"url":"PRESET_clickl","name":"click l","preset_id":2131558438},{"url":"PRESET_clickh","name":"click h","preset_id":2131558439},{"url":"PRESET_shhk","name":"shhk","preset_id":2131558443},{"url":"PRESET_scrape","name":"scrape","preset_id":2131558441},{"url":"PRESET_whoop","name":"whoop","preset_id":2131558442},{"url":"PRESET_chimes","name":"chimes","preset_id":2131558440}],"name":"Percussion Sampler","type":"SOUNDSET","chromatic":false,"defaultSurface":"PRESET_SEQUENCER"},"audioParameters":{"pan":0,"mute":false,"speed":1,"volume":0.75}},{"type":"PART","uuid":"cadf4f60-a6a6-438f-9eb4-30596e1ca7f4","notes":[{"note":1,"rest":false,"beats":0.5},{"note":1,"rest":false,"beats":0.5},{"note":1,"rest":false,"beats":0.5},{"note":1,"rest":false,"beats":0.5},{"note":1,"rest":false,"beats":0.5},{"note":1,"rest":false,"beats":0.5},{"note":1,"rest":false,"beats":0.5},{"note":1,"rest":false,"beats":0.5},{"note":1,"rest":false,"beats":0.5},{"note":1,"rest":false,"beats":0.5},{"note":1,"rest":false,"beats":0.5},{"note":1,"rest":false,"beats":0.5},{"note":1,"rest":false,"beats":0.5},{"note":1,"rest":false,"beats":0.5},{"note":1,"rest":false,"beats":0.5},{"note":1,"rest":false,"beats":0.5}],"octave":3,"surface":{"url":"PRESET_VERTICAL","name":"","skipTop":0,"skipBottom":0},"soundSet":{"url":"PRESET_BASS","data":[{"url":"PRESET_bass_e","preset_id":2131558411},{"url":"PRESET_bass_f","preset_id":2131558413},{"url":"PRESET_bass_fs","preset_id":2131558415},{"url":"PRESET_bass_g","preset_id":2131558417},{"url":"PRESET_bass_gs","preset_id":2131558419},{"url":"PRESET_bass_a","preset_id":2131558400},{"url":"PRESET_bass_bf","preset_id":2131558404},{"url":"PRESET_bass_b","preset_id":2131558402},{"url":"PRESET_bass_c","preset_id":2131558406},{"url":"PRESET_bass_cs","preset_id":2131558408},{"url":"PRESET_bass_d","preset_id":2131558409},{"url":"PRESET_bass_ds","preset_id":2131558410},{"url":"PRESET_bass_e2","preset_id":2131558412},{"url":"PRESET_bass_f2","preset_id":2131558414},{"url":"PRESET_bass_fs2","preset_id":2131558416},{"url":"PRESET_bass_g2","preset_id":2131558418},{"url":"PRESET_bass_gs2","preset_id":2131558420},{"url":"PRESET_bass_a2","preset_id":2131558401},{"url":"PRESET_bass_bf2","preset_id":2131558405},{"url":"PRESET_bass_b2","preset_id":2131558403},{"url":"PRESET_bass_c2","preset_id":2131558407}],"name":"Electric Bass","type":"SOUNDSET","octave":2,"lowNote":28,"highNote":48,"chromatic":true,"defaultSurface":"PRESET_VERTICAL"},"audioParameters":{"pan":0,"mute":false,"speed":1,"volume":0.75}}],"madeWith":"","created_at":1539896958137,"omgVersion":0.9,"keyParameters":{"scale":[0,3,5,6,7,10],"rootNote":0},"last_modified":1539896958137,"beatParameters":{"beats":4,"shuffle":0,"measures":2,"subbeats":4,"subbeatMillis":125},"chordProgression":[0],"id":1200};
        var defaultSong = {"name":"","type":"SONG","sections":[{"id":1202,"tags":"t","type":"SECTION","parts":[{"type":"PART","uuid":"52457792-cf35-4fef-8105-e91b14fbc326","notes":[],"octave":3,"surface":{"url":"PRESET_VERTICAL","name":"","skipTop":0,"skipBottom":0},"partType":"PART","soundSet":{"url":"PRESET_OSC_SINE_SOFT_DELAY","name":"Osc Soft Sine Delay","type":"SOUNDSET","octave":5,"lowNote":0,"highNote":108,"chromatic":true},"audioParameters":{"pan":1,"mute":false,"warp":1,"speed":1,"volume":1}}],"keyParameters":{"scale":[0,3,5,6,7,10],"rootNote":0},"last_modified":1540221610328,"beatParameters":{"beats":4,"shuffle":0,"measures":2,"subbeats":4,"subbeatMillis":125},"chordProgression":[0]}],"created_at":1541261597433,"keyParameters":{"scale":[0,3,5,6,7,10],"rootNote":0},"last_modified":1541261597433,"beatParameters":{"bpm":120,"beats":4,"shuffle":0,"measures":2,"subbeats":4,"subbeatMillis":125}};
        callback(defaultSong);
    }    
    else {
        omg.server.getId(id, function (response) {
            callback(response);
        });
    }
};

tg.loadSong = function (songData) {
    tg.song = tg.player.makeOMGSong(songData);
    tg.player.prepareSong(tg.song);    
    
    tg.setSongControlsUI();
    document.getElementById("tool-bar-song-button").innerHTML = tg.song.data.name || "(Untitled)";

    var section;
    for (var i = 0; i < tg.song.sections.length; i++) {
        section = tg.song.sections[i];

        for (var j = 0; j < section.parts.length; j++) {
            tg.setupPartButton(section.parts[j]);
        }

        break;
    }
    
    tg.drawPlayButton();
};

tg.playButton.onclick = function () {
    if (tg.player.playing) {
        tg.player.stop();
    }
    else {
        tg.player.play(tg.song);
    }
};

tg.player.onPlay = function () {
    tg.drawPlayButton(0);
};
tg.player.onStop = function () {
    tg.drawPlayButton();
};

tg.setSongControlsUI = function () {
    tg.keyButton.innerHTML = omg.ui.getKeyCaption(tg.song.data.keyParameters);
    tg.beatsButton.innerHTML = tg.song.data.beatParameters.bpm + " bpm";
    var chordsCaption = "";
    tg.song.sections[0].data.chordProgression.forEach(function (chordI) {
        chordsCaption += tg.makeChordCaption(chordI) + " ";
    })
    tg.chordsButton.innerHTML = chordsCaption;
    document.getElementById("chords-fragment-chords-view").innerHTML = chordsCaption;
};
tg.setupPartButton = function (omgpart) {
    partDiv = document.createElement("div");
    partDiv.className = "part";
    
    var button;
    button = document.createElement("div");
    button.className = "part-options-button";
    button.innerHTML = "&#9776;";
    partDiv.appendChild(button);
    button.onclick = function (e) {
        tg.showPartOptionsFragment(omgpart);
        tg.newChosenButton(e.target);
    }
    
    button = document.createElement("div");
    button.className = "part-button";
    button.innerHTML = omgpart.data.soundSet.name;
    button.onclick = function (e) {
        tg.showSurface();
        if (omgpart.data.surface.url === "PRESET_SEQUENCER") {
            tg.showDrumMachine(omgpart);
        }
        else if (omgpart.data.surface.url === "PRESET_VERTICAL") {
            tg.showMelodyEditor(omgpart);
        }
        tg.newChosenButton(e.target);
    };
    partDiv.appendChild(button);
    
    button = document.createElement("div");
    button.className = "part-mute-button";
    button.innerHTML = "M";
    button.onclick = function () {
        omgpart.data.audioParameters.mute = !omgpart.data.audioParameters.mute;
        button.style.backgroundColor = omgpart.data.audioParameters.mute ? "#800000" : "#008000";
    }
    button.style.backgroundColor = omgpart.data.audioParameters.mute ?
        "#800000" : "#008000";
    partDiv.appendChild(button);
    tg.partList.appendChild(partDiv);

}

tg.showDrumMachine = function (omgpart) {
    if (tg.surface.omgdata) {
        tg.surface.omgdata.selectedTrack = -1;
    }
    var drumMachine = new OMGDrumMachine(tg.surface, omgpart);
    omg.ui.drawDrumCanvas({canvas: tg.surface, part: omgpart, 
        captionWidth: window.innerWidth / 2 / 8});
    drumMachine.readOnly = false;
    
    tg.player.onBeatPlayedListeners.push(function (isubbeat, isection) {
        omg.ui.drawDrumCanvas({canvas: tg.surface, part:omgpart, 
            captionWidth: window.innerWidth / 2 / 8});
    });
};
tg.showMelodyEditor = function (omgpart) {
    melodyEditor = new OMGMelodyMaker(tg.surface, omgpart, tg.player);
    tg.player.onBeatPlayedListeners.push(function (isubbeat, isection) {
        melodyEditor.drawCanvas();
    });

};

tg.playButton.width = tg.playButton.clientWidth
tg.playButton.height = tg.playButton.clientHeight
tg.drawPlayButton = function (subbeat) {
    tg.playButton.width = tg.playButton.width;
    var context = tg.playButton.getContext("2d");

    if (!tg.song) {
        console.log("draw loading");
        context.fillStyle = "white";
        context.font = "bold 30px sans-serif";
        var caption = "LOADING...";
        var captionWidth = context.measureText(caption).width;
        context.fillText(caption, tg.playButton.width / 2 - captionWidth / 2, 35);
        return;
    }
    
    context.globalAlpha = 0.6;

    var beatWidth = tg.playButton.width / 
        (tg.song.data.beatParameters.measures * tg.song.data.beatParameters.beats);

    if (tg.player.playing) {
        context.fillStyle = "#00FF00";
        context.fillRect(beatWidth * Math.floor(subbeat / tg.song.data.beatParameters.subbeats), 
            0, beatWidth, tg.playButton.height);        
    }
    else {
        context.fillStyle = "#FF0000";
        context.fillRect(0, 0, tg.playButton.width, tg.playButton.height);        
    }

    context.fillStyle = "white";
    context.strokeStyle = "white";
    context.strokeRect(0, 0, tg.playButton.width, tg.playButton.height);
    for (var beat = 1; 
            beat <= tg.song.data.beatParameters.beats * tg.song.data.beatParameters.measures; 
            beat++) {
        context.fillRect(beat * beatWidth, 0, 
                    beat % tg.song.data.beatParameters.beats == 0 ? 2 : 1, 
                    tg.playButton.height);
    }
    context.globalAlpha = 1.0;    
    
    context.font = "bold 30px sans-serif";
    var caption = tg.player.playing ? "STOP" : "PLAY";
    var captionWidth = context.measureText(caption).width;
    context.fillText(caption, tg.playButton.width / 2 - captionWidth / 2, 35);
};
tg.player.onBeatPlayedListeners.push(function (isubbeat, isection) {
    tg.drawPlayButton(isubbeat);
});
tg.drawPlayButton();

tg.showBeatsFragment = function () {
    tg.hideDetails();
    if (!tg.beatsFragment) {
        tg.beatsFragment = document.getElementById("beats-fragment");
        var bf= tg.beatsFragment;
        bf.subbeatsLabel = document.getElementById("subbeats-label");
        bf.beatsLabel = document.getElementById("beats-label");
        bf.measuresLabel = document.getElementById("measures-label");
        bf.bpmLabel = document.getElementById("bpm-label");
        bf.shuffleLabel = document.getElementById("shuffle-label");
        
        bf.subbeatsRange = document.getElementById("subbeats-range");
        bf.beatsRange = document.getElementById("beats-range");
        bf.measuresRange = document.getElementById("measures-range");
        bf.bpmRange = document.getElementById("bpm-range");
        bf.shuffleRange = document.getElementById("shuffle-range");
        
        bf.subbeatsRange.onmousemove = function (e) {
            console.log(e);
            bf.subbeatsLabel.innerHTML = bf.subbeatsRange.value;
            tg.song.data.beatParameters.subbeats = bf.subbeatsRange.value;
        };
        bf.beatsRange.onmousemove = function (e) {
            console.log(e);
            bf.beatsLabel.innerHTML = bf.beatsRange.value;
            tg.song.data.beatParameters.beats = bf.beatsRange.value;
        };
        bf.measuresRange.onmousemove = function (e) {
            console.log(e);
            bf.measuresLabel.innerHTML = bf.measuresRange.value;
            tg.song.data.beatParameters.measures = bf.measuresRange.value;
        };
        bf.bpmRange.onmousemove = function (e) {
            console.log(e);
            bf.bpmLabel.innerHTML = bf.bpmRange.value;
            tg.song.data.beatParameters.bpm = bf.bpmRange.value;
            tg.player.newBPM = bf.bpmRange.value;
            tg.setSongControlsUI();
        };
        bf.shuffleRange.onmousemove = function (e) {
            console.log(e);
            bf.shuffleLabel.innerHTML = bf.shuffleRange.value;
            tg.song.data.beatParameters.shuffle = bf.shuffleRange.value;
        };
    }
    tg.refreshBeatsFragment();
    tg.beatsFragment.style.display = "block";
    tg.newChosenButton(tg.beatsButton);
};

tg.refreshBeatsFragment = function () {
    tg.beatsFragment.subbeatsLabel.innerHTML = tg.song.data.beatParameters.subbeats;
    tg.beatsFragment.beatsLabel.innerHTML = tg.song.data.beatParameters.beats;
    tg.beatsFragment.measuresLabel.innerHTML = tg.song.data.beatParameters.measures;
    tg.beatsFragment.bpmLabel.innerHTML = tg.song.data.beatParameters.bpm;
    tg.beatsFragment.shuffleLabel.innerHTML = tg.song.data.beatParameters.shuffle;
    tg.beatsFragment.subbeatsRange.value = tg.song.data.beatParameters.subbeats;
    tg.beatsFragment.beatsRange.value = tg.song.data.beatParameters.beats;
    tg.beatsFragment.measuresRange.value = tg.song.data.beatParameters.measures;
    tg.beatsFragment.bpmRange.value = tg.song.data.beatParameters.bpm;
    tg.beatsFragment.shuffleRange.value = tg.song.data.beatParameters.shuffle;

};

tg.beatsButton.onclick = function () {
    tg.hideDetails();
    tg.showBeatsFragment();
};
tg.keyButton.onclick = function () {
    tg.hideDetails();
    tg.showKeyFragment();
}

tg.chordsButton.onclick = function () {
    tg.hideDetails();
    tg.showChordsFragment();
};
tg.addPartButton.onclick = function() {
    tg.hideDetails();
    tg.showAddPartFragment();
};
tg.mixButton.onclick = function () {
    tg.showMixFragment();
};
tg.saveButton.onclick = function () {
    tg.showSaveFragment();
};

tg.showSurface = function () {
    tg.hideDetails();
    tg.surface.style.display = "block";
    tg.surface.width = tg.surface.clientWidth;
    tg.surface.height = tg.surface.clientHeight;
};

tg.showKeyFragment = function () {
    var kf;
    if (!tg.keyFragment) {
        tg.keyFragment = document.getElementById("key-fragment");
        kf = tg.keyFragment;
        kf.keyList = document.getElementById("key-list");
        kf.scaleList = document.getElementById("scale-list");
        var keyI = 0;
        omg.ui.keys.forEach(function (key) {
            var keyDiv = document.createElement("div");
            keyDiv.className = "key-select-button";
            keyDiv.innerHTML = key;
            keyDiv.onclick = (function (i) {
                return function () {
                    tg.song.data.keyParameters.rootNote = i;
                    tg.setSongControlsUI();
                }
            }(keyI));
            
            kf.keyList.appendChild(keyDiv);
            keyI++;
        });
        omg.ui.scales.forEach(function (scale) {
            var scaleDiv = document.createElement("div");
            scaleDiv.className = "scale-select-button";
            scaleDiv.innerHTML = scale.name;
            scaleDiv.onclick = (function (newScale) {
                return function () {
                    tg.song.data.keyParameters.scale = newScale;
                    tg.setSongControlsUI();
                }
            }(scale.value));

            kf.scaleList.appendChild(scaleDiv);
        });
    }
    tg.keyFragment.style.display = "flex";
    tg.newChosenButton(tg.keyButton);
};

tg.showChordsFragment = function () {
    if (!tg.chordsFragment) {
        tg.chordsFragment = document.getElementById("chords-fragment");
        tg.chordsFragment.appendMode = false;
        document.getElementById("chords-fragment-clear-button").onclick = function () {
            tg.song.sections[0].data.chordProgression = [0];
            tg.setSongControlsUI();
        };
        var appendButton = document.getElementById("chords-fragment-append-button");
        appendButton.onclick = function () {
            tg.chordsFragment.appendMode = !tg.chordsFragment.appendMode;
            if (tg.chordsFragment.appendMode) {
                appendButton.classList.add("selected-option");
            }
            else {
                appendButton.classList.remove("selected-option");
            }
        };

    }
    var chordsList = document.getElementById("chords-fragment-list");
    chordsList.innerHTML = "";
    for (var i = tg.song.data.keyParameters.scale.length - 1; i >= 0; i--) {
        chordsList.appendChild(tg.makeChordButton(i));
    }
    for (var i = tg.song.data.keyParameters.scale.length - 1; i > 0; i--) {
        chordsList.appendChild(tg.makeChordButton(i * -1));
    }

    tg.chordsFragment.style.display = "flex";
    tg.newChosenButton(tg.chordsButton);
};

tg.makeChordButton = function (chordI) {
    var chordDiv = document.createElement("div");
    chordDiv.className = "chord-select-button";
    chordDiv.innerHTML = tg.makeChordCaption(chordI)
    chordDiv.onclick = function () {
        if (tg.chordsFragment.appendMode) {
            tg.song.sections[0].data.chordProgression.push(chordI);
        }
        else {
            tg.song.sections[0].data.chordProgression = [chordI];
        }
        tg.setSongControlsUI();
    };
    return chordDiv;
};

tg.makeChordCaption = function (chordI) {
    var chord = tg.song.data.keyParameters.scale[Math.abs(chordI)];
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

tg.showAddPartFragment = function () {
    if (!tg.addPartFragment) {
        tg.addPartFragment = document.getElementById("add-part-fragment");
  
        var addOscButtonClick = function (e) {
          tg.addOsc(e.target.innerHTML);  
        };
        document.getElementById("add-sine-osc-button").onclick = addOscButtonClick;
        document.getElementById("add-saw-osc-button").onclick = addOscButtonClick;
        document.getElementById("add-square-osc-button").onclick = addOscButtonClick;
        document.getElementById("add-triangle-osc-button").onclick = addOscButtonClick;
        
        fetch(location.origin + "/data/?type=SOUNDSET").then(function (e) {return e.json();}).then(function (json) {
            json.forEach(function (soundSet) {
                var newDiv = document.createElement("div");
                newDiv.className = "soundset-list-item";
                newDiv.innerHTML = soundSet.name;
                tg.addPartFragment.appendChild(newDiv);
                soundSet.url = location.origin + "/data/" + soundSet.id;
                newDiv.onclick = function () {
                    tg.addPart(soundSet);
                };
            });
        });
    }
    tg.addPartFragment.style.display = "block";
    tg.newChosenButton(tg.addPartButton);
};

tg.hideDetails = function () {
    if (tg.beatsFragment) tg.beatsFragment.style.display = "none";
    if (tg.keyFragment) tg.keyFragment.style.display = "none";
    if (tg.chordsFragment) tg.chordsFragment.style.display = "none";
    if (tg.addPartFragment) tg.addPartFragment.style.display = "none";
    if (tg.surface) tg.surface.style.display = "none";
    if (tg.mixFragment) tg.mixFragment.style.display = "none";
    if (tg.saveFragment) tg.saveFragment.style.display = "none";
    if (tg.partOptionsFragment) tg.partOptionsFragment.style.display = "none";
    if (tg.userFragment) tg.userFragment.style.display = "none";
    if (tg.songFragment) tg.songFragment.style.display = "none";
};


tg.addPart = function (soundSet) {
    var blankPart = {soundSet: soundSet};
    var omgpart = new OMGPart(undefined,blankPart,tg.song.sections[0]);
    console.log(omgpart);
    tg.player.loadPart(omgpart);
    tg.setupPartButton(omgpart);
};

tg.addOsc = function (type) {
  var soundSet = {"url":"PRESET_OSC_" + type.toUpperCase(),"name": type + " Oscillator",
      "type":"SOUNDSET","octave":5,"lowNote":0,"highNote":108,"chromatic":true};
  tg.addPart(soundSet);
};

tg.showMixFragment = function () {
    if (!tg.mixFragment) {
        tg.mixFragment = document.getElementById("mix-fragment");
    }
    var divs = [];
    tg.mixFragment.innerHTML = "";
    tg.song.sections[0].parts.forEach(function (part) {
        var newContainerDiv = document.createElement("div");
        newContainerDiv.className = "mixer-part";
        
        var mixerVolumeCanvas = new MixerVolumeCanvas(part);
        mixerVolumeCanvas.div.className = "mixer-part-volume";
        var mixerWarpCanvas = new MixerWarpCanvas(part);
        mixerWarpCanvas.div.className = "mixer-part-warp";
        var mixerPanCanvas = new MixerPanCanvas(part);
        mixerPanCanvas.div.className = "mixer-part-pan";
        
        newContainerDiv.appendChild(mixerVolumeCanvas.div);
        newContainerDiv.appendChild(mixerWarpCanvas.div);
        newContainerDiv.appendChild(mixerPanCanvas.div);
        tg.mixFragment.appendChild(newContainerDiv);
        divs.push(mixerVolumeCanvas);
        divs.push(mixerWarpCanvas);
        divs.push(mixerPanCanvas);
    });
    
    tg.hideDetails();
    tg.mixFragment.style.display = "flex";
    tg.newChosenButton(tg.mixButton);
    
    divs.forEach(function (child) {
        child.drawCanvas(child);
    });
};

function MixerVolumeCanvas(part, canvas) {
    var m = this;
    if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.onmousedown = function (e) {
            m.onmousedown(e);
        }
        canvas.onmousemove = function (e) {
            m.onmousemove(e);
        }
        canvas.onmouseup = function (e) {
            m.onmouseup(e);
        }
    }
    this.div = canvas;
    this.ctx = canvas.getContext("2d");
    this.part = part;
}

MixerVolumeCanvas.prototype.onmousedown = function (e) {
    this.isTouching = true;
    console.log(this)
    var percent = (e.layerX - this.div.offsetLeft) / this.div.clientWidth;
    this.part.data.audioParameters.volume = percent;
    this.drawCanvas(this.div);
};
MixerVolumeCanvas.prototype.onmousemove = function (e) {
    if (this.isTouching) {
        var percent = (e.layerX - this.div.offsetLeft) / this.div.clientWidth;
        this.part.data.audioParameters.volume = percent;
        this.drawCanvas(this.div);
    }
};
MixerVolumeCanvas.prototype.onmouseup = function (e) {
    this.isTouching = false;
};
MixerVolumeCanvas.prototype.drawCanvas = function () {
    this.div.width = this.div.clientWidth;
    this.div.height = this.div.clientHeight;
    this.ctx.fillStyle = this.part.data.audioParameters.mute ? "#880000" : "#008800";
    this.ctx.fillRect(0, 0, this.part.data.audioParameters.volume * this.div.clientWidth, this.div.height);
    this.ctx.fillStyle = "white";
    this.ctx.fillText("volume", 10, this.div.height / 2);
    var nameLength = this.ctx.measureText(this.part.data.soundSet.name).width;
    this.ctx.fillText(this.part.data.soundSet.name, this.div.width / 2 - nameLength / 2, 10);
};

function MixerWarpCanvas(part, canvas) {
    var m = this;
    if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.onmousedown = function (e) {
            m.onmousedown(e);
        }
        canvas.onmousemove = function (e) {
            m.onmousemove(e);
        }
        canvas.onmouseup = function (e) {
            m.onmouseup(e);
        }
    }
    this.div = canvas;
    this.ctx = canvas.getContext("2d");
    this.part = part;
}

MixerWarpCanvas.prototype.onmousedown = function (e) {
    this.isTouching = true;
    console.log(this)
    var percent = (e.layerX - this.div.offsetLeft) / this.div.clientWidth * 2;
    this.part.data.audioParameters.warp = percent;
    this.drawCanvas(this.div);
};
MixerWarpCanvas.prototype.onmousemove = function (e) {
    if (this.isTouching) {
        var percent = (e.layerX - this.div.offsetLeft) / this.div.clientWidth * 2;
        this.part.data.audioParameters.warp = percent;
        this.drawCanvas(this.div);
    }
};
MixerWarpCanvas.prototype.onmouseup = function (e) {
    this.isTouching = false;
};
MixerWarpCanvas.prototype.drawCanvas = function () {
    this.div.width = this.div.clientWidth;
    this.div.height = this.div.clientHeight;
    this.ctx.fillStyle = "#880088";
    this.ctx.fillRect(0, 0, this.part.data.audioParameters.warp * this.div.clientWidth / 2, this.div.height);
    this.ctx.fillStyle = "white";
    this.ctx.fillText("warp", 10, this.div.height / 2);
};

function MixerPanCanvas(part, canvas) {
    var m = this;
    if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.onmousedown = function (e) {
            m.onmousedown(e);
        }
        canvas.onmousemove = function (e) {
            m.onmousemove(e);
        }
        canvas.onmouseup = function (e) {
            m.onmouseup(e);
        }
    }
    this.div = canvas;
    this.ctx = canvas.getContext("2d");
    this.part = part;
}

MixerPanCanvas.prototype.onmousedown = function (e) {
    this.isTouching = true;
    var percent = (e.layerX - (this.div.clientWidth / 2)) / this.div.clientWidth * 2;
    this.part.data.audioParameters.pan = percent;
    this.drawCanvas(this.div);
};
MixerPanCanvas.prototype.onmousemove = function (e) {
    if (this.isTouching) {
        var percent = (e.layerX - (this.div.clientWidth / 2)) / this.div.clientWidth * 2;
        this.part.data.audioParameters.pan = percent;
        this.drawCanvas(this.div);
    }
};
MixerPanCanvas.prototype.onmouseup = function (e) {
    this.isTouching = false;
};
MixerPanCanvas.prototype.drawCanvas = function () {
    this.div.width = this.div.clientWidth;
    this.div.height = this.div.clientHeight;
    this.ctx.fillStyle = "#000088";
    this.ctx.fillRect(this.div.clientWidth / 2 - 2, 0, 4, this.div.height);
    this.ctx.fillRect(this.div.clientWidth / 2, 0, this.part.data.audioParameters.pan * this.div.clientWidth / 2, this.div.height);
    this.ctx.fillStyle = "white";
    this.ctx.fillText("Pan", 10, this.div.height / 2);
};

tg.showSaveFragment = function () {
    if (!tg.saveFragment) {
        tg.saveFragment = document.getElementById("save-fragment");
    }
    
    tg.hideDetails();
    tg.saveFragment.style.display = "block";
    tg.newChosenButton(tg.saveButton);
    
    if (tg.song.data.id) {
        delete tg.song.data.id;
    }
    var json = tg.song.getData();
    var ok = false;
    try {
        JSON.parse(JSON.stringify(json));
        ok = true;
    }
    catch (e) {}
    
    if (!ok) {
        //??
        return;
    }
    
    omg.server.post(json, function (response) {
        var saved = true; //??
        var savedUrl = location.origin + "/techno-gauntlet/?id=" + response.id;
        var div = document.getElementById("saved-url");
        div.value = savedUrl;
            //if (callback) {
            //    callback(response.id);
            //}
    });
};

tg.showPartOptionsFragment = function (part) {
    tg.hideDetails();
    tg.partOptionsFragment = document.getElementById("part-options-fragment");
    tg.partOptionsFragment.style.display = "block";
    
    document.getElementById("part-options-clear-button").onclick = function () {
        if (part.data.notes) {
            part.data.notes = [];
        }
        if (part.data.tracks) {
            for (var i = 0; i < part.data.tracks.length; i++) {
                for (var j = 0; j < part.data.tracks[i].length; j++) {
                    part.data.tracks[i][j] = false;
                }
            }
        }
    }
    
    new SliderCanvas(document.getElementById("part-options-delay-time"),
        function (percent) {
            part.delay.delayTime.value = percent;
            part.data.audioParameters.delayTime = percent;
        },
        function () {
            return part.data.audioParameters.delayTime || 0;
        }
    ).drawCanvas();
    new SliderCanvas(document.getElementById("part-options-delay-level"),
        function (percent) {
            part.feedback.gain.value = percent;
            part.data.audioParameters.delayLevel = percent;
        },
        function () {
            return part.data.audioParameters.delayLevel || 0;
        }
    ).drawCanvas();
};

function SliderCanvas(canvas, onchange, ongetdata) {
    var m = this;
    if (!canvas) {
        canvas = document.createElement("canvas");
    }
    canvas.onmousedown = function (e) {
        m.onmousedown(e);
    }
    canvas.onmousemove = function (e) {
        m.onmousemove(e);
    }
    canvas.onmouseup = function (e) {
        m.onmouseup(e);
    }
    this.div = canvas;
    this.ctx = canvas.getContext("2d");
    this.onchange = onchange;
    this.ongetdata = ongetdata;
}

SliderCanvas.prototype.onmousedown = function (e) {
    this.isTouching = true;
    var percent = (e.layerX - this.div.offsetLeft) / this.div.clientWidth;
    if (this.onchange) this.onchange(percent);
    this.drawCanvas(this.div);
};
SliderCanvas.prototype.onmousemove = function (e) {
    if (this.isTouching) {
        var percent = (e.layerX - this.div.offsetLeft) / this.div.clientWidth;
        if (this.onchange) this.onchange(percent);
        this.drawCanvas(this.div);
    }
};
SliderCanvas.prototype.onmouseup = function (e) {
    this.isTouching = false;
};
SliderCanvas.prototype.drawCanvas = function () {
    this.div.width = this.div.clientWidth;
    this.div.height = this.div.clientHeight;
    this.ctx.fillStyle = "#008800";
    var percent = this.ongetdata ? this.ongetdata() : 0;
    this.ctx.fillRect(0, 0, percent * this.div.clientWidth, this.div.height);
};

tg.newChosenButton = function (button) {
    if (tg.chosenButton) {
        tg.chosenButton.classList.remove("selected-option");
    }
    tg.chosenButton = button;
    button.classList.add("selected-option");
};


tg.userButton = document.getElementById("main-fragment-user-button");
tg.userButton.onclick = function () {
    tg.hideDetails();
    tg.showUserFragment();
    tg.newChosenButton(tg.userButton);
};
tg.showUserFragment = function () {
    if (!tg.userFragment) {
        tg.userFragment = document.getElementById("user-fragment");
        document.getElementById("user-login-button").onclick = function () {
            omg.server.login(
                document.getElementById("user-login-username").value, 
                document.getElementById("user-login-password").value, function (results) {
                    if (results) {
                        document.getElementById("user-login-signup").style.display = "none";
                        tg.onlogin(results);
                    }
                    else {
                        document.getElementById("user-login-invalid").style.display = "inline-block";
                    }
                });
        };
        document.getElementById("user-signup-button").onclick = function () {
            omg.server.signup(
                document.getElementById("user-signup-username").value, 
                document.getElementById("user-signup-password").value, function (results) {
                    if (results) {                        
                        tg.onlogin(results);
                    }
                    else {
                        document.getElementById("user-login-invalid").style.display = "inline-block";
                    }
                });
        };
    }
    
    if (tg.user) {
        document.getElementById("user-login-signup").style.display = "none";
    }
    
    tg.userFragment.style.display = "block";
}

tg.songButton = document.getElementById("main-fragment-song-button");
tg.songButton.onclick = function () {
    tg.hideDetails();
    tg.showSongFragment();
    tg.newChosenButton(tg.songButton);
};
tg.showSongFragment = function () {
    if (!tg.songFragment) {
        tg.songFragment = document.getElementById("song-fragment");
        var nameInput = document.getElementById("song-info-name");
        nameInput.value = tg.song.data.name || "";
        document.getElementById("song-info-update").onclick = function () {
            tg.song.data.name = nameInput.value;
            document.getElementById("tool-bar-song-button").innerHTML = nameInput.value;
        };
    }
    tg.songFragment.style.display = "block";
};

tg.onlogin = function (user) {
    tg.user = user;
    document.getElementById("tool-bar-user-button").innerHTML = user.username;    
    document.getElementById("user-login-signup").style.display = "none";
    document.getElementById("user-info").style.display = "block";
    document.getElementById("user-info-username").innerHTML = user.username;
};

// away we go
tg.getSong(function (song) {
    tg.loadSong(song);
});
omg.server.getHTTP("/user/", function (res) {
    if (res) {
        tg.onlogin(res);
    }
});
