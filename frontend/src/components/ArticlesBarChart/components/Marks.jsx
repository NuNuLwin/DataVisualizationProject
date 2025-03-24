import React, { useEffect, useRef } from "react";
import { select } from "d3";

export const Marks = ({
  data,
  xScale,
  yScale,
  xValue,
  yValue,
  tooltipFormat,
}) => {
  const rectRefs = useRef([]);

  useEffect(() => {
    rectRefs.current.forEach((rect, i) => {
      select(rect)
        .attr("width", 0)
        .transition()
        .duration(800)
        .attr("width", (d) => xScale(xValue(data[i])))
        .delay(i * 100);
    });
  }, [data, xScale, xValue]);

  return data.map((d, i) => (
    <g key={yValue(d)}>
      <rect
        className="mark"
        ref={(el) => (rectRefs.current[i] = el)}
        x={0}
        y={yScale(yValue(d))}
        height={yScale.bandwidth()}
      >
        <title fill="black">{yValue(d)}</title>
      </rect>
      <text
        x={xScale(xValue(d)) - xValue(d).toString().length * 2}
        y={yScale(yValue(d)) + yScale.bandwidth() / 2 + 5}
        fill="white"
        textAnchor="end"
        alignmentBaseline="middle"
      >
        {xValue(d)}
      </text>
    </g>
  ));
};
