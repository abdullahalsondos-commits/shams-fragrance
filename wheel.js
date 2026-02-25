/**
 * Lucky Spin Wheel Logic
 * SHAMS FRAGRANCE - Gamified Discount System
 */

const SECTORS = [
    { label: "5%", color: "#000000", text: "#ffffff", value: 5, type: 'discount' },
    { label: "SORRY", color: "#d4af37", text: "#000000", value: 0, type: 'loss' },
    { label: "10%", color: "#1a1a1a", text: "#ffffff", value: 10, type: 'discount' },
    { label: "PASS", color: "#c4a029", text: "#000000", value: 0, type: 'loss' },
    { label: "15%", color: "#333333", text: "#ffffff", value: 15, type: 'discount' },
    { label: "ALMOST", color: "#b39124", text: "#000000", value: 0, type: 'loss' },
    { label: "20%", color: "#000000", text: "#ffffff", value: 20, type: 'discount' },
    { label: "TRY AGAIN", color: "#997d1e", text: "#000000", value: 0, type: 'loss' }
];

const RAND = (m, M) => Math.random() * (M - m) + m;
const TOT = SECTORS.length;

let EL_WHEEL, EL_SPIN, EL_RESULT;
let ctx;
let dia;
let rad;
const PI = Math.PI;
const TAU = 2 * PI;
let arc;

let angVel = 0; // Angular velocity
let ang = 0;    // Angle in radians
let isSpinning = false;

function drawSector(sector, i) {
    const ang = arc * i;
    ctx.save();
    // COLOR
    ctx.beginPath();
    ctx.fillStyle = sector.color;
    ctx.moveTo(rad, rad);
    ctx.arc(rad, rad, rad, ang, ang + arc);
    ctx.lineTo(rad, rad);
    ctx.fill();

    // BORDER
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // TEXT
    ctx.translate(rad, rad);
    ctx.rotate(ang + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = sector.text;
    ctx.font = "bold 16px 'Montserrat', sans-serif";
    ctx.fillText(sector.label, rad - 20, 10);
    ctx.restore();
}

function initWheel() {
    EL_WHEEL = document.querySelector(".wheel-canvas");
    EL_SPIN = document.querySelector(".spin-btn");
    EL_RESULT = document.querySelector(".wheel-result");

    if (!EL_WHEEL) return;

    // Force dimensions for canvas
    EL_WHEEL.width = 320;
    EL_WHEEL.height = 320;

    ctx = EL_WHEEL.getContext("2d");
    dia = 320;
    rad = dia / 2;
    arc = TAU / SECTORS.length;

    if (!ctx) return;

    ctx.clearRect(0, 0, dia, dia);
    SECTORS.forEach(drawSector);

    // Initial rotation adjustment
    EL_WHEEL.style.transform = `rotate(${-PI / 2}rad)`;

    // Check if already spun
    if (localStorage.getItem('shams_wheel_spun')) {
        disableSpin("NO MORE TRIES!");
        const savedDiscount = localStorage.getItem('shams_discount');
        if (savedDiscount) {
            EL_RESULT.textContent = `You won ${savedDiscount}% OFF!`;
        } else {
            EL_RESULT.textContent = "Better luck next time!";
        }
    } else {
        // Show FAB and trigger toast for first-time visitors
        document.querySelector('.wheel-fab')?.style.setProperty('display', 'flex');
        setTimeout(() => {
            document.querySelector('.wheel-toast')?.classList.add('show');
            setTimeout(() => {
                document.querySelector('.wheel-toast')?.classList.remove('show');
            }, 5000);
        }, 2000);
    }
}

function getIndex() {
    return Math.floor(TOT - (ang / TAU) * TOT) % TOT;
}

function frame() {
    if (!angVel) return;
    angVel *= 0.985; // Faster deceleration for a snappier feel
    if (angVel < 0.001) {
        angVel = 0;
        isSpinning = false;
        finalizeSpin();
    }
    ang += angVel;
    ang %= TAU;
    EL_WHEEL.style.transform = `rotate(${ang - PI / 2}rad)`;
}

function finalizeSpin() {
    const sector = SECTORS[getIndex()];
    if (sector.type === 'discount') {
        EL_RESULT.textContent = `CONGRATS! YOU WON ${sector.label} OFF!`;
        localStorage.setItem('shams_discount', sector.value);
    } else {
        EL_RESULT.textContent = `Hard Luck! Maybe next time.`;
    }
    localStorage.setItem('shams_wheel_spun', 'true');

    // Notify cart to update UI
    window.dispatchEvent(new Event('localStorageChange'));
    if (window.updateCartUI) window.updateCartUI();

    disableSpin("NO MORE TRIES!");
}

function disableSpin(text) {
    if (EL_SPIN) {
        EL_SPIN.disabled = true;
        EL_SPIN.textContent = text || "SPUN";
    }
}

function handleSpinClick() {
    if (isSpinning || localStorage.getItem('shams_wheel_spun')) return;
    isSpinning = true;
    EL_RESULT.textContent = "Spinning...";
    angVel = RAND(3.0, 4.5); // Explosive initial velocity
    animate();
}

function animate() {
    if (!isSpinning && angVel === 0) return;
    frame();
    requestAnimationFrame(animate);
}

// Modal Toggle
window.toggleWheelModal = function () {
    const overlay = document.querySelector('.wheel-overlay');
    if (overlay) {
        initWheel(); // Ensure drawn
        overlay.classList.toggle('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initWheel();

    // FAB click opens modal
    document.querySelector('.wheel-fab')?.addEventListener('click', () => {
        window.toggleWheelModal();
    });

    document.querySelector('.close-wheel')?.addEventListener('click', window.toggleWheelModal);

    document.querySelector('.spin-btn')?.addEventListener('click', handleSpinClick);

    // Close on overlay click
    document.querySelector('.wheel-overlay')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('wheel-overlay')) window.toggleWheelModal();
    });
});
