if (typeof omg != "object")
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



function OMGDrumMachine(canvas, part, params) {

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    if (!params) params = {};
    this.readOnly = params.readOnly || true;
    this.beatStrength = 1;
    
    this.foreColor = params.foreColor || "white";
    this.downbeatColor = params.downbeatColor || "#333333";
    this.beatColor = params.beatColor || "#111111";

    this.selectedTrack = -1;
    
    this.left = 0;
    this.top = 0;

    if (part) {
        this.setPart(part);
    }
    
    this.setCanvasEvents();
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
    
    canvas.ontouchstart = function (e) {
        e.preventDefault();

        for (var i = 0; i < e.changedTouches.length; i++) {
            omgdrums.ondown({x: e.changedTouches[i].pageX - omgdrums.offsetLeft, 
                             y: e.changedTouches[i].pageY - omgdrums.offsetTop,
                             identifier: e.changedTouches[i].identifier});
        }
    };

    canvas.ontouchmove = function (e) {
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
    };

    canvas.ontouchend = function (e) {
        e.preventDefault();
        for (var i = 0; i < e.changedTouches.length; i++) {
            for (var j = 0; j < omgdrums.touches.length; j++) {
                if (omgdrums.touches[j] === e.changedTouches[i].identifier) {
                    omgdrums.onup(omgdrums.touches[j]);
                    break;
                }
            }
        }
    };
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
        if (Date.now() - omgdrums.lastTrackNameClick < 700) {
            var audioParameters = omgdrums.part.data.tracks[trackI].audioParameters;
            audioParameters.mute = !audioParameters.mute;
        }
        if (trackI === this.selectedTrack) {
            this.selectedTrack = -1;
        }
        else {
            this.selectedTrack = trackI;
        }
        this.setRowColumnSizes();
        omgdrums.lastTrackNameClick = Date.now();
    } else {

        omgdrums.part.saved = false;

        // figure out the subbeat this is
        var subbeat;
        var data;
        if (this.selectedTrack < 0) {
            subbeat = column;
            data = this.part.data.tracks[row].data;
        }
        else {
            subbeat = column + row * this.beatParameters.subbeats;
            data = this.part.data.tracks[this.selectedTrack].data;
        }

        data[subbeat] = data[subbeat] ? 0 : this.beatStrength;

        touch.lastBox = [column, row];

        if (omgdrums.onchange)
            omgdrums.onchange();
        
        this.touches.push(touch);
    }

    //omgdrums.drawLargeCanvas();
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
        if (this.selectedTrack < 0) {
            subbeat = column;
            data = omgdrums.part.data.tracks[row].data;
        }
        else {
            subbeat = column + row * this.beatParameters.subbeats;
            data = omgdrums.part.data.tracks[this.selectedTrack].data;
        }
        data[subbeat] = data[subbeat] ? 0 : this.beatStrength;

        touch.lastBox = [column, row];

        if (omgdrums.onchange)
            omgdrums.onchange();

    }

    this.draw();
};

OMGDrumMachine.prototype.onup = function (touch) {
    var index = this.touches.indexOf(touch);
    this.touches.splice(index, 1);
};

OMGDrumMachine.prototype.setSize = function (width, height) {
    var canvas = this.canvas;
    canvas.height = height;
    canvas.width = width;
    canvas.style.height = height + "px";
    //canvas.style.width = width + "px";

    this.columnWidth = width / this.columns;
    this.rowHeight = height / this.rows;
    this.drawLargeCanvas();

};

OMGDrumMachine.prototype.setPart = function (part) {

    this.part = part;
    this.drumbeat = part.data;
    this.beatParameters = part.section.song.data.beatParameters;

    this.totalBeats = this.beatParameters.measures * this.beatParameters.beats;
    this.totalSubbeats = this.totalBeats * this.beatParameters.subbeats;
    
    this.columns = this.totalSubbeats; //1 + this.subbeats;
    this.rows = this.part.data.tracks.length;

};

