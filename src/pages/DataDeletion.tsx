import { useEffect, useState } from "react";

const DataDeletion = () => {
  useEffect(() => { document.title = "Data Deletion Instructions — Advora"; }, []);
  const [copied, setCopied] = useState(false);
  const email = "privacy@advora.in";

  const copy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="mx-auto max-w-3xl px-6 py-12 leading-relaxed">
        <h1 className="text-3xl font-bold mb-2">Data Deletion Instructions</h1>
        <p className="text-sm text-muted-foreground mb-8">
          As required by Meta Platform Policy, this page explains how to remove all data
          Advora has collected about you, including data obtained from Facebook & Instagram.
        </p>

        <section className="rounded-lg border border-border bg-muted/40 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3">Option 1 — In-app deletion (instant)</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Log in to your Advora account.</li>
            <li>Go to <strong>Settings → Account</strong>.</li>
            <li>Click <strong>Delete account</strong> and confirm.</li>
          </ol>
          <p className="mt-3 text-sm text-muted-foreground">
            All your personal data, connected Meta tokens, and Meta-derived analytics are
            permanently deleted from our active systems immediately and from backups within
            30 days.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-muted/40 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3">Option 2 — Email request</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>
              Send an email from your registered address to{" "}
              <a className="text-primary underline" href={`mailto:${email}?subject=Data%20deletion%20request`}>{email}</a>{" "}
              <button onClick={copy} className="ml-2 text-xs underline text-muted-foreground">
                {copied ? "Copied!" : "Copy"}
              </button>
            </li>
            <li>Subject line: <em>"Data deletion request"</em></li>
            <li>Include your Advora username (and Facebook user ID if known).</li>
          </ol>
          <p className="mt-3 text-sm text-muted-foreground">
            We confirm receipt within 2 business days and complete deletion within 30 days,
            sending you a confirmation code as proof.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-muted/40 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3">Option 3 — Revoke from Facebook</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>
              Go to{" "}
              <a className="text-primary underline" href="https://www.facebook.com/settings?tab=business_tools" target="_blank" rel="noopener noreferrer">
                Facebook → Settings → Business Integrations
              </a>.
            </li>
            <li>Find <strong>Advora</strong> in the list.</li>
            <li>Click <strong>Remove</strong> and check "Also delete posts and messages from this app."</li>
          </ol>
          <p className="mt-3 text-sm text-muted-foreground">
            This revokes our access tokens. To also remove data already stored with us, use
            Option 1 or 2 above.
          </p>
        </section>

        <h2 className="text-xl font-semibold mb-2">What gets deleted</h2>
        <ul className="list-disc pl-6 space-y-1 mb-8">
          <li>Your Advora profile, login credentials, workspace data.</li>
          <li>All Meta access tokens we stored for your account.</li>
          <li>Cached Meta data: Page info, IG account info, posts, insights, ad metrics.</li>
          <li>Scheduled posts and historical analytics tied to your account.</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">Contact</h2>
        <p>
          Questions: <a className="text-primary underline" href={`mailto:${email}`}>{email}</a>
        </p>

        <footer className="mt-12 pt-6 border-t border-border text-sm text-muted-foreground">
          © 2026 Advora. All rights reserved.
        </footer>
      </article>
    </main>
  );
};

export default DataDeletion;
