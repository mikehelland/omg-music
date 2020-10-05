function OMGEmbeddedViewerMusic(viewer) {
    this.canvas = document.createElement("canvas")
    this.canvas.className = "omg-viewer-canvas"

    if (viewer.params && viewer.params.maxHeight) {
        this.canvas.style.maxHeight = viewer.params.maxHeight + "px"
    }
    
    viewer.embedDiv.appendChild(this.canvas)

    this.canvas.width = viewer.embedDiv.clientWidth
    this.canvas.height = viewer.embedDiv.clientHeight
    
    this.data = viewer.data
    this.viewer = viewer

    omg.util.loadScripts(
        ["/apps/music/js/omusic-embed-draw.js",
        "/apps/music/js/omgclasses.js",
        "/apps/music/js/omgservice_music.js",
        "/apps/music/js/omusic_player.js"],
        () => {
            
            this.drawer = new OMGEmbeddedViewerMusicDrawer()
            this.drawer.drawCanvas(this.data, this.canvas)
            this.drawingData = this.drawer.drawingData
            
            this.song = OMGSong.prototype.make(this.data);

            this.makePlayButton()
            this.makeBeatMarker()
        }
    )
}
if (typeof omg === "object" && omg.types && omg.types["SONG"])
    omg.types["SONG"].embedClass = OMGEmbeddedViewerMusic

OMGEmbeddedViewerMusic.prototype.makePlayButton = function () {

    this.playButton = document.createElement("div")
    this.playButton.className = "omg-viewer-play-button"

    var img = document.createElement("img")
    img.src = "/apps/music/img/play-button.svg"
    img.style.height = this.canvas.clientHeight / 2 + "px"
    img.style.marginLeft = this.canvas.clientWidth / 2 - this.canvas.clientHeight / 4 + "px"
    img.style.marginTop = this.canvas.clientHeight / 4 + "px"
    img.style.cursor = "pointer"
    this.playButtonImg = img
    this.playButton.appendChild(img)

    this.playButton.style.opacity = "0.7"
    img.onmouseenter = e => this.playButton.style.opacity = "1"
    img.onmouseleave = e => this.playButton.style.opacity = "0.7"
    
    this.viewer.embedDiv.appendChild(this.playButton)

    this.playButtonImg.onclick = e => this.playButtonClick()
}

OMGEmbeddedViewerMusic.prototype.playButtonClick = function (data) {

    let playcountUpdate = () => {
        if (!this.playButtonHasBeenClicked) {
            this.playButtonHasBeenClicked = true;                
            omg.server.postHTTP("/playcount", {id: this.viewer.data.id});
        }
    }

    if (!this.player) {
        this.playButton.classList.add("loader")
        this.player = new OMusicPlayer()
        
        this.setPlayer(this.player)
        
        this.player.prepareSong(this.song, () => {
            this.player.play()
            this.beatMarker.style.display = "block"
            playcountUpdate()
        })
        
        return
    }

    if (this.player.playing) {
        this.player.stop()
        this.beatMarker.style.display = "none"
        this.playButtonImg.src = "/apps/music/img/play-button.svg"
    }
    else {
        this.player.play()
        this.beatMarker.style.display = "block"
        playcountUpdate()
    }
}

OMGEmbeddedViewerMusic.prototype.setPlayer = function () {
    this.player.onPlayListeners.push(() => {
        this.playButton.classList.remove("loader")
        this.playButtonImg.src = "/apps/music/img/stop-button.svg"
    })
    
    this.player.onBeatPlayedListeners.push(this.onBeatPlayedListener)
    this.player.onloop = () => this.onloop();
    
}

OMGEmbeddedViewerMusic.prototype.makeBeatMarker = function () {
    
    //var pxPerBeat = (this.canvas.clientWidth) / (this.drawer.totalSubbeats * this.drawingData.sections.length);
    //var beatsInSection = this.song.data.beatParams.measures * this.song.data.beatParams.beats * this.song.data.beatParams.subbeats;
    this.subbeatsPlayed = 0;
    this.beatMarker = document.createElement("div")
    this.beatMarker.className = "beat-marker"
    this.beatMarker.style.width = this.drawer.subbeatLength + "px";
    this.beatMarker.style.display = "none"
    this.viewer.embedDiv.appendChild(this.beatMarker)
    this.onBeatPlayedListener = (isubbeat, isection) => {
        this.beatMarker.style.left = this.drawer.subbeatLength * this.subbeatsPlayed + "px";
        if (isubbeat > -1) {
            this.subbeatsPlayed++
        }
        else {
            this.subbeatsPlayed = 0
        }
    };
};

OMGEmbeddedViewerMusic.prototype.onloop = function () {
    this.subbeatsPlayed = 0
}
