"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    q: "Où sont stockés mes fichiers ?",
    a: "Vos fichiers sont stockés de manière souveraine sur des buckets compatibles S3 (Cloudflare R2 ou AWS S3). Nous ne conservons que les métadonnées pour faire fonctionner l'application."
  },
  {
    q: "Le destinataire a-t-il besoin d'un compte ?",
    a: "Non. Vos destinataires accèdent à vos dossiers via un lien sécurisé unique. Ils n'ont pas besoin de créer de compte Clerk pour visualiser ou télécharger les fichiers."
  },
  {
    q: "Puis-je révoquer un lien après l'envoi ?",
    a: "Oui, absolument. Depuis votre centre de partage, vous pouvez révoquer un lien en un clic, changer son mot de passe ou couper le droit de téléchargement instantanément."
  },
  {
    q: "Quelle est la limite de stockage ?",
    a: "La version gratuite inclut 5 Go de stockage sécurisé. Pour des besoins plus importants, notre offre Pro permet d'étendre cette limite."
  },
  {
    q: "Est-ce que mes fichiers sont chiffrés ?",
    a: "Oui. L'accès aux fichiers se fait via des URLs présignées à durée de vie très courte. Sans ce token éphémère généré par Airlock, les fichiers sont inaccessibles sur le bucket."
  },
  {
    q: "Puis-je limiter le nombre de vues ?",
    a: "Oui, c'est l'une de nos fonctionnalités phares. Vous pouvez définir un quota maximum de consultations. Une fois atteint, le lien s'auto-détruit."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-32 bg-apple-gray/30 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold tracking-tight mb-16 text-center">Questions fréquentes</h2>
        
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-black/[0.03]">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-apple-gray/50 transition-colors"
              >
                <span className="font-bold text-lg tracking-tight">{faq.q}</span>
                {openIndex === i ? <Minus className="w-5 h-5 text-apple-primary" /> : <Plus className="w-5 h-5 text-apple-primary" />}
              </button>
              
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-apple-secondary font-medium leading-relaxed opacity-80 border-t border-black/[0.03] pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

