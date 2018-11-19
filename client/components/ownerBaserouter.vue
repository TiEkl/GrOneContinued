<!-- baserouter.vue -->
<template>
<div>
  <div class="frame">
  

  </div>
</div>
</template>
<style>
         svg rect {
            fill: gray;
         }
         
         svg text {
            fill: yellow;
            font: 12px sans-serif;
            text-anchor: end;
         }
</style>
<script>
import * as d3 from 'd3';
  module.exports = {
    name:"BaseRouter",
    

  data() {
      return {
     height : 600,
     width : 600,
     data : {nodes: [{id:"", group:"" }], links: [{source:"", target:"", value:""}]}
      }
    },
    
  methods: {
      drawChart : function(data, drag) {
        console.log(data);
        const links = data.links.map(d => Object.create(d));
        const nodes = data.nodes.map(d => Object.create(d));
        const simulation = this.forceSimulation(nodes, links).on("tick", ticked);
        const scale = d3.scaleOrdinal(d3.schemeCategory10);
        
        const svg = d3.select(".frame").append("svg")
            .attr("viewBox", [-this.width / 2, -this.height / 2, this.width, this.height]);

        const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
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
            .attr("r", d => d.count * 5)
            .attr("fill",  d => scale(d.group))
            .call(drag(simulation));

        node.append("title")
            .text(d => d.id);

        

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
        return svg.node();
      },
      forceSimulation : function(nodes, links) {
        return d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter());
      },
      setData : function() {
        this.data = d3.json("/data/graphData.json");        
      },


    },
  mounted() {

    var test = this.setData();

     var drag = simulation => {
      
      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      
      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
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
    var color = d => {
        const scale = d3.scaleOrdinal(d3.schemeCategory10);
        return d => scale(d.group);
    }
    var test3={
      "nodes": [
          {"id": "1", "group": 1, "count": 3},
          {"id": "2", "group": 2,"count": 2},
          {"id": "3", "group": 2, "count": 2},
          {"id": "4", "group": 20, "count": 2},
          {"id": "5", "group": 7, "count": 1},
          {"id": "6", "group": 1, "count": 2}
        ],
        "links": [
          {"source": "1", "target": "2", "value": 10},
          {"source": "2", "target": "3", "value": 10},
          {"source": "1", "target": "4", "value": 5},
          {"source": "4", "target": "3", "value": 15},
          {"source": "6", "target": "5", "value": 15},
          {"source": "6", "target": "1", "value": 15}
        ]
      }

    this.drawChart(test3, drag, color);

  },
};


</script>

<style>
.frame{
  width:100%;
  height:100%;
  
}


</style>
