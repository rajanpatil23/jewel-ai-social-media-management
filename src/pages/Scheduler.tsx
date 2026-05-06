import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuCheckboxItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft, ChevronRight, Plus, Instagram, Facebook,
  Heart, MessageCircle, Send as SendIcon, Bookmark, MoreHorizontal, BadgeCheck, Globe2,
  AlertTriangle, Clock, MapPin, Users, Link2, Image as ImageIcon, Film, LayoutGrid, Square,
  Copy, Trash2, Pencil, PlayCircle, Filter, ListFilter,
} from "lucide-react";
import { scheduledPosts as seed, productImages, type ScheduledPost, type Platform, type PostStatus, type PostFormat } from "@/lib/mockData";
import { usePosts, deletePost, updatePost, type Post } from "@/lib/posts";
import { toast } from "sonner";

const monthName = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const statusDot: Record<PostStatus, string> = {
  scheduled: "bg-sky-500", draft: "bg-muted-foreground/50",
  published: "bg-emerald-500", failed: "bg-rose-500",
};
const statusBadge: Record<PostStatus, string> = {
  scheduled: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
  draft: "bg-muted text-muted-foreground border-border",
  published: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  failed: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
};
const formatIcon: Record<PostFormat, typeof Square> = { single: Square, carousel: LayoutGrid, reel: Film, story: ImageIcon };

