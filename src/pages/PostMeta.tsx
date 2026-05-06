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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Instagram, Facebook, Loader2, CheckCircle2, ImagePlus, Send, Calendar as CalendarIcon,
  Heart, MessageCircle, Send as SendIcon, Bookmark, MoreHorizontal, ThumbsUp, Share2,
  Globe2, Hash, BadgeCheck, MapPin, Users, LayoutGrid, Film, Image as ImageIcon, Square, Link as LinkIcon,
  Sparkles, ChevronRight, Images,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useGallery } from "@/lib/gallery";
import { productImages } from "@/lib/mockData";
import { createPost } from "@/lib/posts";
import { useConnections } from "@/lib/connections";
import { api, tryApi } from "@/lib/api";
import hero from "@/assets/hero-jewelry.jpg";

const IG_LIMIT = 2200;
const FB_LIMIT = 63206;
const FB_CTA_OPTIONS = ["None", "Shop Now", "Learn More", "Sign Up", "Book Now", "Contact Us", "Send Message", "Watch More"];

type Format = "single" | "carousel" | "reel" | "story";
const formatMeta: Record<Format, { label: string; icon: typeof Square }> = {
  single: { label: "Image", icon: Square },
  carousel: { label: "Carousel", icon: LayoutGrid },
  reel: { label: "Reel", icon: Film },
  story: { label: "Story", icon: ImageIcon },
};

