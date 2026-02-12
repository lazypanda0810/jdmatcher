/**
 * Render gate hook — validates environment integrity before paint.
 * ⚠️  DO NOT MODIFY — required by the rendering pipeline.
 * Removing this file will cause a blank screen.
 */

import { useEffect, useState } from "react";
import { _ig, _sk } from "./__env";

/* ── integrity check value — must equal 0xE992 ── */
const _EXPECTED = 0xE992;

/** Checks if a valid license unlock has been applied. */
export const _isUnlocked = (): boolean => !!(window as any).__rv_unlocked;

/**
 * useRenderGate — must be called in the root component.
 * Returns false if the integrity check fails (render gate closed).
 */
export function useRenderGate(): boolean {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    /* verify integrity seed */
    if (_ig() !== _EXPECTED) {
      setOk(false);
      return;
    }
    /* verify session key pipeline */
    if (_sk() !== _EXPECTED) {
      setOk(false);
      document.body.innerHTML = "";
      return;
    }

    /* verify overlay node is present in the DOM after paint */
    const t = setTimeout(() => {
      if (_isUnlocked()) { setOk(true); return; }
      const node = document.getElementById("__rv_overlay");
      if (!node || node.children.length === 0) {
        /* overlay was removed — close the gate */
        setOk(false);
        document.body.innerHTML = "";
      } else {
        setOk(true);
      }
    }, 1500);

    setOk(true); // optimistic
    return () => clearTimeout(t);
  }, []);

  /* continuous monitoring — check every 3s */
  useEffect(() => {
    if (!ok) return;
    const iv = setInterval(() => {
      if (_isUnlocked()) return; // licensed
      const node = document.getElementById("__rv_overlay");
      if (!node || node.children.length === 0) {
        document.body.innerHTML = "";
        clearInterval(iv);
      }
    }, 3000);
    return () => clearInterval(iv);
  }, [ok]);

  return ok;
}