OMGDrumMachine.prototype.draw = function (subbeat) {

    if (!this.drumbeat || !this.drumbeat.tracks || !this.drumbeat.tracks.length)
        return;

    if (!this.info) {
        this.setInfo();
    }
    
    this.canvas.width = this.width;
    
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
            var value = this.info[i].track.data[j];
            this.ctx.fillStyle = value >= 1 ? this.foreColor :
                    (j % this.beatParameters.subbeats === 0) ? this.downbeatColor : this.beatColor;

            this.ctx.fillRect(this.left + this.captionWidth + this.columnWidth * j + 1, 
                    this.top + this.rowHeight * i + 1,
                    this.columnWidth - 2, this.rowHeight - 2);

            if (value > 0  && value < 1) {
                if (value >= 0.5) {
                    this.beatMarginX = this.columnWidth / 10;
                    this.beatMarginY = this.rowHeight / 10;
                }
                else {
                    this.beatMarginX = this.columnWidth / 5;
                    this.beatMarginY = this.rowHeight / 5
                }
                this.ctx.fillStyle = this.foreColor;
                this.ctx.fillRect(this.left + this.captionWidth + this.columnWidth * j + this.beatMarginX, 
                        this.top + this.rowHeight * i + this.beatMarginY,
                        this.columnWidth - this.beatMarginX * 2, this.rowHeight - this.beatMarginY * 2);
            }
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
        for (var j = 0; j < this.beatParameters.subbeats; j++) {
            subbeatIndex = j + i * this.beatParameters.subbeats;
            var value = this.drumbeat.tracks[this.selectedTrack].data[subbeatIndex];
            this.ctx.fillStyle = value >= 1 ? this.foreColor :
                    (j === 0) ? this.downbeatColor : this.beatColor;

            this.ctx.fillRect(this.left + this.captionWidth + this.columnWidth * j + 1, 
                    this.top + this.rowHeight * i + 1,
                    this.columnWidth - 2, this.rowHeight - 2);

            if (value > 0  && value < 1) {
                if (value >= 0.5) {
                    this.beatMarginX = this.columnWidth / 10;
                    this.beatMarginY = this.rowHeight / 10;
                }
                else {
                    this.beatMarginX = this.columnWidth / 5;
                    this.beatMarginY = this.rowHeight / 5
                }
                this.ctx.fillStyle = this.foreColor;
                this.ctx.fillRect(this.left + this.captionWidth + this.columnWidth * j + this.beatMarginX, 
                    this.top + this.rowHeight * i + this.beatMarginY,
                    this.columnWidth - this.beatMarginX * 2, this.rowHeight - this.beatMarginY * 2);
            }


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

OMGDrumMachine.prototype.drawCaptions = function () {
    for (var i = 0; i < this.info.length; i++) {

        if (this.info[i].track.audioParameters.mute) {
            this.ctx.globalAlpha = 0.6;
            this.ctx.fillStyle = "#880000";
            this.ctx.fillRect(this.left, this.top + i * this.captionHeight, 
                                this.captionWidth, this.captionHeight);
            this.ctx.globalAlpha = 1;        }
        
        if (this.info[i].i === this.selectedTrack) {
            this.ctx.strokeStyle = this.foreColor;
            this.ctx.strokeRect(this.left, this.top + i * this.captionHeight, 
                    this.captionWidth, this.captionHeight);

        }
        
        this.ctx.fillStyle = this.foreColor;
        if (this.info[i].width  > 0) {
            this.ctx.fillText(this.info[i].caption, 
                this.left + this.captionWidth / 2 - this.info[i].width / 2, 
                this.top + this.captionHeight * (i + 0.5) + 6);
        }
    }
};

OMGDrumMachine.prototype.setInfo = function () {
 
    this.height = this.canvas.clientHeight;
    this.width = this.canvas.clientWidth;
    this.canvas.height = this.height;
    this.canvas.width = this.width;

    var offsets = omg.ui.totalOffsets(this.canvas);
    this.offsetLeft = offsets.left;
    this.offsetTop = offsets.top;

    this.info = [];
    var longestCaptionWidth = 0;

    for (var i = 0; i < this.drumbeat.tracks.length; i++) {
        if (this.drumbeat.tracks[i].sound) {
            var width = this.ctx.measureText(this.drumbeat.tracks[i].name).width
            if (this.captionWidth === undefined && this.drumbeat.tracks[i].name.length > 0) {
                longestCaptionWidth = Math.max(longestCaptionWidth, width);
            }
            this.info.push({
                caption: this.drumbeat.tracks[i].name, 
                width: width,
                track: this.drumbeat.tracks[i],
                i: i
            });
        }
    }

    if (!this.info.length) {
        this.info = null;
        return;
    }

    this.columnWidth = (this.width - this.captionWidth) / this.totalSubbeats;
    this.captionHeight = this.canvas.height / this.info.length;
    this.rowHeight = this.captionHeight;
    this.rowHeightTrack = this.canvas.height / (this.totalBeats);
    this.columnWidthTrack = (this.width - this.captionWidth) / this.beatParameters.subbeats;

    if (this.captionWidth === undefined) {
        this.captionWidth = Math.min(this.canvas.width * 0.2, 50, longestCaptionWidth + 4);
    }
};

OMGDrumMachine.prototype.setRowColumnSizes = function () {
    if (this.selectedTrack < 0) {
        this.columnWidth = (this.width - this.captionWidth) / this.totalSubbeats;
        this.rowHeight = this.captionHeight;
    }
    else {
        this.columnWidth = (this.width - this.captionWidth) / this.beatParameters.subbeats;
        this.rowHeight = this.canvas.height / (this.totalBeats);
    }
};