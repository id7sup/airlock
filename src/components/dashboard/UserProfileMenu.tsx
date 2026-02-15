"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutList,
  FolderOpen,
  Bookmark,
  User,
  Shield,
  CreditCard,
  LogOut,
} from "lucide-react";

interface MenuItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
  onClick: () => void;
}

function MenuItem({ icon: Icon, label, isActive, onClick }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 active:scale-[0.97] ${
        isActive
          ? "bg-black/[0.06] text-black"
          : "text-black/50 hover:bg-black/[0.04] hover:text-black"
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span>{label}</span>
    </button>
  );
}

export function UserProfileMenu({ storageUsed = 0 }: { storageUsed?: number }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fermer avec Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Calcul du stockage
  const MAX_STORAGE = 5 * 1024 * 1024 * 1024; // 5 Go
  const percentage = Math.min((storageUsed / MAX_STORAGE) * 100, 100);
  const storageFormatted = (storageUsed / 1024 / 1024 / 1024).toFixed(2);

  const navigateTo = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ redirectUrl: "/" });
  };

  if (!mounted || !isLoaded || !user) {
    return (
      <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-2xl bg-black/5 animate-pulse" />
    );
  }

  const email = user.primaryEmailAddress?.emailAddress || "";

  const navigationItems = [
    { icon: LayoutList, label: "Mes Partages", href: "/dashboard/sharing" },
    { icon: FolderOpen, label: "Tous les dossiers", href: "/dashboard" },
    { icon: Bookmark, label: "Favoris", href: "/dashboard?filter=favorites" },
  ];

  const accountItems = [
    { icon: User, label: "Mon profil", href: "/dashboard/settings?tab=profile" },
    { icon: Shield, label: "Securite", href: "/dashboard/settings?tab=account" },
    { icon: CreditCard, label: "Abonnement", href: "/dashboard/settings?tab=billing" },
  ];

  return (
    <div className="relative">
      {/* Avatar trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-2xl shadow-sm border border-black/5 overflow-hidden transition-all duration-200 active:scale-90 hover:shadow-md focus:outline-none"
      >
        <img
          src={user.imageUrl}
          alt={user.fullName || ""}
          className="w-full h-full object-cover"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay click-outside */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-3xl shadow-2xl shadow-black/10 border border-black/[0.05] z-50 overflow-hidden origin-top-right"
            >
              {/* Section 1 : Identite */}
              <div className="p-5 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border-2 border-white ring-1 ring-black/5 flex-shrink-0">
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || ""}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-medium tracking-tight text-black truncate">
                      {user.fullName}
                    </h3>
                    <p className="text-[11px] font-bold text-black/20 uppercase tracking-[0.1em] truncate mt-0.5">
                      {email}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#96A982]" />
                      <span className="text-[10px] font-bold text-black/30 uppercase tracking-[0.15em]">
                        Gratuit
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-black/[0.04] mx-5" />

              {/* Section 2 : Navigation */}
              <div className="p-2.5">
                <p className="px-4 text-[10px] font-bold text-black/20 uppercase tracking-[0.2em] mb-1.5">
                  Navigation
                </p>
                {navigationItems.map((item) => {
                  const [itemPath, itemQuery] = item.href.split("?");
                  const itemParams = new URLSearchParams(itemQuery || "");
                  let active = false;
                  if (item.href === "/dashboard") {
                    active = pathname === "/dashboard" && !searchParams.get("filter");
                  } else if (itemParams.get("filter")) {
                    active = pathname === itemPath && searchParams.get("filter") === itemParams.get("filter");
                  } else {
                    active = pathname.startsWith(itemPath) && pathname !== "/dashboard";
                  }
                  return (
                  <MenuItem
                    key={item.href}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    isActive={active}
                    onClick={() => navigateTo(item.href)}
                  />
                  );
                })}
              </div>

              <div className="h-px bg-black/[0.04] mx-5" />

              {/* Section 3 : Compte */}
              <div className="p-2.5">
                <p className="px-4 text-[10px] font-bold text-black/20 uppercase tracking-[0.2em] mb-1.5">
                  Compte
                </p>
                {accountItems.map((item) => {
                  const itemTab = new URLSearchParams(item.href.split("?")[1] || "").get("tab");
                  const currentTab = searchParams.get("tab") || "profile";
                  return (
                    <MenuItem
                      key={item.href}
                      icon={item.icon}
                      label={item.label}
                      href={item.href}
                      isActive={pathname === "/dashboard/settings" && itemTab === currentTab}
                      onClick={() => navigateTo(item.href)}
                    />
                  );
                })}
              </div>

              <div className="h-px bg-black/[0.04] mx-5" />

              {/* Section 4 : Stockage */}
              <div className="px-5 py-3.5">
                <p className="text-[10px] font-bold text-black/20 uppercase tracking-[0.2em] mb-2">
                  Stockage
                </p>
                <div className="h-1.5 bg-black/[0.06] rounded-full overflow-hidden mb-1.5">
                  <motion.div
                    className="h-full bg-black rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                  />
                </div>
                <p className="text-[10px] font-bold text-black/30 tracking-tighter">
                  {storageFormatted} Go / 5 Go
                </p>
              </div>

              {/* Section 5 : Deconnexion */}
              <div className="p-2.5 bg-[#f5f5f7]/50 border-t border-black/[0.04]">
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium text-black/40 hover:bg-white hover:text-red-500 transition-all duration-200 active:scale-[0.97] disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span>{isSigningOut ? "Deconnexion..." : "Deconnexion"}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
