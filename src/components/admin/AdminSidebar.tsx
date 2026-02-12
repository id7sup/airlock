"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Link2, LogOut } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/shared/Logo";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const mainItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/admin",
      active: pathname === "/admin",
    },
    {
      icon: Users,
      label: "Utilisateurs",
      href: "/admin/users",
      active: pathname === "/admin/users" || (pathname.startsWith("/admin/users/") && pathname !== "/admin"),
    },
    {
      icon: Link2,
      label: "Liens de partage",
      href: "/admin/links",
      active: pathname === "/admin/links",
    },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      router.push("/admin/login");
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <aside className="w-64 border-r border-black/[0.05] flex flex-col h-screen bg-white shadow-2xl shadow-black/10 shrink-0">
      {/* Header avec logo */}
      <div className="p-4 lg:p-6">
        <div className="flex items-center gap-3 px-3">
          <Logo className="w-8 h-8" />
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight text-black">Airlock</span>
            <span className="text-[10px] font-bold text-black/20 uppercase tracking-[0.15em] -mt-0.5">Admin</span>
          </div>
        </div>
      </div>

      {/* Navigation principale */}
      <nav className="px-4 space-y-1 flex-1">
        <p className="px-4 text-[11px] font-bold text-black/20 uppercase tracking-[0.2em] mb-3">
          Navigation
        </p>
        {mainItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-300 ${
              item.active
                ? "bg-black text-white shadow-md shadow-black/10"
                : "text-black/40 hover:text-black hover:bg-black/5"
            }`}
          >
            <item.icon
              className={`w-4 h-4 transition-colors duration-300 ${
                item.active ? "text-white" : "text-brand-primary"
              }`}
            />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Section bas de page */}
      <div className="p-4 lg:p-6">
        <div className="p-4 lg:p-5 bg-[#f5f5f7] rounded-[24px] border border-black/[0.03]">
          <p className="text-[11px] font-bold mb-3 uppercase tracking-widest text-black/30">
            Session admin
          </p>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium text-red-500/80 hover:text-white hover:bg-red-500 bg-white border border-black/[0.06] transition-all duration-300 disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            {loggingOut ? "Deconnexion..." : "Se deconnecter"}
          </button>
        </div>
      </div>
    </aside>
  );
}
