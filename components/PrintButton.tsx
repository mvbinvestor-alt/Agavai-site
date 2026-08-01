'use client';

export default function PrintButton() {
  return (
    <button className="btn" style={{ marginTop: 24 }} onClick={() => window.print()}>
      Print / Save as PDF
    </button>
  );
}
