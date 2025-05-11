const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;

let trailCanvas = document.createElement("canvas");
trailCanvas.width = width;
trailCanvas.height = height;
let trailCtx = trailCanvas.getContext("2d");

const x0 = width / 2;
const y0 = height / 2;
const factor = 150;
const vars0 = {
    l1: 1,
    l2: 1,
    m1: 1,
    m2: 1,
    g: 10,
};
let vars = structuredClone(vars0);

const dtCalc = 0.002;
const dtFrame = 0.1;
const timeRate = 1;
let a1 = Math.PI + 0.2 * Math.PI * (0.5 - Math.random());
let a2 = Math.PI + 0.2 * Math.PI * (0.5 - Math.random());
let a1v = 0;
let a2v = 0;
let a1a = 0;
let a2a = 0;
let trail = [];
let counter = 0;
let nrFrameBetweenTrail = 5;

let isRunning = true;
let timeoutId;
let showTrail = true;
// let lastTimestamp = null;

function calc2(m1, m2, l1, l2, g, dt, dtFrame, a1, a2, a1v, a2v) {
    let t1 = 0;
    if (t1 < dtFrame) {
        num1 =
            -g * (2 * m1 + m2) * Math.sin(a1) -
            m2 * g * Math.sin(a1 - 2 * a2) -
            2 *
                Math.sin(a1 - a2) *
                m2 *
                (a2v * a2v * l2 + a1v * a1v * l1 * Math.cos(a1 - a2));
        dom1 = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
        a1a = num1 / dom1;
        num2 =
            2 *
            Math.sin(a1 - a2) *
            (a1v * a1v * l1 * (m1 + m2) +
                g * (m1 + m2) * Math.cos(a1) +
                a2v * a2v * l2 * m2 * Math.cos(a1 - a2));
        dom2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
        a2a = num2 / dom2;
        a1v += a1a * dt;
        a2v += a2a * dt;
        a1 += a1v * dt;
        a2 += a2v * dt;
        a1 = a1 % (2 * Math.PI);
        a2 = a2 % (2 * Math.PI);
        t1 += dt;
    }
    return [a1, a2, a1v, a2v];
}
function endPointCalc(x, y, a, L, factor) {
    const x2 = x + L * factor * Math.sin(a);
    const y2 = y + L * factor * Math.cos(a);
    return [x2, y2];
}
function drawLine(x1, y1, x2, y2, color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 10 + radius, 0, Math.PI * 2);
    ctx.fill();
}
function drawPendeln(x1, y1, x2, y2, trail) {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(trailCanvas, 0, 0);

    drawLine(x0, y0, x1, y1, "green", 3);
    drawLine(x1, y1, x2, y2, "green", 3);
    drawCircle(x1, y1, vars.m1, "red");
    drawCircle(x2, y2, vars.m2, "red");
    if (showTrail) {
        trail.map(([x1, y1, x2, y2], index) => {
            drawLine(x0, y0, x1, y1, `rgba(0,255,0,${index / 10})`, 3);
            drawLine(x1, y1, x2, y2, `rgba(0,255,0,${index / 10})`, 3);
            drawCircle(x1, y1, vars.m1, `rgba(255,0,0,${index / 10})`);
            drawCircle(x2, y2, vars.m2, `rgba(255,0,0,${index / 10})`);
        });
    }
}
function updateVar() {
    const form = document.getElementById("form");
    const formData = new FormData(form);
    for (const [key, value] of formData.entries()) {
        vars[key] = isNaN(value) ? value : parseFloat(value);
    }
}
/**
 * dtFrame: time between each two frames. If dtFrame is 0.01s, the frame rate would be 1 / 0.01 = 100
 * dtCalc: time between each two calculations. To make calculation more precise, it is set to a small number, 0.001. It calculate the status after 0.001s. To calculate the status of the next frame, after 0.01s, the calculation need to be repeated for 0.01 / 0.001 = 10 times.
 */
function animate() {
    if (!isRunning) return;
    [a1, a2, a1v, a2v] = calc2(
        vars.m1,
        vars.m2,
        vars.l1,
        vars.l2,
        vars.g,
        dtCalc,
        dtFrame,
        a1,
        a2,
        a1v,
        a2v
    );
    const [x1, y1] = endPointCalc(x0, y0, a1, vars.l1, factor);
    const [x2, y2] = endPointCalc(x1, y1, a2, vars.l2, factor);
    if (counter % nrFrameBetweenTrail === 0) {
        trail = [...trail, [x1, y1, x2, y2]];
        if (trail.length > 10) {
            trail.shift();
        }
    }
    drawPendeln(x1, y1, x2, y2, trail);
    counter++;
    timeoutId = setTimeout(animate, dtFrame);
}
function toggleAnimation() {
    isRunning = !isRunning;
    if (isRunning) {
        animate();
    } else {
        clearTimeout(timeoutId);
    }
}
function resetVar() {
    vars = structuredClone(vars0);
    for (const key in vars0) {
        const el = document.getElementById(key);
        if (el) {
            el.value = vars0[key];
        }
    }
}
function resetPos() {
    if (!isRunning) {
        toggleAnimation();
    }
    a1 = Math.PI + 0.2 * Math.PI * (0.5 - Math.random());
    a2 = Math.PI + 0.2 * Math.PI * (0.5 - Math.random());
    a1v = 0;
    a2v = 0;
    a1a = 0;
    a2a = 0;
}
document.getElementById("form").addEventListener("click", function (event) {
    event.preventDefault();
});
document.getElementById("trace").addEventListener("change", (event) => {
    showTrail = event.target.checked;
});
// document.getElementById("startPause").addEventListener("click", toggleAnimation);
animate();
