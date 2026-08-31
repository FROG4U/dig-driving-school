import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, escapeHtml, OWNER_EMAIL } from "@/lib/email";
import { SITE } from "@/lib/site-config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, contactNumber, email, location, message } = body;

    if (!fullName || !contactNumber || !email || !location || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const enquiry = await prisma.enquiry.create({
      data: { fullName, contactNumber, email, location, message },
    });

    // Emails are best-effort - the enquiry is already saved, so never fail the
    // request if sending errors or isn't configured yet.
    try {
      // 1) Notify DIG (reply-to the customer so he can reply straight back).
      if (OWNER_EMAIL) {
        await sendEmail({
          to: OWNER_EMAIL,
          replyTo: email,
          subject: `New enquiry from ${fullName}`,
          html: `
            <h2 style="margin:0 0 12px">New website enquiry</h2>
            <p style="margin:0 0 4px"><strong>Name:</strong> ${escapeHtml(fullName)}</p>
            <p style="margin:0 0 4px"><strong>Phone:</strong> ${escapeHtml(contactNumber)}</p>
            <p style="margin:0 0 4px"><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p style="margin:0 0 12px"><strong>Area:</strong> ${escapeHtml(location)}</p>
            <p style="margin:0 0 4px"><strong>Message:</strong></p>
            <p style="margin:0;white-space:pre-wrap">${escapeHtml(message)}</p>
          `,
        });
      }

      // 2) Auto-reply to the customer (reply-to DIG's inbox).
      await sendEmail({
        to: email,
        replyTo: OWNER_EMAIL || undefined,
        subject: "Thanks for your enquiry - DIG Driving School",
        html: `
          <p>Hi ${escapeHtml(String(fullName).split(" ")[0] || fullName)},</p>
          <p>Thanks for getting in touch with DIG Driving School. DIG will be in
          touch within 24 hours to confirm availability and arrange your first lesson.</p>
          <p>Kind regards,<br/>DIG Driving School, ${SITE.location}</p>
        `,
      });
    } catch {
      // ignore - enquiry is safely saved regardless
    }

    return NextResponse.json({ success: true, id: enquiry.id });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
