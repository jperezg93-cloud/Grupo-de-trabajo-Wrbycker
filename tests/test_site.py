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
        # GitHub's automatic Pages workflow uploads the whole repository,
        # while the custom workflow uploads the docs/ directory.
        root = DOCS.parent
        public_root = (root / "index.html").read_text(encoding="utf-8")
        self.assertIn('url=docs/', public_root)
        for app in (root / "app", DOCS / "app"):
            with self.subTest(app=app):
                document = (app / "index.html").read_text(encoding="utf-8")
                self.assertNotIn('http-equiv="refresh"', document)
                for asset in ("app.css", "app.js", "logic.js", "sw.js",
                              "manifest.webmanifest", "index.html"):
                    self.assertTrue((app / asset).is_file(), asset)
                self.assertIn('href="manifest.webmanifest"', document)
                self.assertIn('src="app.js"', document)
                self.assertIn('src="logic.js"', document)
                self.assertIn('data-offline-status', document)

    def test_two_app_shells_share_logic_and_layout(self):
        root = DOCS.parent
        for path in ("app.js", "app.css", "logic.js"):
            self.assertEqual((root / "app" / path).read_bytes(),
                             (DOCS / "app" / path).read_bytes())
        root_html = (root / "app/index.html").read_text(encoding="utf-8")
        docs_html = (DOCS / "app/index.html").read_text(encoding="utf-8")
        self.assertEqual(root_html.replace('../docs/favicon.svg', '../favicon.svg')
                         .replace('../docs/brand/wb-icon.svg', '../brand/wb-icon.svg'),
                         docs_html)

    def test_root_brand_link_works_in_both_pages_modes(self):
        root = DOCS.parent
        root_entry = (root / "marca.html").read_text(encoding="utf-8")
        official = (DOCS / "marca.html").read_text(encoding="utf-8")
        self.assertIn('url=docs/marca.html', root_entry)
        self.assertIn('href="./docs/marca.html"', root_entry)
        self.assertIn('href="#proyectos"', official)
        self.assertIn('href="app/"', official)
        self.assertIn('src="app/wb-icon-512-v2.png"', official)

    def test_approved_brand_is_shared_by_site_and_app(self):
        icon = (DOCS / "brand" / "wb-icon.svg").read_text(encoding="utf-8")
        fav = (DOCS / "favicon.svg").read_text(encoding="utf-8")
        self.assertEqual(icon, fav)
        self.assertIn("#7239FC", icon)
        self.assertIn("#75EBCB", icon)
        self.assertIn("#FDFDFD", icon)
        self.assertIn('src="brand/wb-icon.svg"', self.page)
        for name in ("guia.html", "habilidades.html", "ecosistema.html"):
            self.assertIn('src="brand/wb-icon.svg"',
                          (DOCS / name).read_text(encoding="utf-8"))
        for app in (DOCS.parent / "app", DOCS / "app"):
            html = (app / "index.html").read_text(encoding="utf-8")
            self.assertIn('class="brand-symbol"', html)
            self.assertIn("wb-icon.svg", html)

    def test_public_guides_are_linked_and_static(self):
        home = (DOCS / "index.html").read_text(encoding="utf-8")
        for filename in ("guia.html", "habilidades.html"):
            with self.subTest(filename=filename):
                self.assertIn('href="' + filename + '"', home)
                html = (DOCS / filename).read_text(encoding="utf-8")
                self.assertIn('lang="es"', html)
                self.assertIn('name="viewport"', html)
                self.assertIn('href="guide.css"', html)
                self.assertNotIn('src="https://', html)
                self.assertIn('href="app/"', html)
        self.assertTrue((DOCS / "guide.css").is_file())
        self.assertIn("Sin registro", home)

    def test_ecosystem_is_cross_linked_without_direct_affiliate_ads(self):
        root = DOCS.parent
        ecosystem = (DOCS / "ecosistema.html").read_text(encoding="utf-8")
        homepage = (DOCS / "index.html").read_text(encoding="utf-8")
        guide = (DOCS / "guia.html").read_text(encoding="utf-8")
        skills = (DOCS / "habilidades.html").read_text(encoding="utf-8")
        for html in (homepage, guide, skills):
            self.assertIn('href="ecosistema.html"', html)
        self.assertIn('href="app/"', ecosystem)
        self.assertIn('href="guia.html"', ecosystem)
        self.assertIn('href="https://linktr.ee/wrbycker"', ecosystem)
        self.assertIn("WrBycker | IA y Afiliados", ecosystem)
        self.assertIn("mayores de 18 años", ecosystem)
        self.assertIn("comisiones", ecosystem)
        self.assertNotIn("ourdreamai.everflowclient.io", ecosystem)
        self.assertNotIn("ourdreamersai13.com", ecosystem)
        for name in ("ecosistema.html", "guia.html", "habilidades.html"):
            with self.subTest(page=name):
                entry = (root / name).read_text(encoding="utf-8")
                self.assertIn("docs/" + name, entry)
                self.assertTrue((DOCS / name).is_file())

    def test_official_brand_page_and_editorial_resources(self):
        brand = (DOCS / "marca.html").read_text(encoding="utf-8")
        eco = (DOCS / "ecosistema.html").read_text(encoding="utf-8")
        self.assertIn('href="marca.html"', eco)
        self.assertIn('lang="es"', brand)
        self.assertIn('id="proyectos"', brand)
        self.assertIn('id="filosofia"', brand)
        self.assertIn('href="index.html"', brand)
        self.assertIn('href="app/"', brand)
        self.assertIn('href="ecosistema.html"', brand)
        self.assertIn('href="https://linktr.ee/wrbycker"', brand)
        for project in ("Wrbycker Agent Lab", "Wrbycker Control Center", "Personajes y experiencias"):
            self.assertIn(project, brand)
        self.assertIn('src="app/wb-icon-512-v2.png"', brand)
        self.assertNotIn("Nuestros colores", brand)
        self.assertNotIn("Reglas de uso", brand)
        self.assertNotIn("Recursos públicos", brand)
        self.assertNotIn('href="brand/manual-oficial.md"', brand)
        self.assertIn("#7239FC", brand)
        self.assertIn("#75EBCB", brand)
        self.assertIn("#FDFDFD", brand)
        self.assertIn("#0B0E19", brand)
        self.assertTrue((DOCS / "app/wb-icon-512-v2.png").is_file())
        self.assertTrue((DOCS / "brand/manual-oficial.md").is_file())
        bios = (DOCS / "brand/perfiles.md").read_text(encoding="utf-8")
        for n in (100, 150, 300, 400):
            self.assertIn("Hasta " + str(n) + " caracteres", bios)
        self.assertNotIn("ourdreamai.everflowclient.io", brand)
        self.assertNotIn("<script", brand)

    def test_first_skill_has_scoped_instructions(self):
        skill_path = DOCS.parent / "skills" / "wrbycker-workspace-report" / "SKILL.md"
        skill = skill_path.read_text(encoding="utf-8")
        self.assertTrue(skill.startswith("---\nname: wrbycker-workspace-report\n"))
        self.assertIn("description:", skill)
        self.assertIn("report --json", skill)
        self.assertIn("no", skill.lower())
        self.assertIn("OPENAI_API_KEY", skill)
        page = (DOCS / "habilidades.html").read_text(encoding="utf-8")
        self.assertIn("skills/wrbycker-workspace-report", page)
        self.assertIn("no se instala automáticamente en ChatGPT", page)
        self.assertIn(".agents/skills/", page)
        codex_skill = DOCS.parent / ".agents" / "skills" / "wrbycker-workspace-report" / "SKILL.md"
        self.assertEqual(codex_skill.read_text(encoding="utf-8"), skill)

    def test_respects_reduced_motion(self):
        css = (DOCS / "styles.css").read_text(encoding="utf-8")
        self.assertIn("prefers-reduced-motion", css)


if __name__ == "__main__":
    unittest.main()
