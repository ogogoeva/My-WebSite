const thread = document.querySelector('.topic-thread');
const tail = thread.querySelector('.yarn-tail');
const ball = thread.querySelector('.yarn-ball');
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

  const ballX = 70 + progress * 576;
  ball.setAttribute('transform', 'translate(' + ballX + ' 65) rotate(' + (progress * 1160) + ')');
  tail.setAttribute('d', 'M0 75 C' + (ballX * 0.3) + ' 93 ' + (ballX * 0.72) + ' 80 ' + (ballX - 7) + ' 88');
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
