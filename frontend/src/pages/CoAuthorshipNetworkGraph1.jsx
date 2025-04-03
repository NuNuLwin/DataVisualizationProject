import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

import { Graph } from 'graphology';
import  louvain  from 'graphology-communities-louvain';


const CoAuthorshipNetworkGraph1 = ({ coAuthorData }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!coAuthorData || coAuthorData.length === 0) return;

          // Specify the dimensions of the chart.
  const width = 928;
  const height = 600;

        // **** Prepare nodes and links directly from coAuthorData
      const nodes = coAuthorData.map(author => ({
        id: author.id,
        name: author.name,
        size: 5,//author.coAuthors.length + 2 // Dynamic sizing
        x: width / 2 + (Math.random() - 0.5) * 100, // Initialize near center
        y: height / 2 + (Math.random() - 0.5) * 100
      }));
  
      const links = [];
      coAuthorData.forEach(author => {
        author.coAuthors.forEach(targetId => {
          //if (coAuthorData.some(n => n.id === targetId)) { 
              links.push({
                source: author.id,
                target: targetId
              });
          //}
        });
      });

       // *** Communities 
        // Detect communities
        // const graph = new Graph();
        // nodes.forEach(node => graph.addNode(node.id));
        // links.forEach(link => graph.addEdge(link.source, link.target));

        //  // Detect communities with Louvain
        // const communities = louvain.assign(graph, {
        //     resolution: 1.0, // Default resolution
        //     getEdgeWeight: null // Treat all edges equally
        // });
    
        // // Assign communities to nodes
        // nodes.forEach(node => {
        //     node.community = graph.getNodeAttribute(node.id, 'community');
        // });

        // // const communities = louvain.assign(graph);
        // // nodes.forEach(node => node.community = communities[node.id]);

        // // Color scale
        // const color = d3.scaleOrdinal(d3.schemeTableau10);


        // *** Create a simulation with several forces.
        const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked);

        // Create the SVG container.
        const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

        // Clear previous
        svg.selectAll("*").remove();

        // Add a line for each link, and a circle for each node.
        const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll()
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));


        const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll()
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        //.attr("fill", d => color(d.group));
        //.attr("fill", d => color(d.community))//color by cluster

        node.append("title")
        .text(d => d.name);

                // Add a drag behavior.
        node.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

        // Set the position attributes of links and nodes each time the simulation ticks.
        function ticked() {
        link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

        node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
        }

        // Reheat the simulation when drag starts, and fix the subject position.
        function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
        }

        // Update the subject (dragged node) position during drag.
        function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
        }

        // Restore the target alpha so the simulation cools after dragging ends.
        // Unfix the subject position now that it’s no longer being dragged.
        function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
        }

        // When this cell is re-run, stop the previous simulation. (This doesn’t
        // really matter since the target alpha is zero and the simulation will
        // stop naturally, but it’s a good practice.)
       return () => simulation.stop();// invalidation.then(() => simulation.stop());

    },[coAuthorData])

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#343a40', marginBottom: '16px' }}>
            Co-Authorship Network
          </h2>
          <svg ref={svgRef} />
          <div style={{ marginTop: '20px', color: '#868e96' }}>
            <p>Drag nodes to explore connections. Node size represents number of co-authors.</p>
          </div>
        </div>
      );
}

export default CoAuthorshipNetworkGraph1;