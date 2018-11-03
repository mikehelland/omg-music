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

omg.ui.drawDrumCanvasForTrack = function (params) {
    var subbeat = params.subbeat;
    var canvas = params.canvas;
    var context = canvas.getContext("2d");
    
    var captionWidth = canvas.omgdata.captionWidth;
    var left = canvas.omgdata.left;
    var top = canvas.omgdata.top;
    var height = canvas.omgdata.height;
    var width = canvas.omgdata.width;
    var drumbeat = canvas.omgdata.drumbeat;
    
    var totalBeats = canvas.omgdata.beats * canvas.omgdata.measures
    var rowHeight = height / (totalBeats);

    var columnWidth = (width - captionWidth) / canvas.omgdata.subbeats;

    canvas.rowHeight = rowHeight;
    canvas.columnWidth = columnWidth;
    canvas.captionWidth = captionWidth;

    var subbeatIndex;
    for (var i = 0; i < totalBeats; i++) {
        for (var j = 0; j < canvas.omgdata.subbeats; j++) {

            subbeatIndex = j + i * canvas.omgdata.subbeats;
            context.fillStyle = drumbeat.tracks[canvas.omgdata.selectedTrack].data[subbeatIndex] ? "black" :
                    (j == 0) ? "#C0C0C0" : "#E0E0E0";

            context.fillRect(left + captionWidth + columnWidth * j + 1, top + rowHeight * i + 1,
                    columnWidth - 2, rowHeight - 2);

            if (subbeatIndex === subbeat) {
                context.globalAlpha = 0.5;
                context.fillStyle = "#4fa5d5";    
                context.fillRect(left + captionWidth + columnWidth * j + 1, top + rowHeight * i + 1,
                        columnWidth - 2, rowHeight - 2);
                context.globalAlpha = 1;
            }
        }
    }  
};

