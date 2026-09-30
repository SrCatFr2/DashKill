// ============================================================
// DASHKILL — MOBILE INPUT
// ============================================================

export const mobile = {

    enabled:
        window.matchMedia("(pointer: coarse)").matches,

    move: {
        active: false,
        x: 0,
        y: 0,
        id: null
    },

    aim: {
        active: false,
        x: 0,
        y: 0,
        id: null
    },

    firing: false,

    dashPressed: false
};


// ============================================================
// SETUP
// ============================================================

export function setupMobile() {

    const movePad =
        document.getElementById("movePad");

    const aimPad =
        document.getElementById("aimPad");

    const fireButton =
        document.getElementById("fireButton");

    const dashButton =
        document.getElementById("dashButton");


    if (!movePad || !aimPad) {
        console.warn(
            "DashKill: controles móviles no encontrados."
        );

        return;
    }


    // ========================================================
    // JOYSTICK
    // ========================================================

    function setupJoystick(
        element,
        state
    ) {

        const knob =
            element.querySelector(".joystickKnob");

        function updateJoystick(
            event
        ) {

            const rect =
                element.getBoundingClientRect();

            const centerX =
                rect.left + rect.width / 2;

            const centerY =
                rect.top + rect.height / 2;

            let dx =
                event.clientX - centerX;

            let dy =
                event.clientY - centerY;

            const max =
                48;

            const distance =
                Math.hypot(dx, dy);

            if (distance > max) {

                dx =
                    dx / distance * max;

                dy =
                    dy / distance * max;
            }

            state.x =
                dx / max;

            state.y =
                dy / max;


            if (knob) {

                knob.style.transform =
                    `translate(
                        calc(-50% + ${dx}px),
                        calc(-50% + ${dy}px)
                    )`;
            }
        }


        function reset() {

            state.active = false;
            state.x = 0;
            state.y = 0;
            state.id = null;

            if (knob) {

                knob.style.transform =
                    "translate(-50%, -50%)";
            }
        }


        element.addEventListener(
            "pointerdown",
            event => {

                event.preventDefault();

                state.active = true;
                state.id =
                    event.pointerId;

                element.setPointerCapture(
                    event.pointerId
                );

                updateJoystick(event);
            }
        );


        element.addEventListener(
            "pointermove",
            event => {

                if (
                    !state.active ||
                    event.pointerId !== state.id
                ) {
                    return;
                }

                event.preventDefault();

                updateJoystick(event);
            }
        );


        element.addEventListener(
            "pointerup",
            event => {

                if (
                    event.pointerId === state.id
                ) {
                    reset();
                }
            }
        );


        element.addEventListener(
            "pointercancel",
            reset
        );

        element.addEventListener(
            "lostpointercapture",
            reset
        );
    }


    // ========================================================
    // MOVIMIENTO
    // ========================================================

    setupJoystick(
        movePad,
        mobile.move
    );


    // ========================================================
    // AIM
    // ========================================================

    setupJoystick(
        aimPad,
        mobile.aim
    );


    // ========================================================
    // FIRE
    // ========================================================

    if (fireButton) {

        fireButton.addEventListener(
            "pointerdown",
            event => {

                event.preventDefault();

                mobile.firing = true;

                fireButton.setPointerCapture(
                    event.pointerId
                );
            }
        );


        fireButton.addEventListener(
            "pointerup",
            event => {

                event.preventDefault();

                mobile.firing = false;
            }
        );


        fireButton.addEventListener(
            "pointercancel",
            () => {

                mobile.firing = false;
            }
        );


        fireButton.addEventListener(
            "lostpointercapture",
            () => {

                mobile.firing = false;
            }
        );
    }


    // ========================================================
    // DASH
    // ========================================================

    if (dashButton) {

        dashButton.addEventListener(
            "pointerdown",
            event => {

                event.preventDefault();

                mobile.dashPressed = true;
            }
        );
    }
}


// ============================================================
// CONSUMIR DASH
// ============================================================

export function consumeDashPress() {

    if (!mobile.dashPressed) {
        return false;
    }

    mobile.dashPressed = false;

    return true;
}
