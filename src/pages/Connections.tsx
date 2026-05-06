import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Facebook, Instagram, CheckCircle2, RefreshCw, Plug, ExternalLink, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useConnections, connectMeta, disconnectMeta } from "@/lib/connections";
import { useState } from "react";

const META_SCOPES = [
  { id: "pages_manage_posts",       label: "Publish posts to Pages" },
  { id: "pages_read_engagement",    label: "Read Page engagement & insights" },
  { id: "pages_show_list",          label: "List Pages you manage" },
  { id: "instagram_basic",          label: "Read IG account info" },
  { id: "instagram_content_publish",label: "Publish to Instagram" },
  { id: "instagram_manage_comments",label: "Reply to IG comments" },
  { id: "instagram_manage_insights",label: "Read IG insights" },
  { id: "business_management",      label: "Access Business Manager assets" },
];

export default function Connections() {
  const { items, refresh, isConnected } = useConnections();
  const meta = items.find(i => i.provider === "meta");
  const connected = isConnected("meta");
  const [busy, setBusy] = useState(false);

  const handleConnect = async () => {
    setBusy(true);
    try {
      await connectMeta();
      toast.success("Meta connected (mock — real OAuth pending)");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message || "Failed to connect");
    } finally { setBusy(false); }
  };
  const handleDisconnect = async () => {
    setBusy(true);
    try {
      await disconnectMeta();
      toast.success("Meta disconnected");
      await refresh();
    } finally { setBusy(false); }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1100px] space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Connections</p>
          <h1 className="font-display text-3xl font-semibold">Connected accounts</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            Connect Meta to publish to Facebook Pages and the Instagram Business / Creator account linked to them. More platforms coming soon.
          </p>
        </div>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center text-white font-bold">M</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Meta</h2>
                {connected ? (
                  <Badge variant="secondary" className="gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" /> Not connected
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {connected
                  ? `${meta?.account_label || "Meta account"} · Facebook Pages + Instagram Business via Meta Graph API`
                  : "Connect to publish posts and pull insights from your pages."}
              </p>
            </div>
            <div className="flex gap-2">
              {connected ? (
                <>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { refresh(); toast.success("Refreshed"); }} disabled={busy}>
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={busy}>
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Disconnect"}
                  </Button>
                </>
              ) : (
                <Button size="sm" className="gap-1.5" onClick={handleConnect} disabled={busy}>
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plug className="h-3.5 w-3.5" />} Connect Meta
                </Button>
              )}
            </div>
          </div>

          {connected && (
            <>
              <Separator className="my-5" />
              <div className="grid md:grid-cols-2 gap-4">
                <AssetCard icon={<Facebook className="h-4 w-4 text-sky-600" />} title="Maison Aurelia" subtitle="Facebook Page" meta="Page · linked to your Meta account" />
                <AssetCard icon={<Instagram className="h-4 w-4 text-pink-500" />} title="@maison.aurelia" subtitle="Instagram Business" meta="Linked via Facebook Page" />
              </div>
              <Separator className="my-5" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3" /> Granted permissions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {META_SCOPES.map(s => (
                    <Badge key={s.id} variant="outline" className="text-[11px] gap-1 font-normal">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {s.label}
                    </Badge>
                  ))}
                </div>
                <a href="https://developers.facebook.com/docs/permissions" target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground mt-3">
                  About Meta permissions <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </>
          )}
        </Card>

        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Coming soon</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {["TikTok","LinkedIn","X (Twitter)","YouTube","Pinterest","Threads"].map(name => (
              <Card key={name} className="p-4 flex items-center gap-3 opacity-60">
                <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center"><Plug className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{name}</p>
                  <p className="text-[10px] text-muted-foreground">Available later</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function AssetCard({ icon, title, subtitle, meta }: { icon: React.ReactNode; title: string; subtitle: string; meta: string }) {
  return (
    <div className="rounded-lg border border-border p-4 flex items-start gap-3 bg-secondary/20">
      <div className="h-9 w-9 rounded-md bg-card border border-border flex items-center justify-center">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        <p className="text-[10px] text-muted-foreground/80 mt-1 font-mono">{meta}</p>
      </div>
      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
    </div>
  );
}
