export default function Loading() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto text-black animate-in fade-in duration-300">
      {/* Header avec bouton retour */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 bg-black/5 rounded-full animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-64 bg-black/5 rounded-lg animate-pulse" />
          <div className="h-4 w-48 bg-black/5 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 mb-8">
        <div className="h-10 w-32 bg-black/5 rounded-xl animate-pulse" />
        <div className="h-10 w-24 bg-black/5 rounded-xl animate-pulse" />
        <div className="h-10 w-28 bg-black/5 rounded-xl animate-pulse" />
      </div>

      {/* Contenu principal - Vue globale */}
      <div className="bg-white rounded-2xl border border-black/[0.05] p-8 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 bg-[#f5f5f7] rounded-xl space-y-2 animate-pulse">
              <div className="h-3 w-20 bg-black/5 rounded" />
              <div className="h-8 w-16 bg-black/5 rounded" />
            </div>
          ))}
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-[#f5f5f7] rounded-xl animate-pulse" />
          <div className="h-64 bg-[#f5f5f7] rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
