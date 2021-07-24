if (typeof omg !== "object")
    omg = {};

if (!omg.ui)
    omg.ui = {};


omg.ui.getScrollTop = function () {
    return document.body.scrollTop + document.documentElement.scrollTop;
};


omg.ui.totalOffsets = function (element, parent) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;

        if (parent && parent === element) {
            break;
        }

    } while (element);

    return {
        top: top,
        left: left
    };
};



export default function OMGDrumMachine(div, part, params) {

    if (!params) params = {};

    this.div = document.createElement("div")
    div.appendChild(this.div)

    this.foreColor = params.foreColor || "white";
    this.downbeatColor = params.downbeatColor || "#333333";
    this.beatColor = params.beatColor || "#111111";
    if (typeof params.captionWidth === "number") {
        this.captionWidth = params.captionWidth;
    }
    this.backgroundColor = "black"

    this.toolBarDiv = document.createElement("div")
    this.toolBarDiv.style.display = "flex"

    this.setupMeasureSelect()

    var beatLevels = 10
    for (let i = beatLevels; i > 0; i--) {
        let strengthButton = document.createElement("button")
        strengthButton.innerHTML = i / beatLevels
        strengthButton.style.backgroundColor = this.backgroundColor
        strengthButton.style.color = this.foreColor
        strengthButton.style.flexGrow = 1
        this.toolBarDiv.appendChild(strengthButton)
        strengthButton.onclick = e => {
            this.beatStrength = i / beatLevels
            strengthButton.style.backgroundColor = this.foreColor
            strengthButton.style.color = this.backgroundColor
            if (this.selectedStrengthButton) {
                this.selectedStrengthButton.style.backgroundColor = this.backgroundColor
                this.selectedStrengthButton.style.color = this.foreColor
            }
            this.selectedStrengthButton = strengthButton
        }
        if (i === beatLevels) {
            strengthButton.onclick()
        }
    
    }
    
    this.div.style.display = "flex"
    this.div.style.flexDirection = "column"
    this.div.style.height = "100%"
    
    this.div.appendChild(this.toolBarDiv)

    this.canvasHolder = document.createElement("div")
    this.canvasHolder.style.flexGrow = 1
    this.canvasHolder.style.position = "relative"

    this.bgCanvas = document.createElement("canvas");
    this.bgCanvas.className = "surface-canvas";        
    this.bgCanvas.style.position = "absolute"
    this.bgCanvas.style.width = "100%"
    this.bgCanvas.style.height = "100%"
    this.canvasHolder.appendChild(this.bgCanvas);
    this.canvas = document.createElement("canvas");
    this.canvas.className = "surface-canvas";
    this.canvas.style.position = "absolute"
    this.canvas.style.width = "100%"
    this.canvas.style.height = "100%"
    this.canvasHolder.appendChild(this.canvas);
    
    this.bgCtx = this.bgCanvas.getContext("2d");
    this.ctx = this.canvas.getContext("2d");

    this.div.appendChild(this.canvasHolder)

    this.readOnly = params.readOnly || false // true;
    this.beatStrength = 1;
    
    this.selectedTrack = -1;
    
    this.left = 0;
    this.top = 0;
    
    this.fontHeight = 10;

    if (part) {
        this.setPart(part);
    }
    
    this.setCanvasEvents();
    
    this.beatMarker = document.createElement("div");
    this.beatMarker.className = "beat-marker";
    this.canvasHolder.appendChild(this.beatMarker);
}

