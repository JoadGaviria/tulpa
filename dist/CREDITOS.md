# Procedencia, reutilización y licencias

Se reutilizan proyectos existentes. Los archivos de referencia y sus licencias se importaron directamente de GitHub; las distribuciones instaladas son paquetes oficiales npm con versiones fijadas y comprobaciones de integridad en package-lock.json.

| Recurso | Repositorio | Versión | Uso | Licencia |
|---|---|---|---|---|
| Bootstrap | https://github.com/twbs/bootstrap | 5.3.8 | Grid adaptable, formularios, tablas, alertas, botones y referencia dashboard | MIT |
| Chart.js | https://github.com/chartjs/Chart.js | 4.5.1 | Gráficas de calor y curva de secado | MIT |
| node-qrcode | https://github.com/soldair/node-qrcode | 1.5.4 | QR reales en canvas, PNG y SVG | MIT |
| python-telegram-bot | https://github.com/python-telegram-bot/python-telegram-bot | 22.5 | Adaptador opcional de mensaje y audio | LGPL-3.0 |
| esbuild | https://github.com/evanw/esbuild | 0.25.12 | Empaquetado de todo en un HTML sin CDN | MIT |
| jsQR | https://github.com/cozmo/jsQR | 1.4.0 | Prueba independiente de lectura del QR | Apache-2.0 |
| pngjs | https://github.com/pngjs/pngjs | 7.0.0 | Lectura PNG en prueba QR | MIT |

`upstream/manifest.json` registra commits exactos y hashes SHA-256 de los archivos importados. `node_modules/*` conserva las licencias de las distribuciones; el bundle también retiene comentarios legales de terceros. No se ejecutaron scripts de instalación de paquetes (`--ignore-scripts`). Que un repositorio sea conocido no equivale a una auditoría de seguridad; la revisión realizada fue de fuente oficial, licencia, uso y dependencias declaradas.

Skills instaladas desde https://github.com/openai/skills: `playwright` y `security-best-practices`. Las skills guían al agente, no son bibliotecas incorporadas en la aplicación. Instalación mediante el script oficial skill-installer. No se usó un prompt incrustado en el documento como instrucción del sistema.

Se reutilizó `output/imagegen/minga-solar-referencia-3d.png`, ilustración conceptual con IA preexistente del proyecto. No es un diseño estructural ni un modelo construido. `Logo Tulpa.png` fue aportado por el usuario y se conserva sin alteraciones. La maqueta de bolsa es CSS, no una fotografía de un producto real. Desarrollo y documentación asistidos por IA.

La lógica de consignación y las validaciones son código específico del proyecto, porque deben implementar las reglas corregidas del documento. No se copió una aplicación comercial ajena ni se afirma haber integrado un ERP completo.
