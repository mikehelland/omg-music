/**
 * create these objects:
 *     omg.server -  for server stuff
 *     omg.util   -  for local stuff
 */


if (typeof omg !== "object")
    omg = {};
if (!omg.server)
    omg.server = {};
if (!omg.util)
    omg.util = {};

omg.server.url = "";
omg.server.dev = window.location.href.indexOf("localhost") > 0;

omg.server.http = function (params) {
    var method = params.method || "GET";

    var xhr = new XMLHttpRequest();
    xhr.open(method, params.url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            var results;
            try {
                results = JSON.parse(xhr.responseText);
            } catch (exp) {
                console.log(exp);
                console.log("could not parse results of url: " + params.url);
                console.log(xhr.responseText);
            }
            if (params.callback) {
                params.callback(results);    
            }
        }
    };

    if (params.data) {
        if (params.data.constructor.name === "FormData") {
            xhr.send(params.data);
        }
        else {
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.send(JSON.stringify(params.data));
        }
    }
    else {
        xhr.send();
    }
};

omg.server.post = function (data, callback) {
    omg.server.http({method: "POST", 
            url: this.url + "/data/", 
            data: data, callback: callback});
};

omg.server.postHTTP = function (url, data, callback) {
    omg.server.http({method: "POST", 
            url: url, 
            data: data, callback: callback});
};

omg.server.getHTTP = function (url, callback) {
    omg.server.http({url: url, callback: callback});
};

omg.server.getId = function (id, callback) {
    omg.server.getHTTP(this.url + "/data/" + id, callback);
    return; 
};

omg.server.deleteId = function (id, callback) {
    var url = this.url + "/data/" + id;
    omg.server.http({method: "DELETE", url: url, callback: callback});
};

omg.server.login = function (username, password, callback) {
    var data = {username: username, password: password};
    omg.server.http({method: "POST", data: data, url : this.url + "/api-login",
            callback: callback});
};
omg.server.signup = function (username, password, callback) {
    var data = {username: username, password: password};
    omg.server.http({method: "POST", data: data, url : this.url + "/api-signup",
            callback: callback});
};

omg.server.logout = function (callback) {
    omg.server.getHTTP("/api-logout", callback);
};


/** 
 * Utility functions for the client
 * 
 */

omg.util.getPageParams = function () {
    // see if there's somethign to do here
    var rawParams = document.location.search;
    var nvp;
    var params = {};

    if (rawParams.length > 1) {
        rawParams.slice(1).split("&").forEach(function (param) {
            nvp = param.split("=");
            params[nvp[0]] = nvp[1];
        });
    }
    return params;
};

omg.util.makeQueryString = function (parameters) {  
    var string = "?";
    for (var param in parameters) {
        string += param + "=" + parameters[param] + "&";
    }
    return string.slice(0, string.length - 1);
};

omg.util.getTimeCaption = function (timeMS) {

    if (!timeMS) {
        return "";
    }

    var seconds = Math.round((Date.now() - timeMS) / 1000);
    if (seconds < 60) return seconds + " sec ago";

    var minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + " min ago";    
   
    var hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + " hr ago";    

    var days = Math.floor(hours / 24);
    if (days < 7) return days + " days ago";

    var date  = new Date(timeMS);
    var months = ["Jan", "Feb", "Mar", "Apr", "May",
                "Jun", "Jul", "Aug", "Sep", "Oct", 
                "Nov", "Dec"];
    var monthday = months[date.getMonth()] + " " + date.getDate();
    if (days < 365) {
        return monthday;
    }
    return monthday + " " + date.getFullYear();
};

