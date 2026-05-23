import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma/client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Verificar se é admin no banco de dados
  const profile = await prisma.profile.findUnique({
    where: { supabaseId: user.id },
    select: { role: true },
  });

  if (profile?.role !== "ADMIN") {
    redirect("/"); // Redireciona para home se não for admin
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto md:ml-64">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
