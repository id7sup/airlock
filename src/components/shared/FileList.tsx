import { db } from "@/lib/firebase";
import { FileListClient } from "./FileListClient";

export async function FileList({ 
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
  try {
    // Récupérer le downloadDefault du lien
    const linkDoc = await db.collection("shareLinks").doc(shareLinkId).get();
    const linkData = linkDoc.exists ? linkDoc.data() : null;
    const downloadAllowed = linkData?.downloadDefault ?? (linkData?.allowDownload ?? true);

    // Ajouter la règle à tous les fichiers
    const filesWithRules = files.map((file: any) => ({
      ...file,
      rule: { downloadAllowed },
      type: 'file' as const
    }));

    return (
      <FileListClient 
        files={filesWithRules}
        children={children || []}
        shareLinkId={shareLinkId}
        token={token}
      />
    );
  } catch (error: any) {
    console.error("[FILE_LIST] Error fetching share link data:", error);
    // En cas d'erreur, utiliser les valeurs par défaut
    const filesWithRules = files.map((file: any) => ({
      ...file,
      rule: { downloadAllowed: true },
      type: 'file' as const
    }));

    return (
      <FileListClient 
        files={filesWithRules}
        children={children || []}
        shareLinkId={shareLinkId}
        token={token}
      />
    );
  }
}

