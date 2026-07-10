import clsx from "clsx";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const variants = {
    primary:
      "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200",

    secondary:
      "bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800",

    success: "bg-green-600 text-white hover:bg-green-700",

    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  return (
    <button
      className={clsx(
        "rounded-full font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
