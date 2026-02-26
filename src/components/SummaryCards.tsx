import type { MortgageSummary } from '../utils/mortgage';
import { DollarSign, Calendar, ArrowDownRight, Clock } from 'lucide-react';

interface SummaryCardsProps {
    summary: MortgageSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    const formatDate = (date: Date) =>
        new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);

    return (
        <div className="grid grid-cols-2" style={{ gap: 'var(--space-md)' }}>

            {/* Monthly Payment Card */}
            <div className="glass-panel" style={{ padding: 'var(--space-lg)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                    <DollarSign size={100} />
                </div>
                <h3 className="text-muted" style={{ fontSize: '1rem', fontWeight: 500 }}>Base Monthly Payment</h3>
                <div className="text-value text-gradient" style={{ marginTop: 'var(--space-sm)' }}>
                    {formatCurrency(summary.monthlyPayment)}
                </div>
            </div>

            {/* Total Interest Card */}
            <div className="glass-panel" style={{ padding: 'var(--space-lg)', position: 'relative', overflow: 'hidden' }}>
                <h3 className="text-muted" style={{ fontSize: '1rem', fontWeight: 500 }}>Total Interest Paid</h3>
                <div className="text-value" style={{ marginTop: 'var(--space-sm)', color: 'var(--color-warning)' }}>
                    {formatCurrency(summary.totalInterest)}
                </div>
            </div>

            {/* Payoff Date Card */}
            <div className="glass-panel" style={{ padding: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
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

            {/* Savings Card (always shown) */}
            <div className="glass-panel" style={{ padding: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)', borderColor: summary.interestSaved > 0 ? 'var(--accent-primary)' : 'var(--border-color)', background: summary.interestSaved > 0 ? 'var(--bg-card-hover)' : 'var(--bg-card)' }}>
                <div style={{ padding: '12px', background: summary.interestSaved > 0 ? 'var(--accent-glow)' : 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                    {summary.interestSaved > 0 ? <ArrowDownRight size={24} color="var(--accent-primary)" /> : <Clock size={24} className="text-muted" />}
                </div>
                <div>
                    <h3 className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 500 }}>Interest Saved</h3>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: summary.interestSaved > 0 ? 'var(--accent-primary)' : 'var(--text-main)' }}>
                        {formatCurrency(summary.interestSaved)}
                    </div>
                    {summary.monthsSaved > 0 && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                            {Math.floor(summary.monthsSaved / 12)}y {summary.monthsSaved % 12}m earlier
                        </div>
                    )}
                </div>
            </div>

            {/* Total Cost Card */}
            <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: 'var(--space-lg)', position: 'relative', overflow: 'hidden', textAlign: 'center', background: 'var(--bg-card-hover)', borderColor: 'var(--accent-primary)' }}>
                <h3 className="text-muted" style={{ fontSize: '1.1rem', fontWeight: 500 }}>Total Cost (All-In)</h3>
                <div className="text-value text-gradient" style={{ marginTop: 'var(--space-sm)' }}>
                    {formatCurrency(summary.totalPayment)}
                </div>
            </div>

        </div>
    );
}
