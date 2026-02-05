import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Adresse email invalide." },
        { status: 400 }
      );
    }

    const sheetUrl = process.env.GOOGLE_SHEET_WAITLIST_URL;

    if (!sheetUrl) {
      console.error("GOOGLE_SHEET_WAITLIST_URL is not configured");
      return NextResponse.json(
        { error: "Service indisponible." },
        { status: 500 }
      );
    }

    const response = await fetch(sheetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      console.error("Google Sheet error:", response.status);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
