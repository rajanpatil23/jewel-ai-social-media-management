import AppLayout from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, TrendingUp, Sparkles } from "lucide-react";
import { campaigns, productImages } from "@/lib/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const statusColor: Record<string, string> = {
  Active: "bg-success/15 text-success border-success/30",
  Scheduled: "bg-primary/15 text-primary border-primary/30",
  Draft: "bg-muted text-muted-foreground border-border",
};

export default function Campaigns() {
  return (
    <AppLayout>
      <PageHeader eyebrow="Campaigns" title="Campaign Management" description="Orchestrate multi-post launches with AI-assisted planning."
        actions={<Dialog><DialogTrigger asChild><Button variant="gold"><Plus className="h-4 w-4" /> Create Campaign</Button></DialogTrigger>
          <DialogContent className="glass-strong border-primary/30">
            <DialogHeader><DialogTitle className="font-display gold-text text-2xl">New Campaign</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>Campaign Name</Label><Input className="bg-secondary/40" placeholder="Summer Heritage Capsule" /></div>
              <div className="grid grid-cols-2 gap-3"><div><Label>Start</Label><Input type="date" className="bg-secondary/40" /></div><div><Label>End</Label><Input type="date" className="bg-secondary/40" /></div></div>
              <div><Label>Brief</Label><Textarea rows={3} className="bg-secondary/40" placeholder="A 14-day editorial sprint celebrating…" /></div>
              <Button variant="gold" className="w-full" onClick={() => toast.success("Campaign created")}>
                <Sparkles className="h-4 w-4" /> Launch with AI
              </Button>
            </div>
          </DialogContent></Dialog>}
      />

      <div className="grid md:grid-cols-2 gap-6">
        {campaigns.map(c => (
          <Card key={c.id} className="glass overflow-hidden hover-lift relative">
            <div className="relative h-40">
              <img src={productImages[c.img as keyof typeof productImages]} alt={c.name} className="w-full h-full object-cover" loading="lazy" />
              <div className={`absolute inset-0 bg-gradient-to-t ${c.color} from-background via-background/60`} />
              <div className="absolute top-3 right-3"><Badge variant="outline" className={statusColor[c.status]}>{c.status}</Badge></div>
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="font-display text-2xl gold-text">{c.name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Calendar className="h-3 w-3" /> {c.dates}</p>
              </div>
            </div>
            <div className="p-5 grid grid-cols-3 divide-x divide-border/60 text-center">
              <div><p className="font-display text-xl gold-text">{c.posts}</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Posts</p></div>
              <div><p className="font-display text-xl gold-text">{c.engagement}</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Engagement</p></div>
              <div><p className="font-display text-xl gold-text">{c.reach}</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Reach</p></div>
            </div>
            <div className="px-5 pb-5 flex gap-2">
              <Button variant="luxe" size="sm" className="flex-1">View Details</Button>
              <Button variant="ghost" size="sm" className="flex-1"><TrendingUp className="h-3 w-3" /> Insights</Button>
            </div>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