omg.util.getUniqueName = function (name, names) {
    var isUnique = true;
    for (var i = 0; i < names.length; i++) {
        if (name === names[i]) {
            isUnique = false;
            break;
        }
    }
    
    if (isUnique) {
        return name;
    }
    
    var ending;
    i = name.lastIndexOf(" ");
    if (i > -1 && i < name.length) {
        ending = name.substr(i + 1);
        if (!isNaN(ending * 1)) {
            return omg.util.getUniqueName(name.substr(0, i + 1) + (ending * 1 + 1), names);
        }
    }
    return omg.util.getUniqueName(name + " 2", names);
};

omg.util.getSavedSound = function (sound, callback) {
    if (omg.util.noDB) {
        callback();
        return;
    }
    try {
    var request = indexedDB.open("omg_sounds", 1);
    request.onupgradeneeded = function (e) {
        var db = e.target.result;
        db.createObjectStore("saved_sounds");
    };
    request.onsuccess = function(e) {
        var db = e.target.result;
        var trans = db.transaction("saved_sounds");
        var request = trans.objectStore("saved_sounds").get(sound);
        request.onsuccess = function (e) {
            callback(request.result);
        }
    };
    request.onerror = function (e) {
        omg.util.noDB = true;
        callback();
    };
    } catch (e) {
        console.warn("getSavedSound threw an error", e);
        omg.util.noDB = true;
        callback();
    }
};

omg.util.saveSound = function (sound, data) {
    if (omg.util.noDB) return;
    try {
    indexedDB.open("omg_sounds").onsuccess = function(e) {
        var db = e.target.result;
        var trans = db.transaction(["saved_sounds"], "readwrite");
        trans.objectStore("saved_sounds").put(data, sound);
    };
    } catch (e) {console.log(e);}
};

omg.util.getUserThings = function (params) {
    var div = document.getElementsByClassName("user-username")[0];
    if (div) {
        div.innerHTML = params.user.username;
    }

    div = document.getElementsByClassName("user-created-at")[0];
    if (div) {
        div.innerHTML = omg.util.getTimeCaption(params.user.created_at);
    }

    params.page = 1
    omg.server.getHTTP("/data/?user_id=" + params.user.id, function (results) {
        if (results) {
            params.results = results;
            omg.util.loadSearchResults(params);
        }
        else {
            params.resultList.innerHTML = "Error parsing search results.";
        }
    });
};

