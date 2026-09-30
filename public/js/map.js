import { CONFIG } from "./config.js";

export const walls = [];

export function buildMap(
    width,
    height
) {

    walls.length = 0;

    const margin =
        CONFIG.arena.margin;

    const thickness =
        CONFIG.arena.wallThickness;

    /*
       Borde superior
    */

    walls.push({
        x: margin,
        y: margin,

        w:
            width -
            margin * 2,

        h: thickness
    });

    /*
       Borde inferior
    */

    walls.push({
        x: margin,

        y:
            height -
            margin -
            thickness,

        w:
            width -
            margin * 2,

        h: thickness
    });

    /*
       Borde izquierdo
    */

    walls.push({
        x: margin,
        y: margin,

        w: thickness,

        h:
            height -
            margin * 2
    });

    /*
       Borde derecho
    */

    walls.push({
        x:
            width -
            margin -
            thickness,

        y: margin,

        w: thickness,

        h:
            height -
            margin * 2
    });

    /*
       Obstáculo horizontal
    */

    walls.push({
        x:
            width / 2 - 155,

        y:
            height / 2 - 9,

        w: 310,

        h: 18
    });

    /*
       Obstáculo vertical superior
    */

    walls.push({
        x:
            width / 2 - 9,

        y:
            height / 2 - 125,

        w: 18,

        h: 80
    });

    /*
       Obstáculo vertical inferior
    */

    walls.push({
        x:
            width / 2 - 9,

        y:
            height / 2 + 45,

        w: 18,

        h: 80
    });

    window.gameWalls = walls;
}
