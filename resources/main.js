import { $ } from '@sciter';
import STATUS_TEXTS from './status-texts.js';

main();

function main() {
  adjustWindow();
}

function adjustWindow() {
  const [wmin, w] = document.state.contentWidths();
  const h = document.state.contentHeight(w);
  const [sw, sh] = Window.this.screenBox('frame', 'dimension');
  Window.this.move((sw - w) / 2, (sh - h) / 2, w, h, true);
  Window.this.isMinimizable = true;
  Window.this.isMaximizable = false;
}

$('#submit').on('click', async () => {
  try {
    $('#status').value = '';
    $('#response').innerHTML = '';

    const method = $('#method').value;
    const endpoint = $('#endpoint').value;
    const headers = $('#headers').value;
    const body = $('#body').value;

    console.log({
      endpoint,
      method,
      headers: parseForm(headers),
      body: parseForm(body),
    });

    const response = await fetch(endpoint, {
      method,
      headers: parseForm(headers),
      body: parseForm(body),
    });

    const statusCode = response.status;
    const statusText = response.statusText;

    $('#status').value = `${statusCode} ${statusText ? ' ' + statusText : STATUS_TEXTS[statusCode]}`;

    const text = await response.text();
    $('#response').innerHTML = text;
  } catch (e) {
    Window.this.modal(<error caption="Error">Failed to fetch.</error>);
  }
});

function parseForm(raw) {
  if (!raw.trim()) {
    return {};
  }
  
  const entries = raw.split(/[\r\n]+/).map((line) => {
    const [key, ...values] = line.split(':');
    return [key.trim(), values.join(':').slice(1)];
  });

  return Object.fromEntries(entries);
}

$('[name=help-about]').on('click', () => Window.this.modal({ url: 'about.htm' }));