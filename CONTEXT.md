# Finance Tracker

A personal finance app for Android that tracks assets, liabilities, and income — each tracked independently, no net worth roll-up.

## Language

**Tracker**:
Any individually tracked financial item the user adds to the app. A tracker has a type, a name, and a current value or balance. Values change via recorded transactions, and the balance can also be edited directly as an override.
_Avoid_: Account, item, entry, holding, position, line

**Transaction**:
A dated record of a financial action that changes a tracker's balance — a deposit into a Savings Goal, a buy or sell of a Variable Holding, or a payment on a Debt Tracker. Each transaction has a date, amount (EUR), and a note.
_Avoid_: Entry, record, line item

### Tracker Types

**Asset Tracker**:
Something the user owns that holds or accumulates value. Two subtypes: Savings Goal and Variable Holding.
_Avoid_: Investment, holding, portfolio

**Savings Goal**:
An Asset Tracker with a fixed target amount. The user manually adds deposits toward the target. Has a name, target amount, current balance, a planned monthly contribution, and an ordered priority relative to other goals. No deadline.
_Example_: Emergency Fund ($3,000 of $10,000), Vacation Fund.

**Variable Holding**:
An Asset Tracker whose value fluctuates with market price. Has a name, a ticker symbol, units held, and a simple average purchase price (no lot tracking). Current market price is fetched automatically from a free API. All values in EUR. Profit/loss = (current price − average cost) × units.
_Example_: 0.5 BTC @ avg €41,000, 50 shares AAPL.

**Debt Tracker**:
Something the user owes and pays down over time. Has a name, original principal, current remaining balance, annual interest rate (%), and monthly payment. Two subtypes: Mortgage and Loan.

**Mortgage**:
A Debt Tracker secured by real estate. Adds an estimated property value field so the user can see debt-to-value at a glance.
_Example_: House mortgage — €280K remaining @ 4.5%, property worth €450K.

**Loan**:
A Debt Tracker not secured by property. No collateral tracking.
_Example_: Car loan — €15K remaining @ 6%.

**Income Tracker**:
Recurring money coming in on a schedule. Each has a name, a net monthly amount after tax (EUR), and a payment day-of-month. The user can add multiple income trackers (salary, rental, side gig, etc.).
_Avoid_: Revenue, earnings, cashflow

**Expense Tracker**:
Money going out, recurring or one-off. Each has a name, amount (EUR), date (day-of-month for recurring, specific date for one-off), frequency (monthly or one-off), and a Category. The user can add multiple expense trackers.
_Avoid_: Bill, spending, outflow

**Category**:
A user-manageable classification for expense trackers. Built-in defaults (Housing, Food, Transport, Entertainment, Utilities, Healthcare, Other) with ability to add, remove, and rename.
_Avoid_: Tag, label, group

**Export**:
Manual save of all tracker data to a file (JSON) for backup or transfer to a new device. User-triggered, not automatic.
_Avoid_: Backup, sync, cloud save

**Import**:
Load tracker data from a previously exported JSON file, restoring or merging into the current local store. User-triggered.
_Avoid_: Restore, load, sync

## Example dialogue

**Dev**: You've added a Savings Goal for your Emergency Fund. How do you add money to it?

**User**: I open the goal, tap "Add Deposit", enter €500, and save. The balance goes from €2,500 to €3,000, and the progress ring fills to 30%.

**Dev**: And if you buy more Bitcoin — same flow on a Variable Holding?

**User**: Similar, but there I pick buy or sell, enter how many units and the price per coin. The app averages my purchase price. Current value updates from Yahoo Finance whenever I open the app.

**Dev**: What about your car loan payment? Do you record it the same way?

**User**: Yes, I tap "Make Payment" on the loan, enter €350, and the remaining balance drops. I see the balance going down on the detail chart.

**Dev**: And expenses — how do they relate to income? Is there budgeting?

**User**: No budget enforcement. I track them side by side. The home screen bar chart shows each month's income minus expenses so I can see if I'm spending more than I earn.

**Dev**: If you get a new phone, how do you move your data?

**User**: I export a JSON file from the old phone, transfer it, and import it on the new one.
