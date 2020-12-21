function PianoCanvas(div) {
    var blackKeys = [1, 3, 6, 8, 10]

    var keys = []
    for (var i = 0; i < 128; i++) {

        var ii = i % 12

        keys.push({
            note: i,
            white: blackKeys.indexOf(ii) === -1
        })

    }

    this.keys = keys
    this.start = 24
    this.end = 102

    this.whiteKeyCount = 0
    for (i = this.start; i <= this.end; i++) {
        if (keys[i].white) {
            this.whiteKeyCount++
        }
    }

    this.setupCanvas(div)
}

PianoCanvas.prototype.setupCanvas = function (div) {
    var canvasBack = document.createElement("canvas")
    var canvas = document.createElement("canvas")

    canvasBack.style.width = "100%"
    canvasBack.style.height = "100%"
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.style.position = "absolute"
    canvas.style.top = "0px"
    canvas.style.left = "0px"

    div.appendChild(canvasBack)
    div.appendChild(canvas)

    var ctx = canvasBack.getContext("2d")
    this.ctx = canvas.getContext("2d")

    ctx.canvas.width = ctx.canvas.clientWidth
    ctx.canvas.height = ctx.canvas.clientHeight
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.strokeStyle = "black"
    ctx.fillStyle = "black"
    this.whiteKeysUsed = 0
    this.whiteKeyWidth = ctx.canvas.width / this.whiteKeyCount
    for (this._di = this.start; this._di <= this.end; this._di++) {

        if (this.keys[this._di].white) {
            this.keys[this._di].x = this.whiteKeysUsed * this.whiteKeyWidth
            ctx.strokeRect(this.keys[this._di].x, 0, this.whiteKeyWidth, ctx.canvas.height)
            
            this.whiteKeysUsed++
        }
        else {
            this.keys[this._di].x = 2 + this.whiteKeysUsed * this.whiteKeyWidth - this.whiteKeyWidth / 2
            ctx.fillRect(this.keys[this._di].x, 0, 
                        this.whiteKeyWidth - 2, ctx.canvas.height * 0.66)
        }
    }
}

PianoCanvas.prototype.drawPressed = function (pressed) {

    this.ctx.canvas.width = this.ctx.canvas.clientWidth
    this.ctx.canvas.height = this.ctx.canvas.clientHeight
    this.ctx.fillStyle = "green"
    for (this._di = 0; this._di < pressed.length; this._di++) {

        this._dk = this.keys[pressed[this._di]]
        if (this._dk.white) {
            this.ctx.fillRect(this._dk.x, 0, this.whiteKeyWidth, this.ctx.canvas.height)
        }
        else {
            this.ctx.fillRect(this._dk.x, 0, this.whiteKeyWidth - 2, this.ctx.canvas.height * 0.66)
        }
    }   
}
