import { supabase } from './supabaseClient';

// ── INGRESOS ──
export async function fetchIngresos() {
  var { data, error } = await supabase.from('ingresos').select('*').order('fecha', { ascending: false });
  if (error) return [];
  return data.map(function(i) { return { ...i, monto: parseFloat(i.monto) }; });
}
export async function insertIngreso(ing) {
  var { error } = await supabase.from('ingresos').insert([{ id:ing.id, socio:ing.socio, fecha:ing.fecha, monto:ing.monto, metodo:ing.metodo, telefono:ing.telefono||'', categoria:ing.categoria||'Aportación socios' }]);
  return !error;
}
export async function deleteIngreso(id) {
  var { error } = await supabase.from('ingresos').delete().eq('id', id); return !error;
}

// ── GASTOS ──
export async function fetchGastos() {
  var { data, error } = await supabase.from('gastos').select('*').order('fecha', { ascending: false });
  if (error) return [];
  return data.map(function(g) { return { ...g, monto: parseFloat(g.monto), devolucion_monto: parseFloat(g.devolucion_monto||0) }; });
}
export async function insertGasto(g) {
  var { error } = await supabase.from('gastos').insert([{
    id:g.id, descripcion:g.descripcion, fecha:g.fecha, monto:g.monto, categoria:g.categoria,
    metodo:g.metodo, tarjeta4:g.tarjeta4||'',
    documento_nombre:g.documento_nombre||'', documento_url:g.documento_url||'',
    devuelto:false, devolucion_monto:0
  }]);
  return !error;
}
export async function deleteGasto(id) {
  var { error } = await supabase.from('gastos').delete().eq('id', id); return !error;
}
export async function marcarDevolucion(id, monto, fecha, docNombre, docUrl) {
  var { error } = await supabase.from('gastos').update({
    devuelto: true, devolucion_monto: monto, devolucion_fecha: fecha,
    devolucion_doc_nombre: docNombre||'', devolucion_doc_url: docUrl||''
  }).eq('id', id);
  return !error;
}

// ── DOCUMENTOS ──
export async function uploadDocumento(file, id) {
  var ext = file.name.split('.').pop();
  var path = id + '.' + ext;
  var { error } = await supabase.storage.from('documentos').upload(path, file, { upsert: true });
  if (error) return null;
  var { data } = supabase.storage.from('documentos').getPublicUrl(path);
  return { nombre: file.name, url: data.publicUrl };
}

// ── PEDIDOS ──
export async function fetchPedidos() {
  var { data, error } = await supabase.from('pedidos').select('*').order('fecha', { ascending: false });
  if (error) return [];
  var { data: costes } = await supabase.from('costes_pedido').select('*');
  var map = {};
  (costes||[]).forEach(function(c) { if(!map[c.pedido_id]) map[c.pedido_id]=[]; map[c.pedido_id].push({...c,monto:parseFloat(c.monto)}); });
  return data.map(function(p) { return {...p, precioVenta:parseFloat(p.precio_venta), costes:map[p.id]||[]}; });
}
export async function insertPedido(p) {
  var { error } = await supabase.from('pedidos').insert([{ id:p.id, cliente:p.cliente, producto:p.producto, fecha:p.fecha, precio_venta:p.precioVenta, estado:p.estado, metodo:p.metodo, telefono:p.telefono||'' }]);
  return !error;
}
export async function deletePedido(id) {
  var { error } = await supabase.from('pedidos').delete().eq('id', id); return !error;
}
export async function updatePedidoEstado(id, estado) {
  var { error } = await supabase.from('pedidos').update({ estado:estado }).eq('id', id); return !error;
}
export async function insertCostePedido(pedidoId, c) {
  var { error } = await supabase.from('costes_pedido').insert([{ id:c.id, pedido_id:pedidoId, concepto:c.concepto, monto:c.monto, categoria:c.categoria }]);
  return !error;
}
export async function updateCostePedido(costeId, c) {
  var { error } = await supabase.from('costes_pedido').update({ concepto:c.concepto, monto:c.monto, categoria:c.categoria }).eq('id', costeId);
  return !error;
}
export async function deleteCostePedido(costeId) {
  var { error } = await supabase.from('costes_pedido').delete().eq('id', costeId); return !error;
}

// ── CATEGORIAS ──
export async function fetchCategorias() {
  var { data, error } = await supabase.from('categorias').select('*').order('id');
  if (error) return { general:[], coste:[] };
  return { general:data.filter(function(c){return c.tipo==='general';}).map(function(c){return c.nombre;}), coste:data.filter(function(c){return c.tipo==='coste';}).map(function(c){return c.nombre;}) };
}
export async function insertCategoria(tipo, nombre) {
  var { error } = await supabase.from('categorias').insert([{ tipo:tipo, nombre:nombre }]); return !error;
}
export async function deleteCategoria(tipo, nombre) {
  var { error } = await supabase.from('categorias').delete().eq('tipo', tipo).eq('nombre', nombre); return !error;
}
