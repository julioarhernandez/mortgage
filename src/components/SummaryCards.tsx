import type { MortgageSummary } from '../utils/mortgage';
import { DollarSign, Calendar, ArrowDownRight, Info } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface SummaryCardsProps {
    summary: MortgageSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    const formatDate = (date: Date) =>
        new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);

    return (
        <div className="grid grid-cols-1-3" style={{ gap: 'var(--space-md)' }}>

            {/* Monthly Payment Card */}
            <div className="glass-panel" style={{ padding: 'var(--space-lg)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                    <DollarSign size={100} />
                </div>
                <h3 className="text-muted" style={{ fontSize: '1rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {summary.realMonthlyPayment !== summary.monthlyPayment ? 'Total Monthly Payment' : 'Base Monthly Payment'}
                    {summary.realMonthlyPayment !== summary.monthlyPayment && (
                        <Tooltip content={`P&I: ${formatCurrency(summary.monthlyPayment)} + T&I/PMI: ${formatCurrency(summary.realMonthlyPayment - summary.monthlyPayment)}`}>
                            <Info size={14} style={{ cursor: 'help', color: 'var(--accent-primary)' }} />
                        </Tooltip>
                    )}
                </h3>
                <div className="text-value text-gradient" style={{ marginTop: 'var(--space-sm)' }}>
                    {formatCurrency(summary.realMonthlyPayment)}
                </div>
            </div>

            {/* Total Interest Card */}
            <div className="glass-panel" style={{ padding: 'var(--space-lg)', position: 'relative' }}>
                <h3 className="text-muted" style={{ fontSize: '1rem', fontWeight: 500 }}>Total Interest Paid</h3>
                <div className="text-value" style={{ marginTop: 'var(--space-sm)', color: 'var(--color-warning)' }}>
                    {formatCurrency(summary.totalInterest)}
                </div>
            </div>

            {/* Payoff Date Card */}
            <div className="glass-panel" style={{ minHeight: '100%', padding: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                    <Calendar size={24} className="text-muted" />
                </div>
                <div>
                    <h3 className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 500 }}>Payoff Date</h3>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{formatDate(summary.payoffDate)}</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                        ({Math.floor(summary.totalMonths / 12)}y {summary.totalMonths % 12}m)
                    </div>
                </div>
            </div>

            {/* Savings Card (shown only if there are savings >= $1) */}
            {Math.round(summary.interestSaved) >= 1 && (
                <div className="glass-panel" style={{ minHeight: '100%', padding: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)', borderColor: 'var(--accent-primary)', background: 'var(--bg-card-hover)' }}>
                    <div style={{ padding: '12px', background: 'var(--accent-glow)', borderRadius: '50%' }}>
                        <ArrowDownRight size={24} color="var(--accent-primary)" />
                    </div>
                    <div>
                        <h3 className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 500 }}>Interest Saved</h3>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                            {formatCurrency(summary.interestSaved)}
                        </div>
                        {summary.monthsSaved > 0 && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                                {Math.floor(summary.monthsSaved / 12)}y {summary.monthsSaved % 12}m earlier
                            </div>
                        )}
                    </div>
                </div>
            )
            }

            {/* Total Cost Card */}
            <div className={`glass-panel ${Math.round(summary.interestSaved) >= 1 ? 'grid-total-span-half' : 'grid-total-span-full'}`} style={{ padding: 'var(--space-lg)', position: 'relative', textAlign: 'center', background: 'var(--bg-card-hover)', borderColor: 'var(--accent-secondary)' }}>
                <h3 className="text-muted" style={{ fontSize: '1.1rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                    Total Cost (All-In)
                    <Tooltip content="The total lifecycle cost of your home. This includes the original loan amount plus every dollar of interest paid over the life of the mortgage.">
                        <Info size={16} style={{ cursor: 'help', color: 'var(--accent-primary)' }} />
                    </Tooltip>
                </h3>
                <div className="text-value text-gradient" style={{ marginTop: 'var(--space-sm)' }}>
                    {formatCurrency(summary.totalPayment)}
                </div>
            </div>

        </div >
    );
}
