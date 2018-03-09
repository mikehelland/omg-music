"use strict";

if (typeof omg === "undefined") {
    omg = {};
    console.log("No OMG Obejcts for embedded_viewer.js, not good!")
}

function omg_embedded_viewer_loadData(params) {
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
    if (data.id) viewer.div.appendChild(viewer.editButton);
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

    console.log("var height = " + height);

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

    viewer.loadSong = function (data) {
        var flexDiv = document.createElement("div");
        flexDiv.className = "omg-song-data";
        flexDiv.style.height  = height + "px";
        viewer.div.appendChild(flexDiv);

        data.sections.forEach(function (section, isection) {
            var sectionDiv = document.createElement("div");
            sectionDiv.className = "omg-section-data";
            flexDiv.appendChild(sectionDiv);
            //section.div = sectionDiv;
            viewer.loadSection(sectionDiv, section);
        });
        viewer.drawSectionCanvases(data);
    };
    viewer.drawSectionCanvases = function (data) {
        data.sections.forEach(function (section, isection) {
                viewer.drawPartsCanvases(section);
        });
    };
    viewer.drawPartsCanvases = function (section) {
        var height = section.parts[0].div.clientHeight;
        var width = section.parts[0].div.clientWidth;
        section.parts.forEach(function (part) {
                viewer.drawPart(part, width, height);
        });
    };
    viewer.loadSection = function (div, section) {
        section.parts.forEach(function (part) {
                viewer.loadPart(div, part);
        });
    };
    viewer.loadPart = function (div, part) {
        var partDiv = document.createElement("canvas");
        partDiv.height = 1;
        partDiv.width = 1;
        partDiv.className = "omg-part";
        part.div = partDiv;

        div.appendChild(partDiv);

    };
    viewer.drawPart = function (part, width, height) {
            var partDiv = part.div;
            partDiv.height = partDiv.clientHeight;
            partDiv.width = partDiv.clientWidth - 16;

            params = {};
            params.canvas = partDiv;
            params.keepCanvasDirty = true; // so each part doesn't clear the rest
            params.data = part; //part.data;

            if (params.data.surfaceURL === "PRESET_SEQUENCER") {
                    params.captionWidth = 0;
                    omg.ui.drawDrumCanvas(params);
            } else if (params.data.surfaceURL) {
                    omg.ui.drawMelodyCanvas(params);
            }
    };

    viewer.loadPlayer = function (dataToPlay) {
       viewer.player = new OMusicPlayer();
       var info = viewer.player.prepare(dataToPlay);
       if (!info) {
           //todo show a message or something?
           alert("couldn't prepare data");
           console.log("couldn't prepare data");
           console.log(dataToPlay);
           return;
       }
       viewer.info = info;

       var soundSet = false;
       if (dataToPlay && dataToPlay.type) {
            if (dataToPlay.type === "SOUNDSET") {
                soundSet = true;
                viewer.div.className = "omg-soundset";
            }
            if (dataToPlay.type === "SONG") {
                viewer.div.className = "omg-song";
                viewer.loadSong(dataToPlay);
            }
            if (dataToPlay.type === "SECTION") {
                viewer.div.className = "omg-section";
                var section = dataToPlay; 

                var flexDiv = document.createElement("div");
                flexDiv.className = "omg-section-data";
                flexDiv.style.height  = height + "px";
                viewer.div.appendChild(flexDiv);

                viewer.loadSection(flexDiv, section);
                viewer.drawPartsCanvases(section);

            }
            if (dataToPlay.type === "PART" || 
                         dataToPlay.type === "MELODY" || dataToPlay.type === "BASSLINE" ||
                         dataToPlay.type === "DRUMBEAT") {
                viewer.div.className = "omg-part-data";
                var part = dataToPlay; //viewer.omgsong.sections[0].parts[0];
                viewer.loadPart(viewer.div, part);
                part.div.style.width = viewer.div.clientWidth - 16 + "px";
                part.div.style.height = height + "px";
                viewer.drawPart(part);
            }
       }

       viewer.titleDiv.innerHTML = dataToPlay.title || "(untitled)";
       viewer.userDiv.innerHTML = dataToPlay.username || "(unknown)";
       viewer.datetimeDiv.innerHTML = getTimeCaption(dataToPlay.created_at);

            if (soundSet) {

            }
            else {
                viewer.totalBeatsInSong =  info.totalSubbeats; 
                var pxPerBeat = (viewer.div.clientWidth - padding) / viewer.totalBeatsInSong;

                viewer.player.onBeatPlayedListeners.push(function(isubbeat, isection) {
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
       xhr.onreadystatechange = function() {
              if (xhr.readyState === 4) {
                     var ojson = JSON.parse(xhr.responseText);
                     callback(ojson);
              }
       };
       xhr.send();
    };

    var pbClass = viewer.playButton.className;
    viewer.playButton.onclick = function () {
       if (viewer.player.playing) {
              viewer.player.stop();
              viewer.beatMarker.style.width = "0px";
              viewer.playButton.className = pbClass;
              viewer.playButton.innerHTML = "&#9654;";
       } else {
              viewer.player.onPlay = function () {
                viewer.playButton.className = pbClass;
                viewer.playButton.innerHTML = "&#9642;";
              };
              viewer.playButton.className = pbClass + " loader";
              viewer.player.load(viewer.info, function (info) {
                  viewer.player.play(info);
              });
       }
    };

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
    return monthday + " " + date.getYear();
};
