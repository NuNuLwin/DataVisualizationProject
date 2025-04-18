import React from "react";
import { select, format } from "d3";
import { getDynamicFontSize } from "../utils/chartUtils";

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
  const fontSize = getDynamicFontSize(barCount);

  const handleMouseOver = (e, d) => {
    setSelectedWork(yValue(d));
    const string = toolTipText(d);
    select(tooltipRef.current)
      .style("display", "block")
      .html(string)
      .style("left", `${e.pageX + 10}px`)
      .style("top", `${e.pageY - 10}px`);
  };

  const handleMouseOut = () => {
    select(tooltipRef.current).style("display", "none");
    setSelectedWork(123);
  };

  const getBarFill = (d) => {
    const workId = yValue(d);
    const type = colorDataMap.get(colorValue(d));
    const isDimmed =
      (selectedWork !== 123 && selectedWork !== workId) ||
      (selectedWork === 123 && selectedType && selectedType !== type);

    return isDimmed ? "#ccc" : colorScale(type);
  };

  return data.map((d) => {
    const barHeight = yScale.bandwidth();
    const yPos = yScale(yValue(d));
    const textY = yPos + barHeight / 2 + fontSize / 6;
    const xVal = xValue(d);

    return (
      <g
        key={yValue(d)}
        className="mark"
        onMouseOver={(e) => handleMouseOver(e, d)}
        onMouseOut={handleMouseOut}
      >
        <rect
          x={0}
          y={yPos}
          height={barHeight}
          width={xScale(xVal)}
          fill={getBarFill(d)}
        />
        <text
          x={xScale(xVal) - 5}
          y={textY}
          fill="white"
          textAnchor="end"
          dominantBaseline="middle"
          style={{ fontSize: `${fontSize}px` }}
        >
          {d3Format(xVal)}
        </text>
      </g>
    );
  });
};