omg.util.loadSearchResults = function (params) {

    omg.util.makePrevButton(params)

    var results = params.results;
    var resultList = params.resultList;
    var onclick = params.onclick;
    results.forEach(function (result) {
        var resultDiv = document.createElement("div");
        resultDiv.className = "search-thing";

        var resultDetail = document.createElement("div");
        resultDetail.className = "search-thing-detail";

        var resultData = document.createElement("div");
        resultData.className = "search-thing-image";
        resultData.innerHTML = "&nbsp;"
        resultData.style.backgroundColor = omg.ui.getBackgroundColor(result.type);
        resultDetail.appendChild(resultData);

        resultData = document.createElement("div");
        resultData.className = "search-thing-type";
        resultData.innerHTML = result.type;
        resultDetail.appendChild(resultData);

        resultData = document.createElement("div");
        resultData.className = "search-thing-title";
        resultData.innerHTML = result.name || (result.tags ? ("(" + result.tags + ")") : "");
        resultDetail.appendChild(resultData);

        resultData = document.createElement("div");
        resultData.className = "search-thing-user";
        resultData.innerHTML = result.username ? "by " + result.username : "";
        resultDetail.appendChild(resultData);

        var rightData = document.createElement("div");
        rightData.className = "search-thing-right-data";
        resultDetail.appendChild(rightData);

        resultData = document.createElement("div");
        resultData.className = "search-thing-votes";
        resultData.innerHTML = (result.votes || "0") + " votes";
        rightData.appendChild(resultData);

        resultData = document.createElement("div");
        resultData.className = "search-thing-created-at";
        resultData.innerHTML = omg.util.getTimeCaption(parseInt(result.last_modified));
        rightData.appendChild(resultData);
        resultDiv.appendChild(resultDetail)
        
        var showingMenu = false
        if (params.showMenu) {
            var menuDiv = document.createElement("div");
            menuDiv.className = "search-thing-menu";
            menuDiv.innerHTML = "&nbsp;&#9776;&nbsp;";
            rightData.appendChild(menuDiv);

            var optionsDiv = document.createElement("div");
            optionsDiv.className = "search-thing-options";
            optionsDiv.style.display = "none"
            resultDiv.appendChild(optionsDiv);
            var optionsRight = document.createElement("div")
            optionsRight.className = "search-thing-options-right"
            optionsDiv.appendChild(optionsRight)

            var deleteButton = document.createElement("span");
            deleteButton.innerHTML = "Delete"
            deleteButton.className = "search-thing-option"
            optionsRight.appendChild(deleteButton)
            deleteButton.onclick = function () {
                omg.server.deleteId(result.id, function () {
                    resultList.removeChild(resultDiv)
                });
            }

            var button = document.createElement("span");
            button.innerHTML = "Edit"
            button.className = "search-thing-option"
            optionsDiv.appendChild(button)
            button.onclick = function () {
                window.location = "/gauntlet/?id=" + result.id
            }

            if (result.type === "SONG" || result.type === "SECTION" || result.type === "PART") {
                button = document.createElement("span");
                button.innerHTML = "&nbsp;&minus;&nbsp;";
                optionsDiv.appendChild(button)
    
                button = document.createElement("span");
                button.innerHTML = "Add to PlayList"
                button.className = "search-thing-option"
                optionsDiv.appendChild(button)
                button.onclick = function () {
                    omg.util.addToPlaylist(result)
                }    
            }

            menuDiv.onclick = function (e) {
                showingMenu = !showingMenu
                optionsDiv.style.display = showingMenu ? "block" : "none"
                e.stopPropagation() 
            };
        }

        resultDetail.onclick = function () {
            if (onclick) {
                onclick(result);
            }
            else {
                if (result.type === "SOUNDSET") {
                    window.location = "soundset.htm?id=" + result.id;
                }
                else if (result.type === "PLAYLIST") {
                    window.location = "playlist.htm?id=" + result.id;
                }
                else {
                    window.location = "play/" + result.id;
                }
            }
        };
        resultList.appendChild(resultDiv);
   });

   omg.util.makeNextButton(params)
};

omg.util.makePrevButton = function (params) {
    if (params.page <= 1 || params.noNavigation) {
        return;
    }

    var button = document.createElement("button");
    button.innerHTML = "< Previous";
    button.onclick = function () {
        params.resultList.innerHTML = "";

        params.page -= 1;
        omg.server.getHTTP("/data/?page=" + params.page + "&user_id=" + params.user.id, function (results) {
            if (results) {
                params.results = results;
                omg.util.loadSearchResults(params);
            }
            else {
                params.resultList.innerHTML = "Error parsing search results.";
            }
        });
    
    };
    params.resultList.appendChild(button);
};

omg.util.makeNextButton = function (params) {
    if (params.noNavigation) {
        return
    }

    var nextButton = document.createElement("button");
    nextButton.innerHTML = "Next >";
    nextButton.onclick = function () {
        params.resultList.innerHTML = "";

        params.page += 1;
        omg.server.getHTTP("/data/?page=" + params.page + "&user_id=" + params.user.id, function (results) {
            if (results) {
                params.results = results;
                omg.util.loadSearchResults(params);
            }
            else {
                params.resultList.innerHTML = "Error parsing search results.";
            }
        });
    
    };
    params.resultList.appendChild(nextButton);
};


