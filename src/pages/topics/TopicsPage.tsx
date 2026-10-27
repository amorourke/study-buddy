import { useLoaderData } from "react-router";
import type { Topic } from "../../../shared/types.ts";
import { PageHeader } from "../../components/PageHeader.tsx";
import { ButtonLink } from "../../components/ui/Button.tsx";
import { EmptyState } from "../../components/ui/EmptyState.tsx";
import { Table, Td } from "../../components/ui/Table.tsx";

export function TopicsPage() {
  const topics = useLoaderData<Topic[]>();
  const addButton = <ButtonLink to="/topics/new">Add topic</ButtonLink>;

  return (
    <>
      <PageHeader title="Topics" description="Subjects that study groups can be created for." action={addButton} />
      {topics.length === 0 ? (
        <EmptyState message="No topics yet." action={addButton} />
      ) : (
        <Table headers={["Topic name", ""]}>
          {topics.map((topic) => (
            <tr key={topic.id}>
              <Td className="font-medium text-slate-900">{topic.name}</Td>
              <Td className="text-right">
                <ButtonLink to={`/topics/${topic.id}/edit`} variant="secondary" size="sm">
                  Edit
                </ButtonLink>
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
