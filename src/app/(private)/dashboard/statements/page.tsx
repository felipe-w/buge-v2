import Link from "next/link";

import { getGroupAccounts } from "@/server/data/accounts";
import { getGroupStatements } from "@/server/data/statements";
import { getCurrentUser } from "@/server/data/users";

import { Heading } from "@/components/layout/heading";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import CreateStatementDialog from "./_components/create-statement-dialog";
import DeleteStatementButton from "./_components/delete-statement-button";
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
          <div className="flex items-center justify-between">
            <p>
              {statement.createdAt?.toLocaleDateString()} - {statement.status} - {statement.account.name}
            </p>
            <div className="flex items-center gap-2">
              {statement.status == "reviewing" && (
                <Link href={`/dashboard/statements/${statement.id}`}>
                  <Button variant="outline" size="icon">
                    <Eye size={16} />
                  </Button>
                </Link>
              )}
              {statement.status == "validating" && <ValidateStatementDialog statement={statement} />}
              {statement.status != "completed" && statement.status != "reviewing" && (
                <DeleteStatementButton statementId={statement.id} />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
