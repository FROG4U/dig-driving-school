import crypto from "crypto";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { sendEmail, escapeHtml } from "@/lib/email";
import { SITE } from "@/lib/site-config";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me"
);

/** Cookie holding the half-finished login between password and code. */
export const PENDING_COOKIE = "dds_pending_login";

const CODE_TTL_MINUTES = 10;
const CODE_MAX_ATTEMPTS = 5;
const RESET_TTL_MINUTES = 60;

/**
 * Emergency off-switch. Set ADMIN_LOGIN_CODE="off" in .env if email delivery
 * breaks and the owner would otherwise be locked out of their own admin.
 * Anything else (including unset) leaves the code required.
 */
export function loginCodeRequired(): boolean {
  return (process.env.ADMIN_LOGIN_CODE || "on").toLowerCase() !== "off";
}

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/* ── Step 1 -> step 2 handoff ──────────────────────────────────────────── */

export async function signPendingToken(adminId: string): Promise<string> {
  return new SignJWT({ adminId, purpose: "login-code" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${CODE_TTL_MINUTES}m`)
    .sign(JWT_SECRET);
}

export async function readPendingToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.purpose !== "login-code") return null;
    return typeof payload.adminId === "string" ? payload.adminId : null;
  } catch {
    return null;
  }
}

/* ── Login codes ───────────────────────────────────────────────────────── */

/** Creates a code, stores only its hash, and emails the plain one. */
export async function issueLoginCode(admin: { id: string; email: string; name: string }): Promise<boolean> {
  // Any earlier unused code becomes invalid the moment a new one is sent.
  await prisma.loginCode.deleteMany({ where: { adminId: admin.id, usedAt: null } });

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  await prisma.loginCode.create({
    data: {
      adminId: admin.id,
      codeHash: sha256(code),
      expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60_000),
    },
  });

  const result = await sendEmail({
    to: admin.email,
    subject: `${code} is your ${SITE.name} login code`,
    html: `
      <h2 style="margin:0 0 12px">Your login code</h2>
      <p style="margin:0 0 16px">Hi ${escapeHtml(admin.name)}, use this code to finish signing in:</p>
      <p style="font-size:30px;font-weight:700;letter-spacing:6px;margin:0 0 16px">${code}</p>
      <p style="margin:0 0 8px;color:#555">It expires in ${CODE_TTL_MINUTES} minutes and can only be used once.</p>
      <p style="margin:0;color:#555">If you were not signing in, someone may know your password - change it straight away.</p>
    `,
  });

  // In development there is usually no email key, which would make the admin
  // impossible to sign into locally. Print the code to the server console
  // instead. Never in production: there, a failure to send must block login.
  if (!result.ok && result.skipped && process.env.NODE_ENV !== "production") {
    console.log(`[dev] login code for ${admin.email}: ${code}`);
    return true;
  }

  return result.ok;
}

export type CodeCheck = "ok" | "invalid" | "expired" | "too-many";

export async function checkLoginCode(adminId: string, code: string): Promise<CodeCheck> {
  const record = await prisma.loginCode.findFirst({
    where: { adminId, usedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return "invalid";
  if (record.attempts >= CODE_MAX_ATTEMPTS) return "too-many";
  if (record.expiresAt.getTime() < Date.now()) return "expired";

  if (sha256(code.trim()) !== record.codeHash) {
    await prisma.loginCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return "invalid";
  }

  await prisma.loginCode.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return "ok";
}

/* ── Password resets ───────────────────────────────────────────────────── */

/** Creates a reset link and emails it. Returns quietly if the email fails. */
export async function issuePasswordReset(admin: { id: string; email: string; name: string }): Promise<void> {
  await prisma.passwordReset.deleteMany({ where: { adminId: admin.id, usedAt: null } });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.passwordReset.create({
    data: {
      adminId: admin.id,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + RESET_TTL_MINUTES * 60_000),
    },
  });

  const link = `${SITE.url}/dds/reset?token=${token}`;

  // Same development aid as the login code - see issueLoginCode.
  if (process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY) {
    console.log(`[dev] password reset link for ${admin.email}: ${link}`);
  }

  await sendEmail({
    to: admin.email,
    subject: `Reset your ${SITE.name} admin password`,
    html: `
      <h2 style="margin:0 0 12px">Reset your password</h2>
      <p style="margin:0 0 16px">Hi ${escapeHtml(admin.name)}, click below to choose a new password.</p>
      <p style="margin:0 0 16px"><a href="${link}" style="background:#2271b1;color:#fff;padding:10px 18px;border-radius:4px;text-decoration:none">Choose a new password</a></p>
      <p style="margin:0 0 8px;color:#555">The link expires in ${RESET_TTL_MINUTES} minutes and works once.</p>
      <p style="margin:0;color:#555">If you did not ask for this, ignore this email - your password has not changed.</p>
    `,
  });
}

export async function consumePasswordReset(token: string): Promise<string | null> {
  const record = await prisma.passwordReset.findUnique({ where: { tokenHash: sha256(token) } });
  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) return null;
  await prisma.passwordReset.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return record.adminId;
}

/* ── Shared password rules ─────────────────────────────────────────────── */

export function passwordProblem(password: string): string | null {
  if (!password || password.length < 10) return "Use at least 10 characters.";
  if (!/[a-z]/i.test(password)) return "Include at least one letter.";
  if (!/[0-9]/.test(password)) return "Include at least one number.";
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
