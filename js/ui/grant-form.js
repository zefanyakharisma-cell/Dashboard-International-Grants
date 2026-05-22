/**
 * Admin grant create/edit modal form.
 * Talks to api/grants.js for persistence + api/storage.js for file upload.
 */

import { $, $$, esc, refreshIcons } from './helpers.js';
import { state, ALL_DEGREES } from '../store.js';
import { createGrant, updateGrant } from '../api/grants.js';
import { uploadAttachment } from '../api/storage.js';
import { logActivity } from '../api/activity.js';
import { toast } from './toast.js';
import { render } from './router.js';

export function openGrantForm(id) {
  const g = id
    ? state.grants.find(x => x.id === id)
    : {
        id: '', title:'', organization:'', country:'', category: state.categories[0] || '',
        amount: 0, currency:'USD', amountNote:'', deadline:'', description:'', eligibility:'',
        website:'', contactEmail:'', tags:[], attachments:[], facultyIds:[], programIds:[],
        degreeLevels:[], archived:false
      };

  const facCheckboxes = state.faculties.map(f => `
    <label class="flex items-start gap-2 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
      <input type="checkbox" data-fac="${f.id}" ${g.facultyIds?.includes(f.id)?'checked':''}>
      <div><div class="text-sm font-medium">${esc(f.name)}</div><div class="text-xs text-slate-500">${f.programs.length} programs</div></div>
    </label>`).join('');

  const progCheckboxes = state.faculties.map(f => `
    <details class="card p-2 mb-2" ${g.programIds?.some(pid=>f.programs.find(p=>p.id===pid))?'open':''}>
      <summary class="cursor-pointer text-xs font-semibold text-slate-500">${esc(f.name)}</summary>
      <div class="mt-2 grid grid-cols-1 md:grid-cols-2 gap-1">
        ${f.programs.map(p => `
          <label class="flex items-center gap-2 text-xs py-1">
            <input type="checkbox" data-prog="${p.id}" ${g.programIds?.includes(p.id)?'checked':''}>
            <span class="text-slate-400 mr-1">${esc(p.degree)}</span>${esc(p.name)}
          </label>`).join('')}
      </div>
    </details>`).join('');

  const degCheckboxes = ALL_DEGREES.map(d =>
    `<label class="flex items-center gap-2 text-xs"><input type="checkbox" data-deg="${esc(d)}" ${g.degreeLevels?.includes(d)?'checked':''}>${esc(d)}</label>`
  ).join('');

  $('#grant-form-body').innerHTML = `
    <form id="grant-form" class="p-6 space-y-4" novalidate>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">${id?'Edit grant':'Add new grant'}</h2>
        <button type="button" class="btn btn-ghost" id="close-form"><i data-lucide="x"></i></button>
      </div>

      <div id="grant-form-error" class="hidden p-3 rounded border border-rose-300 bg-rose-50 text-rose-700 text-xs dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-200 whitespace-pre-wrap font-mono"></div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="md:col-span-2"><label class="text-xs font-semibold">Title</label><input class="input mt-1" name="title" value="${esc(g.title)}"></div>
        <div><label class="text-xs font-semibold">Funding Organization</label><input class="input mt-1" name="organization" value="${esc(g.organization)}"></div>
        <div><label class="text-xs font-semibold">Country</label><input class="input mt-1" name="country" value="${esc(g.country)}"></div>
        <div>
          <label class="text-xs font-semibold">Category</label>
          <select class="select mt-1" name="category">
            ${state.categories.map(c => `<option value="${esc(c)}" ${g.category===c?'selected':''}>${esc(c)}</option>`).join('')}
            ${g.category && !state.categories.includes(g.category) ? `<option value="${esc(g.category)}" selected>${esc(g.category)}</option>` : ''}
          </select>
        </div>
        <div>
          <label class="text-xs font-semibold">Deadline</label>
          <input class="input mt-1" type="date" name="deadline" value="${esc(g.deadline||'')}">
        </div>
        <div><label class="text-xs font-semibold">Currency</label><input class="input mt-1" name="currency" value="${esc(g.currency)}" placeholder="USD"></div>
        <div><label class="text-xs font-semibold">Amount</label><input class="input mt-1" type="number" step="0.01" name="amount" value="${g.amount||0}"></div>
        <div class="md:col-span-2"><label class="text-xs font-semibold">Amount note</label><input class="input mt-1" name="amountNote" value="${esc(g.amountNote||'')}"></div>
        <div class="md:col-span-2"><label class="text-xs font-semibold">Description</label><textarea class="textarea mt-1" name="description" rows="3">${esc(g.description)}</textarea></div>
        <div class="md:col-span-2"><label class="text-xs font-semibold">Eligibility</label><textarea class="textarea mt-1" name="eligibility" rows="2">${esc(g.eligibility)}</textarea></div>
        <div><label class="text-xs font-semibold">Website URL</label><input class="input mt-1" name="website" value="${esc(g.website)}" placeholder="https://"></div>
        <div><label class="text-xs font-semibold">Contact email</label><input class="input mt-1" name="contactEmail" value="${esc(g.contactEmail)}"></div>
        <div class="md:col-span-2"><label class="text-xs font-semibold">Tags (comma-separated)</label><input class="input mt-1" name="tags" value="${esc((g.tags||[]).join(', '))}"></div>
        <div class="md:col-span-2">
          <label class="text-xs font-semibold">Attachments</label>
          <div class="mt-1 space-y-1" id="att-list">
            ${(g.attachments||[]).map((a,i) => `
              <div class="flex items-center gap-2 text-xs">
                <i data-lucide="paperclip" class="w-3.5 h-3.5"></i>
                <a class="text-petra-600 hover:underline truncate" href="${esc(a.url||'#')}" target="_blank">${esc(a.name)}</a>
                <button type="button" class="btn btn-ghost text-rose-600 ml-auto" data-att-remove="${i}"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
              </div>`).join('')}
          </div>
          <input type="file" class="text-xs mt-2" id="att-file" />
          <p class="text-xs text-slate-500 mt-1">Or paste link manually: <input class="input mt-1" name="extraAttachment" placeholder="Name | https://..."></p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div>
          <label class="text-xs font-semibold">Eligible Faculties (whole-faculty)</label>
          <div class="mt-1 max-h-48 overflow-y-auto card p-2">${facCheckboxes}</div>
        </div>
        <div>
          <label class="text-xs font-semibold">Specific Programs (optional)</label>
          <div class="mt-1 max-h-48 overflow-y-auto">${progCheckboxes}</div>
        </div>
      </div>

      <div>
        <label class="text-xs font-semibold">Eligible Degree Levels</label>
        <div class="flex flex-wrap gap-3 mt-1">${degCheckboxes}</div>
      </div>

      <div class="flex items-center gap-2 pt-2">
        <label class="flex items-center gap-2 text-xs"><input type="checkbox" name="archived" ${g.archived?'checked':''}> Archived</label>
        <div class="ml-auto flex gap-2">
          <button type="button" class="btn btn-secondary" id="close-form"><i data-lucide="x"></i>Cancel</button>
          <button type="submit" class="btn btn-primary"><i data-lucide="save"></i>${id?'Save changes':'Create grant'}</button>
        </div>
      </div>
    </form>`;

  $('#grant-form-modal').classList.remove('hidden');
  refreshIcons();

  const closeForm = () => $('#grant-form-modal').classList.add('hidden');
  $$('#close-form').forEach(b => b.addEventListener('click', closeForm));

  // Local working copy of attachments (so file upload + remove can mutate live)
  const workingAttachments = [...(g.attachments || [])];

  $('#att-list').addEventListener('click', (e) => {
    const rm = e.target.closest('[data-att-remove]');
    if (rm) {
      workingAttachments.splice(parseInt(rm.dataset.attRemove, 10), 1);
      rerenderAttachmentsList();
    }
  });

  $('#att-file').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast('Uploading…', 'info');
      const att = await uploadAttachment(file);
      workingAttachments.push({ name: att.name, url: att.url });
      rerenderAttachmentsList();
      toast('Attachment uploaded', 'success');
    } catch (err) {
      console.error('[grant-form] attachment upload failed', err);
      toast(`Upload failed: ${err.message || err.code || 'unknown'} ${err.statusCode ? `(${err.statusCode})` : ''}`, 'error');
    } finally {
      e.target.value = '';
    }
  });

  function rerenderAttachmentsList() {
    $('#att-list').innerHTML = workingAttachments.map((a,i) => `
      <div class="flex items-center gap-2 text-xs">
        <i data-lucide="paperclip" class="w-3.5 h-3.5"></i>
        <a class="text-petra-600 hover:underline truncate" href="${esc(a.url||'#')}" target="_blank">${esc(a.name)}</a>
        <button type="button" class="btn btn-ghost text-rose-600 ml-auto" data-att-remove="${i}"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
      </div>`).join('');
    refreshIcons();
  }

  const errorBox = $('#grant-form-error');
  const showError = (label, err) => {
    const parts = [`${label}:`];
    if (err && typeof err === 'object') {
      if (err.message) parts.push(`message: ${err.message}`);
      if (err.code)    parts.push(`code:    ${err.code}`);
      if (err.details) parts.push(`details: ${err.details}`);
      if (err.hint)    parts.push(`hint:    ${err.hint}`);
      if (err.status)  parts.push(`status:  ${err.status}`);
      if (!err.message && !err.code) parts.push(JSON.stringify(err, null, 2));
    } else {
      parts.push(String(err));
    }
    errorBox.textContent = parts.join('\n');
    errorBox.classList.remove('hidden');
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    console.error('[grant-form]', label, err);
    toast(`${label}: ${err?.message || err?.code || 'see form for details'}`, 'error');
  };

  $('#grant-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.classList.add('hidden');
    errorBox.textContent = '';
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const fd = new FormData(e.target);

      const extra = String(fd.get('extraAttachment') || '').trim();
      if (extra) {
        const [name, url] = extra.split('|').map(s => s.trim());
        if (name && url) workingAttachments.push({ name, url });
      }

      const facultyIds   = $$('input[data-fac]', e.target).filter(i => i.checked).map(i => i.dataset.fac);
      const programIds   = $$('input[data-prog]', e.target).filter(i => i.checked).map(i => i.dataset.prog);
      const degreeLevels = $$('input[data-deg]', e.target).filter(i => i.checked).map(i => i.dataset.deg);

      const payload = {
        title:        String(fd.get('title') || '').trim(),
        organization: String(fd.get('organization') || '').trim(),
        country:      String(fd.get('country') || '').trim(),
        category:     String(fd.get('category') || '').trim(),
        currency:     String(fd.get('currency') || '').trim() || 'USD',
        amount:       parseFloat(fd.get('amount')) || 0,
        amountNote:   String(fd.get('amountNote') || '').trim(),
        deadline:     fd.get('deadline') || null,
        description:  String(fd.get('description') || '').trim(),
        eligibility:  String(fd.get('eligibility') || '').trim(),
        website:      String(fd.get('website') || '').trim(),
        contactEmail: String(fd.get('contactEmail') || '').trim(),
        tags:         String(fd.get('tags') || '').split(',').map(t => t.trim()).filter(Boolean),
        attachments:  workingAttachments,
        facultyIds, programIds, degreeLevels,
        archived:     !!fd.get('archived')
      };

      console.log('[grant-form] submitting payload', payload);

      let saved;
      try {
        saved = id
          ? await updateGrant(id, payload)
          : await createGrant(payload);
      } catch (dbErr) {
        showError(id ? 'Update failed' : 'Create failed', dbErr);
        return;
      }

      try {
        await logActivity(id ? 'edit' : 'create',
          `${id?'Updated':'Created'} grant "${saved.title}"`, saved.id);
      } catch (logErr) {
        console.warn('[grant-form] activity log failed (grant was saved)', logErr);
      }

      toast(id ? 'Grant updated' : 'Grant created', 'success');
      closeForm();
      render();
    } catch (err) {
      showError('Unexpected error', err);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
