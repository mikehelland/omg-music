var url = window.location.origin.replace("http:", "https:");
var socket = io(url + "/omg-live");
var canvas = document.getElementById("main-canvas");
var ctx = canvas.getContext("2d");

var lastX = -1;
var lastY = -1;
var isTouching = false;

var colors = [ "#FFFFFF", "#FF0000", "#FFFF00", "#00FF00", "#0000FF",
            "#FF8000", "#9E9E9E", "#00FFFF", "#800080", "#632DFF", "#63FF08" ];

var shapes = [
    {"shape": "circle", "draw": function (x, y, fill) {
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.stroke();
    }},
    {"shape": "fill_circle", "draw": function (x, y, fill) {
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.fill();
    }},
    {"shape": "square", "draw": function (x, y, fill) {
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x - 20, y - 20);
        ctx.lineTo(x + 20, y - 20);
        ctx.lineTo(x + 20, y + 20);
        ctx.lineTo(x - 20, y + 20);
        ctx.closePath();
        ctx.stroke();
    }},
    {"shape": "fill_square", "draw": function (x, y, fill) {
        ctx.beginPath();
        ctx.moveTo(x - 20, y - 20);
        ctx.lineTo(x + 20, y - 20);
        ctx.lineTo(x + 20, y + 20);
        ctx.lineTo(x - 20, y + 20);
        ctx.closePath();
        ctx.fill();
    }}
];

var colorI = Math.floor(Math.random() * colors.length);
var shapeI = Math.floor(Math.random() * shapes.length);

if (window.location.search) {
   colorI = parseInt(window.location.search.substring(1));
}

var color = colors[colorI];
var shape = shapes[shapeI].shape;
var drawShape = shapes[shapeI].draw;
var username = Math.random().toString(36).substr(2);


window.onload = function () {
	setupCanvas();
};

window.onresize = function () {
	setupCanvas();
};

var setupCanvas = function () {
	
	var height = window.innerHeight;
	var width = window.innerWidth;
	canvas.clientWidth = width;
	canvas.clientHeight = height;
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;

	ctx.font = "5em Helvetica";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	drawCanvas(canvas.width / 2, canvas.height / 2);
};


var drawCanvas = function (x, y) {

	if (x > -1) {	
		lastX = x;
		lastY = y;
	}
	
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = "10pt Helvetica";
    ctx.fillStyle = "white";
    ctx.fillText("Move your shape around", canvas.width / 2, canvas.height / 4);
    
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.globalAlpha = isTouching ? 1.0 : 0.5;
    
    drawShape(lastX, lastY);
    
    //ctx.font = "5em Helvetica";
    //ctx.fillText(letter, lastX, lastY);
    ctx.globalAlpha = 1.0;
    
};

var canvasDownEvent = function (x, y) {
    isTouching = true;
    drawCanvas(x, y); 
    
    socket.emit("basic", {room: room, 
                'user': username, 
		'x': x/canvas.width, 'y': y/canvas.height, 
		'color': color, 'shape': shape});
};

var canvasMoveEvent = function (x, y) {
    if (isTouching){
        drawCanvas(x, y);    
        socket.emit("basic", {room: room, 
                        'user': username, 
			'x': x/canvas.width, 'y': y/canvas.height, 
			'color': color, 'shape': shape});
    }
};

var canvasEndEvent = function (x, y) {
    isTouching = false;    
    //canvas.width = canvas.width;
    drawCanvas(-1);
    socket.emit("basic", {room: room, 'user': username, 'x':-1});
};



canvas.addEventListener("touchstart", function (e) {
	e.preventDefault();
	canvasDownEvent(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
});
canvas.addEventListener("touchmove", function (e) {
	e.preventDefault();
	canvasMoveEvent(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
});
canvas.addEventListener("touchend", function (e) {
	e.preventDefault();
	canvasEndEvent(-1, -1);
});


canvas.onmousedown = function (e) {
    canvasDownEvent(e.clientX, e.clientY);
};
canvas.onmousemove = function (e) {
    canvasMoveEvent(e.clientX, e.clientY);
};
canvas.onmouseup = function (e) {
    canvasEndEvent(e.clientX, e.clientY);
};

