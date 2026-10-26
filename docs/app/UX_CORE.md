# Wrbycker UX Core — guía de interacción 1.2

## Identidad y filosofía
«No porque se haga igual, va a ser igual». Las guías no son plantillas para copiar. Conservar la identidad oficial wb y la diferencia entre software gratuito y afiliación. No convertir Control Center en una interfaz bancaria, no incluir anuncios y no representar IA generativa que la aplicación no ejecuta.

## Ley I: contraste funcional
Fondo profundo y superficies neutras de intensidad baja; acento violeta para el módulo protagonista y acción principal, menta para información funcional. La jerarquía también utiliza tamaño, etiquetas y posición; nunca solo color. Mantener contraste legible y señales de foco.

## Ley II: geometría orgánica
Radios compartidos por familia de componentes (botones, tarjetas, paneles) y tamaños táctiles adecuados. La regla geométrica de referencia es 0 ≤ r ≤ min(ancho, alto)/2. No asumir que más redondeo reduce la carga cognitiva en todas las circunstancias.

## Ley III: navegación al alcance
En móviles, barra inferior para cuatro destinos frecuentes (Inicio, Tareas, Ideas, Personajes) y «Más» para Prompt Studio, Workflows, Archivos y Configuración. La navegación lateral permanece disponible en escritorio. La barra respeta safe-area y deja espacio al contenido; todos los destinos también son accesibles por navegación de teclado/tecnologías de asistencia.

## Implementación v1.2
- Hero creativo y Bento, sin cantidades ficticias: tareas y personajes se calculan del estado local validado.
- Navegación inferior con cierre al elegir destino o pulsar Escape.
- No modificar esquema JSON (versión 1), `localStorage` `wrbycker.control-center.v1`, `start_url`, `scope` o `id` de la PWA.
- Mantener ocho módulos y el funcionamiento fuera de línea mediante precaché estática.
- Prohibido borrar automáticamente datos del navegador, restaurar JSON o reiniciar almacenamiento para forzar actualización.
- Probar Android con conexión y modo avión tras revisar indicador de caché; no dar por completada la validación móvil sin evidencia real.
