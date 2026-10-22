# Wrbycker Agent Lab 🤖

**Herramientas experimentales, abiertas y educativas para aprender a construir agentes de IA con permisos limitados, supervisión humana y auditoría local.**

[![Tests](https://github.com/jperezg93-cloud/Grupo-de-trabajo-Wrbycker/actions/workflows/tests.yml/badge.svg)](https://github.com/jperezg93-cloud/Grupo-de-trabajo-Wrbycker/actions/workflows/tests.yml)

**Versión actual: v0.2.0.** Proyecto independiente en desarrollo; no es producto de seguridad auditado, ni un servidor MCP. Python 3.11+ y librería estándar para ejecución; OpenAI API es opcional.

## Empezar sin gastar créditos API

```bash
git clone https://github.com/jperezg93-cloud/Grupo-de-trabajo-Wrbycker.git
cd Grupo-de-trabajo-Wrbycker
python -m wrbycker_agent doctor
python -m wrbycker_agent report
python -m wrbycker_agent report --json
python -m wrbycker_agent files
python -m wrbycker_agent read README.md
python -m unittest discover -s tests -v
```

También puedes inspeccionar una carpeta ficticia incluida en el repositorio:

```bash
python -m wrbycker_agent --workspace examples/sample_workspace report
```

El informe resume **solo rutas de texto permitidas**, tipos de archivos y tamaños. No lee su contenido, no llama a OpenAI ni es una evaluación de seguridad.

## Conectar un modelo de IA (opcional)

Configura tu clave **en variables de entorno de tu equipo**, nunca en GitHub:

```bash
# Linux/macOS
export OPENAI_API_KEY="tu_clave_aqui"
python -m wrbycker_agent ask "Lee README.md y explica el proyecto"
```

En PowerShell:

```powershell
$env:OPENAI_API_KEY="tu_clave_aqui"
python -m wrbycker_agent ask "Lee README.md y explica el proyecto"
```

El modelo predeterminado es `gpt-5-mini`, configurable con `--model`. Las llamadas de API pueden generar cargos y enviar los textos consultados al servicio.

## Herramientas con permisos claros

| Función | Acceso | Restricción |
| --- | --- | --- |
| `files` | Lectura | Hasta 100 rutas de texto no ocultas |
| `read ARCHIVO` | Lectura | Máximo 12 KB y rutas restringidas |
| `report [--json]` | Metadatos | Funciona sin API ni contenido de archivos |
| `ask PREGUNTA` | Modelo (opcional) | Usa exclusivamente funciones declaradas |
| `create_note` por `ask` | Escritura | Solo notas nuevas `notes/*.md` con aprobación |
| `audit-verify` | Local | Comprueba cadena básica SHA-256 |

Para permitir solicitudes de notas agrega `--allow-writes` a `ask`. **Incluso así**, una terminal interactiva exige escribir `APROBAR` viendo el texto completo. Ninguna nota existente se sobrescribe.

## Web y documentación

El sitio estático está en [`docs/index.html`](docs/index.html) y se puede abrir sin servidor. Hay un workflow preparado para desplegarlo mediante GitHub Pages **cuando se configure GitHub Pages como origen GitHub Actions** en Settings → Pages. No afirma ejecutar IA en el navegador y no solicita API keys.

- [Página pública (una vez activada)](https://jperezg93-cloud.github.io/Grupo-de-trabajo-Wrbycker/)
- [Arquitectura y límites](docs/ARCHITECTURE.md)
- [Hoja de ruta](docs/ROADMAP.md)
- [Cómo contribuir](CONTRIBUTING.md)
- [Reportar un problema de seguridad](SECURITY.md)
- [Licencia MIT](LICENSE) — únicamente las aportaciones originales de este repositorio

## Créditos y límites del proyecto

La presentación inicial [OpenBot — Presentación de Proyecto](OpenBot%20-%20Presentaci%C3%B3n%20de%20Proyecto.pdf) estudia **[OpenBot de CopilotKit](https://github.com/CopilotKit/openbot)**, que es un proyecto externo e independiente. Wrbycker **no desarrolla ni mantiene OpenBot oficialmente**. El código de este repositorio es una implementación educativa original y **todavía no incluye MCP ni AG-UI**.

No guardes datos personales, secretos o material confidencial en el workspace de prueba. La política de archivos no constituye un sandbox de seguridad y la cadena SHA-256 de auditoría no está firmada externamente.

Mantenido por **Wrbycker**, desarrollador independiente. Propuestas, issues y aportaciones son bienvenidos.
