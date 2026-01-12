"use client";

import Link from "next/link";
import { FolderOpen, History, Bookmark, Trash2, Settings2, LayoutList, Users, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import { useSidebar } from "./SidebarProvider";
import { motion, AnimatePresence } from "framer-motion";

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

  // Variantes d'animation pour la sidebar
  const sidebarVariants = {
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      }
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8,
        staggerChildren: 0.05,
        delayChildren: 0.1,
      }
    }
  };

  // Variantes pour le contenu interne
  const contentVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  // Variantes pour les items de navigation
  const itemVariants = {
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      {/* Overlay avec blur pour mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={close}
          />
        )}
      </AnimatePresence>
      
      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        className="fixed top-0 left-0 bottom-0 z-50 w-64 border-r border-black/[0.05] flex flex-col h-screen bg-white shadow-2xl shadow-black/10"
      >
        {/* Effet de flou en haut avec animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isOpen ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="absolute top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md z-10 pointer-events-none"
        />

        {/* Contenu principal */}
        <motion.div
          variants={contentVariants}
          className="p-4 lg:p-6 relative z-20 flex-1 overflow-y-auto"
        >
          {/* Header avec logo */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between mb-6 lg:mb-10"
          >
            <Link 
              href="/" 
              className="flex items-center gap-3 px-3 hover:opacity-80 transition-opacity group/logo"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Logo className="w-8 h-8" />
              </motion.div>
              <span className="text-xl font-semibold tracking-tight">Airlock</span>
            </Link>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={close}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors group"
              aria-label="Fermer la barre latérale"
            >
              <X className="w-4 h-4 text-black/40 group-hover:text-black/60 transition-colors" />
            </motion.button>
          </motion.div>

          {/* Navigation principale */}
          <motion.nav
            variants={contentVariants}
            className="space-y-1"
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                variants={itemVariants}
                custom={index}
                initial="closed"
                animate={isOpen ? "open" : "closed"}
                transition={{ delay: index * 0.05 + 0.2 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-300 group relative overflow-hidden ${
                    item.active 
                      ? "bg-black text-white shadow-md shadow-black/10" 
                      : "text-black/40 hover:text-black hover:bg-black/5"
                  }`}
                >
                  {/* Effet de hover animé */}
                  {!item.active && (
                    <motion.div
                      className="absolute inset-0 bg-black/5 rounded-xl"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  <motion.div
                    className="relative z-10 flex items-center gap-3 w-full"
                    whileHover={{ x: 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <item.icon className={`w-4 h-4 transition-colors duration-300 relative z-10 ${
                      item.active 
                        ? "text-white" 
                        : "text-brand-primary"
                    }`} />
                    <span className="relative z-10">{item.label}</span>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.nav>

          {/* Section Administration */}
          <motion.div
            variants={contentVariants}
            className="mt-10"
            initial="closed"
            animate={isOpen ? "open" : "closed"}
            transition={{ delay: 0.4 }}
          >
            <motion.h4
              variants={itemVariants}
              className="px-4 text-[11px] font-bold text-black/20 uppercase tracking-[0.2em] mb-4"
            >
              Administration
            </motion.h4>
            <nav className="space-y-1">
              {adminItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  variants={itemVariants}
                  custom={index}
                  initial="closed"
                  animate={isOpen ? "open" : "closed"}
                  transition={{ delay: index * 0.05 + 0.45 }}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-300 group relative overflow-hidden ${
                      item.active 
                        ? "bg-black text-white shadow-md shadow-black/10" 
                        : "text-black/40 hover:text-black hover:bg-black/5"
                    }`}
                  >
                    {!item.active && (
                      <motion.div
                        className="absolute inset-0 bg-black/5 rounded-xl"
                        initial={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    <motion.div
                      className="relative z-10 flex items-center gap-3 w-full"
                      whileHover={{ x: 2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <item.icon className={`w-4 h-4 transition-colors duration-300 relative z-10 ${
                        item.active 
                          ? "text-white" 
                          : "text-brand-primary"
                      }`} />
                      <span className="relative z-10">{item.label}</span>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        </motion.div>
        
        {/* Section Stockage en bas */}
        <motion.div
          variants={contentVariants}
          className="mt-auto p-4 lg:p-6 relative z-20"
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="p-4 lg:p-6 bg-[#f5f5f7] rounded-[32px] border border-black/[0.03]"
          >
            <p className="text-[11px] font-bold mb-3 uppercase tracking-widest text-black/30">Stockage</p>
            <div className="h-1.5 bg-black/5 rounded-full mb-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                className="h-full bg-black rounded-full"
              />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-tighter text-black/40">
              {storageFormatted} Go / 5 Go
            </p>
          </motion.div>
        </motion.div>
      </motion.aside>
    </>
  );
}
