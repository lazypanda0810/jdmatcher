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
