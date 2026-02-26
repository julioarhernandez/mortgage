import { useState, useMemo } from 'react';
import { calculateAmortization, calculateArbitrage, calculateRefinance, type MortgageInput, type ExternalLoanInput, type RefinanceInput } from './utils/mortgage';
import { CalculatorForm } from './components/CalculatorForm';
import { SummaryCards } from './components/SummaryCards';
import { AmortizationChart } from './components/AmortizationChart';
import { AmortizationTable } from './components/AmortizationTable';
import { ExternalStrategyForm } from './components/ExternalStrategyForm';
import { ArbitrageSummaryCard } from './components/ArbitrageSummary';
import { RefinanceStrategyForm } from './components/RefinanceStrategyForm';
import { RefinanceSummaryCard } from './components/RefinanceSummary';
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

  const [externalLoan, setExternalLoan] = useState<ExternalLoanInput>({
    amount: 50000,
    annualRate: 7.5,
    termMonths: 60,
    isInterestOnly: false
  });

  const [refinanceForm, setRefinanceForm] = useState<RefinanceInput>({
    refinanceMonth: 12,
    newAnnualRate: 4.5,
    newTermYears: 30,
    closingCosts: 5000,
    rollClosingCostsIntoLoan: true
  });

  const [activeStrategy, setActiveStrategy] = useState<'none' | 'arbitrage' | 'refinance'>('none');

  const summary = useMemo(() => {
    return calculateAmortization(input);
  }, [input]);

  const arbitrage = useMemo(() => {
    if (activeStrategy !== 'arbitrage') return null;
    return calculateArbitrage(input, externalLoan);
  }, [input, externalLoan, activeStrategy]);

  const refinanceSummary = useMemo(() => {
    if (activeStrategy !== 'refinance') return null;
    return calculateRefinance(input, refinanceForm);
  }, [input, refinanceForm, activeStrategy]);

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
        <div style={{ gridColumn: '1 / 2', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <CalculatorForm input={input} onChange={setInput} />
          <ExternalStrategyForm
            externalLoan={externalLoan}
            onChange={setExternalLoan}
            enabled={activeStrategy === 'arbitrage'}
            onToggleEnabled={(enabled) => setActiveStrategy(enabled ? 'arbitrage' : 'none')}
          />
          <RefinanceStrategyForm
            refinanceForm={refinanceForm}
            onChange={setRefinanceForm}
            enabled={activeStrategy === 'refinance'}
            onToggleEnabled={(enabled) => setActiveStrategy(enabled ? 'refinance' : 'none')}
          />
        </div>

        {/* Right Column: Dashboard & Charts */}
        <div style={{ gridColumn: '2 / 4', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <SummaryCards summary={summary} />
          {arbitrage && <ArbitrageSummaryCard arbitrage={arbitrage} />}
          {refinanceSummary && <RefinanceSummaryCard summary={refinanceSummary} />}

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
