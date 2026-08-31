import { Resend } from "resend";

// Sender must be an address on a domain verified in Resend.
const FROM = process.env.EMAIL_FROM || "DIG Driving School <onboarding@resend.dev>";

// DIG's inbox - receives enquiry notifications and is the reply-to on
// customer-facing emails, so replies land in his Gmail.
export const OWNER_EMAIL = process.env.OWNER_EMAIL || "";

export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Send an email via Resend. Never throws - returns a result object so callers
 * (e.g. the enquiry form) can carry on even if email isn't configured or fails.
 * `skipped` means no RESEND_API_KEY is set yet.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, skipped: true };
  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
    });
    if (error) return { ok: false, error: typeof error === "string" ? error : JSON.stringify(error) };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "send failed" };
  }
}
