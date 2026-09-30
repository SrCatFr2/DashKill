import { CONFIG } from "./config.js";
import { circleRect } from "./collision.js";

export const bullets = [];

function reflect(
    bullet,
    nx,
    ny
) {

    const dot =
        bullet.vx * nx +
        bullet.vy * ny;

    bullet.vx -=
        2 *
        dot *
        nx;

    bullet.vy -=
        2 *
        dot *
        ny;
}

export function updateBullets(
    dt
) {

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            bullets[i];

        bullet.life -= dt;

        if (
            bullet.life <= 0
        ) {

            bullets.splice(i, 1);

            continue;
        }

        bullet.trail.push({
            x: bullet.x,
            y: bullet.y
        });

        if (
            bullet.trail.length > 8
        ) {

            bullet.trail.shift();
        }

        let remaining = dt;

        for (
            let collisionCount = 0;
            collisionCount < 3 &&
            remaining > 0;
            collisionCount++
        ) {

            const nextX =
                bullet.x +
                bullet.vx *
                remaining;

            const nextY =
                bullet.y +
                bullet.vy *
                remaining;

            let hit = null;

            for (
                const wall of window.gameWalls
            ) {

                if (
                    circleRect(
                        nextX,
                        nextY,
                        bullet.radius,
                        wall
                    )
                ) {

                    hit = wall;

                    break;
                }
            }

            if (!hit) {

                bullet.x = nextX;
                bullet.y = nextY;

                remaining = 0;

                break;
            }

            /*
               Encontrar el lado golpeado.
            */

            const centerX =
                hit.x +
                hit.w / 2;

            const centerY =
                hit.y +
                hit.h / 2;

            const dx =
                nextX - centerX;

            const dy =
                nextY - centerY;

            let nx = 0;
            let ny = 0;

            if (
                Math.abs(dx) /
                    hit.w >
                Math.abs(dy) /
                    hit.h
            ) {

                nx =
                    Math.sign(dx);

            } else {

                ny =
                    Math.sign(dy);
            }

            if (
                nx === 0 &&
                ny === 0
            ) {

                nx =
                    Math.abs(dx) >
                    Math.abs(dy)
                        ? Math.sign(dx)
                        : 0;

                ny =
                    nx === 0
                        ? Math.sign(dy)
                        : 0;
            }

            reflect(
                bullet,
                nx,
                ny
            );

            bullet.bounces++;

            if (
                bullet.bounces >
                CONFIG.weapon.maxBounces
            ) {

                bullets.splice(i, 1);

                break;
            }

            bullet.x =
                nextX +
                nx * 3;

            bullet.y =
                nextY +
                ny * 3;

            remaining *= 0.35;
        }
    }
}
