export type ArticleCategory =
  | "Pitching"
  | "Hitting"
  | "Biomechanics"
  | "Training"
  | "Technology"
  | "Case Studies";

export type ArticleStatus = "draft" | "published";

export type MediaItem = {
  url: string;
  alt?: string;
  caption?: string;
};

export type StatItem = {
  label: string;
  value: string;
  context?: string;
};

export type ReferenceItem = {
  label: string;
  url: string;
};

export type ArticleBlockSettings = {
  width?: "narrow" | "standard" | "wide" | "full";
  spacing?: "tight" | "normal" | "airy";
  align?: "left" | "center";
  background?: "none" | "sand" | "outlined" | "dark";
  layout?: "single" | "image-left" | "text-left" | "stacked";
};

export type ArticleBlock = (
  | { id: string; type: "heading"; level?: 2 | 3; text: string }
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "rich_text"; html: string }
  | ({ id: string; type: "image" } & MediaItem)
  | { id: string; type: "image_pair"; images: [MediaItem, MediaItem] }
  | { id: string; type: "video_embed"; url: string; title?: string; caption?: string }
  | { id: string; type: "pull_quote"; quote: string; attribution?: string }
  | { id: string; type: "key_takeaway"; title?: string; body: string }
  | { id: string; type: "data_callout"; eyebrow?: string; title: string; body: string; stats?: StatItem[] }
  | { id: string; type: "stat_grid"; stats: StatItem[] }
  | { id: string; type: "two_column"; left: ArticleBlock[]; right: ArticleBlock[] }
  | { id: string; type: "numbered_list"; items: string[] }
  | { id: string; type: "bullet_list"; items: string[] }
  | { id: string; type: "biomech_note"; title?: string; body: string }
  | { id: string; type: "cta_box"; title: string; body: string; href: string; label: string }
  | { id: string; type: "references"; items: ReferenceItem[] }
) & {
  settings?: ArticleBlockSettings;
};

export type Article = {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  excerpt: string | null;
  category: ArticleCategory;
  tags: string[];
  author_name: string;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  status: ArticleStatus;
  featured: boolean;
  read_time_minutes: number;
  seo_title: string | null;
  seo_description: string | null;
  content_blocks: ArticleBlock[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ArticleInput = Omit<Article, "id" | "created_at" | "updated_at"> & {
  id?: string;
};

export type Profile = {
  id: string;
  email: string | null;
  role: "admin" | "viewer";
  created_at: string;
};
