"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Copy, Trash2, Eye, EyeOff, Plus, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  createAPIKeyAction,
  listAPIKeysAction,
  revokeAPIKeyAction,
} from "@/lib/actions/api-keys";

interface APIKey {
  id: string;
  name: string;
  userId: string;
  workspaceId: string;
  scopes: string[];
  isActive: boolean;
  isRevoked: boolean;
  lastUsedAt: string | null;
  totalRequests: number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function APIPage() {
  const { userId, isLoaded } = useAuth();
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    "files:read",
    "files:write",
    "folders:read",
    "folders:write",
    "shares:read",
    "shares:write",
    "analytics:read",
  ]);
  const [createdKey, setCreatedKey] = useState<(APIKey & { key: string }) | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    loadKeys();
  }, [isLoaded, userId]);

  const loadKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await listAPIKeysAction();

      if (result.success) {
        setKeys(result.keys || []);
      } else {
        setError(result.error || "Impossible de charger les clés API");
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim() || selectedScopes.length === 0) {
      setError("Veuillez entrer un nom et sélectionner au moins une permission");
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      const result = await createAPIKeyAction({
        name: newKeyName.trim(),
        scopes: selectedScopes,
        expiresAt: null,
      });

      if (result.success && result.apiKey) {
        setCreatedKey(result.apiKey as APIKey & { key: string });
        setShowCreateModal(false);
        setNewKeyName("");
        await loadKeys();
      } else {
        setError(result.error || "Impossible de créer la clé API");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setError("Une erreur est survenue lors de la création");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (
      !confirm(
        "Êtes-vous sûr ? Vous ne pouvez pas récupérer cette clé API."
      )
    ) {
      return;
    }

    try {
      setIsRevoking(keyId);
      setError(null);
      const result = await revokeAPIKeyAction(keyId);

      if (result.success) {
        setKeys(keys.filter((k) => k.id !== keyId));
      } else {
        setError(result.error || "Impossible de révoquer la clé API");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setError("Une erreur est survenue");
    } finally {
      setIsRevoking(null);
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`${label} copié !`);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  if (!isLoaded) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f]">
      {/* Hero Section */}
      <div className="pt-12 pb-16 px-6 border-b border-black/[0.03]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-2">
                  Clés API
                </h1>
                <p className="text-lg text-black/50 font-medium">
                  Gérez l'accès API à votre espace de travail
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-[24px] font-medium hover:bg-black/90 transition-all"
              >
                <Plus className="w-5 h-5" />
                Créer une clé
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto px-6 py-4 mt-6 bg-red-50 border border-red-200 rounded-[16px] flex gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-900">{error}</p>
        </motion.div>
      )}

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        {loading ? (
          <div className="text-center py-12">Chargement des clés API...</div>
        ) : keys.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-24 bg-[#f5f5f7] rounded-[48px] border border-black/[0.03]"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-medium mb-2">Aucune clé API</h3>
                <p className="text-black/50 font-medium">
                  Créez votre première clé API pour commencer l'intégration
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-[24px] font-medium hover:bg-black/90 transition-all"
              >
                <Plus className="w-5 h-5" />
                Créer une clé API
              </motion.button>
              <p className="text-sm text-black/40 font-medium">
                <Link
                  href="/documentation-api"
                  className="text-[#96A982] hover:underline"
                >
                  Consulter la documentation →
                </Link>
              </p>
            </div>
          </motion.div>
        ) : (
          // Keys List
          <div className="space-y-4">
            {keys.map((key, index) => (
              <motion.div
                key={key.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-[#f5f5f7] border border-black/[0.03] rounded-[32px] p-6 hover:shadow-lg hover:shadow-black/5 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">{key.name}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs font-bold text-[#96A982] uppercase tracking-wider bg-[#96A982]/10 px-3 py-1 rounded-full">
                          {key.isRevoked ? "Révoquée" : key.isActive ? "Active" : "Inactive"}
                        </span>
                        {key.expiresAt && (
                          <span className="text-xs font-medium text-black/50">
                            Expire le {new Date(key.expiresAt).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-black/50 font-medium">Créée le</p>
                        <p className="font-medium">
                          {new Date(key.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-black/50 font-medium">Dernière utilisation</p>
                        <p className="font-medium">
                          {key.lastUsedAt
                            ? new Date(key.lastUsedAt).toLocaleDateString("fr-FR")
                            : "Jamais"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {key.scopes.map((scope) => (
                        <span
                          key={scope}
                          className="text-xs font-medium text-[#96A982] bg-[#96A982]/10 px-2 py-1 rounded-full"
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevokeKey(key.id)}
                    disabled={isRevoking === key.id || key.isRevoked}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                    title="Révoquer la clé API"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Created Key Display Modal */}
        {createdKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setCreatedKey(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[32px] p-8 max-w-md w-full space-y-6 border border-black/[0.03]"
            >
              <div>
                <h2 className="text-2xl font-medium mb-2">Clé API créée</h2>
                <p className="text-black/50 font-medium">
                  Copiez votre clé API et stockez-la en sécurité. Vous ne la verrez plus.
                </p>
              </div>

              <div className="bg-[#232323] rounded-[24px] p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <code className="text-[#96A982] font-mono text-sm break-all">
                    {visibleKeys.has("new") ? createdKey.key : "•".repeat(40)}
                  </code>
                  <button
                    onClick={() => toggleKeyVisibility("new")}
                    className="text-white hover:text-[#96A982] transition-colors flex-shrink-0"
                  >
                    {visibleKeys.has("new") ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <button
                  onClick={() => copyToClipboard(createdKey.key, "Clé API")}
                  className="w-full flex items-center justify-center gap-2 bg-[#96A982] text-white text-sm font-medium py-2 rounded-lg hover:bg-[#96A982]/90 transition-all"
                >
                  <Copy className="w-4 h-4" />
                  Copier
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-[16px] p-4">
                <p className="text-sm font-medium text-yellow-900">
                  ⚠️ Conservez cette clé en sécurité. Si elle est perdue, créez-en une nouvelle.
                </p>
              </div>

              <button
                onClick={() => setCreatedKey(null)}
                className="w-full bg-black text-white py-3 rounded-[24px] font-medium hover:bg-black/90 transition-all"
              >
                Terminé
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Create Key Modal */}
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[32px] p-8 max-w-md w-full space-y-6 border border-black/[0.03] max-h-[90vh] overflow-y-auto"
            >
              <div>
                <h2 className="text-2xl font-medium mb-2">Créer une clé API</h2>
                <p className="text-black/50 font-medium">
                  Générez une nouvelle clé API avec des permissions spécifiques
                </p>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <p className="text-sm font-medium text-black/70 mb-2">Nom de la clé</p>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Ex: Production API"
                    className="w-full px-4 py-2 bg-[#f5f5f7] border border-black/[0.03] rounded-[12px] font-medium focus:outline-none focus:border-[#96A982]"
                  />
                </label>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-black/70">Permissions</p>
                <div className="space-y-2">
                  {[
                    "files:read",
                    "files:write",
                    "folders:read",
                    "folders:write",
                    "shares:read",
                    "shares:write",
                    "analytics:read",
                  ].map((scope) => (
                    <label key={scope} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(scope)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedScopes([...selectedScopes, scope]);
                          } else {
                            setSelectedScopes(
                              selectedScopes.filter((s) => s !== scope)
                            );
                          }
                        }}
                        className="w-4 h-4 rounded border-black/20 text-[#96A982]"
                      />
                      <span className="text-sm font-medium">{scope}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 rounded-[24px] font-medium border border-black/10 hover:bg-black/5 transition-all"
                  disabled={isCreating}
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateKey}
                  disabled={isCreating}
                  className="flex-1 bg-black text-white py-3 rounded-[24px] font-medium hover:bg-black/90 transition-all disabled:opacity-50"
                >
                  {isCreating ? "Création..." : "Créer"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Toast Feedback */}
        {copyFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 bg-black text-white px-6 py-3 rounded-full font-medium text-sm shadow-lg"
          >
            {copyFeedback}
          </motion.div>
        )}
      </div>
    </div>
  );
}
