import type { RefinanceInput } from '../utils/mortgage';
import { Percent, Calendar, DollarSign } from 'lucide-react';

interface RefinanceStrategyFormProps {
    refinanceForm: RefinanceInput;
    onChange: (input: RefinanceInput) => void;
    enabled: boolean;
    onToggleEnabled: (enabled: boolean) => void;
}

export function RefinanceStrategyForm({ refinanceForm, onChange, enabled, onToggleEnabled }: RefinanceStrategyFormProps) {
    const handleChange = (field: keyof RefinanceInput, value: number | boolean) => {
        onChange({ ...refinanceForm, [field]: value });
    };

    return (
        <div className="glass-panel" style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-lg)', borderColor: enabled ? 'var(--accent-primary)' : 'var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                <h2>Refinance Strategy</h2>
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
                Evaluate if refinancing your current mortgage balance is a financially sound decision. This compares the remaining costs of your current mortgage against a new loan, factoring in closing costs.
            </p>

            {enabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', animation: 'fadeIn 0.3s ease' }}>
                    <div className="flex gap-4">
                        <div className="input-group" style={{ flex: 1 }}>
                            <label>Refinance at Month</label>
                            <div className="input-wrapper">
                                <Calendar className="prefix" size={18} />
                                <input
                                    type="number"
                                    className="has-prefix"
                                    value={refinanceForm.refinanceMonth || ''}
                                    onChange={(e) => handleChange('refinanceMonth', Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="input-group" style={{ flex: 1 }}>
                            <label>New Rate (%)</label>
                            <div className="input-wrapper">
                                <Percent className="prefix" size={18} />
                                <input
                                    type="number"
                                    className="has-prefix"
                                    step="0.1"
                                    value={refinanceForm.newAnnualRate || ''}
                                    onChange={(e) => handleChange('newAnnualRate', Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="input-group" style={{ flex: 1 }}>
                            <label>New Term (Years)</label>
                            <div className="input-wrapper">
                                <Calendar className="prefix" size={18} />
                                <input
                                    type="number"
                                    className="has-prefix"
                                    value={refinanceForm.newTermYears || ''}
                                    onChange={(e) => handleChange('newTermYears', Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="input-group" style={{ flex: 1 }}>
                            <label>Closing Costs ($)</label>
                            <div className="input-wrapper">
                                <DollarSign className="prefix" size={18} />
                                <input
                                    type="number"
                                    className="has-prefix"
                                    value={refinanceForm.closingCosts || ''}
                                    onChange={(e) => handleChange('closingCosts', Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px', color: 'var(--text-main)' }}>
                            <input
                                type="checkbox"
                                checked={refinanceForm.rollClosingCostsIntoLoan || false}
                                onChange={(e) => handleChange('rollClosingCostsIntoLoan', e.target.checked)}
                                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                            />
                            <span>Roll Closing Costs into New Loan Balance</span>
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
}
