# Wrbycker Control Center — verificación de versión 1.0

## Alcance gratuito

La versión 1.0 es una aplicación web estática en `/app/`. Incluye ocho áreas operativas: resumen, tareas, ideas, Prompt Studio, personajes, workflows manuales, archivos y configuración. **No incorpora IA en la web** ni requiere dominio propio, servidor, API key, cuenta nueva o suscripción.

Los datos viven en `localStorage` del navegador de ese dispositivo. No se sincronizan automáticamente. Si se borran los datos del sitio o se cambia de navegador, pueden perderse; existe exportación e importación JSON validada para respaldos.

## Qué validan las pruebas automáticas

- Python `unittest`: herramientas del agente local, autorización para notas, límites de rutas y auditoría.
- Node `node --test`: modelos de datos, importación segura, formatos de prompts, fichas de personajes, reglas locales, manifest, iconos y ausencia de scripts externos en la app.
- Comprobación de sintaxis del JavaScript y validación de web en GitHub Actions.
- Despliegue del directorio `docs/` sobre GitHub Pages, con origen HTTPS público.

Las pruebas automáticas **no equivalen** a una auditoría de seguridad externa ni sustituyen las pruebas de uso en un celular real.

## Pruebas de aceptación en Android (manuales)

1. Abre la URL pública `https://jperezg93-cloud.github.io/Grupo-de-trabajo-Wrbycker/app/` en Chrome.
2. Añade dos tareas, cambia su estado y prueba los filtros.
3. Guarda una idea, búscala y verifica que aparezca en el resumen.
4. Crea una plantilla de Prompt Studio, rellena variables y prueba copiar y descargar .txt.
5. Crea una ficha de personaje, edítala y exporta Markdown.
6. Registra un workflow `Idea → Tarea`, ejecútalo y confirma el nuevo registro.
7. Selecciona un archivo `.txt` pequeño desde tu dispositivo y comprueba el informe local.
8. Exporta un respaldo JSON. Si no quieres perder datos reales, usa un navegador de prueba o perfil separado para validar restauración y borrado.
9. Cierra y abre el navegador: comprueba que tareas, ideas, plantillas, personajes y flujos persisten.
10. Si Chrome lo ofrece, elige «Instalar aplicación» o «Agregar a pantalla principal». Ábrela instalada.
11. Tras una primera visita en línea y carga completa de recursos, activa modo avión y revisa que el panel pueda abrirse desde su icono. La disponibilidad sin conexión depende del navegador y de que el servicio de caché se haya instalado correctamente.
12. Comprueba visualización vertical, orientación horizontal, teclado y controles táctiles.

## Criterios para considerar la Etapa 6 cerrada

- [x] Código v1.0 implementado con almacenamiento local y sin dependencias comerciales.
- [x] Iconos PNG 192/512, manifest y caché offline para PWA.
- [x] Tests de modelos y políticas automatizados.
- [x] Documentación y enlaces desde sitio público.
- [ ] Validación manual en el Android real del propietario.
- [ ] Confirmación de la instalación PWA/offline en ese dispositivo.

No afirmaremos que estos dos últimos puntos están verificados antes de hacer la prueba en el dispositivo.

## Futuro, fuera del presupuesto cero

La conexión con modelos comerciales de IA, la operación permanente de agentes remotos, una base de datos sincronizada entre dispositivos y una plataforma SaaS con usuarios requieren evaluar servicios/recursos y sus límites. El servidor MCP local y la CLI Python son componentes técnicos distintos, no funciones ejecutables dentro de GitHub Pages.

**GitHub Pages es un alojamiento de archivos estáticos, no un servidor Python.**
