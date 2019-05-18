var compression = require('compression');
var express = require('express');
var app = express();
app.use(compression());

var multer = require('multer');
const upload = multer();

var http = require('http').Server(app);
var https = require('https');

var bodyParser = require('body-parser');
var massive = require("massive");
var cookieParser = require('cookie-parser');
var passport = require("passport");
var cors = require("cors");
var fs = require("fs");

var viewer = require("./viewer.js");
var remote = require("./remote.js");

const bcrypt = require('bcrypt');
    
app.use(cors());

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
    id = typeof id === "string" ? parseInt(id) : id;
    db.users.findOne(id, function (err, user) {
        done(err, user);
    });
});


var LocalStrategy = require("passport-local").Strategy;
passport.use("login", new LocalStrategy(
    function (username, password, done) {
        var db = app.get("db");
        db.users.findOne({username: username}, function (err, user) {
            if (err || !user || !user.bpassword) return done(err);

            bcrypt.compare(password, user.bpassword.trim(), function(err, res) {
                if(res) {
                    delete user.bpassword;
                    delete user.password;
                    return done(null, user);
                } else {
                    return done(null, false);
                } 
            });
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
                return done(null, false);
            }

            bcrypt.hash(password, 10, function(err, hash) {
                var newUser = {username: username, bpassword: hash, 
                    password: "",
                    admin:false};
                db.users.save(newUser, function (err, saveResult) {
                    if (err) {
                        return done(err);
                    } 
                    return done(null, saveResult);
                });
            });
        });
    })
);


app.post("/login",
   passport.authenticate("login", {successRedirect: "/",
                                   failureRedirect: "/login.htm?invalid"})
);
app.get("/logout", function (req, res) {
      req.logout();
      res.redirect("/");
   }
);
app.post('/signup', 
   passport.authenticate("signup", {successRedirect: "/",
                                   failureRedirect: "/signup.htm?invalid"})
);

app.post("/api-login",
   passport.authenticate("login"),
   function (req, res) {
        if (req.user) {
            res.send(req.user);
        } else {
            res.send(false);
        }       
   });

app.get("/api-logout", function (req, res) {
      req.logout();
      res.send({});
   }
);
app.post('/api-signup', 
   passport.authenticate("signup"), 
      function (req, res) {
        if (req.user) {
            res.send(req.user);
        } else {
            res.send(false);
        }       
   });


app.get('/user', function (req, res) {
    if (req.user) {
        delete req.user.password;
        res.send(req.user);
    } else {
        res.send(false);
    }
});

app.post('/user', function (req, res) {
    var db = app.get('db');
    if (req.user && req.body) {
        db.users.save(req.body, function (err, saveResult) {
            if (err) {
                res.send(false);
            } 
            else {
                delete saveResult.password;
                res.send(saveResult);
            }
        });

    } else {
        res.send(false);
    }
});


