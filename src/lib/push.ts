import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/site-config";

// Web push for admin notifications. Mirrors src/lib/email.ts: it never throws
// and silently no-ops when VAPID keys aren't configured, so a failed or absent
// push can never break the request that triggered it (e.g. an enquiry submit).

const PUBLIC = process.env.VAPID_PUBLIC_KEY || "";
const PRIVATE = process.env.VAPID_PRIVATE_KEY || "";
const SUBJECT = process.env.VAPID_SUBJECT || `mailto:hello@${new URL(SITE.url).host.replace(/^www\./, "")}`;

let configured = false;
function ensureConfigured(): boolean {
  if (!PUBLIC || !PRIVATE) return false;
  if (!configured) {
    webpush.setVapidDetails(SUBJECT, PUBLIC, PRIVATE);
    configured = true;
  }
  return true;
}

export function pushEnabled(): boolean {
  return !!(PUBLIC && PRIVATE);
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  /** Current count of new enquiries - the service worker puts this on the app icon. */
  count?: number;
}

/** Send a notification to every subscribed admin device. Best-effort. */
export async function sendPushToAdmins(payload: PushPayload): Promise<void> {
  try {
    if (!ensureConfigured()) return;
    const subs = await prisma.pushSubscription.findMany();
    if (subs.length === 0) return;

    const data = JSON.stringify(payload);
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            data
          );
        } catch (err: unknown) {
          // 404/410 = subscription gone; prune it so we don't keep retrying.
          const code = (err as { statusCode?: number })?.statusCode;
          if (code === 404 || code === 410) {
            await prisma.pushSubscription.delete({ where: { endpoint: s.endpoint } }).catch(() => {});
          }
        }
      })
    );
  } catch {
    // never throw
  }
}
