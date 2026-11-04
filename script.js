const live = document.getElementById('liveContainer');
const offers = document.getElementById('offers');
const chatInput = document.getElementById('chatInput');
const chatList = document.getElementById('chatList');
const likeCount = document.getElementById('likeCount');
const cartCount = document.getElementById('cartCount');
const form = document.getElementById('orderForm');
const variant = document.getElementById('variantSelect');
const userTikTok = document.getElementById('userTikTok');
const selectedLabel = document.getElementById('selectedProduct');
const totalEl = document.getElementById('total');
const logOutput = document.getElementById('logOutput');

let likes = 0, cart = 0, selected = null;

const extras = [
  { name: 'Ring Light 10 pulgadas 30% OFF', price: 45 },
  { name: 'Mouse Inalámbrico 40% OFF', price: 35 },
  { name: 'Parlante Bluetooth 25% OFF', price: 90 },
];

// Bitácora: textContent evita que lo que escribe el usuario se ejecute como HTML
function log(tipo, msg) {
  const li = document.createElement('li');
  const hora = document.createElement('time');
  hora.textContent = `[${new Date().toLocaleTimeString('es-BO')}] `;
  const t = document.createElement('b');
  t.textContent = tipo;
  t.dataset.t = tipo;
  li.append(hora, t, `: ${msg}`);
  logOutput.prepend(li);
}

function currentPrice() {
  if (!selected) return 0;
  return Math.round(Number(selected.dataset.price) * Number(variant.selectedOptions[0].dataset.mult));
}
function updateTotal() {
  totalEl.textContent = selected ? `${currentPrice()} BOB` : '-';
}

// ---------- Día 1 ----------
// Un solo listener en #liveContainer cubre las ofertas actuales y las que se agreguen después
live.addEventListener('click', (e) => {
  const buy = e.target.closest('[data-prod]');
  const action = e.target.closest('[data-action]')?.dataset.action;

  if (buy) {
    selected?.classList.remove('selected');
    selected = buy.closest('.offer');
    selected.classList.add('selected');
    cartCount.textContent = ++cart;
    selectedLabel.textContent = buy.dataset.prod;
    updateTotal();
    log('OFERTA_CLICK', `Producto seleccionado: ${buy.dataset.prod}`);
  } else if (action === 'like') {
    likeCount.textContent = ++likes;
    log('LIKE_STREAM', '¡El usuario envió un ❤️ al Live!');
  } else if (action === 'new-offer') {
    addOffer();
  }
});

live.addEventListener('dblclick', (e) => {
  if (e.target.closest('button')) return; // un doble clic sobre un botón ya dispara dos clicks
  const r = live.getBoundingClientRect();
  const h = document.createElement('span');
  h.className = 'heart';
  h.textContent = '❤️';
  h.style.left = `${e.clientX - r.left - 16}px`;
  h.style.top = `${e.clientY - r.top - 16}px`;
  live.append(h);
  h.addEventListener('animationend', () => h.remove());
  likeCount.textContent = ++likes;
  log('LIKE_STREAM', 'Doble clic: corazón enviado al Live');
});

function addOffer() {
  const p = extras.shift();
  if (!p) return;
  offers.insertAdjacentHTML('beforeend', `
    <article class="offer" data-price="${p.price}" data-stock="5">
      <div class="info"><h3>${p.name}</h3><small>${p.price} BOB · quedan <span class="stock">5</span></small></div>
      <button class="btn" data-prod="${p.name}">Comprar</button>
    </article>`);
  log('NUEVA_OFERTA', `Entró al Live: ${p.name}`);
  if (!extras.length) live.querySelector('[data-action="new-offer"]').disabled = true;
}

chatInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    const msg = chatInput.value.trim();
    if (!msg) return;
    const li = document.createElement('li');
    const b = document.createElement('b');
    b.textContent = '@tú ';
    li.append(b, msg);
    chatList.append(li);
    chatList.scrollTop = chatList.scrollHeight;
    chatInput.value = '';
    log('CHAT_ENVIADO', `"${msg}"`);
  } else {
    log('CHAT_INPUT', `Tecleando mensaje: "${chatInput.value}"`);
  }
});

// ---------- Día 2 ----------
variant.addEventListener('change', (e) => {
  updateTotal();
  log('CAMBIO_VARIANTE', `El cliente seleccionó: ${e.target.value}`);
});

form.addEventListener('submit', (e) => {
  e.preventDefault(); // sin esto la página se recarga y se pierde la bitácora
  if (!selected) {
    log('ERROR_PEDIDO', 'Falta elegir un producto del Live');
    return;
  }
  const opt = variant.selectedOptions[0];
  const units = Number(opt.dataset.units);
  const stock = Number(selected.dataset.stock);
  const name = selected.querySelector('h3').textContent;

  if (stock < units) {
    log('STOCK_AGOTADO', `Solo quedan ${stock} de ${name}`);
    return;
  }
  selected.dataset.stock = stock - units;
  selected.querySelector('.stock').textContent = stock - units;
  log('COMPRA_EXITOSA', `Pedido de ${userTikTok.value.trim()}: ${name}, ${opt.value}, ${currentPrice()} BOB 🎉`);
  form.reset();
  updateTotal();
});
