import * as Tooltip from "@radix-ui/react-tooltip";
import { clsx } from "clsx";
import { ComponentPropsWithoutRef, ReactNode } from "react";

type Props = Tooltip.TooltipProps & {
  enabled?: boolean;
  label: ReactNode;
  children: ReactNode;
  _content?: ComponentPropsWithoutRef<"div">;
};

export const SimpleTooltip = (props: Props) => {
  const { enabled = true, label, children, _content, ...tooltipProps } = props;
  if (!enabled) {
    return <>{children}</>;
  }
  return (
    <Tooltip.Root {...tooltipProps}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          {..._content}
          className={clsx(
            "rounded-md bg-white px-4 py-2 leading-none",
            "select-none shadow shadow-neutral-500/50",
            "text-sm",
            "animate-in",
            _content?.className,
          )}
        >
          {label}
          <Tooltip.Arrow className="fill-white drop-shadow" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};
