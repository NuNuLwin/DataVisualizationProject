import React, { useEffect, useRef } from "react";
import * as d3 from "d3";


const ChordDiagram = ({ matrix, institutions,  onChordClick }) => {
  const ref = useRef();

  
  useEffect(() => {
    if (!matrix || !institutions) return;

    const width = 800;
    const height = 800;
    const outerRadius = Math.min(width, height) * 0.5 - 180;
    const innerRadius = outerRadius - 30;

    const chord = d3.chord()
      .padAngle(0.02)
      .sortSubgroups(d3.descending);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const ribbon = d3.ribbon()
      .radius(innerRadius);

    const color = d3.scaleOrdinal(d3.schemeCategory10);//

    const svg = d3.select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const chords = chord(matrix);
      const collaborationCounts = new Array(institutions.length).fill(0);
      matrix.forEach((row, i) => {
        row.forEach((value, j) => {
          if (value > 0) {
            collaborationCounts[i] += value; // Count collaborations for institution i
          }
        });
      });

    // Create a tooltip div
    const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "white")
    .style("border", "1px solid #333")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none");

    // Draw arcs (nodes)
    const arcs = svg.append("g")
      .selectAll("g")
      .data(chords.groups)
      .enter()
      .append("g")
      .append("path")
      .attr("d", arc)
      .style("fill", (d) => color(d.index))
      .style("opacity", 0.5) 
      .style("stroke", "white")
      .on("mouseover", (event, d) => {
        const institution = institutions[d.index];
        const count = collaborationCounts[d.index];

        tooltip
        .style("visibility", "visible")
        .html(`
          ${institution.name}<br>
           Total Collaborations: ${count}
        `);
          d3.selectAll("path")
            .style("opacity", 0.1);
          arcs.filter((arcData) => arcData.index === d.index )
            .style("opacity", 1); 
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
        d3.selectAll("path")
        .style("opacity", 0.5);
  
      });

    // Draw chords (relationships)
    const chordPaths = svg.append("g")
    .selectAll("path")
    .data(chords)
    .enter()
    .append("path")
    .attr("d", ribbon)
    .style("fill", (d) => color(d.source.index))
    .style("opacity", 0.5) 
    .style("stroke", "white")
    .on("mouseover", (event, d) => {
      // Show tooltip on hover
      const sourceInstitution = institutions[d.source.index];
      const targetInstitution = institutions[d.target.index];
      const collaborationCount = matrix[d.source.index][d.target.index];

      tooltip
        .style("visibility", "visible")
        .html(`
          <strong>${sourceInstitution.name}</strong> ↔ <strong>${targetInstitution.name}</strong><br>
          Collaborations: ${collaborationCount} <br>
          <strong>Click to view co-authorship network </strong>
        `);
     
        d3.selectAll("path")
          .style("opacity", 0.1);
      
        d3.select(event.currentTarget)
          .style("opacity", 1);
        arcs.filter((arcData) => arcData.index === d.source.index || arcData.index === d.target.index)
          .style("opacity", 1); 
    })
    .on("mousemove", (event) => {
      // Move tooltip with the mouse
      tooltip
        .style("top", `${event.pageY - 10}px`)
        .style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", () => {
      // Hide tooltip on mouseout
      tooltip.style("visibility", "hidden");

      // Restore the opacity of all chords when mouseout
      d3.selectAll("path")
      .style("opacity", 0.5);

    })
    .on("click", (event, d) => {
      tooltip.style("visibility", "hidden");

      // Restore the opacity of all chords when mouseout
      d3.selectAll("path")
      .style("opacity", 0.5);

      if(onChordClick){
        const sourceInstitution = institutions[d.source.index];
        const targetInstitution = institutions[d.target.index];
        const sourceInstitutionId = sourceInstitution.id;
        const targetInstitutionId = targetInstitution.id;
        const sourceInstitutionName = sourceInstitution.name;
        const targetInstitutionName = targetInstitution.name;
        onChordClick({
          sourceInstitutionId,
          targetInstitutionId,
          sourceInstitutionName,
          targetInstitutionName
        })
      }
    });

    // Add institution labels with collaboration counts   
    svg.append("g")
      .selectAll("text")
      .data(chords.groups)
      .enter()
      .append("text")
      .each((d) => {
        d.angle = (d.startAngle + d.endAngle) / 2;
      })
      .attr("transform", (d) => `rotate(${d.angle * 180 / Math.PI - 90}) translate(${outerRadius + 10}) ${d.angle > Math.PI ? "rotate(180)" : ""}`)
      .attr("text-anchor", (d) => (d.angle > Math.PI ? "end" : null))
      .text((d) => institutions[d.index].name)
       .attr("dy", "-0.5em")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "black")
      .style("pointer-events", "none")
      .each(function (d) {
        const text = d3.select(this);
        const name = institutions[d.index].name;
        const count = collaborationCounts[d.index]; 

        const words = name.split(" ");
        const line1 = words.slice(0, Math.ceil(words.length / 2)).join(" "); 
        const line2 = words.slice(Math.ceil(words.length / 2)).join(" ");
    

      });

  }, [matrix, institutions]);

  return(
  <div>
      <svg ref={ref}></svg>
  </div>

  ) ;
};

export default ChordDiagram;
