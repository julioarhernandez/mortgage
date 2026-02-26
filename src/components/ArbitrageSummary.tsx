import type { ArbitrageSummary } from '../utils/mortgage';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface ArbitrageSummaryProps {
    arbitrage: ArbitrageSummary;
}

export function ArbitrageSummaryCard({ arbitrage }: ArbitrageSummaryProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    const isProfitable = arbitrage.isProfitable;
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
                        {isProfitable ? 'Profitable Strategy' : 'Net Loss Strategy'}
                    </h2>
                    <p className="text-muted" style={{ margin: 0 }}>
                        {isProfitable
                            ? `This loan strategy saves you money overall.`
                            : `The external loan interest costs more than the mortgage interest you save.`}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3" style={{ gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                <div style={{ padding: 'var(--space-md)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>Mortgage Interest Saved</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                        {formatCurrency(arbitrage.mortgageInterestSaved)}
                    </div>
                </div>

                <div style={{ padding: 'var(--space-md)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>External Loan Cost (Interest)</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-danger)' }}>
                        -{formatCurrency(arbitrage.externalTotalInterest)}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        ({formatCurrency(arbitrage.externalMonthlyPayment)}/mo)
                    </div>
                </div>

                <div style={{ padding: 'var(--space-md)', background: 'rgba(0,0,0,0.3)', border: `1px solid ${mainColor}`, borderRadius: 'var(--radius-md)' }}>
                    <div className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Net Financial Impact
                        <span title="Calculated as: (Mortgage Interest Saved) - (External Loan Cost)">
                            <Info size={14} style={{ cursor: 'help' }} />
                        </span>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: mainColor }}>
                        {isProfitable ? '+' : ''}{formatCurrency(arbitrage.netSavings)}
                    </div>
                </div>
            </div>
        </div>
    );
}
