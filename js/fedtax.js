// Weekly Employee Income Withholding Calculator by GitHub#Liath
// Based on IRS Circular E - http://www.irs.gov/pub/irs-pdf/p15.pdf
// Per the "Percentage Method"
var  w = {
    s : { // Single
        0    : { p : 0, s : 0 },
        71   : { p: 0.1, s: 0 },
        254  : { p: 0.12, s: 18.30 },
        815  : { p: 0.22, s: 85.62 },
        1658 : { p: 0.24, s: 271.08 },
        3100 : { p: 0.32, s: 617.16 },
        3917 : { p: 0.35, s: 878.60 },
        9687 : { p: 0.37, s: 2898.10 }
    },
    m : { // Married
        0    : { p : 0, s : 0 },
        222  : { p : 0.1, s : 0 },
        588  : { p : 0.12, s : 36.6 },
        1711 : { p : 0.22, s : 171.36 },
        3395 : { p : 0.24, s : 541.84 },
        6280 : { p : 0.32, s : 1234.24 },
        7914 : { p : 0.35, s : 1757.12 },
        11761 : { p : 0.37, s : 3103.57 }
    }
};
var ba = 79.80; // 1 weekly Allowance
function c(m, a, p, g) { // Returns Federal Income Tax amount (Married, Allowances, Paychecks Per Month, Gross Income)
    g -= (ba * p * a); // Pay after allowances
    var b = Object.keys(w[(m==1) ? 'm' : 's']); //Married?
    for (var i = 0; i < b.length; i++) { // Find bracket
        if (b[i] * p > g)  {
            g -= b[i-1] * p; // Get taxable income
            b = w[(m==1) ? 'm' : 's'][b[i-1]]; // Set bracket
            return round2((b.p*(g)) + (b.s * p)); // Taxable income * Tax Rate + Base Tax, per IRS Circular E table 5
        }
    }
}

function round2(val){
	return Math.round(val * 100) / 100;
}