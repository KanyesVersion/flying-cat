//import { titleMenu, startBtn, devTools, toggleGridBtn, toggleHitboxesBtn } from "./ui.js";
const titleMenu = document.getElementById('title-menu');
const startBtn = document.getElementById('start-btn');
const devTools = document.getElementById('devtools');
const toggleGridBtn = document.getElementById('toggle-grid-btn');
const toggleHitboxesBtn = document.getElementById('toggle-hitboxes-btn');

//game
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const gridSize = 32;
// canvas.width = 640;
// canvas.height = 480;
canvas.height = window.innerHeight - (window.innerHeight % gridSize);
const canvasHeight = canvas.height;
canvas.width = Math.floor(canvasHeight * 1.78) - (Math.floor(canvasHeight * 1.78) % gridSize);
const canvasWidth = canvas.width;
const canvasTop = canvas.offsetTop - canvasHeight / 2;
const canvasLeft = canvas.offsetLeft - canvasWidth / 2;
const horizontalSquares = Math.floor(canvas.width / gridSize);
const verticalSquares = Math.floor(canvasHeight / gridSize);
const loopTime = 33;
const images = {
    backgroundCity: {
        layer1: {
            img: img('/backgrounds/bg-city-sky.png'),
            x: 0
        },
        layer2: {
            img: img('/backgrounds/bg-city-mountains.png'),
            x: 0
        },
        layer3: {
            img: img('/backgrounds/bg-city-buildings.png'),
            x: 0
        },
    },
    bird: {
        img: img('bird/bird-plane-1.png'),
    },
    cat: {
        img: img('/cat/cat-fly-idle-1.png'),
    },
    lives: img('lives.png'),
    powerupHolder: img('powerup-holder.png'),
}

const scrollSpeed = 6;
const rooms = {
    titleScreen: 'title'
}
let currRoom = 'title';
let isPaused = false;
let showingGrid = false;
let showingHitboxes = false;
let playerLives = 3;
let score = 0;
const keyPressed = {
    up: false,
    down: false,
    left: false,
    right: false,
}
const playerSpeed = {
    vertical: 6,
    horizontal: 2,
}
const birdArray = [];

class Hitbox {
    constructor(objX, objY, objWidth, objHeight, origin, color) {
        this.objX = objX;
        this.objY = objY;
        this.objWidth = objWidth;
        this.objHeight = objHeight;
        this.origin = origin;
        this.color = color;
        this.a = {x: 0, y: 0};
        this.b = {x: 0, y: 0};
        this.c = {x: 0, y: 0};
        this.d = {x: 0, y: 0};
        switch (this.origin) {
            case 'center':
                this.a.x = Math.floor(this.objX - this.objWidth / 2);
                this.a.y = Math.floor(this.objY - this.objHeight / 2);
                this.b.x = Math.floor(this.objX + this.objWidth / 2);
                this.b.y = Math.floor(this.objY - this.objHeight / 2);
                this.c.x = Math.floor(this.objX - this.objWidth / 2);
                this.c.y = Math.floor(this.objY + this.objHeight / 2);
                this.d.x = Math.floor(this.objX + this.objWidth / 2);
                this.d.y = Math.floor(this.objY + this.objHeight / 2);
                break;
            case 'corner':
                this.a.x = Math.floor(this.objX);
                this.a.y = Math.floor(this.objY);
                this.b.x = Math.floor(this.objX + this.objWidth);
                this.b.y = Math.floor(this.objY);
                this.c.x = Math.floor(this.objX);
                this.c.y = Math.floor(this.objY + this.objHeight);
                this.d.x = Math.floor(this.objX + this.objWidth);
                this.d.y = Math.floor(this.objY + this.objHeight);
                break;
            case 'default':
                this.a.x = Math.floor(this.objX);
                this.a.y = Math.floor(this.objY);
                this.b.x = Math.floor(this.objX + this.objWidth);
                this.b.y = Math.floor(this.objY);
                this.c.x = Math.floor(this.objX);
                this.c.y = Math.floor(this.objY + this.objHeight);
                this.d.x = Math.floor(this.objX + this.objWidth);
                this.d.y = Math.floor(this.objY + this.objHeight);
                break;
        }
        
    }

