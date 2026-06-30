import { cache } from "react";
import { demoArticles } from "@/lib/demo-data";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Article } from "@/lib/types";

function normalizeArticle(row: unknown): Article {
  const article = row as Article;
  return {
    ...article,
    tags: article.tags ?? [],
    content_blocks: article.content_blocks ?? [],
    read_time_minutes: article.read_time_minutes ?? 1
  };
}

export const getPublishedArticles = cache(async (): Promise<Article[]> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return demoArticles;

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false });

  if (error || !data) return demoArticles;
  return data.map(normalizeArticle);
});

export const getArticleBySlug = cache(async (slug: string): Promise<Article | null> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return demoArticles.find((article) => article.slug === slug) ?? null;

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) return demoArticles.find((article) => article.slug === slug) ?? null;
  return normalizeArticle(data);
});

export async function getAdminArticleById(id: string): Promise<Article | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("articles").select("*").eq("id", id).single();
  if (error || !data) return null;
  return normalizeArticle(data);
}