omg.util.addToPlaylist = function (result) {
    if (!omg.user) {
        alert("Login to make playlists")
        return
    }

    var thing = {name: result.name, id: result.id, 
        username: result.username, type: result.type,
        created_at: result.created_at,
        last_modified: result.last_modified
    }
    omg.server.getHTTP("/data/?type=PLAYLIST&user_id=" + omg.user.id, function (results) {
        if (results) {

            var dialog = document.createElement("div")
            dialog.innerHTML = "<div class='dialog-header'>Save to...</div><hr>" +
                (results.length === 0 ? "<br>(make a playlist!)<br>" : "")

            results.forEach(function (playlist) {
                var playlistDiv = document.createElement("div")
                playlistDiv.innerHTML = playlist.name
                playlistDiv.className = "add-to-playlist-item"
                dialog.appendChild(playlistDiv)

                playlistDiv.onclick = function () {
                    playlist.data.push(thing)
                    omg.server.post(playlist)
                    clearDialog()
                }
            });

            var element = document.createElement("hr")
            dialog.appendChild(element)
            element = document.createElement("input")
            element.placeholder = "New playlist"
            dialog.appendChild(element)
            element.onkeypress = function (e) {
                if (e.keyCode === 13) {
                    var newPlaylist = {
                        omgVersion: 1,
                        type: "PLAYLIST",
                        name: element.value,
                        data: [thing]
                    }

                    omg.server.post(newPlaylist)
                    clearDialog()
                }
            }

            var clearDialog = omg.ui.showDialog(dialog)
        }
        else {
            dialog.innerHTML = "Error parsing search results.";
        }
    });


}



/*
 * UI stuff
 * 
 */

if (!omg.ui)
    omg.ui = {};

omg.ui.omgUrl = "/omg-music/"; // omg-music/";

omg.ui.noteImageUrls = [[2, "note_half", "note_rest_half"],
    [1.5, "note_dotted_quarter", "note_rest_dotted_quarter"],
    [1, "note_quarter", "note_rest_quarter"],
    [0.75, "note_dotted_eighth", "note_rest_dotted_eighth"],
    [0.5, "note_eighth", "note_rest_eighth"], //, "note_eighth_upside"],
    [0.375, "note_dotted_sixteenth", "note_rest_dotted_sixteenth"],
    [0.25, "note_sixteenth", "note_rest_sixteenth"], //, "note_sixteenth_upside"],
    [0.125, "note_thirtysecond", "note_rest_thirtysecond"],
    [-1, "note_no_file", "note_no_file"]];
    
omg.ui.noteNames = ["C-", "C#-", "D-", "Eb-", "E-", "F-", "F#-", "G-", "G#-", "A-", "Bb-", "B-",
    "C0", "C#0", "D0", "Eb0", "E0", "F0", "F#0", "G0", "G#0", "A0", "Bb0", "B0",
    "C1", "C#1", "D1", "Eb1", "E1", "F1", "F#1", "G1", "G#1", "A1", "Bb1", "B1",
    "C2", "C#2", "D2", "Eb2", "E2", "F2", "F#2", "G2", "G#2", "A2", "Bb2", "B2",
    "C3", "C#3", "D3", "Eb3", "E3", "F3", "F#3", "G3", "G#3", "A3", "Bb3", "B3",
    "C4", "C#4", "D4", "Eb4", "E4", "F4", "F#4", "G4", "G#4", "A4", "Bb4", "B4",
    "C5", "C#5", "D5", "Eb5", "E5", "F5", "F#5", "G5", "G#5", "A5", "Bb5", "B5",
    "C6", "C#6", "D6", "Eb6", "E6", "F6", "F#6", "G6", "G#6", "A6", "Bb6", "B6",
    "C7", "C#7", "D7", "Eb7", "E7", "F7", "F#7", "G7", "G#7", "A7", "Bb7", "B7",
    "C8"];

omg.ui.keys = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
    
