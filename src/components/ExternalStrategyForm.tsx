import type { ExternalLoanInput } from '../utils/mortgage';
import { DollarSign, Percent, Calendar, Info } from 'lucide-react';
import { Tooltip } from './Tooltip';

const MONTHS = [
    { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
    { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
    { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' }
];

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
                <div className="grid grid-cols-2" style={{ gap: 'var(--space-md)', animation: 'fadeIn 0.3s ease' }}>

                    {/* Amount */}
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
                    </div>

                    {/* Rate */}
                    <div className="input-group">
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

                    {/* Term */}
                    <div className="input-group col-span-full">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {externalLoan.isInterestOnly ? 'Draw Period (Months)' : 'Loan Term (Months)'}
                            <Tooltip content={externalLoan.isInterestOnly
                                ? "The length of the 'Interest-Only' phase. If your HELOC has already started, enter the number of months remaining in your draw period."
                                : "The total length of the loan in months."}>
                                <Info size={14} style={{ cursor: 'help', color: 'var(--accent-primary)' }} />
                            </Tooltip>
                        </label>
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

                    {/* Repayment Term (HELOC Only) */}
                    {externalLoan.isInterestOnly && (
                        <div className="input-group col-span-full" style={{ animation: 'fadeIn 0.2s ease' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                Repayment Period (Months)
                                <Tooltip content="The time you have to fully pay back the loan principal and interest after the Draw Period ends.">
                                    <Info size={14} style={{ cursor: 'help', color: 'var(--accent-primary)' }} />
                                </Tooltip>
                            </label>
                            <div className="input-wrapper">
                                <Calendar className="prefix" size={18} />
                                <input
                                    type="number"
                                    className="has-prefix"
                                    value={externalLoan.repaymentTermMonths || ''}
                                    onChange={(e) => handleChange('repaymentTermMonths', Number(e.target.value))}
                                />
                            </div>
                        </div>
                    )}

                    {/* Start Date */}
                    <div className="input-group col-span-full">
                        <label>Application Date (When the lump sum is applied)</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select
                                style={{ flex: 1, padding: '0.75rem', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                                value={externalLoan.startDateMonth || new Date().getMonth() + 1}
                                onChange={(e) => handleChange('startDateMonth', Number(e.target.value))}
                            >
                                {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                            <input
                                type="number"
                                placeholder="YYYY"
                                style={{ flex: 1 }}
                                value={externalLoan.startDateYear || new Date().getFullYear()}
                                onChange={(e) => handleChange('startDateYear', Number(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Checkbox (Interest Only) */}
                    <div className="input-group col-span-full" style={{ justifyContent: 'center', marginTop: 'calc(-1 * var(--space-md))' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px', color: 'var(--text-main)', marginTop: '24px' }}>
                            <input
                                type="checkbox"
                                checked={externalLoan.isInterestOnly || false}
                                onChange={(e) => handleChange('isInterestOnly', e.target.checked as any)}
                                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                            />
                            <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                Interest-Only HELOC (Pay at end)
                                <Tooltip content="You only pay interest monthly. The principal remains the same and must be paid as a lump sum at the end of the term.">
                                    <Info size={14} style={{ cursor: 'help', color: 'var(--accent-primary)' }} />
                                </Tooltip>
                            </span>
                        </label>
                    </div>

                </div>
            )}
        </div>
    );
}
