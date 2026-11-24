/* CRUD de Instrumentos */
buildLayout('instrumentos');

const KEY = 'instrumentos';
const marcas = () => DB.get('marcas');
const marcaNombre = id => (marcas().find(m => m.id === id) || {}).nombre || '— (marca eliminada)';
let editId = null;

const vList = $('#view-list'), vForm = $('#view-form');
const f = { nombre: $('#nombre'), tipo: $('#tipo'), marca: $('#marca'), precio: $('#precio'), estado: $('#estado') };

const table = new DataTable({
  el: $('#table'),
  columns: [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Instrumento' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'marca', label: 'Marca', sort: r => marcaNombre(r.marcaId), render: r => esc(marcaNombre(r.marcaId)) },
    { key: 'precio', label: 'Precio', sort: r => Number(r.precio), render: r => money(r.precio) },
    { key: 'estado', label: 'Estado', render: r => badge(r.estado) },
    { key: 'accion', label: 'Acción', noSort: true }
  ],
  rows: () => DB.get(KEY),
  onEdit: r => showForm(r),
  onDelete: async r => {
    if (!(await confirmDialog())) return;
    DB.set(KEY, DB.get(KEY).filter(x => x.id !== r.id));
    table.render();
    toast('Instrumento eliminado');
  }
});

function fillMarcas(selected) {
  const list = marcas();
  f.marca.innerHTML = '<option value="">Seleccione...</option>' +
    list.map(m => `<option value="${m.id}">${esc(m.nombre)}${m.estado === 'Inactivo' ? ' (inactiva)' : ''}</option>`).join('');
  f.marca.value = selected ?? '';
}

function showList() { vForm.hidden = true; vList.hidden = false; table.render(); }

function showForm(row) {
  if (!row && !marcas().length) { toast('Primero registra al menos una marca', 'bad'); return; }
  editId = row ? row.id : null;
  $('#form-title').textContent = row ? 'Editar instrumento' : 'Agregar instrumento';
  f.nombre.value = row?.nombre ?? '';
  f.tipo.value = row?.tipo ?? '';
  fillMarcas(row?.marcaId);
  f.precio.value = row?.precio ?? '';
  f.estado.value = row?.estado ?? 'Activo';
  Object.values(f).forEach(i => setErr(i, ''));
  vList.hidden = true; vForm.hidden = false;
  f.nombre.focus();
}

$('#btn-new').onclick = () => showForm(null);
$('#btn-back').onclick = showList;

$('#form').addEventListener('submit', e => {
  e.preventDefault();
  const nombre = f.nombre.value.trim(), precio = f.precio.value;
  const dup = DB.get(KEY).some(x => x.nombre.toLowerCase() === nombre.toLowerCase() && x.id !== editId);
  const ok = [
    setErr(f.nombre, !nombre ? 'El nombre es obligatorio' : dup ? 'Ya existe un instrumento con ese nombre' : ''),
    setErr(f.tipo, f.tipo.value ? '' : 'Selecciona un tipo'),
    setErr(f.marca, f.marca.value ? '' : 'Selecciona una marca'),
    setErr(f.precio, precio === '' || Number(precio) < 0 ? 'Ingresa un precio válido (0 o más)' : '')
  ].every(Boolean);
  if (!ok) return;

  const data = { nombre, tipo: f.tipo.value, marcaId: +f.marca.value, precio: Number(precio), estado: f.estado.value };
  const list = DB.get(KEY);
  if (editId) {
    const i = list.findIndex(x => x.id === editId);
    list[i] = { ...list[i], ...data };
    toast('Instrumento actualizado');
  } else {
    list.push({ id: DB.nextId(list), ...data });
    toast('Instrumento registrado');
  }
  DB.set(KEY, list);
  showList();
});
