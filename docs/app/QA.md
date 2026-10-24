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
- [x] Validación manual de las funciones principales en el Android del propietario (22 de octubre de 2026).
- [x] Confirmación de instalación y apertura de la PWA sin conexión en ese dispositivo (22 de octubre de 2026).

**Alcance exacto de la validación manual:** se verificaron mediante capturas reales: creación y persistencia de una tarea pendiente, creación de una idea, plantilla de prompt y exportación .txt, creación y exportación Markdown de una ficha, ejecución manual de Idea → Tarea (aumentó el número de tareas de 1 a 2), importación y restauración de un respaldo JSON, instalación de PWA y apertura con modo avión mostrando datos guardados, y análisis de un archivo .txt (137 bytes, 1 línea, 18 palabras, 134 caracteres). La aplicación indicó «Acceso sin conexión preparado ✓» y «Respaldo restaurado correctamente».

**Cobertura pendiente, no bloqueante para la aceptación funcional principal:** completar tareas y probar todos sus filtros, comprobar búsqueda de ideas, edición de fichas, restauración de respaldos con datos conflictivos, borrado destructivo, pruebas en orientación horizontal y otros dispositivos/navegadores. La aceptación de funciones observadas **no** implica auditoría de seguridad, sincronización entre equipos ni disponibilidad de servicios remotos.

## Futuro, fuera del presupuesto cero

La conexión con modelos comerciales de IA, la operación permanente de agentes remotos, una base de datos sincronizada entre dispositivos y una plataforma SaaS con usuarios requieren evaluar servicios/recursos y sus límites. El servidor MCP local y la CLI Python son componentes técnicos distintos, no funciones ejecutables dentro de GitHub Pages.

**GitHub Pages es un alojamiento de archivos estáticos, no un servidor Python.**


## Fallo observado y corrección offline (v1.0.1)

**Observación en Android:** con modo avión activo, el icono de la PWA se quedó en la pantalla de inicio. Instalar la aplicación no confirma que los archivos se hayan guardado para funcionar sin conexión.

**Corrección implementada:** ambos destinos de GitHub Pages, `/app/` y `/docs/app/`, ahora incluyen una aplicación completa con su propio service worker. El arranque `index.html` ya no depende de una redirección en el modo de publicación desde la raíz. El worker precarga HTML, CSS, JavaScript y manifest **antes de activarse**, y responde a la navegación con ese HTML cacheado. Se incorporaron pruebas de arranque simulado sin red.

**Cómo probar sin arriesgar datos:**

1. Vuelve a activar Wi‑Fi y abre la app instalada al menos una vez mientras hay conexión.
2. Entra a **Configuración → Estado del producto** y comprueba el mensaje **«Acceso sin conexión preparado ✓»**. Si no aparece, no continúes con la prueba offline.
3. En Configuración, exporta un respaldo JSON antes de limpiar datos o reinstalar.
4. Cierra por completo la app, activa modo avión sin Wi‑Fi y vuelve a abrirla desde su icono.
5. Comprueba que la tarea de prueba y las demás funciones siguen visibles.

Si el icono sigue mostrando únicamente la pantalla de arranque, abre con conexión la dirección explícita `https://jperezg93-cloud.github.io/Grupo-de-trabajo-Wrbycker/app/index.html`. Evita borrar los datos del sitio o desinstalar sin un respaldo: las notas, tareas y personajes solo están en el almacenamiento local.

Una prueba de Node simula el service worker con red deshabilitada para ambas estructuras de publicación. No reemplaza la aceptación final con un Android real.

## Pruebas recomendadas de Control Center 1.1 (pendientes de aceptación Android)

1. Antes de actualizar, **exporta el JSON** de datos en Configuración y consérvalo. No borres datos ni desinstales.
2. Abre la PWA con internet una vez para permitir que se prepare la caché v8. Comprueba «Acceso sin conexión preparado ✓».
3. Desde Resumen, busca una palabra guardada en alguna tarea, idea, prompt o personaje. Comprueba que aparece una coincidencia y que abre su sección.
4. Repite una búsqueda con diferente combinación de mayúsculas y acentos.
5. Si seleccionas un respaldo JSON, verifica que la confirmación muestre **los cinco conteos del archivo y los cinco actuales**. Pulsa **Cancelar** para comprobar que tus datos permanecen intactos. Para probar restauración real, usa una instalación de prueba o un respaldo previamente validado.
6. Activa modo avión, reinicia la PWA y prueba el buscador sin internet.
7. Verifica el enlace «Inicio Wrbycker», que abre el portafolio, sin cambiar la instalación de la aplicación.

**La restauración todavía sustituye todo el contenido local**; no fusiona respaldos. Estas pruebas no se marcan como superadas hasta recibir confirmación real desde Android.
