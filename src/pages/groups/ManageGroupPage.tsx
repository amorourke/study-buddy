import { Form, useActionData, useLoaderData } from "react-router";
import { PageHeader } from "../../components/PageHeader.tsx";
import { Button, ButtonLink } from "../../components/ui/Button.tsx";
import { Card } from "../../components/ui/Card.tsx";
import { FormError } from "../../components/ui/FormError.tsx";
import { SelectField } from "../../components/ui/SelectField.tsx";
import { SubmitButton } from "../../components/ui/SubmitButton.tsx";
import { Table, Td } from "../../components/ui/Table.tsx";
import { TextField } from "../../components/ui/TextField.tsx";
import { fieldError, type FormResult } from "../../lib/forms.ts";
import type { ManageGroupData } from "./groups.data.ts";

export function ManageGroupPage() {
  const { group, topics } = useLoaderData<ManageGroupData>();
  const result = useActionData<FormResult | null>() ?? undefined;

  return (
    <>
      <PageHeader title={`Manage ${group.name}`} />
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Details</h2>
          <Card>
            <Form method="post" noValidate className="space-y-5">
              <FormError message={result?.message} />
              <TextField
                label="Group name"
                name="name"
                maxLength={30}
                defaultValue={group.name}
                error={fieldError(result, "name")}
              />
              <SelectField
                label="Topic"
                name="topicId"
                defaultValue={group.topic.id}
                options={topics.map((topic) => ({ value: topic.id, label: topic.name }))}
                error={fieldError(result, "topicId")}
              />
              <div className="flex gap-3">
                <SubmitButton>Save changes</SubmitButton>
                <ButtonLink to="/groups" variant="secondary">
                  Back to groups
                </ButtonLink>
              </div>
            </Form>
          </Card>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Members</h2>
          <Table headers={["Student", ""]}>
            {group.members.map((member) => (
              <tr key={member.id}>
                <Td className="font-medium text-slate-900">{member.username}</Td>
                <Td className="text-right">
                  {member.id === group.leader.id ? (
                    <span className="text-xs font-medium text-indigo-600">Leader</span>
                  ) : (
                    <Form method="post">
                      <input type="hidden" name="intent" value="remove" />
                      <input type="hidden" name="studentId" value={member.id} />
                      <Button type="submit" variant="danger" size="sm">
                        Remove
                      </Button>
                    </Form>
                  )}
                </Td>
              </tr>
            ))}
          </Table>
        </section>
      </div>
    </>
  );
}
