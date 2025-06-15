// ==== Global Variables ====
let currentHoverAudio = null;
let ambienceStarted = false;
const cursor = document.createElement('div');
const ambience = new Audio('audio/ambience.wav');
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

// ==== Ambience Setup ====
ambience.loop = true;
ambience.volume = 0.3;

// Start ambience on first interaction
window.addEventListener('click', () => {
  if (!ambienceStarted) {
    ambience.play();
    ambienceStarted = true;
  }
}, { once: true });

// ==== Hover Audio for Glitch Boxes ====
if (!window.matchMedia("(pointer: coarse)").matches) {
  document.querySelectorAll('.glitch-box').forEach(box => {
    const hoverAudio = new Audio(box.dataset.sound);
    hoverAudio.loop = true;
    hoverAudio.volume = 0.4;

    box.addEventListener('mouseenter', () => {
      if (currentHoverAudio && currentHoverAudio !== hoverAudio) {
        currentHoverAudio.pause();
        currentHoverAudio.currentTime = 0;
      }
      hoverAudio.play();
      currentHoverAudio = hoverAudio;
    });

    box.addEventListener('mouseleave', () => {
      hoverAudio.pause();
      hoverAudio.currentTime = 0;
      if (currentHoverAudio === hoverAudio) currentHoverAudio = null;
    });
  });
}

// ==== Custom Cursor Setup ====
cursor.classList.add('cursor');
document.body.appendChild(cursor);

// Hide cursor on mobile
if (window.matchMedia("(pointer: coarse)").matches) {
  cursor.style.display = "none";
}

// ==== Cursor Movement & Hover Detection ====
document.addEventListener('mousemove', e => {
  const { clientX: x, clientY: y } = e;
  cursor.style.top = `${y}px`;
  cursor.style.left = `${x}px`;

  const hoverableSelectors = [
    '.glitch-box', '.home', '.arrow', 'a', 'button',
    'input', 'textarea', '[role="button"]', '.image-layer', 'img'
  ];

  const isDOMHoverable = hoverableSelectors.some(sel => e.target.closest(sel));

  let isCanvasHover = false;
  if (typeof canvas !== 'undefined' && canvas && window.currentRect) {
    const rect = canvas.getBoundingClientRect();
    const canvasX = x - rect.left;
    const canvasY = y - rect.top;
    const r = currentRect;
    isCanvasHover = canvasX >= r.x && canvasX <= r.x + r.width &&
                    canvasY >= r.y && canvasY <= r.y + r.height;
  }

  cursor.classList.toggle('hover', isDOMHoverable || isCanvasHover);
});

// Click interaction visual feedback
document.addEventListener('mousedown', () => cursor.classList.add('clicked'));
document.addEventListener('mouseup', () => cursor.classList.remove('clicked'));

// ==== Random Experience Navigation ====
const randomBtn = document.getElementById('next');
if (randomBtn) {
  randomBtn.addEventListener('click', () => {
    let nextURL;
    do {
      nextURL = experiences[Math.floor(Math.random() * experiences.length)];
    } while (window.location.href.includes(nextURL));
    window.location.href = nextURL;
  });
}

document.querySelectorAll('.glitch-box').forEach(box => {
  let tapped = false;
  const hoverAudio = new Audio(box.dataset.sound);
  hoverAudio.loop = true;
  hoverAudio.volume = 0.4;

  const poem = box.querySelector('.poem');
  const imageLayer = box.querySelector('.image-layer');

  // Desktop hover already handled, so only run this on touch devices
  if (window.matchMedia("(pointer: coarse)").matches) {
    imageLayer.addEventListener('click', () => {
      tapped = !tapped;

      // Toggle poem
      poem.style.opacity = tapped ? '1' : '0';

      // Toggle audio
      if (tapped) {
        hoverAudio.play();
      } else {
        hoverAudio.pause();
        hoverAudio.currentTime = 0;
      }
    });
  }
});