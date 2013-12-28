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