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
      const html = `
<p>Bonjour,</p>
<p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe (lien valable 1 h) :</p>
<p style="margin:24px 0"><a href="${link}" style="display:inline-block;padding:12px 24px;background:#1a6b4a;color:#fff;text-decoration:none;border-radius:12px;font-weight:600">Réinitialiser mon mot de passe</a></p>
<p style="font-size:13px;color:#64748b">Si le bouton ne fonctionne pas, copiez-collez cette adresse dans votre navigateur :</p>
<p style="font-size:12px;word-break:break-all;color:#334155">${link}</p>
<p style="font-size:13px;color:#64748b">Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.</p>`;
      try {
        await sendMail({
          to: sel.email,
          subject: "Réinitialisation du mot de passe — DocuGestIvoire",
          text: `Bonjour,\n\nRéinitialisez votre mot de passe en ouvrant ce lien dans votre navigateur :\n${link}\n\n(Valable 1 heure.)\n\nSi vous n’êtes pas à l’origine de cette demande, ignorez ce message.\n`,
          html
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
