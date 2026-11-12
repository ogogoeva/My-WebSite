const thread = document.querySelector('.topic-thread');
const path = thread.querySelector('path');
const education = document.querySelector('.education');
const photoThreads = document.querySelectorAll('.portrait-thread path');
const diplomas = document.querySelector('.diploma-gallery');
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
    const firstPhoto = photoPath.closest('.cover');
    const reveal = reducedMotion.matches
      ? 1
      : Math.min(1, Math.max(0, ((firstPhoto ? height * 0.45 : height * 0.92) - photoTop) / (height * 0.7)));
    if (photoPath.closest('.about-photo')) {
      const sway = reducedMotion.matches ? 0 : Math.sin(reveal * Math.PI * 2) * 11;
      photoPath.setAttribute('transform', 'translate(0 ' + sway + ')');
    }
    photoPath.style.strokeDasharray = '100';
    photoPath.style.strokeDashoffset = String(100 * (1 - reveal));
  }

  const scrollProgress = Math.min(1, Math.max(0, (height * 0.75 - top) / (height * 0.56)));
  const progress = reducedMotion.matches ? 1 : scrollProgress ** 1.25;

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
