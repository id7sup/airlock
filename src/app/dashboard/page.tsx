import { db } from "@/lib/firebase";
import { auth, currentUser } from "@clerk/nextjs/server";
import DashboardClient from "@/components/dashboard/DashboardClient";
import * as admin from "firebase-admin";

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { userId } = await auth();
  if (!userId) return null;
  const { filter } = await searchParams;
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();

  // Nettoyer automatiquement les dossiers de plus de 30 jours dans la corbeille
  if (filter === "trash") {
    try {
      const { cleanupOldTrashAction } = await import("@/lib/actions/folders");
      await cleanupOldTrashAction();
    } catch (error) {
      // Ignorer les erreurs de nettoyage pour ne pas bloquer l'affichage
      console.error("Erreur lors du nettoyage automatique:", error);
    }
  }

  // 1. Récupérer le(s) workspace(s)
  let workspaceSnapshot;
  try {
    workspaceSnapshot = await db.collection("workspaces")
      .where("memberIds", "array-contains", userId)
      .get();
  } catch (e) {
    return <div className="p-10 text-center text-apple-secondary">Vérification de votre espace de travail...</div>;
  }

  // Création automatique si nécessaire
  if (workspaceSnapshot.empty) {
    const admin = await import("firebase-admin");
    const newWSRef = await db.collection("workspaces").add({
      name: "Mon Espace",
      memberIds: [userId],
      totalStorageUsed: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return <DashboardClient initialFolders={[]} currentFilter={filter || "all"} />;
  }

  const workspaceIds = workspaceSnapshot.docs.map(doc => doc.id);

  // 2. Récupération Groupée Ultra-Optimisée (Massive reduction of queries)
  let allFolders: any[] = [];
  let allFiles: any[] = [];

  try {
    // On parallélise les deux grosses récupérations
    const [foldersSnap, filesSnap] = await Promise.all([
      db.collection("folders")
        .where("workspaceId", "in", workspaceIds)
        .select("name", "workspaceId", "parentId", "isFavorite", "isDeleted", "order", "updatedAt", "createdAt")
        .get(),
      db.collection("files")
        .where("workspaceId", "in", workspaceIds)
        .select("folderId")
        .get()
    ]);

    allFolders = foldersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    allFiles = filesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Ajout des dossiers via permissions directes (hors workspace principal)
    // Récupérer par userId ET par email pour le partage interne
    // Pour la corbeille, on inclut aussi les permissions masquées
    const includeHidden = filter === "trash";
    
    const [permsByUserId, permsByEmail] = await Promise.all([
      db.collection("permissions")
        .where("userId", "==", userId)
        .get(),
      userEmail ? db.collection("permissions")
        .where("userEmail", "==", userEmail)
        .get() : Promise.resolve({ docs: [] } as any)
    ]);
    
    // Combiner les permissions et dédupliquer
    // Filtrer les masquées sauf si on est dans la corbeille
    const allPerms = [
      ...permsByUserId.docs.map(d => ({ id: d.id, ...d.data() })),
      ...permsByEmail.docs.map(d => ({ id: d.id, ...d.data() }))
    ];
    
    const filteredPerms = includeHidden 
      ? allPerms // Pour la corbeille, inclure toutes les permissions (y compris masquées)
      : allPerms.filter(p => !p.isHidden); // Sinon, exclure les masquées
    
    const uniquePerms = Array.from(new Map(filteredPerms.map(p => [p.folderId, p])).values());
    
    if (uniquePerms.length > 0) {
      const extraFolderIds = uniquePerms
        .map(p => p.folderId)
        .filter(id => !allFolders.some(f => f.id === id));
      
      if (extraFolderIds.length > 0) {
        // Fetch remaining folders in batches of 30 (Firestore limit)
        for (let i = 0; i < extraFolderIds.length; i += 30) {
          const batch = extraFolderIds.slice(i, i + 30);
          const extraSnap = await db.collection("folders").where(admin.firestore.FieldPath.documentId(), "in", batch).get();
          const extraFolders = extraSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          
          // Récupérer les propriétaires pour chaque dossier partagé
          const ownerPerms = await Promise.all(
            batch.map(folderId => 
              db.collection("permissions")
                .where("folderId", "==", folderId)
                .where("role", "==", "OWNER")
                .limit(1)
                .get()
            )
          );
          
          // Enrichir avec les infos de permission et le propriétaire
          extraFolders.forEach((folder, idx) => {
            const perm = uniquePerms.find(p => p.folderId === folder.id);
            if (perm) {
              (folder as any).shareRole = perm.role;
              (folder as any).shareCanDownload = perm.canDownload;
              (folder as any).isShared = true;
              (folder as any).isPermissionHidden = perm.isHidden === true;
              
              // Récupérer le nom du propriétaire depuis Clerk (on utilisera l'email pour l'instant)
              const ownerPerm = ownerPerms[idx];
              if (!ownerPerm.empty) {
                const ownerData = ownerPerm.docs[0].data();
                // On stocke l'userId du propriétaire, on pourra récupérer son nom plus tard
                (folder as any).ownerId = ownerData.userId;
                (folder as any).sharedBy = ownerData.userEmail || "Utilisateur";
              }
            }
          });
          allFolders = [...allFolders, ...extraFolders];
        }
      }
    }
  } catch (error: any) {
    console.error("Firestore Optimization Error:", error.message);
  }

  // Nettoyage et tri par défaut
  allFolders = Array.from(new Map(allFolders.map(f => [f.id, f])).values());
  allFolders.sort((a, b) => (a.order || 0) - (b.order || 0));

  // 3. Filtrage Intelligent
  // IMPORTANT : Ne montrer que les dossiers racine (parentId === null) dans le dashboard principal
  // Les sous-dossiers n'apparaissent que dans leur dossier parent
  let filteredFolders = [];
  if (filter === "trash") {
    // Pour la corbeille : dossiers supprimés OU permissions masquées (dossiers partagés retirés)
    // Uniquement les dossiers racine
    filteredFolders = allFolders.filter(f => 
      (f.isDeleted === true || (f as any).isPermissionHidden === true) && 
      (f.parentId === null || f.parentId === undefined)
    );
  } else if (filter === "favorites") {
    // Favoris : uniquement les dossiers racine favoris
    filteredFolders = allFolders.filter(f => 
      f.isFavorite === true && 
      f.isDeleted !== true && 
      (f.parentId === null || f.parentId === undefined)
    );
  } else if (filter === "recent") {
    // Récent : uniquement les dossiers racine, triés par date de mise à jour
    filteredFolders = allFolders.filter(f => 
      f.isDeleted !== true && 
      (f.parentId === null || f.parentId === undefined)
    )
      .sort((a, b) => {
        const getT = (o: any) => {
          const t = o.updatedAt || o.createdAt;
          if (t?.toMillis) return t.toMillis();
          return new Date(t || 0).getTime();
        };
        return getT(b) - getT(a);
      });
  } else if (filter === "shared") {
    // "Partagés avec moi" : uniquement les dossiers racine partagés (pas les miens)
    filteredFolders = allFolders.filter(f => 
      f.isDeleted !== true && 
      (f as any).isShared === true && 
      (f.parentId === null || f.parentId === undefined)
    );
  } else {
    // "Tous les dossiers" : afficher uniquement les dossiers racine non supprimés
    filteredFolders = allFolders.filter(f => 
      f.isDeleted !== true && 
      (f.parentId === null || f.parentId === undefined)
    );
  }

  // 4. Calcul Récursif EN MÉMOIRE (Totalement CPU-only, 0 impact Quota)
  const folders = filteredFolders.map(folder => {
    const getCount = (fId: string, visited = new Set<string>()): number => {
      if (visited.has(fId)) return 0; // Sécurité anti-boucle infinie
      visited.add(fId);

      let count = allFiles.filter(file => file.folderId === fId).length;
      allFolders.filter(f => f.parentId === fId).forEach(child => {
        count += getCount(child.id, visited);
      });
      return count;
    };

    const getISO = (obj: any) => {
      if (!obj) return new Date().toISOString();
      if (obj.toDate) return obj.toDate().toISOString();
      if (obj._seconds) return new Date(obj._seconds * 1000).toISOString();
      return new Date(obj).toISOString();
    };

    return {
      id: folder.id,
      name: folder.name || "Sans nom",
      isFavorite: folder.isFavorite === true,
      isDeleted: folder.isDeleted === true,
      updatedAt: getISO(folder.updatedAt || folder.createdAt),
      _count: { files: getCount(folder.id) },
      shareRole: (folder as any).shareRole,
      shareCanDownload: (folder as any).shareCanDownload,
      isShared: (folder as any).isShared,
      isPermissionHidden: (folder as any).isPermissionHidden,
      // Pour l'affichage, traiter isPermissionHidden comme isDeleted dans la corbeille
      isDeleted: folder.isDeleted || ((folder as any).isPermissionHidden && filter === "trash")
    };
  });

  return <DashboardClient initialFolders={folders as any} currentFilter={filter || "all"} />;
}
