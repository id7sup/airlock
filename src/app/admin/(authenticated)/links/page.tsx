import { getAdminAllLinksAction } from "@/lib/actions/admin";
import { AdminAllLinksTable } from "@/components/admin/AdminAllLinksTable";

export const dynamic = "force-dynamic";

export default async function AdminLinksPage() {
  const links = await getAdminAllLinksAction();

  const activeCount = links.filter((l) => l.isActive).length;
  const revokedCount = links.filter((l) => l.isRevoked).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-black">
          Liens de partage
        </h1>
        <p className="text-black/40 text-sm font-medium mt-1">
          {links.length} liens au total &middot; {activeCount} actifs &middot; {revokedCount} revoques
        </p>
      </div>

      <AdminAllLinksTable links={links} />
    </div>
  );
}
