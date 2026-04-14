# finance/calculations.py

def sum_column(grid):
    total = 0
    for row in grid:
        try:
            total += float(row[1])
        except:
            pass
    return total


def compute_financials(earnings, spendings):
    monthly_earnings = sum_column(earnings)
    monthly_spendings = sum_column(spendings)
    monthly_savings = monthly_earnings - monthly_spendings

    yearly_earnings = monthly_earnings * 12
    yearly_spendings = monthly_spendings * 12
    yearly_savings = monthly_savings * 12

    breakdown = {}
    for row in spendings:
        try:
            breakdown[row[0]] = float(row[1])
        except:
            pass

    return {
        "monthly_earnings": monthly_earnings,
        "monthly_spendings": monthly_spendings,
        "monthly_savings": monthly_savings,
        "yearly_earnings": yearly_earnings,
        "yearly_spendings": yearly_spendings,
        "yearly_savings": yearly_savings,
        "spending_breakdown": breakdown
    }
