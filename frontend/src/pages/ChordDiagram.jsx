import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const ChordDiagram = ({ matrix, institutions }) => {
  const ref = useRef();

  
  useEffect(() => {
   // console.log("Chord Diagram matrix ",matrix+" institution "+institutions);
    if (!matrix || !institutions) return;

    const width = 800;
    const height = 800;
    const outerRadius = Math.min(width, height) * 0.5 - 150;
    const innerRadius = outerRadius - 30;

    const chord = d3.chord()//d3.chordDirected()//
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

      // Calculate collaboration counts for each institution
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
        // Show tooltip on hover
        const institution = institutions[d.index];
        const count = collaborationCounts[d.index];
  
         // Show tooltip on hover
        tooltip
        .style("visibility", "visible")
        .html(`
          ${institution}<br>
           Total Collaborations: ${count}
        `);

          // Highlight the hovered chord and hide others
          d3.selectAll("path")  // Hide all chords
            .style("opacity", 0.1);
        
          // // Show the hovered chord
          // d3.select(event.currentTarget)
          //   .style("opacity", 1);

          // Show associated arcs
          arcs.filter((arcData) => arcData.index === d.index )
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
  
      });

    // Draw chords (relationships)
    const chordPaths = svg.append("g")
    .selectAll("path")
    .data(chords)
    .enter()
    .append("path")
    .attr("d", ribbon)//The chords are typically passed to ribbon to display the network relationships.
    .style("fill", (d) => color(d.source.index))
    .style("opacity", 0.5) 
    .style("stroke", "white")
    .on("mouseover", (event, d) => {
      // Show tooltip on hover
      const sourceInstitution = institutions[d.source.index];
      const targetInstitution = institutions[d.target.index];
      const collaborationCount = matrix[d.source.index][d.target.index];

      //console.log("mouseover institution ",+sourceInstitution +" "+targetInstitution);
      tooltip
        .style("visibility", "visible")
        .html(`
          <strong>${sourceInstitution}</strong> ↔ <strong>${targetInstitution}</strong><br>
          Collaborations: ${collaborationCount}
        `);
        // Highlight the hovered chord and hide others
        d3.selectAll("path")  // Hide all chords
          .style("opacity", 0.1);
      
        // Show the hovered chord
        d3.select(event.currentTarget)
          .style("opacity", 1);
        // Show associated arcs
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
      .text((d) => institutions[d.index])
       .attr("dy", "-0.5em") // Adjust vertical alignment for multi-line text
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "black")
      .style("pointer-events", "none")
      .each(function (d) {
        const text = d3.select(this);
        const name = institutions[d.index];
        const count = collaborationCounts[d.index]; // Get collaboration count for this institution

        const words = name.split(" "); // Split the institution name into words
        const line1 = words.slice(0, Math.ceil(words.length / 2)).join(" "); // First line
        const line2 = words.slice(Math.ceil(words.length / 2)).join(" "); // Second line
    
        // // Add the first line (institution name)
        // text.append("tspan")
        //   .attr("x", 0)
        //   .attr("dy", "1.2em") // Adjust line spacing
        //   .text(line1);
    
        // // Add the second line (institution name continuation)
        // text.append("tspan")
        //   .attr("x", 0)
        //   .attr("dy", "1.2em") // Adjust line spacing
        //   .text(line2);

        // // Add the third line (collaboration count)
        // text.append("tspan")
        // .attr("x", 0)
        // .attr("dy", "1.2em") // Adjust line spacing
        // .style("font-weight", "bold")
        // .text(` ${count}`); //.text(`Collaboration Count: ${count}`); // Display collaboration count
      });

  }, [matrix, institutions]);

  return <svg ref={ref}></svg>;
};

export default ChordDiagram;
