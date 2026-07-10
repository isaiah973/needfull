import clsx from "clsx";

const Input = ({ className = "", ...props }) => {
  return (
    <input
      className={clsx(
        "w-full rounded-full border border-slate-300 bg-white px-5 py-3 text-slate-900",
        "placeholder:text-slate-400",
        "focus:outline-none focus:ring-2 focus:ring-slate-900",
        "dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:ring-white",
        className,
      )}
      {...props}
    />
  );
};

export default Input;
