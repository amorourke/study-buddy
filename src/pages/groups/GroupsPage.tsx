import { useLoaderData, useSearchParams } from "react-router";
import type { Group } from "../../../shared/types.ts";
import { PageHeader } from "../../components/PageHeader.tsx";
import { ButtonLink } from "../../components/ui/Button.tsx";
import { EmptyState } from "../../components/ui/EmptyState.tsx";
import { Table } from "../../components/ui/Table.tsx";
import { useUser } from "../../lib/auth.ts";
import { isMemberOf } from "./groups.data.ts";
import { GroupRow } from "./GroupRow.tsx";

export function GroupsPage() {
  const groups = useLoaderData<Group[]>();
  const user = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const mineOnly = searchParams.has("mine");
  const createButton = <ButtonLink to="/groups/new">Create group</ButtonLink>;

  const visibleGroups = mineOnly && user ? groups.filter((group) => isMemberOf(group, user.id)) : groups;

  function toggleMineOnly(checked: boolean) {
    setSearchParams(checked ? { mine: "1" } : {}, { replace: true });
  }

  return (
    <>
      <PageHeader title="Study groups" description="Join a group or manage the ones you lead." action={createButton} />
      <label className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          checked={mineOnly}
          onChange={(event) => toggleMineOnly(event.target.checked)}
        />
        My groups only
      </label>
      {visibleGroups.length === 0 || !user ? (
        <EmptyState
          message={mineOnly ? "You haven't joined any groups yet." : "No study groups yet."}
          action={createButton}
        />
      ) : (
        <Table headers={["Group", "Topic", "Leader", "Members", ""]}>
          {visibleGroups.map((group) => (
            <GroupRow key={group.id} group={group} userId={user.id} />
          ))}
        </Table>
      )}
    </>
  );
}
