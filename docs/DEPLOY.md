# Publicar el sitio en GitHub Pages

El sitio estático se encuentra en `docs/index.html` y funciona sin clave de API, backend o base de datos.

## Configuración inicial

Un administrador del repositorio debe realizar esta configuración **una sola vez**:

1. Abre [Settings → Pages](https://github.com/jperezg93-cloud/Grupo-de-trabajo-Wrbycker/settings/pages).
2. Bajo **Build and deployment → Source**, selecciona **GitHub Actions**.
3. Guarda y ejecuta el workflow **Deploy Wrbycker Site** desde **Actions**, o crea un nuevo commit en `main` dentro de `docs/`.
4. Comprueba el resultado en `https://jperezg93-cloud.github.io/Grupo-de-trabajo-Wrbycker/`.

Este flujo sube solo el contenido estático de la carpeta `docs/` mediante las acciones oficiales de GitHub. Los cambios en pull requests se revisan con pruebas; solo `main` publica.

**Si el workflow de Pages falla por configuración**, verifica primero que el origen de publicación esté establecido en **GitHub Actions** y que Pages esté habilitado. El bot de ChatGPT que edita archivos puede no disponer de permiso de administración para cambiar esta preferencia.

## Validar la web localmente

Basta con abrir `docs/index.html` en un navegador moderno. Las rutas CSS, JS y SVG son relativas. Las herramientas de IA descritas se ejecutan en la CLI de Python, **no** en el sitio web.

```bash
python -m unittest discover -s tests -v
node --check docs/main.js
```

No incluyas credenciales, tokens, datos personales ni código dependiente de claves en la web estática pública.


## Dos orígenes de publicación y rutas compatibles

Este repositorio puede mostrar dos workflows de Pages: `pages build and deployment` (GitHub, generado automáticamente cuando el origen es una rama) y `Deploy Wrbycker Site` (Actions propio, publica `docs/`). Son artefactos **diferentes** y pueden terminar en distinto orden.

Para que las direcciones públicas anunciadas funcionen en ambos modos, existen dos entradas de compatibilidad en la raíz del repositorio:

- `/index.html` redirige a `/docs/` cuando GitHub sirve el repositorio completo.
- `/app/index.html` redirige a `/docs/app/` en ese mismo modo.

Cuando el workflow propio publica únicamente `docs/`, se usan directamente `docs/index.html` y `docs/app/index.html`, sin redirección. Las pruebas automatizadas validan estos cuatro archivos.

**La configuración recomendada sigue siendo Settings → Pages → Build and deployment → Source: GitHub Actions**, que evita que el workflow automático de Jekyll genere otra publicación. El acceso público principal permanece en `https://jperezg93-cloud.github.io/Grupo-de-trabajo-Wrbycker/` y el de la aplicación en `.../app/`.

Si ves un 404 tras una publicación, abre `https://jperezg93-cloud.github.io/Grupo-de-trabajo-Wrbycker/docs/app/` como enlace alternativo mientras revisas el origen configurado.


## PWA offline compatible con ambos artefactos

El fallo detectado al abrir la PWA en modo avión después de instalarla se trató en v1.0.1:

- Si se despliega solamente `docs/`, la aplicación está en `docs/app/index.html` (servida públicamente como `/app/`).
- Si se despliega toda la raíz mediante el workflow automático de GitHub, la aplicación **también** está en `app/index.html`, con copias de los archivos estáticos necesarios y su propio service worker. No usa una redirección para iniciar.
- Los dos modos emplean el mismo código funcional y el mismo nombre de almacenamiento local. Las rutas del favicon y de iconos son relativas a cada publicación.
- Los tests comprueban que ambas copias están sincronizadas y simulan un arranque completamente sin red.

Para evitar duplicaciones y errores futuros, sigue siendo recomendable dejar **un solo origen de publicación: GitHub Actions** en Settings → Pages. Después de publicar una nueva versión de la PWA, sus usuarios deben abrirla con internet para que pueda instalarse el nuevo caché; nunca borres sus datos locales sin exportar respaldo.
