// ----- CANVAS SETUP -----
const constellationCanvas = document.getElementById('constellation');
const ctx = constellationCanvas.getContext('2d');
const starsCanvas = document.getElementById('stars');
const starsCtx = starsCanvas.getContext('2d');
const panel = document.getElementById('control-panel');
const togglePanelBtn = document.getElementById('toggle-panel');
const randomizeBtn = document.getElementById('randomize-btn');
const finalizeBtn = document.getElementById('finalize-btn');
const clearBtn = document.getElementById('clear-btn');
const screenshotBtn = document.getElementById('screenshot-btn');
const addDotBtn = document.getElementById('add-dot-btn');
const WORK_AREA_MARGIN = 40; // pixels from top, bottom, and left

let dots = [];
let connections = [];
let fadingConnections = [];
let selectedDot = null;
let draggingDot = null;
let justDragged = false;
let mouseX = 0.5, mouseY = 0.5;
let finalized = false;
let glowProgress = 0;
let twinkles = new Map();
let trailEnd = { x: 0, y: 0 };
let hoverDot = null;
let pings = [];


function resizeCanvas() {
  constellationCanvas.width = window.innerWidth;
  constellationCanvas.height = window.innerHeight;
  starsCanvas.width = window.innerWidth;
  starsCanvas.height = window.innerHeight;
  panel.style.maxHeight = window.innerHeight + 'px';
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ----- CREATE GLOWING DOTS -----
function generateDots(count = 25) {
  dots = [];
  connections = [];
  fadingConnections = [];
  twinkles.clear();
  finalized = false;
  glowProgress = 0;

  const WORK_AREA_MARGIN = 40;
  const rightEdge = panel.offsetLeft - WORK_AREA_MARGIN;
  const leftEdge = WORK_AREA_MARGIN;
  const topEdge = WORK_AREA_MARGIN;
  const bottomEdge = constellationCanvas.height - WORK_AREA_MARGIN;

  const usableWidth = rightEdge - leftEdge;
  const usableHeight = bottomEdge - topEdge;

  for (let i = 0; i < count; i++) {
    const x = leftEdge + Math.random() * usableWidth;
    const y = topEdge + Math.random() * usableHeight;
    dots.push({ x, y, radius: 6, glow: 8 });
    twinkles.set(i, 1);
    setTimeout(() => twinkles.delete(i), 1000);
  }
}

// ----- DRAWING -----
function draw() {
  ctx.clearRect(0, 0, constellationCanvas.width, constellationCanvas.height);

  ctx.lineWidth = 1.5;
  connections.forEach(pair => {
    ctx.beginPath();
    ctx.moveTo(pair[0].x, pair[0].y);
    ctx.lineTo(pair[1].x, pair[1].y);
    ctx.strokeStyle = finalized ? `rgba(255, 255, 255, ${Math.min(1, glowProgress)})` : 'rgba(255, 255, 255, 0.4)';
    ctx.shadowColor = finalized ? 'white' : 'transparent';
    ctx.shadowBlur = finalized ? 10 * Math.min(1, glowProgress) : 0;
    ctx.stroke();
    ctx.shadowBlur = 0;
  });

  for (let i = fadingConnections.length - 1; i >= 0; i--) {
    const fc = fadingConnections[i];
    fc.opacity -= 0.01;
    if (fc.opacity <= 0) {
      fadingConnections.splice(i, 1);
    } else {
      ctx.strokeStyle = `rgba(255, 255, 255, ${fc.opacity})`;
      ctx.beginPath();
      ctx.moveTo(fc.from.x, fc.from.y);
      ctx.lineTo(fc.to.x, fc.to.y);
      ctx.stroke();
    }
  }

  // Trail
  if (selectedDot && !finalized && !draggingDot) {
    const tx = mouseX * constellationCanvas.width;
    const ty = mouseY * constellationCanvas.height;
    trailEnd.x += (tx - trailEnd.x) * 0.2;
    trailEnd.y += (ty - trailEnd.y) * 0.2;
    ctx.beginPath();
    ctx.moveTo(selectedDot.x, selectedDot.y);
    ctx.lineTo(trailEnd.x, trailEnd.y);
    ctx.strokeStyle = hoverDot ? 'rgba(100,255,100,0.4)' : 'rgba(255,255,255,0.3)';
    ctx.stroke();
  }

  // Dots
  dots.forEach((dot, i) => {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
    ctx.fillStyle = hoverDot === dot ? '#aaffaa' : 'white';
    ctx.shadowColor = 'white';
    ctx.shadowBlur = twinkles.has(i) ? 20 : dot.glow;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  if (finalized && glowProgress < 1) {
    glowProgress += 0.01;
  }

  // Ping effects (radiating rings)
  pings.forEach((ping, i) => {
    const progress = ping.age / ping.lifetime;
    if (progress >= 1) {
      pings.splice(i, 1);
      return;
    }

    ctx.beginPath();
    ctx.arc(ping.x, ping.y, ping.radius * progress, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - progress})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ping.age++;
  });

  requestAnimationFrame(draw);
}

// ----- INTERACTION -----
function getNearestDot(x, y) {
  return dots.find(dot => {
    const dx = dot.x - x;
    const dy = dot.y - y;
    return Math.sqrt(dx * dx + dy * dy) < 15;
  });
}

constellationCanvas.addEventListener('mousemove', (e) => {
  mouseX = e.clientX / window.innerWidth;
  mouseY = e.clientY / window.innerHeight;

  const nearest = getNearestDot(e.clientX, e.clientY);
  hoverDot = selectedDot && nearest && nearest !== selectedDot ? nearest : null;

  if (draggingDot) {
    const rightBound = panel.offsetLeft - WORK_AREA_MARGIN;
    const leftBound = WORK_AREA_MARGIN;
    const topBound = WORK_AREA_MARGIN;
    const bottomBound = constellationCanvas.height - WORK_AREA_MARGIN;

    const newX = Math.min(rightBound, Math.max(leftBound, e.clientX));
    const newY = Math.min(bottomBound, Math.max(topBound, e.clientY));

    if (draggingDot.x !== newX || draggingDot.y !== newY) {
      justDragged = true;
    }

    draggingDot.x = newX;
    draggingDot.y = newY;
  }

  if (selectedDot && !draggingDot && !finalized) {
    const hoverTarget = getNearestDot(mouseX * window.innerWidth, mouseY * window.innerHeight);
    
    if (hoverTarget && hoverTarget !== selectedDot) {
    // Avoid ping spamming by checking last ping time
      const now = Date.now();
      if (!hoverTarget.lastPing || now - hoverTarget.lastPing > 5000) {
        pings.push({
          x: hoverTarget.x,
          y: hoverTarget.y,
          radius: 20,
          age: 0,
          lifetime: 120
        });
      hoverTarget.lastPing = now;
      }
    }
  }
});

constellationCanvas.addEventListener('mousedown', (e) => {
  if (finalized) return;
  justDragged = false;
  const clicked = getNearestDot(e.clientX, e.clientY);

  if (clicked) {
    draggingDot = clicked;
    if (selectedDot === clicked) {
      selectedDot = null;
      trailEnd = { x: 0, y: 0 };
    }
  }
});

constellationCanvas.addEventListener('mouseup', () => {
  draggingDot = null;
});

function removeConnection(dotA, dotB) {
  for (let i = 0; i < connections.length; i++) {
    const [a, b] = connections[i];
    if ((a === dotA && b === dotB) || (a === dotB && b === dotA)) {
      connections.splice(i, 1);
      fadingConnections.push({ from: a, to: b, opacity: 0.4 });
      return true;
    }
  }
  return false;
}

constellationCanvas.addEventListener('click', (e) => {
  if (finalized || justDragged) return;
  const clickedDot = getNearestDot(e.clientX, e.clientY);
  if (!clickedDot) return;

  if (!selectedDot) {
    selectedDot = clickedDot;
    trailEnd = { x: clickedDot.x, y: clickedDot.y };
  } else {
    if (selectedDot === clickedDot) {
      selectedDot = null;
      trailEnd = { x: 0, y: 0 };
    } else {
      if (!removeConnection(selectedDot, clickedDot)) {
        connections.push([selectedDot, clickedDot]);
      }
      selectedDot = null;
      trailEnd = { x: 0, y: 0 };
    }
  }
});

// ----- PANEL ACTIONS -----
randomizeBtn.addEventListener('click', generateDots);

finalizeBtn.addEventListener('click', () => {
  finalized = !finalized;
  glowProgress = finalized ? 0 : glowProgress;
});

clearBtn.addEventListener('click', () => {
  connections = [];
  fadingConnections = [];
  finalized = false;
  glowProgress = 0;
});

screenshotBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  const screenshot = document.createElement('canvas');
  const ctxScreen = screenshot.getContext('2d');
  screenshot.width = constellationCanvas.width;
  screenshot.height = constellationCanvas.height;
  ctxScreen.drawImage(starsCanvas, 0, 0);
  ctxScreen.drawImage(constellationCanvas, 0, 0);
  link.href = screenshot.toDataURL();
  link.download = 'constellation.png';
  link.click();
});

