/**
 * CheckRibbon Mini – persistence layer
 * Owns the localStorage key and handles corrupted persisted data gracefully.
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'checkribbon-mini/v1';

  function tryJSONParse(raw) {
    try {
      return { ok: true, value: JSON.parse(raw) };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  function tryLocalStorage(op) {
    try {
      return op();
    } catch (err) {
      return { ok: false, status: 'error', error: err.message };
    }
  }

  var storage = {
    key: STORAGE_KEY,

    /**
     * Load persisted state.
     * Returns { ok, data, status, error? }.
     */
    load: function load() {
      return tryLocalStorage(function () {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null) {
          return { ok: true, data: null, status: 'none' };
        }
        var parsed = tryJSONParse(raw);
        if (!parsed.ok) {
          return { ok: false, data: null, status: 'corrupted', error: parsed.error };
        }
        return { ok: true, data: parsed.value, status: 'loaded' };
      });
    },

    /**
     * Persist state object.
     * Returns { ok, status, error? }.
     */
    save: function save(state) {
      return tryLocalStorage(function () {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        return { ok: true, status: 'saved' };
      });
    },

    /**
     * Clear persisted state.
     * Returns { ok, status, error? }.
     */
    clear: function clear() {
      return tryLocalStorage(function () {
        localStorage.removeItem(STORAGE_KEY);
        return { ok: true, status: 'cleared' };
      });
    }
  };

  global.CRStorage = storage;
})(window);
