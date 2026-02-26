import { useState } from 'react';
import type { MortgageInput, PaymentRule } from '../utils/mortgage';
import { DollarSign, PlusCircle, Plus, Trash2, Calendar } from 'lucide-react';

interface ExtraPaymentsFormProps {
    input: MortgageInput;
    onChange: (input: MortgageInput) => void;
    enabled: boolean;
    onToggleEnabled: (enabled: boolean) => void;
}

const MONTHS = [
    { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
    { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
    { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' }
];

export function ExtraPaymentsForm({ input, onChange, enabled, onToggleEnabled }: ExtraPaymentsFormProps) {
    const defaultYear = new Date().getFullYear();
    const [isAdding, setIsAdding] = useState(false);

    const [newRule, setNewRule] = useState<Partial<PaymentRule>>({
        type: 'monthly',
        amount: 100,
        startMonth: new Date().getMonth() + 1,
        startYear: defaultYear,
    });

    const rules = input.paymentSchedule || [];

    const handleAddRule = () => {
        if (!newRule.amount) return;
        const rule: PaymentRule = {
            id: Math.random().toString(36).substring(7),
            type: newRule.type as any,
            amount: newRule.amount,
            startMonth: newRule.startMonth || 1,
            startYear: newRule.startYear || defaultYear,
            endMonth: newRule.endMonth,
            endYear: newRule.endYear
        };

        onChange({
            ...input,
            paymentSchedule: [...rules, rule]
        });
        setIsAdding(false);
    };

    const handleRemoveRule = (id: string) => {
        onChange({
            ...input,
            paymentSchedule: rules.filter(r => r.id !== id)
        });
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

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
                Build a dynamic schedule. See how adding extra contributions on specific dates can help you pay off your mortgage faster.
            </p>

            {enabled && (
                <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

                    {/* List of Active Rules */}
                    {rules.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: 'var(--space-md)' }}>
                            {rules.map(rule => (
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
                                                Starting {MONTHS.find(m => m.value === rule.startMonth)?.label} {rule.startYear}
                                                {rule.endYear ? ` until ${MONTHS.find(m => m.value === rule.endMonth)?.label} ${rule.endYear} (or payoff)` : ' until loan payoff'}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-icon"
                                        style={{ color: 'var(--color-danger)', background: 'transparent', padding: '8px', border: 'none', cursor: 'pointer' }}
                                        onClick={() => handleRemoveRule(rule.id)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isAdding ? (
                        <button
                            className="btn"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'var(--bg-card-hover)', border: '1px dashed var(--border-color)', width: '100%', cursor: 'pointer' }}
                            onClick={() => setIsAdding(true)}
                        >
                            <Plus size={18} /> Add Payment Rule
                        </button>
                    ) : (
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', animation: 'fadeIn 0.2s ease' }}>
                            <h4 style={{ margin: 0 }}>New Payment Rule</h4>

                            <div className="flex gap-4">
                                <div className="input-group" style={{ flex: 1 }}>
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
                                <div className="input-group" style={{ flex: 1 }}>
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
                            </div>

                            <div className="input-group">
                                <label>Start Date</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <select
                                        style={{ flex: 1, padding: '0.75rem', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                                        value={newRule.startMonth}
                                        onChange={(e) => setNewRule({ ...newRule, startMonth: Number(e.target.value) })}
                                    >
                                        {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </select>
                                    <input
                                        type="number"
                                        style={{ flex: 1 }}
                                        value={newRule.startYear || ''}
                                        onChange={(e) => setNewRule({ ...newRule, startYear: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            {newRule.type !== 'one-time' && (
                                <div className="input-group">
                                    <label>End Date (Optional)</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                            <input
                                                type="radio"
                                                name="endType"
                                                checked={!newRule.endYear}
                                                onChange={() => setNewRule({ ...newRule, endMonth: undefined, endYear: undefined })}
                                                style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
                                            />
                                            Until loan payoff
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                            <input
                                                type="radio"
                                                name="endType"
                                                checked={!!newRule.endYear}
                                                onChange={() => setNewRule({ ...newRule, endMonth: newRule.startMonth, endYear: newRule.startYear || defaultYear })}
                                                style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
                                            />
                                            Custom date
                                        </label>

                                        {!!newRule.endYear && (
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                                <select
                                                    style={{ flex: 1, padding: '0.75rem', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                                                    value={newRule.endMonth || ''}
                                                    onChange={(e) => setNewRule({ ...newRule, endMonth: Number(e.target.value) })}
                                                >
                                                    {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                                </select>
                                                <input
                                                    type="number"
                                                    placeholder="YYYY"
                                                    style={{ flex: 1 }}
                                                    value={newRule.endYear || ''}
                                                    onChange={(e) => setNewRule({ ...newRule, endYear: Number(e.target.value) })}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                                <button className="btn" style={{ background: 'transparent', border: '1px solid var(--border-color)' }} onClick={() => setIsAdding(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleAddRule}>Save Rule</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
