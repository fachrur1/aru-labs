// admin/src/components.js — reusable form widgets + category manager modal.
import { el, esc, icons, toast, openModal, errorMessage, setBusy, renderMarkdown, confirmDialog } from './ui.js';
import { attachDropZone, uploadImage } from './uploads.js';
import { listCategories, saveCategory, deleteCategory, batchOrder, fetchOrdering } from './api.js';

/* ------------------------------------------------------------------ */
/* Slug helper                                                         */
/* ------------------------------------------------------------------ */

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* ------------------------------------------------------------------ */
/* Markdown editor                                                     */
/* ------------------------------------------------------------------ */

function insertAtCursor(ta, before, after = '', placeholder = '') {
  ta.focus();
  const start = ta.selectionStart ?? ta.value.length;
  const end = ta.selectionEnd ?? start;
  const hadSelection = end > start;
  const selected = ta.value.slice(start, end) || placeholder;
  ta.setRangeText(before + selected + after, start, end, 'select');
  if (!hadSelection && placeholder) {
    ta.setSelectionRange(start + before.length, start + before.length + placeholder.length);
  } else {
    ta.setSelectionRange(start + before.length + selected.length + after.length, start + before.length + selected.length + after.length);
  }
  ta.dispatchEvent(new Event('input', { bubbles: true }));
}

const MD_TOOLBAR = [
  { key: 'h2', label: 'H2', title: 'Heading 2', insert: (ta) => insertAtCursor(ta, '## ', '', 'Heading') },
  { key: 'h3', label: 'H3', title: 'Heading 3', insert: (ta) => insertAtCursor(ta, '### ', '', 'Heading') },
  { key: 'bold', label: '<strong>B</strong>', title: 'Bold', insert: (ta) => insertAtCursor(ta, '**', '**', 'bold text') },
  { key: 'italic', label: '<em>I</em>', title: 'Italic', insert: (ta) => insertAtCursor(ta, '_', '_', 'italic text') },
  { key: 'ul', label: '• List', title: 'Bullet list', insert: (ta) => insertAtCursor(ta, '- ', '', 'List item') },
  { key: 'ol', label: '1. List', title: 'Numbered list', insert: (ta) => insertAtCursor(ta, '1. ', '', 'List item') },
  { key: 'link', label: 'Link', title: 'Insert link', insert: (ta) => insertAtCursor(ta, '[', '](https://)', 'link text') },
  { key: 'image', label: 'Image', title: 'Insert image', insert: (ta) => insertAtCursor(ta, '![', '](https://)', 'alt text') },
  {
    key: 'table',
    label: 'Table',
    title: 'Insert table',
    insert: (ta) => insertAtCursor(ta, '| Column | Column |\n| --- | --- |\n| Cell | Cell |\n', '', ''),
  },
  { key: 'code', label: '&lt;/&gt;', title: 'Code block', insert: (ta) => insertAtCursor(ta, '```\n', '\n```', 'code') },
];

function markdownEditor(field, value) {
  const id = `md-${field.name}-${Math.random().toString(36).slice(2, 7)}`;
  const root = el(`
    <div class="md-editor">
      <div class="md-tabs" role="tablist">
        <button class="md-tab active" data-tab="write" type="button" role="tab" aria-selected="true">Write</button>
        <button class="md-tab" data-tab="preview" type="button" role="tab" aria-selected="false">Preview</button>
      </div>
      <div class="md-toolbar" role="toolbar" aria-label="Markdown formatting"></div>
      <textarea id="${id}" class="textarea md-input" rows="${field.rows || 8}" placeholder="${esc(field.placeholder || 'Write markdown…')}"></textarea>
      <div class="md-preview prose hidden" aria-label="Markdown preview"></div>
    </div>`);
  const ta = root.querySelector('textarea');
  ta.value = value ?? '';
  const toolbar = root.querySelector('.md-toolbar');
  for (const btn of MD_TOOLBAR) {
    const b = el(`<button class="md-btn" type="button" title="${esc(btn.title)}" aria-label="${esc(btn.title)}">${btn.label}</button>`);
    b.addEventListener('click', () => btn.insert(ta));
    toolbar.appendChild(b);
  }
  const previewEl = root.querySelector('.md-preview');
  root.querySelectorAll('.md-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.tab;
      root.querySelectorAll('.md-tab').forEach((t) => {
        const active = t === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
      });
      if (mode === 'preview') {
        previewEl.innerHTML = renderMarkdown(ta.value) || '<p class="text-muted">Nothing to preview.</p>';
        previewEl.classList.remove('hidden');
        ta.classList.add('hidden');
        toolbar.classList.add('hidden');
      } else {
        previewEl.classList.add('hidden');
        ta.classList.remove('hidden');
        toolbar.classList.remove('hidden');
      }
    });
  });
  root._getValue = () => ta.value;
  return root;
}

