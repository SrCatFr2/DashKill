const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const dashFill = document.getElementById("dashFill");
const dashText = document.getElementById("dashText");
const shotTimer = document.getElementById("shotTimer");
const shotElements = document.querySelectorAll(".shots i");
const crosshair = document.getElementById("crosshair");

let width = 0;
let height = 0;
let dpr = 1;

function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resize);
resize();

const keys = new Set();

window.addEventListener("keydown", e => {
    keys.add(e.code);

    if (
        [
            "KeyW",
            "KeyA",
            "KeyS",
            "KeyD",
            "ShiftLeft",
            "ShiftRight",
            "Space"
        ].includes(e.code)
    ) {
        e.preventDefault();
    }
});

window.addEventListener("keyup", e => {
    keys.delete(e.code);
});

const mouse = {
    x: width / 2,
    y: height / 2,
    down: false
};

window.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    crosshair.style.left = `${mouse.x}px`;
    crosshair.style.top = `${mouse.y}px`;
});

window.addEventListener("mousedown", e => {
    if (e.button === 0) {
        mouse.down = true;
        shoot();
    }
});

window.addEventListener("mouseup", e => {
    if (e.button === 0) {
        mouse.down = false;
    }
});

const player = {
    x: 0,
    y: 0,

    radius: 14,

    speed: 520,

    vx: 0,
    vy: 0,

    angle: 0,

    dashPower: 1150,
    dashDuration: 0.105,
    dashTime: 0,

    dashReady: true,

    touchingWall: false,
    facingWall: false,

    wallContactTime: 0,
    wallCooldown: 0,

    maxShots: 2,
    shots: 2,

    shotCooldown: 0,

    hp: 100
};

let bullets = [];

const walls = [];

function createMap() {

    walls.length = 0;

    const margin = Math.min(width, height) * 0.12;

    walls.push(
        {
            x: width / 2 - 160,
            y: height / 2 - 14,
            w: 320,
            h: 28
        },

        {
            x: width / 2 - 14,
            y: height / 2 - 150,
            w: 28,
            h: 90
        },

        {
            x: width / 2 - 14,
            y: height / 2 + 60,
            w: 28,
            h: 90
        },

        {
            x: margin,
            y: margin + 70,
            w: 180,
            h: 24
        },

        {
            x: width - margin - 180,
            y: margin + 70,
            w: 180,
            h: 24
        },

        {
            x: margin,
            y: height - margin - 94,
            w: 180,
            h: 24
        },

        {
            x: width - margin - 180,
            y: height - margin - 94,
            w: 180,
            h: 24
        }
    );
}

createMap();

window.addEventListener("resize", createMap);

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function circleRectCollision(cx, cy, radius, rect) {

    const closestX = clamp(cx, rect.x, rect.x + rect.w);
    const closestY = clamp(cy, rect.y, rect.y + rect.h);

    const dx = cx - closestX;
    const dy = cy - closestY;

    return dx * dx + dy * dy < radius * radius;
}

function moveWithCollision(entity, dx, dy) {

    let hitX = false;
    let hitY = false;

    entity.x += dx;

    for (const wall of walls) {

        if (circleRectCollision(entity.x, entity.y, entity.radius, wall)) {

            hitX = true;

            if (dx > 0) {
                entity.x = wall.x - entity.radius;
            } else if (dx < 0) {
                entity.x = wall.x + wall.w + entity.radius;
            }
        }
    }

    entity.y += dy;

    for (const wall of walls) {

        if (circleRectCollision(entity.x, entity.y, entity.radius, wall)) {

            hitY = true;

            if (dy > 0) {
                entity.y = wall.y - entity.radius;
            } else if (dy < 0) {
                entity.y = wall.y + wall.h + entity.radius;
            }
        }
    }

    entity.x = clamp(entity.x, entity.radius, width - entity.radius);
    entity.y = clamp(entity.y, entity.radius, height - entity.radius);

    return {
        hitX,
        hitY
    };
}

function getMovement() {

    let x = 0;
    let y = 0;

    if (keys.has("KeyW")) y--;
    if (keys.has("KeyS")) y++;
    if (keys.has("KeyA")) x--;
    if (keys.has("KeyD")) x++;

    const length = Math.hypot(x, y);

    if (length > 0) {
        x /= length;
        y /= length;
    }

    return { x, y };
}

function startDash() {

    if (!player.dashReady) return;
    if (player.dashTime > 0) return;

    const movement = getMovement();

    let dx = movement.x;
    let dy = movement.y;

    if (dx === 0 && dy === 0) {

        dx = Math.cos(player.angle);
        dy = Math.sin(player.angle);
    }

    player.vx = dx * player.dashPower;
    player.vy = dy * player.dashPower;

    player.dashTime = player.dashDuration;

    player.dashReady = false;

    player.wallContactTime = 0;
}

