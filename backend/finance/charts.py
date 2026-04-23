# finance/charts.py

import io
import base64
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # This tells Matplotlib NOT to try opening a window

def generate_spending_pie(breakdown):
    labels = list(breakdown.keys())
    values = list(breakdown.values())

    fig, ax = plt.subplots(figsize=(5, 5))
    ax.pie(values, labels=labels, autopct='%1.1f%%')
    ax.set_title("Spending Breakdown")

    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', bbox_inches='tight')
    buffer.seek(0)

    encoded = base64.b64encode(buffer.read()).decode('utf-8')
    plt.close(fig)

    return encoded
