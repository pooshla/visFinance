var svg;
var sankey;
var spath, slink, snode;
var sankeyGraph;
var fontScale = d3.scale.linear()
	.range([8, 30]);
	
// var formatNumber = d3.format(",.2f"),    // zero decimal places
    // format = function(d) { return formatNumber(d) + " " + units; },
    // color = d3.scale.category20();
	
// var margin = {top: 10, right: 10, bottom: 10, left: 10},
    // width = 800 - margin.left - margin.right,
    // height = 1200 - margin.top - margin.bottom;

// var radius = Math.min(width, height) / 2;

// var x = d3.scale.linear()
    // .range([0, 2 * Math.PI]);

// var y = d3.scale.linear()
    // .range([0, radius]);

function drawSankeyDiagram(){
	svg = d3.select("#sankeyChart").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");	
	
	console.log($("#sankeyChart").width() + " " + $("#sankeyChart").height());
	
	sankey = d3.sankey()
		.nodeWidth(36)
		.nodePadding(40)
		.size([$("#sankeyChart").width(), $("#sankeyChart").height()]);

	spath = sankey.link();
	
	var valCache = {};
	// return only the distinct / unique nodes
    sankeyGraph.nodes = d3.keys(d3.nest()
		.key(function (d) {
			valCache[d.name] = d.value; 
			return d.name; 
		})
		.map(sankeyGraph.nodes));
	   
    // loop through each link replacing the text with its index from node
    sankeyGraph.links.forEach(function (d, i) {
		sankeyGraph.links[i].source = sankeyGraph.nodes.indexOf(sankeyGraph.links[i].source);
		sankeyGraph.links[i].target = sankeyGraph.nodes.indexOf(sankeyGraph.links[i].target);
    });

    //now loop through each nodes to make nodes an array of objects
    // rather than an array of strings
    sankeyGraph.nodes.forEach(function (d, i) {
		sankeyGraph.nodes[i] = { "name": d + " ($"+valCache[d]+")" };
    });
	
	sankeyGraph.nodes.sort(function(a, b){return b.value - a.value;});
	
	sankey
		.nodes(sankeyGraph.nodes)
		.links(sankeyGraph.links)
		.layout(32);
		
	fontScale.domain(d3.extent(sankeyGraph.nodes, function(d) { return d.value }));

	// add in the links	
	slink = svg.append("g").selectAll(".link")
		.data(sankeyGraph.links)
		.enter().append("path")
			.attr("class", "link")
			.attr("d", spath)
			.style("stroke-width", function(d) { return Math.max(1, d.dy); })
			.sort(function(a, b) { return b.dy - a.dy; });

	// add the link titles
	slink.append("title")
		.text(function(d) {
			return d.source.name + " ? " + d.target.name + "\n" + format(d.value); 
		});

	// add in the nodes
	snode = svg.append("g").selectAll(".node")
		.data(sankeyGraph.nodes)
		.enter().append("g")
		.attr("class", "node")
		.attr("transform", function(d) { 
			return "translate(" + d.x + "," + d.y + ")"; })
		.call(d3.behavior.drag()
			.origin(function(d) { return d; })
			.on("dragstart", function() { 
				this.parentNode.appendChild(this); })
			.on("drag", dragmove));

	// add the rectangles for the nodes
	snode.append("rect")
		.attr("height", function(d) { return d.dy; })
		.attr("width", sankey.nodeWidth())
		.style("fill", function(d) { 
			return d.color = color(d.name.replace(/ .*/, "")); })
		.style("stroke", function(d) { 
			return d3.rgb(d.color).darker(2); })
		.append("title")
		.text(function(d) { 
			return d.name + "\n" + format(d.value); });

	// add in the title for the nodes
	snode.append("text")
		.attr("x", -6)
		.attr("y", function(d) { return d.dy / 2; })
		.attr("dy", ".35em")
		.attr("text-anchor", "end")
		.attr("transform", null)
		.style("fill", function(d) {
			return d3.rgb(d.color).darker(2.4);
		})
		.text(function(d) { return d.name; })
		.style("font-size", function(d) {
			//return "10px";
			return Math.floor(fontScale(d.value)) + "px";
		})
		.filter(function(d) { return d.x < width / 2; })
		.attr("x", 6 + sankey.nodeWidth())
		.attr("text-anchor", "start");
}

// the function for moving the nodes
function dragmove(d) {
    d3.select(this).attr("transform", 
        "translate(" + d.x + "," + (
                d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
            ) + ")");
    sankey.relayout();
    slink.attr("d", spath);
}