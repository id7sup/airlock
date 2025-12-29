"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { Shield, Key, Eye, Trash2 } from "lucide-react";

const POINTS = [
  { title: "Souveraineté totale", desc: "Vos fichiers sont stockés sur vos propres buckets Cloudflare R2 ou AWS S3.", icon: Shield },
  { title: "Secrets préservés", desc: "Tokens hachés en SHA-256 et URLs signées à durée de vie ultra-courte.", icon: Key },
  { title: "Traçabilité", desc: "Chaque accès est tracé en temps réel. Vous savez qui voit quoi, et quand.", icon: Eye },
  { title: "Droit à l'oubli", desc: "Suppression définitive ou corbeille sécurisée pour gérer vos purges.", icon: Trash2 },
];

export function SecuritySpotlight() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 500, damping: 50 });
  const springY = useSpring(mouseY, { stiffness: 500, damping: 50 });

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative py-32 bg-apple-primary text-white overflow-hidden group"
    >
      {/* Spotlight effect */}
      <motion.div 
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at ${springX}px ${springY}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mb-24"
        >
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Sécurité robuste, <br /> sans complexité.
          </h2>
          <p className="text-white/60 text-xl font-medium">
            Nous avons simplifié l'infrastructure pour que vous puissiez vous concentrer sur vos échanges.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {POINTS.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="space-y-4 relative z-10"
            >
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                <point.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold tracking-tight">{point.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed font-medium">
                {point.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

