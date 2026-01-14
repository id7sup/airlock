export default function Loading() {
  return (
    <div className="min-h-screen bg-apple-gray py-12 px-6 text-apple-text animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-12">
          <div className="w-20 h-20 bg-apple-gray rounded-full animate-pulse" />
        </div>
        <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl shadow-black/[0.03] border border-black/[0.01]">
          <div className="p-8 border-b border-black/[0.02] bg-gradient-to-br from-white to-apple-gray/[0.05]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-apple-gray rounded-full animate-pulse" />
              <div className="w-14 h-14 bg-apple-gray rounded-2xl animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-apple-gray rounded-lg animate-pulse" />
                <div className="h-4 w-64 bg-apple-gray rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
          <div className="divide-y divide-black/[0.02]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-apple-gray rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 bg-apple-gray rounded-lg" />
                    <div className="h-3 w-24 bg-apple-gray rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
