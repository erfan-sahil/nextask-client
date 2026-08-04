import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthSubmitButtonProps = {
  isPending: boolean;
  label: string;
  pendingLabel: string;
  className?: string;
  disabled?: boolean;
};

export function AuthSubmitButton({
  isPending,
  label,
  pendingLabel,
  className,
  disabled,
}: AuthSubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isPending || disabled}
      className={cn(
        "h-11 w-full rounded-full px-6 text-sm font-semibold hover:bg-primary-hover",
        className,
      )}
    >
      {isPending ? pendingLabel : label}
    </Button>
  );
}