OMGDrumMachine.prototype.setCanvasEvents = function () {
    var canvas = this.canvas;
    var omgdrums = this;
    this.touches = [];
    
    canvas.onmousedown = function (e) {
        e.preventDefault();

        omgdrums.mouseTouch = {x: e.clientX - omgdrums.offsetLeft,
                               y: e.clientY - omgdrums.offsetTop,
                               identifier: "mouse"};
        omgdrums.ondown(omgdrums.mouseTouch);
    };

    canvas.onmousemove = function (e) {
        e.preventDefault();

        if (omgdrums.mouseTouch) {
            omgdrums.mouseTouch.x = e.clientX - omgdrums.offsetLeft;
            omgdrums.mouseTouch.y = e.clientY - omgdrums.offsetTop;
            omgdrums.onmove(omgdrums.mouseTouch);
        }
    };
    
    canvas.onmouseup = function (e) {
        e.preventDefault();
        omgdrums.onup(omgdrums.mouseTouch);
        omgdrums.mouseTouch = false;
    };
    canvas.onmouseout = function () {
        omgdrums.onup(omgdrums.mouseTouch);
        omgdrums.mouseTouch = false;
    };
    
    canvas.addEventListener("touchstart", function (e) {
        e.preventDefault();

        for (var i = 0; i < e.changedTouches.length; i++) {
            omgdrums.ondown({x: e.changedTouches[i].pageX - omgdrums.offsetLeft, 
                             y: e.changedTouches[i].pageY - omgdrums.offsetTop,
                             identifier: e.changedTouches[i].identifier});
        }
    });

    canvas.addEventListener("touchmove", function (e) {
        e.preventDefault();

        for (var i = 0; i < e.changedTouches.length; i++) {
            for (var j = 0; j < omgdrums.touches.length; j++) {
                var touch = omgdrums.touches[j];
                if (e.changedTouches[i].identifier === touch.identifier) {
                    touch.x = e.changedTouches[i].pageX - omgdrums.offsetLeft;
                    touch.y = e.changedTouches[i].pageY - omgdrums.offsetTop;
                    omgdrums.onmove(touch);
                    break;
                }
            }
        }
    });

    canvas.addEventListener("touchend", function (e) {
        e.preventDefault();
        for (var i = 0; i < e.changedTouches.length; i++) {
            for (var j = 0; j < omgdrums.touches.length; j++) {
                if (omgdrums.touches[j].identifier === e.changedTouches[i].identifier) {
                    omgdrums.onup(omgdrums.touches[j]);
                    break;
                }
            }
        }
    });
};

OMGDrumMachine.prototype.ondown = function (touch) {
    var canvas = this.canvas;
    var omgdrums = this;
    var x = touch.x;
    var y = touch.y;
    if (omgdrums.readOnly)
        return;

    var column = Math.floor((x - this.captionWidth) / this.columnWidth);
    var row = Math.floor(y / this.rowHeight);
    var trackI = Math.floor(y / this.captionHeight);

    if (column < 0) {
        if (Date.now() - omgdrums.lastTrackNameClick < 500 &&
                omgdrums.lastTrackNameI === trackI) {
            var audioParams = omgdrums.part.data.tracks[trackI].audioParams;
            audioParams.mute = !audioParams.mute;
        }
        if (trackI === this.selectedTrack) {
            this.selectedTrack = -1;
        }
        else {
            this.selectedTrack = trackI;
        }
        this.backgroundDrawn = false;
        omgdrums.lastTrackNameClick = Date.now();
        omgdrums.lastTrackNameI = trackI;
    } else {

        omgdrums.part.saved = false;

        // figure out the subbeat this is
        var subbeat;
        var data;
        var trackI;
        if (this.selectedTrack < 0) {
            subbeat = column;
            trackI = row;
        }
        else {
            subbeat = column + row * this.beatParams.subbeats;
            trackI = this.selectedTrack;
        }

        data = this.tracks[trackI].data;
        data[this.subbeatOffset + subbeat] = (data[this.subbeatOffset + subbeat] === this.beatStrength) ? 
                0 : this.beatStrength;

        touch.lastBox = [column, row];

        if (omgdrums.onchange)
            omgdrums.onchange(this.part, trackI, this.subbeatOffset + subbeat);

        this.part.change(trackI, this.subbeatOffset + subbeat, data[this.subbeatOffset + subbeat])
        
        this.touches.push(touch);
    }

    this.draw();
};

OMGDrumMachine.prototype.onmove = function (touch) {
    var canvas = this.canvas;
    var x = touch.x;
    var y = touch.y;
    var omgdrums = this;

    if (omgdrums.readOnly)
        return;

    var column = Math.floor((x - this.captionWidth) / this.columnWidth);
    var row = Math.floor(y / this.rowHeight);

    if (column < 0) {
        omgdrums.isTouching = false;
    } else if (touch.lastBox[0] !== column || touch.lastBox[1] !== row) {
        var subbeat;
        var data;
        var trackI;
        if (this.selectedTrack < 0) {
            subbeat = column;
            trackI = row;
            data = omgdrums.part.data.tracks[row].data;
        }
        else {
            subbeat = column + row * this.beatParams.subbeats;
            trackI = this.selectedTrack;
            
        }
        data = this.tracks[trackI].data;
        data[this.subbeatOffset + subbeat] = (data[this.subbeatOffset + subbeat] === this.beatStrength) ? 0 : this.beatStrength;

        touch.lastBox = [column, row];

        if (omgdrums.onchange)
            omgdrums.onchange(this.part, trackI, this.subbeatOffset + subbeat);

        this.part.change(trackI, subbeat, data[this.subbeatOffset + subbeat])

    }

    this.draw();
};

