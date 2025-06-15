const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const video = document.getElementById('trees');
const clickSound = document.getElementById('clickSound');

let currentRect = null;
let cursor = null;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Detect mobile once and reuse
function isMobile() {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const isSmallScreen = window.innerWidth <= 768;
    return isTouch || isSmallScreen;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function drawNewRectangle() {
    const mobile = isMobile();

    const maxSize = mobile ? 200 : 400; // smaller max on mobile
    const minSize = 50;

    const width = getRandomInt(minSize, maxSize);
    const height = getRandomInt(minSize, maxSize);
    const x = getRandomInt(0, canvas.width - width);
    const y = getRandomInt(0, canvas.height - height);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.fillRect(x, y, width, height);
    currentRect = { x, y, width, height };
}

function isClickInsideRect(x, y, rect) {
    return (
        x >= rect.x &&
        x <= rect.x + rect.width &&
        y >= rect.y &&
        y <= rect.y + rect.height
    );
}

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    if (isClickInsideRect(clickX, clickY, currentRect)) {
        drawNewRectangle();
    }

    if (clickSound.paused) {
        clickSound.currentTime = 0;
        clickSound.play().catch(e => console.warn("Can't autoplay audio until user interacts:", e));
    } else {
        clickSound.currentTime = 0;
        clickSound.play();
    }
});

window.addEventListener('resize', () => {
    resizeCanvas();
    drawNewRectangle();
});

function initCanvasDrawing() {
    resizeCanvas();
    drawNewRectangle();
}

document.addEventListener('DOMContentLoaded', () => {
    initCanvasDrawing();

    video.addEventListener('play', () => document.body.classList.add('ready'));

    setTimeout(() => {
        if (!document.body.classList.contains('ready')) {
            document.body.classList.add('ready');
        }
    }, 1000);

    // Create custom cursor
    cursor = document.createElement('div');
    cursor.classList.add('cursor');
    document.body.appendChild(cursor);

    // Handle cursor movement and hover detection
    document.addEventListener('mousemove', e => {
        if (!cursor) return;

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        cursor.style.top = `${mouseY}px`;
        cursor.style.left = `${mouseX}px`;

        // Check canvas rect hover
        const rect = canvas.getBoundingClientRect();
        const canvasX = mouseX - rect.left;
        const canvasY = mouseY - rect.top;

        const isHoveringCanvasRect =
            currentRect &&
            canvasX >= currentRect.x &&
            canvasX <= currentRect.x + currentRect.width &&
            canvasY >= currentRect.y &&
            canvasY <= currentRect.y + currentRect.height;

        // Check DOM hoverables
        const isOverDOMHoverable = e.target.closest('a, button, input, textarea, [role="button"], .home, .arrow');

        // Toggle hover state
        cursor.classList.toggle('hover', isHoveringCanvasRect || isOverDOMHoverable);
    });

    // Click interaction effect
    document.addEventListener('mousedown', () => {
        if (cursor) cursor.classList.add('clicked');
    });

    document.addEventListener('mouseup', () => {
        if (cursor) cursor.classList.remove('clicked');
    });

    // Random experience button
    const randomBtn = document.getElementById('next');
    const experiences = [
        "experiencia01.html",
        "experiencia02.html",
        "experiencia03.html",
        "experiencia04.html",
        "experiencia05.html",
        "experiencia06.html",
        "experiencia07.html",
        "experiencia08.html",
        "experiencia09.html",
        "experiencia10.html",
        "experiencia11.html",
        "experiencia12.html",
    ];

    function getRandomExperience() {
        let nextURL;
        do {
            const randomIndex = Math.floor(Math.random() * experiences.length);
            nextURL = experiences[randomIndex];
        } while (window.location.href.includes(nextURL));
        return nextURL;
    }

    randomBtn.addEventListener('click', () => {
        const randomURL = getRandomExperience();
        window.location.href = randomURL;
    });

    if (window.matchMedia("(pointer: coarse)").matches) {
        if (cursor) cursor.style.display = "none"; // hide cursor on mobile
    }
});