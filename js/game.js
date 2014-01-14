var canvas = document.getElementById('gameCanvas'),
    context = canvas.getContext('2d'),
    scene = [], // Contains the names of all the objects in the scene
    prevLoopTime = +new Date(),
    fpsMeter = document.querySelector('#fpsMeter'),
    levelDataText = document.querySelector('#levelTxt'),
    GRAVITATIONAL_ACCELERATION = 100; // Measured in pixels per second

// Animation polyfill by Paul Irish
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();


// Loads a level from an external json file
//
// Create a Level object, then call Level.load("LEVELNAME"). This returns the JSON file
// that contains the level data. Pass this data onto the Level.draw method.

function Level() {

    this.cameraX = 0;
    this.cameraY = 0;

    // Loads level data from an external level JSON file.
    // When specifying levelFile, the levels folder and .jsonare added to the
    // string automatically, just specify the file name. For example: "level_1"
    this.load = function(levelFile) {

        var levelData = null;

        var xhr = new XMLHttpRequest();
        xhr.open("GET", "levels/" + levelFile + ".json", false);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                levelData = JSON.parse(xhr.responseText);
            }
        }
        xhr.send();
        return levelData;
    }

    this.draw = function(levelData) {

        // Change this if possible! 15 is hardcoded as the number of arrays in the JSON object
        // This should be calculated from the object, something like: levelData.length
        levelDataText.value += "Attempting Loop of levelData \n";
        for(var Yi = 1; Yi <= 15; Yi++) {

            // First loop goes through each row
            if(levelData[Yi].length !== 0) {
                levelDataText.value += "\n\nRow " + Yi + "\n";
            }

            for(var Xi = 0; Xi < levelData[Yi].length; Xi++) {

                var x = Xi * 42;
                var y = Yi * 42;

                // Second loop goes through each value in that row
                if(levelData[Yi].length !== 0) {
                    levelDataText.value += Xi + ": " + levelData[Yi][Xi] + " => " + this.numToTile(levelData[Yi][Xi])
                     +  " || Will be drawn at:" + x + ", " + y + " || \n";
                    var tile = new Tile(this.numToTile(levelData[Yi][Xi]), x, y);
                    tile.draw();
                    scene.push(tile);
                }

//                var tileset = Array;
//                tileset.push(new Tile(this.numToTile(levelData[Yi][Xi]), Xi, Yi));
            }
        }

    }

    this.clear = function() {
        scene = [];
    }

    // Converts the number in an array to its associated tile type
    this.numToTile = function(number) {
        var tiles = ["air", "grass", "dirt", "stone", "water", "lava", "brick"];
        return tiles[number];
    }

    this.moveCamera = function(x, y) {
        // move all objects in the scene array -x amount and -y
        for(var i = 1; i < scene.length; i++) {
            scene[i].x += x;
            scene[i].y += y;
        }
    }
}

// This function tests if two objects (a, b) are colliding by checking their width, height
// and co-ordinates to see if the two objects are overlapping.

function collisionTest(a, b) {
    return !(
        ((a.y + a.h) < (b.y)) ||
            (a.y > (b.y + b.h)) ||
            ((a.x + a.w) < b.x) ||
            (a.x > (b.x + b.w))
        );

}

function Cloud(x, y, w, h) {

    this.w = w || Math.floor(Math.random() * 400) + 50;
    this.h = h || Math.floor(Math.random() * 200) + 50;
    this.x = x || 0 - this.w;
    this.y = y || Math.floor(Math.random() * 200) -100;

    var randOpac = Math.random() + 0.1;

    this.draw = function() {

        context.beginPath();
        context.rect(this.x, this.y, this.w, this.h);
        context.fillStyle = 'rgba(225,225,225,' + randOpac + ')';
        context.fill();
    }
}


// This class is for each individual tile on screen. tileType is the name of the tile as worked out
// by the numToTile method in the Level class. Xi is the index of the x value, i.e. which value in the
// array is currently being looked at (first, second, third...), and Yi is the index of the Y axis, or
// in other words, the row or number of which array is being looked at.

