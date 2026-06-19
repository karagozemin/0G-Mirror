"use client";

import { useEffect } from "react";

export function OpenLinksInNewTab() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor?.href) return;

      // Ignore in-page anchors. Everything that opens another page/view should
      // preserve the current demo state by opening in a new tab.
      const rawHref = anchor.getAttribute("href") ?? "";
      if (rawHref.startsWith("#")) return;

      try {
        new URL(anchor.href, location.href);
      } catch (e) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      window.open(anchor.href, "_blank", "noopener,noreferrer");
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
