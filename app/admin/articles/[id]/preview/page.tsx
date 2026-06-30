import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminArticlePreview } from "@/components/admin/AdminArticlePreview";
import { getAdminArticleById } from "@/lib/articles";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Article Preview",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminPreviewPage({ params }: Props) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) notFound();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") notFound();

  const { id } = await params;
  const article = await getAdminArticleById(id);
  if (!article) notFound();

  return <AdminArticlePreview article={article} />;
}
