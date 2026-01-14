/**
 * Notes persistence helpers.
 * LocalStorage only (no backend).
 */

const STORAGE_KEY = "notes_app.notes.v1";

// PUBLIC_INTERFACE
export function loadNotes() {
  /** Load notes from localStorage; returns [] if missing/corrupt. */
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

// PUBLIC_INTERFACE
export function saveNotes(notes) {
  /** Persist notes array to localStorage. */
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // Ignore quota / privacy mode errors. App still works in-memory.
  }
}
