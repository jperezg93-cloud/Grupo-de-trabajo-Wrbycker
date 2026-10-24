/* Wrbycker Control Center v1.1 — local, dependency-free browser UI. */
(() => {
  "use strict";
  const D = window.WrbyckerData;
  if (!D) throw new Error("Missing local data module");
  const STORAGE_KEY = "wrbycker.control-center.v1";
  const $ = (q) => document.querySelector(q);
  const $$ = (q) => Array.from(document.querySelectorAll(q));
  const stamp = () => new Date().toISOString();
  const newId = () => (globalThis.crypto && crypto.randomUUID) ?
    crypto.randomUUID() : "id_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
  let model = D.blank();
  let taskFilter = "all";
  let promptSelection = null;
  let characterSelection = null;
  let toastTimeout;
  let unreadableStorage = false;

  function notify(message) {
    const el = $("#toast");
    el.textContent = message;
    el.hidden = false;
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => { el.hidden = true; }, 4500);
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) return D.blank();
      const parsed = D.parseBackup(raw);
      if (!parsed) {
        unreadableStorage = true;
        notify("Los datos locales no tienen un formato válido. No se sobrescribirán sin restaurar o borrar explícitamente.");
        return D.blank();
      }
      return parsed;
    } catch (_) {
      notify("El navegador no permite leer el almacenamiento local. Puedes trabajar temporalmente.");
      return D.blank();
    }
  }
  function commit(next, allowReset = false) {
    if (unreadableStorage && !allowReset) {
      notify("Los datos anteriores no se sobrescribirán. Usa Configuración para restaurar un respaldo o borrarlos.");
      return false;
    }
    const valid = D.validateData(next);
    if (!valid) { notify("No se guardó: datos inválidos o se alcanzó el límite de registros."); return false; }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
      model = valid;
      unreadableStorage = false;
      render();
      return true;
    } catch (_) {
      notify("No se pudo guardar: comprueba los permisos de almacenamiento. Exporta un respaldo.");
      return false;
    }
  }
  function copyModel() {
    return { version: D.VERSION, tasks: [...model.tasks], ideas: [...model.ideas],
      prompts: [...model.prompts], characters: [...model.characters], workflows: [...model.workflows] };
  }
  function element(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = String(text);
    return el;
  }
  function clear(el) { el.replaceChildren(); }
  function appendEmpty(list, text) { list.append(element("li", "empty", text)); }
  function humanDate(date) {
    return new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(new Date(date));
  }
  function limit(type) {
    if (model[type].length < D.MAX_ITEMS) return true;
    notify("Máximo de " + D.MAX_ITEMS + " registros por módulo. Exporta y elimina algunos primero.");
    return false;
  }
  function addRecord(type, fields) {
    if (!limit(type)) return false;
    const next = copyModel();
    const entry = { id: newId(), createdAt: stamp(), ...fields };
    next[type].push(entry);
    return commit(next);
  }
  function removeRecord(type, id) {
    const record = model[type].find((x) => x.id === id);
    if (!record || !window.confirm("¿Eliminar «" + record.title + "»? Esta acción no se puede deshacer sin un respaldo.")) return;
    const next = copyModel();
    next[type] = next[type].filter((x) => x.id !== id);
    if (commit(next)) notify("Elemento eliminado.");
  }
  function deleteButton(type, record) {
    const btn = element("button", "mini-button danger-text", "Eliminar");
    btn.type = "button";
    btn.setAttribute("aria-label", "Eliminar " + record.title);
    btn.addEventListener("click", () => removeRecord(type, record.id));
    return btn;
  }
  function openView(view) {
    const known = ["overview", "tasks", "ideas", "prompts", "characters", "flows", "workspace", "settings"];
    if (!known.includes(view)) view = "overview";
    for (const section of $$(".view")) {
      const active = section.id === "view-" + view;
      section.hidden = !active;
      section.classList.toggle("is-visible", active);
    }
    for (const nav of $$("[data-view]")) {
      const active = nav.dataset.view === view;
      nav.classList.toggle("is-active", active);
      if (active) nav.setAttribute("aria-current", "page");
      else nav.removeAttribute("aria-current");
    }
    history.replaceState(null, "", "#" + view);
    const title = $("#view-" + view + " h1");
    if (title) title.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function overview() {
    $("#metric-pending").textContent = model.tasks.filter((x) => x.status !== "done").length;
    $("#metric-done").textContent = model.tasks.filter((x) => x.status === "done").length;
    $("#metric-ideas").textContent = model.ideas.length;
    const pending = model.tasks.filter((x) => x.status !== "done").slice(-4).reverse();
    const taskList = $("#overview-tasks");
    clear(taskList);
    if (!pending.length) appendEmpty(taskList, "No hay tareas pendientes. Agrega la primera en «Tareas».");
    for (const item of pending) {
      const li = element("li", "overview-entry");
      li.append(element("strong", "", item.title), element("small", "", item.status === "doing" ? "En progreso" : "Pendiente"));
      taskList.append(li);
    }
    const ideasList = $("#overview-ideas");
    clear(ideasList);
    if (!model.ideas.length) appendEmpty(ideasList, "Aún no hay ideas guardadas.");
    for (const item of model.ideas.slice(-3).reverse()) {
      const li = element("li", "overview-entry");
      li.append(element("strong", "", item.title), element("small", "", humanDate(item.createdAt)));
      ideasList.append(li);
    }
    $("#metric-prompts").textContent = model.prompts.length;
    $("#metric-characters").textContent = model.characters.length;
  }

  function searchAll() {
    const input = $("#global-search-input");
    const output = $("#global-search-results");
    const status = $("#global-search-status");
    const query = input.value.trim();
    clear(output);
    if (!query) {
      status.textContent = "Escribe para buscar en tus registros.";
      return;
    }
    const matches = D.searchRecords(model, query, 25);
    status.textContent = matches.length
      ? "Mostrando " + matches.length + " resultado(s) (máximo 25). Toca uno para ir a su sección."
      : "No se encontraron resultados en tus registros locales.";
    const labels = { tasks: "Tareas", ideas: "Ideas", prompts: "Prompt Studio",
      characters: "Personajes", workflows: "Workflows" };
    const views = { tasks: "tasks", ideas: "ideas", prompts: "prompts",
      characters: "characters", workflows: "flows" };
    for (const record of matches) {
      const li = element("li");
      const button = element("button", "global-result-button");
      button.type = "button";
      button.setAttribute("aria-label", "Abrir " + labels[record.type] + ": " + record.title);
      button.append(element("span", "", labels[record.type]),
        element("strong", "", record.title));
      if (record.snippet) button.append(element("small", "", record.snippet));
      button.addEventListener("click", () => openView(views[record.type]));
      li.append(button);
      output.append(li);
    }
  }

  function tasks() {
    const list = $("#tasks-list");
    clear(list);
    let visible = model.tasks.filter((item) => taskFilter === "all" || item.status === taskFilter).slice().reverse();
    $("#tasks-counter").textContent = D.countLabel(model.tasks.length, "tarea", "tareas");
    if (!visible.length) appendEmpty(list, "Sin tareas en este filtro.");
    const labels = { pending: "Pendiente", doing: "En progreso", done: "Terminada" };
    for (const record of visible) {
      const item = element("li", "entry-card");
      const heading = element("div", "entry-heading");
      heading.append(element("strong", "", record.title), element("span", "date", humanDate(record.createdAt)));
      const description = element("p", "entry-detail", record.detail || "Sin descripción.");
      const actions = element("div", "entry-actions");
      const selector = element("select", "small-select");
      selector.setAttribute("aria-label", "Estado de " + record.title);
      for (const [value, label] of Object.entries(labels)) {
        const option = element("option", "", label);
        option.value = value;
        option.selected = value === record.status;
        selector.append(option);
      }
      selector.addEventListener("change", () => {
        const next = copyModel();
        next.tasks = next.tasks.map((item) =>
          item.id === record.id ? { ...item, status: selector.value } : item);
        if (commit(next)) notify("Estado actualizado.");
      });
      actions.append(selector, deleteButton("tasks", record));
      item.append(heading, description, actions);
      list.append(item);
    }
  }

  function ideas() {
    const list = $("#ideas-list");
    const needle = $("#ideas-search").value.trim().toLocaleLowerCase();
    clear(list);
    $("#ideas-counter").textContent = D.countLabel(model.ideas.length, "idea", "ideas");
    const visible = model.ideas.filter((x) =>
      (x.title + " " + x.detail).toLocaleLowerCase().includes(needle)).slice().reverse();
    if (!visible.length) appendEmpty(list, "No se encontraron ideas.");
    for (const record of visible) {
      const item = element("li", "entry-card");
      const heading = element("div", "entry-heading");
      heading.append(element("strong", "", record.title), element("span", "date", humanDate(record.createdAt)));
      const desc = element("p", "entry-detail", record.detail);
      const actions = element("div", "entry-actions");
      actions.append(deleteButton("ideas", record));
      item.append(heading, desc, actions);
      list.append(item);
    }
  }

  function prompts() {
    const saved = $("#saved-prompts");
    clear(saved);
    const opt = element("option", "", "Nueva plantilla"); opt.value = ""; saved.append(opt);
    for (const record of model.prompts) {
      const option = element("option", "", record.title);
      option.value = record.id;
      saved.append(option);
    }
    saved.value = model.prompts.some((p) => p.id === promptSelection) ? promptSelection : "";
    $("#prompts-counter").textContent = D.countLabel(model.prompts.length, "plantilla guardada", "plantillas guardadas");
    const list = $("#prompt-presets");
    clear(list);
    for (const preset of D.DEFAULT_PROMPTS) {
      const btn = element("button", "preset-button", preset.title + " ↗");
      btn.type = "button";
      btn.addEventListener("click", () => {
        promptSelection = null;
        saved.value = "";
        $("#prompt-title").value = preset.title;
        $("#prompt-template").value = preset.template;
        updatePromptPreview();
      });
      list.append(btn);
    }
    updatePromptPreview();
  }
  function updatePromptPreview() {
    const variables = {
      nombre: $("#prompt-var-name").value,
      estilo: $("#prompt-var-style").value,
      formato: $("#prompt-var-format").value,
      objetivo: $("#prompt-var-goal").value,
    };
    $("#prompt-preview").textContent = D.promptFromTemplate($("#prompt-template").value, variables) ||
      "Selecciona una plantilla o escribe la tuya para ver una vista previa.";
  }

  function characters() {
    const list = $("#characters-list");
    clear(list);
    $("#characters-counter").textContent = D.countLabel(model.characters.length, "personaje", "personajes");
    if (!model.characters.length) appendEmpty(list, "Crea tu primera ficha maestra. Permanece en este navegador.");
    for (const record of model.characters.slice().reverse()) {
      const item = element("li", "entry-card");
      const heading = element("div", "entry-heading");
      heading.append(element("strong", "", record.title), element("span", "date", record.role || humanDate(record.createdAt)));
      const detail = element("p", "entry-detail", record.persona || "Ficha maestra editable");
      const actions = element("div", "entry-actions");
      const open = element("button", "mini-button", "Editar");
      open.type = "button";
      open.addEventListener("click", () => {
        characterSelection = record.id;
        $("#character-title").value = record.title;
        for (const field of ["age", "role", "persona", "appearance", "scenario"]) {
          $("#character-" + field).value = record[field];
        }
        $("#character-submit").textContent = "Guardar cambios";
        $("#character-form").scrollIntoView({ behavior: "smooth", block: "start" });
      });
      const exportBtn = element("button", "mini-button", "Exportar ficha");
      exportBtn.type = "button";
      exportBtn.addEventListener("click", () => download(record.title, D.characterToMarkdown(record), "text/markdown", ".md"));
      actions.append(open, exportBtn, deleteButton("characters", record));
      item.append(heading, detail, actions);
      list.append(item);
    }
  }

  function workflows() {
    const list = $("#flows-list");
    clear(list);
    $("#flows-counter").textContent = D.countLabel(model.workflows.length, "flujo", "flujos");
    if (!model.workflows.length) appendEmpty(list, "Aún no tienes flujos locales.");
    for (const record of model.workflows.slice().reverse()) {
      const item = element("li", "entry-card");
      const heading = element("div", "entry-heading");
      heading.append(element("strong", "", record.title), element("span", "date", record.kind === "idea_to_task" ? "Idea → Tarea" : "Tarea → Idea"));
      const detail = element("p", "entry-detail", "Se ejecuta manualmente sobre el elemento más reciente. No hay servicio en segundo plano.");
      const actions = element("div", "entry-actions");
      const run = element("button", "mini-button", "Ejecutar");
      run.type = "button";
      run.addEventListener("click", () => {
        const label = record.kind === "idea_to_task" ? "tarea" : "idea";
        if (!window.confirm("¿Crear una nueva " + label + " a partir del elemento más reciente?")) return;
        const result = D.runWorkflow(model, record.id, newId(), stamp());
        if (!result) { notify("No hay elementos para convertir o se alcanzó el límite."); return; }
        if (commit(result)) notify("Flujo ejecutado. Se creó una " + label + " local.");
      });
      actions.append(run, deleteButton("workflows", record));
      item.append(heading, detail, actions);
      list.append(item);
    }
  }

  function render() {
    overview(); tasks(); ideas(); prompts(); characters(); workflows(); searchAll();
  }

  function download(name, text, mime, extension) {
    const filename = String(name || "wrbycker").normalize("NFKD")
      .replace(/[^\w\-. ]/g, "_").replace(/\s+/g, "-").slice(0, 70) || "wrbycker";
    const file = new Blob([text], { type: mime });
    const url = URL.createObjectURL(file);
    const anchor = element("a"); anchor.href = url;
    anchor.download = filename + extension;
    document.body.append(anchor);
    anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      notify("Texto copiado al portapapeles.");
    } catch (_) {
      notify("No se pudo copiar automáticamente; selecciona la vista previa manualmente.");
    }
  }

  function wireEvents() {
    for (const btn of $$("[data-view]")) btn.addEventListener("click", () => openView(btn.dataset.view));
    for (const btn of $$("[data-go]")) btn.addEventListener("click", () => openView(btn.dataset.go));
    $("#task-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const title = $("#task-title").value.trim();
      if (!title) return;
      if (addRecord("tasks", { title, detail: $("#task-detail").value.trim(),
        status: $("#task-status").value })) {
        event.target.reset(); notify("Tarea guardada en este dispositivo.");
      }
    });
    $("#idea-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const title = $("#idea-title").value.trim();
      const detail = $("#idea-detail").value.trim();
      if (!title || !detail) return;
      if (addRecord("ideas", { title, detail })) {
        event.target.reset(); notify("Idea guardada en este dispositivo.");
      }
    });
    $("#global-search-input").addEventListener("input", searchAll);
    $("#ideas-search").addEventListener("input", ideas);
    for (const btn of $$("[data-task-filter]")) btn.addEventListener("click", () => {
      taskFilter = btn.dataset.taskFilter;
      for (const tab of $$("[data-task-filter]")) {
        const active = tab === btn;
        tab.classList.toggle("is-selected", active);
        tab.setAttribute("aria-pressed", String(active));
      }
      tasks();
    });

    $("#saved-prompts").addEventListener("change", (event) => {
      const record = model.prompts.find((x) => x.id === event.target.value);
      promptSelection = record ? record.id : null;
      if (record) { $("#prompt-title").value = record.title; $("#prompt-template").value = record.template; }
      else { $("#prompt-title").value = ""; $("#prompt-template").value = ""; }
      updatePromptPreview();
    });
    for (const field of ["prompt-template", "prompt-var-name", "prompt-var-style", "prompt-var-format", "prompt-var-goal"]) {
      $("#" + field).addEventListener("input", updatePromptPreview);
    }
    $("#prompt-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const title = $("#prompt-title").value.trim();
      const template = $("#prompt-template").value.trim();
      if (!title || !template) return;
      if (promptSelection) {
        const next = copyModel();
        next.prompts = next.prompts.map((p) => p.id === promptSelection ? { ...p, title, template } : p);
        if (commit(next)) notify("Plantilla actualizada.");
      } else if (addRecord("prompts", { title, template })) {
        promptSelection = model.prompts.at(-1).id;
        prompts();
        notify("Plantilla guardada.");
      }
    });
    $("#prompt-new").addEventListener("click", () => {
      promptSelection = null; $("#saved-prompts").value = "";
      $("#prompt-title").value = ""; $("#prompt-template").value = "";
      updatePromptPreview();
    });
    $("#prompt-delete").addEventListener("click", () => {
      if (!promptSelection) return notify("Selecciona una plantilla guardada.");
      removeRecord("prompts", promptSelection); promptSelection = null; $("#prompt-new").click();
    });
    $("#prompt-copy").addEventListener("click", () => copyText($("#prompt-preview").textContent));
    $("#prompt-download").addEventListener("click", () => download($("#prompt-title").value || "prompt",
      $("#prompt-preview").textContent, "text/plain", ".txt"));

    $("#character-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const title = $("#character-title").value.trim();
      if (!title) return;
      const entry = { title };
      for (const field of ["age", "role", "persona", "appearance", "scenario"]) {
        entry[field] = $("#character-" + field).value.trim();
      }
      if (characterSelection) {
        const next = copyModel();
        next.characters = next.characters.map((x) => x.id === characterSelection ? { ...x, ...entry } : x);
        if (commit(next)) notify("Ficha actualizada.");
      } else if (addRecord("characters", entry)) notify("Personaje guardado.");
      else return;
      characterSelection = null;
      event.target.reset();
      $("#character-submit").textContent = "Guardar personaje";
    });
    $("#character-new").addEventListener("click", () => {
      characterSelection = null; $("#character-form").reset();
      $("#character-submit").textContent = "Guardar personaje";
    });

    $("#flow-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const title = $("#flow-title").value.trim();
      if (!title) return;
      if (addRecord("workflows", { title, kind: $("#flow-kind").value })) {
        event.target.reset(); notify("Regla guardada. Ejecútala cuando la necesites.");
      }
    });

    $("#inspect-file").addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      const display = $("#file-report");
      if (!file) { display.textContent = "Selecciona un archivo de texto para analizarlo localmente."; return; }
      if (file.size > 256000 || !/\.(txt|md|json|csv|js|py|html|css|yml|yaml|toml)$/i.test(file.name)) {
        display.textContent = "Tipo no admitido o archivo mayor a 256 KB.";
        return;
      }
      try {
        const text = await file.text();
        const stats = D.textFileStats(text, file.size);
        display.textContent = [
          "Archivo: " + file.name,
          "Tamaño: " + stats.bytes + " bytes",
          "Líneas: " + stats.lines,
          "Palabras: " + stats.words,
          "Caracteres: " + stats.characters,
          "",
          "Vista previa (máximo 1200 caracteres):",
          text.slice(0, 1200),
        ].join("\n");
      } catch (_) { display.textContent = "No se pudo leer el archivo."; }
    });

    $("#export-data").addEventListener("click", () => download("wrbycker-respaldo-" +
      new Date().toISOString().slice(0, 10), JSON.stringify(model, null, 2), "application/json", ".json"));
    $("#import-data").addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        if (file.size > D.MAX_IMPORT_BYTES) throw new Error("Archivo demasiado grande");
        const parsed = D.parseBackup(await file.text());
        if (!parsed) throw new Error("Formato de respaldo inválido");
        const labels = { tasks: "Tareas", ideas: "Ideas", prompts: "Plantillas",
          characters: "Personajes", workflows: "Workflows" };
        const counts = (data) => D.TYPES.map((type) =>
          labels[type] + ": " + data[type].length).join("\\n");
        const message = "VISTA PREVIA DEL RESPALDO\\n\\nEn el archivo:\\n" +
          counts(parsed) + "\\n\\nEn este dispositivo:\\n" + counts(model) +
          "\\n\\nIMPORTANTE: esta operación reemplazará TODOS los datos locales. " +
          "Exporta primero el respaldo actual si quieres conservarlo. ¿Restaurar ahora?";
        if (!window.confirm(message)) return;
        if (commit(parsed, true)) {
          promptSelection = null; characterSelection = null;
          $("#character-new").click(); $("#prompt-new").click();
          notify("Respaldo restaurado correctamente.");
        }
      } catch (_) { notify("No se importó. Selecciona un respaldo JSON válido de Wrbycker (máximo 1 MB)."); }
      finally { event.target.value = ""; }
    });
    $("#clear-data").addEventListener("click", () => {
      if (!window.confirm("¿Eliminar TODOS los datos locales de Wrbycker de este navegador?") ||
          !window.confirm("Última confirmación: no podrás recuperarlos sin un respaldo.")) return;
      if (commit(D.blank(), true)) notify("Datos locales eliminados.");
    });
  }

  function initialize() {
    model = load();
    wireEvents(); render();
    openView(location.hash.slice(1) || "overview");
    window.addEventListener("hashchange", () => openView(location.hash.slice(1)));
    // Installation is not the same as offline readiness. Show the real status.
    const updateStatus = (message) => {
      for (const element of document.querySelectorAll("[data-offline-status]")) element.textContent = message;
    };
    if ("serviceWorker" in navigator && location.protocol === "https:") {
      updateStatus("Preparando acceso sin conexión…");
      navigator.serviceWorker.register("./sw.js", { scope: "./" })
        .then(() => navigator.serviceWorker.ready)
        .then(async () => {
          const cacheNames = await caches.keys();
          const here = new URL("./", location.href).pathname.replace(/[^a-z0-9]/gi, "-");
          const matches = cacheNames.some((name) => name === "wrbycker-control-" + here + "-v8");
          updateStatus(matches ? "Acceso sin conexión preparado ✓" :
            "Caché sin conexión pendiente. Abre esta app con internet.");
        })
        .catch(() => updateStatus("Modo sin conexión no disponible todavía; vuelve a abrir con internet."));
    } else {
      updateStatus("Modo sin conexión no disponible en este navegador.");
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
})();