omg.ui.scales = [{name: "Major", value: [0, 2, 4, 5, 7, 9, 11]},
        {name: "Minor", value: [0, 2, 3, 5, 7, 8, 10]},
        {name: "Pentatonic", value: [0, 2, 5, 7, 9]},
        {name: "Blues", value: [0, 3, 5, 6, 7, 10]},
        {name: "Harmonic Minor", value: [0, 2, 3, 5, 7, 8, 11]},
        {name: "Mixolydian", value: [0, 2, 4, 5, 7, 9, 10]},
        {name: "Chromatic", value: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
    ];

omg.ui.getKeyCaption = function (keyParams) {
    var scaleName = "Major";
    if (keyParams && keyParams.scale) {
        omg.ui.scales.forEach(function (scale) {
            if (scale.value.join() == keyParams.scale.join())
                scaleName = scale.name;
        });
    }
    return omg.ui.keys[(keyParams.rootNote || 0)] + " " + scaleName;
};

omg.ui.soundFontNames = ["accordion","acoustic_bass","acoustic_grand_piano","acoustic_guitar_nylon","acoustic_guitar_steel","agogo","alto_sax","applause","bagpipe","banjo","baritone_sax","bassoon","bird_tweet","blown_bottle","brass_section","breath_noise","bright_acoustic_piano","celesta","cello","choir_aahs","church_organ","clarinet","clavinet","contrabass","distortion_guitar","drawbar_organ","dulcimer","electric_bass_finger","electric_bass_pick","electric_grand_piano","electric_guitar_clean","electric_guitar_jazz","electric_guitar_muted","electric_piano_1","electric_piano_2","english_horn","fiddle","flute","french_horn","fretless_bass","fx_1_rain","fx_2_soundtrack","fx_3_crystal","fx_4_atmosphere","fx_5_brightness","fx_6_goblins","fx_7_echoes","fx_8_scifi","glockenspiel","guitar_fret_noise","guitar_harmonics","gunshot","harmonica","harpsichord","helicopter","honkytonk_piano","kalimba","koto","lead_1_square","lead_2_sawtooth","lead_3_calliope","lead_4_chiff","lead_5_charang","lead_6_voice","lead_7_fifths","lead_8_bass__lead","marimba","melodic_tom","music_box","muted_trumpet","oboe","ocarina","orchestra_hit","orchestral_harp","overdriven_guitar","pad_1_new_age","pad_2_warm","pad_3_polysynth","pad_4_choir","pad_5_bowed","pad_6_metallic","pad_7_halo","pad_8_sweep","pan_flute","percussive_organ","piccolo","pizzicato_strings","recorder","reed_organ","reverse_cymbal","rock_organ","seashore","shakuhachi","shamisen","shanai","sitar","slap_bass_1","slap_bass_2","soprano_sax","steel_drums","string_ensemble_1","string_ensemble_2","synth_bass_1","synth_bass_2","synth_brass_1","synth_brass_2","synth_choir","synth_drum","synth_strings_1","synth_strings_2","taiko_drum","tango_accordion","telephone_ring","tenor_sax","timpani","tinkle_bell","tremolo_strings","trombone","trumpet","tuba","tubular_bells","vibraphone","viola","violin","voice_oohs","whistle","woodblock","xylophone"]


omg.ui.getScrollTop = function () {
    return document.body.scrollTop + document.documentElement.scrollTop;
};


omg.ui.totalOffsets = function (element, parent) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;

        if (parent && parent === element) {
            break;
        }

    } while (element);

    return {
        top: top,
        left: left
    };
};

