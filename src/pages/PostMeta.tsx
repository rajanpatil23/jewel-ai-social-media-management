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
import {
  Instagram,
  Facebook,
  Loader2,
  CheckCircle2,
  ImagePlus,
  Send,
  Calendar as CalendarIcon,
  Clock,
  Heart,
  MessageCircle,
  Send as SendIcon,
  Bookmark,
  MoreHorizontal,
  ThumbsUp,
  Share2,
  Globe2,
  Hash,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import hero from "@/assets/hero-jewelry.jpg";

const IG_LIMIT = 2200;

export default function PostMeta() {
  const [image, setImage] = useState<string>(hero);
  const [caption, setCaption] = useState(
    "Timeless brilliance, crafted for you. ✨\n\nDiscover our newest collection.\n\n#luxuryjewelry #handcrafted #finejewelry"
  );
  const [instagram, setInstagram] = useState(true);
  const [facebook, setFacebook] = useState(true);
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [schedule, setSchedule] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [firstComment, setFirstComment] = useState("");
  const [previewTab, setPreviewTab] = useState<"instagram" | "facebook">("instagram");

  useEffect(() => {
    const img = sessionStorage.getItem("postImage");
    const cap = sessionStorage.getItem("postCaption");
    if (img) setImage(img);
    if (cap) setCaption((c) => cap + "\n\n" + c.split("\n\n").slice(-1)[0]);
    sessionStorage.removeItem("postImage");
    sessionStorage.removeItem("postCaption");
  }, []);

  const hashtags = useMemo(() => (caption.match(/#\w+/g) || []).length, [caption]);
  const overLimit = caption.length > IG_LIMIT;

  const handlePost = () => {
    if (!instagram && !facebook) {
      toast.error("Select at least one platform");
      return;
    }
    if (overLimit) {
      toast.error("Caption exceeds Instagram limit");
      return;
    }
    if (schedule && (!date || !time)) {
      toast.error("Pick a date and time to schedule");
      return;
    }
    setPosting(true);
    setPosted(false);
    setTimeout(() => {
      setPosting(false);
      setPosted(true);
      const where = [instagram && "Instagram", facebook && "Facebook"].filter(Boolean).join(" & ");
      toast.success(schedule ? `Scheduled for ${date} ${time} • ${where}` : `Posted to ${where}`);
    }, 1400);
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary/80 mb-2">Scheduler</p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold gold-text">Compose & Publish</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Craft a single post and publish or schedule it across Instagram and Facebook.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Meta connected
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_460px]">
          {/* Composer */}
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/40 flex items-center justify-center">
                  <Send className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">New post</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Draft · autosaved</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-1">
                <PlatformPill active={instagram} onClick={() => setInstagram(!instagram)} icon={<Instagram className="h-3.5 w-3.5" />} label="Instagram" />
                <PlatformPill active={facebook} onClick={() => setFacebook(!facebook)} icon={<Facebook className="h-3.5 w-3.5" />} label="Facebook" />
              </div>
            </div>

            <div className="grid md:grid-cols-[260px_1fr] gap-0">
              {/* Media */}
              <div className="p-6 md:border-r border-border space-y-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Media</Label>
                <div className="relative rounded-xl overflow-hidden border border-border bg-secondary aspect-square group">
                  <img src={image} alt="Post" className="w-full h-full object-cover" />
                  <label className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-background border border-border text-xs font-medium">
                      <ImagePlus className="h-3.5 w-3.5" /> Replace
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                  </label>
                </div>
                <label className="inline-flex w-full items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer border border-dashed border-border rounded-md py-2 transition-colors">
                  <ImagePlus className="h-3.5 w-3.5" />
                  <span>Upload image or video</span>
                  <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                </label>
              </div>

              {/* Caption + options */}
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="caption" className="text-xs uppercase tracking-wider text-muted-foreground">Caption</Label>
                    <span className={`text-xs tabular-nums ${overLimit ? "text-destructive" : "text-muted-foreground"}`}>
                      {caption.length}/{IG_LIMIT}
                    </span>
                  </div>
                  <Textarea
                    id="caption"
                    rows={8}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="resize-none text-sm leading-relaxed"
                    placeholder="Write something timeless…"
                  />
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Hash className="h-3 w-3" /> {hashtags} hashtags</span>
                    <span className="inline-flex items-center gap-1"><Globe2 className="h-3 w-3" /> Public</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstcomment" className="text-xs uppercase tracking-wider text-muted-foreground">First comment <span className="normal-case text-muted-foreground/70">(optional)</span></Label>
                  <Input
                    id="firstcomment"
                    placeholder="Add hashtags or a link in the first comment…"
                    value={firstComment}
                    onChange={(e) => setFirstComment(e.target.value)}
                  />
                </div>

                <div className="rounded-xl border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium leading-none">Schedule</p>
                        <p className="text-xs text-muted-foreground mt-1">Publish later in your timezone</p>
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

                <div className="md:hidden grid grid-cols-2 gap-2">
                  <PlatformPill active={instagram} onClick={() => setInstagram(!instagram)} icon={<Instagram className="h-3.5 w-3.5" />} label="Instagram" />
                  <PlatformPill active={facebook} onClick={() => setFacebook(!facebook)} icon={<Facebook className="h-3.5 w-3.5" />} label="Facebook" />
                </div>
              </div>
            </div>

            <div className="border-t border-border px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-secondary/30">
              <p className="text-xs text-muted-foreground">
                {schedule && date && time
                  ? `Will publish on ${date} at ${time}`
                  : "Ready to publish to selected platforms"}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="luxe" size="sm">Save draft</Button>
                <Button onClick={handlePost} disabled={posting} variant="gold" size="sm">
                  {posting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> {schedule ? "Scheduling…" : "Publishing…"}</>
                  ) : posted ? (
                    <><CheckCircle2 className="h-4 w-4" /> {schedule ? "Scheduled" : "Posted"}</>
                  ) : (
                    <><Send className="h-4 w-4" /> {schedule ? "Schedule post" : "Post now"}</>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Preview */}
          <div className="space-y-4 lg:sticky lg:top-6 self-start">
            <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as "instagram" | "facebook")}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Live preview</p>
                <TabsList className="h-8">
                  <TabsTrigger value="instagram" className="text-xs gap-1.5"><Instagram className="h-3.5 w-3.5" /> Instagram</TabsTrigger>
                  <TabsTrigger value="facebook" className="text-xs gap-1.5"><Facebook className="h-3.5 w-3.5" /> Facebook</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="instagram" className="m-0">
                <InstagramPreview image={image} caption={caption} />
              </TabsContent>
              <TabsContent value="facebook" className="m-0">
                <FacebookPreview image={image} caption={caption} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function PlatformPill({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? "border-primary/60 bg-primary/10 text-foreground shadow-sm"
          : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
      }`}
    >
      {icon}
      {label}
      {active && <CheckCircle2 className="h-3 w-3 text-primary" />}
    </button>
  );
}

function InstagramPreview({ image, caption }: { image: string; caption: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
            <div className="h-full w-full rounded-full bg-background flex items-center justify-center">
              <span className="text-[10px] font-semibold">MA</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <p className="text-sm font-semibold leading-none">maison.aurelia</p>
            <BadgeCheck className="h-3.5 w-3.5 text-sky-500 fill-sky-500/20" />
          </div>
        </div>
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </div>
      <img src={image} alt="" className="w-full aspect-square object-cover" />
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5" />
            <MessageCircle className="h-5 w-5" />
            <SendIcon className="h-5 w-5" />
          </div>
          <Bookmark className="h-5 w-5" />
        </div>
        <p className="text-xs font-semibold">1,248 likes</p>
        <p className="text-sm whitespace-pre-line line-clamp-3 leading-snug">
          <span className="font-semibold">maison.aurelia </span>
          {caption}
        </p>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Just now</p>
      </div>
    </Card>
  );
}

function FacebookPreview({ image, caption }: { image: string; caption: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center">
            <span className="text-xs font-semibold text-white">MA</span>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm font-semibold leading-none">Maison Aurelia</p>
              <BadgeCheck className="h-3.5 w-3.5 text-sky-500 fill-sky-500/20" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              Just now · <Globe2 className="h-3 w-3" />
            </p>
          </div>
        </div>
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="px-3 pb-3 text-sm whitespace-pre-line line-clamp-4 leading-snug">{caption}</p>
      <img src={image} alt="" className="w-full aspect-square object-cover" />
      <div className="px-3 py-2 flex items-center justify-between text-xs text-muted-foreground border-b border-border">
        <span className="inline-flex items-center gap-1">
          <span className="h-4 w-4 rounded-full bg-sky-500 inline-flex items-center justify-center"><ThumbsUp className="h-2.5 w-2.5 text-white" /></span>
          324
        </span>
        <span>28 comments · 12 shares</span>
      </div>
      <div className="grid grid-cols-3 p-1">
        <button className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:bg-secondary rounded-md transition-colors">
          <ThumbsUp className="h-4 w-4" /> Like
        </button>
        <button className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:bg-secondary rounded-md transition-colors">
          <MessageCircle className="h-4 w-4" /> Comment
        </button>
        <button className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:bg-secondary rounded-md transition-colors">
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>
    </Card>
  );
}
