const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const dashStatus = document.getElementById("dashStatus");
const shotStatus = document.getElementById("shotStatus");
const crosshair = document.getElementById("crosshair");

const mobileControls = document.getElementById("mobileControls");
const moveJoystickZone = document.getElementById("moveJoystick");
const aimJoystickZone = document.getElementById("aimJoystick");
const moveKnob = moveJoystickZone.querySelector(".joystick-knob");
const aimKnob = aimJoystickZone.querySelector(".joystick-knob");
const fireButton = document.getElementById("fireButton");
const dashButton = document.getElementById("dashButton");

let W = window.innerWidth;
let H = window.innerHeight;
let DPR = Math.min(window.devicePixelRatio || 1, 2);

function resizeCanvas() {
    W = window.innerWidth;
    H = window.innerHeight;
    DPR = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);

    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* ============================================================
   INPUT
   ============================================================ */

const keys = new Set();

window.addEventListener("keydown", e => {
    keys.add(e.code);

    if (
        ["KeyW", "KeyA", "KeyS", "KeyD", "Space"].includes(e.code)
    ) {
        e.preventDefault();
    }

    if (e.code === "Space") {
        dash();
    }
});

window.addEventListener("keyup", e => {
    keys.delete(e.code);
});

const mouse = {
    x: W / 2,
    y: H / 2,
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

/* ============================================================
   MOBILE INPUT
   ============================================================ */

const mobile = {
    move: {
        active: false,
        id: null,
        x: 0,
        y: 0
    },

    aim: {
        active: false,
        id: null,
        x: 0,
        y: 0
    },

    firing: false
};

function getJoystickVector(
    event,
    zone,
    maxDistance = 48
) {
    const rect = zone.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = event.clientX - centerX;
    let dy = event.clientY - centerY;

    const distance = Math.hypot(dx, dy);

    if (distance > maxDistance) {
        dx = (dx / distance) * maxDistance;
        dy = (dy / distance) * maxDistance;
    }

    return {
        x: dx / maxDistance,
        y: dy / maxDistance,
        dx,
        dy
    };
}

function setKnob(knob, dx, dy) {
    knob.style.transform =
        `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
}

function resetJoystick(type) {
    if (type === "move") {
        mobile.move.active = false;
        mobile.move.id = null;
        mobile.move.x = 0;
        mobile.move.y = 0;
        setKnob(moveKnob, 0, 0);
    }

    if (type === "aim") {
        mobile.aim.active = false;
        mobile.aim.id = null;
        mobile.aim.x = 0;
        mobile.aim.y = 0;
        setKnob(aimKnob, 0, 0);
    }
}

moveJoystickZone.addEventListener("pointerdown", e => {
    e.preventDefault();

    mobile.move.active = true;
    mobile.move.id = e.pointerId;

    moveJoystickZone.setPointerCapture(e.pointerId);

    updateMoveJoystick(e);
});

moveJoystickZone.addEventListener("pointermove", e => {
    if (
        mobile.move.active &&
        mobile.move.id === e.pointerId
    ) {
        updateMoveJoystick(e);
    }
});

moveJoystickZone.addEventListener("pointerup", e => {
    if (mobile.move.id === e.pointerId) {
        resetJoystick("move");
    }
});

moveJoystickZone.addEventListener("pointercancel", e => {
    if (mobile.move.id === e.pointerId) {
        resetJoystick("move");
    }
});

function updateMoveJoystick(e) {
    const v = getJoystickVector(
        e,
        moveJoystickZone,
        48
    );

    mobile.move.x = v.x;
    mobile.move.y = v.y;

    setKnob(
        moveKnob,
        v.dx,
        v.dy
    );
}

aimJoystickZone.addEventListener("pointerdown", e => {
    e.preventDefault();

    mobile.aim.active = true;
    mobile.aim.id = e.pointerId;

    aimJoystickZone.setPointerCapture(e.pointerId);

    updateAimJoystick(e);
});

aimJoystickZone.addEventListener("pointermove", e => {
    if (
        mobile.aim.active &&
        mobile.aim.id === e.pointerId
    ) {
        updateAimJoystick(e);
    }
});

aimJoystickZone.addEventListener("pointerup", e => {
    if (mobile.aim.id === e.pointerId) {
        resetJoystick("aim");
    }
});

aimJoystickZone.addEventListener("pointercancel", e => {
    if (mobile.aim.id === e.pointerId) {
        resetJoystick("aim");
    }
});

function updateAimJoystick(e) {
    const v = getJoystickVector(
        e,
        aimJoystickZone,
        48
    );

    mobile.aim.x = v.x;
    mobile.aim.y = v.y;

    setKnob(
        aimKnob,
        v.dx,
        v.dy
    );
}

/* FIRE */

fireButton.addEventListener("pointerdown", e => {
    e.preventDefault();

    mobile.firing = true;

    shoot();
});

fireButton.addEventListener("pointerup", e => {
    e.preventDefault();
    mobile.firing = false;
});

fireButton.addEventListener("pointercancel", () => {
    mobile.firing = false;
});

fireButton.addEventListener("pointerleave", () => {
    mobile.firing = false;
});

/* DASH */

dashButton.addEventListener("pointerdown", e => {
    e.preventDefault();
    dash();
});

/* ============================================================
   PLAYER
   ============================================================ */

const player = {
    x: 0,
    y: 0,

    radius: 16,

    speed: 520,
    acceleration: 4200,
    friction: 3600,

    vx: 0,
    vy: 0,

    angle: 0,

    dashReady: true,
    dashPower: 1150,
    dashDuration: 0.105,

    dashTimer: 0,

    wallContactTime: 0,
    wallRechargeConsumed: false,

    lastWallNormal: {
        x: 0,
        y: 0
    }
};

/* ============================================================
   BULLETS
   ============================================================ */

const bullets = [];

const weapon = {
    maxShots: 2,
    shots: 2,

    rechargeTime: 5,
    rechargeTimer: 0,

    bulletSpeed: 1050,
    bulletRadius: 5,

    maxBounces: 5
};

/* ============================================================
   MAP
   ============================================================ */

const walls = [];

function buildMap() {
    walls.length = 0;

    const margin = 80;

    walls.push({
        x: margin,
        y: margin,
        w: W - margin * 2,
        h: 18
    });

    walls.push({
        x: margin,
        y: H - margin - 18,
        w: W - margin * 2,
        h: 18
    });

    walls.push({
        x: margin,
        y: margin,
        w: 18,
        h: H - margin * 2
    });

    walls.push({
        x: W - margin - 18,
        y: margin,
        w: 18,
        h: H - margin * 2
    });

    /*
       OBSTÁCULOS CENTRALES
    */

    const centerX = W / 2;
    const centerY = H / 2;

    walls.push({
        x: centerX - 150,
        y: centerY - 9,
        w: 300,
        h: 18
    });

    walls.push({
        x: centerX - 9,
        y: centerY - 120,
        w: 18,
        h: 80
    });

    walls.push({
        x: centerX - 9,
        y: centerY + 40,
        w: 18,
        h: 80
    });
}

buildMap();

window.addEventListener("resize", () => {
    buildMap();

    player.x = Math.min(
        Math.max(player.x, 110),
        W - 110
    );

    player.y = Math.min(
        Math.max(player.y, 110),
        H - 110
    );
});

/* ============================================================
   START
   ============================================================ */

player.x = W * 0.25;
player.y = H * 0.5;

/* ============================================================
   UTILIDADES
   ============================================================ */

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function normalize(x, y) {
    const length = Math.hypot(x, y);

    if (length === 0) {
        return {
            x: 0,
            y: 0
        };
    }

    return {
        x: x / length,
        y: y / length
    };
}

function circleRectCollision(
    cx,
    cy,
    radius,
    rect
) {
    const closestX = clamp(
        cx,
        rect.x,
        rect.x + rect.w
    );

    const closestY = clamp(
        cy,
        rect.y,
        rect.y + rect.h
    );

    const dx = cx - closestX;
    const dy = cy - closestY;

    return (
        dx * dx +
        dy * dy <
        radius * radius
    );
}

/* ============================================================
   AIM
   ============================================================ */

function updateAim() {
    if (mobile.aim.active) {
        if (
            Math.abs(mobile.aim.x) > 0.08 ||
            Math.abs(mobile.aim.y) > 0.08
        ) {
            player.angle = Math.atan2(
                mobile.aim.y,
                mobile.aim.x
            );
        }

        return;
    }

    const dx = mouse.x - player.x;
    const dy = mouse.y - player.y;

    player.angle = Math.atan2(dy, dx);
}

/* ============================================================
   MOVEMENT INPUT
   ============================================================ */

function getMovementInput() {
    let x = 0;
    let y = 0;

    if (keys.has("KeyW")) y -= 1;
    if (keys.has("KeyS")) y += 1;
    if (keys.has("KeyA")) x -= 1;
    if (keys.has("KeyD")) x += 1;

    if (
        mobile.move.active &&
        (
            Math.abs(mobile.move.x) > 0.05 ||
            Math.abs(mobile.move.y) > 0.05
        )
    ) {
        x = mobile.move.x;
        y = mobile.move.y;
    }

    return normalize(x, y);
}

/* ============================================================
   SHOOT
   ============================================================ */

function shoot() {
    if (weapon.shots <= 0) {
        return;
    }

    const dirX = Math.cos(player.angle);
    const dirY = Math.sin(player.angle);

    const spawnDistance = player.radius + 9;

    bullets.push({
        x: player.x + dirX * spawnDistance,
        y: player.y + dirY * spawnDistance,

        vx: dirX * weapon.bulletSpeed,
        vy: dirY * weapon.bulletSpeed,

        radius: weapon.bulletRadius,

        bounces: 0,

        life: 8,

        trail: []
    });

    weapon.shots--;

    if (weapon.shots === 0) {
        weapon.rechargeTimer = weapon.rechargeTime;
    }
}

/* ============================================================
   DASH
   ============================================================ */

function dash() {
    if (!player.dashReady) {
        return;
    }

    let dx = 0;
    let dy = 0;

    const movement = getMovementInput();

    if (
        Math.abs(movement.x) > 0.05 ||
        Math.abs(movement.y) > 0.05
    ) {
        dx = movement.x;
        dy = movement.y;
    } else {
        dx = Math.cos(player.angle);
        dy = Math.sin(player.angle);
    }

    const direction = normalize(dx, dy);

    player.vx = direction.x * player.dashPower;
    player.vy = direction.y * player.dashPower;

    player.dashTimer = player.dashDuration;

    player.dashReady = false;

    /*
       El jugador debe abandonar la pared
       antes de volver a cargar el dash.
    */

    player.wallRechargeConsumed = true;
    player.wallContactTime = 0;
}

/* ============================================================
   WALL CONTACT
   ============================================================ */

function getWallContact() {
    let best = null;

    for (const wall of walls) {
        if (
            !circleRectCollision(
                player.x,
                player.y,
                player.radius + 1,
                wall
            )
        ) {
            continue;
        }

        const left =
            Math.abs(
                player.x -
                wall.x
            );

        const right =
            Math.abs(
                player.x -
                (wall.x + wall.w)
            );

        const top =
            Math.abs(
                player.y -
                wall.y
            );

        const bottom =
            Math.abs(
                player.y -
                (wall.y + wall.h)
            );

        const min = Math.min(
            left,
            right,
            top,
            bottom
        );

        if (min === left) {
            best = {
                x: -1,
                y: 0
            };
        } else if (min === right) {
            best = {
                x: 1,
                y: 0
            };
        } else if (min === top) {
            best = {
                x: 0,
                y: -1
            };
        } else {
            best = {
                x: 0,
                y: 1
            };
        }

        break;
    }

    return best;
}

function updateWallRecharge(dt) {
    const normal = getWallContact();

    if (!normal) {
        player.wallContactTime = 0;

        /*
           Ya abandonó la pared.
           Puede volver a cargar el dash.
        */

        player.wallRechargeConsumed = false;

        return;
    }

    player.lastWallNormal = normal;

    /*
       El jugador debe estar mirando hacia la pared.
       Si la pared está a la izquierda,
       player.angle debe apuntar a la izquierda.
    */

    const facingX = Math.cos(player.angle);
    const facingY = Math.sin(player.angle);

    const dot =
        facingX * normal.x +
        facingY * normal.y;

    if (dot > 0.65) {
        player.wallContactTime += dt;

        /*
           0.1 segundos mirando hacia la pared.
        */

        if (
            player.wallContactTime >= 0.1 &&
            !player.wallRechargeConsumed
        ) {
            player.dashReady = true;
            player.wallRechargeConsumed = true;
        }
    } else {
        player.wallContactTime = 0;
    }
}

/* ============================================================
   PLAYER COLLISION
   ============================================================ */

function movePlayer(dt) {
    const input = getMovementInput();

    let targetVX = input.x * player.speed;
    let targetVY = input.y * player.speed;

    if (player.dashTimer <= 0) {
        const blend =
            1 -
            Math.exp(
                -player.acceleration * dt / player.speed
            );

        player.vx +=
            (targetVX - player.vx) * blend;

        player.vy +=
            (targetVY - player.vy) * blend;

        if (
            Math.abs(input.x) < 0.01 &&
            Math.abs(input.y) < 0.01
        ) {
            const friction =
                player.friction * dt;

            const velocity =
                Math.hypot(
                    player.vx,
                    player.vy
                );

            if (velocity > 0) {
                const next =
                    Math.max(
                        0,
                        velocity - friction
                    );

                const ratio =
                    next / velocity;

                player.vx *= ratio;
                player.vy *= ratio;
            }
        }
    }

    const nextX =
        player.x + player.vx * dt;

    const nextY =
        player.y + player.vy * dt;

    /*
       X collision
    */

    let blockedX = false;

    for (const wall of walls) {
        if (
            circleRectCollision(
                nextX,
                player.y,
                player.radius,
                wall
            )
        ) {
            blockedX = true;
            break;
        }
    }

    if (!blockedX) {
        player.x = nextX;
    } else {
        player.vx *= -0.12;
    }

    /*
       Y collision
    */

    let blockedY = false;

    for (const wall of walls) {
        if (
            circleRectCollision(
                player.x,
                nextY,
                player.radius,
                wall
            )
        ) {
            blockedY = true;
            break;
        }
    }

    if (!blockedY) {
        player.y = nextY;
    } else {
        player.vy *= -0.12;
    }

    /*
       Límites
    */

    player.x = clamp(
        player.x,
        player.radius + 18,
        W - player.radius - 18
    );

    player.y = clamp(
        player.y,
        player.radius + 18,
        H - player.radius - 18
    );
}

/* ============================================================
   BULLETS
   ============================================================ */

function reflectBullet(
    bullet,
    normalX,
    normalY
) {
    const dot =
        bullet.vx * normalX +
        bullet.vy * normalY;

    bullet.vx -=
        2 * dot * normalX;

    bullet.vy -=
        2 * dot * normalY;
}

function updateBullets(dt) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];

        bullet.life -= dt;

        if (bullet.life <= 0) {
            bullets.splice(i, 1);
            continue;
        }

        bullet.trail.push({
            x: bullet.x,
            y: bullet.y
        });

        if (bullet.trail.length > 7) {
            bullet.trail.shift();
        }

        let remaining = dt;

        /*
           Permite varias colisiones
           durante un mismo frame.
        */

        let collisionCount = 0;

        while (
            remaining > 0 &&
            collisionCount < 3
        ) {
            const oldX = bullet.x;
            const oldY = bullet.y;

            const nextX =
                bullet.x +
                bullet.vx * remaining;

            const nextY =
                bullet.y +
                bullet.vy * remaining;

            let collision = null;

            for (const wall of walls) {
                if (
                    circleRectCollision(
                        nextX,
                        nextY,
                        bullet.radius,
                        wall
                    )
                ) {
                    collision = wall;
                    break;
                }
            }

            if (!collision) {
                bullet.x = nextX;
                bullet.y = nextY;
                remaining = 0;
                break;
            }

            /*
               Encontrar la dirección de la colisión.
            */

            const closestX = clamp(
                nextX,
                collision.x,
                collision.x + collision.w
            );

            const closestY = clamp(
                nextY,
                collision.y,
                collision.y + collision.h
            );

            let nx =
                nextX - closestX;

            let ny =
                nextY - closestY;

            const length =
                Math.hypot(nx, ny);

            if (length > 0.0001) {
                nx /= length;
                ny /= length;
            } else {
                /*
                   Caso esquina.
                */

                const dx =
                    nextX -
                    (collision.x + collision.w / 2);

                const dy =
                    nextY -
                    (collision.y + collision.h / 2);

                if (
                    Math.abs(dx) >
                    Math.abs(dy)
                ) {
                    nx = Math.sign(dx);
                    ny = 0;
                } else {
                    nx = 0;
                    ny = Math.sign(dy);
                }
            }

            bullet.x = oldX;
            bullet.y = oldY;

            reflectBullet(
                bullet,
                nx,
                ny
            );

            bullet.bounces++;

            if (
                bullet.bounces >
                weapon.maxBounces
            ) {
                bullets.splice(i, 1);
                break;
            }

            /*
               Separar la bala de la pared.
            */

            bullet.x += nx * 2;
            bullet.y += ny * 2;

            remaining *= 0.35;

            collisionCount++;
        }
    }
}

/* ============================================================
   RELOAD
   ============================================================ */

function updateWeapon(dt) {
    if (weapon.shots < weapon.maxShots) {
        weapon.rechargeTimer -= dt;

        if (weapon.rechargeTimer <= 0) {
            weapon.shots = weapon.maxShots;
            weapon.rechargeTimer = 0;
        }
    }
}

/* ============================================================
   AUTO FIRE MÓVIL
   ============================================================ */

let mobileFireTimer = 0;

function updateMobileFire(dt) {
    if (!mobile.firing) {
        mobileFireTimer = 0;
        return;
    }

    mobileFireTimer -= dt;

    if (mobileFireTimer <= 0) {
        shoot();

        /*
           Evita convertir el arma en una
           ametralladora. Mantiene la regla
           de máximo 2 disparos disponibles.
        */

        mobileFireTimer = 0.15;
    }
}

/* ============================================================
   UPDATE
   ============================================================ */

function update(dt) {
    updateAim();

    if (player.dashTimer > 0) {
        player.dashTimer -= dt;
    }

    movePlayer(dt);
    updateWallRecharge(dt);

    updateWeapon(dt);
    updateMobileFire(dt);
    updateBullets(dt);

    updateHUD();
}

/* ============================================================
   HUD
   ============================================================ */

function updateHUD() {
    shotStatus.textContent =
        `${weapon.shots} / ${weapon.maxShots}`;

    if (player.dashReady) {
        dashStatus.textContent = "READY";
        dashStatus.classList.add("ready");
    } else {
        dashStatus.textContent = "EMPTY";
        dashStatus.classList.remove("ready");
    }
}

/* ============================================================
   DRAW
   ============================================================ */

function drawBackground() {
    ctx.fillStyle = "#050606";
    ctx.fillRect(0, 0, W, H);

    /*
       Grid
    */

    const grid = 42;

    ctx.beginPath();

    for (
        let x = 0;
        x <= W;
        x += grid
    ) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
    }

    for (
        let y = 0;
        y <= H;
        y += grid
    ) {
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
    }

    ctx.strokeStyle =
        "rgba(255,255,255,0.018)";

    ctx.lineWidth = 1;
    ctx.stroke();

    /*
       Centro de arena
    */

    const gradient =
        ctx.createRadialGradient(
            W / 2,
            H / 2,
            20,
            W / 2,
            H / 2,
            Math.max(W, H) * 0.6
        );

    gradient.addColorStop(
        0,
        "rgba(80,255,120,0.025)"
    );

    gradient.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
}

function drawWalls() {
    for (const wall of walls) {
        ctx.fillStyle =
            "rgba(255,255,255,0.045)";

        ctx.fillRect(
            wall.x,
            wall.y,
            wall.w,
            wall.h
        );

        ctx.strokeStyle =
            "rgba(255,255,255,0.09)";

        ctx.lineWidth = 1;

        ctx.strokeRect(
            wall.x,
            wall.y,
            wall.w,
            wall.h
        );
    }
}

function drawBullets() {
    for (const bullet of bullets) {

        /*
           Trail
        */

        for (
            let i = 0;
            i < bullet.trail.length;
            i++
        ) {
            const point =
                bullet.trail[i];

            const alpha =
                i /
                bullet.trail.length *
                0.18;

            ctx.beginPath();

            ctx.arc(
                point.x,
                point.y,
                bullet.radius *
                    (0.35 + i / bullet.trail.length),
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `rgba(114,242,139,${alpha})`;

            ctx.fill();
        }

        /*
           Bala
        */

        ctx.beginPath();

        ctx.arc(
            bullet.x,
            bullet.y,
            bullet.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#72f28b";
        ctx.fill();

        ctx.beginPath();

        ctx.arc(
            bullet.x,
            bullet.y,
            bullet.radius * 2.1,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "rgba(114,242,139,0.08)";

        ctx.fill();
    }
}

function drawPlayer() {
    /*
       Aura
    */

    const glow =
        ctx.createRadialGradient(
            player.x,
            player.y,
            0,
            player.x,
            player.y,
            42
        );

    glow.addColorStop(
        0,
        "rgba(114,242,139,0.13)"
    );

    glow.addColorStop(
        1,
        "rgba(114,242,139,0)"
    );

    ctx.fillStyle = glow;

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        42,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
       Dirección
    */

    const dirX =
        Math.cos(player.angle);

    const dirY =
        Math.sin(player.angle);

    ctx.beginPath();

    ctx.moveTo(
        player.x,
        player.y
    );

    ctx.lineTo(
        player.x +
        dirX * 25,
        player.y +
        dirY * 25
    );

    ctx.strokeStyle =
        "rgba(114,242,139,0.3)";

    ctx.lineWidth = 3;

    ctx.stroke();

    /*
       Player
    */

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        player.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#72f28b";

    ctx.fill();

    ctx.strokeStyle =
        "rgba(255,255,255,0.75)";

    ctx.lineWidth = 2;

    ctx.stroke();

    /*
       Centro
    */

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        4,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#050606";

    ctx.fill();
}

function drawDashIndicator() {
    if (!player.dashReady) {
        return;
    }

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        player.radius + 7,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        "rgba(114,242,139,0.25)";

    ctx.lineWidth = 2;

    ctx.stroke();
}

function draw() {
    drawBackground();
    drawWalls();
    drawBullets();
    drawDashIndicator();
    drawPlayer();
}

/* ============================================================
   GAME LOOP
   ============================================================ */

let lastTime = performance.now();

function loop(now) {
    const rawDt =
        (now - lastTime) / 1000;

    lastTime = now;

    const dt =
        Math.min(rawDt, 0.033);

    update(dt);
    draw();

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
