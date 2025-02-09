
//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //tubos movendo-se para a esquerda, velocidade / pipes moving left speed
let velocityY = 0; //velocidade de salto do pássaro / bird jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //usado para desenhar na borda / used for drawing on the board
    

    // desenhar pássaro / draw flappy bird
    // context.fillStyle = "green";
    // context.fillRect(bird.x, bird.y, bird.width, bird.height);

    // Carregandos as imagens / load images
    birdImg = new Image();
    birdImg.src = "./src/images/flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./src/images/toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./src/images/bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //a cada 1,5 segundos / every 1.5 seconds
    document.addEventListener("keydown", moveBird);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // passaro / bird
    velocityY += gravity;
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); //aplique gravidade ao bird.y atual, limite o bird.y ao topo da tela / apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    // Tubos / pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0,5 porque existem 2 tubos! então 0,5 * 2 = 1, 1 para cada conjunto de tubos / 0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    // limpar os Tubos / clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //remove o primeiro elemento do array / removes first element from the array
    }

    //pontuação / score
    context.fillStyle = "white";
    context.font="45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    //(0-1) * altura do tubo/2. / (0-1) * pipeHeight/2.
    // 0 -> -128 (altura do tubo/4) / 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        // Pulo / jump
        velocityY = -6;

        // Reiniciar o jogo / reset game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //O canto superior esquerdo de a não alcança o canto superior direito de b / a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //O canto superior direito de a passa pelo canto superior esquerdo de b /  a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //O canto superior esquerdo de a não alcança o canto inferior esquerdo de b / a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //O canto inferior esquerdo de a passa pelo canto superior esquerdo de b / a's bottom left corner passes b's top left corner
}