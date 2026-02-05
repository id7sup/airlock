import { NextRequest, NextResponse } from "next/server";
import { validateShareLink } from "@/services/sharing";
import { db } from "@/lib/firebase";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { checkIfFolderIsChild } from "@/services/folders";
import mammoth from "mammoth";
import { xlsxToHtmlSheets } from "@/lib/xlsx-to-html";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

/**
 * Return an HTML error response that can be displayed in an iframe
 */
function htmlErrorResponse(message: string, status: number): NextResponse {
  const html = generateErrorHtml("Erreur", message);
  return new NextResponse(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}

/**
 * API route to convert Office files (DOCX, XLSX, PPTX) to HTML for secure viewing
 * Returns HTML content that can be rendered in an iframe or div with watermark overlay
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("fileId");
  const token = searchParams.get("token");

  if (!fileId || !token) {
    return htmlErrorResponse("Paramètres manquants", 400);
  }

  // 1. Validate share link
  const link: any = await validateShareLink(token);
  if (!link || link.error) {
    return htmlErrorResponse("Lien invalide, expiré ou quota atteint", 403);
  }

  // 2. Check file exists and belongs to shared folder
  const fileDoc = await db.collection("files").doc(fileId).get();
  if (!fileDoc.exists) {
    return htmlErrorResponse("Fichier non trouvé", 404);
  }

  const fileFolderId = fileDoc.data()?.folderId;
  if (!fileFolderId) {
    return htmlErrorResponse("Fichier non trouvé", 404);
  }

  // Check if file's folder is the shared folder or a subfolder
  const isInSharedFolder =
    fileFolderId === link.folderId ||
    (await checkIfFolderIsChild(fileFolderId, link.folderId));
  if (!isInSharedFolder) {
    return htmlErrorResponse("Fichier non trouvé", 404);
  }

  const file = fileDoc.data()!;
  const mimeType = file.mimeType || "";

  // 3. Get file from S3
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: file.s3Key,
    });

    const response = await s3Client.send(command);
    const fileBuffer = await streamToBuffer(response.Body as any);

    let htmlContent = "";
    let title = file.name || "Document";

    // 4. Convert based on file type
    if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    ) {
      // DOCX/DOC conversion using mammoth
      htmlContent = await convertDocxToHtml(fileBuffer, title);
    } else if (
      mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimeType === "application/vnd.ms-excel"
    ) {
      // XLSX/XLS conversion
      htmlContent = await convertXlsxToHtml(fileBuffer, title);
    } else if (
      mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      mimeType === "application/vnd.ms-powerpoint"
    ) {
      // PPTX/PPT - For now, show a message that full preview is not available
      htmlContent = generatePptxPreviewHtml(title);
    } else {
      return htmlErrorResponse("Format non supporté pour la conversion", 400);
    }

    // Return HTML with proper headers
    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, max-age=300",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch (error) {
    console.error("Error converting office file:", error);
    return htmlErrorResponse("Erreur lors de la conversion du fichier", 500);
  }
}

/**
 * Convert DOCX buffer to HTML
 */
async function convertDocxToHtml(buffer: Buffer, title: string): Promise<string> {
  try {
    const result = await mammoth.convertToHtml({ buffer });
    const bodyHtml = result.value;

    return wrapInSecureHtml(bodyHtml, title, "document");
  } catch (error) {
    console.error("Error converting DOCX:", error);
    return generateErrorHtml(title, "Impossible de convertir ce document Word.");
  }
}

/**
 * Convert XLSX buffer to HTML table (using exceljs)
 */
async function convertXlsxToHtml(buffer: Buffer, title: string): Promise<string> {
  try {
    const sheets = await xlsxToHtmlSheets(buffer);

    let tablesHtml = "";
    for (const sheet of sheets) {
      tablesHtml += `
        <div class="sheet">
          <h2 class="sheet-title">${escapeHtml(sheet.name)}</h2>
          <div class="table-wrapper">
            ${sheet.html}
          </div>
        </div>
      `;
    }

    return wrapInSecureHtml(tablesHtml, title, "spreadsheet");
  } catch (error) {
    console.error("Error converting XLSX:", error);
    return generateErrorHtml(title, "Impossible de convertir ce fichier Excel.");
  }
}

/**
 * Generate preview HTML for PowerPoint (limited support)
 */
function generatePptxPreviewHtml(title: string): string {
  const content = `
    <div class="pptx-notice">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: #93c5fd; margin-bottom: 20px;">
        <path d="M2 3h20v14H2z"/>
        <path d="m22 3-10 7L2 3"/>
        <path d="M6 21h12"/>
        <path d="M12 17v4"/>
      </svg>
      <h2>Présentation PowerPoint</h2>
      <p>L'aperçu des présentations PowerPoint n'est pas disponible dans le lecteur sécurisé.</p>
      <p class="hint">Le contenu est protégé en mode lecture seule.</p>
    </div>
  `;

  return wrapInSecureHtml(content, title, "presentation");
}

/**
 * Generate error HTML
 */
function generateErrorHtml(title: string, message: string): string {
  const content = `
    <div class="error-notice">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: #f87171; margin-bottom: 20px;">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h2>Erreur</h2>
      <p>${escapeHtml(message)}</p>
    </div>
  `;

  return wrapInSecureHtml(content, title, "error");
}

/**
 * Wrap content in secure HTML with watermark and protections
 */
function wrapInSecureHtml(content: string, title: string, type: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - Lecture seule</title>
  <style>
    * {
      box-sizing: border-box;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    html, body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: #1a1a2e;
      color: #e0e0e0;
      min-height: 100vh;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      position: relative;
      z-index: 1;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .header h1 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 10px 0;
      color: #fff;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: rgba(251, 191, 36, 0.15);
      border: 1px solid rgba(251, 191, 36, 0.3);
      border-radius: 20px;
      font-size: 0.7rem;
      color: #fcd34d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge svg {
      width: 12px;
      height: 12px;
    }

    .content {
      background: rgba(255,255,255,0.03);
      border-radius: 12px;
      padding: 30px;
      line-height: 1.7;
      color: #d0d0d0;
    }

    .content p {
      margin: 0 0 1em 0;
    }

    .content h1, .content h2, .content h3, .content h4 {
      color: #fff;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }

    .content h1:first-child, .content h2:first-child {
      margin-top: 0;
    }

    /* Spreadsheet styles */
    .sheet {
      margin-bottom: 30px;
    }

    .sheet-title {
      font-size: 1rem;
      color: #93c5fd;
      margin: 0 0 15px 0;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .content table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }

    .content th, .content td {
      padding: 8px 12px;
      border: 1px solid rgba(255,255,255,0.1);
      text-align: left;
    }

    .content th {
      background: rgba(59, 130, 246, 0.1);
      color: #93c5fd;
      font-weight: 600;
    }

    .content tr:nth-child(even) {
      background: rgba(255,255,255,0.02);
    }

    /* Notice styles */
    .pptx-notice, .error-notice {
      text-align: center;
      padding: 60px 20px;
    }

    .pptx-notice h2, .error-notice h2 {
      margin: 0 0 15px 0;
      color: #fff;
      font-size: 1.25rem;
    }

    .pptx-notice p, .error-notice p {
      margin: 0 0 10px 0;
      color: #a0a0a0;
    }

    .hint {
      font-size: 0.85rem;
      color: #6b7280 !important;
    }

    /* Watermark overlay */
    .watermark {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      overflow: hidden;
    }

    .watermark::before {
      content: 'AIRLOCK - LECTURE SEULE - AIRLOCK - LECTURE SEULE';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 20px;
      font-weight: bold;
      color: rgba(255, 255, 255, 0.03);
      white-space: nowrap;
      letter-spacing: 15px;
      width: 300%;
      text-align: center;
      line-height: 80px;
    }

    /* Print protection */
    @media print {
      body * {
        display: none !important;
      }
      body::after {
        content: "Impression non autorisée - Document protégé";
        display: block;
        text-align: center;
        padding: 50px;
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${escapeHtml(title)}</h1>
      <span class="badge">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Lecture seule
      </span>
    </div>
    <div class="content">
      ${content}
    </div>
  </div>
  <div class="watermark"></div>
  <script>
    // Disable right-click
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      return false;
    });

    // Disable keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        return false;
      }
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i'))) {
        e.preventDefault();
        return false;
      }
    });

    // Disable drag
    document.addEventListener('dragstart', function(e) {
      e.preventDefault();
      return false;
    });

    // Disable selection
    document.addEventListener('selectstart', function(e) {
      e.preventDefault();
      return false;
    });

    // Disable copy
    document.addEventListener('copy', function(e) {
      e.preventDefault();
      return false;
    });
  </script>
</body>
</html>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
