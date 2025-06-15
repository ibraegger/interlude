const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  center = { x: canvas.width / 2, y: canvas.height / 2 };
});

let isNightMode = true; // start in night mode
let canvasBgColor = 'rgb(0, 0, 0)';          // night mode background
let blobStrokeColor = 'rgb(255, 255, 255)';  // night mode stroke
let targetBgColor = canvasBgColor;
let targetStrokeColor = blobStrokeColor;

let lastTime = 0;

document.getElementById('themeToggle').checked = true;

const nav = document.querySelector('nav');

const cursor = document.createElement('div');
cursor.classList.add('cursor');
document.body.appendChild(cursor);

// Follow mouse
document.addEventListener('mousemove', e => {
    cursor.style.top = `${e.clientY}px`;
    cursor.style.left = `${e.clientX}px`;
});

// Hover effects for clickable elements
const clickable = 'a, button, input, textarea, [role="button"], .toggle-slider';

document.querySelectorAll(clickable).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

// Click animation
document.addEventListener('mousedown', () => cursor.classList.add('clicked'));
document.addEventListener('mouseup', () => cursor.classList.remove('clicked'));

function updateColors(isNight) {
  const color = isNight ? 'white' : 'black'; // Define color based on mode

  // Cursor color
  cursor.style.color = color;

  // Nav container text color
  nav.style.color = color;

  // Specific nav elements text color
  document.querySelectorAll('.home, .t_text, .arrow').forEach(el => {
    el.style.color = color;
  });
}

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

updateColors(isNightMode); // initial call

document.getElementById('themeToggle').addEventListener('change', (e) => {
  isNightMode = e.target.checked;
  targetBgColor = isNightMode ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
  targetStrokeColor = isNightMode ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)';

  updateColors(isNightMode);
});

// Blob object class
class Blob {
  constructor(baseRadius, lineWidth = 1, points = 30) {
    this.baseRadius = baseRadius;
    this.lineWidth = lineWidth;
    this.points = points;
    this.time = 0;
    this.angles = Array.from({ length: points }, () => Math.random() * Math.PI * 2).sort((a, b) => a - b);
  }

  breathingScale(t) {
    const phase = t % 16;

    if (phase < 4) {
      // Expand from 1 → 2
      return 1 + (phase / 4); 
    } else if (phase < 8) {
      // Hold at 2
      return 2;
    } else if (phase < 12) {
      // Shrink from 2 → 1
      return 2 - ((phase - 8) / 4);
    } else {
      // Hold at 1
      return 1;
    }
  }

  update() {
    this.time += 0.02;
  }

  draw(scale, strokeStyle) {
    ctx.beginPath();
    const pointsArray = [];

    for (let i = 0; i < this.points; i++) {
      const angle = this.angles[i];
      const wave = Math.sin(i * 0.6 + this.time) * 10;
      const radius = this.baseRadius * scale + wave;

      const x = center.x + Math.cos(angle) * radius;
      const y = center.y + Math.sin(angle) * radius;
      pointsArray.push({ x, y });
    }

    ctx.moveTo(pointsArray[0].x, pointsArray[0].y);

    for (let i = 0; i < pointsArray.length; i++) {
      const curr = pointsArray[i];
      const next = pointsArray[(i + 1) % pointsArray.length];
      const midX = (curr.x + next.x) / 2;
      const midY = (curr.y + next.y) / 2;
      ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
    }

    ctx.closePath();

    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = this.lineWidth;
    ctx.stroke();
  }
}

// Generate blobs
const blobs = [];

function generateBlobs() {
  blobs.length = 0; // Clear previous blobs
  const isSmallScreen = window.innerWidth < 728;

  if (isSmallScreen) {
    // Mobile: fewer blobs, smaller radius, thinner strokes
    const baseSize = 35;
    const count = 14;
    for (let i = 0; i < count; i++) {
      blobs.push(new Blob(baseSize + i * 8, 5 - i * 0.5, 30));
    }
  } else {
    // Desktop: original settings
    const baseSize = 50;
    const count = 19;
    for (let i = 0; i < count; i++) {
      blobs.push(new Blob(baseSize + i * 15, 8 - i * 0.7, 30));
    }
  }
}

// Call once initially:
generateBlobs();

// Call again on resize:
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  center = { x: canvas.width / 2, y: canvas.height / 2 };
  generateBlobs(); // regenerate with new screen size
});


// Helper functions for color interpolation
function parseRGB(rgb) {
  const result = rgb.match(/\d+/g);
  return result ? result.map(Number) : [0, 0, 0];
}

function lerpColor(a, b, t) {
  const [ar, ag, ab] = parseRGB(a);
  const [br, bg, bb] = parseRGB(b);

  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);

  return `rgb(${rr}, ${rg}, ${rb})`;
}

// Animation loop
function animate(time = 0) {
  requestAnimationFrame(animate);

  const deltaTime = time - lastTime;
  lastTime = time;
  const lerpFactor = 0.05;

  canvasBgColor = lerpColor(canvasBgColor, targetBgColor, lerpFactor);
  blobStrokeColor = lerpColor(blobStrokeColor, targetStrokeColor, lerpFactor);

  ctx.fillStyle = canvasBgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const seconds = time / 1000;

  for (const blob of blobs) {
    blob.update();
    const scale = blob.breathingScale(seconds);
    blob.draw(scale, blobStrokeColor);
  }
}


animate();

