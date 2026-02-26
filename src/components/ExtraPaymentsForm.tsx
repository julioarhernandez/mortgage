import type { MortgageInput } from '../utils/mortgage';
import { DollarSign, PlusCircle } from 'lucide-react';

interface ExtraPaymentsFormProps {
    input: MortgageInput;
    onChange: (input: MortgageInput) => void;
    enabled: boolean;
    onToggleEnabled: (enabled: boolean) => void;
}

export function ExtraPaymentsForm({ input, onChange, enabled, onToggleEnabled }: ExtraPaymentsFormProps) {
    const handleChange = (field: keyof MortgageInput, value: number) => {
        onChange({ ...input, [field]: value });
    };

    return (
        <div className="glass-panel" style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', borderColor: enabled ? 'var(--accent-primary)' : 'var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                <h2>
                    <PlusCircle size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--accent-primary)' }} />
                    Extra Payments
                </h2>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                    <span style={{ fontSize: '0.9rem', color: enabled ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                        {enabled ? 'Active' : 'Enable'}
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
                See how making additional contributions—monthly, yearly, or as a one-time lump sum—can help you pay off your mortgage faster and save on total interest.
            </p>

            {enabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', animation: 'fadeIn 0.3s ease' }}>
                    <div className="input-group">
                        <label>Extra Monthly Payment</label>
                        <div className="input-wrapper">
                            <DollarSign className="prefix" size={18} />
                            <input
                                type="number"
                                className="has-prefix"
                                value={input.extraMonthlyPayment || ''}
                                onChange={(e) => handleChange('extraMonthlyPayment', Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Extra Yearly Payment</label>
                        <div className="input-wrapper">
                            <DollarSign className="prefix" size={18} />
                            <input
                                type="number"
                                className="has-prefix"
                                value={input.extraYearlyPayment || ''}
                                onChange={(e) => handleChange('extraYearlyPayment', Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="input-group" style={{ flex: 2 }}>
                            <label>One-time Payment Amount</label>
                            <div className="input-wrapper">
                                <DollarSign className="prefix" size={18} />
                                <input
                                    type="number"
                                    className="has-prefix"
                                    value={input.oneTimePayment || ''}
                                    onChange={(e) => handleChange('oneTimePayment', Number(e.target.value))}
                                />
                            </div>
                        </div>
                        <div className="input-group" style={{ flex: 1 }}>
                            <label>At Month</label>
                            <input
                                type="number"
                                value={input.oneTimePaymentMonth || ''}
                                onChange={(e) => handleChange('oneTimePaymentMonth', Number(e.target.value))}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
