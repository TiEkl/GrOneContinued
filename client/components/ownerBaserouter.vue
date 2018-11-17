<!-- baserouter.vue -->
<template>
<div>
  <div class="frame">
  
    <canvas width="960" height="500" />

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
var canvas = document.querySelector("canvas"),
    context = canvas.getContext("2d"),
    width = canvas.width,
    height = canvas.height;


  module.exports = {
    name:"BaseRouter",
    

  data() {
      return {
        data : {
          nodes: [
            {"id": "1", "group": 1},
            {"id": "2", "group": 2},
            {"id": "3", "group": 2},
            {"id": "4", "group": 1}
          ],
          links: [
            {"source": "1", "target": "2", "value": 10},
            {"source": "2", "target": "3", "value": 10},
            {"source": "1", "target": "4", "value": 5},
            {"source": "4", "target": "3", "value": 15}
          ]
        }
      }
    },
    methods: {
    ticked: function() {

      var margin = 20;
      this.data.nodes.forEach (function(d) {
        d.x = Math.max(margin, Math.min(width - margin, d.x))
        d.y = Math.max(margin, Math.min(height - margin, d.y))
      })

      context.clearRect(0, 0, width, height);

      context.beginPath();
      this.data.links.forEach(drawLink);
      context.strokeStyle = "#aaa";
      context.stroke();

      context.beginPath();
      this.data.nodes.forEach(drawNode);
      context.fill();
      context.strokeStyle = "#fff";
      context.stroke();
    },
    drawLink: function(d) {
      context.moveTo(d.source.x, d.source.y);
      context.lineTo(d.target.x, d.target.y);
    },
    drawNode:  function(d) {
      context.moveTo(d.x + 3, d.y);
      context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
    }

    },
  mounted() {
    var simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function(d) { return d.id; }))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));

 
        simulation
        .nodes(this.data.nodes)
        .on("tick", ticked)
        .force("link")
        .links(this.data.links);  


    d3.select(canvas)
        .call(d3.drag()
            .container(canvas)
            .subject(dragsubject));
  },
};


</script>

<style>
.frame{
  width:100%;
  height:100%;
  
}


</style>
