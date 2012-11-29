SnakeGame = (function (_) {

    //http://code.google.com/p/topheman-squares/source/browse/trunk/js/requestAnimFrame.js
    var requestAnimFrame = (function (callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();
    //

    var browser = navigator.userAgent.toLowerCase();
    var isMobile = (browser.indexOf("android") !== -1) || (browser.indexOf("iphone") !== -1) || (browser.indexOf("ipad") !== -1);
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

    var statisticsBlock;
    var wordsBlock;
    var lettersBlock;

    var fps = [];
    var pressed_keys = [];
    var words = [];
    var chars = [];

    var KEY_SPACE = 32;
    var KEY_LEFT  = 37;
    var KEY_UP    = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;

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

    function checkkeys(timeshift) {
        if (pressed_keys.length > 0){
            _.each(pressed_keys, function(key){
                switch(key){
                    case KEY_SPACE:
                        snake.boost();
                        break;
                    case KEY_LEFT:
                        state.degree -= Math.PI * timeshift/500;
                        while(state.degree < 2*Math.PI) {
                            state.degree += 2*Math.PI;
                        }
                        break;
                    case KEY_RIGHT:
                        state.degree += Math.PI * timeshift/500;
                        while(state.degree > 2*Math.PI) {
                            state.degree -= 2*Math.PI;
                        }
                        break;
                }
            });
        }
    }

    //setInterval(update, 16);

    function eat(){
        state.scores++;

        sound.getrand().play();
        snake.len++;
        snake.speed++;
    }

    function checkWords() {
        var tail, first, word;
        if (chars.length > 1) {
            for (var n = Math.min(chars.length, 8); n >= 2; n--) {
                tail  = _.last(chars, n);
                first = tail[0];
                word  = tail.join('');
                if ((!_.isUndefined(window.dict[first])) && _.indexOf(window.dict[first], word, true) >= 0) {
                    words.push(word);
                    state.scores += 10 * (word.length);
                    chars = _.initial(chars, n);
                    return;
                }
            }
        }
    }

    function animate() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        //console.log("animate");

        var time = (new Date()).getTime();
        var timeshift = time - snake.updated;

        checkkeys(timeshift);

        fps.push(1000 / timeshift);
        while(fps.length > 100) {
            fps.shift();
        }

        var fps_sum = _.reduce(fps, function(memo, num){ return memo + num; }, 0);

        var dx = snake.speed * timeshift * Math.cos(state.degree) / 150;
        var dy = snake.speed * timeshift * Math.sin(state.degree) / 150;

        snake.move(dx, dy);
        snake.draw(context);
        snake.updated = time;

        var remove = [];
        _.each(letters, function(letter,index){
            if (letter.distanceTo(snake) < 10){
                chars.push(letter.value);
                eat();
                checkWords();
                remove.push(letter);
            }
            letter.draw(context);
        }, this);
        letters = _.difference(letters, remove);

        var scoreText = "Score: <span>" + Math.round(state.scores) + "</span>";
        scoreText += " Speed: <span>" + Math.round(snake.speed) + "</span>";
        scoreText += " FPS: <span>" + Math.round(fps_sum/fps.length) + "</span>";
        scoreText += " Len: <span>" + Math.round(snake.len) + "</span>";
        statisticsBlock.innerHTML = scoreText;

        if (chars.length > 0){
            lettersBlock.innerHTML = '<span class="badge">' + chars.join('</span><span class="badge">') + '</span>';
        }else{
            lettersBlock.innerHTML = '';
        }

        if (words.length > 0){
            wordsBlock.innerHTML = '<span class="badge">' + words.join('</span><span class="badge">') + '</span>';
        }else{
            wordsBlock.innerHTML = '';
        }

        requestAnimFrame(function () {
            animate();
        });
    }

    this.init = function () {
        window.console.log("INIT");
        canvas          = document.getElementById("snake-board");
        statisticsBlock = document.getElementById("statistics");
        wordsBlock      = document.getElementById("words");
        lettersBlock    = document.getElementById("letters");

        if (canvas && canvas.getContext) {
            context = canvas.getContext("2d");
            window.addEventListener("resize", resizeFunction, false);
            window.addEventListener("keydown",function(event){
                if (_.indexOf(pressed_keys, event.keyCode) === -1){
                    pressed_keys.push(event.keyCode);
                }
            }, false);
            window.addEventListener("keyup",function(event){
                pressed_keys = _.without(pressed_keys, event.keyCode);
            }, false);
            
            window.addEventListener("touchmove",function(event){
                pressed_keys = [];
                var middle = window.innerWidth / 2;
                for (var i = 0; i< event.touches.length; i++){
                    var keyCode = (event.touches[i].pageX < middle)?KEY_LEFT:KEY_RIGHT;
                    if (_.indexOf(pressed_keys, keyCode) === -1){
                        pressed_keys.push(event.keyCode);
                    }
                }
            }, false);

            window.addEventListener("touchend",function(event){
                pressed_keys = [];
            }, false);

            snake = new Snake();
            resizeFunction();

            animate();
        }
    };

    return this;

    // function j(L) {
    //     if (activeState == false) {
    //         activeState = true;
    //         w = [];
    //         y = [];
    //         C = 0;
    //         E = 1;
    //         playerObject.trail = [];
    //         playerObject.p.x = freeWidth;
    //         playerObject.p.y = freeHeight;
    //         playerObject.boost = 0;
    //         messageBlock.style.display = "none";
    //         statisticsBlock.style.display = "block";
    //         startTime = new Date().getTime()
    //     }
    // }
    // function gameOver() {
    //     activeState = false;
    //     messageBlock.style.display = "block";
    //     titleBlock.innerHTML = "Game Over! (" + Math.round(C) + " points)"
    // }
    // function c(event) {
    //     freeWidth = event.clientX - (window.innerWidth - gameWidth) * 0.5 - 10;
    //     freeHeight = event.clientY - (window.innerHeight - gameHeight) * 0.5 - 10
    // }
    // function l(event) {
    //     isMouseDown = true
    // }
    // function I(event) {
    //     isMouseDown = false
    // }
    // function i(event) {
    //     if (event.touches.length == 1) {
    //         event.preventDefault();
    //         freeWidth = event.touches[0].pageX - (window.innerWidth - gameWidth) * 0.5;
    //         freeHeight = event.touches[0].pageY - (window.innerHeight - gameHeight) * 0.5;
    //         isMouseDown = true
    //     }
    // }
    // function q(event) {
    //     if (event.touches.length == 1) {
    //         event.preventDefault();
    //         freeWidth = event.touches[0].pageX - (window.innerWidth - gameWidth) * 0.5 - 20;
    //         freeHeight = event.touches[0].pageY - (window.innerHeight - gameHeight) * 0.5 - 20
    //     }
    // }
    // function v(event) {
    //     isMouseDown = false
    // }

    // function g(O, M, L) {
    //     var N = 10 + (Math.random() * 15);
    //     while (--N >= 0) {
    //         particleObject = new Particle();
    //         particleObject.p.x = O.x + (Math.sin(N) * M);
    //         particleObject.p.y = O.y + (Math.cos(N) * M);
    //         particleObject.velocity = {
    //             x: -4 + Math.random() * 8,
    //             y: -4 + Math.random() * 8
    //         };
    //         particleObject.alpha = 1;
    //         H.push(particleObject)
    //     }
    // }
    
    // function F(L) {
    //     if (Math.random() > 0.5) {
    //         L.p.x = Math.random() * gameWidth;
    //         L.p.y = -20
    //     } else {
    //         L.p.x = gameWidth + 20;
    //         L.p.y = (-gameHeight * 0.2) + (Math.random() * gameHeight * 1.2)
    //     }
    //     return L
    // }
})(_);

