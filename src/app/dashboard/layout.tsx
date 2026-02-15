import { db } from "@/lib/firebase";
import { auth } from "@clerk/nextjs/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/dashboard/SidebarProvider";
import { MainContent } from "@/components/dashboard/MainContent";
import { ClerkProvider } from "@clerk/nextjs";
import { UploadProvider } from "@/components/dashboard/UploadProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

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
    <ClerkProvider>
      <SidebarProvider>
        <UploadProvider>
          <div className="flex h-screen bg-[#fbfbfd]">
            <Sidebar storageUsed={storageUsed} />
            <MainContent>
              <TopBar storageUsed={storageUsed} />
              <main className="flex-1 overflow-y-auto overflow-x-hidden bg-white/50 backdrop-blur-3xl">
                {children}
              </main>
            </MainContent>
          </div>
        </UploadProvider>
      </SidebarProvider>
    </ClerkProvider>
  );
}
