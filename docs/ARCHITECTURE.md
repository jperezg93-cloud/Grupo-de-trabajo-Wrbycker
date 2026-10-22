# Arquitectura del MVP

```text
Operador (CLI)
    └─ Pregunta → OpenAI Responses API (opcional)
                    └─ propuestas de funciones
                        ├─ list_files (lectura)
                        ├─ read_file (lectura + auditoría)
                        └─ create_note (aprobación humana + notas nuevas)
                                    └─ .wrbycker/audit.jsonl
```

El agente realiza llamadas a una lista cerrada de herramientas de Python. Los parámetros se validan de nuevo en el servidor local antes de tocar archivos. Se prohíben rutas absolutas, `..`, componentes ocultos, enlaces simbólicos y extensiones no incluidas en una lista explícita. Las lecturas tienen límite de 12 KB. Las notas no pueden superar 4000 caracteres.

**Límites conocidos:** no es aislamiento OS, la política no resuelve ataques TOCTOU en carpetas compartidas, la integridad de registros no está anclada fuera del equipo, no hay identidad multiusuario, no hay servidor MCP, integración AG-UI, navegador ni ejecución de herramientas externas. Ninguna decisión de seguridad depende únicamente de instrucciones del modelo.

Los tests usan transporte falso para verificar el flujo sin costos; la API real no se ejecuta dentro del CI. Al usar la API, el operador asume costos y transferencia de archivos leídos al servicio.
