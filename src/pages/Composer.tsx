import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Instagram, Facebook, ImagePlus, Save, CalendarPlus, Send, Heart, MessageCircle } from "lucide-react";
import { productImages } from "@/lib/mockData";
import { toast } from "sonner";

const hashtags = ["#LuxuryJewelry", "#BridalLuxe", "#HeritageGold", "#DiamondReverie", "#FineJewelry", "#MaisonAurelia"];

export default function Composer() {
  const [img, setImg] = useState<keyof typeof productImages>("ring");
  const [caption, setCaption] = useState("✨ Begin forever in brilliance. The new bridal solitaire — 18K gold, 1.2ct certified diamond, halo setting. Hand-finished by our master artisans.");
  const [platform, setPlatform] = useState<"Instagram" | "Facebook" | "Both">("Both");

  return (
    <AppLayout>
      <PageHeader eyebrow="Post Composer" title="Craft & Publish" description="Build a single post and tailor it across Instagram & Facebook." />

      <div className="grid lg:grid-cols-12 gap-6">
        <Card className="glass p-6 lg:col-span-5 space-y-5">
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Product Image</Label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(productImages) as Array<keyof typeof productImages>).filter(k => k !== "ad").map(k => (
                <button key={k} onClick={() => setImg(k)} className={`relative rounded-lg overflow-hidden border-2 transition-all ${img===k ? "border-primary shadow-gold" : "border-transparent opacity-60 hover:opacity-100"}`}>
                  <img src={productImages[k]} alt={k} className="w-full aspect-square object-cover" loading="lazy" />
                </button>
              ))}
            </div>
            <Button variant="luxe" size="sm" className="mt-3 w-full"><ImagePlus className="h-4 w-4" /> Upload from device</Button>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Caption</Label>
            <Textarea value={caption} onChange={e => setCaption(e.target.value)} rows={6} className="bg-secondary/40 border-border/60 resize-none" />
            <div className="text-right text-[10px] text-muted-foreground mt-1">{caption.length} / 2200</div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Hashtag Suggestions</Label>
            <div className="flex flex-wrap gap-1.5">
              {hashtags.map(h => (
                <button key={h} onClick={() => setCaption(c => c + " " + h)} className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20">{h}</button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Platforms</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["Instagram","Facebook","Both"] as const).map(p => (
                <button key={p} onClick={() => setPlatform(p)} className={`px-3 py-2.5 rounded-lg border text-sm flex items-center justify-center gap-2 transition-all ${platform===p ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:border-primary/40"}`}>
                  {p === "Instagram" && <Instagram className="h-4 w-4" />}
                  {p === "Facebook" && <Facebook className="h-4 w-4" />}
                  {p === "Both" && <><Instagram className="h-3.5 w-3.5" /><Facebook className="h-3.5 w-3.5" /></>}
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="ghost" onClick={() => toast.success("Draft saved")}><Save className="h-4 w-4" /> Save Draft</Button>
            <Button variant="luxe" onClick={() => toast.success("Post scheduled")}><CalendarPlus className="h-4 w-4" /> Schedule</Button>
            <Button variant="gold" className="ml-auto" onClick={() => toast.success("Published 🎉")}><Send className="h-4 w-4" /> Publish Now</Button>
          </div>
        </Card>

        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-5">
          {(platform === "Instagram" || platform === "Both") && (
            <Card className="glass p-0 overflow-hidden">
              <div className="flex items-center gap-2 p-3 border-b border-border/60">
                <div className="h-8 w-8 rounded-full bg-gradient-gold p-[2px]"><div className="h-full w-full rounded-full bg-background flex items-center justify-center text-[10px] font-display gold-text">M</div></div>
                <div className="flex-1"><p className="text-xs font-medium">maisonaurelia</p><p className="text-[10px] text-muted-foreground">Sponsored</p></div>
                <Instagram className="h-4 w-4 text-primary" />
              </div>
              <img src={productImages[img]} alt="" className="w-full aspect-square object-cover" loading="lazy" />
              <div className="p-3 space-y-2">
                <div className="flex gap-3 text-foreground"><Heart className="h-5 w-5" /><MessageCircle className="h-5 w-5" /></div>
                <p className="text-xs"><span className="font-semibold">maisonaurelia</span> {caption}</p>
              </div>
            </Card>
          )}
          {(platform === "Facebook" || platform === "Both") && (
            <Card className="glass p-0 overflow-hidden">
              <div className="flex items-center gap-2 p-3 border-b border-border/60">
                <div className="h-8 w-8 rounded-full bg-gradient-gold flex items-center justify-center text-[10px] font-display text-primary-foreground">M</div>
                <div className="flex-1"><p className="text-xs font-medium">Maison Aurelia</p><p className="text-[10px] text-muted-foreground">Just now · 🌐</p></div>
                <Facebook className="h-4 w-4 text-primary" />
              </div>
              <div className="p-3 pb-2"><p className="text-xs">{caption}</p></div>
              <img src={productImages[img]} alt="" className="w-full aspect-square object-cover" loading="lazy" />
              <div className="p-3 flex gap-4 text-xs text-muted-foreground border-t border-border/60"><span>👍 Like</span><span>💬 Comment</span><span>↗ Share</span></div>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
