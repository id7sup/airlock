"use client";

import { useSidebar } from "./SidebarProvider";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function MainContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();
  // Initialiser à true par défaut pour éviter le décalage au chargement sur mobile
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <motion.div
      animate={{
        marginLeft: !isMobile && isOpen ? "16rem" : "0rem",
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      }}
      className="flex-1 flex flex-col min-w-0 overflow-hidden w-full"
    >
      {children}
    </motion.div>
  );
}
