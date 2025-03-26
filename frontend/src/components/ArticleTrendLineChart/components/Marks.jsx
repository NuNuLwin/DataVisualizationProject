import { line, curveNatural } from "d3-shape";

export const Marks = ({
  data,
  xScale,
  yScale,
  xValue,
  yValue,
  tooltipFormat,
  circleRadius,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onTouchStart,
  color,
}) => {
  // console.log("=== MARKS DATA ===", color);

  return (
    <g className="marks">
      <path
        stroke={color}
        d={line()
          .x((d) => xScale(xValue(d)))
          .y((d) => yScale(yValue(d)))
          .curve(curveNatural)(data)}
        strokeWidth={"1"}
        className="marks-path"
        onPointerEnter={onPointerEnter}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onTouchStart={onTouchStart}
      />
      {/*{data.map((d) => (
        <circle cx={xScale(xValue(d))} cy={yScale(yValue(d))} r={circleRadius}>
           <text>{tooltipFormat(xValue(d))}</text> 
          <text>{xValue(d)}</text>
        </circle>
      ))}*/}
    </g>
  );
};
