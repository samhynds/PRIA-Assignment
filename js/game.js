var canvas = document.getElementById('gameCanvas'),
    context = canvas.getContext('2d'),
    scene = [], // Contains the names of all the objects in the scene
    prevLoopTime = +new Date(),
    fpsMeter = document.querySelector('#fpsMeter'),
    levelDataText = document.querySelector('#levelTxt'),
    GRAVITATIONAL_ACCELERATION = 200; // Measured in pixels per second

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
}

// This class applies gravity to an array of objects. Objects that are affected by
// gravity must have a move function. accel is measured in pixels per frame

function Gravity(objectsArray) {
    this.objectsArray = objectsArray;
    this.enabled = true;

    this.apply = function(gravity) {
        for(var i = 0; i < objectsArray.length; i++) {
            if(objectsArray[i].collide == false) {
                objectsArray[i].lastMovement = "down";

                    objectsArray[i].y += gravity;

            }
        }
    }

    this.enable = function() {
        GRAVITATIONAL_ACCELERATION = 200;
    }

    this.disable = function() {
        GRAVITATIONAL_ACCELERATION = 0;
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

    this.move = function(x, y) {

        // Before moving, check if the player(this), is going to collide with the scene
        // if the player moves by this.x, this.y

            this.x += x;
            this.y += y;

    }

    // Moves in the opposite direction specified in lastMovement. Used for collisions.
    this.oppositeMove = function(lastMovement) {
        switch(lastMovement){
            case "left": this.move(15, 0); break;
            case "up": this.move(0, 5); break;
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

        gravity.enable();
    }

    this.draw = function() {
        context.beginPath();
        context.rect(this.x, this.y, this.w, this.h);
        context.fillStyle = '#000';
        context.fill();
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
            if(collisionTest(player1, scene[i])) {
                levelDataText.value += "Collision detected [f: " + frameNumber + "] : player 1 and " + scene[i].constructor.name +  " [" + i + "] " + scene[i].type + "\n\n";

                player1.oppositeMove(player1.lastMovement);
                gravity.disable();

                player1.collide = true;
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
        console.log("is " + x + ", " + y + " within " + scene[i].x + " and " + (scene[i].x + 42) + ", " + scene[i].y + " and " + (scene[i].y + 42) + "?");
        if(scene[i].x > x) {
            console.log("--------");
            console.log(scene[i].x + " is greater than " + x);
            console.log(scene[i].type);
            console.log("YES");
            break;
        }
    }
}

function groundCollision() {

    for(var i = 0, l = scene.length; i < l; i++){
        if(i > 0 && scene[i].collision == true) {
            if(collisionTest(player1, scene[i])) {
                levelDataText.value += "Collision detected [f: " + frameNumber + "] : player 1 and " + scene[i].constructor.name +  " [" + i + "] " + scene[i].type + "\n\n";
                player1.oppositeMove(player1.lastMovement);
                gravity.disable();
                player1.collide = true;
//                console.log("collision: " + player1.collide);
            } else {
//                if(tile below player is non collidable) {
//                    enable gravity
//                }
                player1.collide = false;
//                console.log("collision: " + player1.collide);

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

// ADD OBJECTS TO THE ENVIRONMENT

// To add something to the scene, you push it to the array
// for example: scene.push(player1);
var player1 = new Player();

player1.draw();
scene.push(player1);

var gravity = new Gravity([player1]);


// Add clouds
var cloud = [];
var cloudAnimations = [];

for(var i = 0; i < 6; i++) {
    cloud[i] = new Cloud(Math.floor(Math.random() * 1200));
    cloud[i].draw();
    cloudAnimations[i] = new Animator(cloud[i], "x", 1280,  Math.floor(Math.random() * 50000) + 20000);
}


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
    context.clearRect(0, 0, canvas.width, canvas.height);
    for(var i = 0, l = scene.length; i < l; i++){
        scene[i].draw();
    }

    //checkCollisions();
    groundCollision();
    drawClouds();
    gravity.apply(GRAVITATIONAL_ACCELERATION * (msDiff/1000));

    levelDataText.scrollTop = levelDataText.scrollHeight;

    // Move camera view with player


    // WAIT
    prevLoopTime = timeNow;
    requestAnimFrame(gameLoop);
    frameNumber++;
}
gameLoop();

