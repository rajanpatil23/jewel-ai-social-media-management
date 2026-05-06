import AppLayout from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Instagram, Facebook, Upload, CheckCircle2, Gem } from "lucide-react";
import { tones } from "@/lib/mockData";
import { useState } from "react";
import { toast } from "sonner";

const colorSwatches = ["#D4AF37","#0A0A0A","#FFFFFF","#7B1E1E","#1E3A8A","#0F766E"];
const fonts = ["Playfair Display", "Cormorant Garamond", "Didot", "Inter", "Bodoni Moda"];

export default function Settings() {
  const [tone, setTone] = useState<string>("Luxury");
  const [colors, setColors] = useState([colorSwatches[0], colorSwatches[1]]);
  const [font, setFont] = useState(fonts[0]);

  return (
    <AppLayout>
      <PageHeader eyebrow="Settings" title="Brand Control Center" description="Define your brand DNA — Aurum AI applies it across every generated asset." />

      <Tabs defaultValue="brand">
        <TabsList className="bg-secondary/40 border border-border/60">
          <TabsTrigger value="brand">Brand Identity</TabsTrigger>
          <TabsTrigger value="tone">Caption Tone</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

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
