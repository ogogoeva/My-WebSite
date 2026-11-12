const thread = document.querySelector('.topic-thread');
const strands = [...thread.querySelectorAll('path')].map((path) => {
  const length = path.getTotalLength();
  const points = Array.from({ length: 181 }, (_, index) => path.getPointAtLength(length * index / 180));
  return { path, points };
});
const education = document.querySelector('.education');
const photoThreads = document.querySelectorAll('.portrait-thread path');
const diplomas = document.querySelector('.diploma-gallery');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let frame;

function drawThread() {
  frame = undefined;
  const top = thread.getBoundingClientRect().top;
  const height = window.innerHeight;
  const timeline = education.getBoundingClientRect();
  const timelineProgress = reducedMotion.matches
    ? 1
    : Math.min(1, Math.max(0, (height * 0.76 - timeline.top) / Math.max(1, timeline.height)));
  education.style.setProperty('--thread-progress', (timelineProgress * 100) + '%');
  const galleryTop = diplomas.getBoundingClientRect().top;
  const galleryProgress = Math.min(1, Math.max(0, 1 - galleryTop / height));
  diplomas.style.setProperty('--diploma-drift', ((galleryProgress - 0.5) * 16) + 'px');


  for (const photoPath of photoThreads) {
    const photoTop = photoPath.ownerSVGElement.getBoundingClientRect().top;
    const reveal = reducedMotion.matches
      ? 1
      : Math.min(1, Math.max(0, (height * 0.45 - photoTop) / (height * 0.7)));
    photoPath.style.strokeDasharray = '100';
    photoPath.style.strokeDashoffset = String(100 * (1 - reveal));
  }

  const scrollProgress = Math.min(1, Math.max(0, (height * 0.75 - top) / (height * 0.56)));
  const progress = reducedMotion.matches ? 1 : scrollProgress ** 1.25;

  for (const [strandIndex, { path, points }] of strands.entries()) {
    const release = Math.min(1, Math.max(0, (progress - strandIndex * 0.12) / 0.76));
    const line = points.map((point, index) => {
      const fraction = index / (points.length - 1);
      const x = point.x + (720 * fraction - point.x) * release;
      const targetY = 60 + (strandIndex - 1) * (15 + 20 * fraction) + 4 * Math.sin(fraction * Math.PI * 2);
      const y = point.y + (targetY - point.y) * release;
      return x.toFixed(1) + ' ' + y.toFixed(1);
    });
    path.setAttribute('d', 'M' + line.join(' L'));
  }
}

function scheduleDraw() {
  frame ??= requestAnimationFrame(drawThread);
}

window.addEventListener('scroll', scheduleDraw, { passive: true });
window.addEventListener('resize', scheduleDraw);
reducedMotion.addEventListener('change', scheduleDraw);
drawThread();

const firstQuestion = document.querySelector('#faq details');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  firstQuestion.open = false;
  const firstQuestionObserver = new IntersectionObserver(([entry], observer) => {
    if (entry.isIntersecting) {
      firstQuestion.open = true;
      observer.disconnect();
    }
  }, { threshold: 0.6 });
  firstQuestionObserver.observe(firstQuestion);
  document.querySelector('#faq').addEventListener('click', () => {
    firstQuestionObserver.disconnect();
  }, { once: true });
}
