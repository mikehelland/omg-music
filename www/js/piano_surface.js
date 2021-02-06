function PianoSurface(div) {
    var blackKeys = [1, 3, 6, 8, 10]
    var noteNames = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]

    var keys = []
    var key 
    for (var i = 0; i < 128; i++) {

        var ii = i % 12

        key = {
            note: i,
            white: blackKeys.indexOf(ii) === -1,
            name: noteNames[ii]
        }

        keys.push(key)

    }

    this.keys = keys
    this.start = 24
    this.end = 96

    this.whiteKeyCount = 0
    for (i = this.start; i <= this.end; i++) {
        if (keys[i].white) {
            this.whiteKeyCount++
        }
    }

    this.blackKeyLength = 0.5
    this.showNoteNames = true
    
    this.setupCanvas(div)
}

PianoSurface.prototype.setupCanvas = function (div) {
    var canvasBack = document.createElement("canvas")
    var canvas = document.createElement("canvas")

    canvasBack.style.width = "100%"
    canvasBack.style.height = "100%"
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.style.position = "absolute"
    canvas.style.top = "0px"
    canvas.style.left = "0px"
    canvasBack.style.position = "absolute"
    canvasBack.style.top = "0px"
    canvasBack.style.left = "0px"

    div.appendChild(canvasBack)
    div.appendChild(canvas)

    var ctx = canvasBack.getContext("2d")
    this.ctx = canvas.getContext("2d")

    
    ctx.canvas.width = ctx.canvas.clientWidth
    ctx.canvas.height = ctx.canvas.clientHeight
    this.ctx.canvas.width = ctx.canvas.clientWidth
    this.ctx.canvas.height = ctx.canvas.clientHeight
    console.log(this.ctx.canvas.clientWidth, ctx.canvas.clientWidth) 
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.strokeStyle = "black"
    ctx.fillStyle = "black"
    ctx.textAlign = "center"
    this.whiteKeys = []
    this.whiteKeyWidth = ctx.canvas.width / this.whiteKeyCount
    for (this._di = this.start; this._di <= this.end; this._di++) {

        if (this.keys[this._di].white) {
            this.keys[this._di].x = this.whiteKeys.length * this.whiteKeyWidth
            ctx.strokeRect(this.keys[this._di].x, 0, this.whiteKeyWidth, ctx.canvas.height)
            this.whiteKeys.push(this.keys[this._di])
            
            if (this.showNoteNames) {
                ctx.fillText(this.keys[this._di].name, this.keys[this._di].x + this.whiteKeyWidth / 2, ctx.canvas.height * 0.8)
            }
        }
        else {
            this.keys[this._di].x = 2 + this.whiteKeys.length * this.whiteKeyWidth - this.whiteKeyWidth / 2
            ctx.fillRect(this.keys[this._di].x, 0, 
                        this.whiteKeyWidth - 2, ctx.canvas.height * this.blackKeyLength)
        }
    }
    console.log(this.ctx.canvas.clientWidth, ctx.canvas.clientWidth) 
    
}

PianoSurface.prototype.drawPressed = function (pressed) {
    this.ctx.canvas.width = this.ctx.canvas.clientWidth
    this.ctx.canvas.height = this.ctx.canvas.clientHeight
    this.ctx.fillStyle = "green"
    this.ctx.strokeStyle = "black"
    this.ctx.textAlign = "center"
    this.pressedKeyOffset = 4
    for (this._di = 0; this._di < pressed.length; this._di++) {

        this._dk = this.keys[pressed[this._di]]
        if (this._dk.white) {
            this.ctx.fillRect(this._dk.x + this.pressedKeyOffset, 
                    this.ctx.canvas.height * this.blackKeyLength + this.pressedKeyOffset, 
                    this.whiteKeyWidth - this.pressedKeyOffset * 2, 
                    this.ctx.canvas.height * (1 - this.blackKeyLength) - this.pressedKeyOffset * 2)
            //this.ctx.strokeRect(this._dk.x, 0, this.whiteKeyWidth, this.ctx.canvas.height)

            if (this.showNoteNames) {
                this.ctx.fillStyle = "white"
                this.ctx.fillText(this._dk.name, this._dk.x + this.whiteKeyWidth / 2, this.ctx.canvas.height * 0.8)
                this.ctx.fillStyle = "green"
            }
        }
        else {
            this.ctx.fillRect(this._dk.x + this.pressedKeyOffset, 
                this.pressedKeyOffset, 
                this.whiteKeyWidth - 2 - this.pressedKeyOffset * 2, 
                this.ctx.canvas.height * this.blackKeyLength - 2 - this.pressedKeyOffset * 2)
            //this.ctx.strokeRect(this._dk.x, 0, this.whiteKeyWidth - 2, this.ctx.canvas.height * this.blackKeyLength)
        }
    }   
}

PianoSurface.prototype.setupEvents = function (noteOn, noteOff) {
    this.noteOn = noteOn
    this.noteOff = noteOff
    this.setupMultiTouch(this.ctx.canvas, this)
}

