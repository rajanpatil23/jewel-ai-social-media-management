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
import hero from "@/assets/hero-jewelry.jpg";
import ad from "@/assets/ad-creative.jpg";

const SAMPLES = [ring, necklace, earrings, bracelet, hero, ad];

export default function ImageGen() {
  const [prompt, setPrompt] = useState("Elegant 18k gold diamond ring on marble, soft studio light");
  const [style, setStyle] = useState("studio");
  const [ratio, setRatio] = useState("1:1");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const navigate = useNavigate();

  const generate = () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResults([]);
    setTimeout(() => {
      const shuffled = [...SAMPLES].sort(() => Math.random() - 0.5).slice(0, 4);
      setResults(shuffled);
      setLoading(false);
      toast.success("4 images generated");
    }, 1400);
  };

  const useForPost = (img: string) => {
    sessionStorage.setItem("postImage", img);
    sessionStorage.setItem("postCaption", prompt);
    navigate("/post");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Image Generation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Describe your product. We'll create high-quality visuals ready for Instagram & Facebook.
          </p>
        </div>

        <div className="grid lg:grid-cols-[360px_1fr] gap-6">
          <Card className="p-5 space-y-4 h-fit">
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                rows={5}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image…"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="editorial">Editorial</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ratio</Label>
                <Select value={ratio} onValueChange={setRatio}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:1">Square 1:1</SelectItem>
                    <SelectItem value="4:5">Portrait 4:5</SelectItem>
                    <SelectItem value="9:16">Story 9:16</SelectItem>
                    <SelectItem value="16:9">Landscape 16:9</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {loading ? "Generating…" : "Generate"}
            </Button>
          </Card>

          <Card className="p-5 min-h-[420px]">
            {!results.length && !loading && (
              <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center text-muted-foreground">
                <Sparkles className="h-8 w-8 mb-3 opacity-50" />
                <p className="text-sm">Your generated images will appear here</p>
              </div>
            )}
            {loading && (
              <div className="grid grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square rounded-lg bg-secondary animate-pulse" />
                ))}
              </div>
            )}
            {!!results.length && (
              <div className="grid grid-cols-2 gap-4">
                {results.map((src, i) => (
                  <div key={i} className="group relative rounded-lg overflow-hidden border border-border">
                    <img src={src} alt="Generated" className="aspect-square w-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => useForPost(src)}>
                        <Send className="h-3.5 w-3.5 mr-1.5" /> Post
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
