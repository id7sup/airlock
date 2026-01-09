import { db } from "@/lib/firebase";
import { validateShareLink } from "@/services/sharing";
import { createNotification } from "@/services/notifications";
import { getClientIP, getGeolocationFromIP } from "@/lib/geolocation";
import { headers } from "next/headers";
import { trackEvent } from "@/services/analytics";
import { FolderOpen, Info, Lock } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { FileList } from "@/components/shared/FileList";
import { TrackEvent } from "@/components/shared/TrackEvent";
import crypto from "crypto";

/**
 * Page publique de partage de dossier
 * 
 * Affiche le contenu d'un dossier partagé via un token unique.
 * Gère la validation du lien, la vérification du mot de passe,
 * et l'affichage des fichiers et sous-dossiers.
 * 
 * @param params - Paramètres de la route (token)
 * @param searchParams - Paramètres de requête (pwd pour mot de passe)
 */
export default async function PublicSharePage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ token: string }>, 
  searchParams: Promise<{ pwd?: string }> 
}) {
  // Vérifier que Firebase est initialisé
  try {
    const { db } = await import("@/lib/firebase");
    if (!db) {
      throw new Error("Firebase db n'est pas disponible");
    }
  } catch (firebaseError: any) {
    console.error("[SHARE] Firebase initialization error:", firebaseError?.message);
    return (
      <div className="min-h-screen flex items-center justify-center bg-apple-gray text-apple-text">
        <div className="apple-card p-12 text-center max-w-md shadow-2xl">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Info className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2 tracking-tight">Erreur de configuration</h1>
          <p className="text-apple-secondary font-medium">
            Firebase n'est pas correctement configuré. Veuillez contacter l'administrateur.
          </p>
          <p className="text-xs text-red-500 mt-4 font-mono">
            {firebaseError?.message || "Erreur inconnue"}
          </p>
        </div>
      </div>
    );
  }
  
  try {
    const { token } = await params;
    const { pwd } = await searchParams;
    
    // Valider le token
    if (!token || typeof token !== 'string') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-apple-gray text-apple-text">
          <div className="apple-card p-12 text-center max-w-md shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Info className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2 tracking-tight">Lien invalide</h1>
            <p className="text-apple-secondary font-medium">
              Le lien de partage est invalide.
            </p>
          </div>
        </div>
      );
    }
    
    // Valider le lien de partage
    let result;
    try {
      result = await validateShareLink(token);
    } catch (error: any) {
      console.error("[SHARE] Error validating link:", error?.message);
      return (
        <div className="min-h-screen flex items-center justify-center bg-apple-gray text-apple-text">
          <div className="apple-card p-12 text-center max-w-md shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Info className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2 tracking-tight">Erreur de validation</h1>
            <p className="text-apple-secondary font-medium mb-4">
              Impossible de valider le lien de partage.
            </p>
            <div className="mt-4 p-4 bg-red-50 rounded-xl text-left">
              <p className="text-xs font-mono text-red-700 break-all">
                <strong>Type:</strong> {error?.name || "Error"}<br/>
                <strong>Code:</strong> {error?.code || "UNKNOWN"}<br/>
                <strong>Message:</strong> {error?.message || "Erreur inconnue"}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Gérer les erreurs de validation
    if (!result || (result as any).error) {
      const errorResult = result as any;
      
      // Notification d'expiration en arrière-plan (sans bloquer)
      if (errorResult?.folderId && errorResult.error === "EXPIRED") {
        (async () => {
          try {
            const ownerPerm = await db.collection("permissions")
              .where("folderId", "==", errorResult.folderId)
              .where("role", "==", "OWNER")
              .limit(1)
              .get();
            
            const ownerId = !ownerPerm.empty ? ownerPerm.docs[0].data()?.userId : null;
            if (ownerId) {
              const folderDoc = await db.collection("folders").doc(errorResult.folderId).get();
              await createNotification(ownerId, "EXPIRATION", {
                folderId: errorResult.folderId,
                folderName: folderDoc.data()?.name || "Dossier inconnu"
              }).catch(() => {});
            }
          } catch (e) {
            // Ignorer silencieusement
          }
        })();
      }

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

    // Filtre pays si configuré
    if (Array.isArray(link.allowedCountries) && link.allowedCountries.length > 0) {
      const headersList = await headers();
      const ip =
        headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
        headersList.get("x-real-ip") ||
        headersList.get("cf-connecting-ip") ||
        "unknown";
      let country: string | null = null;
      try {
        const geo = ip && ip !== "unknown" ? await getGeolocationFromIP(ip) : null;
        country = geo?.country ? String(geo.country).toUpperCase() : null;
      } catch (e) {
        // ignore
      }
      const isAllowed = country ? link.allowedCountries.map((c: string) => c.toUpperCase()).includes(country) : false;
      if (!isAllowed) {
        await trackEvent({ linkId: link.id, eventType: "ACCESS_DENIED", invalidAttempt: true }).catch(() => {});
        return (
          <div className="min-h-screen flex items-center justify-center bg-apple-gray text-apple-text">
            <div className="apple-card p-12 text-center max-w-md shadow-2xl">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Info className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold mb-2 tracking-tight">Accès refusé</h1>
              <p className="text-apple-secondary font-medium">
                Ce lien n'est pas disponible depuis votre pays.
              </p>
            </div>
          </div>
        );
      }
    }

    // Vérifier que le lien a les données nécessaires
    if (!link || !link.folderId) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-apple-gray text-apple-text">
          <div className="apple-card p-12 text-center max-w-md shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Info className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2 tracking-tight">Lien invalide</h1>
            <p className="text-apple-secondary font-medium">
              Ce lien de partage n'est plus valide ou a été supprimé.
            </p>
          </div>
        </div>
      );
    }

    // Vérifier que le dossier existe
    if (!link.folder) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-apple-gray text-apple-text">
          <div className="apple-card p-12 text-center max-w-md shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Info className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2 tracking-tight">Dossier introuvable</h1>
            <p className="text-apple-secondary font-medium">
              Le dossier partagé n'existe plus ou a été supprimé.
            </p>
          </div>
        </div>
      );
    }

    // Notifier en arrière-plan (sans bloquer le rendu)
    // Le tracking est géré par le composant TrackEvent
      (async () => {
        try {
          const ownerPerm = await db.collection("permissions")
            .where("folderId", "==", link.folderId)
            .where("role", "==", "OWNER")
            .limit(1)
            .get();
          
          const ownerId = !ownerPerm.empty ? ownerPerm.docs[0].data()?.userId || null : null;
          if (ownerId && link.folder?.name) {
            await createNotification(ownerId, "VIEW", {
              folderName: link.folder.name,
              folderId: link.folderId,
            }).catch(() => {});
          }
        } catch (e) {
          // Ignorer silencieusement
        }
    })().catch(() => {});

    // Vérifier le mot de passe si requis
    if (link.passwordHash) {
      try {
        const inputHash = pwd ? crypto.createHash("sha256").update(pwd).digest("hex") : null;
        const isPasswordCorrect = inputHash === link.passwordHash;

        if (!pwd || !isPasswordCorrect) {
          // Notifier en cas de mot de passe saisi mais incorrect
          if (pwd) {
            (async () => {
              try {
                const ownerPerm = await db.collection("permissions")
                  .where("folderId", "==", link.folderId)
                  .where("role", "==", "OWNER")
                  .limit(1)
                  .get();
                
                const ownerId = !ownerPerm.empty ? ownerPerm.docs[0].data()?.userId || null : null;
                if (ownerId && link.folder?.name) {
                  await createNotification(ownerId, "PASSWORD_DENIED", {
                    folderName: link.folder.name,
                    folderId: link.folderId,
                  }).catch(() => {});
                }
              } catch (e) {
                // ignorer
              }
            })().catch(() => {});
          }
          return (
            <div className="min-h-screen flex items-center justify-center bg-apple-gray text-apple-text">
              <div className="apple-card p-12 text-center max-w-md w-full shadow-2xl">
                <Lock className="w-12 h-12 text-apple-primary mx-auto mb-6" />
                <h1 className="text-2xl font-bold mb-6 tracking-tight">Dossier Protégé</h1>
                {pwd && !isPasswordCorrect && (
                  <p className="text-red-500 text-xs font-bold mb-4 uppercase tracking-widest">Mot de passe incorrect</p>
                )}
                <form className="space-y-4" action={`/share/${token}`} method="get">
                  <input 
                    name="pwd"
                    type="password" 
                    placeholder="Saisissez le mot de passe..."
                    className="w-full px-4 py-3 bg-apple-gray rounded-xl border border-transparent outline-none focus:bg-white focus:border-apple-primary/20"
                  />
                  <button type="submit" className="apple-button w-full h-12 shadow-lg shadow-apple-primary/20">Déverrouiller l'accès</button>
                </form>
              </div>
            </div>
          );
        } else {
          // Notification d'accès réussi via mot de passe (en arrière-plan)
          (async () => {
            try {
              const ownerPerm = await db.collection("permissions")
                .where("folderId", "==", link.folderId)
                .where("role", "==", "OWNER")
                .limit(1)
                .get();
              
              const ownerId = !ownerPerm.empty ? ownerPerm.docs[0].data()?.userId || null : null;
              if (ownerId && link.folder?.name) {
                await createNotification(ownerId, "PASSWORD_ACCESS", {
                  folderName: link.folder.name,
                  folderId: link.folderId,
                }).catch(() => {});
              }
            } catch (e) {
              // Ignorer silencieusement
            }
          })();
        }
      } catch (e) {
        console.error("[SHARE] Error checking password:", e);
        return (
          <div className="min-h-screen flex items-center justify-center bg-apple-gray text-apple-text">
            <div className="apple-card p-12 text-center max-w-md shadow-2xl">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Info className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold mb-2 tracking-tight">Erreur</h1>
              <p className="text-apple-secondary font-medium">
                Une erreur est survenue lors de la vérification du mot de passe.
              </p>
            </div>
          </div>
        );
      }
    }

    // Préparer les données pour l'affichage
    const folderName = link.folder.name || "Dossier sans nom";
    const files = Array.isArray(link.folder.files) ? link.folder.files : [];
    const children = Array.isArray(link.folder.children) ? link.folder.children : [];

    // Afficher la page de partage
    return (
      <div className="min-h-screen bg-apple-gray py-12 px-6 text-apple-text animate-in fade-in duration-700">
        <TrackEvent linkId={link.id} eventType="OPEN_SHARE" />
        <div className="max-w-4xl mx-auto">
          <header className="flex items-center justify-center mb-12">
            <Logo className="w-20 h-20" />
          </header>

          <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl shadow-black/[0.03] border border-black/[0.01]">
            <div className="p-8 border-b border-black/[0.02] bg-gradient-to-br from-white to-apple-gray/[0.05]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-apple-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-apple-primary/20">
                  <FolderOpen className="w-8 h-8 fill-current" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{folderName}</h1>
                  <p className="text-apple-secondary text-sm font-semibold uppercase tracking-widest mt-1 opacity-50">
                    {files.length} fichiers • Partage Sécurisé
                  </p>
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
    );
  } catch (error: any) {
    // Erreur critique - logger et lancer pour error.tsx
    console.error("[SHARE] Critical error:", error?.message);
    throw new Error(`[${error?.name || "Error"}] ${error?.message || "Erreur inconnue"} (Code: ${error?.code || "UNKNOWN"})`);
  }
}
