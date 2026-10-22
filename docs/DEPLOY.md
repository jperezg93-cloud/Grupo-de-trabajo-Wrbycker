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
