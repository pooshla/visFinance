var mainComponent;

$("document").ready(function(){
	mainComponent = new Vue({
		el: "#mainContent",
		data: {
			SOCIAL_SECURITY_TAX_RATE: 0.062,
			MEDICARE_TAX_RATE: 0.0145,
			ANNE_ARUNDEL_COUNTY_TAX_RATE: 0.025,
			units: "Dollars",
			paychecksPerMonth: 2,
			//properties are per paycheck
			//grossIncome: 3790.91,
			grossIncome: 3500,
			visionInsurance: 0,
			healthInsurance: 26.77,
			dentalInsurance: 5.54,
			hsaContribution: 55.77,
			retirementContributionPercent: 12,
			tithePercent: 10,
			budgetData: [
				//budget ids 50+
				{
					id: 50,
					derVal: "difference", 
					target:"siblings",
					name:"Savings",
					hidden: true
				},
				{id: 51, isBudget: true, name: "Mortgage", value: 1229.58},
				{id: 52, isBudget: true, name: "Property Tax", value: 279.45},
				{id: 53, isBudget: true, name: "Condo Fee", value: 157},
				{id: 54, isBudget: true, name: "Car Insurance", value: 123.77},
				{id: 55, isBudget: true, name: "Condo Insurance", value: 29.48},
				{id: 56, isBudget: true, name: "Internet", value: 96.89},
				{id: 57, isBudget: true, name: "Mobile Phone", value: 50},
				// {id: 58, isBudget: true, name: "Counselling", value: 200},
				{id: 59, isBudget: true, name: "Electricity", value: 40},
				{id: 60, isBudget: true, name: "Gas", value: 70},
				{id: 61, isBudget: true, name: "Restaurants", value: 25},
				{id: 62, isBudget: true, name: "Fast Food", value: 25},
				{id: 63, isBudget: true, name: "Gifts", value: 25},
				{id: 64, isBudget: true, name: "Car Services", value: 50},
				{id: 65, isBudget: true, name: "Entertainment", value: 35},
				{id: 66, isBudget: true, name: "Groceries", value: 70}
			]
		},
		computed: {
			financeTreeStructure: function() {
				return {
					children: {
						grossPay:{
							id:  1,
							name: "Gross Pay",
							value: this.grossIncome,
							children: {
								fedTaxableIncome: {
									id:  8,
									name: "Federal Taxable Income",
									derVal: "difference",
									target: ["grossPay", "deductions"],
									children: {
										taxes: {
											id:  9,
											name: "Taxes",
											derVal: "rollup",
											children: {
												federalTaxes: {
													id:  10,
													name: "Federal Taxes",
													derVal: "fedtax",
													target: "fedTaxableIncome"
												}, 
												socialSecurity: {
													id: 11,
													name: "Social Security",
													value: this.SOCIAL_SECURITY_TAX_RATE,
													derVal: "sstax",
													target: ["fedTaxableIncome", "retirementContribution"]
												}, 
												medicare: {
													id: 12,
													name: "Medicare",
													value: this.MEDICARE_TAX_RATE,
													derVal: "sstax",
													target: ["fedTaxableIncome", "retirementContribution"]
												}, 
												stateTaxes: {
													id: 13,
													name: "Maryland State Taxes",
													derVal: "statetax",
													target: "fedTaxableIncome"
												}, 
												countyTaxes: {
													id: 14,
													name: "Anne Arundel County Taxes",
													derVal: "countytax",
													target: "fedTaxableIncome"
												}
											}
										}, 
										netPay: {
											id: 15,
											name: "Net Pay",
											derVal: "difference",
											target: ["fedTaxableIncome", "taxes"],
											children: {
												tithe: {
													id: 16,
													name: "Tithe",
													value: this.tithePercent,
													derVal: "percentage",
													target: "netPay"
												}, 
												takeHome: {
													id: 17,
													name: "Take Home",
													derVal: "difference",
													target: ["netPay", "tithe"],
													children: this.budgetData
												}
											}
										}
									}
								}, 
								deductions: {
									id: 2,
									name: "Deductions",
									derVal: "rollup",
									children: {
										dentalInsurance: {
											id: 3,
											name: "Dental Insurance",
											value: this.dentalInsurance
										}, 
										healthInsurance: {
											id: 4,
											name: "Health Insurance",
											value: this.healthInsurance
										}, 
										hsaContribution: {
											id: 5,
											name: "HSA Contributions",
											value: this.hsaContribution
										},
										// visionInsurance: {
											// id: 6,
											// name: "Vision Insurance",
											// value: visionInsurance,
										// },
										retirementContribution: {
											id: 7,
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
			},
			financeTree: function() {
				this.calculateDerivedValues();
				return this.financeTreeStructure;
			},
			financeGraph: function(){
				//dont need to call calculate because reference financeTree will get it
				var financeGraph = this.flattenTree(this.financeTree);
				return financeGraph;
			}
		},
		methods: {
			flattenTree: function(node){
				var graph = {
					nodes: [],
					links: []
				};
				
				$.each(node.children, function(key, child){
					child.parentId = node.id;
					child.ref = key;
					if(node.name != undefined){//edge case for root node
						graph.links.push({
							source: node.id,
							target: child.id,
							value: child.value
						});
					}
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
				var stillNeedsWork = true;
				var financeGraph = this.flattenTree(this.financeTreeStructure);
				
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
									node.value = c(0, 1, mainComponent.paychecksPerMonth, target.value);
								} else {
									stillNeedsWork = true;
								}
							} else if(node.derVal == "statetax"){
								var target = mainComponent.getNodeByRef(financeGraph.nodes, node.target);
								
								if(target.done){
									node.done = true;
									node.value = s2(0, 1, mainComponent.paychecksPerMonth, target.value);
								} else {
									stillNeedsWork = true;
								}
							} else if(node.derVal == "countytax"){
								var target = mainComponent.getNodeByRef(financeGraph.nodes, node.target);
								
								if(target.done){
									node.done = true;
									node.value = c2(0, 1, mainComponent.paychecksPerMonth, target.value);
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
								if(node.target == "siblings"){
									var parent = mainComponent.getNodeById(financeGraph.nodes, node.parentId);
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
										//TODO: sloppy temporarily scale parent value so result will be correct
										node.value = (parent.value * mainComponent.paychecksPerMonth) - tmpSum;
									} else {
										stillNeedsWork =  true;
									}
								} else {
									var target1 = mainComponent.getNodeByRef(financeGraph.nodes, node.target[0]);
									var target2 = mainComponent.getNodeByRef(financeGraph.nodes, node.target[1]);
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
				
				//we calculated things on a per-paycheck level. now lets scale everything for the month
				$.each(financeGraph.nodes, function(key, node){
					if(!node.isBudget){
						if(node.baseValue == undefined)
							node.baseValue = node.value;
						
						node.value = node.baseValue * mainComponent.paychecksPerMonth;
					}
				});
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
			},
			generateId: function(){
				return Math.floor(Math.random() * 1000000);
			},
			addBudgetItem: function(){
				this.budgetData.push({
					id: Math.floor(Math.random() * 1000000),
					name: "test",
					value: 200,
					isBudget: true
				});
			},
			removeBudgetItem: function(itemName){
				for(var key in this.budgetData){
					if(this.budgetData[key].name == itemName){
						this.budgetData.splice(key, 1);
						break;
					}
				}
			},
			financeTreeToString: function(node, level){
				if(level == undefined)
					level = -1;
				
				console.log(("-".repeat(2 * level)) + node.name + ": " + node.value);
				$.each(node.children, function(key, child){
					mainComponent.financeTreeToString(child, level + 1);
				});
			}
		},
		updated: function(){
			updateSunburstDiagram();
			updateSankeyDiagram();
		}
	});
	
	initializeGuiComponents();
	//mainComponent.financeTreeToString(mainComponent.financeTree, 0);
	
	drawSankeyDiagram();
	drawSunburstDiagram();
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
}