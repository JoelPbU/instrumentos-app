/* ============================================================
   app.js — utilidades compartidas: almacenamiento, sesión,
   layout (menú superior), toasts, modal de confirmación y
   tabla con búsqueda / orden / paginación.
   ============================================================ */

/* ---------- Iconos (SVG en línea) ---------- */
const ICONS = {
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  power: '<path d="M18.4 6.6a9 9 0 1 1-12.8 0"/><path d="M12 2v10"/>',
  dash: '<circle cx="12" cy="12" r="9"/><path d="M12 12l4-4M7 14h.01M8 9h.01M12 7h.01M16 14h.01"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  tag: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.5"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<circle cx="12" cy="12" r="10"/><path d="M8 12h8M13 8l4 4-4 4"/>',
  bag: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  dollar: '<path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  mail: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M22 6l-10 7L2 6"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>'
};
const icon = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

/* ---------- Utilidades ---------- */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => '$ ' + Number(n || 0).toLocaleString('es-CO');
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ---------- Almacenamiento (localStorage) ---------- */
const DB = {
  get(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
  nextId(list) { return list.reduce((m, x) => Math.max(m, x.id), 0) + 1; }
};

function seedData() {
  if (localStorage.getItem('seeded_v1')) return;
  DB.set('marcas', [
    { id: 1, nombre: 'Yamaha',   pais: 'Japón',          anio: 1887, estado: 'Activo' },
    { id: 2, nombre: 'Fender',   pais: 'Estados Unidos', anio: 1946, estado: 'Activo' },
    { id: 3, nombre: 'Gibson',   pais: 'Estados Unidos', anio: 1902, estado: 'Activo' },
    { id: 4, nombre: 'Roland',   pais: 'Japón',          anio: 1972, estado: 'Activo' },
    { id: 5, nombre: 'Pearl',    pais: 'Japón',          anio: 1946, estado: 'Activo' },
    { id: 6, nombre: 'Casio',    pais: 'Japón',          anio: 1946, estado: 'Inactivo' }
  ]);
  DB.set('instrumentos', [
    { id: 1, nombre: 'Guitarra acústica FG800', tipo: 'Cuerda',      marcaId: 1, precio: 1250000, estado: 'Activo' },
    { id: 2, nombre: 'Stratocaster Player',     tipo: 'Cuerda',      marcaId: 2, precio: 4800000, estado: 'Activo' },
    { id: 3, nombre: 'Les Paul Standard',       tipo: 'Cuerda',      marcaId: 3, precio: 9500000, estado: 'Activo' },
    { id: 4, nombre: 'Piano digital P-45',      tipo: 'Teclado',     marcaId: 1, precio: 2300000, estado: 'Activo' },
    { id: 5, nombre: 'Sintetizador JUNO-DS61',  tipo: 'Electrónico', marcaId: 4, precio: 5100000, estado: 'Activo' },
    { id: 6, nombre: 'Batería Export EXX',      tipo: 'Percusión',   marcaId: 5, precio: 3900000, estado: 'Activo' },
    { id: 7, nombre: 'Saxofón alto YAS-280',    tipo: 'Viento',      marcaId: 1, precio: 6200000, estado: 'Inactivo' }
  ]);
  localStorage.setItem('seeded_v1', '1');
}

/* ---------- Sesión ---------- */
const Auth = {
  users() {
    const u = DB.get('users');
    if (!u.length) { u.push({ nombre: 'Administrador', email: 'admin@correo.com', password: '123456' }); DB.set('users', u); }
    return u;
  },
  current() { try { return JSON.parse(sessionStorage.getItem('session')) || JSON.parse(localStorage.getItem('session')); } catch { return null; } },
  login(email, password, remember) {
    const u = this.users().find(x => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
    if (!u) return false;
    const s = JSON.stringify({ nombre: u.nombre, email: u.email });
    sessionStorage.setItem('session', s);
    if (remember) localStorage.setItem('session', s);
    return true;
  },
  logout() { sessionStorage.removeItem('session'); localStorage.removeItem('session'); location.href = 'login.html'; },
  require() { const s = this.current(); if (!s) { location.href = 'login.html'; return null; } return s; }
};

/* ---------- Toast ---------- */
function toast(msg, type = 'ok') {
  let box = $('#toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  box.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

/* ---------- Modal de confirmación ("¿Estás seguro?") ---------- */
function confirmDialog(text = 'Este registro se eliminará definitivamente') {
  return new Promise(resolve => {
    const ov = document.createElement('div');
    ov.className = 'overlay open';
    ov.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
      <div class="warn">!</div><h4>¿Estás seguro?</h4><p>${esc(text)}</p>
      <div class="btns"><button class="btn btn-ok" data-ok>Aceptar</button><button class="btn btn-danger" data-no>Cancelar</button></div></div>`;
    document.body.appendChild(ov);
    const done = v => { ov.remove(); document.removeEventListener('keydown', onKey); resolve(v); };
    const onKey = e => { if (e.key === 'Escape') done(false); };
    document.addEventListener('keydown', onKey);
    $('[data-ok]', ov).onclick = () => done(true);
    $('[data-no]', ov).onclick = () => done(false);
    ov.addEventListener('click', e => { if (e.target === ov) done(false); });
    $('[data-ok]', ov).focus();
  });
}

/* ---------- Layout (menú superior + footer) ---------- */
function buildLayout(active) {
  const s = Auth.require();
  if (!s) return;
  const ini = s.nombre.trim().charAt(0) || '?';
  const first = s.nombre.trim().split(' ')[0];
  const link = (href, key, ic, label) =>
    `<li><a href="${href}" class="${active === key ? 'active' : ''}">${icon(ic)} ${label}</a></li>`;

  $('#navbar').innerHTML = `
    <div class="brand"><span class="logo">${icon('music')}</span><a href="index.html">Armonía</a></div>
    <ul class="nav">
      ${link('index.html', 'dashboard', 'dash', 'Inicio')}
      ${link('instrumentos.html', 'instrumentos', 'music', 'Instrumentos')}
      ${link('marcas.html', 'marcas', 'tag', 'Marcas')}
    </ul>
    <div class="right"><span class="avatar">${esc(ini)}</span><span>${esc(first)}</span>
      <button class="power" id="logout" title="Cerrar sesión" aria-label="Cerrar sesión">${icon('power')}</button></div>`;
  $('#footer').innerHTML = `<span>Armonía · Instrumentos y Marcas © ${new Date().getFullYear()}</span><span>HTML · CSS · JS</span>`;
  $('#logout').onclick = () => Auth.logout();
}

/* ---------- Tabla con buscador, orden y paginación ---------- */
class DataTable {
  /**
   * @param {object} o
   *  el: contenedor · columns: [{key,label,render?,sort?,noSort?}]
   *  rows: () => array · onEdit(row) · onDelete(row)
   */
  constructor(o) {
    Object.assign(this, o);
    this.q = ''; this.size = 10; this.page = 1; this.sortKey = 'id'; this.sortDir = 1;
    this.el.innerHTML = `
      <div class="table-tools">
        <label>Mostrar <select data-size><option>5</option><option selected>10</option><option>25</option><option>50</option></select> entradas</label>
        <label>Buscar: <input type="search" data-q></label>
      </div>
      <div style="overflow-x:auto"><table class="dt"><thead></thead><tbody></tbody></table></div>
      <div class="table-foot"><span data-info></span><div class="pager" data-pager></div></div>`;
    $('[data-size]', this.el).onchange = e => { this.size = +e.target.value; this.page = 1; this.render(); };
    $('[data-q]', this.el).oninput = e => { this.q = e.target.value.trim().toLowerCase(); this.page = 1; this.render(); };
    this.render();
  }
  val(r, c) { return c.sort ? c.sort(r) : r[c.key]; }
  render() {
    const all = this.rows();
    const text = r => this.columns.map(c => String(c.sort ? c.sort(r) : (r[c.key] ?? ''))).join(' ').toLowerCase();
    let rows = this.q ? all.filter(r => text(r).includes(this.q)) : all.slice();
    const sc = this.columns.find(c => c.key === this.sortKey);
    if (sc) rows.sort((a, b) => {
      const x = this.val(a, sc), y = this.val(b, sc);
      return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'es')) * this.sortDir;
    });
    const total = rows.length, pages = Math.max(1, Math.ceil(total / this.size));
    if (this.page > pages) this.page = pages;
    const start = (this.page - 1) * this.size, slice = rows.slice(start, start + this.size);

    $('thead', this.el).innerHTML = '<tr>' + this.columns.map(c => {
      const sorted = c.key === this.sortKey;
      return `<th class="${c.noSort ? 'nosort' : ''} ${sorted ? 'sorted' : ''}" data-k="${c.key}">${esc(c.label)}${c.noSort ? '' : `<span class="arrow">${sorted ? (this.sortDir > 0 ? '▲' : '▼') : '⇅'}</span>`}</th>`;
    }).join('') + '</tr>';
    $$('th[data-k]', this.el).forEach(th => {
      const c = this.columns.find(x => x.key === th.dataset.k);
      if (c.noSort) return;
      th.onclick = () => { this.sortDir = this.sortKey === c.key ? -this.sortDir : 1; this.sortKey = c.key; this.render(); };
    });

    $('tbody', this.el).innerHTML = slice.length ? slice.map(r => '<tr>' + this.columns.map(c => {
      if (c.key === 'accion') return `<td><div class="act">
        <button class="btn btn-primary btn-sm" data-edit="${r.id}" title="Editar" aria-label="Editar">${icon('edit')}</button>
        <button class="btn btn-danger btn-sm" data-del="${r.id}" title="Eliminar" aria-label="Eliminar">${icon('trash')}</button></div></td>`;
      return `<td>${c.render ? c.render(r) : esc(r[c.key])}</td>`;
    }).join('') + '</tr>').join('') : `<tr><td class="empty" colspan="${this.columns.length}">No hay registros para mostrar</td></tr>`;

    $$('[data-edit]', this.el).forEach(b => b.onclick = () => this.onEdit(all.find(r => r.id == b.dataset.edit)));
    $$('[data-del]', this.el).forEach(b => b.onclick = () => this.onDelete(all.find(r => r.id == b.dataset.del)));

    $('[data-info]', this.el).textContent = total
      ? `Mostrando ${start + 1} a ${start + slice.length} de ${total} entradas`
      : 'Mostrando 0 entradas';
    const pg = $('[data-pager]', this.el);
    let h = `<button data-p="${this.page - 1}" ${this.page === 1 ? 'disabled' : ''}>Anterior</button>`;
    for (let p = 1; p <= pages; p++) h += `<button data-p="${p}" class="${p === this.page ? 'cur' : ''}">${p}</button>`;
    h += `<button data-p="${this.page + 1}" ${this.page === pages ? 'disabled' : ''}>Siguiente</button>`;
    pg.innerHTML = h;
    $$('button', pg).forEach(b => b.onclick = () => { if (!b.disabled) { this.page = +b.dataset.p; this.render(); } });
  }
}

const badge = estado => `<span class="badge ${estado === 'Activo' ? 'on' : 'off'}">${esc(estado)}</span>`;

/* ---------- Validación simple de formularios ---------- */
function setErr(input, msg) {
  input.classList.toggle('invalid', !!msg);
  let e = input.parentElement.querySelector('.err');
  if (!e) { e = document.createElement('div'); e.className = 'err'; input.parentElement.appendChild(e); }
  e.textContent = msg || '';
  return !msg;
}

seedData();
