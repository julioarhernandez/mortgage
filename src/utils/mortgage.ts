export interface PaymentRule {
    id: string;
    type: 'monthly' | 'yearly' | 'one-time';
    amount: number;
    startMonth: number; // 1-12 (1 = Jan, 12 = Dec)
    startYear: number;
    endMonth?: number; // 1-12
    endYear?: number;
}

export interface MortgageInput {
    principal: number;
    annualInterestRate: number;
    years: number;
    startMonth?: number;
    startYear?: number;
    startDate?: Date; // Used to base the amortization calendar
    // Down payment
    downPayment?: number; // Entered as a percent or an amount, see downPaymentIsPercent
    downPaymentIsPercent?: boolean; // true = percent of the home price (principal), false = dollar amount
    // Legacy / simple fields (used by programmatic strategies like arbitrage)
    extraMonthlyPayment?: number;
    extraYearlyPayment?: number;
    oneTimePayment?: number;
    oneTimePaymentMonth?: number;
    // Dynamic schedules
    paymentSchedule?: PaymentRule[];
    // Monthly Costs
    propertyTax?: number;
    homeInsurance?: number;
    pmi?: number; // PMI value, either an annual % of the loan or a monthly $ amount (see pmiIsPercent)
    pmiIsPercent?: boolean; // true = annual % of the loan, false = monthly dollars
    // Recurring monthly household costs (entered per month)
    water?: number;
    electricity?: number;
    gas?: number;
    trashSewer?: number;
    hoaDues?: number;
    internet?: number;
    monthlyCostsEnabled?: boolean;
}

export interface AmortizationRow {
    month: number;
    date: Date;
    principalPayment: number;
    interestPayment: number;
    extraPayment: number;
    totalPayment: number;
    remainingBalance: number;
    accumulatedInterest: number;
}

export interface MortgageSummary {
    monthlyPayment: number;
    totalInterest: number;
    totalPayment: number;
    payoffDate: Date;
    totalMonths: number;
    schedule: AmortizationRow[];
    interestSaved: number; // compared to normal amortization
    monthsSaved: number;
    realMonthlyPayment: number;
}

/**
 * Calculates a standard monthly payment amount.
 */
