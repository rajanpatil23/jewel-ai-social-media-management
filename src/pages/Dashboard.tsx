import AppLayout from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Instagram, Facebook, CheckCircle2, Plus, MoreHorizontal, Calendar } from "lucide-react";
import { recentPosts, scheduledPosts, productImages } from "@/lib/mockData";
import { Link } from "react-router-dom";

const accounts = [
  { name: "@maisonaurelia", type: "Instagram Business", followers: "184.2K", icon: Instagram, status: "Connected" },
  { name: "Maison Aurelia", type: "Facebook Page", followers: "92.4K", icon: Facebook, status: "Connected" },
];

export default function Dashboard() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="Brand Workspace"
        title="Maison Aurelia"
        description="A unified command center for your jewelry brand's social presence."
        actions={<><Button variant="luxe"><Plus className="h-4 w-4" /> Connect Account</Button><Button variant="gold" asChild><Link to="/studio">New Post</Link></Button></>}
      />

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {accounts.map(a => (
          <Card key={a.name} className="glass p-6 hover-lift">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-gold-soft border border-primary/30 flex items-center justify-center text-primary"><a.icon className="h-5 w-5" /></div>
                <div>
                  <p className="font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.type}</p>
                </div>
              </div>
              <Badge className="bg-success/15 text-success border-success/30 hover:bg-success/15"><CheckCircle2 className="h-3 w-3 mr-1" /> {a.status}</Badge>
            </div>
            <div className="mt-5 grid grid-cols-3 text-center divide-x divide-border/60">
              <div><p className="font-display text-xl gold-text">{a.followers}</p><p className="text-[10px] uppercase text-muted-foreground tracking-wider">Followers</p></div>
              <div><p className="font-display text-xl gold-text">8.4%</p><p className="text-[10px] uppercase text-muted-foreground tracking-wider">Engagement</p></div>
              <div><p className="font-display text-xl gold-text">412K</p><p className="text-[10px] uppercase text-muted-foreground tracking-wider">Reach 30d</p></div>
            </div>
          </Card>
        ))}
        <Card className="glass p-6 border-dashed border-primary/30 flex flex-col items-center justify-center text-center hover-lift">
          <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-3"><Plus className="h-5 w-5 text-primary" /></div>
          <p className="font-medium">Add another channel</p>
          <p className="text-xs text-muted-foreground mt-1">TikTok · Pinterest · YouTube</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="glass p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div><h3 className="font-display text-2xl">Recent Posts</h3><p className="text-xs text-muted-foreground">Latest published content</p></div>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-3">
            {recentPosts.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 border border-border/40">
                <img src={productImages[p.img as keyof typeof productImages]} alt="" className="h-14 w-14 rounded-lg object-cover" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.platform} · Published 2h ago</p>
                </div>
                <div className="hidden sm:flex gap-6 text-sm">
                  <div className="text-right"><p className="font-medium">{p.likes.toLocaleString()}</p><p className="text-[10px] uppercase text-muted-foreground tracking-wider">Likes</p></div>
                  <div className="text-right"><p className="font-medium">{p.comments}</p><p className="text-[10px] uppercase text-muted-foreground tracking-wider">Comments</p></div>
                </div>
                <Badge variant="outline" className="border-success/40 text-success">{p.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass p-6">
          <div className="flex items-center justify-between mb-5">
            <div><h3 className="font-display text-2xl">Up Next</h3><p className="text-xs text-muted-foreground">Scheduled this week</p></div>
            <Button asChild variant="ghost" size="sm"><Link to="/calendar"><Calendar className="h-3 w-3" /> Calendar</Link></Button>
          </div>
          <div className="space-y-4">
            {scheduledPosts.slice(0,4).map(p => (
              <div key={p.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/30 flex flex-col items-center justify-center text-primary">
                    <span className="text-[9px] uppercase">{new Date(p.date).toLocaleString("en", { month:"short" })}</span>
                    <span className="text-sm font-display leading-none">{new Date(p.date).getDate()}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.time} · {p.platform}</p>
                  <Badge variant="outline" className="mt-1 text-[10px] border-primary/30 text-primary">{p.type}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
