import { Form, useActionData, useLoaderData } from "react-router";
import type { Topic } from "../../../shared/types.ts";
import { PageHeader } from "../../components/PageHeader.tsx";
import { ButtonLink } from "../../components/ui/Button.tsx";
import { Card } from "../../components/ui/Card.tsx";
import { FormError } from "../../components/ui/FormError.tsx";
import { SelectField } from "../../components/ui/SelectField.tsx";
import { SubmitButton } from "../../components/ui/SubmitButton.tsx";
import { TextField } from "../../components/ui/TextField.tsx";
import { fieldError, type FormResult } from "../../lib/forms.ts";

export function AddGroupPage() {
  const topics = useLoaderData<Topic[]>();
  const result = useActionData<FormResult>();

  return (
    <>
      <PageHeader title="Create a group" description="You'll be the leader of the new group." />
      <Card className="max-w-lg">
        <Form method="post" noValidate className="space-y-5">
          <FormError message={result?.message} />
          <TextField label="Group name" name="name" maxLength={30} autoFocus error={fieldError(result, "name")} />
          <SelectField
            label="Topic"
            name="topicId"
            placeholder="Choose a topic"
            options={topics.map((topic) => ({ value: topic.id, label: topic.name }))}
            error={fieldError(result, "topicId")}
          />
          <div className="flex gap-3">
            <SubmitButton pendingText="Creating…">Create group</SubmitButton>
            <ButtonLink to="/groups" variant="secondary">
              Cancel
            </ButtonLink>
          </div>
        </Form>
      </Card>
    </>
  );
}
