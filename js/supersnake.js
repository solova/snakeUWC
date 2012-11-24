var snakegame = (function(){
	var canvas = null;

	//http://code.google.com/p/topheman-squares/source/browse/trunk/js/requestAnimFrame.js
	var requestAnimFrame = (function(callback){
		console.log("reqaniframe");
	    return window.requestAnimationFrame ||
	    window.webkitRequestAnimationFrame ||
	    window.mozRequestAnimationFrame ||
	    window.oRequestAnimationFrame ||
	    window.msRequestAnimationFrame ||
	    function(callback){
	        window.setTimeout(callback, 1000 / 60);
	    };
	})();
	//

	var keys = {37:'left',38:'up',39:'right',40:'down'};
	var snake = null;

	var update = function(){
	    var time = (new Date()).getTime();
	    var timeDiff = (time - snake.updated);
	    if (timeDiff > 1000 / snake.speed) {
	        var head = snake.segments[snake.segments.length - 1];
	        var neck = snake.segments[snake.segments.length - 2];
	 
	        var direction = snake.direction;
	        var newHeadX = head.x + direction.x * snake.segmentLength;
	        var newHeadY = head.y + direction.y * snake.segmentLength;
	 
	        // change direction if collision occurs
	        // if (newHeadX > canvas.width || newHeadX < 0) {
	        //     direction.x *= -1;
	        // }
	        // if (newHeadY > canvas.height || newHeadY < 0) {
	        //     direction.y *= -1;
	        // }
	 
	        // add new segment
	        snake.segments.push({
	            x: newHeadX,
	            y: newHeadY
	        });
	 
	        if (snake.segments.length > snake.len) {
	            snake.segments.shift();
	        }

	        direction.x = Math.cos(snake.degree);
	        direction.y = Math.sin(snake.degree);

	        /*var variance = 0;((maxVariance / 2) - Math.random() * maxVariance);
	 
	        direction.x += variance;
	        direction.y -= variance;
	 
	        // update direction vector
	        if (direction.x > 1) {
	            direction.x = 1;
	        }
	        if (direction.x < -1) {
	            direction.x = -1;
	        }
	 
	        // dampering - try to keep direction vectors around -0.5 and +0.5
	        direction.x *= Math.abs(direction.x) > 0.5 ? (1 - 0.01) : (1 + 0.01);
	        direction.y *= Math.abs(direction.y) > 0.5 ? (1 - 0.01) : (1 + 0.01);*/
	 
	        snake.updated = time;

	    }
	}

    var animate = function(){
    	//console.log("animate", snake);
	    var context = canvas.getContext("2d");
	    update();
	    context.clearRect(0, 0, canvas.width, canvas.height);
	    drawSnake(context);
	    requestAnimFrame(function(){
	        animate();
	    });
	}

	var drawSnake = function(context){
		//console.log("drawSnake", snake);
	    var segments = snake.segments;
	    var tail = segments[0];
	    context.beginPath();
	    context.moveTo(tail.x, tail.y);
	 
	    for (var n = 1; n < segments.length; n++) {
	        var segment = segments[n];
	        context.lineTo(segment.x, segment.y);
	    }
	 
	    context.lineWidth = 5;
	    context.lineCap = "round";
	    context.lineJoin = "round";
	    context.strokeStyle = "blue";
	    context.stroke();
	}

	var events = {
		keydown: function(event){
			if (typeof(keys[event.keyCode]) !== 'undefined'){
				event.preventDefault(); //disable scrolling
				console.log(keys[event.keyCode]);
				if (keys[event.keyCode] == 'right'){
					snake.degree += Math.PI/20;
					if (snake.degree > 2 * Math.PI) snake.degree = 0;
					$("#dval").text(snake.degree);
				}
				if (keys[event.keyCode] == 'left'){
					snake.degree -= Math.PI/20;
					if (snake.degree < -2 * Math.PI) snake.degree = 0;
					$("#dval").text(snake.degree);
				}
			}
		}
	}

	return function(elem){
		console.log("constructor", elem);
		canvas = document.getElementById(elem);
		var x0 = canvas.width / 2;
		var y0 = canvas.height / 2;

	    snake = {
	        segmentLength: 1,
	        updated: 0,
	        len: 50,
	        speed: 150,
	        direction: {
	            x: 1,
	            y: 0
	        },
	        degree: 0,
		    segments: [{
	            // head
	            x: x0,
	            y: y0
	        }]
	    };

	    for(var e in events){
	    	document.addEventListener(e, events[e], false);
	    }

	    animate();
	}
})();

$(function(){
	var s = new snakegame("snake-board");
})

