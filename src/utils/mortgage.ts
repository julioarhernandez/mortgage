export interface MortgageInput {
    principal: number;
    annualInterestRate: number;
    years: number;
    extraMonthlyPayment?: number;
    extraYearlyPayment?: number;
    oneTimePayment?: number;
    oneTimePaymentMonth?: number;
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
 * Generates the full amortization schedule with optional extra payments.
 */
export function calculateAmortization(input: MortgageInput, baseDate: Date = new Date()): MortgageSummary {
    const {
        principal,
        annualInterestRate,
        years,
        extraMonthlyPayment = 0,
        extraYearlyPayment = 0,
        oneTimePayment = 0,
        oneTimePaymentMonth = 0
    } = input;

    const standardMonthlyPayment = calculateMonthlyPayment(principal, annualInterestRate, years);
    const r = annualInterestRate / 100 / 12;

    let balance = principal;
    let accumulatedInterest = 0;
    const schedule: AmortizationRow[] = [];
    let month = 1;

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

        // Determine the date
        const date = new Date(baseDate);
        date.setMonth(date.getMonth() + month);

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
        monthsSaved: standardMonths - schedule.length
    };
}
