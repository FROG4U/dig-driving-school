import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/seo";
import PageBanner from "@/components/PageBanner";
import { getCmsPage } from "@/lib/cms-pages";
import { getContactSettings } from "@/lib/site-settings";
import Icon from "@/components/Icon";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("/contact", {
    title: "Contact Dig Driving School",
    description:
      "Get in touch with Dig Driving School. Book driving lessons, ask about prices or request more info. Available 7 days a week - call or use our online form.",
  });
}

type Detail = { icon: string; label: string; value: string; href?: string };

const reassurance = [
  "We reply to every enquiry within 24 hours.",
  "No deposit and no card details needed to enquire.",
  "Manual or automatic, and we can help you pick.",
];

export default async function ContactLayout({ children }: { children: React.ReactNode }) {
  const contact = await getContactSettings();

  const details: Detail[] = [];
  if (contact.address) details.push({ icon: "pin", label: "Based in", value: contact.address });
  if (contact.phone)
    details.push({
      icon: "phone",
      label: "Phone",
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s/g, "")}`,
    });
  if (contact.email)
    details.push({ icon: "mail", label: "Email", value: contact.email, href: `mailto:${contact.email}` });
  if (contact.hours) details.push({ icon: "clock", label: "Availability", value: contact.hours });

  return (
    <>
      <PageBanner slug="/contact" fallback={getCmsPage("/contact")!.banner} />

      <section style={{ background: "#070d18", padding: "clamp(4.5rem, 10vw, 7.5rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <div className="grid gap-10 lg:gap-14 lg:grid-cols-[1.3fr_1fr] items-start">
            {/* ── Form column (the client page) ───────────────── */}
            <div>{children}</div>

            {/* ── Details / reassurance panel ─────────────────── */}
            <aside className="card card-accent" style={{ padding: "clamp(1.75rem, 4vw, 2.5rem)" }}>
              <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>Talk to us</p>
              <h2 style={{ fontSize: "1.6rem", marginBottom: "1rem" }}>Straight through to your instructor</h2>
              <p style={{ color: "#94a5c0", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "2.25rem" }}>
                No call centre and no waiting list - the person who answers is the person
                who&apos;ll be sat next to you in the car.
              </p>

              {details.length > 0 && (
                <div style={{ borderTop: "1px solid #24354f" }}>
                  {details.map((d) => (
                    <div
                      key={d.label}
                      style={{
                        display: "flex",
                        gap: "1rem",
                        alignItems: "flex-start",
                        padding: "1.15rem 0",
                        borderBottom: "1px solid #24354f",
                      }}
                    >
                      <span style={{ color: "#f47c20", display: "inline-flex", marginTop: "2px", flexShrink: 0 }}>
                        <Icon name={d.icon} size={18} />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: "var(--font-mono), monospace",
                            fontSize: "0.66rem",
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: "#63779a",
                            marginBottom: "0.4rem",
                          }}
                        >
                          {d.label}
                        </div>
                        {d.href ? (
                          <a
                            href={d.href}
                            className="bare"
                            style={{ color: "#eef2f9", fontSize: "0.98rem", textDecoration: "none", wordBreak: "break-word" }}
                          >
                            {d.value}
                          </a>
                        ) : (
                          <div style={{ color: "#eef2f9", fontSize: "0.98rem" }}>{d.value}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <ul style={{ listStyle: "none", margin: "2rem 0 0", padding: 0, display: "grid", gap: "0.9rem" }}>
                {reassurance.map((r) => (
                  <li key={r} style={{ display: "flex", gap: "0.7rem", alignItems: "flex-start" }}>
                    <span style={{ color: "#f47c20", display: "inline-flex", marginTop: "3px", flexShrink: 0 }}>
                      <Icon name="check" size={15} />
                    </span>
                    <span style={{ color: "#94a5c0", fontSize: "0.9rem", lineHeight: 1.6 }}>{r}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
