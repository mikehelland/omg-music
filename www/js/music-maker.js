omg.musicUrl = "omg-music/";

var omgbam = new OMusicEditor();
var omgservice = new OMGService();

document.getElementsByClassName("omg-music-controls-title")[0].oninput = function (e) {
   if (omgbam.musicMakerZone) {
      omgbam.musicMakerZone.data.title = e.target.value;
      console.log(e.target.value);
   }
};

omgbam.onzonechange = function (zone) {
   var label = document.getElementsByClassName("omg-music-controls-label")[0];
   var title = document.getElementsByClassName("omg-music-controls-title")[0];

   var type;
   omgbam.musicMakerZone = zone;
   if (zone && zone.data && zone.data.type) {
      type = zone.data.type;
      omgbam.musicMakerZoneType = type;
      label.innerHTML = type.slice(0, 1).toUpperCase() + type.slice(1).toLowerCase();
      title.value = zone.data.title || "";

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
      if (omgbam.musicMakerZoneType === "SONG") {
         window.location = "viewer.htm?id=" + omgbam.song.data.id;
      }
   });
};


