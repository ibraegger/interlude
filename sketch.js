
window.addEventListener('DOMContentLoaded', () => {
  // Create the custom cursor
  const cursor = document.createElement('div');
  cursor.classList.add('cursor');
  document.body.appendChild(cursor);

  // Move the cursor
  document.addEventListener('mousemove', e => {
    cursor.style.top = `${e.clientY}px`;
    cursor.style.left = `${e.clientX}px`;
  });

  // Add hover class for clickable elements
  const clickable = 'a, button, input, textarea, [role="button"]';
  document.querySelectorAll(clickable).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });

  // Click animation
  document.addEventListener('mousedown', () => cursor.classList.add('clicked'));
  document.addEventListener('mouseup', () => cursor.classList.remove('clicked'));

  // Random position for links (optional)
  const isMobile = window.innerWidth <= 768;
  const links = document.querySelectorAll('.link-container a');

  links.forEach((link, i) => {
    const minX = 40;
    const maxX = isMobile ? window.innerWidth - 300 : window.innerWidth - 460;
    const randomX = Math.random() * (maxX - minX) + minX;
    const spacingY = isMobile ? i * 40 + 30 : i * 60 + 40;

    link.style.left = `${randomX}px`;
    link.style.top = `${spacingY}px`;
  });

  document.querySelectorAll('.exp-header').forEach(header => {
  let touchStartY = 0;
  let touchMoved = false;

  header.addEventListener('touchstart', e => {
    touchStartY = e.touches[0].clientY;
    touchMoved = false;
  });

  header.addEventListener('touchmove', e => {
    const touchCurrentY = e.touches[0].clientY;
    if (Math.abs(touchCurrentY - touchStartY) > 10) { // threshold for drag
      touchMoved = true;
    }
  });

  header.addEventListener('touchend', e => {
    if (touchMoved) {
      // Find the extra-container sibling
      const expItem = header.closest('.exp-item');
      const extra = expItem.querySelector('.extra-container');
      if (extra.style.maxHeight && extra.style.maxHeight !== '0px') {
        // Hide if visible
        extra.style.maxHeight = '0';
        extra.style.opacity = '0';
      } else {
        // Show if hidden
        extra.style.maxHeight = '900px';  // same as hover max height
        extra.style.opacity = '1';
      }
    }
  });
});
});