OMGDrumMachine.prototype.onup = function (touch) {
    var index = this.touches.indexOf(touch);
    this.touches.splice(index, 1);
};


OMGDrumMachine.prototype.setPart = function (part) {

    this.part = part;
    this.beatParams = part.section.song.data.beatParams;
    this.tracks = part.data.tracks;

    this.measures = this.displayMeasure === "ALL" ? this.part.section.data.measures : 1
    this.totalBeats = this.measures * this.beatParams.beats;
    this.totalSubbeats = this.totalBeats * this.beatParams.subbeats;
    //this.info = undefined
};

OMGDrumMachine.prototype.drawBackground = function (w, h) {
    
    this.bgCanvas.width = w || this.bgCanvas.clientWidth;
    this.bgCanvas.height = h || this.bgCanvas.clientHeight;
    this.bgCtx.fillStyle = this.backgroundColor
    this.bgCtx.fillRect(0, 0, this.bgCanvas.width, this.bgCanvas.height)
    
    if (!this.info || this.lastHeight !== this.bgCanvas.height) {
        this.setInfo();
        this.lastHeight = this.bgCanvas.height
    }

    this.setRowColumnSizes();

    this.setPageOffsets()
    if (this.selectedTrack > -1) {
        this.drawTrackViewBackground();
    }
    else {
        this.drawFullViewBackground();
    }

};


OMGDrumMachine.prototype.draw = function (subbeat, w, h) {

    if (!this.tracks)
        return;

    if (this.hidden) {
        this.div.style.display = "flex"
        this.hidden = false;
    }

    if (!this.backgroundDrawn) {
        this.drawBackground(w, h);
        this.backgroundDrawn = true;
    }

    this.canvas.width = w || this.bgCanvas.clientWidth;
    this.canvas.height = h || this.bgCanvas.clientHeight;

    this.drawCaptions();
    
    if (this.selectedTrack > -1) {
        this.drawTrackView(subbeat);
    }
    else {
        this.drawFullView(subbeat);
    }    
};

OMGDrumMachine.prototype.drawFullView = function (subbeat) {
    for (var i = 0; i < this.info.length; i++) {
        for (var j = 0; j < this.totalSubbeats; j++) {
            var value = this.tracks[this.info[i].i].data[j + this.subbeatOffset];
            
            if (!value) {
                continue;
            };
            
            if (typeof value !== "number") {
                value = 1;
            }

            this.beatMarginX = 1 + (1 - value) * this.columnWidth * 0.35;
            this.beatMarginY = 1 + (1 - value) * this.rowHeight * 0.35;
        
            this.ctx.fillStyle = this.foreColor;
            this.ctx.fillRect(this.left + this.captionWidth + this.columnWidth * j + this.beatMarginX, 
                    this.top + this.rowHeight * i + this.beatMarginY,
                    this.columnWidth - this.beatMarginX * 2, this.rowHeight - this.beatMarginY * 2);
        }
    }

    this.ctx.globalAlpha = 0.5;
    this.ctx.fillStyle = "#4fa5d5";
    if (subbeat !== undefined) {
        this.ctx.fillRect(this.captionWidth + this.columnWidth * subbeat + 1, 0,
                this.columnWidth - 2, this.canvas.height);
    }
    this.ctx.globalAlpha = 1;
};

