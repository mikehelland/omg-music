"use strict";
function omg_embedded_viewer_loadData(div, data) {
	var viewer = {};	
	viewer.div = div;
	div.style.position = "relative";
	div.style.overflowX = "scroll";

	viewer.playButton = document.createElement("div");
	viewer.editButton = document.createElement("div");
	viewer.shareButton = document.createElement("div");
	viewer.tipButton = document.createElement("div");
	viewer.titleDiv = document.createElement("div");
	viewer.userDiv = document.createElement("div");
	viewer.datetimeDiv = document.createElement("div");

	viewer.playButton.innerHTML = "Play";
	viewer.editButton.innerHTML = "Edit";
	viewer.shareButton.innerHTML = "Share";
	viewer.tipButton.innerHTML = "Tip";

	viewer.playButton.className = "omg-music-controls-button";
	viewer.editButton.className = "omg-music-controls-button";
	viewer.shareButton.className = "omg-music-controls-button";
	viewer.tipButton.className = "omg-music-controls-button";
	//viewer.titleDiv.className = "omg-music-controls-button";
	//viewer.userDiv.className = "omg-music-controls-button";
	//viewer.datetimeDiv.className = "omg-music-controls-button";

	viewer.div.appendChild(viewer.playButton);
	if (data.id) viewer.div.appendChild(viewer.editButton);
	//viewer.div.appendChild(viewer.shareButton);
	viewer.div.appendChild(viewer.tipButton);
	//viewer.div.appendChild(viewer.titleDiv);
	//viewer.div.appendChild(viewer.userDiv);
	//viewer.div.appendChild(viewer.datetimeDiv);


	viewer.canvas = document.createElement("canvas");
	viewer.canvas.style.height = "150px";
	viewer.div.appendChild(viewer.canvas);
	viewer.canvas.style.width = "100%";
	viewer.canvas.style.height = viewer.div.clientHeight - 20 + "px";
	viewer.canvas.width = viewer.canvas.clientWidth
	viewer.canvas.height = viewer.canvas.clientHeight

	viewer.shareButton.onclick = function () {
	   omg.shareWindow.show();
	};

	viewer.partMargin = 20;
	viewer.sectionMargin = 0;
	viewer.sectionWidth = 200;
	viewer.leftOffset = viewer.sectionMargin;

	viewer.context = viewer.canvas.getContext("2d");

	viewer.beatMarker = viewer.div.getElementsByClassName("beat-marker")[0];
	viewer.beatMarker.style.marginTop = viewer.canvas.offsetTop + "px";
	viewer.beatMarker.style.height = viewer.canvas.height + "px";

	omg.ui.omgUrl = "omg-music/";
	omg.ui.setupNoteImages();

	viewer.loadPlayer = function (dataToPlay) {
	   viewer.player = new OMusicPlayer();
	   viewer.omgsong = viewer.player.makeOMGSong(dataToPlay);

	   viewer.sectionWidth = Math.max(viewer.sectionWidth, 
			viewer.div.clientWidth / viewer.omgsong.sections.length);
	   viewer.drawSong(viewer.omgsong);

	   //viewer.player.play(viewer.omgsong);
	   //viewer.playButton.innerHTML = "Stop";

	   viewer.titleDiv.innerHTML = dataToPlay.title || "(untitled)";
	   viewer.userDiv.innerHTML = dataToPlay.username || "(unknown)";
	   viewer.datetimeDiv.innerHTML = getTimeCaption(dataToPlay.created_at);


	   //maybe
	   var beatsInSection = viewer.player.beats * viewer.player.subbeats;
	   viewer.totalBeatsInSong =  viewer.omgsong.sections.length * beatsInSection;
	   var pxPerBeat = viewer.canvas.width / viewer.totalBeatsInSong;

	   viewer.player.onBeatPlayedListeners.push(function(isubbeat, isection) {
		  viewer.beatMarker.style.width = pxPerBeat * (1 + isubbeat + isection * beatsInSection) + "px";
	   });

	   viewer.editButton.onclick = function () {
		  window.location = "music-maker.htm?id=" + dataToPlay.id;
	   };
	   
	   viewer.tipButton.onclick = function () {
		  window.location = "bitcoin:1Jdam2fBZxfhWLB8yP69Zbw6fLzRpweRjc?amount=0.004";
	   };
	};

	viewer.drawSong = function (song) {

	   var height = viewer.canvas.height;
	   var partHeight;
	   var params;

	   viewer.canvas.style.width = viewer.sectionMargin + song.sections.length * (viewer.sectionWidth + viewer.sectionMargin) + "px";
	   viewer.canvas.width = viewer.canvas.clientWidth;

	   song.sections.forEach(function (section, isection) {

		  partHeight = height / section.parts.length;
		  var currentMargin = viewer.partMargin / section.parts.length; 

		  section.parts.forEach(function (part, ipart) {

			 params = {};
			 params.canvas = viewer.canvas;
			 params.keepCanvasDirty = true; // so each part doesn't clear the rest
			 params.data = part.data;
			 params.offsetTop = ipart * partHeight + currentMargin;
			 params.offsetLeft = viewer.leftOffset + isection * (viewer.sectionWidth + viewer.sectionMargin);
			 params.height = partHeight - currentMargin * 2;
			 params.width = viewer.sectionWidth;

			 if (part.data.type == "CHORDPROGERSSION") {
				//TODO draw chord progression and all that 
			 }
			 else if (part.data.surfaceURL == "PRESET_SEQUENCER") {
				params.captionWidth = 0;
				//omg.ui.drawDrumCanvas(params)
                                part.ui.draw(params);
			 } else if (part.data.surfaceURL) {
				omg.ui.drawMelodyCanvas(params);
			 }

			 viewer.drawPartBorder(params);
		  });
	   });
	};


	viewer.drawPartBorder = function (params) {
	   viewer.context.strokeStyle = "#808080";
	   viewer.context.strokeRect(params.offsetLeft, params.offsetTop, params.width, params.height);   
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
		  if (xhr.readyState == 4) {
			 var ojson = JSON.parse(xhr.responseText);
			 callback(ojson);
		  }
	   };
	   xhr.send();
	};

	viewer.playButton.onclick = function () {
	   if (viewer.player.playing) {
		  viewer.player.stop();
		  viewer.beatMarker.style.width = "0px";
		  viewer.playButton.innerHTML = "Play";
	   } else {
		  viewer.player.play(viewer.omgsong);
		  viewer.playButton.innerHTML = "Stop";
	   }
	};
	
	viewer.loadPlayer(data);
}

function omg_embedded_viewer_loadURL(div, url) {
	omg.server.getHTTP(url, function (result) {
		omg_embedded_viewer_loadData(div, result);
	});
}

function omg_embedded_viewer_loadId(div, id) {
	omg.server.getId(id, function (result) {
		omg_embedded_viewer_loadData(div, result);
	});
}


/*wow that's ugly
 * viewer.getDataById(viewer.queryStringParameters.id, function (dataToPlay) {
   viewer.loadPlayer(dataToPlay);
}, function () {
   //error
});*/
	

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

