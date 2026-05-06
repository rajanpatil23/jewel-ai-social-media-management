import AppLayout from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Bookmark, Send, Instagram as IG, Facebook as FB } from "lucide-react";
import { recentPosts, productImages } from "@/lib/mockData";

export function ChannelPage({ channel }: { channel: "Instagram" | "Facebook" }) {
  const Icon = channel === "Instagram" ? IG : FB;
  const handle = channel === "Instagram" ? "@maisonaurelia" : "Maison Aurelia";
  const followers = channel === "Instagram" ? "184.2K" : "92.4K";

  return (
    <AppLayout>
      <PageHeader eyebrow={channel} title={handle}
        description={`Manage your ${channel} presence — content, audience, and performance in one elegant view.`}
        actions={<Button variant="gold"><Send className="h-4 w-4" /> New {channel} Post</Button>} />

      <Card className="glass p-6 mb-6 flex flex-col md:flex-row md:items-center gap-6">
        <div className="relative h-24 w-24 rounded-full bg-gradient-gold p-[3px]">
          <div className="h-full w-full rounded-full bg-background flex items-center justify-center font-display text-3xl gold-text">M</div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2"><Icon className="h-5 w-5 text-primary" /><h3 className="font-display text-2xl">{handle}</h3></div>
          <p className="text-sm text-muted-foreground mt-1">Bespoke fine jewelry · Bridal · Heritage gold · Established 1898</p>
          <div className="flex gap-6 mt-3">
            <div><p className="font-display text-xl gold-text">{followers}</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Followers</p></div>
            <div><p className="font-display text-xl gold-text">412</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Posts</p></div>
            <div><p className="font-display text-xl gold-text">8.4%</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Engagement</p></div>
          </div>
        </div>
        <Badge variant="outline" className="border-success/40 text-success">Connected</Badge>
      </Card>

      <h3 className="font-display text-xl mb-4">Recent {channel} Grid</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {[...recentPosts, ...recentPosts].slice(0, 8).map((p, i) => (
          <Card key={i} className="glass p-0 overflow-hidden group relative">
            <img src={productImages[p.img as keyof typeof productImages]} alt="" className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-foreground">
              <span className="flex items-center gap-1 text-sm"><Heart className="h-4 w-4 fill-primary text-primary" /> {(p.likes/1000).toFixed(1)}K</span>
              <span className="flex items-center gap-1 text-sm"><MessageCircle className="h-4 w-4 text-primary" /> {p.comments}</span>
            </div>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}

export default ChannelPage;
