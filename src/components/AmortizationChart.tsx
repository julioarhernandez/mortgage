import { useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import type { AmortizationRow } from '../utils/mortgage';

interface AmortizationChartProps {
    schedule: AmortizationRow[];
}

export function AmortizationChart({ schedule }: AmortizationChartProps) {
    // We want to reduce the dataset to yearly points for a cleaner chart if there are too many months
    const yearlyData = useMemo(() => {
        // If it's a very short term, show all months, otherwise downsample to years
        if (schedule.length <= 36) return schedule.map(row => ({
            ...row, label: row.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        }));

        return schedule.filter(row => row.month % 12 === 0 || row.month === schedule.length)
            .map(row => ({
                ...row,
                label: row.date.getFullYear().toString()
            }));
    }, [schedule]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-panel" style={{ padding: 'var(--space-md)', fontSize: '0.9rem', color: 'var(--text-main)', border: '1px solid var(--accent-primary)' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>{payload[0].payload.label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color, margin: 0 }}>
                            {entry.name}: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const yAxisFormatter = (value: number) => `$${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`;

    return (
        <div style={{ width: '100%', height: 350 }}>
            {schedule.length > 0 ? (
                <ResponsiveContainer>
                    <AreaChart
                        data={yearlyData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.6} />
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                        <YAxis stroke="rgba(255,255,255,0.3)" tickFormatter={yAxisFormatter} tick={{ fill: '#9ca3af', fontSize: 12 }} dx={-10} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="remainingBalance"
                            name="Balance"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorBalance)"
                        />
                        <Area
                            type="monotone"
                            dataKey="accumulatedInterest"
                            name="Total Interest"
                            stroke="#0ea5e9"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorInterest)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    Simulation complete or no data.
                </div>
            )}
        </div>
    );
}
