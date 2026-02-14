"use client";

import { UserButton } from "@clerk/nextjs";
import { NotificationCenter } from "./NotificationCenter";
import { Menu } from "lucide-react";
import { useSidebar } from "./SidebarProvider";
import { useState, useEffect } from "react";

export function TopBar() {
  const { toggle, isOpen, open } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mainEl = document.querySelector("main");
    if (!mainEl) return;

    const checkAutoHide = () => {
      const shouldAutoHide = mainEl.getAttribute("data-autohide-topbar") === "true";
      setIsVisible(!shouldAutoHide);
    };

    // Vérifier immédiatement
    checkAutoHide();

    // Observer les changements d'attribut sur <main>
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "data-autohide-topbar") {
          checkAutoHide();
        }
      }
    });

    observer.observe(mainEl, { attributes: true, attributeFilter: ["data-autohide-topbar"] });

    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`border-b border-black/[0.05] bg-white/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 z-30 transition-all duration-300 ${
        isVisible ? "h-16 lg:h-20" : "h-0 overflow-hidden opacity-0 border-b-0 pointer-events-none"
      }`}
    >
      {!isOpen && (
        <button
          onClick={open}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors mr-2"
        >
          <Menu className="w-5 h-5 text-black/40" />
        </button>
      )}

      <div className="flex-1 max-w-xl">
        {/* Espace pour une recherche globale ou fil d'ariane si besoin */}
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <NotificationCenter />
        <div className="w-px h-6 bg-black/[0.05] mx-1 lg:mx-2" />
        {mounted && (
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-9 h-9 lg:w-10 lg:h-10 rounded-2xl shadow-sm border border-black/5"
              }
            }}
          />
        )}
      </div>
    </header>
  );
}
