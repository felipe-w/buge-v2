import { getGroupAccounts } from "@/server/data/accounts";
import { getCurrentUser } from "@/server/data/users";

import EmptySection from "@/components/layout/empty-section";
import { Heading } from "@/components/layout/heading";
import SuccessToast from "@/components/success-toast";
import { AccountCards } from "./_components/accounts-card";
import { CreateAccountDialog } from "./_components/create-account-dialog";

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; message?: string }>;
}) {
  const { selectedGroupId: groupId } = await getCurrentUser();
  const accounts = await getGroupAccounts(groupId!);

  const { success, message } = await searchParams;
  const successToast = success ? true : false;

  return (
    <div className="space-y-6">
      <SuccessToast success={successToast} message={message || ""} />
      <Heading title="Contas" actions={<CreateAccountDialog groupId={groupId!} />} />

      {accounts.length === 0 ? (
        <EmptySection
          title="Nenhuma conta encontrada"
          description="Crie sua primeira conta para começar a gerenciar suas finanças."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCards key={account.id} account={account} />
          ))}
        </div>
      )}
    </div>
  );
}
