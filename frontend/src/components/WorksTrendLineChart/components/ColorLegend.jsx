export const ColorLegend = ({
  colorScale,
  tickSpacing = 20,
  tickSize = 10,
  tickTextOffset = 20,
  onSelect,
  selected,
  fadeOpacity,
}) =>
  colorScale.domain().map((domainValue, i) => (
    <g
      key={domainValue}
      className="tick legend-item"
      transform={`translate(0, ${i * tickSpacing})`}
      onClick={() =>
        selected === domainValue ? onSelect(null) : onSelect(domainValue)
      }
      opacity={selected && domainValue !== selected ? fadeOpacity : 1.0}
    >
      <circle fill={colorScale(domainValue)} r={tickSize} />
      <text dy=".32em" x={tickTextOffset}>
        {domainValue}
      </text>
    </g>
  ));
