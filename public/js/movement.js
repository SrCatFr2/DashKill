import { CONFIG } from "./config.js";
import { player } from "./player.js";
import { keyboard } from "./input.js";
import { mobile, consumeDashPress } from "./mobile.js";
import {
    getWallNormal,
    playerCanMoveTo
} from "./collision.js";

function normalize(
    x,
    y
) {

    const length =
        Math.hypot(x, y);

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

export function getMoveInput() {

    let x = 0;
    let y = 0;

    if (keyboard.w)
        y--;

    if (keyboard.s)
        y++;

    if (keyboard.a)
        x--;

    if (keyboard.d)
        x++;

    if (
        mobile.move.active
    ) {
        x = mobile.move.x;
        y = mobile.move.y;
    }

    return normalize(x, y);
}

export function updateMovement(
    dt
) {

    const input =
        getMoveInput();

    /*
       DASH
    */

    if (
        keyboard.dash ||
        consumeDashPress()
    ) {

        if (player.dashReady) {
            performDash(input);
        }
    }

    /*
       Tiempo del dash
    */

    if (player.dashing) {

        player.dashTimer -= dt;

        if (
            player.dashTimer <= 0
        ) {
            player.dashing = false;
        }
    }

    /*
       Movimiento normal
    */

    if (!player.dashing) {

        const targetX =
            input.x *
            CONFIG.player.speed;

        const targetY =
            input.y *
            CONFIG.player.speed;

        const response =
            1 -
            Math.exp(
                -CONFIG.player.acceleration *
                dt /
                CONFIG.player.speed
            );

        player.vx +=
            (targetX - player.vx) *
            response;

        player.vy +=
            (targetY - player.vy) *
            response;

        /*
           Frenado
        */

        if (
            input.x === 0 &&
            input.y === 0
        ) {

            const velocity =
                Math.hypot(
                    player.vx,
                    player.vy
                );

            if (velocity > 0) {

                const amount =
                    CONFIG.player.friction *
                    dt;

                const next =
                    Math.max(
                        0,
                        velocity - amount
                    );

                const ratio =
                    next / velocity;

                player.vx *= ratio;
                player.vy *= ratio;
            }
        }
    }

    moveWithCollision(dt);

    updateWallRecharge(dt);
}

function performDash(
    input
) {

    let dx = input.x;
    let dy = input.y;

    /*
       Si no hay movimiento,
       dash hacia donde apunta.
    */

    if (
        Math.abs(dx) < 0.01 &&
        Math.abs(dy) < 0.01
    ) {

        dx =
            Math.cos(player.angle);

        dy =
            Math.sin(player.angle);
    }

    const direction =
        normalize(dx, dy);

    player.vx =
        direction.x *
        CONFIG.player.dashSpeed;

    player.vy =
        direction.y *
        CONFIG.player.dashSpeed;

    player.dashing = true;

    player.dashTimer =
        CONFIG.player.dashDuration;

    player.dashReady = false;

    /*
       El dash consumió la carga.
       Tiene que volver a salir
       de la pared antes de cargar otra.
    */

    player.wallConsumed = true;
    player.wallTime = 0;
}

function moveWithCollision(
    dt
) {

    const nextX =
        player.x +
        player.vx *
        dt;

    const nextY =
        player.y +
        player.vy *
        dt;

    /*
       X
    */

    if (
        playerCanMoveTo(
            nextX,
            player.y
        )
    ) {

        player.x = nextX;

    } else {

        player.vx *= -0.08;
    }

    /*
       Y
    */

    if (
        playerCanMoveTo(
            player.x,
            nextY
        )
    ) {

        player.y = nextY;

    } else {

        player.vy *= -0.08;
    }
}

function updateWallRecharge(
    dt
) {

    const normal =
        getWallNormal();

    /*
       Ya no toca pared.
       Ahora puede volver a utilizar
       una pared para recargar.
    */

    if (!normal) {

        player.wallTime = 0;

        player.wallConsumed = false;

        player.facingWall = false;

        return;
    }

    const facingX =
        Math.cos(player.angle);

    const facingY =
        Math.sin(player.angle);

    const dot =
        facingX * normal.x +
        facingY * normal.y;

    player.facingWall =
        dot > 0.65;

    if (player.facingWall) {

        player.wallTime += dt;

        if (
            player.wallTime >=
                CONFIG.player.wallRechargeTime &&
            !player.wallConsumed
        ) {

            player.dashReady = true;

            player.wallConsumed = true;
        }

    } else {

        player.wallTime = 0;
    }
}
