import AppLayout from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Instagram, Facebook, Upload, CheckCircle2, Gem, KeyRound, Sparkles, ExternalLink, Loader2 } from "lucide-react";
import { tones } from "@/lib/mockData";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getAiSettings, saveAiSettings, type AiSettings } from "@/lib/ai";

const colorSwatches = ["#D4AF37","#0A0A0A","#FFFFFF","#7B1E1E","#1E3A8A","#0F766E"];
const fonts = ["Playfair Display", "Cormorant Garamond", "Didot", "Inter", "Bodoni Moda"];

const AI_MODELS = [
  { id: "google/gemini-2.5-flash-image", label: "Nano Banana — fast, great quality (default)" },
  { id: "google/gemini-3.1-flash-image-preview", label: "Nano Banana 2 — pro quality, fast" },
  { id: "google/gemini-3-pro-image-preview", label: "Nano Banana Pro — highest quality, slower" },
];
const OPENAI_MODELS = [
  { id: "gpt-image-1", label: "gpt-image-1 (OpenAI)" },
];

export default function Settings() {
  const [tone, setTone] = useState<string>("Luxury");
  const [colors, setColors] = useState([colorSwatches[0], colorSwatches[1]]);
  const [font, setFont] = useState(fonts[0]);

  const [ai, setAi] = useState<AiSettings | null>(null);
  const [aiKey, setAiKey] = useState("");
  const [aiModel, setAiModel] = useState(AI_MODELS[0].id);
  const [aiProvider, setAiProvider] = useState<"lovable" | "openai">("lovable");
  const [aiSaving, setAiSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await getAiSettings();
      if (s) { setAi(s); setAiModel(s.model); setAiProvider(s.provider as any); }
    })();
  }, []);

  const onSaveAi = async () => {
    setAiSaving(true);
    try {
      await saveAiSettings({ provider: aiProvider, model: aiModel, api_key: aiKey || undefined });
      const s = await getAiSettings(); if (s) setAi(s);
      setAiKey("");
      toast.success(aiKey ? "Your API key is saved — using your own key now" : "AI preferences saved");
    } catch {
      toast.error("Could not save (is the backend reachable?)");
    } finally { setAiSaving(false); }
  };

  const onClearKey = async () => {
    setAiSaving(true);
    try {
      await saveAiSettings({ provider: aiProvider, model: aiModel, clear_key: true });
      const s = await getAiSettings(); if (s) setAi(s);
      toast.success("Removed your key — now using the platform default");
    } finally { setAiSaving(false); }
  };

  return (
    <AppLayout>
      <PageHeader eyebrow="Settings" title="Brand Control Center" description="Define your brand DNA — Aurum AI applies it across every generated asset." />

      <Tabs defaultValue="ai">
        <TabsList className="bg-secondary/40 border border-border/60">
          <TabsTrigger value="ai">AI &amp; API Key</TabsTrigger>
          <TabsTrigger value="brand">Brand Identity</TabsTrigger>
          <TabsTrigger value="tone">Caption Tone</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="mt-6">
          <Card className="glass p-6 space-y-5 max-w-3xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-xl flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Image Generation</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Use the platform's AI by default, or plug in your own API key for unlimited generation at your own cost.
                </p>
              </div>
              {ai && (
                <Badge className={ai.has_own_key ? "bg-success/15 text-success border-success/30" : "bg-secondary"}>
                  {ai.has_own_key ? "Using your key" : "Using platform key"}
                </Badge>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Provider</Label>
                <Select value={aiProvider} onValueChange={(v) => setAiProvider(v as any)}>
                  <SelectTrigger className="bg-secondary/40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lovable">Lovable AI Gateway (Nano Banana)</SelectItem>
                    <SelectItem value="openai">OpenAI (gpt-image-1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Model</Label>
                <Select value={aiModel} onValueChange={setAiModel}>
                  <SelectTrigger className="bg-secondary/40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AI_MODELS.map(m => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block flex items-center gap-1.5">
                <KeyRound className="h-3 w-3" /> Your API Key (optional)
              </Label>
              <Input
                type="password"
                placeholder={ai?.has_own_key ? "•••••••••••• (saved — paste a new one to replace)" : "Paste your API key here"}
                value={aiKey}
                onChange={(e) => setAiKey(e.target.value)}
                className="bg-secondary/40 font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Stored on your server tied to your account. Leave blank to keep using the platform default.{" "}
                <a href="https://lovable.dev/settings/ai" target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-0.5">
                  Get a Lovable AI key <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="gold" onClick={onSaveAi} disabled={aiSaving}>
                {aiSaving && <Loader2 className="h-3 w-3 animate-spin mr-1.5" />}
                Save settings
              </Button>
              {ai?.has_own_key && (
                <Button variant="outline" onClick={onClearKey} disabled={aiSaving}>
                  Remove my key (use platform default)
                </Button>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="brand" className="mt-6 grid lg:grid-cols-3 gap-6">
          <Card className="glass p-6 lg:col-span-2 space-y-6">
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Brand Name</Label>
              <Input defaultValue="Maison Aurelia" className="bg-secondary/40" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-3 block">Brand Colors</Label>
              <div className="flex flex-wrap gap-3">
                {colorSwatches.map(c => (
                  <button key={c} onClick={() => setColors(p => p.includes(c) ? p.filter(x => x!==c) : [...p, c])}
                    className={`h-12 w-12 rounded-xl border-2 transition-all ${colors.includes(c) ? "border-primary scale-110 shadow-gold" : "border-border/40"}`} style={{ background: c }} />
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-3 block">Font Style</Label>
              <div className="grid sm:grid-cols-2 gap-2">
                {fonts.map(f => (
                  <button key={f} onClick={() => setFont(f)} className={`p-3 rounded-lg border text-left transition-all ${font===f ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/40"}`}>
                    <p className="text-lg" style={{ fontFamily: f }}>{f}</p>
                    <p className="text-xs text-muted-foreground">The quick brown fox jumps over.</p>
                  </button>
                ))}
              </div>
            </div>
            <Button variant="gold" onClick={() => toast.success("Brand identity saved")}>Save Identity</Button>
          </Card>

          <Card className="glass p-6">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-3 block">Logo</Label>
            <div className="aspect-square rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-3 bg-gradient-gold-soft">
              <div className="h-16 w-16 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold"><Gem className="h-7 w-7 text-primary-foreground" /></div>
              <p className="font-display gold-text text-2xl">Aurelia</p>
              <Button variant="luxe" size="sm"><Upload className="h-3 w-3" /> Replace Logo</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tone" className="mt-6">
          <Card className="glass p-6">
            <h3 className="font-display text-xl mb-1">Default Caption Tone</h3>
            <p className="text-xs text-muted-foreground mb-4">Used when no tone is selected in the studio.</p>
            <div className="flex flex-wrap gap-2">
              {tones.map(t => (
                <button key={t} onClick={() => setTone(t)} className={`px-4 py-2 rounded-full text-sm border transition-all ${tone===t ? "bg-gradient-gold text-primary-foreground border-transparent shadow-gold" : "border-border/60 hover:border-primary/50"}`}>{t}</button>
              ))}
            </div>
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {[
                { k: "Use emojis", v: true },
                { k: "Auto-translate to English", v: false },
                { k: "Allow AI-generated hashtags", v: true },
                { k: "Maintain title case headings", v: true },
              ].map(x => (
                <div key={x.k} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-secondary/30">
                  <span className="text-sm">{x.k}</span><Switch defaultChecked={x.v} />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="mt-6 grid sm:grid-cols-2 gap-4">
          {[
            { name: "@maisonaurelia", type: "Instagram Business", icon: Instagram, connected: true },
            { name: "Maison Aurelia", type: "Facebook Page", icon: Facebook, connected: true },
          ].map(a => (
            <Card key={a.name} className="glass p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-gold-soft border border-primary/30 flex items-center justify-center text-primary"><a.icon className="h-5 w-5" /></div>
              <div className="flex-1"><p className="font-medium">{a.name}</p><p className="text-xs text-muted-foreground">{a.type}</p></div>
              <Badge className="bg-success/15 text-success border-success/30"><CheckCircle2 className="h-3 w-3 mr-1" /> Connected</Badge>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <Card className="glass p-6 space-y-4">
            <h3 className="font-display text-xl">Posting Preferences</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Default post time (IST)</Label><Input type="time" defaultValue="19:00" className="bg-secondary/40" /></div>
              <div><Label>Time zone</Label><Input defaultValue="Asia/Kolkata" className="bg-secondary/40" /></div>
              <div><Label>Max posts per day</Label><Input type="number" defaultValue={3} className="bg-secondary/40" /></div>
              <div><Label>Quiet hours</Label><Input defaultValue="00:00 — 08:00" className="bg-secondary/40" /></div>
            </div>
            <Button variant="gold" onClick={() => toast.success("Schedule preferences saved")}>Save</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
