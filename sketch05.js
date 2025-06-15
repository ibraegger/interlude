const audio = document.getElementById('bg-audio');
const playBtn = document.getElementById('play-audio');
const pauseElements = document.querySelectorAll('#pause-audio, .circle-border');
const restartBtn = document.getElementById('restart');
const mainVideo = document.getElementById('main-video');
const smallVideos = document.querySelectorAll('.smallvid');

// Audio controls
playBtn.addEventListener('click', () => {
  audio.play();
});

pauseElements.forEach(el => {
  el.addEventListener('click', () => {
    audio.pause();
  });
});

restartBtn.addEventListener('click', () => {
  audio.currentTime = 0;  // Restart from beginning
  audio.play();
});

audio.loop = true;
audio.volume = 0.5;

// Background video switch on small video click
smallVideos.forEach((vid) => {
  vid.addEventListener('click', () => {
    const newSrc = vid.getAttribute('src');
    mainVideo.setAttribute('src', newSrc);
    mainVideo.play();
  });
});

// Custom cursor element
const cursor = document.createElement('div');
cursor.classList.add('cursor');
document.body.appendChild(cursor);

// Cursor follow mouse
document.addEventListener('mousemove', e => {
  cursor.style.top = `${e.clientY}px`;
  cursor.style.left = `${e.clientX}px`;
});

// Cursor hover effect on clickable elements
const clickable = 'a, button, input, textarea, [role="button"], .smallvid, .circle-border';

document.querySelectorAll(clickable).forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

// Cursor click animation
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