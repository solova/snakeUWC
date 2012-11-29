var snakegame = (function () {

    var canvas = null;

    //http://code.google.com/p/topheman-squares/source/browse/trunk/js/requestAnimFrame.js
    var requestAnimFrame = (function (callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();
    //

    //клавіші, що обробляє документ
    var keys = {
        32: 'space',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    var snake = {};

    //можливі кольори літер
    var colors = ['Red', 'Blue', 'DarkBlue', 'Orange', 'Purple', 'Brown', 'Maroon', 'Green'];

    //underscore-шаблони
    var infoTemplate = '<h3 id="snake-info-scores"><%=scores%> (рекорд &mdash; <%=record%>)</h3>'
                     + '<p>Змія має довжину <%=len%></p>'
                     + '<p>Змія рухається зі швидкістю <span id="snake-info-speed"><%=speed%></span> у.о.</p>'
                     + '<p>Змія рухається під кутом <span id="snake-info-degree"><%=degree%></span> &deg;</p>'
                     + '<p><%=fps%> кадрів/с</p>';
    var queueElement = '<span class="badge badge-info"><%=letter%></span>';
    var wordElement  = '<span class="label label-success"><%=word%></span>';

    function mp3_support(){
        var a = document.createElement('audio');
        return !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
    }
    var ext = 'ogg';
    if (mp3_support()) ext = 'mp3'; 

    //Pack: Eating Apple Crunches by Koops
    var sounds = [];
    for (var i = 1; i<=18; i++) {
        sounds.push(new Audio("sounds/sound" + i + "." + ext));
    }

    var letters   = [];
    var userwords = [];
    var queue     = [];

    //літери алфавіту, за частотою вживання
    var alphabet = ['О', 'Н', 'А', 'І', 'И', 'Т', 'В', 'Р', 'Е', 'С', 'К', 'Д', 'У', 'Л', 'П', 'М', 'Я', 'З', 'Ь', 'Г', 'Б', 'Ч', 'Х', 'Й', 'Ц', 'Ю', 'Є', 'Ї', 'Ж', 'Ф', 'Ш', 'Щ'];
    var special = ['↩','⇆', '↶', '↷','><'];
    
    var angle = 0;

    /**
     * @return bool
     */
    function is_intersect(ax1,ay1,ax2,ay2,bx1,by1,bx2,by2){
       var v1 = (bx2-bx1)*(ay1-by1)-(by2-by1)*(ax1-bx1);
       var v2 = (bx2-bx1)*(ay2-by1)-(by2-by1)*(ax2-bx1);
       var v3 = (ax2-ax1)*(by1-ay1)-(ay2-ay1)*(bx1-ax1);
       var v4 = (ax2-ax1)*(by2-ay1)-(ay2-ay1)*(bx2-ax1);
       return (v1*v2<0) && (v3*v4<0);
    }

    /**
     * функція перевірки обїектів на зіткнення
       @return bool
     */
    var hittest = function (object1, object2) {
        return ((Math.abs(object1.x - object2.x) < 10) && (Math.abs(object1.y - object2.y) < 10));
    };

    /**
     * функція отримання поточного рекорду
       @return int
     */
    var getRecord = function(){
        return localStorage.getItem("record") || 0;
    };

    var specialfn = {
        '↩': function(){
            if (queue.length >= 1){
                queue.pop();
            }
        },
        '⇆': function(){
            if (queue.length >= 2){
                var l1 = [queue.pop()];
                var l2 = [queue.pop()];
                queue.push(l1);
                queue.push(l2);
            }
        },
        '↶': function(){
            move(-Math.PI/2)
        },
        '↷': function(){
            move(Math.PI/2)
        },
        '><': function(){
            snake.len = Math.max(Math.ceil(snake.len*0.8), 10);
        }
    };

    /**
     * функція виведення статистичної інформації, під час гри
       @return int
     */
    var info = function () {
        var values    = _.pick(snake, 'scores', 'degree', 'speed', 'len');
        while (values.degree < 0) {
            values.degree += 2 * Math.PI;
        }
        values.degree = (360 - values.degree * 180 / Math.PI).toFixed(2);
        values.record = getRecord();
        
        var thisLoop = new Date().getTime(); 
        
        fps.time += (thisLoop - fps.last);
        fps.last  = thisLoop;
        fps.frames++;

        if (fps.time > 1000){
            fps.value = Math.ceil(fps.time / fps.frames);
            fps.frames = 0;
            fps.time = 0;
        }

        values.fps = fps.value;

        document.getElementById("snake-info").innerHTML = _.template(infoTemplate, values);
        document.getElementById("snake-info").style.display = "block";

        document.getElementById("snake-letters").innerHTML = "";
        if (queue.length > 0) {
            var elements = [];
            _.each(queue, function (item) {
                elements.push(_.template(queueElement, {
                    letter: item
                }));
            }, this);
            document.getElementById("snake-letters").innerHTML = elements.join('');
            document.getElementById("snake-letters").style.display = "block";
        }

        document.getElementById("snake-words").innerHTML = "";
        if (userwords.length > 0) {
            var snakewords = [];
            _.each(userwords, function (item) {
                snakewords.push(_.template(wordElement, {
                    word: item
                }));
            }, this);
            document.getElementById("snake-words").innerHTML = snakewords.join('');
            document.getElementById("snake-words").style.display = "block";
        }
    };

    var addRandomLetterFunc = null; //handle для setInterval
    /**
     * функція додавання літери на гральне поле
       @TODO: refactoring
     */
    var addRandomLetter = function () {

        var preset = _.union(alphabet, special);

        var letterIndex = _.random(preset.length - 1);
        var colorIndex  = _.random(colors.length - 1);
        
        if (letterIndex < alphabet.length){ //not special
            letterIndex = Math.floor(letterIndex * Math.random()); // збільшуємо частоту літер, що в початку масиву
        }

        letters.push({
            value: preset[letterIndex],
            x: Math.random() * snake.field.width * 0.95 + snake.field.width * 0.025,
            y: Math.random() * snake.field.height * 0.95 + snake.field.height * 0.025,
            color: colors[colorIndex]
        });
    };

    /**
     * функція первірки наявності слова у словнику та коректування списку слів, що зібрав гравець
     */
    var checkWords = function () {
        if (queue.length > 1) {
            for (l = Math.min(queue.length, 5); l >= 2; l--) {
                var tail = _.last(queue, l);
                var first = tail[0];
                var word = tail.join('');
                if ((!_.isUndefined(window.dict[first])) && _.indexOf(window.dict[first], word, true) >= 0) {
                    userwords.push(word);
                    snake.scores += 10 * (word.length);
                    queue = _.initial(queue, l);
                    return;
                }
            }

        }
    };

    /**
     * функція закінчення гри
     */
    var gameover = function () {
        snake.status = 0;
        alert("Гру закінчено. Закрий це повідомлення та натисни F5 щоб зіграти знову. ");
        localStorage.setItem("record", Math.max(snake.scores, getRecord()));
    };

    /**
     * функція оновлення координат
     */
    var update = function () {
        var time = (new Date()).getTime();
        //if ((time - snake.updated) > 1000 / snake.speed) {
            var head = snake.segments[snake.segments.length - 1];
            var timeshift = time - snake.updated;

            snake.direction.x = snake.speed * timeshift * Math.cos(snake.degree) / 150;
            snake.direction.y = snake.speed * timeshift * Math.sin(snake.degree) / 150;

            var new_segment = {
                x: head.x + snake.direction.x,
                y: head.y + snake.direction.y
            };

            if ((new_segment.x < 0) || (new_segment.x > snake.field.width) || (new_segment.y > snake.field.height) || (new_segment.y < 0)) {
                // console.log("out of field");
                gameover();
                return;
            }

            var remove = [];
            _.each(letters, function (letter, index) {
                if (hittest(letter, new_segment)) {
                    remove.push(index);
                }
            });

            if (!_.isEmpty(remove)) {
                eatLetters(remove);
            }

            snake.segments.push(new_segment);

            while (snake.segments.length > snake.len) {
                snake.segments.shift();
            }

            if (snake.segments.length > 3){
                var tail = _.last(snake.segments, 2);
                for (var i = 0; i < snake.segments.length - 2; i++) {
                    if (is_intersect(tail[0].x,tail[0].y,tail[1].x,tail[1].y,snake.segments[i].x,snake.segments[i].y,snake.segments[i+1].x,snake.segments[i+1].y)){
                        // console.log("selfkill");
                        gameover();
                    }
                }
            }

            snake.updated = time;
            info();
        //}
    };

    // console.time("animate");

    var fps = {
        last   : new Date().getTime(),
        time   : 0,
        frames : 0,
        value  : 0
    }

    /**
     * loop-функція
     */
    var animate = function () {
        // console.timeEnd("animate");
        // console.time("animate");

        if (snake.status === 0) return;
        var context = canvas.getContext("2d");
        update();
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawSnake(context);
        drawLetters(context);


        requestAnimFrame(function () {
            animate();
        });
    };

    /**
     * функція додавання літери до з'їдених
     */
    var eatLetters = function (indexes) {
        var changes = false;
        _.each(indexes, function (index) {
            snake.color = letters[index].color;
            sounds[_.random(sounds.length-1)].play();
            snake.scores++;
            snake.speed++;
            snake.len++;
            changes = true;
            
            if (_.indexOf(special, letters[index].value) !== -1){
                specialfn[letters[index].value]();
            }else{
                queue.push(letters[index].value);
                if (queue.size>20) {
                    gameover();
                }
            }

            letters.splice(index, 1);
        }, this);

        checkWords();

    };

    /**
     * функція відмальовки літер
     */
    var drawLetters = function (context) {
        _.each(letters, function (letter, index) {
            context.fillStyle    = letter.color;
            context.font         = "bold 16px Arial";
            context.textBaseline = 'middle';
            context.textAlign    = 'center';
            context.fillText(letter.value, letter.x, letter.y);
        }, this);
    };

    /**
     * функція відмальовки літер
     */
    var drawSnake = function (context) {
        var segments = snake.segments;

        context.beginPath();
        context.moveTo(segments[0].x, segments[0].y);

        for (var i = 1; i < segments.length; i++) {
            var segment = segments[i];
            context.lineTo(segment.x, segment.y);
        }

        context.lineWidth = 7;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = snake.color;
        context.stroke();
    };

    /**
     * функція збросу налаштунок
     */
    var reset = function () {

        letters = [];
        userwords = [];
        queue = [];

        _.extend(snake, {
            active: 0,
            color: 'blue',
            degree: 0,
            direction: { x: 1, y: 0 },
            len: 50,
            scores: 0,
            segments: [{ x: canvas.width / 2, y: canvas.height / 2}],
            speed: 20,
            updated: (new Date()).getTime()
        });

        

        var initLetters = 5;
        while (initLetters--) {
            addRandomLetter();
        }

        $("#snake-words").empty().hide();
        $("#snake-letters").empty().hide();
        $("#snake-info").empty().hide();

        if(addRandomLetterFunc){
            window.clearInterval(addRandomLetterFunc);
        }
        addRandomLetterFunc = window.setInterval(addRandomLetter, 4000);
    };

    /**
     * функція початку гри
     */
    var start = function () {

        reset();
        snake.status = 1;

        animate();
    };

    /**
     * функція прискорення
     */
    var boost = _.throttle(function(){
        snake.speed += 50;
        window.setTimeout(function(){snake.speed-=50;}, 1000);
    }, 1000);

    var move = function(value){
        snake.degree += value;
        if (snake.degree < -2 * Math.PI) { snake.degree += 2 * Math.PI; }
        else if (snake.degree > 2 * Math.PI) { snake.degree -= 2 * Math.PI; }
    };

    window.setInterval(function(){
        if (angle) {
            move(angle);
        }
    }, 25);

    var events = {
        'keydown': function (event) {
            if (typeof (keys[event.keyCode]) !== 'undefined') {
                event.preventDefault(); //disable scrolling
                switch(keys[event.keyCode]){
                    case 'down':
                    case 'right':
                        angle = Math.PI / 18;
                        break;
                    case 'up':
                    case 'left':
                        angle = -Math.PI / 18;
                        break;
                    case 'space':
                        boost();
                        break;
                }
            }
        },
        'keyup' : function(){
            angle = 0;
        },
        'touchstart': function(event){
            var middle = snake.field.width / 2;
            angle = (event.changedTouches[0].pageX < middle) ? (-Math.PI/18):(Math.PI/18);
        },
        'touchend' : function(event){
            angle = 0;
        }
    };

    /**
     * @constructor
     */
    return function (elem) {

        canvas = document.getElementById(elem);


        window.addEventListener('resize', resizeCanvas, false);

        function resizeCanvas() {
            canvas.width = window.innerWidth - 10 * 2; //minus margins
            canvas.height = window.innerHeight - 10 * 2; //minus margins

            _.extend(snake, {
                field: {
                    width: canvas.width,
                    height: canvas.height
                }
            });
        }
        resizeCanvas();
        

        for (var e in events) {
            document.addEventListener(e, events[e], false);
        }
        //document.getElementById("help").addEventListener("close", start);
        $("#splash").bind("hidden", start);

        var exports = {};

        return exports;
    };
})();