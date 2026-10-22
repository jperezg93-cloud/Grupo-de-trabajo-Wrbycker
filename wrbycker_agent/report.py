"""Offline, read-only repository inventory. No API key or file content required."""
from __future__ import annotations

from collections import Counter
from pathlib import Path
from typing import Any

from .core import Workspace


def build_report(workspace: Workspace) -> dict[str, Any]:
    """Summarize only text files already permitted by Workspace.list_files()."""
    names = workspace.list_files()
    extensions: Counter[str] = Counter()
    largest: list[tuple[int, str]] = []
    total_bytes = 0
    for name in names:
        try:
            path = workspace._safe_path(name)
            if not path.is_file() or path.is_symlink():
                continue
            size = path.stat().st_size
        except (OSError, ValueError):
            continue
        total_bytes += size
        extensions[Path(name).suffix.lower()] += 1
        largest.append((size, name))
    largest.sort(key=lambda value: (-value[0], value[1]))
    return {
        "version": "0.2.0",
        "file_count": sum(extensions.values()),
        "total_bytes": total_bytes,
        "by_extension": dict(sorted(extensions.items())),
        "largest_files": [
            {"path": name, "bytes": size} for size, name in largest[:5]
        ],
        "limited_to_first_100": len(names) >= 100,
        "notes": [
            "Inventario local, sin llamadas a API ni lectura del contenido de archivos.",
            "Solo aparecen extensiones permitidas y archivos no ocultos; máximo 100 rutas.",
            "No equivale a una auditoría de vulnerabilidades.",
        ],
    }


def format_report(report: dict[str, Any]) -> str:
    lines = [
        "Wrbycker Agent Lab · Informe local",
        "=" * 34,
        f"Archivos permitidos: {report['file_count']}",
        f"Tamaño total: {report['total_bytes']} bytes",
        "Tipos de archivo:",
    ]
    for extension, count in report["by_extension"].items():
        lines.append(f"  {extension}: {count}")
    lines.append("Archivos más grandes:")
    for item in report["largest_files"]:
        lines.append(f"  {item['path']} ({item['bytes']} bytes)")
    if report["limited_to_first_100"]:
        lines.append("Aviso: solo se inspeccionaron las primeras 100 rutas permitidas.")
    lines.append("Sin IA ni conexión a internet. No analiza vulnerabilidades.")
    return "\n".join(lines)
