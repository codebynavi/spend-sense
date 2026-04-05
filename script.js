// =================== DATA MODEL ===================
const incomeLabels = {
    employment: ['Salary / Wages', 'Bonus / Incentives', 'Freelance / Consulting', 'Business Profits', 'Pension / Gratuity'],
    personal: ['Rental Income', 'Mutual Fund / SIP Returns', 'FD / RD Interest', 'Stock Dividends / Capital Gains', 'Family Support / HUF Income', 'Other Income']
};
const expenseLabels = {
    housing: ['Home Loan EMI / Rent', 'Society / Maintenance Charges', 'Electricity Bill', 'Water / Piped Gas (LPG) Bill', 'Phone / Mobile / Internet / DTH', 'Property Tax / Home Insurance', 'Repairs & Home Maintenance', 'Domestic Help'],
    living: ['Groceries & Vegetables', 'Medical & Health', 'School / Tuition Fees', 'Clothing & Footwear', 'Personal Care', 'Child Care / Creche', 'Other Daily Expenses'],
    transport: ['Car / Two-Wheeler Loan EMI', 'Fuel (Petrol / Diesel / CNG)', 'Vehicle Insurance', 'Vehicle Servicing & Repairs', 'Cab / Auto / Metro / Bus'],
    lifestyle: ['Eating Out / Food Delivery', 'OTT & Entertainment', 'Vacations & Travel', 'Hobbies & Sports', 'Festivals & Gifts', 'Charitable Donations / Temple', 'Club / Gym Memberships', 'Other'],
    financial: ['Personal Loan EMI', 'Credit Card Payments', 'SIP / Mutual Fund Investment', 'PPF / NPS / EPF Contribution', 'Emergency / FD Savings', 'LIC / Term / Health Insurance', 'Other EMIs / Commitments']
};

function fmt(n) {
    if (!n || n === 0) return '₹0';
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
    if (n >= 100000) return '₹' + (n / 100000).toFixed(2) + ' L';
    if (n >= 1000) return '₹' + n.toLocaleString('en-IN');
    return '₹' + n;
}

function fmtRaw(n) {
    if (!n || n === 0) return '₹0';
    return '₹' + Math.round(n).toLocaleString('en-IN');
}

function getSectionValues(cls, section) {
    return [...document.querySelectorAll(`.${cls}[data-section="${section}"]`)]
        .map(el => parseFloat(el.value) || 0);
}

function sumSection(cls, section) {
    return getSectionValues(cls, section).reduce((a, b) => a + b, 0);
}

