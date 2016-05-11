omg.musicUrl = "omg-music/";

var omgbam = new OMusicEditor();
var omgservice = new OMGService();

omgbam.onzonechange = function (zone) {
   var label = document.getElementsByClassName("omg-music-controls-label")[0];
   var type;
   if (zone && zone.data && zone.data.type) {
      type = zone.data.type;
      omgbam.musicMakerZone = type;
      label.innerHTML = type.slice(0, 1).toUpperCase() + type.slice(1).toLowerCase();

      var zoneBG = window.getComputedStyle(zone.div, null).backgroundColor;
      document.getElementsByClassName("omg-music-controls")[0].style.background = "linear-gradient(#FFFFFF, " + zoneBG + ")";
   }
};

omgbam.setup({div:        omgbamElement, 
              omgservice: omgservice});


//TODO hasDataCallBack from melody maker welcome screen?

var playButton = document.getElementById("omg-music-controls-play-button");
omgbam.showingPlayButton = playButton;
playButton.onclick = function () {
   omgbam.playButtonClick();
};

document.getElementById("omg-music-controls-next-button").onclick = function () {
   omgbam.nextButtonClick(function () {
      if (omgbam.musicMakerZone === "SONG") {
         window.location = "viewer.html?id=" + omgbam.song.data.id;
      }
   });
};


