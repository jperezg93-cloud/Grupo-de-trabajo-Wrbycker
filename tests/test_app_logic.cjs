"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const D = require("../docs/app/logic.js");

const now = "2026-10-22T10:00:00.000Z";
const task = (id = "task-1") => ({ id, createdAt: now, title: "Probar app", detail: "en el móvil", status: "pending" });
const idea = (id = "idea-1") => ({ id, createdAt: now, title: "Módulo nuevo", detail: "Agregar una sección." });
const flow = (kind, id) => ({ id, title: "Regla de conversión", kind, createdAt: now });

test("blank returns separate empty lists", () => {
  const a = D.blank(); const b = D.blank();
  a.tasks.push(task());
  assert.equal(b.tasks.length, 0);
  assert.equal(a.version, 1);
});

test("accepts complete valid local backup", () => {
  const a = D.blank();
  a.tasks.push(task());
  a.ideas.push(idea());
  assert.deepEqual(D.parseBackup(JSON.stringify(a)), a);
});

test("rejects malformed, legacy and oversized JSON", () => {
  assert.equal(D.parseBackup("{ broken"), null);
  assert.equal(D.parseBackup("{}"), null);
  assert.equal(D.parseBackup("x".repeat(D.MAX_IMPORT_BYTES + 1)), null);
});

test("rejects duplicate ids even across modules", () => {
  const a = D.blank();
  a.tasks.push(task("same"));
  a.ideas.push(idea("same"));
  assert.equal(D.validateData(a), null);
});

test("rejects too many records", () => {
  const a = D.blank();
  a.tasks = Array.from({ length: D.MAX_ITEMS + 1 }, (_, i) => task("item_" + i));
  assert.equal(D.validateData(a), null);
});

test("rejects task with forbidden status", () => {
  const a = D.blank();
  a.tasks.push({ ...task(), status: "execute-shell" });
  assert.equal(D.validateData(a), null);
});

test("rejects missing text, overlong text and malicious record identifiers", () => {
  const a = D.blank();
  a.ideas.push({ ...idea(), title: " " });
  assert.equal(D.validateData(a), null);
  a.ideas[0] = { ...idea(), detail: "a".repeat(3001) };
  assert.equal(D.validateData(a), null);
  a.ideas[0] = { ...idea(), id: "<img onerror=alert(1)>" };
  assert.equal(D.validateData(a), null);
});

test("removes unknown object fields when validating an import", () => {
  const a = D.blank();
  a.tasks.push({ ...task(), suspicious: "ignored" });
  assert.deepEqual(D.validateData(a).tasks, [task()]);
});

test("retains only allowed prompt variable names", () => {
  const out = D.promptFromTemplate("Hola {{nombre}}, {{formato}} / {{clave}} / {{ nombre }}", {
    nombre: "Wrbycker", formato: "9:16", clave: "EXPOSED"
  });
  assert.equal(out, "Hola Wrbycker, 9:16 / {{clave}} / Wrbycker");
  assert.equal(out.includes("EXPOSED"), false);
});

test("rejects oversized or unusable prompts", () => {
  assert.equal(D.promptFromTemplate("a".repeat(5001), {}), "");
  assert.equal(D.promptFromTemplate(null, {}), "");
});

test("character master export keeps profile fields", () => {
  const c = { id: "c1", title: "Yori", createdAt: now, age: "29 años",
    role: "Asistente", persona: "Serena", appearance: "Ojos azules", scenario: "Una oficina" };
  const out = D.characterToMarkdown(c);
  for (const phrase of ["# Yori", "29 años", "Asistente", "Serena", "Ojos azules", "Una oficina"]) {
    assert.ok(out.includes(phrase));
  }
});

test("character export rejects invalid records", () => {
  assert.equal(D.characterToMarkdown({ title: "Incomplete" }), "");
});

test("manual flow converts most recent idea to pending task", () => {
  const a = D.blank();
  a.ideas.push(idea("i1"), { ...idea("i2"), title: "Última idea" });
  a.workflows.push(flow("idea_to_task", "f1"));
  const next = D.runWorkflow(a, "f1", "t2", now);
  assert.equal(next.tasks.length, 1);
  assert.equal(next.tasks[0].title, "Última idea");
  assert.equal(next.tasks[0].status, "pending");
  assert.equal(a.tasks.length, 0);
});

