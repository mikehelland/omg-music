"use strict";
var viewer = {};
viewer.div = document.getElementById("omgviewer");
viewer.canvas = document.createElement("canvas");
viewer.div.appendChild(viewer.canvas);
viewer.canvas.style.width = "100%";
viewer.canvas.style.height = viewer.div.clientHeight - 20 + "px";
viewer.canvas.width = viewer.canvas.clientWidth
viewer.canvas.height = viewer.canvas.clientHeight

viewer.playButton = document.getElementById("play-button");
viewer.editButton = document.getElementById("edit-button");

viewer.partMargin = 40;
viewer.sectionMargin = 0;
viewer.sectionWidth = 200;
viewer.leftOffset = viewer.sectionMargin;

viewer.context = viewer.canvas.getContext("2d");

viewer.beatMarker = document.getElementsByClassName("beat-marker")[0];

omg.musicUrl = "omg-music/";
omg.ui.setupNoteImages()

viewer.loadPlayer = function (dataToPlay) {
   viewer.player = new OMusicPlayer();
   viewer.omgsong = viewer.player.makeOMGSong(dataToPlay);

   viewer.drawSong(viewer.omgsong);

   viewer.player.play(viewer.omgsong);
   viewer.playButton.innerHTML = "Stop";

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

         if (part.data.type == "DRUMBEAT") {
            params.captionWidth = 0;
            omg.ui.drawDrumCanvas(params)
         } else {
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
      viewer.player.play();
      viewer.playButton.innerHTML = "Stop";
   }
};

viewer.getDataById(viewer.queryStringParameters.id, function (dataToPlay) {
   viewer.loadPlayer(dataToPlay);
}, function () {
   //error
});
