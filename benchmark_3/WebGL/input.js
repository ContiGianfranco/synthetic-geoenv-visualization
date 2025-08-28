export function createInputHandler(canvas) {
    const analog = {
        x: 0,
        y: 0,
        zoom: 0,
    };
    let mouseDown = false;

    canvas.addEventListener('pointermove', (e) => {
        mouseDown = e.pointerType === 'mouse' ? (e.buttons & 1) !== 0 : true;
        if (mouseDown) {
            analog.x += e.movementX;
            analog.y += e.movementY;
        }
    });
    canvas.addEventListener(
        'wheel',
        (e) => {
            // The scroll value varies substantially between user agents / browsers.
            // Just use the sign.
            analog.zoom += Math.sign(e.deltaY);
            e.preventDefault();
            e.stopPropagation();
        },
        { passive: false }
    );

    return () => {
        const out = {
            x: analog.x,
            y: analog.y,
            zoom: analog.zoom,
            touching: mouseDown,
        };
        // Clear the analog values, as these accumulate.
        analog.x = 0;
        analog.y = 0;
        analog.zoom = 0;
        return out;
    };
}