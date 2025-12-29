"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { 
  FolderOpen, 
  Lock, 
  ArrowUpRight, 
  TrendingUp, 
  ShieldCheck, 
  Link as LinkIcon, 
  FileText, 
  LockKeyhole, 
  Download, 
  Eye,
  MousePointer2,
  Check
} from "lucide-react";

const STEPS = [
  {
    title: "Dépôt sécurisé",
    desc: "Glissez vos dossiers. Vos fichiers sont chiffrés et envoyés vers votre coffre R2 souverain.",
    icon: FolderOpen,
    color: "from-apple-primary to-[#404040]",
    content: (
      <div className="w-full h-full p-8 flex flex-col gap-6 bg-gradient-to-b from-white to-apple-gray/20">
        <div className="flex items-center gap-4 p-5 bg-white rounded-3xl border border-black/5 shadow-xl shadow-black/[0.02]">
          <div className="w-12 h-12 bg-apple-primary/10 rounded-2xl flex items-center justify-center">
            <FileText className="text-apple-primary w-6 h-6" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="h-2 w-3/4 bg-black/10 rounded-full" />
            <div className="h-1.5 w-1/2 bg-black/5 rounded-full" />
          </div>
        </div>
        <motion.div 
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="flex items-center gap-4 p-5 bg-white rounded-3xl border border-black/5 shadow-xl shadow-black/[0.02] ml-12"
        >
          <div className="w-12 h-12 bg-apple-primary/10 rounded-2xl flex items-center justify-center">
            <FileText className="text-apple-primary w-6 h-6" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="h-2 w-2/3 bg-black/10 rounded-full" />
            <div className="h-1.5 w-1/3 bg-black/5 rounded-full" />
          </div>
        </motion.div>
        <div className="mt-auto flex flex-col items-center gap-4 pb-4">
          <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden px-0.5">
            <motion.div 
              animate={{ width: ["0%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="h-full bg-apple-primary rounded-full shadow-[0_0_10px_rgba(36,63,41,0.3)]"
            />
          </div>
          <p className="text-[10px] font-bold text-apple-primary uppercase tracking-[0.2em] animate-pulse">
            Encryption AES-256 en cours...
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Gestion des accès",
    desc: "Définissez les règles : lecture seule, mot de passe, ou expiration automatique.",
    icon: Lock,
    color: "from-orange-500 to-orange-700",
    content: (
      <div className="w-full h-full p-10 space-y-8 bg-white relative">
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-apple-secondary uppercase tracking-widest opacity-40">Réglages de sécurité</p>
          <div className="flex items-center justify-between p-5 bg-apple-gray/50 rounded-[24px] border border-black/[0.03] shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-apple-primary/10 rounded-xl text-apple-primary">
                <Download className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="h-2 w-28 bg-apple-text/80 rounded-full" />
                <div className="h-1.5 w-40 bg-apple-text/20 rounded-full" />
              </div>
            </div>
            <div className="w-12 h-6 bg-apple-primary rounded-full relative">
              <motion.div 
                animate={{ x: [0, 24, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" 
              />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 bg-apple-gray/50 rounded-[24px] border border-black/[0.03] shadow-sm opacity-60">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gray-200 rounded-xl text-gray-400">
                <LockKeyhole className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="h-2 w-20 bg-apple-text/80 rounded-full" />
                <div className="h-1.5 w-32 bg-apple-text/20 rounded-full" />
              </div>
            </div>
            <div className="w-12 h-6 bg-gray-200 rounded-full relative">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        </div>
        <motion.div 
          animate={{ x: [200, 320, 200], y: [200, 120, 200] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
          className="absolute z-20"
        >
          <MousePointer2 className="w-6 h-6 text-black fill-black" />
        </motion.div>
      </div>
    )
  },
  {
    title: "Génération du lien",
    desc: "Votre Airlock est prêt. Copiez le lien sécurisé et envoyez-le à vos destinataires.",
    icon: ArrowUpRight,
    color: "from-blue-500 to-blue-700",
    content: (
      <div className="w-full h-full flex flex-col items-center justify-center p-10 gap-10 text-center bg-gradient-to-b from-white to-green-50/30">
        <div className="relative">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 bg-green-500 text-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-green-500/40 relative z-10"
          >
            <Check className="w-12 h-12" />
          </motion.div>
          <div className="absolute inset-0 bg-green-500 opacity-20 blur-3xl rounded-full animate-pulse" />
        </div>
        
        <div className="space-y-4 w-full max-w-[280px]">
          <div className="h-14 bg-white rounded-2xl w-full flex items-center px-5 gap-4 border border-black/5 shadow-xl shadow-black/[0.02]">
            <LinkIcon className="w-5 h-5 text-apple-primary" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2 w-full bg-black/10 rounded-full" />
              <div className="h-1 w-2/3 bg-black/5 rounded-full" />
            </div>
          </div>
          <div className="h-14 bg-apple-primary rounded-2xl w-full flex items-center justify-center text-white text-xs font-bold uppercase tracking-[0.2em] shadow-xl shadow-apple-primary/30">
            Copier le lien
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Suivi analytique",
    desc: "Surveillez chaque vue et chaque téléchargement en temps réel depuis votre centre de contrôle.",
    icon: TrendingUp,
    color: "from-purple-500 to-purple-700",
    content: (
      <div className="w-full h-full p-8 flex flex-col gap-8 bg-apple-gray/10">
        <div className="flex gap-4">
          <div className="flex-1 bg-white rounded-3xl shadow-xl shadow-black/[0.02] p-6 flex flex-col gap-4 border border-black/[0.01]">
            <div className="flex items-center gap-2">
              <Eye className="w-3 h-3 text-apple-primary" />
              <div className="h-1.5 w-10 bg-black/5 rounded-full" />
            </div>
            <p className="text-3xl font-bold tabular-nums tracking-tighter">1,248</p>
          </div>
          <div className="flex-1 bg-white rounded-3xl shadow-xl shadow-black/[0.02] p-6 flex flex-col gap-4 border border-black/[0.01]">
            <div className="flex items-center gap-2">
              <Download className="w-3 h-3 text-green-500" />
              <div className="h-1.5 w-12 bg-black/5 rounded-full" />
            </div>
            <p className="text-3xl font-bold tabular-nums tracking-tighter text-green-600">412</p>
          </div>
        </div>
        <div className="flex-1 bg-white rounded-[40px] shadow-2xl shadow-black/[0.02] relative overflow-hidden p-8 border border-black/[0.01]">
          <div className="flex items-center justify-between mb-6">
            <div className="h-2 w-24 bg-black/10 rounded-full" />
            <div className="w-2 h-2 rounded-full bg-apple-primary animate-ping" />
          </div>
          <svg viewBox="0 0 100 40" className="w-full h-full stroke-apple-primary stroke-[3] fill-none drop-shadow-[0_8px_16px_rgba(36,63,41,0.2)]">
            <motion.path 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              d="M0 35 Q 25 5, 50 25 T 100 10" 
            />
          </svg>
        </div>
      </div>
    )
  }
];

export function Scrollytelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section ref={containerRef} className="relative bg-white min-h-[400vh]">
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 lg:grid-cols-2 gap-32 w-full items-center">
          
          {/* Colonne Gauche (Visuals) */}
          <div className="relative flex items-center justify-center h-[600px] order-2 lg:order-1">
            <div className="relative w-full max-w-lg aspect-square bg-apple-gray/40 rounded-[80px] border border-black/[0.02] shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] p-1 backdrop-blur-3xl">
              {STEPS.map((step, i) => {
                const stepProgress = 1 / STEPS.length;
                const start = i * stepProgress;
                const end = (i + 1) * stepProgress;
                
                // Correction des plages pour éviter les cards vides au début et à la fin
                let opacityRange = [start, start + 0.05, end - 0.05, end];
                let scaleRange = [start, start + 0.05, end - 0.05, end];
                let yRange = [start, start + 0.05, end - 0.05, end];

                if (i === 0) {
                  opacityRange = [0, 0, end - 0.05, end];
                  scaleRange = [0, 0, end - 0.05, end];
                  yRange = [0, 0, end - 0.05, end];
                } else if (i === STEPS.length - 1) {
                  opacityRange = [start, start + 0.05, 1, 1];
                  scaleRange = [start, start + 0.05, 1, 1];
                  yRange = [start, start + 0.05, 1, 1];
                }

                const opacity = useTransform(scrollYProgress, opacityRange, [0, 1, 1, 0]);
                const scale = useTransform(scrollYProgress, scaleRange, [0.9, 1, 1, 0.9]);
                const rotate = useTransform(scrollYProgress, [start, end], [5, -5]);
                const y = useTransform(scrollYProgress, yRange, [20, 0, 0, -20]);

                return (
                  <motion.div
                    key={i}
                    style={{ opacity, scale, rotate, y }}
                    className="absolute inset-0 p-12"
                  >
                    <div className="w-full h-full bg-white rounded-[56px] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.12)] border border-black/[0.01] overflow-hidden flex flex-col transform-gpu">
                      <div className="h-14 border-b border-black/[0.03] bg-apple-gray/30 flex items-center px-8 gap-2.5 shrink-0">
                        <div className="w-3 h-3 rounded-full bg-red-400/20" />
                        <div className="w-3 h-3 rounded-full bg-orange-400/20" />
                        <div className="w-3 h-3 rounded-full bg-green-400/20" />
                        <div className="mx-auto h-6 w-1/2 bg-white/50 rounded-lg border border-black/[0.02]" />
                      </div>
                      <div className="flex-1 min-h-0">
                        {step.content}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Colonne Droite (Text) */}
          <div className="relative h-[600px] flex items-center order-1 lg:order-2">
            {STEPS.map((step, i) => {
              const stepProgress = 1 / STEPS.length;
              const start = i * stepProgress;
              const end = (i + 1) * stepProgress;
              
              let opacityRange = [start, start + 0.05, end - 0.05, end];
              let xRange = [start, start + 0.05, end - 0.05, end];

              if (i === 0) {
                opacityRange = [0, 0, end - 0.05, end];
                xRange = [0, 0, end - 0.05, end];
              } else if (i === STEPS.length - 1) {
                opacityRange = [start, start + 0.05, 1, 1];
                xRange = [start, start + 0.05, 1, 1];
              }

              const opacity = useTransform(scrollYProgress, opacityRange, [0, 1, 1, 0]);
              const x = useTransform(scrollYProgress, xRange, [40, 0, 0, -40]);

              return (
                <motion.div
                  key={i}
                  style={{ opacity, x }}
                  className="absolute inset-0 flex flex-col justify-center space-y-10 pr-12"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} text-white rounded-3xl flex items-center justify-center font-bold text-3xl shadow-2xl shadow-black/10`}>
                    {i + 1}
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-6xl md:text-7xl font-bold tracking-tighter text-apple-text leading-[0.9]">{step.title}</h3>
                    <p className="text-apple-secondary text-2xl md:text-3xl font-medium leading-tight opacity-70 max-w-md">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
