"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Check, Copy, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CodeBlock } from "./components/CodeBlock";

export default function APIDocsPage() {
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(
    "auth"
  );
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f]">
      {/* Hero Section */}
      <div className="pt-32 md:pt-48 pb-24 px-6 border-b border-black/[0.03]">
        <div className="max-w-6xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-2 bg-[#96A982]/10 rounded-full"
          >
            <span className="text-[11px] font-bold text-[#96A982] uppercase tracking-[0.2em]">
              API Documentation
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-[64px] font-medium tracking-tight leading-none"
          >
            Integrate Airlock into your website
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-black/50 font-medium max-w-2xl leading-relaxed"
          >
            Use our REST API to upload files, create share links, and track analytics programmatically.
            Complete documentation with examples for curl, JavaScript, and Python.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex gap-4 pt-8"
          >
            <Link
              href="/dashboard/api"
              className="px-8 py-4 bg-black text-white rounded-[24px] font-medium hover:bg-black/90 transition-all"
            >
              Generate API Key
            </Link>
            <Link
              href="#endpoints"
              className="px-8 py-4 border border-black/10 rounded-[24px] font-medium hover:bg-black/5 transition-all"
            >
              View Endpoints
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Authentication */}
      <div className="max-w-6xl mx-auto px-6 py-24 space-y-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-medium">Authentication</h2>
            <p className="text-lg text-black/50 font-medium">
              All API requests require a Bearer token in the Authorization header
            </p>
          </div>

          <div className="bg-[#f5f5f7] rounded-[32px] p-8 border border-black/[0.03] space-y-6">
            <div className="space-y-3">
              <h3 className="font-medium text-black/70">1. Generate an API Key</h3>
              <p className="text-black/50 font-medium">
                Go to{" "}
                <Link href="/dashboard/api" className="text-[#96A982] hover:underline">
                  Dashboard → API Keys
                </Link>{" "}
                and click "Create Key". Copy the key immediately—it will only be shown once.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-black/70">2. Include in Requests</h3>
              <p className="text-black/50 font-medium mb-3">
                Add the API key to every request header:
              </p>
              <CodeBlock
                code={`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://airlock.app/api/v1/folders`}
                language="bash"
                title="curl example"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-[16px] p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-blue-900">
                Keep your API key secret. Treat it like a password. If compromised, revoke
                immediately and create a new key.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Endpoints Section */}
      <div
        id="endpoints"
        className="max-w-6xl mx-auto px-6 py-24 space-y-12 border-t border-black/[0.03]"
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-2"
        >
          <h2 className="text-3xl font-medium">Endpoints</h2>
          <p className="text-lg text-black/50 font-medium">
            Complete reference for all available API endpoints
          </p>
        </motion.div>

        {/* Endpoint: GET /api/v1/folders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#f5f5f7] rounded-[32px] border border-black/[0.03] overflow-hidden"
        >
          <button
            onClick={() =>
              setExpandedEndpoint(expandedEndpoint === "folders" ? null : "folders")
            }
            className="w-full flex items-center justify-between p-8 hover:bg-black/5 transition-all"
          >
            <div className="flex items-center gap-4 text-left">
              <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-mono font-bold text-sm">
                GET
              </span>
              <span className="font-mono text-lg font-medium">/api/v1/folders</span>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-black/50 transition-transform ${
                expandedEndpoint === "folders" ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {expandedEndpoint === "folders" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-black/[0.03] overflow-hidden"
              >
                <div className="p-8 space-y-8">
                  <div className="space-y-3">
                    <h4 className="font-medium text-black/70">Description</h4>
                    <p className="text-black/50 font-medium">
                      List all folders in your workspace with pagination support.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-black/70">Query Parameters</h4>
                    <div className="bg-white rounded-[16px] p-4 space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <code className="font-mono font-bold text-sm">parentId</code>
                          <p className="text-sm text-black/50 mt-1">
                            Optional. Filter by parent folder (root if omitted)
                          </p>
                        </div>
                        <span className="text-xs font-bold text-black/30">optional</span>
                      </div>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <code className="font-mono font-bold text-sm">limit</code>
                          <p className="text-sm text-black/50 mt-1">
                            Maximum 100, defaults to 20
                          </p>
                        </div>
                        <span className="text-xs font-bold text-black/30">optional</span>
                      </div>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <code className="font-mono font-bold text-sm">offset</code>
                          <p className="text-sm text-black/50 mt-1">
                            Pagination offset, defaults to 0
                          </p>
                        </div>
                        <span className="text-xs font-bold text-black/30">optional</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-black/70">Required Scope</h4>
                    <div className="bg-white rounded-[16px] p-4">
                      <span className="text-sm font-bold text-[#96A982] bg-[#96A982]/10 px-3 py-1.5 rounded-lg inline-block">
                        folders:read
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-black/70">Examples</h4>
                    <CodeBlock
                      code={`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  "https://airlock.app/api/v1/folders?limit=20&offset=0"`}
                      language="bash"
                      title="curl"
                    />
                    <CodeBlock
                      code={`const response = await fetch(
  'https://airlock.app/api/v1/folders?limit=20',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  }
);

const { folders, total } = await response.json();
console.log(\`Found \${total} folders\`);
folders.forEach(folder => {
  console.log(\`- \${folder.name}\`);
});`}
                      language="javascript"
                      title="JavaScript (fetch)"
                    />
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-black/70">Response</h4>
                    <CodeBlock
                      code={`{
  "folders": [
    {
      "id": "folder_abc123",
      "name": "Documents",
      "parentId": null,
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 1
}`}
                      language="json"
                      title="Success Response (200)"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Endpoint: POST /api/v1/folders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-[#f5f5f7] rounded-[32px] border border-black/[0.03] overflow-hidden"
        >
          <button
            onClick={() =>
              setExpandedEndpoint(expandedEndpoint === "create-folder" ? null : "create-folder")
            }
            className="w-full flex items-center justify-between p-8 hover:bg-black/5 transition-all"
          >
            <div className="flex items-center gap-4 text-left">
              <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-mono font-bold text-sm">
                POST
              </span>
              <span className="font-mono text-lg font-medium">/api/v1/folders</span>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-black/50 transition-transform ${
                expandedEndpoint === "create-folder" ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {expandedEndpoint === "create-folder" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-black/[0.03] overflow-hidden"
              >
                <div className="p-8 space-y-8">
                  <div className="space-y-3">
                    <h4 className="font-medium text-black/70">Description</h4>
                    <p className="text-black/50 font-medium">
                      Create a new folder in your workspace
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-black/70">Request Body</h4>
                    <CodeBlock
                      code={`{
  "name": "New Folder",
  "parentId": "folder_abc123"  // optional
}`}
                      language="json"
                    />
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-black/70">Required Scope</h4>
                    <div className="bg-white rounded-[16px] p-4">
                      <span className="text-sm font-bold text-[#96A982] bg-[#96A982]/10 px-3 py-1.5 rounded-lg inline-block">
                        folders:write
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-black/70">Example</h4>
                    <CodeBlock
                      code={`const response = await fetch(
  'https://airlock.app/api/v1/folders',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'New Project',
      parentId: null  // Root level
    })
  }
);

const newFolder = await response.json();
console.log('Folder created:', newFolder.id);`}
                      language="javascript"
                      title="JavaScript"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Additional endpoints can be added similarly */}
      </div>

      {/* Error Codes Section */}
      <div className="max-w-6xl mx-auto px-6 py-24 space-y-12 border-t border-black/[0.03]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-2"
        >
          <h2 className="text-3xl font-medium">Error Codes</h2>
          <p className="text-lg text-black/50 font-medium">
            Understanding API error responses
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#f5f5f7] rounded-[32px] p-8 border border-black/[0.03] overflow-x-auto"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/[0.05]">
                <th className="text-left py-3 px-4 font-medium text-black/70">Code</th>
                <th className="text-left py-3 px-4 font-medium text-black/70">Status</th>
                <th className="text-left py-3 px-4 font-medium text-black/70">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {[
                ["AUTH_MISSING", "401", "Authorization header is missing or invalid"],
                ["AUTH_INVALID", "401", "The provided API key does not exist"],
                ["AUTH_REVOKED", "401", "The API key has been revoked or disabled"],
                ["INSUFFICIENT_SCOPE", "403", "The API key doesn't have the required permission"],
                ["RATE_LIMIT_EXCEEDED", "429", "Too many requests. Check Retry-After header"],
                ["RESOURCE_NOT_FOUND", "404", "The requested resource doesn't exist"],
                ["VALIDATION_ERROR", "400", "Invalid request data. Check error details"],
                ["STORAGE_QUOTA_EXCEEDED", "402", "Workspace storage limit reached"],
              ].map(([code, status, description]) => (
                <tr key={code}>
                  <td className="py-3 px-4">
                    <code className="font-mono text-sm font-bold text-[#96A982]">
                      {code}
                    </code>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-sm font-bold ${
                        status === "401"
                          ? "text-red-600"
                          : status === "403"
                            ? "text-orange-600"
                            : status === "429"
                              ? "text-yellow-600"
                              : "text-gray-600"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-black/60">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* Rate Limits Section */}
      <div className="max-w-6xl mx-auto px-6 py-24 space-y-12 border-t border-black/[0.03]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-2"
        >
          <h2 className="text-3xl font-medium">Rate Limits</h2>
          <p className="text-lg text-black/50 font-medium">
            API usage limits per API key
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { label: "Per Minute", limit: "60 requests" },
            { label: "Per Hour", limit: "1,000 requests" },
            { label: "Per Day", limit: "10,000 requests" },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-[#f5f5f7] rounded-[32px] p-8 border border-black/[0.03] text-center space-y-3"
            >
              <h4 className="font-medium text-black/70">{item.label}</h4>
              <p className="text-2xl font-bold">{item.limit}</p>
            </div>
          ))}
        </motion.div>

        <div className="bg-blue-50 border border-blue-200 rounded-[32px] p-8 flex gap-4">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900">Exceeding Limits</h4>
            <p className="text-sm font-medium text-blue-800">
              When you hit a rate limit, the API returns a 429 status code with a
              <code className="font-mono bg-white/50 px-1.5 py-0.5 rounded mx-1">
                Retry-After
              </code>
              header indicating when you can retry.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-6 py-24 text-center border-t border-black/[0.03] space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h2 className="text-3xl font-medium">Ready to get started?</h2>
          <p className="text-lg text-black/50 font-medium">
            Create your first API key and start integrating today
          </p>
          <Link
            href="/dashboard/api"
            className="inline-block px-8 py-4 bg-black text-white rounded-[24px] font-medium hover:bg-black/90 transition-all"
          >
            Generate API Key
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