    updatePosition(objX ,objY) {
        switch (this.origin) {
            case 'center':
                this.a.x = Math.floor(objX - this.objWidth / 2);
                this.a.y = Math.floor(objY - this.objHeight / 2);
                this.b.x = Math.floor(objX + this.objWidth / 2);
                this.b.y = Math.floor(objY - this.objHeight / 2);
                this.c.x = Math.floor(objX - this.objWidth / 2);
                this.c.y = Math.floor(objY + this.objHeight / 2);
                this.d.x = Math.floor(objX + this.objWidth / 2);
                this.d.y = Math.floor(objY + this.objHeight / 2);
                break;
            case 'corner':
                this.a.x = Math.floor(objX);
                this.a.y = Math.floor(objY);
                this.b.x = Math.floor(objX + this.objWidth);
                this.b.y = Math.floor(objY);
                this.c.x = Math.floor(objX);
                this.c.y = Math.floor(objY + this.objHeight);
                this.d.x = Math.floor(objX + this.objWidth);
                this.d.y = Math.floor(objY + this.objHeight);
                break;
            case 'default':
                this.a.x = Math.floor(objX);
                this.a.y = Math.floor(objY);
                this.b.x = Math.floor(objX + this.objWidth);
                this.b.y = Math.floor(objY);
                this.c.x = Math.floor(objX);
                this.c.y = Math.floor(objY + this.objHeight);
                this.d.x = Math.floor(objX + this.objWidth);
                this.d.y = Math.floor(objY + this.objHeight);
                break;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.a.x, this.a.y, this.b.x - this.a.x, this.c.y - this.a.y);
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = gridSize * 2;
        this.height = gridSize * 4;
        this.hitbox = new Hitbox(this.x, this.y, this.width, this.height, 'center', '#f00');
        this.velocity = {
            x: 0,
            y: 0
        }
        this.hitCeiling = false;
        this.hitFloor = false;
        this.hitLeftWall = false;
        this.hitRightWall = false;
        this.state = 'flyIdle';
        this.#createAnimations();
        this.lastState = 'flyIdle';
        this.invulnerable = false;
    }

    update() {
        this.#setVelocity();
        this.#setState();
        this.#screenEdgeVars();
        this.#updatePosition();
        this.checkCollisions();
        console.log(this.hitbox.a);
        this.draw();
    }

    draw() {
        // draw hitbox
        if (showingHitboxes) {
            this.hitbox.draw();
        }

        // draw sprite
        const currAnimation = this.animations.find(el => el.isFor(this.state));
        currAnimation.setImageIndex();
        const image = currAnimation.getImage();
        ctx.drawImage(image, this.x - this.width - gridSize + gridSize / 8, this.y - this.height / 2 - gridSize / 2);
    }

    #setVelocity() {
        //vertical
        if (keyPressed.up && !keyPressed.down) {
            this.velocity.y = playerSpeed.vertical * -1;
        }
        if (keyPressed.up && keyPressed.down) {
            this.velocity.y = 0;
        }
        if (keyPressed.down && !keyPressed.up) {
            this.velocity.y = playerSpeed.vertical;
        }
        if (!keyPressed.up && !keyPressed.down) {
            this.velocity.y = 0;
        }
        
