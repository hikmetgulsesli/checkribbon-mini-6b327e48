/**
 * CheckRibbon Mini – application shell and first-usable workflow
 * Renders navigation, the active surface, a compact settings panel,
 * a progress meter, and exposes the window.app test contract.
 */
(function () {
  'use strict';

  var SEED_URL = 'assets/data/checkribbon-mini.json';

  // ------------------------------------------------------------------
  // DOM refs
  // ------------------------------------------------------------------
  var root;
  var stage;
  var settingsPanel;
  var statusBar;

  // ------------------------------------------------------------------
  // Utility helpers
  // ------------------------------------------------------------------
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === 'textContent') {
          node.textContent = attrs[key];
        } else if (key === 'className') {
          node.className = attrs[key];
        } else if (key.startsWith('data-')) {
          node.setAttribute(key, attrs[key]);
        } else {
          node[key] = attrs[key];
        }
      });
    }
    (children || []).forEach(function (child) {
      if (child === null || child === undefined) return;
      if (typeof child === 'string' || typeof child === 'number') {
        node.appendChild(document.createTextNode(String(child)));
      } else {
        node.appendChild(child);
      }
    });
    return node;
  }

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return isNaN(d.getTime()) ? '' : d.toLocaleString();
  }

  // ------------------------------------------------------------------
  // Render helpers
  // ------------------------------------------------------------------
  function renderNav() {
    var state = window.CRState.get();
    var surfaces = [
      { id: 'operations', label: 'Operations' },
      { id: 'editor', label: 'Editor' },
      { id: 'insights', label: 'Insights' },
      { id: 'settings', label: 'Settings' }
    ];
    var nav = el('nav', { className: 'app-nav', 'aria-label': 'Surfaces' });
    surfaces.forEach(function (s) {
      var btn = el('button', {
        type: 'button',
        className: 'nav-btn' + (state.activeSurface === s.id ? ' is-active' : ''),
        'data-action-id': 'nav-' + s.id,
        'data-surface': s.id,
        textContent: s.label
      });
      btn.addEventListener('click', function () {
        window.CRState.selectSurface(s.id);
        render();
      });
      nav.appendChild(btn);
    });
    return nav;
  }

  function renderProgress() {
    var counts = window.CRState.counts();
    return el('div', { className: 'progress-block' }, [
      el('div', { className: 'progress-label' }, [
        'Progress: ',
        el('strong', { textContent: counts.completed + ' / ' + counts.total })
      ]),
      el('div', { className: 'progress-track', role: 'progressbar', 'aria-valuenow': counts.progress, 'aria-valuemin': 0, 'aria-valuemax': 100 }, [
        el('div', { className: 'progress-fill', style: 'width:' + counts.progress + '%' })
      ])
    ]);
  }

  function renderStatusChip(record) {
    var statusClass = 'status-' + (record.completed ? 'complete' : (record.status || 'active'));
    return el('span', { className: 'status-chip ' + statusClass, textContent: record.completed ? 'Complete' : (record.status || 'Active') });
  }

  function renderOperations() {
    var state = window.CRState.get();
    var counts = window.CRState.counts();

    var header = el('header', { className: 'surface-header' }, [
      el('h2', { textContent: 'Record Operations' }),
      el('button', { type: 'button', className: 'btn btn-primary', 'data-action-id': 'create-record', textContent: 'Create Record' })
    ]);

    var search = el('input', {
      type: 'text',
      className: 'input',
      placeholder: 'Search records, IDs...',
      'data-action-id': 'search-records',
      value: state.searchQuery || ''
    });
    search.addEventListener('input', function () {
      state.searchQuery = search.value;
      render();
    });

    var list = el('ul', { className: 'record-list' });
    var query = (state.searchQuery || '').toLowerCase();
    var filtered = state.records.filter(function (r) {
      return !query || r.name.toLowerCase().indexOf(query) !== -1 || r.id.toLowerCase().indexOf(query) !== -1;
    });

    if (filtered.length === 0) {
      list.appendChild(el('li', { className: 'record-empty', textContent: 'No records match your search.' }));
    } else {
      filtered.forEach(function (r) {
        var isSelected = state.selectedRecordId === r.id;
        var row = el('li', {
          className: 'record-row' + (isSelected ? ' is-selected' : '') + (r.completed ? ' is-complete' : ''),
          'data-action-id': 'select-record-' + r.id
        }, [
          el('input', { type: 'checkbox', className: 'record-check', checked: r.completed, 'data-action-id': 'toggle-record-' + r.id }),
          el('div', { className: 'record-meta' }, [
            el('span', { className: 'record-id', textContent: r.id }),
            el('span', { className: 'record-name', textContent: r.name })
          ]),
          renderStatusChip(r),
          el('button', { type: 'button', className: 'btn btn-ghost btn-icon', 'data-action-id': 'delete-record-' + r.id, textContent: 'delete' })
        ]);
        row.addEventListener('click', function (e) {
          if (e.target.tagName === 'INPUT' || e.target.closest('button')) return;
          window.CRState.selectRecord(r.id);
          render();
        });
        row.querySelector('input[type="checkbox"]').addEventListener('change', function () {
          window.CRState.toggleRecord(r.id);
          render();
        });
        row.querySelector('button').addEventListener('click', function () {
          window.CRState.deleteRecord(r.id);
          render();
        });
        list.appendChild(row);
      });
    }

    var selectedDetail;
    var selected = state.records.find(function (r) { return r.id === state.selectedRecordId; });
    if (selected) {
      selectedDetail = el('div', { className: 'selected-detail' }, [
        el('h3', { textContent: 'Selected item' }),
        el('div', { className: 'detail-row' }, [
          el('strong', { textContent: selected.id }),
          renderStatusChip(selected)
        ]),
        el('p', { textContent: selected.name })
      ]);
    } else {
      selectedDetail = el('div', { className: 'selected-detail is-empty', textContent: 'No item selected.' });
    }

    header.querySelector('[data-action-id="create-record"]').addEventListener('click', function () {
      var name = window.prompt('New record name:');
      if (name !== null) {
        window.CRState.addRecord(name);
        render();
      }
    });

    return el('section', { className: 'surface operations-surface' }, [
      header,
      el('div', { className: 'search-row' }, [search]),
      renderProgress(),
      list,
      selectedDetail
    ]);
  }

  function renderEditor() {
    var state = window.CRState.get();
    var selected = state.records.find(function (r) { return r.id === state.selectedRecordId; });

    var title = el('h2', { textContent: 'Record Editor' });

    if (!selected) {
      return el('section', { className: 'surface editor-surface' }, [
        title,
        el('p', { className: 'empty-state', textContent: 'Select a record from Operations to edit it.' })
      ]);
    }

    var nameInput = el('input', { type: 'text', className: 'input', value: selected.name, 'data-action-id': 'editor-name' });
    var statusSelect = el('select', { className: 'input', 'data-action-id': 'editor-status' }, [
      el('option', { value: 'pending', textContent: 'Pending' }),
      el('option', { value: 'active', textContent: 'Active' }),
      el('option', { value: 'complete', textContent: 'Complete' })
    ]);
    statusSelect.value = selected.status || 'active';
    var completedCheck = el('input', { type: 'checkbox', checked: selected.completed, 'data-action-id': 'editor-completed' });
    var notesInput = el('input', { type: 'text', className: 'input', value: selected.notes || '', placeholder: 'Add notes (optional)...', 'data-action-id': 'editor-notes' });
    var dueInput = el('input', { type: 'date', className: 'input', value: selected.dueDate || '', 'data-action-id': 'editor-due' });

    var form = el('form', { className: 'editor-form' }, [
      el('label', { className: 'field' }, [
        el('span', { textContent: 'Record name' }),
        nameInput
      ]),
      el('label', { className: 'field' }, [
        el('span', { textContent: 'Status' }),
        statusSelect
      ]),
      el('label', { className: 'field field-inline' }, [
        completedCheck,
        el('span', { textContent: 'Completed' })
      ]),
      el('label', { className: 'field' }, [
        el('span', { textContent: 'Notes' }),
        notesInput
      ]),
      el('label', { className: 'field' }, [
        el('span', { textContent: 'Due date' }),
        dueInput
      ]),
      el('div', { className: 'form-actions' }, [
        el('button', { type: 'button', className: 'btn btn-secondary', 'data-action-id': 'cancel-edit', textContent: 'Cancel' }),
        el('button', { type: 'submit', className: 'btn btn-primary', 'data-action-id': 'save-record', textContent: 'Save Record' })
      ])
    ]);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      selected.name = nameInput.value.trim() || selected.name;
      selected.status = statusSelect.value;
      selected.completed = completedCheck.checked;
      selected.notes = notesInput.value;
      selected.dueDate = dueInput.value;
      selected.updatedAt = new Date().toISOString();
      window.CRState.patch({ records: state.records, lastError: null });
      render();
    });

    form.querySelector('[data-action-id="cancel-edit"]').addEventListener('click', function () {
      window.CRState.selectSurface('operations');
      render();
    });

    return el('section', { className: 'surface editor-surface' }, [title, form]);
  }

  function renderInsights() {
    var state = window.CRState.get();
    var counts = window.CRState.counts();

    var metrics = el('div', { className: 'metrics-grid' }, [
      el('div', { className: 'metric-card' }, [
        el('span', { className: 'metric-value', textContent: counts.total }),
        el('span', { className: 'metric-label', textContent: 'Total records' })
      ]),
      el('div', { className: 'metric-card' }, [
        el('span', { className: 'metric-value', textContent: counts.completed }),
        el('span', { className: 'metric-label', textContent: 'Completed' })
      ]),
      el('div', { className: 'metric-card' }, [
        el('span', { className: 'metric-value', textContent: counts.active }),
        el('span', { className: 'metric-label', textContent: 'Remaining' })
      ]),
      el('div', { className: 'metric-card' }, [
        el('span', { className: 'metric-value', textContent: counts.progress + '%' }),
        el('span', { className: 'metric-label', textContent: 'Progress' })
      ])
    ]);

    var actions = el('div', { className: 'surface-actions' }, [
      el('button', { type: 'button', className: 'btn btn-secondary', 'data-action-id': 'export-summary', textContent: 'Export Summary' })
    ]);
    actions.querySelector('[data-action-id="export-summary"]').addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(window.CRState.get(), null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'checkribbon-summary.json';
      a.click();
      URL.revokeObjectURL(url);
    });

    return el('section', { className: 'surface insights-surface' }, [
      el('h2', { textContent: 'Insights' }),
      metrics,
      renderProgress(),
      actions
    ]);
  }

  function renderSettings() {
    var state = window.CRState.get();
    var prefs = state.preferences;

    var autoSave = el('input', { type: 'checkbox', checked: prefs.autoSave, 'data-action-id': 'pref-auto-save' });
    var denseMode = el('input', { type: 'checkbox', checked: prefs.denseMode, 'data-action-id': 'pref-dense-mode' });
    var notifications = el('input', { type: 'checkbox', checked: prefs.notifications, 'data-action-id': 'pref-notifications' });
    var defaultView = el('select', { className: 'input', 'data-action-id': 'pref-default-view' }, [
      el('option', { value: 'list', textContent: 'List' }),
      el('option', { value: 'board', textContent: 'Board' }),
      el('option', { value: 'table', textContent: 'Table' })
    ]);
    defaultView.value = prefs.defaultView || 'list';

    var form = el('form', { className: 'settings-form' }, [
      el('label', { className: 'field field-inline' }, [autoSave, el('span', { textContent: 'Auto-save to localStorage' })]),
      el('label', { className: 'field field-inline' }, [denseMode, el('span', { textContent: 'Dense mode' })]),
      el('label', { className: 'field field-inline' }, [notifications, el('span', { textContent: 'Enable notifications' })]),
      el('label', { className: 'field' }, [
        el('span', { textContent: 'Default view' }),
        defaultView
      ]),
      el('div', { className: 'form-actions' }, [
        el('button', { type: 'button', className: 'btn btn-secondary', 'data-action-id': 'reset-preferences', textContent: 'Reset to Defaults' }),
        el('button', { type: 'submit', className: 'btn btn-primary', 'data-action-id': 'save-preferences', textContent: 'Save Preferences' })
      ])
    ]);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      window.CRState.updatePreferences({
        autoSave: autoSave.checked,
        denseMode: denseMode.checked,
        notifications: notifications.checked,
        defaultView: defaultView.value
      });
      render();
    });

    form.querySelector('[data-action-id="reset-preferences"]').addEventListener('click', function () {
      window.CRState.resetPreferences();
      render();
    });

    return el('section', { className: 'surface settings-surface' }, [
      el('h2', { textContent: 'Settings and Preferences' }),
      form
    ]);
  }

  function renderSettingsPanel() {
    var state = window.CRState.get();
    var prefs = state.preferences;
    var counts = window.CRState.counts();

    var autoSave = el('input', { type: 'checkbox', checked: prefs.autoSave, 'data-action-id': 'panel-auto-save' });
    autoSave.addEventListener('change', function () {
      window.CRState.updatePreferences({ autoSave: autoSave.checked });
      render();
    });

    var denseMode = el('input', { type: 'checkbox', checked: prefs.denseMode, 'data-action-id': 'panel-dense-mode' });
    denseMode.addEventListener('change', function () {
      window.CRState.updatePreferences({ denseMode: denseMode.checked });
      render();
    });

    var defaultView = el('select', { className: 'input input-sm', 'data-action-id': 'panel-default-view' }, [
      el('option', { value: 'list', textContent: 'List' }),
      el('option', { value: 'board', textContent: 'Board' }),
      el('option', { value: 'table', textContent: 'Table' })
    ]);
    defaultView.value = prefs.defaultView || 'list';
    defaultView.addEventListener('change', function () {
      window.CRState.updatePreferences({ defaultView: defaultView.value });
      render();
    });

    var panel = el('div', { className: 'settings-panel-inner' }, [
      el('h3', { textContent: 'Settings' }),
      el('label', { className: 'field field-inline field-sm' }, [autoSave, el('span', { textContent: 'Auto-save' })]),
      el('label', { className: 'field field-inline field-sm' }, [denseMode, el('span', { textContent: 'Dense' })]),
      el('label', { className: 'field field-sm' }, [
        el('span', { textContent: 'Default view' }),
        defaultView
      ]),
      el('div', { className: 'panel-counts' }, [
        el('span', { textContent: counts.completed + '/' + counts.total + ' done' })
      ])
    ]);

    return panel;
  }

  function renderStatusBar() {
    var state = window.CRState.get();
    var counts = window.CRState.counts();
    var items = [
      'Surface: ' + state.activeSurface,
      'Selected: ' + (state.selectedRecordId || 'none'),
      'Storage: ' + state.storageStatus,
      'Counts: ' + counts.total + ' total / ' + counts.completed + ' completed / ' + counts.active + ' active'
    ];
    if (state.lastError) {
      items.push('Error: ' + state.lastError);
    }
    return el('div', { className: 'status-bar-inner' + (state.lastError ? ' has-error' : '') }, items.map(function (text) {
      return el('span', { className: 'status-item', textContent: text });
    }));
  }

  function renderSurface() {
    var state = window.CRState.get();
    switch (state.activeSurface) {
      case 'editor': return renderEditor();
      case 'insights': return renderInsights();
      case 'settings': return renderSettings();
      case 'operations':
      default: return renderOperations();
    }
  }

  function render() {
    if (!stage || !settingsPanel || !statusBar) return;

    stage.innerHTML = '';
    settingsPanel.innerHTML = '';
    statusBar.innerHTML = '';

    stage.appendChild(renderSurface());
    settingsPanel.appendChild(renderSettingsPanel());
    statusBar.appendChild(renderStatusBar());

    // Update active nav state.
    var nav = root.querySelector('.app-nav');
    if (nav) {
      var state = window.CRState.get();
      Array.from(nav.querySelectorAll('.nav-btn')).forEach(function (btn) {
        btn.classList.toggle('is-active', btn.dataset.surface === state.activeSurface);
      });
    }

    // Apply density preference.
    var prefs = window.CRState.get().preferences;
    root.classList.toggle('is-dense', !!prefs.denseMode);
  }

  function buildShell() {
    root.innerHTML = '';
    root.appendChild(el('header', { className: 'app-header' }, [
      el('h1', { textContent: 'CheckRibbon Mini' }),
      renderNav()
    ]));

    var body = el('div', { className: 'app-body' }, [
      el('section', { className: 'app-stage', 'aria-live': 'polite' }),
      el('aside', { className: 'settings-panel', 'data-region': 'settings-panel' })
    ]);
    root.appendChild(body);

    statusBar = el('footer', { className: 'app-status', 'data-region': 'status-bar' });
    root.appendChild(statusBar);

    stage = body.querySelector('.app-stage');
    settingsPanel = body.querySelector('.settings-panel');
  }

  function init() {
    root = document.querySelector('[data-setfarm-root]');
    if (!root) {
      root = document.body;
    }

    fetch(SEED_URL)
      .then(function (res) { return res.json(); })
      .then(function (seed) {
        window.CRState.init(seed);
        buildShell();
        render();
        window.setfarmStaticReady = true;
      })
      .catch(function (err) {
        // Seed fetch failed (e.g. file:// origin). Fall back to empty seed.
        window.CRState.init({ records: [], preferences: {} });
        window.CRState.patch({ lastError: 'Failed to load seed data: ' + err.message });
        buildShell();
        render();
        window.setfarmStaticReady = true;
      });
  }

  // ------------------------------------------------------------------
  // Public test contract
  // ------------------------------------------------------------------
  window.app = {
    state: function () { return window.CRState.get(); },
    activeSurface: function () { return window.CRState.get().activeSurface; },
    activePanel: function () { return window.CRState.get().activePanel; },
    selectedRecord: function () {
      var state = window.CRState.get();
      return state.records.find(function (r) { return r.id === state.selectedRecordId; }) || null;
    },
    counts: function () { return window.CRState.counts(); },
    storageStatus: function () { return window.CRState.get().storageStatus; },
    lastError: function () { return window.CRState.get().lastError; },
    selectSurface: function (surface) { window.CRState.selectSurface(surface); render(); },
    selectRecord: function (id) { window.CRState.selectRecord(id); render(); },
    toggleRecord: function (id) { window.CRState.toggleRecord(id); render(); },
    addRecord: function (name) { var id = window.CRState.addRecord(name); render(); return id; },
    deleteRecord: function (id) { window.CRState.deleteRecord(id); render(); },
    updatePreferences: function (prefs) { window.CRState.updatePreferences(prefs); render(); },
    resetPreferences: function () { window.CRState.resetPreferences(); render(); },
    clearStorage: function () { window.CRStorage.clear(); window.CRState.patch({ storageStatus: 'cleared' }); render(); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
