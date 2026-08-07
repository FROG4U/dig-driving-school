import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/seo";
import PageBanner from "@/components/PageBanner";
import { getCmsPage } from "@/lib/cms-pages";
import { getContactSettings } from "@/lib/site-settings";
import Icon from "@/components/Icon";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("/enquiry", {
    title: "Book Driving Lessons | Dig Driving School",
    description:
      "Book your driving lessons with Dig Driving School. Quick enquiry form - we'll get back to you within 24 hours. Manual and automatic lessons, 7 days a week.",
  });
}

type Detail = { icon: string; label: string; value: string; href?: string };

const steps = [
  { title: "You send the form", desc: "Takes under a minute. Nothing is booked or charged yet." },
  { title: "We call you back", desc: "Within 24 hours, to talk through what you need and when you're free." },
  { title: "First lesson booked", desc: "We confirm a slot and pick you up from home, work or college." },
];

export default async function EnquiryLayout({ children }: { children: React.ReactNode }) {
  const contact = await getContactSettings();

  const details: Detail[] = [];
  if (contact.phone)
    details.push({
      icon: "phone",
      label: "Phone",
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s/g, "")}`,
    });
  if (contact.email)
    details.push({ icon: "mail", label: "Email", value: contact.email, href: `mailto:${contact.email}` });
  if (contact.address) details.push({ icon: "pin", label: "Area covered", value: contact.address });
  if (contact.hours) details.push({ icon: "clock", label: "Hours", value: contact.hours });

  return (
    <>
      <PageBanner slug="/enquiry" fallback={getCmsPage("/enquiry")!.banner} />

      <section style={{ background: "#0d1728", padding: "clamp(4.5rem, 10vw, 7.5rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <div className="grid gap-10 lg:gap-14 lg:grid-cols-[1.3fr_1fr] items-start">
            {/* ── Form column (the client page) ───────────────── */}
            <div>{children}</div>

            {/* ── What happens next + contact details ─────────── */}
            <aside className="card card-accent" style={{ padding: "clamp(1.75rem, 4vw, 2.5rem)" }}>
              <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>What happens next</p>
              <h2 style={{ fontSize: "1.6rem", marginBottom: "2rem" }}>Three steps to your first lesson</h2>

              <div style={{ borderTop: "1px solid #24354f" }}>
                {steps.map((s, index) => (
                  <div
                    key={s.title}
                    style={{
                      display: "flex",
                      gap: "1.1rem",
                      alignItems: "flex-start",
                      padding: "1.35rem 0",
                      borderBottom: "1px solid #24354f",
                    }}
                  >
                    <span className="numeral" style={{ fontSize: "2.2rem", color: "#1e2e4a", flexShrink: 0, width: "2.4rem" }}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div style={{ color: "#eef2f9", fontWeight: 600, fontSize: "1rem", marginBottom: "0.35rem" }}>
                        {s.title}
                      </div>
                      <p style={{ color: "#94a5c0", fontSize: "0.9rem", lineHeight: 1.65 }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {details.length > 0 && (
                <>
                  <p
                    style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: "0.66rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "#63779a",
                      margin: "2rem 0 1.1rem",
                    }}
                  >
                    Or reach us direct
                  </p>
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {details.map((d) => (
                      <div key={d.label} style={{ display: "flex", gap: "0.8rem", alignItems: "flex-start" }}>
                        <span style={{ color: "#f47c20", display: "inline-flex", marginTop: "2px", flexShrink: 0 }}>
                          <Icon name={d.icon} size={17} />
                        </span>
                        {d.href ? (
                          <a
                            href={d.href}
                            className="bare"
                            style={{ color: "#eef2f9", fontSize: "0.95rem", textDecoration: "none", wordBreak: "break-word" }}
                          >
                            {d.value}
                          </a>
                        ) : (
                          <span style={{ color: "#94a5c0", fontSize: "0.95rem" }}>{d.value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
