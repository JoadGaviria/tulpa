# Comunicación del centro

```mermaid
flowchart LR
  A[Tarjeta NFC PN532] --> C[ESP32]
  B[Báscula HX711] --> C
  C --> D[Cola local persistente]
  D --> E[Enlace LoRa]
  E --> F[Gateway con internet]
  F --> G[Validación y deduplicación por ID]
  G --> H[Registro de asociación]
  H --> I[Recibo privado]
  H --> J[Ficha pública del lote y QR]
  H --> K[Bot Telegram y audio autorizado]
  G -. Confirmación por ID .-> D
```

Funciona ahora: botón de tarjeta, cuentas, almacenamiento en navegador, respaldo JSON, consulta, gráfico simulado, QR público y voz local disponible. Preparado como ampliación: adaptador Python de Telegram con confirmación explícita de destinatario. Por conectar y probar: sensores, LoRa, NFC, sincronización y envío real de audio.

La ficha pública no contiene pagos. El respaldo completo es privado de la asociación. La selección de familia en la demo no es una barrera de seguridad; una versión con datos reales requiere autenticación y autorización del lado servidor.
