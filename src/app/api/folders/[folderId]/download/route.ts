import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/firebase";
import { getAllFoldersAndFiles, buildRelativeFilePath } from "@/services/folderTree";
import { createFolderZip } from "@/services/zip";

/**
 * API route pour télécharger un dossier entier en tant qu'archive ZIP.
 *
 * Endpoint: GET /api/folders/[folderId]/download
 *
 * Authentification: Clerk (utilisateur connecté)
 * Permissions: VIEWER, EDITOR, ou OWNER sur le dossier
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;

    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }
    if (!folderId) {
      return NextResponse.json(
        { error: "Paramètre folderId manquant" },
        { status: 400 }
      );
    }

    // 2. Vérifier que le dossier existe
    const folderDoc = await db.collection("folders").doc(folderId).get();
    if (!folderDoc.exists) {
      return NextResponse.json(
        { error: "Dossier non trouvé" },
        { status: 404 }
      );
    }

    const folderData = folderDoc.data()!;
    const workspaceId = folderData.workspaceId;
    const folderName = folderData.name;

    // 3. Vérifier les permissions (VIEWER, EDITOR, ou OWNER)
    const { currentUser } = await import("@clerk/nextjs/server");
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();

    const [permsByUserId, permsByEmail] = await Promise.all([
      db.collection("permissions")
        .where("folderId", "==", folderId)
        .where("userId", "==", userId)
        .get(),
      userEmail
        ? db.collection("permissions")
            .where("folderId", "==", folderId)
            .where("userEmail", "==", userEmail)
            .get()
        : Promise.resolve({ docs: [] } as any),
    ]);

    const allPerms = [...permsByUserId.docs, ...permsByEmail.docs];
    const activePerm = allPerms.find((doc) => {
      const perm = doc.data();
      return (
        (perm.userId === userId || (userEmail && perm.userEmail === userEmail)) &&
        perm.isHidden !== true
      );
    });

    if (!activePerm) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // 4. Récupérer tous les fichiers et dossiers
    const treeResult = await getAllFoldersAndFiles(folderId, workspaceId);

    if (!treeResult.success) {
      return NextResponse.json(
        { error: treeResult.error || "Erreur lors de la récupération des données" },
        { status: 400 }
      );
    }

    // 5. Créer l'archive ZIP
    const archive = await createFolderZip(
      treeResult.folders,
      treeResult.files,
      folderId,
      folderName
    );

    // 6. Configurer la response
    const response = new NextResponse(archive as any, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(folderName)}.zip"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });

    return response;
  } catch (error: any) {
    console.error("[API] Erreur lors du téléchargement du dossier:", error?.message);
    return NextResponse.json(
      {
        error: "Erreur lors de la création du ZIP",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}
