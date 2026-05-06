import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, Copy, RefreshCw, Check } from "lucide-react";
import { productTypes, tones, productImages } from "@/lib/mockData";
import { toast } from "sonner";

const captionTemplates: Record<string, string> = {
  Luxury: "✨ Crafted for those who wear quiet power. Discover the new {product} — a study in restraint, set in 18K gold and certified diamonds.",
  Wedding: "💍 Begin forever in brilliance. Our bridal {product} — meticulously hand-finished by master artisans for the bride who chooses timeless.",
  Festive: "🪔 The festival of light, set in gold. Celebrate with our limited edition {product} — radiant, regal, ready for the season.",
  Minimal: "Less, but everything. The new {product} — sculptural lines, 18K solid gold.",
  "Premium Sale": "🤍 An exclusive private moment — up to 30% off our heritage {product} this week only. By appointment.",
};

const hashtagPool = ["#LuxuryJewelry", "#BridalLuxe", "#HeritageGold", "#DiamondReverie", "#FineJewelry", "#MaisonAurelia", "#TimelessElegance", "#HighJewelry", "#GoldStory", "#BridalEdit", "#FestiveGold", "#CoutureJewels"];

const variations = [
  { tag: "Variation A · Story-led", text: "Three generations. One ring. The new Heirloom {product}, written in 18K gold and certified diamonds." },
  { tag: "Variation B · Aspirational", text: "She doesn't follow seasons. She defines them. The {product} edit is here." },
  { tag: "Variation C · Conversational", text: "We asked our master jeweler what 'timeless' means. He answered in 18K gold. Meet the new {product}." },
];

export default function Studio() {
  const [product, setProduct] = useState<string>("Ring");
  const [tone, setTone] = useState<string>("Luxury");
  const [details, setDetails] = useState("18K yellow gold, 1.2ct round-brilliant diamond, halo setting");
  const [generated, setGenerated] = useState(false);
  const [loadingType, setLoadingType] = useState<"creative" | "caption" | null>(null);

  const productKey = product.toLowerCase() as keyof typeof productImages;
  const baseCaption = captionTemplates[tone].replaceAll("{product}", product.toLowerCase());

  const generate = (type: "creative" | "caption") => {
    setLoadingType(type);
    setTimeout(() => { setLoadingType(null); setGenerated(true); toast.success(`AI ${type} generated`); }, 900);
  };

  return (
    <AppLayout>
      <PageHeader eyebrow="AI Content Studio" title="Compose, Generate, Iterate" description="Generate on-brand creatives, captions, hashtags, and A/B variations in seconds." />

      <div className="grid lg:grid-cols-12 gap-6">
        {/* CONFIG */}
        <Card className="glass p-6 lg:col-span-5 space-y-6">
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-3 block">Product Type</Label>
            <div className="flex flex-wrap gap-2">
              {productTypes.map(t => (
                <button key={t} onClick={() => setProduct(t)}
                  className={`px-4 py-2 rounded-full text-sm border transition-all ${product===t ? "bg-gradient-gold text-primary-foreground border-transparent shadow-gold" : "border-border/60 hover:border-primary/50 text-muted-foreground hover:text-foreground"}`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Product Details</Label>
            <Textarea value={details} onChange={e => setDetails(e.target.value)} rows={4} className="bg-secondary/40 border-border/60 resize-none" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-3 block">Tone</Label>
            <div className="flex flex-wrap gap-2">
              {tones.map(t => (
                <button key={t} onClick={() => setTone(t)}
                  className={`px-4 py-2 rounded-full text-sm border transition-all ${tone===t ? "border-primary/70 text-primary bg-primary/10" : "border-border/60 text-muted-foreground hover:border-primary/40"}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button variant="gold" size="lg" className="flex-1" onClick={() => generate("creative")} disabled={loadingType !== null}>
              {loadingType === "creative" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} Generate AI Creative
            </Button>
            <Button variant="luxe" size="lg" className="flex-1" onClick={() => generate("caption")} disabled={loadingType !== null}>
              {loadingType === "caption" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate Caption
            </Button>
          </div>
        </Card>

        {/* PREVIEW */}
        <Card className="glass p-6 lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-2xl">AI Preview</h3>
              <p className="text-xs text-muted-foreground">Generated for <span className="text-primary">{product} · {tone}</span></p>
            </div>
            {generated && <Badge className="bg-primary/15 text-primary border-primary/30"><Check className="h-3 w-3 mr-1" /> Ready</Badge>}
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="relative rounded-xl overflow-hidden border border-primary/30 group">
              <img src={productImages[productKey] || productImages.ring} alt="AI creative" className="w-full aspect-square object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <Badge className="bg-background/70 backdrop-blur border-primary/40 text-primary mb-2">AI Generated · 1024×1024</Badge>
                <p className="font-display text-lg gold-text">Timeless Brilliance</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Caption</p>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { navigator.clipboard.writeText(baseCaption); toast.success("Copied"); }}><Copy className="h-3 w-3" /></Button>
                </div>
                <p className="text-sm leading-relaxed">{baseCaption}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Suggested Hashtags</p>
                <div className="flex flex-wrap gap-1.5">
                  {hashtagPool.slice(0, 8).map(h => (
                    <span key={h} className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">{h}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">A/B Variations</p>
            <div className="grid md:grid-cols-3 gap-3">
              {variations.map((v, i) => (
                <div key={i} className="rounded-xl border border-border/60 bg-secondary/20 p-4 hover:border-primary/40 transition-colors">
                  <Badge variant="outline" className="mb-2 border-primary/30 text-primary text-[10px]">{v.tag}</Badge>
                  <p className="text-sm leading-relaxed">{v.text.replaceAll("{product}", product.toLowerCase())}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
