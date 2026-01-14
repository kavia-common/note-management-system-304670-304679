import React, { useEffect } from "react";
import styles from "../App.module.css";

// PUBLIC_INTERFACE
export function NoteEditor({
  note,
  title,
  content,
  onTitleChange,
  onContentChange,
  savedState,
  onManualSaveSignal,
}) {
  /**
   * Editor for a selected note.
   * savedState: { status: 'saved'|'saving', lastSavedAt: number|null }
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const isSave = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "s";
      if (isSave) {
        e.preventDefault();
        // No-op save (we autosave), but show 'Saved' indicator.
        onManualSaveSignal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onManualSaveSignal]);

  return (
    <section className={styles.panel} aria-label="Note editor">
      <div className={styles.editorWrap}>
        <div className={styles.editorTopRow}>
          <div
            className={styles.savedIndicator}
            aria-live="polite"
            data-testid="saved-indicator"
          >
            {savedState.status === "saved" ? (
              <>
                <span className={styles.savedDot} aria-hidden="true" />
                Saved
              </>
            ) : (
              <span className="u-muted">Saving…</span>
            )}
          </div>
        </div>

        <input
          className={[styles.editorTitleInput, "u-focusable"].join(" ")}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled"
          aria-label="Note title"
          data-testid="editor-title"
        />

        <textarea
          className={[styles.editorContent, "u-focusable"].join(" ")}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Write your note…"
          aria-label="Note content"
          data-testid="editor-content"
        />

        <div style={{ fontSize: 12 }} className="u-muted">
          Created: {new Date(note.createdAt).toLocaleString()} • Updated:{" "}
          {new Date(note.updatedAt).toLocaleString()}
        </div>
      </div>
    </section>
  );
}
