import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft, ChevronRight, Plus, Instagram, Facebook,
  Heart, MessageCircle, Send as SendIcon, Bookmark, MoreHorizontal, BadgeCheck, Globe2,
  AlertTriangle, Clock, MapPin, Users, Link2, Image as ImageIcon, Film, LayoutGrid, Square,
  Copy, Trash2, Pencil, PlayCircle,
} from "lucide-react";
import { scheduledPosts as seed, productImages, type ScheduledPost, type Platform, type PostStatus, type PostFormat } from "@/lib/mockData";
import { toast } from "sonner";

const monthName = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const statusStyle: Record<PostStatus, string> = {
  scheduled: "bg-sky-500/10 text-sky-600 border-sky-500/30 dark:text-sky-300",
  draft:     "bg-muted text-muted-foreground border-border",
  published: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-300",
  failed:    "bg-rose-500/10 text-rose-600 border-rose-500/30 dark:text-rose-300",
};

const formatIcon: Record<PostFormat, typeof Square> = {
  single: Square, carousel: LayoutGrid, reel: Film, story: ImageIcon,
};

export default function Scheduler() {
  const navigate = useNavigate();
  const [posts] = useState<ScheduledPost[]>(seed);
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(4); // May
  const [view, setView] = useState<"month" | "week" | "list">("month");
  const [selectedId, setSelectedId] = useState<string | null>(seed[0]?.id ?? null);

  // filters
  const [platformFilter, setPlatformFilter] = useState<Record<Platform, boolean>>({ instagram: true, facebook: true });
  const [statusFilter, setStatusFilter] = useState<Record<PostStatus, boolean>>({ scheduled: true, draft: true, published: true, failed: true });

  const filtered = useMemo(
    () => posts.filter(p =>
      p.platforms.some(pl => platformFilter[pl]) &&
      statusFilter[p.status]
    ),
    [posts, platformFilter, statusFilter]
  );

  const postsByDate = useMemo(() => filtered.reduce<Record<string, ScheduledPost[]>>((acc, p) => {
    (acc[p.date] ||= []).push(p); return acc;
  }, {}), [filtered]);

  const selected = posts.find(p => p.id === selectedId) ?? null;

  // calendar cells
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_,i) => i+1)];
  while (cells.length % 7) cells.push(null);

  const goPrev = () => { if (month===0) { setMonth(11); setYear(y=>y-1); } else setMonth(m=>m-1); };
  const goNext = () => { if (month===11) { setMonth(0); setYear(y=>y+1); } else setMonth(m=>m+1); };

  return (
    <AppLayout>
      <div className="flex flex-col xl:flex-row gap-4 min-h-[calc(100vh-7rem)]">
        {/* LEFT: filters */}
        <aside className="xl:w-60 shrink-0 space-y-4">
          <Card className="p-4 space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">View</p>
              <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
                <TabsList className="grid grid-cols-3 h-8 w-full">
                  <TabsTrigger value="month" className="text-xs">Month</TabsTrigger>
                  <TabsTrigger value="week" className="text-xs">Week</TabsTrigger>
                  <TabsTrigger value="list" className="text-xs">List</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Platforms</p>
              <div className="space-y-1.5">
                <FilterRow checked={platformFilter.instagram} onChange={(v) => setPlatformFilter(s => ({...s, instagram: v}))}
                  icon={<Instagram className="h-3.5 w-3.5" />} label="Instagram" count={posts.filter(p => p.platforms.includes("instagram")).length} />
                <FilterRow checked={platformFilter.facebook} onChange={(v) => setPlatformFilter(s => ({...s, facebook: v}))}
                  icon={<Facebook className="h-3.5 w-3.5" />} label="Facebook" count={posts.filter(p => p.platforms.includes("facebook")).length} />
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Status</p>
              <div className="space-y-1.5">
                {(["scheduled","draft","published","failed"] as PostStatus[]).map(s => (
                  <FilterRow key={s} checked={statusFilter[s]} onChange={(v) => setStatusFilter(st => ({...st, [s]: v}))}
                    label={s.charAt(0).toUpperCase()+s.slice(1)}
                    dot={<span className={`h-1.5 w-1.5 rounded-full ${
                      s==="scheduled"?"bg-sky-500":s==="published"?"bg-emerald-500":s==="failed"?"bg-rose-500":"bg-muted-foreground"
                    }`} />}
                    count={posts.filter(p => p.status===s).length} />
                ))}
              </div>
            </div>

            <Separator />
            <Button size="sm" className="w-full gap-1.5" onClick={() => navigate("/post")}>
              <Plus className="h-3.5 w-3.5" /> New post
            </Button>
          </Card>

          <Card className="p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Connected accounts</p>
            <div className="space-y-2 text-xs">
              <AccountRow icon={<Instagram className="h-3.5 w-3.5" />} name="@maison.aurelia" />
              <AccountRow icon={<Facebook className="h-3.5 w-3.5" />} name="Maison Aurelia" />
            </div>
            <Button variant="outline" size="sm" className="w-full mt-3 text-xs" onClick={() => navigate("/connections")}>
              Manage
            </Button>
          </Card>
        </aside>

        {/* CENTER: calendar */}
        <div className="flex-1 min-w-0">
          <Card className="p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goPrev}><ChevronLeft className="h-4 w-4" /></Button>
                <h3 className="font-display text-xl w-40 text-center">{monthName[month]} {year}</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goNext}><ChevronRight className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" className="h-8 ml-1 text-xs" onClick={() => { const d = new Date(); setYear(d.getFullYear()); setMonth(d.getMonth()); }}>
                  Today
                </Button>
              </div>
              <p className="text-xs text-muted-foreground hidden md:block">{filtered.length} posts in view</p>
            </div>

            {view === "list" ? (
              <ListView posts={filtered} selectedId={selectedId} onSelect={setSelectedId} />
            ) : (
              <div className="grid grid-cols-7 gap-1.5">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d =>
                  <div key={d} className="text-center text-[10px] uppercase tracking-widest text-muted-foreground py-1.5">{d}</div>
                )}
                {cells.map((d, i) => {
                  const dateStr = d ? `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}` : "";
                  const dayPosts = postsByDate[dateStr] || [];
                  const isToday = dateStr === new Date().toISOString().slice(0,10);
                  return (
                    <div key={i}
                      className={`min-h-[110px] p-1.5 rounded-md border text-left transition-colors ${
                        !d ? "border-transparent bg-transparent" :
                        isToday ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:bg-secondary/30"
                      }`}>
                      {d && (
                        <>
                          <div className={`text-[11px] font-medium mb-1 px-1 ${isToday ? "text-primary" : ""}`}>{d}</div>
                          <div className="space-y-1">
                            {dayPosts.slice(0,3).map(p => (
                              <button key={p.id} onClick={() => setSelectedId(p.id)}
                                className={`w-full flex items-center gap-1 px-1 py-0.5 rounded border text-left transition-colors ${statusStyle[p.status]} ${
                                  selectedId===p.id ? "ring-1 ring-foreground/30" : ""
                                }`}>
                                <img src={productImages[p.img]} alt="" className="h-4 w-4 rounded object-cover shrink-0" />
                                <span className="text-[10px] truncate flex-1">{p.time} {p.title}</span>
                                {p.status === "failed" && <AlertTriangle className="h-2.5 w-2.5 shrink-0" />}
                              </button>
                            ))}
                            {dayPosts.length > 3 && <div className="text-[10px] text-muted-foreground px-1">+{dayPosts.length-3} more</div>}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT: inspector */}
        <aside className="xl:w-[380px] shrink-0">
          {selected ? (
            <Inspector
              post={selected}
              onEdit={() => navigate("/post")}
              onDuplicate={() => toast.success("Post duplicated")}
              onCancel={() => toast.success("Schedule cancelled")}
              onPublishNow={() => toast.success("Publishing to Meta…")}
            />
          ) : (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              Select a post to inspect.
            </Card>
          )}
        </aside>
      </div>
    </AppLayout>
  );
}

function FilterRow({ checked, onChange, icon, dot, label, count }: {
  checked: boolean; onChange: (v: boolean) => void;
  icon?: React.ReactNode; dot?: React.ReactNode; label: string; count: number;
}) {
  return (
    <label className="flex items-center gap-2 text-xs cursor-pointer hover:bg-secondary/50 rounded px-1.5 py-1 transition-colors">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} className="h-3.5 w-3.5" />
      {icon}
      {dot}
      <span className="flex-1">{label}</span>
      <span className="text-muted-foreground tabular-nums">{count}</span>
    </label>
  );
}

function AccountRow({ icon, name }: { icon: React.ReactNode; name: string }) {
  return (
    <div className="flex items-center gap-2 px-1.5 py-1.5 rounded bg-secondary/40">
      {icon}
      <span className="flex-1 truncate">{name}</span>
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
    </div>
  );
}

function ListView({ posts, selectedId, onSelect }: { posts: ScheduledPost[]; selectedId: string|null; onSelect: (id: string) => void }) {
  const sorted = [...posts].sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));
  return (
    <div className="divide-y divide-border">
      {sorted.map(p => (
        <button key={p.id} onClick={() => onSelect(p.id)}
          className={`w-full flex items-center gap-3 py-2.5 px-2 rounded text-left hover:bg-secondary/40 transition-colors ${selectedId===p.id ? "bg-secondary/60" : ""}`}>
          <img src={productImages[p.img]} alt="" className="h-10 w-10 rounded object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{p.title}</p>
            <p className="text-[11px] text-muted-foreground">{p.date} · {p.time}</p>
          </div>
          <div className="flex items-center gap-1">
            {p.platforms.includes("instagram") && <Instagram className="h-3.5 w-3.5 text-muted-foreground" />}
            {p.platforms.includes("facebook") && <Facebook className="h-3.5 w-3.5 text-muted-foreground" />}
          </div>
          <Badge variant="outline" className={`text-[10px] ${statusStyle[p.status]}`}>{p.status}</Badge>
        </button>
      ))}
    </div>
  );
}

