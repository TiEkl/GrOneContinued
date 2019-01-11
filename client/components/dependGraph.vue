<template>
  <div>
    <div class="row">
        <div class="col-sm-1">
            <button class="btn btn-secondary" align="left" v-if="!loading" id="filterBtn" v-bind="filterBtn" @click='hideFilter()'>{{filterBtn.txt}}</button>
        </div>
        <div class="col-sm-1">
            <div class="dropdown">
                <button class="btn btn-secondary" id="legend" align="left" v-if="!loading">Legend</button>
                <div class="dropdown-content">
                    <p><b style="color:#f90000;">Red</b> links are between different packages </p>
                    <p><b style="color:#00f904;">Green</b> links are within the same package </p>
                    <p>Nodes are colored based on the package name </p>
                    <p>Links and nodes are only shown for the checked packages in the filter </p>
                    <p>The size of nodes depends on their own dependencies</p>  
                </div>
            </div>
        </div>
        <div class="col-sm-1"/>
        <div class="col-sm-6">
           <h3 align="center" v-if='!loading' v-bind='bbResponder'>Request handled by {{bbResponder.ip}}</h3>        
            <div v-if="loading && error_in_process===false" class="loadingBar">
                <div id="progress">
                    <div class="stripes animated" id="bar">
                        Processing request
                    </div>
                </div>
            </div>
             <!-- Error message that is displayed if the processing of a project failed -->
            <div v-if="error_in_process===true">
                <div >
                    <div >Error! Service unavailable or not able to process GitHub repository</div>
                </div>
            </div>
        </div>
        <div class="col-sm-3"/>      
    </div>

        <div id="sidebar" style="display: none;">
            <div class="item-group">
                <label class="item-label">Filter</label> 
                <input id="checkAll" type="checkbox" checked/>
                <label for="checkAll"> Check / uncheck all</label> 
                <div id="filterContainer" class="filterContainer checkbox-interaction-group"></div>
            </div>
        </div>
  <div class="frame" id="svgFrame"></div>
</div>
</template>


<style>

    .btn-secondary {
        background-color: #353a3f;
        color: white; 
    }

    .dropdown {
        position: relative;
        display: inline-block;
    }
    .dropdown-content {
        display: none;
        position: absolute;
        background-color: #353a3f;
        color: white;
        min-width: 500px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 3;
        border-radius: 10px;
        border: 5px solid #353a3f;
        text-align:left;
        padding-left: 5px;
    }
    .dropdown:hover .dropdown-content {
        display: block;
    }


    .frame {
        min-height : 200vh;
        min-width : 100vw;
        position: absolute;
        overflow: auto; 
    }
    #sidebar {
        position: absolute;
        border-radius: 5px;
        z-index: 2;
        padding: 10px;
        margin: 5px;
        margin-left: -2px;
        border-right: 5px solid #353a3f;
        border-bottom: 5px solid #353a3f;
        border-top: 5px solid #353a3f;
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
        font: 18px sans-serif;
        pointer-events: none;
    }

   #progress{
        width: 100%;
        background-color: lightgray;
        border-radius: 20px;
    }
    #bar{
        height: 30px;
        background-color: green;
        color: white;
        border-radius: 20px;
    }
       @keyframes animate-stripes {
        0% {
       background-position: 0 0;
        }

        100% {
       background-position: 60px 0;
        }
    }
    .stripes{
        background-size: 30px 30px;
        background-image: linear-gradient(
       135deg,
       rgba(255, 255, 255, .15) 25%,
       transparent 25%,
       transparent 50%,
       rgba(255, 255, 255, .15) 50%,
       rgba(255, 255, 255, .15) 75%,
       transparent 75%,
       transparent
        );
    }
    .stripes.animated {
         animation: animate-stripes 0.6s linear infinite;
         animation-duration: 1.75s;
    }

</style>


