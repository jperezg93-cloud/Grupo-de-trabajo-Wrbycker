"""Command-line interface for the Wrbycker Agent Lab."""
from __future__ import annotations

import argparse
import os
import sys

from .agent import run_agent
from .core import Workspace, PolicyError

def approval(path: str, content: str) -> bool:
    if not sys.stdin.isatty():
        return False
    print(f"\nSolicitud de creación: {path}\n---\n{content}\n---")
    return input("Escribe APROBAR para crear esta nota: ").strip() == "APROBAR"

def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Wrbycker Agent Lab - prototipo de agente supervisado")
    parser.add_argument("--workspace", default=".", help="Directorio de trabajo (por defecto: actual)")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("doctor", help="Revisar configuración sin usar la API")
    sub.add_parser("files", help="Listar archivos permitidos")
    read = sub.add_parser("read", help="Leer un archivo de texto permitido")
    read.add_argument("path")
    ask = sub.add_parser("ask", help="Consultar un modelo con herramientas controladas")
    ask.add_argument("prompt")
    ask.add_argument("--model", default="gpt-5-mini")
    ask.add_argument("--allow-writes", action="store_true", help="Permitir pedir aprobación para notas nuevas")
    sub.add_parser("audit-verify", help="Verificar la cadena de auditoría local")
    args = parser.parse_args(argv)
    try:
        workspace = Workspace(args.workspace)
        if args.command == "doctor":
            print(f"Workspace: {workspace.root}")
            print("OpenAI API key:", "configurada" if os.environ.get("OPENAI_API_KEY") else "ausente")
            print("Modo: lectura por defecto; escritura bajo aprobación interactiva")
        elif args.command == "files":
            print("\n".join(workspace.list_files()))
        elif args.command == "read":
            print(workspace.read_file(args.path))
        elif args.command == "audit-verify":
            ok = workspace.audit.verify()
            print("Auditoría válida" if ok else "Auditoría alterada o inválida")
            return 0 if ok else 1
        elif args.command == "ask":
            if not os.environ.get("OPENAI_API_KEY"):
                raise RuntimeError("Configura OPENAI_API_KEY para usar el comando ask")
            print(run_agent(args.prompt, workspace, model=args.model,
                            approve=approval if args.allow_writes else None))
        return 0
    except (PolicyError, RuntimeError, OSError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
