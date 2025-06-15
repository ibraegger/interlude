let currentAudio = null;
let currentShell = null;

// Shell audio logic with touch & click support
document.querySelectorAll('.shell').forEach(shell => {
  const playPauseAudio = () => {
    const isSame = shell === currentShell;

    if (isSame && currentAudio && !currentAudio.paused) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
      currentShell = null;
    } else {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      const audio = new Audio(shell.dataset.audio);
      // On mobile, ensure audio plays on user interaction
      audio.play().catch(() => {
        // Fallback: maybe show UI or ask user to tap again
      });
      currentAudio = audio;
      currentShell = shell;
    }
  };

  // Use pointer events to unify mouse/touch if supported
  if (window.PointerEvent) {
    shell.addEventListener('pointerdown', playPauseAudio, { passive: true });
  } else {
    // fallback for older devices
    shell.addEventListener('click', playPauseAudio, { passive: true });
    shell.addEventListener('touchstart', playPauseAudio, { passive: true });
  }
});

// Custom cursor (hidden on touch devices)
const cursor = document.createElement('div');
cursor.classList.add('cursor');
document.body.appendChild(cursor);

const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

if (!isTouchDevice) {
  document.addEventListener('mousemove', e => {
    cursor.style.top = `${e.clientY}px`;
    cursor.style.left = `${e.clientX}px`;

    const isHovering = e.target.closest(
      'a, button, input, textarea, [role="button"], .home, .arrow, .shell'
    );
    cursor.classList.toggle('hover', Boolean(isHovering));
  });

  document.addEventListener('mousedown', () => cursor.classList.add('clicked'));
  document.addEventListener('mouseup', () => cursor.classList.remove('clicked'));
} else {
  cursor.style.display = 'none';
}

// Random experience button
const experiences = [
  "experiencia01.html", "experiencia02.html", "experiencia03.html",
  "experiencia04.html", "experiencia05.html", "experiencia06.html",
  "experiencia07.html", "experiencia08.html", "experiencia09.html",
  "experiencia10.html", "experiencia11.html", "experiencia12.html"
];

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

// Tap feedback for touch devices
document.addEventListener('touchstart', e => {
  const tap = document.createElement('div');
  tap.className = 'tap-feedback';
  tap.style.left = `${e.touches[0].clientX}px`;
  tap.style.top = `${e.touches[0].clientY}px`;
  document.body.appendChild(tap);
  setTimeout(() => tap.remove(), 400);
}, { passive: true });

// p5.js canvas setup & resize handling
function setup() {
  // Adjust this based on how many canvases you use and your code specifics
  const c = createCanvas(windowWidth, windowHeight);
  c.id('constellation');  // Or 'stars' depending on your usage
  c.position(0, 0);
  c.style('z-index', '0');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Help modal logic (with touch and click support)
document.addEventListener('DOMContentLoaded', () => {
  const helpBtn = document.getElementById('help-btn');
  const helpModal = document.getElementById('help-modal');
  const closeBtn = document.querySelector('.close-btn');

  if (helpBtn) {
    const openHelp = () => { helpModal.style.display = 'block'; };
    helpBtn.addEventListener('click', openHelp);
    helpBtn.addEventListener('touchstart', openHelp, { passive: true });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => { helpModal.style.display = 'none'; });
  }

  window.addEventListener('click', e => {
    if (e.target === helpModal) {
      helpModal.style.display = 'none';
    }
  });
});