app.get('/data/', function (req, res) {
    var db = app.get('db');
    var perPage = req.query.perPage || 20;
    var options = {limit : perPage, order : "created_at desc"};
    var find = {};
    if (req.query.user_id) {
        //find = {user_id: parseInt(req.query.user_id)};
        find.user_id = req.query.user_id;
    }
    if (req.query.type) {
        if (req.query.type === "MELODY" || 
                        req.query.type === "BASSLINE" ||
                        req.query.type === "DRUMBEAT") {
            find.partType = req.query.type;
        }
        else {
            find.type = req.query.type;
        }
        
        if (req.query.type === "SOUNDSET") {
            if (!req.user || !req.user.admin) {
                find.approved  = true;                
            }
            options.limit = 100;
        }
    }

    if (req.query.page) {
        options.offset = (parseInt(req.query.page) - 1) * perPage;
    }

    var callback = function (err, docs) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(docs);
        }
    };
    if (JSON.stringify(find) == "{}") {
        find = "*";
    }
    if (req.query.q) {
        find = {keys:["tags", "name"], term: req.query.q};
        db.things.searchDoc(find, options, callback);
    }
    else {
        db.things.findDoc(find, options, callback);        
    }
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
    if (req.user) {
        req.body.user_id = req.user.id;
        req.body.username = req.user.username;
    }
    if (req.body.approved && (!req.user || !req.user.admin)) {
        delete req.body.approved;
    }

    if (typeof req.body.omgVersion !== "number" || req.body.omgVersion < 1) {
        res.send({});
        return;
    }

    if (!req.body.created_at) {
        req.body.created_at = Date.now();
    }
    req.body.last_modified = Date.now();

    var db = app.get('db');
    db.saveDoc("things", req.body, function (err, result) {
        if (!err) {
            res.send(result);
        }
        else {
            res.send(err);
            console.log(err);
        }
    }); 
});
app.delete('/data/:id', function (req, res) {
    if (req.user && req.user.admin) {
        req.body.user_id = req.user.id;
        req.body.username = req.user.username;
    }
    else {
        res.send({"error": "access denied"});
        return;
    }

    var db = app.get('db');
    db.things.destroy({id: req.params.id}, function (err, result) {
        if (!err) {
            res.send(result);
        }
        else {
            res.send(err);
            console.log(err);
        }
    }); 
});

app.get('/play/:id', function (req, res) {
    var db = app.get('db');
    db.things.findDoc({id: req.params.id}, function (err, docs) {
        if (err) {
           res.send(err);
        } else {
           res.send(viewer(docs));
        }
    });
});

app.get('/star/', function (req, res) {
    if (!req.user) {
        res.send("not logged in");
        return;
    }

    var db = app.get('db');
    db.stars.findDoc({user_id: req.user.id, thing_id: req.body.id}, {}, function (err, docs) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(docs);
        }
    });
    
});

app.post("/playcount", function (req, res) {

    var db = app.get('db');
    db.run("update things set playcount = playcount + 1 where id=" + req.body.id, function(err, docs){
        if (err) {
            console.log(err);
            if (err.routine === "errorMissingColumn") {
                db.run("alter table things add column playcount bigint default 0");
            }
        }
        res.send(err || docs)
    });
});

app.get('/most-plays/', function (req, res) {
    var db = app.get('db');
    
    var perPage = req.query.perPage || 20;
    db.things.find({"playcount >": 0}, {
        columns: ["playcount", "id", "body"],
        order: "playcount desc",
        offset: (parseInt(req.query.page || "1") - 1) * perPage,
        limit: perPage
    }, function (err, docs) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(docs);
        }
    });
});

app.post('/preview', upload.any(), (req, res) => {
    fs.writeFile("www/preview/" + req.body.id + ".png", req.files[0].buffer, (err) => {
        if (err) {
            console.log('Error: ', err);
            res.status(500).send({"error": err.message});
        } else {
            res.status(200).send({});
        }
    });
});


app.get('/live/:room', function (req, res) {
    res.send(remote(req.params.room));
});

app.use(express.static('www', {index: "index.htm"}));

try {
    console.log("Connecting to database...");
    var massiveInstance = massive.connectSync({connectionString: 
           `postgres://omusic_db:${process.env.OMG_DB_PW}@localhost/omusic_db`});
    app.set('db', massiveInstance);
    console.log("ok.");    
}
catch (excp) {
    console.log(excp.error);
    console.log(`COULD NOT CONNECT TO DATABASE! Check the following:

    1. The OMG_DB_PW environment variable is set. Run: export OMG_DB_PW=password

    2. Make sure Postgresql 9.4 or later is installed. Run: ./install_database.sh

    3. Also make sure database omusic_db exists. Run: ./create_database.sh`);
}


var httpPort = process.env.OMG_PORT || 8080;
http.listen(httpPort, function () {
    console.log(`port ${httpPort} yo`);
});

try {
    var options = {
        key: fs.readFileSync('privkey.pem'),
        cert: fs.readFileSync('fullchain.pem')
    };
    var httpsServer = https.createServer(options, app);
    httpsServer.listen(8081, function () {
        console.log("https port 8081");
    });
}
catch (excp) {
    console.log(excp);
    console.log("did not create https server");
}

