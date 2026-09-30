import { player } from "./player.js";
import { weapon } from "./shooting.js";

const dashValue =
    document.getElementById(
        "dashValue"
    );

const shotsValue =
    document.getElementById(
        "shotsValue"
    );

export function updateHUD() {

    shotsValue.textContent =
        `${weapon.shots} / 2`;

    if (
        player.dashReady
    ) {

        dashValue.textContent =
            "READY";

        dashValue.classList.add(
            "ready"
        );

    } else {

        dashValue.textContent =
            "EMPTY";

        dashValue.classList.remove(
            "ready"
        );
    }
}
