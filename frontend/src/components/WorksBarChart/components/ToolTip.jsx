export const ToolTip = ({ title, left, top }) => {
  const styles = {
    left,
    top,
  };

  return (
    <div className="tooltip" style={styles}>
      {title}
    </div>
  );
};
