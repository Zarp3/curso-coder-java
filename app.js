
const $ = sel => document.querySelector(sel);
const fmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

function toast(title, icon='success'){
  Swal.fire({ toast:true, position:'top', timer:1500, showConfirmButton:false, icon, title });
}


let products = [];
let filtered = [];
let cart = JSON.parse(localStorage.getItem('cart-v1') || '[]');


function normalizarProducto(p){
  return {
    id: Number(p.id ?? p.ID ?? p.codigo ?? Math.floor(Math.random()*1e9)),
    name: String(p.name ?? p.nombre ?? 'Producto'),
    price: Number(p.price ?? p.precio ?? 0),
    stock: Number(p.stock ?? p.existencias ?? 0),
    category: String(p.category ?? p.categoria ?? 'General'),
    image: p.image ?? p.imagen ?? '📦'
  };
}

function productosFallback(){
  return [
    {id:1, name:'Auriculares Pro X', price:64999, stock:12, category:'Audio', image:'🎧'},
    {id:2, name:'Teclado Mecánico RGB', price:89999, stock:8, category:'Periféricos', image:'⌨️'},
    {id:3, name:'Mouse Inalámbrico', price:34999, stock:22, category:'Periféricos', image:'🖱️'},
    {id:4, name:'Monitor 27" 144Hz', price:279999, stock:5, category:'Monitores', image:'🖥️'},
    {id:5, name:'Silla Gamer', price:199999, stock:4, category:'Mobiliario', image:'💺'}
  ];
}

async function cargarProductos(){
  try{
    const res = await fetch('productos.json', { cache: 'no-store' });
    if(!res.ok) throw new Error('HTTP ' + res.status);
    const raw = await res.json();
    const arr = Array.isArray(raw) ? raw : [];
    products = arr.map(normalizarProducto).filter(p => Number.isFinite(p.price));
    console.log('Productos cargados:', products);
    applyFilters();
  }catch(err){
    console.warn('No se pudo cargar productos.json. Usando datos locales.', err);
    products = productosFallback();
    applyFilters();
    toast('Usando datos locales de ejemplo', 'warning');
  }
}


function renderProducts(list){
  const grid = $('#productGrid');
  grid.innerHTML = '';
  if(!list.length){
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1">No se encontraron productos.</div>`;
  }
  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card__img">${p.image || '📦'}</div>
      <div class="card__body">
        <div style="display:flex; justify-content:space-between; align-items:center">
          <h3 style="margin:0">${p.name}</h3>
          <span class="pill">${p.category}</span>
        </div>
        <div class="price">${fmt.format(p.price)}</div>
        <small class="muted">Stock: ${p.stock}</small>
        <div style="display:flex; gap:8px; margin-top:6px">
          <button class="btn" data-add="${p.id}">Agregar</button>
          <button class="btn btn--ghost" data-details="${p.id}">Detalles</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
  const label = $('#countLabel');
  if (label) label.textContent = `${list.length} resultado${list.length!==1?'s':''}`;
}


function applyFilters(){
  const q = ($('#search')?.value || '').trim().toLowerCase();
  const sort = $('#sort')?.value || '';
  filtered = products.filter(p =>
    p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  );
  switch(sort){
    case 'price-asc': filtered.sort((a,b)=> a.price-b.price); break;
    case 'price-desc': filtered.sort((a,b)=> b.price-a.price); break;
    case 'name-asc': filtered.sort((a,b)=> a.name.localeCompare(b.name)); break;
    case 'name-desc': filtered.sort((a,b)=> b.name.localeCompare(a.name)); break;
  }
  renderProducts(filtered);
}


function saveCart(){ localStorage.setItem('cart-v1', JSON.stringify(cart)); }
function cartTotal(){ return cart.reduce((acc,it)=> acc + it.qty * it.price, 0); }

function addToCart(id){
  const prod = products.find(p=>p.id==id);
  if(!prod) return;
  const line = cart.find(i=> i.id===prod.id);
  const inCartQty = line? line.qty : 0;
  if(inCartQty >= prod.stock){
    return toast('Sin stock suficiente', 'warning');
  }
  if(line){ line.qty++; } else { cart.push({ id: prod.id, name: prod.name, price: prod.price, image: prod.image, qty:1 }); }
  saveCart(); renderCart(); toast('Agregado al carrito');
}

