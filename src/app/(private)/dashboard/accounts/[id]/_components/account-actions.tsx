import { getGroupAccounts } from "@/server/data/accounts";
import { AccountWithTransactions } from "@/lib/db/types";

import DeleteAccountDialog from "./delete-account-dialog";
import EditAccountDialog from "./edit-account-dialog";

export async function AccountActions({ account }: { account: AccountWithTransactions }) {
  const groupAccounts = await getGroupAccounts({ groupId: account.groupId });

  return (
    <div className="divide-muted-foreground/20 inline-flex divide-x rounded-md shadow-xs rtl:space-x-reverse">
      {/* <ReconcileAccountDialog account={account} /> */}
      <EditAccountDialog account={account} />
      <DeleteAccountDialog account={account} accounts={groupAccounts} />
    </div>
  );
}