OMGDrumMachine.prototype.drawTrackView = function (subbeat) {
    var subbeatIndex;
    for (var i = 0; i < this.totalBeats; i++) {
        for (var j = 0; j < this.beatParams.subbeats; j++) {
            subbeatIndex = this.subbeatOffset + j + i * this.beatParams.subbeats;
            var value = this.tracks[this.selectedTrack].data[subbeatIndex];
            if (!value) {
                if (subbeatIndex === subbeat) {
                    this.ctx.globalAlpha = 0.5;
                    this.ctx.fillStyle = "#4fa5d5";    
                    this.ctx.fillRect(this.left + this.captionWidth + this.columnWidth * j + 1, 
                            this.top + this.rowHeight * i + 1,
                            this.columnWidth - 2, this.rowHeight - 2);
                    this.ctx.globalAlpha = 1;
                }
                continue;
            }
            
            if (typeof value !== "number") {
                value = 1;
            }

            this.beatMarginX = 1 + (1 - value) * this.columnWidth * 0.35;
            this.beatMarginY = 1 + (1 - value) * this.rowHeight * 0.35;

            this.ctx.fillStyle = this.foreColor;
            this.ctx.fillRect(this.left + this.captionWidth + this.columnWidth * j + this.beatMarginX, 
                this.top + this.rowHeight * i + this.beatMarginY,
                this.columnWidth - this.beatMarginX * 2, this.rowHeight - this.beatMarginY * 2);

            if (subbeatIndex === subbeat) {
                this.ctx.globalAlpha = 0.5;
                this.ctx.fillStyle = "#4fa5d5";    
                this.ctx.fillRect(this.left + this.captionWidth + this.columnWidth * j + 1, 
                        this.top + this.rowHeight * i + 1,
                        this.columnWidth - 2, this.rowHeight - 2);
                this.ctx.globalAlpha = 1;
            }
        }
    }    
};

OMGDrumMachine.prototype.drawFullViewBackground = function (subbeat) {
    for (var i = 0; i < this.info.length; i++) {
        for (var j = 0; j < this.totalSubbeats; j++) {
            this.bgCtx.fillStyle = (j % this.beatParams.subbeats === 0) ? 
                    this.downbeatColor : this.beatColor;

            this.bgCtx.fillRect(this.left + this.captionWidth + this.columnWidth * j + 1, 
                    this.top + this.rowHeight * i + 1,
                    this.columnWidth - 2, this.rowHeight - 2);

        }
    }
};

OMGDrumMachine.prototype.drawTrackViewBackground = function (subbeat) {
    for (var i = 0; i < this.totalBeats; i++) {
        for (var j = 0; j < this.beatParams.subbeats; j++) {
            this.bgCtx.fillStyle = (j === 0) ? 
                    this.downbeatColor : this.beatColor;

            this.bgCtx.fillRect(this.left + this.captionWidth + this.columnWidth * j + 1, 
                    this.top + this.rowHeight * i + 1,
                    this.columnWidth - 2, this.rowHeight - 2);
        }
    }    
};


OMGDrumMachine.prototype.drawCaptions = function () {
    for (var i = 0; i < this.info.length; i++) {
        
        if (this.info[i].i === this.selectedTrack) {
            this.ctx.fillStyle = this.foreColor;
            this.ctx.fillRect(this.left, this.top + i * this.captionHeight, 
                    this.captionWidth, this.captionHeight);

        }
        if (this.tracks[this.info[i].i].audioParams.mute) {
            this.ctx.globalAlpha = 0.6;
            this.ctx.fillStyle = "#880000";
            this.ctx.fillRect(this.left, this.top + i * this.captionHeight, 
                                this.captionWidth, this.captionHeight);
            this.ctx.globalAlpha = 1;        
        }

        this.ctx.fillStyle = this.info[i].i === this.selectedTrack ? this.beatColor : this.foreColor;
        for (var w = 0; w < this.info[i].captionWords.length; w++) {
            if (this.info[i].captionWords[w].width  > 0) {
                this.ctx.fillText(this.info[i].captionWords[w].caption, 
                    this.left + this.captionWidth / 2 - this.info[i].captionWords[w].width / 2, 
                    this.top + this.captionHeight * i + this.info[i].captionWords[w].y);
                    //this.top + this.captionHeight * (i + 0.5) + this.fontHeight / 2);
            }            
        }
    }
};

