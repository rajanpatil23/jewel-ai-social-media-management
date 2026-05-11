import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Images, Sparkles, Send, Download, Trash2, Loader2 } from "lucide-react";
import { useGallery } from "@/lib/gallery";
import { api, tryApi } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type DbItem = { id?: string; src: string; label: string; createdAt: number };

export default function Gallery() {
  const items = useGallery() as DbItem[];
  const navigate = useNavigate();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [removing, setRemoving] = useState<string | null>(null);

  const visible = items.filter((i) => !hidden.has(i.src));

  const useForPost = (src: string) => {
    sessionStorage.setItem("postImage", src);
    navigate("/post");
  };

  const remove = async (it: DbItem) => {
    if (!it.id) {
      // local-only entry — just hide
      setHidden((s) => new Set(s).add(it.src));
      return;
    }
    setRemoving(it.id);
    const r = await tryApi(() => api.del(`/gallery/${it.id}`));
    if (r !== null) {
      setHidden((s) => new Set(s).add(it.src));
      toast.success("Removed from gallery");
    } else {
      toast.error("Could not remove (backend unreachable)");
    }
    setRemoving(null);
  };

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Your Gallery"
        title="All Your AI Creatives"
        description="Every image you've generated, saved against your account."
      />

      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">
          {visible.length} creative{visible.length !== 1 ? "s" : ""} in your library
        </p>
        <Button variant="gold" size="sm" onClick={() => navigate("/")} className="gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Generate new
        </Button>
      </div>

      {visible.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Images className="h-10 w-10 mx-auto text-muted-foreground/60 mb-3" />
          <h3 className="font-medium">Nothing here yet</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Generate your first creative in the Studio to start your gallery.
          </p>
          <Button onClick={() => navigate("/")} variant="gold" size="sm" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Open Studio
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {visible.map((it, i) => (
            <Card
              key={`${it.src}-${i}`}
              className="group relative overflow-hidden rounded-xl border-border/70 hover:shadow-[var(--shadow-gold)] transition-all"
            >
              <img
                src={it.src}
                alt={it.label}
                loading="lazy"
                className="aspect-square w-full object-cover bg-secondary/40"
                onError={(e) => {
                  // Hide unrenderable entries (broken URLs, expired data URIs, preview-mode samples)
                  setHidden((s) => new Set(s).add(it.src));
                  (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                }}
              />
              <div className="absolute top-2 left-2">
                <Badge className="bg-black/60 text-white border-0 backdrop-blur text-[10px] font-normal">
                  {new Date(it.createdAt).toLocaleDateString()}
                </Badge>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[11px] line-clamp-1 mb-1.5 opacity-90">{it.label}</p>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="gold"
                    className="rounded-md h-7 px-2 text-xs flex-1"
                    onClick={() => useForPost(it.src)}
                  >
                    <Send className="h-3 w-3 mr-1" /> Use
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-md h-7 px-2 text-xs"
                    onClick={() => window.open(it.src, "_blank")}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-md h-7 px-2 text-xs text-destructive"
                    onClick={() => remove(it)}
                    disabled={removing === it.id}
                  >
                    {removing === it.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
