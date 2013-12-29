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
        for(var i = 1; i <= 15; i++) {
            // First loop goes through each row
            levelDataText.value += "\nRow " + i + "\n";

            for(var j = 0; j < levelData[i].length; j++) {
                // Second loop goes through each value in that row
                levelDataText.value += levelData[i][j] + " => " + this.numToTile(levelData[i][j]) + " || ";
            }
        }

    }

    // Converts the number in an array to its associated tile type
    this.numToTile = function(number) {
        var tiles = ["air", "grass", "dirt", "stone", "water", "lava", "brick"];
        return tiles[number];
    }

}

function Player(x, y, w, h) {
    // Setup initial variables
    this.x = x || 10;
    this.y = y || 620;
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

// To add something to the scene, you push it to the array
// for example: scene.push(player1);
var player1 = new Player();
player1.draw();
scene.push(player1);


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
    for(i = 0, l = scene.length; i < l; i++){
        scene[i].draw();
    }

    // WAIT
    prevLoopTime = timeNow;
    requestAnimFrame(gameLoop);
    frameNumber++;
}
gameLoop();

