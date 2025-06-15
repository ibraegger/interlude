let canvas;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.id('drawingCanvas');
  background(255);
}

function draw() {
  blendMode(LIGHTEST);
  fill(255, 255, 255, 1); // fade effect
  rect(0, 0, width, height);

  blendMode(NORMAL);
  noStroke();
  fill(0);

  if (touches.length > 0) {
    // Draw for each active touch
    for (let i = 0; i < touches.length; i++) {
      ellipse(touches[i].x, touches[i].y, random(10, 50));
    }
  } else {
    // Draw for mouse pointer if no touches
    ellipse(mouseX, mouseY, random(10, 50));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(255);
}

document.addEventListener('DOMContentLoaded', () => {
  const resetBtn = document.getElementById('resetBtn');
  resetBtn.addEventListener('click', () => {
    background(255);
  });

  const screenshotBtn = document.getElementById('screenshotBtn');
  screenshotBtn.addEventListener('click', () => {
    saveCanvas('myDrawing', 'png');
  });
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