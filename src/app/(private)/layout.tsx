import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getUserGroups } from "@/server/data/groups";
import { getUserByEmail } from "@/server/data/users";
import { auth } from "@/lib/auth";
import { User } from "@/lib/db/types";

import { DashboardLayout } from "@/components/layout/dashboard-layout";

const navItems = [
  { label: "Home", url: "/dashboard" },
  { label: "Relatórios", url: "/dashboard/reports" },
  { label: "Orçamentos", url: "/dashboard/budgets" },
  { label: "Transações", url: "/dashboard/transactions" },
  { label: "Extratos", url: "/dashboard/statements" },
  { label: "Contas", url: "/dashboard/accounts" },
  { label: "Categorias", url: "/dashboard/categories" },
];

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  let user: User | undefined;
  if (!session.user.selectedGroupId) {
    user = await getUserByEmail({ email: session.user.email });
  }

  const userGroups = await getUserGroups({ userId: session.user.id });

  return (
    <>
      <DashboardLayout navItems={navItems} logoUrl="/logo.svg" groups={userGroups} user={user ?? session.user}>
        {children}
      </DashboardLayout>
    </>
  );
}
