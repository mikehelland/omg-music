"use strict";

if (typeof omg === "undefined") {
    omg = {};
    console.log("No OMG Obejcts for embedded_viewer.js, not good!");
}

function omg_embedded_viewer_loadData(params) {
    console.log("starting")
    console.log(params);
    var div = params.div;
    var data = params.data;
    var viewer = {};
    viewer.div = div;
    div.style.position = "relative";
    //div.style.overflowX = "scroll";

    var padding = 8;

    viewer.playButton = document.createElement("div");
    viewer.editButton = document.createElement("div");
    viewer.shareButton = document.createElement("div");
    viewer.tipButton = document.createElement("div");
    viewer.voteButton = document.createElement("div");
    viewer.titleDiv = document.createElement("div");
    viewer.userDiv = document.createElement("div");
    viewer.datetimeDiv = document.createElement("div");

    viewer.playButton.innerHTML = "&#9654";
    viewer.editButton.innerHTML = "ReMix";
    viewer.shareButton.innerHTML = "Share";
    viewer.tipButton.innerHTML = "Tip";
    viewer.voteButton.innerHTML = "&#x2B06";
    viewer.voteButton.title = "Upvote";

    viewer.playButton.className = "omg-music-controls-play-button";
    viewer.editButton.className = "omg-music-controls-edit-button";
    viewer.shareButton.className = "omg-music-controls-button";
    viewer.tipButton.className = "omg-music-controls-button";
    viewer.voteButton.className = "omg-music-controls-button";

    viewer.div.appendChild(viewer.playButton);
    if (data.id)
        viewer.div.appendChild(viewer.editButton);
    //viewer.div.appendChild(viewer.shareButton);

    var result = data;
    var resultDiv = viewer.div;
    var resultCaption = result.tags || result.name || "";
    var type = result.partType || result.type || "";
    if (resultCaption.length === 0) {
        resultCaption = "(" + type.substring(0, 1).toUpperCase() +
                type.substring(1).toLowerCase() + ")";
    }

    var resultData = document.createElement("div");
    resultData.className = "omg-thing-title";
    resultData.innerHTML = resultCaption;
    resultDiv.appendChild(resultData);

    resultData = document.createElement("div");
    resultData.className = "omg-thing-user";
    resultData.innerHTML = result.username ? "by " + result.username : "";
    resultDiv.appendChild(resultData);

    var rightData = document.createElement("div");
    rightData.className = "omg-thing-right-data";
    resultDiv.appendChild(rightData);

    rightData.appendChild(viewer.tipButton);
    //rightData.appendChild(viewer.voteButton);

    resultData = document.createElement("span");
    resultData.className = "omg-thing-votes";
    resultData.innerHTML = (result.votes || "0") + " votes";
    //rightData.appendChild(resultData);

    resultData = document.createElement("span");
    resultData.className = "omg-thing-created-at";
    //resultData.innerHTML = getTimeCaption(parseInt(result.created_at));
    resultData.innerHTML = getTimeCaption(parseInt(result.last_modified));
    rightData.appendChild(resultData);

    var height = params.height || 150;

    viewer.shareButton.onclick = function () {
        omg.shareWindow.show();
    };

    viewer.partMargin = 20;
    viewer.sectionMargin = 0;
    viewer.sectionWidth = 200;
    viewer.leftOffset = viewer.sectionMargin;

    viewer.beatMarker = viewer.div.getElementsByClassName("beat-marker")[0];
    viewer.beatMarker.style.marginTop = viewer.playButton.clientHeight + 8 + "px";
    viewer.beatMarker.style.height = height + "px";
    viewer.beatMarker.style.marginLeft = padding / 2 + "px";


    omg.ui.omgUrl = "omg-music/";
    omg.ui.setupNoteImages();

    viewer.loadSong = function (song) {
        var flexDiv = document.createElement("div");
        flexDiv.className = "omg-song-data";
        flexDiv.style.height = height + "px";
        viewer.div.appendChild(flexDiv);

        song.sections.forEach(function (section, isection) {
            var sectionDiv = document.createElement("div");
            sectionDiv.className = "omg-section-data";
            flexDiv.appendChild(sectionDiv);
            //section.div = sectionDiv;
            viewer.loadSection(sectionDiv, section);
        });
        setTimeout(function () {
            viewer.drawSectionCanvases(song);
        }, 1000);
        
    };
    viewer.drawSectionCanvases = function (song) {
        song.sections.forEach(function (section, isection) {
            viewer.drawPartsCanvases(section);
        });
    };
    viewer.drawPartsCanvases = function (section) {
        try {
            var height = section.parts[0].div.clientHeight;
            var width = section.parts[0].div.clientWidth;
            section.parts.forEach(function (part) {
                viewer.drawPart(part, width, height);
            });
        } catch (e) {
            console.log(e);
        }
    };
    viewer.loadSection = function (div, section) {
        section.parts.forEach(function (part) {
            part.div = document.createElement("div");
            part.div.className = "omg-part";
            div.appendChild(part.div);

        });
                            
        //viewer.loadPart(div, part);

        var height = section.parts[0].div.clientHeight;
        var width = section.parts[0].div.clientWidth;

        section.parts.forEach(function (part) {
            part.canvas = document.createElement("canvas");
            part.canvas.width = 0;
            part.canvas.height = 0;
            part.canvas.className = "omg-viewer-part-canvas";
            part.div.appendChild(part.canvas);

            //part.div.height = height;
            //part.div.width = width;
        });
    };
    viewer.loadPart = function (div, part) {

    };
    viewer.drawPart = function (part, width, height) {
        var partDiv = part.div;


        part.canvas.height = part.canvas.clientHeight;
        part.canvas.width = part.canvas.clientWidth - 16;

        var params = {};
        params.canvas = partDiv;
        params.keepCanvasDirty = true; // so each part doesn't clear the rest
        params.data = part; //part.data;

        if (!part.ui) {
            if (part.data.surface.url === "PRESET_SEQUENCER") {
                part.ui = new OMGDrumMachine(part.canvas, part)
                part.ui.captionWidth = 0;
                part.ui.highContrast = false;
            } else {
                part.ui = new OMGMelodyMaker(part.canvas, part)
                part.ui.highContrast = false;
            }            
        }
        part.ui.draw();
    };

    viewer.loadPlayer = function (dataToPlay) {
        if (!dataToPlay || !dataToPlay.type) {
            return false;
        }

        var soundSet = false;
        if (dataToPlay.type === "SOUNDSET") {
            soundSet = true;
            viewer.div.className = "omg-soundset";
        } else {
            viewer.player = new OMusicPlayer();
            viewer.song = viewer.player.makeOMGSong(dataToPlay);
            var info = viewer.player.prepareSong(viewer.song);
            if (!info) {
                console.log("couldn't prepare data");
                console.log(dataToPlay);
                return false;
            }
            viewer.info = info;
        }

        if (dataToPlay.type === "SONG") {
            viewer.div.className = "omg-song";
            viewer.loadSong(viewer.song);
        }
        if (dataToPlay.type === "SECTION") {
            viewer.div.className = "omg-section";
            var section = viewer.song.sections[0]; //dataToPlay;

            var flexDiv = document.createElement("div");
            flexDiv.className = "omg-section-data";
            flexDiv.style.height = height + "px";
            viewer.div.appendChild(flexDiv);

            viewer.loadSection(flexDiv, section);
            viewer.drawPartsCanvases(section);

        }
        if (dataToPlay.type === "PART") {
            viewer.div.className = "omg-part-data";
            var part = viewer.song.sections[0].parts[0];
            viewer.loadPart(viewer.div, part);
            part.div.style.width = viewer.div.clientWidth - 16 + "px";
            part.div.style.height = height + "px";
            viewer.drawPart(part);
        }

        viewer.titleDiv.innerHTML = dataToPlay.title || "(untitled)";
        viewer.userDiv.innerHTML = dataToPlay.username || "(unknown)";
        viewer.datetimeDiv.innerHTML = getTimeCaption(dataToPlay.created_at);

        if (soundSet) {

        } else {
            viewer.totalBeatsInSong = info.totalSubbeats;
            var pxPerBeat = (viewer.div.clientWidth - padding) / viewer.totalBeatsInSong;

            viewer.player.onBeatPlayedListeners.push(function (isubbeat, isection) {
                viewer.beatMarker.style.width = pxPerBeat * (1 + isubbeat + isection * beatsInSection) + "px";
            });

            viewer.editButton.onclick = function () {
                window.location = "music-maker.htm?id=" + dataToPlay.id;
            };

        }
        viewer.tipButton.onclick = function () {
            window.location = "bitcoin:1Jdam2fBZxfhWLB8yP69Zbw6fLzRpweRjc?amount=0.004";
        };
    };


    viewer.queryStringParameters = (function () {
        var loadParams = {};
        var params = document.location.search;
        var nvp;

        if (params.length > 1) {
            params = params.slice(1).split("&");
            for (var ip = 0; ip < params.length; ip++) {
                nvp = params[ip].split("=");
                loadParams[nvp[0]] = nvp[1];
            }
        }
        return loadParams;
    })();

    viewer.getDataById = function (id, callback, errorCallback) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/data/" + id, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                var ojson = JSON.parse(xhr.responseText);
                callback(ojson);
            }
        };
        xhr.send();
    };

    viewer.playButton.onclick = function () {
        var pbClass = viewer.playButton.className;
        viewer.player.onStop = function () {
            viewer.playButton.className = pbClass;
            viewer.playButton.innerHTML = "&#9654;";        
            if (typeof params.onStop === "function") {
                params.onStop();
            }
        };
        viewer.player.onPlay = function (info) {
            viewer.playButton.className = pbClass;
            viewer.playButton.innerHTML = "&#9642;";        
            if (typeof params.onPlay === "function") {
                params.onPlay(viewer.player, info);
            }
        };

        if (viewer.player.playing) {
            viewer.player.stop();
            viewer.beatMarker.style.width = "0px";

        } else {
            viewer.playButton.className = pbClass + " loader";
            viewer.player.load(viewer.info, function (info) {
                viewer.player.play(info);
            });
        }
    };

    console.log("loading player")
    console.log(data);
    viewer.loadPlayer(data);
}

function omg_embedded_viewer_loadURL(params) {
    omg.server.getHTTP(params.url, function (result) {
        params.data = result;
        omg_embedded_viewer_loadData(div, result);
    });
}

function omg_embedded_viewer_loadId(params) {
    omg.server.getId(params.id, function (result) {
        params.data = result;
        omg_embedded_viewer_loadData(params);
    });
}


function getTimeCaption(timeMS) {

    if (!timeMS) {
        return "";
    }

    var seconds = Math.round((Date.now() - timeMS) / 1000);
    if (seconds < 60)
        return seconds + " sec ago";

    var minutes = Math.floor(seconds / 60);
    if (minutes < 60)
        return minutes + " min ago";

    var hours = Math.floor(minutes / 60);
    if (hours < 24)
        return hours + " hr ago";

    var days = Math.floor(hours / 24);
    if (days < 7)
        return days + " days ago";

    var date = new Date(timeMS);
    var months = ["Jan", "Feb", "Mar", "Apr", "May",
        "Jun", "Jul", "Aug", "Sep", "Oct",
        "Nov", "Dec"];
    var monthday = months[date.getMonth()] + " " + date.getDate();
    if (days < 365) {
        return monthday;
    }
    return monthday + " " + date.getYear();
};
