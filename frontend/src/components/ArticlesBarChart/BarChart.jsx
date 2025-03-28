import { useState } from "react";

/* d3 */
import {
  format,
  max,
  scaleBand,
  scaleLinear,
  scaleOrdinal,
  schemeCategory10,
} from "d3";

/* data retrieval */
import { useData } from "./useData";

/* components */
import { AxisBottom } from "./components/AxisBottom";
import { AxisLeft } from "./components/AxisLeft";
import { ColorLegend } from "./components/ColorLegend";
import { Marks } from "./components/Marks";
import { Loading } from "../Loading";

/* css */
import "./BarChart.css";

const circleRadius = 7;
const tickSpacing = 22;
const tickTextOffset = 15;
const margin = {
  top: 20,
  right: 200,
  bottom: 100,
  left: 450,
};
const xAxisOffsetValue = 70;
const colorLegendLabel = "Work Type";
const fadeOpacity = 0.4;

export const BarChart = ({
  width = window.innerWidth,
  height = window.innerHeight,
  selectedTopic,
}) => {
  const [perPage, setPerPage] = useState(10);
  const [selectedType, setSelectedType] = useState(null);

  let data = useData(selectedTopic, perPage);

  const handlePerPageChange = (event) => {
    setPerPage(Number(event.target.value));
  };

  if (!data) {
    return <Loading />;
  }

  console.log("Bar Chart Data ==>", data);

  /* Constants */
  const siFormat = format(".2s");
  const xAxisTickFOrmat = (tickValue) => siFormat(tickValue).replace("G", "B");

  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;
  // console.log("=== Topic Data ===", data);
  const xValue = (d) => d.cited_by_count;
  const xScale = scaleLinear() // Ideal for measurement
    .domain([0, max(data, xValue)]) // Zero to Max of Citation value
    .range([0, innerWidth]); // Length of X axis

  const yValue = (d) => `${d.display_name}-${d.cited_by_count}`;
  const yScale = scaleBand() // Ideal for ordinal or categorical dimension
    .domain(data.map(yValue)) // To point which value to use as Y axis
    .range([0, innerHeight]) // Length of Y axis
    .paddingInner(0.2); // Padding between each bar

  const colorValue = (d) => d.display_name;
  const colorMap = new Map();
  const colorDataMap = new Map();
  const pubYearValue = (d) => d.publication_year;

  data.map((d) => {
    if (!colorMap.has(d.type)) {
      colorMap.set(d.type, "");
    }
    if (!colorDataMap.has(d.display_name)) {
      colorDataMap.set(d.display_name, d.type);
    }
  });

  const colorScale = scaleOrdinal(schemeCategory10).domain(
    Array.from(colorMap.keys())
  );

  return (
    <div className="citation-chart">
      <center>
        <label htmlFor="perPage">Works: </label>
        <select id="perPage" value={perPage} onChange={handlePerPageChange}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
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
            Citation Count
          </text>
          <g
            transform={`translate(${innerWidth + 60}, ${
              innerHeight - innerHeight / 1.5
            })`}
          >
            <text x={35} y={-25} className="axis-label" textAnchor="middle">
              {colorLegendLabel}
            </text>
            <ColorLegend
              colorScale={colorScale}
              tickSpacing={tickSpacing}
              tickSize={circleRadius}
              tickTextOffset={tickTextOffset}
              circleRadius={circleRadius}
              onSelect={setSelectedType}
              selected={selectedType}
              fadeOpacity={fadeOpacity}
            />
          </g>

          <Marks
            data={data}
            xScale={xScale}
            yScale={yScale}
            xValue={xValue}
            yValue={yValue}
            tooltipFormat={xAxisTickFOrmat}
            colorScale={colorScale}
            colorDataMap={colorDataMap}
            colorValue={colorValue}
            pubYearValue={pubYearValue}
            selected={selectedType}
          />
        </g>
      </svg>
    </div>
  );
};