function Tile(type, x, y, w, h) {

    this.x = x || 0;
    this.y = y || 200;
    this.w = w || 42;
    this.h = h || 42;
    this.type = type;
    this.collision = true;
    this.GRAVITATIONAL_ACCELERATION = 0;

    this.draw = function() {

        if(type == "grass") {
            context.beginPath();
            context.rect(this.x, this.y, this.w, this.h);
            context.fillStyle = '#94d088';
            context.fill();

            context.beginPath();
            context.rect(this.x, this.y + 12, this.w, this.h - 12);
            context.fillStyle = '#ab846c';
            context.fill();
        }

        if(type == "dirt") {
            context.beginPath();
            context.rect(this.x, this.y, this.w, this.h);
            context.fillStyle = '#ab846c';
            context.fill();
        }

        if(type == "stone") {
            context.beginPath();
            context.rect(this.x, this.y, this.w, this.h);
            context.fillStyle = '#6f6f6f';
            context.fill();
        }

        if(type == "water") {
            context.beginPath();
            context.rect(this.x, this.y, this.w, this.h);
            context.fillStyle = 'rgba(0, 156, 255, 0.5)';
            context.fill();
            this.collision = false;

        }

        if(type == "lava") {
            context.beginPath();
            context.rect(this.x, this.y, this.w, this.h);
            context.fillStyle = '#d27922';
            context.fill();
            this.collision = false;

        }

        if(type == "air") {
            this.collision = false;
        }
    }

    this.gravity = function(grav_accel) {
        return false;
    }

}

// This class applies gravity to an array of objects. Objects that are affected by
// gravity must have a move function. accel is measured in pixels per frame

function Gravity(objectsArray) {
//    this.objectsArray = objectsArray;
//    this.enabled = true;
//
//    this.apply = function(gravity) {
//        for(var i = 0; i < objectsArray.length; i++) {
//            if(objectsArray[i].collide == false) {
//                objectsArray[i].lastMovement = "down";
//
//                    objectsArray[i].gravity(gravity);
//
//            }
//        }
//    }
//
//    this.enable = function() {
//        GRAVITATIONAL_ACCELERATION = 100;
//    }
//
//    this.disable = function() {
//        GRAVITATIONAL_ACCELERATION = 0;
//    }

    this.objectsArray = objectsArray;
    this.enabled = true;

    this.enable = function(grav_accel) {
        if(this.enabled == true) {
            for(var i = 0; i < objectsArray.length; i++) {
                objectsArray[i].gravity(grav_accel);
            }
        } else {
            for(var i = 0; i < objectsArray.length; i++) {
                objectsArray[i].gravity(0);
            }
        }
    }

}

function Player(x, y, w, h) {
    // Setup initial variables
    this.x = x || 10;
    this.y = y || 450;
    this.w = w || 40;
    this.h = h || 90;

    this.lastMovement = "down";
    this.jumping = false;
    this.collide = false;
    this.GRAVITATIONAL_ACCELERATION = 2;

    this.health = 250;
    this.bullets = [];

    this.move = function(x, y) {

        // Before moving, check if the player(this), is going to collide with the scene
        // if the player moves by this.x, this.y

            this.x += x;
            this.y += y;

    }

    this.gravity = function(grav_accel) {
        this.GRAVITATIONAL_ACCELERATION = grav_accel;
        this.move(0, this.GRAVITATIONAL_ACCELERATION);
    }

    // Moves in the opposite direction specified in lastMovement. Used for collisions.
    this.oppositeMove = function(lastMovement) {
        switch(lastMovement){
            case "left": this.move(15, 0); break;
            case "up": this.move(0, -5); break;
            case "right": this.move(-15, 0); break;
            case "down": this.move(0, -1); break;
            default: return false;
        }
        return true;
    }

    this.futureCollisionTest = function(a, b, nextMovement) {

        // returns true if collision
        var willCollide = !(
            ((a.y + nextMovement[1] + a.h) < (b.y)) ||
                (a.y + nextMovement[1] > (b.y + b.h)) ||
                ((a.x + nextMovement[0] + a.w) < b.x) ||
                (a.x + nextMovement[0] > (b.x + b.w))
            );

        return willCollide;
    }

    this.resize = function(w, h) {
        this.w = w;
        this.h = h;
    }

    this.jump = function() {
        if(this.jumping == false) {
            this.y += -100;
            this.jumping = true;
        }

        if(this.collide = true) {
            this.jumping = false;
        }

         //gravity.enable();
        this.collide = false;
    }

    this.draw = function() {
//        context.beginPath();
//        context.rect(this.x, this.y, this.w, this.h);
//        context.fillStyle = 'rgba';
//        context.fill();
        var img = new Image();
        img.src = 'img/characters/soldier_single.png';
        context.drawImage(img, this.x, this.y + 19);

    }

    this.attack = function() {
        var bullet = new Bullet(this.x + 40, this.y + 60);
        bullet.draw();
        this.bullets.push(bullet);
        scene.push(bullet);
    }

}

