let raindrops = [];
let rainDirection;
let speedMultiplier = 1;
let rainSound;

let mouseMode = 'neutral';
let isMuted = true;

let morningColors, afternoonColors, sunsetColors, nightColors;
let phases = [];
let cloudyOverlay = false;

let inputX = 0;
let inputY = 0;

// Gradient helper
function lerpColorArray(arr1, arr2, t) {
  return arr1.map((c, i) => lerpColor(c, arr2[i], t));
}

// Create gradient
function drawGradient(colors) {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(colors[0], colors[1], inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function drawVerticalGradient(x, y, w, h, c1, c2) {
  noFill();
  for (let i = 0; i <= h; i++) {
    let inter = map(i, 0, h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(x, y + i, x + w, y + i);
  }
}

function preload() {
  soundFormats('mp3', 'ogg');
  rainSound = loadSound('experiencia04/rain.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  rainDirection = createVector(0, 1);

  morningColors = [color(174, 225, 255), color(255, 205, 83)];
  afternoonColors = [color(54, 63, 199), color(98, 202, 255)];
  sunsetColors = [color(255, 94, 98), color(255, 165, 0)];
  nightColors = [color(5, 7, 32), color(62, 51, 129)];
  phases = [morningColors, afternoonColors, sunsetColors, nightColors];

  for (let i = 0; i < 1000; i++) {
    raindrops.push(new Raindrop());
  }

  setupDropSlider();
  setupSpeedSlider();
  setupDirectionControls();
  setupMouseModeButtons();
  setupMuteButton();
  setupCloudyButton();

  rainSound.loop();
  rainSound.setVolume(0);

  // Setup input tracking for both mouse and touch
  setupInputTracking();
}

function draw() {
  let t = parseFloat(document.getElementById('timeSlider').value);
  let base = floor(t);
  let next = min(base + 1, phases.length - 1);
  let localT = t - base;
  let colors = lerpColorArray(phases[base], phases[next], localT);

  drawGradient(colors);

  if (cloudyOverlay) {
    noStroke();
    fill(50, 50, 50, 140);
    rect(0, 0, width, height);

    let grey = color(110, 110, 110, 140);
    let transparent = color(100, 100, 100, 0);

    drawVerticalGradient(0, 0, width, height, grey, transparent);
  }

  for (let drop of raindrops) {
    drop.update();
    drop.display();
  }
}

// Raindrop class
class Raindrop {
  constructor() {
    this.reset();
    this.length = random(10, 30);
    this.baseSpeed = random(2, 5);
    this.opacity = random(80, 150);
  }

  reset() {
    const margin = 400;

    let dx = rainDirection.x;
    let dy = rainDirection.y;

    if (dx === 0 && dy === 0) {
      this.pos = createVector(random(width), random(height));
      return;
    }

    let spawnDir = rainDirection.copy().mult(-1).normalize();

    let x = random(-margin, width + margin);
    let y = random(-margin, height + margin);

    let base = createVector(x, y);
    let offset = spawnDir.copy().mult(random(50, margin));
    this.pos = base.add(offset);
  }

  update() {
    let dir = rainDirection.copy().mult(this.baseSpeed * speedMultiplier);

    // Mouse/touch interaction
    if (mouseMode !== 'neutral') {
      let toInput = p5.Vector.sub(createVector(inputX, inputY), this.pos);
      let distance = toInput.mag();

      if (distance < 80) {
        toInput.normalize();

        let densityFactor = map(raindrops.length, 100, 3000, 0.5, 2);
        let speedFactor = map(speedMultiplier, 0.5, 5, 0.5, 2);
        let mouseEffectStrength = densityFactor * speedFactor;

        if (mouseMode === 'attract') {
          dir.add(toInput.mult(5 * mouseEffectStrength));
        } else if (mouseMode === 'repel') {
          let repel = toInput.mult(-10 * mouseEffectStrength);
          dir.add(repel);
        }
      }
    }

    this.pos.add(dir);

    if (
      this.pos.x < -50 || this.pos.x > width + 50 ||
      this.pos.y < -50 || this.pos.y > height + 50
    ) {
      this.reset();
    }
  }

  display() {
    let tail = p5.Vector.mult(rainDirection, this.length);
    let tailPos = p5.Vector.sub(this.pos, tail);

    stroke(230, 230, 230, this.opacity);
    strokeWeight(3);
    line(this.pos.x, this.pos.y, tailPos.x, tailPos.y);
  }
}

// Volume update
function updateVolume() {
  if (!rainSound || !rainSound.isPlaying()) return;

  if (isMuted) {
    rainSound.setVolume(0);
    return;
  }

  const densityFactor = map(raindrops.length, 100, 3000, 0.2, 1.0);
  const speedFactor = map(speedMultiplier, 0.5, 5, 0.2, 1.0);
  const volume = constrain(densityFactor * speedFactor, 0.1, 1.0);

  rainSound.setVolume(volume);
}

// UI Setup Functions

function setupDropSlider() {
  document.getElementById('dropSlider').addEventListener('input', (event) => {
    const desired = parseInt(event.target.value);
    const current = raindrops.length;

    if (desired > current) {
      for (let i = 0; i < desired - current; i++) raindrops.push(new Raindrop());
    } else {
      raindrops.splice(desired);
    }

    updateVolume();
  });
}

function setupSpeedSlider() {
  document.getElementById('speedSlider').addEventListener('input', (event) => {
    speedMultiplier = parseFloat(event.target.value);
    updateVolume();
  });
}

function setupDirectionControls() {
  const buttons = document.querySelectorAll('.button-panel .circle');

  buttons.forEach(btn => {
    // Use pointer events to unify mouse and touch
    btn.addEventListener('pointerdown', changeDirection);
    btn.addEventListener('touchstart', e => e.preventDefault(), { passive: false }); // prevent double trigger

    function changeDirection(event) {
      event.preventDefault();
      const x = parseInt(btn.dataset.x);
      const y = parseInt(btn.dataset.y);
      let newDir = createVector(x, y);
      if (newDir.mag() > 0) newDir.normalize();
      rainDirection = newDir;

      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
  });
}

function setupMouseModeButtons() {
  const buttons = document.querySelectorAll('#mouseModeButtons button');

  buttons.forEach(btn => {
    btn.addEventListener('pointerdown', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (btn.id === 'attractBtn') mouseMode = 'attract';
      else if (btn.id === 'neutralBtn') mouseMode = 'neutral';
      else if (btn.id === 'repelBtn') mouseMode = 'repel';
    });
    btn.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
  });
}

function setupMuteButton() {
  const muteBtn = document.getElementById('muteButton');
  muteBtn.textContent = '🔇';

  muteBtn.addEventListener('pointerdown', async () => {
    if (getAudioContext().state !== 'running') await userStartAudio();

    isMuted = !isMuted;
    updateVolume();
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
  });
  muteBtn.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
}

function setupCloudyButton() {
  const btn = document.getElementById('cloudyToggleBtn');
  btn.addEventListener('pointerdown', () => {
    cloudyOverlay = !cloudyOverlay;
    btn.textContent = cloudyOverlay ? '🌥️' : '☁️';
  });
  btn.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
}

// Input tracking (mouse + touch unified)
function setupInputTracking() {
  // Mouse move
  window.addEventListener('mousemove', e => {
    inputX = e.clientX;
    inputY = e.clientY;
  });

  // Touch move (only track first touch)
  window.addEventListener('touchmove', e => {
    if (e.touches.length > 0) {
      inputX = e.touches[0].clientX;
      inputY = e.touches[0].clientY;
    }
  }, { passive: true });
}

// Custom cursor for desktop only (optional)
const cursor = document.createElement('div');
cursor.classList.add('cursor');
document.body.appendChild(cursor);

document.addEventListener('mousemove', e => {
  cursor.style.top = `${e.clientY}px`;
  cursor.style.left = `${e.clientX}px`;
});

const clickable = 'a, button, input, textarea, [role="button"], .circle';

document.querySelectorAll(clickable).forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

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