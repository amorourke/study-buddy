import { useState } from "react";
import { Link, useFetcher } from "react-router";
import type { Group } from "../../../shared/types.ts";
import { Button, ButtonLink } from "../../components/ui/Button.tsx";
import { Td } from "../../components/ui/Table.tsx";
import { isMemberOf } from "./groups.data.ts";

interface GroupRowProps {
  group: Group;
  userId: number;
}

export function GroupRow({ group, userId }: GroupRowProps) {
  const fetcher = useFetcher();
  const [showMembers, setShowMembers] = useState(false);
  const isLeader = group.leader.id === userId;
  const isMember = isMemberOf(group, userId);
  const membersId = `group-${group.id}-members`;

  return (
    <>
      <tr>
        <Td className="font-medium text-slate-900">
          {isMember ? (
            <Link to={`/groups/${group.id}`} className="hover:text-indigo-600">
              {group.name}
            </Link>
          ) : (
            group.name
          )}
        </Td>
        <Td>{group.topic.name}</Td>
        <Td>{group.leader.username}</Td>
        <Td>
          <button
            type="button"
            className="font-medium text-indigo-600 hover:text-indigo-500"
            aria-expanded={showMembers}
            aria-controls={membersId}
            onClick={() => setShowMembers((shown) => !shown)}
          >
            {group.members.length} {group.members.length === 1 ? "member" : "members"}
          </button>
        </Td>
        <Td>
          <div className="flex justify-end gap-2 whitespace-nowrap">
            {!isMember && (
              <fetcher.Form method="post">
                <input type="hidden" name="groupId" value={group.id} />
                <input type="hidden" name="groupName" value={group.name} />
                <Button type="submit" size="sm" disabled={fetcher.state !== "idle"}>
                  {fetcher.state === "idle" ? "Join" : "Joining…"}
                </Button>
              </fetcher.Form>
            )}
            {isMember && (
              <ButtonLink to={`/groups/${group.id}/bookings`} variant="secondary" size="sm">
                Bookings
              </ButtonLink>
            )}
            {isLeader && (
              <ButtonLink to={`/groups/${group.id}/manage`} variant="secondary" size="sm">
                Manage
              </ButtonLink>
            )}
          </div>
        </Td>
      </tr>
      {showMembers && (
        <tr id={membersId} className="bg-slate-50">
          <Td colSpan={5}>
            <ul className="flex flex-wrap gap-2">
              {group.members.map((member) => (
                <li key={member.id} className="rounded-full bg-white px-3 py-1 text-xs ring-1 ring-slate-200">
                  {member.username}
                  {member.id === group.leader.id && <span className="ml-1 text-indigo-600">(leader)</span>}
                </li>
              ))}
            </ul>
          </Td>
        </tr>
      )}
    </>
  );
}
