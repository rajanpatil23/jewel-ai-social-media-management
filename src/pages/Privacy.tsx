import { useEffect } from "react";

const Privacy = () => {
  useEffect(() => {
    document.title = "Privacy Policy — Advora";
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="mx-auto max-w-3xl px-6 py-12 leading-relaxed">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Effective date: 6 May 2026 · Last updated: 6 May 2026
        </p>

        <p className="mb-6">
          Advora ("Advora", "we", "us", or "our") provides a SaaS platform that helps
          businesses manage their social media presence on Meta platforms (Facebook and
          Instagram), including analytics, content scheduling, and ad insights. This Privacy
          Policy explains what information we collect, how we use and store it, who we share
          it with, and the choices and rights you have. It applies to all users of the
          Advora web application and related services (the "Service").
        </p>

        <Section title="1. Who we are">
          <p>
            Advora is the data controller for personal information collected directly from
            registered users. When you connect a third-party account (such as a Facebook
            Page, Instagram Business account, or Meta Ad Account), we act as a data
            processor for the data we receive from those platforms on your behalf.
          </p>
        </Section>

        <Section title="2. Information we collect">
          <h3 className="font-semibold mt-4 mb-2">2.1 Information you provide</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Account info: name, email, password (hashed), workspace name.</li>
            <li>Billing information processed by our payment provider (we do not store full card numbers).</li>
            <li>Support communications you send to us.</li>
          </ul>

          <h3 className="font-semibold mt-6 mb-2">2.2 Information from Meta when you connect</h3>
          <p className="mb-2">
            When you click "Connect Meta" and authorize via Facebook Login, we receive only
            the data covered by the permissions you grant, which may include:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Facebook user ID, name, email (basic profile).</li>
            <li>List of Facebook Pages you administer (<code>pages_show_list</code>).</li>
            <li>Page access tokens and Page metadata (<code>pages_read_engagement</code>).</li>
            <li>Connected Instagram Business account ID, username, profile picture, follower counts, media (<code>instagram_basic</code>).</li>
            <li>Insights for your Pages, IG accounts, and posts (<code>instagram_manage_insights</code>, <code>read_insights</code>).</li>
            <li>Business Manager assets you control (<code>business_management</code>).</li>
            <li>Ad account read-only data such as campaign performance (<code>ads_read</code>) where authorized.</li>
          </ul>
          <p className="mt-3">
            We do <strong>not</strong> collect your Facebook password, private messages,
            your friends' personal data, or content from accounts you do not administer.
          </p>

          <h3 className="font-semibold mt-6 mb-2">2.3 Information collected automatically</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Log data: IP address, browser type, pages visited, timestamps.</li>
            <li>Cookies to keep you signed in and remember preferences.</li>
            <li>Aggregated, non-identifying usage analytics.</li>
          </ul>
        </Section>

        <Section title="3. How we use your information">
          <ul className="list-disc pl-6 space-y-1">
            <li>To provide, operate, and improve the Service.</li>
            <li>To display analytics, scheduled posts, and insights for the Meta accounts you connect.</li>
            <li>To authenticate you and secure your account.</li>
            <li>To send transactional messages (password resets, billing receipts, service notifications).</li>
            <li>To comply with legal obligations and enforce our Terms.</li>
          </ul>
          <p className="mt-3">
            We do <strong>not</strong> sell your personal information. We do not use data
            obtained via Meta APIs for advertising, profiling, or to train AI models without
            your explicit consent.
          </p>
        </Section>

        <Section title="4. How we store and protect your data">
          <ul className="list-disc pl-6 space-y-1">
            <li>Stored on secured servers operated by our hosting provider.</li>
            <li>Meta access tokens are encrypted at rest and transmitted over TLS.</li>
            <li>Production access is restricted to authorized personnel and logged.</li>
            <li>Retention: while your account is active. On account deletion, personal data is removed or anonymized within 30 days, except where retention is required by law.</li>
          </ul>
        </Section>

        <Section title="5. Sharing your information">
          <ul className="list-disc pl-6 space-y-1">
            <li>With service providers acting on our behalf (hosting, email, payments) under confidentiality.</li>
            <li>With Meta, when you initiate API actions (e.g. publishing a scheduled post).</li>
            <li>If required by law, regulation, or legal process.</li>
            <li>In a merger, acquisition, or asset sale — with notice to affected users.</li>
          </ul>
        </Section>

        <Section title="6. Your rights and choices">
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Disconnect a Meta account</strong> in Advora at <em>Connections → Disconnect</em>. This revokes our stored tokens.</li>
            <li><strong>Revoke from Meta directly</strong> at{" "}
              <a className="text-primary underline" href="https://www.facebook.com/settings?tab=business_tools" target="_blank" rel="noopener noreferrer">
                facebook.com/settings?tab=business_tools
              </a>.
            </li>
            <li><strong>Access, correct, export, or delete</strong> your data — email us (see Contact).</li>
            <li><strong>Withdraw consent</strong> for non-essential processing.</li>
            <li>EU/UK users have GDPR rights; California users have CCPA rights. We honour applicable rights regardless of where you live.</li>
          </ul>
        </Section>

        <Section title="7. Data deletion instructions (Meta)">
          <div className="rounded-lg border border-border bg-muted/40 p-5">
            <p className="font-semibold mb-2">How to request deletion of your data:</p>
            <ol className="list-decimal pl-6 space-y-1">
              <li>
                Email{" "}
                <a className="text-primary underline" href="mailto:privacy@advora.in">privacy@advora.in</a>{" "}
                from your Advora account address with subject "Data deletion request".
              </li>
              <li>We delete all personal and Meta-derived data tied to your account within 30 days and confirm by email.</li>
              <li>Or log in to Advora → <em>Settings → Account → Delete account</em> for immediate deletion.</li>
            </ol>
            <p className="text-sm text-muted-foreground mt-3">
              You may also remove Advora from{" "}
              <a className="text-primary underline" href="https://www.facebook.com/settings?tab=business_tools" target="_blank" rel="noopener noreferrer">
                Facebook Business Integrations
              </a>.
            </p>
          </div>
        </Section>

        <Section title="8. Children's privacy">
          <p>The Service is not directed to anyone under 13 (under 16 in the EU). We do not knowingly collect data from children.</p>
        </Section>

        <Section title="9. International transfers">
          <p>Your data may be processed in countries other than your own. Where required, we use safeguards such as Standard Contractual Clauses.</p>
        </Section>

        <Section title="10. Changes to this policy">
          <p>We may update this policy from time to time. Material changes will be notified via email or in-app at least 14 days before they take effect.</p>
        </Section>

        <Section title="11. Contact us">
          <p>
            <strong>Email:</strong>{" "}
            <a className="text-primary underline" href="mailto:privacy@advora.in">privacy@advora.in</a>
            <br />
            <strong>Website:</strong>{" "}
            <a className="text-primary underline" href="https://advora.in">https://advora.in</a>
          </p>
        </Section>

        <footer className="mt-12 pt-6 border-t border-border text-sm text-muted-foreground">
          © 2026 Advora. All rights reserved.
        </footer>
      </article>
    </main>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mt-8">
    <h2 className="text-xl font-semibold border-b border-border pb-2 mb-3">{title}</h2>
    {children}
  </section>
);

export default Privacy;
