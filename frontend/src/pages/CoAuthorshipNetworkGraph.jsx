import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { Graph } from 'graphology';
import  louvain  from 'graphology-communities-louvain';
import "../index.css"

const CoAuthorshipNetworkGraph = ({ coAuthorData }) => {
     console.log("CoAuthorshipNetworkGraph ",coAuthorData);
    const svgRef = useRef();
    const tooltipRef = useRef();
    // Add a ref to track the original position
    const originalTooltipPosition = useRef({ x: 0, y: 0 });

    // // Your exact final output array
    // const coAuthorData = [
    //   { 
    //     id: "A1", 
    //     name: "Alice", 
    //     coAuthors: ["A2", "A3"]
    //   },
    //   { 
    //     id: "A2", 
    //     name: "Bob", 
    //     coAuthors: ["A1"] 
    //   },
    //   { 
    //     id: "A3", 
    //     name: "Charlie", 
    //     coAuthors: ["A1"] 
    //   },
    //   {
    //     id: "A4",
    //     name: "Diana",
    //     coAuthors: ["A2"] // Added to match your sample data
    //   }
    // ];
  
    useEffect(() => {
        if (!coAuthorData || coAuthorData.length === 0) return;

         // First filter: Only include authors with >2 co-authors
        const filteredData = coAuthorData.filter(author => 
          author.coAuthors.length > 2
        );

        // Second filter: Only include co-authors that exist in our filtered set
        const validAuthorIds = new Set(filteredData.map(a => a.id));
        const finalData = filteredData.map(author => ({
          ...author,
          coAuthors: author.coAuthors.filter(coId => validAuthorIds.has(coId))
        }));

        // Third filter: Remove authors who now have ≤2 co-authors after filtering
        const stronglyConnectedData = finalData.filter(author => 
          author.coAuthors.length > 2
        );

        console.log("Filtered network data:", stronglyConnectedData);


        // **** Prepare nodes and links directly from coAuthorData
        const nodes = stronglyConnectedData.map(author => ({//coAuthorData.map(author => ({
          id: author.id,
          name: author.name,
          size:(author.coAuthors.length * 0.5)+ 5// 5////author.coAuthors.length + 2 // Dynamic sizing
        }));
  
      const links = [];
      // stronglyConnectedData.forEach(author => {//coAuthorData.forEach(author => {
      //   author.coAuthors.forEach(targetId => {
      //     //if (coAuthorData.some(n => n.id === targetId)) { 
      //         links.push({
      //           source: author.id,
      //           target: targetId
      //         });
      //     //}
      //   });
      // });
      
      const nodeIds = new Set(nodes.map(n => n.id));
      stronglyConnectedData.forEach(author => {
        author.coAuthors.forEach(targetId => {
          if (nodeIds.has(targetId)) {
            links.push({
              source: author.id,
              target: targetId
            });
          }
        });
      });

      
        // *** Communities 
        // Detect communities
        const graph = new Graph();
        nodes.forEach(node => graph.addNode(node.id));
        links.forEach(link => {
          if (graph.hasNode(link.source) && graph.hasNode(link.target)) {
            graph.addEdge(link.source, link.target);
          }
          //graph.addEdge(link.source, link.target)
      });

         // Detect communities with Louvain
        const communities = louvain.assign(graph, {
            resolution: 1.0, // Default resolution
            getEdgeWeight: null // Treat all edges equally
        });
    
        // Assign communities to nodes
        nodes.forEach(node => {
            node.community = graph.getNodeAttribute(node.id, 'community');
        });

        // const communities = louvain.assign(graph);
        // nodes.forEach(node => node.community = communities[node.id]);

        // Color scale
        const color = d3.scaleOrdinal(d3.schemeTableau10);
    
        
      // **** Set up SVG
      const width = 1000, height = 700;
      const padding = 10; // Safe area padding

      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .style("background", "#f8f9fa");
  
      // Clear previous
      svg.selectAll("*").remove();
  
       // *** Add boundary forces
        const boundaryForce = (nodes, width, height, padding) => {
            nodes.forEach(node => {
            node.x = Math.max(padding, Math.min(width - padding, node.x));
            node.y = Math.max(padding, Math.min(height - padding, node.y));
            });
        };
    
      // Calculate community sizes
      const communitySizes = {};
      nodes.forEach(node => {
          const comm = node.community;
             communitySizes[comm] = (communitySizes[comm] || 0) + 1;
      });

         
      // Create simulation
      const simulation = d3.forceSimulation(nodes)
        // .force("link", d3.forceLink(links).id(d => d.id).distance(100))
        // .force("charge", d3.forceManyBody().strength(-100))
        .force("link", d3.forceLink(links)
            .id(d => d.id)
            .distance(100) // Reduced from 100 to bring nodes closer
            //.strength(0.8) // Stronger links to keep clusters tight
        )
        .force("charge", d3.forceManyBody()
            .strength(-30) // Reduced repulsion (from -100)
        )
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("boundary", () => boundaryForce(nodes, width, height, padding)) // Add boundary force
        // .force("collide", d3.forceCollide() // Add collision detection
        // .radius(d => d.size + 2) // Based on node size
        // .strength(0.7)
        // );
        

      // Draw links
      const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke", "#adb5bd")
        .attr("stroke-width", 1.5);
        
        let isDragging = false;
      // Draw nodes
      const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => d.size)
        .attr("fill", "#4dabf7")
        //.attr("stroke", "#228be6")
        .attr("fill", d => color(d.community))//color by cluster
        .attr("stroke-width", 2)
        .style("pointer-events", "visiblePainted") 
        .call(drag(simulation)
        );
  
      // Add labels
      const label = svg.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .text(d => d.name)
        .attr("font-size", "12px")
        .attr("dx", d => d.size + 5) // Position outside circle
        .attr("dy", "0.35em")
        .attr("fill", "#495057");
  
      // Update positions
      simulation.on("tick", () => {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);
  
        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
  
        label
          .attr("x", d => d.x)
          .attr("y", d => d.y);
      });
  
      // Drag interaction
      function drag(simulation) {
        return d3.drag()
          .on("start", (event) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
          })
          .on("drag", (event) => {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
          })
          .on("end", (event) => {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
          });
      }

      // function drag(simulation) {
      //   function dragstarted(event, d) {
      //     if (!event.active) simulation.alphaTarget(0.3).restart();
      //     d.fx = d.x;
      //     d.fy = d.y;
      //     // Bring node to front
      //     event.sourceEvent.stopPropagation();
      //     d3.select(this).raise();
      //   }
      
      //   function dragged(event, d) {
      //     d.fx = event.x;
      //     d.fy = event.y;
      //   }
      
      //   function dragended(event, d) {
      //     if (!event.active) simulation.alphaTarget(0);
      //     d.fx = null;
      //     d.fy = null;
      //   }
      
      //   return d3.drag()
      //     .on("start", dragstarted)
      //     .on("drag", dragged)
      //     .on("end", dragended);
      // }
        // // Add viewBox to enable pan/zoom if nodes go out of view
        // svg.attr("viewBox", [0, 0, width, height])
        // .attr("preserveAspectRatio", "xMidYMid meet");;

         // ********* Tooltip interaction
         // Track last click position
          const showTooltip = (event, d, showAll = false) => {
            console.log("d id ",d.id);
            event.stopPropagation();

            // if (event) {
            //   event.stopPropagation();
            //   lastClickPosition.current = {
            //     x: event.pageX - 30,
            //     y: event.pageY - 150
            //   };
            // }
             // Store original position on first show
            if (!showAll) {
              originalTooltipPosition.current = {
                x: event.pageX + 15,
                y: event.pageY + 15
              };
            }
            const tooltip = d3.select(tooltipRef.current);
            
            const author = coAuthorData.find(a => a.id === d.id);
            const coAuthorCount = author.coAuthors.length;
            const papersList = author.papers
            .map(paper => 
            

             `
            <li style="
              font-size: 12px;
              margin-bottom: 3px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              cursor: default;
            " title="${paper.title.replace(/"/g, '&quot;')}">
              ${paper.title}
            </li>`
            )
            .join('');

            // const displayCoAuthors = () => {
            //   if (showAll || coAuthorCount <= 5) {
            //     return author.coAuthors.map(id => {
            //       const coAuthor = coAuthorData.find(a => a.id === id);
            //       return `<li>${coAuthor?.name || id}</li>`;
            //     }).join("");
            //   } else {
            //     const topCoAuthors = author.coAuthors.slice(0, 3).map(id => {
            //       const coAuthor = coAuthorData.find(a => a.id === id);
            //       return `<li>${coAuthor?.name || id}</li>`;
            //     }).join("");
                
            //     return `
            //       ${topCoAuthors}
            //       <li class="more-link">and ${coAuthorCount - 3} more...</li>
            //     `;
            //   }
            // };

            tooltip
              .html(`
                <strong>${d.name}</strong>
                <div>Publications: ${author.publicationCount}</div>
                <div>Institutions: ${author.institutions.join(", ")}</div>
                <div style="margin-top: 8px; margin-bottom: 4px;">Papers:</div>
                <ul style="
                  margin: 0;
                  padding-left: 15px;
                  max-height: 150px;
                  overflow-y: auto;
                ">
                  ${papersList}
                </ul>
                <div>Co-authors : ${author.coAuthors.length}</div>
               
              `)
              .style("left", `${showAll ? originalTooltipPosition.current.x : event.pageX + 15}px`)
              .style("top", `${showAll ? originalTooltipPosition.current.y : event.pageY + 15}px`)
              .style("opacity", 1)
              .style("max-width", "400px");

            // tooltip
            // .html(`
            //   <strong>Hello!</strong>
            // `)
            // .style("left", `${showAll ? originalTooltipPosition.current.x : event.pageX + 15}px`)
            // .style("top", `${showAll ? originalTooltipPosition.current.y : event.pageY + 15}px`)
            // .style("opacity", 1);


            // // Add click handler for "more" link if not showing all
            // if (!showAll && coAuthorCount > 5) {
            //   tooltip.select(".more-link")
            //     .on("click", function(event) {
            //       event.stopPropagation();
            //       showTooltip(event, d, true);
            //     });
            // }

          };
        
          node.on("click", (event, d) => {
            console.log("Node onClick");
            event.stopPropagation();
            // Only show tooltip if not dragging
           if (!event.defaultPrevented) {
              showTooltip(event, d);
           }
          });
       
          // svg.on("mousedown", () => {
          //   console.log("Mouse down on SVG background");
          // });

          // Close tooltip when clicking anywhere
          const closeTooltip = () => {
            d3.select(tooltipRef.current).style("opacity", 0);
          };

          // Add click handler to SVG background
          svg.on("click", closeTooltip);


      return () => {
        simulation.stop();
        svg.on("click", null); // Clean up event handler
      }
    }, [coAuthorData]);
  
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <svg ref={svgRef} />

        {/* Add this tooltip div */}
        <div ref={tooltipRef} id="tooltip" style={{
        position: 'absolute',
        padding: '10px',
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        pointerEvents: 'auto', // Changed to allow clicking inside
        opacity: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 100,
        maxWidth: '300px'
      }}></div>
        {/* <div id="tooltip" style={{
          position: 'absolute',
          padding: '10px',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '4px',
          pointerEvents: 'none',
          opacity: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}></div> */}

        <div style={{ marginTop: '20px', color: '#868e96' }}>
          <p>Drag nodes to explore connections. Node size represents number of co-authors.</p>
        </div>
      </div>
    );
  };

export default CoAuthorshipNetworkGraph;