var sunburstSvg;
var g;
var path;
var text;

var arc = d3.svg.arc()
    .startAngle(function(d) { d.x0s = d.x0; return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(function(d) { d.x1s = d.x1; return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });
	
var partition = d3.layout.partition()
    .value(function(d) { return d.value; });


var swidth = 500;
var sheight = 500;
var radius = Math.min(swidth, sheight) / 2;	
var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

var y = d3.scale.linear()
    .range([0, radius]);
	
var sunburstTree;
	
var formatNumber = d3.format(",.2f");    // zero decimal places
var format = function(d) { return formatNumber(d) + " " + mainComponent.units; };
var color = d3.scale.category20();

function drawSunburstDiagram(){
	sunburstTree = $.extend(true, {}, mainComponent.financeTree.children.grossPay);
	//we used maps to store children, so we need to turn them into lists to make d3 happy...
	listify(sunburstTree);
	
	sunburstSvg = d3.select("#sunburstChart").append("svg")
		.attr("width", swidth - 10)
		.attr("height", sheight - 10)
		.append("g")
		.attr("transform", "translate(230,250)");	  
	
	g = sunburstSvg.selectAll("g")
		.data(partition.nodes(sunburstTree), function(d) { return d ? d.id : this.id; })
		.enter()
		.append("g")
		.attr("class", "arcg")
		.attr("name", function(d){ return d.name})
		.attr("id", function(d){ return d.id});
		
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
		.text(function(d) { return d.name; })
		.style("font-size", function(d) {
			return "10px";
		});
}

function updateSunburstDiagram(){
	sunburstTree = $.extend(true, {}, mainComponent.financeTree.children.grossPay);
	//we used maps to store children, so we need to turn them into lists to make d3 happy...
	listify(sunburstTree); 
	
	g = sunburstSvg.selectAll("g")
		.data(partition.nodes(sunburstTree), function(d) { return d ? d.id : this.id; })
		.enter()
		.append("g")
		.attr("class", "arcg")
		.attr("id", function(d){ return d.id});
		
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
		.text(function(d) { return d.name; })
		.style("font-size", function(d) {
			return "10px";
		});
	
	g = sunburstSvg.selectAll("g")
		.data(partition.nodes(sunburstTree), function(d) { return d ? d.id : this.id; });
		
	path = g.selectAll("path").data(partition.nodes(sunburstTree), function(d) { return d ? d.id : this.id; })
		//.transition().duration(750).attrTween("d", arcTween(d));
		//.transition().duration(750).attrTween("d", function(d){arcTween(d)});
		//.transition().duration(750).attrTween("d", arc);
		.attr("d", arc);
		
	text = g.selectAll("text").data(partition.nodes(sunburstTree), function(d) { return d ? d.id : this.id; })
		//.transition().duration(750).attrTween("d", arcTween(d));
		//.transition().duration(750).attrTween("d", function(d){arcTween(d)});
		//.transition().duration(750).attrTween("d", arc);
		.text(function(d) { return d.name; })
		.attr("transform", function(d) { return "rotate(" + computeTextRotation(d) + ")"; })
		.attr("x", function(d) { return y(d.y); });
	
	g = sunburstSvg.selectAll("g").data(partition.nodes(sunburstTree), function(d) { return d ? d.id : this.id; })
		.exit().remove();
	
}

function listify(node){
	node.children = $.map(node.children, function(val, i) {
		return val;
	});
	$.each(node.children, function(key, val){
		listify(val);
	});
}

function arcTweenText(a, i) {

    var oi = d3.interpolate({ x0: a.x0s, x1: a.x1s }, a);
    function tween(t) {
        var b = oi(t);
        return "rotate(" + computeTextRotation(b) + ")";
    }
    return tween;
}

function mouseover(d) {
	$("#valueBox").html("$" + (Math.round(d.value * 100) / 100));
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {
	$("#valueBox").html("");
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