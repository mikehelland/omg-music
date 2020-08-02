function OMGEmbeddedViewerSOUNDSET(viewer) {
    this.viewer = viewer
    this.playChar = "&nbsp;&#9654;"
    this.stopChar = "&#9724;"
    viewer.embedDiv.style.display = "flex"
    this.loadSoundSet(viewer.data, viewer.embedDiv)
    if (!OMGEmbeddedViewerSOUNDSET.omgviewerAddedCSS) {
        OMGEmbeddedViewerSOUNDSET.omgviewerAddedCSS = true
        var css = `.omg-soundset-audio-sample {
            text-align: center;
            padding:10px;
            margin:5px;
            border: 1px solid #808080;
            border-radius: 18px;
            width:12em;
            display:flex;
            background-color: #F0F0F0;
            cursor: pointer;
         }
         .omg-soundset-audio-sample a {
            text-decoration: none;
            color: black;
         }
         .omg-viewer-soundset-data {
            display: flex;
            flex-wrap: wrap;
         }
         .omg-soundset-audio-play {
            width: 20px;
         }
         .omg-soundset-audio-duration {
            margin-left: auto;
         }`

        var style = document.createElement("style")
        style.innerHTML = css
        document.body.appendChild(style)
    }
}
if (typeof omg === "object" && omg.types && omg.types["SOUNDSET"])
    omg.types["SOUNDSET"].embedClass = OMGEmbeddedViewerSOUNDSET


OMGEmbeddedViewerSOUNDSET.prototype.loadSoundSet = function (data, parentDiv) {
    this.audioSamples = []
    this.viewer.divDataMap = new Map()
    data.data.forEach((item) => {
        var div = document.createElement("div")
        var audio = document.createElement("audio")
        var link = document.createElement("a")
        var playButton = document.createElement("div")
        var duration = document.createElement("div")
        playButton.className = "omg-soundset-audio-play"
        duration.className = "omg-soundset-audio-duration"
        playButton.innerHTML = this.playChar
        div.appendChild(playButton)
        link.src = (data.prefix || "") + item.url + (data.postfix || "")
        link.innerHTML = item.name
        div.appendChild(link)
        div.appendChild(duration)
        div.className = "omg-soundset-audio-sample"
        parentDiv.appendChild(div)

        var isPlaying = false
        audio.oncanplaythrough = () => {
            var min = Math.floor(audio.duration / 60)
            duration.innerHTML = min + ":" + Math.round(audio.duration - min * 60).toString().padStart(2, "0")
        }
        audio.src = link.src
        audio.onended = () => {
            playButton.innerHTML = this.playChar
            isPlaying = false
        }
        div.onclick = () => {
            if (isPlaying) {
                audio.pause()
                audio.currentTime = 0
                playButton.innerHTML = this.playChar
            }
            else{
                audio.play()
                playButton.innerHTML = this.stopChar
            }
            isPlaying = !isPlaying
        }
        this.audioSamples.push({div: div, audio: audio})
        this.viewer.divDataMap.set(div, {item: item, soundset: data, src: link.src})
    })
}

OMGEmbeddedViewer.prototype.playSoundSet = function () {
    if (this.playingSample) {
        this.playingSample.audio.removeEventListener("ended", this.playingSoundSetListener)
        this.playingSample.div.onclick()
        this.showStopped()
        return
    }

    this.showPlaying()
    var i = 0
    var playNext = () => {
        this.playingSoundSetListener = () => {
            this.audioSamples[i].audio.removeEventListener("ended", this.playingSoundSetListener)
            i++
            if (i < this.audioSamples.length) {
                playNext()
            }
            else {
                this.showStopped()
            }
        }
        this.audioSamples[i].audio.addEventListener("ended", this.playingSoundSetListener)
        this.audioSamples[i].div.onclick()
        this.playingSample = this.audioSamples[i]
    }
    playNext()
}
