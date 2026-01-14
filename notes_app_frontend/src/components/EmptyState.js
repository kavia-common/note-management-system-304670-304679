import React from "react";
import styles from "../App.module.css";

// PUBLIC_INTERFACE
export function EmptyState({ title, description, action }) {
  /** Simple empty-state panel with optional action node. */
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyTitle}>{title}</div>
      <div className={styles.emptyDesc}>{description}</div>
      {action ? <div style={{ marginTop: 8 }}>{action}</div> : null}
    </div>
  );
}
