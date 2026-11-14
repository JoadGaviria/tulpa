# Tulpa · decisiones de diseño

La tarea es ayudar a una familia a decidir y entender su recibo. El logo entregado se conserva íntegro. Tulpa es la identidad de demostración, pendiente de codiseño comunitario.

Paleta: papel #F6F7F3, blanco #FFFFFF, bosque #254D3D, brasa #AD421B, tinta #24342D y maíz #F2D88A. La brasa viene del logo, el verde del ciclo agrícola. Tipografía local Segoe UI con títulos de peso 650; números tabulares en cuentas. Sin fuentes ni recursos remotos.

Composición: navegación lateral persistente en escritorio, horizontal en móvil; bienvenida con el centro de guadua existente y, debajo, cuatro acciones de la demo. Formularios y recibos se alinean a la izquierda. El recibo es una hoja de cuenta, no una tarjeta de indicadores.

```text
Marca | Lote activo                       Datos ficticios
Nav   | Tu cosecha tiene otra posibilidad | Centro de guadua
      | Comparar · Completar · Venta · Recibo
      | Estado del pedido                 | Próximo paso
```

Revisión: se descartó una portada oscura con naranja brillante porque perjudicaba la lectura de las cuentas. La imagen del centro conecta la identidad con el proyecto; las pantallas de operación priorizan contraste, botones de 44 px y texto de 16 px. No se inventan motivos indígenas ni traducciones.

Componentes reutilizados: grid, formularios, tablas, alertas y botones de Bootstrap; patrón de navegación de su ejemplo dashboard; gráficos Chart.js; QR node-qrcode. El dominio de consignación se implementa aparte porque sus reglas son específicas del documento.