test("manual flow converts latest task to idea", () => {
  const a = D.blank();
  a.tasks.push(task());
  a.workflows.push(flow("task_to_idea", "f1"));
  const next = D.runWorkflow(a, "f1", "i2", now);
  assert.equal(next.ideas.length, 1);
  assert.equal(next.ideas[0].detail, "en el móvil");
});

test("manual flows cannot run without sources or with invalid IDs", () => {
  const a = D.blank();
  a.workflows.push(flow("idea_to_task", "f1"));
  assert.equal(D.runWorkflow(a, "f1", "x", now), null);
  a.ideas.push(idea());
  assert.equal(D.runWorkflow(a, "f1", "<bad>", now), null);
});

test("rejects unsafe workflow operations", () => {
  const a = D.blank();
  a.workflows.push(flow("shell_command", "f1"));
  assert.equal(D.validateData(a), null);
});

test("local file report counts words, lines and bytes", () => {
  assert.deepEqual(D.textFileStats("hola mundo\nsegunda línea", 24), {
    bytes: 24, characters: 24, lines: 2, words: 4
  });
  assert.deepEqual(D.textFileStats("", 0), {
    bytes: 0, characters: 0, lines: 0, words: 0
  });
});

test("rejects invalid file summaries", () => {
  assert.equal(D.textFileStats(null, 0), null);
  assert.equal(D.textFileStats("hola", -1), null);
});

