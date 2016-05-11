console.log("Starting express");

var express = require('express');
var app = express();

console.log("express created \nStarting body-parser");

var bodyParser = require('body-parser');
app.use(bodyParser.json());

console.log("body-parser created \nStarting socket.io");

//var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/*app.get('/live', function(req, res){
  res.sendfile('live/index.html');
});
app.get('/live/console', function(req, res){
  res.sendfile('live/console.html');
});*/
app.get('/live/remote', function(req, res){
  res.sendfile('remote.html');
});


var consoleSocket = io.of('/console');
consoleSocket.on('connection', function(socket){
  console.log('console connected');
});


var userSocket = io.of('/user');
userSocket.on('connection', function(socket){
  console.log('a user connected');

  socket.on("playnote", function(data) {
    //console.log(data);
    consoleSocket.emit("playnote", data);
  });

});

console.log("Socket.io started.");
console.log("Starting massive");


var massive = require("massive");

console.log("massive created \nConnecting to database");

var massiveInstance = massive.connectSync({connectionString: 
       "postgres://omusic_db:Ursa5830@localhost/omusic_db"});
app.set('db', massiveInstance);

console.log("massive connected to database\nStarting passport");

var passport = require("passport");

console.log("passport created\nStarting passport-local");

var LocalStrategy = require("passport-local").Strategy;
passport.use(new LocalStrategy(
   function (username, password, done) {
      console.log(User);
      var db = app.get("db");
      db.users.find({username: username}, function (err, user) {
         console.log(user);
         return done(null, user || err);
      });
   }
));

console.log("On to routes...");

app.use(express.static('www'));
//app.use(express.static('live'));

app.post("/login",
   passport.authenticate("local", {successRedirect: "/",
                                   failureRedirect: "/login.html"})
);

app.get('/data/', function (req, res) {
    var db = app.get('db');
    var options = {limit : 10, order : "id"};
    db.things.findDoc("*", function (err, docs) {
        console.log(err);
        res.send(docs);
    });
});

app.get('/data/:id', function (req, res) {
    var db = app.get('db');
    db.things.findDoc({id: req.params.id}, function (err, docs) {
        console.log(err);
        res.send(docs);
    });
});

app.post('/data/', function (req, res) {
    var db = app.get('db');

    console.log(req.body);

    db.saveDoc("things", req.body, function (err, result) {
        console.log(err);
        if (!err) {
            res.send(result);
        }
    }); 
});

http.listen(80, function () {
    console.log('port 80 yo');
});
