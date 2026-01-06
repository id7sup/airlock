"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface AuthCarouselProps {
  images: string[];
  texts?: {
    title: string;
    subtitle: string;
  }[];
}

export function AuthCarousel({ images, texts }: AuthCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const defaultTexts = [
    { title: "Trouvez votre espace sécurisé", subtitle: "Partagez en quelques clics, accédez en quelques clics." },
    { title: "Contrôle total", subtitle: "Gérez vos partages avec précision et simplicité." },
    { title: "Sécurité avant tout", subtitle: "Vos données sont protégées et chiffrées." },
  ];

  const displayTexts = texts || defaultTexts;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority={currentIndex === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />
        </motion.div>
      </AnimatePresence>

      {/* Overlay content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-12 text-white">
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-4 leading-tight">
                {displayTexts[currentIndex]?.title || displayTexts[0].title}
              </h2>
              <p className="text-lg md:text-xl text-white/90 font-medium">
                {displayTexts[currentIndex]?.subtitle || displayTexts[0].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Carousel indicators */}
          <div className="flex gap-2 mt-8">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  index === currentIndex
                    ? "w-8 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Aller à la slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

