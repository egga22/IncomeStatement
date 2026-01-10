import { useState, useCallback, useMemo } from 'react';
import { defaultTransactions, defaultPersonalities, INTENTION_TYPE, PRICING_TYPE, resolvePrice } from '../data/transactions';
import './IncomeStatementGenerator.css';

const DEFAULT_PERSONALITY_ID = 'default';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Probability constants for intentions
const INTENSE_INTENTION_CHANCE = 0.1; // 10% chance an intention is intense
const GIVE_UP_CHANCE = 0.1; // 10% chance to give up on standard intentions
const GIVE_UP_TRIGGER_CHANCE = 0.3; // 30% chance per opportunity for a predetermined give-up to trigger

// Generate a random income statement based on current settings
// Teens cannot go into debt - balance must stay >= 0
function generateIncomeStatement(transactions, gender, count = 20, startingBalance = 0, allowanceAmount = 0, allowanceDay = 0) {
  // Filter transactions based on gender and active status
  const filteredTransactions = transactions.filter(t => {
    if (!t.active) return false;
    // When gender is "Any", only pick items marked as "Any"
    if (gender === 'Any') return t.gender === 'Any';
    // For Boy/Girl, pick items marked as that gender OR "Any"
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
  let currentDay = 0; // Start on Monday (0)
  let transactionIndex = 0;

  // Track last occurrence day for each transaction with frequency limits
  const lastOccurrence = {}; // { transactionId: dayIndex }

  // Intention state
  let activeIntention = null; // { item, type, willGiveUp }
  let daysSinceIntentionComplete = Infinity; // Start with Infinity to allow first intention

  // Helper to check if this is the first transaction of a day
  const isFirstOfDay = (dayName) => 
    statement.length === 0 || statement[statement.length - 1].dayOfWeek !== dayName;

  // Helper to check if a transaction can occur based on frequency
  const canOccur = (transaction, currentDayIndex) => {
    if (transaction.frequency === "None") return true;
    if (!lastOccurrence[transaction.id]) return true;
    const daysSince = currentDayIndex - lastOccurrence[transaction.id];
    return daysSince >= transaction.frequency;
  };

  // Helper to select a weighted random transaction
  const selectWeightedTransaction = (availableTransactions) => {
    if (availableTransactions.length === 0) return null;
    const totalWeight = availableTransactions.reduce((sum, t) => sum + t.odds, 0);
    let random = Math.random() * totalWeight;
    let selectedTransaction = availableTransactions[0];
    for (const transaction of availableTransactions) {
      random -= transaction.odds;
      if (random <= 0) {
        selectedTransaction = transaction;
        break;
      }
    }
    return selectedTransaction;
  };

  // Helper to create an intention for an unaffordable expense
  // When intention is created, a specific price is established (resolved from variable pricing)
  const createIntention = (item) => {
    const isIntense = Math.random() < INTENSE_INTENTION_CHANCE;
    const type = isIntense ? INTENTION_TYPE.INTENSE : INTENTION_TYPE.STANDARD;
    // For standard intentions, predetermine if they will give up
    const willGiveUp = type === INTENTION_TYPE.STANDARD && Math.random() < GIVE_UP_CHANCE;
    
    // Resolve the price at intention creation (establishes specific price they want)
    const { price: resolvedPrice, tier } = resolvePrice(item);
    
    return { 
      item, 
      type, 
      willGiveUp, 
      resolvedPrice, // The specific price they're saving for
      tier // The tier they selected (if applicable)
    };
  };

  // Helper to complete an intention and add transaction to statement
  const completeIntention = (dayName, isFirstTransaction) => {
    const price = activeIntention.resolvedPrice;
    const tier = activeIntention.tier;
    runningBalance += price;
    transactionIndex++;
    
    // Build transaction name with tier info if applicable
    let transactionName = activeIntention.item.name;
    if (tier) {
      transactionName = `${activeIntention.item.name} - ${tier}`;
    }
    
    statement.push({
      id: transactionIndex,
      transactionId: activeIntention.item.id,
      name: `${transactionName} (Intention Complete!)`,
      balanceUpdate: price,
      newBalance: runningBalance,
      dayOfWeek: dayName,
      isNewDay: isFirstTransaction,
      isIntention: true,
      intentionType: activeIntention.type,
      tier: tier,
      resolvedPrice: price,
    });
    regularTransactionsAdded++;
    activeIntention = null;
    daysSinceIntentionComplete = 0;
  };

  // Target number of transactions (not counting allowances and intention events)
  let regularTransactionsAdded = 0;
  
  // Safety mechanism to prevent infinite loops
  // If we can't make progress after this many day cycles, stop trying
  // Allow more days for larger transaction counts
  const maxDaysWithoutProgress = Math.min(100, Math.max(30, count / 2));
  let daysWithoutProgress = 0;
  let lastRegularTransactionsCount = 0;

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

    // Check if intention can be completed (balance reached)
    // Use the resolved price that was established when the intention was created
    if (activeIntention && runningBalance >= Math.abs(activeIntention.resolvedPrice)) {
      completeIntention(dayName, isFirstOfDay(dayName));
      
      if (regularTransactionsAdded >= count) break;
    }

    // Determine how many transactions to add for this day (1-3, randomly)
    const transactionsForDay = Math.floor(Math.random() * 3) + 1;

    for (let dayTx = 0; dayTx < transactionsForDay && regularTransactionsAdded < count; dayTx++) {
      // Check if we need to set a new intention (when no active intention and cooldown passed)
      // Reduce cooldown to 0 if teen has no money and no affordable transactions (stuck state)
      const isStuck = runningBalance <= 0 && expenseTransactions.every(t => runningBalance + t.price < 0);
      const intentionCooldown = isStuck ? 0 : 2;
      
      if (!activeIntention && daysSinceIntentionComplete >= intentionCooldown) {
        // Find an expense that costs more than current balance
        // Use the base price for filtering - the actual tier price will be resolved when intention is created
        const unaffordableExpenses = expenseTransactions.filter(t => 
          runningBalance + t.price < 0
        );
        
        if (unaffordableExpenses.length > 0) {
          // Select a weighted random unaffordable expense as the intention
          const intentionItem = selectWeightedTransaction(unaffordableExpenses);
          if (intentionItem) {
            activeIntention = createIntention(intentionItem);
            
            // Build intention name with tier/price info
            let intentionName = intentionItem.name;
            if (activeIntention.tier) {
              intentionName = `${intentionItem.name} - ${activeIntention.tier}`;
            }
            const priceDisplay = Math.abs(activeIntention.resolvedPrice);
            
            transactionIndex++;
            statement.push({
              id: transactionIndex,
              transactionId: `intention-${intentionItem.id}`,
              name: `New Intention: ${intentionName} ($${priceDisplay}) (${activeIntention.type})`,
              balanceUpdate: 0,
              newBalance: runningBalance,
              dayOfWeek: dayName,
              isNewDay: isFirstOfDay(dayName),
              isIntention: true,
              intentionType: activeIntention.type,
              isIntentionStart: true,
              tier: activeIntention.tier,
              targetPrice: activeIntention.resolvedPrice,
            });
          }
        }
      }

      // Determine available transactions based on intention state
      let availableTransactions = [];
      
      if (activeIntention) {
        if (activeIntention.type === INTENTION_TYPE.INTENSE) {
          // Intense intention: only earn money, no spending
          availableTransactions = incomeTransactions.filter(t => canOccur(t, currentDay));
        } else {
          // Standard intention: still buy other things
          const affordableExpenses = expenseTransactions.filter(t => 
            runningBalance + t.price >= 0 && t.id !== activeIntention.item.id && canOccur(t, currentDay)
          );
          availableTransactions = [...incomeTransactions.filter(t => canOccur(t, currentDay)), ...affordableExpenses];
          
          // Check if teen gives up due to impulse spending (predetermined)
          if (activeIntention.willGiveUp && affordableExpenses.length > 0 && Math.random() < GIVE_UP_TRIGGER_CHANCE) {
            // Teen gives up on this intention
            transactionIndex++;
            statement.push({
              id: transactionIndex,
              transactionId: `intention-giveup-${activeIntention.item.id}`,
              name: `Gave Up: ${activeIntention.item.name} (couldn't control spending)`,
              balanceUpdate: 0,
              newBalance: runningBalance,
              dayOfWeek: dayName,
              isNewDay: isFirstOfDay(dayName),
              isIntention: true,
              isIntentionGiveUp: true,
            });
            activeIntention = null;
            daysSinceIntentionComplete = 0;
            continue;
          }
        }
      } else {
        // No active intention: teen doesn't do chores (no motivation)
        // Only expenses are available
        const affordableExpenses = expenseTransactions.filter(t => 
          runningBalance + t.price >= 0 && canOccur(t, currentDay)
        );
        availableTransactions = [...affordableExpenses];
      }

      if (availableTransactions.length === 0) {
        // No transactions available
        break;
      }

      const selectedTransaction = selectWeightedTransaction(availableTransactions);
      if (!selectedTransaction) break;

      // Resolve variable pricing for the selected transaction
      const { price: actualPrice, tier } = resolvePrice(selectedTransaction);
      
      // Ensure we can still afford this with the resolved price
      if (actualPrice < 0 && runningBalance + actualPrice < 0) {
        // Can't afford the resolved price, skip this transaction
        continue;
      }

      runningBalance += actualPrice;
      transactionIndex++;
      
      // Record when this transaction occurred
      lastOccurrence[selectedTransaction.id] = currentDay;

      // Build transaction name with tier info if applicable
      let transactionName = selectedTransaction.name;
      if (tier) {
        transactionName = `${selectedTransaction.name} - ${tier}`;
      }

      statement.push({
        id: transactionIndex,
        transactionId: selectedTransaction.id,
        name: transactionName,
        balanceUpdate: actualPrice,
        newBalance: runningBalance,
        dayOfWeek: dayName,
        isNewDay: isFirstOfDay(dayName),
        tier: tier,
        resolvedPrice: actualPrice,
      });

      regularTransactionsAdded++;
      
      // Check if intention can be completed after this transaction
      if (activeIntention && runningBalance >= Math.abs(activeIntention.resolvedPrice)) {
        completeIntention(dayName, false);
      }
    }

    // Move to the next day (cycle through the week)
    currentDay = (currentDay + 1) % 7;
    daysSinceIntentionComplete++;
    
    // Track progress to prevent infinite loops
    if (regularTransactionsAdded === lastRegularTransactionsCount) {
      daysWithoutProgress++;
      if (daysWithoutProgress >= maxDaysWithoutProgress) {
        // Can't make more progress, stop generation
        console.warn(`Stopping generation: only ${regularTransactionsAdded} transactions generated out of ${count} requested`);
        break;
      }
    } else {
      daysWithoutProgress = 0;
      lastRegularTransactionsCount = regularTransactionsAdded;
    }
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
        frequency: override.frequency !== undefined ? override.frequency : t.frequency,
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
  const [allowanceDay, setAllowanceDay] = useState(4); // Friday by default
  const [statement, setStatement] = useState([]);
  const [selectedPersonality, setSelectedPersonality] = useState(DEFAULT_PERSONALITY_ID);
  const [personalities] = useState(defaultPersonalities);
  const [showSettings, setShowSettings] = useState(false);
  const [expandedItems, setExpandedItems] = useState({}); // Track which items have pricing expanded

  // Toggle expanded state for an item's pricing tiers
  const toggleExpanded = useCallback((id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

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
      if (base && (t.active !== base.active || t.odds !== base.odds || t.frequency !== base.frequency)) {
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

  const handleFrequencyChange = useCallback((id, newFrequency) => {
    setTransactions(prev =>
      prev.map(t => t.id === id ? { ...t, frequency: newFrequency } : t)
    );
  }, []);

  const handleExportPersonality = useCallback(() => {
    // Create a personality object based on current settings
    const personalityName = prompt("Enter a name for this personality:");
    if (!personalityName) return;

    const personalityId = personalityName.toLowerCase().replace(/\s+/g, '-');
    const personalityDescription = prompt("Enter a description for this personality:");
    if (!personalityDescription) return;

    // Build items object with only the transactions that differ from defaults
    const items = {};
    transactions.forEach(t => {
      const defaultTx = defaultTransactions.find(dt => dt.id === t.id);
      if (defaultTx) {
        const isDifferent = 
          t.active !== defaultTx.active || 
          t.odds !== defaultTx.odds ||
          t.frequency !== defaultTx.frequency;
        
        if (isDifferent) {
          items[t.id] = {
            active: t.active,
            odds: t.odds,
          };
          if (t.frequency !== defaultTx.frequency) {
            items[t.id].frequency = t.frequency;
          }
        }
      }
    });

    const personalityCode = `{
  id: "${personalityId}",
  name: "${personalityName}",
  description: "${personalityDescription}",
  gender: "${gender}",
  items: ${JSON.stringify(items, null, 4)}
}`;

    // Copy to clipboard
    navigator.clipboard.writeText(personalityCode).then(() => {
      alert('Personality code copied to clipboard! You can add it to the defaultPersonalities array.');
    }).catch(() => {
      // Fallback: show the code in an alert for manual copy
      alert('Could not copy to clipboard automatically. Please copy the code below:\n\n' + personalityCode);
    });
  }, [transactions, gender]);

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
                    {statement.map((row) => {
                      const rowClasses = [
                        row.balanceUpdate > 0 ? 'income-row' : row.balanceUpdate < 0 ? 'expense-row' : '',
                        row.isNewDay ? 'new-day-row' : '',
                        row.isIntention ? 'intention-row' : '',
                        row.isIntentionStart ? 'intention-start-row' : '',
                        row.isIntentionGiveUp ? 'intention-giveup-row' : '',
                      ].filter(Boolean).join(' ');
                      
                      const balanceUpdateClass = row.balanceUpdate > 0 ? 'positive' : row.balanceUpdate < 0 ? 'negative' : '';
                      const balanceUpdatePrefix = row.balanceUpdate > 0 ? '+' : '';
                      
                      return (
                        <tr key={row.id} className={rowClasses}>
                          <td>{row.id}</td>
                          <td className="day-cell">{row.isNewDay ? row.dayOfWeek : ''}</td>
                          <td>{row.name}</td>
                          <td className={balanceUpdateClass}>
                            {balanceUpdatePrefix}${row.balanceUpdate}
                          </td>
                          <td className={row.newBalance >= 0 ? 'positive' : 'negative'}>
                            ${row.newBalance}
                          </td>
                        </tr>
                      );
                    })}
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
            Frequency limits how often an item can occur (in days, or "None" for unlimited).
            Items with 🏷️ have variable pricing with product tiers.
          </p>
          <div className="items-grid">
            {transactions.map(t => {
              const hasVariablePricing = t.pricing && t.pricing.type !== PRICING_TYPE.FIXED;
              const hasTiers = t.pricing && t.pricing.tiers && t.pricing.tiers.length > 0;
              const isExpanded = expandedItems[t.id];
              
              // Get pricing display info
              let priceDisplay = `${t.price > 0 ? '+' : ''}$${t.price}`;
              if (hasVariablePricing) {
                if (t.pricing.type === PRICING_TYPE.RANGE) {
                  priceDisplay = `$${t.pricing.min} - $${t.pricing.max}`;
                } else if (t.pricing.type === PRICING_TYPE.LIST) {
                  const prices = t.pricing.options;
                  priceDisplay = `$${Math.min(...prices)} - $${Math.max(...prices)}`;
                } else if (t.pricing.type === PRICING_TYPE.WEIGHTED_LIST && t.pricing.options) {
                  const prices = t.pricing.options.map(o => o.price);
                  priceDisplay = `$${Math.min(...prices)} - $${Math.max(...prices)}`;
                }
              }
              
              return (
                <div
                  key={t.id}
                  className={`item-card ${t.active ? 'active' : 'inactive'} ${t.price > 0 ? 'income-item' : 'expense-item'} ${hasVariablePricing ? 'has-tiers' : ''}`}
                >
                  <div className="item-header">
                    <label className="item-toggle">
                      <input
                        type="checkbox"
                        checked={t.active}
                        onChange={() => handleTransactionToggle(t.id)}
                      />
                      <span className="item-name">
                        {t.name}
                        {hasVariablePricing && <span className="tier-badge" title="Variable Pricing" role="img" aria-label="Has variable pricing">🏷️</span>}
                      </span>
                    </label>
                    <span className={`item-price ${t.price > 0 ? 'positive' : 'negative'}`}>
                      {priceDisplay}
                    </span>
                  </div>
                  <div className="item-details">
                    <div className="item-details-row">
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
                    <div className="frequency-control">
                      <label>Frequency (days):</label>
                      <input
                        type="number"
                        min="1"
                        value={t.frequency === "None" ? "" : t.frequency}
                        placeholder="None"
                        onChange={(e) => handleFrequencyChange(t.id, e.target.value === "" ? "None" : parseInt(e.target.value) || "None")}
                        disabled={!t.active}
                      />
                    </div>
                    
                    {/* Variable Pricing / Product Tiers section */}
                    {hasVariablePricing && (
                      <div className="pricing-section">
                        <button 
                          className="expand-tiers-btn"
                          onClick={() => toggleExpanded(t.id)}
                          type="button"
                        >
                          {isExpanded ? '▼' : '▶'} Product Tiers
                        </button>
                        
                        {isExpanded && (
                          <div className="tiers-list">
                            {hasTiers ? (
                              t.pricing.tiers.map((tier, idx) => (
                                <div key={idx} className="tier-item">
                                  <span className="tier-name">{tier.name}</span>
                                  <span className="tier-price">${tier.price}</span>
                                  <span className="tier-weight">
                                    (weight: {tier.weight || 1})
                                  </span>
                                </div>
                              ))
                            ) : t.pricing.type === PRICING_TYPE.LIST && t.pricing.options ? (
                              t.pricing.options.map((price, idx) => (
                                <div key={idx} className="tier-item">
                                  <span className="tier-name">Option {idx + 1}</span>
                                  <span className="tier-price">${price}</span>
                                </div>
                              ))
                            ) : t.pricing.type === PRICING_TYPE.RANGE ? (
                              <div className="tier-item range-info">
                                <span>Range: ${t.pricing.min} to ${t.pricing.max}</span>
                                {t.pricing.bias && <span className="tier-weight">(bias: {t.pricing.bias})</span>}
                              </div>
                            ) : (
                              <div className="tier-item">
                                <span>Custom pricing configuration</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="export-section">
            <button className="export-btn" onClick={handleExportPersonality}>
              📋 Export as Personality
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
