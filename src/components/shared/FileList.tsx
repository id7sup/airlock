import { db } from "@/lib/firebase";
import { FileListClient } from "./FileListClient";

/**
 * Composant Server Component pour la liste de fichiers partagés
 * 
 * Récupère les règles de téléchargement depuis le lien de partage
 * et les passe au composant client pour l'affichage.
 * 
 * @param files - Liste des fichiers à afficher
 * @param children - Liste des sous-dossiers à afficher
 * @param shareLinkId - ID du lien de partage
 * @param token - Token du lien de partage
 */
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
    // Récupérer les règles de téléchargement depuis le lien
    const linkDoc = await db.collection("shareLinks").doc(shareLinkId).get();
    const linkData = linkDoc.exists ? linkDoc.data() : null;
    const downloadAllowed = linkData?.downloadDefault ?? (linkData?.allowDownload ?? true);

    // Ajouter la règle de téléchargement à chaque fichier
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
    // En cas d'erreur, utiliser les valeurs par défaut (téléchargement autorisé)
    console.error("[FILE_LIST] Error:", error?.message);
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
