const output = document.getElementById('output');
let lineLimitPx = calculateLineLimit();
let text = '';
let isCarriageReturning = false;
let dingPlayed = false;
let introFinished = false;

const soundFiles = {
  key: [ 
    'experiencia02/key1.wav', 'experiencia02/key3.wav',
    'experiencia02/key4.wav', 'experiencia02/key6.wav',
    'experiencia02/key7.wav', 'experiencia02/key8.wav', 'experiencia02/key9.wav',
    'experiencia02/key10.wav', 'experiencia02/key11.wav', 'experiencia02/key12.wav',
    'experiencia02/key13.wav', 'experiencia02/key14.wav'
  ],
  space: 'experiencia02/spacebar.wav',
  ding: 'experiencia02/ding.wav',
  return: 'experiencia02/return.wav'
};

const caret = document.createElement('span');
caret.className = 'caret';
output.appendChild(caret);

const measureSpan = document.createElement('span');
measureSpan.style.position = 'absolute';
measureSpan.style.visibility = 'hidden';
measureSpan.style.whiteSpace = 'pre';
measureSpan.style.font = getComputedStyle(document.querySelector('.text'))?.font || '18px Courier Prime, monospace';
document.body.appendChild(measureSpan);

const returnIndicator = document.getElementById('return-indicator');

const introElement = document.getElementById('introText');
const introText = [
  "This space is yours. No audience, no need to polish — just type.",
  "Let the words come out messy, tangled, or tender.",
  "Like a real typewriter, there’s no delete key — and that’s the point.",
  "Mistakes are welcomed. They’re little happenings of the soul and signs that something real passed through you.",
  "When you erase the page, it forgets completely.",
  "Until then, what you write stays — just for you."
];

let introLineIndex = 0;
let introCharIndex = 0;
let currentParagraph;

function calculateLineLimit() {
  const mobileBreakpoint = 768;
  if (window.innerWidth <= mobileBreakpoint) {
    return window.innerWidth * 0.86;  // 86% on mobile
  } else {
    return window.innerWidth * 0.48;   // 50% on desktop
  }
}

window.addEventListener('resize', () => {
  lineLimitPx = calculateLineLimit();
});

function typeIntroText() {
  if (introLineIndex >= introText.length) {
    introFinished = true;
    return;
  }

  if (introCharIndex === 0) {
    currentParagraph = document.createElement('p');
    currentParagraph.className = 'text';
    introElement.appendChild(currentParagraph);
  }

  const currentLine = introText[introLineIndex];
  const char = currentLine[introCharIndex];

  if (char) {
    currentParagraph.textContent += char;

    if (char.trim()) {
      const keySound = document.createElement('audio');
      keySound.src = soundFiles.key[Math.floor(Math.random() * soundFiles.key.length)];
      keySound.volume = 0.45 + Math.random() * 0.05;
      keySound.playbackRate = 0.95 + Math.random() * 0.1;
      keySound.play();
    }

    measureSpan.textContent = currentLine.slice(0, introCharIndex + 1);
    if (measureSpan.offsetWidth >= lineLimitPx - 60 && !dingPlayed) {
      const ding = document.createElement('audio');
      ding.src = soundFiles.ding;
      ding.volume = 1;
      ding.play();
      dingPlayed = true;
    }

    introCharIndex++;
    setTimeout(typeIntroText, 80);
  } else {
    const returnSound = document.createElement('audio');
    returnSound.src = soundFiles.return;
    returnSound.volume = 1;
    returnSound.play();

    isCarriageReturning = true;
    dingPlayed = false;

    returnIndicator?.classList.add('visible');

    setTimeout(() => {
      isCarriageReturning = false;
      returnIndicator?.classList.remove('visible');
      introLineIndex++;
      introCharIndex = 0;
      setTimeout(typeIntroText, 100);
    }, 1000);
  }
}

function waitToStart() {
  document.removeEventListener('keydown', waitToStart);
  document.removeEventListener('click', waitToStart);
  typeIntroText();
}

document.addEventListener('keydown', waitToStart);
document.addEventListener('click', waitToStart);

document.addEventListener('keydown', (e) => {
  if (!introFinished) return;
  if (e.repeat || isCarriageReturning) return;
  if (e.key === 'Backspace') return;

  const maxLines = 25;
  if (text.split('\n').length >= maxLines) return;

  if (e.key.length !== 1 && e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault();

  const currentLine = text.split('\n').pop();
  const testText = currentLine + (e.key === 'Enter' ? '' : e.key);

  measureSpan.textContent = testText;
  const testWidth = measureSpan.offsetWidth;

  if (testWidth >= lineLimitPx) {
    text += '\n';
    isCarriageReturning = true;
    dingPlayed = false;

    const returnSound = document.createElement('audio');
    returnSound.src = soundFiles.return;
    returnSound.volume = 1;
    returnSound.play();

    returnIndicator?.classList.add('visible');

    setTimeout(() => {
      isCarriageReturning = false;
      returnIndicator?.classList.remove('visible');
    }, 1000);

    return;
  }

  if (testWidth >= lineLimitPx - 60 && !dingPlayed) {
    const ding = document.createElement('audio');
    ding.src = soundFiles.ding;
    ding.volume = 1;
    ding.play();
    dingPlayed = true;
  }

  if (e.key === 'Enter') {
    text += '\n';
    dingPlayed = false;

    const returnSound = document.createElement('audio');
    returnSound.src = soundFiles.return;
    returnSound.volume = 1;
    returnSound.play();

    returnIndicator?.classList.add('visible');
    setTimeout(() => returnIndicator?.classList.remove('visible'), 1000);
  } else {
    text += e.key;

    const soundSrc = e.key === ' ' ? soundFiles.space :
      soundFiles.key[Math.floor(Math.random() * soundFiles.key.length)];

    const keySound = document.createElement('audio');
    keySound.src = soundSrc;
    keySound.volume = 0.45 + Math.random() * 0.05;
    keySound.playbackRate = 0.95 + Math.random() * 0.1;
    keySound.play();
  }

  output.innerHTML = '';
  text.split('\n').forEach(line => {
    const p = document.createElement('p');
    p.className = 'text';
    p.textContent = line || ' ';
    output.appendChild(p);
  });
  output.lastChild?.appendChild(caret);
  output.parentElement.scrollTop = output.parentElement.scrollHeight;
});

// Cursor logic unchanged
const cursor = document.createElement('div');
cursor.classList.add('cursor');
document.body.appendChild(cursor);

document.addEventListener('mousemove', e => {
  if (!cursor) return;
  cursor.style.top = `${e.clientY}px`;
  cursor.style.left = `${e.clientX}px`;
});

document.querySelectorAll('a, button, input, textarea, [role="button"], .home, .arrow').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

document.addEventListener('mousedown', () => cursor.classList.add('clicked'));
document.addEventListener('mouseup', () => cursor.classList.remove('clicked'));

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

randomBtn?.addEventListener('click', () => {
  const randomURL = getRandomExperience();
  window.location.href = randomURL;
});