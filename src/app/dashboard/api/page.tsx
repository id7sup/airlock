"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Copy, Trash2, Eye, EyeOff, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { listAPIKeys, createAPIKey, revokeAPIKey } from "@/services/api-keys";

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

  useEffect(() => {
    if (!isLoaded || !userId) return;

    loadKeys();
  }, [isLoaded, userId]);

  const loadKeys = async () => {
    try {
      setLoading(true);
      // In a real app, this would be a Server Action or API call
      // For now, just show empty state
      setKeys([]);
    } catch (error) {
      console.error("Failed to load API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim() || selectedScopes.length === 0) {
      alert("Please enter a name and select at least one scope");
      return;
    }

    try {
      // In a real app, this would be a Server Action
      // const newKey = await createAPIKey({
      //   name: newKeyName,
      //   userId: userId!,
      //   workspaceId: "workspace123",
      //   scopes: selectedScopes,
      // });
      // setCreatedKey(newKey);
      // setShowCreateModal(false);
      // await loadKeys();

      alert("Feature coming soon! API key creation requires backend Server Action");
    } catch (error) {
      console.error("Failed to create API key:", error);
      alert("Failed to create API key");
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key? It cannot be recovered.")) {
      return;
    }

    try {
      // await revokeAPIKey(keyId);
      // setKeys(keys.filter(k => k.id !== keyId));
      alert("Feature coming soon! Revoke requires backend Server Action");
    } catch (error) {
      console.error("Failed to revoke API key:", error);
      alert("Failed to revoke API key");
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
    setCopyFeedback(`${label} copied!`);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
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
                  API Keys
                </h1>
                <p className="text-lg text-black/50 font-medium">
                  Manage API access to your workspace
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-[24px] font-medium hover:bg-black/90 transition-all"
              >
                <Plus className="w-5 h-5" />
                Create Key
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        {loading ? (
          <div className="text-center py-12">Loading API keys...</div>
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
                <h3 className="text-2xl font-medium mb-2">No API keys yet</h3>
                <p className="text-black/50 font-medium">
                  Create your first API key to start integrating Airlock into your website
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-[24px] font-medium hover:bg-black/90 transition-all"
              >
                <Plus className="w-5 h-5" />
                Create API Key
              </motion.button>
              <p className="text-sm text-black/40 font-medium">
                <Link href="/api-docs" className="text-[#96A982] hover:underline">
                  View API documentation →
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
                          {key.isRevoked ? "Revoked" : key.isActive ? "Active" : "Inactive"}
                        </span>
                        {key.expiresAt && (
                          <span className="text-xs font-medium text-black/50">
                            Expires {new Date(key.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-black/50 font-medium">Created</p>
                        <p className="font-medium">
                          {new Date(key.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-black/50 font-medium">Last Used</p>
                        <p className="font-medium">
                          {key.lastUsedAt
                            ? new Date(key.lastUsedAt).toLocaleDateString()
                            : "Never"}
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

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRevokeKey(key.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      disabled={key.isRevoked}
                      title="Revoke API key"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
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
                <h2 className="text-2xl font-medium mb-2">API Key Created</h2>
                <p className="text-black/50 font-medium">
                  Copy your API key and store it safely. You won't see it again.
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
                  onClick={() => copyToClipboard(createdKey.key, "API key")}
                  className="w-full flex items-center justify-center gap-2 bg-[#96A982] text-white text-sm font-medium py-2 rounded-lg hover:bg-[#96A982]/90 transition-all"
                >
                  <Copy className="w-4 h-4" />
                  Copy to Clipboard
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-[16px] p-4">
                <p className="text-sm font-medium text-yellow-900">
                  ⚠️ Store this key securely. If lost, you'll need to create a new one.
                </p>
              </div>

              <button
                onClick={() => setCreatedKey(null)}
                className="w-full bg-black text-white py-3 rounded-[24px] font-medium hover:bg-black/90 transition-all"
              >
                Done
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
                <h2 className="text-2xl font-medium mb-2">Create API Key</h2>
                <p className="text-black/50 font-medium">
                  Generate a new API key with specific scopes
                </p>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <p className="text-sm font-medium text-black/70 mb-2">Key Name</p>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production API"
                    className="w-full px-4 py-2 bg-[#f5f5f7] border border-black/[0.03] rounded-[12px] font-medium focus:outline-none focus:border-[#96A982]"
                  />
                </label>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-black/70">Scopes</p>
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
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateKey}
                  className="flex-1 bg-black text-white py-3 rounded-[24px] font-medium hover:bg-black/90 transition-all"
                >
                  Create
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
