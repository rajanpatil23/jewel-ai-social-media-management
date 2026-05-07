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
  Upload, X, Shuffle, FolderHeart, Check, Images, Pencil,
  Brush, Eraser, Maximize2, ArrowUpRightSquare, Scissors, FileImage, Plus,
  ChevronDown, Info, Type,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";
import { addToGallery } from "@/lib/gallery";
import { generateImages, uploadReference } from "@/lib/ai";
import { ApiError } from "@/lib/api";

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
  { id: "bridal", name: "Bridal Campaign", desc: "Soft white florals, romantic lighting", cover: ring,
    prompt: "Bridal diamond ring on white peonies with soft natural light, dreamy bokeh, luxury wedding campaign", style: "editorial", ratio: "4:5" },
  { id: "festive", name: "Diwali Festive", desc: "Warm gold tones, festive backdrop", cover: necklace,
    prompt: "Gold necklace on rich maroon silk with diyas glowing in background, festive Diwali mood, warm cinematic lighting", style: "luxury", ratio: "1:1" },
  { id: "minimal", name: "Minimal Catalog", desc: "Clean white background, e-com ready", cover: earrings,
    prompt: "Pearl drop earrings on seamless white background, perfectly centered, soft shadow, e-commerce catalog photography", style: "minimal", ratio: "1:1" },
  { id: "lifestyle", name: "Lifestyle Model", desc: "On-model close-up, natural setting", cover: bracelet,
    prompt: "Tennis bracelet worn on a woman's wrist, holding a coffee cup at a Parisian café, golden hour, lifestyle fashion photography", style: "lifestyle", ratio: "4:5" },
];

const SCENES = [
  { id: "studio",    label: "Pro Studio",       emoji: "📸", desc: "Clean white studio, catalog-grade",
    prompt: "the exact same jewelry product, photographed in a high-end professional studio on seamless pure white background, soft directional softbox lighting, sharp macro focus, ultra-detailed reflections on metal and gemstones, e-commerce catalog photography, 8k" },
  { id: "luxury",    label: "Luxury Showroom",  emoji: "💎", desc: "Velvet, marble, gold accents",
    prompt: "the exact same jewelry product displayed in a luxury showroom, on black velvet pedestal with marble and brushed gold accents, dramatic spotlight, deep shadows, premium boutique mood, hyper-detailed editorial product photography" },
  { id: "model_w",   label: "Worn by Woman",    emoji: "👩", desc: "Elegant Indian model wearing it",
    prompt: "the exact same jewelry product worn by an elegant young Indian woman, soft beauty lighting, close-up on the jewelry, blurred luxurious background, fashion editorial photography, photorealistic, ultra-detailed" },
  { id: "bridal",    label: "Bridal",           emoji: "👰", desc: "Bride in red lehenga, traditional",
    prompt: "the exact same jewelry product worn by a stunning Indian bride in a red and gold bridal lehenga, traditional makeup, soft warm lighting, ornate background, regal wedding mood, photorealistic editorial" },
  { id: "lifestyle", label: "Lifestyle",        emoji: "☕", desc: "Natural cafe / outdoor moment",
    prompt: "the exact same jewelry product worn by a stylish woman in a candid lifestyle moment, golden hour natural light, shallow depth of field, premium fashion lifestyle photography" },
  { id: "festive",   label: "Festive Diwali",   emoji: "🪔", desc: "Diyas, marigold, rich silk",
    prompt: "the exact same jewelry product styled on rich maroon silk with glowing diyas and marigold flowers around, warm festive Diwali lighting, cinematic mood, ultra-detailed product photography" },
  { id: "marble",    label: "Marble Flatlay",   emoji: "🏛️", desc: "Top-down on white marble",
    prompt: "the exact same jewelry product in a top-down flatlay on white Carrara marble with soft morning light, minimalist composition, premium magazine styling, sharp macro details" },
  { id: "editorial", label: "Dark Editorial",   emoji: "🖤", desc: "Moody, magazine cover vibe",
    prompt: "the exact same jewelry product photographed against a dark moody backdrop, dramatic chiaroscuro lighting, high-fashion magazine cover aesthetic, ultra-sharp metal and gemstone detail" },
];

