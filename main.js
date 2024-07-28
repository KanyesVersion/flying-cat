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

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = gridSize * 2;
        this.height = gridSize * 4;
        this.hitbox = {
            a: {
                x: Math.floor(this.x - this.width / 2),
                y: Math.floor(this.y - this.height / 2)
            },
            b: {
                x: Math.floor(this.x + this.width / 2),
                y: Math.floor(this.y - this.height / 2)
            },
            c: {
                x: Math.floor(this.x - this.width / 2),
                y: Math.floor(this.y + this.height / 2)
            },
            d: {
                x: Math.floor(this.x + this.width / 2),
                y: Math.floor(this.y + this.height / 2)
            },
        }
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
        this.draw();
        console.log(this.flyTstUpAnimation.isFinished);
    }

    draw() {
        // draw hitbox
        if (showingHitboxes) {
            ctx.fillStyle = '#f00';
            ctx.fillRect(this.hitbox.a.x, this.hitbox.a.y, this.hitbox.b.x - this.hitbox.a.x, this.hitbox.c.y - this.hitbox.a.y);
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
        this.hitbox.a.x = Math.floor(this.x - this.width / 2);
        this.hitbox.b.x = Math.floor(this.x + this.width / 2);
        this.hitbox.c.x = Math.floor(this.x - this.width / 2);
        this.hitbox.d.x = Math.floor(this.x + this.width / 2);
        this.hitbox.a.y = Math.floor(this.y - this.height / 2);
        this.hitbox.b.y = Math.floor(this.y - this.height / 2);
        this.hitbox.c.y = Math.floor(this.y + this.height / 2);
        this.hitbox.d.y = Math.floor(this.y + this.height / 2);
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
        
        if (!this.invulnerable) {
            if (collidingWithBird) {
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

class Cactus {
    constructor(x, height) {
        this.x = x;
        this.height = height;
    }

    update() {
        this.x -= scrollSpeed;
        this.draw();
    }

    draw() {
        ctx.fillStyle = '#2f8';
        for (let i = 0; i < this.height; i++) {
            ctx.fillRect(this.x, canvas.height - (i + 1) * 32, 32, 32);
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
        this.hitbox = {
            a: {
                x: Math.floor(this.x - this.width / 2),
                y: Math.floor(this.y - this.height / 2)
            },
            b: {
                x: Math.floor(this.x + this.width / 2),
                y: Math.floor(this.y - this.height / 2)
            },
            c: {
                x: Math.floor(this.x - this.width / 2),
                y: Math.floor(this.y + this.height / 2)
            },
            d: {
                x: Math.floor(this.x + this.width / 2),
                y: Math.floor(this.y + this.height / 2)
            },
        }
        this.#createAnimations();
    }

    create() {
        this.dive();
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        this.hitbox.a.x += this.velocity.x;
        this.hitbox.b.x += this.velocity.x;
        this.hitbox.c.x += this.velocity.x;
        this.hitbox.d.x += this.velocity.x;
        this.hitbox.a.y += this.velocity.y;
        this.hitbox.b.y += this.velocity.y;
        this.hitbox.c.y += this.velocity.y;
        this.hitbox.d.y += this.velocity.y;

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
                    this.state = 'plane';
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
                    this.state = 'plane';
                }
                break;
        }

        this.draw();
    }

    draw() {
        // draw hitbox
        if (showingHitboxes) {
            ctx.fillStyle = '#00d';
            ctx.fillRect(this.hitbox.a.x, this.hitbox.a.y, this.hitbox.b.x - this.hitbox.a.x, this.hitbox.c.y - this.hitbox.a.y);
        }

        const currAnimation = this.animations.find(el => el.isFor(this.state));
        currAnimation.setImageIndex();
        const image = currAnimation.getImage();
        ctx.drawImage(image, this.x - this.width / 2 - gridSize / 4, this.y - this.height / 2 - gridSize / 2);
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

        this.animations = [
            this.diveStartAnimation,
            this.diveAnimation,
            this.planeAnimation,
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

const player = new Player(gridSize * 8, gridSize * 10);
const cactusArray = [];

for (let i = 0; i < 6; i++) {
    cactusArray.push(
        new Cactus(gridSize * Math.ceil((Math.random() * horizontalSquares)), Math.ceil(Math.random() * 8 + 2))
    )
}

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
    ctx.font = '36px sans-serif';
    ctx.fillText('SCORE: ' + score, canvasWidth - gridSize * 8, gridSize * 2);
}

function oneSecClock() {
    if (!isPaused) {
        // bird spawning
        if (oddsPercent(60)) {
            spawnBird();
        }

        if (oddsPercent(5)) {
            for (let i = 0; i < 4; i++) {
                spawnBird();
            }
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