export default function Scheduler() {
  const navigate = useNavigate();
  const { posts: realPosts, refresh } = usePosts();

  // Convert real posts to ScheduledPost shape, then merge with seed (so the
  // calendar isn't empty for first-time users). Real posts always win on id.
  const posts: ScheduledPost[] = useMemo(() => {
    const mapped: ScheduledPost[] = realPosts.map((p: Post) => {
      const when = p.scheduledAt ? new Date(p.scheduledAt) : new Date(p.createdAt);
      const date = `${when.getFullYear()}-${String(when.getMonth()+1).padStart(2,"0")}-${String(when.getDate()).padStart(2,"0")}`;
      const time = `${String(when.getHours()).padStart(2,"0")}:${String(when.getMinutes()).padStart(2,"0")}`;
      return {
        id: p.id,
        title: p.title,
        date,
        time,
        platforms: p.platforms,
        format: p.format,
        status: p.status,
        img: "ring",
        caption: p.captionIg || p.captionFb,
        lastError: p.lastError || undefined,
        // attach mediaUrl via any-cast for inspector preview
        ...( { mediaUrl: p.mediaUrl } as any ),
      };
    });
    const ids = new Set(mapped.map(m => m.id));
    return [...mapped, ...seed.filter(s => !ids.has(s.id))];
  }, [realPosts]);

  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(4); // May
  const [view, setView] = useState<"month" | "week" | "list">("month");
  const [weekAnchor, setWeekAnchor] = useState<Date>(() => {
    const d = new Date(2026, 4, 4); // start of week containing May 2026
    d.setDate(d.getDate() - d.getDay());
    return d;
  });
  const [openId, setOpenId] = useState<string | null>(null);

  const [platformFilter, setPlatformFilter] = useState<Record<Platform, boolean>>({ instagram: true, facebook: true });
  const [statusFilter, setStatusFilter] = useState<Record<PostStatus, boolean>>({ scheduled: true, draft: true, published: true, failed: true });

  const filtered = useMemo(
    () => posts.filter(p => p.platforms.some(pl => platformFilter[pl]) && statusFilter[p.status]),
    [posts, platformFilter, statusFilter]
  );

  const postsByDate = useMemo(() => {
    const map = filtered.reduce<Record<string, ScheduledPost[]>>((acc, p) => {
      (acc[p.date] ||= []).push(p); return acc;
    }, {});
    Object.values(map).forEach(arr => arr.sort((a,b) => a.time.localeCompare(b.time)));
    return map;
  }, [filtered]);

  const selected = posts.find(p => p.id === openId) ?? null;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  // Build 6-week grid filled with prev/next month "ghost" days for a stable layout
  const cells: { day: number; iso: string; inMonth: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    cells.push({ day: d, iso: `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, iso: `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`, inMonth: true });
  }
  let next = 1;
  while (cells.length < 42) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    cells.push({ day: next, iso: `${y}-${String(m+1).padStart(2,"0")}-${String(next).padStart(2,"0")}`, inMonth: false });
    next++;
  }

  // Week view cells
  const weekCells = useMemo(() => {
    const out: { day: number; iso: string; inMonth: boolean; date: Date }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekAnchor);
      d.setDate(weekAnchor.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      out.push({ day: d.getDate(), iso, inMonth: d.getMonth() === month && d.getFullYear() === year, date: d });
    }
    return out;
  }, [weekAnchor, month, year]);

  const weekRangeLabel = useMemo(() => {
    const s = weekCells[0]?.date, e = weekCells[6]?.date;
    if (!s || !e) return "";
    const fmt = (d: Date) => `${monthName[d.getMonth()].slice(0,3)} ${d.getDate()}`;
    return s.getMonth() === e.getMonth()
      ? `${fmt(s)} – ${e.getDate()}, ${e.getFullYear()}`
      : `${fmt(s)} – ${fmt(e)}, ${e.getFullYear()}`;
  }, [weekCells]);

  const goPrev = () => {
    if (view === "week") {
      const d = new Date(weekAnchor); d.setDate(d.getDate() - 7); setWeekAnchor(d);
      setMonth(d.getMonth()); setYear(d.getFullYear());
    } else if (month===0) { setMonth(11); setYear(y=>y-1); } else setMonth(m=>m-1);
  };
  const goNext = () => {
    if (view === "week") {
      const d = new Date(weekAnchor); d.setDate(d.getDate() + 7); setWeekAnchor(d);
      setMonth(d.getMonth()); setYear(d.getFullYear());
    } else if (month===11) { setMonth(0); setYear(y=>y+1); } else setMonth(m=>m+1);
  };
  const goToday = () => {
    const d = new Date();
    setYear(d.getFullYear()); setMonth(d.getMonth());
    const w = new Date(d); w.setDate(d.getDate() - d.getDay()); setWeekAnchor(w);
  };
  const todayIso = new Date().toISOString().slice(0,10);

  const activePlatformCount = Object.values(platformFilter).filter(Boolean).length;
  const activeStatusCount = Object.values(statusFilter).filter(Boolean).length;
  const filtersActive = activePlatformCount < 2 || activeStatusCount < 4;

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={goPrev} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-9 px-3" onClick={goToday}>Today</Button>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={goNext} aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <h2 className="font-display text-xl md:text-2xl font-semibold ml-1">
            {view === "week" ? weekRangeLabel : <>{monthName[month]} <span className="text-muted-foreground font-normal">{year}</span></>}
          </h2>

          <Tabs value={view} onValueChange={(v) => setView(v as typeof view)} className="ml-auto">
            <TabsList className="h-9">
              <TabsTrigger value="month" className="text-xs px-3">Month</TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-3">Week</TabsTrigger>
              <TabsTrigger value="list" className="text-xs px-3">List</TabsTrigger>
            </TabsList>
          </Tabs>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <ListFilter className="h-3.5 w-3.5" />
                Filter
                {filtersActive && <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">!</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Platforms</DropdownMenuLabel>
              <DropdownMenuCheckboxItem checked={platformFilter.instagram}
                onCheckedChange={(v) => setPlatformFilter(s => ({...s, instagram: !!v}))}>
                <Instagram className="h-3.5 w-3.5 mr-2" /> Instagram
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={platformFilter.facebook}
                onCheckedChange={(v) => setPlatformFilter(s => ({...s, facebook: !!v}))}>
                <Facebook className="h-3.5 w-3.5 mr-2" /> Facebook
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</DropdownMenuLabel>
              {(["scheduled","draft","published","failed"] as PostStatus[]).map(s => (
                <DropdownMenuCheckboxItem key={s} checked={statusFilter[s]}
                  onCheckedChange={(v) => setStatusFilter(st => ({...st, [s]: !!v}))}>
                  <span className={`h-1.5 w-1.5 rounded-full mr-2 ${statusDot[s]}`} />
                  <span className="capitalize">{s}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" className="h-9 gap-1.5" onClick={() => navigate("/post")}>
            <Plus className="h-3.5 w-3.5" /> New post
          </Button>
        </div>

        {/* Status legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          {(["scheduled","published","draft","failed"] as PostStatus[]).map(s => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${statusDot[s]}`} />
              <span className="capitalize">{s}</span>
              <span className="tabular-nums opacity-60">{posts.filter(p => p.status===s).length}</span>
            </span>
          ))}
          <span className="ml-auto">{filtered.length} posts in view</span>
        </div>

        {/* Calendar */}
        <Card className="overflow-hidden">
          {view === "list" ? (
            <ListView posts={filtered} onOpen={setOpenId} />
          ) : (
            <div>
              <div className="grid grid-cols-7 border-b border-border bg-secondary/30">
                {(view === "week" ? weekCells : null)
                  ? weekCells.map((c) => (
                      <div key={c.iso} className="text-center py-2">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][c.date.getDay()]}
                        </div>
                        <div className={`text-sm font-medium tabular-nums mt-0.5 inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full ${
                          c.iso === todayIso ? "bg-primary text-primary-foreground" : "text-foreground"
                        }`}>{c.day}</div>
                      </div>
                    ))
                  : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d =>
                      <div key={d} className="text-center text-[10px] uppercase tracking-widest text-muted-foreground py-2">{d}</div>
                    )}
              </div>
              <div className={`grid grid-cols-7 ${view === "month" ? "grid-rows-6" : ""}`}>
                {(view === "week" ? weekCells : cells).map((c, i) => {
                  const dayPosts = postsByDate[c.iso] || [];
                  const isToday = c.iso === todayIso;
                  const isWeek = view === "week";
                  const total = isWeek ? 7 : 42;
                  return (
                    <div key={i}
                      className={`${isWeek ? "min-h-[520px]" : "min-h-[120px]"} border-b border-r border-border p-1.5 ${
                        i % 7 === 6 ? "border-r-0" : ""
                      } ${i >= total - 7 ? "border-b-0" : ""} ${
                        c.inMonth ? "bg-card" : "bg-muted/20"
                      }`}>
                      {!isWeek && (
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[11px] font-medium tabular-nums inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full ${
                            isToday ? "bg-primary text-primary-foreground" : c.inMonth ? "text-foreground" : "text-muted-foreground/60"
                          }`}>{c.day}</span>
                          {dayPosts.length > 0 && (
                            <span className="text-[9px] text-muted-foreground tabular-nums">{dayPosts.length}</span>
                          )}
                        </div>
                      )}
                      <div className="space-y-1">
                        {(isWeek ? dayPosts : dayPosts.slice(0,3)).map(p => (
                          <button key={p.id} onClick={() => setOpenId(p.id)}
                            className={`w-full flex items-center gap-1 px-1.5 py-1 rounded border text-left transition-colors hover:brightness-110 ${statusBadge[p.status]}`}>
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusDot[p.status]}`} />
                            <span className="text-[10px] tabular-nums opacity-80 shrink-0">{p.time}</span>
                            <span className="text-[10px] truncate flex-1 font-medium">{p.title}</span>
                            <span className="flex items-center gap-0.5 shrink-0 opacity-70">
                              {p.platforms.includes("instagram") && <Instagram className="h-2.5 w-2.5" />}
                              {p.platforms.includes("facebook") && <Facebook className="h-2.5 w-2.5" />}
                            </span>
                            {p.status === "failed" && <AlertTriangle className="h-2.5 w-2.5 shrink-0" />}
                          </button>
                        ))}
                        {!isWeek && dayPosts.length > 3 && (
                          <div className="w-full text-[10px] text-muted-foreground px-1.5 py-0.5 text-left">
                            +{dayPosts.length-3} more
                          </div>
                        )}
                        {isWeek && dayPosts.length === 0 && (
                          <p className="text-[10px] text-muted-foreground/60 px-1 py-1">No posts</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Inspector Sheet */}
      <Sheet open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0">
          {selected && (
            <Inspector
              post={selected}
              onEdit={() => { setOpenId(null); navigate("/post"); }}
              onDuplicate={() => toast.success("Post duplicated")}
              onCancel={async () => {
                await deletePost(selected.id);
                toast.success("Schedule cancelled");
                setOpenId(null);
                refresh();
              }}
              onPublishNow={async () => {
                await updatePost(selected.id, { status: "published", scheduledAt: null });
                toast.success("Marked as published");
                setOpenId(null);
                refresh();
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}

function ListView({ posts, onOpen }: { posts: ScheduledPost[]; onOpen: (id: string) => void }) {
  const sorted = [...posts].sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));
  const grouped = sorted.reduce<Record<string, ScheduledPost[]>>((acc, p) => {
    (acc[p.date] ||= []).push(p); return acc;
  }, {});
  return (
    <div className="divide-y divide-border">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <div className="px-4 py-2 bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">{date}</div>
          {items.map(p => (
            <button key={p.id} onClick={() => onOpen(p.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors text-left">
              <img src={(p as any).mediaUrl || productImages[p.img]} alt="" className="h-10 w-10 rounded object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.title}</p>
                <p className="text-[11px] text-muted-foreground">{p.time} · {p.format}</p>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                {p.platforms.includes("instagram") && <Instagram className="h-3.5 w-3.5" />}
                {p.platforms.includes("facebook") && <Facebook className="h-3.5 w-3.5" />}
              </div>
              <Badge variant="outline" className={`text-[10px] capitalize ${statusBadge[p.status]}`}>{p.status}</Badge>
            </button>
          ))}
        </div>
      ))}
      {sorted.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No posts match your filters.</div>}
    </div>
  );
}

function Inspector({ post, onEdit, onDuplicate, onCancel, onPublishNow }: {
  post: ScheduledPost; onEdit: () => void; onDuplicate: () => void; onCancel: () => void; onPublishNow: () => void;
}) {
  const FmtIcon = formatIcon[post.format];
  const [tab, setTab] = useState<Platform>(post.platforms[0] ?? "instagram");

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-5 py-4 border-b border-border space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <SheetTitle className="text-base truncate">{post.title}</SheetTitle>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> {post.date} · {post.time}
              <span>·</span>
              <FmtIcon className="h-3 w-3" /> {post.format}
            </p>
          </div>
          <Badge variant="outline" className={`text-[10px] capitalize shrink-0 ${statusBadge[post.status]}`}>{post.status}</Badge>
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {post.status === "failed" && post.lastError && (
          <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-700 dark:text-rose-300 flex gap-2">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{post.lastError}</span>
          </div>
        )}

        <Tabs value={tab} onValueChange={(v) => setTab(v as Platform)}>
          <TabsList className="h-8">
            {post.platforms.includes("instagram") && <TabsTrigger value="instagram" className="text-xs gap-1.5"><Instagram className="h-3.5 w-3.5" /> Instagram</TabsTrigger>}
            {post.platforms.includes("facebook") && <TabsTrigger value="facebook" className="text-xs gap-1.5"><Facebook className="h-3.5 w-3.5" /> Facebook</TabsTrigger>}
          </TabsList>
          <TabsContent value="instagram" className="mt-3">
            <IGPreview img={(post as any).mediaUrl || productImages[post.img]} caption={post.caption} />
          </TabsContent>
          <TabsContent value="facebook" className="mt-3">
            <FBPreview img={(post as any).mediaUrl || productImages[post.img]} caption={post.caption} />
          </TabsContent>
        </Tabs>

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

      <div className="border-t border-border px-5 py-3 flex flex-wrap gap-2 bg-secondary/30">
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={onEdit}><Pencil className="h-3 w-3" /> Edit</Button>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={onDuplicate}><Copy className="h-3 w-3" /> Duplicate</Button>
        {post.status === "scheduled" && (
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={onCancel}><Trash2 className="h-3 w-3" /> Cancel</Button>
        )}
        {(post.status === "scheduled" || post.status === "draft" || post.status === "failed") && (
          <Button size="sm" className="gap-1.5 text-xs ml-auto" onClick={onPublishNow}><PlayCircle className="h-3 w-3" /> Publish now</Button>
        )}
      </div>
    </div>
  );
}

function ConfigBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">{title}</p>
      <div className="space-y-1.5">{children}</div>
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
