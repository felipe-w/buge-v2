import { AccountWithTransactions } from "@/lib/types";
import { getGroupAccounts } from "@/server/data/accounts";
import DeleteAccountDialog from "./delete-account-dialog";
import EditAccountDialog from "./edit-account-dialog";

export async function AccountActions({ account }: { account: AccountWithTransactions }) {
  const groupAccounts = await getGroupAccounts({ groupId: account.groupId });

  return (
    <div className="flex items-center gap-2">
      {/* <ReconcileAccountDialog account={account} /> */}
      <EditAccountDialog account={account} />
      <DeleteAccountDialog account={account} accounts={groupAccounts} />
    </div>
  );
}
