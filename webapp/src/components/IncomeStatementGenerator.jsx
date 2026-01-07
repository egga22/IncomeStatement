import { useState, useCallback, useMemo } from 'react';
import { defaultTransactions, defaultPersonalities } from '../data/transactions';
import './IncomeStatementGenerator.css';

const DEFAULT_PERSONALITY_ID = 'default';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Generate a random income statement based on current settings
// Teens cannot go into debt - balance must stay >= 0
function generateIncomeStatement(transactions, gender, count = 20, startingBalance = 0, allowanceAmount = 0, allowanceDay = 0) {
  // Filter transactions based on gender and active status
  const filteredTransactions = transactions.filter(t => {
    if (!t.active) return false;
    if (gender === 'Any') return true;
    return t.gender === 'Any' || t.gender === gender;
  });

  if (filteredTransactions.length === 0) {
    return [];
  }

  // Separate income and expense transactions
  const incomeTransactions = filteredTransactions.filter(t => t.price > 0);
  const expenseTransactions = filteredTransactions.filter(t => t.price < 0);

  const statement = [];
  let runningBalance = startingBalance;
  let currentDay = 0; // Start on Sunday (0)
  let transactionIndex = 0;

  // Helper to check if this is the first transaction of a day
  const isFirstOfDay = (dayName) => 
    statement.length === 0 || statement[statement.length - 1].dayOfWeek !== dayName;

  // Target number of transactions (not counting allowances)
  let regularTransactionsAdded = 0;

  while (regularTransactionsAdded < count) {
    const dayName = DAYS_OF_WEEK[currentDay];

    // Add allowance if it's the allowance day and allowance is enabled
    if (isFirstOfDay(dayName) && allowanceAmount > 0 && currentDay === allowanceDay) {
      runningBalance += allowanceAmount;
      transactionIndex++;
      statement.push({
        id: transactionIndex,
        transactionId: 'allowance',
        name: 'Allowance',
        balanceUpdate: allowanceAmount,
        newBalance: runningBalance,
        dayOfWeek: dayName,
        isNewDay: true,
      });
    }

    // Determine how many transactions to add for this day (1-3, randomly)
    const transactionsForDay = Math.floor(Math.random() * 3) + 1;

    for (let dayTx = 0; dayTx < transactionsForDay && regularTransactionsAdded < count; dayTx++) {
      // Filter affordable expenses (ones that won't cause debt)
      const affordableExpenses = expenseTransactions.filter(t => 
        runningBalance + t.price >= 0
      );

      // Combine income with affordable expenses for selection pool
      const availableTransactions = [...incomeTransactions, ...affordableExpenses];

      if (availableTransactions.length === 0) {
        // No transactions available (shouldn't happen if there's at least one income source)
        break;
      }

      // Calculate total weight for weighted random selection
      const totalWeight = availableTransactions.reduce((sum, t) => sum + t.odds, 0);

      // Weighted random selection
      let random = Math.random() * totalWeight;
      let selectedTransaction = availableTransactions[0];

      for (const transaction of availableTransactions) {
        random -= transaction.odds;
        if (random <= 0) {
          selectedTransaction = transaction;
          break;
        }
      }

      runningBalance += selectedTransaction.price;
      transactionIndex++;

      statement.push({
        id: transactionIndex,
        transactionId: selectedTransaction.id,
        name: selectedTransaction.name,
        balanceUpdate: selectedTransaction.price,
        newBalance: runningBalance,
        dayOfWeek: dayName,
        isNewDay: isFirstOfDay(dayName),
      });

      regularTransactionsAdded++;
    }

    // Move to the next day (cycle through the week)
    currentDay = (currentDay + 1) % 7;
  }

  return statement;
}

// Apply personality overrides to transactions
function applyPersonality(baseTransactions, personality) {
  return baseTransactions.map(t => {
    const override = personality.items[t.id];
    if (override) {
      return {
        ...t,
        active: override.active !== undefined ? override.active : t.active,
        odds: override.odds !== undefined ? override.odds : t.odds,
      };
    }
    return { ...t };
  });
}

