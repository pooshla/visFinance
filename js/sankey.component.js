var svg;
var sankey;
var spath, slink, snode;
var sankeyGraph;
var fontScale = d3.scale.linear()
	.range([8, 20]);
var sankeyGraph;
	
var formatNumber = d3.format(",.2f");    // zero decimal places
var format = function(d) { return formatNumber(d) + " " + mainComponent.units; };
var color = d3.scale.category20();
	
var margin = {top: 10, right: 10, bottom: 10, left: 10};
var width = 500 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

function drawSankeyDiagram(){
	sankeyGraph = $.extend(true, {}, mainComponent.financeGraph);
	
	svg = d3.select("#sankeyChart").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");	
	
	sankey = d3.sankey()
		.nodeWidth(15)
		.nodePadding(10)
		.size([width, height]);

	spath = sankey.link();
		
	//now loop through each nodes to make nodes an array of objects
    // rather than an array of strings
    sankeyGraph.nodes.forEach(function (d, i) {
		d.oldName = d.name;
		d.name = d.name + " ($" + d.value + ")";
    });
	
	sankeyGraph.nodes.sort(function(a, b){return b.value - a.value;});
	   
    // loop through each link replacing the text with its index from node
    sankeyGraph.links.forEach(function (d, i) {
		sankeyGraph.links[i].source = getNodeIndexByName(sankeyGraph.nodes, sankeyGraph.links[i].source);
		sankeyGraph.links[i].target = getNodeIndexByName(sankeyGraph.nodes, sankeyGraph.links[i].target);
    });
	
	sankey
		.nodes(sankeyGraph.nodes)
		.links(sankeyGraph.links)
		.layout(32);
		
	fontScale.domain(d3.extent(sankeyGraph.nodes, function(d) { return d.value }));

	// add in the links	
	slink = svg.append("g").attr("class", "linkContainer").selectAll(".link")
		.data(sankeyGraph.links, function(d) { return d.source.id+"-"+d.target.id; })
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
	snode = svg.append("g").attr("class", "nodeContainer").selectAll(".node")
		.data(sankeyGraph.nodes, function(d) { return d ? d.id : this.id; })
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

function updateSankeyDiagram(){
	sankeyGraph = $.extend(true, {}, mainComponent.financeGraph);
		
	//now loop through each nodes to make nodes an array of objects
    // rather than an array of strings
    sankeyGraph.nodes.forEach(function (d, i) {
		d.oldName = d.name;
		d.name = d.name + " ($" + d.value + ")";
    });
	
	sankeyGraph.nodes.sort(function(a, b){return b.value - a.value;});
	   
    // loop through each link replacing the text with its index from node
    sankeyGraph.links.forEach(function (d, i) {
		sankeyGraph.links[i].source = getNodeIndexByName(sankeyGraph.nodes, sankeyGraph.links[i].source);
		sankeyGraph.links[i].target = getNodeIndexByName(sankeyGraph.nodes, sankeyGraph.links[i].target);
    });
	
	sankey
		.nodes(sankeyGraph.nodes)
		.links(sankeyGraph.links)
		.layout(32);
		
	fontScale.domain(d3.extent(sankeyGraph.nodes, function(d) { return d.value }));

	var linkContainer = svg.selectAll(".linkContainer");
	
	console.log(linkContainer.selectAll(".link"));
	
	// add in the links	
	slink = linkContainer.selectAll(".link")
		.data(sankeyGraph.links, function(d) { return d.source.id+"-"+d.target.id; })
		.enter().append("path")
			.attr("class", "link")
			.attr("d", spath)
			.style("stroke", "red")
			.style("stroke-width", function(d) { return Math.max(1, d.dy); })
			.sort(function(a, b) { return b.dy - a.dy; });

	// add the link titles
	// slink.append("title")
		// .text(function(d) {
			// return d.source.name + " ? " + d.target.name + "\n" + format(d.value); 
		// });

	// add in the nodes
	// snode = svg.append("g").selectAll(".node")
		// .data(sankeyGraph.nodes, function(d) { return d ? d.id : this.id; })
		// .enter().append("g")
		// .attr("class", "node")
		// .attr("transform", function(d) { 
			// return "translate(" + d.x + "," + d.y + ")"; })
		// .call(d3.behavior.drag()
			// .origin(function(d) { return d; })
			// .on("dragstart", function() { 
				// this.parentNode.appendChild(this); })
			// .on("drag", dragmove));

	// add the rectangles for the nodes
	// snode.append("rect")
		// .attr("height", function(d) { return d.dy; })
		// .attr("width", sankey.nodeWidth())
		// .style("fill", function(d) { 
			// return d.color = color(d.name.replace(/ .*/, "")); })
		// .style("stroke", function(d) { 
			// return d3.rgb(d.color).darker(2); })
		// .append("title")
		// .text(function(d) { 
			// return d.name + "\n" + format(d.value); });

	// add in the title for the nodes
	// snode.append("text")
		// .attr("x", -6)
		// .attr("y", function(d) { return d.dy / 2; })
		// .attr("dy", ".35em")
		// .attr("text-anchor", "end")
		// .attr("transform", null)
		// .style("fill", function(d) {
			// return d3.rgb(d.color).darker(2.4);
		// })
		// .text(function(d) { return d.name; })
		// .style("font-size", function(d) {
			return "10px";
			// return Math.floor(fontScale(d.value)) + "px";
		// })
		// .filter(function(d) { return d.x < width / 2; })
		// .attr("x", 6 + sankey.nodeWidth())
		// .attr("text-anchor", "start");
}

function getNodeIndexByName(nodeList, name){
	for(var key in nodeList){
 		if(nodeList[key].oldName == name){
			return Number(key);
		}
	}
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