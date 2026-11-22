# Puerta Principal WrBycker — preparación segura

Estado: **pendiente de incorporar el HTML original**. Esta rama es de preparación; no se ha desplegado ni sustituido ninguna página.

## Fuente aprobada

Archivo original: `ACTIVOS_RECIENTES/Puerta_principal_Wrbycker_FINAL.html` dentro del respaldo maestro del 21/11/2026.

Destino propuesto: `docs/puerta/index.html`.

La página original debe copiarse **sin cambiar su contenido ni su identidad visual**. Los enlaces de Control Center y Universe ya son absolutos. La imagen principal está incorporada como data URI, así que no requiere subirla por separado. El documento utiliza Google Fonts como mejora visual.

## Condiciones de publicación

1. No editar `docs/marca.html`, `marca.html`, `docs/index.html`, `docs/app/`, ni `app/`.
2. No alterar el monograma `wb`; conservar enlaces y no incorporar afiliados OurDream/Soulkyn ni Linktree.
3. Mantener intactos manifest, service workers, scope, start_url y almacenamiento local de Control Center.
4. Añadir únicamente `docs/puerta/index.html`; realizar commit en esta rama.
5. Revisar diff y verificar enlaces, accesibilidad y vista móvil.
6. Crear pull request contra main. El workflow `.github/workflows/pages.yml` solo despliega los cambios de `docs/**` integrados en main; tener esta rama no publica la página.
7. Tras aprobar e integrar, comprobar la dirección `https://jperezg93-cloud.github.io/Grupo-de-trabajo-Wrbycker/puerta/`.

## Reversión

Para revertir el despliegue, se revierte exclusivamente el commit que añade `docs/puerta/index.html`. No se eliminan datos locales ni se modifica la PWA.

## Seguimiento

El archivo fuente original tiene que añadirse desde el paquete de continuidad sin transformarlo en una imitación. No se debe marcar la publicación como terminada hasta verificar el despliegue real.
