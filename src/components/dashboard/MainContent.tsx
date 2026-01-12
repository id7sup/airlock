"use client";

import { useSidebar } from "./SidebarProvider";
import { motion } from "framer-motion";

export function MainContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <motion.div
      animate={{
        marginLeft: isOpen ? "16rem" : "0rem",
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      }}
      className="flex-1 flex flex-col min-w-0 overflow-hidden"
    >
      {children}
    </motion.div>
  );
}
