import { db } from "@/lib/firebase";
import { auth } from "@clerk/nextjs/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/dashboard/SidebarProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let storageUsed = 0;

  try {
    const workspaceSnapshot = await db.collection("workspaces")
      .where("memberIds", "array-contains", userId)
      .limit(1)
      .get();
      
    if (!workspaceSnapshot.empty) {
      storageUsed = workspaceSnapshot.docs[0].data().totalStorageUsed || 0;
    }
  } catch (error: any) {
    console.error("Firestore Quota Error in Layout:", error.message);
    // On continue avec storageUsed = 0 pour éviter de bloquer toute l'interface
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-[#fbfbfd]">
        <Sidebar storageUsed={storageUsed} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:ml-0">
          <TopBar />
          <main className="flex-1 overflow-y-auto bg-white/50 backdrop-blur-3xl">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