const PROMPT_IDEAS = [
  "Diamond solitaire ring on cream silk, soft studio lighting",
  "Gold pendant necklace on marble with morning light",
  "Pearl drop earrings, editorial fashion shoot, dark backdrop",
  "Stack of tennis bracelets on velvet, macro detail",
];

const EDIT_TOOLS = [
  { id: "prompt", name: "Prompt", desc: "Re-imagine with new prompt", icon: Wand2 },
  { id: "markup", name: "Markup", desc: "Sketch on canvas to guide AI", icon: Brush, badge: "New" },
  { id: "fill", name: "Generative Fill", desc: "Brush + replace any area", icon: Pencil },
  { id: "remove", name: "Remove", desc: "Erase objects cleanly", icon: Eraser },
  { id: "expand", name: "Expand", desc: "Extend canvas beyond edges", icon: Maximize2 },
  { id: "upscale", name: "Upscale", desc: "Boost to 2× / 4× resolution", icon: ArrowUpRightSquare },
  { id: "removebg", name: "Remove Background", desc: "Cut out subject in one click", icon: Scissors },
];

type GenItem = { src: string; label: string };

export default function ImageGen() {
  const [tab, setTab] = useState("generate");

  // generate state
  const [prompt, setPrompt] = useState("Elegant 18k gold diamond solitaire ring on cream silk, soft studio lighting");
  const [negative, setNegative] = useState("");
  const [style, setStyle] = useState("studio");
  const [ratio, setRatio] = useState("1:1");
  const [count, setCount] = useState([4]);
  const [quality, setQuality] = useState([75]);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [results, setResults] = useState<GenItem[]>([]);
  const [referenceImg, setReferenceImg] = useState<string | null>(null);
  const [referenceUrl, setReferenceUrl] = useState<string | null>(null); // backend URL after upload
  const [sceneId, setSceneId] = useState<string | null>(null);
  const [collections, setCollections] = useState<GenItem[]>([]);
  const [gallery, setGallery] = useState<GenItem[]>(SAMPLES);
  const [history, setHistory] = useState<{ src: string; prompt: string }[]>(
    SAMPLES.slice(0, 3).map((s) => ({ src: s.src, prompt: s.label }))
  );
  const fileRef = useRef<HTMLInputElement>(null);

  // edit state
  const [editImg, setEditImg] = useState<string | null>(null);
  const [editTool, setEditTool] = useState("prompt");
  const [editPrompt, setEditPrompt] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const generate = async (overridePrompt?: string, overrideScene?: string | null) => {
    const p = overridePrompt ?? prompt;
    const scene = overrideScene !== undefined ? overrideScene : sceneId;
    if (!p.trim() && !referenceUrl && !referenceImg) return;
    setLoading(true);
    try {
      const res = await generateImages({
        prompt: p,
        count: count[0],
        ratio,
        scene,
        reference_image: referenceUrl || referenceImg, // URL preferred, data URI fallback
      });
      const items: GenItem[] = res.images.map((src, i) => ({
        src,
        label: scene ? `${STYLES.find(s=>s.id===style)?.label || "Generated"} · ${scene}` : (p.slice(0, 60) || "Generated"),
      }));
      setResults(items);
      setGallery((g) => [...items, ...g].slice(0, 24));
      setHistory((h) => [{ src: items[0]?.src || "", prompt: p }, ...h].slice(0, 8));
      addToGallery(items);
      toast.success(
        res.mock
          ? "Demo images shown — add your AI key in Settings for real generation"
          : `${items.length} creative${items.length > 1 ? "s" : ""} generated`
      );
    } catch (e) {
      const msg = e instanceof ApiError ? (e.data?.detail || e.message) : "Generation failed";
      // Preview mode (no PHP): fall back to sample images so UI keeps working
      if (e instanceof TypeError) {
        const next = [...SAMPLES].sort(() => Math.random() - 0.5).slice(0, count[0]);
        setResults(next);
        setGallery((g) => [...next, ...g].slice(0, 24));
        addToGallery(next);
        toast.success("Preview mode — showing sample images");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const enhancePrompt = () => {
    if (!prompt.trim()) return;
    setEnhancing(true);
    setTimeout(() => {
      setPrompt(`${prompt.trim()}, hyper-detailed macro photography, soft directional lighting, delicate reflections on metal, shallow depth of field, premium editorial composition, 8k product render`);
      setEnhancing(false);
      toast.success("Prompt enhanced");
    }, 900);
  };

  const remix = (item: GenItem) => {
    toast.success("Remixing variations…");
    setLoading(true);
    setTimeout(() => {
      const next = Array.from({ length: count[0] }, () => ({ src: item.src, label: `${item.label} · variation` }));
      setResults(next);
      setLoading(false);
    }, 1100);
  };

  const onUploadRef = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = () => setReferenceImg(reader.result as string);
    reader.readAsDataURL(f);
    // Upload to backend so we can pass a URL (much smaller payload to AI)
    try {
      const url = await uploadReference(f);
      setReferenceUrl(url);
      toast.success("Reference image uploaded");
    } catch {
      // Preview mode — keep the data URI
      setReferenceUrl(null);
      toast.success("Reference image added");
    }
  };

  const onUploadEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { setEditImg(reader.result as string); toast.success("Image loaded"); };
    reader.readAsDataURL(f);
  };

  const runEdit = () => {
    if (!editImg) return;
    setEditLoading(true);
    setTimeout(() => {
      setEditLoading(false);
      const tool = EDIT_TOOLS.find((t) => t.id === editTool)?.name;
      toast.success(`${tool} applied`);
    }, 1200);
  };

  const applyPreset = (p: typeof PRESETS[number]) => {
    setPrompt(p.prompt); setStyle(p.style); setRatio(p.ratio);
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
      if (exists) { toast.success("Removed from collection"); return c.filter((x) => x !== exists); }
      toast.success("Saved to collection");
      return [item, ...c];
    });
  };
  const isSaved = (item: GenItem) => collections.some((x) => x.src === item.src && x.label === item.label);

  const sendToEdit = (src: string) => {
    setEditImg(src);
    setTab("edit");
    toast.success("Loaded into editor");
  };

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
              Generate, edit, and curate scroll-stopping jewelry creatives.
            </p>
          </div>
        </div>

        {/* Top sub-tabs (Firefly-style) */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <div className="border-b border-border/60">
            <TabsList className="bg-transparent p-0 h-auto rounded-none gap-6">
              {[
                { id: "gallery", label: "Gallery", icon: Images },
                { id: "generate", label: "Generate", icon: Sparkles },
                { id: "edit", label: "Edit", icon: Pencil },
              ].map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="relative bg-transparent rounded-none px-1 pb-3 pt-0 h-auto text-sm text-muted-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:-bottom-px data-[state=active]:after:h-[2px] data-[state=active]:after:bg-[hsl(var(--primary))]"
                >
                  <t.icon className="h-3.5 w-3.5 mr-1.5" />
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* GENERATE TAB — Firefly-style layout */}
          <TabsContent value="generate" className="mt-6">
            <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-stretch min-h-[calc(100vh-180px)]">
              {/* LEFT: Settings panel — scrollable */}
              <Card className="rounded-2xl border-border/70 bg-card h-full overflow-y-auto">
                {/* General settings */}
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="w-full flex items-center justify-between px-5 py-4 group">
                    <span className="text-sm font-medium">General settings</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-5 pb-5 space-y-4">
                    {/* Style (replaces model) */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Style</Label>
                      <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger className="h-11 rounded-lg bg-background border-border/70">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STYLES.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Aspect ratio */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Aspect ratio</Label>
                      <Select value={ratio} onValueChange={setRatio}>
                        <SelectTrigger className="h-11 rounded-lg bg-background border-border/70">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RATIOS.map((r) => (
                            <SelectItem key={r.id} value={r.id}>{r.label} · {r.id}</SelectItem>
                          ))}
                          <SelectItem value="auto">Auto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Resolution */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Resolution</Label>
                      <Select defaultValue="1k">
                        <SelectTrigger className="h-11 rounded-lg bg-background border-border/70">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1k">1K</SelectItem>
                          <SelectItem value="2k">2K</SelectItem>
                          <SelectItem value="4k">4K</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Use Google Search */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <Label className="text-sm">Use Google Search</Label>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <Switch />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <div className="border-t border-border/60" />

                {/* Reference images */}
                <Collapsible>
                  <CollapsibleTrigger className="w-full flex items-center justify-between px-5 py-4 group">
                    <span className="text-sm font-medium">
                      Reference images <span className="text-muted-foreground font-normal">({referenceImg ? 1 : 0}/6)</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-5 pb-5">
                    {referenceImg ? (
                      <div className="relative rounded-lg overflow-hidden border border-border/70">
                        <img src={referenceImg} alt="Reference" className="w-full h-32 object-cover" />
                        <button onClick={() => (setReferenceImg(null), setReferenceUrl(null))} className="absolute top-1.5 right-1.5 h-6 w-6 rounded-md bg-black/60 text-white flex items-center justify-center hover:bg-black/80">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="w-full aspect-square max-w-[140px] rounded-lg border border-dashed border-border/70 bg-background hover:bg-secondary/40 hover:border-[hsl(var(--primary))]/50 transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
                      >
                        <Upload className="h-5 w-5" />
                      </button>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={onUploadRef} />
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* RIGHT: Canvas area — static, no scroll */}
              <div className="flex flex-col min-w-0 h-full">
                <div className="flex-1 flex items-center justify-center">
                  {!loading && results.length === 0 ? (
                    <div className="w-full max-w-3xl mx-auto px-6 py-8">
                      <div className="text-center mb-6">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))]/30 to-[hsl(var(--primary-deep))]/30 mb-4 relative">
                          <ImageIcon className="h-8 w-8 text-[hsl(var(--primary))]" />
                          <Sparkles className="h-4 w-4 text-[hsl(var(--primary))] absolute -top-1 -right-1" />
                        </div>
                        <h2 className="font-display text-2xl md:text-3xl tracking-tight mb-2">Restyle your product</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                          Upload your jewelry photo, then pick a scene — we'll regenerate the same product in a luxury, model-worn, or showroom setting.
                        </p>
                      </div>

                      {!referenceImg ? (
                        <button
                          onClick={() => fileRef.current?.click()}
                          className="w-full min-h-[220px] flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/70 hover:border-[hsl(var(--primary))]/60 hover:bg-secondary/30 transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Upload className="h-8 w-8" />
                          <div className="text-center">
                            <p className="text-base font-medium text-foreground">Upload your product image</p>
                            <p className="text-xs mt-1">PNG / JPG · clear photo of your jewelry</p>
                          </div>
                          <span className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[hsl(var(--primary))] text-primary-foreground text-xs font-medium">
                            <FileImage className="h-3.5 w-3.5" /> Choose file
                          </span>
                          <p className="text-[11px] mt-2">Or just type a prompt below to generate from scratch.</p>
                        </button>
                      ) : (
                        <div className="grid sm:grid-cols-[180px_1fr] gap-4 items-start">
                          <div className="relative rounded-xl overflow-hidden border border-border/70">
                            <img src={referenceImg} alt="Your product" className="w-full aspect-square object-cover" />
                            <button onClick={() => (setReferenceImg(null), setReferenceUrl(null))} className="absolute top-1.5 right-1.5 h-7 w-7 rounded-md bg-black/65 text-white flex items-center justify-center hover:bg-black/85">
                              <X className="h-3.5 w-3.5" />
                            </button>
                            <Badge className="absolute bottom-1.5 left-1.5 bg-black/65 text-white border-0 text-[10px]">Your product</Badge>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Pick a scene to restyle into</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {SCENES.map((s) => (
                                <button
                                  key={s.id}
                                  onClick={() => { setPrompt(s.prompt); setSceneId(s.id); setTimeout(() => generate(s.prompt, s.id), 50); }}
                                  className="text-left rounded-xl border border-border/70 bg-card hover:border-[hsl(var(--primary))]/60 hover:bg-secondary/40 transition-colors p-3"
                                >
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-base leading-none">{s.emoji}</span>
                                    <span className="text-xs font-medium">{s.label}</span>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground line-clamp-2">{s.desc}</p>
                                </button>
                              ))}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-3">
                              Or write your own scene in the prompt below and hit Generate.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full">
                      {referenceImg && (
                        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <img src={referenceImg} alt="ref" className="h-8 w-8 rounded object-cover border border-border/60" />
                          <span>Restyling your uploaded product</span>
                          <button onClick={() => (setReferenceImg(null), setReferenceUrl(null))} className="ml-1 underline hover:text-foreground">remove</button>
                        </div>
                      )}
                      <div className={`grid ${gridCols} gap-4`}>
                        {(loading ? Array(count[0]).fill(null) : results).map((item, i) => (
                          <Card key={i} className="group relative overflow-hidden rounded-xl border-border/70 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-gold)] transition-all bg-card">
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
                                  <button onClick={() => toggleSave(item)} className={`h-7 w-7 rounded-md backdrop-blur flex items-center justify-center transition-colors ${isSaved(item) ? "bg-[hsl(var(--primary))] text-primary-foreground" : "bg-black/55 text-white hover:bg-black/70"}`}>
                                    {isSaved(item) ? <Check className="h-3.5 w-3.5" /> : <Heart className="h-3.5 w-3.5" />}
                                  </button>
                                  <button onClick={() => { navigator.clipboard.writeText(prompt); toast.success("Prompt copied"); }} className="h-7 w-7 rounded-md bg-black/55 text-white backdrop-blur flex items-center justify-center hover:bg-black/70">
                                    <Copy className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                  <p className="text-[11px] line-clamp-1 mb-2 opacity-90">{item.label}</p>
                                  <div className="flex gap-1.5">
                                    <Button size="sm" variant="gold" className="rounded-md h-7 px-2.5 text-xs flex-1" onClick={() => useForPost(item.src)}>
                                      <Send className="h-3 w-3 mr-1" /> Publish
                                    </Button>
                                    <Button size="sm" variant="secondary" className="rounded-md h-7 px-2 text-xs" onClick={() => sendToEdit(item.src)}>
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="secondary" className="rounded-md h-7 px-2 text-xs" onClick={() => remix(item)}>
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
                    </div>
                  )}
                </div>

                {/* Bottom prompt bar */}
                <div className="mt-4 shrink-0 pb-2">
                  <Card className="rounded-2xl border-border/70 bg-card shadow-[var(--shadow-elegant)] p-4">
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Prompt"
                      rows={2}
                      className="resize-none border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 p-0 placeholder:text-muted-foreground/60"
                    />
                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/40">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={enhancePrompt}
                          disabled={enhancing || !prompt.trim()}
                          className="h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                          title="Enhance with AI"
                        >
                          {enhancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setPrompt(PROMPT_IDEAS[Math.floor(Math.random() * PROMPT_IDEAS.length)])}
                          className="h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          title="Inspire me"
                        >
                          <Sparkles className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => fileRef.current?.click()}
                          className="h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          title="Add reference image"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </button>
                        <div className="hidden md:flex items-center gap-1.5 ml-2 text-[11px] text-muted-foreground">
                          <span className="px-2 py-0.5 rounded-md bg-secondary/60">{ratio}</span>
                          <span className="px-2 py-0.5 rounded-md bg-secondary/60">{STYLES.find(s => s.id === style)?.label}</span>
                        </div>
                      </div>
                      <Button onClick={() => generate()} disabled={loading || !prompt.trim()} variant="gold" className="rounded-lg h-9 px-5">
                        {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
                        Generate
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>

          </TabsContent>

          {/* GALLERY TAB */}
          <TabsContent value="gallery" className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Your Gallery</h3>
                <p className="text-xs text-muted-foreground">Every creative you've generated, in one place.</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg h-9 text-xs" onClick={() => setTab("generate")}>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> New generation
              </Button>
            </div>
            {gallery.length === 0 ? (
              <Card className="rounded-2xl border-dashed border-border/70 bg-card p-12 text-center">
                <Images className="h-8 w-8 mx-auto text-muted-foreground/60 mb-3" />
                <h3 className="font-medium text-sm">Nothing here yet</h3>
                <p className="text-xs text-muted-foreground mt-1">Generate your first image to start your gallery.</p>
              </Card>
            ) : (
              <div className="columns-2 md:columns-3 xl:columns-4 gap-4 space-y-4">
                {gallery.map((item, i) => (
                  <Card key={i} className="group relative overflow-hidden rounded-xl border-border/70 bg-card break-inside-avoid">
                    <img src={item.src} alt={item.label} className="w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-x-0 bottom-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[11px] line-clamp-1 mb-2">{item.label}</p>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="gold" className="rounded-md h-7 px-2.5 text-xs flex-1" onClick={() => useForPost(item.src)}>
                          <Send className="h-3 w-3 mr-1" /> Publish
                        </Button>
                        <Button size="sm" variant="secondary" className="rounded-md h-7 px-2 text-xs" onClick={() => sendToEdit(item.src)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="secondary" className="rounded-md h-7 px-2 text-xs" onClick={() => toast.success("Download started")}>
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* EDIT TAB */}
          <TabsContent value="edit" className="mt-6">
            <div className="grid lg:grid-cols-[260px_1fr] gap-6 items-start">
              {/* Tool rail */}
              <Card className="rounded-2xl border-border/70 bg-card overflow-hidden lg:sticky lg:top-20">
                <div className="p-4 border-b border-border/60">
                  <Button variant="outline" size="sm" className="w-full rounded-lg h-9 text-xs" onClick={() => { setEditImg(null); setEditPrompt(""); }}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> New edit
                  </Button>
                </div>
                <div className="p-2">
                  {EDIT_TOOLS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setEditTool(t.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        editTool === t.id
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      }`}
                    >
                      <t.icon className="h-4 w-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium flex items-center gap-1.5">
                          {t.name}
                          {t.badge && <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" />}
                        </div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1">{t.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Canvas */}
              <div className="space-y-4 min-w-0">
                <Card className="rounded-2xl border-border/70 bg-card overflow-hidden">
                  {editImg ? (
                    <div className="relative bg-[hsl(var(--secondary))] flex items-center justify-center min-h-[420px]">
                      <img src={editImg} alt="Editing" className="max-h-[60vh] w-auto object-contain" />
                      {editLoading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}
                      <button onClick={() => setEditImg(null)} className="absolute top-3 right-3 h-8 w-8 rounded-md bg-black/60 text-white flex items-center justify-center hover:bg-black/80">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => editFileRef.current?.click()}
                      className="w-full min-h-[420px] flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border/60 hover:border-[hsl(var(--primary))]/50 hover:bg-secondary/30 transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <FileImage className="h-10 w-10" />
                      <div className="text-center">
                        <p className="text-base font-medium text-foreground">Drag and drop your image</p>
                        <p className="text-xs mt-1">Or browse to select an image from your device</p>
                      </div>
                      <span className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[hsl(var(--primary))] text-primary-foreground text-xs font-medium">
                        <Upload className="h-3.5 w-3.5" /> Your device
                      </span>
                    </button>
                  )}
                  <input ref={editFileRef} type="file" accept="image/*" hidden onChange={onUploadEdit} />
                </Card>

                {/* Edit prompt bar */}
                <Card className="rounded-2xl border-border/70 bg-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {(() => {
                      const t = EDIT_TOOLS.find((x) => x.id === editTool)!;
                      return (
                        <>
                          <t.icon className="h-4 w-4 text-[hsl(var(--primary-deep))]" />
                          <span className="text-sm font-medium">{t.name}</span>
                          <span className="text-xs text-muted-foreground">— {t.desc}</span>
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder={
                        editTool === "remove" ? "Brush over the area to remove…" :
                        editTool === "expand" ? "Describe what to add around the edges…" :
                        editTool === "upscale" ? "No prompt needed — click Apply for 4× upscale" :
                        editTool === "removebg" ? "No prompt needed — click Apply to cut subject" :
                        "Describe the edit you want…"
                      }
                      className="h-10 rounded-lg border-border/70 bg-background text-sm flex-1"
                      disabled={!editImg}
                    />
                    <Button onClick={runEdit} disabled={!editImg || editLoading} variant="gold" className="rounded-lg h-10 px-5">
                      {editLoading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
                      Apply
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
