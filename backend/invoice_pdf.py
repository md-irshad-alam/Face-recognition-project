"""
invoice_pdf.py — Server-side invoice PDF generator.

Generates a professional invoice PDF matching the frontend design.
Returns the PDF as raw bytes (for attaching to WhatsApp, email, etc.)
"""

import io
from datetime import datetime
from fpdf import FPDF


class InvoicePDF(FPDF):
    """Custom PDF class with branded header/footer."""

    def header(self):
        pass  # We draw custom header in body for more control

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(148, 163, 184)
        self.cell(
            0, 10,
            "This is a computer generated invoice and does not require a physical signature.",
            align="C"
        )


def generate_invoice_pdf(invoice: dict, payments: list = None) -> bytes:
    """
    Generate a professional PDF invoice.

    Args:
        invoice: dict with keys like invoice_number, student_name, class_name,
                 section, parent_phone, monthly_fee, previous_due, late_fine,
                 total_payable, amount_paid, balance_due, due_date, etc.
        payments: optional list of payment records for transaction history.

    Returns:
        PDF file as bytes.
    """
    pdf = InvoicePDF()
    pdf.add_page()
    pw = pdf.w - 28  # usable page width (14mm margin each side)

    # ── Header ──────────────────────────────────────────────────────────────
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(79, 70, 229)  # Indigo
    pdf.cell(pw / 2, 10, "VISIO SCHOOL", new_x="RIGHT")

    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(pw / 2, 10, "INVOICE", align="R", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(pw / 2, 6, "SMART EDUCATION ECOSYSTEM", new_x="RIGHT")

    inv_no = invoice.get("invoice_number", "N/A")
    pdf.cell(pw / 2, 6, f"#{inv_no}", align="R", new_x="LMARGIN", new_y="NEXT")

    # Divider
    pdf.ln(4)
    pdf.set_draw_color(241, 245, 249)
    pdf.line(14, pdf.get_y(), pdf.w - 14, pdf.get_y())
    pdf.ln(6)

    # ── Bill To / Invoice Info ──────────────────────────────────────────────
    y_info = pdf.get_y()

    # Left: Bill To
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(pw / 2, 5, "BILL TO", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(pw / 2, 6, invoice.get("student_name", "N/A"), new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(100, 116, 139)
    class_section = f"{invoice.get('class_name', '')} {invoice.get('section', '')}".strip()
    pdf.cell(pw / 2, 5, f"Class: {class_section}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(pw / 2, 5, f"Parent Phone: {invoice.get('parent_phone', 'N/A')}", new_x="LMARGIN", new_y="NEXT")

    y_after_left = pdf.get_y()

    # Right: Invoice details
    pdf.set_y(y_info)
    right_x = 14 + pw / 2 + 10

    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(148, 163, 184)
    pdf.set_x(right_x)
    pdf.cell(pw / 2 - 10, 5, "INVOICE DATE", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(30, 41, 59)
    pdf.set_x(right_x)
    pdf.cell(pw / 2 - 10, 6, datetime.now().strftime("%d %b %Y"), new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(148, 163, 184)
    pdf.set_x(right_x)
    pdf.cell(pw / 2 - 10, 5, "DUE DATE", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(239, 68, 68)  # Red
    pdf.set_x(right_x)
    pdf.cell(pw / 2 - 10, 6, invoice.get("due_date", "10th of Month"), new_x="LMARGIN", new_y="NEXT")

    pdf.set_y(max(y_after_left, pdf.get_y()) + 8)

    # ── Fee Breakdown Table ─────────────────────────────────────────────────
    monthly = float(invoice.get("monthly_fee", 0))
    prev_due = float(invoice.get("previous_due", 0))
    late_fine = float(invoice.get("late_fine", 0))
    total = float(invoice.get("total_payable", 0))
    paid = float(invoice.get("amount_paid", 0))
    balance = float(invoice.get("balance_due", 0))

    # Table header
    pdf.set_fill_color(79, 70, 229)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(pw * 0.65, 10, "  Description", fill=True)
    pdf.cell(pw * 0.35, 10, "Amount (INR)", align="R", fill=True, new_x="LMARGIN", new_y="NEXT")

    # Table rows
    rows = [
        ("Monthly Tuition Fee", monthly),
        ("Previous Arrears / Due", prev_due),
        ("Late Payment Charges", late_fine),
    ]
    for i, (desc, amt) in enumerate(rows):
        bg = (248, 250, 252) if i % 2 == 0 else (255, 255, 255)
        pdf.set_fill_color(*bg)
        pdf.set_text_color(30, 41, 59)
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(pw * 0.65, 9, f"  {desc}", fill=True)
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(pw * 0.35, 9, f"{amt:,.2f}", align="R", fill=True, new_x="LMARGIN", new_y="NEXT")

    pdf.ln(4)

    # ── Totals ──────────────────────────────────────────────────────────────
    totals_x = 14 + pw * 0.5

    pdf.set_draw_color(241, 245, 249)
    pdf.line(totals_x, pdf.get_y(), pdf.w - 14, pdf.get_y())
    pdf.ln(4)

    # Total Payable
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(100, 116, 139)
    pdf.set_x(totals_x)
    pdf.cell((pw * 0.5 - 10) / 2, 7, "Total Payable:")
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(15, 23, 42)
    pdf.cell((pw * 0.5 - 10) / 2, 7, f"INR {total:,.2f}", align="R", new_x="LMARGIN", new_y="NEXT")

    # Amount Paid
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(100, 116, 139)
    pdf.set_x(totals_x)
    pdf.cell((pw * 0.5 - 10) / 2, 7, "Amount Paid:")
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(16, 185, 129)  # Green
    pdf.cell((pw * 0.5 - 10) / 2, 7, f"INR {paid:,.2f}", align="R", new_x="LMARGIN", new_y="NEXT")

    # Balance Due
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(15, 23, 42)
    pdf.set_x(totals_x)
    pdf.cell((pw * 0.5 - 10) / 2, 7, "Balance Due:")
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(239, 68, 68)  # Red
    pdf.cell((pw * 0.5 - 10) / 2, 7, f"INR {balance:,.2f}", align="R", new_x="LMARGIN", new_y="NEXT")

    # ── Payment History (if available) ──────────────────────────────────────
    if payments and len(payments) > 0:
        pdf.ln(10)
        pdf.set_font("Helvetica", "B", 13)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(pw, 8, "TRANSACTION HISTORY", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(2)

        # History table header
        pdf.set_fill_color(248, 250, 252)
        pdf.set_text_color(71, 85, 105)
        pdf.set_font("Helvetica", "B", 9)
        cols = [pw * 0.2, pw * 0.22, pw * 0.18, pw * 0.2, pw * 0.2]
        headers = ["Date", "Ref ID", "Method", "Amount", "Status"]
        for j, h in enumerate(headers):
            pdf.cell(cols[j], 8, h, fill=True)
        pdf.ln()

        # History rows
        pdf.set_font("Helvetica", "", 8)
        pdf.set_text_color(30, 41, 59)
        for p in payments:
            p_date = p.get("payment_date", "N/A")
            if hasattr(p_date, "strftime"):
                p_date = p_date.strftime("%d %b %Y")
            pdf.cell(cols[0], 7, str(p_date))
            pdf.cell(cols[1], 7, str(p.get("transaction_id") or p.get("reference_number") or "N/A"))
            pdf.cell(cols[2], 7, str(p.get("payment_method", "CASH")))
            pdf.cell(cols[3], 7, f"INR {float(p.get('amount', p.get('amount_paid', 0))):,.2f}")
            pdf.cell(cols[4], 7, str(p.get("status", "COMPLETED")))
            pdf.ln()

    # ── Output ──────────────────────────────────────────────────────────────
    return pdf.output()
