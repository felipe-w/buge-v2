import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { auth } from "@/lib/auth";
import { getUserGroups } from "@/server/data/groups";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const navItems = [
  { label: "Home", url: "/dashboard" },
  { label: "Relatórios", url: "/reports" },
  { label: "Orçamentos", url: "/budgets" },
  { label: "Transações", url: "/transactions" },
  { label: "Extratos", url: "/statements" },
  { label: "Contas", url: "/accounts" },
  { label: "Categorias", url: "/categories" },
];

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const groups = await getUserGroups();

  return (
    <>
      <DashboardLayout navItems={navItems} logoUrl="/logo.svg" groups={groups} user={session.user}>
        {children}
      </DashboardLayout>
    </>
  );
}