test("both publication modes provide installable manifests and real shell entrypoints", () => {
  for (const relative of ["../docs/app", "../app"]) {
    const root = path.join(__dirname, relative);
    const m = JSON.parse(fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8"));
    assert.equal(m.start_url, "./index.html");
    assert.equal(m.scope, "./");
    assert.equal(m.display, "standalone");
    assert.equal(m.id, "./");
    const entry = fs.readFileSync(path.join(root, "index.html"), "utf8");
    assert.ok(entry.includes("Wrbycker Control Center"));
    assert.ok(!entry.includes('http-equiv="refresh"'), "PWA launch must not redirect");
    for (const icon of m.icons) {
      const target = path.resolve(root, icon.src);
      assert.ok(fs.existsSync(target), target + " missing");
      const bytes = fs.readFileSync(target);
      assert.equal(bytes.subarray(1, 4).toString("ascii"), "PNG");
    }
  }
});

test("each offline worker can launch without any network, in both Pages modes", async () => {
  const vm = require("node:vm");
  for (const folder of ["app", "docs/app"]) {
    const root = path.join(__dirname, "..", folder);
    const scope = "https://example.org/Grupo-de-trabajo-Wrbycker/" + folder + "/";
    const handlers = {};
    const stored = new Map();
    const cache = {
      addAll: async (urls) => { for (const url of urls) await cache.add(url); },
      add: async (url) => {
        const target = path.join(__dirname, "..", new URL(url).pathname
          .split("/Grupo-de-trabajo-Wrbycker/")[1]);
        if (!fs.existsSync(target)) throw new Error("asset unavailable: " + url);
        stored.set(url, { text: () => fs.promises.readFile(target, "utf8"),
                          ok: true, type: "basic", clone() { return this; } });
      },
      match: async (url) => stored.get(typeof url === "string" ? url : url.url),
      put: async (url, response) => stored.set(url.url || url, response),
    };
    const caches = {
      open: async () => cache,
      keys: async () => ["legacy-other-app-cache"],
      delete: async () => true,
    };
    const self = {
      registration: { scope }, location: { origin: "https://example.org" },
      addEventListener: (name, cb) => { handlers[name] = cb; },
      skipWaiting: async () => true, clients: { claim: async () => true },
    };
    vm.runInNewContext(fs.readFileSync(path.join(root, "sw.js"), "utf8"), {
      self, caches, URL, Promise, fetch: async () => { throw Error("Network offline"); },
    });
    let install;
    handlers.install({ waitUntil(p) { install = p; } });
    await install;
    let activate;
    handlers.activate({ waitUntil(p) { activate = p; } });
    await activate;
    let reply;
    handlers.fetch({
      request: { method: "GET", url: scope, mode: "navigate" },
      respondWith(p) { reply = p; },
    });
    const offlinePage = await reply;
    const html = await offlinePage.text();
    assert.ok(html.includes('src="app.js"'), folder + " should open offline");
    for (const name of ["app.js", "logic.js", "app.css"]) {
      let assetResponse;
      handlers.fetch({
        request: { method: "GET", url: scope + name, mode: "no-cors" },
        respondWith(p) { assetResponse = p; },
      });
      assert.ok((await (await assetResponse).text()).length > 200,
        folder + " " + name + " should be cached");
    }
  }
});

test("the app avoids network requests to model APIs", () => {
  const src = fs.readFileSync(path.join(__dirname, "../docs/app/app.js"), "utf8");
  const service = fs.readFileSync(path.join(__dirname, "../docs/app/sw.js"), "utf8");
  assert.equal(src.includes("api.openai.com"), false);
  assert.equal(src.includes("XMLHttpRequest"), false);
  assert.equal(service.includes("api.openai.com"), false);
});

test("only textContent is used for imported user content", () => {
  const src = fs.readFileSync(path.join(__dirname, "../docs/app/app.js"), "utf8");
  assert.equal(src.includes(".innerHTML"), false);
  assert.equal(src.includes(".outerHTML"), false);
  assert.equal(src.includes("eval("), false);
});

test("all eight views are present and have nav entries", () => {
  const html = fs.readFileSync(path.join(__dirname, "../docs/app/index.html"), "utf8");
  for (const view of ["overview", "tasks", "ideas", "prompts", "characters", "flows", "workspace", "settings"]) {
    assert.ok(html.includes('id="view-' + view + '"'));
    assert.ok(html.includes('data-view="' + view + '"'));
  }
});

test("bundled app does not use third-party scripts", () => {
  const html = fs.readFileSync(path.join(__dirname, "../docs/app/index.html"), "utf8");
  assert.equal(/<script[^>]+src=["']https?:\/\//.test(html), false);
  assert.ok(html.includes('src="logic.js"'));
  assert.ok(html.includes('src="app.js"'));
});

test("JSON restore control has one visible accessible picker in both builds", () => {
  for (const folder of ["app", "docs/app"]) {
    const root = path.join(__dirname, "..", folder);
    const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
    const css = fs.readFileSync(path.join(root, "app.css"), "utf8");
    assert.equal((html.match(/id="import-data"/g) || []).length, 1);
    assert.ok(html.includes('for="import-data" class="file-label"'));
    assert.ok(html.includes('aria-describedby="import-help"'));
    assert.ok(css.includes("#import-data{position:absolute;"));
    assert.ok(css.includes("#import-data:focus-visible + .file-label"));
    assert.equal(html.includes('onclick="'), false);
  }
});

test("offline app updates its cache version so installed browsers receive the new picker", () => {
  for (const folder of ["app", "docs/app"]) {
    const root = path.join(__dirname, "..", folder);
    const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
    const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
    assert.ok(sw.includes('const CACHE = PREFIX + "v5";'));
    assert.ok(js.includes('"-v5"'));
  }
});

test("Spanish item counters use singular and plural correctly", () => {
  for(const [number, singular, plural, expected] of [
    [0,"idea","ideas","0 ideas"],[1,"idea","ideas","1 idea"],[2,"idea","ideas","2 ideas"],
    [1,"flujo","flujos","1 flujo"],[3,"flujo","flujos","3 flujos"],
    [1,"personaje","personajes","1 personaje"],
    [1,"plantilla guardada","plantillas guardadas","1 plantilla guardada"]
  ]) assert.equal(D.countLabel(number, singular, plural), expected);
  assert.equal(D.countLabel(-1,"tarea","tareas"), "");
});

test("both app copies call the tested count formatter", () => {
  for(const folder of ["app","docs/app"]){
    const src = fs.readFileSync(path.join(__dirname,"..",folder,"app.js"),"utf8");
    for(const type of ["tasks","ideas","prompts","characters","workflows"])
      assert.ok(src.includes("D.countLabel(model."+type+".length"),folder+" "+type);
  }
});

test("both PWA manifests include the approved SVG icon and keep PNG fallbacks", () => {
  for (const folder of ["app","docs/app"]) {
    const root = path.join(__dirname,"..",folder);
    const manifest = JSON.parse(fs.readFileSync(path.join(root,"manifest.webmanifest"),"utf8"));
    assert.equal(manifest.icons[0].type,"image/svg+xml");
    assert.equal(manifest.icons[0].sizes,"any");
    assert.ok(manifest.icons[0].src.endsWith("brand/wb-icon.svg"));
    assert.ok(manifest.icons.some((x) => x.type==="image/png" && x.sizes==="192x192"));
    assert.ok(manifest.icons.some((x) => x.type==="image/png" && x.sizes==="512x512"));
    const js = fs.readFileSync(path.join(root,"sw.js"),"utf8");
    assert.ok(js.includes("wb-icon.svg"));
  }
});
