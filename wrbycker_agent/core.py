"""Workspace-scoped text tools and a best-effort, hash-linked audit trail."""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
from datetime import datetime, timezone
from typing import Callable

ALLOWED_SUFFIXES = {".md", ".txt", ".py", ".json", ".yml", ".yaml", ".toml"}
SKIP_DIRS = {"node_modules", "__pycache__", "dist", "build"}
MAX_READ_BYTES = 12_000
MAX_NOTE_CHARS = 4_000

class PolicyError(ValueError):
    """File action denied by the workspace policy."""

class AuditLog:
    def __init__(self, root: Path):
        self.path = root / ".wrbycker" / "audit.jsonl"

    def record(self, action: str, path: str, status: str) -> None:
        self.path.parent.mkdir(exist_ok=True)
        previous = "0" * 64
        if self.path.exists():
            lines = self.path.read_text(encoding="utf-8").splitlines()
            if lines:
                previous = json.loads(lines[-1])["hash"]
        entry = {"time": datetime.now(timezone.utc).isoformat(), "action": action,
                 "path": path, "status": status, "previous": previous}
        entry["hash"] = hashlib.sha256(json.dumps(entry, ensure_ascii=False, sort_keys=True,
                    separators=(",", ":")).encode()).hexdigest()
        with self.path.open("a", encoding="utf-8") as out:
            out.write(json.dumps(entry, ensure_ascii=False, sort_keys=True) + "\n")

    def verify(self) -> bool:
        if not self.path.exists():
            return True
        previous = "0" * 64
        try:
            for line in self.path.read_text(encoding="utf-8").splitlines():
                entry = json.loads(line)
                digest = entry.pop("hash")
                if entry.get("previous") != previous:
                    return False
                calculated = hashlib.sha256(json.dumps(entry, ensure_ascii=False,
                       sort_keys=True, separators=(",", ":")).encode()).hexdigest()
                if calculated != digest:
                    return False
                previous = digest
            return True
        except (KeyError, ValueError, TypeError):
            return False

class Workspace:
    def __init__(self, root: str | Path):
        self.root = Path(root).expanduser().resolve(strict=True)
        if not self.root.is_dir():
            raise PolicyError("El workspace debe ser un directorio")
        self.audit = AuditLog(self.root)

    def _safe_path(self, name: str) -> Path:
        if not isinstance(name, str) or not name or "\\" in name or "\x00" in name:
            raise PolicyError("Ruta inválida")
        relative = Path(name)
        if relative.is_absolute() or any(p in (".", "..") or p.startswith(".") for p in relative.parts):
            raise PolicyError("Rutas absolutas, ocultas o con '..' no permitidas")
        if relative.suffix.lower() not in ALLOWED_SUFFIXES:
            raise PolicyError("Extensión no autorizada")
        current = self.root
        for part in relative.parts:
            current = current / part
            if current.is_symlink():
                raise PolicyError("Enlaces simbólicos no permitidos")
        candidate = (self.root / relative).resolve()
        if not candidate.is_relative_to(self.root):
            raise PolicyError("Ruta fuera del workspace")
        return candidate

    def list_files(self) -> list[str]:
        files: list[str] = []
        for directory, subdirs, names in os.walk(self.root, followlinks=False):
            subdirs[:] = [d for d in subdirs if not d.startswith(".") and d not in SKIP_DIRS]
            for name in names:
                file = Path(directory) / name
                if name.startswith(".") or file.is_symlink() or file.suffix.lower() not in ALLOWED_SUFFIXES:
                    continue
                files.append(file.relative_to(self.root).as_posix())
                if len(files) >= 100:
                    return sorted(files)
        return sorted(files)

    def read_file(self, name: str) -> str:
        try:
            path = self._safe_path(name)
            if not path.is_file() or path.stat().st_size > MAX_READ_BYTES:
                raise PolicyError("Archivo inexistente o demasiado grande (máx. 12 KB)")
            content = path.read_text(encoding="utf-8")
            self.audit.record("read", name, "ok")
            return content
        except (PolicyError, UnicodeError, OSError) as exc:
            self.audit.record("read", str(name)[:200], "denied")
            raise PolicyError(str(exc)) from exc

    def create_note(self, name: str, content: str, approve: Callable[[str, str], bool] | None = None) -> str:
        try:
            if not isinstance(content, str) or not 0 < len(content) <= MAX_NOTE_CHARS:
                raise PolicyError("La nota debe tener entre 1 y 4000 caracteres")
            path = self._safe_path(name)
            relative = Path(name)
            if len(relative.parts) != 2 or relative.parts[0] != "notes" or relative.suffix.lower() != ".md":
                raise PolicyError("Solo se pueden crear notas nuevas en notes/*.md")
            if path.exists():
                raise PolicyError("No se permite sobrescribir archivos existentes")
            if approve is None or approve(name, content) is not True:
                raise PolicyError("Se requiere aprobación humana explícita")
            notes_dir = self.root / "notes"
            notes_dir.mkdir(exist_ok=True)
            if notes_dir.is_symlink() or not notes_dir.is_dir():
                raise PolicyError("Directorio notes no seguro")
            flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0)
            fd = os.open(path, flags, 0o600)
            with os.fdopen(fd, "w", encoding="utf-8") as stream:
                stream.write(content)
            self.audit.record("create_note", name, "ok")
            return f"Nota creada: {name}"
        except (PolicyError, OSError) as exc:
            self.audit.record("create_note", str(name)[:200], "denied")
            raise PolicyError(str(exc)) from exc
