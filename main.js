var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var massive = require("massive");
var cookieParser = require('cookie-parser');
var passport = require("passport");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    var db = app.get("db");
    db.users.find(id, function (err, user) {
        done(err, user);
    });
});
app.use(express.static('www', {index: "index.htm"}));


var LocalStrategy = require("passport-local").Strategy;
passport.use("login", new LocalStrategy(
    function (username, password, done) {
        var db = app.get("db");
        db.users.findOne({username: username}, function (err, user) {
            if (err) return done(err);

            console.log("user:"); console.log(user);
            if (user && user.password.trim() === password) {
                return done(null, user);
            }

            return done(null, false);
        });
    }
));
passport.use("signup", new LocalStrategy(
    function (username, password, done) {
        var db = app.get("db");

        db.users.findOne({username: username}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (user) {
                return done(null, {message: "This username already exists"});
            }             
            var newUser = {username: username, password: password};
            db.users.save(newUser, function (err, saveResult) {
                if (err) {
                    return done(err);
                } 
                return done(null, newUser);
            });
        });
    })
);


var consoleSocket = io.of('/console');
consoleSocket.on('connection', function(socket){
});
var userSocket = io.of('/user');
userSocket.on('connection', function(socket){
  socket.on("playnote", function(data) {
    consoleSocket.emit("playnote", data);
  });
});



app.post("/login",
   passport.authenticate("login", {successRedirect: "/",
                                   failureRedirect: "/login.html?invalid"})
);
app.get("/logout", function (req, res) {
      req.logout();
      res.redirect("/");
   }
);
app.post('/signup', 
   passport.authenticate("signup", {successRedirect: "/",
                                   failureRedirect: "/signup.html"})
);

app.get('/user', function (req, res) {
    if (req.user) {
        res.send(req.user);
    } else {
        res.send(false);
    }
});


app.get('/data/', function (req, res) {
    var db = app.get('db');
    var options = {limit : 10, order : "id"};
    db.things.findDoc("*", function (err, docs) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(docs);
        }
    });
});
app.get('/data/:id', function (req, res) {
    var db = app.get('db');
    db.things.findDoc({id: req.params.id}, function (err, docs) {
        if (err) {
           res.send(err);
        } else {
           res.send(docs);
        }
    });
});
app.post('/data/', function (req, res) {
    var db = app.get('db');
    db.saveDoc("things", req.body, function (err, result) {
        console.log(err);
        if (!err) {
            res.send(result);
        }
    }); 
});



console.log("Connecting to database...");
var massiveInstance = massive.connectSync({connectionString: 
       "postgres://omusic_db:Ursa5830@localhost/omusic_db"});
app.set('db', massiveInstance);
console.log("ok.");



http.listen(80, function () {
    console.log('port 80 yo');
});