function Inspector({ post, onEdit, onDuplicate, onCancel, onPublishNow }: {
  post: ScheduledPost; onEdit: () => void; onDuplicate: () => void; onCancel: () => void; onPublishNow: () => void;
}) {
  const FmtIcon = formatIcon[post.format];
  const previewPlatform: Platform = post.platforms[0] ?? "instagram";
  const [tab, setTab] = useState<Platform>(previewPlatform);

  return (
    <div className="space-y-3 xl:sticky xl:top-20">
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{post.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> {post.date} · {post.time}
              <span className="mx-1">·</span>
              <FmtIcon className="h-3 w-3" /> {post.format}
            </p>
          </div>
          <Badge variant="outline" className={`text-[10px] shrink-0 ${statusStyle[post.status]}`}>{post.status}</Badge>
        </div>

        {post.status === "failed" && post.lastError && (
          <div className="mx-4 mt-3 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-700 dark:text-rose-300 flex gap-2">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{post.lastError}</span>
          </div>
        )}

        <Tabs value={tab} onValueChange={(v) => setTab(v as Platform)} className="px-4 pt-3">
          <TabsList className="h-8">
            {post.platforms.includes("instagram") && <TabsTrigger value="instagram" className="text-xs gap-1.5"><Instagram className="h-3.5 w-3.5" /> Instagram</TabsTrigger>}
            {post.platforms.includes("facebook") && <TabsTrigger value="facebook" className="text-xs gap-1.5"><Facebook className="h-3.5 w-3.5" /> Facebook</TabsTrigger>}
          </TabsList>
          <TabsContent value="instagram" className="mt-3">
            <IGPreview img={productImages[post.img]} caption={post.caption} />
          </TabsContent>
          <TabsContent value="facebook" className="mt-3">
            <FBPreview img={productImages[post.img]} caption={post.caption} />
          </TabsContent>
        </Tabs>

        <div className="p-4 pt-3 space-y-3">
          <ConfigBlock title="Schedule">
            <ConfigRow label="Time zone" value="Asia/Kolkata (IST)" />
            <ConfigRow label="Publishes at" value={`${post.date} ${post.time}`} />
            <ConfigRow label="Mode" value={post.platforms.includes("facebook") ? "FB native + IG queued" : "IG queued"} />
          </ConfigBlock>

          {post.platforms.includes("instagram") && post.ig && (
            <ConfigBlock title="Instagram">
              {post.ig.location && <ConfigRow icon={<MapPin className="h-3 w-3" />} label="Location" value={post.ig.location} />}
              {post.ig.collaborators?.length ? <ConfigRow icon={<Users className="h-3 w-3" />} label="Collaborators" value={post.ig.collaborators.join(", ")} /> : null}
              {post.ig.firstComment && <ConfigRow label="First comment" value={post.ig.firstComment} />}
              {post.format === "reel" && <ConfigRow label="Share to feed" value={post.ig.shareToFeed ? "Yes" : "No"} />}
            </ConfigBlock>
          )}

          {post.platforms.includes("facebook") && post.fb && (
            <ConfigBlock title="Facebook">
              {post.fb.ctaButton && <ConfigRow label="CTA button" value={post.fb.ctaButton} />}
              {post.fb.link && <ConfigRow icon={<Link2 className="h-3 w-3" />} label="Link" value={post.fb.link} />}
              {post.fb.place && <ConfigRow icon={<MapPin className="h-3 w-3" />} label="Place" value={post.fb.place} />}
              {post.fb.targeting && <ConfigRow label="Audience" value={post.fb.targeting} />}
            </ConfigBlock>
          )}
        </div>

        <div className="border-t border-border px-4 py-3 flex flex-wrap gap-2 bg-secondary/30">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={onEdit}><Pencil className="h-3 w-3" /> Edit</Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={onDuplicate}><Copy className="h-3 w-3" /> Duplicate</Button>
          {post.status === "scheduled" && (
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={onCancel}><Trash2 className="h-3 w-3" /> Cancel</Button>
          )}
          {(post.status === "scheduled" || post.status === "draft" || post.status === "failed") && (
            <Button size="sm" className="gap-1.5 text-xs ml-auto" onClick={onPublishNow}><PlayCircle className="h-3 w-3" /> Publish now</Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function ConfigBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border p-2.5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ConfigRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-[11px]">
      <span className="text-muted-foreground flex items-center gap-1 w-24 shrink-0">{icon}{label}</span>
      <span className="flex-1 break-words">{value}</span>
    </div>
  );
}

function IGPreview({ img, caption }: { img: string; caption: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
            <div className="h-full w-full rounded-full bg-background flex items-center justify-center text-[9px] font-semibold">MA</div>
          </div>
          <div className="flex items-center gap-1">
            <p className="text-xs font-semibold leading-none">maison.aurelia</p>
            <BadgeCheck className="h-3 w-3 text-sky-500 fill-sky-500/20" />
          </div>
        </div>
        <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <img src={img} alt="" className="w-full aspect-square object-cover" />
      <div className="p-2.5 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5"><Heart className="h-4 w-4" /><MessageCircle className="h-4 w-4" /><SendIcon className="h-4 w-4" /></div>
          <Bookmark className="h-4 w-4" />
        </div>
        <p className="text-[11px] whitespace-pre-line line-clamp-3 leading-snug"><span className="font-semibold">maison.aurelia </span>{caption}</p>
      </div>
    </Card>
  );
}

function FBPreview({ img, caption }: { img: string; caption: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-2.5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-[10px] font-semibold text-white">MA</div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold leading-none">Maison Aurelia</p>
              <BadgeCheck className="h-3 w-3 text-sky-500 fill-sky-500/20" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">Just now · <Globe2 className="h-2.5 w-2.5" /></p>
          </div>
        </div>
        <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <p className="px-2.5 pb-2 text-[11px] whitespace-pre-line line-clamp-3 leading-snug">{caption}</p>
      <img src={img} alt="" className="w-full aspect-square object-cover" />
    </Card>
  );
}
