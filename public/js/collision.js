import { player } from "./player.js";

export function circleRect(
    x,
    y,
    radius,
    rect
) {

    const closestX =
        Math.max(
            rect.x,
            Math.min(
                x,
                rect.x + rect.w
            )
        );

    const closestY =
        Math.max(
            rect.y,
            Math.min(
                y,
                rect.y + rect.h
            )
        );

    const dx =
        x - closestX;

    const dy =
        y - closestY;

    return (
        dx * dx +
        dy * dy <
        radius * radius
    );
}

export function getWallNormal() {

    for (const wall of window.gameWalls) {

        if (
            !circleRect(
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
                player.x - wall.x
            );

        const right =
            Math.abs(
                player.x -
                (wall.x + wall.w)
            );

        const top =
            Math.abs(
                player.y - wall.y
            );

        const bottom =
            Math.abs(
                player.y -
                (wall.y + wall.h)
            );

        const smallest =
            Math.min(
                left,
                right,
                top,
                bottom
            );

        if (smallest === left)
            return { x: -1, y: 0 };

        if (smallest === right)
            return { x: 1, y: 0 };

        if (smallest === top)
            return { x: 0, y: -1 };

        return { x: 0, y: 1 };
    }

    return null;
}

export function playerCanMoveTo(
    x,
    y
) {

    for (const wall of window.gameWalls) {

        if (
            circleRect(
                x,
                y,
                player.radius,
                wall
            )
        ) {
            return false;
        }
    }

    return true;
}