function recalc() {
    // Income
    const empM = sumSection('income-field', 'employment');
    const perM = sumSection('income-field', 'personal');
    const totalIncM = empM + perM;
    const totalIncA = totalIncM * 12;

    el('sub-employment-monthly').textContent = fmtRaw(empM);
    el('sub-employment-annual').textContent = fmtRaw(empM * 12);
    el('total-employment-monthly').textContent = fmtRaw(empM);
    el('sub-personal-monthly').textContent = fmtRaw(perM);
    el('sub-personal-annual').textContent = fmtRaw(perM * 12);
    el('total-personal-monthly').textContent = fmtRaw(perM);
    el('total-income-monthly').textContent = fmtRaw(totalIncM);
    el('total-income-annual').textContent = fmtRaw(totalIncA);

    // Expenses
    const houM = sumSection('expense-field', 'housing');
    const livM = sumSection('expense-field', 'living');
    const trpM = sumSection('expense-field', 'transport');
    const lifM = sumSection('expense-field', 'lifestyle');
    const finM = sumSection('expense-field', 'financial');
    const totalExpM = houM + livM + trpM + lifM + finM;
    const totalExpA = totalExpM * 12;

    ['housing', 'living', 'transport', 'lifestyle', 'financial'].forEach((s, i) => {
        const v = [houM, livM, trpM, lifM, finM][i];
        const sid = ['housing', 'living', 'transport', 'lifestyle', 'financial'][i];
        el(`sub-${sid}-monthly`).textContent = fmtRaw(v);
        el(`sub-${sid}-annual`).textContent = fmtRaw(v * 12);
        el(`total-${sid}-monthly`).textContent = fmtRaw(v);
    });
    el('total-expense-monthly').textContent = fmtRaw(totalExpM);
    el('total-expense-annual').textContent = fmtRaw(totalExpA);

    // Update annual column fields for all income inputs
    let incIdx = 0;
    document.querySelectorAll('.income-field').forEach((inp, idx) => {
        const v = parseFloat(inp.value) || 0;
        const annualDiv = inp.closest('.field-row').querySelector('.field-annual');
        if (annualDiv) annualDiv.textContent = fmtRaw(v * 12);
    });
    document.querySelectorAll('.expense-field').forEach((inp) => {
        const v = parseFloat(inp.value) || 0;
        const annualDiv = inp.closest('.field-row').querySelector('.field-annual');
        if (annualDiv) annualDiv.textContent = fmtRaw(v * 12);
    });

    // Result page
    const balance = totalIncM - totalExpM;
    const balanceA = balance * 12;

    el('r-employment').textContent = fmtRaw(empM);
    el('r-personal').textContent = fmtRaw(perM);
    el('r-total-income').textContent = fmtRaw(totalIncM);
    el('r-housing').textContent = fmtRaw(houM);
    el('r-living').textContent = fmtRaw(livM);
    el('r-transport').textContent = fmtRaw(trpM);
    el('r-lifestyle').textContent = fmtRaw(lifM);
    el('r-financial').textContent = fmtRaw(finM);
    el('r-total-expense').textContent = fmtRaw(totalExpM);

    el('balanceAmount').textContent = (balance < 0 ? '-' : '') + fmtRaw(Math.abs(balance));
    el('balanceSub').textContent = 'Annual: ' + (balance < 0 ? '-' : '') + fmtRaw(Math.abs(balanceA));
    const bc = el('balanceCard');
    const bb = el('balanceBadge');
    if (balance < 0) {
        bc.classList.add('negative');
        bb.className = 'balance-badge bad';
        bb.textContent = '⚠️ Spending exceeds income — review expenses';
    } else {
        bc.classList.remove('negative');
        bb.className = 'balance-badge good';
        bb.textContent = '✓ You have a surplus — great financial health!';
    }

    // Breakdown table
    const data = [
        { label: 'Employment & Business Income', m: empM, isIncome: true },
        { label: 'Investment & Personal Income', m: perM, isIncome: true },
        { label: '─── TOTAL INCOME ───', m: totalIncM, isTotal: true },
        { label: 'Housing & Utilities', m: houM, isIncome: false },
        { label: 'Daily Living', m: livM },
        { label: 'Transportation', m: trpM },
        { label: 'Personal & Lifestyle', m: lifM },
        { label: 'Financial Commitments', m: finM },
        { label: '─── TOTAL EXPENSES ───', m: totalExpM, isTotal: true },
        { label: 'NET SURPLUS / DEFICIT', m: balance, isNet: true }
    ];
    const tbody = el('breakdownBody');
    tbody.innerHTML = data.map(row => {
        const pct = totalIncM ? ((row.m / totalIncM) * 100).toFixed(1) + '%' : '—';
        const color = row.isNet ? (balance >= 0 ? 'color:var(--green)' : 'color:var(--danger)') : '';
        const bold = (row.isTotal || row.isNet) ? 'font-weight:700' : '';
        const bg = row.isTotal ? 'background:var(--saffron-pale)' : row.isNet ? 'background:var(--green-pale)' : '';
        return `<tr style="${bg}"><td style="${bold}">${row.label}</td><td style="text-align:right;${bold};${color}">${fmtRaw(row.m)}</td><td style="text-align:right;${bold};${color}">${fmtRaw(row.m * 12)}</td><td style="text-align:right;${bold}">${row.isNet ? '—' : pct}</td></tr>`;
    }).join('');

    // Insights
    buildInsights(totalIncM, totalExpM, houM, livM, trpM, lifM, finM, balance);

    window._data = { empM, perM, houM, livM, trpM, lifM, finM, totalIncM, totalExpM, balance };
}

