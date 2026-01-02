"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function IndexedPagesCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // Calculer le nombre de pages indexées depuis le sitemap
    const fetchSitemap = async () => {
      try {
        const response = await fetch("/sitemap.xml");
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");
        const urls = xml.getElementsByTagName("url");
        setCount(urls.length);
      } catch (error) {
        // En cas d'erreur, utiliser un nombre par défaut basé sur les routes connues
        setCount(14); // Nombre approximatif de pages indexables
      }
    };

    fetchSitemap();
  }, []);

  if (count === null) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
      <CheckCircle2 className="w-4 h-4 text-green-600" />
      <span className="text-sm font-semibold text-green-700">
        {count} pages indexées
      </span>
    </div>
  );
}

