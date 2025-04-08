import { useRef, useState } from "react";

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
  const [selectedWork, setSelectedWork] = useState(123);
  const tooltipRef = useRef();

  let data = useData(selectedTopic, perPage);

  const handlePerPageChange = (event) => {
    setSelectedType(null);
    setSelectedWork(123);
    setPerPage(Number(event.target.value));
  };

  if (!data) {
    return <Loading />;
  }

  // console.log("Bar Chart Data ==>", data);

  /* Constants */
  const siFormat = format(".2s");
  const xAxisTickFOrmat = (tickValue) => siFormat(tickValue).replace("G", "B");

  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;
  // console.log("=== Topic Data ===", data);

  /* Value Selectors */
  const xValue = (d) => d.cited_by_count;
  const xScale = scaleLinear()
    .domain([0, max(data, xValue)])
    .range([0, innerWidth]);

  const yValue = (d) => `${d.display_name}-${d.cited_by_count}`;
  const yScale = scaleBand()
    .domain(data.map(yValue))
    .range([0, innerHeight])
    .paddingInner(0.2);

  const colorValue = (d) => d.display_name;
  const pubYearValue = (d) => d.publication_year;
  const authorValue = (d) => {
    let authors = [];
    d.authorships.forEach((obj) => {
      authors.push(obj?.author?.display_name || obj?.raw_author_name);
    });
    return authors.length > 20
      ? authors.slice(0, 20).join(", ") + ", and more"
      : authors.length > 0
      ? authors.join(", ")
      : "";
  };
  const institutionValue = (d) => {
    let institutions = new Map();
    d.authorships.forEach((author_obj) => {
      author_obj.institutions.forEach((obj) => {
        if (!institutions.get(obj.display_name)) {
          institutions.set(obj.display_name, 1);
        }
      });
    });
    institutions = Array.from(institutions.keys());
    return institutions.length > 20
      ? institutions.slice(0, 20).join(", ") + " and more"
      : institutions.length > 0
      ? institutions.join(", ")
      : "";
  };

  /* Tooltip Text */
  const toolTipText = (d) => {
    return (
      "<p>" +
      yValue(d) +
      "<br><br>Publication Year: " +
      pubYearValue(d) +
      "<br><br>Authors: " +
      authorValue(d) +
      "<br><br>Institutions: " +
      institutionValue(d) +
      "</p>"
    );
  };

  /* Data Maps */
  const colorMap = new Map();
  const colorDataMap = new Map();
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
    <div className="citation-chart" id="citation-chart">
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
            selectedType={selectedType}
            toolTipText={toolTipText}
            tooltipRef={tooltipRef}
            selectedWork={selectedWork}
            setSelectedWork={setSelectedWork}
            barCount={data.length}
          />
        </g>
      </svg>

      <div className="my-tooltip" ref={tooltipRef}></div>
    </div>
  );
};
