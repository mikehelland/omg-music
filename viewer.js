var viewer = function (result) {

	var resultCaption = "OpenMusic.Gallery";
	if (result) {

		resultCaption = result.tags || result.name || "";
		var type = result.partType || result.type || "";
		if (resultCaption.length === 0) {
			resultCaption = "(" + type.substring(0, 1).toUpperCase() + 
				type.substring(1).toLowerCase() + ")";
		}
		
		if (result.username) {
			resultCaption += " by " + result.username;
		}
		
		resultCaption += " on OpenMusic.Gallery";
	}

return `<!DOCTYPE html>
<html>
<head>

   <link rel="stylesheet" href="css/main.css" type="text/css" />
   <link rel="stylesheet" href="css/viewer.css" type="text/css" />
   <meta property="og:image" content="http://openmusic.gallery/img/section.png"/>
   <meta property="og:description" content="Find, create, and customize music for your project. For Free."/>
   <meta property="og:title" content="${resultCaption}"/>

	<style>html,body {height:100%; margin:0; }
		
</style>
</head>
<body>

   <div class="main-body">

      <div id="omgviewer"><div class="beat-marker"></div></div>
      
      <p>Try making music with OpenMusic.Gallery:</p>
      <div class="site-tools">
			<a href="music-maker.htm?type=drumbeat"><img src="img/beat.png">Create a Beat</a> <span class="tools-seperator">|</span>
			<a href="music-maker.htm"><img src="img/melody.png">Create a Melody</a> <span class="tools-seperator">|</span>
			
			<a target="_blank" href="https://play.google.com/store/apps/details?id=com.mikehelland.omgtechnogauntlet">
				  <img src="img/technogauntlet.png">Get Techno GAUNTLET the mobile app!
			</a> <span class="tools-seperator">|</span>
			<a href="what_is_open_music.htm"><img src="favicon.ico">What is open music?</a>
      </div>
      
   </div>

   <div class="main-title-bar">
      <div class="main-title-bar-content">
      <a class="main-page-link" href="index.htm">
         <span class="main-title-open">Open</span><span class="main-title-media">Music</span><span class="main-title-gallery">.Gallery</span>
      </a>

	   <div class="main-description">
		  Find, create, and customize music for your project.
	   </div>

         <div class="main-title-bar-right">
            <div class="title-bar-user-controls"></div>
         </div>

      </div>
   </div>

   <script src="omg-music/omusic_partsui.js"></script>
   <script src="omg-music/omusic_player_new.js"></script>
   <script src="js/omgservice.js"></script>
   <script src="js/embedded_viewer.js"></script>

   <script src="js/usercontrols.js"></script>
   <script src="js/sharecontrols.js"></script>
   <script>
   setupUserControls(document.getElementsByClassName("title-bar-user-controls")[0]);
   omg.setupShareWindow();
   var id = omg.util.getPageParams().id
   omg_embedded_viewer_loadId({div: document.getElementById("omgviewer"), id: id,
		height: window.innerHeight - 44 - 250});
   </script>

</body>
</html>`

};

module.exports = viewer;
