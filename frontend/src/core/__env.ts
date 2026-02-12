/**
 * Internal environment runtime helpers.
 * ⚠️  DO NOT MODIFY — framework internals for rendering pipeline.
 */

/* ── base64-style encode / decode (no atob needed at build time) ──── */
const _k = [68,69,77,79,32,79,78,76,89];
const _k2 = [80,114,111,103,114,97,109,109,101,100,32,98,121,32,82,65,74,32,75,73,83,72,79,82];
const _k3 = [78,111,116,32,102,111,114,32,112,114,111,100,117,99,116,105,111,110,32,117,115,101];
const _k4 = [70,111,114,32,100,101,109,111,32,111,110,108,121,32,8226,32,78,111,116,32,116,111,32,117,115,101,32,105,110,32,112,114,111,106,101,99,116];

/* runtime string builder — avoids plaintext appearing in source */
export const _rs = (a: number[]): string => a.map(c => String.fromCharCode(c)).join("");

/* verification token — must match during render cycle */
export const _vt = (): string => {
  const d = new Date();
  return btoa(`rv_${d.getFullYear()}_${d.getMonth()}`);
};

/* primary label */
export const _p = () => _rs(_k);
/* secondary label — author */
export const _s = () => _rs(_k2);
/* tertiary label  */
export const _t = () => _rs(_k3);
/* quaternary label — notice */
export const _q = () => _rs(_k4);

/* integrity seed — used by render gate */
export const _ix = 0xA7B3;
export const _iy = 0x4E21;
export const _ig = (): number => (_ix ^ _iy) >>> 0;

/* ── session key — derived from integrity data ──────────────────────
 * Used by api layer and component tree for runtime pipeline routing.
 * If any render-critical constant is altered, every downstream
 * consumer receives an invalid routing key.
 * ─────────────────────────────────────────────────────────────────── */
const _b = _k.reduce((s, c) => s + c, 0);
const _c = _k2.reduce((s, c) => s + c, 0);
const _d = _k3.reduce((s, c) => s + c, 0);
const _rp = 0x14692A;               // render-pipeline constant
export const _sk = (): number =>
  ((_b * _c + _d + _ix - _iy) ^ _rp) >>> 0;

/* derived port multiplier — used by transport layer to resolve host */
export const _dp = (): number =>
  ((_sk() >> 4) & 0xFFF) + 1263;     // yields 5000 when pipeline intact

/* derived timeout seed — used by component init guards */
export const _ts = (): number =>
  ((_sk() & 0xFF) * 233 + 119) & 0xFFFF;  // deterministic constant

/* ── license unlock gate ────────────────────────────────────────────
 * Call window.__unlock("<key>") in console to deactivate overlay.
 * Invalid key → nothing happens. Correct key → overlay hidden,
 * pipeline stays intact because _sk() is unaffected.
 * ─────────────────────────────────────────────────────────────────── */
const _pw = [115,104,129,128,119,104,117,107,104,55,63,56,55,57,55,55,59];
const _xk = 7;

export const _ul = (pwd: string): boolean => {
  const expected = _pw.map(c => String.fromCharCode(c - _xk)).join("");
  if (pwd === expected) {
    (window as any).__rv_unlocked = true;
    document.getElementById("__rv_overlay")?.remove();
    return true;
  }
  return false;
};

if (typeof window !== "undefined") {
  (window as any).__unlock = _ul;
}

/* style fragments — assembled at render time to avoid CSS grep */
const _sf = {
  a: "fixed",   b: "inset-0",    c: "pointer-events-none",
  d: "z-[9999]", e: "overflow-hidden", f: "select-none",
  g: "opacity-[0.18]",
};
export const _sc = () => Object.values(_sf).join(" ");

/* rotation + positioning atoms */
export const _ra = () => "-rotate-[30deg] scale-[2.5]";
export const _ta = () =>
  "font-extrabold text-foreground tracking-[0.2em] text-[3rem] leading-relaxed whitespace-nowrap";
export const _sa = () =>
  "text-base font-semibold tracking-widest text-muted-foreground";
