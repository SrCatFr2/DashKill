import { CONFIG } from "./config.js";
import { player, createPlayer } from "./player.js";
import { setupKeyboard, setupMouse, mouse, keyboard } from "./input.js";
import { setupMobile, mobile } from "./mobile.js";
import { updateMovement } from "./movement.js";
import { updateWeapon } from "./shooting.js";
import { bullets, updateBullets } from "./bullets.js";
import { buildMap, walls } from "./map.js";
import { updateCamera, camera } from "./camera.js";
import { updateEffects, drawEffects } from "./effects.js";
import { updateHUD } from "./hud.js";

const canvas =
    document.getElementById(
        "canvas"
    );

const ctx =
    canvas.getContext(
        "2d"
    );

const crosshair =
    document.getElementById(
        "crosshair"
    );

let width =
    window.innerWidth;

let height =
    window.innerHeight;

let dpr =
    Math.min(
        window.devicePixelRatio || 1,
        2
    );

/* =========================================================
   RESIZE
========================================================= */

function resize() {

    width =
        window.innerWidth;

    height =
        window.innerHeight;

    dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    canvas.width =
        Math.floor(
            width * dpr
        );

    canvas.height =
        Math.floor(
            height * dpr
        );

    canvas.style.width =
        `${width}px`;

    canvas.style.height =
        `${height}px`;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    buildMap(
        width,
        height
    );
}

window.addEventListener(
    "resize",
    resize
);

/* =========================================================
   SETUP
========================================================= */

resize();

setupKeyboard();

setupMouse(canvas);

createPlayer(
    width * .25,
    height * .5
);

camera.x = 0;
camera.y = 0;

/* =========================================================
   AIM
========================================================= */

function updateAim() {

    if (
        mobile.aim.active
    ) {

        if (
            Math.abs(
                mobile.aim.x
            ) > .08 ||
            Math.abs(
                mobile.aim.y
            ) > .08
        ) {

            player.angle =
                Math.atan2(
                    mobile.aim.y,
                    mobile.aim.x
                );
        }

        return;
    }

    const dx =
        mouse.x -
        player.x;

    const dy =
        mouse.y -
        player.y;

    player.angle =
        Math.atan2(
            dy,
            dx
        );
}

/* =========================================================
   FIRE
========================================================= */

function isFiring() {

    return (
        mouse.down ||
        mobile.firing
    );
}

/* =========================================================
   DRAW BACKGROUND
========================================================= */

function drawBackground() {

    ctx.fillStyle =
        "#050606";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );

    /*
       Grid
    */

    const grid = 42;

    ctx.beginPath();

    for (
        let x = 0;
        x < width;
        x += grid
    ) {

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            height
        );
    }

    for (
        let y = 0;
        y < height;
        y += grid
    ) {

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            width,
            y
        );
    }

    ctx.strokeStyle =
        "rgba(255,255,255,.018)";

    ctx.lineWidth = 1;

    ctx.stroke();

    /*
       Glow central
    */

    const glow =
        ctx.createRadialGradient(
            width / 2,
            height / 2,
            20,
            width / 2,
            height / 2,
            Math.max(
                width,
                height
            ) * .65
        );

    glow.addColorStop(
        0,
        "rgba(114,242,139,.035)"
    );

    glow.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );

    ctx.fillStyle =
        glow;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );
}

/* =========================================================
   DRAW MAP
========================================================= */

function drawMap() {

    for (
        const wall of walls
    ) {

        ctx.fillStyle =
            "rgba(255,255,255,.045)";

        ctx.fillRect(
            wall.x,
            wall.y,
            wall.w,
            wall.h
        );

        ctx.strokeStyle =
            "rgba(255,255,255,.1)";

        ctx.lineWidth = 1;

        ctx.strokeRect(
            wall.x,
            wall.y,
            wall.w,
            wall.h
        );
    }
}

/* =========================================================
   DRAW BULLETS
========================================================= */

function drawBullets() {

    /*
       Import dinámico evitado:
       accedemos al estado global que
       bullets.js expone.
    */

    const bulletList =
        window.gameBullets || [];

    for (
        const bullet of bulletList
    ) {

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
                .2;

            ctx.beginPath();

            ctx.arc(
                point.x,
                point.y,
                2,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `rgba(114,242,139,${alpha})`;

            ctx.fill();
        }

        ctx.beginPath();

        ctx.arc(
            bullet.x,
            bullet.y,
            bullet.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#72f28b";

        ctx.fill();

        ctx.beginPath();

        ctx.arc(
            bullet.x,
            bullet.y,
            bullet.radius * 2.5,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "rgba(114,242,139,.06)";

        ctx.fill();
    }
}

/* =========================================================
   DRAW PLAYER
========================================================= */

function drawPlayer() {

    /*
       Dash trail
    */

    if (
        player.dashing
    ) {

        const speed =
            Math.hypot(
                player.vx,
                player.vy
            );

        const dir =
            Math.atan2(
                player.vy,
                player.vx
            );

        ctx.save();

        ctx.translate(
            player.x,
            player.y
        );

        ctx.rotate(dir);

        ctx.fillStyle =
            "rgba(114,242,139,.13)";

        ctx.fillRect(
            -48,
            -8,
            38,
            16
        );

        ctx.restore();
    }

    /*
       Glow
    */

    const glow =
        ctx.createRadialGradient(
            player.x,
            player.y,
            0,
            player.x,
            player.y,
            44
        );

    glow.addColorStop(
        0,
        "rgba(114,242,139,.14)"
    );

    glow.addColorStop(
        1,
        "rgba(114,242,139,0)"
    );

    ctx.fillStyle =
        glow;

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        44,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
       Dirección
    */

    const dx =
        Math.cos(
            player.angle
        );

    const dy =
        Math.sin(
            player.angle
        );

    ctx.beginPath();

    ctx.moveTo(
        player.x,
        player.y
    );

    ctx.lineTo(
        player.x +
        dx * 27,
        player.y +
        dy * 27
    );

    ctx.strokeStyle =
        "rgba(114,242,139,.3)";

    ctx.lineWidth = 3;

    ctx.stroke();

    /*
       Cuerpo
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
        "rgba(255,255,255,.8)";

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

/* =========================================================
   DASH INDICATOR
========================================================= */

function drawDashReady() {

    if (
        !player.dashReady
    ) {
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
        "rgba(114,242,139,.22)";

    ctx.lineWidth = 2;

    ctx.stroke();
}

/* =========================================================
   RENDER
========================================================= */

function render() {

    drawBackground();

    drawMap();

    drawBullets();

    drawEffects(ctx);

    drawDashReady();

    drawPlayer();
}

/* =========================================================
   GAME LOOP
========================================================= */

let last =
    performance.now();

function loop(
    now
) {

    const dt =
        Math.min(
            (now - last) / 1000,
            .033
        );

    last = now;

    updateAim();

    updateMovement(dt);

    updateWeapon(
        dt,
        isFiring()
    );

    updateBullets(dt);

    updateEffects(dt);

    updateCamera(
        player,
        dt,
        width,
        height
    );

    updateHUD();

    render();

    requestAnimationFrame(
        loop
    );
}

requestAnimationFrame(
    loop
);

/* =========================================================
   CROSSHAIR
========================================================= */

window.addEventListener(
    "mousemove",
    event => {

        crosshair.style.left =
            `${event.clientX}px`;

        crosshair.style.top =
            `${event.clientY}px`;
    }
);