omg.ui.getImageForNote = function (note, highContrast) {

    var index = (note.rest ? 2 : 0) + (highContrast ? 1 : 0)
    var draw_noteImage = omg.ui.noteImages[8][index];
    if (note.beats == 2.0) {
        draw_noteImage = omg.ui.noteImages[0][index];
    }
    if (note.beats == 1.5) {
        draw_noteImage = omg.ui.noteImages[1][index];
    }
    if (note.beats == 1.0) {
        draw_noteImage = omg.ui.noteImages[2][index];
    }
    if (note.beats == 0.75) {
        draw_noteImage = omg.ui.noteImages[3][index];
    }
    if (note.beats == 0.5) {
        draw_noteImage = omg.ui.noteImages[4][index];
    }
    if (note.beats == 0.375) {
        draw_noteImage = omg.ui.noteImages[5][index];
    }
    if (note.beats == 0.25) {
        draw_noteImage = omg.ui.noteImages[6][index];
    }
    if (note.beats == 0.125) {
        draw_noteImage = omg.ui.noteImages[7][index];
    }

    return draw_noteImage;

};

omg.ui.getNoteImageUrl = function (i, j, highContrast) {
    var fileName = omg.ui.noteImageUrls[i][j];
    if (fileName) {
        return "img/notes/" + (highContrast ? "w_" : "") + fileName + ".png";
    }
};

omg.ui.setupNoteImages = function () {
    if (omg.ui.noteImages)
        return;

    if (!omg.ui.noteImageUrls)
        omg.ui.getImageUrlForNote({beats: 1});

    var noteImages = [];
    var hasImgs = true;
    var img, img2;
    for (var i = 0; i < omg.ui.noteImageUrls.length; i++) {
        img = document.getElementById("omg_" + omg.ui.noteImageUrls[i][1]);
        img2 = document.getElementById("omg_" + omg.ui.noteImageUrls[i][2]);
        if (img && img2) {
            noteImages.push([img, img, img2, img2]);
        }
        else {
            hasImgs = false;
            break;
        }
    }

    if (hasImgs) {
        omg.ui.noteImages = noteImages;
        return;
    }

    noteImages = [];
    var loadedNotes = 0;
    var areAllNotesLoaded = function () {
        loadedNotes++;
        if (loadedNotes == omg.ui.noteImageUrls.length * 4) {
            omg.ui.noteImages = noteImages;
        }
    };

    for (var i = 0; i < omg.ui.noteImageUrls.length; i++) {

        var noteImage = new Image();
        noteImage.onload = areAllNotesLoaded;
        noteImage.src = omg.ui.omgUrl + omg.ui.getNoteImageUrl(i, 1);

        var noteWhiteImage = new Image();
        noteWhiteImage.onload = areAllNotesLoaded;
        noteWhiteImage.src = omg.ui.omgUrl + omg.ui.getNoteImageUrl(i, 1, true);

        var restImage = new Image();
        restImage.onload = areAllNotesLoaded;
        restImage.src = omg.ui.omgUrl + omg.ui.getNoteImageUrl(i, 2);

        var restWhiteImage = new Image();
        restWhiteImage.onload = areAllNotesLoaded;
        restWhiteImage.src = omg.ui.omgUrl + omg.ui.getNoteImageUrl(i, 2, true);

        var imageBundle = [noteImage, noteWhiteImage, restImage, restWhiteImage];
        var upsideDown = omg.ui.getNoteImageUrl(i, 3);
        if (upsideDown) {
            var upsideImage = new Image();
            upsideImage.src = omg.ui.omgUrl + upsideDown;
            imageBundle.push(upsideImage);
        }

        noteImages.push(imageBundle);
    }
};