PianoSurface.prototype.ondown = function (touch) {
    touch.key = this.keyHitTest(touch)
    this.noteOn(this.keys[touch.key])
}
PianoSurface.prototype.onmove = function (touch) {
    var key = this.keyHitTest(touch)
    if (key !== touch.key) {
        this.noteOff(this.keys[touch.key])
        touch.key = key
        this.noteOn(this.keys[key])
    }

}
PianoSurface.prototype.onup = function (touch) {
    this.noteOff(this.keys[touch.key])
}

PianoSurface.prototype.keyHitTest = function (touch) {
    var key = this.whiteKeys[Math.floor(touch.x / this.whiteKeyWidth)].note
    if (touch.y / this.ctx.canvas.height < this.blackKeyLength && touch.x % this.whiteKeyWidth < this.whiteKeyWidth / 2 && !this.keys[key - 1].white) {
        key--
    }
    else if (touch.y / this.ctx.canvas.height < this.blackKeyLength && touch.x % this.whiteKeyWidth > this.whiteKeyWidth / 2 && !this.keys[key + 1].white) {
        key++
    }
    return key
}

//todo move this to omg.ui?
PianoSurface.prototype.setupMultiTouch = function (div, handler) {
    handler.touches = []
    var removeTouch = touch => {
        var touchIndex = handler.touches.indexOf(touch);
        if (touchIndex > -1) {
            handler.touches.splice(touchIndex, 1);
        }
    }

    handler.redoOffsets = true
    var updateOffsets = function () {
        handler.offsets = omg.ui.totalOffsets(div)
        handler.redoOffsets = false
    }

    div.onmousedown = e => {
        if (handler.readOnly) return;
        e.preventDefault();
        if (handler.redoOffsets) {
            updateOffsets()
        }
        
        handler.mouseTouch = {x: e.clientX - handler.offsets.left, 
            y: e.clientY + omg.ui.getScrollTop() - handler.offsets.top, 
            identifier: "mouse"
        };
        handler.touches.push(handler.mouseTouch)
        handler.ondown(handler.mouseTouch);
    };

    div.onmousemove = e => {
        if (handler.readOnly) return;
        e.preventDefault();
        if (handler.redoOffsets) {
            updateOffsets()
        }

        if (handler.mouseTouch) {
            handler.mouseTouch.lastX = handler.mouseTouch.x;
            handler.mouseTouch.lastY = handler.mouseTouch.y;
            handler.mouseTouch.x = e.clientX - handler.offsets.left;
            handler.mouseTouch.y = e.clientY + omg.ui.getScrollTop() - handler.offsets.top;
            handler.onmove(handler.mouseTouch);
        }
        else {
            //todo onhover?
        }        
    };
    
    div.onmouseout = e => {
        if (handler.readOnly) return;
        e.preventDefault();
        if (handler.mouseTouch) {
            handler.onup(handler.mouseTouch); //todo oncancel?
            handler.mouseTouch = null;
            removeTouch(handler.mouseTouch)
        }
    };

    div.onmouseup = e => {
        if (handler.readOnly) return;
        e.preventDefault();
        if (handler.mouseTouch) {
            handler.onup(handler.mouseTouch);
            handler.mouseTouch = null;
            removeTouch(handler.mouseTouch)
        }
    };

    div.addEventListener("touchstart", e => {
        if (handler.readOnly) return;
        e.preventDefault();
        if (handler.redoOffsets) {
            updateOffsets();
        }

        for (var i = 0; i < e.changedTouches.length; i++) {
            var touch = {x: e.changedTouches[i].pageX - handler.offsets.left,
                y: e.changedTouches[i].pageY + omg.ui.getScrollTop() - handler.offsets.top,
                identifier: e.changedTouches[i].identifier}
            handler.ondown(touch);
            handler.touches.push(touch)
        }
    });

    div.addEventListener("touchmove", e => {
        if (handler.readOnly) return;
        e.preventDefault();

        for (var i = 0; i < e.changedTouches.length; i++) {
            for (var j = 0; j < handler.touches.length; j++) {
                var touch = handler.touches[j];
                if (e.changedTouches[i].identifier === touch.identifier) {
                    touch.lastX = touch.x;
                    touch.lastY = touch.y;
                    touch.x = e.changedTouches[i].pageX - handler.offsets.left;
                    touch.y = e.changedTouches[i].pageY + omg.ui.getScrollTop() - handler.offsets.top;
                    handler.onmove(touch);
                    break;
                }
            }
        }
    });

    div.addEventListener("touchend", e => {
        if (handler.readOnly) return;
        e.preventDefault();
        for (var i = 0; i < e.changedTouches.length; i++) {
            for (var j = 0; j < handler.touches.length; j++) {;
                if (e.changedTouches[i].identifier === handler.touches[j].identifier) {
                    handler.onup(handler.touches[j]);
                    removeTouch(handler.touches[j])
                    break;
                }
            }
        }
    });

}