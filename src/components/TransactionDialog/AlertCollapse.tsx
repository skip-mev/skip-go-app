import {
  CheckCircleIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/20/solid";
import { clsx } from "clsx";
import {
  ComponentProps,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface ContextType {
  type: "error" | "warning" | "info" | "success";
  isOpen: boolean;
  toggle: () => void;
}

const iconMap = {
  error: ExclamationTriangleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
  success: CheckCircleIcon,
};

const Context = createContext<ContextType>({
  type: "info",
  isOpen: false,
  toggle: () => {},
});

export const Root = ({
  className,
  type = "info",
  ...props
}: ComponentProps<"div"> & { type?: ContextType["type"] }) => {
  const [isOpen, setIsOpen] = useState(() => false);
  const toggle = () => setIsOpen((state) => !state);
  return (
    <Context.Provider value={{ type, isOpen, toggle }}>
      <div
        className={clsx(
          "rounded-md",
          {
            "bg-red-50 text-red-400": type === "error",
            "bg-yellow-50 text-yellow-600": type === "warning",
            "bg-blue-50 text-blue-500": type === "info",
            "bg-green-50 text-green-400": type === "success",
          },
          className,
        )}
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
  const { type, isOpen, toggle } = useContext(Context);
  const Icon = useMemo(() => iconMap[type], [type]);
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
      <Icon className="w-5 h-5" />
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
