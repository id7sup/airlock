import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getNotifications } from "@/services/notifications";
import { db } from "@/lib/firebase";
import { LogsPageClient } from "@/components/dashboard/LogsPageClient";

export const dynamic = "force-dynamic";

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ linkId?: string; visitorId?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const params = await searchParams;
  const linkId = params?.linkId;
  const visitorId = params?.visitorId;

  // Si visitorId est fourni, récupérer les logs depuis shareAnalytics
  let logs: any[] = [];
  if (visitorId) {
    try {
      const { getVisitorLogsAction } = await import("@/lib/actions/notifications");
      logs = await getVisitorLogsAction(visitorId, userId);
    } catch (error) {
      console.error("[LOGS] Erreur lors de la récupération des logs du visiteur:", error);
    }
  } else {
    // Sinon, utiliser les notifications classiques
    logs = await getNotifications(userId, 200);
  }

  const linkContext = linkId ? (async () => {
    try {
      const doc = await db.collection("shareLinks").doc(linkId).get();
      if (!doc.exists) return null;
      const data = doc.data() || {};
      return {
        folderId: data.folderId,
        folderName: data.folderName || data.folder?.name || "Partage",
      };
    } catch (error) {
      console.error("[LOGS] Impossible de récupérer le lien", error);
      return null;
    }
  })() : null;

  return <LogsPageClient initialLogs={logs as any[]} linkContext={await linkContext} visitorId={visitorId} />;
}
