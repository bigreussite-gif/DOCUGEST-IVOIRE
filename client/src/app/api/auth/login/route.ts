/**
 * POST /api/auth/login — connexion (Next.js uniquement).
 */
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signSessionToken } from "@/lib/auth";
import { isTransientPgError, resetPool } from "@/lib/db";
import * as store from "@/lib/serverStore";
export const runtime = "nodejs";

function isDbOrNetworkError(e: unknown): boolean {
  const m = e instanceof Error ? e.message : String(e);
  const code = (e as { code?: string }).code;
  if (code && ["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "ECONNRESET", "EAI_AGAIN"].includes(code)) return true;
  if (code && ["28P01", "3D000", "53300", "08000", "08003", "08006", "08001", "08004", "57P01", "XX000"].includes(code))
    return true;
  if (m.includes("DATABASE_URL") || m.includes("INSFORGE_DATABASE_URL") || m.includes("manquant")) return true;
  if (m.includes("ECONNREFUSED") || m.includes("connect ETIMEDOUT") || m.includes("getaddrinfo")) return true;
  if (m.includes("timeout") && m.toLowerCase().includes("connection")) return true;
  if (m.includes("SSL") || m.includes("certificate") || m.includes("self signed")) return true;
  if (
    /password authentication failed|authentication failed|no pg_hba\.conf|invalid_authorization_specification|SASL|FATAL:/i.test(
      m
    )
  )
    return true;
  if (m.includes("Connection terminated") || m.includes("Connection ended") || m.includes("server closed")) return true;
  if (m.includes("Neon") && /timeout|connection|closed/i.test(m)) return true;
  return false;
}

function loginFailureMessage(e: unknown): { message: string; status: number } {
  const m = e instanceof Error ? e.message : String(e);
  const code = (e as { code?: string }).code;

  if (m.includes("JWT_SECRET") || m.toLowerCase().includes("jwt")) {
    return { message: "Configuration serveur : JWT_SECRET manquant ou invalide.", status: 503 };
  }
  if (m.includes("DATABASE_URL") || m.includes("INSFORGE_DATABASE_URL") || /manquant|missing/i.test(m)) {
    return {
      message:
        "Base de données non configurée sur le serveur. Vérifiez la chaîne de connexion Postgres dans les variables d’environnement de production.",
      status: 503
    };
  }
  if (isDbOrNetworkError(e)) {
    if (code === "57P01") {
      return { message: "Service de base de données en maintenance. Réessayez plus tard.", status: 503 };
    }
    return {
      message: "Impossible de joindre nos serveurs. Réessayez dans quelques instants.",
      status: 503
    };
  }
  console.error("[api/auth/login] erreur non classée", { code, message: m.slice(0, 500) });
  return {
    message:
      "Connexion impossible pour le moment. Réessayez dans quelques minutes. Si le problème continue, contactez le support.",
    status: 503
  };
}

const schema = z.object({
  email: z.string().min(3),
  password: z.string().min(1),
  rememberMe: z.boolean()
});

export async function POST(req: Request) {
  console.log("[api/auth/login] POST reçu");
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Corps JSON invalide" }, { status: 400 });
    }
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      console.log("[api/auth/login] validation échouée", parsed.error.flatten());
      return NextResponse.json({ message: "Champs invalides", details: parsed.error.flatten() }, { status: 400 });
    }
    const { email, password, rememberMe } = parsed.data;
    const identifier = email.trim();

    const maxAttempts = 3;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const userRow = await store.getUserByLoginIdentifier(identifier);
        if (!userRow) {
          console.log("[api/auth/login] identifiant inconnu");
          return NextResponse.json({ message: "Identifiant ou mot de passe incorrect" }, { status: 401 });
        }

        if (!userRow.password_hash || typeof userRow.password_hash !== "string") {
          console.log("[api/auth/login] password_hash absent pour", userRow.id);
          return NextResponse.json(
            { message: "Compte incomplet: mot de passe indisponible, contactez l'administrateur." },
            { status: 401 }
          );
        }

        let ok = false;
        try {
          ok = await bcrypt.compare(password, userRow.password_hash);
        } catch (e) {
          console.log("[api/auth/login] hash mot de passe invalide", e);
          return NextResponse.json({ message: "Identifiant ou mot de passe incorrect" }, { status: 401 });
        }
        if (!ok) {
          console.log("[api/auth/login] mot de passe incorrect");
          return NextResponse.json({ message: "Identifiant ou mot de passe incorrect" }, { status: 401 });
        }

        try {
          await store.touchLastLogin(userRow.id);
        } catch (e) {
          console.warn("[api/auth/login] touchLastLogin ignoré", e);
        }
        try {
          await store.ensureBootstrapAdmin(userRow.id);
        } catch (e) {
          console.warn("[api/auth/login] ensureBootstrapAdmin ignoré", e);
        }
        const me = await store.getMe(userRow.id);
        if (!me) {
          return NextResponse.json({ message: "Erreur profil" }, { status: 500 });
        }
        let token = "";
        try {
          token = signSessionToken({
            userId: userRow.id,
            rememberMe,
            role: String(me.role ?? "user")
          });
        } catch (e) {
          console.error("[api/auth/login] signature JWT impossible", e);
          return NextResponse.json({ message: "Configuration auth incomplète (JWT_SECRET)." }, { status: 503 });
        }
        console.log("[api/auth/login] succès", userRow.id);
        return NextResponse.json({ token, user: me });
      } catch (e: unknown) {
        if (attempt < maxAttempts - 1 && isTransientPgError(e)) {
          resetPool();
          console.warn("[api/auth/login] nouvel essai après erreur PostgreSQL transitoire", attempt + 1, e);
          continue;
        }
        throw e;
      }
    }
  } catch (e: unknown) {
    console.error("[api/auth/login]", e);
    const { message, status } = loginFailureMessage(e);
    return NextResponse.json({ message }, { status });
  }
}
