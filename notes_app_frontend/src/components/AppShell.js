import React from "react";
import styles from "../App.module.css";

// PUBLIC_INTERFACE
export function AppShell({ children }) {
  /** App chrome wrapper: header + main area. */
  return (
    <div className={styles.appRoot}>
      <header className={styles.appHeader} role="banner">
        <div className={styles.headerTitle}>
          <div className={styles.appTitle}>Notes</div>
          <div className={styles.headerHint}>
            Local only • Autosave • Ctrl/Cmd+S
          </div>
        </div>
      </header>

      <main className={styles.shell} role="main">
        {children}
      </main>
    </div>
  );
}
