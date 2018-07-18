// Weekly Employee Income Withholding Calculator by GitHub#Liath
// Based on IRS Circular E - http://www.irs.gov/pub/irs-pdf/p15.pdf
// Per the "Percentage Method"
var  w = {
    s : { // Single
        0    : { p : 0, s : 0 },
        71   : { p: 0.1, s: 0 },
        254  : { p: 0.12, s: 71 },
        815  : { p: 0.22, s: 254 },
        1658 : { p: 0.24, s: 815 },
        3100 : { p: 0.32, s: 1658 },
        3917 : { p: 0.35, s: 3100 },
        9687 : { p: 0.37, s: 3917 }
    },
    m : { // Married
        0    : { p : 0, s : 0 },
        222  : { p : 0.1, s : 0 },
        588  : { p : 0.12, s : 35.5 },
        1711 : { p : 0.22, s : 198.4 },
        3395 : { p : 0.24, s : 565.15 },
        6280 : { p : 0.32, s : 991.87 },
        7914 : { p : 0.35, s : 2140.93 },
        11761 : { p : 0.37, s : 2500.03 }
    }
},
ba = 79.80, // 1 weekly Allowance
c = function(m, a, g) { // Returns Federal Income Tax amount (Married, Allowances, Gross Income)
    g -= (ba * a); // Pay after allowances
    var b = Object.keys(w[(m==1) ? 'm' : 's']); //Married?
    for (var i = 0; i < b.length; i++) { // Find bracket
        if (b[i] > g)  {
            g -= b[i-1]; // Get taxable income
            b = w[(m==1) ? 'm' : 's'][b[i-1]]; // Set bracket
            return mainComponent.paychecksPerMonth * round2((b.p*(g)) + b.s); // Taxable income * Tax Rate + Base Tax, per IRS Circular E table 5
        }
    }
}

function round2(val){
	return Math.round(val * 100) / 100;
}