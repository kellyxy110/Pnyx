"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { const saved = window.localStorage.getItem("pnyx-theme") === "dark"; if (saved) document.documentElement.dataset.theme = "dark"; setDark(saved); }, []);
  function toggle() {
    const next = !dark;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    window.localStorage.setItem("pnyx-theme", next ? "dark" : "light");
    setDark(next);
  }
  return <button type="button" className="shell-theme-toggle" onClick={toggle} aria-label={dark ? "Use light theme" : "Use dark theme"} aria-pressed={dark}>{dark ? "☼" : "◐"}</button>;
}
