import { useState } from 'react';
import type { MortgageInput } from '../utils/mortgage';
import { getDownPaymentAmount, getLoanAmount, getMonthlyPmi, isPmiRequired } from '../utils/mortgage';
import { DollarSign, Percent, Calendar, ShieldCheck, Info } from 'lucide-react';
import { Tooltip } from './Tooltip';

const OTHER_MONTHLY_COSTS: { key: 'electricity' | 'gas' | 'water' | 'trashSewer' | 'hoaDues' | 'internet'; label: string }[] = [
    { key: 'electricity', label: 'Electricity' },
    { key: 'gas', label: 'Gas' },
    { key: 'water', label: 'Water' },
    { key: 'trashSewer', label: 'Trash & Sewer' },
    { key: 'hoaDues', label: 'HOA Dues' },
    { key: 'internet', label: 'Internet' },
];

const formatMoney = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

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

    const pmiRequired = isPmiRequired(input);

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
                <label>Down Payment</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="input-wrapper" style={{ flex: 1 }}>
                        {input.downPaymentIsPercent
                            ? <Percent className="prefix" size={18} />
                            : <DollarSign className="prefix" size={18} />}
                        <input
                            type="number"
                            className="has-prefix"
                            step={input.downPaymentIsPercent ? '0.5' : '1000'}
                            value={input.downPayment || ''}
                            onChange={(e) => handleChange('downPayment', Number(e.target.value))}
                        />
                    </div>
                    <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                        {[
                            { isPercent: true, symbol: '%' },
                            { isPercent: false, symbol: '$' }
                        ].map(({ isPercent, symbol }) => {
                            const active = !!input.downPaymentIsPercent === isPercent;
                            return (
                                <button
                                    key={symbol}
                                    type="button"
                                    onClick={() => onChange({ ...input, downPaymentIsPercent: isPercent })}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        background: active ? 'var(--accent-primary)' : 'rgba(0,0,0,0.2)',
                                        color: active ? '#000' : 'var(--text-main)'
                                    }}
                                >
                                    {symbol}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <input
                        type="checkbox"
                        checked={!!input.downPaymentInPrincipal}
                        onChange={(e) => onChange({ ...input, downPaymentInPrincipal: e.target.checked })}
                        style={{ accentColor: 'var(--accent-primary)', width: '14px', height: '14px' }}
                    />
                    Part of home price (reduces the loan)
                </label>
                <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                    Down payment: {formatMoney(getDownPaymentAmount(input))} · Loan amount: {formatMoney(getLoanAmount(input))}
                </p>
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

            {/* Monthly Costs Subsection */}
            <div style={{
                marginTop: 'var(--space-md)',
                paddingTop: 'var(--space-md)',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-md)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={20} className="text-muted" style={{ color: input.monthlyCostsEnabled ? 'var(--accent-primary)' : 'inherit' }} />
                        Monthly Costs
                    </h3>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: input.monthlyCostsEnabled ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                            {input.monthlyCostsEnabled ? 'Included' : 'Include'}
                        </span>
                        <input
                            type="checkbox"
                            checked={input.monthlyCostsEnabled}
                            onChange={(e) => handleChange('monthlyCostsEnabled', e.target.checked as any)}
                            style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }}
                        />
                    </label>
                </div>

                <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 'var(--space-sm)' }}>
                    Accurately calculate your real monthly budget by including property taxes, homeowners insurance, private mortgage insurance (PMI), and your everyday household bills.
                </p>

                {input.monthlyCostsEnabled && (
                    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        <div className="input-group">
                            <label>Property Tax (Yearly)</label>
                            <div className="input-wrapper">
                                <DollarSign className="prefix" size={16} />
                                <input
                                    type="number"
                                    className="has-prefix"
                                    value={input.propertyTax || ''}
                                    onChange={(e) => handleChange('propertyTax', Number(e.target.value))}
                                />
                            </div>
                            <input
                                type="range"
                                min="0" max="20000" step="100"
                                value={input.propertyTax || 0}
                                onChange={(e) => handleChange('propertyTax', Number(e.target.value))}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            <div className="input-group">
                                <label>Insurance (Yearly)</label>
                                <div className="input-wrapper">
                                    <DollarSign className="prefix" size={16} />
                                    <input
                                        type="number"
                                        className="has-prefix"
                                        value={input.homeInsurance || ''}
                                        onChange={(e) => handleChange('homeInsurance', Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="input-group" style={{ opacity: pmiRequired ? 1 : 0.5 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    PMI
                                    <Tooltip content="Private mortgage insurance is usually required when the down payment is under 20%. Enter it as an annual % of the loan or as a monthly $ amount. Find the exact amount on your mortgage statement under 'Escrow' or 'Breakdown of Payments'.">
                                        <Info size={14} style={{ cursor: 'help', color: 'var(--accent-primary)' }} />
                                    </Tooltip>
                                </label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div className="input-wrapper" style={{ flex: 1 }}>
                                        {input.pmiIsPercent ?? true
                                            ? <Percent className="prefix" size={16} />
                                            : <DollarSign className="prefix" size={16} />}
                                        <input
                                            type="number"
                                            className="has-prefix"
                                            step={(input.pmiIsPercent ?? true) ? '0.05' : '1'}
                                            disabled={!pmiRequired}
                                            value={input.pmi ?? ''}
                                            onChange={(e) => handleChange('pmi', Number(e.target.value))}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                        {[
                                            { isPercent: true, symbol: '%' },
                                            { isPercent: false, symbol: '$' }
                                        ].map(({ isPercent, symbol }) => {
                                            const active = (input.pmiIsPercent ?? true) === isPercent;
                                            return (
                                                <button
                                                    key={symbol}
                                                    type="button"
                                                    disabled={!pmiRequired}
                                                    onClick={() => onChange({ ...input, pmiIsPercent: isPercent })}
                                                    style={{
                                                        padding: '0.75rem 1rem',
                                                        border: 'none',
                                                        cursor: pmiRequired ? 'pointer' : 'not-allowed',
                                                        fontWeight: 600,
                                                        background: active ? 'var(--accent-primary)' : 'rgba(0,0,0,0.2)',
                                                        color: active ? '#000' : 'var(--text-main)'
                                                    }}
                                                >
                                                    {symbol}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                                    {!pmiRequired
                                        ? 'Not included: down payment is 20% or more.'
                                        : (input.pmiIsPercent ?? true)
                                            ? `${input.pmi || 0}% per year = ${formatMoney(getMonthlyPmi(input))}/mo`
                                            : `${formatMoney(getMonthlyPmi(input))}/mo`}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: 'var(--space-sm)' }}>
                                Utilities &amp; Other (Monthly)
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                {OTHER_MONTHLY_COSTS.map(({ key, label }) => (
                                    <div className="input-group" key={key}>
                                        <label>{label}</label>
                                        <div className="input-wrapper">
                                            <DollarSign className="prefix" size={16} />
                                            <input
                                                type="number"
                                                className="has-prefix"
                                                value={input[key] || ''}
                                                onChange={(e) => handleChange(key, Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
