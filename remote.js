var remote = function (room) {

return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width">
<style>
body {margin:0px; height:100%;}
#main-canvas {position:absolute; width:100%; height:100%;}
</style>
</head>

<body>
<canvas id="main-canvas"></canvas>
<script>
var room = "${room}";
</script>
<script src="/js/socketio.js"></script>
<script src="/js/remote.js"></script>
</body>
</html>`
};

module.exports = remote;
