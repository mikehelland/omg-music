var viewer = function (result) {

    var resultCaption = "OpenMusic.Gallery";
    if (result) {

        resultCaption = result.name || result.tags || "";
        var type = result.partType || result.type || "";
        if (resultCaption.length === 0) {
            resultCaption = "(" + type.substring(0, 1).toUpperCase() + 
                    type.substring(1).toLowerCase() + ")";
        }
        else {
            resultCaption = '&quot;' + resultCaption + '&quot;';
        }

        if (result.username) {
            resultCaption += " by " + result.username.trim();
        }

        resultCaption += " on OMG";
    }
    var pageData = JSON.stringify(result);

return `<!DOCTYPE html>
<html>
<head>

   <link rel="stylesheet" href="/css/main.css" type="text/css" />
   <link rel="stylesheet" href="/css/viewer.css" type="text/css" />
   <meta property="og:image" content="http://openmusic.gallery/img/section.jpg"/>
   <meta property="og:description" content="Find, create, and customize music for your project. For Free."/>
   <meta property="og:title" content="${resultCaption}"/>

    <style>html,body {height:100%; margin:0; }
    </style>

    <script>
    var data = ${pageData};
    console.log(data);
    </script>

</head>
<body>

   <div class="main-body">

      <div id="omgviewer"><div class="beat-marker"></div></div>
      
      <p>Make your own music with OpenMusic.Gallery:</p>
      <div class="site-tools">
            <a target="_blank" href="/gauntlet/">
                      <img src="/img/technogauntlet.png">Go to Techno GAUNTLET
            </a> <span class="tools-seperator">|</span>
            <a href="/docs/what_is_open_music.htm"><img src="/favicon.ico">What is open music?</a>
      </div>
      
   </div>

   <div class="main-title-bar">
      <div class="main-title-bar-content">
      <a class="main-page-link" href="/">
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

   <script src="/omg-music/omgclasses.js"></script>
   <script src="/omg-music/tuna-min.js"></script>
   <script src="/omg-music/omusic_player.js"></script>
   <script src="/js/omgservice.js"></script>
   <script src="/js/embedded_viewer.js"></script>

   <script src="/js/usercontrols.js"></script>
   <script src="/js/sharecontrols.js"></script>
   <script>
   var viewer;
   window.onload = function () {
        setupUserControls(document.getElementsByClassName("title-bar-user-controls")[0]);
        omg.setupShareWindow();
        
        viewer = new OMGEmbeddedViewer({div: document.getElementById("omgviewer"),
            data: data,
            height: window.innerHeight - 44 - 250});
    }
   </script>

</body>
</html>`

};

module.exports = viewer;
