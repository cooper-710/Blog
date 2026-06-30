import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getAdminAccessSecret } from "@/lib/admin-gate";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isSupabaseConfigured } from "@/lib/utils";
import type { Article } from "@/lib/types";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminPage() {
  if (!isSupabaseConfigured() || !getAdminAccessSecret()) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase!.auth.getUser();

  if (!user) {
    return (
      <main className="editorial-container py-16">
        <AdminLogin />
      </main>
    );
  }

  const { data: profile } = await supabase!.from("profiles").select("*").eq("id", user.id).single();

  if (profile?.role !== "admin") {
    notFound();
  }

  const { data } = await supabase!
    .from("articles")
    .select("*")
    .order("updated_at", { ascending: false });

  return <AdminDashboard initialArticles={(data ?? []) as Article[]} email={user.email ?? "admin"} />;
}
