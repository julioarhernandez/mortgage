import { useState } from 'react';
import type { AmortizationRow } from '../utils/mortgage';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AmortizationTableProps {
    schedule: AmortizationRow[];
}

export function AmortizationTable({ schedule }: AmortizationTableProps) {
    const [page, setPage] = useState(0);
    const rowsPerPage = 24; // 2 years at a time is easy to digest

    const totalPages = Math.ceil(schedule.length / rowsPerPage);
    const displayedRows = schedule.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

    const formatDate = (date: Date) =>
        new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);

    return (
        <div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th className="text-left">Date</th>
                            <th>Payment</th>
                            <th>Principal</th>
                            <th>Interest</th>
                            <th>Extra</th>
                            <th>Total Interest</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedRows.map((row) => (
                            <tr key={row.month} style={{ borderLeft: row.extraPayment > 0 ? '3px solid var(--accent-primary)' : '3px solid transparent' }}>
                                <td className="text-left text-muted">
                                    <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{formatDate(row.date)}</span>
                                    <div style={{ fontSize: '0.75rem' }}>Mo {row.month}</div>
                                </td>
                                <td>{formatCurrency(row.totalPayment)}</td>
                                <td style={{ color: 'var(--text-muted)' }}>{formatCurrency(row.principalPayment)}</td>
                                <td style={{ color: 'var(--text-muted)' }}>{formatCurrency(row.interestPayment)}</td>
                                <td style={{ color: row.extraPayment > 0 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                                    {row.extraPayment > 0 ? `+${formatCurrency(row.extraPayment)}` : '-'}
                                </td>
                                <td>{formatCurrency(row.accumulatedInterest)}</td>
                                <td style={{ fontWeight: 600 }}>{formatCurrency(row.remainingBalance)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-md)' }}>
                    <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                        Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, schedule.length)} of {schedule.length} months
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <button
                            className="btn"
                            style={{ padding: '0.5rem 1rem', background: page === 0 ? 'var(--bg-card)' : 'var(--bg-card-hover)', color: page === 0 ? 'var(--text-muted)' : 'var(--text-main)', pointerEvents: page === 0 ? 'none' : 'auto' }}
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                        >
                            <ChevronLeft size={18} /> Prev
                        </button>
                        <button
                            className="btn"
                            style={{ padding: '0.5rem 1rem', background: page >= totalPages - 1 ? 'var(--bg-card)' : 'var(--bg-card-hover)', color: page >= totalPages - 1 ? 'var(--text-muted)' : 'var(--text-main)', pointerEvents: page >= totalPages - 1 ? 'none' : 'auto' }}
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        >
                            Next <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
