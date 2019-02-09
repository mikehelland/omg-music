/*
var shipImage = new Image();
shipImage.src = "assets/flying-saucer.png";

var forestBandit = new Image();
forestBandit.src = "assets/forest-bandit.png";

var images below replaces listing the above variables using a nested object - except for the audio variable

document.body.appendChild(shipImage); //document.body interacts with the html body tag
document.body.appendChild(forestBandit); //.appendChild adds the tag for the specified variable type in the html
document.body.appendChild(spaceAudio);
document.getElementById('spaceAudio').play();


*/

var sound = window.location.pathname !== "/docs/gamedev_slides.htm";

if (window.location.search.length > 1) {
    var omgid = window.location.search.slice(1);
}

var game = {};
game.width = window.innerWidth;
game.height = window.innerHeight;
game.kills = 0; //can increment to keep track of how many kills
game.lives = 3; //decrement to keep track of lives
game.pressedKeys = [];
game.lastBullet = 0;
game.time = 60;
game.newBanditCount = 1;
game.banditDx = 5;

var start = function () {
    handles = [setInterval(newBandit, 1000),
    setInterval(draw, 1000/60)];
};


if (sound) {
    game.music = new OMusicPlayer();
    game.music.loadFullSoundSets = true;
    game.music.prepareSongFromURL("https://openmusic.gallery/data/" + (omgid || 1333),
        function () {
            start();
        });
}

var images = {
            "ship": {"fileName": "assets/flying-saucer.png"},
            "bandit": {"fileName": "assets/forest-bandit.png"},
            "ninja": {"fileName": "assets/Ninja.png"}
            };

for (var image in images) {
    images[image].img = new Image(); //we are defining the custom property img to equal a new image within the images object
    images[image].img.src = images[image].fileName; //src is a javascript property (has special behavior), loads an Image
}

var canvas = document.getElementById("main-canvas"); //.getElementById is defined by DOM, we are returning the canvas
var ctx = canvas.getContext("2d"); //.getContext is a function of the canvas DOM element, canvas is html5
canvas.width = game.width;
canvas.height = game.height;

var player1 = {};
player1.x = 20;
player1.y = 100;
player1.img = images.ship.img;

var processKeys = function () {
    if(game.pressedKeys[38]) {
        player1.y = player1.y - 10; 
    } 
    if(game.pressedKeys[40]) {
        player1.y = player1.y + 10;        
    } 
    if(game.pressedKeys[32]) {
        
        if (Date.now() - game.lastBullet > 250) {
            fireBullet();
            game.lastBullet = Date.now();
        }
    } 

};
        
game.hitTestBanditShip = function (bandit) {
    return bandit.x - (player1.x + 75) < 5 && bandit.x - (player1.x + 75) > 0 && 
        bandit.y + 100 >= player1.y && bandit.y <= player1.y + 100
};

 var renderBandits = function() {
     bandits = bandits.filter(function (bandit) {
        if (game.hitTestBanditShip(bandit)) {
            banditHitShip();
        }
    
        var hitByBullet;
    
        bullets.forEach(function (bullet, i) {
            if (bullet.x >= bandit.x && bullet.x <= bandit.x + 50 && bullet.y <= bandit.y + 100 && bullet.y >= bandit.y) {
                hitByBullet = i;        
            }
        });
 
        if (typeof hitByBullet === "number") {
            killBandit();
            bullets.splice(hitByBullet, 1);
	    if (bandit.boss && sound) 		
		game.music.mutePart("Boss", true);
            return false;
        }

	if (bandit.boss) {
	        ctx.drawImage(images.ninja.img, bandit.x, bandit.y, 100, 100);
		bandit.x -= 5;
	} 
	else {
	        ctx.drawImage(images.bandit.img, bandit.x, bandit.y, 100, 100);
	}
        bandit.x -= 5;
   
        if (bandit.boss && bandit.x <= 0 && sound) {
            game.music.mutePart("Boss", true);            
        }
        return bandit.x > 0;
    }); 
 }   


var draw = function() {

    processKeys();
    
    canvas.width = canvas.width;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, game.width, game.height);

    ctx.drawImage(player1.img, player1.x, player1.y, 100, 100);

    ctx.fillStyle = "red";
    bullets = bullets.filter(function (bullet) {    //.filter (special forEach, if it gets a true it's kept in, false it's thrown out) is running through the array, when true it adds to the array. by doing bullets = bullets.filter it discards the old array and begins fresh
        ctx.fillRect(bullet.x, bullet.y, 15, 5);
        bullet.x += 5;
        
        return bullet.x < game.width;  
    });

    ctx.fillStyle = "yellow";
    stars.forEach(function (star) {
        ctx.fillRect(star.x, star.y, star.size, star.size);
        star.x -= star.dx;
        
        if (star.x < 0) {
		star.x =  game.width;  
		star.y = game.height * Math.random();
         }
    });
        
    renderBandits();       

    ctx.font = "32px Courier";
    ctx.fillText(game.time, game.width - 50, 50);
        
}


var bandits = [];

var bullets = [];
var stars = [];

for (var istar = 0; istar < 20 + Math.random() * 20; istar++) {
    stars.push({x: Math.random() * game.width, y: Math.random() * game.height, dx: Math.random(), size: Math.random() * 3});
}

var newBandit = function() {
	game.time--;
	if (game.time % 10 === 0) {
		game.newBanditCount++;
		game.banditDx++;
                if (sound) {
                    game.music.keyParams.rootNote++;
                    game.music.rescaleSong();
                    game.music.beatParams.bpm += 20;
                }
	}
        for (var ib = 0; ib < game.newBanditCount; ib++) {
		var bandit = {};
		bandit.x = game.width;
		bandit.y = (game.height - 100) * Math.random();

		bandits.push(bandit);  
	}
	if (game.time % 20 === 0) {
		var bandit = {};
		bandit.x = game.width;
		bandit.y = (game.height - 100) * Math.random();
		bandit.boss = true;
                if (sound) {
                    game.music.mutePart("Boss", false);
                }
		bandits.push(bandit);  
	}
}
        

var fireBullet = function() {
    var bullet = {}; //this makes it a blank object within the function
    bullet.x = player1.x + 100;
    bullet.y = player1.y + 95;
    
    bullets.push(bullet); //this pushes the object bullet into the array bullets

    if (game.laserSound)
        game.laserSound.play();

//above could also be written as var bullet = {x: player1.x, y: player1.y}
};


var banditHitShip = function() {
    clearInterval(handles[0])
    clearInterval(handles[1])
    if (sound) {
        game.music.stop();
        game.music.getSound("SFX", "toy1").play();
    }
}; 

var killBandit = function() {


};   

document.body.onkeyup = function (eventData){ 
      
    game.pressedKeys[eventData.keyCode] = false;
    
};

document.body.onkeydown = function (eventData){    //onkeydown (means pushing the button) is an event in the DOM, (eventData) is the parameter we're pulling from the fuction, stands for event. It's a local variable for that function alone, supplied by the browser  (s) would stand for string.
    
   // console.log(eventData.keyCode);
    if (!game.started) {
        game.started = true;
        if (sound) {
            game.music.play();
            game.music.queueSection = 1;
            game.laserSound = game.music.getSound("SFX", "toy5");
        }
    }
  
    game.pressedKeys[eventData.keyCode] = true;  
        
};

if (!sound) {
    start();
}
