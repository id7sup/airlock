"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, Settings2, LogOut } from "lucide-react";

export function NavbarProfileMenu() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 12,
      right: window.innerWidth - rect.right,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const navigateTo = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ redirectUrl: "/" });
  };

  if (!mounted || !isLoaded || !user) {
    return <div className="w-8 h-8 rounded-xl bg-white/10 animate-pulse" />;
  }

  const email = user.primaryEmailAddress?.emailAddress || "";

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-xl overflow-hidden border border-white/10 transition-all duration-200 active:scale-90 hover:border-white/25 focus:outline-none"
      >
        <img
          src={user.imageUrl}
          alt={user.fullName || ""}
          className="w-full h-full object-cover"
        />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                <div
                  className="fixed inset-0 z-[200]"
                  onClick={() => setIsOpen(false)}
                />

                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  style={{ top: dropdownPos.top, right: dropdownPos.right }}
                  className="fixed w-[calc(100vw-2rem)] sm:w-80 bg-[#1c1c1e] rounded-3xl shadow-2xl shadow-black/30 border border-white/[0.08] z-[201] overflow-hidden origin-top-right"
                >
                  {/* Identite */}
                  <div className="p-5 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border-2 border-white/10 ring-1 ring-white/5 flex-shrink-0">
                        <img
                          src={user.imageUrl}
                          alt={user.fullName || ""}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[15px] font-medium tracking-tight text-white truncate">
                          {user.fullName}
                        </h3>
                        <p className="text-[11px] font-bold text-white/20 uppercase tracking-[0.1em] truncate mt-0.5">
                          {email}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#96A982]" />
                          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">
                            Gratuit
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-white/[0.06] mx-5" />

                  {/* Actions */}
                  <div className="p-2.5">
                    <button
                      onClick={() => navigateTo("/dashboard")}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium text-white/50 hover:bg-white/[0.06] hover:text-white transition-all duration-200 active:scale-[0.97]"
                    >
                      <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => navigateTo("/dashboard/settings")}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium text-white/50 hover:bg-white/[0.06] hover:text-white transition-all duration-200 active:scale-[0.97]"
                    >
                      <Settings2 className="w-4 h-4 flex-shrink-0" />
                      <span>Parametres</span>
                    </button>
                  </div>

                  {/* Deconnexion */}
                  <div className="p-2.5 bg-white/[0.02] border-t border-white/[0.06]">
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium text-white/40 hover:bg-white/[0.06] hover:text-red-400 transition-all duration-200 active:scale-[0.97] disabled:opacity-50"
                    >
                      <LogOut className="w-4 h-4 flex-shrink-0" />
                      <span>{isSigningOut ? "Deconnexion..." : "Deconnexion"}</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