omg.ui.getTextForNote = function (note, highContrast) {

    switch (note.beats) {
        case 4.0: return note.rest ? "\u{1D13B}" : "\u{1D15D}";
        case 3.75: return note.rest ? "\u{1D13C} \u{1D13D} \u{1D13E} \u{1D13F}" : "\u{1D15E} \u{1D16D} \u{1D16D} \u{1D16D}";
        case 3.5: return note.rest ? "\u{1D13C} \u{1D13D} \u{1D13E}" : "\u{1D15E} \u{1D16D} \u{1D16D}";
        case 3.25: return note.rest ? "\u{1D13C} \u{1D13D} \u{1D13F}" : "\u{1D15E} \u{1D16D} \u{1D161}";
        case 3.0: return note.rest ? "\u{1D13C} \u{1D13D}" : "\u{1D15E} \u{1D16D}";
        case 2.75: return note.rest ? "\u{1D13C} \u{1D13E} \u{1D13F}" : "\u{1D15E} \u{1D160} \u{1D161}";
        case 2.5: return note.rest ? "\u{1D13C} \u{1D13E}" : "\u{1D15E} \u{1D160}";
        case 2.25: return note.rest ? "\u{1D13C} \u{1D13F}" : "\u{1D15E} \u{1D161}";
        case 2.0: return note.rest ? "\u{1D13C}" : "\u{1D15E}";
        case 1.75: return note.rest ? "\u{1D13D} \u{1D13E} \u{1D13F}" : "\u{1D15F} \u{1D16D} \u{1D16D}";
        case 1.5: return note.rest ? "\u{1D13D} \u{1D13E}" : "\u{1D15F} \u{1D16D}";
        case 1.25: return note.rest ? "\u{1D13D} \u{1D13F}" : "\u{1D15F} \u{1D161}";
        case 1.0: return note.rest ? "\u{1D13D}" : "\u{1D15F}";
        case 0.75: return note.rest ? "\u{1D13E} \u{1D13F}" : "\u{1D160} \u{1D16D}";
        case 0.5: return note.rest ? "\u{1D13E}" : "\u{1D160}";
        case 0.375: return note.rest ? "\u{1D13F} \u{1D140}" : "\u{1D161} \u{1D16D}";
        case 0.25: return note.rest ? "\u{1D13F}" : "\u{1D161}";
        case 0.125: return note.rest ? "\u{1D140}" : "\u{1D162}";
    }

    return note.beats > 4 ? (note.rest ? "\u{1D13B} \u{1D144}" : "\u{1D15D} \u{1D144}") : "?";
};

omg.ui.splitInts = function (string) {
    var ints = string.split(",");
    for (var i = 0; i < ints.length; i++) {
        ints[i] = parseInt(ints[i]);
    }
    return ints;
};

omg.ui.getChordText = function (chord, ascale) {
    while (chord < 0) {
        chord += ascale.length;
    }
    while (chord >=  ascale.length) {
        chord -= ascale.length;
    }
    var chordInterval = ascale[chord];
    if (chordInterval === 0) {
        return "I";
    }
    else if (chordInterval === 2) return "II";
    else if (chordInterval === 3 || chordInterval === 4) return "III";
    else if (chordInterval === 5) return "IV";
    else if (chordInterval === 6) return "Vb";
    else if (chordInterval === 7) return "V";
    else if (chordInterval === 8 || chordInterval === 9) return "VI";
    else if (chordInterval === 10 || chordInterval === 11) return "VII";
    return "?";
}

omg.ui.getChordProgressionText = function (section) {
    var chordsText = "";
    if (section.data.chordProgression) {
        var chords = section.data.chordProgression;
        for (var i = 0; i < chords.length; i++) {
            if (i > 0) {
                chordsText += " - ";
            }
            chordsText += omg.ui.getChordText(chords[i], section.data.ascale);
        }
    }  
    return chordsText;
};

omg.ui.getBackgroundColor = function (type) {
   if (type === "SONG") {
      return "#99FF99";
   }

   if (type === "SECTION") {
      return "#99AAFF";
   }

   if (type === "PART" || type === "MELODY" || type === "DRUMBEAT" || type === "BASSLINE") {
      return "#FFFF99";
   }
   
   if (type === "SOUNDSET") {
       return "#FF9999";
   }

   if (type === "PLAYLIST") {
    return "#d08fc9";
}

   return "#808080";
};



omg.ui.useUnicodeNotes = navigator.userAgent.indexOf("Android") === -1 
    && navigator.userAgent.indexOf("iPhone") === -1 
    && navigator.userAgent.indexOf("iPad") === -1 
    && navigator.userAgent.indexOf("Mac OS X") === -1 ;
