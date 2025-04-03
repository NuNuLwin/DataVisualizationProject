import { useState, useRef, useEffect } from "react";

/* d3 */
import {
  extent,
  scaleLinear,
  timeFormat,
  scaleOrdinal,
  schemeCategory10,
  pointer,
  leastIndex,
  select,
} from "d3";

/* data retrieval */
import { useData } from "./useData";
import { Loading } from "../Loading";

/* components */
import { AxisBottom } from "./components/AxisBottom";
import { AxisLeft } from "./components/AxisLeft";
import { ColorLegend } from "./components/ColorLegend";
import { Marks } from "./components/Marks";

/* css */
import "./LineChart.css";

const circleRadius = 7;
const fadeOpacity = 0.4;
const margin = {
  top: 20,
  right: 200,
  bottom: 100,
  left: 120,
};
const xAxisOffsetValue = 60;
const yAxisLabelOffset = 70;

const xAxisTickFOrmat = timeFormat("%a");

const labelValue = (d) => d.name;

const xValue = (d) => d.year;
const xAxisLabel = "Year";

const yValue = (d) => d.cited_by_count;
const yAxisLabel = "Citation Count";

const colorLegendLabel = "Open Access";

export const LineChart = ({
  width = window.innerWidth,
  height = window.innerHeight,
  selectedField,
}) => {
  const pointerRef = useRef();
  const svgRef = useRef();
  const tooltipRef = useRef();

  // Retrieving data from the github gist is separated as a Custom Hook
  const data = useData(selectedField);
  const [selectedStatus, setSelectedStatus] = useState(null);

  if (!data) {
    return <Loading marginLeft={0} marginTop={1} />;
  }

  /* Constants */
  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;

  const xScale = scaleLinear()
    .domain(extent(data, xValue))
    .range([0, innerWidth])
    .nice();

  const yScale = scaleLinear()
    .domain(extent(data, yValue))
    .range([innerHeight, 0])
    .nice();

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
      labelValue(d) +
      "<br><br>Publication Year: " +
      pubYearValue(d) +
      "<br><br>Authors: " +
      authorValue(d) +
      "<br><br>Institutions: " +
      institutionValue(d) +
      "</p>"
    );
  };

  const dataMap = new Map(); // { article name : [ objects ]}
  const oaStatusMap = new Map(); // { oa status : [ article name ]}
  const oaStatusDataMap = new Map(); // { article name : oa status }

  if (selectedStatus) {
    data.forEach((obj) => {
      const key = obj.name;
      if (!dataMap.has(key)) {
        dataMap.set(key, []);
      }
      if (obj.oa_status === selectedStatus) {
        dataMap.get(key).push(obj);
      }
      const oa_status = obj.oa_status;
      if (!oaStatusDataMap.has(key)) {
        oaStatusDataMap.set(key, oa_status);
      }
      if (!oaStatusMap.has(oa_status)) {
        oaStatusMap.set(oa_status, []);
      }
      oaStatusMap.get(oa_status).push(key);
    });
  } else {
    data.forEach((obj) => {
      const key = obj.name;
      if (!dataMap.has(key)) {
        dataMap.set(key, []);
      }
      dataMap.get(key).push(obj);

      const oa_status = obj.oa_status;
      if (!oaStatusDataMap.has(key)) {
        oaStatusDataMap.set(key, oa_status);
      }

      if (!oaStatusMap.has(oa_status)) {
        oaStatusMap.set(oa_status, []);
      }
      oaStatusMap.get(oa_status).push(key);
    });
  }

  const colorScale = scaleOrdinal()
    .domain(["diamond", "gold", "green", "hybrid", "bronze", "closed"])
    .range(["#377eb8", "#999999", "#4daf4a", "#984ea3", "#ff7f00", "#e41a1c"]);

  /* functions */
  function pointerEntered(event, key) {
    // console.log("Pointer Entered:", event);
    select(svgRef.current)
      .selectAll("path.marks-path")
      .style("mix-blend-mode", null)
      .style("opacity", 0);
    select(tooltipRef.current).style("display", "none");
  }

  function pointerMove(event, key) {
    const [xm, ym] = pointer(event);
    // console.log("=== event ");
    // console.log("=== pointer key ===", key);
    // console.log("=== pointer move ===", dataMap.get(key));
    // console.log("=== pointer move new ===", xm, ym);
    const i = leastIndex(dataMap.get(key), (obj) =>
      Math.hypot(xScale(xValue(obj)) - xm, yScale(yValue(obj)) - ym)
    );
    const obj = dataMap.get(key)[i];

    select(event.target)
      .style("opacity", 1)
      .style("stroke", colorScale(oaStatusDataMap.get(key)))
      .raise();
    // select(pointerRef.current).attr(
    //   "transform",
    //   `translate(${xScale(xValue(obj))},${yScale(yValue(obj))})`
    // );
    // select(pointerRef.current).select("text").text(labelValue(obj));
    const string = toolTipText(obj);
    select(tooltipRef.current)
      .style("display", "block")
      .html(string)
      .style("left", xScale(xValue(obj)) + 10 + "px")
      .style("top", yScale(yValue(obj)) - 40 + "px");
  }

  function pointerLeave(event, key) {
    // console.log("Pointer Leave:", event);
    select(tooltipRef.current).style("display", "none");
    select(svgRef.current)
      .selectAll("path.marks-path")
      .style("mix-blend-mode", "multiply")
      .style("stroke", null)
      .style("opacity", 1);
    select(svgRef.current).node().value = null;
    select(svgRef.current).dispatch("input", { bubbles: true });
  }

  return (
    <div>
      <svg
        width={width}
        height={height}
        className="article-trend-line-chart"
        ref={svgRef}
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          <AxisBottom
            xScale={xScale}
            innerHeight={innerHeight}
            tickFormat={xAxisTickFOrmat}
            tickOffset={5}
          />
          <text
            className="axis-label"
            textAnchor="middle"
            transform={`translate(${-yAxisLabelOffset}, ${
              innerHeight / 2
            }) rotate(-90)`}
          >
            {yAxisLabel}
          </text>
          <AxisLeft yScale={yScale} innerWidth={innerWidth} tickOffset={10} />
          <text
            className="axis-label"
            x={innerWidth / 2}
            y={innerHeight + xAxisOffsetValue}
            textAnchor="middle"
          >
            {xAxisLabel}
          </text>
          <g display={"none"} ref={pointerRef}>
            <circle r={2.5}></circle>
            <text textAnchor="middle" y={-8}></text>
          </g>

          <g
            transform={`translate(${innerWidth + 60}, ${
              innerHeight - innerHeight / 1.5
            })`}
          >
            <text
              x={50}
              y={-20}
              className="axis-label clickable"
              textAnchor="middle"
            >
              {colorLegendLabel}
            </text>
            <ColorLegend
              colorScale={colorScale}
              tickSpacing={22}
              tickSize={circleRadius}
              tickTextOffset={15}
              circleRadius={circleRadius}
              onSelect={setSelectedStatus}
              selected={selectedStatus}
              fadeOpacity={fadeOpacity}
            />
          </g>

          {Array.from(dataMap.keys()).map((k) => (
            <Marks
              key={k}
              data={dataMap.get(k)}
              xScale={xScale}
              yScale={yScale}
              xValue={xValue}
              yValue={yValue}
              color={colorScale(oaStatusDataMap.get(k))}
              tooltipFormat={xAxisTickFOrmat}
              circleRadius={3}
              onPointerEnter={(e) => pointerEntered(e, k)}
              onPointerMove={(e) => pointerMove(e, k)}
              onPointerLeave={(e) => pointerLeave(e, k)}
              onTouchStart={(e) => e.preventDefault()}
            />
          ))}
        </g>
      </svg>

      <div className="my-tooltip" ref={tooltipRef}></div>
    </div>
  );
};
