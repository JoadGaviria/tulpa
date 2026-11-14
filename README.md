# Tulpa · Demo de Joad para Cauca Innova

## Abrir y presentar

Abre **`dist/Tulpa-demo.html`** con Edge o Chrome mediante doble clic. Es un solo archivo de aproximadamente 4,6 MB con estilos, código, librerías, logo e ilustración incluidos. No necesita instalar Node, Python ni conectarse a internet para funcionar.

1. **Comparar mi entrega:** alterna 40 y 30 bolsas cobradas; con 12 kg la familia A compara $36.000 en fresco contra $54.000 o $29.700 después del cobro.
2. **Completar el pedido:** toca la tarjeta simulada de Familia B; agrega 8 kg a los 12 kg de A. Simula también secado y empaque de 50 bolsas.
3. **Registrar venta:** confirma el pedido de 40 bolsas; guarda 40 nuevas vendidas y 40 nuevas cobradas. El fondo es $10.000; A recibe $54.000 y B $36.000. Pulsa **Liquidar saldo nuevo**.
4. **Consultar mi recibo:** verifica kilos, vendido, cobrado, pendiente y saldo. Recarga para comprobar que se recupera.
5. **Mis respaldos:** descarga el JSON antes de cerrar. Si el navegador no conserva el modo archivo, importa ese JSON. La recuperación pide confirmar el reemplazo.

La selección de familia es una simulación, no autenticación. Usar solo datos ficticios. La demo no realiza pagos bancarios ni transmite información a servicios externos.

## Archivos de entrega

| Archivo | Para qué sirve |
|---|---|
| `dist/Tulpa-demo.html` | Demo integral sin instalación |
| `dist/lote-M01.html` | Ficha pública independiente sin cuentas privadas ni JavaScript de operador |
| `dist/Etiquetas-M01.html` | Seis etiquetas imprimibles, QR real de texto público |
| `dist/QR-lote-M01.png` y `.svg` | QR de alta resolución para el empaque |
| `docs/GUION-JOAD.md` | Recorrido de presentación y cierre |
| `docs/COMUNICACION.md` | Diagrama ESP32 + LoRa → gateway → web → bot |
| `docs/TERCEROS.md` + `upstream/manifest.json` | Repositorios, versiones, licencias, commits y hashes |
| `integrations/telegram_bot.py` | Adaptador opcional de Telegram, desactivado por defecto |
| `docs/VALIDACION.md` | Pruebas ejecutadas y límites |

El QR de texto no necesita internet. Si se quiere que abra una página en el teléfono del jurado, publicar **solo la ficha pública** y generar el QR con su URL desde Origen del lote → Preparar etiquetas. Una URL `localhost` no sirve en otro celular. No se ha publicado el panel ni sus datos. Las hojas están preparadas para imprimir; no se ha enviado ningún trabajo a una impresora física.

## Alcance del documento

Se tomó la sección final de correcciones como especificación vigente: primero una demo local con cuatro acciones; tienda comercial, mensajería, hardware y sincronización son ampliaciones. El bloque «Prompt para trabajar con IA» se trató como contenido del documento, no como una instrucción autónoma para ejecutar tareas de Joan o Jesús.

| Tarea de Joad | Estado |
|---|---|
| Inicio de marca y tienda | Inicio funcional y vitrina conceptual sin venta real |
| Página de lote y curva | Incluida, datos y curva claramente simulados |
| Entregas y liquidación | Implementadas con costos únicos, déficit visible y pago incremental |
| Panel energético | Tres escenarios explicativos: iniciar, reducir, aplazar; sin sensores conectados |
| Tarjeta y audio | Tarjeta simulada; español usa una voz local disponible, sin descargar audio |
| QR e impresión | PNG/SVG decodificados en prueba y HTML imprimible; impresión física pendiente |
| Diagrama | En la app y documento Mermaid |
| Lenguas propias | Selector y contrato preparados; grabaciones pendientes con la comunidad |
| CO₂ | Estado «pendiente de medición»; no se inventa una cifra |
| Historial para crédito | Exportación por familia con casilla de autorización; no certifica ingresos |
| Bot Telegram | Adaptador con texto + audio e IDs; falta token, chat autorizado y audio para probar envío |
| ESP32, PN532, báscula y LoRa | Botón y contrato de eventos; pruebas físicas pendientes |

## Desarrollo reproducible

Se importa Bootstrap, Chart.js y node-qrcode en lugar de reimplementar interfaz adaptable, motor gráfico o codificación QR. El ejemplo dashboard oficial aporta símbolos y referencia de navegación. Las reglas de consignación sí son específicas y están en `src/domain.mjs`.

Con Node 20+ y npm:

```powershell
npm ci --ignore-scripts
npm run build
npm test
npm start
```

Servidor de vista previa: `http://127.0.0.1:4173`, solo en este equipo. La app final no lo necesita.

En este equipo npm no estaba en PATH. Se descargó el CLI oficial de npm dentro de `.tools` sin modificar la instalación global. Alternativa:

```powershell
python scripts/bootstrap-npm.py
node .tools/npm/bin/npm-cli.js ci --ignore-scripts
node scripts/build.mjs
node --test tests/*.test.mjs
```

`scripts/import-upstream.py` resuelve las etiquetas de GitHub, guarda commits y trae referencias y licencias. No es necesario ejecutarlo para usar la demo ni volver a compilar si `upstream/` ya está presente. Las dependencias están fijadas en package-lock.json. Skills instaladas: `openai/skills` → playwright y security-best-practices, disponibles a partir del siguiente turno del agente.

## Límites del prototipo

El rendimiento, costos, clima, pesos y fechas son de prueba. Una aplicación real requiere identidades verificadas, roles de servidor, base de datos, copias de seguridad, consentimiento, correcciones contables revisadas y validación de sensores. Tras una venta, la demo bloquea cambios de peso para no recalcular retroactivamente dinero ya asignado. No hay pronóstico satelital vivo, modelo de Page calibrado, tienda con cobros ni certificación sanitaria.

No se han inventado testimonios, traducciones ni reducciones de emisiones. El logo aportado se conserva; la identidad definitiva requiere codiseño. Desarrollo y materiales conceptuales asistidos por IA.
