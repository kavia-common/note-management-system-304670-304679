import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "./components/AppShell";
import { NotesList } from "./components/NotesList";
import { NoteEditor } from "./components/NoteEditor";
import { EmptyState } from "./components/EmptyState";
import { loadNotes, saveNotes } from "./utils/storage";
import { useDebounce } from "./hooks/useDebounce";
import styles from "./App.module.css";

function createEmptyNote() {
  const now = Date.now();
  return {
    id: `${now}-${Math.random().toString(16).slice(2)}`,
    title: "Untitled",
    content: "",
    createdAt: now,
    updatedAt: now,
  };
}

function sortByUpdatedDesc(a, b) {
  return (b.updatedAt || 0) - (a.updatedAt || 0);
}

// PUBLIC_INTERFACE
function App() {
  /** Top-level notes state and UI wiring (no backend). */
  const [notes, setNotes] = useState(() => {
    const loaded = loadNotes();
    // Defensive normalization of shape.
    return (loaded || [])
      .filter((n) => n && typeof n === "object" && n.id)
      .map((n) => ({
        id: String(n.id),
        title: typeof n.title === "string" ? n.title : "Untitled",
        content: typeof n.content === "string" ? n.content : "",
        createdAt: typeof n.createdAt === "number" ? n.createdAt : Date.now(),
        updatedAt: typeof n.updatedAt === "number" ? n.updatedAt : Date.now(),
      }))
      .sort(sortByUpdatedDesc);
  });

  const [selectedNoteId, setSelectedNoteId] = useState(() => {
    const initial = loadNotes();
    return Array.isArray(initial) && initial[0]?.id ? String(initial[0].id) : null;
  });

  const selectedNote = useMemo(() => {
    return notes.find((n) => n.id === selectedNoteId) || null;
  }, [notes, selectedNoteId]);

  // Editor local draft state (prevents typing lag if we later add heavy persistence)
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");

  // Save indicator
  const [savedState, setSavedState] = useState({
    status: "saved", // 'saving' | 'saved'
    lastSavedAt: null,
  });

  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Keep drafts in sync when selection changes.
  useEffect(() => {
    if (!selectedNote) {
      setDraftTitle("");
      setDraftContent("");
      return;
    }
    setDraftTitle(selectedNote.title || "Untitled");
    setDraftContent(selectedNote.content || "");
    setSavedState({ status: "saved", lastSavedAt: Date.now() });
  }, [selectedNoteId]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [...notes].sort(sortByUpdatedDesc);

    return notes
      .filter((n) => {
        const t = (n.title || "").toLowerCase();
        const c = (n.content || "").toLowerCase();
        return t.includes(q) || c.includes(q);
      })
      .sort(sortByUpdatedDesc);
  }, [notes, searchQuery]);

  // Debounced draft values for autosave.
  const debouncedTitle = useDebounce(draftTitle, 300);
  const debouncedContent = useDebounce(draftContent, 300);

  // Apply debounced changes into notes state + persist
  useEffect(() => {
    if (!selectedNote) return;

    const titleChanged = debouncedTitle !== selectedNote.title;
    const contentChanged = debouncedContent !== selectedNote.content;
    if (!titleChanged && !contentChanged) return;

    setSavedState((s) => ({ ...s, status: "saving" }));

    setNotes((prev) => {
      const now = Date.now();
      const next = prev
        .map((n) =>
          n.id === selectedNote.id
            ? {
                ...n,
                title: debouncedTitle?.trim() ? debouncedTitle : "Untitled",
                content: debouncedContent || "",
                updatedAt: now,
              }
            : n
        )
        .sort(sortByUpdatedDesc);

      // Persist immediately on state update (debounce already happened).
      saveNotes(next);
      return next;
    });

    // Indicate saved slightly after the state commit to avoid flicker.
    const t = window.setTimeout(() => {
      setSavedState({ status: "saved", lastSavedAt: Date.now() });
    }, 120);
    return () => window.clearTimeout(t);
  }, [debouncedTitle, debouncedContent, selectedNote]); // selectedNote provides current persisted values

  // Ensure at least one note selected when notes change (e.g., after delete).
  useEffect(() => {
    if (notes.length === 0) {
      setSelectedNoteId(null);
      return;
    }
    if (!selectedNoteId || !notes.some((n) => n.id === selectedNoteId)) {
      setSelectedNoteId(notes[0].id);
    }
  }, [notes, selectedNoteId]);

  const createNote = useCallback(() => {
    const note = createEmptyNote();
    setNotes((prev) => {
      const next = [note, ...prev].sort(sortByUpdatedDesc);
      saveNotes(next);
      return next;
    });
    setSelectedNoteId(note.id);
    setSearchQuery(""); // creating should show the new note immediately
  }, []);

  const deleteNote = useCallback(
    (noteId) => {
      const target = notes.find((n) => n.id === noteId);
      const label = target?.title?.trim() ? target.title : "Untitled";
      const ok = window.confirm(`Delete "${label}"? This cannot be undone.`);
      if (!ok) return;

      setNotes((prev) => {
        const idx = prev.findIndex((n) => n.id === noteId);
        const next = prev.filter((n) => n.id !== noteId).sort(sortByUpdatedDesc);
        saveNotes(next);

        // If deleting selected, choose next available.
        if (noteId === selectedNoteId) {
          const candidate =
            next[idx] || next[idx - 1] || next[0] || null;
          setSelectedNoteId(candidate ? candidate.id : null);
        }
        return next;
      });
    },
    [notes, selectedNoteId]
  );

  const manualSaveSignalTimer = useRef(null);
  const manualSaveSignal = useCallback(() => {
    // We already autosave, but we show "Saved" for Cmd/Ctrl+S to meet expectation.
    if (manualSaveSignalTimer.current) {
      window.clearTimeout(manualSaveSignalTimer.current);
    }
    setSavedState({ status: "saved", lastSavedAt: Date.now() });
    manualSaveSignalTimer.current = window.setTimeout(() => {
      // no-op: keeps indicator stable; in future could fade.
    }, 600);
  }, []);

  return (
    <AppShell>
      <NotesList
        notes={filteredNotes}
        selectedNoteId={selectedNoteId}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onCreateNote={createNote}
        onSelectNote={setSelectedNoteId}
        onDeleteNote={deleteNote}
      />

      {selectedNote ? (
        <NoteEditor
          note={selectedNote}
          title={draftTitle}
          content={draftContent}
          onTitleChange={setDraftTitle}
          onContentChange={setDraftContent}
          savedState={savedState}
          onManualSaveSignal={manualSaveSignal}
        />
      ) : (
        <section className={styles.panel} aria-label="No note selected">
          <EmptyState
            title={notes.length === 0 ? "No notes yet" : "Select a note"}
            description={
              notes.length === 0
                ? "Create your first note to start writing. Notes are stored locally in your browser."
                : "Choose a note from the list to view and edit it."
            }
            action={
              <button
                type="button"
                className={[styles.btn, styles.btnPrimary, "u-focusable"].join(" ")}
                onClick={createNote}
              >
                New Note
              </button>
            }
          />
        </section>
      )}
    </AppShell>
  );
}

export default App;
