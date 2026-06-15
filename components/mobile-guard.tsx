"use client";

import { useEffect } from "react";

export function MobileGuard() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Only block on mobile screens (less than 768px wide)
      if (window.innerWidth >= 768) return;

      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (anchor) {
        const href = anchor.getAttribute("href");
        if (href === "/login" || href === "/signup") {
          e.preventDefault();
          e.stopPropagation();
          alert("This app is only accessible on a computer.");
        }
      }
    };

    // Use capture phase to intercept before Next.js router
    document.addEventListener("click", handleClick, { capture: true });
    
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, []);

  return null;
}
