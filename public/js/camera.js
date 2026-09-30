import { CONFIG } from "./config.js";

export const camera = {

    x: 0,
    y: 0
};

export function updateCamera(
    target,
    dt,
    width,
    height
) {

    const targetX =
        target.x -
        width / 2;

    const targetY =
        target.y -
        height / 2;

    const smooth =
        1 -
        Math.exp(
            -CONFIG.camera.smoothness *
            dt
        );

    camera.x +=
        (targetX - camera.x) *
        smooth;

    camera.y +=
        (targetY - camera.y) *
        smooth;
}
