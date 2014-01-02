var canvas = document.getElementById('gameCanvas'),
    context = canvas.getContext('2d'),
    scene = [], // Contains the names of all the objects in the scene
    prevLoopTime = +new Date(),
    fpsMeter = document.querySelector('#fpsMeter'),
    levelDataText = document.querySelector('#levelTxt');

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
    this.y = y || 630;
    this.w = w || 42;
    this.h = h || 42;

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
        }

        if(type == "lava") {
            context.beginPath();
            context.rect(this.x, this.y, this.w, this.h);
            context.fillStyle = '#d27922';
            context.fill();
        }
    }
}

function Player(x, y, w, h) {
    // Setup initial variables
    this.x = x || 10;
    this.y = y || 540;
    this.w = w || 40;
    this.h = h || 90;

    this.move = function(x, y) {
        this.x += x;
        this.y += y;
    }

    this.resize = function(w, h) {
        this.w = w;
        this.h = h;
    }

    this.draw = function() {
        context.beginPath();
        context.rect(this.x, this.y, this.w, this.h);
        context.fillStyle = '#000';
        context.fill();
    }

}

function Wall(x, y, w, h) {
    // Setup initial variables
    this.x = x || 100;
    this.y = y || 480;
    this.w = w || 40;
    this.h = h || 150;

    this.move = function(x, y) {
        this.x += x;
        this.y += y;
    }

    this.resize = function(w, h) {
        this.w = w;
        this.h = h;
    }

    this.draw = function() {
        context.beginPath();
        context.rect(this.x, this.y, this.w, this.h);
        context.fillStyle = '#666666';
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
        case 37: player1.move(-7, 0); break;
        case 38: player1.move(0, -50); break;
        case 39: player1.move(7, 0); break;
        case 40: player1.move(0, 50); break;
        default: return false;
    }
    event.preventDefault();
    return true;
});



// ADD OBJECTS TO THE ENVIRONMENT

// To add something to the scene, you push it to the array
// for example: scene.push(player1);
var player1 = new Player();
var wall1 = new Wall();


player1.draw();
scene.push(player1);

wall1.draw();
scene.push(wall1);

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


   for(var j = 0; j < cloudAnimations.length; j++) {
       cloudAnimations[j].update();

       // If the clouds are off-screen, reset them to start again
       if(cloudAnimations[j].finished == true) {
//           cloud[j].x = 0 - cloud[j].w;
//           cloudAnimations[j].finished = false;
//           cloudAnimations[j].startTime = Date.now();
//           cloudAnimations[j].startValue = 0 - cloud[j].w;
//           cloudAnimations[j].valueRange = 1280;

           cloud[j] = new Cloud();
           cloudAnimations[j] = new Animator(cloud[j], "x", 1280, Math.floor(Math.random() * 50000) + 20000);

       }

   }

    if(collisionTest(player1, wall1)) {
        levelDataText.value += "Collision detected [f: " + frameNumber + "] : player 1! \n\n";
    }

    levelDataText.scrollTop = levelDataText.scrollHeight;


    // WAIT
    prevLoopTime = timeNow;
    requestAnimFrame(gameLoop);
    frameNumber++;
}
gameLoop();