function buildInsights(inc, exp, hou, liv, trp, lif, fin, bal) {
    const insights = [];
    const pct = v => inc ? ((v / inc) * 100).toFixed(1) : 0;
    if (hou / inc > 0.4) insights.push(`Your housing costs (${pct(hou)}% of income) exceed the recommended 30-40% threshold. Consider refinancing or reducing EMI burden.`);
    if (lif / inc > 0.15) insights.push(`Lifestyle & dining spending is ${pct(lif)}% of income. Reducing food delivery and OTT can free up ₹${Math.round(lif * 0.3).toLocaleString('en-IN')}/month.`);
    if (fin < inc * 0.10 && inc > 0) insights.push(`You're saving less than 10% of income. The 50-30-20 rule recommends at least 20% (₹${Math.round(inc * 0.2).toLocaleString('en-IN')}/month) for long-term wealth.`);
    if (fin > inc * 0.3) insights.push(`Financial commitments are ${pct(fin)}% of income — healthy! You're building strong future security.`);
    if (bal > 0 && bal < inc * 0.1) insights.push(`Your monthly surplus of ${fmtRaw(bal)} is small. Consider moving it immediately to a liquid mutual fund or RD to build your emergency corpus.`);
    if (bal > inc * 0.25) insights.push(`Excellent! Your surplus is ${pct(bal)}% of income. Consider increasing SIP amounts or investing in PPF/NPS for tax-efficient wealth creation.`);
    if (trp / inc > 0.2) insights.push(`Transportation is ${pct(trp)}% of income — above average. Carpooling, metro usage or remote work days can significantly cut costs.`);
    if (!inc) insights.push('Please fill in your income details in Step 1 to see personalised insights.');
    if (insights.length === 0) insights.push('Your budget looks well-balanced. Keep monitoring monthly to stay on track with your financial goals.');

    el('insightsList').innerHTML = insights.map(t =>
        `<div class="insight-item"><div class="insight-dot"></div><span>${t}</span></div>`
    ).join('');
}

function el(id) { return document.getElementById(id); }

