export const keyboard = {
    w: false,
    a: false,
    s: false,
    d: false,

    dash: false
};

export const mouse = {
    x: 0,
    y: 0,

    down: false
};

export function setupKeyboard() {

    window.addEventListener("keydown", e => {

        if (e.code === "KeyW")
            keyboard.w = true;

        if (e.code === "KeyA")
            keyboard.a = true;

        if (e.code === "KeyS")
            keyboard.s = true;

        if (e.code === "KeyD")
            keyboard.d = true;

        if (e.code === "Space") {

            if (!keyboard.dash) {
                keyboard.dash = true;
            }

            e.preventDefault();
        }
    });

    window.addEventListener("keyup", e => {

        if (e.code === "KeyW")
            keyboard.w = false;

        if (e.code === "KeyA")
            keyboard.a = false;

        if (e.code === "KeyS")
            keyboard.s = false;

        if (e.code === "KeyD")
            keyboard.d = false;

        if (e.code === "Space")
            keyboard.dash = false;
    });
}

export function setupMouse(canvas) {

    window.addEventListener("mousemove", e => {

        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    canvas.addEventListener("mousedown", e => {

        if (e.button === 0) {
            mouse.down = true;
        }
    });

    window.addEventListener("mouseup", e => {

        if (e.button === 0) {
            mouse.down = false;
        }
    });
}
