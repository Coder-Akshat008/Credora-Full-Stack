import { useEffect, useMemo, useState } from 'react';
import { Mail, Pencil, Plus, Search, Trash2, UsersRound } from 'lucide-react';
import { api, jsonRequest } from '../lib/api.js';
import { initials, formatDate } from '../lib/format.js';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';

const emptyForm = { fullName: '', email: '', phone: '' };

export default function Customers({ onToast }) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(query = search) {
    setLoading(true); setError('');
    try {
      const result = await api(`/customers${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ''}`);
      setCustomers(result.customers);
    } catch (exception) { setError(exception.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(''); }, []);
  useEffect(() => {
    const timer = setTimeout(() => load(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const total = customers.length;
  const recentlyAdded = useMemo(() => customers.filter((item) => Date.now() - new Date(item.createdAt).getTime() < 30 * 86400000).length, [customers]);
  function openCreate() { setEditing(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(customer) { setEditing(customer); setForm({ fullName: customer.fullName, email: customer.email, phone: customer.phone }); setModalOpen(true); }
  async function submit(event) {
    event.preventDefault(); setBusy(true);
    try {
      await api(editing ? `/customers/${editing._id}` : '/customers', jsonRequest(editing ? 'PUT' : 'POST', form));
      setModalOpen(false); onToast(editing ? 'Customer details updated.' : 'Customer added successfully.', 'success'); await load();
    } catch (exception) { onToast(exception.message, 'error'); }
    finally { setBusy(false); }
  }
  async function archive(customer) {
    if (!window.confirm(`Archive ${customer.fullName}? Their historic loan records will remain available.`)) return;
    try { await api(`/customers/${customer._id}`, { method: 'DELETE' }); onToast('Customer archived.', 'success'); await load(); }
    catch (exception) { onToast(exception.message, 'error'); }
  }

  return <div className="page-content">
    <PageHeader eyebrow="RELATIONSHIPS / DIRECTORY" title="Customer directory" description="Keep customer records accurate and ready for every lending interaction." action={<button className="btn btn-primary" onClick={openCreate}><Plus size={17} /> Add customer</button>} />
    <div className="directory-stats"><div className="directory-stat-icon"><UsersRound size={20} /></div><div><span>Visible customers</span><strong>{loading ? '—' : total}</strong></div><div className="stat-divider" /><div><span>Added in the last 30 days</span><strong>{recentlyAdded}</strong></div><div className="directory-stat-note">Customer data is archived instead of permanently deleted.</div></div>
    <section className="panel data-panel">
      <div className="data-toolbar"><div><h2>All customers</h2><p>Search, update, or archive customer profiles.</p></div><div className="search-wrap"><Search size={16} /><input aria-label="Search customers" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, phone…" /></div></div>
      {error && <div className="inline-error page-error">{error} <button onClick={() => load()}>Retry</button></div>}
      <div className="table-wrap"><table><thead><tr><th>Customer</th><th>Contact information</th><th>Created</th><th className="right-align">Actions</th></tr></thead><tbody>
        {customers.map((customer, index) => <tr key={customer._id}>
          <td><div className="customer-cell"><span className={`avatar avatar-color-${index % 5}`}>{initials(customer.fullName)}</span><div><strong>{customer.fullName}</strong><small className="muted-line">CUS-{String(customer._id).slice(-6).toUpperCase()}</small></div></div></td>
          <td><div className="contact-cell"><span><Mail size={14} /> {customer.email}</span><small>{customer.phone}</small></div></td>
          <td className="date-cell">{formatDate(customer.createdAt)}</td>
          <td><div className="row-actions"><button type="button" className="icon-button" aria-label={`Edit ${customer.fullName}`} title="Edit customer" onClick={() => openEdit(customer)}><Pencil size={16} /></button><button type="button" className="icon-button danger-icon" aria-label={`Archive ${customer.fullName}`} title="Archive customer" onClick={() => archive(customer)}><Trash2 size={16} /></button></div></td>
        </tr>)}
        {!loading && customers.length === 0 && <tr><td colSpan="4"><div className="empty-state"><span><UsersRound size={23} /></span><strong>{search ? 'No matching customers' : 'No customers yet'}</strong><p>{search ? 'Try a different name, email, or phone number.' : 'Add the first customer to start building your portfolio.'}</p>{!search && <button className="btn btn-secondary" onClick={openCreate}>Add first customer</button>}</div></td></tr>}
        </tbody></table></div>
      {loading && <div className="loading-line">Loading customer records…</div>}
      <div className="table-footer"><span>Showing {customers.length} customer{customers.length === 1 ? '' : 's'}</span><span><span className="live-dot" /> Synced with database</span></div>
    </section>

    {modalOpen && <Modal title={editing ? 'Update customer' : 'Add a customer'} subtitle={editing ? 'Edit the contact details below.' : 'Create a profile for a new lending customer.'} onClose={() => setModalOpen(false)}>
      <form className="modal-form" onSubmit={submit}>
        <label>Full name<input autoFocus value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="Enter customer name" minLength={2} maxLength={100} required /></label>
        <label>Email address<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@example.com" required /></label>
        <label>Phone number<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+91 98765 43210" minLength={7} maxLength={20} required /></label>
        <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Create customer'}</button></div>
      </form>
    </Modal>}
  </div>;
}