omg.ui.drawDrumCanvas = function (params) {

    var drumbeat = params.drumbeat || params.data;
    var canvas = params.canvas;
    var captionWidth = params.captionWidth;
    var subbeat = params.subbeat;
    
    //maybe that other stuff above should be in here
    if (!canvas.omgdata) {
        canvas.omgdata = {};
        canvas.omgdata.selectedTrack = -1;
    }    
        canvas.omgdata.subbeats = (params.songData && params.songData.subbeats) ? 
            params.songData.subbeats : 4;
        canvas.omgdata.beats = (params.songData && params.songData.beats) ? 
            params.songData.beats : 4;
        canvas.omgdata.measures = (params.songData && params.songData.measures) ? 
            params.songData.measures : 2;
        canvas.omgdata.totalSubbeats = canvas.omgdata.subbeats * 
                canvas.omgdata.beats * canvas.omgdata.measures;
        canvas.omgdata.drumbeat = drumbeat;
    //}

    canvas.omusic_refresh = function (subbeat) {
        try {
            if (typeof subbeat === "number") {
                params.subbeat = subbeat;   
            }
            omg.ui.drawDrumCanvas(params);
        } catch (exp) {
            console.log("error drawing drum canvas");
            console.log(exp);
        }
    };

    if (!drumbeat.tracks || drumbeat.tracks.length == 0)
        return;

    canvas.omgdata.top = typeof params.offsetTop === "number" ? params.offsetTop : 0;
    canvas.omgdata.left = params.offsetLeft || 0;
    canvas.omgdata.height = typeof params.height === "number" ? 
            params.height : (canvas.height - canvas.omgdata.top);
    canvas.omgdata.width = typeof params.width === "number" ? params.width : canvas.width;    

    var top = canvas.omgdata.top;
    var height = canvas.omgdata.height;
    var width = canvas.omgdata.width;
    var left = canvas.omgdata.left;

    var context = canvas.getContext("2d");

    var longestCaptionWidth = 0;

    var totalTracks = 0;
    for (var i = 0; i < drumbeat.tracks.length; i++) {
        if (drumbeat.tracks[i].sound) {
            totalTracks++;
        }
        if (captionWidth === undefined && drumbeat.tracks[i].name.length > 0) {
            longestCaptionWidth = Math.max(longestCaptionWidth,
                    context.measureText(drumbeat.tracks[i].name).width);
        }
    }

    if (totalTracks == 0) {
        return;
    }

    var trackHeight = height / totalTracks;
    var rowHeight;

    if (captionWidth === undefined) {
        captionWidth = Math.min(canvas.width * 0.2, 50, longestCaptionWidth + 4);
    }
    canvas.omgdata.captionWidth = captionWidth;

    if (!params.keepCanvasDirty) {
        canvas.width = params.width || canvas.clientWidth;
        canvas.height = params.height || canvas.clientHeight;
    }

    context.fillStyle = "#C0C0FF";
    context.fillRect(0, 0, captionWidth, canvas.height);

    var captionPixels;
    for (var i = 0; i < drumbeat.tracks.length; i++) {
        if (!drumbeat.tracks[i].sound) {
            continue;
        }

        context.fillStyle = "black";
        if (captionWidth > 0) {
            captionPixels = context.measureText(drumbeat.tracks[i].name).width;
            context.fillText(drumbeat.tracks[i].name, left + captionWidth / 2 - captionPixels / 2, top + trackHeight * (i + 0.5) + 6);
        }
        
        if (i === canvas.omgdata.selectedTrack) {
            context.strokeRect(left, top + i * trackHeight, captionWidth - 1, trackHeight);
        }
    }
    context.globalAlpha = 0.5;
    context.fillStyle = "white";
    context.fillRect(left + captionWidth, top, width - captionWidth, height);
    context.globalAlpha = 1;

    if (canvas.omgdata.selectedTrack > -1) {
        omg.ui.drawDrumCanvasForTrack(params);
    }
    else {
        
        rowHeight = trackHeight;

        var columnWidth = (width - captionWidth) / canvas.omgdata.totalSubbeats;

        canvas.rowHeight = rowHeight;
        canvas.columnWidth = columnWidth;
        canvas.captionWidth = captionWidth;

        var ii = 0;
        for (var i = 0; i < drumbeat.tracks.length; i++) {
            if (!drumbeat.tracks[i].sound) {
                continue;
            }
            //context.fillStyle = "black";
            //context.fillText(drumbeat.tracks[i].name, left, top + rowHeight * (ii + 1) - 2);

            //for (var j = 0; j < drumbeat.tracks[i].data.length; j++) {
            for (var j = 0; j < canvas.omgdata.totalSubbeats; j++) {
                context.fillStyle = drumbeat.tracks[i].data[j] ? "black" :
                        (j % canvas.omgdata.subbeats == 0) ? "#C0C0C0" : "#E0E0E0";

                context.fillRect(left + captionWidth + columnWidth * j + 1, top + rowHeight * ii + 1,
                        columnWidth - 2, rowHeight - 2);
            }
            ii++;
        }

        context.globalAlpha = 0.5;
        context.fillStyle = "#4fa5d5";
        if (subbeat != undefined) {
            context.fillRect(captionWidth + columnWidth * subbeat + 1, 0,
                    columnWidth - 2, canvas.height);
        }
        context.globalAlpha = 1;
    }
};



// beats are hardcoded?!

