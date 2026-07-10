const Container = ({ children, className = "" }) => {
  return (
    <div className={`mx-auto max-w-7xl px-5 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

export default Container;
