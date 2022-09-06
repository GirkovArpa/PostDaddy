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

    const options = {
      method,
      headers: parseForm(headers),
      body: parseForm(body),
    }

    let url = method === 'GET'
      ? endpoint + objectToQueryString(options.body)
      : endpoint;

    if (method === 'GET') {
      delete options.body;
    } else if (method === 'POST') {
      options.body = objectToQueryString(parseForm(body)).slice(1);
    }

    const response = await fetch(url, options);

    const statusCode = response.status;
    const statusText = response.statusText;

    $('#status').value = `${statusCode} ${statusText ? ' ' + statusText : STATUS_TEXTS[statusCode]}`;

    const text = await response.text();
    $('#response').innerHTML = text;
  } catch (e) {
    console.log(e);
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

function objectToQueryString(object) {
  return '?' +
    Object.keys(object).map((key) => {
      return encodeURIComponent(key) + '=' +
        encodeURIComponent(object[key]);
    }).join('&');
}

$('[name=help-about]').on('click', () => Window.this.modal({ url: 'about.htm' }));