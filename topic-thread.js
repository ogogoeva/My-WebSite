const thread = document.querySelector('.topic-thread');
const strands = [...thread.querySelectorAll('path')].map((path) => {
  const length = path.getTotalLength();
  const points = Array.from({ length: 181 }, (_, index) => path.getPointAtLength(length * index / 180));
  return { path, points };
});
const education = document.querySelector('.education');
const photoThreads = document.querySelectorAll('.about-photo .portrait-thread path');
const heroThread = document.querySelector('.cover .portrait-thread');;
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


  for (const photoPath of photoThreads) {
    const photoTop = photoPath.ownerSVGElement.getBoundingClientRect().top;
    const delay = photoPath.classList.contains('thread-echo') ? (photoPath.previousElementSibling.classList.contains('thread-echo') ? 0.22 : 0.12) : 0;
    const distance = (0.45 - delay) * height - photoTop;
    const reveal = reducedMotion.matches
      ? 1
      : Math.min(1, Math.max(0, distance / (height * 0.7)));
    photoPath.style.strokeDasharray = '100';
    photoPath.style.strokeDashoffset = String(100 * (1 - reveal));
  }

  const drift = reducedMotion.matches ? 0 : Math.min(1, Math.max(0, window.scrollY / height));
  heroThread.style.transform = 'translateY(' + (drift * -12) + 'px) rotate(' + (drift * 1.2) + 'deg)';

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

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const diplomaObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.remove('awaiting-scroll');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.2 });
  for (const diploma of document.querySelectorAll('.education-diploma')) {
    diploma.classList.add('awaiting-scroll');
    diplomaObserver.observe(diploma);
  }
}

if ('IntersectionObserver' in window) {
  const heroObserver = new IntersectionObserver(([entry]) => {
    heroThread.classList.toggle('is-offscreen', !entry.isIntersecting);
  });
  heroObserver.observe(heroThread.closest('.cover'));
}

const aboutSection = document.querySelector('#about');
const aboutPortrait = aboutSection.querySelector('.about-portrait');
const voiceButton = aboutSection.querySelector('.preview-audio summary');
const voicePath = aboutSection.querySelector('.voice-thread path');

function connectVoiceToPortrait() {
  const section = aboutSection.getBoundingClientRect();
  const portrait = aboutPortrait.getBoundingClientRect();
  const button = voiceButton.getBoundingClientRect();
  const startX = portrait.left - section.left + portrait.width * .57;
  const startY = portrait.top - section.top + portrait.height * .25;
  const endX = button.left - section.left;
  const endY = button.top - section.top + button.height / 2;
  const bendX = endX > startX ? (startX + endX) / 2 : Math.min(section.width - 5, portrait.right - section.left);
  voicePath.setAttribute('d', `M${startX} ${startY} C${bendX} ${startY - 12} ${bendX} ${endY} ${endX} ${endY}`);
}

connectVoiceToPortrait();
if ('ResizeObserver' in window) {
  const voiceObserver = new ResizeObserver(connectVoiceToPortrait);
  voiceObserver.observe(aboutSection);
  voiceObserver.observe(aboutPortrait);
  voiceObserver.observe(voiceButton);
}

if ('IntersectionObserver' in window) {
  const voiceReveal = new IntersectionObserver(([entry]) => {
    voicePath.classList.toggle('is-drawn', entry.isIntersecting);
  });
  voiceReveal.observe(voiceButton);
}
