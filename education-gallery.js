const viewer = document.querySelector('.education-viewer');
const image = viewer.querySelector('img');
const dots = viewer.querySelector('.education-viewer-dots');
const controls = [...viewer.querySelectorAll('[data-step]')];
let documents = [];
let index = 0;

function showDocument() {
  const link = documents[index];
  image.alt = link.querySelector('img').alt;
  image.src = link.href;
  dots.hidden = documents.length < 2;
  dots.replaceChildren(...documents.map((_, position) => {
    const dot = document.createElement('span');
    dot.classList.toggle('is-current', position === index);
    return dot;
  }));
  controls.forEach(button => { button.hidden = documents.length < 2; });
}

function step(amount) {
  index = (index + amount + documents.length) % documents.length;
  showDocument();
}

document.querySelector('.education').addEventListener('click', event => {
  const link = event.target.closest('.education-diploma');
  if (!link || !viewer.showModal || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const group = link.closest('.education-certificates');
  documents = group ? [...group.querySelectorAll('.education-diploma')] : [link];
  index = documents.indexOf(link);
  showDocument();
  viewer.showModal();
});

controls.forEach(button => button.addEventListener('click', () => step(Number(button.dataset.step))));
viewer.addEventListener('keydown', event => {
  if (documents.length > 1 && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
    step(event.key === 'ArrowLeft' ? -1 : 1);
  }
});
viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
