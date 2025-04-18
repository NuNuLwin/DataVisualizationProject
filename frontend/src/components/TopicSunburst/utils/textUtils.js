import { select as d3Select } from "d3";

export const wrapText = (text, maxWidth, svgRef) => {
  if (!text) return [];
  const words = text.split(" ");
  let lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? currentLine + " " + word : word;
    const testWidth = d3Select(svgRef.current)
      .append("g")
      .attr("class", "temp-wrapper")
      .append("text")
      .text(testLine)
      .style("visibility", "hidden")
      .node()
      .getComputedTextLength();

    if (testWidth > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) lines.push(currentLine);

  d3Select(svgRef.current).select("g.temp-wrapper").remove();

  return lines;
};
