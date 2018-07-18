var mainComponent;

$("document").ready(function(){
	mainComponent = new Vue({
		el: "#mainContent",
		data: {
			SOCIAL_SECURITY_TAX_RATE: 0.062,
			MEDICARE_TAX_RATE: 0.0145,
			ANNE_ARUNDEL_COUNTY_TAX_RATE: 0.0256,
			MARYLAND_STATE_HARDCODED_WRONG_TAX_RATE: 0.04429223281624161119160764525684,
			ANNE_ARUNDEL_COUNTY_HARDCODED_WRONG_TAX_RATE: 0.02331134595834219921034588741518,
			budgetData: [
				{name: "Mortgage", value: 1229.58},
				{name: "Property Tax", value: 279.45},
				{name: "Condo Fee", value: 157},
				{name: "Car Insurance", value: 123.77},
				{name: "Condo Insurance", value: 29.48},
				{name: "Internet", value: 96.89},
				{name: "Mobile Phone", value: 50},
				{name: "Counselling", value: 200},
				{name: "Electricity", value: 40},
				{name: "Gas", value: 70},
				{name: "Restaurants", value: 25},
				{name: "Fast Food", value: 25},
				{name: "Gifts", value: 25},
				{name: "Car Services", value: 50},
				{name: "Entertainment", value: 35},
				{name: "Groceries", value: 70}
			],
			units: "Dollars",
			paychecksPerMonth: 1,
			//properties are per paycheck
			grossIncome: 3790.91,
			visionInsurance: 0,
			healthInsurance: 26.77,
			dentalInsurance: 5.54,
			hsaContribution: 55.77,
			retirementContributionPercent: 12,
			tithePercent: 10
		},
		computed: {
			unprocessedFinanceTree: function() {
				var financeTree = {
					children: {
						grossPay:{
							id: Math.floor(Math.random() * 1000000),
							name: "Gross Pay",
							value: this.grossIncome * this.paychecksPerMonth,
							children: {
								fedTaxableIncome: {
									id:Math.floor(Math.random() * 1000000),
									name: "Federal Taxable Income",
									derVal: "difference",
									target: ["grossPay", "deductions"],
									children: {
										taxes: {
											id:Math.floor(Math.random() * 1000000),
											name: "Taxes",
											derVal: "rollup",
											children: {
												federalTaxes: {
													id:Math.floor(Math.random() * 1000000),
													name: "Federal Taxes",
													derVal: "fedtax",
													target: "fedTaxableIncome"
												}, 
												socialSecurity: {
													id:Math.floor(Math.random() * 1000000),
													name: "Social Security",
													value: this.SOCIAL_SECURITY_TAX_RATE,
													derVal: "sstax",
													target: ["fedTaxableIncome", "retirementContribution"]
												}, 
												medicare: {
													id:Math.floor(Math.random() * 1000000),
													name: "Medicare",
													value: this.MEDICARE_TAX_RATE,
													derVal: "sstax",
													target: ["fedTaxableIncome", "retirementContribution"]
												}, 
												stateTaxes: {
													id:Math.floor(Math.random() * 1000000),
													name: "Maryland State Taxes",
													derVal: "statetax",
													target: "fedTaxableIncome"
												}, 
												countyTaxes: {
													id:Math.floor(Math.random() * 1000000),
													name: "Anne Arundel County Taxes",
													derVal: "countytax",
													target: "fedTaxableIncome"
												}
											}
										}, 
										netPay: {
											id:Math.floor(Math.random() * 1000000),
											name: "Net Pay",
											derVal: "difference",
											target: ["fedTaxableIncome", "taxes"],
											children: {
												tithe: {
													id: Math.floor(Math.random() * 1000000),
													name: "Tithe",
													value: this.tithePercent / 100,
													derVal: "percentage",
													target: "netPay"
												}, 
												takeHome: {
													id: Math.floor(Math.random() * 1000000),
													name: "Take Home",
													derVal: "difference",
													target: ["netPay", "tithe"],
													children: {
														savings: {
															id: Math.floor(Math.random() * 1000000),
															derVal: "difference", 
															target:"siblings",
															name:"Savings"
														}
													}
												}
											}
										}
									}
								}, 
								deductions: {
									id:Math.floor(Math.random() * 1000000),
									name: "Deductions",
									derVal: "rollup",
									children: {
										dentalInsurance: {
											id:Math.floor(Math.random() * 1000000),
											name: "Dental Insurance",
											value: this.dentalInsurance * this.paychecksPerMonth
										}, 
										healthInsurance: {
											id:Math.floor(Math.random() * 1000000),
											name: "Health Insurance",
											value: this.healthInsurance * this.paychecksPerMonth
										}, 
										hsaContribution: {
											id:Math.floor(Math.random() * 1000000),
											name: "HSA Contributions",
											value: this.hsaContribution * this.paychecksPerMonth
										},
										// visionInsurance: {
											// id:Math.floor(Math.random() * 1000000),
											// name: "Vision Insurance",
											// value: visionInsurance,
										// },
										retirementContribution: {
											id:Math.floor(Math.random() * 1000000),
											name: "401K Contributions",
											value: this.retirementContributionPercent,
											target: "grossPay",
											derVal: "percentage"
										}
									}
								}
							}
						}
					}
				};
				//these dont need to be normalized because theyre monthly...
				$.each(this.budgetData, function(key, item){
					financeTree.children.grossPay.children.fedTaxableIncome.children.netPay.children.takeHome.children[item.name.toLowerCase().replace(new RegExp(" ", 'g'), "")] = {
						id: Math.floor(Math.random() * 1000000),
						name: item.name,
						value: item.value
					};
				});
				
				console.log("called unprocessedFinanceTree");
				
				return financeTree;
			},
			financeTree: function() {
				//get the graph which will calculate values which will apply
				//to this tree as well. a bit opaque but its convoluted right now...
				//this.financeGraph;
				
				this.calculateDerivedValues();
				return this.unprocessedFinanceTree;
			},
			financeGraph: function(){
				//dont need to call calculate because reference financeTree will get it
				var financeGraph = this.flattenTree(this.financeTree);
				//this.calculateDerivedValues();
				console.log("called financeGraph");
				return financeGraph;
			}
		},
		methods: {
			flattenTree: function(node){
				//console.log(node);
				var graph = {
					nodes: [],
					links: []
				};
				
				//graph.nodes.push(node);
				
				$.each(node.children, function(key, child){
					child.parentId = node.id;
					child.ref = key;
					graph.links.push({
						source: node.name,
						target: child.name,
						value: child.value
					});
					graph.nodes.push(child);
					
					var childGraph = mainComponent.flattenTree(child);
					graph.nodes = graph.nodes.concat(childGraph.nodes);
					graph.links = graph.links.concat(childGraph.links);
				});
				
				return graph;
			},
			//an interesting thing to note here, since the nodes are all objects
			//and the tree and graph point to the same instances, calculating values
			//for the graph will also apply to the tree
			calculateDerivedValues: function(){
				console.log("called calculate");
				
				var stillNeedsWork = true;
				var financeGraph = this.flattenTree(this.unprocessedFinanceTree);
				
				console.log(financeGraph);
				
				while(stillNeedsWork){
					stillNeedsWork = false;
					
					$.each(financeGraph.nodes, function(key, node){
						console.log(node);
						
						if(node.done == undefined || !node.done){
							console.log(node.name + " " + node.value);
							
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
								var target = mainComponent.getNodeByRef(financeGraph.nodes, node.target);
								
								if(target.done){
									node.done = true;
									node.value = (node.value / 100) * target.value;
								} else {
									stillNeedsWork = true;
								}
							} else if(node.derVal == "fedtax"){
								var target = mainComponent.getNodeByRef(financeGraph.nodes, node.target);
								
								if(target.done){
									node.done = true;
									node.value = c(0, 1, target.value);
								} else {
									stillNeedsWork = true;
								}
							} else if(node.derVal == "statetax"){
								var target = mainComponent.getNodeByRef(financeGraph.nodes, node.target);
								
								if(target.done){
									node.done = true;
									node.value = s2(0, 1, target.value);
								} else {
									stillNeedsWork = true;
								}
							} else if(node.derVal == "countytax"){
								var target = mainComponent.getNodeByRef(financeGraph.nodes, node.target);
								
								if(target.done){
									node.done = true;
									node.value = c2(0, 1, target.value);
								} else {
									stillNeedsWork = true;
								}
							} else if(node.derVal == "sstax"){
								var target1 = mainComponent.getNodeByRef(financeGraph.nodes, node.target[0]);
								var target2 = mainComponent.getNodeByRef(financeGraph.nodes, node.target[1]);
								
								if(target1.done && target2.done){
									node.done = true;
									node.value = node.value * (target1.value + target2.value);//social security does not exclude 401k contributions surprisingly
								} else {
									stillNeedsWork = true;
								}
							} else if(node.derVal == "difference"){
								//console.log("here 1");
								
								if(node.target == "siblings"){
									var parent = mainComponent.getNodeById(financeGraph.nodes, node.parentId);
									var tmpSum = 0;
									var done = true;
									
									//console.log("here 2");
									
									$.each(parent.children, function(key2, val2){
										if(val2.id != node.id){//exclude itself
											//console.log(val2);
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
									var target1 = mainComponent.getNodeByRef(financeGraph.nodes, node.target[0]);
									var target2 = mainComponent.getNodeByRef(financeGraph.nodes, node.target[1]);
									
									//console.log("here 3");
									
									//console.log(target1);
									//console.log(target2);
									if(target1.done && target2.done){
										node.done = true;
										node.value = target1.value - target2.value;
									} else {
										stillNeedsWork = true;
									}
								}
							}
							
							console.log(node.name + " " + node.value);
							//alert();
						}
					});
				}
			},
			getNodeByName: function(nodeList, name){
				for(var i in nodeList){
					if(nodeList[i].name == name)
						return nodeList[i];
				}
			},
			getNodeById: function(nodeList, id){
				for(var i in nodeList){
					if(nodeList[i].id == id)
						return nodeList[i];
				}
			},
			getNodeByRef: function(nodeList, ref){
				for(var i in nodeList){
					if(nodeList[i].ref == ref)
						return nodeList[i];
				}
			}
		}
	});
	
	initializeGuiComponents();
});

function initializeGuiComponents() {
	$("#infoDialog").dialog({
		title: "Assumptions",
		autoOpen: false
	});
	
	$("#toolbarInfoBtn").click(function(event){
		$("#infoDialog").dialog("open");
	});
	
	$("button").button();
	
	/*
	$(".inputField").change(function(event){
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
			
		sankey.relayout();
		fontScale.domain(d3.extent(sankeyGraph.nodes, function(d) { return d.value }));

		// add in the links	
		svg.selectAll(".link")
			.data(sankeyGraph.links)
			.sort(function(a, b) { return b.dy - a.dy; })
			.transition()
			.duration(1300)
			.attr("d", spath)
			.style("stroke-width", function(d) { return Math.max(1, d.dy); });

		// add in the nodes
		svg.selectAll(".node")
			.data(sankeyGraph.nodes)
			.transition()
			.duration(1300)
			.attr("transform", function(d) { 
				return "translate(" + d.x + "," + d.y + ")"; });

		// add the rectangles for the nodes
		svg.selectAll(".node rect")
			.data(sankeyGraph.nodes)
			.transition()
			.duration(1300)
			.attr("height", function(d) { return d.dy; });

		// add in the title for the nodes
		svg.selectAll(".node text")
			.data(sankeyGraph.nodes)
			.transition()
			.duration(1300)
			.attr("y", function(d) { return d.dy / 2; })
			.text(function(d) { return d.name; })
			.style("font-size", function(d) {
				//return "10px";
				return Math.floor(fontScale(d.value)) + "px";
			});

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
		});
	});
	*/
}