var io = require('socket.io')(httpsServer);
console.log("sockets to https");

var getLivePart = function (song, partName) {
    for (var i = 0; i < song.sections[0].parts.length; i++) {
        if (song.sections[0].parts[i].name === partName) {
            return song.sections[0].parts[i];
        }
    }
};
var updateLiveSong = function (song, data) {
    if (data.action === "partAdd") {
        song.sections[0].parts.push(data.part);
    }
    else if (data.property === "beatParams") {
        song.beatParams.bpm = data.value.bpm;
        song.beatParams.shuffle = data.value.shuffle;
        song.beatParams.subbeats = data.value.subbeats;
        song.beatParams.beats = data.value.beats;
        song.beatParams.measures = data.value.measures;
    }
    else if (data.property === "keyParams") {
        song.keyParams.rootNote = data.value.rootNote;
        song.keyParams.scale = data.value.scale;
    }
    else if (data.property === "chordProgression") {
        song.sections[0].chordProgression = data.value;
    }
    else if (data.property === "audioParams" && data.partName) {
        let part = getLivePart(song, data.partName);
        if (!part) return;
        part.audioParams.mute = data.value.mute;
        part.audioParams.gain = data.value.gain;
        part.audioParams.pan = data.value.pan;
        part.audioParams.warp = data.value.warp;
    }
    else if (data.action === "sequencerChange") {
        let part = getLivePart(song, data.partName);
        part.tracks[data.trackI].data[data.subbeat] = data.value;
    }
    else if (data.action === "verticalChangeNotes") {
        //tg.omglive.onVerticalChangeFrets(data);
    }
};

var rooms = {};
var omgSocket = io.of("/omg-live");
omgSocket.on("connection", function (socket) {
    var room = "";
    var user = "";
    socket.on("startSession", function (data) {
        room = data.room;
        user = data.user;
        socket.join(room);
        
        if (!rooms[room]) {
            rooms[room] = {users:{}, song: data.song};
            socket.emit("join", {});
        }
        else {
            socket.emit("join", rooms[room]);
        }
        
        var userString = "";
        var users = 0;
        for (var u in rooms[room].users) {
            userString += " " + u;
            users++;
        }
        socket.emit("chat", {text: "[" + room + "]: " + users + " users in room"});
        if (users) {
            socket.emit("chat", {text: userString});
        }
        rooms[room].users[user] = Date.now();
        omgSocket.in(room).emit("chat", {text: "[" + room + "]: " + user + " has joined"});
    });
    socket.on("leaveSession", function (data) {
        delete rooms[room].users[user];
        omgSocket.in(room).emit("chat", {text: "[" + room + "]: " + user + " has left"});
        socket.leave(data.room);
        room = "";
    });
    socket.on("basic", function (data) {
        io.of("/omg-live").to(data.room).emit("basic", data);
    });
    socket.on("data", function (data) {
        socket.to(room).emit("data", data);
        if (data.action === "loadSong") {
            rooms[room].song = data.value;
        }
        else {
            try {
                updateLiveSong(rooms[room].song, data);
            }
            catch (e) {}
        }
    });
    socket.on("chat", function (data) {
        omgSocket.in(room).emit("chat", data);
    });
    socket.on("rtc", function (data) {
        if (data.message && data.message.type === "offer") {
            rooms[room].offer = data;
            rooms[room].serverUser = user;
        }
        else if (data.message && data.message.type === "answer") {
            //send it to whoever made the offer!
            socket.to(room).emit("rtc", data);
        }
        else if (data.message && data.message.candidate) {
            socket.to(room).emit("rtc", data);
        }
    });
    socket.on("disconnect", function () {
        if (rooms[room]) {
            if (rooms[room].serverUser === user) {
                rooms[room].offer = undefined;
            }
            delete rooms[room].users[user];
        }
        omgSocket.in(room).emit("chat", {text: user + " has left"});
    });
});
