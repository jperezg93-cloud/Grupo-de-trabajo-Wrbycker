# Identidad visual WrBycker — 22 de octubre de 2026

**Aprobado por el creador:** un único monograma `wb` sobre el texto `wrbycker`, en minúsculas. El mismo diseño se utilizará para Agent Lab, Control Center y la marca paraguas. Cada proyecto puede añadir un descriptor secundario, pero no cambiar la geometría del símbolo.

## Paleta oficial

| Función | Valor | Uso |
|---|---|---|
| Violeta del monograma | `#7239FC` | Trazo de la w |
| Blanco de la marca | `#FDFDFD` | Trazo de la b y nombre |
| Menta de acento | `#75EBCB` | Segmento superior de la b |
| Negro azulado de soporte | `#0B0E19` | Fondos oscuros, iconos |

Los valores se aproximaron a partir de los colores dominantes del kit PNG aprobado; no son una especificación Pantone ni garantizan correspondencia de impresión. Para texto y controles pueden usarse tonos más claros de violeta o menta por motivos de contraste accesible sin cambiar los colores del logotipo.

## Activos y límites

- `wb-icon.svg` es un trazado automático **aproximado** a partir del PNG del icono aprobado, destinado a favicon, cabeceras y navegadores compatibles con iconos SVG. No sustituye al archivo maestro de diseño ni a un SVG producido manualmente con trazados verificados.
- El kit maestro PNG transparente y las versiones horizontal/monocromática aprobadas se conservan como referencia del proyecto de identidad. Esta actualización de web no intenta reconstruir el texto `wrbycker` con otra tipografía.
- Las dos rutas PWA ahora utilizan los iconos PNG oficiales `docs/app/icon-192.png` y `docs/app/icon-512.png`, optimizados a partir del isotipo aprobado. El manifest prioriza los PNG para Android; el SVG sigue como favicon y símbolo de las cabeceras. Algunos iconos ya instalados pueden tardar en actualizarse por la caché del navegador/sistema.
- Nunca reemplazar `localStorage`, `start_url`, `scope` ni las claves de datos de Control Center al actualizar recursos de marca.

## Aplicación coherente

- Proyecto software: la aplicación y el sitio muestran el monograma y sus propias denominaciones «Agent Lab» y «Control Center».
- Portada del ecosistema: comparte los colores y dirige a proyectos separados.
- Enlace de afiliados: se mantiene exclusivamente en Linktree, con sus avisos propios. La identidad visual común **no** significa integrar anuncios o datos de OurDream en la aplicación.
- Cualquier nueva variante comercial o comunitaria debe usar el mismo isotipo y añadir solo un subtítulo; no alterar el logo madre.

## Publicación Android — versión 6 de caché

- Los PNG de 192 × 192 y 512 × 512 sustituyeron a los iconos provisionales. Sus bordes, tipografía del isotipo y color se derivaron del PNG aprobado por el creador.
- Ambas versiones de GitHub Pages (`/app/` y `/docs/app/`) conservan sus rutas, `start_url`, `scope` y almacenamiento `localStorage` sin cambios.
- La caché de recursos estáticos de la PWA cambia de `v5` a `v6`. Nunca borrar los datos del sitio ni desinstalar la aplicación por un cambio de icono. El respaldo JSON es una medida adicional de seguridad.
- No modifica ni reemplaza el logotipo completo PNG de la identidad, ni incluye afiliados o enlaces externos nuevos.
