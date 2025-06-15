let rings = 40;
let segments = 60;
let baseRadius = 100;
let crushAmount = 0; // from 0 (normal) to 1 (fully crushed)

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  frameRate(30);
}

function draw() {
  background(10);
  orbitControl();

  noFill();
  stroke(255);

  rotateX(PI / 5);
  rotateY(millis() * 0.00005);

  let time = millis() * 0.00005;
  crushAmount = map(sin(time), -1, 1.5, 0, 1.5);

  let pointsGrid = [];

  for (let i = 0; i < rings; i++) {
    let yNormalized = i / (rings - 1);
    let y = map(yNormalized, 0, 1, -200, 200);

    // Tapering
    let taper = 1;
    if (i < 2) taper = map(i, 0, 1, 0.8, 1);
    else if (i > rings - 3) taper = map(i, rings - 2, rings - 1, 1, 0.6);

    // Crushing effect
    let squish = 1 - crushAmount * 0.7;
    y *= squish;

    let crushWobble = map(sin(i * 0.5 + millis() * 0.001), -1, 1, -10, 10) * crushAmount;
    let radius = baseRadius * taper + crushWobble;

    let ringPoints = [];

    for (let j = 0; j < segments; j++) {
      let angle = map(j, 0, segments, 0, TWO_PI);
      let x = radius * cos(angle);
      let z = radius * sin(angle);
      ringPoints.push(createVector(x, y, z));
    }

    pointsGrid.push(ringPoints);
  }

  // Draw horizontal rings
  for (let i = 0; i < rings; i++) {
    beginShape();
    for (let pt of pointsGrid[i]) {
      vertex(pt.x, pt.y, pt.z);
    }
    endShape(CLOSE);
  }

  // Draw vertical lines
  for (let j = 0; j < segments; j++) {
    beginShape();
    for (let i = 0; i < rings; i++) {
      let pt = pointsGrid[i][j % segments];
      vertex(pt.x, pt.y, pt.z);
    }
    endShape();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// --- Touch event handlers for rotation and pinch zoom ---

function touchStarted() {
  if (touches.length === 1) {
    lastTouchX = touches[0].x;
    lastTouchY = touches[0].y;
    isDragging = true;
  } else if (touches.length === 2) {
    lastTouchDist = dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
    isDragging = false;
  }
  return false;
}

function touchMoved() {
  if (touches.length === 1 && isDragging) {
    let dx = touches[0].x - lastTouchX;
    let dy = touches[0].y - lastTouchY;
    
    rotationY += dx * 0.01;
    rotationX += dy * 0.01;
    
    rotationX = constrain(rotationX, -PI/2, PI/2);
    
    lastTouchX = touches[0].x;
    lastTouchY = touches[0].y;
  } else if (touches.length === 2) {
    let currentDist = dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
    let diff = currentDist - lastTouchDist;
    
    baseRadius += diff * 0.2;
    baseRadius = constrain(baseRadius, 50, 200);
    
    lastTouchDist = currentDist;
  }
  return false;
}

function touchEnded() {
  if (touches.length < 2) {
    isDragging = false;
  }
  return false;
}


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
