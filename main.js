var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var https = require('https');
var io = require('socket.io')(http);
var massive = require("massive");
var cookieParser = require('cookie-parser');
var passport = require("passport");
var cors = require("cors");
var fs = require("fs");

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
    console.log("user:"); console.log(user); 
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    var db = app.get("db");
    id = typeof id === "string" ? parseInt(id) : id;
    db.users.findOne(id, function (err, user) {
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

            console.log("login user:"); console.log(user);
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
                return done(null, false);
            }

			var newUser = {username: username, password: password, 
				admin:false};
            db.users.save(newUser, function (err, saveResult) {
                if (err) {
                    return done(err);
                } 
                return done(null, saveResult);
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

  socket.on("programchange", function(data) {
    consoleSocket.emit("programchange", data);
  });
});



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

app.get('/user', function (req, res) {
    if (req.user) {
        res.send(req.user);
    } else {
        res.send(false);
    }
});


app.get('/data/', function (req, res) {
    var db = app.get('db');
    var perPage = 50;
    var options = {limit : perPage, order : "created_at desc"};
    var find = "*";
    if (req.query.user_id) {
        //find = {user_id: parseInt(req.query.user_id)};
        find = {user_id: req.query.user_id};
    }
    if (req.query.type) {
        find = {type: req.query.type};
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

    if (!req.body.created_at) {
        req.body.created_at = Date.now();
    }
    req.body.last_modified = Date.now();

    var db = app.get('db');
    db.saveDoc("things", req.body, function (err, result) {
        console.log(err);
        if (!err) {
            res.send(result);
        }
    }); 
});
app.delete('/data/:id', function (req, res) {
    if (req.user && req.user.admin) {
		console.log(req.user);
        req.body.user_id = req.user.id;
        req.body.username = req.user.username;
    }
    else {
		res.send({"error": "access denied"});
		return;
	}

    var db = app.get('db');
    db.things.destroy({id: req.params.id}, function (err, result) {
        console.log(err);
        if (!err) {
            res.send(result);
        }
    }); 
});

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
    https.createServer(options, app).listen(8081, function () {
        console.log("https port 8081");
    });
}
catch (excp) {
    console.log(excp);
    console.log("did not create https server");
}
