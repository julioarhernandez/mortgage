import type { ExternalLoanInput } from '../utils/mortgage';
import { DollarSign, Percent, Calendar } from 'lucide-react';

interface ExternalStrategyFormProps {
    externalLoan: ExternalLoanInput;
    onChange: (input: ExternalLoanInput) => void;
    enabled: boolean;
    onToggleEnabled: (enabled: boolean) => void;
}

export function ExternalStrategyForm({ externalLoan, onChange, enabled, onToggleEnabled }: ExternalStrategyFormProps) {
    const handleChange = (field: keyof ExternalLoanInput, value: number) => {
        onChange({ ...externalLoan, [field]: value });
    };

    return (
        <div className="glass-panel" style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-lg)', borderColor: enabled ? 'var(--accent-primary)' : 'var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                <h2>External Loan / HELOC Strategy</h2>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                    <span style={{ fontSize: '0.9rem', color: enabled ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                        {enabled ? 'Strategy Active' : 'Enable Strategy'}
                    </span>
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => onToggleEnabled(e.target.checked)}
                        style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }}
                    />
                </label>
            </div>

            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: 'var(--space-sm)' }}>
                Simulate using a separate loan or HELOC to inject a large lump-sum into your primary mortgage today, and see if the interest saved beats the cost of the new loan.
            </p>

            {enabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', animation: 'fadeIn 0.3s ease' }}>
                    <div className="input-group">
                        <label>External Loan Amount</label>
                        <div className="input-wrapper">
                            <DollarSign className="prefix" size={18} />
                            <input
                                type="number"
                                className="has-prefix"
                                value={externalLoan.amount || ''}
                                onChange={(e) => handleChange('amount', Number(e.target.value))}
                            />
                        </div>
                        <input
                            type="range"
                            min="5000" max="250000" step="5000"
                            value={externalLoan.amount}
                            onChange={(e) => handleChange('amount', Number(e.target.value))}
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="input-group" style={{ flex: 1 }}>
                            <label>External Interest Rate</label>
                            <div className="input-wrapper">
                                <Percent className="prefix" size={18} />
                                <input
                                    type="number"
                                    className="has-prefix"
                                    step="0.1"
                                    value={externalLoan.annualRate || ''}
                                    onChange={(e) => handleChange('annualRate', Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="input-group" style={{ flex: 1 }}>
                            <label>External Term (Months)</label>
                            <div className="input-wrapper">
                                <Calendar className="prefix" size={18} />
                                <input
                                    type="number"
                                    className="has-prefix"
                                    value={externalLoan.termMonths || ''}
                                    onChange={(e) => handleChange('termMonths', Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
