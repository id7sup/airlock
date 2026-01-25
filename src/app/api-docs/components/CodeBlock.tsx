"use client";

import { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language: "bash" | "javascript" | "typescript" | "json" | "python";
  title?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language,
  title,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-[24px] overflow-hidden border border-black/[0.05] bg-[#232323]">
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#1a1a1a]">
          <p className="text-sm font-medium text-white/70">{title}</p>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
      )}

      {/* Code */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={atomOneDark}
          showLineNumbers={showLineNumbers}
          wrapLines={true}
          customStyle={{
            margin: 0,
            padding: "24px",
            fontSize: "13px",
            lineHeight: "1.6",
            backgroundColor: "#232323",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {/* Copy Button (without title) */}
      {!title && (
        <div className="px-6 py-3 border-t border-white/10 bg-[#1a1a1a] flex justify-end">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
