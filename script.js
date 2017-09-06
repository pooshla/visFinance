var units = "Dollars";

var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 800 - margin.left - margin.right,
    height = 1200 - margin.top - margin.bottom;

var radius = Math.min(width, height) / 2;
	
var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

var y = d3.scale.linear()
    .range([0, radius]);

var partition = d3.layout.partition()
    .value(function(d) { return d.value; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });
	
var formatNumber = d3.format(",.2f"),    // zero decimal places
    format = function(d) { return formatNumber(d) + " " + units; },
    color = d3.scale.category20();

var sankey, slink, snode, spath;

var text, path;
	
$(document).ready(function(){
	loadUserValues();
	
	var svg = d3.select("#sankeyChart").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				  
	sankey = d3.sankey()
		.nodeWidth(36)
		.nodePadding(40)
		.size([width, height]);

	spath = sankey.link();
	
	
	normalizeBudget(financeTree);
	var financeGraph = {nodes: [financeTree], links: []};
	flatten(financeTree, financeGraph);
	calculateDerivedValues(financeGraph);
	updateGraphLinks(financeGraph);
	readdCalcedValues(financeTree, financeGraph);
	
	//month data
	var monthFinanceTree = $.extend(true, {}, financeTree);
	recurseDouble(monthFinanceTree);
	
	var monthFinanceGraph = {nodes: [monthFinanceTree], links: []};
	flatten(monthFinanceTree, monthFinanceGraph);
	
	var sankeyGraph = $.extend(true, {}, monthFinanceGraph);
	
	var valCache = {};
	// return only the distinct / unique nodes
    sankeyGraph.nodes = d3.keys(d3.nest()
		.key(function (d) {valCache[d.name] = d.value; return d.name; })
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
		.text(function(d) { return d.name; })
		.style("font-family", "sans-serif")
		.filter(function(d) { return d.x < width / 2; })
		.attr("x", 6 + sankey.nodeWidth())
		.attr("text-anchor", "start");

	
	var sunburstSvg = d3.select("#sunburstChart").append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");	  
		  
	var g = sunburstSvg.selectAll("g")
		.data(partition.nodes(monthFinanceTree))
		.enter().append("g");

	path = g.append("path")
		.attr("d", arc)
		.style("fill", function(d) { return color(d.name); })
		.on("click", click)
		.on("mouseover", mouseover);

	text = g.append("text")
		.attr("transform", function(d) { return "rotate(" + computeTextRotation(d) + ")"; })
		.attr("x", function(d) { return y(d.y); })
		.attr("dx", "6") // margin
		.attr("dy", ".35em") // vertical-align
		.style("font-family", "sans-serif")
		.text(function(d) { return d.name; });
	
	
	$(".scaleBtn").click(function(event){
		if($(event.target).html() == "Pay Period"){
			console.log("period");
		} else {
			console.log("month");
		}
	});
	
	$(".inputField").change(function(event){
		grossPay = $("$grossPayBox").val();
		dentalInsurance = $("$dentalInsuranceBox").val();
		visionInsurance = $("$visionInsuranceBox").val();
		healthInsurance = $("$healthInsuranceBox").val();
		hsaContributions = $("$hsaContributionsBox").val();
	});
});

function recalculate(){
	
}

function rejiggerData(){
	
}

function updateGraphLinks(financeGraph){
	$.each(financeGraph.links, function(key, link){
		link.value = getNodeByName(financeGraph.nodes, link.target).value;
	});
}

function readdCalcedValues(financeTree, financeGraph){
	financeTree.value = getNodeById(financeGraph.nodes, financeTree.id).value;
	
	$.each(financeTree.children, function(key, child){
		readdCalcedValues(child, financeGraph);
	});
}

function calculateDerivedValues(financeGraph){
	var stillNeedsWork = true;
	
	while(stillNeedsWork){
		stillNeedsWork = false;
		
		$.each(financeGraph.nodes, function(key, node){
			if(node.done == undefined || !node.done){
				if(node.derVal == undefined){
					node.done = true;
					return;
				} else if(node.derVal == "rollup") {
					var tmpSum = 0;
					var done = true;
					
					$.each(node.children, function(key2, val2){
						if(!val2.done){
							done = false;
							return;
						}
						tmpSum += val2.value;
					});
					
					if(done){
						node.done = true;
						node.value = tmpSum;
					} else {
						stillNeedsWork =  true;
					}
				} else if(node.derVal == "percentage"){
					var target = getNodeById(financeGraph.nodes, node.target);
					
					if(target.done){
						node.done = true;
						node.value = node.value * target.value;
					} else {
						stillNeedsWork = true;
					}
				} else if(node.derVal == "fedtax"){
					var target = getNodeById(financeGraph.nodes, node.target);
					
					if(target.done){
						node.done = true;
						node.value = c(0, 0, target.value);
					} else {
						stillNeedsWork = true;
					}
				} else if(node.derVal == "difference"){
					if(node.target == "siblings"){
						var parent = getNodeById(financeGraph.nodes, node.parentId);
						var tmpSum = 0;
						var done = true;
						
						$.each(parent.children, function(key2, val2){
							if(val2.id != node.id){//exclude itself
								if(!val2.done){
									done = false;
									return;
								}
								tmpSum += val2.value;
							}
						});
						
						if(done && parent.done){
							node.done = true;
							node.value = parent.value - tmpSum;
						} else {
							stillNeedsWork =  true;
						}
					} else {
						var target1 = getNodeById(financeGraph.nodes, node.target[0]);
						var target2 = getNodeById(financeGraph.nodes, node.target[1]);
						
						if(target1.done && target2.done){
							node.done = true;
							node.value = target1.value - target2.value;
						} else {
							stillNeedsWork = true;
						}
					}
				}
			}
		});
	}
}

function getNodeByName(nodeList, name){
	for(var i in nodeList){
		if(nodeList[i].name == name)
			return nodeList[i];
	}
}

function getNodeById(nodeList, id){
	for(var i in nodeList){
		if(nodeList[i].id == id)
			return nodeList[i];
	}
}

function recurseDouble(node){
	node.value *= 2;
	$.each(node.children, function(key, child){
		recurseDouble(child);
	});
}

function normalizeBudget(node){
	$.each(node.children, function(key, child){
		if(node.name != "Take Home")//budget is entered monthly, so dont double
			normalizeBudget(child);
		else{
			child.value /= 2;
		}
	});
}

function flatten(data, destGraph) {
    $.each(data.children, function(key, val){
		val.parentId = data.id;
		destGraph.nodes.push(val);
		destGraph.links.push({
			source: data.name,
			target: val.name,
			value: val.value
		});
		
		flatten(val, destGraph);
	});
}

function click(d) {
    // fade out all text elements
    text.transition().attr("opacity", 0);

    path.transition()
		.duration(750)
		.attrTween("d", arcTween(d))
		.each("end", function(e, i) {
			// check if the animated element's data e lies within the visible angle span given in d
			if (e.x >= d.x && e.x < (d.x + d.dx)) {
				// get a selection of the associated text element
				var arcText = d3.select(this.parentNode).select("text");
				// fade in the text element and recalculate positions
				arcText.transition().duration(750)
					.attr("opacity", 1)
					.attr("transform", function() { return "rotate(" + computeTextRotation(e) + ")" })
					.attr("x", function(d) { return y(d.y); });
			}
		});
}

function mouseover(d) {
	$("#valueBox").html(d.value);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {
	$("#valueBox").html("");
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