function Bullet(x, y) {

    this.x = x;
    this.y = y;
    this.w = 4;
    this.h = 4;

    this.draw = function() {
        context.beginPath();
        context.arc(this.x, this.y, 4, 0, 2 * Math.PI, false);
        context.fillStyle = '#fff';
        context.fill();
    }
}

function UserInterface() {
    this.drawHealth = function(health) {
        // Health bar
        context.beginPath();
        context.rect(50, 20, health, 15);
        if(health < 100) {
            context.fillStyle = '#ae3636';

        } else {
            context.fillStyle = '#35c131';
        }
        context.fill();

        context.fillStyle = '#000';

        context.fillText("HP: " + health, 320, 30);

    }

    this.gameOver = function() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        context.rect(0, 0, 1280, 672);
        context.fillStyle = '#ae3636';
        context.fill();

        context.fillStyle = '#000';
        context.font="30px Arial";
        context.fillText("Game Over!!", 640, 200);
    }
}

function Enemy(type, x, y, w, h) {
    this.type = type;
    this.x = x || 10;
    this.y = y || 450;
    this.w = w || 40;
    this.h = h || 90;

    this.movementDirection = 1;
    this.GRAVITATIONAL_ACCELERATION = 2;
    this.lastMovement = "down";
    this.collide = false;
    this.dead = false;

    this.move = function(x, y) {
        // Before moving, check if the player(this), is going to collide with the scene
        // if the player moves by this.x, this.y
        this.x += x;
        this.y += y;
    }

    this.gravity = function(grav_accel) {
        this.GRAVITATIONAL_ACCELERATION = grav_accel;
        this.move(0, this.GRAVITATIONAL_ACCELERATION);
    }

    // Moves in the opposite direction specified in lastMovement. Used for collisions.
    this.oppositeMove = function(lastMovement) {
        switch(lastMovement){
            case "left": this.move(15, 0); break;
            case "up": this.move(0, 1); break;
            case "right": this.move(-15, 0); break;
            case "down": this.move(0, -1); break;
            default: return false;
        }
        return true;
    }

    // moves the enemy a set number of pixels left and right (back and forth) depending on the framenumber
    // If frameNumber = 50, then the enemy will change direction every 50 frames
    this.enableAI = function(frameNumber, rate) {

        var changeDirection = frameNumber % rate;

        if(changeDirection == 0) {
            // Inverse the number
            this.movementDirection *= -1;
            console.log("change direction!");
        }

        var distanceToPlayer = player1.x - this.x;

        // then move. -ve = left, +ve = right if player - enemy
        if(distanceToPlayer > 0) {
            // positive, so player is to the right of enemy -- MOVE RIGHT
            if(distanceToPlayer < 200) {
                this.move(1.25, 0);
                this.lastMovement = "right";
            }

        } else if(distanceToPlayer < 0) {
            // negative, so player is to the left of enemy -- MOVE LEFT
            if(distanceToPlayer > -200) {
                this.move(-1.25, 0);
            }
        }

        this.move(this.movementDirection, 0);


    }

    this.draw = function() {

        if(this.type == "ghost") {
            var img = new Image();
            img.src = 'img/characters/ghost.png';
            context.drawImage(img, this.x, this.y + 19);
        }

        if(this.type == "bat") {
            var img = new Image();
            img.src = 'img/characters/bat.png';
            context.drawImage(img, this.x, this.y + 19);
        }

        if(this.type == "eye") {
            var img = new Image();
            img.src = 'img/characters/eye.png';
            context.drawImage(img, this.x, this.y + 19);
        }

        if(this.type == undefined) {
            context.beginPath();
            context.rect(this.x, this.y, this.w, this.h);
            context.fillStyle = '#fff';
            context.fill();
        }

        if(this.dead == true) {
            context.beginPath();
            context.rect(this.x, this.y, this.w * 2, this.h);
            context.fillStyle = 'rgba(0,130,205,0.7)';
            context.fill();
        }
    }

}


