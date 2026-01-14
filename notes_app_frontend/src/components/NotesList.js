import React, { useCallback } from "react";
import styles from "../App.module.css";
import { NoteListItem } from "./NoteListItem";

// PUBLIC_INTERFACE
export function NotesList({
  notes,
  selectedNoteId,
  searchQuery,
  onSearchQueryChange,
  onCreateNote,
  onSelectNote,
  onDeleteNote,
}) {
  /** Sidebar list: search + new button + note rows. */
  const nowMs = Date.now();

  const handleSearchKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onCreateNote();
      }
    },
    [onCreateNote]
  );

  return (
    <section className={styles.panel} aria-label="Notes list">
      <div className={styles.panelHeader}>
        <div className={styles.toolbarRow}>
          <div className={styles.searchWrap}>
            <input
              className={[styles.searchInput, "u-focusable"].join(" ")}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search notes…"
              aria-label="Search notes"
              data-testid="search-input"
            />
          </div>

          <button
            type="button"
            className={[styles.btn, styles.btnPrimary, "u-focusable"].join(" ")}
            onClick={onCreateNote}
            aria-label="Create new note"
            data-testid="new-note-button"
          >
            New Note
          </button>
        </div>
      </div>

      <div className={styles.list} role="list" aria-label="Notes">
        {notes.length === 0 ? (
          <div style={{ padding: 12 }}>
            <div className="u-muted" style={{ fontSize: 13 }}>
              No notes match your search.
            </div>
          </div>
        ) : (
          notes.map((n) => (
            <NoteListItem
              key={n.id}
              note={n}
              selected={n.id === selectedNoteId}
              onSelect={() => onSelectNote(n.id)}
              onDelete={() => onDeleteNote(n.id)}
              nowMs={nowMs}
            />
          ))
        )}
      </div>
    </section>
  );
}
