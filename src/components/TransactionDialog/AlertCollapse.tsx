import {
  ChevronRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";
import { clsx } from "clsx";
import {
  ComponentProps,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const Context = createContext({ isOpen: false, toggle: () => {} });

export const Root = ({ className, ...props }: ComponentProps<"div">) => {
  const [isOpen, setIsOpen] = useState(() => false);
  const toggle = () => setIsOpen((state) => !state);
  return (
    <Context.Provider value={{ isOpen, toggle }}>
      <div
        className={clsx("bg-red-50 text-red-400 rounded-md", className)}
        {...props}
      />
    </Context.Provider>
  );
};

export const Trigger = ({
  className,
  children,
  onClick,
  ...props
}: ComponentProps<"button">) => {
  const { isOpen, toggle } = useContext(Context);
  return (
    <button
      className={clsx(
        "p-3 flex items-center gap-2 w-full",
        "font-medium uppercase text-xs text-left",
        className,
      )}
      onClick={(event) => [toggle(), onClick?.(event)]}
      {...props}
    >
      <ExclamationTriangleIcon className="w-5 h-5" />
      <span className="flex-1">{children}</span>
      <ChevronRightIcon className={clsx("w-5 h-5", { "rotate-90": isOpen })} />
    </button>
  );
};

export const Content = ({ className, ...props }: ComponentProps<"div">) => {
  const { isOpen } = useContext(Context);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen) {
      ref.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div
      className={clsx("px-4 pb-4 space-y-1 text-sm", className)}
      ref={ref}
      {...props}
    />
  );
};
