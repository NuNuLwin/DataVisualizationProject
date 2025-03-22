import { useEffect, useRef, useState } from "react";

/* d3 */
import {
  arc as d3Arc,
  format as d3Format,
  hierarchy,
  interpolate,
  interpolateRainbow,
  partition,
  quantize,
  select as d3Select,
  scaleOrdinal,
} from "d3";

/* components */
import { useData } from "./useData";

/* css */
import "./SunburstChart.css";

const RADIUS_DIVIDER = 13;
const VIEWBOX_MIN_X = (w) => -1 * (w / 2);
const VIEWBOX_MIN_Y = (h) => -1 * (h / 3.0);
const DEFAULT_MAIN_TITLE = "Science";
const TEXT_WRAP_COUNT = (18 / RADIUS_DIVIDER) * 10;

export const SunburstChart = ({
  width = window.innerWidth,
  height = window.innerHeight,
}) => {
  const radius = width / RADIUS_DIVIDER;

  const [loading, setLoading] = useState(true);
  const svgRef = useRef();
  const data = useData();

  let parent = null;
  let root = null;
  let path = null;
  let arc = null;
  let label = null;

  /* Generators */
  const arcGenerator = () => {
    return d3Arc()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius((d) => d.y0 * radius)
      .outerRadius((d) => Math.max(d.y0 * radius, d.y1 * radius - 1));
  };
  const pathGenerator = (svgElement, rootData, arcGenerator, color) => {
    return d3Select(svgElement)
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
      .attr("d", (d) => arcGenerator(d.current))
      .on("mouseover", function (event, d) {
        d3Select(this).attr("fill-opacity", 1);
        // .attr("fill", "gold"); // Optionally change the color to something brighter
      })
      .on("mouseout", function (event, d) {
        d3Select(this)
          .attr("fill-opacity", (d) =>
            arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0
          )
          .attr("fill", (d) => {
            while (d.depth > 1) d = d.parent;
            return color(d.data.name);
          });
      });
  };

  // const pathGenerator = (svgElement, rootData, arcGenerator, color) => {
  //   return d3Select(svgElement)
  //     .append("g")
  //     .selectAll("path")
  //     .data(rootData.descendants().slice(1))
  //     .join("path")
  //     .attr("fill", (d) => {
  //       while (d.depth > 1) d = d.parent;
  //       return color(d.data.name);
  //     })
  //     .attr("fill-opacity", (d) =>
  //       arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0
  //     )
  //     .attr("pointer-events", (d) => (arcVisible(d.current) ? "auto" : "none"))
  //     .attr("d", (d) => arcGenerator(d.current));
  // };

  const labelEllipsis = (text) => {
    return text.length > TEXT_WRAP_COUNT ? text.substring(0, 16) + "..." : text;
  };

  const labelGenerator = (svgElement, rootData, maxHeight = 23) => {
    return (
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
        .attr("transform", (d) => labelTransform(d.current))
        // .each(function (d) {
        //   const words = d.data.name.split(/\s+/); // Split text into words
        //   const lineHeight = 1.1; // Line spacing (em units)
        //   let currentHeight = 0;
        //   const textElement = d3Select(this);
        //   let truncated = false;

        //   words.forEach((word, i) => {
        //     if (currentHeight + lineHeight * 10 > maxHeight) {
        //       truncated = true;
        //       return;
        //     }

        //     textElement
        //       .append("tspan")
        //       .attr("x", 0)
        //       .attr("dy", i === 0 ? "0em" : `${lineHeight}em`) // Offset each line
        //       .text(word);

        //     currentHeight += lineHeight * 10; // Approximate height calculation
        //   });

        //   if (truncated) {
        //     textElement
        //       .append("tspan")
        //       .attr("x", 0)
        //       .attr("dy", `${lineHeight}em`) // Place "..."
        //       .text("...");
        //   }
        // });
        .text((d) => labelEllipsis(d.data.name))
    );
  };

  const circleGenerator = (svgElement, rootData, radius) => {
    return d3Select(svgElement)
      .append("circle")
      .datum(rootData)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", clicked);
  };

  const mainTitleGenerator = (svgElement) => {
    return d3Select(svgElement)
      .append("g")
      .attr("class", "main-title-wrapper")
      .append("text")
      .attr("class", "main-title")
      .text(DEFAULT_MAIN_TITLE);
  };

  /* Hooks */
  useEffect(() => {
    if (svgRef.current && data) {
      setLoading(false);
      const color = scaleOrdinal(
        quantize(interpolateRainbow, data.children.length + 1)
      );
      const chartHierarchy = hierarchy(data)
        .sum((d) => d.value)
        .sort((a, b) => b.value - a.value);

      root = partition().size([2 * Math.PI, chartHierarchy.height + 1])(
        chartHierarchy
      );

      root.each((d) => (d.current = d));

      mainTitleGenerator(svgRef.current);

      // Create the arc generator.
      arc = arcGenerator();

      // Append the arcs.
      path = pathGenerator(svgRef.current, root, arc, color);
      // Make them clickable if they have children.
      path
        .filter((d) => d.children)
        .style("cursor", "pointer")
        .on("click", clicked);

      const format = d3Format(",d");
      path.append("title").text(
        (d) =>
          `${d
            .ancestors()
            .map((d) => d.data.name)
            .reverse()
            .join("/")}\n${format(d.value)}`
      );
      label = labelGenerator(svgRef.current, root);

      parent = circleGenerator(svgRef.current, root, radius);
    }
  }, [svgRef.current, data]);

  /* Events */
  function clicked(event, p) {
    // set main title of sunburst for clicked element name
    d3Select(".main-title").text(p?.data?.name || DEFAULT_MAIN_TITLE);

    parent.datum(p.parent || root);

    root.each(
      (d) =>
        (d.target = {
          x0:
            Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) *
            2 *
            Math.PI,
          x1:
            Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) *
            2 *
            Math.PI,
          y0: Math.max(0, d.y0 - p.depth),
          y1: Math.max(0, d.y1 - p.depth),
        })
    );

    const t = d3Select(svgRef.current)
      .transition()
      .duration(event.altKey ? 7500 : 750);

    // Transition the data on all arcs, even the ones that aren’t visible,
    // so that if this transition is interrupted, entering arcs will start
    // the next transition from the desired position.
    path
      .transition(t)
      .tween("data", (d) => {
        const i = interpolate(d.current, d.target);
        return (t) => (d.current = i(t));
      })
      .filter(function (d) {
        return +this.getAttribute("fill-opacity") || arcVisible(d.target);
      })
      .attr("fill-opacity", (d) =>
        arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0
      )
      .attr("pointer-events", (d) => (arcVisible(d.target) ? "auto" : "none"))

      .attrTween("d", (d) => () => arc(d.current));

    label
      .filter(function (d) {
        return +this.getAttribute("fill-opacity") || labelVisible(d.target);
      })
      .transition(t)
      .attr("fill-opacity", (d) => +labelVisible(d.target))
      .attrTween("transform", (d) => () => labelTransform(d.current));
  }

  function arcVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  }

  function labelVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  function labelTransform(d) {
    const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
    const y = ((d.y0 + d.y1) / 2) * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }

  return (
    <div className="sunburst-chart">
      {loading && <pre>Loading...</pre>}
      <svg
        viewBox={`${VIEWBOX_MIN_X(width)}, ${VIEWBOX_MIN_Y(
          height
        )}, ${width}, ${height}`}
        ref={svgRef}
      ></svg>
    </div>
  );
};
