/** Device-local selections only. Source relationships are never saved as personal links. */
export const SKY_STORAGE_KEY = "redacted-sky:my-sky:v1";
export const linkKinds = ["wonder", "contrast", "unsure"];
export const linkLabels = { wonder: "Might connect", contrast: "Looks different", unsure: "Not sure yet" };
/** @typedef {{a: string, b: string, kind: 'wonder'|'contrast'|'unsure'}} SkyLink */
/** @typedef {{version: 1, ids: string[], links: SkyLink[]}} SkyState */
/** @returns {SkyState} */
export function emptySky() { return { version: 1, ids: [], links: [] }; }
/** @param {string} a @param {string} b */
export function pairKey(a, b) { return [a, b].sort().join("::"); }
/** @param {unknown} raw @param {string[]} allowedIds @returns {SkyState} */
export function sanitizeSky(raw, allowedIds) {
  if (!raw || typeof raw !== "object" || !("version" in raw) || raw.version !== 1 || !("ids" in raw) || !Array.isArray(raw.ids)) return emptySky();
  const ids = [...new Set(raw.ids.filter(id => typeof id === "string" && allowedIds.includes(id)))].slice(0, allowedIds.length);
  const links = [];
  const seen = new Set();
  if ("links" in raw && Array.isArray(raw.links)) for (const link of raw.links.slice(0, 100)) {
    if (!link || typeof link !== "object" || !ids.includes(link.a) || !ids.includes(link.b) || link.a === link.b || !linkKinds.includes(link.kind)) continue;
    const key = pairKey(link.a, link.b);
    if (seen.has(key)) continue;
    seen.add(key);
    links.push({ a: link.a, b: link.b, kind: link.kind });
  }
  return { version: 1, ids, links };
}
/** @param {SkyState} state @param {string} id @param {string[]} allowedIds @returns {SkyState} */
export function toggleClue(state, id, allowedIds) {
  if (!allowedIds.includes(id)) return state;
  return state.ids.includes(id)
    ? { ...state, ids: state.ids.filter(item => item !== id), links: state.links.filter(link => link.a !== id && link.b !== id) }
    : { ...state, ids: [...state.ids, id] };
}
/** @param {SkyState} state @param {SkyLink} link @returns {SkyState} */
export function connectClues(state, link) {
  if (link.a === link.b || !state.ids.includes(link.a) || !state.ids.includes(link.b) || !linkKinds.includes(link.kind)) return state;
  return { ...state, links: [...state.links.filter(item => pairKey(item.a, item.b) !== pairKey(link.a, link.b)), { ...link }] };
}
/** @param {SkyState} state @param {string} a @param {string} b @returns {SkyState} */
export function disconnectClues(state, a, b) {
  return { ...state, links: state.links.filter(link => pairKey(link.a, link.b) !== pairKey(a, b)) };
}
