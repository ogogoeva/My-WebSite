const thread = document.querySelector('.topic-thread');
const path = thread.querySelector('path');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let frame;

function drawThread() {
  frame = undefined;
  if (reducedMotion.matches) {
    path.style.strokeDasharray = '';
    path.style.strokeDashoffset = '';
    return;
  }

  const top = thread.getBoundingClientRect().top;
  const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.94 - top) / (window.innerHeight * 0.45)));
  path.style.strokeDasharray = '100';
  path.style.strokeDashoffset = String(100 * (1 - progress));
}

function scheduleDraw() {
  frame ??= requestAnimationFrame(drawThread);
}

window.addEventListener('scroll', scheduleDraw, { passive: true });
window.addEventListener('resize', scheduleDraw);
reducedMotion.addEventListener('change', scheduleDraw);
drawThread();
