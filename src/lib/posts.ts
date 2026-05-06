import { useEffect, useState, useCallback } from "react";
import { api, tryApi } from "@/lib/api";

export type PostStatus = "scheduled" | "draft" | "published" | "failed";
export type Platform = "instagram" | "facebook";
export type PostFormat = "single" | "carousel" | "reel" | "story";

export interface Post {
  id: string;
  title: string;
  captionIg: string;
  captionFb: string;
  mediaUrl: string;
  mediaUrls?: string[];
  format: PostFormat;
  platforms: Platform[];
  status: PostStatus;
  scheduledAt: string | null; // ISO
  publishedAt: string | null;
  lastError?: string | null;
  createdAt: string;
}

const KEY = "advora.posts";

function readLocal(): Post[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function writeLocal(items: Post[]) {
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, 500)));
  window.dispatchEvent(new Event("posts:update"));
}

function fromRow(r: any): Post {
  return {
    id: r.id,
    title: r.title || "Untitled post",
    captionIg: r.caption_ig ?? r.captionIg ?? "",
    captionFb: r.caption_fb ?? r.captionFb ?? "",
    mediaUrl: r.media_url ?? r.mediaUrl ?? "",
    format: (r.format || "single") as PostFormat,
    platforms: typeof r.platforms === "string"
      ? (r.platforms.split(",").filter(Boolean) as Platform[])
      : (r.platforms || []),
    status: (r.status || "draft") as PostStatus,
    scheduledAt: r.scheduled_at ?? r.scheduledAt ?? null,
    publishedAt: r.published_at ?? r.publishedAt ?? null,
    lastError: r.last_error ?? r.lastError ?? null,
    createdAt: r.created_at ?? r.createdAt ?? new Date().toISOString(),
  };
}

export type PostInput = {
  title: string;
  captionIg: string;
  captionFb: string;
  mediaUrl: string;
  format: PostFormat;
  platforms: Platform[];
  scheduledAt?: string | null;
  status?: PostStatus;
};

export async function createPost(input: PostInput): Promise<Post> {
  const id = crypto.randomUUID();
  const localPost: Post = {
    id,
    title: input.title,
    captionIg: input.captionIg,
    captionFb: input.captionFb,
    mediaUrl: input.mediaUrl,
    format: input.format,
    platforms: input.platforms,
    status: input.status || (input.scheduledAt ? "scheduled" : "draft"),
    scheduledAt: input.scheduledAt || null,
    publishedAt: null,
    createdAt: new Date().toISOString(),
  };
  writeLocal([localPost, ...readLocal()]);

  const r = await tryApi(() => api.post<{ id: string; status: PostStatus }>("/posts", {
    title: input.title,
    captionIg: input.captionIg,
    captionFb: input.captionFb,
    mediaUrl: input.mediaUrl,
    format: input.format,
    platforms: input.platforms.join(","),
    status: input.status,
    scheduledAt: input.scheduledAt,
  }));
  if (r?.id) {
    // Replace local id with server id
    const items = readLocal().map(p => p.id === id ? { ...p, id: r.id, status: r.status } : p);
    writeLocal(items);
    localPost.id = r.id;
  }
  return localPost;
}

export async function deletePost(id: string) {
  writeLocal(readLocal().filter(p => p.id !== id));
  await tryApi(() => api.del(`/posts/${id}`));
}

export async function updatePost(id: string, patch: Partial<PostInput> & { status?: PostStatus }) {
  writeLocal(readLocal().map(p => p.id === id ? { ...p, ...patch } as Post : p));
  await tryApi(() => api.patch(`/posts/${id}`, {
    ...patch,
    platforms: patch.platforms ? patch.platforms.join(",") : undefined,
  }));
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>(() => readLocal());

  const refresh = useCallback(async () => {
    const r = await tryApi(() => api.get<{ posts: any[] }>("/posts"));
    if (r?.posts) {
      const normalized = r.posts.map(fromRow);
      writeLocal(normalized);
      setPosts(normalized);
    }
  }, []);

  useEffect(() => {
    const update = () => setPosts(readLocal());
    window.addEventListener("posts:update", update);
    window.addEventListener("storage", update);
    refresh();
    return () => {
      window.removeEventListener("posts:update", update);
      window.removeEventListener("storage", update);
    };
  }, [refresh]);

  return { posts, refresh };
}
