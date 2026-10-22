import json
import copy
import tempfile
import unittest
from pathlib import Path

from wrbycker_agent.core import PolicyError, Workspace
from wrbycker_agent.agent import run_agent, execute_tool

class WorkspaceTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        (self.root / "README.md").write_text("Hola Wrbycker", encoding="utf-8")
        (self.root / ".env").write_text("SECRET=demo", encoding="utf-8")
        self.ws = Workspace(self.root)

    def test_list_skips_hidden_files(self):
        self.assertEqual(self.ws.list_files(), ["README.md"])

    def test_read_and_audit(self):
        self.assertEqual(self.ws.read_file("README.md"), "Hola Wrbycker")
        self.assertTrue(self.ws.audit.verify())
        row = json.loads(self.ws.audit.path.read_text().splitlines()[0])
        self.assertNotIn("Hola Wrbycker", str(row))

    def test_traversal_and_secret_denied(self):
        for path in ("../secret.md", "/tmp/x.md", ".env", ".git/config", "README.md/../../secret.md"):
            with self.subTest(path=path), self.assertRaises(PolicyError):
                self.ws.read_file(path)

    def test_symlink_denied(self):
        (self.root / "target.md").write_text("secret")
        (self.root / "link.md").symlink_to(self.root / "target.md")
        with self.assertRaises(PolicyError):
            self.ws.read_file("link.md")

    def test_big_file_denied(self):
        (self.root / "large.md").write_text("a" * 12001)
        with self.assertRaises(PolicyError):
            self.ws.read_file("large.md")

    def test_notes_require_permission(self):
        with self.assertRaises(PolicyError):
            self.ws.create_note("notes/idea.md", "idea")
        self.assertFalse((self.root / "notes" / "idea.md").exists())
        self.assertEqual(self.ws.create_note("notes/idea.md", "idea", lambda p, c: True), "Nota creada: notes/idea.md")
        with self.assertRaises(PolicyError):
            self.ws.create_note("notes/idea.md", "overwritten", lambda p, c: True)
        self.assertEqual((self.root / "notes" / "idea.md").read_text(), "idea")
        self.assertTrue(self.ws.audit.verify())

    def test_cannot_write_outside_notes(self):
        with self.assertRaises(PolicyError):
            self.ws.create_note("README.md", "new", lambda p, c: True)

    def test_audit_detects_tampering(self):
        self.ws.read_file("README.md")
        self.ws.audit.path.write_text(self.ws.audit.path.read_text().replace("read", "exec"))
        self.assertFalse(self.ws.audit.verify())

    def test_tools_not_authorized(self):
        self.assertIn("no autorizados", execute_tool(self.ws, "exec", {}, None))

    def test_agent_loop_uses_readonly_tool(self):
        seen = []
        def fake_transport(payload):
            seen.append(copy.deepcopy(payload))
            if len(seen) == 1:
                return {"output": [{"type": "function_call", "name": "read_file", "call_id": "c1", "arguments": '{"path":"README.md"}'}]}
            return {"output": [{"type": "message", "content": [{"type": "output_text", "text": "Archivo leído"}]}]}
        self.assertEqual(run_agent("Lee README", self.ws, transport=fake_transport), "Archivo leído")
        self.assertEqual(seen[1]["input"][-1]["output"], "Hola Wrbycker")
        self.assertIs(seen[0]["store"], False)

    def test_agent_denies_write_without_approval(self):
        seen = []
        def fake_transport(payload):
            seen.append(copy.deepcopy(payload))
            if len(seen) == 1:
                return {"output": [{"type": "function_call", "name": "create_note", "call_id": "c2", "arguments": '{"path":"notes/a.md","content":"test"}'}]}
            return {"output": [{"type": "message", "content": [{"type": "output_text", "text": "No se creó"}]}]}
        self.assertEqual(run_agent("Escribe", self.ws, transport=fake_transport), "No se creó")
        self.assertIn("denegada", seen[1]["input"][-1]["output"])
        self.assertFalse((self.root / "notes" / "a.md").exists())

if __name__ == "__main__":
    unittest.main()
