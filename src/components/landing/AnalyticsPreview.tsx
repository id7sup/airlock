"use client";

import { motion } from "framer-motion";
import { Activity, Eye, Download } from "lucide-react";
import { SharingAnalyticsChart } from "@/components/dashboard/SharingAnalyticsChart";

const STATS = [
  { label: "Vues", val: "1,248", icon: Eye },
  { label: "Downloads", val: "412", icon: Download },
  { label: "Alertes", val: "0", icon: Activity },
];

export function AnalyticsPreview() {
  const dummyData = [
    { date: '2025-12-19', views: 40, downloads: 10 },
    { date: '2025-12-20', views: 30, downloads: 5 },
    { date: '2025-12-21', views: 60, downloads: 20 },
    { date: '2025-12-22', views: 45, downloads: 8 },
    { date: '2025-12-23', views: 90, downloads: 25 },
    { date: '2025-12-24', views: 75, downloads: 15 },
    { date: '2025-12-25', views: 120, downloads: 35 },
  ];

  return (
    <section className="py-32 bg-white px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
        
        {/* Mockup Analytics */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex-1 w-full max-w-2xl bg-apple-gray rounded-[40px] p-10 shadow-2xl shadow-black/[0.02] border border-black/[0.01]"
        >
          <div className="flex items-center justify-between mb-12">
            <h4 className="font-bold text-lg tracking-tight">Vue d'ensemble</h4>
            <div className="px-3 py-1 bg-apple-primary/10 text-apple-primary rounded-full text-[10px] font-bold uppercase tracking-widest">Temps réel</div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-12">
            {STATS.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-[24px] shadow-sm">
                <stat.icon className="w-4 h-4 text-apple-secondary mb-3 opacity-40" />
                <p className="text-[10px] font-bold text-apple-secondary uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-bold tabular-nums tracking-tight">{stat.val}</p>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-[32px] shadow-sm h-64">
            <SharingAnalyticsChart data={dummyData} />
          </div>
        </motion.div>

        {/* Texte */}
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Suivi des accès <br /> à la seconde près.
          </h2>
          <p className="text-apple-secondary text-xl font-medium max-w-lg opacity-70">
            Ne restez plus dans le noir. Sachez exactement quand vos documents sont ouverts ou téléchargés.
          </p>
          <button className="apple-button text-lg px-8 py-3 shadow-lg shadow-apple-primary/20">
            Découvrir le Control Center
          </button>
        </div>

      </div>
    </section>
  );
}

