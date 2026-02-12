"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur de connexion");
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch {
      setError("Erreur de connexion au serveur");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl shadow-black/[0.06] border border-black/[0.04] p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-black">
              Admin Airlock
            </h1>
            <p className="text-sm text-black/40 mt-1">
              Espace d&apos;administration
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-black/30 uppercase tracking-[0.15em] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#f5f5f7] rounded-xl border border-black/[0.06] text-[15px] text-black placeholder:text-black/25 focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
                placeholder="admin@airlock.com"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-black/30 uppercase tracking-[0.15em] mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#f5f5f7] rounded-xl border border-black/[0.06] text-[15px] text-black placeholder:text-black/25 focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
                placeholder="Mot de passe"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium text-center py-1">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-black text-white rounded-2xl text-[15px] font-medium hover:bg-black/85 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
