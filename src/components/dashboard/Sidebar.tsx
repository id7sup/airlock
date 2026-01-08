"use client";

import Link from "next/link";
import { FolderOpen, History, Bookmark, Trash2, Settings2, LayoutList, Users } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import { useSidebar } from "./SidebarProvider";

export function Sidebar({ storageUsed = 0 }: { storageUsed?: number }) {
  const { isOpen, close } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("filter");
  
  const MAX_STORAGE = 5 * 1024 * 1024 * 1024; // 5 GB
  const percentage = Math.min((storageUsed / MAX_STORAGE) * 100, 100);
  const storageFormatted = (storageUsed / 1024 / 1024 / 1024).toFixed(2);

  const menuItems = [
    { icon: FolderOpen, label: "Tous les dossiers", href: "/dashboard", active: pathname === "/dashboard" && !currentFilter },
    { icon: History, label: "Récents", href: "/dashboard?filter=recent", active: currentFilter === "recent" },
    { icon: Bookmark, label: "Favoris", href: "/dashboard?filter=favorites", active: currentFilter === "favorites" },
    { icon: Users, label: "Partagés avec moi", href: "/dashboard?filter=shared", active: currentFilter === "shared" },
    { icon: Trash2, label: "Corbeille", href: "/dashboard?filter=trash", active: currentFilter === "trash" },
  ];

  const adminItems = [
    { icon: LayoutList, label: "Mes Partages", href: "/dashboard/sharing", active: pathname === "/dashboard/sharing" },
    { icon: Settings2, label: "Paramètres", href: "/dashboard/settings", active: pathname === "/dashboard/settings" },
  ];

  return (
    <>
      {/* Overlay pour mobile */}
      <div 
        className={`fixed inset-0 bg-black/20 z-40 lg:hidden transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
      />
      
      <aside className={`
        fixed inset-y-0 left-0 z-50
        w-64 border-r border-black/[0.05] flex flex-col h-full bg-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-6 lg:mb-10">
            <Link href="/" className="flex items-center gap-3 px-3 hover:opacity-80 transition-opacity">
              <Logo className="w-8 h-8" />
              <span className="text-xl font-semibold tracking-tight">Airlock</span>
            </Link>
            <button 
              onClick={close}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors group"
              aria-label="Fermer la barre latérale"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-black/40 group-hover:text-black/60 transition-colors"
              >
                <rect width="18" height="18" x="3" y="3" rx="2"/>
                <path d="M15 3v18"/>
              </svg>
            </button>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-300 group ${
                  item.active 
                    ? "bg-black text-white shadow-md shadow-black/10" 
                    : "text-black/40 hover:text-black hover:bg-black/5"
                }`}
              >
                <item.icon className={`w-4 h-4 transition-colors duration-300 ${
                  item.active 
                    ? "text-white" 
                    : "text-brand-primary"
                }`} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-10">
            <h4 className="px-4 text-[11px] font-bold text-black/20 uppercase tracking-[0.2em] mb-4">
              Administration
            </h4>
            <nav className="space-y-1">
              {adminItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-300 group ${
                  item.active 
                    ? "bg-black text-white shadow-md shadow-black/10" 
                    : "text-black/40 hover:text-black hover:bg-black/5"
                }`}
              >
                <item.icon className={`w-4 h-4 transition-colors duration-300 ${
                  item.active 
                    ? "text-white" 
                    : "text-brand-primary"
                }`} />
                {item.label}
              </Link>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="mt-auto p-4 lg:p-6">
          <div className="p-4 lg:p-6 bg-[#f5f5f7] rounded-[32px] border border-black/[0.03]">
            <p className="text-[11px] font-bold mb-3 uppercase tracking-widest text-black/30">Stockage</p>
            <div className="h-1.5 bg-black/5 rounded-full mb-3 overflow-hidden">
              <div 
                className="h-full bg-black rounded-full transition-all duration-1000" 
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-tighter text-black/40">
              {storageFormatted} Go / 5 Go
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
