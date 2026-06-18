/**
 * CheckRibbon Mini – shared application state
 * Bootstrap/load active surface, selected item, storage status, last error,
 * active panel, and item counts. Persists to localStorage through CRStorage.
 */
(function (global) {
  'use strict';

  var STATE_VERSION = 1;

  function makeDefaultState(seed) {
    seed = seed || {};
    var records = Array.isArray(seed.records) ? seed.records : [];
    var firstActive = records.find(function (r) { return !r.completed; });
    var selectedId = firstActive ? firstActive.id : (records[0] && records[0].id) || null;

    return {
      version: STATE_VERSION,
      activeSurface: 'operations',
      activePanel: 'settings',
      selectedRecordId: selectedId,
      lastError: null,
      storageStatus: 'none',
      records: records,
      preferences: seed.preferences || {
        autoSave: true,
        denseMode: false,
        defaultView: 'list',
        notifications: true
      },
      activity: Array.isArray(seed.activity) ? seed.activity : []
    };
  }

  var state = null;

  function init(seedData) {
    var loaded = global.CRStorage.load();

    if (!loaded.ok && loaded.status === 'corrupted') {
      // Recover from corrupted storage by resetting to seed defaults.
      state = makeDefaultState(seedData);
      state.lastError = 'Persisted data was corrupted; loaded defaults. (' + loaded.error + ')';
      state.storageStatus = 'error';
      global.CRStorage.clear();
      return state;
    }

    if (loaded.ok && loaded.data && loaded.data.version === STATE_VERSION) {
      state = makeDefaultState(seedData);
      // Overlay persisted values, but keep system defaults for missing keys.
      Object.keys(loaded.data).forEach(function (key) {
        if (key !== 'version') {
          state[key] = loaded.data[key];
        }
      });
      state.lastError = null;
      state.storageStatus = loaded.status;
    } else {
      state = makeDefaultState(seedData);
      state.storageStatus = loaded.ok ? (loaded.status || 'none') : 'error';
      if (!loaded.ok) {
        state.lastError = loaded.error;
      }
    }

    // Ensure selected record still exists.
    if (state.selectedRecordId && !state.records.some(function (r) { return r.id === state.selectedRecordId; })) {
      var fallback = state.records.find(function (r) { return !r.completed; }) || state.records[0] || null;
      state.selectedRecordId = fallback ? fallback.id : null;
    }

    return state;
  }

  function get() {
    return state;
  }

  function persist() {
    if (!state.preferences.autoSave) {
      state.storageStatus = 'dirty';
      return;
    }
    var result = global.CRStorage.save(state);
    state.storageStatus = result.ok ? 'saved' : 'error';
    if (!result.ok) {
      state.lastError = result.error;
    }
  }

  function patch(obj) {
    Object.assign(state, obj);
    persist();
    return state;
  }

  function selectRecord(id) {
    if (id && !state.records.some(function (r) { return r.id === id; })) {
      state.lastError = 'Record not found: ' + id;
      return state;
    }
    state.selectedRecordId = id;
    persist();
    return state;
  }

  function toggleRecord(id) {
    var record = state.records.find(function (r) { return r.id === id; });
    if (!record) {
      state.lastError = 'Cannot toggle unknown record: ' + id;
      return state;
    }
    record.completed = !record.completed;
    record.status = record.completed ? 'complete' : 'active';
    state.lastError = null;
    persist();
    return state;
  }

  function addRecord(name) {
    var trimmed = String(name || '').trim();
    if (!trimmed) {
      state.lastError = 'Record name is required.';
      return null;
    }
    var id = 'rec-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1000);
    var record = {
      id: id,
      name: trimmed,
      status: 'active',
      completed: false,
      notes: '',
      dueDate: '',
      updatedAt: new Date().toISOString()
    };
    state.records.push(record);
    state.selectedRecordId = id;
    state.lastError = null;
    persist();
    return id;
  }

  function deleteRecord(id) {
    var before = state.records.length;
    state.records = state.records.filter(function (r) { return r.id !== id; });
    if (state.records.length === before) {
      state.lastError = 'Cannot delete unknown record: ' + id;
      return state;
    }
    if (state.selectedRecordId === id) {
      var fallback = state.records.find(function (r) { return !r.completed; }) || state.records[0] || null;
      state.selectedRecordId = fallback ? fallback.id : null;
    }
    state.lastError = null;
    persist();
    return state;
  }

  function selectSurface(surface) {
    state.activeSurface = surface;
    persist();
    return state;
  }

  function setActivePanel(panel) {
    state.activePanel = panel;
    persist();
    return state;
  }

  function updatePreferences(prefs) {
    Object.assign(state.preferences, prefs);
    state.lastError = null;
    persist();
    return state;
  }

  function resetPreferences(defaults) {
    state.preferences = Object.assign({}, defaults || {
      autoSave: true,
      denseMode: false,
      defaultView: 'list',
      notifications: true
    });
    state.lastError = null;
    persist();
    return state;
  }

  function counts() {
    var total = state.records.length;
    var completed = state.records.filter(function (r) { return r.completed; }).length;
    return {
      total: total,
      completed: completed,
      active: total - completed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  global.CRState = {
    init: init,
    get: get,
    patch: patch,
    selectRecord: selectRecord,
    toggleRecord: toggleRecord,
    addRecord: addRecord,
    deleteRecord: deleteRecord,
    selectSurface: selectSurface,
    setActivePanel: setActivePanel,
    updatePreferences: updatePreferences,
    resetPreferences: resetPreferences,
    counts: counts
  };
})(window);
