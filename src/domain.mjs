export const COP = (value) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
const number = (v, min, max, integer = false) => typeof v === "number" && Number.isFinite(v) && v >= min && v <= max && (!integer || Number.isInteger(v));
const insist = (v, message) => {
  if (!v) throw new Error(message);
};
const stamp = () => (/* @__PURE__ */ new Date()).toISOString();
export function initialState() {
  return { version: 1, lot: "M01", created: "2026-11-14T14:00:00.000Z", deliveries: [{ id: "A", name: "Familia A", received: 12, accepted: 12 }, { id: "B", name: "Familia B", received: 0, accepted: 0 }], completed: false, confirmed: 0, sales: [], payments: [], audit: [], climate: "sun" };
}
export function totals(s) {
  const kg = s.deliveries.reduce((a2, d) => a2 + d.accepted, 0);
  const bags = s.completed ? Math.floor(kg * 0.125 / 0.05 + 1e-9) : 0;
  const sold = s.sales.reduce((a2, x) => a2 + x.sold, 0), collected = s.sales.reduce((a2, x) => a2 + x.collected, 0);
  const revenue = collected * 4500, costs = s.completed ? 8e4 : 0, surplus = revenue - costs;
  const fund = Math.round(Math.max(0, surplus) * 0.1), pool = Math.max(0, surplus) - fund;
  const a = kg ? Math.round(pool * s.deliveries[0].accepted / kg) : 0;
  const allocations = { A: a, B: pool - a };
  const paid = { A: 0, B: 0 };
  s.payments.forEach((p) => {
    paid.A += p.A;
    paid.B += p.B;
  });
  return { kg, bags, sold, collected, revenue, costs, surplus, fund, pool, allocations, paid, pending: bags - sold, uncollected: sold - collected, due: { A: allocations.A - paid.A, B: allocations.B - paid.B } };
}
export function compare(bags = 40, kg = 12) {
  insist(number(bags, 0, 50, true), "Las bolsas deben estar entre 0 y 50.");
  insist(number(kg, 0, 20), "La entrega debe estar entre 0 y 20 kg.");
  const surplus = bags * 4500 - 8e4, fund = Math.round(Math.max(0, surplus) * 0.1);
  return { fresh: kg * 3e3, later: Math.round((Math.max(0, surplus) - fund) * kg / 20), deficit: Math.max(0, -surplus), pending: 50 - bags };
}
export function energy(climate, kg = 20) {
  const sunny = climate === "sun", irradiance = sunny ? 4.5 : 1.2, solar = 16 * irradiance * 0.4 * 0.5 * 2, biogas = (sunny ? 1.2 : 0.5) * 6 * 0.45;
  const need = kg * 0.875 * 2358 / 3600, battery = sunny ? 86 : climate === "cloud" ? 55 : 28, capacity = (solar + biogas) / (0.875 * 2358 / 3600);
  return { solar, biogas, need, battery, capacity, decision: battery < 30 ? "Aplazar recepción" : capacity < kg ? "Reducir la carga" : "Iniciar lote" };
}
export function complete(s) {
  insist(!s.completed, "El lote ya está completado.");
  insist(energy(s.climate).decision === "Iniciar lote", "El escenario no permite iniciar. Revisa el panel del centro.");
  const n = structuredClone(s);
  n.deliveries[1].received = 8;
  n.deliveries[1].accepted = 8;
  n.completed = true;
  n.audit.push({ time: stamp(), action: "Pedido completado; recepción simulada de 8 kg de Familia B." });
  return n;
}
export function confirmOrder(s, bags) {
  insist(number(bags, 0, 50, true), "Pedido inválido.");
  insist(bags >= totals(s).sold, "El pedido no puede ser menor que lo vendido.");
  const n = structuredClone(s);
  n.confirmed = bags;
  n.audit.push({ time: stamp(), action: `Pedido confirmado: ${bags} bolsas (simulación).` });
  return n;
}
export function registerSale(s, sold, collected) {
  insist(s.completed, "Primero completa el pedido.");
  insist(number(sold, 0, 50, true) && number(collected, 0, 50, true) && sold + collected > 0, "Ingresa bolsas enteras; al menos una venta o un cobro.");
  const t = totals(s);
  insist(t.sold + sold <= t.bags, "No puedes vender más bolsas que las producidas.");
  insist(t.sold + sold <= s.confirmed, "Confirma el pedido antes de registrar esta venta.");
  insist(t.collected + collected <= t.sold + sold, "No puedes cobrar más bolsas que las vendidas.");
  const n = structuredClone(s);
  n.sales.push({ id: globalThis.crypto.randomUUID(), time: stamp(), sold, collected });
  n.audit.push({ time: stamp(), action: `Venta: ${sold} bolsas nuevas; cobro: ${collected} bolsas.` });
  return n;
}
export function settle(s) {
  const t = totals(s);
  insist(t.due.A + t.due.B > 0, "No hay un nuevo saldo para liquidar.");
  const n = structuredClone(s);
  n.payments.push({ time: stamp(), A: t.due.A, B: t.due.B });
  n.audit.push({ time: stamp(), action: `Liquidación simulada: A ${COP(t.due.A)}, B ${COP(t.due.B)}.` });
  return n;
}
export function correct(s, id, accepted, reason) {
  insist(!s.sales.length && !s.payments.length, "Después de una venta, la corrección requiere revisión de la asociación. No se modifica una liquidación existente.");
  const d = s.deliveries.find((x) => x.id === id);
  insist(d && number(accepted, 0, d.received), "El peso aceptado no puede superar el recibido.");
  insist(typeof reason === "string" && reason.trim().length >= 5 && reason.length <= 300, "Escribe un motivo de 5 a 300 caracteres.");
  const n = structuredClone(s);
  n.deliveries.find((x) => x.id === id).accepted = accepted;
  n.audit.push({ time: stamp(), action: `Corrección ${id}: ${d.accepted} a ${accepted} kg. Motivo: ${reason.trim()}` });
  return n;
}
export function validateState(s) {
  insist(s && s.version === 1 && s.lot === "M01", "El respaldo no corresponde a Tulpa v1 / M01.");
  insist(typeof s.completed === "boolean" && ["sun", "rain", "cloud"].includes(s.climate) && number(s.confirmed, 0, 50, true), "Configuración inválida.");
  insist(typeof s.created === "string" && !isNaN(Date.parse(s.created)), "Fecha inválida.");
  insist(Array.isArray(s.deliveries) && s.deliveries.length === 2, "Entregas inválidas.");
  for (let i = 0; i < 2; i++) {
    const d = s.deliveries[i];
    insist(d.id === ["A", "B"][i] && d.name === `Familia ${d.id}` && number(d.received, 0, [12, 8][i]) && number(d.accepted, 0, d.received), "Peso o familia inválidos.");
  }
  for (const key of ["sales", "payments", "audit"]) insist(Array.isArray(s[key]) && s[key].length <= 1e4, "Historial inválido.");
  const dated = (x) => x && typeof x.time === "string" && !isNaN(Date.parse(x.time));
  for (const x of s.sales) insist(dated(x) && typeof x.id === "string" && x.id.length <= 80 && number(x.sold, 0, 50, true) && number(x.collected, 0, 50, true) && x.sold + x.collected > 0, "Venta inválida.");
  insist(new Set(s.sales.map((x) => x.id)).size === s.sales.length, "Hay ventas duplicadas.");
  let cumulativeSold = 0, cumulativeCollected = 0;
  for (const x of s.sales) {
    cumulativeSold += x.sold;
    cumulativeCollected += x.collected;
    insist(cumulativeCollected <= cumulativeSold, "El historial cobra antes de vender.");
  }
  for (const x of s.payments) insist(dated(x) && number(x.A, 0, 1e6, true) && number(x.B, 0, 1e6, true), "Liquidación inválida.");
  for (const x of s.audit) insist(dated(x) && typeof x.action === "string" && x.action.length <= 600, "Auditoría inválida.");
  const t = totals(s);
  insist(t.sold <= t.bags && t.sold <= s.confirmed && t.collected <= t.sold && t.due.A >= 0 && t.due.B >= 0, "El respaldo tiene cuentas inconsistentes.");
  insist(s.completed || !s.sales.length && !s.payments.length, "El lote no está completado.");
  return structuredClone(s);
}
