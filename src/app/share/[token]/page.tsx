import { db } from "@/lib/firebase";
import { validateShareLink } from "@/services/sharing";
import { trackLinkActivity } from "@/services/analytics";
import { createNotification } from "@/services/notifications";
import { FolderOpen, Info, Lock } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { FileList } from "@/components/shared/FileList";
import { TrackEvent } from "@/components/shared/TrackEvent";
import crypto from "crypto";

export default async function PublicSharePage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ token: string }>, 
  searchParams: Promise<{ pwd?: string }> 
}) {
  try {
    const { token } = await params;
    const { pwd } = await searchParams;
    
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
    
    let result;
    try {
      result = await validateShareLink(token);
    } catch (error) {
      console.error("Error validating share link:", error);
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
      
      // Récupérer le propriétaire pour notifier de l'expiration/quota (sans bloquer si ça échoue)
      if (errorResult?.folderId) {
        try {
          const ownerPerm = await db.collection("permissions")
            .where("folderId", "==", errorResult.folderId)
            .where("role", "==", "OWNER")
            .limit(1)
            .get();
          
          const ownerId = !ownerPerm.empty ? ownerPerm.docs[0].data()?.userId : null;
          
          if (ownerId && errorResult.error === "EXPIRED") {
            try {
              const folderDoc = await db.collection("folders").doc(errorResult.folderId).get();
              await createNotification(ownerId, "EXPIRATION", {
                folderId: errorResult.folderId,
                folderName: folderDoc.data()?.name || "Dossier inconnu"
              }).catch(() => {}); // Ignorer les erreurs de notification
            } catch (e) {
              // Ignorer les erreurs
            }
          }
        } catch (e) {
          // Ignorer les erreurs de récupération du propriétaire
        }
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

    // Vérifier que le dossier existe toujours
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

    // 2. Récupérer le propriétaire pour les notifications de succès (sans bloquer)
    let ownerId: string | null = null;
    try {
      const ownerPerm = await db.collection("permissions")
        .where("folderId", "==", link.folderId)
        .where("role", "==", "OWNER")
        .limit(1)
        .get();
      
      ownerId = !ownerPerm.empty ? ownerPerm.docs[0].data()?.userId || null : null;
    } catch (e) {
      // Ignorer les erreurs de récupération du propriétaire
    }

    // 3. Incrémenter le nombre de vues via analytics (sans bloquer)
    try {
      await trackLinkActivity(link.id, "VIEW");
    } catch (e) {
      console.error("Error tracking link activity:", e);
      // Ne pas bloquer si le tracking échoue
    }
    
    // 4. Notification (sans bloquer)
    if (ownerId && link.folder?.name) {
      try {
        await createNotification(ownerId, "VIEW", {
          folderName: link.folder.name,
          folderId: link.folderId,
        });
      } catch (e) {
        // Ignorer les erreurs de notification
      }
    }

    // 5. Vérifier mot de passe
    if (link.passwordHash) {
      try {
        const inputHash = pwd ? crypto.createHash("sha256").update(pwd).digest("hex") : null;
        const isPasswordCorrect = inputHash === link.passwordHash;

        if (!pwd || !isPasswordCorrect) {
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
          // Notification d'accès réussi via mot de passe (sans bloquer)
          if (ownerId && link.folder?.name) {
            try {
              await createNotification(ownerId, "PASSWORD_ACCESS", {
                folderName: link.folder.name,
                folderId: link.folderId,
              });
            } catch (e) {
              // Ignorer les erreurs
            }
          }
        }
      } catch (e) {
        console.error("Error checking password:", e);
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

    // Vérifier que link.folder existe et a les données nécessaires
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

    // Vérifier que le nom du dossier existe
    const folderName = link.folder.name || "Dossier sans nom";
    const files = Array.isArray(link.folder.files) ? link.folder.files : [];
    const children = Array.isArray(link.folder.children) ? link.folder.children : [];

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
  } catch (error) {
    console.error("Critical error in PublicSharePage:", error);
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
