import { esc, parseDate, today, grantStatus } from '../helpers.js';
import { activeGrants } from '../filters.js';

export function calendarView(params) {
  const now = new Date();
  const year  = parseInt(params[0]) || now.getFullYear();
  const month = parseInt(params[1]) || now.getMonth() + 1; // 1-12
  const first = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startWeekday = first.getDay();

  const events = activeGrants().reduce((acc, g) => {
    const d = parseDate(g.deadline); if (!d) return acc;
    if (d.getFullYear() === year && d.getMonth() === month - 1) {
      const key = d.getDate();
      (acc[key] = acc[key] || []).push(g);
    }
    return acc;
  }, {});

  const monthName = first.toLocaleString('en-US', { month: 'long' });
  const prevMonth = month === 1 ? { y: year-1, m: 12 } : { y: year, m: month-1 };
  const nextMonth = month === 12 ? { y: year+1, m: 1 } : { y: year, m: month+1 };

  let cells = '';
  for (let i = 0; i < startWeekday; i++) cells += `<div class="cal-cell empty"></div>`;
  const t = today();
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = t.getFullYear() === year && t.getMonth() === month-1 && t.getDate() === day;
    const dayEvents = events[day] || [];
    cells += `
      <div class="cal-cell ${isToday?'today':''}">
        <div class="date-num">${day}</div>
        ${dayEvents.slice(0,3).map(g => {
          const s = grantStatus(g);
          const cls = s === 'Closing Soon' ? 'closing' : s === 'Closed' ? 'closed' : '';
          return `<span class="cal-event ${cls}" data-grant="${g.id}" title="${esc(g.title)}">${esc(g.title.slice(0, 22))}</span>`;
        }).join('')}
        ${dayEvents.length > 3 ? `<span class="text-[10px] text-slate-500 mt-1 block">+${dayEvents.length-3} more</span>` : ''}
      </div>`;
  }

  return `
    <div class="space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 class="text-2xl font-bold">Deadline Calendar</h1>
          <p class="text-sm text-slate-500">All grant deadlines for ${esc(monthName)} ${year}</p>
        </div>
        <div class="flex gap-1">
          <a class="btn btn-secondary" href="#calendar/${prevMonth.y}/${prevMonth.m}"><i data-lucide="chevron-left"></i></a>
          <a class="btn btn-secondary" href="#calendar/${now.getFullYear()}/${now.getMonth()+1}">Today</a>
          <a class="btn btn-secondary" href="#calendar/${nextMonth.y}/${nextMonth.m}"><i data-lucide="chevron-right"></i></a>
        </div>
      </div>
      <div class="card p-4">
        <div class="cal-grid mb-1 text-xs font-semibold text-slate-500">
          ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<div class="px-2 py-1">${d}</div>`).join('')}
        </div>
        <div class="cal-grid">${cells}</div>
      </div>
    </div>`;
}
