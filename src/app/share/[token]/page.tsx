import { db } from "@/lib/firebase";
import { validateShareLink } from "@/services/sharing";
import { createNotification } from "@/services/notifications";
import { getClientIP, getGeolocationFromIP, getCloudflareLocationHeaders } from "@/lib/geolocation";
import { headers } from "next/headers";
import { trackEvent } from "@/services/analytics";
import { isPreviewBot, generateVisitorId, generateStableVisitorId } from "@/lib/visitor";
import { Info, Lock, AlertTriangle, Clock, Ban } from "lucide-react";
import { FileList } from "@/components/shared/FileList";
import { TrackEvent } from "@/components/shared/TrackEvent";
import { DownloadFolderButton } from "@/components/shared/DownloadFolderButton";
import {
  SharePageLayout,
  SharePageError,
  SharePasswordForm,
} from "@/components/shared/SharePageLayout";
import crypto from "crypto";

/**
 * Page publique de partage de dossier
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
      <SharePageError
        title="Erreur de configuration"
        message="Le service est temporairement indisponible. Veuillez réessayer plus tard."
        icon={AlertTriangle}
      />
    );
  }

  try {
    const { token } = await params;
    const { pwd } = await searchParams;

    // Valider le token
    if (!token || typeof token !== 'string') {
      return (
        <SharePageError
          title="Lien invalide"
          message="Ce lien de partage n'est pas valide."
          icon={Info}
        />
      );
    }

    // Valider le lien de partage
    let result;
    try {
      result = await validateShareLink(token);
    } catch (error: any) {
      console.error("[SHARE] Error validating link:", error?.message);
      return (
        <SharePageError
          title="Lien non trouvé"
          message="Ce lien de partage n'existe pas ou a été supprimé."
          icon={Info}
        />
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

      if (errorResult?.error === "EXPIRED") {
        return (
          <SharePageError
            title="Lien expiré"
            message="Ce lien de partage a expiré et n'est plus accessible."
            icon={Clock}
          />
        );
      }

      if (errorResult?.error === "QUOTA_EXCEEDED") {
        return (
          <SharePageError
            title="Quota atteint"
            message="Le nombre maximum de consultations pour ce lien a été atteint."
            icon={Ban}
          />
        );
      }

      return (
        <SharePageError
          title="Accès indisponible"
          message="Ce lien n'est plus actif ou a été révoqué."
          icon={Info}
        />
      );
    }

    const link = result as any;

    // Vérifier que le lien a les données nécessaires
    if (!link || !link.folderId || !link.folder) {
      return (
        <SharePageError
          title="Dossier introuvable"
          message="Le dossier partagé n'existe plus ou a été supprimé."
          icon={Info}
        />
      );
    }

    // Notifier en arrière-plan (sans bloquer le rendu)
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
            try {
              const userAgent = headersList.get("user-agent") || undefined;
              const referer = headersList.get("referer") || undefined;
              const visitorId = generateVisitorId(clientIP, userAgent);
              const visitorIdStable = generateStableVisitorId(clientIP, userAgent);

              await trackEvent({
                linkId: link.id,
                eventType: "ACCESS_DENIED",
                invalidAttempt: true,
                denialReason: "VPN_BLOCKED",
                geolocation,
                visitorId,
                visitorIdStable,
                clientIP,
                referer,
                userAgent,
              });
            } catch (e) {
              console.error("Error tracking ACCESS_DENIED:", e);
            }

            return (
              <SharePageError
                title="Accès refusé"
                message="L'accès via VPN ou datacenter est bloqué pour ce partage."
                icon={Lock}
              />
            );
          }
        }
      } catch (error) {
        console.error("Error checking VPN/Datacenter:", error);
      }
    }

    // Vérifier le mot de passe si requis
    if (link.passwordHash) {
      try {
        const inputHash = pwd ? crypto.createHash("sha256").update(pwd).digest("hex") : null;
        const isPasswordCorrect = inputHash === link.passwordHash;

        if (!pwd || !isPasswordCorrect) {
          // Tracker l'accès refusé avec la raison
          if (pwd) {
            (async () => {
              try {
                const headersList = await headers();
                const clientIP = getClientIP(headersList);
                const userAgent = headersList.get("user-agent") || undefined;
                const referer = headersList.get("referer") || undefined;

                const visitorId = generateVisitorId(clientIP, userAgent);
                const visitorIdStable = generateStableVisitorId(clientIP, userAgent);

                let geolocation;
                try {
                  if (clientIP !== 'unknown') {
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

                await trackEvent({
                  linkId: link.id,
                  eventType: "ACCESS_DENIED",
                  invalidAttempt: true,
                  denialReason: "PASSWORD_INCORRECT",
                  geolocation,
                  visitorId,
                  visitorIdStable,
                  clientIP,
                  referer,
                  userAgent,
                }).catch(() => {});

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

          return <SharePasswordForm token={token} error={!!pwd && !isPasswordCorrect} />;
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
          <SharePageError
            title="Erreur"
            message="Une erreur est survenue lors de la vérification du mot de passe."
            icon={AlertTriangle}
          />
        );
      }
    }

    // Préparer les données pour l'affichage
    const folderName = link.folder.name || "Dossier sans nom";
    const files = Array.isArray(link.folder.files) ? link.folder.files : [];
    const children = Array.isArray(link.folder.children) ? link.folder.children : [];

    // Tracker la prévisualisation
    (async () => {
      try {
        const headersList = await headers();
        const clientIP = getClientIP(headersList);
        const userAgent = headersList.get("user-agent") || undefined;
        const referer = headersList.get("referer") || undefined;

        const visitorId = generateVisitorId(clientIP, userAgent);
        const visitorIdStable = generateStableVisitorId(clientIP, userAgent);

        let geolocation;
        try {
          if (clientIP !== 'unknown') {
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

        const isBot = isPreviewBot(userAgent, referer, geolocation?.isDatacenter);

        await trackEvent({
          linkId: link.id,
          eventType: "LINK_PREVIEW",
          geolocation,
          visitorId,
          visitorIdStable,
          clientIP,
          referer,
          userAgent,
        });
      } catch (error) {
        console.error("Error tracking LINK_PREVIEW:", error);
      }
    })().catch(() => {});

    // Afficher la page de partage
    const totalItems = files.length + children.length;

    return (
      <>
        <TrackEvent linkId={link.id} eventType="OPEN_SHARE" />
        <SharePageLayout
          folderName={folderName}
          fileCount={files.length}
          folderCount={children.length}
        >
          {/* Hero Header */}
          <div className="mb-8 p-6 bg-gradient-to-br from-brand-primary/5 via-brand-primary/[0.02] to-transparent rounded-2xl border border-brand-primary/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-primary/20">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl lg:text-3xl font-bold tracking-tight truncate text-black">{folderName}</h1>
                  <p className="text-sm text-black/50 mt-1">
                    {children.length > 0 && <span>{children.length} dossier{children.length > 1 ? 's' : ''}</span>}
                    {children.length > 0 && files.length > 0 && <span> • </span>}
                    {files.length > 0 && <span>{files.length} fichier{files.length > 1 ? 's' : ''}</span>}
                  </p>
                </div>
              </div>

              {/* Download button */}
              {link.allowDownload && files.length > 0 && (
                <DownloadFolderButton
                  folderId={link.folderId}
                  folderName={folderName}
                  token={token}
                />
              )}
            </div>
          </div>

          <FileList
            files={files}
            children={children}
            shareLinkId={link.id}
            token={token}
            password={pwd}
          />
        </SharePageLayout>
      </>
    );
  } catch (error: any) {
    console.error("[SHARE] Critical error:", error?.message);
    return (
      <SharePageError
        title="Erreur inattendue"
        message="Une erreur est survenue. Veuillez réessayer plus tard."
        icon={AlertTriangle}
      />
    );
  }
}
