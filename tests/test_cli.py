import contextlib
import io
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from wrbycker_agent.__main__ import main


class CLITests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        (self.root / "README.md").write_text("demo", encoding="utf-8")

    def run_cli(self, *args):
        stdout, stderr = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            status = main(["--workspace", str(self.root), *args])
        return status, stdout.getvalue(), stderr.getvalue()

    def test_doctor_works_without_credentials(self):
        with patch.dict(os.environ, {}, clear=True):
            status, output, _ = self.run_cli("doctor")
        self.assertEqual(status, 0)
        self.assertIn("v0.2.0", output)
        self.assertIn("ausente", output)

    def test_report_json_is_machine_readable(self):
        status, output, _ = self.run_cli("report", "--json")
        self.assertEqual(status, 0)
        self.assertEqual(json.loads(output)["file_count"], 1)

    def test_read_creates_audit(self):
        status, output, _ = self.run_cli("read", "README.md")
        self.assertEqual(status, 0)
        self.assertIn("demo", output)
        self.assertTrue((self.root / ".wrbycker" / "audit.jsonl").exists())

    def test_ask_refuses_without_api_key(self):
        with patch.dict(os.environ, {}, clear=True):
            status, output, error = self.run_cli("ask", "¿Qué hay?")
        self.assertEqual(status, 1)
        self.assertIn("OPENAI_API_KEY", error)
        self.assertEqual(output, "")


if __name__ == "__main__":
    unittest.main()
