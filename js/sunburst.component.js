var sunburstSvg;
var g;
var path;
var text;

var arc = d3.svg.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });
	
var partition = d3.layout.partition()
    .value(function(d) { return d.value; });

// var formatNumber = d3.format(",.2f"),    // zero decimal places
    // format = function(d) { return formatNumber(d) + " " + units; },
    // color = d3.scale.category20();

function drawSunburstDiagram(){
	sunburstSvg = d3.select("#sunburstChart").append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");	  
		  
	g = sunburstSvg.selectAll("g")
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
}

function mouseover(d) {
	$("#valueBox").html(d.value);
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