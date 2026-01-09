import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getNotifications } from "@/services/notifications";
import { db } from "@/lib/firebase";
import { LogsPageClient } from "@/components/dashboard/LogsPageClient";

export const dynamic = "force-dynamic";

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ linkId?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const linkId = params?.linkId;

  const [logs, linkContext] = await Promise.all([
    getNotifications(userId, 200),
    (async () => {
      if (!linkId) return null;
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
    })(),
  ]);

  return <LogsPageClient initialLogs={logs as any[]} linkContext={linkContext} />;
}
