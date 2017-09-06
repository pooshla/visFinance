var contrib401k;
var ssTaxRate;
var medicareTaxRate;
var stateTaxRate;
var countyTaxRate;
var titheRate;

var grossPay;
var dentalInsurance;
var visionInsurance;
var healthInsurance;
var hsaContributions;

var financeTree;

function loadUserValues(){
	stateTaxRate = 0.04429223281624161119160764525684;
	countyTaxRate = 0.02331134595834219921034588741518;
	
	contrib401k = Number($("#401kContributionsBox").val()) / 100;
	titheRate = Number($("#titheBox").val()) / 100;

	grossPay = Number($("#grossPayBox").val());
	dentalInsurance = Number($("#dentalInsuranceBox").val());
	visionInsurance = Number($("#visionInsuranceBox").val());
	healthInsurance = Number($("#healthInsuranceBox").val());
	hsaContributions = Number($("#hsaContributionsBox").val());
	
	financeTree = {
		id:1,
		name: "Gross Pay",
		value: grossPay,
		children: [{
				id:7,
				name: "Federal Taxable Income",
				derVal: "difference",
				target: [1, 2],
				children: [{
						id:8,
						name: "Taxes",
						derVal: "rollup",
						children: [{
								id:9,
								name: "Federal Taxes",
								derVal: "fedtax",
								target: 7
							}, {
								id:10,
								name: "Social Security",
								value: 0.062,
								derVal: "percentage",
								target: 100
							}, {
								id:11,
								name: "Medicare",
								value: 0.0145,
								derVal: "percentage",
								target: 100
							}, {
								id:12,
								name: "Maryland State Taxes",
								//value: 123.24,
								value: stateTaxRate,
								derVal: "percentage",
								target: 7
							}, {
								id:13,
								name: "Anne Arundel County Taxes",
								//value: 64.86,
								value: countyTaxRate,
								derVal: "percentage",
								target: 7
							}
						]
					}, {
						id:14,
						name: "Net Pay",
						//value: 1850.83,
						derVal: "difference",
						target: [7, 8],
						children: [{
								id: 15,
								name: "Tithe",
								//value: 185.08
								value: titheRate,
								derVal: "percentage",
								target: 14
							}, {
								id: 16,
								name: "Take Home",
								//value: 1665.75,
								derVal: "difference",
								target: [14, 15],
								children: [
									{id: 34, derVal: "difference", target:"siblings"	,name:"Savings"}
								]
							}
						]
					}
				]
			}, {
				id:2,
				name: "Deductions",
				derVal: "rollup",
				children: [
					{
						id:100,
						name: "Unversal Deductions",
						derVal: "rollup",
						children: [
							{
								id:3,
								name: "Dental Insurance",
								value: dentalInsurance
							}, {
								id:4,
								name: "Health Insurance",
								value: healthInsurance
							}, {
								id:5,
								name: "HSA Contributions",
								value: hsaContributions
							}
							// ,{
								// id:35,
								// name: "Vision Insurance",
								// value: visionInsurance,
							// }
						]
					}, {
						id: 101,
						name: "Deductions (Excluded from SS)",
						derVal: "rollup",
						children: [
							{
								id:6,
								name: "401K Contributions",
								value: contrib401k,
								target: 1,
								derVal: "percentage"
							}
						]
					}
				]
			}
		]
	};
	
	$("#budgetTable tr").each(function(key, item){
		financeTree.children[0].children[1].children[1].children.push({
			name: $(item).find("td:eq(0)").html(),
			value: Number($(item).find(".inputField").val())
		});
	});
	
}