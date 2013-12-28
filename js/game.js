var canvas = document.getElementById('gameCanvas'),
    context = canvas.getContext('2d'),
    scene = [], // Contains the names of all the objects in the scene
    prevLoopTime = +new Date(),
    fpsMeter = document.querySelector('#fpsMeter');

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

window.addEventListener('keyDown',function(event){
    switch(event.keyCode){
        case 37: player1.move(-10, 0); break;
        case 38: player1.move(0, -10); break;
        case 39: player1.move(10, 0); break;
        case 40: player1.move(0, 10); break;
        default: return false;
    }
    event.preventDefault();
    return true;
});

var player1 = new Player();


// The loop goes through all the objects in the scene array, and asks them to redraw themselves

// To add something to the scene, you push it to the array
// for example: scene.push(player1);
