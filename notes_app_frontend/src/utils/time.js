// PUBLIC_INTERFACE
export function formatRelativeTime(timestampMs, nowMs = Date.now()) {
  /** Formats a timestamp (ms) as a short relative time string. */
  if (!timestampMs) return "";
  const diff = Math.max(0, nowMs - timestampMs);

  const sec = Math.floor(diff / 1000);
  if (sec < 10) return "just now";
  if (sec < 60) return `${sec}s ago`;

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;

  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;

  // Fallback to date for older notes
  try {
    return new Date(timestampMs).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return `${day}d ago`;
  }
}