let previousShift = false;

function updateDashInput() {

    const shift =
        keys.has("ShiftLeft") ||
        keys.has("ShiftRight");

    if (shift && !previousShift) {
        startDash();
    }

    previousShift = shift;
}

function checkWallContact(dt) {

    let touching = false;
    let normalX = 0;
    let normalY = 0;

    for (const wall of walls) {

        const closestX = clamp(
            player.x,
            wall.x,
            wall.x + wall.w
        );

        const closestY = clamp(
            player.y,
            wall.y,
            wall.y + wall.h
        );

        const dx = player.x - closestX;
        const dy = player.y - closestY;

        const distance = Math.hypot(dx, dy);

        if (distance <= player.radius + 1.5) {

            touching = true;

            if (Math.abs(dx) > Math.abs(dy)) {
                normalX = Math.sign(dx) || 1;
                normalY = 0;
            } else {
                normalX = 0;
                normalY = Math.sign(dy) || 1;
            }

            break;
        }
    }

    player.touchingWall = touching;

    if (!touching) {

        player.wallContactTime = 0;
        player.facingWall = false;

        return;
    }

    const facingX = Math.cos(player.angle);
    const facingY = Math.sin(player.angle);

    const dot =
        facingX * -normalX +
        facingY * -normalY;

    player.facingWall = dot > 0.65;

    if (player.facingWall && player.dashTime <= 0) {

        player.wallContactTime += dt;

        if (
            player.wallContactTime >= 0.1 &&
            !player.dashReady
        ) {

            player.dashReady = true;
            player.wallContactTime = 0;
        }

    } else {

        player.wallContactTime = 0;
    }
}

function updatePlayer(dt) {

    player.angle = Math.atan2(
        mouse.y - player.y,
        mouse.x - player.x
    );

    updateDashInput();

    if (player.dashTime > 0) {

        player.dashTime -= dt;

        moveWithCollision(
            player,
            player.vx * dt,
            player.vy * dt
        );

    } else {

        const movement = getMovement();

        const targetVX = movement.x * player.speed;
        const targetVY = movement.y * player.speed;

        /*
         * Movimiento deliberadamente responsivo.
         * No hay aceleración pesada.
         */
        const response = 0.88;

        player.vx += (targetVX - player.vx) * response;
        player.vy += (targetVY - player.vy) * response;

        moveWithCollision(
            player,
            player.vx * dt,
            player.vy * dt
        );
    }

    checkWallContact(dt);

    if (player.shots < player.maxShots) {

        player.shotCooldown -= dt;

        if (player.shotCooldown <= 0) {

            player.shots = player.maxShots;
            player.shotCooldown = 0;
        }
    }

    updateHUD();
}

function shoot() {

    if (player.shots <= 0) return;

    player.shots--;

    if (player.shots === 0) {
        player.shotCooldown = 5;
    }

    const angle = player.angle;

    const speed = 1050;

    bullets.push({
        x: player.x + Math.cos(angle) * 22,
        y: player.y + Math.sin(angle) * 22,

        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,

        radius: 5,

        bounces: 0,
        maxBounces: 5,

        life: 8
    });

    updateHUD();
}

function updateBullets(dt) {

    for (let i = bullets.length - 1; i >= 0; i--) {

        const bullet = bullets[i];

        const oldX = bullet.x;
        const oldY = bullet.y;

        bullet.x += bullet.vx * dt;
        bullet.y += bullet.vy * dt;

        bullet.life -= dt;

        let bounced = false;

        for (const wall of walls) {

            if (
                circleRectCollision(
                    bullet.x,
                    bullet.y,
                    bullet.radius,
                    wall
                )
            ) {

                const wasHorizontal =
                    oldY >= wall.y &&
                    oldY <= wall.y + wall.h;

                const wasVertical =
                    oldX >= wall.x &&
                    oldX <= wall.x + wall.w;

                if (wasHorizontal) {
                    bullet.vx *= -1;
                } else if (wasVertical) {
                    bullet.vy *= -1;
                } else {
                    bullet.vx *= -1;
                    bullet.vy *= -1;
                }

                bullet.bounces++;

                bullet.x = oldX;
                bullet.y = oldY;

                bounced = true;

                if (bullet.bounces >= bullet.maxBounces) {
                    bullet.life = 0;
                }

                break;
            }
        }

        if (
            bullet.x < -50 ||
            bullet.x > width + 50 ||
            bullet.y < -50 ||
            bullet.y > height + 50
        ) {
            bullet.life = 0;
        }

        if (bullet.life <= 0) {
            bullets.splice(i, 1);
        }
    }
}

