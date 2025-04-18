import { arc as d3Arc, select as d3Select } from "d3";
import { arcVisible, labelVisible, labelTransform } from "./arcUtils";
import { TEXT_WRAP_COUNT } from "../constants/sunburstConstants";
import { wrapText } from "./textUtils";

export const arcGenerator = (radius) =>
  d3Arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius * 1.5)
    .innerRadius((d) => d.y0 * radius)
    .outerRadius((d) => Math.max(d.y0 * radius, d.y1 * radius - 1));

export const pathGenerator = (svgElement, rootData, arc, color) =>
  d3Select(svgElement)
    .append("g")
    .selectAll("path")
    .data(rootData.descendants().slice(1))
    .join("path")
    .attr("fill", (d) => {
      while (d.depth > 1) d = d.parent;
      return color(d.data.name);
    })
    .attr("fill-opacity", (d) =>
      arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0
    )
    .attr("pointer-events", (d) => (arcVisible(d.current) ? "auto" : "none"))
    .attr("d", (d) => arc(d.current));

export const labelGenerator = (svgElement, rootData, radius) =>
  d3Select(svgElement)
    .append("g")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .style("user-select", "none")
    .selectAll("text")
    .data(rootData.descendants().slice(1))
    .join("text")
    .attr("dy", "0.35em")
    .attr("fill-opacity", (d) => +labelVisible(d.current))
    .attr("transform", (d) => labelTransform(d.current, radius))
    .text((d) =>
      d.data.name.length > TEXT_WRAP_COUNT
        ? d.data.name.substring(0, 16) + "..."
        : d.data.name
    );

export const circleGenerator = (svgElement, rootData, radius, onClick) =>
  d3Select(svgElement)
    .append("circle")
    .datum(rootData)
    .attr("r", radius)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("click", onClick);

export const mainTitleGenerator = (svgRef, domain) => {
  const maxWidth = d3Select(svgRef.current).select("circle").node()?.getBoundingClientRect().width - 80 || 100;
  const wrappedText = wrapText(domain, maxWidth, svgRef);

  const centerX = 0;
  const centerY = wrappedText.length === 1 ? 0 : (wrappedText.length - 1) * -8;

  d3Select(svgRef.current).select("g.main-title-wrapper").remove();

  return d3Select(svgRef.current)
    .append("g")
    .attr("class", "main-title-wrapper")
    .append("text")
    .attr("class", "main-title")
    .attr("x", centerX)
    .attr("y", centerY)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("font-size", "14px")
    .style("font-family", "Arial")
    .style("fill", "black")
    .selectAll("tspan")
    .data(wrappedText)
    .enter()
    .append("tspan")
    .attr("x", centerX)
    .attr("dy", (d, i) => (i === 0 ? 0 : "1.2em"))
    .text((d) => d);
};