addDotBtn.addEventListener('click', () => {
  const WORK_AREA_MARGIN = 40;
  const rightEdge = panel.offsetLeft - WORK_AREA_MARGIN;
  const leftEdge = WORK_AREA_MARGIN;
  const topEdge = WORK_AREA_MARGIN;
  const bottomEdge = constellationCanvas.height - WORK_AREA_MARGIN;

  const usableWidth = rightEdge - leftEdge;
  const usableHeight = bottomEdge - topEdge;

  const x = leftEdge + Math.random() * usableWidth;
  const y = topEdge + Math.random() * usableHeight;

  const index = dots.length;
  dots.push({ x, y, radius: 6, glow: 8 });
  twinkles.set(index, 1);
  setTimeout(() => twinkles.delete(index), 1000);
});

// ----- STARFIELD -----
let starArray = [];
function initStars(count = 500) {
  starArray = [];
  for (let i = 0; i < count; i++) {
    starArray.push({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.6 + 0.4,
      depth: Math.random() * 2 + 0.5,
      twinkle: Math.random() * Math.PI * 2
    });
  }
}

function animateStars() {
  starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
  const parallaxX = (mouseX - 0.5) * 200;
  const parallaxY = (mouseY - 0.5) * 200;

  for (const star of starArray) {
    const x = star.x * starsCanvas.width + parallaxX * star.depth;
    const y = star.y * starsCanvas.height + parallaxY * star.depth;
    const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(star.twinkle));

    starsCtx.beginPath();
    starsCtx.arc(x, y, star.size * twinkle, 0, Math.PI * 2);
    starsCtx.fillStyle = `rgba(255, 255, 255, ${0.3 + 0.6 * Math.random()})`;
    starsCtx.shadowColor = 'white';
    starsCtx.shadowBlur = 2;
    starsCtx.fill();

    star.twinkle += 0.01;
  }

  requestAnimationFrame(animateStars);
}

const bgMusic = document.getElementById('bg-music');
bgMusic.volume = 0.15;

document.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.play();
  }
});

const cursor = document.createElement('div');
cursor.classList.add('cursor');
 document.body.appendChild(cursor);

// Follow mouse
document.addEventListener('mousemove', e => {
    cursor.style.top = `${e.clientY}px`;
    cursor.style.left = `${e.clientX}px`;
});

// Hover effects for clickable elements
const clickable = 'a, button, input, textarea, [role="button"]';

document.querySelectorAll(clickable).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

// Click animation
document.addEventListener('mousedown', () => cursor.classList.add('clicked'));
document.addEventListener('mouseup', () => cursor.classList.remove('clicked'));

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

// ----- INIT -----
initStars();
generateDots();
draw();
animateStars();