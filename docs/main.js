"use strict";

// This is a static documentation page. It does NOT execute Python or call an AI API.
const commands = Object.freeze({
  setup: 'git clone https://github.com/jperezg93-cloud/Grupo-de-trabajo-Wrbycker.git\ncd Grupo-de-trabajo-Wrbycker\npython -m wrbycker_agent doctor',
  report: 'python -m wrbycker_agent report\npython -m wrbycker_agent report --json',
  files: 'python -m wrbycker_agent files\npython -m wrbycker_agent read README.md',
  tests: 'python -m unittest discover -s tests -v\npython -m wrbycker_agent audit-verify'
});
const code = document.querySelector('#command-output code');
const tabs = Array.from(document.querySelectorAll('[data-command]'));
const copy = document.querySelector('#copy-command');
const feedback = document.querySelector('#copy-feedback');
let active = 'setup';

for (const tab of tabs) {
  tab.addEventListener('click', () => {
    const command = tab.dataset.command;
    if (!Object.hasOwn(commands, command)) return;
    active = command;
    code.textContent = commands[command];
    copy.textContent = 'Copiar';
    feedback.textContent = '';
    for (const item of tabs) {
      const selected = item === tab;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    }
  });
}

copy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(commands[active]);
    copy.textContent = 'Copiado ✓';
    feedback.textContent = 'Comandos copiados al portapapeles.';
  } catch (_) {
    copy.textContent = 'Selecciona el texto';
    feedback.textContent = 'No fue posible copiar automáticamente. Selecciona el código manualmente.';
  }
});

document.querySelector('#year').textContent = String(new Date().getFullYear());
