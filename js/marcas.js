/* CRUD de Marcas */
buildLayout('marcas');

const KEY = 'marcas';
let editId = null;

const vList = $('#view-list'), vForm = $('#view-form');
const f = { nombre: $('#nombre'), pais: $('#pais'), anio: $('#anio'), estado: $('#estado') };
const countInst = id => DB.get('instrumentos').filter(i => i.marcaId === id).length;

const table = new DataTable({
  el: $('#table'),
  columns: [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Marca' },
    { key: 'pais', label: 'País' },
    { key: 'anio', label: 'Fundación', sort: r => Number(r.anio) },
    { key: 'inst', label: 'Instrumentos', sort: r => countInst(r.id), render: r => countInst(r.id) },
    { key: 'estado', label: 'Estado', render: r => badge(r.estado) },
    { key: 'accion', label: 'Acción', noSort: true }
  ],
  rows: () => DB.get(KEY),
  onEdit: r => showForm(r),
  onDelete: async r => {
    const n = countInst(r.id);
    if (n > 0) { toast(`No se puede eliminar: tiene ${n} instrumento(s) asociado(s)`, 'bad'); return; }
    if (!(await confirmDialog())) return;
    DB.set(KEY, DB.get(KEY).filter(x => x.id !== r.id));
    table.render();
    toast('Marca eliminada');
  }
});

function showList() { vForm.hidden = true; vList.hidden = false; table.render(); }

function showForm(row) {
  editId = row ? row.id : null;
  $('#form-title').textContent = row ? 'Editar marca' : 'Agregar marca';
  f.nombre.value = row?.nombre ?? '';
  f.pais.value = row?.pais ?? '';
  f.anio.value = row?.anio ?? '';
  f.estado.value = row?.estado ?? 'Activo';
  Object.values(f).forEach(i => setErr(i, ''));
  vList.hidden = true; vForm.hidden = false;
  f.nombre.focus();
}

$('#btn-new').onclick = () => showForm(null);
$('#btn-back').onclick = showList;

$('#form').addEventListener('submit', e => {
  e.preventDefault();
  const nombre = f.nombre.value.trim(), pais = f.pais.value.trim(), anio = Number(f.anio.value);
  const dup = DB.get(KEY).some(x => x.nombre.toLowerCase() === nombre.toLowerCase() && x.id !== editId);
  const ok = [
    setErr(f.nombre, !nombre ? 'El nombre es obligatorio' : dup ? 'Ya existe una marca con ese nombre' : ''),
    setErr(f.pais, pais ? '' : 'El país es obligatorio'),
    setErr(f.anio, anio >= 1500 && anio <= new Date().getFullYear() ? '' : 'Ingresa un año válido')
  ].every(Boolean);
  if (!ok) return;

  const data = { nombre, pais, anio, estado: f.estado.value };
  const list = DB.get(KEY);
  if (editId) {
    const i = list.findIndex(x => x.id === editId);
    list[i] = { ...list[i], ...data };
    toast('Marca actualizada');
  } else {
    list.push({ id: DB.nextId(list), ...data });
    toast('Marca registrada');
  }
  DB.set(KEY, list);
  showList();
});
