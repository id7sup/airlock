import { NextRequest, NextResponse } from "next/server";
import { validateShareLink } from "@/services/sharing";
import { db } from "@/lib/firebase";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { checkIfFolderIsChild } from "@/services/folders";
import { trackEvent } from "@/services/analytics";
import { getClientIP, getGeolocationFromIP, isVPNOrDatacenter } from "@/lib/geolocation";
import { generateVisitorId, generateStableVisitorId } from "@/lib/visitor";
import { generateWatermarkedFile } from "@/services/watermarking";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("fileId");
  const token = searchParams.get("token");

  if (!fileId || !token) {
    return NextResponse.json(
      { error: "Paramètres manquants" },
      { status: 400 }
    );
  }

  // 1. Validate share link
  const link: any = await validateShareLink(token);
  if (!link || link.error) {
    return NextResponse.json(
      { error: "Lien invalide, expiré ou quota atteint" },
      { status: 403 }
    );
  }

  // 2. Check file exists and belongs to shared folder
  const fileDoc = await db.collection("files").doc(fileId).get();
  if (!fileDoc.exists) {
    return NextResponse.json({ error: "Fichier non trouvé" }, { status: 404 });
  }

  const fileFolderId = fileDoc.data()?.folderId;
  if (!fileFolderId) {
    return NextResponse.json({ error: "Fichier non trouvé" }, { status: 404 });
  }

  // Check if file's folder is the shared folder or a subfolder
  const isInSharedFolder =
    fileFolderId === link.folderId ||
    (await checkIfFolderIsChild(fileFolderId, link.folderId));
  if (!isInSharedFolder) {
    return NextResponse.json({ error: "Fichier non trouvé" }, { status: 404 });
  }

  const file = fileDoc.data()!;

  // 3. Check VPN/Datacenter blocking if enabled
  if (link.blockVpn === true) {
    try {
      const clientIP = getClientIP(req);
      if (clientIP !== "unknown") {
        const { isBlocked, geolocation } = await isVPNOrDatacenter(clientIP);
        if (isBlocked) {
          try {
            const userAgent = req.headers.get("user-agent") || undefined;
            const referer = req.headers.get("referer") || undefined;
            const visitorId = generateVisitorId(clientIP, userAgent);
            const visitorIdStable = generateStableVisitorId(clientIP, userAgent);

            await trackEvent({
              linkId: link.id || link.linkId,
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

          return NextResponse.json(
            { error: "L'accès via VPN ou datacenter est bloqué" },
            { status: 403 }
          );
        }
      }
    } catch (error) {
      console.error("Error checking VPN/Datacenter:", error);
    }
  }

  // 4. Check if watermarked version exists in derivedAssets
  let watermarkedAsset: any = null;
  try {
    const derivedQuery = await db
      .collection("derivedAssets")
      .where("fileId", "==", fileId)
      .where("variant", "==", "watermarked")
      .where("shareLinkId", "==", link.id || link.linkId)
      .where("status", "==", "ready")
      .limit(1)
      .get();

    if (!derivedQuery.empty) {
      watermarkedAsset = derivedQuery.docs[0].data();
    }
  } catch (error) {
    console.error("Error checking watermarked asset:", error);
  }

  // 5. If watermarked version doesn't exist, generate it
  if (!watermarkedAsset) {
    try {
      console.log(
        `Generating watermarked version for file ${fileId} link ${link.id || link.linkId}`
      );
      await generateWatermarkedFile(
        fileId,
        link.id || link.linkId
      );

      // Retrieve the generated asset
      const derivedQuery = await db
        .collection("derivedAssets")
        .where("fileId", "==", fileId)
        .where("variant", "==", "watermarked")
        .where("shareLinkId", "==", link.id || link.linkId)
        .limit(1)
        .get();

      if (!derivedQuery.empty) {
        watermarkedAsset = derivedQuery.docs[0].data();
      }
    } catch (error) {
      console.error("Error generating watermarked file:", error);
      // Fallback: serve original file if watermarking fails
      // This is handled below
    }
  }

  // 6. Track the view event
  try {
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get("user-agent") || undefined;
    const referer = req.headers.get("referer") || undefined;

    const visitorId = generateVisitorId(clientIP, userAgent);
    const visitorIdStable = generateStableVisitorId(clientIP, userAgent);

    let geolocation;
    try {
      if (clientIP !== "unknown") {
        geolocation = await getGeolocationFromIP(clientIP);
        if (geolocation) {
          geolocation = Object.fromEntries(
            Object.entries(geolocation).filter(([_, v]) => v !== undefined)
          ) as any;
        }
      }
    } catch (error) {
      console.error("Error getting geolocation for VIEW_FILE_WATERMARKED:", error);
    }

    await trackEvent({
      linkId: link.id || link.linkId,
      eventType: "VIEW_FILE_WATERMARKED",
      geolocation,
      visitorId,
      visitorIdStable,
      clientIP,
      referer,
      userAgent,
      fileId: fileId,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Error tracking VIEW_FILE_WATERMARKED:", error);
  }

  // 7. Serve the watermarked file
  try {
    let fileKey = file.s3Key;
    let contentType = file.mimeType;

    // Use watermarked version if available
    if (watermarkedAsset?.objectKeyR2) {
      fileKey = watermarkedAsset.objectKeyR2;
    }

    // Get file from S3
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    const response = await s3Client.send(command);
    const fileBuffer = await streamToBuffer(response.Body as any);

    // Determine Content-Type
    if (!contentType) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const extensionMap: Record<string, string> = {
        pdf: "application/pdf",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
        txt: "text/plain",
        html: "text/html",
        xml: "text/xml",
        json: "application/json",
      };
      contentType =
        (ext && extensionMap[ext]) || "application/octet-stream";
    }

    // Safely encode filename
    const safeFileName = file.name.replace(/[^\x20-\x7E]/g, "_");
    const encodedFileName = encodeURIComponent(file.name).replace(/'/g, "%27");

    // Return watermarked file
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`,
        "Cache-Control": "private, max-age=600",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du fichier watermarké:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement du fichier. Veuillez réessayer." },
      { status: 500 }
    );
  }
}

/**
 * Convert stream to buffer
 */
function streamToBuffer(stream: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}
