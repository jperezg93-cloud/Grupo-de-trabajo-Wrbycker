# Seguridad

Este es un **prototipo educativo**, no un entorno aislado de ejecución ni una garantía de seguridad para datos sensibles. La validación de rutas no defiende contra todos los ataques de carrera en un sistema de archivos compartido. Úsalo en una carpeta local dedicada y confiable.

- No incluyas claves ni archivos confidenciales en el directorio de trabajo. Archivos de texto leídos por el agente pueden enviarse a OpenAI API.
- No guardes `OPENAI_API_KEY` en archivos versionados. Si se filtra, revócala y rótala.
- Por defecto no se permite crear notas; debes añadir `--allow-writes` y confirmar cada solicitud escribiendo `APROBAR`.
- El registro `.wrbycker/audit.jsonl` guarda metadatos de acciones, **no** el contenido; la cadena SHA-256 es una medida de detección básica, no una garantía fuerte de inmutabilidad.
- Solo se permite escritura de archivos nuevos `notes/*.md`. No se permiten sobrescrituras, acceso a terminal ni ejecución de código desde el agente.
- La API real requiere conectividad, créditos y un modelo compatible; la suite automatizada usa respuestas simuladas.

**Divulgación responsable:** evita publicar vulnerabilidades explotables con datos sensibles en issues públicos. Comunica inicialmente el problema al mantenedor mediante un canal privado del perfil de GitHub, si está disponible, para coordinar una corrección.