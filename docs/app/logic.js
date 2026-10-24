/* Pure local data helpers shared by the browser UI and Node.js tests.
 * No network calls, no dependencies, and no AI model execution.
 */
(function (root) {
  "use strict";

  const VERSION = 1;
  const MAX_ITEMS = 300;
  const MAX_IMPORT_BYTES = 1_000_000;
  const STATUS = ["pending", "doing", "done"];
  const TYPES = ["tasks", "ideas", "prompts", "characters", "workflows"];
  const MAX_TEXT = Object.freeze({
    title: 120, detail: 3000, template: 5000, name: 120,
    age: 40, role: 160, persona: 3000, appearance: 3000, scenario: 3000,
  });
  const DEFAULT_PROMPTS = [
    { title: "Imagen natural", template: "Retrato fotográfico de {{nombre}}. Estilo: {{estilo}}. Composición: {{formato}}. Objetivo: {{objetivo}}. Iluminación natural, sin filtros de belleza ni distorsiones." },
    { title: "Escena de rol", template: "Escribe una escena inicial de rol con {{nombre}}. Tono: {{estilo}}. Formato: {{formato}}. Objetivo narrativo: {{objetivo}}. Respeta su personalidad y la agencia de todos los personajes." },
    { title: "Plan de desarrollo", template: "Prepara un plan técnico para {{objetivo}}. Proyecto: {{nombre}}. Enfoque: {{estilo}}. Presentación: {{formato}}. Distingue lo implementado de lo pendiente." },
  ];

  function blank() {
    return { version: VERSION, tasks: [], ideas: [], prompts: [], characters: [], workflows: [] };
  }
  function limitString(value, max, required = false) {
    if (typeof value !== "string" || value.length > max) return null;
    const cleaned = value.trim();
    return required && !cleaned ? null : cleaned;
  }
  function validId(value) {
    return typeof value === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
  }
  function validDate(value) {
    return typeof value === "string" && value.length <= 40 &&
      Number.isFinite(Date.parse(value));
  }
  function validateRecord(value, type) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
    if (!validId(value.id) || !validDate(value.createdAt)) return null;
    const title = limitString(value.title, MAX_TEXT.title, true);
    if (title === null) return null;
    const base = { id: value.id, title, createdAt: value.createdAt };
    if (type === "tasks") {
      const detail = limitString(value.detail, 1200);
      if (detail === null || !STATUS.includes(value.status)) return null;
      return { ...base, detail, status: value.status };
    }
    if (type === "ideas") {
      const detail = limitString(value.detail, MAX_TEXT.detail, true);
      return detail === null ? null : { ...base, detail };
    }
    if (type === "prompts") {
      const template = limitString(value.template, MAX_TEXT.template, true);
      return template === null ? null : { ...base, template };
    }
    if (type === "characters") {
      const fields = ["age", "role", "persona", "appearance", "scenario"];
      const next = { ...base };
      for (const field of fields) {
        const val = limitString(value[field], MAX_TEXT[field]);
        if (val === null) return null;
        next[field] = val;
      }
      return next;
    }
    if (type === "workflows") {
      if (!["idea_to_task", "task_to_idea"].includes(value.kind)) return null;
      return { ...base, kind: value.kind };
    }
    return null;
  }
  function validateData(value) {
    if (!value || typeof value !== "object" || Array.isArray(value) || value.version !== VERSION) return null;
    const result = blank();
    const ids = new Set();
    for (const type of TYPES) {
      if (!Array.isArray(value[type]) || value[type].length > MAX_ITEMS) return null;
      for (const record of value[type]) {
        const clean = validateRecord(record, type);
        if (!clean || ids.has(clean.id)) return null;
        ids.add(clean.id);
        result[type].push(clean);
      }
    }
    return result;
  }
  function parseBackup(text) {
    if (typeof text !== "string" || text.length > MAX_IMPORT_BYTES) return null;
    try { return validateData(JSON.parse(text)); }
    catch (_) { return null; }
  }
  function promptFromTemplate(template, variables) {
    if (typeof template !== "string" || template.length > MAX_TEXT.template ||
        !variables || typeof variables !== "object") return "";
    const accepted = ["nombre", "estilo", "formato", "objetivo"];
    const values = {};
    for (const key of accepted) values[key] = limitString(variables[key] || "", 160) ?? "";
    return template.replace(/\{\{\s*(nombre|estilo|formato|objetivo)\s*\}\}/g, (_, key) => values[key]);
  }
  function characterToMarkdown(character) {
    const clean = validateRecord(character, "characters");
    if (!clean) return "";
    const lines = [
      "# " + clean.title,
      clean.age ? "- **Edad:** " + clean.age : "",
      clean.role ? "- **Rol:** " + clean.role : "",
      clean.persona ? "\n## Personalidad\n" + clean.persona : "",
      clean.appearance ? "\n## Apariencia\n" + clean.appearance : "",
      clean.scenario ? "\n## Premisa y escenario\n" + clean.scenario : "",
      "\n**Nota:** Ficha de personaje local. Los generadores externos tienen sus propias políticas y límites.",
    ];
    return lines.filter(Boolean).join("\n");
  }
  function runWorkflow(data, flowId, id, timestamp) {
    const clean = validateData(data);
    if (!clean || !validId(id) || !validDate(timestamp)) return null;
    const workflow = clean.workflows.find((item) => item.id === flowId);
    if (!workflow) return null;
    if (workflow.kind === "idea_to_task") {
      if (!clean.ideas.length || clean.tasks.length >= MAX_ITEMS) return null;
      const from = clean.ideas.at(-1);
      clean.tasks.push({ id, createdAt: timestamp, title: from.title,
        detail: from.detail.slice(0, 1200), status: "pending" });
    } else {
      if (!clean.tasks.length || clean.ideas.length >= MAX_ITEMS) return null;
      const from = clean.tasks.at(-1);
      clean.ideas.push({ id, createdAt: timestamp, title: from.title,
        detail: from.detail || "Idea capturada desde una tarea: " + from.title });
    }
    return validateData(clean);
  }
  function countLabel(count, singular, plural) {
    if (!Number.isSafeInteger(count) || count < 0) return "";
    return count + " " + (count === 1 ? singular : plural);
  }

  // Read-only, diacritic-insensitive lookup. Does not touch persisted data.
  function searchRecords(data, query, maxResults = 25) {
    if (!data || typeof data !== "object" ||
        typeof query !== "string" || query.length > 120 ||
        !Number.isSafeInteger(maxResults) || maxResults < 1 || maxResults > 50) return [];
    const fold = (value) => String(value).normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
    const needle = fold(query.trim());
    if (!needle) return [];
    const fields = {
      tasks: ["title", "detail"], ideas: ["title", "detail"],
      prompts: ["title", "template"],
      characters: ["title", "age", "role", "persona", "appearance", "scenario"],
      workflows: ["title", "kind"]
    };
    const found = [];
    for (const type of TYPES) {
      if (!Array.isArray(data[type])) return [];
      for (const record of data[type].slice().reverse()) {
        if (!record || !validId(record.id) || typeof record.title !== "string") continue;
        const values = fields[type].map((field) =>
          typeof record[field] === "string" ? record[field] : "");
        if (!values.some((value) => fold(value).includes(needle))) continue;
        const snippet = values.slice(1).find((value) => fold(value).includes(needle)) ||
          values[1] || "";
        found.push({ type, id: record.id, title: record.title, snippet: snippet.slice(0, 160) });
        if (found.length >= maxResults) return found;
      }
    }
    return found;
  }

  function textFileStats(content, bytes) {
    if (typeof content !== "string" || !Number.isFinite(bytes) || bytes < 0) return null;
    const lines = content ? content.split(/\r\n|\r|\n/).length : 0;
    const words = (content.match(/\S+/g) || []).length;
    return { bytes, characters: content.length, lines, words };
  }
  const api = Object.freeze({
    VERSION, MAX_ITEMS, MAX_IMPORT_BYTES, TYPES, STATUS, DEFAULT_PROMPTS,
    blank, limitString, validId, validateRecord, validateData, parseBackup,
    promptFromTemplate, characterToMarkdown, runWorkflow, searchRecords, textFileStats, countLabel
  });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.WrbyckerData = api;
})(typeof window !== "undefined" ? window : globalThis);