function OMGDrumMachine(canvas, part) {
    this.canvas = canvas;

    this.readOnly = true;

    this.beats = 8;
    this.subbeats = 4;

    this.ctx = canvas.getContext("2d");

    var omgdrums = this;
    this.isTouching = false;

    this.lastSubbeat = -1;

    this.lastBox = [-1, -1];

    this.currentTrack = 0;

    this.drawTrackColumn = true;

    if (part) {
        this.setPart(part);
    }
    canvas.onmouseup = function (e) {
        e.preventDefault();
        omgdrums.isTouching = false;
    };
    canvas.onmouseout = function () {
        omgdrums.isTouching = false;
    };
    canvas.ontouchend = function (e) {
        e.preventDefault();
        omgdrums.isTouching = false;
    };

    canvas.onmousemove = function (e) {
        e.preventDefault();

        var x = e.clientX - omgdrums.offsetLeft;
        var y = e.clientY - omgdrums.offsetTop;
        canvas.onmove(x, y);
    };

    canvas.ontouchmove = function (e) {
        e.preventDefault();

        var x = e.targetTouches[0].pageX - omgdrums.offsetLeft;
        var y = e.targetTouches[0].pageY - omgdrums.offsetTop;
        canvas.onmove(x, y);
    };


    canvas.onmousedown = function (e) {
        e.preventDefault();

        var x = e.clientX - omgdrums.offsetLeft;
        var y = e.clientY - omgdrums.offsetTop;
        canvas.ondown(x, y);
    };

    canvas.ontouchstart = function (e) {
        e.preventDefault();

        var x = e.targetTouches[0].pageX - omgdrums.offsetLeft;
        var y = e.targetTouches[0].pageY - omgdrums.offsetTop;
        canvas.ondown(x, y);
    };

    canvas.ondown = function (x, y) {
        if (omgdrums.readOnly)
            return;

        var column = Math.floor((x - canvas.captionWidth) / canvas.columnWidth);
        var row = Math.floor(y / canvas.rowHeight);

        if (column < 0) {
            if (row === canvas.omgdata.selectedTrack) {
                canvas.omgdata.selectedTrack = -1;
            }
            else {
                canvas.omgdata.selectedTrack = row;
            }
        } else {
            
            omgdrums.part.saved = false;
            
            // figure out the subbeat this is
            var subbeat;
            var data;
            if (canvas.omgdata.selectedTrack < 0) {
                subbeat = column;
                data = omgdrums.part.data.tracks[row].data;
            }
            else {
                subbeat = column + row * canvas.omgdata.subbeats;
                data = omgdrums.part.data.tracks[canvas.omgdata.selectedTrack].data;
            }

            data[subbeat] = !data[subbeat];

            lastBox = [column, row];
            omgdrums.isTouching = true;

            if (omgdrums.onchange)
                omgdrums.onchange();
        }

        //omgdrums.drawLargeCanvas();
        omgdrums.canvas.omusic_refresh();
    };

    canvas.onmove = function (x, y) {

        if (omgdrums.readOnly)
            return;

        if (!omgdrums.isTouching)
            return;

        var column = Math.floor((x - canvas.captionWidth) / canvas.columnWidth);
        var row = Math.floor(y / canvas.rowHeight);

        if (column < 0) {
            omgdrums.isTouching = false;
        } else if (lastBox[0] != column || lastBox[1] !== row) {
            var subbeat;
            var data;
            if (canvas.omgdata.selectedTrack < 0) {
                subbeat = column;
                data = omgdrums.part.data.tracks[row].data;
            }
            else {
                subbeat = column + row * canvas.omgdata.subbeats;
                data = omgdrums.part.data.tracks[canvas.omgdata.selectedTrack].data;
            }
            data[subbeat] = data[subbeat] ? 0 : 1;

            lastBox = [column, row];

            if (omgdrums.onchange)
                omgdrums.onchange();

        }

        //omgdrums.drawLargeCanvas();
        omgdrums.canvas.omusic_refresh();

    };


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

    var beats = 4;
    var subbeats = 4;
    var measures = 2;
    if (part.section && part.section.song && part.section.song.data) {
        beats = part.section.song.data.beats || beats;
        subbeats = part.section.song.data.subbeats || subbeats;
        measures = part.section.song.data.measures || measures;
    }
    this.totalSubbeats = measures * beats * subbeats;
    
    this.columns = this.totalSubbeats; //1 + this.subbeats;
    this.rows = this.part.data.tracks.length;

    this.refresh();

    this.captionsAreSetup = false;
};

OMGDrumMachine.prototype.draw = function () {
    
};

OMGDrumMachine.prototype.refresh = function (part) {
    this.columnWidth = this.canvas.clientWidth / this.columns;
    this.rowHeight = this.canvas.clientHeight / this.rows;

    var offsets = omg.ui.totalOffsets(this.canvas);

    this.offsetLeft = offsets.left;
    this.offsetTop = offsets.top;

};

