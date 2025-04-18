import { useEffect, useRef, useState } from "react";

/* d3 */
import {
  format as d3Format,
  hierarchy,
  interpolate,
  partition,
  select as d3Select,
  scaleOrdinal,
  schemeTableau10,
} from "d3";

/* components */
import { useData } from "./hooks/useData";
import { Loading } from "../Loading";

/* utils */
import {
  RADIUS_DIVIDER,
  VIEWBOX_MIN_X,
  VIEWBOX_MIN_Y,
} from "./constants/sunburstConstants";
import { arcVisible, labelTransform, labelVisible } from "./utils/arcUtils";
import {
  arcGenerator,
  pathGenerator,
  labelGenerator,
  circleGenerator,
  mainTitleGenerator,
} from "./utils/generators";

/* css */
import "./styles/SunburstChart.css";

export const SunburstChart = ({
  width = window.innerWidth,
  height = window.innerHeight,
  onSelectedTopic,
  selectedDomain,
}) => {
  const radius = width / RADIUS_DIVIDER;

  const [loading, setLoading] = useState(true);
  const svgRef = useRef();
  const data = useData(selectedDomain);

  let parent = null;
  let root = null;
  let path = null;
  let arc = null;
  let label = null;

  /* Hooks */
  useEffect(() => {
    if (svgRef.current && data) {
      setLoading(false);
      const color = scaleOrdinal(schemeTableau10);
      const chartHierarchy = hierarchy(data)
        .sum((d) => d.value)
        .sort((a, b) => b.value - a.value);

      root = partition().size([2 * Math.PI, chartHierarchy.height + 1])(
        chartHierarchy
      );

      root.each((d) => (d.current = d));

      mainTitleGenerator(svgRef, selectedDomain);

      // Create the arc generator.
      arc = arcGenerator(radius);

      // Append the arcs.
      path = pathGenerator(svgRef.current, root, arc, color);
      // Make them clickable if they have children.
      path
        .filter((d) => d.children)
        .style("cursor", "pointer")
        .on("click", clicked);

      path
        .filter((d) => d.children === undefined)
        .style("cursor", "pointer")
        .on("click", topicClicked);

      const format = d3Format(",d");
      path.append("title").text((d) => {
        let titleStr = "";
        let length = d.ancestors().length;

        if (length > 1) {
          titleStr += `${"Field: " + d.ancestors()[length - 2].data.name}`;
        }
        if (length > 2) {
          titleStr += `${
            "\nSub Field: " + d.ancestors()[length - 3].data.name
          }`;
        }
        if (length > 3) {
          titleStr += `${"\nTopic: " + d.ancestors()[length - 4].data.name}`;
        }
        titleStr += `${"\n\nWorks: " + format(d.value).toString()}`;

        return titleStr;
      });
      label = labelGenerator(svgRef.current, root, radius);

      parent = circleGenerator(svgRef.current, root, radius, clicked);
    }
  }, [data, selectedDomain]);

  /* Events */
  function topicClicked(event, p) {
    onSelectedTopic(p);
  }

  function clicked(event, p) {
    // set main title of sunburst for clicked element name
    mainTitleGenerator(svgRef, p?.data?.name || selectedDomain);

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
      .attrTween("transform", (d) => () => labelTransform(d.current, radius));
  }

  return (
    <div
      className="sunburst-chart"
      style={{
        width,
        height,
      }}
    >
      {loading && <Loading />}
      <svg
        viewBox={`${VIEWBOX_MIN_X(width)}, ${VIEWBOX_MIN_Y(
          height
        )}, ${width}, ${height}`}
        ref={svgRef}
      ></svg>
    </div>
  );
};
