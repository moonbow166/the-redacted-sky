export type ArchiveIconKind = "video" | "audio" | "image" | "pdf" | "compass" | "field" | "search" | "spark";

export default function ArchiveIcon({ kind, className = "" }: { kind: string; className?: string }) {
  return <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "video" ? <><rect x="3" y="6" width="26" height="20" rx="3" /><path d="m13 11 8 5-8 5Z" /></>
      : kind === "audio" ? <><path d="M5 18v-4a11 11 0 0 1 22 0v4" /><rect x="3" y="16" width="6" height="11" rx="3" /><rect x="23" y="16" width="6" height="11" rx="3" /></>
      : kind === "image" ? <><rect x="3" y="4" width="26" height="24" rx="3" /><circle cx="11" cy="11" r="3" /><path d="m3 24 8-7 6 5 6-10 6 9" /></>
      : kind === "compass" ? <><circle cx="16" cy="16" r="12" /><path d="m21 11-3 7-7 3 3-7Z" /><path d="M16 1v3m0 24v3M1 16h3m24 0h3" /></>
      : kind === "field" ? <><circle cx="16" cy="16" r="4" /><ellipse cx="16" cy="16" rx="15" ry="7" transform="rotate(-35 16 16)" /><path d="M6 6v.01M26 26v.01M26 6v.01M6 26v.01" strokeWidth="3" /></>
      : kind === "search" ? <><circle cx="14" cy="14" r="9" /><path d="m21 21 7 7" /></>
      : kind === "spark" ? <><path d="m16 3 3.5 9.5L29 16l-9.5 3.5L16 29l-3.5-9.5L3 16l9.5-3.5Z" /><path d="M26 3v5m-2.5-2.5h5" /></>
      : <><path d="M7 3h12l6 6v20H7Z" /><path d="M19 3v7h6M11 16h10M11 21h7" /></>}
  </svg>;
}
