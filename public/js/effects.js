export const effects = [];

export function spawnDashEffect(
    x,
    y,
    angle
) {

    effects.push({

        x,
        y,

        angle,

        life: 0.18,

        maxLife: 0.18
    });
}

export function updateEffects(
    dt
) {

    for (
        let i = effects.length - 1;
        i >= 0;
        i--
    ) {

        effects[i].life -= dt;

        if (
            effects[i].life <= 0
        ) {

            effects.splice(i, 1);
        }
    }
}

export function drawEffects(
    ctx
) {

    for (
        const effect of effects
    ) {

        const alpha =
            effect.life /
            effect.maxLife;

        ctx.save();

        ctx.translate(
            effect.x,
            effect.y
        );

        ctx.rotate(
            effect.angle
        );

        ctx.strokeStyle =
            `rgba(114,242,139,${alpha * .3})`;

        ctx.lineWidth = 5;

        ctx.beginPath();

        ctx.moveTo(-5, -9);
        ctx.lineTo(-48, -9);

        ctx.moveTo(-5, 9);
        ctx.lineTo(-48, 9);

        ctx.stroke();

        ctx.restore();
    }
}
