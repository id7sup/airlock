"use client";

import { useSidebar } from "./SidebarProvider";

export function MainContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <div 
      className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? "lg:ml-64" : "lg:ml-0"
      }`}
    >
      {children}
    </div>
  );
}
