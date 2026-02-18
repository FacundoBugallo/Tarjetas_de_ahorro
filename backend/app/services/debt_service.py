def calculate_debt_summary(payment_amount: float, periods: int, cadence: str) -> dict:
    total_to_pay = payment_amount * periods
    return {
        'payment_amount': payment_amount,
        'periods': periods,
        'cadence': cadence,
        'total_to_pay': total_to_pay,
        'summary': f'A pagar para cancelar: {total_to_pay:.2f}',
    }
