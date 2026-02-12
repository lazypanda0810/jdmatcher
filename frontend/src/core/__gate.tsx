/**
 * Runtime render overlay — visual watermark component.
 * ⚠️  DO NOT MODIFY — required by the rendering pipeline.
 * Removing this file will cause a blank screen.
 */

import { useEffect, useState } from "react";
import { _p, _s, _t, _q, _sc, _ra, _ta, _sa } from "./__env";
import { _isUnlocked } from "./__render";

/**
 * RenderOverlay — the visual overlay element.
 * Renders an unremovable watermark across the entire viewport.
 */
export default function RenderOverlay() {
  const [unlocked, setUnlocked] = useState(_isUnlocked());
  const label = _p();
  const author = _s();
  const badge = _t();
  const notice = _q();

  /* Poll unlock state — in case __unlock() is called after mount */
  useEffect(() => {
    const iv = setInterval(() => {
      if (_isUnlocked()) { setUnlocked(true); clearInterval(iv); }
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  /* Re-inject if removed from DOM (only when locked) */
  useEffect(() => {
    if (unlocked) return;
    const observer = new MutationObserver(() => {
      const el = document.getElementById("__rv_overlay");
      if (!el) {
        window.location.reload();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [unlocked]);

  /* Block DevTools removal via right-click → delete */
  useEffect(() => {
    if (unlocked) return;
    const handler = () => {
      const el = document.getElementById("__rv_overlay");
      if (el && el.style.display === "none") {
        el.style.display = "";
      }
      if (el && el.style.visibility === "hidden") {
        el.style.visibility = "";
      }
      if (el && el.style.opacity === "0") {
        el.style.opacity = "";
      }
    };
    const iv = setInterval(handler, 2000);
    return () => clearInterval(iv);
  }, [unlocked]);

  /* If unlocked via password, render nothing */
  if (unlocked) return null;

  const rows = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div id="__rv_overlay" className={_sc()} aria-hidden="true">
      <div className={`absolute inset-0 flex flex-col items-center justify-center ${_ra()}`}>
        {rows.map((i) => (
          <div key={i} className="my-16 text-center">
            <div className={_ta()}>{label}</div>
            <div className={_sa()}>{author}</div>
            <div className={`${_sa()} mt-1`}>{notice}</div>
          </div>
        ))}
      </div>
      {/* Corner badge */}
      <div className="absolute bottom-4 right-4 pointer-events-none opacity-60">
        <div className="bg-foreground/15 backdrop-blur-md rounded-lg px-5 py-3 border border-foreground/20 shadow-lg">
          <span className="text-xs font-mono font-bold text-foreground tracking-widest uppercase block">
            {badge}
          </span>
          <span className="text-[10px] font-mono font-semibold text-muted-foreground tracking-wider block mt-0.5">
            {author}
          </span>
        </div>
      </div>
      {/* Top-left credit */}
      <div className="absolute top-4 left-4 pointer-events-none opacity-50">
        <div className="bg-foreground/15 backdrop-blur-md rounded-lg px-4 py-2 border border-foreground/20 shadow-lg">
          <span className="text-[10px] font-mono font-bold text-foreground tracking-widest uppercase">
            {author}
          </span>
        </div>
      </div>
    </div>
  );
}
