from html.parser import HTMLParser
from pathlib import Path
import re
import unittest


DOCS = Path(__file__).resolve().parents[1] / "docs"


class DocumentInfo(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.links = []
        self.html_lang = None

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        if "id" in props:
            self.ids.append(props["id"])
        if tag == "html":
            self.html_lang = props.get("lang")
        if tag == "link":
            self.links.append(props.get("href"))
        if tag == "script" and "src" in props:
            self.links.append(props["src"])


class SiteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.page = (DOCS / "index.html").read_text(encoding="utf-8")
        cls.parser = DocumentInfo()
        cls.parser.feed(cls.page)

    def test_spanish_semantic_document(self):
        self.assertEqual(self.parser.html_lang, "es")
        for anchor in ("inicio", "proyecto", "capacidades", "inicio-rapido", "seguridad"):
            self.assertIn(anchor, self.parser.ids)

    def test_ids_are_unique(self):
        self.assertEqual(len(self.parser.ids), len(set(self.parser.ids)))

    def test_site_assets_exist(self):
        for resource in ("styles.css", "main.js", "favicon.svg"):
            self.assertIn(resource, self.parser.links)
            self.assertTrue((DOCS / resource).is_file())

    def test_site_does_not_embed_api_keys_or_remote_scripts(self):
        self.assertNotIn("sk-proj-", self.page)
        self.assertNotIn("OPENAI_API_KEY=", self.page)
        self.assertFalse(re.search(r'<script[^>]+src=["\']https?://', self.page))

    def test_site_is_explicit_about_api_limitations(self):
        self.assertIn("SIN BACKEND", self.page)
        self.assertIn("no ejecuta el agente", self.page)

    def test_pages_paths_resolve_in_both_publish_modes(self):
        # Automatic Pages builds the repo root, while our Actions workflow uploads docs/.
        # Either artifact must let visitors open the advertised /app/ URL.
        root = DOCS.parent
        for path, target in (
            ("index.html", root / "docs" / "index.html"),
            ("app/index.html", root / "docs" / "app" / "index.html"),
        ):
            with self.subTest(path=path):
                content = (root / path).read_text(encoding="utf-8")
                self.assertIn('http-equiv="refresh"', content)
                self.assertIn("<a href=", content)
                match = re.search(r'content="0; url=([^"]+)"', content)
                self.assertIsNotNone(match)
                resolved = ((root / path).parent / match.group(1) / "index.html").resolve()
                self.assertEqual(resolved, target.resolve())
                self.assertTrue(resolved.is_file())
        self.assertTrue((DOCS / "index.html").is_file())
        self.assertTrue((DOCS / "app" / "index.html").is_file())

    def test_respects_reduced_motion(self):
        css = (DOCS / "styles.css").read_text(encoding="utf-8")
        self.assertIn("prefers-reduced-motion", css)


if __name__ == "__main__":
    unittest.main()