function goToPage(n) {
    recalc();
    [1, 2, 3].forEach(i => {
        el(`page${i}`).classList.toggle('active', i === n);
        el(`tab${i}`).classList.remove('active', 'done');
        if (i < n) el(`tab${i}`).classList.add('done');
        if (i === n) el(`tab${i}`).classList.add('active');
    });
    el('progressBar').style.width = (n / 3 * 100) + '%';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleSection(id) {
    document.getElementById(id).classList.toggle('collapsed');
}

function resetAll() {
    if (!confirm('Reset all values and start over?')) return;
    document.querySelectorAll('.income-field, .expense-field').forEach(i => i.value = '');
    recalc();
    goToPage(1);
}

// =================== EXPORT WORD ===================
function exportWord() {
    const d = window._data || {};
    const fmtN = n => '₹' + Math.round(n || 0).toLocaleString('en-IN');
    const fmtA = n => '₹' + Math.round((n || 0) * 12).toLocaleString('en-IN');
    const bal = (d.totalIncM || 0) - (d.totalExpM || 0);

    // Build all income/expense detail rows
    const getRows = (cls, section) => {
        const inputs = [...document.querySelectorAll(`.${cls}[data-section="${section}"]`)];
        const labels = cls === 'income-field' ? incomeLabels[section] : expenseLabels[section];
        return inputs.map((inp, i) => {
            const v = parseFloat(inp.value) || 0;
            return `<tr><td style="padding:6px 10px;border:1px solid #ddd;">${labels[i] || 'Item ' + (i + 1)}</td><td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${fmtN(v)}</td><td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${fmtA(v)}</td></tr>`;
        }).join('');
    };

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
              body{font-family:Arial,sans-serif;color:#1a1a1a;font-size:12pt;}
              h1{color:#FF6B1A;font-size:20pt;text-align:center;margin-bottom:4px;}
              h2{color:#0A1628;font-size:13pt;margin:18px 0 6px;border-bottom:2px solid #FF6B1A;padding-bottom:4px;}
              h3{color:#333;font-size:11pt;margin:14px 0 4px;}
              .subtitle{text-align:center;color:#777;font-size:10pt;margin-bottom:20px;}
              table{width:100%;border-collapse:collapse;margin-bottom:10px;}
              th{background:#0A1628;color:white;padding:8px 10px;text-align:left;font-size:10pt;}
              th:last-child,th:nth-child(2){text-align:right;}
              td{padding:6px 10px;border:1px solid #ddd;font-size:10pt;}
              .subtotal-row td{background:#FFF0E6;font-weight:bold;}
              .total-row td{background:#FF6B1A;color:white;font-weight:bold;font-size:11pt;}
              .income-total td{background:#1A4BD4;color:white;font-weight:bold;font-size:11pt;}
              .balance-row td{background:${bal >= 0 ? '#E8F7E6' : '#FDECEA'};color:${bal >= 0 ? '#138808' : '#C8392B'};font-weight:bold;font-size:12pt;}
              .disclaimer{margin-top:30px;padding:12px;background:#f5f5f5;border-left:4px solid #FF6B1A;font-size:9pt;color:#666;}
              </style></head><body>
              <h1>💰 Spend Sense — Personal Budget Report</h1>
              <div class="subtitle">Generated on ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              
              <h2>OVERVIEW</h2>
              <table>
              <tr><th>Category</th><th>Monthly (₹)</th><th>Annual (₹)</th></tr>
              <tr><td>Employment & Business Income</td><td style="text-align:right">${fmtN(d.empM)}</td><td style="text-align:right">${fmtA(d.empM)}</td></tr>
              <tr><td>Investment & Personal Income</td><td style="text-align:right">${fmtN(d.perM)}</td><td style="text-align:right">${fmtA(d.perM)}</td></tr>
              <tr class="income-total"><td>TOTAL INCOME</td><td style="text-align:right">${fmtN(d.totalIncM)}</td><td style="text-align:right">${fmtA(d.totalIncM)}</td></tr>
              <tr><td>Housing & Utilities</td><td style="text-align:right">${fmtN(d.houM)}</td><td style="text-align:right">${fmtA(d.houM)}</td></tr>
              <tr><td>Daily Living</td><td style="text-align:right">${fmtN(d.livM)}</td><td style="text-align:right">${fmtA(d.livM)}</td></tr>
              <tr><td>Transportation</td><td style="text-align:right">${fmtN(d.trpM)}</td><td style="text-align:right">${fmtA(d.trpM)}</td></tr>
              <tr><td>Personal & Lifestyle</td><td style="text-align:right">${fmtN(d.lifM)}</td><td style="text-align:right">${fmtA(d.lifM)}</td></tr>
              <tr><td>Financial Commitments</td><td style="text-align:right">${fmtN(d.finM)}</td><td style="text-align:right">${fmtA(d.finM)}</td></tr>
              <tr class="total-row"><td>TOTAL EXPENSES</td><td style="text-align:right">${fmtN(d.totalExpM)}</td><td style="text-align:right">${fmtA(d.totalExpM)}</td></tr>
              <tr class="balance-row"><td>${bal >= 0 ? '✓ NET SURPLUS' : '⚠ NET DEFICIT'}</td><td style="text-align:right">${fmtN(Math.abs(bal))}</td><td style="text-align:right">${fmtA(Math.abs(bal))}</td></tr>
              </table>
              
              <h2>INCOME DETAILS</h2>
              <h3>Employment & Business Income</h3>
              <table><tr><th>Source</th><th>Monthly (₹)</th><th>Annual (₹)</th></tr>
              ${getRows('income-field', 'employment')}
              <tr class="subtotal-row"><td>Subtotal</td><td style="text-align:right">${fmtN(d.empM)}</td><td style="text-align:right">${fmtA(d.empM)}</td></tr></table>
              
              <h3>Investment & Personal Income</h3>
              <table><tr><th>Source</th><th>Monthly (₹)</th><th>Annual (₹)</th></tr>
              ${getRows('income-field', 'personal')}
              <tr class="subtotal-row"><td>Subtotal</td><td style="text-align:right">${fmtN(d.perM)}</td><td style="text-align:right">${fmtA(d.perM)}</td></tr></table>
              
              <h2>EXPENSE DETAILS</h2>
              <h3>Housing & Utilities</h3>
              <table><tr><th>Item</th><th>Monthly (₹)</th><th>Annual (₹)</th></tr>
              ${getRows('expense-field', 'housing')}
              <tr class="subtotal-row"><td>Subtotal</td><td style="text-align:right">${fmtN(d.houM)}</td><td style="text-align:right">${fmtA(d.houM)}</td></tr></table>
              
              <h3>Daily Living</h3>
              <table><tr><th>Item</th><th>Monthly (₹)</th><th>Annual (₹)</th></tr>
              ${getRows('expense-field', 'living')}
              <tr class="subtotal-row"><td>Subtotal</td><td style="text-align:right">${fmtN(d.livM)}</td><td style="text-align:right">${fmtA(d.livM)}</td></tr></table>
              
              <h3>Transportation</h3>
              <table><tr><th>Item</th><th>Monthly (₹)</th><th>Annual (₹)</th></tr>
              ${getRows('expense-field', 'transport')}
              <tr class="subtotal-row"><td>Subtotal</td><td style="text-align:right">${fmtN(d.trpM)}</td><td style="text-align:right">${fmtA(d.trpM)}</td></tr></table>
              
              <h3>Personal & Lifestyle</h3>
              <table><tr><th>Item</th><th>Monthly (₹)</th><th>Annual (₹)</th></tr>
              ${getRows('expense-field', 'lifestyle')}
              <tr class="subtotal-row"><td>Subtotal</td><td style="text-align:right">${fmtN(d.lifM)}</td><td style="text-align:right">${fmtA(d.lifM)}</td></tr></table>
              
              <h3>Financial Commitments & Savings</h3>
              <table><tr><th>Item</th><th>Monthly (₹)</th><th>Annual (₹)</th></tr>
              ${getRows('expense-field', 'financial')}
              <tr class="subtotal-row"><td>Subtotal</td><td style="text-align:right">${fmtN(d.finM)}</td><td style="text-align:right">${fmtA(d.finM)}</td></tr></table>
              
              <div class="disclaimer">
              <strong>Disclaimer:</strong> This report is generated by the Spend Sense Personal Budget Calculator for illustration and personal planning purposes only. All figures are based on self-reported data. This does not constitute financial, tax, or investment advice. Please consult a qualified financial advisor for personalised guidance.
              </div>
              </body></html>`;

    const blob = new Blob([html], { type: 'application/msword' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Spend_Sense_Budget_Report.doc';
    a.click();
}

// =================== EXPORT EXCEL ===================
function exportExcel() {
    const d = window._data || {};
    const fmtN = n => Math.round(n || 0);

    const wb = XLSX.utils.book_new();

    // Overview sheet
    const overviewData = [
        ['SPEND SENSE — PERSONAL BUDGET REPORT'],
        [`Generated: ${new Date().toLocaleDateString('en-IN')}`],
        [],
        ['OVERVIEW', 'Monthly (₹)', 'Annual (₹)'],
        ['Employment & Business Income', fmtN(d.empM), fmtN((d.empM || 0) * 12)],
        ['Investment & Personal Income', fmtN(d.perM), fmtN((d.perM || 0) * 12)],
        ['TOTAL INCOME', fmtN(d.totalIncM), fmtN((d.totalIncM || 0) * 12)],
        [],
        ['Housing & Utilities', fmtN(d.houM), fmtN((d.houM || 0) * 12)],
        ['Daily Living', fmtN(d.livM), fmtN((d.livM || 0) * 12)],
        ['Transportation', fmtN(d.trpM), fmtN((d.trpM || 0) * 12)],
        ['Personal & Lifestyle', fmtN(d.lifM), fmtN((d.lifM || 0) * 12)],
        ['Financial Commitments & Savings', fmtN(d.finM), fmtN((d.finM || 0) * 12)],
        ['TOTAL EXPENSES', fmtN(d.totalExpM), fmtN((d.totalExpM || 0) * 12)],
        [],
        ['NET SURPLUS / DEFICIT', fmtN((d.totalIncM || 0) - (d.totalExpM || 0)), fmtN(((d.totalIncM || 0) - (d.totalExpM || 0)) * 12)]
    ];
    const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
    wsOverview['!cols'] = [{ wch: 36 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');

    // Income Sheet
    const getVals = (cls, section) => {
        const inputs = [...document.querySelectorAll(`.${cls}[data-section="${section}"]`)];
        const labels = cls === 'income-field' ? incomeLabels[section] : expenseLabels[section];
        return inputs.map((inp, i) => {
            const v = parseFloat(inp.value) || 0;
            return [labels[i] || 'Item ' + (i + 1), v, v * 12];
        });
    };

    const incomeData = [
        ['INCOME DETAILS', 'Monthly (₹)', 'Annual (₹)'],
        ['Employment & Business Income (After Tax)', '', ''],
        ...getVals('income-field', 'employment'),
        ['SUBTOTAL — Employment', fmtN(d.empM), fmtN((d.empM || 0) * 12)],
        [],
        ['Investment & Personal Income (After Tax)', '', ''],
        ...getVals('income-field', 'personal'),
        ['SUBTOTAL — Personal', fmtN(d.perM), fmtN((d.perM || 0) * 12)],
        [],
        ['TOTAL INCOME', fmtN(d.totalIncM), fmtN((d.totalIncM || 0) * 12)]
    ];
    const wsIncome = XLSX.utils.aoa_to_sheet(incomeData);
    wsIncome['!cols'] = [{ wch: 36 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsIncome, 'Income');

    const expenseData = [
        ['EXPENSE DETAILS', 'Monthly (₹)', 'Annual (₹)'],
        ['Housing & Utilities', '', ''],
        ...getVals('expense-field', 'housing'),
        ['SUBTOTAL — Housing', fmtN(d.houM), fmtN((d.houM || 0) * 12)],
        [],
        ['Daily Living', '', ''],
        ...getVals('expense-field', 'living'),
        ['SUBTOTAL — Living', fmtN(d.livM), fmtN((d.livM || 0) * 12)],
        [],
        ['Transportation', '', ''],
        ...getVals('expense-field', 'transport'),
        ['SUBTOTAL — Transport', fmtN(d.trpM), fmtN((d.trpM || 0) * 12)],
        [],
        ['Personal & Lifestyle', '', ''],
        ...getVals('expense-field', 'lifestyle'),
        ['SUBTOTAL — Lifestyle', fmtN(d.lifM), fmtN((d.lifM || 0) * 12)],
        [],
        ['Financial Commitments & Savings', '', ''],
        ...getVals('expense-field', 'financial'),
        ['SUBTOTAL — Financial', fmtN(d.finM), fmtN((d.finM || 0) * 12)],
        [],
        ['TOTAL EXPENSES', fmtN(d.totalExpM), fmtN((d.totalExpM || 0) * 12)],
        [],
        ['NET SURPLUS / DEFICIT', fmtN((d.totalIncM || 0) - (d.totalExpM || 0)), fmtN(((d.totalIncM || 0) - (d.totalExpM || 0)) * 12)]
    ];
    const wsExpense = XLSX.utils.aoa_to_sheet(expenseData);
    wsExpense['!cols'] = [{ wch: 36 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsExpense, 'Expenses');

    XLSX.writeFile(wb, 'Spend_Sense_Budget.xlsx');
}

// Init
recalc();