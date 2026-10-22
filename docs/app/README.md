# Wrbycker Control Center 1.0

Aplicación web estática, instalable como PWA en navegadores compatibles, diseñada para ser **gratuita y local-first**. Se abre desde [Wrbycker Agent Lab](../index.html) y se publica con GitHub Pages en `/app/`.

## Módulos reales

- **Resumen:** métricas de tareas, ideas, prompts y personajes.
- **Tareas:** crear, cambiar estado, filtrar y eliminar.
- **Ideas:** almacenar, buscar y eliminar ideas.
- **Prompt Studio:** plantillas libres y tres ejemplos; combinación de variables, copia y exportación de texto.
- **Personajes:** ficha maestra con personalidad, apariencia, rol y escenario; edición y exportación Markdown.
- **Workflows:** dos reglas manuales para convertir el último registro de ideas en tarea o viceversa. No hay agente autónomo ni ejecución en segundo plano.
- **Archivos:** análisis de tamaño, líneas, palabras y vista previa de un archivo de texto de hasta 256 KB, sin subirlo a servidores.
- **Configuración:** respaldos JSON con validación, restauración con confirmación y borrado local con doble confirmación.
- **PWA:** recursos estáticos para uso sin conexión tras una primera visita en línea; requiere HTTPS y navegador compatible.

## Privacidad y límites

Datos guardados con `localStorage` únicamente en el navegador/dispositivo, no sincronizados. No hay login, pagos, cuentas, seguimiento ni llamadas a OpenAI desde esta aplicación. Borrar el almacenamiento del sitio o cambiar de dispositivo puede perder datos: **exporta respaldos regularmente**. No almacenes información confidencial en equipos compartidos. Importaciones JSON limitadas a 1 MB, con máximo de 300 registros por sección.

La app no ejecuta el código Python ni ofrece MCP, AG-UI, modelos generativos ni tareas automáticas persistentes. Para operaciones de IA mediante API usa separadamente la CLI Python (puede generar cargos).

## Desarrollo y pruebas

No hay dependencias npm. Abre `index.html` localmente para probar la interfaz; para probar instalación PWA, usa GitHub Pages o un servidor HTTPS.

```bash
node --test tests/test_app_logic.cjs
node --check docs/app/app.js
node --check docs/app/logic.js
node --check docs/app/sw.js
python -m unittest discover -s tests -v
```

Los tests JavaScript se encuentran en `tests/` de la raíz del repositorio.

## Arquitectura

`logic.js` concentra validación, modelos de datos, plantillas y reglas y también puede ejecutarse con Node para pruebas. `app.js` solo controla formularios, interfaz y almacenamiento. `sw.js` almacena los recursos estáticos de la aplicación para uso sin conexión, sin ejecutar tareas programadas. `manifest.webmanifest` habilita el modo instalable.
