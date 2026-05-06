import ringImg from "@/assets/product-ring.jpg";
import necklaceImg from "@/assets/product-necklace.jpg";
import earringsImg from "@/assets/product-earrings.jpg";
import braceletImg from "@/assets/product-bracelet.jpg";
import adImg from "@/assets/ad-creative.jpg";

export const productImages = { ring: ringImg, necklace: necklaceImg, earrings: earringsImg, bracelet: braceletImg, ad: adImg };

export const kpis = [
  { label: "Reach Increase", value: "4.2×", delta: "+312%", hint: "vs. last quarter" },
  { label: "Time Saved", value: "80%", delta: "−32 hrs/wk", hint: "automated workflow" },
  { label: "Engagement Growth", value: "40%", delta: "+12.4%", hint: "30-day average" },
  { label: "Manual Dependency", value: "0", delta: "Fully autonomous", hint: "AI-driven" },
];

export const recentPosts = [
  { id: 1, title: "Bridal Solitaire Reveal", platform: "Instagram", img: "ring", likes: 12483, comments: 642, status: "Published" },
  { id: 2, title: "Royal Heritage Necklace", platform: "Facebook", img: "necklace", likes: 8210, comments: 318, status: "Published" },
  { id: 3, title: "Diamond Drop Earrings", platform: "Instagram", img: "earrings", likes: 15920, comments: 884, status: "Published" },
  { id: 4, title: "Bangle Bar Festival Edit", platform: "Both", img: "bracelet", likes: 6820, comments: 211, status: "Published" },
];

export const scheduledPosts = [
  { id: 1, title: "Diwali Gold Edit", date: "2026-05-08", time: "19:00", platform: "Instagram", img: "necklace", type: "Campaign" },
  { id: 2, title: "Bridal Sneak Peek", date: "2026-05-10", time: "11:00", platform: "Both", img: "ring", type: "Campaign" },
  { id: 3, title: "Earring Tuesday", date: "2026-05-12", time: "17:30", platform: "Facebook", img: "earrings", type: "Post" },
  { id: 4, title: "Heritage Story", date: "2026-05-15", time: "20:00", platform: "Instagram", img: "bracelet", type: "Post" },
  { id: 5, title: "Weekend Sale", date: "2026-05-17", time: "09:00", platform: "Both", img: "ring", type: "Draft" },
  { id: 6, title: "Anniversary Capsule", date: "2026-05-22", time: "18:00", platform: "Instagram", img: "necklace", type: "Campaign" },
];

export const campaigns = [
  { id: 1, name: "Bridal Collection Launch", status: "Active", posts: 14, engagement: "8.4%", reach: "412K", dates: "May 1 — May 30", img: "ring", color: "from-primary/30 to-transparent" },
  { id: 2, name: "Festive Gold Campaign", status: "Scheduled", posts: 22, engagement: "—", reach: "—", dates: "Jun 5 — Jun 25", img: "bracelet", color: "from-amber-400/20 to-transparent" },
  { id: 3, name: "Diamond Ring Showcase", status: "Active", posts: 9, engagement: "11.2%", reach: "284K", dates: "Apr 20 — May 20", img: "ring", color: "from-yellow-300/20 to-transparent" },
  { id: 4, name: "New Arrival Promotion", status: "Draft", posts: 6, engagement: "—", reach: "—", dates: "TBD", img: "earrings", color: "from-primary/20 to-transparent" },
];

export const reachData = [
  { name: "Mon", reach: 18400, impressions: 32000, engagement: 1240 },
  { name: "Tue", reach: 21200, impressions: 38500, engagement: 1980 },
  { name: "Wed", reach: 19800, impressions: 35400, engagement: 1620 },
  { name: "Thu", reach: 28600, impressions: 49200, engagement: 2840 },
  { name: "Fri", reach: 34100, impressions: 58400, engagement: 3520 },
  { name: "Sat", reach: 41800, impressions: 71200, engagement: 4680 },
  { name: "Sun", reach: 38900, impressions: 64800, engagement: 4120 },
];

export const followerData = [
  { name: "W1", value: 12400 },
  { name: "W2", value: 13150 },
  { name: "W3", value: 14080 },
  { name: "W4", value: 15240 },
  { name: "W5", value: 16980 },
  { name: "W6", value: 18420 },
  { name: "W7", value: 20110 },
  { name: "W8", value: 22340 },
];

export const engagementBreakdown = [
  { name: "Likes", value: 48200 },
  { name: "Comments", value: 6420 },
  { name: "Shares", value: 3180 },
  { name: "Saves", value: 9740 },
];

export const aiRecommendations = [
  { title: "Post more bridal jewelry this week", detail: "Bridal posts are driving 2.1× engagement vs. catalog content.", priority: "High" },
  { title: "Gold necklaces perform best at 7 PM", detail: "Schedule the next 3 necklace reveals between 6:45–7:15 PM IST.", priority: "Medium" },
  { title: "Use luxury & wedding hashtags", detail: "Add #BridalLuxe #HeritageGold #DiamondReverie to lift reach 18%.", priority: "Medium" },
  { title: "Test reels with story-led captions", detail: "Reels with first-person captions are converting 34% better.", priority: "High" },
];

export const tones = ["Luxury", "Wedding", "Festive", "Minimal", "Premium Sale"] as const;
export const productTypes = ["Ring", "Necklace", "Bracelet", "Earrings", "Collection"] as const;
