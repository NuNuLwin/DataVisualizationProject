export const AxisLeft = ({ yScale, innerWidth, tickOffset = 3 }) => {
  return yScale.ticks().map((tickValue) => (
    <g
      key={`left-axis-tick-${tickValue}`}
      className="tick"
      transform={`translate(0,${yScale(tickValue)})`}
    >
      <line x2={innerWidth} />
      <text
        key={tickValue}
        style={{ textAnchor: "end" }}
        dy={".32em"}
        x={-tickOffset}
      >
        {tickValue}
      </text>
    </g>
  ));
};