/* ------------------------------------------------------------------ */
/* Tags editor (string[] for jsonb columns)                            */
/* ------------------------------------------------------------------ */

function tagsEditor(field, value) {
  const items = Array.isArray(value) ? value.map(String) : [];
  const root = el(`
    <div class="tags-input">
      <div class="tags-list"></div>
      <input class="input tags-entry" type="text" placeholder="${esc(field.placeholder || 'Type and press Enter or comma')}" />
    </div>`);
  const list = root.querySelector('.tags-list');
  const entry = root.querySelector('.tags-entry');

  const render = () => {
    list.innerHTML = '';
    items.forEach((tag, index) => {
      const chip = el(`<span class="tag-chip">${esc(tag)}<button class="tag-remove" type="button" aria-label="Remove ${esc(tag)}">${icons.x}</button></span>`);
      chip.querySelector('.tag-remove').addEventListener('click', () => {
        items.splice(index, 1);
        render();
        entry.dispatchEvent(new Event('input', { bubbles: true }));
      });
      list.appendChild(chip);
    });
  };

  const add = (raw) => {
    const parts = String(raw).split(',');
    let added = false;
    for (const part of parts) {
      const tag = part.trim();
      if (tag && !items.includes(tag)) {
        items.push(tag);
        added = true;
      }
    }
    if (added) {
      render();
      entry.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  entry.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(entry.value);
      entry.value = '';
    } else if (e.key === 'Backspace' && !entry.value && items.length) {
      items.pop();
      render();
      entry.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  entry.addEventListener('blur', () => {
    if (entry.value.trim()) {
      add(entry.value);
      entry.value = '';
    }
  });

  render();
  root._getValue = () => items.slice();
  return root;
}

/* ------------------------------------------------------------------ */
/* Links editor (jsonb [{label, url}])                                 */
/* ------------------------------------------------------------------ */

function linksEditor(field, value) {
  const items = Array.isArray(value)
    ? value.map((v) => ({ label: v?.label || '', url: v?.url || '' }))
    : [];
  const root = el(`
    <div class="links-editor">
      <div class="links-list"></div>
      <button class="btn btn-ghost btn-sm" data-act="add-link" type="button">${icons.plus}<span>Add link</span></button>
    </div>`);
  const list = root.querySelector('.links-list');

  const render = () => {
    list.innerHTML = '';
    items.forEach((item, index) => {
      const row = el(`
        <div class="link-row">
          <input class="input link-label" type="text" placeholder="Label" value="${esc(item.label)}" aria-label="Link label" />
          <input class="input link-url" type="url" placeholder="https://…" value="${esc(item.url)}" aria-label="Link URL" />
          <button class="icon-btn danger" data-act="remove" type="button" aria-label="Remove link">${icons.trash}</button>
        </div>`);
      row.querySelector('.link-label').addEventListener('input', (e) => {
        items[index].label = e.target.value;
      });
      row.querySelector('.link-url').addEventListener('input', (e) => {
        items[index].url = e.target.value;
      });
      row.querySelector('[data-act="remove"]').addEventListener('click', () => {
        items.splice(index, 1);
        render();
      });
      list.appendChild(row);
    });
    if (!items.length) {
      list.innerHTML = '<p class="text-muted small">No links yet.</p>';
    }
  };

  root.querySelector('[data-act="add-link"]').addEventListener('click', () => {
    items.push({ label: '', url: '' });
    render();
    const rows = list.querySelectorAll('.link-row');
    if (rows.length) rows[rows.length - 1].querySelector('.link-label').focus();
  });

  render();
  root._getValue = () => items.filter((i) => i.label.trim() || i.url.trim());
  return root;
}

/* ------------------------------------------------------------------ */
/* Image field (URL input + upload + drop zone + preview)               */
/* ------------------------------------------------------------------ */

function imageField(field, value, ctx = {}) {
  const root = el(`
    <div class="image-field">
      <div class="image-field-row">
        <input class="input image-url" type="text" placeholder="https://… or upload a file" value="${esc(value || '')}" aria-label="${esc(field.label || 'Image URL')}" />
        <button class="btn btn-ghost btn-sm" data-act="upload" type="button">${icons.upload}<span>Upload</span></button>
      </div>
      <div class="drop-zone" tabindex="0" role="button" aria-label="Drop an image here or click to browse">
        <div class="drop-hint">${icons.imagePlus}<span>Drag &amp; drop an image here, or click to browse</span></div>
        <img class="img-preview hidden" alt="${esc(field.label || 'Preview')}" />
      </div>
      <div class="upload-status hidden">${icons.spinner}<span>Uploading…</span></div>
    </div>`);
  const input = root.querySelector('.image-url');
  const preview = root.querySelector('.img-preview');
  const hint = root.querySelector('.drop-hint');
  const status = root.querySelector('.upload-status');
  const uploadBtn = root.querySelector('[data-act="upload"]');
  const zone = root.querySelector('.drop-zone');

  const syncPreview = () => {
    const url = input.value.trim();
    if (url) {
      preview.src = url;
      preview.classList.remove('hidden');
      hint.classList.add('hidden');
    } else {
      preview.removeAttribute('src');
      preview.classList.add('hidden');
      hint.classList.remove('hidden');
    }
  };
  syncPreview();
  input.addEventListener('input', syncPreview);
  preview.addEventListener('error', () => {
    preview.classList.add('hidden');
    hint.classList.remove('hidden');
  });

  const doUpload = async (file) => {
    status.classList.remove('hidden');
    setBusy(uploadBtn, true, 'Uploading…');
    try {
      const { url } = await uploadImage(file);
      input.value = url;
      syncPreview();
      input.dispatchEvent(new Event('input', { bubbles: true }));
      toast('Image uploaded.');
    } catch (err) {
      toast(err.message || 'Upload failed.', 'error');
    } finally {
      status.classList.add('hidden');
      setBusy(uploadBtn, false);
    }
  };

  const dz = attachDropZone(zone, {
    accepts: 'image',
    onFile: doUpload,
    onInvalid: (msg) => toast(msg, 'error'),
  });
  uploadBtn.addEventListener('click', () => dz.openPicker());

  root._getValue = () => input.value.trim();
  return root;
}

/* ------------------------------------------------------------------ */
/* Gallery editor (ordered [{url, caption, alt}])                      */
/* ------------------------------------------------------------------ */

function galleryEditor(field, value, ctx = {}) {
  const items = Array.isArray(value)
    ? value.map((v) => ({ url: v?.url || '', caption: v?.caption || '', alt: v?.alt || '' }))
    : [];
  const root = el(`
    <div class="gallery-editor">
      <div class="gallery-items"></div>
      <button class="btn btn-ghost btn-sm" data-act="add-image" type="button">${icons.plus}<span>Add image</span></button>
    </div>`);
  const list = root.querySelector('.gallery-items');
  let dragIndex = null;

  const render = () => {
    list.innerHTML = '';
    items.forEach((item, index) => {
      const itemEl = el(`
        <div class="gallery-item" draggable="true">
          <div class="gallery-item-grip" title="Drag to reorder">${icons.grip}</div>
          <div class="gallery-item-media">
            <img class="gallery-thumb ${item.url ? '' : 'hidden'}" alt="" />
            <div class="gallery-thumb-empty ${item.url ? 'hidden' : ''}">${icons.imagePlus}</div>
          </div>
          <div class="gallery-item-fields">
            <input class="input gi-url" type="text" placeholder="Image URL (or upload)" value="${esc(item.url)}" aria-label="Image URL" />
            <div class="gallery-item-sub">
              <input class="input gi-caption" type="text" placeholder="Caption" value="${esc(item.caption)}" aria-label="Caption" />
              <input class="input gi-alt" type="text" placeholder="Alt text" value="${esc(item.alt)}" aria-label="Alt text" />
            </div>
            <div class="gallery-item-actions">
              <button class="btn btn-ghost btn-sm" data-act="gi-upload" type="button">${icons.upload}<span>Upload</span></button>
              <button class="btn btn-ghost btn-sm danger" data-act="gi-remove" type="button">${icons.trash}<span>Remove</span></button>
            </div>
            <div class="upload-status hidden">${icons.spinner}<span>Uploading…</span></div>
          </div>
        </div>`);

      const thumb = itemEl.querySelector('.gallery-thumb');
      const empty = itemEl.querySelector('.gallery-thumb-empty');
      const urlInput = itemEl.querySelector('.gi-url');
      const syncThumb = () => {
        item.url = urlInput.value.trim();
        if (item.url) {
          thumb.src = item.url;
          thumb.classList.remove('hidden');
          empty.classList.add('hidden');
        } else {
          thumb.removeAttribute('src');
          thumb.classList.add('hidden');
          empty.classList.remove('hidden');
        }
      };
      syncThumb();
      thumb.addEventListener('error', () => {
        thumb.classList.add('hidden');
        empty.classList.remove('hidden');
      });
      urlInput.addEventListener('input', syncThumb);
      itemEl.querySelector('.gi-caption').addEventListener('input', (e) => {
        item.caption = e.target.value;
      });
      itemEl.querySelector('.gi-alt').addEventListener('input', (e) => {
        item.alt = e.target.value;
      });

      const status = itemEl.querySelector('.upload-status');
      const upBtn = itemEl.querySelector('[data-act="gi-upload"]');
      const picker = attachDropZone(itemEl.querySelector('.gallery-item-media'), {
        accepts: 'image',
        onFile: async (file) => {
          status.classList.remove('hidden');
          setBusy(upBtn, true, 'Uploading…');
          try {
            const { url } = await uploadImage(file);
            item.url = url;
            urlInput.value = url;
            syncThumb();
            toast('Image uploaded.');
          } catch (err) {
            toast(err.message || 'Upload failed.', 'error');
          } finally {
            status.classList.add('hidden');
            setBusy(upBtn, false);
          }
        },
        onInvalid: (msg) => toast(msg, 'error'),
      });
      upBtn.addEventListener('click', () => picker.openPicker());

      itemEl.querySelector('[data-act="gi-remove"]').addEventListener('click', () => {
        items.splice(index, 1);
        render();
      });

      itemEl.addEventListener('dragstart', (e) => {
        dragIndex = index;
        itemEl.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      itemEl.addEventListener('dragend', () => {
        dragIndex = null;
        itemEl.classList.remove('dragging');
      });
      itemEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        itemEl.classList.add('drag-over');
      });
      itemEl.addEventListener('dragleave', () => itemEl.classList.remove('drag-over'));
      itemEl.addEventListener('drop', (e) => {
        e.preventDefault();
        itemEl.classList.remove('drag-over');
        if (dragIndex === null || dragIndex === index) return;
        const [moved] = items.splice(dragIndex, 1);
        items.splice(index, 0, moved);
        render();
      });

      list.appendChild(itemEl);
    });
    if (!items.length) {
      list.innerHTML = '<p class="text-muted small">No images yet — add one below.</p>';
    }
  };

  root.querySelector('[data-act="add-image"]').addEventListener('click', () => {
    items.push({ url: '', caption: '', alt: '' });
    render();
  });

  render();
  root._getValue = () => items.filter((i) => i.url.trim() || i.caption.trim() || i.alt.trim());
  return root;
}

/* ------------------------------------------------------------------ */
/* Control factory used by the form engine                             */
/* ------------------------------------------------------------------ */

export function renderControl(field, value, ctx = {}) {
  switch (field.type) {
    case 'markdown':
      return markdownEditor(field, value);
    case 'tags':
      return tagsEditor(field, value);
    case 'links':
      return linksEditor(field, value);
    case 'image':
      return imageField(field, value, ctx);
    case 'gallery':
      return galleryEditor(field, value, ctx);
    default:
      return defaultControl(field, value);
  }
}

function defaultControl(field, value) {
  const name = esc(field.name);
  switch (field.type) {
    case 'textarea': {
      const wrap = el(`<div></div>`);
      const ta = el(`<textarea class="textarea" name="${name}" rows="${field.rows || 4}" placeholder="${esc(field.placeholder || '')}"></textarea>`);
      ta.value = value ?? '';
      wrap.appendChild(ta);
      wrap._getValue = () => ta.value;
      return wrap;
    }
    case 'number': {
      const wrap = el(`<div></div>`);
      const input = el(`<input class="input" name="${name}" type="number" ${field.min !== undefined ? `min="${field.min}"` : ''} ${field.max !== undefined ? `max="${field.max}"` : ''} ${field.step !== undefined ? `step="${field.step}"` : ''} value="${esc(value ?? '')}" />`);
      wrap.appendChild(input);
      wrap._getValue = () => (input.value === '' ? null : Number(input.value));
      return wrap;
    }
    case 'date': {
      const wrap = el(`<div></div>`);
      const input = el(`<input class="input" name="${name}" type="date" value="${esc(value ?? '')}" />`);
      wrap.appendChild(input);
      wrap._getValue = () => input.value || null;
      return wrap;
    }
    case 'checkbox': {
      const wrap = el(`
        <label class="toggle">
          <input type="checkbox" name="${name}" ${value ? 'checked' : ''} />
          <span class="toggle-track"><span class="toggle-thumb"></span></span>
          <span class="toggle-label">${esc(field.checkboxLabel || 'Enabled')}</span>
        </label>`);
      const input = wrap.querySelector('input');
      wrap._getValue = () => input.checked;
      return wrap;
    }
    case 'select': {
      const wrap = el(`<div></div>`);
      const select = el(`<select class="select" name="${name}"></select>`);
      const options = field.options || [];
      if (!field.required) select.appendChild(el(`<option value="">${esc(field.emptyLabel || '— None —')}</option>`));
      for (const opt of options) {
        const o = el(`<option value="${esc(opt.value)}">${esc(opt.label)}</option>`);
        if (String(opt.value) === String(value ?? '')) o.selected = true;
        select.appendChild(o);
      }
      if (field.required && value != null && value !== '' && !options.some((o) => String(o.value) === String(value))) {
        const o = el(`<option value="${esc(value)}" selected>${esc(value)}</option>`);
        select.appendChild(o);
      }
      wrap.appendChild(select);
      wrap._getValue = () => select.value || null;
      return wrap;
    }
    default: {
      // text, email, url, slug — plain input with type hint
      const type = field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text';
      const wrap = el(`<div class="${field.type === 'slug' ? 'slug-wrap' : ''}"></div>`);
      const input = el(`<input class="input" name="${name}" type="${type}" value="${esc(value ?? '')}" placeholder="${esc(field.placeholder || '')}" ${field.type === 'slug' ? 'spellcheck="false"' : ''} />`);
      wrap.appendChild(input);
      wrap._getValue = () => input.value.trim();
      wrap._input = input;
      return wrap;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Category manager modal                                              */
/* ------------------------------------------------------------------ */

/**
 * Open the "Manage categories" modal for a given kind
 * ('project' | 'skill_group' | 'gallery' | 'experience' | 'organization').
 * onSaved() is called whenever categories change.
 */
export function manageCategories(kind, onSaved) {
  const KIND_LABELS = {
    project: 'Project categories',
    skill_group: 'Skill groups',
    gallery: 'Gallery categories',
    experience: 'Experience categories',
    organization: 'Organization categories',
  };
  const body = el(`
    <div class="cat-manager">
      <form class="cat-add-form">
        <div class="cat-add-row">
          <input class="input" name="name" type="text" placeholder="Category name" required />
          <input class="input" name="slug" type="text" placeholder="slug" pattern="[a-z0-9\\-]+" />
          <input class="input" name="icon" type="text" placeholder="icon (optional)" />
          <button class="btn btn-primary btn-sm" type="submit">${icons.plus}<span>Add</span></button>
        </div>
        <p class="field-help">The slug is generated from the name automatically — edit it only if needed.</p>
      </form>
      <div class="cat-list-wrap"><div class="cat-list"></div></div>
    </div>`);
  const footer = el(`
    <div class="modal-footer">
      <button class="btn btn-primary" data-act="done" type="button">Done</button>
    </div>`);

  const modal = openModal({ title: KIND_LABELS[kind] || 'Manage categories', body, footer, wide: true });
  footer.querySelector('[data-act="done"]').addEventListener('click', modal.close);

  const listEl = body.querySelector('.cat-list');
  const form = body.querySelector('.cat-add-form');
  const nameInput = form.querySelector('[name="name"]');
  const slugInput = form.querySelector('[name="slug"]');
  let slugManual = false;
  let rows = [];
  let dragIndex = null;

  nameInput.addEventListener('input', () => {
    if (!slugManual) slugInput.value = slugify(nameInput.value);
  });
  slugInput.addEventListener('input', () => {
    slugManual = slugInput.value.trim().length > 0;
  });

  const refresh = async () => {
    listEl.innerHTML = '<div class="skeleton skeleton-line w-60"></div><div class="skeleton skeleton-line w-40"></div>';
    const { rows: fetched, error } = await listCategories(kind);
    if (error) {
      listEl.innerHTML = `<div class="error-state"><p>${esc(errorMessage(error))}</p></div>`;
      return;
    }
    rows = fetched;
    renderList();
  };

  const renderList = () => {
    listEl.innerHTML = '';
    rows.forEach((row, index) => {
      const item = el(`
        <div class="cat-row" draggable="true">
          <div class="cat-grip" title="Drag to reorder">${icons.grip}</div>
          <input class="input cat-name" type="text" value="${esc(row.name)}" aria-label="Category name" />
          <input class="input cat-slug" type="text" value="${esc(row.slug)}" aria-label="Category slug" pattern="[a-z0-9\\-]*" />
          <input class="input cat-icon" type="text" value="${esc(row.icon || '')}" placeholder="icon" aria-label="Icon name" />
          <button class="btn btn-ghost btn-sm" data-act="save" type="button">${icons.check}<span>Save</span></button>
          <button class="icon-btn danger" data-act="delete" type="button" aria-label="Delete category">${icons.trash}</button>
        </div>`);
      const name = item.querySelector('.cat-name');
      const slug = item.querySelector('.cat-slug');
      const icon = item.querySelector('.cat-icon');

      item.querySelector('[data-act="save"]').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        setBusy(btn, true, 'Saving…');
        const { error } = await saveCategory({
          id: row.id,
          kind,
          name: name.value.trim(),
          slug: slug.value.trim() || slugify(name.value),
          icon: icon.value.trim(),
          sort_order: row.sort_order ?? index,
        });
        setBusy(btn, false);
        if (error) toast(errorMessage(error), 'error');
        else {
          toast('Category saved.');
          await refresh();
          if (typeof onSaved === 'function') onSaved();
        }
      });

      item.querySelector('[data-act="delete"]').addEventListener('click', async () => {
        const ok = await confirmDialog({
          title: 'Delete category?',
          message: `Delete “<strong>${esc(row.name)}</strong>”? Entries using it will become uncategorized.`,
          confirmLabel: 'Delete',
        });
        if (!ok) return;
        const { error } = await deleteCategory(row.id);
        if (error) {
          toast(errorMessage(error, 'Could not delete this category.'), 'error');
        } else {
          toast('Category deleted.');
          await refresh();
          if (typeof onSaved === 'function') onSaved();
        }
      });

      item.addEventListener('dragstart', (e) => {
        dragIndex = index;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      item.addEventListener('dragend', () => {
        dragIndex = null;
        item.classList.remove('dragging');
      });
      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        item.classList.add('drag-over');
      });
      item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
      item.addEventListener('drop', async (e) => {
        e.preventDefault();
        item.classList.remove('drag-over');
        if (dragIndex === null || dragIndex === index) return;
        const [moved] = rows.splice(dragIndex, 1);
        rows.splice(index, 0, moved);
        renderList();
        const updates = rows.map((r, i) => ({ id: r.id, value: i }));
        const { error } = await batchOrder('content_categories', updates, 'sort_order');
        if (error) toast(errorMessage(error), 'error');
        else if (typeof onSaved === 'function') onSaved();
      });

      listEl.appendChild(item);
    });
    if (!rows.length) {
      listEl.innerHTML = '<p class="text-muted">No categories yet — add the first one above.</p>';
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const slug = slugInput.value.trim() || slugify(name);
    if (!name) {
      toast('Category name is required.', 'error');
      return;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      toast('Slug may only contain a-z, 0-9 and hyphens.', 'error');
      return;
    }
    const submitBtn = form.querySelector('button[type="submit"]');
    setBusy(submitBtn, true, 'Adding…');
    const { error } = await saveCategory({
      id: null,
      kind,
      name,
      slug,
      icon: form.querySelector('[name="icon"]').value.trim(),
      sort_order: rows.length,
    });
    setBusy(submitBtn, false);
    if (error) {
      toast(errorMessage(error), 'error');
      return;
    }
    toast('Category added.');
    form.reset();
    slugManual = false;
    await refresh();
    if (typeof onSaved === 'function') onSaved();
  });

  refresh();
}
