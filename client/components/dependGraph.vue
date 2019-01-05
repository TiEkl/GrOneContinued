<template>
  <div>
     <div id="sidebar" style="display: none;">
    <div class="item-group">
        <label class="item-label">Filter</label>  
            <div id="filterContainer" class="filterContainer checkbox-interaction-group"></div>
    </div>
</div>
  <div class="frame">
      
  </div>
</div>
</template>


<style>
#sidebar {
    position: absolute;
    z-index: 2;
    background-color: #FFF;
    padding: 10px;
    margin: 5px;
    border: 1px solid #6895b4;
    min-height: 3px;
    min-width: 8px;
}
.item-group {
    margin-bottom: 5px;
}
.item-group .item-label {
    width: 90px;
    text-align: right;
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: bold;
    position: relative;
    min-height: 1px;
    margin-top: 5px;
    display: inline;
    padding-right: 5px;
    font-size: .90em;
}
.checkbox-interaction-group {
    margin-left: 10px;
    margin-top: 5px;
    clear: both;
}
.checkbox-container {
    display: block;
    min-height: 22px;
    vertical-align: middle;
    margin-left: 10px;
}
.checkbox-container label {
    display:inline;
    margin-bottom: 0px;
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
    var axios = require('axios');
    module.exports = {
        name:"dependGraph",
        data() {
            return {
            height : 1000,
            width : 1000
            }
        },
    
        methods: {
            drawChart : function(data, drag, stringToColour, linkColour) {
                var packageSet = new Set();
                const links = data.links.map(d => Object.create(d));
                const nodes = data.nodes.map(d => Object.create(d));
                const simulation = this.forceSimulation(nodes, links).on("tick", ticked);
        
                for(let i=0; i < data.nodes.length; i++) {
                    packageSet.add(data.nodes[i].package);
                }
                var packageArr = [...packageSet];

                const svg = d3.select(".frame").append("svg")
                    .attr("viewBox", [-this.width / 2, -this.height /2, this.width, this.height])
                        var text = svg.append("g").selectAll("text")
                                .data(nodes)
                                .enter().append("text")
                                .attr("class", "text")
                                .attr("opacity", 0)
                                .attr("x", 20)
                                .attr("y", ".31em")
                                .text(function(d) { return d.id; });
        
                const link = svg.append("g")
                    .attr("stroke", "#ddd")
                    .attr("stroke-opacity", 0.3)
                .selectAll("line")
                .data(links)
                .enter().append("line")
                .attr("class", "line")
                    .attr("stroke-width", d => Math.sqrt(d.value))
            
            
                const node = svg.append("g")
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 1)
                .selectAll("circle")
                .data(nodes)
                .enter().append("circle")
                .attr("class", "circle")
                    .attr("r", d => Math.sqrt(d.count)+3)
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
                            return o.source === d || o.target === d ? linkColour(o.withinPackage) : "#fff";
                        }).transition().duration(1000);
                        
                        text.style("opacity", function(o) {
                            var thisOpacity = isConnected(d, o) ? 1 : opacity;
                            return thisOpacity;})
                            .transition().duration(1000);;
                        text.style("fill-opacity", function(o) {
                        var thisOpacity = isConnected(d, o) ? 1 : 0;
                            return thisOpacity;})
                    };
                }
                function mouseOut() {
                    node.style("stroke-opacity", 1).transition().duration(1000);
                    node.style("fill-opacity", 1).transition().duration(1000);
                    link.style("stroke-opacity", 0.3).transition().duration(1000);
                    link.style("stroke", "#ddd").transition().duration(1000);
                    text.style("opacity", 0).transition().duration(1000);
                    
                    
                }
                createFilter(); 
                function createFilter() {
                    d3.select(".filterContainer")
                    .selectAll("div")
                    .data(packageArr)
                    .enter()
                    .append("div")
                    .attr("class", "checkbox-container")
                    .append("label")
                    .style("color", d => stringToColour(d))
                    .style("font-weight", "bold")
                    .each(function(d) {
                // create checkbox for each data
                    d3.select(this)
                    .append("input")
                    .attr("type", "checkbox")
                    .attr("id", function(d) {
                    return "chk_" + d;
                    })

                    .attr("checked", true)
                    .on("click", function(d, i) {
                    // register on click event
                    var lVisibility = this.checked ? "visible" : "hidden";
                    filterGraph(d, lVisibility);
                    });
                d3.select(this)
                    .append("span")
                    .text(function(d) {
                    return d;
                    });
                });

                    $("#sidebar").show(); // show sidebar
                }
                function filterGraph(aType, aVisibility) {
                    console.log(aType +" space " +  aVisibility);
                    
                    //Checks if the checkbox for the node's package is checked or not
                    //if un-checked, hide the node
                    node.style("visibility", function(o) {
                        var lOriginalVisibility = $(this).css("visibility");
                        return o.package === aType ? aVisibility : lOriginalVisibility;
                    });
                    //Checks if the checkbox for the text's (which is tied to a node) 
                    //package is checked or not
                    //if un-checked, hide the text
                    text.style("visibility", function(o) {
                        var lOriginalVisibility = $(this).css("visibility");
                        return o.package === aType ? aVisibility : lOriginalVisibility;
                    });
                    

                    //Hide the links. Checks the checkbox for the srcPkg
                    //and targetPkg, if either of them is un-checked, hide the link
                    link.style("visibility", function(o, i) {

                        var sourceOriVis = $("#chk_" + o.srcPkg).prop('checked')
                        var targetOriVis = $("#chk_" + o.targetPkg).prop('checked')
                        if (sourceOriVis == false || targetOriVis == false) {
                            return 'hidden';
                        }
                        else if (sourceOriVis == true && targetOriVis == true) {
                            return 'visible';
                        }

                    });
                };
        return svg.node();
      },

      forceSimulation : function(nodes, links) {
         return d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id)) //.distance(100))
            .force("charge", d3.forceManyBody().distanceMax(180).strength(-80))
            .force("collide", d3.forceCollide().radius(20))
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

            var linkColour = check => {

        if(check === true) {
            return '#00f904';
        }
        else if (check === false) {
            return '#f90000';
        }

        }

        console.log('above D3!!  ');
        const parameters = this.$route.params.graphId;
        console.log(parameters);
        //console.log(this.$route.params);
        
        
        d3.json("/api/" + parameters)

        .then( (data) =>  {

            if(data.data === null){
                return setTimeout(()=>{
                    d3.json("/api/" + parameters) //should be "/api/bb/" + parameters ??
                    .then((data)=>{
                        console.log('in the timeout method!');
                        var graphData = data.data.classes;
                        this.drawChart(graphData, drag, stringToColour,linkColour);
                    });
                }, 2000)
            }
            var graphData = data.data.classes;
            this.drawChart(graphData, drag, stringToColour,linkColour);
        });
    
        }
    };
</script>

