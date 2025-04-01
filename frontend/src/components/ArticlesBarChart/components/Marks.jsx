import React, { useEffect, useRef } from "react";
import { select, format, color } from "d3";

const d3Format = format(",");

export const Marks = ({
  data,
  xScale,
  yScale,
  xValue,
  yValue,
  colorScale,
  colorDataMap,
  colorValue,
  pubYearValue,
  selected,
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
        fill={
          selected && selected !== colorDataMap.get(colorValue(d))
            ? "#ccc"
            : colorScale(colorDataMap.get(colorValue(d)))
        }
      >
        <title fill="black">
          {yValue(d) + "\n\nPublication Year: " + pubYearValue(d)}
        </title>
      </rect>
      <text
        x={xScale(xValue(d)) - xValue(d).toString().length * 2 + 3}
        y={yScale(yValue(d)) + yScale.bandwidth() / 2 + 4}
        fill="white"
        textAnchor="end"
        alignmentBaseline="middle"
      >
        {d3Format(xValue(d))}
      </text>
    </g>
  ));
};
