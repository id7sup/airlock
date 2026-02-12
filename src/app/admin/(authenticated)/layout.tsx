import { getAdminSession } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated } = await getAdminSession();

  if (!authenticated) {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen bg-[#f5f5f7]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-[#f5f5f7]/80 backdrop-blur-xl border-b border-black/[0.04] px-8 py-4">
          <h2 className="text-[13px] font-bold text-black/20 uppercase tracking-[0.15em]">
            Administration Airlock
          </h2>
        </div>
        <div className="p-6 sm:p-8 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
