import { useState } from 'react';
import type { MortgageInput } from '../utils/mortgage';
import { DollarSign, Percent, Calendar } from 'lucide-react';

const MONTHS = [
    { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
    { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
    { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' }
];

interface CalculatorFormProps {
    input: MortgageInput;
    onChange: (input: MortgageInput) => void;
}

export function CalculatorForm({ input, onChange }: CalculatorFormProps) {
    const handleChange = (field: keyof MortgageInput, value: number) => {
        onChange({ ...input, [field]: value });
    };

    const [isCustomTerm, setIsCustomTerm] = useState(false);

    return (
        <div className="glass-panel" style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <h2 style={{ marginBottom: 'var(--space-sm)' }}>Loan Details</h2>

            <div className="input-group">
                <label>Home Price / Principal</label>
                <div className="input-wrapper">
                    <DollarSign className="prefix" size={18} />
                    <input
                        type="number"
                        className="has-prefix"
                        value={input.principal || ''}
                        onChange={(e) => handleChange('principal', Number(e.target.value))}
                    />
                </div>
                <input
                    type="range"
                    min="50000" max="2000000" step="10000"
                    value={input.principal}
                    onChange={(e) => handleChange('principal', Number(e.target.value))}
                />
            </div>

            <div className="input-group">
                <label>Start Date</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                        style={{ flex: 1, padding: '0.75rem', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                        value={input.startMonth || new Date().getMonth() + 1}
                        onChange={(e) => handleChange('startMonth', Number(e.target.value))}
                    >
                        {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <input
                        type="number"
                        style={{ flex: 1 }}
                        value={input.startYear || new Date().getFullYear()}
                        onChange={(e) => handleChange('startYear', Number(e.target.value))}
                    />
                </div>
            </div>

            <div className="flex gap-4">
                <div className="input-group" style={{ flex: 1 }}>
                    <label>Interest Rate</label>
                    <div className="input-wrapper">
                        <Percent className="prefix" size={18} />
                        <input
                            type="number"
                            className="has-prefix"
                            step="0.1"
                            value={input.annualInterestRate || ''}
                            onChange={(e) => handleChange('annualInterestRate', Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="input-group" style={{ flex: 1 }}>
                    <label>Loan Term (Years)</label>
                    <div className="input-wrapper">
                        <Calendar className="prefix" size={18} />
                        {isCustomTerm ? (
                            <input
                                type="number"
                                className="has-prefix"
                                value={input.years || ''}
                                onChange={(e) => handleChange('years', Number(e.target.value))}
                            />
                        ) : (
                            <select
                                className="has-prefix"
                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2rem', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none' }}
                                value={input.years}
                                onChange={(e) => handleChange('years', Number(e.target.value))}
                            >
                                <option value="10">10 Years</option>
                                <option value="15">15 Years</option>
                                <option value="20">20 Years</option>
                                <option value="30">30 Years</option>
                            </select>
                        )}
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <input
                            type="checkbox"
                            checked={isCustomTerm}
                            onChange={(e) => setIsCustomTerm(e.target.checked)}
                            style={{ accentColor: 'var(--accent-primary)', width: '14px', height: '14px' }}
                        />
                        Custom Term
                    </label>
                </div>
            </div>



        </div>
    );
}
