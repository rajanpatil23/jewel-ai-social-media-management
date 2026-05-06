import { useRef, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sparkles, Download, Loader2, Send, Wand2, Image as ImageIcon,
  Square, RectangleVertical, RectangleHorizontal, Smartphone, History, Copy, Heart,
  Upload, X, Shuffle, FolderHeart, Check,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

import ring from "@/assets/product-ring.jpg";
import necklace from "@/assets/product-necklace.jpg";
import earrings from "@/assets/product-earrings.jpg";
import bracelet from "@/assets/product-bracelet.jpg";

const SAMPLES = [
  { src: ring, label: "Diamond Solitaire Ring" },
  { src: necklace, label: "Gold Pendant Necklace" },
  { src: earrings, label: "Pearl Drop Earrings" },
  { src: bracelet, label: "Tennis Bracelet" },
];

const STYLES = [
  { id: "studio", label: "Studio" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "editorial", label: "Editorial" },
  { id: "minimal", label: "Minimal" },
  { id: "luxury", label: "Luxury" },
  { id: "vintage", label: "Vintage" },
];

const RATIOS = [
  { id: "1:1", label: "Square", icon: Square },
  { id: "4:5", label: "Portrait", icon: RectangleVertical },
  { id: "9:16", label: "Story", icon: Smartphone },
  { id: "16:9", label: "Landscape", icon: RectangleHorizontal },
];

const PRESETS = [
  {
    id: "bridal",
    name: "Bridal Campaign",
    desc: "Soft white florals, romantic lighting",
    cover: ring,
    prompt: "Bridal diamond ring on white peonies with soft natural light, dreamy bokeh, luxury wedding campaign",
    style: "editorial",
    ratio: "4:5",
  },
  {
    id: "festive",
    name: "Diwali Festive",
    desc: "Warm gold tones, festive backdrop",
    cover: necklace,
    prompt: "Gold necklace on rich maroon silk with diyas glowing in background, festive Diwali mood, warm cinematic lighting",
    style: "luxury",
    ratio: "1:1",
  },
  {
    id: "minimal",
    name: "Minimal Catalog",
    desc: "Clean white background, e-com ready",
    cover: earrings,
    prompt: "Pearl drop earrings on seamless white background, perfectly centered, soft shadow, e-commerce catalog photography",
    style: "minimal",
    ratio: "1:1",
  },
  {
    id: "lifestyle",
    name: "Lifestyle Model",
    desc: "On-model close-up, natural setting",
    cover: bracelet,
    prompt: "Tennis bracelet worn on a woman's wrist, holding a coffee cup at a Parisian café, golden hour, lifestyle fashion photography",
    style: "lifestyle",
    ratio: "4:5",
  },
];

const PROMPT_IDEAS = [
  "Diamond solitaire ring on cream silk, soft studio lighting",
  "Gold pendant necklace on marble with morning light",
  "Pearl drop earrings, editorial fashion shoot, dark backdrop",
  "Stack of tennis bracelets on velvet, macro detail",
];

type GenItem = { src: string; label: string };

export default function ImageGen() {
  const [prompt, setPrompt] = useState("Elegant 18k gold diamond solitaire ring on cream silk, soft studio lighting");
  const [negative, setNegative] = useState("");
  const [style, setStyle] = useState("studio");
  const [ratio, setRatio] = useState("1:1");
  const [count, setCount] = useState([4]);
  const [quality, setQuality] = useState([75]);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [results, setResults] = useState<GenItem[]>(SAMPLES);
  const [referenceImg, setReferenceImg] = useState<string | null>(null);
  const [collections, setCollections] = useState<GenItem[]>([]);
  const [history, setHistory] = useState<{ src: string; prompt: string }[]>(
    SAMPLES.slice(0, 3).map((s) => ({ src: s.src, prompt: s.label }))
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const generate = (overridePrompt?: string) => {
    const p = overridePrompt ?? prompt;
    if (!p.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const next = [...SAMPLES].sort(() => Math.random() - 0.5).slice(0, count[0]);
      setResults(next);
      setHistory((h) => [{ src: next[0].src, prompt: p }, ...h].slice(0, 8));
      setLoading(false);
      toast.success(`${count[0]} creative${count[0] > 1 ? "s" : ""} generated`);
    }, 1400);
  };

  const enhancePrompt = () => {
    if (!prompt.trim()) return;
    setEnhancing(true);
    setTimeout(() => {
      setPrompt(
        `${prompt.trim()}, hyper-detailed macro photography, soft directional lighting, delicate reflections on metal, shallow depth of field, premium editorial composition, 8k product render`
      );
      setEnhancing(false);
      toast.success("Prompt enhanced");
    }, 900);
  };

  const remix = (item: GenItem) => {
    toast.success("Remixing variations…");
    setLoading(true);
    setTimeout(() => {
      const next = Array.from({ length: count[0] }, () => ({
        src: item.src,
        label: `${item.label} · variation`,
      }));
      setResults(next);
      setLoading(false);
    }, 1100);
  };

  const onUploadRef = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setReferenceImg(reader.result as string);
      toast.success("Reference image added");
    };
    reader.readAsDataURL(f);
  };

  const applyPreset = (p: typeof PRESETS[number]) => {
    setPrompt(p.prompt);
    setStyle(p.style);
    setRatio(p.ratio);
    toast.success(`Preset applied: ${p.name}`);
    setTimeout(() => generate(p.prompt), 200);
  };

  const useForPost = (img: string) => {
    sessionStorage.setItem("postImage", img);
    sessionStorage.setItem("postCaption", prompt);
    navigate("/post");
  };

  const toggleSave = (item: GenItem) => {
    setCollections((c) => {
      const exists = c.find((x) => x.src === item.src && x.label === item.label);
      if (exists) {
        toast.success("Removed from collection");
        return c.filter((x) => x !== exists);
      }
      toast.success("Saved to collection");
      return [item, ...c];
    });
  };
  const isSaved = (item: GenItem) => collections.some((x) => x.src === item.src && x.label === item.label);

  const gridCols =
    count[0] === 1 ? "grid-cols-1" :
    count[0] === 2 ? "grid-cols-1 sm:grid-cols-2" :
    "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--primary-deep))]">
              <Sparkles className="h-3 w-3" /> AI Studio
            </span>
            <h1 className="font-display text-3xl md:text-4xl tracking-tight">Image Generation</h1>
            <p className="text-sm text-muted-foreground">
              Describe your jewelry piece and let AI craft scroll-stopping creatives.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-normal">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2" /> Nano Banana Pro
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-normal">
              1,240 credits
            </Badge>
          </div>
        </div>

        {/* Preset templates */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Quick start templates</h3>
            <span className="text-[11px] text-muted-foreground">One click → generate</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p)}
                className="group relative overflow-hidden rounded-xl border border-border/70 bg-card text-left hover:border-[hsl(var(--primary))]/50 hover:shadow-[var(--shadow-elegant)] transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={p.cover} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-[11px] opacity-80 line-clamp-1">{p.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[340px_1fr] gap-6 items-start">
          {/* Control panel */}
          <Card className="rounded-2xl border-border/70 shadow-[var(--shadow-elegant)] bg-card overflow-hidden lg:sticky lg:top-20">
            <div className="p-5 border-b border-border/60 flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-[hsl(var(--primary-deep))]" />
              <h3 className="font-medium text-sm">Prompt Studio</h3>
            </div>

            <div className="p-5 space-y-5">
              {/* Reference image upload (image-to-image) */}
              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Reference image (optional)</Label>
                {referenceImg ? (
                  <div className="relative rounded-lg overflow-hidden border border-border/70">
                    <img src={referenceImg} alt="Reference" className="w-full h-32 object-cover" />
                    <button
                      onClick={() => setReferenceImg(null)}
                      className="absolute top-1.5 right-1.5 h-6 w-6 rounded-md bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <Badge className="absolute bottom-1.5 left-1.5 bg-black/60 text-white border-0 text-[10px] backdrop-blur">
                      Image-to-image
                    </Badge>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-20 rounded-lg border border-dashed border-border/70 bg-background hover:bg-secondary/40 hover:border-[hsl(var(--primary))]/50 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="text-[11px]">Drop your product photo</span>
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={onUploadRef} />
              </div>

              {/* Prompt */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="prompt" className="text-[11px] uppercase tracking-wider text-muted-foreground">Prompt</Label>
                  <button
                    onClick={() => setPrompt(PROMPT_IDEAS[Math.floor(Math.random() * PROMPT_IDEAS.length)])}
                    className="text-[11px] text-[hsl(var(--primary-deep))] hover:underline inline-flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" /> Inspire me
                  </button>
                </div>
                <Textarea
                  id="prompt"
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A pearl necklace on marble…"
                  className="resize-none rounded-lg border-border/70 bg-background text-sm focus-visible:ring-[hsl(var(--primary))]"
                />
                <Button
                  type="button"
                  onClick={enhancePrompt}
                  disabled={enhancing || !prompt.trim()}
                  variant="outline"
                  size="sm"
                  className="w-full rounded-lg h-8 text-xs"
                >
                  {enhancing ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5 mr-1.5" />}
                  {enhancing ? "Enhancing…" : "Enhance with AI"}
                </Button>
              </div>

              {/* Negative prompt */}
              <div className="space-y-2">
                <Label htmlFor="neg" className="text-[11px] uppercase tracking-wider text-muted-foreground">Negative prompt</Label>
                <Input
                  id="neg"
                  value={negative}
                  onChange={(e) => setNegative(e.target.value)}
                  placeholder="blurry, low quality, watermark"
                  className="h-9 rounded-lg border-border/70 bg-background text-sm"
                />
              </div>

              {/* Style chips */}
              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Style</Label>
                <div className="flex flex-wrap gap-1.5">
                  {STYLES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                        style === s.id
                          ? "bg-[hsl(var(--primary))] text-primary-foreground border-[hsl(var(--primary))]"
                          : "bg-background border-border/70 text-muted-foreground hover:text-foreground hover:border-border"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ratio */}
              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Aspect ratio</Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {RATIOS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRatio(r.id)}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border text-[11px] transition-colors ${
                        ratio === r.id
                          ? "bg-secondary border-[hsl(var(--primary))]/40 text-foreground"
                          : "bg-background border-border/70 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <r.icon className="h-3.5 w-3.5" />
                      {r.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Images</Label>
                    <span className="text-xs font-medium tabular-nums">{count[0]}</span>
                  </div>
                  <Slider value={count} onValueChange={setCount} min={1} max={4} step={1} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Quality</Label>
                    <span className="text-xs font-medium tabular-nums">{quality[0]}%</span>
                  </div>
                  <Slider value={quality} onValueChange={setQuality} min={25} max={100} step={5} />
                </div>
              </div>

              <Button onClick={() => generate()} disabled={loading} variant="gold" size="lg" className="w-full rounded-lg font-medium">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                {loading ? "Generating…" : `Generate ${count[0]} image${count[0] > 1 ? "s" : ""}`}
              </Button>
              <p className="text-[11px] text-center text-muted-foreground -mt-1">
                Approx. {count[0] * 3}s · uses {count[0]} credit{count[0] > 1 ? "s" : ""}
              </p>
            </div>
          </Card>

          {/* Results area */}
          <div className="space-y-5 min-w-0">
            <Tabs defaultValue="results">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <TabsList className="bg-secondary/60 rounded-lg">
                  <TabsTrigger value="results" className="text-xs gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5" /> Results
                  </TabsTrigger>
                  <TabsTrigger value="collections" className="text-xs gap-1.5">
                    <FolderHeart className="h-3.5 w-3.5" /> Collections
                    {collections.length > 0 && (
                      <span className="ml-1 px-1.5 rounded-full bg-[hsl(var(--primary))] text-primary-foreground text-[10px] leading-4">
                        {collections.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="history" className="text-xs gap-1.5">
                    <History className="h-3.5 w-3.5" /> History
                  </TabsTrigger>
                </TabsList>
                <div className="text-xs text-muted-foreground hidden sm:block">
                  {loading ? "Generating…" : `${results.length} result${results.length > 1 ? "s" : ""} · ${ratio}`}
                </div>
              </div>

              {/* Results */}
              <TabsContent value="results" className="mt-5">
                <div className={`grid ${gridCols} gap-4`}>
                  {(loading ? Array(count[0]).fill(null) : results).map((item, i) => (
                    <Card
                      key={i}
                      className="group relative overflow-hidden rounded-xl border-border/70 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-gold)] transition-all bg-card"
                    >
                      {loading || !item ? (
                        <div className="aspect-square bg-gradient-to-br from-secondary via-secondary/60 to-secondary animate-pulse flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/60" />
                        </div>
                      ) : (
                        <>
                          <img src={item.src} alt={item.label} className="aspect-square w-full object-cover" />
                          <div className="absolute top-2.5 left-2.5">
                            <Badge className="bg-black/55 text-white border-0 backdrop-blur rounded-md text-[10px] font-normal px-2 py-0.5">
                              {ratio} · {STYLES.find((s) => s.id === style)?.label}
                            </Badge>
                          </div>
                          <div className="absolute top-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => toggleSave(item)}
                              className={`h-7 w-7 rounded-md backdrop-blur flex items-center justify-center transition-colors ${
                                isSaved(item) ? "bg-[hsl(var(--primary))] text-primary-foreground" : "bg-black/55 text-white hover:bg-black/70"
                              }`}
                              title={isSaved(item) ? "Saved" : "Save to collection"}
                            >
                              {isSaved(item) ? <Check className="h-3.5 w-3.5" /> : <Heart className="h-3.5 w-3.5" />}
                            </button>
                            <button
                              onClick={() => { navigator.clipboard.writeText(prompt); toast.success("Prompt copied"); }}
                              className="h-7 w-7 rounded-md bg-black/55 text-white backdrop-blur flex items-center justify-center hover:bg-black/70"
                              title="Copy prompt"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[11px] line-clamp-1 mb-2 opacity-90">{item.label}</p>
                            <div className="flex gap-1.5">
                              <Button size="sm" variant="gold" className="rounded-md h-7 px-2.5 text-xs flex-1" onClick={() => useForPost(item.src)}>
                                <Send className="h-3 w-3 mr-1" /> Publish
                              </Button>
                              <Button size="sm" variant="secondary" className="rounded-md h-7 px-2 text-xs" onClick={() => remix(item)} title="Remix variations">
                                <Shuffle className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="secondary" className="rounded-md h-7 px-2 text-xs" onClick={() => toast.success("Download started")}>
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Collections */}
              <TabsContent value="collections" className="mt-5">
                {collections.length === 0 ? (
                  <Card className="rounded-2xl border-dashed border-border/70 bg-card p-10 text-center">
                    <FolderHeart className="h-8 w-8 mx-auto text-muted-foreground/60 mb-3" />
                    <h3 className="font-medium text-sm">Your collection is empty</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tap the heart on any creative to save it here.
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {collections.map((item, i) => (
                      <Card key={i} className="group relative overflow-hidden rounded-xl border-border/70 bg-card">
                        <img src={item.src} alt={item.label} className="aspect-square w-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/30 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[11px] line-clamp-1 mb-2">{item.label}</p>
                          <div className="flex gap-1.5">
                            <Button size="sm" variant="gold" className="rounded-md h-7 px-2.5 text-xs flex-1" onClick={() => useForPost(item.src)}>
                              <Send className="h-3 w-3 mr-1" /> Publish
                            </Button>
                            <Button size="sm" variant="secondary" className="rounded-md h-7 px-2 text-xs" onClick={() => toggleSave(item)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* History */}
              <TabsContent value="history" className="mt-5">
                <Card className="rounded-2xl border-border/70 bg-card p-4">
                  {history.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">No generations yet.</p>
                  ) : (
                    <ul className="divide-y divide-border/60">
                      {history.map((h, i) => (
                        <li key={i} className="flex items-center gap-3 py-2.5">
                          <img src={h.src} alt="" className="h-12 w-12 rounded-md object-cover border border-border/70 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm line-clamp-1">{h.prompt}</p>
                            <p className="text-[11px] text-muted-foreground">Just now</p>
                          </div>
                          <Button size="sm" variant="outline" className="h-7 text-xs rounded-md" onClick={() => setPrompt(h.prompt)}>
                            Re-use
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
