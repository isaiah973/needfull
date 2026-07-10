import clsx from "clsx";

const Card = ({ children, className = "" }) => {
  return (
    <div
      className={clsx(
        "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md",
        "dark:bg-slate-900 dark:border-slate-700",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Card;