        //horizontal
        if (keyPressed.left && !keyPressed.right) {
            this.velocity.x = playerSpeed.horizontal * -1;
        }
        if (keyPressed.left && keyPressed.right) {
            this.velocity.x = 0;
        }
        if (!keyPressed.left && keyPressed.right) {
            this.velocity.x = playerSpeed.horizontal;
        }
        if (!keyPressed.left && !keyPressed.right) {
            this.velocity.x = 0;
        }
    }

    #setState() {
        if (!this.invulnerable) {
            if (keyPressed.up && this.lastState === 'flyIdle') {
                this.state = 'flyTstUp';
            }

            if (this.state === 'flyTstUp' && this.flyTstUpAnimation.isFinished) {
                this.state = 'flyUp';
                this.lastState = 'flyUp';
                this.flyTstUpAnimation.reset();
            }

            if (!keyPressed.up && this.state === 'flyTstUp') {
                this.state = 'flyIdle';
                this.lastState = 'flyIdle';
                this.flyTstUpAnimation.reset();
            }

            if (!keyPressed.up && this.lastState === 'flyUp') {
                this.state = 'flyTstUpToIdle';
            }
            if (this.state === 'flyTstUpToIdle' && this.flyTstUpToIdleAnimation.isFinished) {
                this.state = 'flyIdle';
                this.lastState = 'flyIdle';
                this.flyTstUpToIdleAnimation.reset();
            }
        }
    }

    #updatePosition() {
        //position
        if (!this.hitRightWall && this.velocity.x > 0) {
            this.x += this.velocity.x;
        }
        
        if (!this.hitLeftWall && this.velocity.x < 0) {
            this.x += this.velocity.x;
        }

        if (!this.hitFloor && this.velocity.y > 0) {
            this.y += this.velocity.y;
        }
        
        if (!this.hitCeiling && this.velocity.y < 0) {
            this.y += this.velocity.y;
        }

        //hitbox
        this.hitbox.updatePosition(this.x, this.y);
    }

    #screenEdgeVars() {
        this.hitCeiling = this.hitbox.a.y <= gridSize * 2;
        this.hitFloor = this.hitbox.c.y >= canvasHeight - gridSize * 2;
        this.hitLeftWall = this.hitbox.a.x <= gridSize * 2;
        this.hitRightWall = this.hitbox.b.x >= gridSize * Math.floor(horizontalSquares / 2);
    }

    #createAnimations() {
        //urlTemplate, numImages, frameDuration, isCyclical, state
        this.flyIdleAnimation = new SpriteAnimation(
            'cat/cat-fly-idle-x.png',
            7,
            2,
            true,
            'flyIdle'
        );
        this.flyTstUpAnimation = new SpriteAnimation(
            'cat/cat-tst-up-x.png',
            8,
            2,
            false,
            'flyTstUp'
        );
        this.flyUpAnimation = new SpriteAnimation(
            'cat/cat-fly-up-x.png',
            4,
            2,
            true,
            'flyUp'
        );
        this.flyTstUpToIdleAnimation = new SpriteAnimation(
            'cat/cat-tst-upidle-x.png',
            8,
            2,
            false,
            'flyTstUpToIdle'
        );
        this.hurt = new SpriteAnimation(
            'cat/cat-hurt-x.png',
            4,
            2,
            true,
            'hurt'
        );

        this.animations = [
            this.flyIdleAnimation,
            this.flyTstUpAnimation,
            this.flyUpAnimation,
            this.flyTstUpToIdleAnimation,
            this.hurt
        ];
    }

    checkCollisions() {
        const birdCollisions = birdArray.map(el => hitboxesColliding(this.hitbox, el.hitbox));
        const collidingWithBird = birdCollisions.some(i => i);
        const lowObstCollisions = lowObstArray.map(el => hitboxesColliding(this.hitbox, el.hitbox));
        const collidingWithLowObst = lowObstCollisions.some(i => i);
        
        if (!this.invulnerable) {
            if (collidingWithBird || collidingWithLowObst) {
                playerLives--;
                this.state = 'hurt';
                this.invulnerable = true;
                setTimeout(() => {
                    this.invulnerable = false;
                    this.state = 'flyIdle';
                }, 800);
            }
        }
    }
}

