import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, CheckCircle2, CircleDollarSign, CreditCard, ReceiptText } from 'lucide-react';
import { api, jsonRequest } from '../lib/api.js';
import { formatDate, formatMoney, initials } from '../lib/format.js';
import PageHeader from '../components/PageHeader.jsx';
import StatusPill from '../components/StatusPill.jsx';

export default function Repayments({ onToast }) {
  const [payments, setPayments] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loanId, setLoanId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [paymentResult, loanResult] = await Promise.all([api('/payments'), api('/loans')]);
      setPayments(paymentResult.payments);
      const approved = loanResult.loans.filter((loan) => loan.loanStatus === 'APPROVED' && loan.remainingBalance > 0);
      setLoans(approved);
      setLoanId((current) => approved.some((loan) => loan._id === current) ? current : approved[0]?._id || '');
    } catch (exception) { onToast(exception.message, 'error'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  const selectedLoan = loans.find((loan) => loan._id === loanId);
  const totalCollected = useMemo(() => payments.reduce((sum, payment) => sum + Number(payment.amountPaid || 0), 0), [payments]);
  const todayTotal = useMemo(() => payments.filter((payment) => new Date(payment.paymentDate).toDateString() === new Date().toDateString()).reduce((sum, payment) => sum + Number(payment.amountPaid || 0), 0), [payments]);
  const filtered = payments.filter((payment) => !search.trim() || payment.loan?.customer?.fullName?.toLowerCase().includes(search.trim().toLowerCase()) || String(payment.loan?._id || '').toLowerCase().includes(search.trim().toLowerCase()));

  async function submit(event) {
    event.preventDefault(); setBusy(true);
    try {
      const result = await api('/payments', jsonRequest('POST', { loanId, amountPaid: Number(amountPaid) }));
      setAmountPaid(''); onToast(result.message || 'Repayment recorded.', 'success'); await load();
    } catch (exception) { onToast(exception.message, 'error'); }
    finally { setBusy(false); }
  }

  return <div className="page-content">
    <PageHeader eyebrow="SERVICING / COLLECTIONS" title="Repayment centre" description="Record collections and keep balances accurate with each transaction." />
    <div className="repayment-summary-grid">
      <div className="repayment-stat panel"><div className="metric-icon tone-teal"><CircleDollarSign size={20} /></div><span>Lifetime recorded collections</span><strong>{formatMoney(totalCollected)}</strong><small>Across {payments.length} payment entries</small></div>
      <div className="repayment-stat panel"><div className="metric-icon tone-blue"><ArrowDownLeft size={20} /></div><span>Collected today</span><strong>{formatMoney(todayTotal)}</strong><small>Based on payment timestamps</small></div>
      <div className="repayment-stat panel"><div className="metric-icon tone-purple"><CreditCard size={20} /></div><span>Loans accepting payment</span><strong>{loans.length}</strong><small>Approved with a balance remaining</small></div>
    </div>
    <div className="repayment-layout">
      <section className="panel payment-form-panel">
        <div className="form-panel-head"><div className="form-panel-icon"><ReceiptText size={20} /></div><div><h2>Record a repayment</h2><p>Apply a payment to an approved loan.</p></div></div>
        <form className="modal-form" onSubmit={submit}>
          <label>Loan account<select value={loanId} onChange={(event) => { setLoanId(event.target.value); setAmountPaid(''); }} required><option value="" disabled>Select a loan account</option>{loans.map((loan) => <option value={loan._id} key={loan._id}>{loan.customer?.fullName || 'Customer'} · LN-{String(loan._id).slice(-6).toUpperCase()}</option>)}</select></label>
          {selectedLoan && <div className="selected-loan-card"><div><span>Current outstanding</span><strong>{formatMoney(selectedLoan.remainingBalance)}</strong></div><div><span>Interest rate</span><strong>{selectedLoan.interestRate}% p.a.</strong></div></div>}
          <label>Payment amount (₹)<input type="number" value={amountPaid} onChange={(event) => setAmountPaid(event.target.value)} min="0.01" max={selectedLoan?.remainingBalance || undefined} step="0.01" placeholder="Enter amount received" required /></label>
          {amountPaid && selectedLoan && Number(amountPaid) > selectedLoan.remainingBalance && <p className="field-note warning-note">The amount cannot exceed the outstanding balance.</p>}
          <div className="modal-info"><span>✓</span><p>Credora checks the current balance before recording the payment. A fully paid loan is automatically marked closed.</p></div>
          <button className="btn btn-primary full-width-btn" disabled={busy || !selectedLoan || !amountPaid || Number(amountPaid) > (selectedLoan?.remainingBalance || 0)}>{busy ? 'Processing payment…' : 'Confirm repayment'} <ArrowDownLeft size={16} /></button>
          {!loans.length && <p className="field-note">No approved loans with outstanding balances are available for payment.</p>}
        </form>
      </section>
      <section className="panel ledger-panel">
        <div className="data-toolbar"><div><h2>Payment ledger</h2><p>Latest recorded repayment entries.</p></div><input className="ledger-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer…" aria-label="Search repayments" /></div>
        <div className="table-wrap"><table><thead><tr><th>Customer / loan</th><th>Date recorded</th><th>Amount</th><th>Loan status</th></tr></thead><tbody>
          {filtered.map((payment, index) => <tr key={payment._id}><td><div className="customer-cell"><span className={`avatar avatar-color-${index % 5}`}>{initials(payment.loan?.customer?.fullName)}</span><div><strong>{payment.loan?.customer?.fullName || 'Customer unavailable'}</strong><small className="muted-line">LN-{String(payment.loan?._id || '').slice(-6).toUpperCase()}</small></div></div></td><td className="date-cell">{formatDate(payment.paymentDate)}</td><td className="amount-cell">{formatMoney(payment.amountPaid)}</td><td>{payment.loan?.loanStatus ? <StatusPill value={payment.loan.loanStatus} /> : <span className="muted-dash">—</span>}</td></tr>)}
          {!loading && filtered.length === 0 && <tr><td colSpan="4"><div className="empty-state compact-empty"><span><ReceiptText size={22} /></span><strong>No payments found</strong><p>Recorded payments will appear here.</p></div></td></tr>}
        </tbody></table></div>
        {loading && <div className="loading-line">Loading payment ledger…</div>}
        <div className="table-footer"><span>{filtered.length} payment entr{filtered.length === 1 ? 'y' : 'ies'}</span><span><CheckCircle2 size={14} /> Ledger records</span></div>
      </section>
    </div>
  </div>;
}
