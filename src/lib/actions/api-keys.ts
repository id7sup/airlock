"use server";

import { auth } from "@clerk/nextjs/server";
import { createAPIKey, listAPIKeys, revokeAPIKey } from "@/services/api-keys";
import { db } from "@/lib/firebase";

/**
 * Server Actions pour la gestion des clés API
 * Appelé depuis le dashboard pour créer/révoquer/lister les clés
 */

export async function createAPIKeyAction(data: {
  name: string;
  scopes: string[];
  expiresAt?: Date | null;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  try {
    // Obtenir le workspace ID de l'utilisateur
    // Pour l'MVP, on va assumer que chaque utilisateur a un workspace
    // En production, il faudrait vérifier les permissions
    let workspaceId = "";

    // Chercher le workspace de l'utilisateur
    const workspacesSnapshot = await db
      .collection("workspaces")
      .where("createdBy", "==", userId)
      .limit(1)
      .get();

    if (!workspacesSnapshot.empty) {
      workspaceId = workspacesSnapshot.docs[0].id;
    } else {
      // Si pas de workspace trouvé, créer un par défaut
      const workspaceRef = await db.collection("workspaces").add({
        createdBy: userId,
        name: `Workspace de ${userId}`,
        totalStorageUsed: 0,
        createdAt: new Date(),
      });
      workspaceId = workspaceRef.id;
    }

    // Créer la clé API
    const apiKey = await createAPIKey({
      name: data.name,
      userId,
      workspaceId,
      scopes: data.scopes,
      expiresAt: data.expiresAt || null,
    });

    return {
      success: true,
      apiKey,
    };
  } catch (error) {
    console.error("Erreur lors de la création de la clé API:", error);
    return {
      success: false,
      error: "Impossible de créer la clé API",
    };
  }
}

export async function listAPIKeysAction() {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  try {
    const keys = await listAPIKeys(userId);
    return {
      success: true,
      keys,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des clés API:", error);
    return {
      success: false,
      error: "Impossible de récupérer les clés API",
    };
  }
}

export async function revokeAPIKeyAction(apiKeyId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non autorisé");

  try {
    // Vérifier que la clé appartient à l'utilisateur
    const keyDoc = await db.collection("apiKeys").doc(apiKeyId).get();

    if (!keyDoc.exists || keyDoc.data()?.userId !== userId) {
      return {
        success: false,
        error: "Clé API non trouvée ou accès non autorisé",
      };
    }

    // Révoquer la clé
    const success = await revokeAPIKey(apiKeyId);

    if (success) {
      return {
        success: true,
        message: "Clé API révoquée avec succès",
      };
    } else {
      return {
        success: false,
        error: "Impossible de révoquer la clé API",
      };
    }
  } catch (error) {
    console.error("Erreur lors de la révocation de la clé API:", error);
    return {
      success: false,
      error: "Impossible de révoquer la clé API",
    };
  }
}
