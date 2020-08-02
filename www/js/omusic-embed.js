function OMGEmbeddedViewerMusic(viewer) {
    this.canvas = document.createElement("canvas")
    this.canvas.className = "omg-viewer-canvas"

    if (viewer.params && viewer.params.maxHeight) {
        this.canvas.style.maxHeight = viewer.params.maxHeight + "px"
    }

    viewer.embedDiv.appendChild(this.canvas)

    this.data = viewer.data
    this.viewer = viewer

    omg.util.loadScripts(
        ["/apps/music/js/omusic-embed-draw.js",
        "/apps/music/js/omgclasses.js",
        "/apps/music/js/omgservice_music.js",
        "/apps/music/js/libs/tuna-min.js", //todo you know you wanna squelch this bloat
        "/apps/music/js/omusic_player.js",
        "/apps/music/js/fx.js",
        "/apps/music/js/libs/viktor/viktor.js"],
        () => {
            this.canvas.width = this.canvas.clientWidth
            this.canvas.height = this.canvas.clientHeight

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

    var createPlayer = () => {
        this.playButton.classList.add("loader")
        this.player = new OMusicPlayer()
        this.player.prepareSong(this.song, () => {
            this.player.play()
            this.beatMarker.style.display = "block"
        })
        this.player.onBeatPlayedListeners.push(this.onBeatPlayedListener)
        this.player.onloop = () => this.onloop();
        this.player.onPlayListeners.push(() => {
            this.playButton.classList.remove("loader")
            this.playButtonImg.src = "/apps/music/img/stop-button.svg"
        })
    }

    if (!this.player) {
        createPlayer()
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
        //this.playButtonImg.src = "/apps/music/img/stop-button.svg"
    }
}

OMGEmbeddedViewerMusic.prototype.makeBeatMarker = function () {
    
    //var pxPerBeat = (this.div.clientWidth - padding) / this.totalBeatsInSong;
    var pxPerBeat = (this.canvas.clientWidth) / (this.totalSubbeats * this.drawingData.sections.length);
    var beatsInSection = this.song.data.beatParams.measures * this.song.data.beatParams.beats * this.song.data.beatParams.subbeats;
    this.subbeatsPlayed = 0;
    this.beatMarker = document.createElement("div")
    this.beatMarker.className = "beat-marker"
    this.beatMarker.style.width = pxPerBeat + "px";
    this.beatMarker.style.display = "none"
    this.viewer.embedDiv.appendChild(this.beatMarker)
    this.onBeatPlayedListener = (isubbeat, isection) => {
        this.beatMarker.style.left = pxPerBeat * this.subbeatsPlayed + "px";
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
