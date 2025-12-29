"use client";

import Image from "next/image";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LogoProps {
  className?: string;
}

/**
 * Composant Logo centralisé.
 * Utilise l'image logo.png pour une identité premium.
 */
export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden", className)}>
      <Image 
        src="/assets/logo.png" 
        alt="Airlock" 
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