class Bird {
    constructor() {
        this.img = images.bird.img;
        this.velocity = {
            x: 0,
            y: 0
        }
        this.width = gridSize * 4;
        this.height = gridSize * 1.5;
        this.state = 'diveStart';
        this.xSpawn = canvasWidth - Math.floor(Math.random() * 3) * 100;
        this.x = this.xSpawn;
        this.y = 1;
        this.diveDistance = (Math.ceil(Math.random() * 5) + 1) * 100;
        this.planeVelocity = oddsPercent(50) ? 3 : -1;
        this.hitbox = new Hitbox(this.x, this.y, this.width, this.height, 'center', '#f0f');
        this.#createAnimations();
    }

    create() {
        this.dive();
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        this.hitbox.updatePosition(this.x, this.y);

        this.#setState();

        switch (this.state) {
            case 'dive':
                if (this.y < this.diveDistance / 2) {
                } else {
                    this.velocity.y = 10;
                }
        
                if (this.y >= this.diveDistance) {
                    this.velocity.y = this.planeVelocity;
                    this.velocity.x -= oddsPercent(50) ? 2 : 4;
                    this.state = 'tstDivePlane';
                }
                break;
            case 'diveStart':
                if (this.y < this.diveDistance / 2) {
                } else {
                    this.velocity.y = 10;
                }
        
                if (this.y >= this.diveDistance) {
                    this.velocity.y = this.planeVelocity;
                    this.velocity.x -= oddsPercent(50) ? 2 : 4;
                    this.state = 'tstDivePlane';
                }
                break;
        }

        this.draw();
    }

    draw() {
        // draw hitbox
        if (showingHitboxes) {
            this.hitbox.draw();
        }

        // draw bird
        const currAnimation = this.animations.find(el => el.isFor(this.state));
        currAnimation.setImageIndex();
        const image = currAnimation.getImage();
        ctx.drawImage(image, this.x - this.width / 2 - gridSize / 4, Math.floor(this.y - this.height / 2 - gridSize * 1.5));
    }

    dive() {
        this.velocity.x = (Math.floor(Math.random() * 3) + 8) * -1;
        this.velocity.y = 10;
    }

    #setState() {
        if (this.state === 'diveStart' && this.diveStartAnimation.isFinished) {
            this.state = 'dive';
            this.diveStartAnimation.reset();
        }
        if (this.state === 'tstDivePlane' && this.tstDivePlaneAnimation.isFinished) {
            this.state = 'plane';
            this.tstDivePlaneAnimation.reset();
        }
    }

    #createAnimations() {
        //urlTemplate, numImages, frameDuration, isCyclical, state
        this.diveStartAnimation = new SpriteAnimation(
            'bird/bird-dive-x.png',
            4,
            6,
            false,
            'diveStart'
        );
        this.diveAnimation = new SpriteAnimation(
            'bird/bird-diving-x.png',
            2,
            4,
            true,
            'dive'
        );
        this.planeAnimation = new SpriteAnimation(
            'bird/bird-plane-x.png',
            2,
            2,
            true,
            'plane'
        );
        this.tstDivePlaneAnimation = new SpriteAnimation(
            'bird/bird-tst-diveplane-x.png',
            8,
            3,
            false,
            'tstDivePlane'
        );

        this.animations = [
            this.diveStartAnimation,
            this.diveAnimation,
            this.planeAnimation,
            this.tstDivePlaneAnimation,
        ];
    }
}

class SpriteAnimation {
    images = [];
    constructor(urlTemplate, numImages, frameDuration, isCyclical, state) {
        this.numImages = numImages;
        this.imageIndex = 0;
        this.frameDuration = frameDuration;
        this.frameDurationDefault = this.frameDuration;
        this.isCyclical = isCyclical;
        this.state = state;
        this.urlTemplate = urlTemplate;
        this.bouncing = false;
        this.isFinished = false;

        for (let i = 1; i < this.numImages + 1; i++) {
            this.images.push(img(this.urlTemplate.replace('x', i)));
        }
    }

    isFor(state) {
        return this.state === state;
    }

