import type { RefinanceSummary } from '../utils/mortgage';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface RefinanceSummaryCardProps {
    summary: RefinanceSummary;
}

export function RefinanceSummaryCard({ summary }: RefinanceSummaryCardProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    const formatDate = (date: Date) =>
        new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);

    const isProfitable = summary.isProfitable;
    const mainColor = isProfitable ? 'var(--accent-primary)' : 'var(--color-danger)';
    const bgColor = isProfitable ? 'var(--bg-card-hover)' : 'rgba(239, 68, 68, 0.1)';

    return (
        <div className="glass-panel" style={{ padding: 'var(--space-lg)', marginTop: 'var(--space-lg)', borderColor: mainColor, background: bgColor }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                <div style={{ padding: '12px', background: isProfitable ? 'var(--accent-glow)' : 'rgba(239, 68, 68, 0.2)', borderRadius: '50%' }}>
                    {isProfitable ? <CheckCircle size={32} color={mainColor} /> : <XCircle size={32} color={mainColor} />}
                </div>
                <div>
                    <h2 style={{ color: mainColor, fontSize: '1.5rem', marginBottom: 0 }}>
                        {isProfitable ? 'Profitable Refinance' : 'Net Loss Refinance'}
                    </h2>
                    <p className="text-muted" style={{ margin: 0 }}>
                        {isProfitable
                            ? `Refinancing will save you money over the life of the loan.`
                            : `The new loan costs more than staying with your current mortgage.`}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3" style={{ gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                <div style={{ padding: 'var(--space-md)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>Interest Paid Before Refi</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                        {formatCurrency(summary.interestPaidBeforeRefinance)}
                    </div>
                </div>

                <div style={{ padding: 'var(--space-md)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>Principal Paid Before Refi</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                        {formatCurrency(summary.principalPaidBeforeRefinance)}
                    </div>
                </div>

                <div style={{ padding: 'var(--space-md)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>New Loan Balance</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                        {formatCurrency(summary.newLoanPrincipal)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3" style={{ gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                <div style={{ padding: 'var(--space-md)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>New Total Interest</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                        {formatCurrency(summary.newTotalInterest)}
                    </div>
                </div>

                <div style={{ padding: 'var(--space-md)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>New Monthly Payment</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                        {formatCurrency(summary.newMonthlyPayment)}
                    </div>
                </div>

                <div style={{ padding: 'var(--space-md)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>New Payoff Date</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                        {formatDate(summary.newPayoffDate)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3" style={{ gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                <div style={{ padding: 'var(--space-md)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-muted" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Break-Even Point
                        <Tooltip content="The time required for your lower monthly payments to pay back the cost of the refinance. If you move before this, you may lose money.">
                            <Info size={14} style={{ cursor: 'help', color: 'var(--accent-primary)' }} />
                        </Tooltip>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                        {summary.breakEvenMonth ? `${summary.breakEvenMonth} months` : 'Never'}
                    </div>
                </div>

                <div style={{ padding: 'var(--space-md)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-muted" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Baseline Total Cost
                        <Tooltip content="The 'Stay the Course' number. The total amount you will have paid for your home from start to finish if you do not refinance.">
                            <Info size={14} style={{ cursor: 'help', color: 'var(--accent-primary)' }} />
                        </Tooltip>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                        {formatCurrency(summary.baselineTotalPayment)}
                    </div>
                </div>

                <div style={{ padding: 'var(--space-md)', background: isProfitable ? 'var(--accent-glow)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${mainColor}`, borderRadius: 'var(--radius-md)' }}>
                    <div className="text-muted" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Total Cost (All-In)
                        <Tooltip content="The 'New Path' number. Includes everything: interest paid so far, closing costs (if any), and the entire cost of the new loan until payoff.">
                            <Info size={14} style={{ cursor: 'help', color: 'var(--accent-primary)' }} />
                        </Tooltip>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: mainColor }}>
                        {formatCurrency(summary.newTotalPayment)}
                    </div>
                </div>

                <div className="col-span-full" style={{ padding: 'var(--space-md)', background: 'rgba(0,0,0,0.3)', border: `1px solid ${mainColor}`, borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                        Net Financial Impact
                        <Tooltip content="The absolute bottom line. This is your total net gain or loss over the whole loan life if you refinance today, accounting for every dollar spent.">
                            <Info size={14} style={{ cursor: 'help', color: 'var(--accent-primary)' }} />
                        </Tooltip>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: mainColor }}>
                        {isProfitable ? '+' : ''}{formatCurrency(summary.netSavings)}
                    </div>
                </div>
            </div>
        </div>
    );
}