OMGDrumMachine.prototype.drawLargeCanvas = function (iSubBeat) {

    var boxMargin = 6;

    var ctx = this.ctx;
    var width = this.canvas.clientWidth;
    var height = this.canvas.clientHeight;
    this.canvas.width = width;
    this.canvas.height = height;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#8888FF";
    ctx.fillRect(0, 0, this.columnWidth, height);

    if (!this.part)
        return;

    var part = this.part.data;

    var currentBeat;
    if (typeof (iSubBeat) == "number") {
        currentBeat = [(iSubBeat % this.subbeats) + 1,
            Math.floor(iSubBeat / this.subbeats)];
    }

    var captionWidth;
    var halfColumnWidth = this.columnWidth / 2;
    var partCaption;
    if (!this.captionsAreSetup) {
        this.captions = [];
        for (var jj = 0; jj < part.tracks.length; jj++) {
            partCaption = part.tracks[jj].name
            captionWidth = ctx.measureText(partCaption).width;
            this.captions.push({"caption": partCaption, "width": captionWidth,
                "left": halfColumnWidth - captionWidth / 2});
        }
        this.captionsAreSetup = true;
    }

    this.captionRowHeight = height / this.captions.length;

    var x, y, w, h;
    var jj, ii;

    if (this.drawTrackColumn) {
        for (var jj = 0; jj < this.captions.length; jj++) {
            ctx.fillStyle = "#FFFFFF";
            ctx.strokeStyle = "#808080";

            x = boxMargin;
            y = boxMargin + jj * this.captionRowHeight;
            w = this.columnWidth - boxMargin * 2;
            h = this.captionRowHeight - boxMargin * 2;

            if (part.tracks[jj]) {
                if (jj == this.currentTrack) {
                    ctx.fillRect(x, y, w, h);
                    ctx.fillStyle = "black";
                } else {
                    ctx.strokeRect(x, y, w, h);
                    ctx.fillStyle = "white";
                }
                ctx.fillText(this.captions[jj].caption, this.captions[jj].left, y + h / 2);
            }
        }
    }

    ctx.font = "18px sans-serif";
    for (ii = 1; ii < this.columns; ii++) {
        for (jj = 0; jj < this.rows; jj++) {
            ctx.fillStyle = "#FFFFFF";
            ctx.strokeStyle = "#808080";

            x = boxMargin + ii * this.columnWidth;
            y = boxMargin + jj * this.rowHeight;
            w = this.columnWidth - boxMargin * 2;
            h = this.rowHeight - boxMargin * 2;

            if (ii == 0) {
                if (part.tracks[jj]) {
                    if (jj == this.currentTrack) {
                        ctx.fillRect(x, y, w, h);
                        ctx.fillStyle = "black";
                    } else {
                        ctx.strokeRect(x, y, w, h);
                        ctx.fillStyle = "white";
                    }
                    ctx.fillText(this.captions[jj].caption, this.captions[jj].left, y + h / 2);
                }
            } else {

                ctx.fillStyle = "#FFFFFF";

                if (part.tracks[this.currentTrack].data[jj * this.subbeats + ii - 1]) {
                    ctx.fillRect(x, y, w, h);
                    ctx.fillStyle = "black";
                } else {
                    ctx.strokeRect(x, y, w, h);
                    ctx.fillStyle = "white";
                }
                ctx.fillText(ii == 1 ? jj + 1 : ii == 2 ? "e" : ii == 3 ? "+" : "a", x + w / 2 - 6, y + h / 2);

                if (currentBeat != undefined &&
                        ii == currentBeat[0] && jj == currentBeat[1]) {
                    ctx.globalAlpha = 0.5;
                    ctx.fillStyle = "red";
                    ctx.fillRect(x, y, w, h);
                    ctx.globalAlpha = 1;
                    //ctx.fillRect(x - boxMargin, y - boxMargin, 
                    //		w + boxMargin * 2, h + boxMargin * 2);					
                }

            }
        }
    }

};
