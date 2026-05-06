import AppLayout from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gem, Sparkles, Eye, CalendarPlus, Send, BarChart3, ArrowRight } from "lucide-react";

const steps = [
  { n: "01", icon: Gem, title: "Add jewelry product details", desc: "Drop in product type, materials, gem specs, and brand notes — or import from your catalog." },
  { n: "02", icon: Sparkles, title: "AI generates creative & caption", desc: "Aurum AI produces on-brand visuals, captions, and 3 A/B variations in under 30 seconds." },
  { n: "03", icon: Eye, title: "Brand reviews and edits", desc: "Refine tone, swap creatives, lock hashtags. Approve in one click — version-controlled." },
  { n: "04", icon: CalendarPlus, title: "Schedule post in calendar", desc: "Drop into the editorial calendar with smart-time suggestions per platform." },
  { n: "05", icon: Send, title: "Auto-publish to Instagram & Facebook", desc: "Hands-free publishing with format-perfect crops, alt-text, and channel tagging." },
  { n: "06", icon: BarChart3, title: "Track analytics & AI recommendations", desc: "Live performance dashboards plus weekly AI-powered creative recommendations." },
];

export default function Automation() {
  return (
    <AppLayout>
      <PageHeader eyebrow="Automation" title="The Aurum Workflow" description="Six elegant steps from raw product to optimized, multi-channel storytelling." />

      <div className="relative">
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent hidden md:block" />
        <div className="space-y-6">
          {steps.map((s, i) => (
            <div key={s.n} className={`relative flex md:items-center gap-6 ${i%2===0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
              <Card className="glass p-6 md:w-[calc(50%-2rem)] hover-lift relative">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-gold flex items-center justify-center text-primary-foreground shrink-0 shadow-gold">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <Badge variant="outline" className="border-primary/30 text-primary mb-2 font-display">Step {s.n}</Badge>
                    <h3 className="font-display text-xl mb-1">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              </Card>
              <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-background border-2 border-primary items-center justify-center shadow-gold">
                <span className="font-display text-sm gold-text">{s.n}</span>
              </div>
              <div className="hidden md:block md:w-[calc(50%-2rem)]" />
            </div>
          ))}
        </div>
      </div>

      <Card className="glass-strong mt-10 p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial-gold opacity-50" />
        <div className="relative">
          <h3 className="font-display text-3xl md:text-4xl gold-text">From product photo to published post in under 5 minutes.</h3>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Zero manual dependency. Always on-brand. Built for luxury.</p>
          <div className="mt-6 inline-flex items-center gap-2 text-primary text-sm">Try the workflow <ArrowRight className="h-4 w-4 animate-pulse" /></div>
        </div>
      </Card>
    </AppLayout>
  );
}
