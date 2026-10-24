# Hoja de ruta de Wrbycker Agent Lab

## v0.1 — prototipo educativo (completado)
- [x] Lectura limitada a archivos dentro de un workspace
- [x] Creación de notas nuevas bajo aprobación humana
- [x] Auditoría básica encadenada con SHA-256 y verificación
- [x] Responses API opcional, con herramientas explícitas
- [x] Pruebas unitarias sin claves y CI de Python

## v0.2 — información y presentación (completado)
- [x] Informe de inventario local, gratuito y sin API, con exportación JSON
- [x] Carpeta de ejemplo de uso
- [x] Sitio estático adaptable a móviles, sin rastreadores
- [x] Flujo de publicación para GitHub Pages (requiere activar GitHub Pages en Settings)
- [x] Plantillas de incidencias y pull requests
- [x] Nuevas pruebas del informe y sitio estático

## Control Center 1.0 — aplicación gratuita (implementado en el navegador)
- [x] Dashboard responsive separado de la web de presentación
- [x] Gestión local de tareas e ideas
- [x] Prompt Studio con variables, plantillas y exportación .txt
- [x] Ficha maestra de personajes y exportación Markdown
- [x] Reglas de workflow manuales para convertir tareas e ideas
- [x] Análisis de archivos de texto seleccionados por el usuario, sin subirlos
- [x] Respaldos JSON, restauración validada y borrado local
- [x] PWA con iconos y caché para uso sin conexión tras primera visita
- [x] Suite JavaScript sin dependencias npm y despliegue por GitHub Pages
- [x] Verificación manual de instalación PWA y funcionamiento offline en el Android del propietario (22 de octubre de 2026; ver [QA](app/QA.md))

## Futuro — no implementado
- [ ] Integración completa con un servidor MCP certificado por pruebas
- [ ] Configuración avanzada de políticas y presupuestos de tokens
- [ ] Endurecimiento ante carreras de sistema de archivos (TOCTOU)
- [ ] Gestión de roles, identidad y auditoría remota
- [ ] Validación de integración con API real y presupuesto asignado
- [ ] Soporte opcional AG-UI tras validar su especificación

**No consideres la presencia en esta lista como una función existente hasta verla marcada como completada.** Wrbycker es independiente del proyecto OpenBot de CopilotKit.

## Control Center 1.1 — mejoras gratuitas (implementación web)

- [x] Búsqueda global local de tareas, ideas, plantillas, fichas de personajes y workflows.
- [x] Vista previa comparativa de cantidades antes de restaurar JSON, con aviso de reemplazo.
- [x] Enlace de regreso al portafolio general desde Control Center.
- [x] Actualización del cache offline a v8 para ambas modalidades de GitHub Pages, sin cambiar el almacenamiento.
- [ ] Aceptación manual de la actualización v1.1 en Android del propietario.
- [ ] Etiquetas y filtros avanzados (requieren diseño de migración/compatibilidad con JSON v1).
- [ ] Adaptadores de ficha maestra por plataforma (Cycle, CraveU, Saylo), sin prometer compatibilidad automática con cambios de sus formularios.
- [ ] Importación con fusión y resolución de conflictos, siempre con exportación previa.
