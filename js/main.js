// ロジック参考 https://developer.mozilla.org/ja/docs/Games/Workflows/2D_Breakout_game_pure_JavaScript

const canvas = $('#myCanvas')[0];
const ctx = canvas.getContext('2d');

// ボール初期設定
let ball = {
    radius: 5,
    x: canvas.width / 2,
    y: canvas.height - 30,
    dx: 2,
    dy: -2
};

// パドル初期設定
let paddleHeight = 10;
let paddleWidth = 75;
let paddle = {
    x: (canvas.width - paddleWidth) / 2,
    y: canvas.height - paddleHeight
};

// スコア、ライフ初期設定
let score = 0;
let defaultLives = 3;
let lives = defaultLives;

// キー操作フラグ
let rightPressed = false;
let leftPressed = false;

// ブロック設定
let brickRowCount = 3;
let brickColumnCount = 5;
let brickWidth = 75;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 30;

// ブロックの初期化
let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        // 各ブロックオブジェクトのパラメータを初期化
        // (X位置, Y位置, ステータス(消される前なら1, 消された後なら0))
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    };
};


// パドル操作用のフラグ
$(document).keydown(function (e) {
    switch (e.key) {
        case 'ArrowLeft':
        case 'Left':
            leftPressed = true;
            break;
        case 'ArrowRight':
        case 'Right':
            rightPressed = true;
            break;
    };
});

$(document).keyup(function (e) {
    switch (e.key) {
        case 'ArrowLeft':
        case 'Left':
            leftPressed = false;
            break;
        case 'ArrowRight':
        case 'Right':
            rightPressed = false;
            break;
    };
});

function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#090707';
    ctx.fillText('Score: ' + score, 8, 20);
};

function drawLives() {
    //ライフの数だけハートを表示
    let heart = '♥'.repeat(lives) + 'x'.repeat(defaultLives - lives);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#E53A40';
    ctx.fillText(heart, canvas.width - 65, 20);
};

function drawWall() {
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.stroke();
};

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#E53A40'
    ctx.fill();
    ctx.closePath();
};

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddleWidth, paddleHeight);
    ctx.fillStyle = '#090707';
    ctx.fill();
    ctx.closePath();
    if (rightPressed && paddle.x < canvas.width - paddleWidth) {
        paddle.x += 7;
    };
    if (leftPressed && paddle.x > 0) {
        paddle.x -= 7;
    };
};

function drawBrick(c, r) {
    let brickX = brickOffsetLeft + (c * (brickWidth + brickPadding));
    let brickY = brickOffsetTop + (r * (brickHeight + brickPadding));
    bricks[c][r]['x'] = brickX;
    bricks[c][r]['y'] = brickY;
    ctx.beginPath();
    ctx.rect(brickX, brickY, brickWidth, brickHeight);
    ctx.fillStyle = '#30A9DE';
    ctx.fill();
    ctx.closePath();
};

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r]['status'] == 1) {
                drawBrick(c, r);
            };
        };
    };
};

function finishGame(msg) {
    alert(msg)
    document.location.reload();
    clearInterval(interval);
}

function deleteBrick(brick) {
    $('#brick').get(0).play();
    brick['status'] = 0;
}

function collisionDetecton() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let brick = bricks[c][r];
            if (brick['status'] == 1) {
                if (ball.x > brick.x && ball.x < brick.x + brickWidth && ball.y > brick.y && ball.y < brick.y + brickHeight) {
                    deleteBrick(brick);
                    score++;
                    ball.dy = -ball.dy;
                }
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    drawBricks();
    drawWall();
    collisionDetecton();

    // ボールが画面左or右or上の壁にあたったらバウンド
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    }

    // ボールが画面下に来た時
    if (ball.y + ball.dy > canvas.height - ball.radius) {
        // パドルに当てたとき
        if (ball.x > paddle.x && ball.x < paddle.x + paddleWidth) {
            $('#paddle').get(0).play();
            ball.dy = -ball.dy;
        } else {
            // パドルを外した時
            lives--;
            if (!lives) {
                finishGame('game over');
            } else {
                ball.x = canvas.width / 2;
                ball.y = canvas.height - 30;
                ball.dx = 2;
                ball.dy = -2;
                paddle.x = (canvas.width - paddleWidth) / 2;
            }
        };
    };


    ball.x += ball.dx;
    ball.y += ball.dy;
    requestAnimationFrame(draw);
    if (score == brickRowCount * brickColumnCount) {
        finishGame('You Win, Congratulations!!');
    };
}

draw();
