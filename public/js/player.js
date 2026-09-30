import { CONFIG } from "./config.js";

export const player = {

    x: 0,
    y: 0,

    vx: 0,
    vy: 0,

    angle: 0,

    radius:
        CONFIG.player.radius,

    dashReady: true,

    dashing: false,

    dashTimer: 0,

    wallTime: 0,

    wallConsumed: false,

    facingWall: false
};

export function createPlayer(
    x,
    y
) {

    player.x = x;
    player.y = y;

    player.vx = 0;
    player.vy = 0;

    player.angle = 0;

    player.dashReady = true;

    player.dashing = false;

    player.dashTimer = 0;

    player.wallTime = 0;

    player.wallConsumed = false;

    player.facingWall = false;
}
