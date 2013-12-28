var canvas = document.getElementById('gameCanvas');
var context = canvas.getContext('2d');

context.fillText("HTML 5 Canvas Text", 50, 50);

function Player(context) {
    // Setup initial variables
    this.x = 10;
    this.y = 620;

    this.move = function(x, y) {
        this.x += x;
        this.y += y;
    }

    context.beginPath();
    context.rect(this.x, this.y, 40, 90);
    context.fillStyle = '#000';
    context.fill();
}

var player1 = new Player(context);

window.addEventListener('keyDown',function(event){
    switch(event.keyCode){
        case 37: player1.move(-10, 0); break;
        case 38: player1.move(0, -10); break;
        case 39: player1.move(10, 0); break;
        case 40: player1.move(0, 10); break;
        default: return false;
    }
    event.preventDefault();
    console.log(player1.x);
    return true;
});