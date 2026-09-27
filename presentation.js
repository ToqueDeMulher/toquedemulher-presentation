const slides = [...document.querySelectorAll('.slide')];
const progress = document.querySelector('#progress');
const count = document.querySelector('#slide-count');
const notesPanel = document.querySelector('#speaker-notes');
const notesText = document.querySelector('#notes-text');
const speakerLabel = document.querySelector('#speaker-label');
const notesButton = document.querySelector('#notes-button');

const notes = [
  'A Toque de Mulher nasceu como uma loja física de cosméticos e cuidados pessoais. A partir dessa experiência, identificamos a oportunidade de levar a vitrine da loja para o ambiente digital. Assim, mais pessoas podem conhecer os produtos sem depender apenas do espaço físico, das redes sociais ou do WhatsApp.',
  'O problema era a limitação de alcance e de horário da loja física. O atendimento já tinha seus clientes, mas catálogo e pedidos estavam espalhados entre diferentes canais. Com o e-commerce, a cliente pode consultar produtos e fazer seu pedido em um só lugar, enquanto a loja centraliza estoque e pagamentos.',
  'Nosso principal público são mulheres de 18 a 45 anos interessadas em beleza, cosméticos e autocuidado. Pensamos especialmente em consumidoras que já pesquisam e compram pela internet. Para elas, é importante encontrar o produto certo sem dificuldade e concluir a compra no próprio ritmo.',
  'Para a interface, usamos React, TypeScript e Tailwind CSS. O backend foi construído com Python e FastAPI, com PostgreSQL para organizar os dados da loja. Também usamos GitHub no versionamento, Figma na prototipação e Mercado Pago para pagamentos. Essas partes trabalham juntas para sustentar a jornada desde a vitrine até o pedido.',
  'Já temos um MVP funcional com os principais fluxos de um e-commerce: cadastro, catálogo, carrinho, checkout, pedidos e estoque. Fizemos testes internos e de usabilidade, mas ainda não uma validação beta formal com clientes reais em produção. Agora o foco é testar em produção, colher retorno das clientes, melhorar a performance e evoluir a plataforma.',
  'Aqui está a página inicial. A cliente pode explorar o catálogo e abrir os detalhes de um produto. Vou adicionar um item ao carrinho e seguir para o checkout e o pedido. Assim mostramos, na prática, como a compra fica centralizada na plataforma.'
];

let active = 0;
let startX = null;

function goTo(index) {
  if (index < 0 || index >= slides.length || index === active) return;
  slides[active].hidden = true;
  slides[active].classList.remove('is-active');
  active = index;
  slides[active].hidden = false;
  slides[active].classList.add('is-active');
  count.innerHTML = `${String(active + 1).padStart(2, '0')} <span>/ 06</span>`;
  speakerLabel.textContent = slides[active].dataset.speaker;
  notesText.textContent = notes[active];
  document.querySelectorAll('.progress button').forEach((button, buttonIndex) => {
    button.setAttribute('aria-current', buttonIndex === active ? 'step' : 'false');
  });
  document.querySelector('#previous-button').disabled = active === 0;
  document.querySelector('#next-button').disabled = active === slides.length - 1;
  history.replaceState(null, '', `#slide-${active + 1}`);
}

function toggleNotes(force) {
  const open = typeof force === 'boolean' ? force : !notesPanel.classList.contains('is-open');
  notesPanel.classList.toggle('is-open', open);
  notesPanel.setAttribute('aria-hidden', String(!open));
  notesButton.setAttribute('aria-pressed', String(open));
}

slides.forEach((slide, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', `Ir para o slide ${index + 1}`);
  button.setAttribute('aria-current', index === 0 ? 'step' : 'false');
  button.addEventListener('click', () => goTo(index));
  progress.append(button);
});

document.querySelector('#previous-button').addEventListener('click', () => goTo(active - 1));
document.querySelector('#next-button').addEventListener('click', () => goTo(active + 1));
notesButton.addEventListener('click', () => toggleNotes());
document.querySelector('#close-notes').addEventListener('click', () => toggleNotes(false));
document.querySelector('#fullscreen-button').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
});

document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); goTo(active + 1); }
  if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) { event.preventDefault(); goTo(active - 1); }
  if (event.key === 'Home') { event.preventDefault(); goTo(0); }
  if (event.key === 'End') { event.preventDefault(); goTo(slides.length - 1); }
  if (event.key.toLowerCase() === 'n') toggleNotes();
  if (event.key.toLowerCase() === 'f' && !event.repeat) {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  }
  if (event.key === 'Escape') toggleNotes(false);
});

document.addEventListener('touchstart', (event) => { startX = event.changedTouches[0]?.screenX ?? null; }, { passive: true });
document.addEventListener('touchend', (event) => {
  if (startX === null) return;
  const distance = event.changedTouches[0].screenX - startX;
  if (Math.abs(distance) > 70) goTo(active + (distance < 0 ? 1 : -1));
  startX = null;
}, { passive: true });

window.addEventListener('hashchange', () => {
  const requested = Number(location.hash.replace('#slide-', '')) - 1;
  if (Number.isInteger(requested)) goTo(requested);
});

const requested = Number(location.hash.replace('#slide-', '')) - 1;
if (Number.isInteger(requested) && requested > 0 && requested < slides.length) goTo(requested);
else {
  document.querySelector('#previous-button').disabled = true;
  notesText.textContent = notes[0];
}
