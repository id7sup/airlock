import { db } from "@/lib/firebase";
import { validateShareLink } from "@/services/sharing";
import { checkIfFolderIsChild } from "@/services/folders";
import { FolderOpen, Info, ChevronLeft, Lock } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { FileList } from "@/components/shared/FileList";
import { TrackEvent } from "@/components/shared/TrackEvent";
import Link from "next/link";
import { getClientIP, getGeolocationFromIP, getCloudflareLocationHeaders } from "@/lib/geolocation";
import { headers } from "next/headers";
import { trackEvent } from "@/services/analytics";
import { isPreviewBot } from "@/lib/visitor";

/**
 * Page publique pour afficher un sous-dossier partagé
 * 
 * Permet de naviguer dans les sous-dossiers d'un partage.
 * Vérifie que le sous-dossier appartient bien au dossier partagé.
 * 
 * @param params - Paramètres de la route (token, folderId)
 * @param searchParams - Paramètres de requête (pwd pour mot de passe)
 */
export default async function PublicShareFolderPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ token: string; folderId: string }>, 
  searchParams: Promise<{ pwd?: string }> 
}) {
  try {
    const { token, folderId } = await params;
    const { pwd } = await searchParams;
    
    if (!token || !folderId) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-apple-gray text-apple-text">
          <div className="apple-card p-12 text-center max-w-md shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Info className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2 tracking-tight">Paramètres invalides</h1>
            <p className="text-apple-secondary font-medium">
              Le lien de partage est invalide.
            </p>
          </div>
        </div>
      );
    }
    
    // Paralléliser la validation du lien et la récupération du dossier
    let result;
    let folderDoc;
    try {
      [result, folderDoc] = await Promise.all([
        validateShareLink(token),
        db.collection("folders").doc(folderId).get()
      ]);
    } catch (error: any) {
      console.error("[SHARE_FOLDER] Error validating link:", error?.message);
      return (
        <div className="min-h-screen flex items-center justify-center bg-apple-gray text-apple-text">
          <div className="apple-card p-12 text-center max-w-md shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Info className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2 tracking-tight">Erreur</h1>
            <p className="text-apple-secondary font-medium">
              Une erreur est survenue lors du chargement du partage.
            </p>
          </div>
        </div>
      );
    }

    // 1. Gérer les erreurs de validation
    if (!result || (result as any).error) {
      const errorResult = result as any;
      return (
        <div className="min-h-screen flex items-center justify-center bg-apple-gray text-apple-text">
          <div className="apple-card p-12 text-center max-w-md shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Info className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2 tracking-tight">Accès indisponible</h1>
            <p className="text-apple-secondary font-medium">
              {errorResult?.error === "EXPIRED" ? "Ce lien a expiré." : 
               errorResult?.error === "QUOTA_EXCEEDED" ? "Le quota de vues a été atteint." :
               "Ce lien n'est plus actif ou a été révoqué."}
            </p>
          </div>
        </div>
      );
    }

    const link = result as any;

    if (!link || !link.folderId) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-apple-gray text-apple-text">
          <div className="apple-card p-12 text-center max-w-md shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Info className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2 tracking-tight">Erreur</h1>
            <p className="text-apple-secondary font-medium">
              Les données du partage sont incomplètes.
            </p>
          </div>
        </div>
      );
    }

    // 2. Vérifier que le sous-dossier appartient au dossier partagé (récursif)
    // folderDoc a déjà été récupéré en parallèle

    if (!folderDoc.exists) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-apple-gray text-apple-text">
          <div className="apple-card p-12 text-center max-w-md shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Info className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2 tracking-tight">Dossier introuvable</h1>
            <p className="text-apple-secondary font-medium">
              Ce dossier n'existe pas ou a été supprimé.
            </p>
          </div>
        </div>
      );
    }

    const folderData = folderDoc.data();
    if (!folderData) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-apple-gray text-apple-text">
          <div className="apple-card p-12 text-center max-w-md shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Info className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2 tracking-tight">Erreur</h1>
            <p className="text-apple-secondary font-medium">
              Les données du dossier sont incomplètes.
            </p>
          </div>
        </div>
      );
    }

    // 2. Vérifier la hiérarchie et récupérer les fichiers/sous-dossiers en parallèle
    let files: any[] = [];
    let children: any[] = [];
    let isChildOfSharedFolder = false;
    try {
      const [filesSnapshot, childrenSnapshot, hierarchyCheck] = await Promise.all([
        db.collection("files")
          .where("folderId", "==", folderId)
          .select("name", "size", "mimeType", "s3Key", "updatedAt", "rule")
          .get(),
        db.collection("folders")
          .where("parentId", "==", folderId)
          .select("name", "parentId", "updatedAt")
          .get(),
        checkIfFolderIsChild(folderId, link.folderId)
      ]);
      isChildOfSharedFolder = hierarchyCheck;

      // Fonction pour convertir les timestamps Firestore
      const convertFirestoreData = (data: any): any => {
        if (!data || typeof data !== 'object') return data;
        const converted: any = {};
        for (const [key, value] of Object.entries(data)) {
          if (value && typeof value === 'object') {
            const val = value as any;
            if (val._seconds !== undefined && val._nanoseconds !== undefined) {
              converted[key] = new Date(val._seconds * 1000 + val._nanoseconds / 1000000).toISOString();
            } else if (val.toDate && typeof val.toDate === 'function') {
              converted[key] = val.toDate().toISOString();
            } else if (Array.isArray(value)) {
              converted[key] = value.map(item => convertFirestoreData(item));
            } else if (value.constructor === Object) {
              converted[key] = convertFirestoreData(value);
            } else {
              converted[key] = value;
            }
          } else {
            converted[key] = value;
          }
        }
        return converted;
      };

      files = filesSnapshot.docs.map(doc => ({ id: doc.id, ...convertFirestoreData(doc.data()) }));
      children = childrenSnapshot.docs.map(doc => ({ id: doc.id, ...convertFirestoreData(doc.data()) }));
    } catch (error: any) {
      console.error("[SHARE_FOLDER] Error fetching files/children:", error?.message);
      // Si c'est une erreur de hiérarchie, retourner l'erreur
      if (error?.message?.includes("hierarchy") || error?.message?.includes("checkIfFolderIsChild")) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-apple-gray text-apple-text">
            <div className="apple-card p-12 text-center max-w-md shadow-2xl">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Info className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold mb-2 tracking-tight">Erreur</h1>
              <p className="text-apple-secondary font-medium">
                Impossible de vérifier l'accès au dossier.
              </p>
            </div>
          </div>
        );
      }
      // Continuer avec des tableaux vides plutôt que de crasher
    }

    // Vérifier que le dossier est bien un enfant du dossier partagé
    if (!isChildOfSharedFolder) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-apple-gray text-apple-text">
          <div className="apple-card p-12 text-center max-w-md shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Info className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2 tracking-tight">Accès refusé</h1>
            <p className="text-apple-secondary font-medium">
              Ce dossier n'appartient pas au partage.
            </p>
          </div>
        </div>
      );
    }

    // Vérifier le blocage VPN/Datacenter si activé
    if (link.blockVpn === true) {
      try {
        const headersList = await headers();
        const clientIP = 
          headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
          headersList.get("x-real-ip") ||
          headersList.get("cf-connecting-ip") ||
          "unknown";
        
        if (clientIP !== 'unknown') {
          const geolocation = await getGeolocationFromIP(clientIP);
          if (geolocation && (geolocation.isVPN === true || geolocation.isDatacenter === true)) {
            // Tracker l'accès refusé
            try {
              const userAgent = headersList.get("user-agent") || undefined;
              const referer = headersList.get("referer") || undefined;
              const { generateVisitorId } = await import("@/lib/visitor");
              const visitorId = generateVisitorId(clientIP, userAgent);
              
              await trackEvent({
                linkId: link.id,
                eventType: "ACCESS_DENIED",
                invalidAttempt: true,
                denialReason: "VPN_BLOCKED",
                geolocation,
                visitorId,
                referer,
                userAgent,
              });
            } catch (e) {
              console.error("Error tracking ACCESS_DENIED:", e);
            }
            
            return (
              <div className="min-h-screen flex items-center justify-center bg-apple-gray text-apple-text">
                <div className="apple-card p-12 text-center max-w-md shadow-2xl">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2 tracking-tight">Accès refusé</h1>
                  <p className="text-apple-secondary font-medium">
                    L'accès via VPN ou datacenter est bloqué pour ce lien.
                  </p>
                </div>
              </div>
            );
          }
        }
      } catch (error) {
        console.error("Error checking VPN/Datacenter:", error);
        // En cas d'erreur, on autorise l'accès pour ne pas bloquer les utilisateurs légitimes
      }
    }

    // Tracker la prévisualisation (bot) côté serveur
    (async () => {
      try {
        const headersList = await headers();
        const clientIP = getClientIP(headersList);
        const userAgent = headersList.get("user-agent") || undefined;
        const referer = headersList.get("referer") || undefined;
        
        const { generateVisitorId } = await import("@/lib/visitor");
        const visitorId = generateVisitorId(clientIP, userAgent);
        
        let geolocation;
        try {
          if (clientIP !== 'unknown') {
            // Utiliser les headers Cloudflare si disponibles
            const cfHeaders = getCloudflareLocationHeaders(headersList);
            geolocation = await getGeolocationFromIP(clientIP, cfHeaders);
            if (geolocation) {
              geolocation = Object.fromEntries(
                Object.entries(geolocation).filter(([_, v]) => v !== undefined)
              ) as any;
            }
          }
        } catch (error) {
          console.error("Error getting geolocation:", error);
        }

        // Détecter si c'est un bot de prévisualisation
        const isBot = isPreviewBot(userAgent, referer, geolocation?.isDatacenter);

        await trackEvent({
          linkId: link.id,
          eventType: "LINK_PREVIEW",
          geolocation,
          visitorId,
          referer,
          userAgent,
          folderId: folderId,
        });
      } catch (error) {
        console.error("Error tracking LINK_PREVIEW:", error);
      }
    })().catch(() => {});

    // Note: LINK_PREVIEW est tracké côté serveur, OPEN_FOLDER sera tracké côté client après interaction
    return (
      <>
        <TrackEvent linkId={link.id} eventType="OPEN_FOLDER" folderId={folderId} />
        <div className="min-h-screen bg-apple-gray py-12 px-6 text-apple-text animate-in fade-in duration-700">
        <div className="max-w-4xl mx-auto">
          <header className="flex items-center justify-center mb-12">
            <Logo className="w-20 h-20" />
          </header>

          <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl shadow-black/[0.03] border border-black/[0.01]">
            <div className="p-8 border-b border-black/[0.02] bg-gradient-to-br from-white to-apple-gray/[0.05]">
              <div className="flex items-center gap-4">
                {folderData.parentId && folderData.parentId !== link.folderId ? (
                  <Link 
                    href={`/share/${token}/folder/${folderData.parentId}`}
                    className="w-12 h-12 flex items-center justify-center bg-apple-gray hover:bg-apple-gray/80 rounded-full transition-all text-apple-text active:scale-90"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Link>
                ) : (
                  <Link 
                    href={`/share/${token}`}
                    className="w-12 h-12 flex items-center justify-center bg-apple-gray hover:bg-apple-gray/80 rounded-full transition-all text-apple-text active:scale-90"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Link>
                )}
                <div className="w-14 h-14 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center shadow-xl shadow-brand-primary/20">
                  <FolderOpen className="w-8 h-8 fill-current" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{folderData.name || "Dossier"}</h1>
                  <p className="text-apple-secondary text-sm font-semibold uppercase tracking-widest mt-1 opacity-50">
                    {files.length} fichiers • {children.length} sous-dossiers • Partage Sécurisé
                  </p>
                  <p className="text-apple-secondary/60 text-xs font-medium mt-2">Explorez les sous-dossiers et fichiers de ce dossier partagé. Utilisez le bouton retour pour remonter dans la hiérarchie.</p>
                </div>
              </div>
            </div>

            <FileList 
              files={files} 
              children={children}
              shareLinkId={link.id} 
              token={token} 
            />
          </div>
          
          <div className="mt-16 flex flex-col items-center gap-4 opacity-30">
            <Logo className="w-8 h-8 grayscale" />
            <p className="text-center text-[9px] text-apple-secondary font-bold uppercase tracking-[0.3em]">
              Airlock • Souveraineté Numérique
            </p>
          </div>
        </div>
      </div>
      </>
    );
  } catch (error: any) {
    console.error("[SHARE_FOLDER] Critical error:", error?.message);
    return (
      <div className="min-h-screen flex items-center justify-center bg-apple-gray text-apple-text">
        <div className="apple-card p-12 text-center max-w-md shadow-2xl">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Info className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2 tracking-tight">Erreur</h1>
          <p className="text-apple-secondary font-medium">
            Une erreur inattendue est survenue. Veuillez réessayer plus tard.
          </p>
        </div>
      </div>
    );
  }
}

