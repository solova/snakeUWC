// function Stack(){
//     this.items = [];
// }
// Stack.prototype.add = function(value){
//     this.items.push(add);
// }
// Stack.prototype.shift = function(){
//     this.items.
// }

function Point(x, y) {
    this.position = {
        x: x,
        y: y
    };
}
Point.prototype.distanceTo = function (obj) {
    var x = obj.position.x - this.position.x;
    var y = obj.position.y - this.position.y;
    return Math.sqrt(x * x + y * y)
};

function Snake() {
    this.position  = { x: 50, y: 50};
    this.tail      = [];
    this.color     = 'blue';
    this.len       = 10;
    this.speed     = 30;
    this.updated   =  (new Date()).getTime();
};
Snake.prototype = new Point();
Snake.prototype.move = function(dx, dy){
    var pos = this.position;
    this.tail.push({
        x : this.position.x,
        y : this.position.y
    });
    this.position = { x : this.position.x + dx, y : this.position.y + dy };
    while(this.tail.length > this.len*4){
        this.tail.shift();
    }
};

Snake.prototype.draw = function(context){
    context.beginPath();
    context.moveTo(this.position.x, this.position.y);

    for (var i = this.tail.length - 1; i >= 0; i--) {
        context.lineTo(this.tail[i].x, this.tail[i].y);
    }

    context.lineWidth = 7;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = this.color;
    context.stroke();
};
Snake.prototype.boost = _.throttle(function(){
    var that = this;
    this.speed += 30;
    this.boostFn = window.setTimeout(function(){that.speed -= 30}, 500);
}, 500);

function Letter(x, y) {
    var alphabet = ['О', 'Н', 'А', 'І', 'И', 'Т', 'В', 'Р', 'Е', 'С', 'К', 'Д', 'У', 'Л', 'П', 'М', 'Я', 'З', 'Ь', 'Г', 'Б', 'Ч', 'Х', 'Й', 'Ц', 'Ю', 'Є', 'Ї', 'Ж', 'Ф', 'Ш', 'Щ'];
    
    //8617, 8646, 8630, 8631
    var special = ['↩','⇆', '↶', '↷','><'];

    var colors = ['Red', 'Blue', 'DarkBlue', 'Orange', 'Purple', 'Brown', 'Maroon', 'Green'];

    var colorIndex  = _.random(colors.length - 1);

    if (Math.random() > 0.9){
        this.value = special[_.random(special.length-1)];
    }else{
        var letterIndex = _.random(alphabet.length - 1);
        letterIndex = Math.floor(letterIndex * Math.random());
        this.value = alphabet[letterIndex];
    }

    this.color = colors[colorIndex];
    this.position = {
        x: x,
        y: y
    };

}

Letter.prototype = new Point();
Letter.prototype.draw = function(context){
    context.fillStyle    = this.color;
    context.font         = "bold 16px Arial";
    context.textBaseline = 'middle';
    context.textAlign    = 'center';
    context.fillText(this.value, this.position.x, this.position.y);
};

function Sound(){
    var audio = document.createElement('audio');
    var ext;
    if (!!(audio.canPlayType && audio.canPlayType('audio/mpeg;').replace(/no/, ''))){
        ext = 'mp3';
    }else{
        ext = 'ogg';
    }
     
    //Pack: Eating Apple Crunches by Koops
    this.sounds = [];
    for (var i = 1; i<=18; i++) {
        this.sounds.push(new Audio("sounds/sound" + i + "." + ext));
    }
}

Sound.prototype.getrand = function(){
    var audioIndex = _.random(this.sounds.length - 1);
    return this.sounds[audioIndex];
};