import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';

/**
 * Route API pour nettoyer toutes les données analytics
 * 
 * ATTENTION : Cette route supprime TOUTES les données de shareAnalytics
 * Utiliser uniquement en développement ou avec une authentification admin appropriée
 * 
 * POST /api/admin/cleanup-analytics
 */
export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const { authenticated } = await getAdminSession();
    if (!authenticated) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Récupérer tous les documents de shareAnalytics
    const analyticsSnapshot = await db.collection("shareAnalytics").get();
    
    if (analyticsSnapshot.empty) {
      return NextResponse.json({
        success: true,
        message: "Aucune donnée analytics à supprimer",
        deletedCount: 0,
      });
    }

    // Supprimer tous les documents par batch (Firestore limite à 500 par batch)
    const batchSize = 500;
    const batches: any[] = [];
    let batch = db.batch();
    let count = 0;

    analyticsSnapshot.docs.forEach((doc, index) => {
      batch.delete(doc.ref);
      count++;

      if ((index + 1) % batchSize === 0) {
        batches.push(batch);
        batch = db.batch();
      }
    });

    // Ajouter le dernier batch s'il contient des documents
    if (count % batchSize !== 0) {
      batches.push(batch);
    }

    // Exécuter tous les batches
    await Promise.all(batches.map(b => b.commit()));

    return NextResponse.json({
      success: true,
      message: `Toutes les données analytics ont été supprimées (${count} documents)`,
      deletedCount: count,
    });
  } catch (error: any) {
    console.error("[CLEANUP] Erreur lors du nettoyage:", error);
    return NextResponse.json(
      { error: "Erreur lors du nettoyage", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Route pour nettoyer uniquement les données analytics liées à des dossiers supprimés
 * 
 * GET /api/admin/cleanup-analytics?action=cleanup-deleted-folders
 */
export async function GET(req: NextRequest) {
  try {
    const { authenticated } = await getAdminSession();
    if (!authenticated) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action === "cleanup-deleted-folders") {
      // Récupérer tous les dossiers supprimés
      const deletedFoldersSnapshot = await db.collection("folders")
        .where("isDeleted", "==", true)
        .get();

      const deletedFolderIds = new Set(
        deletedFoldersSnapshot.docs.map(doc => doc.id)
      );

      if (deletedFolderIds.size === 0) {
        return NextResponse.json({
          success: true,
          message: "Aucun dossier supprimé trouvé",
          deletedCount: 0,
        });
      }

      // Récupérer tous les liens de partage liés à ces dossiers
      const linksSnapshot = await db.collection("shareLinks").get();
      const deletedLinkIds = new Set<string>();

      linksSnapshot.docs.forEach(doc => {
        const linkData = doc.data();
        if (linkData.folderId && deletedFolderIds.has(linkData.folderId)) {
          deletedLinkIds.add(doc.id);
        }
      });

      if (deletedLinkIds.size === 0) {
        return NextResponse.json({
          success: true,
          message: "Aucun lien lié à des dossiers supprimés",
          deletedCount: 0,
        });
      }

      // Supprimer toutes les analytics liées à ces liens
      const analyticsSnapshot = await db.collection("shareAnalytics")
        .where("linkId", "in", Array.from(deletedLinkIds).slice(0, 10)) // Firestore limite à 10 dans "in"
        .get();

      // Pour gérer plus de 10 liens, on doit faire plusieurs requêtes
      const linkIdsArray = Array.from(deletedLinkIds);
      const batchSize = 10;
      let totalDeleted = 0;

      for (let i = 0; i < linkIdsArray.length; i += batchSize) {
        const batchLinkIds = linkIdsArray.slice(i, i + batchSize);
        const batchSnapshot = await db.collection("shareAnalytics")
          .where("linkId", "in", batchLinkIds)
          .get();

        // Supprimer par batch
        const deleteBatchSize = 500;
        const deleteBatches: any[] = [];
        let deleteBatch = db.batch();
        let deleteCount = 0;

        batchSnapshot.docs.forEach((doc, index) => {
          deleteBatch.delete(doc.ref);
          deleteCount++;
          totalDeleted++;

          if ((index + 1) % deleteBatchSize === 0) {
            deleteBatches.push(deleteBatch);
            deleteBatch = db.batch();
          }
        });

        if (deleteCount % deleteBatchSize !== 0) {
          deleteBatches.push(deleteBatch);
        }

        await Promise.all(deleteBatches.map(b => b.commit()));
      }

      return NextResponse.json({
        success: true,
        message: `Données analytics des dossiers supprimés nettoyées (${totalDeleted} documents)`,
        deletedCount: totalDeleted,
        deletedFolderCount: deletedFolderIds.size,
        deletedLinkCount: deletedLinkIds.size,
      });
    }

    return NextResponse.json({
      error: "Action non reconnue. Utilisez ?action=cleanup-deleted-folders",
    }, { status: 400 });
  } catch (error: any) {
    console.error("[CLEANUP] Erreur lors du nettoyage:", error);
    return NextResponse.json(
      { error: "Erreur lors du nettoyage", details: error.message },
      { status: 500 }
    );
  }
}
