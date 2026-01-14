export default function Loading() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto text-black animate-in fade-in duration-300">
      {/* Header avec bouton retour et titre */}
      <div className="flex items-center gap-3 sm:gap-6 mb-6 sm:mb-8 lg:mb-12">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/5 rounded-full animate-pulse" />
        <div className="space-y-2">
          {/* Nom du dossier */}
          <div className="h-6 sm:h-8 w-48 bg-black/5 rounded-lg animate-pulse" />
          {/* Métadonnées (Dossier • X éléments) */}
          <div className="flex items-center gap-2">
            <div className="h-3 w-16 bg-black/5 rounded animate-pulse" />
            <div className="h-3 w-1 bg-black/5 rounded" />
            <div className="h-3 w-20 bg-black/5 rounded animate-pulse" />
          </div>
          {/* Texte descriptif */}
          <div className="h-4 w-64 bg-black/5 rounded-lg animate-pulse mt-1" />
        </div>
      </div>
      
      {/* Boutons d'action */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-6">
        <div className="h-9 sm:h-11 w-24 bg-black/5 rounded-lg animate-pulse" />
        <div className="h-9 sm:h-11 w-24 bg-black/5 rounded-lg animate-pulse" />
        <div className="h-9 sm:h-11 w-20 bg-black/5 rounded-lg animate-pulse" />
      </div>

      {/* Liste des fichiers et dossiers - Vue desktop (table) */}
      <div className="hidden lg:block bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/5">
        <div className="divide-y divide-black/[0.02]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-6 flex items-center gap-5 animate-pulse">
              {/* Checkbox */}
              <div className="w-5 h-5 bg-black/5 rounded" />
              {/* Icône */}
              <div className="w-12 h-12 bg-black/5 rounded-xl" />
              {/* Nom */}
              <div className="flex-1 space-y-2">
                <div className="h-5 w-48 bg-black/5 rounded-lg" />
                <div className="h-3 w-32 bg-black/5 rounded-lg" />
              </div>
              {/* Type/Taille */}
              <div className="h-4 w-20 bg-black/5 rounded" />
              {/* Date */}
              <div className="h-4 w-24 bg-black/5 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Vue mobile */}
      <div className="lg:hidden space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-white rounded-xl border border-black/[0.05] animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-black/5 rounded" />
              <div className="w-10 h-10 bg-black/5 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-black/5 rounded-lg" />
                <div className="h-3 w-24 bg-black/5 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
