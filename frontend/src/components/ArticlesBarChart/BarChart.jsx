import { useState } from "react";

/* d3 */
import { format, max, scaleBand, scaleLinear } from "d3";

/* data retrieval */
import { useData } from "./useData";

/* components */
import { AxisBottom } from "./components/AxisBottom";
import { AxisLeft } from "./components/AxisLeft";
import { Marks } from "./components/Marks";
import { ToolTip } from "./components/ToolTip";

/* css */
import "./BarChart.css";

export const BarChart = ({
  width = window.innerWidth,
  height = window.innerHeight,
  selectedTopic,
}) => {
  /* React State to point current hover bar */
  // const [hoveredBar, setHoveredBar] = useState(null);

  const [perPage, setPerPage] = useState(10);
  let data = useData(selectedTopic, perPage);

  const handlePerPageChange = (event) => {
    setPerPage(Number(event.target.value));
  };

  if (!data) {
    return <div>Loading...</div>;
  }

  // data = data.slice(0, 11);

  //   if (!selectedTopic) {
  //     return <div>No topic selected.</div>;
  //   }

  /* Constants */
  // Margin Top, Right, Bottom, and Left of the chart
  const margin = {
    top: 20,
    right: 50,
    bottom: 100,
    left: 450,
  };
  const xAxisOffsetValue = 70;
  const tooltipLeftOffset = 225;
  const tooltipTopOffset = 50;

  const siFormat = format(".2s");
  const xAxisTickFOrmat = (tickValue) => siFormat(tickValue).replace("G", "B");

  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;
  console.log("=== Topic Data ===", data);
  const xValue = (d) => d.cited_by_count;
  const xScale = scaleLinear() // Ideal for measurement
    .domain([0, max(data, xValue)]) // Zero to Max of Citation value
    .range([0, innerWidth]); // Length of X axis

  const yValue = (d) => d.display_name;
  const yScale = scaleBand() // Ideal for ordinal or categorical dimension
    .domain(data.map(yValue)) // To point which value to use as Y axis
    .range([0, innerHeight]) // Length of Y axis
    .paddingInner(0.2); // Padding between each bar

  return (
    <div className="citation-chart">
      <center>
        <label htmlFor="perPage">Articles: </label>
        <select id="perPage" value={perPage} onChange={handlePerPageChange}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </center>

      <svg width={width} height={height} className="population-bar-chart">
        <g transform={`translate(${margin.left},${margin.top})`}>
          <AxisBottom
            xScale={xScale}
            innerHeight={innerHeight}
            tickFormat={xAxisTickFOrmat}
          />
          <AxisLeft yScale={yScale} />
          <text
            className="axis-label"
            x={innerWidth / 2}
            y={innerHeight + xAxisOffsetValue}
            textAnchor="middle"
          >
            {/* {selectedTopic.data.name || ""} */}
            Citation Count
          </text>
          <Marks
            data={data}
            xScale={xScale}
            yScale={yScale}
            xValue={xValue}
            yValue={yValue}
            tooltipFormat={xAxisTickFOrmat}
          />
        </g>
      </svg>
      {/* {hoveredBar ? (
                <ToolTip 
                    title={xAxisTickFOrmat(xValue(hoveredBar))}
                    left={xScale(xValue(hoveredBar)) + tooltipLeftOffset}
                    top={yScale(yValue(hoveredBar)) + tooltipTopOffset}
                />
            ) : null} */}
    </div>
  );
};
