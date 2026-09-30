import { CONFIG } from "./config.js";
import { player } from "./player.js";
import { bullets } from "./bullets.js";

export const weapon = {

    shots:
        CONFIG.weapon.maxShots,

    rechargeTimer: 0,

    fireTimer: 0
};

export function shoot() {

    if (
        weapon.shots <= 0
    ) {
        return;
    }

    if (
        weapon.fireTimer > 0
    ) {
        return;
    }

    const dx =
        Math.cos(player.angle);

    const dy =
        Math.sin(player.angle);

    const distance =
        player.radius + 9;

    bullets.push({

        x:
            player.x +
            dx *
            distance,

        y:
            player.y +
            dy *
            distance,

        vx:
            dx *
            CONFIG.weapon.bulletSpeed,

        vy:
            dy *
            CONFIG.weapon.bulletSpeed,

        radius:
            CONFIG.weapon.bulletRadius,

        bounces: 0,

        life: 8,

        trail: []
    });

    weapon.shots--;

    weapon.fireTimer =
        CONFIG.weapon.fireInterval;

    if (
        weapon.shots === 0
    ) {

        weapon.rechargeTimer =
            CONFIG.weapon.rechargeTime;
    }
}

export function updateWeapon(
    dt,
    firing
) {

    if (
        weapon.fireTimer > 0
    ) {

        weapon.fireTimer -= dt;
    }

    if (
        firing &&
        weapon.shots > 0
    ) {

        shoot();
    }

    if (
        weapon.shots <
        CONFIG.weapon.maxShots
    ) {

        weapon.rechargeTimer -= dt;

        if (
            weapon.rechargeTimer <= 0
        ) {

            weapon.shots =
                CONFIG.weapon.maxShots;

            weapon.rechargeTimer = 0;
        }
    }
}
