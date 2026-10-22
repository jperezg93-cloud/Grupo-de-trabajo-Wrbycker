# Arquitectura: Wrbycker Agent Lab v0.2

```text
CLI local (Python 3.11+)
  ├─ doctor / files / read
  ├─ report [--json] → inventario de rutas permitidas (sin contenido ni API)
  ├─ audit-verify → verificación del encadenado de eventos
  └─ ask → OpenAI Responses API [opcional, puede tener costo]
       └─ tools: list_files | read_file | create_note
             └─ validación local → aprobación explícita antes de nueva nota
       └─ .wrbycker/audit.jsonl
```

El sitio de GitHub Pages es **estático**: no se conecta con cuentas, claves ni la terminal del usuario. Muestra documentación y comandos, no un agente remoto.

## Control de acceso

- Lista cerrada de funciones; no hay ejecución de shell ni navegación del agente.
- Rutas relativas dentro de un directorio raíz; `..`, carpetas ocultas y symlinks quedan excluidos.
- Extensiones de texto permitidas; lectura limitada a 12 KB por archivo y listado de máximo 100 rutas.
- Las notas nuevas se guardan únicamente en `notes/*.md`, mediante confirmación `APROBAR`; no se sobrescriben.
- Hashes de auditoría permiten detectar cambios sencillos, pero sin firma externa no previenen un atacante con acceso completo a disco.

## Riesgos conocidos

No es aislamiento de sistema operativo ni entorno multiusuario seguro. Hay posibles carreras TOCTOU si otra persona/proceso cambia la estructura de carpetas al mismo tiempo. Las políticas no impiden que el modelo consulte archivos con información sensible si los colocas en una carpeta autorizada; usa exclusivamente proyectos de prueba. Las solicitudes `ask` envían la pregunta y el contenido leído a OpenAI; pueden tener costo. No hay MCP/AG-UI ni mecanismos de sandboxing OS en v0.2.

El inventario `report` no requiere API ni lee contenidos; únicamente cuenta rutas permitidas y sus tamaños.
