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
    <form id="grant-form" class="p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">${id?'Edit grant':'Add new grant'}</h2>
        <button type="button" class="btn btn-ghost" id="close-form"><i data-lucide="x"></i></button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="md:col-span-2"><label class="text-xs font-semibold">Title</label><input class="input mt-1" name="title" value="${esc(g.title)}" required></div>
        <div><label class="text-xs font-semibold">Funding Organization</label><input class="input mt-1" name="organization" value="${esc(g.organization)}" required></div>
        <div><label class="text-xs font-semibold">Country</label><input class="input mt-1" name="country" value="${esc(g.country)}" required></div>
        <div>
          <label class="text-xs font-semibold">Category</label>
          <select class="select mt-1" name="category">${state.categories.map(c => `<option ${g.category===c?'selected':''}>${esc(c)}</option>`).join('')}</select>
        </div>
        <div>
          <label class="text-xs font-semibold">Deadline</label>
          <input class="input mt-1" type="date" name="deadline" value="${esc(g.deadline||'')}" required>
        </div>
        <div><label class="text-xs font-semibold">Currency</label><input class="input mt-1" name="currency" value="${esc(g.currency)}" placeholder="USD"></div>
        <div><label class="text-xs font-semibold">Amount</label><input class="input mt-1" type="number" step="0.01" name="amount" value="${g.amount||0}"></div>
        <div class="md:col-span-2"><label class="text-xs font-semibold">Amount note</label><input class="input mt-1" name="amountNote" value="${esc(g.amountNote||'')}"></div>
        <div class="md:col-span-2"><label class="text-xs font-semibold">Description</label><textarea class="textarea mt-1" name="description" rows="3" required>${esc(g.description)}</textarea></div>
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
      toast(`Upload failed: ${err.message}`, 'error');
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

  $('#grant-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);

    // Add the optional manual attachment row (Name | URL)
    const extra = String(fd.get('extraAttachment') || '').trim();
    if (extra) {
      const [name, url] = extra.split('|').map(s => s.trim());
      if (name && url) workingAttachments.push({ name, url });
    }

    const facultyIds   = $$('input[data-fac]', e.target).filter(i => i.checked).map(i => i.dataset.fac);
    const programIds   = $$('input[data-prog]', e.target).filter(i => i.checked).map(i => i.dataset.prog);
    const degreeLevels = $$('input[data-deg]', e.target).filter(i => i.checked).map(i => i.dataset.deg);

    const payload = {
      title:        fd.get('title').trim(),
      organization: fd.get('organization').trim(),
      country:      fd.get('country').trim(),
      category:     fd.get('category'),
      currency:     fd.get('currency').trim() || 'USD',
      amount:       parseFloat(fd.get('amount')) || 0,
      amountNote:   fd.get('amountNote').trim(),
      deadline:     fd.get('deadline'),
      description:  fd.get('description').trim(),
      eligibility:  fd.get('eligibility').trim(),
      website:      fd.get('website').trim(),
      contactEmail: fd.get('contactEmail').trim(),
      tags:         String(fd.get('tags') || '').split(',').map(t => t.trim()).filter(Boolean),
      attachments:  workingAttachments,
      facultyIds, programIds, degreeLevels,
      archived:     !!fd.get('archived')
    };

    try {
      const saved = id
        ? await updateGrant(id, payload)
        : await createGrant(payload);
      await logActivity(id ? 'edit' : 'create',
        `${id?'Updated':'Created'} grant "${saved.title}"`, saved.id);
      toast(id ? 'Grant updated' : 'Grant created', 'success');
      closeForm();
      // Realtime will refresh state.grants but trigger an immediate re-render too.
      render();
    } catch (err) {
      toast(err.message || 'Save failed', 'error');
    }
  });
}