export default function PostMeta() {
  const [image, setImage] = useState<string>(hero);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [format, setFormat] = useState<Format>("single");
  const [instagram, setInstagram] = useState(true);
  const [facebook, setFacebook] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const navigate = useNavigate();
  const gallery = useGallery();
  const { isConnected } = useConnections();
  const metaConnected = isConnected("meta");
  const isReel = format === "reel";
  const isCarousel = format === "carousel";

  const [syncCaptions, setSyncCaptions] = useState(true);
  const [igCaption, setIgCaption] = useState("Timeless brilliance, crafted for you. ✨\n\n#luxuryjewelry #handcrafted #finejewelry");
  const [fbCaption, setFbCaption] = useState("Timeless brilliance, crafted for you. ✨\n\n#luxuryjewelry #handcrafted #finejewelry");
  const [captionTab, setCaptionTab] = useState<"instagram" | "facebook">("instagram");

  const [igLocation, setIgLocation] = useState("");
  const [igCollaborators, setIgCollaborators] = useState("");
  const [igFirstComment, setIgFirstComment] = useState("");
  const [igShareToFeed, setIgShareToFeed] = useState(true);

  const [fbCta, setFbCta] = useState("None");
  const [fbLink, setFbLink] = useState("");
  const [fbPlace, setFbPlace] = useState("");

  const [schedule, setSchedule] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [previewTab, setPreviewTab] = useState<"instagram" | "facebook">("instagram");

  useEffect(() => {
    const img = sessionStorage.getItem("postImage");
    const cap = sessionStorage.getItem("postCaption");
    if (img) setImage(img);
    if (cap) { setIgCaption(cap); setFbCaption(cap); }
    sessionStorage.removeItem("postImage");
    sessionStorage.removeItem("postCaption");
  }, []);

  useEffect(() => { if (syncCaptions) setFbCaption(igCaption); }, [igCaption, syncCaptions]);

  const igHashtags = useMemo(() => (igCaption.match(/#\w+/g) || []).length, [igCaption]);
  const igOver = igCaption.length > IG_LIMIT;
  const fbOver = fbCaption.length > FB_LIMIT;
  const igHashtagsOver = igHashtags > 30;

  // sync preview tab to captionTab and vice versa? Keep independent but prefer the one being edited.
  useEffect(() => { setPreviewTab(captionTab); }, [captionTab]);

  const platformsSelected = (instagram ? 1 : 0) + (facebook ? 1 : 0);

  const buildPayload = (status: "published" | "scheduled" | "draft") => {
    const platforms = [instagram && "instagram", facebook && "facebook"].filter(Boolean) as ("instagram"|"facebook")[];
    const scheduledAt = status === "scheduled" && schedule ? new Date(`${date}T${time}`).toISOString() : null;
    const title = (igCaption || fbCaption).split("\n")[0].slice(0, 80) || "Untitled post";
    const primary = isReel ? videoUrl : (isCarousel && mediaUrls[0]) || image;
    return {
      title, captionIg: igCaption, captionFb: fbCaption,
      mediaUrl: primary,
      mediaUrls: isCarousel ? mediaUrls : undefined,
      format, platforms, scheduledAt, status,
    };
  };

  const handleSaveDraft = async () => {
    setPosting(true);
    try {
      await createPost(buildPayload("draft"));
      toast.success("Draft saved");
    } catch (e: any) { toast.error(e?.message || "Failed to save draft"); }
    finally { setPosting(false); }
  };

  const handlePost = async () => {
    if (!instagram && !facebook) return toast.error("Select at least one platform");
    if (instagram && igOver) return toast.error("Instagram caption exceeds 2,200 chars");
    if (instagram && igHashtagsOver) return toast.error("Instagram allows max 30 hashtags");
    if (facebook && fbOver) return toast.error("Facebook message exceeds limit");
    if (schedule && (!date || !time)) return toast.error("Pick date & time to schedule");
    if (isCarousel && mediaUrls.length < 2) return toast.error("Carousel needs 2–10 images");
    if (isCarousel && mediaUrls.length > 10) return toast.error("Carousel max is 10 images");
    if (isReel && !videoUrl) return toast.error("Upload a video for the Reel");
    setPosting(true); setPosted(false);
    try {
      await createPost(buildPayload(schedule ? "scheduled" : "published"));
      setPosted(true);
      const where = [instagram && "Instagram", facebook && "Facebook"].filter(Boolean).join(" & ");
      toast.success(schedule ? `Scheduled for ${date} ${time} → ${where}` : `Queued for ${where}`);
      if (schedule) setTimeout(() => navigate("/schedule"), 800);
    } catch (e: any) {
      toast.error(e?.message || "Failed to save post");
    } finally {
      setPosting(false);
    }
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    e.target.value = "";

    if (isReel) {
      const f = files[0];
      if (!f.type.startsWith("video/")) return toast.error("Reel needs a video file (.mp4)");
      setVideoUrl(URL.createObjectURL(f));
      const r = await tryApi(() => api.upload<{ url: string }>("/upload", f));
      if (r?.url) { setVideoUrl(r.url); toast.success("Video uploaded"); }
      return;
    }

    if (isCarousel) {
      const previews = files.map(f => URL.createObjectURL(f));
      setMediaUrls(prev => [...prev, ...previews].slice(0, 10));
      const uploaded: string[] = [];
      for (const f of files) {
        const r = await tryApi(() => api.upload<{ url: string }>("/upload", f));
        if (r?.url) uploaded.push(r.url);
      }
      if (uploaded.length) {
        setMediaUrls(prev => {
          const filtered = prev.filter(u => !previews.includes(u));
          return [...filtered, ...uploaded].slice(0, 10);
        });
        toast.success(`Uploaded ${uploaded.length}`);
      }
      return;
    }

    const file = files[0];
    setImage(URL.createObjectURL(file));
    const r = await tryApi(() => api.upload<{ url: string }>("/upload", file));
    if (r?.url) { setImage(r.url); toast.success("Uploaded"); }
  };

  const removeCarouselItem = (i: number) => setMediaUrls(prev => prev.filter((_, idx) => idx !== i));

  // Reset carousel/video state when format changes
  useEffect(() => {
    if (!isCarousel) setMediaUrls([]);
    if (!isReel) setVideoUrl("");
  }, [format, isCarousel, isReel]);

  return (
    <AppLayout>
      {/* Sticky action bar */}
      <div className="sticky top-0 z-20 -mx-6 -mt-6 mb-6 px-6 py-3 bg-background/90 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-[1400px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <h1 className="font-display text-lg font-semibold truncate">Create a post</h1>
              <p className="text-[11px] text-muted-foreground">
                {platformsSelected} platform{platformsSelected !== 1 ? "s" : ""} · {formatMeta[format].label}
                {schedule && date && time ? ` · ${date} ${time}` : ""}
              </p>
            </div>
            {metaConnected ? (
              <Badge variant="secondary" className="gap-1.5 hidden md:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Meta connected
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1.5 hidden md:inline-flex cursor-pointer" onClick={() => navigate("/connections")}>
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Connect Meta
              </Badge>
            )}

          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSaveDraft} disabled={posting}>Save draft</Button>
            <Button onClick={handlePost} disabled={posting} size="sm" className="gap-1.5">
              {posting ? <><Loader2 className="h-4 w-4 animate-spin" /> {schedule ? "Scheduling…" : "Publishing…"}</>
                : posted ? <><CheckCircle2 className="h-4 w-4" /> {schedule ? "Scheduled" : "Posted"}</>
                : <><Send className="h-4 w-4" /> {schedule ? "Schedule" : "Publish now"}</>}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          {/* LEFT: form (single column, progressive) */}
          <div className="space-y-5">
            {/* 1. Media */}
            <SectionCard step={1} title="Media" subtitle="Pick from your AI-generated gallery, upload, or generate something new.">
              <div className="grid sm:grid-cols-[200px_1fr] gap-4">
                <div className="relative rounded-lg overflow-hidden border border-border bg-secondary aspect-square group">
                  {isReel ? (
                    videoUrl ? (
                      <video src={videoUrl} controls className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-1.5">
                        <Film className="h-7 w-7" />
                        <span className="text-[11px]">Upload a video</span>
                      </div>
                    )
                  ) : (
                    <>
                      <img src={image} alt="Post media" className="w-full h-full object-cover" />
                      <button onClick={() => setPickerOpen(true)} className="absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-background border border-border text-xs font-medium">
                          <Images className="h-3.5 w-3.5" /> Change
                        </span>
                      </button>
                    </>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Format</Label>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {(Object.entries(formatMeta) as [Format, typeof formatMeta[Format]][]).map(([k, m]) => {
                        const Icon = m.icon;
                        const active = format === k;
                        return (
                          <button key={k} onClick={() => setFormat(k)}
                            className={`flex flex-col items-center justify-center gap-1 rounded-md border px-2 py-2.5 text-xs transition-colors ${
                              active ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-secondary/60"
                            }`}>
                            <Icon className="h-4 w-4" />
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)} disabled={isReel} className="gap-1.5 text-xs">
                      <Images className="h-3.5 w-3.5" /> Gallery
                    </Button>
                    <label className="inline-flex items-center justify-center gap-1.5 text-xs cursor-pointer border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md h-9 px-3 font-medium">
                      <ImagePlus className="h-3.5 w-3.5" />
                      {isReel ? "Upload video" : isCarousel ? "Add images" : "Upload"}
                      <input
                        type="file"
                        accept={isReel ? "video/mp4,video/quicktime" : "image/*"}
                        multiple={isCarousel}
                        className="hidden"
                        onChange={onUpload}
                      />
                    </label>
                    <Button variant="outline" size="sm" onClick={() => navigate("/studio")} className="gap-1.5 text-xs">
                      <Sparkles className="h-3.5 w-3.5" /> Generate
                    </Button>
                  </div>
                  {isCarousel && (
                    <p className="text-[11px] text-muted-foreground">{mediaUrls.length}/10 slides · need at least 2</p>
                  )}
                  {isReel && (
                    <p className="text-[11px] text-muted-foreground">MP4, 9:16 vertical recommended. Max 60s for Reels.</p>
                  )}
                </div>
              </div>

              {isCarousel && mediaUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {mediaUrls.map((src, i) => (
                    <div key={`${src}-${i}`} className="relative aspect-square rounded-md overflow-hidden border border-border group">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <span className="absolute top-1 left-1 h-5 w-5 rounded-full bg-background/90 text-foreground text-[10px] font-semibold flex items-center justify-center">{i + 1}</span>
                      <button onClick={() => removeCarouselItem(i)} className="absolute top-1 right-1 h-5 w-5 rounded-full bg-background/90 text-destructive text-xs leading-none opacity-0 group-hover:opacity-100">×</button>
                    </div>
                  ))}
                </div>
              )}

              <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Images className="h-4 w-4" />
                      {isCarousel ? "Add to carousel" : "Pick from gallery"}
                    </DialogTitle>
                  </DialogHeader>
                  <GalleryPicker
                    items={[
                      ...gallery.map((g) => ({ src: g.src, label: g.label })),
                      ...Object.entries(productImages).filter(([k]) => k !== "ad").map(([k, src]) => ({ src: src as string, label: k })),
                    ]}
                    selected={image}
                    onPick={(src) => {
                      if (isCarousel) {
                        setMediaUrls(prev => prev.includes(src) ? prev : [...prev, src].slice(0, 10));
                        toast.success("Added to carousel");
                      } else {
                        setImage(src);
                        setPickerOpen(false);
                        toast.success("Image selected");
                      }
                    }}
                    onGenerate={() => { setPickerOpen(false); navigate("/studio"); }}
                  />
                </DialogContent>
              </Dialog>
            </SectionCard>

            {/* 2. Platforms */}
            <SectionCard step={2} title="Publish to" subtitle="Choose where this post should go.">
              <div className="grid sm:grid-cols-2 gap-2.5">
                <PlatformCard active={instagram} onChange={setInstagram} icon={<Instagram className="h-4 w-4" />} label="Instagram" sub="@maison.aurelia" />
                <PlatformCard active={facebook} onChange={setFacebook} icon={<Facebook className="h-4 w-4" />} label="Facebook" sub="Maison Aurelia Page" />
              </div>
            </SectionCard>

            {/* 3. Caption */}
            <SectionCard step={3} title="Caption"
              subtitle="Write once and sync, or customize per platform."
              right={
                <label className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer">
                  <Switch checked={syncCaptions} onCheckedChange={setSyncCaptions} />
                  Sync across platforms
                </label>
              }>
              <Tabs value={captionTab} onValueChange={(v) => setCaptionTab(v as "instagram" | "facebook")}>
                <TabsList className="h-9">
                  <TabsTrigger value="instagram" className="text-xs gap-1.5"><Instagram className="h-3.5 w-3.5" /> Instagram</TabsTrigger>
                  <TabsTrigger value="facebook" className="text-xs gap-1.5"><Facebook className="h-3.5 w-3.5" /> Facebook</TabsTrigger>
                </TabsList>
                <TabsContent value="instagram" className="mt-3 space-y-2">
                  <Textarea rows={6} value={igCaption} onChange={(e) => setIgCaption(e.target.value)} className="resize-none text-sm leading-relaxed" placeholder="Write something timeless…" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 ${igHashtagsOver ? "text-destructive" : ""}`}><Hash className="h-3 w-3" /> {igHashtags}/30</span>
                      <button className="inline-flex items-center gap-1 hover:text-primary"><Sparkles className="h-3 w-3" /> AI suggest</button>
                    </div>
                    <span className={`tabular-nums ${igOver ? "text-destructive" : ""}`}>{igCaption.length}/{IG_LIMIT}</span>
                  </div>
                </TabsContent>
                <TabsContent value="facebook" className="mt-3 space-y-2">
                  <Textarea rows={6} value={fbCaption} onChange={(e) => { setFbCaption(e.target.value); if (syncCaptions) setSyncCaptions(false); }} className="resize-none text-sm leading-relaxed" placeholder="Tell your audience…" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {syncCaptions ? <span>Synced from Instagram. Edit to override.</span> : <span />}
                    <span className={`tabular-nums ${fbOver ? "text-destructive" : ""}`}>{fbCaption.length.toLocaleString()}/{FB_LIMIT.toLocaleString()}</span>
                  </div>
                </TabsContent>
              </Tabs>
            </SectionCard>

            {/* 4. Advanced (collapsed) */}
            <SectionCard step={4} title="Advanced options" subtitle="Location, CTAs, collaborators — all optional.">
              <Accordion type="multiple" className="w-full">
                {instagram && (
                  <AccordionItem value="ig" className="border-border">
                    <AccordionTrigger className="text-sm hover:no-underline">
                      <span className="flex items-center gap-2"><Instagram className="h-3.5 w-3.5 text-pink-500" /> Instagram options</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-2">
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
                        <label className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                          <div>
                            <p className="text-xs font-medium">Share Reel to main feed</p>
                            <p className="text-[11px] text-muted-foreground">share_to_feed</p>
                          </div>
                          <Switch checked={igShareToFeed} onCheckedChange={setIgShareToFeed} />
                        </label>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )}
                {facebook && (
                  <AccordionItem value="fb" className="border-border">
                    <AccordionTrigger className="text-sm hover:no-underline">
                      <span className="flex items-center gap-2"><Facebook className="h-3.5 w-3.5 text-sky-600" /> Facebook options</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-2">
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
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </SectionCard>

            {/* 5. Schedule */}
            <SectionCard step={5} title="Publish or schedule"
              subtitle="Post immediately, or pick a future date & time."
              right={
                <label className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer">
                  <Switch checked={schedule} onCheckedChange={setSchedule} />
                  Schedule
                </label>
              }>
              {schedule ? (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date" icon={<CalendarIcon className="h-3 w-3" />}>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </Field>
                  <Field label="Time">
                    <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                  </Field>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Will publish immediately when you click <span className="text-foreground font-medium">Publish now</span>.</p>
              )}
            </SectionCard>
          </div>

          {/* RIGHT: sticky preview */}
          <aside className="lg:sticky lg:top-[88px] self-start space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Live preview</p>
              <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as "instagram" | "facebook")}>
                <TabsList className="h-8">
                  <TabsTrigger value="instagram" className="text-xs gap-1.5" disabled={!instagram}><Instagram className="h-3.5 w-3.5" /> IG</TabsTrigger>
                  <TabsTrigger value="facebook" className="text-xs gap-1.5" disabled={!facebook}><Facebook className="h-3.5 w-3.5" /> FB</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {previewTab === "instagram"
              ? <InstagramPreview image={image} caption={igCaption} location={igLocation} format={format} mediaUrls={mediaUrls} videoUrl={videoUrl} />
              : <FacebookPreview image={image} caption={fbCaption} cta={fbCta} link={fbLink} format={format} mediaUrls={mediaUrls} videoUrl={videoUrl} />}
            <p className="text-[10px] text-muted-foreground text-center">Approximate render. Final layout depends on the platform.</p>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}

function GalleryPicker({ items, selected, onPick, onGenerate }: {
  items: { src: string; label: string }[];
  selected: string;
  onPick: (src: string) => void;
  onGenerate: () => void;
}) {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center space-y-3">
        <Images className="h-10 w-10 mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No creatives yet. Generate your first image in the Studio.</p>
        <Button onClick={onGenerate} size="sm" className="gap-1.5"><Sparkles className="h-4 w-4" /> Open Studio</Button>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{items.length} creative{items.length !== 1 ? "s" : ""} available</p>
        <Button variant="ghost" size="sm" onClick={onGenerate} className="gap-1.5 text-xs"><Sparkles className="h-3.5 w-3.5" /> Generate new</Button>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto pr-1">
        {items.map((item, i) => {
          const active = item.src === selected;
          return (
            <button key={`${item.src}-${i}`} onClick={() => onPick(item.src)}
              className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                active ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-border"
              }`}>
              <img src={item.src} alt={item.label} className="w-full h-full object-cover" loading="lazy" />
              {active && (
                <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionCard({ step, title, subtitle, right, children }: {
  step: number; title: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">{step}</span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold leading-none">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
      {children}
    </Card>
  );
}

function PlatformCard({ active, onChange, icon, label, sub }: {
  active: boolean; onChange: (v: boolean) => void; icon: React.ReactNode; label: string; sub: string;
}) {
  return (
    <button onClick={() => onChange(!active)}
      className={`w-full flex items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-all ${
        active ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:bg-secondary/60"
      }`}>
      <div className={`h-9 w-9 rounded-md flex items-center justify-center ${active ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">{label}</p>
        <p className="text-[11px] text-muted-foreground truncate">{sub}</p>
      </div>
      {active ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <ChevronRight className="h-4 w-4 text-muted-foreground/60" />}
    </button>
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

function MediaBlock({ image, format, mediaUrls, videoUrl, aspect = "aspect-square" }: { image: string; format: Format; mediaUrls?: string[]; videoUrl?: string; aspect?: string }) {
  if (format === "reel") {
    return videoUrl
      ? <video src={videoUrl} controls className={`w-full ${aspect === "aspect-square" ? "aspect-[9/16]" : aspect} object-cover bg-black`} />
      : <div className={`w-full ${aspect} bg-secondary flex items-center justify-center text-muted-foreground`}><Film className="h-8 w-8" /></div>;
  }
  if (format === "carousel" && mediaUrls && mediaUrls.length > 0) {
    return (
      <div className={`relative w-full ${aspect} overflow-hidden bg-black`}>
        <div className="flex h-full w-full snap-x snap-mandatory overflow-x-auto">
          {mediaUrls.map((src, i) => (
            <img key={`${src}-${i}`} src={src} alt="" className="h-full w-full flex-shrink-0 snap-start object-cover" />
          ))}
        </div>
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-background/80 text-[10px] font-medium">1/{mediaUrls.length}</div>
      </div>
    );
  }
  return <img src={image} alt="" className={`w-full ${aspect} object-cover`} />;
}

function InstagramPreview({ image, caption, location, format, mediaUrls, videoUrl }: { image: string; caption: string; location?: string; format: Format; mediaUrls?: string[]; videoUrl?: string }) {
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
            <p className="text-[10px] uppercase text-muted-foreground tracking-wider">{link ? safeHost(link) : "your-link.com"}</p>
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

function safeHost(link: string) {
  try { return new URL(link.startsWith("http") ? link : `https://${link}`).hostname; }
  catch { return "your-link.com"; }
}
