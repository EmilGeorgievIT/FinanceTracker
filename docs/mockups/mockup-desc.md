I can see the mockups clearly. Based on your `CONTEXT.md`, the design is a dark-themed Android finance app centered around **Trackers** rather than accounts or budgets. 

# Overall Design Language

* Dark navy/black gradient background
* Blue accent color for navigation and primary actions
* Rounded cards everywhere (16–20dp radius)
* Floating Action Button (+) in bottom-right on most screens
* Bottom navigation with:

  * Home
  * Trackers
  * Transactions
  * Categories
  * More
* Soft glow/shadow effects around cards
* Large financial values aligned right
* Green used for positive/progress values
* Red used for debt/negative values

---

# 1. Home / Overview Screen

### Header

* Hamburger menu left
* "Finance Tracker" title
* Notification bell right

### Tracker Type Filters

Horizontal chips:

* Overview (selected)
* Assets
* Debts
* Income
* Expenses

### Monthly Summary Card

Large card containing:

* Current month selector
* Net value displayed prominently

Example:

```text
+€1,850.00
Income - Expenses
```

### Chart

Vertical bar chart:

* Green bars = Income
* Red bars = Expenses
* Monthly comparison
* Months shown:

  * Dec
  * Jan
  * Feb
  * Mar
  * Apr
  * May

### Quick Summary Section

List cards:

```text
Assets
€142,650.40
3 trackers

Debts
€295,250.00
2 trackers

Income (monthly)
€4,850.00
3 trackers

Expenses (this month)
€3,000.00
8 trackers
```

---

# 2. Trackers Screen

Top filter chips:

```text
All
Assets
Debts
Income
Expenses
```

## Asset Trackers Section

### Savings Goal Card

Emergency Fund

Shows:

```text
Savings Goal
€3,000 of €10,000
30%
```

Progress bar underneath.

---

### Another Savings Goal

Vacation Fund

```text
€1,200 of €3,000
40%
```

---

### Variable Holding Card

Bitcoin (BTC)

Shows:

```text
0.5 BTC
Average Cost
Current Value
Profit/Loss
```

Right side:

```text
€36,450.20
+€1,950.20
+5.64%
```

---

### Variable Holding Card

Apple (AAPL)

Shows:

```text
50 shares
Average Price
Current Value
Profit/Loss
```

---

## Debt Trackers Section

### Mortgage

Displays:

```text
Remaining Balance
Interest Rate
Property Value
LTV
```

---

### Car Loan

Displays:

```text
Remaining Balance
Interest Rate
Monthly Payment
```

---

## Income Section

Partially visible but appears to contain:

```text
Main Salary
Monthly amount
Payment day
```

---

# 3. Savings Goal Detail Screen

Title:

```text
Emergency Fund
```

### Large Circular Progress Ring

Center:

```text
€3,000
of €10,000
30%
```

### Details List

```text
Target Amount
Current Balance
Planned Monthly Contribution
Priority
```

### Recent Transactions

Table-like list:

```text
Date
Deposit
Amount
```

Examples:

```text
May 15
Deposit
€500
```

### Actions

Buttons:

```text
Add Deposit
Edit Goal
```

---

# 4. Variable Holding Detail Screen

Example: Bitcoin

### Header Area

Large coin icon

Displays:

```text
BTC
Current Value
Profit/Loss
```

### Tabs

```text
Overview
Transactions
Chart
```

### Overview Metrics

```text
Units
Average Price
Current Price
Current Value
Profit / Loss
```

### Recent Transactions

Shows Buy history.

Example:

```text
Apr 10
Buy
0.1 BTC
€69,200
```

### Actions

```text
Buy
Sell
```

Green and red buttons.

---

# 5. Debt Detail Screen

Example: Mortgage

### Large Remaining Balance

```text
€280,000
```

### Debt Trend Chart

Red declining line chart.

Time axis:

```text
Jan '24
May '24
Sep '24
Jan '25
May '25
```

### Metrics

```text
Original Principal
Annual Interest Rate
Monthly Payment
Property Value
Loan-to-Value
```

### Actions

```text
Make Payment
Edit
```

---

# 6. Add Transaction Screen

Segmented control:

```text
Deposit
Withdraw
```

Fields:

```text
Date
Amount (EUR)
Note
```

Primary CTA:

```text
Save Transaction
```

---

# 7. Expenses Screen

### Month Selector

```text
May 2025
```

### Total

```text
€3,000.00
Total Expenses
```

### Doughnut Chart

Breakdown by category:

```text
Housing
Food
Transport
Utilities
Other
```

Percentages shown beside legend.

### Transaction List

Example:

```text
Groceries
Food
€120

Electricity Bill
Utilities
€80
```

---

# 8. Categories Screen

List of categories with icons:

```text
Housing
Food
Transport
Entertainment
Utilities
Healthcare
Other
```

Actions per row:

```text
Edit
Delete
```

Plus button in top-right.

---

# 9. Export / Import Screen

Very simple settings page.

Rows:

```text
Export Data
Save all tracker data to JSON

Import Data
Load previously exported file
```

Small helper text:

```text
Import will merge with current data.
```

---

# 10. More Screen

Menu items:

```text
Export / Import
Settings
Manage Categories
About Finance Tracker
```

Version label at bottom:

```text
v1.0.0
```

---

# What I'd Change To Better Match the Context

The mockups are visually polished, but a few things don't perfectly align with the terminology in `CONTEXT.md`: 

### Rename "Trackers" screen sections

Current:

```text
ASSET TRACKERS
DEBT TRACKERS
INCOME TRACKERS
```

Keep these—they match the spec well.

---

### Variable Holding

The design currently looks very investment-oriented.

To align with the product language:

Avoid:

```text
Portfolio
Investment
Position
```

Use:

```text
Variable Holding
```

everywhere. 

---

### Savings Goals

Add the spec fields visibly:

```text
Planned Monthly Contribution
Priority
```

Those are important in the requirements. 

---

### Income Trackers

Include:

```text
Net Monthly Amount
Payment Day
```

These are defined explicitly in the spec. 

---

### Expense Trackers

Current mockup feels transaction-based.

The spec defines actual Expense Trackers with:

```text
Amount
Date
Frequency
Category
```

So the Expense screen should probably emphasize recurring expense trackers, not only historical transactions. 

---

Overall, the mockup looks like a modern dark-mode Android app with about **10 screens**, focused on tracker management, monthly overview charts, savings goals, variable holdings, debts, expenses, categories, and import/export. It already aligns quite closely with the context document and mostly needs terminology and data-model tweaks rather than a complete redesign.