export function calculateMonthlyPayment(principal: number, annualInterestRate: number, years: number): number {
    const r = annualInterestRate / 100 / 12;
    const n = years * 12;
    if (r === 0) return principal / n;

    return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/**
 * Dollar value of the down payment. Percentages are applied to the home price (principal field).
 */
export function getDownPaymentAmount(input: MortgageInput): number {
    const dp = input.downPayment || 0;
    return input.downPaymentIsPercent ? (input.principal * dp) / 100 : dp;
}

/**
 * Loan amount: the home price minus the down payment.
 */
export function getLoanAmount(input: MortgageInput): number {
    return Math.max(0, input.principal - getDownPaymentAmount(input));
}

/**
 * PMI only applies when the loan is over 80% of the home price (down payment under 20%).
 */
export function isPmiRequired(input: MortgageInput): boolean {
    const homePrice = input.principal;
    return homePrice > 0 && getLoanAmount(input) / homePrice > 0.8;
}

/**
 * Monthly PMI in dollars. Returns 0 when PMI is not required (down payment 20% or more).
 */
export function getMonthlyPmi(input: MortgageInput): number {
    if (!isPmiRequired(input)) return 0;

    const pmi = input.pmi || 0;
    if (input.pmiIsPercent === false) return pmi; // already monthly dollars
    return (getLoanAmount(input) * pmi) / 100 / 12; // annual % of the loan
}

/**
 * Generates the full amortization schedule with optional extra payments.
 */
export function calculateAmortization(input: MortgageInput, overrideBaseDate?: Date): MortgageSummary {
    const {
        principal,
        annualInterestRate,
        years,
        extraMonthlyPayment = 0,
        extraYearlyPayment = 0,
        oneTimePayment = 0,
        oneTimePaymentMonth = 0,
        propertyTax = 0,
        homeInsurance = 0,
        pmi = 0,
        water = 0,
        electricity = 0,
        gas = 0,
        trashSewer = 0,
        hoaDues = 0,
        internet = 0,
        monthlyCostsEnabled = false
    } = input;

    const otherMonthlyCosts = water + electricity + gas + trashSewer + hoaDues + internet;

    let accumulatedInterest = 0;
    const schedule: AmortizationRow[] = [];
    let month = 1;

    // Calculate base date
    const fallbackDate = new Date();
    const startYear = input.startYear || fallbackDate.getFullYear();
    const startMonth = input.startMonth || fallbackDate.getMonth() + 1;
    const baseDate = overrideBaseDate || input.startDate || new Date(startYear, startMonth - 1, 1);

    const standardMonthlyPayment = calculateMonthlyPayment(principal, annualInterestRate, years);
    const r = annualInterestRate / 100 / 12;

    let balance = principal;

    // Let's also calculate what the base metrics WOULD be to compare savings
    let standardBalance = principal;
    let standardTotalInterest = 0;
    let standardMonths = 0;

    while (standardBalance > 0 && standardMonths < years * 12 + 10) {
        standardMonths++;
        const intPmt = standardBalance * r;
        const prinPmt = standardMonthlyPayment - intPmt;
        standardTotalInterest += intPmt;
        standardBalance -= prinPmt;
    }

    while (balance > 0.01 && month <= years * 12 * 2) { // safety cap 2x term
        const interestPayment = balance * r;
        let requiredPrincipal = standardMonthlyPayment - interestPayment;

        // Add extra payments
        let extraPaymentThisMonth = extraMonthlyPayment;

        if (extraYearlyPayment > 0 && month % 12 === 0) {
            extraPaymentThisMonth += extraYearlyPayment;
        }

        if (oneTimePayment > 0 && month === oneTimePaymentMonth) {
            extraPaymentThisMonth += oneTimePayment;
        }

        // Determine the date for this month
        const date = new Date(baseDate);
        date.setMonth(date.getMonth() + month - 1); // zero-indexed from baseDate month, wait, month in loop starts at 1, so month 1 is the first payment (baseDate + 1 month? Or is baseDate the first payment? Usually first payment is 1 month after start date, but for simplicity let's say month 1 is the start date. Let's make it date.getMonth() + month - 1 so month 1 is baseDate).
        const currentYear = date.getFullYear();
        const currentMonthNum = date.getMonth() + 1; // 1-12

        // Evaluate dynamic schedule rules
        if (input.paymentSchedule) {
            for (const rule of input.paymentSchedule) {
                const isAfterStart = currentYear > rule.startYear || (currentYear === rule.startYear && currentMonthNum >= rule.startMonth);

                let isBeforeEnd = true;
                if (rule.endYear && rule.endMonth) {
                    isBeforeEnd = currentYear < rule.endYear || (currentYear === rule.endYear && currentMonthNum <= rule.endMonth);
                }

                if (isAfterStart && isBeforeEnd) {
                    if (rule.type === 'monthly') {
                        extraPaymentThisMonth += rule.amount;
                    } else if (rule.type === 'yearly' && currentMonthNum === rule.startMonth) {
                        // Yearly payments occur on the same month as the start month
                        extraPaymentThisMonth += rule.amount;
                    } else if (rule.type === 'one-time' && currentYear === rule.startYear && currentMonthNum === rule.startMonth) {
                        extraPaymentThisMonth += rule.amount;
                    }
                }
            }
        }

        let totalPrincipalPayment = requiredPrincipal + extraPaymentThisMonth;

        // Check if we are overpaying the balance
        if (totalPrincipalPayment >= balance) {
            totalPrincipalPayment = balance;
            extraPaymentThisMonth = balance - requiredPrincipal;
            if (extraPaymentThisMonth < 0) { // actually, if requiredPrincipal > balance
                requiredPrincipal = balance;
                extraPaymentThisMonth = 0;
            }
        }

        const totalPayment = interestPayment + totalPrincipalPayment;
        balance -= totalPrincipalPayment;
        accumulatedInterest += interestPayment;

        schedule.push({
            month,
            date,
            principalPayment: totalPrincipalPayment - extraPaymentThisMonth,
            interestPayment,
            extraPayment: extraPaymentThisMonth,
            totalPayment,
            remainingBalance: Math.max(0, balance),
            accumulatedInterest
        });

        month++;
    }

    const payoffDate = schedule.length > 0 ? schedule[schedule.length - 1].date : baseDate;

    return {
        monthlyPayment: standardMonthlyPayment,
        totalInterest: accumulatedInterest,
        totalPayment: principal + accumulatedInterest,
        schedule,
        totalMonths: schedule.length,
        payoffDate,
        interestSaved: standardTotalInterest - accumulatedInterest,
        monthsSaved: standardMonths - schedule.length,
        realMonthlyPayment: monthlyCostsEnabled
            ? standardMonthlyPayment + (propertyTax / 12) + (homeInsurance / 12) + pmi + otherMonthlyCosts
            : standardMonthlyPayment
    };
}

export interface ExternalPaymentRule {
    id: string;
    type: 'monthly' | 'yearly' | 'one-time';
    amount: number;
    startMonth: number; // 1-based index relative to the start of the phase
    durationMonths?: number; // How many months to repeat. If missing/0, applies until end of phase
}

export interface ExternalLoanInput {
    amount: number;
    annualRate: number;
    termMonths: number; // Draw period if isInterestOnly, total term otherwise
    repaymentTermMonths?: number; // Only used if isInterestOnly is true
    repaymentVariation?: number; // Optional variation (+/- percentage) for repayment phase
    startDateMonth?: number; // 1-12
    startDateYear?: number;
    isInterestOnly?: boolean;
    extraPaymentsEnabled?: boolean;
    drawPaymentSchedule?: ExternalPaymentRule[];
    repayPaymentSchedule?: ExternalPaymentRule[];
}

export interface ArbitrageSummary {
    externalMonthlyPayment: number; // During draw if IO, during amortization if fixed
    repaymentMonthlyPayment?: number; // Monthly payment during repayment phase
    interestDuringDraw?: number;     // Total interest paid during draw period
    interestDuringRepayment?: number; // Total interest paid during repayment period
    externalTotalInterest: number;
    newMortgageInterest: number;
    baselineMortgageInterest: number;
    mortgageInterestSaved: number;
    netSavings: number;
    newPayoffMonths: number;
    baselinePayoffMonths: number;
    monthsSaved: number;
    isProfitable: boolean;
    newTotalPayment: number;
    newPayoffDate: Date;
    baselinePayoffDate: Date;
}

/**
 * Evaluates the net savings of taking an external loan to make a lump-sum payment on the mortgage.
 */
export function calculateArbitrage(mortgageInput: MortgageInput, externalLoan: ExternalLoanInput): ArbitrageSummary {
    // 1. Calculate baseline mortgage without the external lump sum
    const baselineSummary = calculateAmortization({
        ...mortgageInput,
        oneTimePayment: 0, // Reset lump sum to 0 for baseline
        oneTimePaymentMonth: 0
    });

    // 2. Calculate the external loan cost
    const extR = externalLoan.annualRate / 100 / 12;
    const drawN = externalLoan.termMonths;
    const repayN = externalLoan.repaymentTermMonths || 0;

    let drawInterest = 0;
    let repayInterest = 0;
    let currentBalance = externalLoan.amount;
    let externalMonthlyPayment = 0;
    let repaymentMonthlyPayment = 0;

    const getExtraForMonth = (month: number, schedule?: ExternalPaymentRule[]) => {
        if (!externalLoan.extraPaymentsEnabled || !schedule) return 0;
        let totalExtra = 0;
        for (const rule of schedule) {
            const isAfterStart = month >= rule.startMonth;
            const isBeforeEnd = !rule.durationMonths || month < (rule.startMonth + rule.durationMonths);

            if (isAfterStart && isBeforeEnd) {
                if (rule.type === 'monthly') {
                    totalExtra += rule.amount;
                } else if (rule.type === 'yearly' && (month - rule.startMonth) % 12 === 0) {
                    totalExtra += rule.amount;
                } else if (rule.type === 'one-time' && month === rule.startMonth) {
                    totalExtra += rule.amount;
                }
            }
        }
        return totalExtra;
    };

    // Phase 1: Draw Period (Interest Only)
    for (let m = 1; m <= drawN; m++) {
        if (currentBalance <= 0) break;

        const monthlyInterest = currentBalance * extR;
        drawInterest += monthlyInterest;

        // During draw, the user MUST pay interest.
        // We set externalMonthlyPayment to the interest of the FIRST month for UI display
        if (m === 1) externalMonthlyPayment = monthlyInterest;

        // Apply extra payments from schedule
        let extra = getExtraForMonth(m, externalLoan.drawPaymentSchedule);

        currentBalance -= extra;
        if (currentBalance < 0) currentBalance = 0;
    }

    // Phase 2: Repayment Period (Amortized) OR standard loan amortization
    if (externalLoan.isInterestOnly) {
        if (repayN > 0 && currentBalance > 0) {
            const repayRate = externalLoan.annualRate + (externalLoan.repaymentVariation || 0);
            const repayR = Math.max(0, repayRate / 100 / 12);

            // Standard amortized payment based on remaining balance at START of repayment
            repaymentMonthlyPayment = calculateMonthlyPayment(currentBalance, repayRate, repayN / 12);

            for (let m = 1; m <= repayN; m++) {
                if (currentBalance <= 0) break;

                const interest = currentBalance * repayR;
                repayInterest += interest;

                let principalPayment = repaymentMonthlyPayment - interest;
                let extra = getExtraForMonth(m, externalLoan.repayPaymentSchedule);

                currentBalance -= (principalPayment + extra);
                if (currentBalance < 0) currentBalance = 0;
            }
        } else {
            repaymentMonthlyPayment = currentBalance; // Balloon
        }
    } else {
        // Standard loan: calculateMonthlyPayment and then loop
        externalMonthlyPayment = calculateMonthlyPayment(externalLoan.amount, externalLoan.annualRate, drawN / 12);
        currentBalance = externalLoan.amount;

        for (let m = 1; m <= drawN; m++) {
            if (currentBalance <= 0) break;

            const interest = currentBalance * extR;
            repayInterest += interest;

            let principalPayment = externalMonthlyPayment - interest;
            let extra = getExtraForMonth(m, externalLoan.drawPaymentSchedule);

            currentBalance -= (principalPayment + extra);
            if (currentBalance < 0) currentBalance = 0;
        }
    }

    const externalTotalInterest = drawInterest + repayInterest;

    // Determine the month offset for the lump sum
    let lumpSumMonthIndex = 1;

    if (externalLoan.startDateMonth && externalLoan.startDateYear) {
        const startYearNum = mortgageInput.startYear || new Date().getFullYear();
        const startMonthNum = mortgageInput.startMonth || new Date().getMonth() + 1;
        const baseDate = new Date(startYearNum, startMonthNum - 1, 1);
        const lumpSumDate = new Date(externalLoan.startDateYear, externalLoan.startDateMonth - 1, 1);
        lumpSumMonthIndex = (lumpSumDate.getFullYear() - baseDate.getFullYear()) * 12 + (lumpSumDate.getMonth() - baseDate.getMonth()) + 1;
        if (lumpSumMonthIndex < 1) lumpSumMonthIndex = 1;
    }

    // 3. Calculate new mortgage WITH the lump sum
    const newMortgageSummary = calculateAmortization({
        ...mortgageInput,
        oneTimePayment: externalLoan.amount,
        oneTimePaymentMonth: lumpSumMonthIndex
    });

    // 4. Compare
    const mortgageInterestSaved = baselineSummary.totalInterest - newMortgageSummary.totalInterest;
    const netSavings = mortgageInterestSaved - externalTotalInterest;

    return {
        externalMonthlyPayment,
        repaymentMonthlyPayment,
        interestDuringDraw: drawInterest,
        interestDuringRepayment: repayInterest,
        externalTotalInterest,
        baselineMortgageInterest: baselineSummary.totalInterest,
        newMortgageInterest: newMortgageSummary.totalInterest,
        mortgageInterestSaved,
        netSavings,
        newPayoffMonths: newMortgageSummary.totalMonths,
        baselinePayoffMonths: baselineSummary.totalMonths,
        monthsSaved: baselineSummary.totalMonths - newMortgageSummary.totalMonths,
        isProfitable: netSavings > 0,
        newTotalPayment: newMortgageSummary.totalPayment + externalTotalInterest,
        newPayoffDate: newMortgageSummary.payoffDate,
        baselinePayoffDate: baselineSummary.payoffDate
    };
}

export interface RefinanceInput {
    refinanceMonthNum?: number; // 1-12
    refinanceYear?: number;
    refinanceMonth?: number; // legacy/programmatic offset
    newAnnualRate: number;
    newTermYears: number;
    closingCosts: number;
    rollClosingCostsIntoLoan: boolean;
    includeExtraPayments?: boolean;
}

export interface RefinanceSummary {
    remainingBalanceToRefinance: number;
    principalPaidBeforeRefinance: number;
    interestPaidBeforeRefinance: number;
    newLoanPrincipal: number;
    newMonthlyPayment: number;
    newTotalInterest: number;
    newPayoffDate: Date;
    currentStandardRemainingInterest: number;
    interestDifference: number;
    netSavings: number;
    currentMonthsRemaining: number;
    newTermMonths: number;
    monthsSaved: number;
    isProfitable: boolean;
    breakEvenMonth: number | null;
    newTotalPayment: number;
    baselineTotalPayment: number;
}

/**
 * Evaluates a refinance strategy by taking a snapshot of the current loan at `refinanceMonth`,
 * originating a new loan, and comparing the remaining costs.
 */
export function calculateRefinance(currentMortgage: MortgageInput, refinanceParams: RefinanceInput): RefinanceSummary {
    const { newAnnualRate, newTermYears, closingCosts, rollClosingCostsIntoLoan } = refinanceParams;

    // Get the amortization schedule of the current mortgage
    const currentSummary = calculateAmortization(currentMortgage);

    // Determine the refinance month index
    let refinanceMonthIndex = refinanceParams.refinanceMonth || 1;
    const startYearNum = currentMortgage.startYear || new Date().getFullYear();
    const startMonthNum = currentMortgage.startMonth || new Date().getMonth() + 1;

    if (refinanceParams.refinanceYear && refinanceParams.refinanceMonthNum) {
        const baseDate = new Date(startYearNum, startMonthNum - 1, 1);
        const refiDate = new Date(refinanceParams.refinanceYear, refinanceParams.refinanceMonthNum - 1, 1);
        // If Refi is Feb 2027 and Start is Feb 2026, diff is 12 months.
        // We want refinanceMonthIndex to be 12 (meaning 12 payments made).
        refinanceMonthIndex = (refiDate.getFullYear() - baseDate.getFullYear()) * 12 + (refiDate.getMonth() - baseDate.getMonth());
        if (refinanceMonthIndex < 0) refinanceMonthIndex = 0;
    }

    // Find the remaining balance at the time of refinance
    // If refinanceMonth is 0 or 1, we start from the beginning.
    // If refinanceMonth exceeds the loan term, the loan is already paid off.
    let remainingBalance = currentMortgage.principal;
    let currentInterestPaidUpToRefi = 0;
    let refiStartDate = new Date();

    const targetRow = currentSummary.schedule.find(row => row.month === Math.max(1, refinanceMonthIndex));
    if (targetRow) {
        remainingBalance = targetRow.remainingBalance;
        currentInterestPaidUpToRefi = targetRow.accumulatedInterest;
        refiStartDate = new Date(targetRow.date);
    } else if (refinanceMonthIndex === 0) {
        remainingBalance = currentMortgage.principal;
        currentInterestPaidUpToRefi = 0;
        refiStartDate = new Date(startYearNum, startMonthNum - 1, 1);
    } else if (refinanceMonthIndex > currentSummary.schedule.length && currentSummary.schedule.length > 0) {
        remainingBalance = 0;
        refiStartDate = new Date(currentSummary.schedule[currentSummary.schedule.length - 1].date);
    }

    // The new loan's first payment should be 1 month AFTER the refinance point
    const firstPaymentDate = new Date(refiStartDate);
    firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);

    const principalPaidBeforeRefinance = currentMortgage.principal - remainingBalance;

    // Determine the new loan principal
    const newLoanPrincipal = rollClosingCostsIntoLoan ? remainingBalance + closingCosts : remainingBalance;

    // Calculate new loan via calculateAmortization for higher fidelity (consistent extra payment logic)
    const newLoanInput: MortgageInput = {
        principal: newLoanPrincipal,
        annualInterestRate: newAnnualRate,
        years: newTermYears,
        startDate: firstPaymentDate,
        paymentSchedule: refinanceParams.includeExtraPayments ? currentMortgage.paymentSchedule : []
    };

    const newSummary = calculateAmortization(newLoanInput, firstPaymentDate);
    const newMonthlyPayment = newSummary.monthlyPayment;
    const newTotalInterest = newSummary.totalInterest;
    const newN = newSummary.totalMonths;

    // Calculate remaining current interest if we didn't refinance
    // Assuming no extra payments are made after the refinance date in the baseline
    // The truest baseline is to see what the remaining interest is based on the current summary
    const currentStandardRemainingInterest = currentSummary.totalInterest - currentInterestPaidUpToRefi;

    // Interest difference
    const interestDifference = currentStandardRemainingInterest - newTotalInterest;

    // Net savings accounts for out-of-pocket or rolled-in closing costs.
    // If rolled in, they are in the newTotalInterest automatically (via the higher principal). 
    // Wait, if rolled in, we pay them via principal. 
    // Remaining cost of old mortgage = remainingBalance + currentStandardRemainingInterest
    // Total cost of new mortgage = newLoanPrincipal + newTotalInterest 
    // Cost of new mortgage includes closing costs if rolled in. If paid upfront, total cost is remainingBalance + newTotalInterest + closingCosts.
    // So in terms of out of pocket cash for the remaining term:
    // Old out of pocket = remainingBalance + currentStandardRemainingInterest
    // New out of pocket = newLoanPrincipal + newTotalInterest + (rollClosingCostsIntoLoan ? 0 : closingCosts)
    // Savings = Old - New
    const oldRemainingCost = remainingBalance + currentStandardRemainingInterest;
    const upfrontCost = rollClosingCostsIntoLoan ? 0 : closingCosts;
    const newRemainingCost = newLoanPrincipal + newTotalInterest + upfrontCost;

    const netSavings = oldRemainingCost - newRemainingCost;

    // Current months remaining
    const currentMonthsRemaining = currentSummary.schedule.length - Math.max(1, refinanceMonthIndex) + 1;

    // Break-even month: How many months until accumulated savings from monthly payment covers closing costs?
    let breakEvenMonth = null;
    const monthlySavings = currentSummary.monthlyPayment - newMonthlyPayment;
    if (monthlySavings > 0) {
        breakEvenMonth = Math.ceil(closingCosts / monthlySavings);
        if (breakEvenMonth > newN) {
            breakEvenMonth = null; // Doesn't break even within the loan term from cashflow alone
        }
    }

    const newPayoffDate = new Date(refiStartDate);
    newPayoffDate.setMonth(newPayoffDate.getMonth() + newN);

    return {
        remainingBalanceToRefinance: remainingBalance,
        principalPaidBeforeRefinance,
        interestPaidBeforeRefinance: currentInterestPaidUpToRefi,
        newLoanPrincipal,
        newMonthlyPayment,
        newTotalInterest,
        newPayoffDate,
        currentStandardRemainingInterest,
        interestDifference,
        netSavings,
        currentMonthsRemaining: Math.max(0, currentMonthsRemaining),
        newTermMonths: newN,
        monthsSaved: currentMonthsRemaining - newN,
        isProfitable: netSavings > 0,
        breakEvenMonth,
        newTotalPayment: principalPaidBeforeRefinance + currentInterestPaidUpToRefi + newRemainingCost,
        baselineTotalPayment: currentSummary.totalPayment
    };
}
