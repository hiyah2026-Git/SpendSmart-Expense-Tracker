const STORE_KEY = 'spendsmart.transactions.v1';
const CATEGORIES = ['Food', 'Transport', 'Education', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Salary', 'Freelance', 'Other'];
const PALETTE = ['#34785d', '#d6a944', '#6c9fa0', '#cc705e', '#84a86d', '#8f7caa', '#d18b62', '#5c879a', '#a6b86e', '#c27e91'];
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
const icon = (name, size = 18) => {
  const paths = {
    mark: '<path d="M4 14c3-8 9-10 16-9-1 8-5 14-13 14-2 0-3-1-3-3 0-5 5-9 11-10"/><path d="M4 20c2-5 5-8 10-11"/>',
    home: '<path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-7h6v7"/>',
    chart: '<path d="M4 19V5m0 14h17"/><path d="m7 15 4-4 3 2 6-7"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    income: '<path d="M12 19V5m-6 6 6-6 6 6"/><path d="M4 20h16"/>',
    expense: '<path d="M12 5v14m6-6-6 6-6-6"/><path d="M4 4h16"/>',
    balance: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4 4"/>',
    wallet: '<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 8h18m-5 5h2"/>',
    edit: '<path d="m4 16-.8 4.8L8 20l11-11-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/>',
    trash: '<path d="M4 7h16m-10 4v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5"/><path d="M4 19v2h16v-2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    sliders: '<path d="M4 7h9m4 0h3M4 17h3m4 0h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    book: '<path d="M4 4h14a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2z"/><path d="M4 16h16"/>'
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.wallet}</svg>`;
};

const dateString = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const shiftDate = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return dateString(d); };
const seedData = () => [
  { id: 'demo_8f21a1', amount: 84500, type: 'income', category: 'Salary', date: shiftDate(-1), description: 'Monthly salary', demo: true },
  { id: 'demo_73bc42', amount: 1250, type: 'expense', category: 'Food', date: shiftDate(0), description: 'Lunch at Greenhouse', demo: true },
  { id: 'demo_1c9d33', amount: 620, type: 'expense', category: 'Transport', date: shiftDate(-1), description: 'Metro card top-up', demo: true },
  { id: 'demo_f06e14', amount: 3400, type: 'expense', category: 'Bills', date: shiftDate(-3), description: 'Internet & mobile', demo: true },
  { id: 'demo_baf855', amount: 7200, type: 'expense', category: 'Education', date: shiftDate(-5), description: 'Design course', demo: true },
  { id: 'demo_a13076', amount: 2800, type: 'expense', category: 'Shopping', date: shiftDate(-7), description: 'Everyday essentials', demo: true },
  { id: 'demo_d918c2', amount: 18000, type: 'income', category: 'Freelance', date: shiftDate(-9), description: 'Brand identity project', demo: true },
  { id: 'demo_71da60', amount: 950, type: 'expense', category: 'Entertainment', date: shiftDate(-11), description: 'Sunday matinee', demo: true },
  { id: 'demo_5bc481', amount: 1450, type: 'expense', category: 'Healthcare', date: shiftDate(-14), description: 'Pharmacy', demo: true },
  { id: 'demo_218cf0', amount: 1800, type: 'expense', category: 'Food', date: shiftDate(-19), description: 'Groceries', demo: true },
  { id: 'demo_95ab01', amount: 460, type: 'expense', category: 'Transport', date: shiftDate(-24), description: 'Auto ride', demo: true }
];

function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw === null) {
      const initial = seedData();
      localStorage.setItem(STORE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Saved data is not a list.');
    return parsed.filter((t) => t && typeof t.id === 'string' && Number.isFinite(t.amount) && t.amount > 0 &&
      ['income', 'expense'].includes(t.type) && CATEGORIES.includes(t.category) &&
      typeof t.date === 'string' && !Number.isNaN(new Date(`${t.date}T00:00:00`).getTime()) &&
      typeof t.description === 'string');
  } catch (error) {
    console.error('SpendSmart could not read saved data', error);
    return seedData();
  }
}

let transactions = loadTransactions();
let activeType = 'expense';
let editingId = null;
let deletingId = null;
let charts = { donut: null, bar: null };
let viewPage = 1;
let searchValue = '';
let categoryValue = '';
let monthValue = '';
let dayValue = '';
let reportingValue = 'this-month';
const PAGE_SIZE = 7;
const root = document.querySelector('#root');

function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(transactions)); return true; }
  catch (error) { console.error('SpendSmart could not save changes', error); return false; }
}
function announce(message, isError = false) {
  const region = document.querySelector('.toast-region');
  if (!region) return;
  const toast = document.createElement('div');
  toast.className = `toast${isError ? ' error' : ''}`;
  toast.setAttribute('role', isError ? 'alert' : 'status');
  toast.textContent = message;
  region.append(toast);
  setTimeout(() => toast.remove(), 3200);
}
function monthName(date) { return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }); }
function formatDate(date) { return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
function currentMonth() { return dateString(new Date()).slice(0, 7); }
function filteredTransactions() {
  const q = searchValue.trim().toLowerCase();
  const category = categoryValue;
  const month = monthValue;
  return [...transactions].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).filter((t) =>
    (!q || `${t.description} ${t.category} ${t.type}`.toLowerCase().includes(q)) &&
    (!category || t.category === category) && (!month || t.date.startsWith(month)) &&
    (!dayValue || t.date === dayValue));
}
function periodTransactions() {
  const period = reportingValue;
  const now = new Date();
  return transactions.filter((t) => {
    const d = new Date(`${t.date}T00:00:00`);
    if (period === 'this-month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    if (period === 'last-month') { const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1); return d.getFullYear() === prev.getFullYear() && d.getMonth() === prev.getMonth(); }
    if (period === 'this-year') return d.getFullYear() === now.getFullYear();
    return true;
  });
}
function sum(items, type) { return items.reduce((acc, t) => acc + (t.type === type ? t.amount : 0), 0); }
function categoryEmoji(category) {
  return ({ Food: 'F', Transport: 'T', Education: 'E', Shopping: 'S', Bills: 'B', Entertainment: 'E', Healthcare: 'H', Salary: 'S', Freelance: 'F', Other: 'O' })[category] || '•';
}
function categoryOptions(selected = '') {
  const filtered = CATEGORIES.filter((category) => activeType === 'income' ? ['Salary', 'Freelance', 'Other'].includes(category) : !['Salary', 'Freelance'].includes(category));
  const options = filtered.map((c) => `<option value="${c}" ${c === selected ? 'selected' : ''}>${c}</option>`).join('');
  return options + (selected && !filtered.includes(selected) ? `<option value="${selected}" selected>${selected}</option>` : '');
}
function render() {
  const income = sum(transactions, 'income');
  const expenses = sum(transactions, 'expense');
  const monthOut = sum(transactions.filter((t) => t.date.startsWith(currentMonth())), 'expense');
  const recent = filteredTransactions();
  const pageCount = Math.max(1, Math.ceil(recent.length / PAGE_SIZE));
  viewPage = Math.min(viewPage, pageCount);
  const pageRows = recent.slice((viewPage - 1) * PAGE_SIZE, viewPage * PAGE_SIZE);
  const chartItems = periodTransactions();
  const isEmpty = transactions.length === 0;
  root.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar" aria-label="Main navigation">
        <div class="brand"><div class="brand-mark">${icon('mark',21)}</div><div>Spend<span>Smart</span></div></div>
        <div class="nav-label">Workspace</div>
        <nav class="nav-list">
          <button class="nav-item active" data-nav="dashboard">${icon('home')}Overview</button>
          <button class="nav-item" data-nav="transactions">${icon('list')}Transactions</button>
          <button class="nav-item" data-nav="insights">${icon('chart')}Spending insights</button>
        </nav>
        <div class="side-bottom">
          <div class="side-note"><div class="note-spark">${icon('balance',19)}</div><strong>A little clarity, daily.</strong><p>Your money story stays right here, safely on this device.</p></div>
          <div class="nav-label">Your space</div>
          <button class="nav-item" id="export-btn">${icon('download')}Export transactions</button>
          <button class="nav-item" id="reset-btn">${icon('sliders')}Reset demo data</button>
          <div class="profile"><div class="avatar" aria-hidden="true">YS</div><div><strong>Your finances</strong><small>Personal workspace</small></div></div>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <div><p class="eyebrow">A clearer view of your money</p><h1>Good day, you're in control.</h1></div>
          <div class="top-actions">
            <select class="period-select" id="reporting-period" aria-label="Chart reporting period">
              <option value="this-month">This month</option><option value="last-month">Last month</option><option value="this-year">This year</option><option value="all-time">All time</option>
            </select>
            <button class="primary-btn" id="add-btn">${icon('plus')}<span>Add transaction</span></button>
          </div>
        </header>
        <section class="summary-grid" aria-label="Account summary">
          <article class="summary-card balance"><div class="summary-top"><span>Current balance</span><span class="summary-icon">${icon('balance')}</span></div><div class="amount">${currency.format(income - expenses)}</div><div class="summary-foot">Income minus spending</div></article>
          <article class="summary-card"><div class="summary-top"><span>Total income</span><span class="summary-icon">${icon('income')}</span></div><div class="amount">${currency.format(income)}</div><div class="summary-foot">Across all transactions</div></article>
          <article class="summary-card"><div class="summary-top"><span>Total expenses</span><span class="summary-icon">${icon('expense')}</span></div><div class="amount">${currency.format(expenses)}</div><div class="summary-foot">Across all transactions</div></article>
          <article class="summary-card"><div class="summary-top"><span>This month's spending</span><span class="summary-icon">${icon('calendar')}</span></div><div class="amount">${currency.format(monthOut)}</div><div class="summary-foot">${monthName(`${currentMonth()}-01`)}</div></article>
        </section>
        <section class="dashboard-grid" aria-label="Spending charts">
          <article class="panel">
            <div class="panel-head"><div><h2>Your spending rhythm</h2><p>Expenses by month, so patterns are easy to spot.</p></div><span class="chart-period" id="bar-period-label">This month</span></div>
            <div class="chart-wrap"><canvas id="monthly-chart" role="img" aria-label="Monthly expense bar chart"></canvas></div>
          </article>
          <article class="panel category-panel">
            <div class="panel-head"><div><h2>Where it goes</h2><p>Expenses by category for this period.</p></div></div>
            <div class="category-body"><div class="donut-box"><canvas id="category-chart" role="img" aria-label="Expense categories doughnut chart"></canvas><div class="donut-center"><strong id="donut-total">₹0</strong><span>spent in period</span></div></div><div class="legend" id="category-legend"></div></div>
          </article>
        </section>
        <section class="panel transactions" id="transaction-section" aria-label="Transactions">
          <div class="transactions-header"><div><h2>Recent transactions</h2><p>Your activity, newest first.</p></div>
            <div class="table-tools"><label class="searchbox">${icon('search')}<span class="sr-only">Search transactions</span><input id="search" type="search" placeholder="Search transactions…" autocomplete="off"></label>
              <select class="filter-select" id="category-filter" aria-label="Filter by category"><option value="">All categories</option>${CATEGORIES.map((c) => `<option value="${c}" ${categoryValue === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
              <input class="date-filter" id="month-filter" type="month" aria-label="Filter by month" value="${monthValue}">
              <input class="date-filter" id="day-filter" type="date" aria-label="Filter by exact date" value="${dayValue}">
              <button class="icon-btn" id="export-small" aria-label="Export transactions as CSV" title="Export CSV">${icon('download')}</button>
            </div>
          </div>
          ${pageRows.length ? `<div class="table-scroll"><table><thead><tr><th>Transaction</th><th>Category</th><th>Date</th><th class="hide-mobile">Type</th><th style="text-align:right">Amount</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>${pageRows.map((t) => `<tr>
            <td><div class="transaction-name"><div class="category-symbol">${categoryEmoji(t.category)}</div><div><strong>${escapeHtml(t.description)}</strong><small>${t.demo ? 'Demo transaction' : 'Personal transaction'}</small></div></div></td>
            <td><span class="tag">${escapeHtml(t.category)}</span></td><td>${formatDate(t.date)}</td><td class="hide-mobile">${t.type === 'income' ? 'Income' : 'Expense'}</td>
            <td class="amount-cell ${t.type}">${t.type === 'income' ? '+' : '−'}${currency.format(t.amount)}</td>
            <td><div class="row-actions"><button class="icon-btn edit-btn" data-id="${escapeHtml(t.id)}" aria-label="Edit ${escapeHtml(t.description)}">${icon('edit')}</button><button class="icon-btn delete-btn" data-id="${escapeHtml(t.id)}" aria-label="Delete ${escapeHtml(t.description)}">${icon('trash')}</button></div></td>
          </tr>`).join('')}</tbody></table></div>
          <div class="pagination-info"><span>Showing ${Math.min((viewPage - 1) * PAGE_SIZE + 1, recent.length)}–${Math.min(viewPage * PAGE_SIZE, recent.length)} of ${recent.length} transactions</span><div class="pagination-buttons"><button id="prev-page" aria-label="Previous page" ${viewPage <= 1 ? 'disabled' : ''}>‹</button><button id="next-page" aria-label="Next page" ${viewPage >= pageCount ? 'disabled' : ''}>›</button></div></div>`
          : `<div class="empty"><div class="empty-art">${icon(isEmpty ? 'wallet' : 'search',24)}</div><h3>${isEmpty ? 'A fresh start, on your terms.' : 'Nothing here just yet.'}</h3><p>${isEmpty ? 'Add your first transaction or restore the sample activity to see your dashboard take shape.' : 'Try another search or filter, or add a transaction to this view.'}</p>${isEmpty ? `<button class="primary-btn" id="empty-add">${icon('plus')}Add a transaction</button><button class="secondary-btn" id="empty-reset" style="margin-left:7px">Restore demo data</button>` : ''}</div>`}
        </section>
      </main>
    </div>
    <nav class="mobile-nav" aria-label="Mobile navigation"><button class="active" data-nav="dashboard">${icon('home')}Overview</button><button data-nav="transactions">${icon('list')}Activity</button><button data-nav="insights">${icon('chart')}Insights</button></nav>
    <div class="modal-backdrop" id="transaction-modal" role="presentation"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
      <div class="modal-header"><div><h2 id="form-title">Add transaction</h2><p>Small details make the picture clearer.</p></div><button class="close-btn" id="close-modal" aria-label="Close dialog">${icon('close',16)}</button></div>
      <form id="transaction-form" novalidate>
        <div class="form-grid">
          <div class="field full"><label>Transaction type</label><div class="type-switch" role="group" aria-label="Transaction type"><button type="button" data-type="expense" class="selected">Expense</button><button type="button" data-type="income">Income</button></div></div>
          <div class="field"><label for="amount">Amount (INR)</label><input id="amount" name="amount" type="number" min="0.01" step="0.01" inputmode="decimal" placeholder="e.g. 1,250" required></div>
          <div class="field"><label for="category">Category</label><select id="category" name="category" required></select></div>
          <div class="field"><label for="transaction-date">Date</label><input id="transaction-date" name="date" type="date" required></div>
          <div class="field"><label for="description">Description</label><input id="description" name="description" maxlength="80" placeholder="What was it for?" required></div>
        </div>
        <p class="form-error" id="form-error" role="alert"></p>
        <div class="modal-actions"><button type="button" class="secondary-btn" id="cancel-modal">Cancel</button><button type="submit" class="primary-btn" id="submit-transaction">Save transaction</button></div>
      </form>
    </section></div>
    <div class="modal-backdrop" id="delete-modal" role="presentation"><section class="modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title"><div class="modal-header"><div><h2 id="delete-title">Delete this transaction?</h2><p>This change can't be undone.</p></div><button class="close-btn" id="close-delete" aria-label="Close dialog">${icon('close',16)}</button></div><div class="modal-actions"><button class="secondary-btn" id="cancel-delete">Keep transaction</button><button class="primary-btn danger-btn" id="confirm-delete">Delete transaction</button></div></section></div>
    <div class="toast-region" aria-live="polite" aria-atomic="true"></div>`;
  bindListeners();
  document.querySelector('#search').value = searchValue;
  document.querySelector('#reporting-period').value = reportingValue;
  drawCharts(chartItems);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}
function drawCharts(items) {
  const donutCanvas = document.querySelector('#category-chart');
  const barCanvas = document.querySelector('#monthly-chart');
  if (!window.Chart || !donutCanvas || !barCanvas) return;
  charts.donut?.destroy();
  charts.bar?.destroy();
  const expenses = items.filter((t) => t.type === 'expense');
  const categories = CATEGORIES.map((category) => ({ category, amount: expenses.filter((t) => t.category === category).reduce((sum, t) => sum + t.amount, 0) })).filter((c) => c.amount > 0).sort((a, b) => b.amount - a.amount);
  const total = categories.reduce((s, c) => s + c.amount, 0);
  document.querySelector('#donut-total').textContent = currency.format(total);
  document.querySelector('#category-legend').innerHTML = categories.length
    ? categories.slice(0, 6).map((c) => `<div class="legend-row"><span class="legend-dot" style="background:${PALETTE[CATEGORIES.indexOf(c.category)]}"></span><span>${c.category}</span><b>${currency.format(c.amount)}</b></div>`).join('')
    : '<div class="legend-row">No expenses in this period</div>';
  charts.donut = new Chart(donutCanvas, {
    type: 'doughnut',
    data: { labels: categories.map((c) => c.category), datasets: [{ data: categories.length ? categories.map((c) => c.amount) : [1], backgroundColor: categories.length ? categories.map((c) => PALETTE[CATEGORIES.indexOf(c.category)]) : ['#e9eee7'], borderWidth: 0, hoverOffset: 5 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: categories.length > 0, callbacks: { label: (ctx) => ` ${ctx.label}: ${currency.format(ctx.raw)}` } } } }
  });
  const period = reportingValue;
  const now = new Date();
  let months = [];
  if (period === 'this-month') months = [new Date(now.getFullYear(), now.getMonth(), 1)];
  else if (period === 'last-month') months = [new Date(now.getFullYear(), now.getMonth() - 1, 1)];
  else if (period === 'this-year') months = Array.from({ length: now.getMonth() + 1 }, (_, i) => new Date(now.getFullYear(), i, 1));
  else {
    const dated = items.filter((t) => t.type === 'expense').map((t) => new Date(`${t.date}T00:00:00`));
    const min = dated.length ? new Date(Math.min(...dated)) : new Date(now.getFullYear(), now.getMonth(), 1);
    const max = dated.length ? new Date(Math.max(...dated)) : min;
    const begin = new Date(Math.max(min.getTime(), new Date(max.getFullYear(), max.getMonth() - 11, 1).getTime()));
    for (let d = new Date(begin.getFullYear(), begin.getMonth(), 1); d <= max; d.setMonth(d.getMonth() + 1)) months.push(new Date(d));
  }
  const labels = months.map((d) => d.toLocaleDateString('en-IN', { month: 'short', ...(period === 'all-time' || period === 'this-year' ? { year: '2-digit' } : {}) }));
  const values = months.map((m) => expenses.filter((t) => { const d = new Date(`${t.date}T00:00:00`); return d.getFullYear() === m.getFullYear() && d.getMonth() === m.getMonth(); }).reduce((s, t) => s + t.amount, 0));
  const periodNames = { 'this-month': 'This month', 'last-month': 'Last month', 'this-year': 'This year', 'all-time': 'Recent 12 months' };
  document.querySelector('#bar-period-label').textContent = periodNames[period];
  charts.bar = new Chart(barCanvas, {
    type: 'bar', data: { labels, datasets: [{ data: values, backgroundColor: values.map((_, i) => i === values.length - 1 ? '#34785d' : '#c8decf'), borderRadius: 5, borderSkipped: false, maxBarThickness: 36 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` ${currency.format(ctx.raw)}` } } },
      scales: { x: { grid: { display: false }, border: { display: false }, ticks: { color: '#909a92', font: { family: 'DM Sans', size: 10 }, maxRotation: 0 } }, y: { beginAtZero: true, grid: { color: '#edf0eb' }, border: { display: false }, ticks: { color: '#a0a9a1', font: { family: 'DM Sans', size: 9 }, maxTicksLimit: 4, callback: (value) => value >= 1000 ? `₹${(value / 1000).toFixed(0)}k` : `₹${value}` } } } }
  });
}
function openTransactionModal(transaction = null) {
  editingId = transaction?.id || null;
  activeType = transaction?.type || 'expense';
  const modal = document.querySelector('#transaction-modal');
  const form = document.querySelector('#transaction-form');
  form.reset();
  document.querySelector('#form-title').textContent = editingId ? 'Edit transaction' : 'Add transaction';
  document.querySelector('#submit-transaction').textContent = editingId ? 'Save changes' : 'Save transaction';
  document.querySelector('#form-error').textContent = '';
  document.querySelectorAll('.type-switch button').forEach((button) => button.classList.toggle('selected', button.dataset.type === activeType));
  document.querySelector('#category').innerHTML = categoryOptions(transaction?.category);
  document.querySelector('#amount').value = transaction?.amount ?? '';
  document.querySelector('#transaction-date').value = transaction?.date || dateString(new Date());
  document.querySelector('#description').value = transaction?.description || '';}