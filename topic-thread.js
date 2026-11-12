const thread = document.querySelector('.topic-thread');
const path = thread.querySelector('path');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const length = path.getTotalLength();
const pointCount = 180;
const tangled = Array.from({ length: pointCount + 1 }, (_, index) => {
  return path.getPointAtLength(length * index / pointCount);
});
const straight = tangled.map((_, index) => {
  const position = index / pointCount;
  return { x: 720 * position, y: 60 + 10 * Math.sin(position * Math.PI * 3) };
});
let frame;

function drawThread() {
  frame = undefined;
  const top = thread.getBoundingClientRect().top;
  const height = window.innerHeight;
  const progress = reducedMotion.matches
    ? 1
    : Math.min(1, Math.max(0, (height * 0.95 - top) / (height * 0.9)));

  const points = tangled.map((point, index) => {
    const target = straight[index];
    const x = point.x + (target.x - point.x) * progress;
    const y = point.y + (target.y - point.y) * progress;
    return x.toFixed(2) + ' ' + y.toFixed(2);
  });
  path.setAttribute('d', 'M' + points.join(' L'));
}

function scheduleDraw() {
  frame ??= requestAnimationFrame(drawThread);
}

window.addEventListener('scroll', scheduleDraw, { passive: true });
window.addEventListener('resize', scheduleDraw);
reducedMotion.addEventListener('change', scheduleDraw);
drawThread();