function Animator(obj, prop, endValue, time){
    this.obj = obj;
    this.prop = prop;
    this.startValue = obj[prop];
    this.endValue = endValue;
    this.valueRange = this.endValue - this.startValue;
    this.startTime = Date.now();
    this.animationLength = time;
    this.finished = false;

    this.update = function(){

        if(!this.finished){

            var timeElapsed = Date.now() - this.startTime;

            // Limit timeElapsed to the maximum length of the animation
            timeElapsed = Math.min(timeElapsed, this.animationLength);

            // Get time elapsed as a percentage (number from 0 to 1)
            var ptElapsed = timeElapsed / this.animationLength;

            // Calculate and apply new property value
            obj[prop] = (ptElapsed * this.valueRange) + this.startValue;

            if(ptElapsed >= 1) this.finished = true;
        }
        obj.draw();
    };

}

window.addEventListener('keydown',function(event){
    switch(event.keyCode){
        case 37: player1.move(-5, 0); player1.lastMovement = "left"; lev.moveCamera(5 , 0);  break;
        case 38: player1.jump(); player1.lastMovement = "up";  break;
        case 39: player1.move(5, 0); player1.lastMovement = "right"; lev.moveCamera(-5 , 0); break;
        case 40: player1.move(0, 5); player1.lastMovement = "down"; break;
        case 88: player1.attack(); break;
        default: return false;
    }
    event.preventDefault();

    return true;
});


function checkCollisions() {
    // This checks for collisions between the player and each object in the scene array (except for
    // the player colliding with itself (i > 0) and tiles which have collision set to false).
    for(var i = 0, l = scene.length; i < l; i++){
        if(i > 0 && scene[i].collision == true) {
            if(collisionTest( scene[i].collision, scene[i])) {
                levelDataText.value += "Collision detected [f: " + frameNumber + "] : player 1 and " + scene[i].constructor.name +  " [" + i + "] " + scene[i].type + "\n\n";

                scene[i].oppositeMove(scene[i].lastMovement);
                //gravity.disable();

                scene[i].collide = true;
//                console.log("collision: " + player1.collide);
            } else {
                player1.collide = false;
//                console.log("collision: " + player1.collide);

            }

        }
    }
}

function findTileAtCoords(x, y) {
    for(var i = 1; i < scene.length; i++) {
//        console.log("is " + x + ", " + y + " within " + scene[i].x + " and " + (scene[i].x + 42) + ", " + scene[i].y + " and " + (scene[i].y + 42) + "?");
        if(x >= scene[i].x && x < scene[i].x + 42 && y >= scene[i].y && y < scene[i].y + 42 ) {
           return scene[i];
        }
    }
}

function groundCollision(object) {

    for(var i = 0, l = scene.length; i < l; i++){
        if(i > 0 && scene[i].collision == true) {
            if(collisionTest(player1, scene[i])) {
                levelDataText.value += "Collision detected [f: " + frameNumber + "] : player 1 and " + scene[i].constructor.name +  " [" + i + "] " + scene[i].type + "\n\n";
                player1.oppositeMove(player1.lastMovement);
                for(var j = 0; j < object.length; j++) {
                    object[j].collide = true;
                }
            }

            }

        }
}

function drawClouds() {
    for(var j = 0; j < cloudAnimations.length; j++) {
        cloudAnimations[j].update();

        // If the clouds are off-screen, reset them to start again
        if(cloudAnimations[j].finished == true) {
            cloud[j] = new Cloud();
            cloudAnimations[j] = new Animator(cloud[j], "x", 1280, Math.floor(Math.random() * 50000) + 20000);
        }

    }
}

