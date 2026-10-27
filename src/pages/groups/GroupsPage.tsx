import { useLoaderData } from "react-router";
import type { Group } from "../../../shared/types.ts";
import { PageHeader } from "../../components/PageHeader.tsx";
import { ButtonLink } from "../../components/ui/Button.tsx";
import { EmptyState } from "../../components/ui/EmptyState.tsx";
import { Table } from "../../components/ui/Table.tsx";
import { useUser } from "../../lib/auth.ts";
import { GroupRow } from "./GroupRow.tsx";

export function GroupsPage() {
  const groups = useLoaderData<Group[]>();
  const user = useUser();
  const createButton = <ButtonLink to="/groups/new">Create group</ButtonLink>;

  return (
    <>
      <PageHeader title="Study groups" description="Join a group or manage the ones you lead." action={createButton} />
      {groups.length === 0 || !user ? (
        <EmptyState message="No study groups yet." action={createButton} />
      ) : (
        <Table headers={["Group", "Topic", "Leader", "Members", ""]}>
          {groups.map((group) => (
            <GroupRow key={group.id} group={group} userId={user.id} />
          ))}
        </Table>
      )}
    </>
  );
}
