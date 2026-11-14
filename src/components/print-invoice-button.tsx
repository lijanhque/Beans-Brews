"use client";

export function PrintInvoiceButton() {
  return <button className="button-outline no-print" onClick={() => window.print()} type="button">Print invoice</button>;
}
