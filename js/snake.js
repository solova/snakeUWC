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
    var infoTemplate = '<h3 id="snake-info-scores"><%=scores%> (рекорд &mdash; <%=record%>)</h3>' + '<p>Змія рухається зі швидкістю <span id="snake-info-speed"><%=speed%></span> у.о.</p>' + '<p>Змія рухається під кутом <span id="snake-info-degree"><%=degree%></span> &deg;</p>';
    var queueElement = '<span class="badge badge-info"><%=letter%></span>';
    var wordElement  = '<span class="label label-success"><%=word%></span>';

    var letters   = [];
    var userwords = [];
    var queue     = [];

    //літери алфавіту, за частотою вживання
    var alphabet = ['О', 'Н', 'А', 'І', 'И', 'Т', 'В', 'Р', 'Е', 'С', 'К', 'Д', 'У', 'Л', 'П', 'М', 'Я', 'З', 'Ь', 'Г', 'Б', 'Ч', 'Х', 'Й', 'Ц', 'Ю', 'Є', 'Ї', 'Ж', 'Ф', 'Ш', 'Щ'];
    var autoaction = null;

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

    /**
     * функція виведення статистичної інформації, під час гри
       @return int
     */
    var info = function () {
        var values    = _.pick(snake, 'scores', 'degree', 'speed');
        while (values.degree < 0) {
            values.degree += 2 * Math.PI;
        }
        values.degree = (360 - values.degree * 180 / Math.PI).toFixed(2);
        values.record = getRecord();
        $("#snake-info").html(_.template(infoTemplate, values)).show();

        $("#snake-letters").empty();
        if (queue.length > 0) {
            var elements = [];
            _.each(queue, function (item) {
                elements.push(_.template(queueElement, {
                    letter: item
                }));
            }, this);
            $("#snake-letters").append(elements).slideDown();
        }

        $("#snake-words").empty();
        if (userwords.length > 0) {
            var snakewords = [];
            _.each(userwords, function (item) {
                snakewords.push(_.template(wordElement, {
                    word: item
                }));
            }, this);
            $("#snake-words").append(snakewords).slideDown();

        }
    };

    var addRandomLetterFunc = null; //handle для setInterval
    /**
     * функція додавання літери на гральне поле
     */
    var addRandomLetter = function () {

        var letterIndex = _.random(alphabet.length - 1);
        var colorIndex = _.random(colors.length - 1);

        letterIndex = Math.floor(letterIndex * Math.random()); // збільшуємо частоту літер, що в початку масиву

        letters.push({
            value: alphabet[letterIndex],
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
        if ((time - snake.updated) > 1000 / snake.speed) {
            var head = snake.segments[snake.segments.length - 1];

            snake.direction.x = Math.cos(snake.degree) * snake.speed / 20;
            snake.direction.y = Math.sin(snake.degree) * snake.speed / 20;
            var new_segment = {
                x: head.x + snake.direction.x,
                y: head.y + snake.direction.y
            };

            if ((new_segment.x < 0) || (new_segment.x > snake.field.width) || (new_segment.y > snake.field.height) || (new_segment.y < 0)) {
                gameover();
                return;
            }
            var touches = 0;
            _.each(snake.segments, function(segment){
                if (hittest(segment, new_segment)) {
                    touches++;
                }
            }, this);
            if (touches > 7){ //selfkill
                gameover();
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

            snake.updated = time;
            info();
        }
    };

    /**
     * loop-функція
     */
    var animate = function () {
        if (snake.status === 0) return;
        var context = canvas.getContext("2d");
        update();
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawSnake(context);
        drawLetters(context);


        requestAnimFrame(function () {

            if (autoaction){
                moves[autoaction](Math.PI/50);
            }
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
            queue.push(letters[index].value);
            if (queue.size>20) {
                gameover();
            }
            snake.scores++;
            snake.speed++;
            snake.len += 5;
            changes = true;
            letters.splice(index, 1);
        }, this);

        checkWords();

    };

    /**
     * функція відмальовки літер
     */
    var drawLetters = function (context) {
        _.each(letters, function (letter, index) {
            context.fillStyle = letter.color;
            context.font = "bold 16px Arial";
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
            len: 5,
            scores: 0,
            segments: [{ x: canvas.width / 2, y: canvas.height / 2}],
            speed: 50,
            updated: 0
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

    var moves = {
        left : function(value){
            snake.degree -= value;
            if (snake.degree < -2 * Math.PI) { snake.degree = 0; }
            $("#dval").text(snake.degree);
        },
        right : function(value){
            snake.degree += value;
            if (snake.degree > 2 * Math.PI) { snake.degree = 0; }
            $("#dval").text(snake.degree);
        }
    };

    KeyboardController({
        32: function() { boost(); },
        37: function() { moves.left(Math.PI / 30) },
        38: function() { moves.left(Math.PI / 30) },
        39: function() { moves.right(Math.PI / 30) },
        40: function() { moves.right(Math.PI / 30) }
    }, 10);

    var events = {
        // 'keydown': _.throttle(function (event) {
        //     if (typeof (keys[event.keyCode]) !== 'undefined') {
        //         event.preventDefault(); //disable scrolling

        //         switch(keys[event.keyCode]){
        //             case 'down':
        //             case 'right':
        //                 moves.right(Math.PI / 15);
        //                 break;
        //             case 'up':
        //             case 'left':
        //                 moves.left(Math.PI / 15);
        //                 break;
        //             case 'space':
        //                 boost();
        //                 break;
        //         }
        //     }
        // }, 100),
        'touchstart': function(event){
            var middle = $(window).width() / 2;
            autoaction = (event.changedTouches[0].pageX < middle) ? 'left':'right';
        },
        'touchend' : function(event){
            autoaction = null;
        }
    };

    /**
     * @constructor
     */
    return function (elem) {

        canvas = document.getElementById(elem);

        $(window).resize(function () {
            canvas.width = $("canvas").outerWidth();
            canvas.height = window.innerHeight - 10;
            $(canvas).data("width", canvas.width);
            $(canvas).data("height", canvas.height);
            console.log("snake", snake);
            _.extend(snake, { 
                field: {
                    width: canvas.width,
                    height: canvas.height
                }
            });

        });
        $(window).trigger("resize");


        for (var e in events) {
            document.addEventListener(e, events[e], false);
        }

        $("#help").bind("close", start);

        var exports = {};

        return exports;
    };
})();