    setImageIndex() {
        if (this.isCyclical) {
            let step = this.bouncing ? -1 : 1;
            this.frameDuration--;
            
            if (this.frameDuration <= 0) {
                this.imageIndex += step;
                this.frameDuration = this.frameDurationDefault;
            }

            if (this.imageIndex >= this.numImages - 1) {
                this.bouncing = true;
            }

            if (this.bouncing && this.imageIndex <= 0) {
                this.bouncing = false;
            }
        } else {
            this.frameDuration--;

            if (this.frameDuration <= 0) {
                this.imageIndex++;
                this.frameDuration = this.frameDurationDefault;
            }

            if (this.imageIndex >= this.numImages - 1) {
                this.isFinished = true;
            }
        }
    }

    reset() {
        this.imageIndex = 0;
        this.isFinished = false;
    }

    getImage() {
        return this.images[this.imageIndex];
    }
}

class LowObstacle {
    constructor() {
        this.blockSize = gridSize;
        this.blockWidth = 2;
        this.blockHeight = Math.ceil(Math.random() * 4) + 6;
        this.width = this.blockSize * this.blockWidth;
        this.height = this.blockSize * this.blockHeight;
        this.x = canvasWidth;
        this.y = canvasHeight - this.height;
        this.hitbox = new Hitbox(this.x, this.y, this.width, this.height, 'corner', '#00f');
    }

    update() {
        this.x -= scrollSpeed;
        this.hitbox.updatePosition(this.x, this.y);
        this.draw();
    }

    draw() {
        this.hitbox.draw();
    }
}

const player = new Player(gridSize * 8, gridSize * 10);
const lowObstArray = [];

loop();

function loop() {
    if (!isPaused && playerLives > 0) {
        requestAnimationFrame(loop);
        if (currRoom === 'title') {
            return;
        }

        if (currRoom === 'level1') {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            drawBackground(images.backgroundCity);

            // cactusArray.forEach(cactus => {
            //     cactus.update();
            // });

            lowObstArray.forEach((el, index) => {
                el.update();
                if (el.x + el.width < 0 || el.x > canvasWidth || el.y < 0 || el.y > canvasHeight) {
                    lowObstArray.splice(index, 1);
                }
            });

            birdArray.forEach((el, index) => {
                el.update();
                if (el.x + el.width < 0 || el.x > canvasWidth || el.y < 0 || el.y > canvasHeight) {
                    birdArray.splice(index, 1);
                }
            });

            player.update();

            drawLives();
            drawScore();
            
            if (showingGrid) {
                drawGrid();
            }
        }
    } else if (playerLives <= 0) {
        ctx.font = '72px sans-serif';
        ctx.fillText('YOU LOSE', 400, 400);
    }
}

function img(url) {
    const image = new Image();
    image.src = './images/' + url;
    return image;
}

function levelOneStart() {
    setTimeout(oneSecClock, 1000);
}

function drawBackground(background) {
    const altX = background.layer1.x + canvasWidth;
    ctx.drawImage(background.layer1.img, background.layer1.x, 0, canvasWidth, canvasHeight);
    ctx.drawImage(background.layer1.img, altX, 0, canvasWidth, canvasHeight);
    background.layer1.x -= scrollSpeed / scrollSpeed;

    if (background.layer1.x <= 0 - canvasWidth) {
        background.layer1.x = 0;
    }

    if (background.layer2) {
        const alt2X = background.layer2.x + canvasWidth;
        ctx.drawImage(background.layer2.img, background.layer2.x, 0, canvasWidth, canvasHeight);
        ctx.drawImage(background.layer2.img, alt2X, 0, canvasWidth, canvasHeight);
        background.layer2.x -= scrollSpeed / 3;

        if (background.layer2.x <= 0 - canvasWidth) {
            background.layer2.x = 0;
        }
    }
    
    // if (background.layer3) {
    //     const alt3X = background.layer3.x + canvasWidth;
    //     ctx.drawImage(background.layer3.img, background.layer3.x, 0, canvasWidth, canvasHeight);
    //     ctx.drawImage(background.layer3.img, alt3X, 0, canvasWidth, canvasHeight);
    //     background.layer3.x -= scrollSpeed / 2;

    //     if (background.layer3.x <= 0 - canvasWidth) {
    //         background.layer3.x = 0;
    //     }
    // }
}

