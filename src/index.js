import { empty } from './lib/elements.js';
import { renderDetails, renderFrontpage, searchAndRender } from './lib/ui.js';

/**
 * Fall sem keyrir við leit.
 * @param {SubmitEvent} e
 * @returns {Promise<void>}
 */
async function onSearch(e) {
  e.preventDefault();

  const form = e.target;
  const input = form.querySelector('input[name="query"]');
  const value = input ? input.value : '';

  if (!value) {
    return;
  }

  await searchAndRender(document.body, form, value);
  window.history.pushState({}, '', `/?query=${encodeURIComponent(value)}`);
}

/**
 * Athugar hvaða síðu við erum á út frá query-string og birtir.
 * Ef `id` er gefið er stakt geimskot birt, annars er forsíða birt með
 * leitarniðurstöðum ef `query` er gefið.
 */
function route() {
  const { search } = window.location;
  const qs = new URLSearchParams(search);
  const query = qs.get('query') ?? undefined;
  const id = qs.get('id');

  const parentElement = document.body;
  empty(parentElement);

  if (id) {
    renderDetails(parentElement, id);
  } else {
    renderFrontpage(parentElement, onSearch, query);
  }
}

window.onpopstate = () => {
  route();
};

route();
