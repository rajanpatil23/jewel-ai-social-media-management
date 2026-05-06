import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Download, Loader2, Send } from "lucide-react";
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

export default function ImageGen() {
  const [prompt, setPrompt] = useState("Elegant 18k gold diamond solitaire ring on cream silk, soft studio lighting");
  const [style, setStyle] = useState("studio");
  const [ratio, setRatio] = useState("1:1");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(SAMPLES);
  const navigate = useNavigate();

  const generate = () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setResults([...SAMPLES].sort(() => Math.random() - 0.5));
      setLoading(false);
      toast.success("4 new creatives generated");
    }, 1400);
  };

  const useForPost = (img: string) => {
    sessionStorage.setItem("postImage", img);
    sessionStorage.setItem("postCaption", prompt);
    navigate("/post");
  };

  return (
    <AppLayout>
      <div className="space-y-10">
        {/* Hero */}
        <div className="space-y-3 text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-[hsl(var(--primary-deep))]">
            <Sparkles className="h-3 w-3" /> AI Studio
          </span>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight">
            Create breathtaking <span className="gold-text">jewelry creatives</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl">
            AI-powered content creation for luxury jewelry brands. From product shot to scroll-stopping post in seconds.
          </p>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-6 lg:gap-8 items-start">
          {/* Form */}
          <Card className="p-6 space-y-5 rounded-2xl border-border/70 shadow-[var(--shadow-elegant)] bg-card">
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-xs uppercase tracking-wider text-muted-foreground">Describe your piece</Label>
              <Textarea
                id="prompt"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A pearl necklace on marble…"
                className="resize-none rounded-lg border-border/70 bg-background focus-visible:ring-[hsl(var(--primary))]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="rounded-lg border-border/70 bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="editorial">Editorial</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Ratio</Label>
                <Select value={ratio} onValueChange={setRatio}>
                  <SelectTrigger className="rounded-lg border-border/70 bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:1">Square 1:1</SelectItem>
                    <SelectItem value="4:5">Portrait 4:5</SelectItem>
                    <SelectItem value="9:16">Story 9:16</SelectItem>
                    <SelectItem value="16:9">Landscape 16:9</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={generate} disabled={loading} variant="gold" size="lg" className="w-full rounded-lg font-medium">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {loading ? "Generating…" : "Generate Creatives"}
            </Button>
            <p className="text-[11px] text-center text-muted-foreground pt-1">
              4 creatives per generation · ~10 seconds
            </p>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-display text-2xl tracking-tight">Generated Results</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Hover a creative to publish or download.</p>
              </div>
              <span className="text-xs text-muted-foreground">{results.length} images</span>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-5">
              {(loading ? Array(4).fill(null) : results).map((item, i) => (
                <Card
                  key={i}
                  className="group relative overflow-hidden rounded-xl border-border/70 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-gold)] transition-shadow bg-card"
                >
                  {loading || !item ? (
                    <div className="aspect-square bg-secondary animate-pulse" />
                  ) : (
                    <>
                      <img src={item.src} alt={item.label} className="aspect-square w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent text-white">
                        <p className="text-xs font-medium">{item.label}</p>
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="gold" className="rounded-md" onClick={() => useForPost(item.src)}>
                          <Send className="h-3.5 w-3.5 mr-1.5" /> Publish
                        </Button>
                        <Button size="sm" variant="secondary" className="rounded-md" onClick={() => toast.success("Download started")}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
