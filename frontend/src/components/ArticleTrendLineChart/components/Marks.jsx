import { line, curveNatural } from "d3-shape";

export const Marks = ({
  data,
  xScale,
  yScale,
  xValue,
  yValue,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onTouchStart,
  color,
}) => {
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
    </g>
  );
};
