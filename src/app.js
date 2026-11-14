import Chart from "chart.js/auto";
import QRCode from "qrcode";
import { COP, initialState, totals, compare, energy, complete, confirmOrder, registerSale, settle, correct, validateState } from "./domain.mjs";
import "./style.css";
const LOGO = "__LOGO_DATA__", CENTER = "__CENTER_DATA__";
const $ = (id) => document.getElementById(id);
const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const date = (v) => new Date(v).toLocaleString("es-CO", { timeZone: "America/Bogota", dateStyle: "medium", timeStyle: "short" });
const KEY = "tulpa-demo-v1";
let state = initialState(), storageIssue = "", view = location.hash.slice(1) || "inicio", family = "A", chart, toastTimer, importCandidate;
try {
  const saved = localStorage.getItem(KEY);
  if (saved) state = validateState(JSON.parse(saved));
} catch (e) {
  storageIssue = "No se pudo recuperar el guardado. Exporta una copia antes de continuar. " + e.message;
}
function notify(message, error = false) {
  $("toast").textContent = message;
  $("toast").className = "show" + (error ? " error" : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").className = "", 6500);
}
function commit(next, message) {
  validateState(next);
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    storageIssue = "";
  } catch {
    storageIssue = "El navegador no permite guardar. Exporta el respaldo antes de cerrar.";
  }
  render();
  notify(message);
}
function go(next) {
  view = next;
  location.hash = next;
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
  $("content")?.focus({ preventScroll: true });
}
function download(filename, content, type = "application/json") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2e3);
}
function speak(message) {
  const voices = window.speechSynthesis?.getVoices().filter((v) => v.lang.startsWith("es") && v.localService);
  if (!voices?.length) {
    notify("No hay voz española local instalada. La confirmación permanece en pantalla.");
    return;
  }
  const u = new SpeechSynthesisUtterance(message);
  u.lang = "es-CO";
  u.voice = voices[0];
  u.rate = 0.88;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}
