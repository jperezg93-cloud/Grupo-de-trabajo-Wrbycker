---
name: wrbycker-workspace-report
description: Generate an offline, read-only metadata inventory of permitted workspace text files using Wrbycker Agent Lab's Python CLI. Use for local repository inventories when the user authorizes the workspace.
---

# Wrbycker Workspace Report

Use this skill only when a user wants a **local metadata inventory** of a directory they can access, and when Python 3.11+ and the Wrbycker Agent Lab source code are available in the execution environment.

## Workflow

1. Confirm the requested workspace. Never silently substitute a more sensitive directory. Do not inspect personal secrets, credentials, or unapproved paths.
2. From the repository root, run:
   ```bash
   python -m wrbycker_agent --workspace /path/to/authorized/workspace report --json
   ```
   Replace the path with the exact authorized workspace. If the directory is the current repository root, you may omit `--workspace`.
3. Parse the JSON output. Explain `file_count`, `total_bytes`, `by_extension`, and `largest_files`. Mention the 100-file listing limit when `limited_to_first_100` is true.
4. Explain that this is a **metadata-only inventory**, not a vulnerability audit, source-code review or compliance check. Do not claim it scanned hidden files, arbitrary extensions, symlinks, or every file in a large workspace.
5. If the CLI is unavailable, report that limitation and provide the invocation command; do not invent report values.

## Permissions and guardrails

- Do not read file contents, run `ask`, call external APIs, or create notes to satisfy a report request.
- Never upload report data or source files.
- This skill provides instructions to an agent; it does **not** grant tool access or install itself.
- The local report does not need `OPENAI_API_KEY`. Other features of the project may use a paid API, but are out of scope.

For implementation constraints, see the repository's `docs/ARCHITECTURE.md` and `wrbycker_agent/report.py`.
