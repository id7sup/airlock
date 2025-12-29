"use client";

import { motion } from "framer-motion";
import { UserPlus, Network, LayoutList } from "lucide-react";

const WAYS = [
  {
    title: "Partage Interne",
    desc: "Invitez votre équipe avec des rôles précis (Editor, Viewer) sur chaque dossier.",
    icon: UserPlus,
    color: "bg-apple-primary",
  },
  {
    title: "Lien Public Contrôlé",
    desc: "Générez un lien avec mot de passe, expiration et quota de vues maximum.",
    icon: Network,
    color: "bg-green-700",
  },
  {
    title: "Salle de Revue",
    desc: "Créez un espace en lecture seule pour vos audits ou présentations clients.",
    icon: LayoutList,
    color: "bg-orange-700",
  }
];

export function WaysToUse() {
  return (
    <section className="py-32 px-6 bg-apple-gray/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center md:text-left"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Une plateforme, trois usages.
          </h2>
          <p className="text-apple-secondary text-lg font-medium opacity-60">
            Airlock s'adapte à tous vos besoins de confidentialité.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {WAYS.map((way, i) => (
            <motion.div
              key={way.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, rotate: i % 2 === 0 ? 1 : -1 }}
              className="bg-white p-10 rounded-[40px] shadow-2xl shadow-black/[0.02] border border-black/[0.01] flex flex-col items-start gap-6 group"
            >
              <div className={`w-16 h-16 ${way.color} rounded-[22px] flex items-center justify-center text-white shadow-lg`}>
                <way.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">{way.title}</h3>
                <p className="text-apple-secondary font-medium leading-relaxed opacity-70">
                  {way.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

