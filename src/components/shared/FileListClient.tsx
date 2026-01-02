"use client";

import { FileIcon, Download, Eye, FolderOpen } from "lucide-react";
import Link from "next/link";
import { TrackEvent } from "./TrackEvent";

export function FileListClient({ 
  files, 
  children,
  shareLinkId, 
  token 
}: { 
  files: any[]; 
  children?: any[];
  shareLinkId: string; 
  token: string;
}) {
  // Ajouter la règle à tous les fichiers
  const filesWithRules = files.map((file: any) => ({
    ...file,
    rule: { downloadAllowed: file.rule?.downloadAllowed ?? true },
    type: 'file' as const
  }));

  // Ajouter les sous-dossiers à la liste
  const allItems = [
    ...(children || []).map((child: any) => ({ ...child, type: 'folder' })),
    ...filesWithRules,
  ];

  if (allItems.length === 0) {
    return (
      <div className="p-20 text-center text-apple-secondary font-medium opacity-40 uppercase tracking-widest text-[10px]">
        Ce dossier est vide
      </div>
    );
  }

  return (
    <div className="divide-y divide-black/[0.02]">
      {allItems.map((item: any) => {
        if (item.type === 'folder') {
          return (
            <Link
              key={item.id}
              href={`/share/${token}/folder/${item.id}`}
              className="p-6 flex items-center justify-between hover:bg-apple-gray/[0.02] transition-colors group block"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-apple-gray rounded-xl flex items-center justify-center text-apple-secondary group-hover:bg-orange-50 group-hover:text-orange-600 transition-all duration-300">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-apple-text tracking-tight">{item.name}</p>
                  <p className="text-[10px] text-apple-secondary font-bold uppercase tracking-widest mt-0.5 opacity-40">
                    Dossier
                  </p>
                </div>
              </div>
              <div className="p-3.5 bg-apple-gray/50 text-apple-secondary rounded-2xl">
                <Eye className="w-5 h-5 opacity-30" />
              </div>
            </Link>
          );
        }

        const canDownload = item.rule.downloadAllowed;
        
        return (
          <div key={item.id} className="p-6 flex items-center justify-between hover:bg-apple-gray/[0.02] transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-apple-gray rounded-xl flex items-center justify-center text-apple-secondary group-hover:bg-orange-50 group-hover:text-orange-600 transition-all duration-300">
                <FileIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-apple-text tracking-tight">{item.name}</p>
                <p className="text-[10px] text-apple-secondary font-bold uppercase tracking-widest mt-0.5 opacity-40">
                  {(item.size / 1024 / 1024).toFixed(2)} Mo
                </p>
              </div>
            </div>
            
            {canDownload ? (
              <a 
                href={`/api/public/download?fileId=${item.id}&token=${token}`}
                onClick={() => {
                  // Track download
                  fetch("/api/analytics/track-event", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      linkId: shareLinkId,
                      eventType: "DOWNLOAD_FILE",
                      fileId: item.id,
                      fileName: item.name,
                    }),
                  }).catch(console.error);
                }}
                className="p-3.5 bg-apple-primary text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-apple-primary/20"
              >
                <Download className="w-5 h-5" />
              </a>
            ) : (
              <Link
                href={`/share/${token}/view?fileId=${item.id}`}
                className="p-3.5 bg-apple-primary text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-apple-primary/20"
              >
                <Eye className="w-5 h-5" />
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}

