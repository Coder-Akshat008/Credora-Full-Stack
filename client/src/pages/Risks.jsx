import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, ClipboardCheck, RefreshCw, ShieldAlert } from 'lucide-react';
import { api } from '../lib/api.js';
import { formatDate, formatMoney, initials } from '../lib/format.js';
import PageHeader from '../components/PageHeader.jsx';
import StatusPill from '../components/StatusPill.jsx';

export default function Risks({ onToast }) {
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState('OPEN');
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);
  const [resolving, setResolving] = useState('');

  async function load() {
    setLoading(true);
    try {
      const result = await api(`/delinquency?status=${filter}`);
      setRecords(result.records);
    } catch (exception) { onToast(exception.message, 'error'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [filter]);
  const highRisk = useMemo(() => records.filter((record) => record.riskLevel === 'HIGH' && record.resolutionStatus === 'OPEN').length, [records]);
  const exposed = useMemo(() => records.filter((record) => record.resolutionStatus === 'OPEN').reduce((sum, record) => sum + Number(record.outstandingAmount || 0), 0), [records]);

  async function runAudit() {
    setAuditing(true);
    try { const result = await api('/delinquency/audit', { method: 'POST' }); onToast(result.message, 'success'); await load(); }
    catch (exception) { onToast(exception.message, 'error'); }
    finally { setAuditing(false); }
  }
  async function resolve(record) {
    setResolving(record._id);
    try { const result = await api(`/delinquency/${record._id}/resolve`, { method: 'PATCH' }); onToast(result.message, 'success'); await load(); }
    catch (exception) { onToast(exception.message, 'error'); }
    finally { setResolving(''); }
  }

  return <div className="page-content">
    <PageHeader eyebrow="PORTFOLIO HEALTH / EARLY WARNING" title="Risk monitor" description="Review overdue accounts, prioritise follow-ups, and record resolutions." action={<button className="btn btn-primary" onClick={runAudit} disabled={auditing}>{auditing ? <RefreshCw size={16} className="spin" /> : <RefreshCw size={16} />}{auditing ? 'Running audit…' : 'Run delinquency audit'}</button>} />
    <div className="risk-banner"><div className="risk-banner-symbol"><ShieldAlert size={23} /></div><div><strong>Early-warning desk</strong><p>The audit flags approved loans that started more than 30 days ago and still have an outstanding balance. This demo rule is illustrative, not a production credit policy.</p></div><div className="risk-banner-side"><span>Open exposure</span><strong>{formatMoney(exposed)}</strong></div></div>
    <div className="risk-kpi-grid"><div className="risk-kpi"><div className="risk-kpi-icon risk-high"><AlertTriangle size={18} /></div><span>High-risk records</span><strong>{highRisk}</strong><small>Open high-risk items in current view</small></div><div className="risk-kpi"><div className="risk-kpi-icon risk-mid"><ClipboardCheck size={18} /></div><span>Records in current view</span><strong>{records.length}</strong><small>Filtered by resolution status</small></div><div className="risk-kpi"><div className="risk-kpi-icon risk-safe"><Check size={18} /></div><span>Resolved records</span><strong>{filter === 'RESOLVED' ? records.length : '—'}</strong><small>Switch the filter to review history</small></div></div>
    <section className="panel data-panel">
      <div className="data-toolbar"><div><h2>Delinquency register</h2><p>Review each flagged loan and its current outstanding balance.</p></div><div className="risk-filter-tabs" role="group" aria-label="Filter risk records">{['OPEN', 'RESOLVED'].map((value) => <button key={value} className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)}>{value === 'OPEN' ? 'Open items' : 'Resolved'}</button>)}</div></div>
      <div className="table-wrap"><table><thead><tr><th>Customer / loan</th><th>Days overdue</th><th>Outstanding</th><th>Risk</th><th>Flagged date</th><th>Status</th><th>Action</th></tr></thead><tbody>
        {records.map((record, index) => <tr key={record._id}><td><div className="customer-cell"><span className={`avatar avatar-color-${index % 5}`}>{initials(record.loan?.customer?.fullName)}</span><div><strong>{record.loan?.customer?.fullName || 'Customer unavailable'}</strong><small className="muted-line">LN-{String(record.loan?._id || '').slice(-6).toUpperCase()}</small></div></div></td><td><span className={`days-overdue ${record.riskLevel === 'HIGH' ? 'days-high' : ''}`}>{record.daysOverdue} days</span></td><td className="amount-cell">{formatMoney(record.outstandingAmount)}</td><td><StatusPill value={record.riskLevel} /></td><td className="date-cell">{formatDate(record.delinquencyDate)}</td><td><StatusPill value={record.resolutionStatus} /></td><td>{record.resolutionStatus === 'OPEN' ? <button className="resolve-btn" disabled={resolving === record._id} onClick={() => resolve(record)}><Check size={14} /> {resolving === record._id ? 'Saving…' : 'Resolve'}</button> : <span className="resolved-mark"><Check size={15} /> Done</span>}</td></tr>)}
        {!loading && records.length === 0 && <tr><td colSpan="7"><div className="empty-state"><span><ShieldAlert size={23} /></span><strong>{filter === 'OPEN' ? 'No open risk items' : 'No resolved items yet'}</strong><p>{filter === 'OPEN' ? 'Run the delinquency audit to check loans against the demo rule.' : 'Resolved risk items will be listed here.'}</p>{filter === 'OPEN' && <button className="btn btn-secondary" onClick={runAudit} disabled={auditing}>Run audit</button>}</div></td></tr>}
      </tbody></table></div>
      {loading && <div className="loading-line">Loading risk register…</div>}
      <div className="table-footer"><span>{records.length} {filter.toLowerCase()} record{records.length === 1 ? '' : 's'}</span><span><span className="live-dot" /> Risk register</span></div>
    </section>
  </div>;
}