function changeQty(id, delta){
  const i = cart.findIndex(x=>x.id===id);
  if(i===-1) return;
  const prod = products.find(p=>p.id===id);
  const newQty = cart[i].qty + delta;
  if(newQty <= 0){ cart.splice(i,1); }
  else if(newQty > prod.stock){ toast('No hay más stock', 'warning'); return; }
  else { cart[i].qty = newQty; }
  saveCart(); renderCart();
}

function removeLine(id){
  cart = cart.filter(x=>x.id!==id);
  saveCart(); renderCart();
}

function emptyCart(){
  if(!cart.length) return;
  Swal.fire({
    title: 'Vaciar carrito',
    text:'¿Seguro que querés eliminar todos los items?',
    showCancelButton:true, confirmButtonText:'Sí, vaciar', cancelButtonText:'Cancelar'
  }).then(r=>{ if(r.isConfirmed){ cart=[]; saveCart(); renderCart(); } });
}

function renderCart(){
  const cont = $('#cart');
  cont.innerHTML = '';
  if(!cart.length){
    cont.innerHTML = `<div class="empty">Tu carrito está vacío.</div>`;
  } else {
    cart.forEach(it=>{
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div class="thumb">${it.image || '📦'}</div>
        <div class="cart-line">
          <strong>${it.name}</strong>
          <span class="muted">${fmt.format(it.price)} c/u</span>
        </div>
        <div class="cart-actions">
          <button class="btn btn--ghost" data-dec="${it.id}">-</button>
          <span>${it.qty}</span>
          <button class="btn btn--ghost" data-inc="${it.id}">+</button>
          <button class="btn btn--danger" data-del="${it.id}">✕</button>
        </div>
      `;
      cont.appendChild(row);
    });
  }
  const totalEl = $('#grandTotal');
  if (totalEl) totalEl.textContent = fmt.format(cartTotal());
}


async function checkout(){
  if(!cart.length){ return toast('Tu carrito está vacío', 'warning'); }
  const { value: formValues } = await Swal.fire({
    title: 'Finalizar compra',
    html:
      '<input id="swal-name" class="swal2-input" placeholder="Nombre y apellido">' +
      '<input id="swal-email" class="swal2-input" placeholder="Email">' +
      '<input id="swal-address" class="swal2-input" placeholder="Dirección">',
    focusConfirm: false,
    preConfirm: () => {
      const name = document.getElementById('swal-name').value.trim();
      const email = document.getElementById('swal-email').value.trim();
      const address = document.getElementById('swal-address').value.trim();
      if(!name || !email || !address){ Swal.showValidationMessage('Completá todos los datos'); return false; }
      return { name, email, address };
    },
    confirmButtonText:'Pagar', showCancelButton:true
  });
  if(!formValues) return;

  const orderId = Math.random().toString(36).slice(2,8).toUpperCase();
  const total = fmt.format(cartTotal());
  cart = []; saveCart(); renderCart();
  Swal.fire({
    icon:'success',
    title:'¡Compra confirmada!',
    html:`<p>Orden <b>#${orderId}</b> por <b>${total}</b>.</p><p>Te enviamos el resumen por email.</p>`,
    confirmButtonText:'Aceptar'
  });
}


function showDetails(id){
  const p = products.find(x=>x.id==id);
  if(!p) return;
  Swal.fire({
    title: p.name,
    html: `<p class="muted">Categoría: ${p.category}</p>
           <p>Precio: <b>${fmt.format(p.price)}</b></p>
           <p>Stock disponible: <b>${p.stock}</b></p>`,
    confirmButtonText:'Cerrar'
  });
}


document.addEventListener('click', (e)=>{
  const add = e.target.closest('[data-add]');
  const details = e.target.closest('[data-details]');
  const inc = e.target.closest('[data-inc]');
  const dec = e.target.closest('[data-dec]');
  const del = e.target.closest('[data-del]');
  if(add) addToCart(+add.dataset.add);
  if(details) showDetails(+details.dataset.details);
  if(inc) changeQty(+inc.dataset.inc, +1);
  if(dec) changeQty(+dec.dataset.dec, -1);
  if(del) removeLine(+del.dataset.del);
});

$('#search')?.addEventListener('input', applyFilters);
$('#sort')?.addEventListener('change', applyFilters);
$('#btnClearFilters')?.addEventListener('click', ()=>{ const s=$('#search'), o=$('#sort'); if(s) s.value=''; if(o) o.value=''; applyFilters(); });
$('#btnEmpty')?.addEventListener('click', emptyCart);
$('#btnCheckout')?.addEventListener('click', checkout);

(async function init(){
  await cargarProductos();
  renderCart();
})();
