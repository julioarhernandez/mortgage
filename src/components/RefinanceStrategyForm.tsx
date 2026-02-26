import type { RefinanceInput } from '../utils/mortgage';
import { Percent, Calendar, DollarSign } from 'lucide-react';

const MONTHS = [
    { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
    { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
    { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' }
];

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
                            <label>Refinance Date</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select
                                    style={{ flex: 1, padding: '0.75rem', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                                    value={refinanceForm.refinanceMonthNum || new Date().getMonth() + 1}
                                    onChange={(e) => handleChange('refinanceMonthNum', Number(e.target.value))}
                                >
                                    {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                                <input
                                    type="number"
                                    placeholder="YYYY"
                                    style={{ flex: 1 }}
                                    value={refinanceForm.refinanceYear || new Date().getFullYear()}
                                    onChange={(e) => handleChange('refinanceYear', Number(e.target.value))}
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
