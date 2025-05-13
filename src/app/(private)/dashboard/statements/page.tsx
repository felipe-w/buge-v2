import { getGroupAccounts } from "@/server/data/accounts";
import { getGroupStatements } from "@/server/data/statements";
import { getCurrentUser } from "@/server/data/users";

import { Heading } from "@/components/layout/heading";
import CreateStatementDialog from "./_components/create-statement-dialog";
import ValidateStatementDialog from "./_components/validate-statement-dialog";

export default async function StatementsPage() {
  const { selectedGroupId: groupId } = await getCurrentUser();
  const accounts = await getGroupAccounts({ groupId: groupId! });
  const statements = await getGroupStatements({ groupId: groupId! });

  return (
    <div className="space-y-6">
      <Heading title="Extratos" actions={<CreateStatementDialog accounts={accounts} groupId={groupId!} />} />
      {statements.map((statement) => (
        <div key={statement.id}>
          <p>
            {statement.createdAt?.toLocaleDateString()} - {statement.status} - {statement.account.name}
            <br />
            <ValidateStatementDialog statement={statement} />
          </p>
        </div>
      ))}
    </div>
  );
}
