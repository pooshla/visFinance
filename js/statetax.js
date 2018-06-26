// Bi-Weekly Employee Income Withholding Calculator by GitHub#pooshla
// Based on Maryland Tax Sheet - http://taxes.marylandtaxes.com/Business_Taxes/Business_Tax_Types/Income_Tax/Employer_Withholding/Withholding_Tables/pmtables/2012/0250.pdf
// Per the "Percentage Method"
var  w2 = {
    s : { // Single
        0    : { p : 0.0475, s : 0 },
        3846   : { p: 0.05, s: 139.42 },
        4808  : { p: 0.0525, s: 175.48 },
        5769  : { p: 0.055, s: 212.74 },
        9615 : { p: 0.0575, s: 366.59 }
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
},
sd = {
	rate: .15,
	min: 58.05,
	max: 77.00
},
aar = 0.025,
ba2 = 123.08, // 1 Allowance
s2 = function(m, a, g) { // Returns Federal Income Tax amount (Married, Allowances, Gross Income)
	g -= Math.max(Math.min((sd.rate * g), sd.max), sd.min);
    g -= (ba2*a); // Pay after allowances
    var b = Object.keys(w2[(m==1) ? 'm' : 's']); //Married?
    for (var i = 0; i < b.length; i++) { // Find bracket
        if (b[i] > g)  {
            g -= b[i-1]; // Get taxable income
            b = w2[(m==1) ? 'm' : 's'][b[i-1]]; // Set bracket
            return round2((b.p*(g)) + b.s); // Taxable income * Tax Rate + Base Tax, per IRS Circular E table 5
        }
    }
},
c2 = function(m, a, g) { // Returns Federal Income Tax amount (Married, Allowances, Gross Income)
	g -= Math.max(Math.min((sd.rate * g), sd.max), sd.min);
    g -= (ba2*a); // Pay after allowances
    var b = Object.keys(w2[(m==1) ? 'm' : 's']); //Married?
    for (var i = 0; i < b.length; i++) { // Find bracket
        if (b[i] > g)  {
            g -= b[i-1]; // Get taxable income
            return round2(aar*(g)); // Taxable income * Tax Rate + Base Tax, per IRS Circular E table 5
        }
    }
}