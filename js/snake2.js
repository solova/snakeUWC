SnakeGame = new function () {
    var browser = navigator.userAgent.toLowerCase();
    var isMobile = (browser.indexOf("android") != -1) || (browser.indexOf("iphone") != -1) || (browser.indexOf("ipad") != -1);
    var gameWidth = isMobile ? window.innerWidth : 900;
    var gameHeight = isMobile ? window.innerHeight : 550;
    var canvas;
    var context;
    var statusBlock;
    var messageBlock;
    var titleBlock;
    var startBtnBlock;
    var w = [];
    var y = [];
    var H = [];
    var playerObject;
    var freeWidth = (window.innerWidth - gameWidth);
    var freeHeight = (window.innerHeight - gameHeight);
    var isMouseDown = false;
    var activeState = false;
    var C = 0;
    var startTime = 0;
    var s = {
        x: -1.3,
        y: 1
    };
    var E = 1;

    this.init = function () {
        canvas = document.getElementById("world");
        statusBlock = document.getElementById("status");
        messageBlock = document.getElementById("message");
        titleBlock = document.getElementById("title");
        startBtnBlock = document.getElementById("startButton");
        if (canvas && canvas.getContext) {
            context = canvas.getContext("2d");
            var addEventListenerFn = function (N, M, O) {
                document.addEventListener(N, M, O)
            };
            addEventListenerFn("mousemove", c, false);
            addEventListenerFn("mousedown", l, false);
            addEventListenerFn("mouseup", I, false);
            canvas.addEventListener("touchstart", i, false);
            addEventListenerFn("touchmove", q, false);
            addEventListenerFn("touchend", v, false);
            window.addEventListener("resize", resizeFunction, false);
            startBtnBlock.addEventListener("click", j, false);
            playerObject = new Player();
            resizeFunction();
            if (isMobile) {
                canvas.style.border = "none";
                s.x *= 2;
                s.y *= 2;
                setInterval(animate, 1000 / 20)
            } else {
                setInterval(animate, 1000 / 60)
            }
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
    function resizeFunction() {
        gameWidth = isMobile ? window.innerWidth : 900;
        gameHeight = isMobile ? window.innerHeight : 550;
        canvas.width = gameWidth;
        canvas.height = gameHeight;
        var horMargin = (window.innerWidth - gameWidth) * 0.5;
        var verMargin = (window.innerHeight - gameHeight) * 0.5;
        canvas.style.position = "absolute";
        canvas.style.left = horMargin + "px";
        canvas.style.top = verMargin + "px";
        if (isMobile) {
            messageBlock.style.left = "0px";
            messageBlock.style.top = "0px";
            statusBlock.style.left = "0px";
            statusBlock.style.top = "0px"
        } else {
            messageBlock.style.left = horMargin + 6 + "px";
            messageBlock.style.top = verMargin + 200 + "px";
            statusBlock.style.left = horMargin + 6 + "px";
            statusBlock.style.top = verMargin + 6 + "px"
        }
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
    function animate() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        var P = {
            x: s.x * E,
            y: s.y * E
        };
        var O, M, N, L;
        if (activeState) {
            E += 0.0008;
            pp = playerObject.clonePosition();
            playerObject.p.x += (freeWidth - playerObject.p.x) * 0.13;
            playerObject.p.y += (freeHeight - playerObject.p.y) * 0.13;
            C += 0.4 * E;
            C += playerObject.distanceTo(pp) * 0.1;
            playerObject.boost = Math.max(playerObject.boost - 1, 0);
            if (playerObject.boost > 0 && (playerObject.boost > 100 || playerObject.boost % 3 != 0)) {
                context.beginPath();
                context.fillStyle = "#167a66";
                context.strokeStyle = "#00ffcc";
                context.arc(playerObject.p.x, playerObject.p.y, playerObject.s * 2, 0, Math.PI * 2, true);
                context.fill();
                context.stroke()
            }
            playerObject.trail.push(new Point(playerObject.p.x, playerObject.p.y));
            context.beginPath();
            context.strokeStyle = "#648d93";
            context.lineWidth = 2;
            for (O = 0, N = playerObject.trail.length; O < N; O++) {
                p = playerObject.trail[O];
                context.lineTo(p.p.x, p.p.y);
                p.p.x += P.x;
                p.p.y += P.y
            }
            context.stroke();
            context.closePath();
            if (playerObject.trail.length > 60) {
                playerObject.trail.shift()
            }
            context.beginPath();
            context.fillStyle = "#8ff1ff";
            context.arc(playerObject.p.x, playerObject.p.y, playerObject.s / 2, 0, Math.PI * 2, true);
            context.fill()
        }
        if (activeState && (playerObject.p.x < 0 || playerObject.p.x > gameWidth || playerObject.p.y < 0 || playerObject.p.y > gameHeight)) {
            g(playerObject.p, 10);
            gameOver()
        }
        for (O = 0; O < w.length; O++) {
            p = w[O];
            if (activeState) {
                if (playerObject.boost > 0 && p.distanceTo(playerObject.p) < ((playerObject.s * 4) + p.s) * 0.5) {
                    g(p.p, 10);
                    w.splice(O, 1);
                    O--;
                    C += 10;
                    continue
                } else {
                    if (p.distanceTo(playerObject.p) < (playerObject.s + p.s) * 0.5) {
                        g(playerObject.p, 10);
                        gameOver()
                    }
                }
            }
            context.beginPath();
            context.fillStyle = "#ff0000";
            context.arc(p.p.x, p.p.y, p.s / 2, 0, Math.PI * 2, true);
            context.fill();
            p.p.x += P.x * p.f;
            p.p.y += P.y * p.f;
            if (p.p.x < 0 || p.p.y > gameHeight) {
                w.splice(O, 1);
                O--
            }
        }
        for (O = 0; O < y.length; O++) {
            p = y[O];
            if (p.distanceTo(playerObject.p) < (playerObject.s + p.s) * 0.5 && activeState) {
                playerObject.boost = 300;
                for (M = 0; M < w.length; M++) {
                    e = w[M];
                    if (e.distanceTo(p.p) < 100) {
                        g(e.p, 10);
                        w.splice(M, 1);
                        M--;
                        C += 10
                    }
                }
            }
            context.beginPath();
            context.fillStyle = "#00ffcc";
            context.arc(p.p.x, p.p.y, p.s / 2, 0, Math.PI * 2, true);
            context.fill();
            p.p.x += P.x * p.f;
            p.p.y += P.y * p.f;
            if (p.p.x < 0 || p.p.y > gameHeight || playerObject.boost != 0) {
                y.splice(O, 1);
                O--
            }
        }
        if (w.length < 35 * E) {
            w.push(F(new Enemy()))
        }
        if (y.length < 1 && Math.random() > 0.997 && playerObject.boost == 0) {
            y.push(F(new Boost()))
        }
        for (O = 0; O < H.length; O++) {
            p = H[O];
            p.velocity.x += (P.x - p.velocity.x) * 0.04;
            p.velocity.y += (P.y - p.velocity.y) * 0.04;
            p.p.x += p.velocity.x;
            p.p.y += p.velocity.y;
            p.alpha -= 0.02;
            context.fillStyle = "rgba(255,255,255," + Math.max(p.alpha, 0) + ")";
            context.fillRect(p.p.x, p.p.y, 1, 1);
            if (p.alpha <= 0) {
                H.splice(O, 1)
            }
        }
        if (activeState) {
            scoreText = "Score: <span>" + Math.round(C) + "</span>";
            scoreText += " Time: <span>" + Math.round(((new Date().getTime() - startTime) / 1000) * 100) / 100 + "s</span>";
            statusBlock.innerHTML = scoreText
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

function Point(x, y) {
    this.p = {
        x: x,
        y: y
    }
}
Point.prototype.distanceTo = function (obj) {
    var x = obj.x - this.p.x;
    var y = obj.y - this.p.y;
    return Math.sqrt(x * x + y * y)
};
Point.prototype.clonePosition = function () {
    return {
        x: this.p.x,
        y: this.p.y
    }
};

function Player() {
    this.p = {
        x: 0,
        y: 0
    };
    this.trail = [];
    this.s = 8;
    this.boost = 0
}
Player.prototype = new Point();

function Enemy() {
    this.p = {
        x: 0,
        y: 0
    };
    this.s = 6 + (Math.random() * 4);
    this.f = 1 + (Math.random() * 0.4)
}
Enemy.prototype = new Point();

function Boost() {
    this.p = {
        x: 0,
        y: 0
    };
    this.s = 10 + (Math.random() * 8);
    this.f = 1 + (Math.random() * 0.4)
}
Boost.prototype = new Point();

function Particle() {
    this.p = {
        x: 0,
        y: 0
    };
    this.f = 1 + (Math.random() * 0.4);
    this.color = "#ff0000"
}
Particle.prototype = new Point();
SinuousWorld.init();