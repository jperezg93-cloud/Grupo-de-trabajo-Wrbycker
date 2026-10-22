# Wrbycker Agent Lab 🤖

**Prototipo abierto de asistente de IA con herramientas limitadas, aprobación humana y auditoría local.**

[![Tests](https://github.com/jperezg93-cloud/Grupo-de-trabajo-Wrbycker/actions/workflows/tests.yml/badge.svg)](https://github.com/jperezg93-cloud/Grupo-de-trabajo-Wrbycker/actions/workflows/tests.yml)

> **Estado: MVP educativo v0.1.0.** No es un producto de seguridad auditado ni un servidor MCP. La integración con OpenAI es opcional y requiere una API key propia; no incluye créditos.

## Qué puedes hacer

- Enumerar y leer archivos de texto de un directorio elegido, con límites de tamaño y validación de rutas.
- Preguntar a un modelo de OpenAI sobre esos archivos mediante **Responses API y function calling**.
- Proponer notas `notes/*.md`: **no se escriben** sin `--allow-writes` y confirmación interactiva `APROBAR`.
- Registrar lecturas y creaciones en `.wrbycker/audit.jsonl` con huellas SHA-256 encadenadas (detección básica de cambios, no prueba criptográfica externa).
- Ejecutar pruebas automáticas sin cuenta de OpenAI ni dependencias externas.

## Inicio rápido

Requisitos: Python **3.11 o superior**. Clona el repositorio y entra en su directorio:

```bash
git clone https://github.com/jperezg93-cloud/Grupo-de-trabajo-Wrbycker.git
cd Grupo-de-trabajo-Wrbycker
python -m wrbycker_agent doctor
python -m wrbycker_agent files
python -m wrbycker_agent read README.md
python -m unittest discover -s tests -v
```

Para conectar OpenAI API, configura tu clave **solo en tu equipo** (nunca la subas al repositorio):

```bash
# macOS/Linux
export OPENAI_API_KEY="tu_clave_aqui"
python -m wrbycker_agent ask "Lee README.md y dame tres mejoras concretas"
```

En PowerShell:

```powershell
$env:OPENAI_API_KEY="tu_clave_aqui"
python -m wrbycker_agent ask "Lee README.md y propone un plan de trabajo"
```

El modelo predeterminado es `gpt-5-mini`; se puede sustituir usando `--model`. Las llamadas a API pueden generar cargos en tu cuenta.

La lectura es el comportamiento predeterminado. Para **solicitar** la creación de una nota:

```bash
python -m wrbycker_agent ask "Crea la nota notes/ideas.md con 3 ideas" --allow-writes
```

La herramienta mostrará la nota completa y solo la creará si el operador escribe `APROBAR` en una terminal interactiva. Nunca sobrescribe notas existentes.

## Seguridad y límites

Este MVP solo ofrece tres funciones: `list_files`, `read_file`, `create_note`. No ejecuta comandos de shell, no navega por la web, no entrega accesos MCP ni modifica código. Ignora carpetas ocultas y no sigue enlaces simbólicos; **no lo uses como sandbox de seguridad para adversarios o en entornos multiusuario**. No ejecutes el agente sobre carpetas con información confidencial: los textos leídos por la herramienta se envían al servicio de API para responder. Consulta [SECURITY.md](SECURITY.md).

## Relación con OpenBot / CopilotKit

La documentación original de este repositorio exploraba **[OpenBot de CopilotKit](https://github.com/CopilotKit/openbot)**, un proyecto **independiente** desarrollado por sus respectivos mantenedores. **Wrbycker no es el equipo desarrollador de OpenBot, ni está afiliado oficialmente a CopilotKit.** La presentación histórica se conserva sin cambios en `OpenBot - Presentación de Proyecto.pdf`. Este código Python es una implementación educativa original de herramientas supervisadas; **no integra MCP ni AG-UI todavía**.

## Proyecto

- [Arquitectura y limitaciones](docs/ARCHITECTURE.md)
- [Plan de desarrollo](docs/ROADMAP.md)
- [Cómo contribuir](CONTRIBUTING.md)
- [Política de seguridad](SECURITY.md)
- [Licencia MIT](LICENSE) (únicamente para los aportes originales de este repositorio; recursos de terceros mantienen sus propias licencias)

Proyecto mantenido de forma independiente por **Wrbycker**. Comentarios, issues y pull requests son bienvenidos.