if (!omg.ui.useUnicodeNotes) {
    omg.ui.setupNoteImages();
}


omg.ui.setupInputEvents = function (input, bindObject, bindProperty, onenter) {
    var text = document.createElement("div");
    text.innerHTML = "Press Enter to save changes";
    text.style.display = "none";
    input.parentElement.insertBefore(text, input.nextSibling)
    input.value = bindObject[bindProperty] || "";
    input.onkeyup = function (e) {
        text.style.display = input.value !== bindObject[bindProperty] ? "inline-block" : "none";
        if (e.keyCode === 13) {
            text.style.display = "none";
            bindObject[bindProperty] = input.value;
            if (onenter) {
                onenter();
            }          
        }
    };
};

omg.ui.showDialog = function (dialog) {
    var background = document.createElement("div")
    background.style.position = "fixed"
    background.style.left = "0px"
    background.style.top = "0px"
    background.style.width = "100%"
    background.style.height = "100%"
    background.style.backgroundColor = "#808080"
    background.style.opacity = 0.5

    dialog.className = "dialog"

    document.body.appendChild(background)
    document.body.appendChild(dialog)

    dialog.style.position = "fixed"
    dialog.style.left = window.innerWidth / 2 - dialog.clientWidth / 2 + "px"
    dialog.style.top = window.innerHeight / 2 - dialog.clientHeight / 2 + "px"

    var clearDialog = () => {
        document.body.removeChild(background)
        document.body.removeChild(dialog)
    }

    background.onclick = clearDialog
    return clearDialog
}


omg.midi = {
    onSuccess: function (midiAccess) {
        omg.midi.api = midiAccess; 
        midiAccess.inputs.forEach( function(entry) {entry.onmidimessage = omg.midi.onMessage;});
    },
    onFailure: function (msg) {
        console.log( "Failed to get MIDI access - " + msg );
    },
    listInputsAndOutputs: function (midiAccess) {
        for (var input in midiAccess.inputs) {
            console.log( "Input port [type:'" + input.type + "'] id:'" + input.id +
            "' manufacturer:'" + input.manufacturer + "' name:'" + input.name +
            "' version:'" + input.version + "'" );
        }

        for (var output in midiAccess.outputs) {
            console.log( "Output port [type:'" + output.type + "'] id:'" + output.id +
            "' manufacturer:'" + output.manufacturer + "' name:'" + output.name +
            "' version:'" + output.version + "'" );
        }
    },
    onMessage: function (event) {
  
        var channel = (event.data[0] & 0x0f) + 1;
        switch (event.data[0] & 0xf0) {
            case 0x90:
                if (event.data[2]!=0) {  // if velocity != 0, this is a note-on message
                    omg.midi.onnoteon(event.data[1], channel);
                    return;
                }
                // if velocity == 0, fall thru: it's a note-off.  MIDI's weird, y'all.
            case 0x80:
                omg.midi.onnoteoff(event.data[1], channel);
                return;
            case 0xb0:
                switch (event.data[1]) {
                    case 24:
                        omg.midi.onplay();
                        return;
                    case 23:
                        omg.midi.onstop();
                        return;
                    default:
                        omg.midi.onmessage(event.data[1], event.data[2], channel);
                }
                return;
            case 0xE0:
                omg.midi.onmessage("pitchbend", event.data[2], channel);
                return;
        }
    },
    onnoteon: function (note) {console.log(note)},
    onnoteoff: function (note) {console.log(note)},
    onmessage: function (control, value) {console.log(control, value)},
    onplay: function () {},
    onstop: function () {}
};



//shim, may only be needed for tachno gauntlet
if (!document.body.requestFullscreen && document.body.webkitRequestFullscreen) {
    document.body.requestFullscreen = document.body.webkitRequestFullscreen;
}
