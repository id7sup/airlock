import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

/**
 * Route API pour servir favicon-192x192.png
 * Accessible publiquement sans authentification
 */
export async function GET(req: NextRequest) {
  try {
    const logoPath = join(process.cwd(), "public", "assets", "logo.png");
    const logoBuffer = await readFile(logoPath);

    return new NextResponse(logoBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error serving favicon-192x192.png:", error);
    return new NextResponse("Not Found", { status: 404 });
  }
}

