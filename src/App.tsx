import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { calculateAmortization, calculateArbitrage, calculateRefinance, type MortgageInput, type ExternalLoanInput, type RefinanceInput } from './utils/mortgage';
import { CalculatorForm } from './components/CalculatorForm';
import { ExtraPaymentsForm } from './components/ExtraPaymentsForm';
import { SummaryCards } from './components/SummaryCards';
import { AmortizationChart } from './components/AmortizationChart';
import { AmortizationTable } from './components/AmortizationTable';
import { ExternalStrategyForm } from './components/ExternalStrategyForm';
import { ArbitrageSummaryCard } from './components/ArbitrageSummary';
import { RefinanceStrategyForm } from './components/RefinanceStrategyForm';
import { RefinanceSummaryCard } from './components/RefinanceSummary';
import './index.css';

function App() {
  const [input, setInput] = useState<MortgageInput>(() => {
    const saved = localStorage.getItem('mortgage-input');
    return saved ? JSON.parse(saved) : {
      principal: 300000,
      annualInterestRate: 5.5,
      years: 30,
      extraMonthlyPayment: 0,
      extraYearlyPayment: 0,
      oneTimePayment: 0,
      oneTimePaymentMonth: 12
    };
  });

  const [externalLoan, setExternalLoan] = useState<ExternalLoanInput>(() => {
    const saved = localStorage.getItem('mortgage-external-loan');
    return saved ? JSON.parse(saved) : {
      amount: 50000,
      annualRate: 7.5,
      termMonths: 60,
      repaymentTermMonths: 60,
      repaymentVariation: 0,
      drawPaymentSchedule: [],
      repayPaymentSchedule: [],
      startDateMonth: new Date().getMonth() + 1,
      startDateYear: new Date().getFullYear(),
      isInterestOnly: false
    };
  });

  const [refinanceForm, setRefinanceForm] = useState<RefinanceInput>(() => {
    const saved = localStorage.getItem('mortgage-refinance-form');
    return saved ? JSON.parse(saved) : {
      refinanceMonthNum: new Date().getMonth() + 1,
      refinanceYear: new Date().getFullYear() + 2,
      newAnnualRate: 4.5,
      newTermYears: 30,
      closingCosts: 5000,
      rollClosingCostsIntoLoan: true,
      includeExtraPayments: true
    };
  });

  const [activeStrategy, setActiveStrategy] = useState<'none' | 'arbitrage' | 'refinance'>(() => {
    const saved = localStorage.getItem('mortgage-active-strategy');
    return (saved as any) || 'none';
  });

  const [extraPaymentsEnabled, setExtraPaymentsEnabled] = useState(() => {
    const saved = localStorage.getItem('mortgage-extra-payments-enabled');
    return saved ? JSON.parse(saved) : false;
  });

  const [isAmortizationExpanded, setIsAmortizationExpanded] = useState(() => {
    const saved = localStorage.getItem('mortgage-amortization-expanded');
    return saved ? JSON.parse(saved) : false;
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('mortgage-input', JSON.stringify(input));
  }, [input]);

  useEffect(() => {
    localStorage.setItem('mortgage-external-loan', JSON.stringify(externalLoan));
  }, [externalLoan]);

  useEffect(() => {
    localStorage.setItem('mortgage-refinance-form', JSON.stringify(refinanceForm));
  }, [refinanceForm]);

  useEffect(() => {
    localStorage.setItem('mortgage-active-strategy', activeStrategy);
  }, [activeStrategy]);

  useEffect(() => {
    localStorage.setItem('mortgage-extra-payments-enabled', JSON.stringify(extraPaymentsEnabled));
  }, [extraPaymentsEnabled]);

  useEffect(() => {
    localStorage.setItem('mortgage-amortization-expanded', JSON.stringify(isAmortizationExpanded));
  }, [isAmortizationExpanded]);

  const baseCalculatedInput = useMemo(() => {
    const activeInput = { ...input };
    if (!extraPaymentsEnabled) {
      activeInput.paymentSchedule = [];
    }
    return activeInput;
  }, [input, extraPaymentsEnabled]);

  const summary = useMemo(() => {
    return calculateAmortization(baseCalculatedInput);
  }, [baseCalculatedInput]);

  const arbitrage = useMemo(() => {
    if (activeStrategy !== 'arbitrage') return null;
    return calculateArbitrage(baseCalculatedInput, externalLoan);
  }, [baseCalculatedInput, externalLoan, activeStrategy]);

  const refinanceSummary = useMemo(() => {
    if (activeStrategy !== 'refinance') return null;
    return calculateRefinance(baseCalculatedInput, refinanceForm);
  }, [baseCalculatedInput, refinanceForm, activeStrategy]);

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
        <div className="lg-col-span-1" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <CalculatorForm input={input} onChange={setInput} />
          <ExtraPaymentsForm
            input={input}
            onChange={setInput}
            enabled={extraPaymentsEnabled}
            onToggleEnabled={setExtraPaymentsEnabled}
          />
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
        <div className="lg-col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
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
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
          onClick={() => setIsAmortizationExpanded(!isAmortizationExpanded)}
        >
          <h2 style={{ marginBottom: isAmortizationExpanded ? 'var(--space-md)' : 0, transition: 'margin 0.3s ease' }}>Amortization Schedule</h2>
          <div style={{ padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '50%', color: 'var(--accent-primary)' }}>
            {isAmortizationExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </div>
        </div>

        {isAmortizationExpanded && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <AmortizationTable schedule={summary.schedule} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
