import { useNavigation } from "react-router";
import { Button } from "./Button.tsx";

interface SubmitButtonProps {
  children: string;
  pendingText?: string;
}

export function SubmitButton({ children, pendingText = "Saving…" }: SubmitButtonProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? pendingText : children}
    </Button>
  );
}
