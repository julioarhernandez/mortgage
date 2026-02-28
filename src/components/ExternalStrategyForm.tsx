import { useState } from 'react';
import type { ExternalLoanInput, ExternalPaymentRule } from '../utils/mortgage';
import { DollarSign, Percent, Calendar, Info, Plus, Trash2, PlusCircle } from 'lucide-react';
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
    const [isAdding, setIsAdding] = useState(false);
    const [activePhase, setActivePhase] = useState<'draw' | 'repay'>('draw');

    const [newRule, setNewRule] = useState<Partial<ExternalPaymentRule>>({
        type: 'monthly',
        amount: 100,
        startMonth: 1,
        durationMonths: 0 // 0 means until end
    });

    const handleChange = (field: keyof ExternalLoanInput, value: any) => {
        onChange({ ...externalLoan, [field]: value });
    };

    const handleAddRule = () => {
        if (!newRule.amount) return;
        const rule: ExternalPaymentRule = {
            id: Math.random().toString(36).substring(7),
            type: newRule.type as any,
            amount: newRule.amount,
            startMonth: newRule.startMonth || 1,
            durationMonths: newRule.durationMonths || 0
        };

        const field = activePhase === 'draw' ? 'drawPaymentSchedule' : 'repayPaymentSchedule';
        const currentRules = (externalLoan[field] || []) as ExternalPaymentRule[];

        handleChange(field, [...currentRules, rule]);
        setIsAdding(false);
    };

    const handleRemoveRule = (phase: 'draw' | 'repay', id: string) => {
        const field = phase === 'draw' ? 'drawPaymentSchedule' : 'repayPaymentSchedule';
        const currentRules = (externalLoan[field] || []) as ExternalPaymentRule[];
        handleChange(field, currentRules.filter(r => r.id !== id));
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);


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
                        <>
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

                            {/* Rate Variation */}
                            <div className="input-group col-span-full" style={{ animation: 'fadeIn 0.2s ease', marginTop: 'var(--space-sm)' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    Repayment Rate Adjustment (%)
                                    <Tooltip content="Adjust the annual interest rate for the repayment phase. Useful for modeling variable rate HELOCs.">
                                        <Info size={14} style={{ cursor: 'help', color: 'var(--accent-primary)' }} />
                                    </Tooltip>
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <input
                                            type="range"
                                            min="-10"
                                            max="10"
                                            step="0.1"
                                            style={{ flex: 1, accentColor: 'var(--accent-primary)' }}
                                            value={externalLoan.repaymentVariation || 0}
                                            onChange={(e) => handleChange('repaymentVariation', parseFloat(e.target.value))}
                                        />
                                        <div className="input-wrapper" style={{ width: '100px' }}>
                                            <Percent className="prefix" size={14} />
                                            <input
                                                type="number"
                                                className="has-prefix"
                                                step="0.1"
                                                style={{ padding: '0.4rem 0.4rem 0.4rem 2rem', fontSize: '0.9rem' }}
                                                value={externalLoan.repaymentVariation || 0}
                                                onChange={(e) => handleChange('repaymentVariation', parseFloat(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: 'var(--space-sm) var(--space-md)',
                                        background: 'rgba(var(--accent-primary-rgb), 0.1)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid rgba(var(--accent-primary-rgb), 0.2)',
                                        fontSize: '0.85rem',
                                        color: 'var(--accent-primary)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span>Projected Repayment Rate</span>
                                        <span style={{ fontWeight: 700 }}>
                                            {(externalLoan.annualRate + (externalLoan.repaymentVariation || 0)).toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
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

                    {/* Extra Payments Section (Design Parity with Base Extra Payments) */}
                    <div className="col-span-full" style={{
                        marginTop: 'var(--space-md)',
                        padding: 'var(--space-xl)',
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid',
                        borderColor: externalLoan.extraPaymentsEnabled ? 'var(--accent-primary)' : 'var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-md)',
                        animation: 'fadeIn 0.4s ease'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center' }}>
                                <PlusCircle size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--accent-primary)' }} />
                                Extra Payments
                            </h2>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                                <span style={{ fontSize: '0.9rem', color: externalLoan.extraPaymentsEnabled ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                                    {externalLoan.extraPaymentsEnabled ? 'Active' : 'Enable'}
                                </span>
                                <input
                                    type="checkbox"
                                    checked={externalLoan.extraPaymentsEnabled || false}
                                    onChange={(e) => handleChange('extraPaymentsEnabled', e.target.checked)}
                                    style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }}
                                />
                            </label>
                        </div>

                        <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: 'var(--space-sm)' }}>
                            Build a dynamic schedule for this external loan. See how adding extra principal contributions help you pay off the debt faster and reduce the total cost of the strategy.
                        </p>

                        {externalLoan.extraPaymentsEnabled && (
                            <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

                                {/* List of Active Rules (Targeting Draw/Repay) */}
                                {((externalLoan.drawPaymentSchedule?.length || 0) + (externalLoan.repayPaymentSchedule?.length || 0)) > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                        {/* Draw Rules */}
                                        {externalLoan.drawPaymentSchedule?.length ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    {externalLoan.isInterestOnly ? 'Draw Phase Rules' : 'Loan Rules'}
                                                </div>
                                                {externalLoan.drawPaymentSchedule.map(rule => (
                                                    <div key={rule.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ padding: '8px', background: 'var(--bg-card)', borderRadius: '50%' }}>
                                                                <Calendar size={16} className="text-muted" />
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 500 }}>
                                                                    Pay <span style={{ color: 'var(--accent-primary)' }}>{formatCurrency(rule.amount)}</span> {rule.type}
                                                                </div>
                                                                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                                    {rule.type === 'one-time'
                                                                        ? `Month ${rule.startMonth}`
                                                                        : `Starting Month ${rule.startMonth} ${rule.durationMonths ? `for ${rule.durationMonths}mo` : 'until phase ends'}`
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="btn btn-icon"
                                                            style={{ color: 'var(--color-danger)', background: 'transparent', padding: '8px', border: 'none', cursor: 'pointer' }}
                                                            onClick={() => handleRemoveRule('draw', rule.id)}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null}

                                        {/* Repay Rules */}
                                        {externalLoan.isInterestOnly && externalLoan.repayPaymentSchedule?.length ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Repay Phase Rules
                                                </div>
                                                {externalLoan.repayPaymentSchedule.map(rule => (
                                                    <div key={rule.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ padding: '8px', background: 'var(--bg-card)', borderRadius: '50%' }}>
                                                                <Calendar size={16} className="text-muted" />
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 500 }}>
                                                                    Pay <span style={{ color: 'var(--accent-primary)' }}>{formatCurrency(rule.amount)}</span> {rule.type}
                                                                </div>
                                                                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                                    {rule.type === 'one-time'
                                                                        ? `Month ${rule.startMonth}`
                                                                        : `Starting Month ${rule.startMonth} ${rule.durationMonths ? `for ${rule.durationMonths}mo` : 'until phase ends'}`
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="btn btn-icon"
                                                            style={{ color: 'var(--color-danger)', background: 'transparent', padding: '8px', border: 'none', cursor: 'pointer' }}
                                                            onClick={() => handleRemoveRule('repay', rule.id)}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                )}

                                {/* Rule Builder Toggle */}
                                {!isAdding ? (
                                    <button
                                        className="btn"
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'var(--bg-card-hover)', border: '1px dashed var(--border-color)', width: '100%', cursor: 'pointer', color: 'var(--text-main)' }}
                                        onClick={() => setIsAdding(true)}
                                    >
                                        <Plus size={18} /> Add Payment Rule
                                    </button>
                                ) : (
                                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', animation: 'fadeIn 0.2s ease' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                            <h4 style={{ margin: 0, fontSize: '1rem' }}>New Payment Rule</h4>
                                            {externalLoan.isInterestOnly && (
                                                <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: 'var(--radius-md)', width: 'fit-content' }}>
                                                    <button
                                                        onClick={() => setActivePhase('draw')}
                                                        style={{ padding: '6px 16px', fontSize: '0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', background: activePhase === 'draw' ? 'var(--accent-primary)' : 'transparent', color: 'white' }}
                                                    >
                                                        Draw Phase
                                                    </button>
                                                    <button
                                                        onClick={() => setActivePhase('repay')}
                                                        style={{ padding: '6px 16px', fontSize: '0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', background: activePhase === 'repay' ? 'var(--accent-primary)' : 'transparent', color: 'white' }}
                                                    >
                                                        Repay Phase
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2" style={{ gap: 'var(--space-md)' }}>
                                            <div className="input-group">
                                                <label>Frequency</label>
                                                <select
                                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none' }}
                                                    value={newRule.type}
                                                    onChange={(e) => setNewRule({ ...newRule, type: e.target.value as any })}
                                                >
                                                    <option value="monthly">Monthly</option>
                                                    <option value="yearly">Yearly</option>
                                                    <option value="one-time">One-Time</option>
                                                </select>
                                            </div>
                                            <div className="input-group">
                                                <label>Amount</label>
                                                <div className="input-wrapper">
                                                    <DollarSign className="prefix" size={18} />
                                                    <input
                                                        type="number"
                                                        className="has-prefix"
                                                        value={newRule.amount || ''}
                                                        onChange={(e) => setNewRule({ ...newRule, amount: Number(e.target.value) })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="input-group col-span-full">
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    Start Month (Phase Relative)
                                                    <Tooltip content="Month 1 is the very first month of the selected phase (Draw or Repay). The payment will trigger starting from this month onward.">
                                                        <Info size={14} style={{ cursor: 'help', color: 'var(--accent-primary)' }} />
                                                    </Tooltip>
                                                </label>
                                                <input
                                                    type="number"
                                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none' }}
                                                    value={newRule.startMonth || ''}
                                                    placeholder="1 = Start of Phase"
                                                    onChange={(e) => setNewRule({ ...newRule, startMonth: Number(e.target.value) })}
                                                />
                                            </div>
                                            {newRule.type !== 'one-time' && (
                                                <div className="input-group col-span-full">
                                                    <label>Duration (Months)</label>
                                                    <input
                                                        type="number"
                                                        style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none' }}
                                                        value={newRule.durationMonths || ''}
                                                        placeholder="0 = Until phase ends"
                                                        onChange={(e) => setNewRule({ ...newRule, durationMonths: Number(e.target.value) })}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                                            <button className="btn" style={{ background: 'transparent', border: '1px solid var(--border-color)' }} onClick={() => setIsAdding(false)}>Cancel</button>
                                            <button className="btn btn-primary" onClick={handleAddRule}>Save Rule</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