function updateHUD() {

    if (player.dashReady) {

        dashFill.style.transform = "scaleX(1)";
        dashText.textContent = "READY";

    } else if (player.wallContactTime > 0) {

        const progress =
            clamp(player.wallContactTime / 0.1, 0, 1);

        dashFill.style.transform =
            `scaleX(${progress})`;

        dashText.textContent =
            `${Math.round(progress * 100)}%`;

    } else {

        dashFill.style.transform = "scaleX(0)";
        dashText.textContent = "EMPTY";
    }

    shotElements.forEach((element, index) => {

        element.classList.toggle(
            "empty",
            index >= player.shots
        );
    });

    if (player.shots === 2) {

        shotTimer.textContent = "READY";

    } else {

        shotTimer.textContent =
            `${Math.max(0, player.shotCooldown).toFixed(1)}s`;
    }
}

function drawBackground() {

    ctx.fillStyle = "#070807";
    ctx.fillRect(0, 0, width, height);

    /*
     * Grid
     */
    const grid = 50;

    ctx.strokeStyle = "rgba(255,255,255,.035)";
    ctx.lineWidth = 1;

    for (let x = 0; x < width; x += grid) {

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    for (let y = 0; y < height; y += grid) {

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    /*
     * Arena border
     */
    ctx.strokeStyle = "rgba(255,255,255,.12)";
    ctx.lineWidth = 2;

    ctx.strokeRect(
        24,
        24,
        width - 48,
        height - 48
    );
}

function drawWalls() {

    for (const wall of walls) {

        ctx.fillStyle = "#161816";

        ctx.fillRect(
            wall.x,
            wall.y,
            wall.w,
            wall.h
        );

        ctx.strokeStyle = "rgba(255,255,255,.15)";
        ctx.lineWidth = 1;

        ctx.strokeRect(
            wall.x,
            wall.y,
            wall.w,
            wall.h
        );

        /*
         * Interior highlight
         */
        ctx.strokeStyle = "rgba(255,255,255,.035)";

        ctx.strokeRect(
            wall.x + 3,
            wall.y + 3,
            wall.w - 6,
            wall.h - 6
        );
    }
}

function drawBullets() {

    for (const bullet of bullets) {

        const angle =
            Math.atan2(bullet.vy, bullet.vx);

        const trailLength = 22;

        ctx.save();

        ctx.strokeStyle =
            "rgba(143,255,105,.35)";

        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.moveTo(
            bullet.x -
                Math.cos(angle) * trailLength,
            bullet.y -
                Math.sin(angle) * trailLength
        );

        ctx.lineTo(
            bullet.x,
            bullet.y
        );

        ctx.stroke();

        ctx.fillStyle = "#a1ff82";

        ctx.beginPath();

        ctx.arc(
            bullet.x,
            bullet.y,
            bullet.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }
}

function drawPlayer() {

    ctx.save();

    ctx.translate(player.x, player.y);

    /*
     * Dash shadow
     */
    if (player.dashTime > 0) {

        ctx.globalAlpha = 0.25;

        ctx.fillStyle = "#8fff69";

        ctx.beginPath();

        ctx.arc(
            -player.vx * 0.015,
            -player.vy * 0.015,
            player.radius + 5,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.globalAlpha = 1;
    }

    /*
     * Body
     */
    ctx.fillStyle = "#ededeb";

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        player.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
     * Aim direction
     */
    ctx.rotate(player.angle);

    ctx.fillStyle = "#8fff69";

    ctx.fillRect(
        8,
        -3,
        15,
        6
    );

    /*
     * Center
     */
    ctx.fillStyle = "#111";

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
}

function draw() {

    drawBackground();
    drawWalls();
    drawBullets();
    drawPlayer();
}

let lastTime = performance.now();

function loop(now) {

    let dt = (now - lastTime) / 1000;

    lastTime = now;

    /*
     * Evita saltos enormes después de cambiar
     * de pestaña o perder algunos frames.
     */
    dt = Math.min(dt, 0.033);

    updatePlayer(dt);
    updateBullets(dt);

    draw();

    requestAnimationFrame(loop);
}

player.x = width / 2;
player.y = height / 2 + 250;

mouse.x = width / 2;
mouse.y = height / 2;

crosshair.style.left = `${mouse.x}px`;
crosshair.style.top = `${mouse.y}px`;

requestAnimationFrame(loop);