export default function IncomeStatementGenerator() {
  const [transactions, setTransactions] = useState(defaultTransactions);
  const [gender, setGender] = useState('Any');
  const [transactionCount, setTransactionCount] = useState(20);
  const [startingBalance, setStartingBalance] = useState(0);
  const [allowanceAmount, setAllowanceAmount] = useState(0);
  const [allowanceDay, setAllowanceDay] = useState(0); // Sunday by default
  const [statement, setStatement] = useState([]);
  const [selectedPersonality, setSelectedPersonality] = useState(DEFAULT_PERSONALITY_ID);
  const [personalities] = useState(defaultPersonalities);
  const [showSettings, setShowSettings] = useState(false);

  // Check if current settings differ from selected personality
  const hasModifications = useMemo(() => {
    const personality = personalities.find(p => p.id === selectedPersonality);
    if (!personality) return false;

    // Compare gender
    if (gender !== personality.gender && personality.id !== DEFAULT_PERSONALITY_ID) return true;

    // Compare transaction settings
    const baseTransactions = applyPersonality(defaultTransactions, personality);
    for (const t of transactions) {
      const base = baseTransactions.find(bt => bt.id === t.id);
      if (base && (t.active !== base.active || t.odds !== base.odds)) {
        return true;
      }
    }
    return false;
  }, [transactions, gender, selectedPersonality, personalities]);

  const handleGenerate = useCallback(() => {
    const newStatement = generateIncomeStatement(transactions, gender, transactionCount, startingBalance, allowanceAmount, allowanceDay);
    setStatement(newStatement);
  }, [transactions, gender, transactionCount, startingBalance, allowanceAmount, allowanceDay]);

  const handlePersonalityChange = useCallback((personalityId) => {
    const personality = personalities.find(p => p.id === personalityId);
    if (personality) {
      setSelectedPersonality(personalityId);
      if (personality.id !== DEFAULT_PERSONALITY_ID) {
        setGender(personality.gender);
      }
      setTransactions(applyPersonality(defaultTransactions, personality));
    }
  }, [personalities]);

  const handleTransactionToggle = useCallback((id) => {
    setTransactions(prev =>
      prev.map(t => t.id === id ? { ...t, active: !t.active } : t)
    );
  }, []);

  const handleOddsChange = useCallback((id, newOdds) => {
    const odds = parseFloat(newOdds);
    if (!isNaN(odds) && odds >= 0) {
      setTransactions(prev =>
        prev.map(t => t.id === id ? { ...t, odds } : t)
      );
    }
  }, []);

  const handleGenderChange = useCallback((newGender) => {
    setGender(newGender);
  }, []);

  const handleResetToPersonality = useCallback(() => {
    handlePersonalityChange(selectedPersonality);
  }, [selectedPersonality, handlePersonalityChange]);

  // Calculate totals
  const totals = useMemo(() => {
    const income = statement
      .filter(s => s.balanceUpdate > 0)
      .reduce((sum, s) => sum + s.balanceUpdate, 0);
    const expenses = statement
      .filter(s => s.balanceUpdate < 0)
      .reduce((sum, s) => sum + s.balanceUpdate, 0);
    return {
      income,
      expenses,
      net: income + expenses,
    };
  }, [statement]);

  const currentPersonality = personalities.find(p => p.id === selectedPersonality);

  return (
    <div className="income-statement-generator">
      <header className="header">
        <h1>💰 Teensville Income Statement Generator</h1>
        <p className="subtitle">Generate random income statements for teens</p>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <section className="section">
            <h2>🎭 Personality Presets</h2>
            <div className="personality-list">
              {personalities.map(p => (
                <button
                  key={p.id}
                  className={`personality-btn ${selectedPersonality === p.id ? 'active' : ''}`}
                  onClick={() => handlePersonalityChange(p.id)}
                >
                  <strong>{p.name}</strong>
                  <span className="personality-desc">{p.description}</span>
                </button>
              ))}
            </div>
            {currentPersonality && (
              <div className="personality-info">
                <strong>Current: {currentPersonality.name}</strong>
                {hasModifications && (
                  <span className="modified-badge">Modified</span>
                )}
              </div>
            )}
            {hasModifications && (
              <button className="reset-btn" onClick={handleResetToPersonality}>
                Reset to Preset
              </button>
            )}
          </section>

          <section className="section">
            <h2>⚙️ Quick Settings</h2>
            <div className="setting-group">
              <label>Starting Balance:</label>
              <input
                type="number"
                min="0"
                value={startingBalance}
                onChange={(e) => setStartingBalance(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="setting-group">
              <label>Gender:</label>
              <select value={gender} onChange={(e) => handleGenderChange(e.target.value)}>
                <option value="Any">Any</option>
                <option value="Boy">Boy</option>
                <option value="Girl">Girl</option>
              </select>
            </div>
            <div className="setting-group">
              <label>Transaction Count:</label>
              <input
                type="number"
                min="1"
                max="100"
                value={transactionCount}
                onChange={(e) => setTransactionCount(parseInt(e.target.value) || 20)}
              />
            </div>
            <div className="setting-group">
              <label>Weekly Allowance ($):</label>
              <input
                type="number"
                min="0"
                value={allowanceAmount}
                onChange={(e) => setAllowanceAmount(parseInt(e.target.value) || 0)}
              />
            </div>
            {allowanceAmount > 0 && (
              <div className="setting-group">
                <label>Allowance Day:</label>
                <select value={allowanceDay} onChange={(e) => setAllowanceDay(parseInt(e.target.value))}>
                  {DAYS_OF_WEEK.map((day, index) => (
                    <option key={day} value={index}>{day}</option>
                  ))}
                </select>
              </div>
            )}
            <button className="generate-btn" onClick={handleGenerate}>
              🎲 Generate Income Statement
            </button>
          </section>

          <section className="section">
            <button
              className="toggle-settings-btn"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ? '▼ Hide Item Settings' : '▶ Show Item Settings'}
            </button>
          </section>
        </aside>

        <main className="main">
          {statement.length > 0 ? (
            <>
              <section className="statement-section">
                <h2>📊 Income Statement</h2>
                <div className="totals">
                  <div className="total-item income">
                    <span>Total Income:</span>
                    <strong>${totals.income}</strong>
                  </div>
                  <div className="total-item expenses">
                    <span>Total Expenses:</span>
                    <strong>${Math.abs(totals.expenses)}</strong>
                  </div>
                  <div className={`total-item net ${totals.net >= 0 ? 'positive' : 'negative'}`}>
                    <span>Net Balance:</span>
                    <strong>${totals.net}</strong>
                  </div>
                </div>
                <table className="statement-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Day</th>
                      <th>Transaction</th>
                      <th>Balance Update</th>
                      <th>New Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statement.map((row) => (
                      <tr
                        key={row.id}
                        className={`${row.balanceUpdate > 0 ? 'income-row' : 'expense-row'} ${row.isNewDay ? 'new-day-row' : ''}`}
                      >
                        <td>{row.id}</td>
                        <td className="day-cell">{row.isNewDay ? row.dayOfWeek : ''}</td>
                        <td>{row.name}</td>
                        <td className={row.balanceUpdate > 0 ? 'positive' : 'negative'}>
                          {row.balanceUpdate > 0 ? '+' : ''}${row.balanceUpdate}
                        </td>
                        <td className={row.newBalance >= 0 ? 'positive' : 'negative'}>
                          ${row.newBalance}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          ) : (
            <div className="empty-state">
              <h2>👋 Welcome!</h2>
              <p>Select a personality preset and click "Generate Income Statement" to get started.</p>
              <p>You can customize items and weights in the settings panel.</p>
            </div>
          )}
        </main>
      </div>

      {showSettings && (
        <section className="settings-panel">
          <h2>📝 Item Settings</h2>
          <p className="settings-help">
            Toggle items on/off and adjust weights. Higher weights = more likely to appear.
          </p>
          <div className="items-grid">
            {transactions.map(t => (
              <div
                key={t.id}
                className={`item-card ${t.active ? 'active' : 'inactive'} ${t.price > 0 ? 'income-item' : 'expense-item'}`}
              >
                <div className="item-header">
                  <label className="item-toggle">
                    <input
                      type="checkbox"
                      checked={t.active}
                      onChange={() => handleTransactionToggle(t.id)}
                    />
                    <span className="item-name">{t.name}</span>
                  </label>
                  <span className={`item-price ${t.price > 0 ? 'positive' : 'negative'}`}>
                    {t.price > 0 ? '+' : ''}${t.price}
                  </span>
                </div>
                <div className="item-details">
                  <span className="item-gender">{t.gender}</span>
                  <div className="odds-control">
                    <label>Weight:</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={t.odds}
                      onChange={(e) => handleOddsChange(t.id, e.target.value)}
                      disabled={!t.active}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
