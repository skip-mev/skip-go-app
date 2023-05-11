import classNames from "classnames";

type ButtonVariant = "primary" | "secondary";

interface Props extends React.PropsWithChildren {
  className?: string;
  contentBefore?: string | (() => React.ReactNode);
  variant?: ButtonVariant;
}

const Button: React.FC<Props> = ({
  children,
  contentBefore,
  className,
  variant = "primary",
}) => {
  const btnClass = classNames(
    "inline-flex items-center gap-2 rounded-md px-6 py-2.5 h-14 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors",
    {
      "bg-indigo-600 hover:bg-indigo-500 text-white focus-visible:outline-indigo-600":
        variant === "primary",
      "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700":
        variant === "secondary",
    },
    className
  );
  return (
    <button type="button" className={btnClass}>
      {contentBefore && (
        <span className="-ml-3">
          {typeof contentBefore === "string" ? (
            <img className="w-8 h-8 inline" src={contentBefore} />
          ) : (
            contentBefore()
          )}
        </span>
      )}
      <span>{children}</span>
    </button>
  );
};

export default Button;
