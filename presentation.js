const slides = [...document.querySelectorAll('.slide')];
const progress = document.querySelector('#progress');
const count = document.querySelector('#slide-count');
const notesPanel = document.querySelector('#speaker-notes');
const notesText = document.querySelector('#notes-text');
const speakerLabel = document.querySelector('#speaker-label');
const notesButton = document.querySelector('#notes-button');

const notes = [
  'A Toque de Mulher nasceu como uma loja física de cosméticos e cuidados pessoais. Esta capa apresenta a transformação central do projeto: levar para o digital a proximidade e a curadoria que já existiam no atendimento presencial.',
  'O desafio da loja física não era a falta de produtos ou de relacionamento, mas a limitação de alcance, horário e organização dos canais. Catálogo, dúvidas e pedidos podiam ficar distribuídos entre atendimento presencial, redes sociais e WhatsApp. O e-commerce cria um ponto único para a cliente comprar e para a loja administrar a operação.',
  'Nosso público principal são mulheres de 18 a 45 anos interessadas em beleza, cosméticos, skincare e autocuidado. Elas já usam o ambiente digital para pesquisar opções e valorizam praticidade, informação clara e autonomia. A proposta é facilitar a descoberta de produtos e permitir que cada cliente compre no próprio ritmo.',
  'A jornada começa na home, nas categorias ou na busca. A cliente pode conhecer os detalhes, guardar favoritos e montar o carrinho. Depois informa ou seleciona o endereço, calcula o frete, segue para o pagamento e acompanha seus dados e pedidos pelo perfil. Assim, a experiência deixa de depender de várias conversas separadas.',
  'No frontend usamos React, TypeScript e Vite. A API foi construída com Python e FastAPI, e os dados ficam no PostgreSQL da Supabase. A solução se integra ao Stripe para pagamento, ao Google para login, ao Melhor Envio para frete e à BrasilAPI para apoio no preenchimento de endereços. A API concentra as regras e evita que informações sensíveis fiquem expostas na interface.',
  'A plataforma atende tanto a cliente quanto a operação da loja. O acesso usa tokens e separa permissões de cliente e administrador. No checkout, o estoque é reservado e o pagamento é confirmado por um webhook assinado. No painel administrativo, a equipe gerencia produtos, estoque, pedidos e as etapas de envio pelo Melhor Envio.',
  'O MVP já reúne login, catálogo, busca, favoritos, carrinho, cálculo de frete, checkout, pagamento, pedidos, estoque e painel administrativo. O próximo ciclo é concluir a publicação do conjunto, validar a experiência com clientes reais, acompanhar erros, conversão e desempenho, e priorizar melhorias a partir desses dados.',
  'Para encerrar, vamos percorrer o fluxo principal: entrar pela home, abrir um produto, adicionar ao carrinho, calcular o frete e avançar pelo checkout até o pedido. A demonstração conecta tudo o que foi apresentado e mostra o valor da solução funcionando na prática.'
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
  count.innerHTML = `${String(active + 1).padStart(2, '0')} <span>/ ${String(slides.length).padStart(2, '0')}</span>`;
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
progress.style.setProperty('--slide-count', slides.length);

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