<script>
    import * as d3 from 'd3';
    module.exports = {
        name:"dependGraph",
        data() {
            return {
            bbResponder: {ip: null},
            loading: true,
            filterBtn: {txt: 'Hide filter', visible: true },
            error_in_process: false
            }
        },
    
        methods: {
            drawChart : function(data, drag, stringToColour, linkColour) {
                var packageSet = new Set();
                var height = document.getElementById("svgFrame").clientHeight;
                var width = document.getElementById("svgFrame").clientWidth;

                console.log("Drawchart height " + height)
                console.log("drawchart width " + width)
                
                const links = data.links.map(d => Object.create(d));
                const nodes = data.nodes.map(d => Object.create(d));
                const simulation = this.forceSimulation(nodes, links).on("tick", ticked);
        
                for(let i=0; i < data.nodes.length; i++) {
                    packageSet.add(data.nodes[i].package);
                }
                var packageArr = [...packageSet];

                const svg = d3.select(".frame").append("svg")
                    .style("width", width)
                    .style("height", height)
        
                const link = svg.append("g")
                    .attr("stroke", "#ddd")
                    .attr("stroke-opacity", 0.3)
                    .selectAll("line")
                    .data(links)
                    .enter().append("line")
                    .attr("class", "line")
                    .attr("stroke-width", d => Math.sqrt(d.value)*2)
            
            
                const node = svg.append("g")
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 1)
                    .selectAll("circle")
                    .data(nodes)
                    .enter().append("circle")
                    .attr("class", "circle")
                    .attr("r", d => (Math.sqrt(d.count)+3)*2)
                    .attr("fill",  d => stringToColour(d.package))
                    .call(drag(simulation))
                    .on("mouseover", mouseOver(.2))
                    .on("mouseout", mouseOut)
                var text = svg.append("g").selectAll("text")
                    .data(nodes)
                    .enter().append("text")
                    .attr("class", "text")
                    .attr("opacity", 0)
                    .attr("x", 20)
                    .attr("y", ".31em")
                    .text(function(d) { return d.id; });

                function ticked() {

                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);
          
                node
                    .attr("cx", function(d) { return d.x = Math.max(0 +((Math.sqrt(d.count)+3)*2), Math.min(width - ((Math.sqrt(d.count)+3)*2), d.x)); })
                    .attr("cy", function(d) { return d.y = Math.max(0 +((Math.sqrt(d.count)+3)*2), Math.min(height - ((Math.sqrt(d.count)+3)*2), d.y)); });
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
            let width = document.getElementById("svgFrame").clientWidth;
            let height = document.getElementById("svgFrame").clientHeight;

         return d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id)) //.distance(100))
            .force("charge", d3.forceManyBody().distanceMax(250).strength(-100))
            .force("collide", d3.forceCollide().radius(30))
            .force("center", d3.forceCenter(width /2 , height/2))

      },

      hideFilter : function() {
            if(this.filterBtn.visible === true) {
                this.filterBtn.txt = 'Show filter';
                this.filterBtn.visible = false;
            }
            else {
                this.filterBtn.txt = 'Hide filter';
                this.filterBtn.visible = true;
            }
            $('#sidebar').toggle('slide', {direction: 'left'}, 750);
      },
        reDraw : function() {
            let width = document.getElementById("svgFrame").clientWidth;
            let height = document.getElementById("svgFrame").clientHeight;
            let svg = d3.select('svg');
            svg.attr("width", width)
                .attr("height", height);
      },
    },
    mounted() {  
        var drag = simulation => {
        window.addEventListener('resize', this.reDraw);
        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        
        function dragged(d) {
            let width = document.getElementById("svgFrame").clientWidth;
            let height = document.getElementById("svgFrame").clientHeight;

            d.fx = Math.max(0 +((Math.sqrt(d.count)+3)*2), Math.min(width -((Math.sqrt(d.count)+3)*2) , d3.event.x));
            d.fy = Math.max(0 +((Math.sqrt(d.count)+3)*2), Math.min(height -((Math.sqrt(d.count)+3)*2), d3.event.y));
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

        const ownerName = this.$route.params.ownerName;
        const repoName = this.$route.params.repoName;
        
        
        $(document).ready(function() {
            $('#checkAll').click(function() {
                var checked = $(this).prop('checked');
                $('#filterContainer').find('input:checkbox').prop('checked', !checked);
                $('#filterContainer').find('input:checkbox').click();
            })
        })
        
        d3.json(`/api/bb/${ownerName}/${repoName}` )
        .then( (data) =>  {
            this.bbResponder.ip = data.ip;
            this.loading = false;
            if(data === null){
                return setTimeout(()=>{
                    d3.json(`/api/bb/${ownerName}/${repoName}`)
                    .then((data)=>{
                        var graphData = data.projectNode.classes;
                        this.drawChart(graphData, drag, stringToColour,linkColour);
                    });
                }, 2000)
            }
            var graphData = data.projectNode.classes;
            this.drawChart(graphData, drag, stringToColour,linkColour);
        })
        .catch((error)=>{
            this.error_in_process = true;
        });
    
        }
    };
</script>

