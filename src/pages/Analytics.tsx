import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";

const reach = Array.from({ length: 12 }, (_, i) => ({
  day: `W${i + 1}`,
  reach: Math.round(4000 + Math.random() * 6000 + i * 400),
  engagement: Math.round(200 + Math.random() * 400 + i * 30),
}));

const top = [
  { name: "Solitaire Ring", v: 92 },
  { name: "Pearl Earrings", v: 78 },
  { name: "Gold Pendant", v: 64 },
  { name: "Tennis Bracelet", v: 51 },
];

export default function Analytics() {
  return (
    <AppLayout>
      <div className="space-y-10">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--primary-deep))]">Insights</span>
          <h1 className="font-display text-4xl tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Performance across Instagram and Facebook.</p>
        </div>

        <Card className="p-6 rounded-xl border-border/70 shadow-[var(--shadow-elegant)]">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-xl">Reach & Engagement</h2>
            <span className="text-xs text-muted-foreground">Last 12 weeks</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reach}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="reach" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="engagement" stroke="hsl(var(--primary-deep))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 rounded-xl border-border/70 shadow-[var(--shadow-elegant)]">
          <h2 className="font-display text-xl mb-4">Top performing creatives</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="v" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
