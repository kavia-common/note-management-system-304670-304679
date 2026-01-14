import React, { useMemo } from "react";
import styles from "../App.module.css";
import { formatRelativeTime } from "../utils/time";

// PUBLIC_INTERFACE
export function NoteListItem({
  note,
  selected,
  onSelect,
  onDelete,
  nowMs,
}) {
  /** Single note row with title, preview, relative updated time, and delete action. */
  const preview = useMemo(() => {
    const clean = (note.content || "").replace(/\s+/g, " ").trim();
    return clean.slice(0, 80);
  }, [note.content]);

  return (
    <button
      type="button"
      className={[
        styles.noteItem,
        selected ? styles.noteItemSelected : "",
      ].join(" ")}
      onClick={onSelect}
      aria-label={`Select note ${note.title || "Untitled"}`}
      data-testid={`note-item-${note.id}`}
    >
      <div style={{ minWidth: 0 }}>
        <p className={[styles.noteTitle, "u-truncate"].join(" ")}>
          {note.title?.trim() ? note.title : "Untitled"}
        </p>
        <div className={styles.noteMeta}>
          Updated {formatRelativeTime(note.updatedAt, nowMs)}
        </div>
        <div className={styles.notePreview}>
          {preview ? preview : <span className="u-muted">No content</span>}
        </div>
      </div>

      <div className={styles.noteActions}>
        <button
          type="button"
          className={[styles.iconBtn, "u-focusable"].join(" ")}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Delete note ${note.title || "Untitled"}`}
          data-testid="delete-note-button"
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </button>
  );
}
