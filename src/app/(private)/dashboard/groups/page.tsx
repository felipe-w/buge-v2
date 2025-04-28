import { Heading } from "@/components/layout/heading";
import { getUserGroups } from "@/server/data/groups";
import { getCurrentUser } from "@/server/data/users";
import { CreateGroupDialog } from "./_components/create-group-dialog";
import GroupsCard from "./_components/groups-card";

export default async function GroupsPage() {
  const groups = await getUserGroups();
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <Heading title="Grupos" actions={<CreateGroupDialog userId={user.id} />} />
      {groups.map((group) => (
        <GroupsCard key={group.id} group={group} userId={user.id} />
      ))}
    </div>
  );
}
