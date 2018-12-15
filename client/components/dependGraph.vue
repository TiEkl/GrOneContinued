<!-- baserouter.vue -->
<template>
  <div>
  <div class="frame"></div>
</div>
</template>
<style>
body{
  
}
.axis path,
.axis line {
    fill: none;
    stroke: grey;
    stroke-width: 1;
    shape-rendering: crispEdges;
}
      
        
    
         
        
         .text {
           fill: black;
            font: 12px sans-serif;
            }
           
         .circle:hover .text{
             fill:black;
             font: 25px sans-serif;
         }
         .text:hover{
             fill:black;
         }
        
</style>
<script>

import * as d3 from 'd3';
  module.exports = {
    name:"dependGraph",
    
  data() {
      return {
        
     height : 600,
     width : 800
     
      }
    },
    
  methods: {
      drawChart : function(data, drag, stringToColour) {
        
        const links = data.links.map(d => Object.create(d));
        const nodes = data.nodes.map(d => Object.create(d));
        const simulation = this.forceSimulation(nodes, links).on("tick", ticked);
        
        const svg = d3.select(".frame").append("svg")
            .attr("viewBox", [-this.width / 2, -this.height /2, this.width, this.height]);

        var text = svg.append("g").selectAll("text")
                .data(nodes)
                .enter().append("text")
                .attr("class", "text")
                .attr("opacity", 0)
                .attr("x", 20)
                .attr("y", ".31em")
                .text(function(d) { return d.id; });
        
        const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0)
          .selectAll("line")
          .data(links)
          .enter().append("line")
            .attr("stroke-width", d => Math.sqrt(d.value));
            
        const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 3)
          .selectAll("circle")
          .data(nodes)
          .enter().append("circle")
          .attr("class", "circle")
            .attr("r", 5)

            .attr("fill",  d => stringToColour(d.package))
            .call(drag(simulation))
            .on("mouseover", mouseOver(.2))
        .on("mouseout", mouseOut)
        

        function ticked() {
          link
              .attr("x1", d => d.source.x)
              .attr("y1", d => d.source.y)
              .attr("x2", d => d.target.x)
              .attr("y2", d => d.target.y);
          
          node
              .attr("cx", d => d.x)
              .attr("cy", d => d.y);
            text.attr("transform", transform);
        }

        function transform(d) {
            return "translate(" + d.x + "," + d.y + ")";
        }

        var linkedByIndex = {};
        links.forEach(function(d) {
            linkedByIndex[d.source.index + "," + d.target.index] = 1;
        });
        function isConnected(a, b) {
            return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
        }

    // fade nodes on hover
        function mouseOver(opacity) {
            return function(d) {
                // check all other nodes to see if they're connected
                // to this one. if so, keep the opacity at 1, otherwise
                // fade
                // also style link accordingly
                node.style("stroke-opacity", function(o) {
                    var thisOpacity = isConnected(d, o) ? 1 : opacity;
                    return thisOpacity;})
                    .transition().duration(1000);;
                node.style("fill-opacity", function(o) {
                var thisOpacity = isConnected(d, o) ? 1 : opacity;
                    return thisOpacity;})
                    .transition().duration(1000);
                link.style("stroke-opacity", function(o) {
                    return o.source === d || o.target === d ? 1 : opacity;
                }).transition().duration(1000);
                link.style("stroke", function(o){
                    return o.source === d || o.target === d ? o.source.colour : "#fff";
                }).transition().duration(1000);
                
                text.style("opacity", function(o) {
                    var thisOpacity = isConnected(d, o) ? 1 : opacity;
                    return thisOpacity;})
                    .transition().duration(1000);;
                text.style("fill-opacity", function(o) {
                var thisOpacity = isConnected(d, o) ? 1 : opacity;
                    return thisOpacity;})
            };
        }
        function mouseOut() {
            node.style("stroke-opacity", 1).transition().duration(1000);
            node.style("fill-opacity", 1).transition().duration(1000);
            link.style("stroke-opacity", 0).transition().duration(1000);
            link.style("stroke", "#ddd").transition().duration(1000);
            text.style("opacity", 0).transition().duration(1000);
            
            
        }
        return svg.node();
      },
      forceSimulation : function(nodes, links) {
        return d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(40).strength(1))
            .force("charge", d3.forceManyBody())
            .force("collide", d3.forceCollide().radius(25))
            .force("center", d3.forceCenter());
      }
    },
  mounted() {
     var drag = simulation => {
      
      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      
      function dragged(d) {
       // d.fx = d3.event.x;
       // d.fy = d3.event.y;
      }
      
      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
    } 
    var stringToColour = str => {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var colour = '#';
        for (var i = 0; i < 3; i++) {
            var value = (hash >> (i * 8)) & 0xFF;
            colour += ('00' + value.toString(16)).substr(-2);
        }
        return colour;
    }    
   
  d3.json("/api/dependencies")
    .then( data =>  {
      console.log(JSON.stringify(data));
      this.drawChart(data, drag, stringToColour);
    });
    
  },
};
</script>

