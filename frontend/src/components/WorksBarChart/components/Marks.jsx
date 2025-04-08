import React, { useEffect, useRef } from "react";
import { select, format } from "d3";

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
  selectedType,
  tooltipRef,
  toolTipText,
  selectedWork,
  setSelectedWork,
}) => {
  // const rectRefs = useRef([]);

  // useEffect(() => {
  //   if (!data) return;
  //   rectRefs.current.forEach((rect, i) => {
  //     select(rect)
  //       .attr("width", 0)
  //       // .transition()
  //       // .duration(800)
  //       .attr("width", (d) => xScale(xValue(data[i])));
  //     // .delay(i * 100);
  //   });
  // }, [data, xScale, yScale]);

  // useEffect(() => {
  //   console.log("=== data ===", data);
  //   if (!data) return;
  //   rectRefs.current.forEach((rect, i) => {
  //     if (selectedWork !== 123 && selectedWork !== yValue(data[i])) {
  //       select(rect).attr("fill", "#ccc");
  //     } else if (
  //       selectedWork === 123 &&
  //       selectedType &&
  //       selectedType !== colorDataMap.get(colorValue(data[i]))
  //     ) {
  //       select(rect).attr("fill", "#ccc");
  //     } else {
  //       console.log("=== data 2 ===", i);
  //       console.log(rectRefs);
  //       // select(rect).attr(
  //       //   "fill",
  //       //   colorScale(colorDataMap.get(colorValue(data[i])))
  //       // );
  //     }
  //   });
  // }, [data, xScale, yScale, selectedType, selectedWork]);

  return data.map((d, i) => (
    <g
      key={yValue(d)}
      className="mark"
      onMouseOver={(e) => {
        setSelectedWork(yValue(d));
        const string = toolTipText(d);
        select(tooltipRef.current)
          .style("display", "block")
          .html(string)
          .style("left", e.pageX + 10 + "px")
          .style("top", e.pageY - 10 + "px");
      }}
      onMouseOut={() => {
        select(tooltipRef.current).style("display", "none");
        setSelectedWork(123);
      }}
    >
      <rect
        className="mark"
        // ref={(el) => (rectRefs.current[i] = el)}
        x={0}
        y={yScale(yValue(d))}
        height={yScale.bandwidth()}
        width={xScale(xValue(d))}
        fill={
          (selectedWork !== 123 && selectedWork !== yValue(d)) ||
          (selectedWork === 123 &&
            selectedType &&
            selectedType !== colorDataMap.get(colorValue(d)))
            ? "#ccc"
            : colorScale(colorDataMap.get(colorValue(d)))
        }
      >
        {/* <title fill="red" className="tooltip-text">
          {yValue(d) +
            "\n\nPublication Year: " +
            pubYearValue(d) +
            "\n\nAuthors: " +
            authorValue(d) +
            "\n\nInstitutions: " +
            institutionValue(d)}
        </title> */}
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
