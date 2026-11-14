# Integraciones: contrato y límites

La aplicación principal funciona sin internet. No hace solicitudes al bot ni envía datos personales. El adaptador es una ampliación independiente; no se ha probado con Telegram real ni con hardware.

## Telegram

1. Crear un bot en BotFather y obtener consentimiento del destinatario; este debe iniciar la conversación.
2. Instalar `python -m pip install -r integrations/requirements.txt` en un entorno virtual.
3. Guardar token y chat IDs en variables de entorno `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID_A`, `TELEGRAM_CHAT_ID_B`. No ponerlos en HTML, Git ni respaldos.
4. Exportar un evento de entrega desde la página Comunicación o usar `example-delivery.json` para probar.
5. Validar sin red: `python integrations/telegram_bot.py integrations/example-delivery.json`.
6. Con destinatario autorizado y audio de esa entrega, activar explícitamente: `python integrations/telegram_bot.py entrega.json --send --confirm-recipient CHAT_ID --audio confirmacion.ogg`.

Envía mensaje y audio. En nasa yuwe o namtrik se requiere una grabación aprobada por hablantes de la comunidad; no se sintetizan traducciones. El texto de referencia permanece en español. Cada audio debe coincidir con la familia, kilos y lote del evento, no usar una frase genérica que afirme datos distintos.

SQLite registra el ID antes del envío. Un evento `sent` no se repite. Un evento `inflight` después de un fallo requiere revisar la conversación antes de intentar de nuevo: la API de Telegram no ofrece una transacción atómica entre enviar texto y audio. No borrar IDs sin esa revisión.

El adaptador no es un servicio web público. No incluye un webhook sin autenticación. La conexión automática gateway → bot requiere servicio de backend, autorización por productor y protección de secretos.

## NFC, báscula y LoRa

La demo utiliza un botón, como permite el documento. No se afirma haber probado PN532, ESP32, HX711 ni radio. Antes de comprar hardware hay que elegir placa, pines, voltaje, biblioteca mantenida, frecuencia y parámetros acordes con la normativa vigente.

Mensaje canónico del gateway:

```json
{"schema":"tulpa.delivery.v1","id":"device-uuid:boot-nonce:sequence","demo":true,"lot":"M01","family":"B","accepted_kg":8,"language":"es"}
```

Este JSON es un contrato de aplicación, no una trama LoRa de 20 bytes. La radio necesitaría codificación compacta y fragmentación, control de integridad y autenticación; un ID de tarjeta no autentica por sí solo a una persona. El firmware debe guardar primero en memoria persistente, retransmitir con espera, y borrar de la cola solo cuando el gateway confirme el ID. El gateway deduplica por dispositivo y secuencia y asigna el productor con una tabla privada; no transmite nombres completos.

No se han generado firmware ni configuraciones de radio que pretendan funcionar sin conocer la placa y el montaje. El diagrama de comunicación está incluido en la demo y en `docs/COMUNICACION.md`.
