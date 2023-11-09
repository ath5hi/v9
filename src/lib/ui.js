import { getLaunch, searchLaunches } from './api.js';
import { el } from './elements.js';

// Býr til leitarform
export function renderSearchForm(searchHandler, query = undefined) {
  const form = el(
    'form',
    { class: 'search-form' },
    el('input', { type: 'search', name: 'query', placeholder: 'Leita að geimskotum...', value: query ?? '' }),
    el('button', {}, 'Leita')
  );

  form.addEventListener('submit', searchHandler);

  return form;
}

// Setur "loading state" á meðan gögn eru sótt
function setLoading(parentElement, searchForm) {
  const loadingIndicator = el('div', { class: 'loading-indicator' }, 'Sæki gögn...');
  parentElement.appendChild(loadingIndicator);

  if (searchForm) {
    const inputsAndButtons = searchForm.querySelectorAll('input, button');
    inputsAndButtons.forEach((inputOrButton) => {
      inputOrButton.disabled = true; // Directly assign the property without returning it
    });
  }
}

// Fjarlægir "loading state"
function setNotLoading(parentElement, searchForm) {
  const loadingIndicator = parentElement.querySelector('.loading-indicator');
  loadingIndicator?.remove();

  if (searchForm) {
    const inputsAndButtons = searchForm.querySelectorAll('input, button');
    inputsAndButtons.forEach((inputOrButton) => {
      inputOrButton.disabled = false;
    });
  }
}
// Birtir niðurstöður úr leit
function createSearchResults(results, query) {
  const list = el('ul', { class: 'search-results' });

  if (!results || results.length === 0) {
    const message = results ? `Engar niðurstöður fundust fyrir: "${query}"` : `Leit tókst ekki: "${query}"`;
    list.appendChild(el('li', { class: 'search-result-item' }, message));
    return list;
  }

  results.forEach((result) => {
    const item = el(
      'li',
      { class: 'search-result-item' },
      el('a', { href: `/?id=${result.id}` }, result.name),
      el('span', {}, result.status.name)
    );
    if (result.mission && result.mission.name) {
      item.appendChild(el('span', {}, `Mission: ${result.mission.name}`));
    }
    list.appendChild(item);
  });

  return list;
}

// Leitar og birtir niðurstöður
export async function searchAndRender(parentElement, searchForm, query) {
  setLoading(parentElement, searchForm);

  try {
    const results = await searchLaunches(query);
    const searchResults = createSearchResults(results, query);
    parentElement.appendChild(searchResults);
  } catch (error) {
    console.error('Error fetching search results:', error);
    const errorMessage = el('p', { class: 'error-message' }, 'Ekki tókst að sækja leitarniðurstöður. Reyndu aftur.');
    parentElement.appendChild(errorMessage);
  } finally {
    setNotLoading(parentElement, searchForm);
  }
}

// Sýnir forsíðu með mögulegum leitarniðurstöðum
export function renderFrontpage(parentElement, searchHandler, query = undefined) {
  const heading = el('h1', { class: 'heading' }, 'Geimskotaleitin 🚀');
  const searchForm = renderSearchForm(searchHandler, query);

  const container = el('div', {}, heading, searchForm);
  parentElement.appendChild(container);

  if (query) {
    searchAndRender(parentElement, searchForm, query);
  }
}

// Sýnir upplýsingar um eitt geimskot
export async function renderDetails(parentElement, id) {
  setLoading(parentElement);

  try {
    const launchDetails = await getLaunch(id);
    if (launchDetails) {
      const details = el('div', { class: 'launch-details' },
        el('h1', {}, launchDetails.name),
      );
      parentElement.appendChild(details);
    } else {
      parentElement.appendChild(el('p', {}, 'Upplýsingar um geimskotið fundust ekki.'));
    }
  } catch (error) {
    console.error('Error fetching launch details:', error);
    parentElement.appendChild(el('p', {}, 'Villa kom upp við að sækja upplýsingar.'));
  } finally {
    setNotLoading(parentElement);
  }
}