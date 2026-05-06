import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Instagram, Facebook } from "lucide-react";
import { scheduledPosts, productImages } from "@/lib/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const monthName = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const typeColor: Record<string, string> = {
  Campaign: "bg-primary/20 text-primary border-primary/40",
  Post: "bg-blue-400/15 text-blue-300 border-blue-400/30",
  Draft: "bg-muted text-muted-foreground border-border",
};

export default function Calendar() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(4); // May
  const [selected, setSelected] = useState<string | null>(null);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_,i) => i+1)];
  while (cells.length % 7) cells.push(null);

  const postsByDate = scheduledPosts.reduce<Record<string, typeof scheduledPosts>>((acc, p) => {
    (acc[p.date] ||= []).push(p); return acc;
  }, {});

  const dayPosts = selected ? postsByDate[selected] || [] : [];

  return (
    <AppLayout>
      <PageHeader eyebrow="Content Calendar" title="Schedule & Plan" description="Plan, drag, and orchestrate your editorial flow."
        actions={<Dialog><DialogTrigger asChild><Button variant="gold"><Plus className="h-4 w-4" /> New Scheduled Post</Button></DialogTrigger>
          <DialogContent className="glass-strong border-primary/30">
            <DialogHeader><DialogTitle className="font-display gold-text text-2xl">Schedule a Post</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>Title</Label><Input className="bg-secondary/40" placeholder="Bridal Reveal · Day 1" /></div>
              <div className="grid grid-cols-2 gap-3"><div><Label>Date</Label><Input type="date" className="bg-secondary/40" /></div><div><Label>Time</Label><Input type="time" className="bg-secondary/40" /></div></div>
              <div><Label>Caption</Label><Textarea rows={3} className="bg-secondary/40" placeholder="Begin forever in brilliance…" /></div>
              <Button variant="gold" className="w-full" onClick={() => toast.success("Scheduled")}>Schedule</Button>
            </div>
          </DialogContent></Dialog>}
      />

      <Card className="glass p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => { if (month===0) { setMonth(11); setYear(y=>y-1); } else setMonth(m=>m-1); }}><ChevronLeft /></Button>
            <h3 className="font-display text-2xl gold-text w-44 text-center">{monthName[month]} {year}</h3>
            <Button variant="ghost" size="icon" onClick={() => { if (month===11) { setMonth(0); setYear(y=>y+1); } else setMonth(m=>m+1); }}><ChevronRight /></Button>
          </div>
          <div className="hidden md:flex gap-2 text-xs">
            {Object.entries(typeColor).map(([k,c]) => <Badge key={k} variant="outline" className={c}>{k}</Badge>)}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d} className="text-center text-[10px] uppercase tracking-widest text-muted-foreground py-2">{d}</div>)}
          {cells.map((d, i) => {
            const dateStr = d ? `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}` : "";
            const posts = postsByDate[dateStr] || [];
            const isSelected = dateStr === selected;
            return (
              <button key={i} onClick={() => d && setSelected(dateStr)} disabled={!d}
                className={`min-h-[88px] p-2 rounded-lg border text-left transition-all ${!d ? "border-transparent" : isSelected ? "border-primary bg-primary/10" : "border-border/40 hover:border-primary/40 bg-secondary/20"}`}>
                {d && <>
                  <div className="text-xs font-medium mb-1">{d}</div>
                  <div className="space-y-1">
                    {posts.slice(0,2).map(p => (
                      <div key={p.id} className={`text-[10px] px-1.5 py-0.5 rounded border truncate ${typeColor[p.type]}`}>{p.title}</div>
                    ))}
                    {posts.length > 2 && <div className="text-[10px] text-muted-foreground">+{posts.length-2} more</div>}
                  </div>
                </>}
              </button>
            );
          })}
        </div>
      </Card>

      {selected && dayPosts.length > 0 && (
        <Card className="glass p-6 mt-6 animate-fade-in">
          <h3 className="font-display text-xl mb-4">Posts on {selected}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dayPosts.map(p => (
              <div key={p.id} className="flex gap-3 p-3 rounded-xl bg-secondary/30 border border-border/40">
                <img src={productImages[p.img as keyof typeof productImages]} alt="" className="h-16 w-16 rounded-lg object-cover" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.time}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {p.platform.includes("Instagram") || p.platform === "Both" ? <Instagram className="h-3 w-3 text-primary" /> : null}
                    {p.platform.includes("Facebook") || p.platform === "Both" ? <Facebook className="h-3 w-3 text-primary" /> : null}
                    <Badge variant="outline" className={`text-[10px] ${typeColor[p.type]}`}>{p.type}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </AppLayout>
  );
}
