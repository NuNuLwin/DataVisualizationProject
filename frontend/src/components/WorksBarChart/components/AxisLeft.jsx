export const AxisLeft = ({ yScale, text_wrap_count = 60 }) => {
  const labelEllipsis = (text) => {
    return text.length > text_wrap_count ? text.substring(0, 30) + "..." : text;
  };

  return yScale.domain().map((tickKey) => {
    const lastHyphenIndex = tickKey.lastIndexOf("-");
    const displayName = tickKey.substring(0, lastHyphenIndex);

    return (
      <g key={tickKey} className="tick">
        <text
          style={{ textAnchor: "end" }}
          dy={".32em"}
          x={-3}
          y={yScale(tickKey) + yScale.bandwidth() / 2}
        >
          {labelEllipsis(displayName)}
        </text>
      </g>
    );
  });
};
