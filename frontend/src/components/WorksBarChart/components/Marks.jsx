import React from "react";
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
  barCount,
}) => {
  const getDynamicFontSize = (count) => {
    if (count <= 10) return 13;
    if (count <= 15) return 11;
    return 6;
  };

  const fontSize = getDynamicFontSize(barCount);

  return data.map((d, i) => {
    const barHeight = yScale.bandwidth();
    const textYPosition = yScale(yValue(d)) + barHeight / 2 + fontSize / 6; // Adjusted calculation

    return (
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
          x={0}
          y={yScale(yValue(d))}
          height={barHeight}
          width={xScale(xValue(d))}
          fill={
            (selectedWork !== 123 && selectedWork !== yValue(d)) ||
            (selectedWork === 123 &&
              selectedType &&
              selectedType !== colorDataMap.get(colorValue(d)))
              ? "#ccc"
              : colorScale(colorDataMap.get(colorValue(d)))
          }
        />
        <text
          x={xScale(xValue(d)) - 5} // 5px padding from right
          y={textYPosition} // Properly centered vertically
          fill="white"
          textAnchor="end"
          dominantBaseline="middle" // Changed from alignmentBaseline
          style={{ fontSize: `${fontSize}px` }}
        >
          {d3Format(xValue(d))}
        </text>
      </g>
    );
  });
};
