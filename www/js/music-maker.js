omg.ui.omgUrl = "omg-music/";

var omgbam = new OMusicEditor();

document.getElementsByClassName("omg-music-controls-title")[0].oninput = function (e) {
    if (omgbam.musicMakerZone) {
        omgbam.musicMakerZone.data.name = e.target.value;
        omgbam.musicMakerZone.saved = false;
    }
};

window.onpopstate = function (event) {
    //the type here is the type we're moving to
    //section can be from either part or song
    if (event.state.type == "SECTION") {
        if (omgbam.musicMakerZoneType == "PART") {
            omgbam.mm.nextButtonClick();
        }
        if (omgbam.musicMakerZoneType == "SONG") {
            omgbam.songEditor.editSection(omgbam.section);
        }
    } else if (event.state.type == "PART") {
        omgbam.section.parts[omgbam.part.position].canvas.onclick();
    } else if (event.state.type == "SONG") {
        omgbam.sectionEditor.showSongEditor();
    } else {
        return;
    }
    //omgbam.onzonechange(omgbam[event.state.type.toLowerCase()]);
};

var skipNextOnZoneChange = true;

omgbam.onzonechange = function (zone, pop) {

    var label = document.getElementsByClassName("omg-music-controls-label")[0];
    var title = document.getElementsByClassName("omg-music-controls-title")[0];

    var firstTime = !omgbam.musicMakerZone;

    var type;
    omgbam.musicMakerZone = zone;
    if (zone && zone.data && zone.data.type) {
        type = zone.data.type;
        omgbam.musicMakerZoneType = type;
        label.innerHTML = type.slice(0, 1).toUpperCase() + type.slice(1).toLowerCase();
        title.value = zone.data.name || zone.data.title || "";

        var zoneBG = window.getComputedStyle(zone.div, null).backgroundColor;
        var controls = document.getElementsByClassName("omg-music-controls")[0];
        controls.style.background = "linear-gradient(#FFFFFF, " + zoneBG + ")";
        controls.style.opacity = 1;

        if (firstTime) {
            window.history.replaceState(zone.data, "");
            return;
        }

        var updateWindowHistory = function () {
            var queryString = "";
            if (omgbam.song.data.id || zone.data.type == "SONG") {
                queryString += "?song=" + (omgbam.song.data.id || 0);
            }
            if (zone.data.type == "SECTION"
                    || (zone.data.type == "PART"
                            && (omgbam.section.data.id
                                    || omgbam.song.data.id))) {
                queryString += queryString.length > 0 ? "&" : "?";
                queryString += "section=" + (omgbam.section.data.id || 0);
            }
            if (zone.data.type == "PART") {
                queryString += queryString.length > 0 ? "&" : "?";
                queryString += "part=" + (omgbam.part.data.id || 0);
            }

            if (omgbam.initialized && window.location.search != queryString) {
                console.log("update window history");
                window.history.pushState(zone.data, "", window.location.pathname + queryString);
            }
        };

        if (!zone.saving) {
            updateWindowHistory();
        } else {
            var attempts = 0;
            var getIdHandle = setInterval(function () {
                if (zone.data.id) {
                    updateWindowHistory();
                    clearInterval(getIdHandle);
                    return;
                }

                attempts++;
                if (attempts > 20) {
                    clearInterval(getIdHandle);
                    updateWindowHistory();
                }
            }, 100);
        }
    }
};

//this is declared in the html file for some reason
omgbam.setup({div: omgbamElement});


//TODO hasDataCallBack from melody maker welcome screen?

var playButton = document.getElementById("omg-music-controls-play-button");
omgbam.showingPlayButton = playButton;
playButton.onclick = function () {
    omgbam.playButtonClick();
};

var shareButton = document.getElementById("omg-music-controls-share-button");
shareButton.onclick = function () {
    if (!omg.shareWindow) {
        omg.setupShareWindow();
    }
    omg.shareWindow.show();
};


document.getElementById("omg-music-controls-next-button").onclick = function () {
    omgbam.nextButtonClick(function () {
        if (omgbam.musicMakerZoneType === "SONG") {
            window.location = "viewer.htm?id=" + omgbam.song.data.id;
        }
    });
};


var keyButton = document.getElementById("omg-music-controls-key-button");
keyButton.onclick = function (e) {
    omgbam.showKeyChooser(e);
};
var tempoButton = document.getElementById("omg-music-controls-tempo-button");
tempoButton.onclick = function (e) {
    omgbam.showTempoChooser(e);
};
var chordsButton = document.getElementById("omg-music-controls-chords-button");
//chordsButton.onclick = function (e) {
//   omgbam.showChordChooser(e);
//};
