import type { RefinanceSummary } from '../utils/mortgage';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface RefinanceSummaryCardProps {
    summary: RefinanceSummary;
}

export function RefinanceSummaryCard({ summary }: RefinanceSummaryCardProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

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

            <div className="grid grid-cols-2" style={{ gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                <div style={{ padding: 'var(--space-md)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>Old Remaining Interest</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                        {formatCurrency(summary.currentStandardRemainingInterest)}
                    </div>
                </div>

                <div style={{ padding: 'var(--space-md)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>New Total Interest</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                        {formatCurrency(summary.newTotalInterest)}
                    </div>
                </div>

                <div style={{ padding: 'var(--space-md)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>Old Remaining Balance</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                        {formatCurrency(summary.remainingBalanceToRefinance)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3" style={{ gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                <div style={{ padding: 'var(--space-md)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>New Monthly Payment</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                        {formatCurrency(summary.newMonthlyPayment)}
                    </div>
                </div>

                <div style={{ padding: 'var(--space-md)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>Break-Even Point</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                        {summary.breakEvenMonth ? `${summary.breakEvenMonth} months` : 'Never'}
                    </div>
                </div>

                <div style={{ padding: 'var(--space-md)', background: 'rgba(0,0,0,0.3)', border: `1px solid ${mainColor}`, borderRadius: 'var(--radius-md)' }}>
                    <div className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Net Financial Impact
                        <span title="Calculated as: (Old Remaining Cost) - (New Remaining Cost) - (Upfront Costs)">
                            <Info size={14} style={{ cursor: 'help' }} />
                        </span>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: mainColor }}>
                        {isProfitable ? '+' : ''}{formatCurrency(summary.netSavings)}
                    </div>
                </div>
            </div>
        </div>
    );
}
