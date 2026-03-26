/**
 * POST /api/auth/password-reset-request
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { signPasswordResetToken } from "@/lib/auth";
import { getPublicAppUrl } from "@/lib/appUrl";
import { sendMail } from "@/lib/mailer";
import * as store from "@/lib/serverStore";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  console.log("[api/auth/password-reset-request] POST");
  try {
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Email invalide" }, { status: 400 });
    }
    const { email } = parsed.data;
    const sel = await store.getUserByEmail(email);

    if (sel) {
      const resetToken = signPasswordResetToken(sel.id);
      const link = `${getPublicAppUrl()}/reset-password?token=${encodeURIComponent(resetToken)}`;
      try {
        await sendMail({
          to: sel.email,
          subject: "Réinitialisation du mot de passe",
          text: `Bonjour,\n\nCliquez sur le lien pour réinitialiser votre mot de passe :\n${link}\n\nSi vous n’êtes pas à l’origine de cette demande, ignorez ce message.\n`
        });
      } catch (e) {
        console.error("[password-reset-request] mail", e);
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("[password-reset-request]", e);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
