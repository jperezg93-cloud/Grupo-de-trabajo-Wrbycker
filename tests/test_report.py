import json
import tempfile
import unittest
from pathlib import Path

from wrbycker_agent.core import Workspace
from wrbycker_agent.report import build_report, format_report


class ReportTests(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)
        (self.root / "one.py").write_text("print(1)", encoding="utf-8")
        (self.root / "two.md").write_text("hello", encoding="utf-8")
        (self.root / ".env").write_text("TOKEN=secret", encoding="utf-8")
        self.workspace = Workspace(self.root)

    def test_count_and_extensions(self):
        data = build_report(self.workspace)
        self.assertEqual(data["file_count"], 2)
        self.assertEqual(data["total_bytes"], 13)
        self.assertEqual(data["by_extension"], {".md": 1, ".py": 1})

    def test_skips_hidden_filenames_and_directories(self):
        hidden_dir = self.root / ".secret"
        hidden_dir.mkdir()
        (hidden_dir / "example.md").write_text("secret")
        result = str(build_report(self.workspace))
        self.assertNotIn(".env", result)
        self.assertNotIn("example.md", result)

    def test_report_never_contains_file_content(self):
        (self.root / "two.md").write_text("DO_NOT_COPY_THIS_TEXT", encoding="utf-8")
        result = json.dumps(build_report(self.workspace))
        self.assertNotIn("DO_NOT_COPY_THIS_TEXT", result)

    def test_report_does_not_create_audit_log(self):
        build_report(self.workspace)
        self.assertFalse(self.workspace.audit.path.exists())

    def test_text_is_human_readable(self):
        text = format_report(build_report(self.workspace))
        self.assertIn("Informe local", text)
        self.assertIn("one.py", text)

    def test_symlink_not_listed(self):
        (self.root / "other.py").symlink_to(self.root / "one.py")
        self.assertEqual(build_report(self.workspace)["file_count"], 2)


if __name__ == "__main__":
    unittest.main()
