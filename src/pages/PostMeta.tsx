import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Instagram, Facebook, Loader2, CheckCircle2, ImagePlus, Send, Calendar as CalendarIcon,
  Heart, MessageCircle, Send as SendIcon, Bookmark, MoreHorizontal, ThumbsUp, Share2,
  Globe2, Hash, BadgeCheck, MapPin, Users, Link2, LayoutGrid, Film, Image as ImageIcon, Square, Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import hero from "@/assets/hero-jewelry.jpg";

const IG_LIMIT = 2200;
const FB_LIMIT = 63206;
const FB_CTA_OPTIONS = ["None","Shop Now","Learn More","Sign Up","Book Now","Contact Us","Send Message","Watch More"];

type Format = "single" | "carousel" | "reel" | "story";
const formatMeta: Record<Format, { label: string; icon: typeof Square; ig: boolean; fb: boolean }> = {
  single:   { label: "Single image",  icon: Square,      ig: true, fb: true },
  carousel: { label: "Carousel (2-10)", icon: LayoutGrid, ig: true, fb: true },
  reel:     { label: "Reel / Video",  icon: Film,        ig: true, fb: true },
  story:    { label: "Story (24h)",   icon: ImageIcon,   ig: true, fb: true },
};

export default function PostMeta() {
  const [image, setImage] = useState<string>(hero);
  const [format, setFormat] = useState<Format>("single");
  const [instagram, setInstagram] = useState(true);
  const [facebook, setFacebook] = useState(true);

  // captions
  const [syncCaptions, setSyncCaptions] = useState(true);
  const [igCaption, setIgCaption] = useState("Timeless brilliance, crafted for you. ✨\n\n#luxuryjewelry #handcrafted #finejewelry");
  const [fbCaption, setFbCaption] = useState("Timeless brilliance, crafted for you. ✨\n\n#luxuryjewelry #handcrafted #finejewelry");
  const [captionTab, setCaptionTab] = useState<"instagram" | "facebook">("instagram");

  // IG fields
  const [igLocation, setIgLocation] = useState("");
  const [igCollaborators, setIgCollaborators] = useState("");
  const [igFirstComment, setIgFirstComment] = useState("");
  const [igShareToFeed, setIgShareToFeed] = useState(true);

  // FB fields
  const [fbCta, setFbCta] = useState("None");
  const [fbLink, setFbLink] = useState("");
  const [fbPlace, setFbPlace] = useState("");
  const [fbAudienceLocale, setFbAudienceLocale] = useState("all");
  const [fbAudienceAge, setFbAudienceAge] = useState("18-65+");

  // schedule
  const [schedule, setSchedule] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [previewTab, setPreviewTab] = useState<"instagram" | "facebook">("instagram");

  // sync from sessionStorage if Studio handed off
  useEffect(() => {
    const img = sessionStorage.getItem("postImage");
    const cap = sessionStorage.getItem("postCaption");
    if (img) setImage(img);
    if (cap) { setIgCaption(cap); setFbCaption(cap); }
    sessionStorage.removeItem("postImage");
    sessionStorage.removeItem("postCaption");
  }, []);

  // when sync is on, mirror IG → FB
  useEffect(() => { if (syncCaptions) setFbCaption(igCaption); }, [igCaption, syncCaptions]);

  const igHashtags = useMemo(() => (igCaption.match(/#\w+/g) || []).length, [igCaption]);
  const igMentions = useMemo(() => (igCaption.match(/@\w+/g) || []).length, [igCaption]);
  const igOver = igCaption.length > IG_LIMIT;
  const fbOver = fbCaption.length > FB_LIMIT;
  const igHashtagsOver = igHashtags > 30;

  const handlePost = () => {
    if (!instagram && !facebook) return toast.error("Select at least one platform");
    if (instagram && igOver)     return toast.error("Instagram caption exceeds 2,200 chars");
    if (instagram && igHashtagsOver) return toast.error("Instagram allows max 30 hashtags");
    if (facebook && fbOver)      return toast.error("Facebook message exceeds limit");
    if (schedule && (!date || !time)) return toast.error("Pick date & time to schedule");
    setPosting(true);
    setPosted(false);
    setTimeout(() => {
      setPosting(false); setPosted(true);
      const where = [instagram && "Instagram", facebook && "Facebook"].filter(Boolean).join(" & ");
      toast.success(schedule ? `Scheduled for ${date} ${time} → ${where}` : `Published to ${where}`);
    }, 1300);
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1500px] space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1.5">Composer</p>
            <h1 className="font-display text-2xl md:text-3xl font-semibold">Create a post</h1>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">Compose once, customize per platform, publish or schedule via Meta Graph API.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Meta connected</Badge>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)_400px]">
          {/* LEFT: media + format + platforms */}
          <Card className="p-4 space-y-4 self-start">
            <div>
              <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Media</Label>
              <div className="relative mt-2 rounded-lg overflow-hidden border border-border bg-secondary aspect-square group">
                <img src={image} alt="Post" className="w-full h-full object-cover" />
                <label className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-background border border-border text-xs font-medium">
                    <ImagePlus className="h-3.5 w-3.5" /> Replace
                  </span>
                  <input type="file" accept="image/*,video/*" className="hidden" onChange={onUpload} />
                </label>
              </div>
              <label className="mt-2 inline-flex w-full items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer border border-dashed border-border rounded-md py-2 transition-colors">
                <ImagePlus className="h-3.5 w-3.5" /> Upload image or video
                <input type="file" accept="image/*,video/*" className="hidden" onChange={onUpload} />
              </label>
            </div>

            <Separator />

            <div>
              <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Format</Label>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {(Object.entries(formatMeta) as [Format, typeof formatMeta[Format]][]).map(([k, m]) => {
                  const Icon = m.icon;
                  const active = format === k;
                  return (
                    <button key={k} onClick={() => setFormat(k)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-md border px-2 py-2.5 text-[11px] transition-colors ${
                        active ? "border-primary/60 bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                      }`}>
                      <Icon className="h-3.5 w-3.5" />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Publish to</Label>
              <div className="mt-2 space-y-1.5">
                <PlatformToggle active={instagram} onChange={setInstagram} icon={<Instagram className="h-3.5 w-3.5" />} label="Instagram" sub="@maison.aurelia" />
                <PlatformToggle active={facebook} onChange={setFacebook} icon={<Facebook className="h-3.5 w-3.5" />} label="Facebook" sub="Maison Aurelia Page" />
              </div>
            </div>
          </Card>

          {/* CENTER: captions + per-platform configs + schedule */}
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Caption & options</p>
                <span className="text-[11px] text-muted-foreground">· autosaved</span>
              </div>
              <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Switch checked={syncCaptions} onCheckedChange={setSyncCaptions} />
                Sync caption across platforms
              </label>
            </div>

            <div className="p-5 space-y-5">
              {/* caption tabs */}
              <Tabs value={captionTab} onValueChange={(v) => setCaptionTab(v as "instagram" | "facebook")}>
                <TabsList className="h-8">
                  <TabsTrigger value="instagram" className="text-xs gap-1.5"><Instagram className="h-3.5 w-3.5" /> Instagram</TabsTrigger>
                  <TabsTrigger value="facebook" className="text-xs gap-1.5"><Facebook className="h-3.5 w-3.5" /> Facebook</TabsTrigger>
                </TabsList>

                <TabsContent value="instagram" className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">IG caption</span>
                    <span className={`text-xs tabular-nums ${igOver ? "text-destructive" : "text-muted-foreground"}`}>{igCaption.length}/{IG_LIMIT}</span>
                  </div>
                  <Textarea rows={7} value={igCaption} onChange={(e) => setIgCaption(e.target.value)} className="resize-none text-sm leading-relaxed" placeholder="Write something timeless…" />
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className={`inline-flex items-center gap-1 ${igHashtagsOver ? "text-destructive" : ""}`}><Hash className="h-3 w-3" /> {igHashtags}/30</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {igMentions}/20 mentions</span>
                  </div>
                </TabsContent>

                <TabsContent value="facebook" className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">FB message</span>
                    <span className={`text-xs tabular-nums ${fbOver ? "text-destructive" : "text-muted-foreground"}`}>{fbCaption.length.toLocaleString()}/{FB_LIMIT.toLocaleString()}</span>
                  </div>
                  <Textarea rows={7} value={fbCaption} onChange={(e) => { setFbCaption(e.target.value); if (syncCaptions) setSyncCaptions(false); }} className="resize-none text-sm leading-relaxed" placeholder="Tell your audience…" />
                  {syncCaptions && <p className="text-[11px] text-muted-foreground">Synced from Instagram. Edit to override.</p>}
                </TabsContent>
              </Tabs>

              {/* Instagram-specific */}
              {instagram && (
                <ConfigSection icon={<Instagram className="h-3.5 w-3.5 text-pink-500" />} title="Instagram options"
                  hint="Maps to Instagram Graph API media container fields.">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Location" icon={<MapPin className="h-3 w-3" />}>
                      <Input value={igLocation} onChange={(e) => setIgLocation(e.target.value)} placeholder="Search a place…" />
                    </Field>
                    <Field label="Collaborators (max 3)" icon={<Users className="h-3 w-3" />}>
                      <Input value={igCollaborators} onChange={(e) => setIgCollaborators(e.target.value)} placeholder="@handle1, @handle2" />
                    </Field>
                  </div>
                  <Field label="First comment (auto-posted)">
                    <Input value={igFirstComment} onChange={(e) => setIgFirstComment(e.target.value)} placeholder="Add hashtags or a link as first comment…" />
                  </Field>
                  {format === "reel" && (
                    <label className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                      <div>
                        <p className="text-xs font-medium">Share Reel to main feed</p>
                        <p className="text-[11px] text-muted-foreground">share_to_feed</p>
                      </div>
                      <Switch checked={igShareToFeed} onCheckedChange={setIgShareToFeed} />
                    </label>
                  )}
                </ConfigSection>
              )}

              {/* Facebook-specific */}
              {facebook && (
                <ConfigSection icon={<Facebook className="h-3.5 w-3.5 text-sky-600" />} title="Facebook options"
                  hint="Maps to Pages API /feed and /photos parameters.">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Call-to-action button">
                      <Select value={fbCta} onValueChange={setFbCta}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{FB_CTA_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                    <Field label="Link URL" icon={<LinkIcon className="h-3 w-3" />}>
                      <Input value={fbLink} onChange={(e) => setFbLink(e.target.value)} placeholder="https://…" />
                    </Field>
                    <Field label="Place / check-in" icon={<MapPin className="h-3 w-3" />}>
                      <Input value={fbPlace} onChange={(e) => setFbPlace(e.target.value)} placeholder="Tag a place" />
                    </Field>
                    <Field label="Audience locale">
                      <Select value={fbAudienceLocale} onValueChange={setFbAudienceLocale}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All locales</SelectItem>
                          <SelectItem value="en_IN">English (India)</SelectItem>
                          <SelectItem value="en_US">English (US)</SelectItem>
                          <SelectItem value="en_GB">English (UK)</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Age range">
                      <Select value={fbAudienceAge} onValueChange={setFbAudienceAge}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="18-65+">18 – 65+</SelectItem>
                          <SelectItem value="18-24">18 – 24</SelectItem>
                          <SelectItem value="25-34">25 – 34</SelectItem>
                          <SelectItem value="35-54">35 – 54</SelectItem>
                          <SelectItem value="55-65+">55 – 65+</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </ConfigSection>
              )}

              {/* Schedule */}
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium leading-none">Schedule</p>
                      <p className="text-xs text-muted-foreground mt-1">FB uses native scheduling · IG runs from queue</p>
                    </div>
                  </div>
                  <Switch checked={schedule} onCheckedChange={setSchedule} />
                </div>
                {schedule && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full" />
                    <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full" />
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-border px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-secondary/30">
              <p className="text-xs text-muted-foreground">
                {schedule && date && time ? `Will publish on ${date} at ${time}` : "Ready to publish to selected platforms"}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Save draft</Button>
                <Button onClick={handlePost} disabled={posting} size="sm" className="gap-1.5">
                  {posting ? <><Loader2 className="h-4 w-4 animate-spin" /> {schedule ? "Scheduling…" : "Publishing…"}</>
                    : posted ? <><CheckCircle2 className="h-4 w-4" /> {schedule ? "Scheduled" : "Posted"}</>
                    : <><Send className="h-4 w-4" /> {schedule ? "Schedule post" : "Publish now"}</>}
                </Button>
              </div>
            </div>
          </Card>

          {/* RIGHT: live preview */}
          <div className="space-y-3 lg:sticky lg:top-20 self-start">
            <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as "instagram" | "facebook")}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Live preview</p>
                <TabsList className="h-8">
                  <TabsTrigger value="instagram" className="text-xs gap-1.5"><Instagram className="h-3.5 w-3.5" /> IG</TabsTrigger>
                  <TabsTrigger value="facebook" className="text-xs gap-1.5"><Facebook className="h-3.5 w-3.5" /> FB</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="instagram" className="m-0">
                <InstagramPreview image={image} caption={igCaption} location={igLocation} />
              </TabsContent>
              <TabsContent value="facebook" className="m-0">
                <FacebookPreview image={image} caption={fbCaption} cta={fbCta} link={fbLink} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function PlatformToggle({ active, onChange, icon, label, sub }: {
  active: boolean; onChange: (v: boolean) => void; icon: React.ReactNode; label: string; sub: string;
}) {
  return (
    <button onClick={() => onChange(!active)}
      className={`w-full flex items-center gap-2.5 rounded-md border px-3 py-2 text-left transition-colors ${
        active ? "border-primary/50 bg-primary/5" : "border-border hover:bg-secondary/60"
      }`}>
      <div className={`h-7 w-7 rounded-md flex items-center justify-center ${active ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium">{label}</p>
        <p className="text-[10px] text-muted-foreground truncate">{sub}</p>
      </div>
      {active && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
    </button>
  );
}

function ConfigSection({ icon, title, hint, children }: { icon: React.ReactNode; title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div>
        <p className="text-xs font-medium flex items-center gap-1.5">{icon} {title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] flex items-center gap-1 text-muted-foreground">{icon}{label}</Label>
      {children}
    </div>
  );
}

function InstagramPreview({ image, caption, location }: { image: string; caption: string; location?: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
            <div className="h-full w-full rounded-full bg-background flex items-center justify-center"><span className="text-[10px] font-semibold">MA</span></div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm font-semibold leading-none">maison.aurelia</p>
              <BadgeCheck className="h-3.5 w-3.5 text-sky-500 fill-sky-500/20" />
            </div>
            {location && <p className="text-[10px] text-muted-foreground mt-0.5">{location}</p>}
          </div>
        </div>
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </div>
      <img src={image} alt="" className="w-full aspect-square object-cover" />
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Heart className="h-5 w-5" /><MessageCircle className="h-5 w-5" /><SendIcon className="h-5 w-5" /></div>
          <Bookmark className="h-5 w-5" />
        </div>
        <p className="text-xs font-semibold">1,248 likes</p>
        <p className="text-sm whitespace-pre-line line-clamp-3 leading-snug"><span className="font-semibold">maison.aurelia </span>{caption}</p>
      </div>
    </Card>
  );
}

function FacebookPreview({ image, caption, cta, link }: { image: string; caption: string; cta: string; link: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center"><span className="text-xs font-semibold text-white">MA</span></div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm font-semibold leading-none">Maison Aurelia</p>
              <BadgeCheck className="h-3.5 w-3.5 text-sky-500 fill-sky-500/20" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">Just now · <Globe2 className="h-3 w-3" /></p>
          </div>
        </div>
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="px-3 pb-3 text-sm whitespace-pre-line line-clamp-4 leading-snug">{caption}</p>
      <img src={image} alt="" className="w-full aspect-square object-cover" />
      {(cta && cta !== "None") && (
        <div className="px-3 py-2 flex items-center justify-between border-t border-border bg-secondary/40">
          <div className="min-w-0">
            <p className="text-[10px] uppercase text-muted-foreground tracking-wider">{link ? new URL(link.startsWith("http") ? link : `https://${link}`).hostname : "your-link.com"}</p>
            <p className="text-xs font-medium truncate">{cta}</p>
          </div>
          <Button size="sm" variant="secondary" className="text-xs">{cta}</Button>
        </div>
      )}
      <div className="px-3 py-2 flex items-center justify-between text-xs text-muted-foreground border-y border-border">
        <span className="inline-flex items-center gap-1">
          <span className="h-4 w-4 rounded-full bg-sky-500 inline-flex items-center justify-center"><ThumbsUp className="h-2.5 w-2.5 text-white" /></span> 324
        </span>
        <span>28 comments · 12 shares</span>
      </div>
      <div className="grid grid-cols-3 p-1">
        <button className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:bg-secondary rounded-md transition-colors"><ThumbsUp className="h-4 w-4" /> Like</button>
        <button className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:bg-secondary rounded-md transition-colors"><MessageCircle className="h-4 w-4" /> Comment</button>
        <button className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:bg-secondary rounded-md transition-colors"><Share2 className="h-4 w-4" /> Share</button>
      </div>
    </Card>
  );
}
