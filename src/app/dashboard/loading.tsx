export default function Loading() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto text-black animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 lg:mb-12">
        <div className="space-y-2">
          {/* Titre "Mes dossiers" */}
          <div className="h-8 sm:h-10 w-48 bg-black/5 rounded-lg animate-pulse" />
          {/* Sous-titre descriptif */}
          <div className="h-5 w-64 bg-black/5 rounded-lg animate-pulse" />
        </div>
        {/* Boutons d'action */}
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-black/5 rounded-xl animate-pulse" />
          <div className="h-10 w-24 bg-black/5 rounded-xl animate-pulse" />
        </div>
      </div>
      {/* Grille de cartes de dossiers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white rounded-xl sm:rounded-2xl border border-black/[0.05] p-4 sm:p-5 lg:p-6 animate-pulse">
            {/* Icône dossier en haut */}
            <div className="w-12 h-12 bg-brand-primary/10 rounded-xl mb-4" />
            {/* Nom du dossier */}
            <div className="h-5 w-32 bg-black/5 rounded-lg mb-2" />
            {/* Stats fichiers */}
            <div className="h-3 w-24 bg-black/5 rounded-lg mb-1" />
            {/* Date */}
            <div className="h-3 w-20 bg-black/5 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
