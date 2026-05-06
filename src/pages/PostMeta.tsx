import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Instagram, Facebook, Loader2, CheckCircle2, ImagePlus, Send } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import hero from "@/assets/hero-jewelry.jpg";

export default function PostMeta() {
  const [image, setImage] = useState<string>(hero);
  const [caption, setCaption] = useState(
    "Timeless brilliance, crafted for you. ✨\n\nDiscover our newest collection.\n\n#luxuryjewelry #handcrafted #finejewelry"
  );
  const [instagram, setInstagram] = useState(true);
  const [facebook, setFacebook] = useState(true);
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    const img = sessionStorage.getItem("postImage");
    const cap = sessionStorage.getItem("postCaption");
    if (img) setImage(img);
    if (cap) setCaption((c) => cap + "\n\n" + c.split("\n\n").slice(-1)[0]);
    sessionStorage.removeItem("postImage");
    sessionStorage.removeItem("postCaption");
  }, []);

  const handlePost = () => {
    if (!instagram && !facebook) {
      toast.error("Select at least one platform");
      return;
    }
    setPosting(true);
    setPosted(false);
    setTimeout(() => {
      setPosting(false);
      setPosted(true);
      const where = [instagram && "Instagram", facebook && "Facebook"].filter(Boolean).join(" & ");
      toast.success(`Posted to ${where}`);
    }, 1600);
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Post to Meta</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Publish to Instagram and Facebook with a single click.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Editor */}
          <Card className="p-5 space-y-5">
            <div className="space-y-2">
              <Label>Image</Label>
              <div className="relative rounded-lg overflow-hidden border border-border bg-secondary">
                <img src={image} alt="Post" className="w-full aspect-square object-cover" />
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                <ImagePlus className="h-4 w-4" />
                <span>Replace image</span>
                <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea id="caption" rows={6} value={caption} onChange={(e) => setCaption(e.target.value)} />
              <p className="text-xs text-muted-foreground">{caption.length} characters</p>
            </div>

            <div className="space-y-3">
              <Label>Platforms</Label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    instagram ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <Checkbox checked={instagram} onCheckedChange={(v) => setInstagram(!!v)} />
                  <Instagram className="h-4 w-4" />
                  <span className="text-sm font-medium">Instagram</span>
                </label>
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    facebook ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <Checkbox checked={facebook} onCheckedChange={(v) => setFacebook(!!v)} />
                  <Facebook className="h-4 w-4" />
                  <span className="text-sm font-medium">Facebook</span>
                </label>
              </div>
            </div>

            <Button onClick={handlePost} disabled={posting} className="w-full" size="lg">
              {posting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Publishing…</>
              ) : posted ? (
                <><CheckCircle2 className="h-4 w-4 mr-2" /> Posted — Publish again</>
              ) : (
                <><Send className="h-4 w-4 mr-2" /> Post Now</>
              )}
            </Button>
          </Card>

          {/* Previews */}
          <div className="space-y-4">
            {instagram && <PreviewCard platform="instagram" image={image} caption={caption} />}
            {facebook && <PreviewCard platform="facebook" image={image} caption={caption} />}
            {!instagram && !facebook && (
              <Card className="p-8 text-center text-sm text-muted-foreground">
                Select a platform to see a live preview.
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function PreviewCard({ platform, image, caption }: { platform: "instagram" | "facebook"; image: string; caption: string }) {
  const isIG = platform === "instagram";
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 p-3 border-b border-border">
        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
          {isIG ? <Instagram className="h-4 w-4" /> : <Facebook className="h-4 w-4" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium leading-none">maison.aurelia</p>
          <p className="text-xs text-muted-foreground mt-0.5">{isIG ? "Instagram" : "Facebook"} preview</p>
        </div>
      </div>
      {!isIG && (
        <p className="px-3 pt-3 text-sm whitespace-pre-line line-clamp-3">{caption}</p>
      )}
      <img src={image} alt="" className="w-full aspect-square object-cover" />
      {isIG && (
        <div className="p-3">
          <p className="text-sm whitespace-pre-line line-clamp-4">
            <span className="font-medium">maison.aurelia </span>
            {caption}
          </p>
        </div>
      )}
    </Card>
  );
}