const btn = (text, action2, style = "primary", extra = "") => `<button class="btn btn-${style}" data-action="${action2}" ${extra}>${text}</button>`;
const heading = (title, description) => `<header class="page-head"><h1>${title}</h1><p>${description}</p></header>`;
const notice = (text, type = "") => `<div class="notice ${type}">${text}</div>`;
const iconNames = { inicio: "house-fill", comparar: "graph-up", pedido: "cart", recibo: "file-earmark-text", centro: "gear-wide-connected", lote: "file-earmark", tienda: "people", conexion: "puzzle", respaldo: "plus-circle" };
const navItems = [["inicio", "⌂", "Inicio"], ["comparar", "⇄", "Comparar entrega"], ["pedido", "▤", "Pedido y ventas"], ["recibo", "▧", "Mi recibo"], ["centro", "☀", "Centro comunitario"], ["lote", "⌗", "Origen del lote"], ["tienda", "♧", "Nuestra cosecha"], ["conexion", "⇢", "Comunicación"], ["respaldo", "↧", "Mis respaldos"]];
function shell(content) {
  const publicMode = view === "publico";
  document.body.classList.toggle("public-only", publicMode);
  return `<div class="shell"><aside class="sidebar"><a class="brand" href="#inicio" aria-label="Tulpa, inicio"><img src="${LOGO}" alt="Logo Tulpa"><div><strong>Tulpa</strong><span>Cosecha compartida</span></div></a><nav class="navstack" aria-label="Navegación principal">${navItems.map(([key, icon, name]) => `<button class="navlink ${view === key ? "active" : ""}" data-go="${key}" ${view === key ? 'aria-current="page"' : ""}><svg class="navicon" width="21" height="21" fill="currentColor" aria-hidden="true"><use href="#${iconNames[key]}"/></svg>${name}</button>`).join("")}</nav><div class="sidefoot"><b>Hecho para juntarnos.</b>Cauca Innova · Bootcamp 2026<br>Prototipo comunitario · Joad</div></aside><div class="workspace"><header class="topbar"><div class="crumb">Centro comunitario <span aria-hidden="true"> / </span> <strong>${{ ventas: "Ventas y cobros", etiquetas: "Etiquetas del lote" }[view] || navItems.find((n) => n[0] === view)?.[2] || "Origen del lote"}</strong></div><span class="status">● Disponible sin internet</span></header>${storageIssue ? `<div class="offline-warning" role="alert">${esc(storageIssue)}</div>` : ""}<main id="content" tabindex="-1"><div class="demo-note"><span>Demo de bootcamp · Todos los datos son ficticios</span><span>Lote M01 · Mora</span></div>${content}<footer class="sync-foot"><span>Tulpa · Cauca, Colombia. Identidad de demostración por validar con la comunidad.</span><a href="#respaldo">${storageIssue ? "Guardar respaldo" : "Datos guardados en este navegador"}</a></footer></main></div></div>`;
}
function home() {
  const t = totals(state);
  return `<section class="hero"><div class="hero-copy"><div class="eyeline">Cosecha compartida, cuentas claras.</div><h1>Lo que cultivamos<br>vale más juntos.</h1><p>Transformamos la fruta, cuidamos la energía y hacemos visible lo que recibe cada familia.</p>${btn("Comparar mi entrega", "compare")} <small class="d-block mt-3 muted">Una decisión sencilla. Una cuenta que puedes revisar.</small></div><img src="${CENTER}" alt="Ilustración conceptual del centro comunitario de guadua, con secador y fuentes de energía solar"></section><div class="section-head"><h2>Del campo a tu recibo</h2><span class="muted small">Cuatro pasos, sin enredos</span></div><div class="actions">${[["⇄", "Comparar mi entrega", "Fresco hoy o secado después", "comparar"], ["♧", "Completar el pedido", "Juntar la cosecha de dos familias", "pedido"], ["▥", "Registrar venta", "Anotar lo vendido y lo cobrado", "ventas"], ["▧", "Consultar mi recibo", "Ver mi entrega y liquidación", "recibo"]].map(([icon, title, sub, key]) => `<button class="action" data-go="${key}"><span class="symbol" aria-hidden="true">${icon}</span><strong>${title}</strong><small>${sub}</small></button>`).join("")}</div><div class="section-head"><h2>Así va nuestra cosecha</h2><span class="badge-soft">${state.completed ? "Pedido completado" : "En recepción"}</span></div><div class="two-col wide-left"><section class="panel"><div class="d-flex justify-content-between mb-4"><h3>Mora · Lote M01</h3><span class="muted small">Meta: 20 kg</span></div><div class="stats"><div class="stat"><strong>${t.kg} <small>kg</small></strong><span>Fruta aceptada</span></div><div class="stat"><strong>${t.bags}</strong><span>Bolsas producidas</span></div><div class="stat"><strong>${t.collected}</strong><span>Bolsas cobradas</span></div><div class="stat"><strong>${t.pending}</strong><span>Bolsas sin vender</span></div></div><div class="progress mt-4" role="progressbar" aria-label="Fruta recibida para el pedido" aria-valuenow="${t.kg}" aria-valuemin="0" aria-valuemax="20"><div class="progress-bar" style="width:${t.kg / 20 * 100}%"></div></div><p class="small muted mt-3 mb-0">${state.completed ? "Dos familias reunieron su cosecha. El pago depende del dinero efectivamente cobrado." : "La Familia A aportó 12 kg. Faltan los 8 kg de la Familia B para completar la demo."}</p></section><section class="panel soft"><span class="small muted">Una cuenta transparente</span><h3 class="mt-2">Vendido no es lo mismo que cobrado.</h3><p class="small">El recibo te muestra cuánto llegó, qué costos se cubren y qué saldo se puede liquidar.</p><button class="btn btn-outline-primary btn-sm" data-go="recibo">Ver mi recibo</button></section></div>`;
}
function compareResult(bags, kg) {
  const r = compare(bags, kg);
  return `<div class="two-col"><section class="panel comparison fresh"><h3>Vender en fresco hoy</h3><div class="big-money money">${COP(r.fresh)}</div><p>${kg} kg × ${COP(3e3)} por kg.</p><span class="tag">Pago hoy · Supuesto</span></section><section class="panel comparison"><h3>Sumarme al pedido</h3><div class="big-money money">${COP(r.later)}</div><p>Mi parte si se cobran ${bags} de 50 bolsas.</p><span class="badge-soft">Después del cobro · Sin fecha pactada</span></section></div><div class="mt-3">${notice(r.later > r.fresh ? `En este escenario recibirías ${COP(r.later - r.fresh)} más con el pedido, a cambio de esperar. No es un ingreso garantizado.` : `En este escenario, vender en fresco da ${COP(r.fresh - r.later)} más, sin esperar al comprador.`)}</div><p class="small muted mt-3 mb-0">${r.pending} bolsas todavía no cobradas. ${r.deficit ? `Déficit de ${COP(r.deficit)}: la asamblea debe decidir quién lo asume.` : "Las bolsas restantes podrían cambiar el resultado si se venden y cobran después."} El riesgo de pérdidas y el plazo de pago están pendientes de acuerdo.</p>`;
}
function comparison() {
  return `${heading("¿Qué me conviene hacer con mi mora?", "Compara recibir dinero hoy con esperar a que se cobre el pedido. Mueve el escenario: no cambia los registros reales de la demo.")}<div class="two-col wide-left"><section><div class="panel mb-4"><label class="form-label" for="compare-kg">Mi entrega aceptada (kg)</label><input id="compare-kg" class="form-control mb-3" type="number" min="0" max="20" step="0.1" value="12"><div class="d-flex justify-content-between"><label class="form-label" for="compare-bags">Bolsas que se lograrían cobrar</label><strong id="bags-count">40 de 50</strong></div><input class="form-range" type="range" id="compare-bags" min="0" max="50" step="1" value="40"><div class="row-buttons mt-2">${btn("40 bolsas: buen resultado", "scenario40", "outline-primary")}${btn("30 bolsas: venta lenta", "scenario30", "outline-primary")}</div></div><div id="comparison-result">${compareResult(40, 12)}</div></section><aside class="panel"><h2>La cuenta completa</h2><table class="ledger"><tbody><tr><td>Fruta del lote</td><td>20 kg</td></tr><tr><td>Rendimiento supuesto</td><td>12,5 %</td></tr><tr><td>Producción esperada</td><td>50 bolsas de 50 g</td></tr><tr><td>Precio por bolsa</td><td>${COP(4500)}</td></tr><tr><td>Trabajo pagado aparte</td><td>${COP(55e3)}</td></tr><tr><td>Otros costos</td><td>${COP(25e3)}</td></tr><tr><td>Fondo comunitario</td><td>10 % del excedente positivo</td></tr></tbody></table><p class="small muted mt-3">Tu participación es tu peso aceptado dividido entre 20 kg. Estos supuestos son los del documento de prueba; deben medirse y acordarse antes del piloto.</p>${btn("Ir al pedido", "order")}</aside></div>`;
}
function order() {
  const t = totals(state);
  return `${heading("Juntamos la cosecha. Completamos el pedido.", "Recepción demostrativa con tarjeta simulada. No hay NFC ni báscula conectados.")}<div class="two-col wide-left"><section class="panel"><h2>Recepción · Lote M01</h2><div class="table-responsive"><table class="ledger"><thead><tr><th>Familia</th><th>Recibido</th><th>Aceptado</th></tr></thead><tbody>${state.deliveries.map((d) => `<tr><td><strong>${d.name}</strong><br><small>Tarjeta TULPA-${d.id}</small></td><td>${d.received} kg</td><td>${d.accepted} kg</td></tr>`).join("")}</tbody></table></div><div class="row-buttons">${btn(state.completed ? "✓ Tarjeta registrada" : "Tocar tarjeta · Familia B · 8 kg", "complete", "primary", state.completed ? "disabled" : "")}${btn("Escuchar confirmación", "audio", "outline-primary")}</div><div id="delivery-confirmation" class="mt-3">${state.completed ? notice("Recibimos 8 kg de mora de Familia B. Entrega guardada en este dispositivo.", "green") : notice("La Familia A ya tiene un recibo por 12 kg. Acerca la tarjeta simulada de Familia B para completar el lote.")}</div><label for="language" class="form-label mt-4">Idioma de la confirmación</label><select id="language" class="form-select"><option value="es">Español · voz local del dispositivo</option><option value="nasa">Nasa yuwe · grabación pendiente</option><option value="namtrik">Namtrik · grabación pendiente</option></select><p class="small muted mt-2">Las grabaciones en lengua propia deben hacerse con hablantes y autorización de la comunidad.</p></section><aside class="panel soft"><h3>Pedido previsto</h3><div class="big-money">50 <small>bolsas</small></div><p>20 kg de mora → 2,5 kg secos.<br>Rendimiento de ejemplo: 12,5 %.</p><p class="small">${state.completed ? `Con el peso aceptado actual: ${t.bags} bolsas producidas en la simulación.` : "Completar el pedido simula también el secado y el empaque; no demuestra inocuidad."}</p>${notice(`Clima simulado: ${energy(state.climate).decision}.`)}<div class="row-buttons">${btn("Confirmar pedido y venta", "sales", "outline-primary")}${btn("Revisar energía", "energy", "light")}</div></aside></div><div class="panel mt-4"><h3>¿Hay un error en el peso?</h3><p class="small muted">Se puede corregir antes de registrar ventas. El peso recibido se conserva y cada cambio deja su motivo.</p><form id="correction-form" class="row g-3"><div class="col-md-3"><label for="correct-family" class="form-label">Familia</label><select id="correct-family" class="form-select"><option value="A">Familia A</option><option value="B">Familia B</option></select></div><div class="col-md-3"><label for="correct-kg" class="form-label">Peso aceptado (kg)</label><input id="correct-kg" type="number" min="0" max="12" step="0.1" value="12" required class="form-control"></div><div class="col-md-6"><label for="correct-reason" class="form-label">Motivo de la corrección</label><input id="correct-reason" minlength="5" maxlength="300" required class="form-control" placeholder="Ej.: se retiró fruta no apta"></div><div>${btn("Guardar corrección", "submit-correction", "outline-primary", 'type="submit"')}</div></form></div>${audit()}`;
}
function sales() {
  const t = totals(state);
  return `${heading("Registrar venta y dinero cobrado", "Una bolsa vendida a crédito todavía no genera dinero para repartir. Registra solo los movimientos nuevos.")}<div class="stats mb-4"><div class="stat"><strong>${t.bags}</strong><span>Producidas</span></div><div class="stat"><strong>${t.sold}</strong><span>Vendidas</span></div><div class="stat"><strong>${t.collected}</strong><span>Cobradas</span></div><div class="stat"><strong>${t.pending}</strong><span>Sin vender</span></div></div><div class="two-col"><section><div class="panel mb-4"><h3>Pedido confirmado</h3><p class="small muted">Previsto: 50 bolsas. Confirmado: ${state.confirmed}. Confirmar no registra una venta ni un cobro.</p><form id="confirm-form" class="d-flex gap-3"><label for="confirmed" class="visually-hidden">Bolsas confirmadas</label><input class="form-control" style="max-width:160px" id="confirmed" type="number" min="${t.sold}" max="50" step="1" value="${state.confirmed || 40}" required><button class="btn btn-outline-primary" type="submit">Confirmar pedido</button></form></div><div class="panel"><h3>Nuevo movimiento</h3>${!state.completed ? notice("Primero completa el pedido en Recepción.") : ""}<form id="sale-form"><label for="new-sold" class="form-label mt-3">Bolsas nuevas vendidas</label><input id="new-sold" class="form-control" type="number" min="0" max="${t.pending}" step="1" value="${Math.max(0, Math.min(40, state.confirmed - t.sold, t.pending))}" required><label for="new-collected" class="form-label mt-3">Bolsas nuevas cobradas</label><input id="new-collected" class="form-control" type="number" min="0" max="50" step="1" value="${Math.max(0, Math.min(40, state.confirmed - t.collected))}" required><p class="small muted mt-3">Precio fijo de prueba: ${COP(4500)} por bolsa. Por cobrar hoy: ${t.uncollected} bolsas, ${COP(t.uncollected * 4500)}. Para cobrar una venta anterior, deja las ventas nuevas en 0.</p><button class="btn btn-primary" type="submit" ${!state.completed ? "disabled" : ""}>Guardar venta y cobro</button></form></div></section><section class="panel"><h2>Liquidación acumulada</h2>${ledger(t)}<p class="small muted mt-3">Los costos se descuentan una sola vez por lote. El trabajo se paga aparte de la fruta. El fondo recibe el 10 % solo si hay excedente positivo.</p>${t.surplus < 0 ? notice(`Faltan ${COP(-t.surplus)} para cubrir los costos. No se reparte dinero. La asamblea debe acordar cómo asumir el déficit.`, "danger") : notice(`Saldo nuevo para liquidar: ${COP(t.due.A + t.due.B)}. Las liquidaciones anteriores se conservan.`, "green")}<div class="row-buttons">${btn("Liquidar saldo nuevo", "settle", "primary", t.due.A + t.due.B <= 0 ? "disabled" : "")}${btn("Ver mi recibo", "receipt", "outline-primary")}</div><p class="small muted mt-3 mb-0">Liquidación de demostración: no realiza transferencias bancarias.</p></section></div>${audit()}`;
}
function ledger(t) {
  return `<table class="ledger"><tbody><tr><td>Dinero efectivamente cobrado</td><td>${COP(t.revenue)}</td></tr><tr><td>Trabajo (${COP(55e3)}) + otros (${COP(25e3)})</td><td>− ${COP(t.costs)}</td></tr><tr><td>Excedente${t.surplus < 0 ? " / déficit" : ""}</td><td>${COP(t.surplus)}</td></tr><tr><td>Fondo comunitario</td><td>− ${COP(t.fund)}</td></tr><tr class="total"><td>Para las familias</td><td>${COP(t.pool)}</td></tr>${state.deliveries.map((d) => `<tr><td>${d.name} · ${t.kg ? (d.accepted / t.kg * 100).toFixed(1) : 0} %</td><td>${COP(t.allocations[d.id])}</td></tr>`).join("")}</tbody></table>`;
}
function audit() {
  return `<details class="panel mt-4"><summary>Rastro de cambios (${state.audit.length})</summary><ol class="audit">${state.audit.length ? state.audit.toReversed().map((x) => `<li><time>${date(x.time)}</time>${esc(x.action)}</li>`).join("") : "<li>Aún no hay movimientos nuevos.</li>"}</ol></details>`;
}
function receipt() {
  const t = totals(state), d = state.deliveries.find((x) => x.id === family);
  return `${heading("Mi cosecha, mi cuenta", "Consulta una familia a la vez. Esta selección simula la tarjeta; no es un inicio de sesión seguro.")}<div class="no-print mb-4 d-flex gap-3 align-items-center"><label for="receipt-family" class="form-label mb-0">Mi tarjeta</label><select id="receipt-family" class="form-select" style="max-width:240px"><option value="A" ${family === "A" ? "selected" : ""}>Familia A · TULPA-A</option><option value="B" ${family === "B" ? "selected" : ""}>Familia B · TULPA-B</option></select></div><article class="receipt"><div class="receipt-header"><div><h2>Tulpa</h2><span class="small muted">Recibo de ${d.name}</span></div><div class="text-end"><strong>M01-${d.id}</strong><br><small>Lote de mora</small></div></div><p class="small">Datos ficticios · Recibo privado de demostración<br>Recepción inicial: ${date(state.created)}<br>Cambios posteriores: ver historial del recibo.</p><table class="ledger"><tbody><tr><td>Fruta recibida</td><td>${d.received} kg</td></tr><tr><td>Fruta aceptada</td><td>${d.accepted} kg</td></tr><tr><td>Mi participación</td><td>${t.kg ? (d.accepted / t.kg * 100).toFixed(1) : 0} %</td></tr><tr><td>Bolsas del lote vendidas / producidas</td><td>${t.sold} / ${t.bags}</td></tr><tr><td>Bolsas del lote cobradas</td><td>${t.collected}</td></tr><tr><td>Sin vender / vendidas por cobrar</td><td>${t.pending} / ${t.uncollected}</td></tr><tr><td>Mi derecho según cobros</td><td>${COP(t.allocations[family])}</td></tr><tr><td>Ya liquidado (simulado)</td><td>${COP(t.paid[family])}</td></tr></tbody></table><div class="payment"><span>Mi saldo nuevo disponible</span><div class="big-money money">${COP(t.due[family])}</div><small>Fecha de pago: sin acuerdo. No es una promesa de ingreso.</small></div>${notice(`Si hay un error, pide al operador una corrección del recibo M01-${family}. El motivo y el peso anterior deben quedar registrados.`)}<details class="mt-3"><summary>Mi historial de producción y liquidaciones</summary><p class="small">Una entrega demostrativa: ${d.accepted} kg aceptados. Este historial no certifica ingresos ni asegura un crédito.</p><ul>${state.payments.length ? state.payments.map((x) => `<li>${date(x.time)}: ${COP(x[family])} liquidados.</li>`).join("") : "<li>No hay liquidaciones registradas.</li>"}</ul></details><div class="no-print mt-4"><label><input type="checkbox" id="history-consent"> Autorizo exportar mi historial de demostración.</label><div class="row-buttons">${btn("Descargar mi historial", "history", "outline-primary")}${btn("Imprimir mi recibo", "print", "light")}${btn("Escuchar mi saldo", "receipt-audio", "light")}</div></div><p class="small muted mt-4 mb-0">Respaldo privado: no incluyas este recibo en el QR público del empaque.</p></article>`;
}
function center() {
  const e = energy(state.climate, totals(state).kg || 20), rain = state.climate !== "sun";
  return `${heading("El centro también mira al cielo", "Telemetría y pronóstico simulados. Son escenarios de explicación, no mediciones ni un control conectado.")}<div class="no-print mb-4 d-flex gap-2">${btn("☀ Dos días de sol", "sun", rain ? "outline-primary" : "primary")}${btn("☁ Nublado, batería al 55 %", "cloud", state.climate === "cloud" ? "primary" : "outline-primary")}${btn("☁ Nublado, batería al 28 %", "rain", state.climate === "rain" ? "primary" : "outline-primary")}</div><div class="mb-4">${notice(`<strong>${e.decision}.</strong> ${rain ? "Mañana nublado: guardando biogás y reservando batería para iluminación, comunicación y carga comunitaria." : "Hay energía estimada para recibir el lote. El colector solar aporta el calor principal."}`, rain ? "danger" : "green")}</div><div class="stats mb-4"><div class="stat"><strong>${e.battery} %</strong><span>Batería · Simulado</span></div><div class="stat"><strong>${rain ? "0,5" : "1,2"} m³</strong><span>Biogás · Simulado</span></div><div class="stat"><strong>${e.solar.toFixed(1)} kWh</strong><span>Calor solar útil / 2 días</span></div><div class="stat"><strong>${e.need.toFixed(1)} kWh</strong><span>Calor mínimo del lote</span></div></div><div class="two-col"><section class="panel"><h2>Calor para secar</h2><div class="chart"><canvas id="energy-chart" aria-label="Comparación entre calor requerido, solar y biogás" role="img"></canvas></div><p class="small muted mt-3">Colector de 16 m² × irradiación de ${rain ? "1,2" : "4,5"} kWh/m²/día × 40 % × 50 % × 2 días. Biogás: 6 kWh/m³ × 45 %. Valores de ejemplo, sin validación experimental.</p></section><section class="panel"><h2>Qué sigue funcionando</h2><table class="ledger"><tbody><tr><td>Carga de celulares y comunicaciones</td><td>Prioridad alta</td></tr><tr><td>Iluminación y trazabilidad</td><td>Protegidas</td></tr><tr><td>Recepción y producción</td><td>${state.climate === "rain" ? "Aplazadas" : state.climate === "cloud" ? "Reducir carga" : "Disponibles"}</td></tr></tbody></table><p class="small muted mt-3">Electricidad de referencia: 1,94 kWh/día. El calor del secado se calcula por separado. Con 20 kg se requieren unos 11,5 kWh térmicos antes de pérdidas.</p>${notice("Si el lote ya está húmedo y falta calor, se marca en riesgo y se avisa al operador. El biogás solo apoya; no garantiza terminarlo.")}</section></div><p class="small muted mt-4">Capacidad térmica estimada para este escenario: ${e.capacity.toFixed(1)} kg en dos días. La reserva de batería puede limitar la recepción aunque haya calor. Los gases de combustión no tocan la fruta: el calor se transfiere mediante un intercambiador. Inocuidad, autonomía y capacidad del sistema siguen pendientes de validar.</p>`;
}
function lot() {
  return `${heading("Cada cosecha tiene una historia.", "Lote M01 · Mora deshidratada · Muestra de diseño, no está a la venta.")}<div class="two-col wide-left"><section><div class="panel"><span class="badge-soft">Origen de demostración</span><h2 class="mt-3">Dos familias. Una cosecha compartida.</h2><p>Familias A y B · Nombres ficticios.<br>Cauca, Colombia · Vereda por definir.<br>Fecha de ejemplo: 14 de noviembre de 2026.</p><div class="flow mt-4">${["Recibir y pesar", "Seleccionar y lavar", "Secar con sol", "Empacar"].map((s, i) => `<div class="flow-step"><b>${i + 1}. ${s}</b><small>${["Fruta sana de segunda", "Selección para alimento", "Apoyo térmico de biogás", "Bolsas de 50 g"][i]}</small></div>`).join("")}</div></div><section class="panel mt-4"><h3>La curva de secado</h3><p class="small muted">Serie ilustrativa. No es una medición ni un modelo calibrado; no certifica que el alimento sea seguro.</p><div class="chart"><canvas id="dry-chart" role="img" aria-label="Humedad simulada del producto durante 16 horas"></canvas></div><details><summary>Ver datos de la curva</summary><p class="small">Hora: 0, 4, 8, 12, 16. Humedad ilustrativa: 88 %, 67 %, 45 %, 27 %, 15 %.</p></details></section></section><aside><div class="panel soft"><h3>Energía que transforma</h3><p>El colector solar calienta el aire. El biogás apoya por un intercambiador. Los paneles fotovoltaicos alimentan la electricidad.</p><hr><h3>Huella de carbono</h3><p class="mb-0">Pendiente de medición. Publicaremos un resultado cuando se mida la línea base y se validen los factores.</p></div><div class="qr-wrap mt-4"><canvas id="lot-qr" aria-label="QR con información pública del lote M01"></canvas><h3>Lote M01</h3><p class="small muted">QR real con texto público. Se puede leer sin internet; no contiene pagos ni datos personales.</p><div class="operator">${btn("Preparar etiquetas", "labels", "outline-primary")}</div></div></aside></div><div class="mt-4">${notice("Este origen es ficticio. Publicar nombres reales de fincas o familias requiere su autorización. No hay cifras de pagos en esta ficha.")}</div>`;
}
function store() {
  return `${heading("Cosechamos aquí. Transformamos juntos.", "Vitrina de la marca comunitaria. Muestras del bootcamp; no se reciben pagos ni pedidos comerciales.")}<div class="row g-4">${[["Mora deshidratada", "50 g · Lote M01", "4500"], ["Infusión de cáscara de café", "Producto por desarrollar", ""], ["Fruta de temporada", "Producto por validar", ""]].map(([name, sub, price], i) => `<div class="col-lg-4"><article class="product"><div class="packshot" style="background:${["#e5eadb", "#ebe1d2", "#eee8c7"][i]}"><div class="bag"><b>Tulpa</b><small>Cosecha compartida</small><div class="bag-window" style="background:${["#472a3b", "#654630", "#b97035"][i]}"></div><small>${i ? "Producto conceptual" : "Mora · 50 g"}</small></div></div><div class="product-copy"><span class="tag">${i ? "Concepto" : "Muestra de diseño"}</span><h2 class="mt-3">${name}</h2><p class="muted small">${sub}</p>${price ? `<strong>${COP(Number(price))}</strong><small class="d-block muted mb-3">Precio supuesto para la asociación</small><button class="btn btn-outline-primary" data-go="lote">Conocer el origen</button>` : '<p class="small mb-0">Presentación, precio e inocuidad pendientes de validar.</p>'}</div></article></div>`).join("")}</div><p class="muted small mt-4">Identidad, catálogo y presentación sujetos a codiseño. La comercialización requiere las validaciones sanitarias correspondientes.</p>`;
}
function eventPanel() {
  return `<section class="panel mt-4"><h3>Preparar un evento para el bot</h3><p class="small muted">Descarga un evento ficticio. El adaptador Python lo valida sin enviar nada por defecto.</p><div class="row g-3"><div class="col-md-4"><label for="event-family" class="form-label">Familia del evento</label><select id="event-family" class="form-select"><option>A</option><option>B</option></select></div><div class="col-md-4"><label for="event-language" class="form-label">Idioma del audio</label><select id="event-language" class="form-select"><option value="es">Español</option><option value="nasa">Nasa yuwe</option><option value="namtrik">Namtrik</option></select></div></div><div class="row-buttons">${btn("Descargar evento de entrega", "event", "outline-primary")}</div></section>`;
}
function communication() {
  return `${heading("Una tarjeta conecta todo el recorrido", "Arquitectura propuesta. La demo actual guarda localmente; el resto requiere integración física o servicios externos.")}<div class="flow">${[["Tarjeta + báscula", "ESP32, PN532 y HX711"], ["Enlace rural", "LoRa + almacenamiento local"], ["Punto con internet", "Gateway: valida y reintenta"], ["Registro de la asociación", "Web y recibo por familia"], ["Confirmación", "Bot + audio autorizado"]].map(([a, b], i) => `${i ? '<div class="flow-arrow" aria-hidden="true">→</div>' : ""}<div class="flow-step"><b>${a}</b><span class="small muted">${b}</span></div>`).join("")}</div><div class="two-col mt-4"><div class="panel"><h2>Lo que funciona en esta demo</h2><ul class="ticks"><li>Tarjeta simulada y confirmación en pantalla.</li><li>Voz en español si el dispositivo tiene una voz local.</li><li>Recibos, cuentas, historial y respaldo en archivos.</li><li>QR real y ficha pública sin información de pagos.</li></ul></div><div class="panel"><h2>Siguiente conexión</h2><ul class="ticks"><li>Adaptador de Telegram incluido en el código, desactivado por defecto.</li><li>Contrato de mensajes con ID de evento para evitar duplicados.</li><li>Audios nasa yuwe y namtrik pendientes de grabar con la comunidad.</li><li>LoRa, NFC, báscula y entrega de SMS no han sido probados en hardware.</li></ul></div></div><div class="mt-4">${notice("Sin señal, los eventos deben guardarse y enviarse después. El gateway confirma cada ID antes de retirarlo de la cola. En esta versión local no se transmite ningún evento.")}</div>${eventPanel()}`;
}
function backups() {
  return `${heading("Tu trabajo se queda contigo", "Guarda una copia antes del pitch. El navegador puede borrar el almacenamiento y el modo archivo no se comporta igual en todos los equipos.")}<div class="two-col"><section class="panel"><h2>Respaldo de la asociación</h2><p>Incluye las dos familias, entregas, ventas, liquidaciones y correcciones. Es un archivo privado de demostración.</p>${btn("Descargar respaldo JSON", "export")}<hr><label for="import-file" class="form-label">Recuperar desde un respaldo</label><input id="import-file" type="file" accept=".json,application/json" class="form-control"><div id="import-preview" class="mt-3"></div></section><section class="panel"><h2>Antes de presentar</h2><ol class="ticks"><li>Abre <strong>Tulpa-demo.html</strong> y desconecta internet.</li><li>Completa la entrega y exporta el respaldo.</li><li>Cierra, vuelve a abrir y consulta el recibo.</li><li>Si no aparece, importa tu archivo JSON.</li></ol><details><summary>Volver al inicio de la demo</summary><p class="small">Exporta tu trabajo primero. Esta acción reemplaza únicamente los datos de demostración de este navegador.</p><label><input id="reset-confirm" type="checkbox"> Quiero reiniciar los datos ficticios.</label><div class="mt-3">${btn("Reiniciar demo", "reset", "outline-primary")}</div></details></section></div><div class="panel mt-4"><h3>Código reutilizado y créditos</h3><p>Interfaz con <a href="https://github.com/twbs/bootstrap" target="_blank" rel="noopener">Bootstrap</a>, gráficas con <a href="https://github.com/chartjs/Chart.js" target="_blank" rel="noopener">Chart.js</a> y códigos QR con <a href="https://github.com/soldair/node-qrcode" target="_blank" rel="noopener">node-qrcode</a>. Bibliotecas incluidas en el archivo; no se descargan al usarlo.</p><p class="small muted mb-0">Logo aportado por Joad. Ilustración del centro reutilizada del proyecto, generada con IA. Desarrollo asistido por IA. Licencias, versiones y commits en el directorio de código fuente.</p></div>`;
}
const publicText = "TULPA | LOTE M01 | Mora deshidratada 50 g | MUESTRA FICTICIA, NO A LA VENTA | Cauca, vereda por definir | 14-11-2026 | Secado solar con apoyo de biogas | CO2: pendiente de medicion";
function labels() {
  return `${heading("Etiquetas listas para imprimir", "El QR contiene texto público y funciona sin conexión. Para abrir una web desde otro teléfono necesitas una URL publicada o accesible en esa red.")}<section class="panel no-print mb-4"><label for="qr-url" class="form-label">URL opcional de la ficha pública M01</label><input id="qr-url" class="form-control" type="url" placeholder="https://tu-dominio/lote-M01.html"><p class="small muted mt-2">Usa únicamente la ficha pública. No uses enlaces al panel o al recibo. Una dirección localhost no abre desde el celular de un jurado.</p><div class="row-buttons">${btn("Usar URL en los QR", "qr-update", "outline-primary")}${btn("Restaurar QR sin conexión", "qr-offline", "light")}${btn("Imprimir etiquetas", "print")}</div><p id="qr-mode" class="small mt-3 mb-0">Modo actual: texto sin conexión. Sin datos personales.</p></section><div class="label-sheet">${[1, 2, 3, 4].map((i) => `<article class="label-unit"><h2>Tulpa</h2><p>Mora deshidratada · 50 g</p><canvas id="label-qr-${i}" aria-label="QR público del lote M01"></canvas><h3>LOTE M01</h3><small>Muestra de diseño · No está a la venta.<br>Secada con sol y apoyo de biogás.<br>CO₂: pendiente de medición.</small></article>`).join("")}</div>`;
}
function render() {
  chart?.destroy();
  const pages = { inicio: home, comparar: comparison, pedido: order, ventas: sales, recibo: receipt, centro: center, lote: lot, publico: lot, tienda: store, conexion: communication, respaldo: backups, etiquetas: labels };
  if (!pages[view]) view = "inicio";
  $("app").innerHTML = shell(pages[view]());
  attach();
  if (view === "centro") {
    const e = energy(state.climate, totals(state).kg || 20);
    chart = new Chart($("energy-chart"), { type: "bar", data: { labels: ["Requerido", "Solar útil", "Biogás útil"], datasets: [{ label: "kWh térmicos (simulados)", data: [e.need, e.solar, e.biogas], backgroundColor: ["#ad421b", "#e3bd4e", "#66845b"], borderRadius: 5 }] }, options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, title: { display: true, text: "kWh térmicos" } } } } });
  }
  if (["lote", "publico"].includes(view)) {
    chart = new Chart($("dry-chart"), { type: "line", data: { labels: ["0 h", "4 h", "8 h", "12 h", "16 h"], datasets: [{ label: "Humedad ilustrativa (%)", data: [88, 67, 45, 27, 15], borderColor: "#254d3d", backgroundColor: "#edf3e8", fill: true, tension: 0.3, pointRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } } });
    QRCode.toCanvas($("lot-qr"), publicText, { width: 230, margin: 4, errorCorrectionLevel: "M" }).catch((e) => notify(e.message, true));
  }
  if (view === "etiquetas") drawLabels(publicText);
}
function drawLabels(value) {
  Promise.all([1, 2, 3, 4].map((i) => QRCode.toCanvas($(`label-qr-${i}`), value, { width: 300, margin: 4, errorCorrectionLevel: "M" }))).catch((e) => notify(e.message, true));
}
function guard(fn) {
  return (...args) => {
    try {
      fn(...args);
    } catch (e) {
      notify(e.message, true);
    }
  };
}
function attach() {
  document.querySelectorAll("[data-go]").forEach((b) => b.onclick = () => go(b.dataset.go));
  document.querySelectorAll("[data-action]").forEach((b) => b.onclick = guard(() => action(b.dataset.action)));
  const form = (id, fn) => {
    if ($(id)) $(id).onsubmit = guard((e) => {
      e.preventDefault();
      fn();
    });
  };
  form("confirm-form", () => commit(confirmOrder(state, Number($("confirmed").value)), "Pedido confirmado. Aún no registra dinero cobrado."));
  form("sale-form", () => commit(registerSale(state, Number($("new-sold").value), Number($("new-collected").value)), "Venta y cobro guardados."));
  form("correction-form", () => commit(correct(state, $("correct-family").value, Number($("correct-kg").value), $("correct-reason").value), "Corrección guardada con su motivo."));
  if ($("correct-family")) $("correct-family").onchange = () => {
    $("correct-kg").value = state.deliveries.find((d) => d.id === $("correct-family").value).accepted;
    $("correct-kg").max = state.deliveries.find((d) => d.id === $("correct-family").value).received;
  };
  if ($("receipt-family")) $("receipt-family").onchange = () => {
    family = $("receipt-family").value;
    render();
  };
  for (const id of ["compare-kg", "compare-bags"]) if ($(id)) $(id).oninput = guard(updateComparison);
  if ($("import-file")) $("import-file").onchange = async () => {
    try {
      const f = $("import-file").files[0];
      if (!f) return;
      if (f.size > 2e6) throw Error("El respaldo supera 2 MB.");
      importCandidate = validateState(JSON.parse(await f.text()));
      const t = totals(importCandidate);
      $("import-preview").innerHTML = notice(`Respaldo válido: ${t.kg} kg, ${t.sold} bolsas vendidas y ${COP(t.revenue)} cobrados. Reemplazará los registros actuales.`) + `<button id="apply-import" class="btn btn-primary mt-3">Reemplazar con este respaldo</button>`;
      $("apply-import").onclick = guard(() => {
        commit(importCandidate, "Respaldo recuperado.");
        importCandidate = null;
      });
    } catch (e) {
      importCandidate = null;
      $("import-preview").textContent = e.message;
      notify(e.message, true);
    }
  };
}
function updateComparison() {
  const b = Number($("compare-bags").value), kg = Number($("compare-kg").value);
  $("bags-count").textContent = `${b} de 50`;
  $("comparison-result").innerHTML = compareResult(b, kg);
}
function action(a) {
  const route = { compare: "comparar", order: "pedido", sales: "ventas", energy: "centro", receipt: "recibo", labels: "etiquetas" };
  if (route[a]) return go(route[a]);
  if (a === "scenario40" || a === "scenario30") {
    $("compare-bags").value = a === "scenario40" ? 40 : 30;
    return updateComparison();
  }
  if (a === "complete") {
    const lang = $("language").value;
    commit(complete(state), "Entrega guardada: Familia B, 8 kg de mora.");
    if (lang === "es") speak("Familia B, recibimos ocho kilos de mora. Su entrega está guardada.");
    else notify("Entrega guardada. Audio en lengua propia pendiente de grabación autorizada.");
    return;
  }
  if (a === "audio") {
    if ($("language").value !== "es") return notify("Grabación pendiente con la comunidad. No se usa traducción automática.");
    return speak(state.completed ? "Familia B, recibimos ocho kilos de mora. Su entrega está guardada." : "Familia A, recibimos doce kilos de mora. Faltan ocho kilos para completar el pedido.");
  }
  if (a === "receipt-audio") {
    const t = totals(state);
    return speak(`Familia ${family}. Su saldo nuevo es ${t.due[family]} pesos. Su pago depende del dinero cobrado.`);
  }
  if (a === "settle") return commit(settle(state), "Saldo nuevo liquidado en la demo. No se realizó una transferencia.");
  if (a === "sun" || a === "rain" || a === "cloud") {
    const n = structuredClone(state);
    n.climate = a;
    return commit(n, "Escenario simulado actualizado.");
  }
  if (a === "event") {
    const f = $("event-family").value, d = state.deliveries.find((x) => x.id === f);
    if (!d.received) throw Error("Primero registra la entrega de esta familia.");
    return download(`Tulpa-entrega-${f}.json`, JSON.stringify({ schema: "tulpa.delivery.v1", id: `demo-M01-${f}-${d.accepted}-${state.audit.filter((x) => x.action.startsWith("Corrección")).length}`, demo: true, lot: "M01", family: f, accepted_kg: d.accepted, language: $("event-language").value }, null, 2));
  }
  if (a === "print") return window.print();
  if (a === "export") return download(`Tulpa-respaldo-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`, JSON.stringify(state, null, 2));
  if (a === "history") {
    if (!$("history-consent").checked) throw Error("Marca la autorización antes de exportar tu historial.");
    const t = totals(state);
    return download(`Tulpa-historial-${family}.json`, JSON.stringify({ demo: true, lot: state.lot, consentAt: (/* @__PURE__ */ new Date()).toISOString(), delivery: state.deliveries.find((x) => x.id === family), paid: t.paid[family], balance: t.due[family], payments: state.payments.map((p) => ({ time: p.time, amount: p[family] })) }, null, 2));
  }
  if (a === "reset") {
    if (!$("reset-confirm").checked) throw Error("Confirma que quieres reiniciar los datos ficticios.");
    return commit(initialState(), "Demo reiniciada.");
  }
  if (a === "qr-offline") {
    drawLabels(publicText);
    $("qr-mode").textContent = "Modo actual: texto sin conexión. Sin datos personales.";
    return;
  }
  if (a === "qr-update") {
    const url = new URL($("qr-url").value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) throw Error("Usa una dirección web pública http o https, sin credenciales.");
    drawLabels(url.href);
    $("qr-mode").textContent = "Modo actual: enlace a " + url.href + ". Verifica su acceso desde el celular antes de imprimir.";
  }
}
window.speechSynthesis?.getVoices();
window.addEventListener("hashchange", () => {
  const next = location.hash.slice(1);
  if (next !== view) {
    view = next;
    render();
  }
});
render();