function drawLives() {
    const x = gridSize;
    const y = gridSize;
    for (let i = 0; i < playerLives; i++) {
        ctx.drawImage(images.lives, x + ((gridSize * 1.5) * i), y);
    }

    drawPowerup();
}

function drawPowerup() {
    const x = 200;
    const y = gridSize;
    ctx.drawImage(images.powerupHolder, x, y);
}

function drawScore() {
    ctx.fillStyle = '#000';
    ctx.font = '36px sans-serif';
    ctx.fillText('SCORE: ' + score, canvasWidth - gridSize * 8, gridSize * 2);
}

function oneSecClock() {
    if (!isPaused) {
        // bird spawning
        if (oddsPercent(40)) {
            spawnBird();
        }
        if (oddsPercent(4)) {
            for (let i = 0; i < 4; i++) {
                spawnBird();
            }
        }

        // low obstacle spawining
        if (oddsPercent(30)) {
            spawnLowObst();
        }

        // score
        score++;
    }

    // loop
    setTimeout(oneSecClock, 1000);
}

function spawnBird() {
    const bird = new Bird();
    birdArray.push(bird);
    bird.create();
}

function spawnLowObst() {
    const obstacle = new LowObstacle();
    lowObstArray.push(obstacle);
}

function oddsPercent(num) {
    return Math.ceil(Math.random() * 100) <= num;
}

function hitboxesColliding(hitbox1, hitbox2) {
    const sharingX = hitbox1.b.x >= hitbox2.a.x && hitbox1.a.x <= hitbox2.b.x;
    const sharingY = hitbox1.c.y >= hitbox2.a.y && hitbox1.a.y <= hitbox2.c.y;

    return sharingX && sharingY;
}

window.addEventListener('click', e => {
    console.log(e.clientX, e.clientY);
});

window.addEventListener('keydown', (e) => {
    if (e.repeat) return;

    // Arrow keys
    if (e.key === 'ArrowUp') {
        keyPressed.up = true;
    }

    if (e.key === 'ArrowRight') {
        keyPressed.right = true;
    }
    
    if (e.key === 'ArrowDown') {
        keyPressed.down = true;
    }

    if (e.key === 'ArrowLeft') {
        keyPressed.left = true;
    }

    if (e.key === 'g') {
        showingGrid = !showingGrid;
    }

    if (e.key === 'h') {
        showingHitboxes = !showingHitboxes;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') {
        keyPressed.up = false;
    }

    if (e.key === 'ArrowRight') {
        keyPressed.right = false;
    }
    
    if (e.key === 'ArrowDown') {
        keyPressed.down = false;
    }

    if (e.key === 'ArrowLeft') {
        keyPressed.left = false;
    }

    if (e.key === ' ') {
        isPaused = !isPaused;
        if (!isPaused) {
            loop();
        }
    }
});

//UI and others
startBtn.addEventListener('click', () => {
    currRoom = 'level1';
    levelOneStart();
    titleMenu.classList.add('hidden');
    devTools.classList.remove('hidden');
});

//debug
function drawGrid() {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    for (let i = 0; i < verticalSquares - 1; i++) {
        const yValue = gridSize * (i + 1);
        ctx.beginPath();
        ctx.moveTo(0, yValue);
        ctx.lineTo(canvasWidth, yValue);
        ctx.stroke();
    }

    for (let i = 0; i < horizontalSquares - 1; i++) {
        const xValue = gridSize * (i + 1);
        ctx.beginPath();
        ctx.moveTo(xValue, 0);
        ctx.lineTo(xValue, canvasHeight);
        ctx.stroke();
    }
}

toggleGridBtn.addEventListener('click', () => {
    showingGrid = !showingGrid;
});

toggleHitboxesBtn.addEventListener('click', () => {
    showingHitboxes = !showingHitboxes;
});