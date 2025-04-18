import { labelEllipsis } from "../utils/chartUtils";

export const AxisLeft = ({ yScale, text_wrap_count = 60 }) => {
  return yScale.domain().map((tickKey) => {
    const lastHyphenIndex = tickKey.lastIndexOf("-");
    const displayName = tickKey.substring(0, lastHyphenIndex);
    const labelText = labelEllipsis(displayName, text_wrap_count);

    return (
      <g key={tickKey} className="tick">
        <text
          style={{ textAnchor: "end" }}
          dy={".32em"}
          x={-3}
          y={yScale(tickKey) + yScale.bandwidth() / 2}
        >
          {labelText}
        </text>
      </g>
    );
  });
};
