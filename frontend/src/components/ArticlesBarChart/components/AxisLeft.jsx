export const AxisLeft = ({ yScale, text_wrap_count = 60 }) => {
  const labelEllipsis = (text) => {
    return text.length > text_wrap_count ? text.substring(0, 30) + "..." : text;
  };

  return yScale.domain().map((tickValue) => (
    <g className="tick">
      <text
        key={tickValue}
        style={{ textAnchor: "end" }}
        dy={".32em"}
        x={-3}
        y={yScale(tickValue) + yScale.bandwidth() / 2}
      >
        {labelEllipsis(tickValue)}
      </text>
    </g>
  ));
};