OMGDrumMachine.prototype.updateBeatMarker = function (subbeat) {
    if (subbeat === -1) {
        this.beatMarker.style.display = "none";
        this.beatMarkerShowing = false;
        return;
    }

    // todo 23July21
    /*if (this.displayMeasure === "CURRENT") {
        if (subbeat < this.subbeatOffset) {
            this.subbeatOffset = 0
            this.draw()
        }
        if (subbeat >= this.subbeatOffset + this.totalSubbeats) {
            // this just assumes the next beat is the first beat of the measure
            this.subbeatOffset = subbeat 
            this.draw()
        }

        subbeat = subbeat - this.subbeatOffset
    }*/
        
    if (this.selectedTrack > -1) {
        this.beatMarker.style.left = this.captionWidth + this.columnWidth * (subbeat % this.beatParams.subbeats) + "px";
        this.beatMarker.style.top = this.rowHeight * Math.floor(subbeat / this.beatParams.subbeats) + "px";        
    }
    else {
        this.beatMarker.style.left = Math.round(this.captionWidth + this.columnWidth * subbeat) + 1 + "px";
        this.beatMarker.style.top = "0px";
    }
    
    if (!this.beatMarkerShowing) {
        this.beatMarker.style.display = "block";            
        this.beatMarkerShowing = true;
    }
};

OMGDrumMachine.prototype.setInfo = function () {
 
    this.info = [];
    var longestCaptionWidth = 0;

    var words;
    var info;
    for (var i = 0; i < this.tracks.length; i++) {
        if (!this.tracks[i].sound) {
            continue;
        }
        
        this.info.push({captionWords: [],
            name: this.tracks[i].name, 
            track: this.tracks[i],
            i: i
        });
    }

    if (!this.info.length) {
        this.info = null;
        return;
    }

    if (this.captionWidth === undefined) {
        this.captionWidth = this.bgCanvas.width / 8; //, longestCaptionWidth + 4);
    }
    this.captionHeight = this.bgCanvas.height / this.info.length;

    for (i = 0; i < this.info.length; i++) {
        var words = (this.info[i].name || "").split(" ");
        for (var w = 0; w < words.length; w++) {
            var width = this.ctx.measureText(words[w]).width;
            //if (this.captionWidth === undefined && this.info[i].words.length > 0) {
            //    longestCaptionWidth = Math.max(longestCaptionWidth, width);
            //}
            this.info[i].captionWords.push({
                y: this.getCaptionY(w, words.length),
                caption: words[w], 
                width: width
            });
        }

    }
};

OMGDrumMachine.prototype.setRowColumnSizes = function () {
    this.beatMarker.style.display = "none";
    this.beatMarkerShowing = false;
    
    this.measures = this.displayMeasure === "ALL" ? this.part.section.data.measures : 1
    this.totalBeats = this.measures * this.beatParams.beats;
    this.totalSubbeats = this.totalBeats * this.beatParams.subbeats;
    
    if (this.selectedTrack < 0) {
        this.columnWidth = (this.bgCanvas.width - this.captionWidth) / this.totalSubbeats;
        this.rowHeight = this.captionHeight;
        this.beatMarker.style.width = this.columnWidth - 2 + "px";
        this.beatMarker.style.height = this.bgCanvas.height + "px";
        this.beatMarker.style.top = "0px";
    }
    else {
        this.columnWidth = (this.bgCanvas.width - this.captionWidth) / this.beatParams.subbeats;
        this.rowHeight = this.bgCanvas.height / (this.totalBeats);
        this.beatMarker.style.width = this.columnWidth + "px";
        this.beatMarker.style.height = this.rowHeight + "px";
    }

};

OMGDrumMachine.prototype.getCaptionY = function (i, length) {
    if (length <= 1) {
        return this.captionHeight * 0.5 + this.fontHeight / 2;
    }
    if (length === 2) {
        return this.captionHeight * 0.5 + i * this.fontHeight;
    }
    return this.captionHeight * (i + 1) / length - this.fontHeight / 2;
}

OMGDrumMachine.prototype.hide = function () {
    this.div.style.display = "none";
    this.hidden = true;
};

OMGDrumMachine.prototype.setPageOffsets = function () {
    var offsets = omg.ui.totalOffsets(this.canvas);
    this.offsetLeft = offsets.left;
    this.offsetTop = offsets.top;
}

OMGDrumMachine.prototype.setupMeasureSelect = function () {

    this.selectMeasure = document.createElement("select")
    this.selectMeasure.innerHTML = `
        <option value='CURRENT'>Current</option>    
        <option value='ALL'>All Measures</option>`

    this.subbeatOffset = 0
    this.displayMeasure = "CURRENT"
    this.selectMeasure.onchange = e => {
        this.displayMeasure = this.selectMeasure.value
        this.measures = this.displayMeasure === "ALL" ? this.part.section.data.measures : 1
        this.backgroundDrawn = false
        this.draw()
    }

    this.toolBarDiv.appendChild(this.selectMeasure)

}