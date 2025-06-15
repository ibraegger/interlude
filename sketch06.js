const fadeInConfig = {
  fadeDuration: 2000,
  delayBetweenLines: 1500,
  fadeOutDuration: 300,
};

let fadeInTimeouts = [];
let resetTimeout;

function autoScroll(speed = 0.2) {
  let scrollY = 0;

  function step() {
    scrollY += speed;
    window.scrollTo({ top: scrollY, behavior: "smooth" });

    if (scrollY < document.body.scrollHeight - window.innerHeight) {
      requestAnimationFrame(step);
    }
  }

  step();
}

function animatePoem({ fadeDuration, delayBetweenLines } = {}) {
  fadeInTimeouts.forEach(clearTimeout);
  fadeInTimeouts = [];

  const verses = document.querySelectorAll(".poem p");
  let totalDelay = 0;

  // Detect mobile (adjust threshold as you want)
  const isMobile = window.innerWidth <= 768;

  verses.forEach((verse) => {
    const lines = verse.dataset.original
      ? verse.dataset.original.split("<br>")
      : verse.innerHTML.split("<br>");

    if (!verse.dataset.original) {
      verse.dataset.original = verse.innerHTML;
    }

    verse.innerHTML = "";

    lines.forEach((line) => {
      const span = document.createElement("span");
      span.innerHTML = line.trim();
      span.classList.add("poem-line");

      // Adjust offset range for mobile vs desktop
      let offset;
      if (isMobile) {
        offset = Math.floor(Math.random() * 200) - 50; // smaller offset on mobile
      } else {
        offset = Math.floor(Math.random() * 800) - 100; // larger offset on desktop
      }

      span.style.display = "block";
      span.style.transform = `translateX(${offset}px)`;
      span.style.opacity = "0";
      span.style.transition = `opacity ${fadeDuration}ms ease, transform ${fadeDuration}ms ease`;
      span.style.transitionDelay = `${totalDelay}ms`;

      verse.appendChild(span);

      // Queue fade-in
      const timeoutId = setTimeout(() => {
        span.style.opacity = "1";
      }, totalDelay + 10);

      fadeInTimeouts.push(timeoutId);
      totalDelay += delayBetweenLines;
    });
  });
}

let lastResetTime = 0;
const resetCooldown = 500;

function resetAndAnimatePoem() {
  const now = Date.now();
  if (now - lastResetTime < resetCooldown) return;
  lastResetTime = now;

  fadeInTimeouts.forEach(clearTimeout);
  fadeInTimeouts = [];

  const lines = Array.from(document.querySelectorAll(".poem-line")).reverse();

  lines.forEach((line, index) => {
    line.style.transition = `opacity ${fadeInConfig.fadeOutDuration}ms ease`;
    setTimeout(() => {
      line.style.opacity = "0";
    }, index * 100);
  });

  const totalFadeTime = lines.length * 100 + 100;

  resetTimeout = setTimeout(() => {
    document.querySelectorAll(".poem p").forEach((p) => (p.innerHTML = ""));
    animatePoem(fadeInConfig);
    window.scrollTo({ top: 0 });
    autoScroll(0.1);
  }, totalFadeTime);
}

window.addEventListener("DOMContentLoaded", () => {
  animatePoem(fadeInConfig);
});

window.addEventListener("mousemove", () => {
  resetAndAnimatePoem();
});

const cursor = document.createElement("div");
cursor.classList.add("cursor");
document.body.appendChild(cursor);

document.addEventListener("mousemove", (e) => {
  cursor.style.top = `${e.clientY}px`;
  cursor.style.left = `${e.clientX}px`;
});

const clickable = 'a, button, input, textarea, [role="button"]';

document.querySelectorAll(clickable).forEach((el) => {
  el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
  el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
});

document.addEventListener("mousedown", () => cursor.classList.add("clicked"));
document.addEventListener("mouseup", () => cursor.classList.remove("clicked"));

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