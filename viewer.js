var viewer = function (result) {

    var resultCaption = "OpenMusic.Gallery";
    if (result && result.body) {

        resultCaption = result.body.name || result.body.tags || "";
        if (resultCaption.length === 0) {
            resultCaption = "a song";
        }
        else {
            resultCaption = '&quot;' + resultCaption + '&quot;';
        }

        if (result.body.username) {
            resultCaption += " by " + result.body.username.trim();
        }
        else {
            resultCaption += " on OMG";
        }
    }
    var pageData = JSON.stringify(result);

return `<!DOCTYPE html>
<html>
<head>

   <link rel="stylesheet" href="/css/main.css" type="text/css" />
   <link rel="stylesheet" href="/css/viewer.css" type="text/css" />
   <meta property="og:image" content="http://openmusic.gallery/preview/${result.id}.png"/>
   <meta property="og:image:url" content="http://openmusic.gallery/preview/${result.id}.png"/>
   <meta property="og:image:secure_url" content="https://openmusic.gallery/preview/${result.id}.png"/>
   <meta property="og:image:width" content="1200" /> 
   <meta property="og:image:height" content="630" />
   <meta property="og:description" content="Find, create, and customize music for your project. For Free."/>
   <meta property="og:title" content="Listen to ${resultCaption}"/>
   <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
   <title>Listen to ${resultCaption} - OpenMusic.Gallery</title>
    <style>
    header {display:flex;}
    </style>
    <script>
    var data = ${pageData};
    console.log(data);
    </script>

</head>
<body>
    <header>
        <a class="main-page-link" href="/">
        <span class="main-title-open">Open</span><span class="main-title-media">Music</span><span class="main-title-gallery">.Gallery</span>
        </a>

        <div class="main-description">
            Find, create, and customize music for your project.
        </div>

        <div class="title-bar-user-controls"></div>
    </header>

    <div class="main-body">

      <div id="omgviewer"><div class="beat-marker"></div></div>
      <br>
      <div class="site-tools">
            <a href="/">&#8962; Home</a>
            <span class="tools-separator">|</span>
            <a target="_blank" href="/gauntlet/">&plus; Create Music
            </a> <span class="tools-separator">|</span>
            <a href="/docs?what-is-this">What is this?</a>
      </div>
      
    </div>

   <script src="/omg-music/omgclasses.js"></script>
   <script src="/omg-music/tuna-min.js"></script>
   <script src="/omg-music/omusic_player.js"></script>
   <script src="/omg-music/fx.js"></script>
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
            result: data,
            height: window.innerHeight - 44 - 250});
    }
   </script>

</body>
</html>`

};

module.exports = viewer;
