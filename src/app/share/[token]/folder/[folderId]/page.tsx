import { db } from "@/lib/firebase";
import { validateShareLink } from "@/services/sharing";
import { checkIfFolderIsChild } from "@/services/folders";
import { ChevronLeft, Info, Lock, AlertTriangle } from "lucide-react";
import { FileList } from "@/components/shared/FileList";
import { TrackEvent } from "@/components/shared/TrackEvent";
import { DownloadFolderButton } from "@/components/shared/DownloadFolderButton";
import Link from "next/link";
import { getClientIP, getGeolocationFromIP, getCloudflareLocationHeaders, isVPNOrDatacenter } from "@/lib/geolocation";
import { headers } from "next/headers";
import { trackEvent } from "@/services/analytics";
import { isPreviewBot } from "@/lib/visitor";
import {
  SharePageError,
} from "@/components/shared/SharePageLayout";
import { ShareFolderPageLayout } from "./ShareFolderPageLayout";

/**
 * Page publique pour afficher un sous-dossier partagé
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
        <SharePageError
          title="Paramètres invalides"
          message="Le lien de partage est invalide."
          icon={Info}
        />
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
        <SharePageError
          title="Erreur"
          message="Une erreur est survenue lors du chargement du partage."
          icon={AlertTriangle}
        />
      );
    }

    // Gérer les erreurs de validation avec des messages explicites
    if (!result || (result as any).error) {
      const errorResult = result as any;
      const errorType = errorResult?.error;
      let title = "Accès indisponible";
      let message = "Ce lien n'est plus actif. Vérifiez avec la personne qui vous l'a envoyé.";
      if (errorType === "EXPIRED") {
        title = "Lien expiré";
        message = "La date d'expiration de ce lien est dépassée. Demandez un nouveau lien si nécessaire.";
      } else if (errorType === "QUOTA_EXCEEDED") {
        title = "Quota atteint";
        message = "Le nombre maximum de consultations pour ce lien a été atteint.";
      } else if (errorType === "REVOKED") {
        title = "Lien révoqué";
        message = "Ce lien a été désactivé par la personne qui l'a partagé.";
      } else if (errorType === "NOT_FOUND") {
        title = "Lien ou dossier introuvable";
        message = "Ce lien n'existe pas ou le dossier partagé a été supprimé.";
      } else if (errorType === "ACCESS_DISABLED") {
        title = "Accès aux dossiers désactivé";
        message = "La navigation dans les sous-dossiers n'est pas autorisée pour ce lien.";
      }
      return (
        <SharePageError
          title={title}
          message={message}
          icon={Info}
        />
      );
    }

    const link = result as any;

    if (!link || !link.folderId) {
      return (
        <SharePageError
          title="Erreur"
          message="Les données du partage sont incomplètes."
          icon={Info}
        />
      );
    }

    if (!folderDoc.exists) {
      return (
        <SharePageError
          title="Dossier introuvable"
          message="Ce dossier n'existe pas ou a été supprimé."
          icon={Info}
        />
      );
    }

    const folderData = folderDoc.data();
    if (!folderData) {
      return (
        <SharePageError
          title="Erreur"
          message="Les données du dossier sont incomplètes."
          icon={Info}
        />
      );
    }

    // Vérifier la hiérarchie et récupérer les fichiers/sous-dossiers en parallèle
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
      if (error?.message?.includes("hierarchy") || error?.message?.includes("checkIfFolderIsChild")) {
        return (
          <SharePageError
            title="Erreur"
            message="Impossible de vérifier l'accès au dossier."
            icon={Info}
          />
        );
      }
    }

    // Vérifier que le dossier est bien un enfant du dossier partagé
    if (!isChildOfSharedFolder) {
      return (
        <SharePageError
          title="Accès refusé"
          message="Ce dossier n'appartient pas au partage."
          icon={Lock}
        />
      );
    }

    // Vérifier le blocage VPN/Datacenter si activé
    if (link.blockVpn === true) {
      try {
        const headersList = await headers();
        const clientIP = getClientIP(headersList);

        if (clientIP !== 'unknown') {
          const { isBlocked, geolocation } = await isVPNOrDatacenter(clientIP);
          if (isBlocked) {
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
              <SharePageError
                title="Accès refusé"
                message="L'accès via VPN ou datacenter est bloqué pour ce lien."
                icon={Lock}
              />
            );
          }
        }
      } catch (error) {
        console.error("Error checking VPN/Datacenter:", error);
      }
    }

    // Tracker la prévisualisation
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
          referer,
          userAgent,
          folderId: folderId,
        });
      } catch (error) {
        console.error("Error tracking LINK_PREVIEW:", error);
      }
    })().catch(() => {});

    // Déterminer le lien de retour
    const backLink = folderData.parentId && folderData.parentId !== link.folderId
      ? `/share/${token}/folder/${folderData.parentId}${pwd ? `?pwd=${encodeURIComponent(pwd)}` : ""}`
      : `/share/${token}${pwd ? `?pwd=${encodeURIComponent(pwd)}` : ""}`;

    const totalItems = files.length + children.length;
    const folderDisplayName = folderData.name || "Dossier";

    return (
      <>
        <TrackEvent linkId={link.id} eventType="OPEN_FOLDER" folderId={folderId} />
        <ShareFolderPageLayout
          folderName={folderDisplayName}
          fileCount={files.length}
          folderCount={children.length}
          backLink={backLink}
        >
          {/* Hero Header with back button */}
          <div className="mb-8 p-6 bg-gradient-to-br from-brand-primary/5 via-brand-primary/[0.02] to-transparent rounded-2xl border border-brand-primary/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <Link
                  href={backLink}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-black/10 hover:bg-black/5 rounded-xl transition-all text-black active:scale-95 flex-shrink-0 shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
                <div className="w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-primary/20">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl lg:text-3xl font-bold tracking-tight truncate text-black opacity-90">{folderDisplayName}</h1>
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
                  folderId={folderId}
                  folderName={folderDisplayName}
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
        </ShareFolderPageLayout>
      </>
    );
  } catch (error: any) {
    console.error("[SHARE_FOLDER] Critical error:", error?.message, error?.digest);
    return (
      <SharePageError
        title="Ce partage n'a pas pu être chargé"
        message="Une erreur est survenue (lien expiré, révoqué, quota atteint, dossier supprimé ou problème technique). Vérifiez le lien avec la personne qui vous l'a envoyé ou réessayez plus tard."
        icon={AlertTriangle}
      />
    );
  }
}
