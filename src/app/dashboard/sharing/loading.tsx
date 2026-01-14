export default function Loading() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto text-black animate-in fade-in duration-300">
      {/* Header avec onglets */}
      <div className="mb-8">
        <div className="h-10 w-64 bg-black/5 rounded-lg animate-pulse mb-4" />
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-black/5 rounded-xl animate-pulse" />
          <div className="h-10 w-24 bg-black/5 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Liste de cartes de partage */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-black/[0.05] p-6 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {/* Icône dossier */}
                <div className="w-12 h-12 bg-brand-primary/10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  {/* Nom du dossier */}
                  <div className="h-5 w-48 bg-black/5 rounded-lg" />
                  {/* Date */}
                  <div className="h-3 w-32 bg-black/5 rounded-lg" />
                </div>
              </div>
              <div className="flex items-center gap-8 ml-6">
                {/* Stats Vues */}
                <div className="text-right space-y-1">
                  <div className="h-3 w-12 bg-black/5 rounded" />
                  <div className="h-6 w-8 bg-black/5 rounded" />
                </div>
                {/* Stats Downloads */}
                <div className="text-right border-l border-black/[0.05] pl-8 space-y-1">
                  <div className="h-3 w-16 bg-black/5 rounded" />
                  <div className="h-6 w-8 bg-black/5 rounded" />
                </div>
                {/* Flèche */}
                <div className="w-5 h-5 bg-black/5 rounded ml-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
