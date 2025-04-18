export const Loading = ({ marginLeft = 50, marginTop = 0 }) => {
  return (
    <div
      className="spinner-border text-primary"
      style={{
        marginLeft: `${marginLeft}%`,
        marginTop: `${marginTop}%`,
      }}
      role="status"
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  );
};
