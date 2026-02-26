import type { MortgageInput } from '../utils/mortgage';
import { DollarSign, Percent, Calendar } from 'lucide-react';

interface CalculatorFormProps {
    input: MortgageInput;
    onChange: (input: MortgageInput) => void;
}

export function CalculatorForm({ input, onChange }: CalculatorFormProps) {
    const handleChange = (field: keyof MortgageInput, value: number) => {
        onChange({ ...input, [field]: value });
    };

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
                    </div>
                </div>
            </div>



        </div>
    );
}
