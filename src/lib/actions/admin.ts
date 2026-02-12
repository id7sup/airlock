"use server";

import { db } from "@/lib/firebase";
import { getAdminSession } from "@/lib/admin-auth";
import { clerkClient } from "@clerk/nextjs/server";
import * as admin from "firebase-admin";

// Helper pour convertir les Firestore Timestamps en ISO strings
function toISO(val: any): string | null {
  if (!val) return null;
  if (val instanceof admin.firestore.Timestamp) return val.toDate().toISOString();
  if (val._seconds) return new Date(val._seconds * 1000).toISOString();
  if (val.toDate) return val.toDate().toISOString();
  if (typeof val === "string") return val;
  return new Date(val).toISOString();
}

// Helper pour déterminer si un lien est actif
function isLinkActive(data: any): boolean {
  if (data.isRevoked) return false;
  if (data.expiresAt) {
    const expiresAt = data.expiresAt instanceof admin.firestore.Timestamp
      ? data.expiresAt.toDate()
      : new Date(data.expiresAt._seconds ? data.expiresAt._seconds * 1000 : data.expiresAt);
    if (expiresAt < new Date()) return false;
  }
  if (data.maxViews && (data.viewCount || 0) >= data.maxViews) return false;
  return true;
}

/**
 * KPIs globaux de la plateforme
 */
export async function getAdminOverviewAction() {
  const { authenticated } = await getAdminSession();
  if (!authenticated) throw new Error("Non autorisé");

  const client = await clerkClient();

  const [
    usersResponse,
    workspacesSnap,
    foldersSnap,
    filesSnap,
    shareLinksSnap,
    statsDoc,
  ] = await Promise.all([
    client.users.getUserList({ limit: 1 }),
    db.collection("workspaces").get(),
    db.collection("folders").where("isDeleted", "==", false).get(),
    db.collection("files").get(),
    db.collection("shareLinks").get(),
    db.doc("_admin/stats").get(),
  ]);

  let totalStorage = 0;
  workspacesSnap.docs.forEach((doc) => {
    totalStorage += doc.data().totalStorageUsed || 0;
  });

  let totalViews = 0;
  let totalDownloads = 0;
  let activeLinks = 0;
  shareLinksSnap.docs.forEach((doc) => {
    const data = doc.data();
    totalViews += data.viewCount || 0;
    totalDownloads += data.downloadCount || 0;
    if (isLinkActive(data)) activeLinks++;
  });

  // "Liens créés" = compteur persistant (ne décrémente jamais)
  // Seed le compteur s'il n'existe pas encore
  let totalLinksCreated = shareLinksSnap.size;
  if (statsDoc.exists && statsDoc.data()?.totalLinksCreated) {
    totalLinksCreated = Math.max(statsDoc.data()!.totalLinksCreated, shareLinksSnap.size);
  } else {
    // Premier accès : initialiser le compteur avec le nombre actuel
    try {
      await db.doc("_admin/stats").set(
        { totalLinksCreated: shareLinksSnap.size },
        { merge: true }
      );
    } catch {}
  }

  return {
    totalUsers: usersResponse.totalCount,
    totalFolders: foldersSnap.size,
    totalFiles: filesSnap.size,
    totalLinksCreated,
    activeLinks,
    totalStorage,
    totalViews,
    totalDownloads,
  };
}

/**
 * Liste de tous les utilisateurs avec leurs données Firestore
 */
export async function getAdminUsersListAction() {
  const { authenticated } = await getAdminSession();
  if (!authenticated) throw new Error("Non autorisé");

  const client = await clerkClient();

  // Paginer les utilisateurs Clerk
  let allUsers: any[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await client.users.getUserList({ limit, offset });
    allUsers.push(...response.data);
    if (allUsers.length >= response.totalCount) break;
    offset += limit;
  }

  // Requêtes Firestore en parallèle
  const [workspacesSnap, shareLinksSnap] = await Promise.all([
    db.collection("workspaces").get(),
    db.collection("shareLinks").get(),
  ]);

  // Map userId → workspace data
  const userWorkspaceMap = new Map<string, { workspaceId: string; storageUsed: number }>();
  workspacesSnap.docs.forEach((doc) => {
    const data = doc.data();
    (data.memberIds || []).forEach((memberId: string) => {
      userWorkspaceMap.set(memberId, {
        workspaceId: doc.id,
        storageUsed: data.totalStorageUsed || 0,
      });
    });
  });

  // Map userId → links count (all, including revoked)
  const userLinksMap = new Map<string, number>();
  // Map userId → active links count
  const userActiveLinksMap = new Map<string, number>();
  shareLinksSnap.docs.forEach((doc) => {
    const data = doc.data();
    const creatorId = data.creatorId;
    if (creatorId) {
      userLinksMap.set(creatorId, (userLinksMap.get(creatorId) || 0) + 1);
      if (isLinkActive(data)) {
        userActiveLinksMap.set(creatorId, (userActiveLinksMap.get(creatorId) || 0) + 1);
      }
    }
  });

  return allUsers.map((user) => ({
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || "N/A",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    imageUrl: user.imageUrl || "",
    createdAt: user.createdAt,
    lastSignInAt: user.lastSignInAt,
    storageUsed: userWorkspaceMap.get(user.id)?.storageUsed || 0,
    linksCount: userLinksMap.get(user.id) || 0,
    activeLinksCount: userActiveLinksMap.get(user.id) || 0,
    workspaceId: userWorkspaceMap.get(user.id)?.workspaceId || null,
  }));
}

