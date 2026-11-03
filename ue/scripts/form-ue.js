/*
 * Universal Editor support for the form block on DA (Author Bus).
 *
 * The whole Adaptive Form definition is stored as JSON in the block's <pre><code>. da-universal
 * (ue.da.live) serves the block as a JSON block (data-json-block, see
 * component-json-mappings.json): every form item arrives as a virtual key-value element with
 * its UE instrumentation (urn:ab:section-<s>/block-<b>/item-<i>). The elements are taken out
 * before the form renders, their attributes are moved to the rendered fields, and the UE
 * service's DA plugin edits the items directly. The form's own properties (title, submit
 * settings) are the block's model, sent as json-prop-<name> elements of the block.
 */
const jsonItems = new WeakMap();

function getFormBlocks() {
  return [...document.querySelectorAll('main .form[data-json-block][data-aue-resource]')];
}

const aueAttributes = (el) => [...el.attributes]
  .filter((a) => a.name.startsWith('data-aue-'))
  .map((a) => [a.name, a.value]);

const isVirtual = (el) => ['data-json-index', 'data-json-children'].some((n) => el.hasAttribute(n))
  || [...el.classList].some((name) => name.startsWith('json-prop-'));

// item elements of panels (and other containers) are nested in a data-json-children element;
// the form's own properties arrive as json-prop-<name> elements
function takeJsonItems(block) {
  const byId = new Map();
  block.querySelectorAll('[data-json-index]').forEach((el) => {
    const attrs = aueAttributes(el);
    if (attrs.length) byId.set(el.dataset.jsonId, attrs);
  });
  [...block.children].filter(isVirtual).forEach((el) => el.remove());
  jsonItems.set(block, byId);
}

function annotateForm(block) {
  const byId = jsonItems.get(block);
  if (!byId) return;
  block.querySelectorAll('form .field-wrapper[data-id]').forEach((wrapper) => {
    byId.get(wrapper.dataset.id)?.forEach(([name, value]) => wrapper.setAttribute(name, value));
  });
}

function blockForResource(resource) {
  if (!resource) return null;
  return getFormBlocks().find((b) => resource === b.dataset.aueResource
    || resource.startsWith(`${b.dataset.aueResource}/`)) || null;
}

function requestResources(request) {
  return [
    request?.target?.resource,
    request?.target?.container?.resource,
    request?.to?.container?.resource,
    request?.from?.container?.resource,
  ].filter(Boolean);
}

// the DA plugin answers with the edited item only, so reload the whole block from the page
async function rerender(block) {
  const resp = await fetch(window.location.href, { credentials: 'include', cache: 'no-store' });
  if (!resp.ok) return false;
  const page = new DOMParser().parseFromString(await resp.text(), 'text/html');
  const fresh = page.querySelector(`.form[data-aue-resource="${block.dataset.aueResource}"]`);
  if (!fresh?.querySelector('pre > code')) return false;

  block.replaceChildren(...fresh.children);
  takeJsonItems(block);
  const { default: decorate } = await import('../../blocks/form/form.js');
  await decorate(block);
  annotateForm(block);
  return true;
}

function onContentChange(event) {
  const { request } = event.detail || {};
  const block = requestResources(request).map(blockForResource).find(Boolean);
  if (!block) return;

  event.preventDefault();
  event.stopPropagation();
  rerender(block)
    .then((applied) => { if (!applied) window.location.reload(); })
    .catch(() => window.location.reload());
}

export default function setupFormEditing() {
  getFormBlocks().forEach(takeJsonItems);

  ['aue:content-update', 'aue:content-patch', 'aue:content-add', 'aue:content-remove',
    'aue:content-move', 'aue:content-copy']
    .forEach((type) => document.addEventListener(type, onContentChange, true));

  // annotate forms whenever the form block renders its <form>
  new MutationObserver((mutations) => {
    mutations.forEach(({ addedNodes }) => addedNodes.forEach((node) => {
      if (node.nodeName === 'FORM') {
        const block = node.closest('.form[data-json-block][data-aue-resource]');
        if (block) annotateForm(block);
      }
    }));
  }).observe(document, { childList: true, subtree: true });
}
