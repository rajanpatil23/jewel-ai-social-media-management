import { useEffect } from "react";

const Terms = () => {
  useEffect(() => { document.title = "Terms of Service — Advora"; }, []);
  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="mx-auto max-w-3xl px-6 py-12 leading-relaxed">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Effective date: 6 May 2026</p>

        <Section title="1. Acceptance of terms">
          <p>By accessing or using Advora (the "Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
        </Section>

        <Section title="2. Description of service">
          <p>Advora is a SaaS platform that helps businesses manage their Meta (Facebook & Instagram) presence — including analytics, scheduling, content publishing, and ad insights — by connecting Pages, Instagram Business accounts, and Ad accounts the user administers.</p>
        </Section>

        <Section title="3. Eligibility & accounts">
          <ul className="list-disc pl-6 space-y-1">
            <li>You must be at least 13 years old (16 in the EU) to use the Service.</li>
            <li>You are responsible for keeping your credentials secure and for all activity under your account.</li>
            <li>You must only connect Meta assets (Pages, IG accounts, Ad accounts) that you own or are authorized to manage.</li>
          </ul>
        </Section>

        <Section title="4. Acceptable use">
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Violate Meta's Platform Terms, Community Standards, or Advertising Policies.</li>
            <li>Post spam, hateful, illegal, or infringing content via the Service.</li>
            <li>Attempt to reverse-engineer, scrape, or overload the Service.</li>
            <li>Use the Service to misrepresent identity or impersonate others.</li>
          </ul>
        </Section>

        <Section title="5. Third-party services (Meta)">
          <p>The Service integrates with Meta's APIs. Your use of those features is also subject to{" "}
            <a className="text-primary underline" href="https://www.facebook.com/terms" target="_blank" rel="noopener noreferrer">Meta's Terms</a> and{" "}
            <a className="text-primary underline" href="https://developers.facebook.com/terms" target="_blank" rel="noopener noreferrer">Platform Terms</a>.
            We are not responsible for changes Meta makes to its platform.
          </p>
        </Section>

        <Section title="6. Subscription & payment">
          <ul className="list-disc pl-6 space-y-1">
            <li>Paid plans are billed in advance on a recurring basis until cancelled.</li>
            <li>Fees are non-refundable except as required by law.</li>
            <li>You can cancel anytime; access continues until the end of the current billing period.</li>
          </ul>
        </Section>

        <Section title="7. Intellectual property">
          <p>Advora and its logos, code, and content are owned by us. You retain ownership of content you upload or generate; you grant us a limited license to host and process it solely to provide the Service.</p>
        </Section>

        <Section title="8. Termination">
          <p>You may terminate your account at any time from <em>Settings → Account</em>. We may suspend or terminate accounts that violate these Terms, Meta's policies, or applicable law. On termination, your data is handled per our Privacy Policy.</p>
        </Section>

        <Section title="9. Disclaimers">
          <p>The Service is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free operation, or any specific results from using the Service.</p>
        </Section>

        <Section title="10. Limitation of liability">
          <p>To the maximum extent permitted by law, Advora's total liability for any claim is limited to the amount you paid us in the 12 months preceding the claim.</p>
        </Section>

        <Section title="11. Changes to these terms">
          <p>We may update these Terms. Material changes will be notified via email or in-app at least 14 days before they take effect. Continued use after the effective date constitutes acceptance.</p>
        </Section>

        <Section title="12. Governing law">
          <p>These Terms are governed by the laws of India. Disputes will be resolved in the courts of Mumbai, India, unless mandatory consumer law in your jurisdiction provides otherwise.</p>
        </Section>

        <Section title="13. Contact">
          <p>Questions about these Terms: <a className="text-primary underline" href="mailto:legal@advora.in">legal@advora.in</a></p>
        </Section>

        <footer className="mt-12 pt-6 border-t border-border text-sm text-muted-foreground">© 2026 Advora. All rights reserved.</footer>
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

export default Terms;
