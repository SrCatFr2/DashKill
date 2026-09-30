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

const movePad =
    document.getElementById("movePad");

const aimPad =
    document.getElementById("aimPad");

const moveKnob =
    movePad.querySelector(".joystickKnob");

const aimKnob =
    aimPad.querySelector(".joystickKnob");

const fireButton =
    document.getElementById("fireButton");

const dashButton =
    document.getElementById("dashButton");

const MAX_DISTANCE = 48;

function updateKnob(
    knob,
    x,
    y
) {
    knob.style.transform =
        `translate(
            calc(-50% + ${x}px),
            calc(-50% + ${y}px)
        )`;
}

function joystickValue(
    event,
    pad
) {

    const rect =
        pad.getBoundingClientRect();

    const centerX =
        rect.left + rect.width / 2;

    const centerY =
        rect.top + rect.height / 2;

    let dx =
        event.clientX - centerX;

    let dy =
        event.clientY - centerY;

    const length =
        Math.hypot(dx, dy);

    if (length > MAX_DISTANCE) {

        dx =
            dx / length *
            MAX_DISTANCE;

        dy =
            dy / length *
            MAX_DISTANCE;
    }

    return {
        x: dx / MAX_DISTANCE,
        y: dy / MAX_DISTANCE,

        dx,
        dy
    };
}

/* =========================================================
   MOVEMENT JOYSTICK
========================================================= */

movePad.addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();

        mobile.move.active = true;
        mobile.move.id = event.pointerId;

        movePad.setPointerCapture(
            event.pointerId
        );

        updateMove(event);
    }
);

movePad.addEventListener(
    "pointermove",
    event => {

        if (
            !mobile.move.active ||
            mobile.move.id !== event.pointerId
        ) {
            return;
        }

        updateMove(event);
    }
);

movePad.addEventListener(
    "pointerup",
    resetMove
);

movePad.addEventListener(
    "pointercancel",
    resetMove
);

function updateMove(event) {

    const value =
        joystickValue(
            event,
            movePad
        );

    mobile.move.x = value.x;
    mobile.move.y = value.y;

    updateKnob(
        moveKnob,
        value.dx,
        value.dy
    );
}

function resetMove() {

    mobile.move.active = false;
    mobile.move.id = null;

    mobile.move.x = 0;
    mobile.move.y = 0;

    updateKnob(
        moveKnob,
        0,
        0
    );
}

/* =========================================================
   AIM JOYSTICK
========================================================= */

aimPad.addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();

        mobile.aim.active = true;
        mobile.aim.id = event.pointerId;

        aimPad.setPointerCapture(
            event.pointerId
        );

        updateAim(event);
    }
);

aimPad.addEventListener(
    "pointermove",
    event => {

        if (
            !mobile.aim.active ||
            mobile.aim.id !== event.pointerId
        ) {
            return;
        }

        updateAim(event);
    }
);

aimPad.addEventListener(
    "pointerup",
    resetAim
);

aimPad.addEventListener(
    "pointercancel",
    resetAim
);

function updateAim(event) {

    const value =
        joystickValue(
            event,
            aimPad
        );

    mobile.aim.x = value.x;
    mobile.aim.y = value.y;

    updateKnob(
        aimKnob,
        value.dx,
        value.dy
    );
}

function resetAim() {

    mobile.aim.active = false;
    mobile.aim.id = null;

    mobile.aim.x = 0;
    mobile.aim.y = 0;

    updateKnob(
        aimKnob,
        0,
        0
    );
}

/* =========================================================
   FIRE
========================================================= */

fireButton.addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();

        mobile.firing = true;
    }
);

fireButton.addEventListener(
    "pointerup",
    () => {
        mobile.firing = false;
    }
);

fireButton.addEventListener(
    "pointercancel",
    () => {
        mobile.firing = false;
    }
);

/* =========================================================
   DASH
========================================================= */

dashButton.addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();

        mobile.dashPressed = true;
    }
);

export function consumeDashPress() {

    if (!mobile.dashPressed) {
        return false;
    }

    mobile.dashPressed = false;

    return true;
}