/**
 * Détail d'un utilisateur spécifique
 */
export async function getAdminUserDetailAction(userId: string) {
  const { authenticated } = await getAdminSession();
  if (!authenticated) throw new Error("Non autorisé");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  // Workspace de l'utilisateur
  const workspaceSnap = await db
    .collection("workspaces")
    .where("memberIds", "array-contains", userId)
    .limit(1)
    .get();

  let workspaceId: string | null = null;
  let storageUsed = 0;

  if (!workspaceSnap.empty) {
    workspaceId = workspaceSnap.docs[0].id;
    storageUsed = workspaceSnap.docs[0].data().totalStorageUsed || 0;
  }

  // Requêtes en parallèle
  const [foldersSnap, filesSnap, shareLinksSnap] = await Promise.all([
    workspaceId
      ? db.collection("folders").where("workspaceId", "==", workspaceId).where("isDeleted", "==", false).get()
      : Promise.resolve({ size: 0, docs: [] as any[] }),
    workspaceId
      ? db.collection("files").where("workspaceId", "==", workspaceId).get()
      : Promise.resolve({ size: 0, docs: [] as any[] }),
    db.collection("shareLinks").where("creatorId", "==", userId).get(),
  ]);

  // Construire les données des share links
  const shareLinks = shareLinksSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      folderId: data.folderId || "",
      viewCount: data.viewCount || 0,
      downloadCount: data.downloadCount || 0,
      isRevoked: data.isRevoked || false,
      allowDownload: data.allowDownload ?? true,
      allowViewOnline: data.allowViewOnline ?? true,
      maxViews: data.maxViews || null,
      createdAt: toISO(data.createdAt) || new Date().toISOString(),
      expiresAt: toISO(data.expiresAt),
    };
  });

  let totalViews = 0;
  let totalDownloads = 0;
  shareLinks.forEach((link) => {
    totalViews += link.viewCount;
    totalDownloads += link.downloadCount;
  });

  // "Liens actifs" prend en compte revoked + expired + quota
  const activeLinksList = shareLinksSnap.docs.filter((doc) => isLinkActive(doc.data()));

  return {
    user: {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || "N/A",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      imageUrl: user.imageUrl || "",
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
    },
    stats: {
      storageUsed,
      foldersCount: foldersSnap.size,
      filesCount: filesSnap.size,
      linksCount: shareLinksSnap.size,
      activeLinks: activeLinksList.length,
      totalViews,
      totalDownloads,
    },
    shareLinks,
  };
}

/**
 * Tous les liens de partage de la plateforme
 */
export async function getAdminAllLinksAction() {
  const { authenticated } = await getAdminSession();
  if (!authenticated) throw new Error("Non autorisé");

  const client = await clerkClient();

  const [shareLinksSnap, foldersSnap] = await Promise.all([
    db.collection("shareLinks").get(),
    db.collection("folders").select("name").get(),
  ]);

  // Map folderId → folderName
  const folderNameMap = new Map<string, string>();
  foldersSnap.docs.forEach((doc) => {
    folderNameMap.set(doc.id, doc.data().name || "Sans nom");
  });

  // Collecter les creatorIds uniques pour les résoudre en batch
  const creatorIds = new Set<string>();
  shareLinksSnap.docs.forEach((doc) => {
    const cid = doc.data().creatorId;
    if (cid) creatorIds.add(cid);
  });

  // Résoudre les noms des créateurs via Clerk
  const creatorMap = new Map<string, { email: string; name: string }>();
  const creatorIdArray = Array.from(creatorIds);
  // Clerk getUserList supporte le filtre par userId[]
  for (let i = 0; i < creatorIdArray.length; i += 100) {
    const batch = creatorIdArray.slice(i, i + 100);
    const response = await client.users.getUserList({ userId: batch, limit: 100 });
    response.data.forEach((u) => {
      creatorMap.set(u.id, {
        email: u.emailAddresses[0]?.emailAddress || "N/A",
        name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Sans nom",
      });
    });
  }

  return shareLinksSnap.docs.map((doc) => {
    const data = doc.data();
    const creator = creatorMap.get(data.creatorId);
    return {
      id: doc.id,
      folderId: data.folderId || "",
      folderName: folderNameMap.get(data.folderId) || "Dossier supprime",
      creatorId: data.creatorId || "",
      creatorEmail: creator?.email || "N/A",
      creatorName: creator?.name || "Inconnu",
      viewCount: data.viewCount || 0,
      downloadCount: data.downloadCount || 0,
      isRevoked: data.isRevoked || false,
      isActive: isLinkActive(data),
      allowDownload: data.allowDownload ?? true,
      allowViewOnline: data.allowViewOnline ?? true,
      maxViews: data.maxViews || null,
      createdAt: toISO(data.createdAt) || new Date().toISOString(),
      expiresAt: toISO(data.expiresAt),
    };
  });
}