function drawBullets() {
    for(var i = 0; i < player1.bullets.length; i++) {
        player1.bullets[i].x += 5;
    }
}

// ADD OBJECTS TO THE ENVIRONMENT

// To add something to the scene, you push it to the array
// for example: scene.push(player1);
var player1 = new Player();

player1.draw();
scene.push(player1);

var enemy1 = new Enemy("eye", 1210, 364);
enemy1.draw();
scene.push(enemy1);

var enemy2 = new Enemy("bat", 910, 407);
enemy2.draw();
scene.push(enemy2);

var enemy3 = new Enemy("ghost", 250, 450);
enemy3.draw();
scene.push(enemy3);

var gravityArray = [player1, enemy1, enemy2, enemy3];
var gravity = new Gravity(gravityArray);

var enemy = [enemy1, enemy2, enemy3];

// Add clouds
var cloud = [];
var cloudAnimations = [];

for(var i = 0; i < 6; i++) {
    cloud[i] = new Cloud(Math.floor(Math.random() * 1200));
    cloud[i].draw();
    cloudAnimations[i] = new Animator(cloud[i], "x", 1280,  Math.floor(Math.random() * 50000) + 20000);
}


var UI = new UserInterface();

// Load Map
var lev = new Level;
var levelData = lev.load('level1');
lev.draw(levelData);

// Game loop below

var frameNumber = 1;

function gameLoop(){
    // Store current time, and calculate ms passed since last time
    var timeNow = +new Date(),
        msDiff = timeNow - prevLoopTime;

    // Calculate and display fps every five frames
    if(frameNumber % 5 == 0) {
        fpsMeter.value = Math.round(1000/msDiff);
    }



    // The loop goes through all the objects in the scene array, and asks them to redraw themselves
    // it also contains the gravity and collisions logic
    context.clearRect(0, 0, canvas.width, canvas.height);

    UI.drawHealth(player1.health);


    for(var i = 0, l = scene.length; i < l; i++){
        scene[i].draw();

        if(findTileAtCoords(player1.x + player1.w/2, player1.y + player1.h + 1) !== undefined) {
            if(findTileAtCoords(player1.x + player1.w/2, player1.y + player1.h + 1).collision == false) {
                player1.collide = false;
            }
        }

        for(var e = 0; e < enemy.length; e++) {
            if(enemy[e] !== null) {
                if(findTileAtCoords(enemy[e].x + (enemy[e].w/2), enemy[e].y + enemy[e].h) !== undefined) {
                    if(findTileAtCoords(enemy[e].x + (enemy[e].w/2), enemy[e].y + enemy[e].h).collision == true) {
                        enemy[e].move(0, -42);
                    }
                }

                if(player1.health > 0) {
                    if(collisionTest(enemy[e], player1)) {
                        player1.health -= 0.001;
                    } else if(player1.health <= 100) {
                        // health regen
                        player1.health += 0.0001;
                    }
                } else {
                    UI.gameOver();
                }

                // check if bullets collide with enemies
                for(var b = 0; b < player1.bullets.length; b++) {
                    if(collisionTest(player1.bullets[b], enemy[e])) {
                        player1.bullets.splice(0,1);
                        enemy[e].dead = true;
                        enemy.splice(e, 1);
                    }
                }
            }
        }

        if(scene[i].collide == false) {
            scene[i].gravity(scene[i].GRAVITATIONAL_ACCELERATION);
            scene[i].lastMovement = "down";
        }
    }


    groundCollision(gravityArray);
    drawClouds();
    drawBullets();
    //gravity.apply(GRAVITATIONAL_ACCELERATION * (msDiff/1000));
    levelDataText.scrollTop = levelDataText.scrollHeight;

    for(var e = 0; e < enemy.length; e++) {
        enemy[e].enableAI(frameNumber, 200);
    }

    // WAIT
    prevLoopTime = timeNow;
    requestAnimFrame(gameLoop);
    frameNumber++;
}
gameLoop();

