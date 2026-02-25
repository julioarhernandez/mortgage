import { useState, useMemo } from 'react';
import { calculateAmortization, type MortgageInput } from './utils/mortgage';
import { CalculatorForm } from './components/CalculatorForm';
import { SummaryCards } from './components/SummaryCards';
import { AmortizationChart } from './components/AmortizationChart';
import { AmortizationTable } from './components/AmortizationTable';
import './index.css';

function App() {
  const [input, setInput] = useState<MortgageInput>({
    principal: 300000,
    annualInterestRate: 5.5,
    years: 30,
    extraMonthlyPayment: 0,
    extraYearlyPayment: 0,
    oneTimePayment: 0,
    oneTimePaymentMonth: 12
  });

  const summary = useMemo(() => calculateAmortization(input), [input]);

  return (
    <div className="container">
      <header style={{ marginBottom: 'var(--space-xl)', textAlign: 'center' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: 'var(--space-sm)' }}>
          Mortgage Pro
        </h1>
        <p className="text-muted">Advanced Amortization & Extra Payment Analyzer</p>
      </header>

      <div className="grid grid-cols-3">
        {/* Left Column: Form */}
        <div style={{ gridColumn: '1 / 2' }}>
          <CalculatorForm input={input} onChange={setInput} />
        </div>

        {/* Right Column: Dashboard & Charts */}
        <div style={{ gridColumn: '2 / 4', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <SummaryCards summary={summary} />

          <div className="glass-panel" style={{ padding: 'var(--space-lg)' }}>
            <h2 style={{ marginBottom: 'var(--space-md)' }}>Principal vs Interest</h2>
            <AmortizationChart schedule={summary.schedule} />
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-lg)' }}>
        <h2 style={{ marginBottom: 'var(--space-md)' }}>Amortization Schedule</h2>
        <AmortizationTable schedule={summary.schedule} />
      </div>
    </div>
  );
}

export default App;
