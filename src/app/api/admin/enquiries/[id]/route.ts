import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";
import { sendEmail, escapeHtml, OWNER_EMAIL } from "@/lib/email";
import { SITE } from "@/lib/site-config";

// Send a reply email to the customer for this enquiry, then mark it responded.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await params;
  const { message } = (await req.json()) as { message?: string };
  if (!message || !message.trim()) {
    return NextResponse.json({ error: "Reply message is required." }, { status: 400 });
  }

  const enquiry = await prisma.enquiry.findUnique({ where: { id } });
  if (!enquiry) return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });

  const firstName = enquiry.fullName.split(" ")[0] || enquiry.fullName;
  const result = await sendEmail({
    to: enquiry.email,
    replyTo: OWNER_EMAIL || undefined,
    subject: "Re: your enquiry - Dig Driving School",
    html: `
      <p>Hi ${escapeHtml(firstName)},</p>
      <div style="white-space:pre-wrap">${escapeHtml(message)}</div>
      <p>Kind regards,<br/>Dig<br/>Dig Driving School, ${SITE.location}</p>
    `,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.skipped ? "Email isn't set up yet - add your RESEND_API_KEY and EMAIL_FROM." : "Could not send the email. Please try again." },
      { status: 500 }
    );
  }

  await prisma.enquiry.update({ where: { id }, data: { status: "responded" } });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await params;

  await prisma.enquiry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
