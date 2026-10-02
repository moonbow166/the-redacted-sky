export type ArchiveIconKind = "video" | "audio" | "image" | "pdf" | "compass" | "field" | "search" | "spark" | "constellation" | "link" | "check" | "plus" | "help" | "compare" | "undo" | "lock";

export default function ArchiveIcon({ kind, className = "" }: { kind: string; className?: string }) {
  return <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "video" ? <><rect x="3" y="6" width="26" height="20" rx="3" /><path d="m13 11 8 5-8 5Z" /></>
      : kind === "audio" ? <><path d="M5 18v-4a11 11 0 0 1 22 0v4" /><rect x="3" y="16" width="6" height="11" rx="3" /><rect x="23" y="16" width="6" height="11" rx="3" /></>
      : kind === "image" ? <><rect x="3" y="4" width="26" height="24" rx="3" /><circle cx="11" cy="11" r="3" /><path d="m3 24 8-7 6 5 6-10 6 9" /></>
      : kind === "compass" ? <><circle cx="16" cy="16" r="12" /><path d="m21 11-3 7-7 3 3-7Z" /><path d="M16 1v3m0 24v3M1 16h3m24 0h3" /></>
      : kind === "field" ? <><circle cx="16" cy="16" r="4" /><ellipse cx="16" cy="16" rx="15" ry="7" transform="rotate(-35 16 16)" /><path d="M6 6v.01M26 26v.01M26 6v.01M6 26v.01" strokeWidth="3" /></>
      : kind === "search" ? <><circle cx="14" cy="14" r="9" /><path d="m21 21 7 7" /></>
      : kind === "spark" ? <><path d="m16 3 3.5 9.5L29 16l-9.5 3.5L16 29l-3.5-9.5L3 16l9.5-3.5Z" /><path d="M26 3v5m-2.5-2.5h5" /></>
      : kind === "constellation" ? <><path d="m8 23 6-16 11 11-17 5" /><circle cx="8" cy="23" r="3" /><circle cx="14" cy="7" r="3" /><circle cx="25" cy="18" r="3" /></>
      : kind === "link" ? <><path d="m13 10 4-4a7 7 0 0 1 10 10l-4 4M19 22l-4 4A7 7 0 0 1 5 16l4-4M11 21l10-10" /></>
      : kind === "check" ? <path d="m7 16 6 6L26 9" />
      : kind === "plus" ? <path d="M16 6v20M6 16h20" />
      : kind === "help" ? <><circle cx="16" cy="16" r="12" /><path d="M12 12a4 4 0 0 1 8 0c0 4-4 3-4 7m0 4v.01" /></>
      : kind === "compare" ? <><circle cx="11" cy="16" r="8" /><path d="M21 8a8 8 0 0 1 0 16M21 8v16" /></>
      : kind === "undo" ? <><path d="M5 13h12a8 8 0 1 1 0 16M5 13l7-7M5 13l7 7" /></>
      : kind === "lock" ? <><rect x="7" y="14" width="18" height="15" rx="3" /><path d="M11 14V8a5 5 0 0 1 10 0v6M16 20v3" /></>
      : <><path d="M7 3h12l6 6v20H7Z" /><path d="M19 3v7h6M11 16h10M11 21h7" /></>}
  </svg>;
}
