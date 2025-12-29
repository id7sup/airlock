"use client";

import { UserButton } from "@clerk/nextjs";
import { NotificationCenter } from "./NotificationCenter";
import { Search } from "lucide-react";

export function TopBar() {
  return (
    <header className="h-20 border-b border-black/[0.05] bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex-1 max-w-xl">
        {/* Espace pour une recherche globale ou fil d'ariane si besoin */}
      </div>

      <div className="flex items-center gap-4">
        <NotificationCenter />
        <div className="w-px h-6 bg-black/[0.05] mx-2" />
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-10 h-10 rounded-2xl shadow-sm border border-black/5"
            }
          }}
        />
      </div>
    </header>
  );
}

