import { useState } from 'react';
import type { ExternalLoanInput, ExternalPaymentRule } from '../utils/mortgage';
import { DollarSign, Percent, Calendar, Info, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
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
    const [isExpanded, setIsExpanded] = useState(false);
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

    const renderRulesList = (rules: ExternalPaymentRule[], phase: 'draw' | 'repay') => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rules.map(rule => (
                <div key={rule.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{formatCurrency(rule.amount)}</span> {rule.type}
                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                            Starting Month {rule.startMonth} {rule.durationMonths ? `for ${rule.durationMonths}mo` : 'until phase ends'}
                        </div>
                    </div>
                    <button
                        onClick={() => handleRemoveRule(phase, rule.id)}
                        className="btn-icon"
                        style={{ padding: '4px', color: 'var(--color-danger)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ))}
        </div>
    );

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

                    {/* Extra Payments Collapsible Section */}
                    <div className="col-span-full" style={{
                        marginTop: 'var(--space-md)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        background: 'rgba(255,255,255,0.02)',
                        animation: 'fadeIn 0.4s ease'
                    }}>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            style={{
                                width: '100%',
                                padding: 'var(--space-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'rgba(var(--accent-primary-rgb), 0.05)',
                                border: 'none',
                                color: 'var(--accent-primary)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                Extra Payments (Principal Reduction)
                                <Tooltip content="Set up rules to pay extra principal during the draw and/or repayment phase. This will reduce your balance faster and save interest.">
                                    <Info size={14} style={{ cursor: 'help' }} />
                                </Tooltip>
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 400 }}>
                                {((externalLoan.drawPaymentSchedule?.length || 0) + (externalLoan.repayPaymentSchedule?.length || 0))} active rules
                            </div>
                        </button>

                        {isExpanded && (
                            <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', animation: 'fadeIn 0.2s ease' }}>
                                {/* Rule Builder Toggle */}
                                {!isAdding ? (
                                    <button
                                        className="btn btn-secondary"
                                        style={{ width: '100%', padding: '10px', display: 'flex', justifyContent: 'center', gap: '8px', border: '1px dashed var(--border-color)' }}
                                        onClick={() => setIsAdding(true)}
                                    >
                                        <Plus size={16} /> Add Payment Rule
                                    </button>
                                ) : (
                                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', border: '1px solid var(--accent-primary)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem' }}>New Payment Rule</h4>
                                            {externalLoan.isInterestOnly && (
                                                <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.1)', padding: '2px', borderRadius: '4px' }}>
                                                    <button
                                                        onClick={() => setActivePhase('draw')}
                                                        style={{ padding: '4px 8px', fontSize: '0.7rem', border: 'none', borderRadius: '3px', cursor: 'pointer', background: activePhase === 'draw' ? 'var(--accent-primary)' : 'transparent', color: activePhase === 'draw' ? 'white' : 'inherit' }}
                                                    >
                                                        Draw Phase
                                                    </button>
                                                    <button
                                                        onClick={() => setActivePhase('repay')}
                                                        style={{ padding: '4px 8px', fontSize: '0.7rem', border: 'none', borderRadius: '3px', cursor: 'pointer', background: activePhase === 'repay' ? 'var(--accent-primary)' : 'transparent', color: activePhase === 'repay' ? 'white' : 'inherit' }}
                                                    >
                                                        Repay Phase
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2" style={{ gap: 'var(--space-sm)' }}>
                                            <div className="input-group">
                                                <label style={{ fontSize: '0.75rem' }}>Frequency</label>
                                                <select
                                                    value={newRule.type}
                                                    onChange={(e) => setNewRule({ ...newRule, type: e.target.value as any })}
                                                    style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                                                >
                                                    <option value="monthly">Monthly</option>
                                                    <option value="yearly">Yearly</option>
                                                    <option value="one-time">One-Time</option>
                                                </select>
                                            </div>
                                            <div className="input-group">
                                                <label style={{ fontSize: '0.75rem' }}>Amount</label>
                                                <div className="input-wrapper" style={{ height: '36px' }}>
                                                    <DollarSign className="prefix" size={14} />
                                                    <input
                                                        type="number"
                                                        className="has-prefix"
                                                        style={{ fontSize: '0.85rem' }}
                                                        value={newRule.amount || ''}
                                                        onChange={(e) => setNewRule({ ...newRule, amount: Number(e.target.value) })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="input-group">
                                                <label style={{ fontSize: '0.75rem' }}>Relative Start Month</label>
                                                <input
                                                    type="number"
                                                    style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.85rem' }}
                                                    value={newRule.startMonth || ''}
                                                    placeholder="1 = Phase Start"
                                                    onChange={(e) => setNewRule({ ...newRule, startMonth: Number(e.target.value) })}
                                                />
                                            </div>

                                            {newRule.type !== 'one-time' && (
                                                <div className="input-group">
                                                    <label style={{ fontSize: '0.75rem' }}>Duration (Months)</label>
                                                    <input
                                                        type="number"
                                                        style={{ width: '100%', padding: '0.6rem', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.85rem' }}
                                                        value={newRule.durationMonths || ''}
                                                        placeholder="0 = Until phase ends"
                                                        onChange={(e) => setNewRule({ ...newRule, durationMonths: Number(e.target.value) })}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', justifyContent: 'flex-end' }}>
                                            <button className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setIsAdding(false)}>Cancel</button>
                                            <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={handleAddRule}>Save Rule</button>
                                        </div>
                                    </div>
                                )}

                                {/* Rules Display */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                    {/* Draw Phase Rules (or only phase) */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {externalLoan.isInterestOnly ? 'Draw Phase Rules' : 'Loan Rules'}
                                        </div>
                                        {externalLoan.drawPaymentSchedule?.length ? renderRulesList(externalLoan.drawPaymentSchedule as ExternalPaymentRule[], 'draw') : (
                                            <div style={{ fontSize: '0.8rem', opacity: 0.4, fontStyle: 'italic', padding: '8px' }}>No rules set for this phase</div>
                                        )}
                                    </div>

                                    {/* Repay Phase Rules */}
                                    {externalLoan.isInterestOnly && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Repay Phase Rules
                                            </div>
                                            {externalLoan.repayPaymentSchedule?.length ? renderRulesList(externalLoan.repayPaymentSchedule as ExternalPaymentRule[], 'repay') : (
                                                <div style={{ fontSize: '0.8rem', opacity: 0.4, fontStyle: 'italic', padding: '8px' }}>No rules set for this phase</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
}
