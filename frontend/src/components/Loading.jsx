export const Loading = ({ marginLeft = 50, marginTop = 0 }) => {
  return (
    <div
      class="spinner-border text-primary"
      style={{
        marginLeft: `${marginLeft}%`,
        marginTop: `${marginTop}%`,
      }}
      role="status"
    >
      <span class="visually-hidden">Loading...</span>
    </div>
  );
};
