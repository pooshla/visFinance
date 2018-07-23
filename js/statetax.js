// Anne Arundel County Maryland Employee Income Withholding Calculator by GitHub#pooshla
// Based on Maryland Tax Sheet - http://taxes.marylandtaxes.gov/Business_Taxes/Business_Tax_Types/Income_Tax/Employer_Withholding/Withholding_Tables/pmtables/2018/.0250.pdf
// Per the "Percentage Method"
var countyTaxRate = 0.025;
var  w2 = {
	//subtract out the county tax rate so that we can calculate it separately
    s : { // Single
        0    : { p : 0.0725- countyTaxRate, s : 0 },
        1923   : { p: 0.075 - countyTaxRate, s: 139.42 },
        2404  : { p: 0.0775 - countyTaxRate, s: 175.48 },
        2885  : { p: 0.08 - countyTaxRate, s: 212.74 },
        4808 : { p: 0.0825 - countyTaxRate, s: 366.59 }
    },
    m : { // Married
        0    : { p : 0, s : 0 },
        165  : { p : 0.1, s : 0 },
        520  : { p : 0.15, s : 35.5 },
        1606 : { p : 0.25, s : 198.4 },
        3073 : { p : 0.28, s : 565.15 },
        4597 : { p : 0.33, s : 991.87 },
        8079 : { p : 0.35, s : 2140.93 },
        9105 : { p : 0.396, s : 2500.03 }
    }
};
var exemptions = {//keyed on paychecks per month
	4: {//weekly
		exemption: 61.54,
		min: 29,
		max: 38.55
	},
	2: {//biweekly
		exemption: 123.08,
		min: 58.05,
		max: 77
	},
	1: {//monthly
		exemption: 266.67,
		min: 125,
		max: 167
	}
};
var sdr = .15;
var ba2 = 61.54; // 1 weekly exemption

function s2(m, a, p, g) { // Returns State Income Tax amount (Married, Allowances, Paychecks Per Month, Gross Income)
	g -= Math.max(Math.min((sdr * g), exemptions[p].max), exemptions[p].min);
    g -= (ba2 * p * a); // Pay after allowances
    var b = Object.keys(w2[(m==1) ? 'm' : 's']); //Married?
    for (var i = 0; i < b.length; i++) { // Find bracket
        if (b[i] * p > g)  {
            g -= b[i-1] * p; // Get taxable income
            b = w2[(m==1) ? 'm' : 's'][b[i-1]]; // Set bracket
            return round2((b.p*(g)) + (b.s * p)); // Taxable income * Tax Rate + Base Tax, per IRS Circular E table 5
        }
    }
}

function c2(m, a, p, g) { // Returns County Income Tax amount (Married, Allowances, Paychecks Per Month, Gross Income)
	g -= Math.max(Math.min((sdr * g), exemptions[p].max), exemptions[p].min);
    g -= (ba2 * p * a); // Pay after allowances
    var b = Object.keys(w2[(m==1) ? 'm' : 's']); //Married?
    for (var i = 0; i < b.length; i++) { // Find bracket
        if (b[i] * p > g)  {
            g -= b[i-1] * p; // Get taxable income
            return round2(countyTaxRate * g); // county tax rate * taxable income
        }
    }
}

function round2(val){
	return Math.round(val * 100) / 100;
}