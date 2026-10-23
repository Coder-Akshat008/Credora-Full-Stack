import { useEffect, useState } from 'react';
import { ArrowUpRight, Plus, Search } from 'lucide-react';
import { api, jsonRequest } from '../lib/api.js';
import { formatDate, formatMoney, initials } from '../lib/format.js';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusPill from '../components/StatusPill.jsx';

function todayString() { return new Date().toLocaleDateString('en-CA'); }
const emptyLoan = { customerId: '', principalAmount: '', interestRate: '10.5', tenureMonths: '36', startDate: todayString() };

export default function Loans({ onToast }) {
  const [loans, setLoans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyLoan);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [loanResult, customerResult] = await Promise.all([api('/loans'), api('/customers')]);
      setLoans(loanResult.loans); setCustomers(customerResult.customers);
    } catch (exception) { onToast(exception.message, 'error'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  const filtered = loans.filter((loan) => {
    const statusMatch = status === 'ALL' || loan.loanStatus === status;
    const term = search.trim().toLowerCase();
    const searchMatch = !term || loan.customer?.fullName?.toLowerCase().includes(term) || String(loan._id).toLowerCase().includes(term);
    return statusMatch && searchMatch;
  });
  const portfolioTotal = loans.filter((item) => item.loanStatus === 'APPROVED').reduce((sum, loan) => sum + loan.remainingBalance, 0);

  function openCreate() { setForm({ ...emptyLoan, customerId: customers[0]?._id || '', startDate: todayString() }); setModalOpen(true); }
  async function submit(event) {
    event.preventDefault(); setBusy(true);
    try {
      await api('/loans', jsonRequest('POST', { ...form, principalAmount: Number(form.principalAmount), interestRate: Number(form.interestRate), tenureMonths: Number(form.tenureMonths) }));
      setModalOpen(false); onToast('Loan account created.', 'success'); await load();
    } catch (exception) { onToast(exception.message, 'error'); }
    finally { setBusy(false); }
  }
  async function changeStatus(loan, loanStatus) {
    try { await api(`/loans/${loan._id}/status`, jsonRequest('PATCH', { loanStatus })); onToast(`Loan marked ${loanStatus.toLowerCase()}.`, 'success'); await load(); }
    catch (exception) { onToast(exception.message, 'error'); }
  }

  return <div className="page-content">
    <PageHeader eyebrow="CREDIT / LOAN MANAGEMENT" title="Loan portfolio" description="Track principal, remaining balances, and lifecycle status in one place." action={<button className="btn btn-primary" onClick={openCreate}><Plus size={17} /> Create loan</button>} />
    <div className="loan-summary-strip"><div><span>Active outstanding</span><strong>{formatMoney(portfolioTotal)}</strong></div><div><span>Total loan accounts</span><strong>{loans.length}</strong></div><div><span>Approved</span><strong>{loans.filter((item) => item.loanStatus === 'APPROVED').length}</strong></div><div className="loan-strip-icon"><ArrowUpRight size={20} /><small>Portfolio overview</small></div></div>
    <section className="panel data-panel">
      <div className="data-toolbar loan-toolbar"><div><h2>All loan accounts</h2><p>Approved, closed, and defaulted loan records.</p></div><div className="table-tools"><div className="search-wrap"><Search size={16} /><input aria-label="Search loans" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find customer or loan ID" /></div><select aria-label="Filter loans by status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="ALL">All statuses</option><option value="APPROVED">Approved</option><option value="CLOSED">Closed</option><option value="DEFAULTED">Defaulted</option></select></div></div>
      <div className="table-wrap"><table><thead><tr><th>Loan / customer</th><th>Principal</th><th>Outstanding</th><th>Rate / tenure</th><th>Start date</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        {filtered.map((loan, index) => <tr key={loan._id}><td><div className="customer-cell"><span className={`avatar avatar-color-${index % 5}`}>{initials(loan.customer?.fullName)}</span><div><strong>{loan.customer?.fullName || 'Customer unavailable'}</strong><small className="muted-line">LN-{String(loan._id).slice(-6).toUpperCase()}</small></div></div></td><td className="amount-cell">{formatMoney(loan.principalAmount)}</td><td className="amount-cell">{formatMoney(loan.remainingBalance)}</td><td><strong>{loan.interestRate}%</strong><small className="muted-line">{loan.tenureMonths} months</small></td><td className="date-cell">{formatDate(loan.startDate)}</td><td><StatusPill value={loan.loanStatus} /></td><td>{loan.loanStatus === 'APPROVED' && <select className="action-select" defaultValue="" aria-label={`Change loan status ${loan._id}`} onChange={(event) => { if (event.target.value) changeStatus(loan, event.target.value); event.target.value = ''; }}><option value="" disabled>Manage</option><option value="DEFAULTED">Mark defaulted</option>{loan.remainingBalance === 0 && <option value="CLOSED">Mark closed</option>}</select>}{loan.loanStatus !== 'APPROVED' && <span className="muted-dash">—</span>}</td></tr>)}
        {!loading && filtered.length === 0 && <tr><td colSpan="7"><div className="table-empty">No loans match the selected filters.</div></td></tr>}
      </tbody></table></div>
      {loading && <div className="loading-line">Loading loan portfolio…</div>}
      <div className="table-footer"><span>Showing {filtered.length} of {loans.length} loan accounts</span><span><span className="live-dot" /> Synced with database</span></div>
    </section>
    {modalOpen && <Modal title="Create a loan account" subtitle="Start with an active customer and the agreed loan terms." onClose={() => setModalOpen(false)}>
      <form className="modal-form" onSubmit={submit}>
        <label>Customer<select value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })} required><option value="" disabled>Select a customer</option>{customers.map((customer) => <option key={customer._id} value={customer._id}>{customer.fullName} · {customer.email}</option>)}</select></label>
        {customers.length === 0 && <p className="field-note warning-note">Add a customer before creating a loan.</p>}
        <label>Principal amount (₹)<input type="number" min="1" step="0.01" value={form.principalAmount} onChange={(event) => setForm({ ...form, principalAmount: event.target.value })} placeholder="e.g. 250000" required /></label>
        <div className="form-grid-two"><label>Annual interest rate (%)<input type="number" min="0" max="100" step="0.01" value={form.interestRate} onChange={(event) => setForm({ ...form, interestRate: event.target.value })} required /></label><label>Tenure (months)<input type="number" min="1" max="600" step="1" value={form.tenureMonths} onChange={(event) => setForm({ ...form, tenureMonths: event.target.value })} required /></label></div>
        <label>Start date<input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} required /></label>
        <div className="modal-info"><span>i</span><p>The opening outstanding balance will equal the principal amount. Repayments update the balance automatically.</p></div>
        <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary" disabled={busy || customers.length === 0}>{busy ? 'Creating…' : 'Create loan'}</button></div>
      </form>
    </Modal>}
  </div>;
}
