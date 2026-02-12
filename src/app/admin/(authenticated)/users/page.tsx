import { getAdminUsersListAction } from "@/lib/actions/admin";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await getAdminUsersListAction();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-black">
          Utilisateurs
        </h1>
        <p className="text-black/40 text-sm font-medium mt-1">
          Liste complete des utilisateurs de la plateforme
        </p>
      </div>

      <AdminUsersTable users={users} />
    </div>
  );
}
