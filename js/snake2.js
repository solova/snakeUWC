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
    this.speed     = 64;
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
    while(this.tail.length > this.len){
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
Snake.prototype.boost = function(){
    var that = this;
    this.speed += 20;
    window.setTimeout(function(){that.speed -= 20}, 1000);
};

function Letter(x, y) {
    var alphabet = ['О', 'Н', 'А', 'І', 'И', 'Т', 'В', 'Р', 'Е', 'С', 'К', 'Д', 'У', 'Л', 'П', 'М', 'Я', 'З', 'Ь', 'Г', 'Б', 'Ч', 'Х', 'Й', 'Ц', 'Ю', 'Є', 'Ї', 'Ж', 'Ф', 'Ш', 'Щ'];
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

Sound.prototype.playrand = function(){
    var audioIndex = _.random(this.sounds.length - 1);
    this.sounds[audioIndex].play();
};


SnakeGame = new function () {

    //http://code.google.com/p/topheman-squares/source/browse/trunk/js/requestAnimFrame.js
    var requestAnimFrame = (function (callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();
    //

    var browser = navigator.userAgent.toLowerCase();
    var isMobile = (browser.indexOf("android") != -1) || (browser.indexOf("iphone") != -1) || (browser.indexOf("ipad") != -1);
    var canvasMargin = 10; //px
    var gameWidth = window.innerWidth - canvasMargin * 2;
    var gameHeight = window.innerHeight - canvasMargin * 2;



    var canvas;
    var context;

    var snake;
    var sound = new Sound();

    var state = {
        active: 0,
        degree: 0,
        scores: 0
    };

    var fps = [];
    var pressed_keys = [];

    var letters = [];
    setInterval(function(){
        var x = _.random(canvas.width - canvasMargin * 2) + canvasMargin;
        var y = _.random(canvas.height - canvasMargin * 2) + canvasMargin;
        letters.push(new Letter(x, y));
    }, 5000);

    function resizeFunction() {
        gameWidth = window.innerWidth - canvasMargin * 2;
        gameHeight = window.innerHeight - canvasMargin * 2;
        canvas.width = gameWidth;
        canvas.height = gameHeight;

        canvas.style.position = "absolute";
        canvas.style.left = canvasMargin + "px";
        canvas.style.top = canvasMargin + "px";
    }

    function update() {
        _.each(pressed_keys, function(key){
            switch(key){
                case 32:
                    snake.boost();
                    break;
                case 37:
                    state.degree -= Math.PI / 32;
                    break;
                case 39:
                    state.degree += Math.PI / 32;
                    break;
            }
        });

        if(state.degree > 2*Math.PI) state.degree -= 2*Math.PI;
        if(state.degree < 2*Math.PI) state.degree += 2*Math.PI;
    };

    setInterval(update, 16);

    function eat(){
        state.scores++;

        sound.playrand();
        snake.len++;
        snake.speed++;
    }

    function animate() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        //console.log("animate");

        var time = (new Date()).getTime();
        var timeshift = time - snake.updated;

        fps.push(1000 / timeshift);
        while(fps.length > 100) fps.shift();
        var fps_sum = _.reduce(fps, function(memo, num){ return memo + num; }, 0);

        var dx = snake.speed * timeshift * Math.cos(state.degree) / 512;
        var dy = snake.speed * timeshift * Math.sin(state.degree) / 512;

        snake.move(dx, dy);
        snake.draw(context);
        snake.updated = time;

        var remove = [];
        _.each(letters, function(letter,index){
            if (letter.distanceTo(snake) < 10){
                console.log(letter.value);
                remove.push(letter);
                eat();
            }
            letter.draw(context);
        }, this);
        letters = _.difference(letters, remove);

        //if (activeState) {
            scoreText = "Score: <span>" + Math.round(state.scores) + "</span>";
            scoreText += " FPS: <span>" + Math.round(fps_sum/fps.length) + "</span>";
            statusBlock.innerHTML = scoreText;
        //}

        requestAnimFrame(function () {
            animate();
        });
    }

    this.init = function () {
        console.log("INIT");
        canvas = document.getElementById("snake-board");
        statusBlock = document.getElementById("status");
        // messageBlock = document.getElementById("message");
        // titleBlock = document.getElementById("title");
        // startBtnBlock = document.getElementById("startButton");
        if (canvas && canvas.getContext) {
            context = canvas.getContext("2d");
            // var addEventListenerFn = function (N, M, O) {
            //     document.addEventListener(N, M, O)
            // };
            // addEventListenerFn("mousemove", c, false);
            // addEventListenerFn("mousedown", l, false);
            // addEventListenerFn("mouseup", I, false);
            // canvas.addEventListener("touchstart", i, false);
            // addEventListenerFn("touchmove", q, false);
            // addEventListenerFn("touchend", v, false);
            window.addEventListener("resize", resizeFunction, false);
            window.addEventListener("keydown",function(event){
                console.log("KD", pressed_keys, _.indexOf(pressed_keys, event.keyCode));
                if (_.indexOf(pressed_keys, event.keyCode) === -1){
                    pressed_keys.push(event.keyCode);
                }
            }, false);
            window.addEventListener("keyup",function(event){
                console.log("KU");
                pressed_keys = _.without(pressed_keys, event.keyCode);
            }, false);
            
            //startBtnBlock.addEventListener("click", j, false);
            //playerObject = new Player();
            snake = new Snake();
            resizeFunction();

            //TODO: replace to request animation frame
            //setInterval(animate, isMobile?500:200);
            animate();
        }
    };

    function j(L) {
        if (activeState == false) {
            activeState = true;
            w = [];
            y = [];
            C = 0;
            E = 1;
            playerObject.trail = [];
            playerObject.p.x = freeWidth;
            playerObject.p.y = freeHeight;
            playerObject.boost = 0;
            messageBlock.style.display = "none";
            statusBlock.style.display = "block";
            startTime = new Date().getTime()
        }
    }
    function gameOver() {
        activeState = false;
        messageBlock.style.display = "block";
        titleBlock.innerHTML = "Game Over! (" + Math.round(C) + " points)"
    }
    function c(event) {
        freeWidth = event.clientX - (window.innerWidth - gameWidth) * 0.5 - 10;
        freeHeight = event.clientY - (window.innerHeight - gameHeight) * 0.5 - 10
    }
    function l(event) {
        isMouseDown = true
    }
    function I(event) {
        isMouseDown = false
    }
    function i(event) {
        if (event.touches.length == 1) {
            event.preventDefault();
            freeWidth = event.touches[0].pageX - (window.innerWidth - gameWidth) * 0.5;
            freeHeight = event.touches[0].pageY - (window.innerHeight - gameHeight) * 0.5;
            isMouseDown = true
        }
    }
    function q(event) {
        if (event.touches.length == 1) {
            event.preventDefault();
            freeWidth = event.touches[0].pageX - (window.innerWidth - gameWidth) * 0.5 - 20;
            freeHeight = event.touches[0].pageY - (window.innerHeight - gameHeight) * 0.5 - 20
        }
    }
    function v(event) {
        isMouseDown = false
    }

    function g(O, M, L) {
        var N = 10 + (Math.random() * 15);
        while (--N >= 0) {
            particleObject = new Particle();
            particleObject.p.x = O.x + (Math.sin(N) * M);
            particleObject.p.y = O.y + (Math.cos(N) * M);
            particleObject.velocity = {
                x: -4 + Math.random() * 8,
                y: -4 + Math.random() * 8
            };
            particleObject.alpha = 1;
            H.push(particleObject)
        }
    }
    
    function F(L) {
        if (Math.random() > 0.5) {
            L.p.x = Math.random() * gameWidth;
            L.p.y = -20
        } else {
            L.p.x = gameWidth + 20;
            L.p.y = (-gameHeight * 0.2) + (Math.random() * gameHeight * 1.2)
        }
        return L
    }
};

