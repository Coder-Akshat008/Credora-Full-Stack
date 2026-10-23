import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, CircleDollarSign, Clock3, CreditCard, UsersRound, Wallet } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../lib/api.js';
import { formatDate, formatMoney, initials } from '../lib/format.js';
import PageHeader from '../components/PageHeader.jsx';
import StatusPill from '../components/StatusPill.jsx';

function MetricCard({ label, value, note, icon: Icon, tone = 'teal', suffix }) {
  return <article className="metric-card">
    <div className={`metric-icon tone-${tone}`}><Icon size={20} strokeWidth={1.8} /></div>
    <div className="metric-card-label">{label}<span className="metric-menu">•••</span></div>
    <div className="metric-value">{value}</div>
    <div className="metric-foot"><span className={`metric-trend ${tone === 'orange' ? 'trend-warm' : ''}`}><ArrowUpRight size={13} /> Live data</span><span>{note || suffix}</span></div>
  </article>;
}

export default function Dashboard({ onNavigate }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true); setError('');
    try { setData(await api('/dashboard/summary')); }
    catch (exception) { setError(exception.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const metrics = data?.metrics || { customers: 0, activeLoans: 0, outstanding: 0, openRisks: 0 };
  return <div className="page-content">
    <PageHeader eyebrow="OVERVIEW / YOUR WORKSPACE" title="Good things start with clarity." description="Here’s the latest view of your lending portfolio." action={<button className="btn btn-secondary" onClick={load}><span className="refresh-glyph">↻</span> Refresh data</button>} />
    {error && <div className="inline-error page-error">{error} <button onClick={load}>Retry</button></div>}
    <div className="metric-grid">
      <MetricCard label="Total customers" value={loading ? '—' : metrics.customers.toLocaleString('en-IN')} note="Active profiles" icon={UsersRound} tone="teal" />
      <MetricCard label="Active loans" value={loading ? '—' : metrics.activeLoans.toLocaleString('en-IN')} note="Approved accounts" icon={CreditCard} tone="blue" />
      <MetricCard label="Outstanding balance" value={loading ? '—' : formatMoney(metrics.outstanding)} note="Across active loans" icon={Wallet} tone="purple" />
      <MetricCard label="Open risk items" value={loading ? '—' : metrics.openRisks.toLocaleString('en-IN')} note="Need follow-up" icon={Clock3} tone="orange" />
    </div>

    <div className="dashboard-grid">
      <section className="panel payments-chart-panel">
        <div className="panel-heading"><div><div className="panel-kicker">CASH FLOW</div><h2>Repayment activity</h2><p>Recorded collections over the last 6 months</p></div><div className="chart-legend"><span /> Total collected</div></div>
        <div className="chart-wrap">
          {loading ? <div className="chart-placeholder">Loading portfolio trends…</div> : <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.monthlyPayments || []} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
              <defs><linearGradient id="collectionFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#218a80" stopOpacity={0.22} /><stop offset="100%" stopColor="#218a80" stopOpacity={0.01} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#e9eef2" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8592a0', fontSize: 12 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8592a0', fontSize: 11 }} tickFormatter={(value) => value >= 100000 ? `₹${Math.round(value / 100000)}L` : value >= 1000 ? `₹${Math.round(value / 1000)}k` : `₹${value}`} width={46} />
              <Tooltip formatter={(value) => [formatMoney(value), 'Collected']} contentStyle={{ borderRadius: 12, border: '1px solid #e6edf1', boxShadow: '0 8px 22px #16324f13' }} />
              <Area type="monotone" dataKey="total" stroke="#218a80" strokeWidth={2.5} fill="url(#collectionFill)" activeDot={{ r: 5, strokeWidth: 0, fill: '#218a80' }} />
            </AreaChart>
          </ResponsiveContainer>}
        </div>
        <div className="chart-bottom"><span><CircleDollarSign size={15} /> {data?.monthlyPayments?.reduce((sum, item) => sum + item.total, 0) ? formatMoney(data.monthlyPayments.reduce((sum, item) => sum + item.total, 0)) : formatMoney(0)} collected in this period</span><span className="subtle-copy">Based on recorded payments</span></div>
      </section>

      <section className="panel portfolio-panel">
        <div className="panel-heading"><div><div className="panel-kicker">PORTFOLIO MIX</div><h2>Loan status</h2><p>All recorded loan accounts</p></div><div className="mini-donut"><CreditCard size={17} /></div></div>
        <div className="portfolio-total"><strong>{(data?.loanPortfolio || []).reduce((sum, item) => sum + item.count, 0)}</strong><span>Total loans</span></div>
        <div className="portfolio-bars">{['APPROVED', 'CLOSED', 'DEFAULTED'].map((status) => {
          const item = data?.loanPortfolio?.find((entry) => entry.status === status);
          const total = (data?.loanPortfolio || []).reduce((sum, entry) => sum + entry.count, 0) || 1;
          const pct = Math.round(((item?.count || 0) / total) * 100);
          return <div className="portfolio-row" key={status}><div className="portfolio-row-label"><span className={`portfolio-dot dot-${status.toLowerCase()}`} />{status === 'APPROVED' ? 'Active / approved' : status === 'CLOSED' ? 'Fully repaid' : 'Defaulted'}<strong>{item?.count || 0}</strong></div><div className="progress-track"><span className={`progress-fill fill-${status.toLowerCase()}`} style={{ width: `${pct}%` }} /></div></div>;
        })}</div>
        <button className="text-link portfolio-link" onClick={() => onNavigate('loans')}>Explore loan portfolio <ArrowRight size={15} /></button>
      </section>

      <section className="panel recent-panel">
        <div className="panel-heading"><div><div className="panel-kicker">LATEST ACTIVITY</div><h2>Recent repayments</h2><p>A live record of incoming payments</p></div><button className="text-link" onClick={() => onNavigate('repayments')}>View all <ArrowRight size={15} /></button></div>
        <div className="table-wrap"><table><thead><tr><th>Customer</th><th>Loan reference</th><th>Date</th><th className="numeric">Amount</th></tr></thead><tbody>
          {(data?.recentPayments || []).map((payment) => <tr key={payment.id}><td><div className="customer-cell"><span className="avatar avatar-small">{initials(payment.customer)}</span><strong>{payment.customer}</strong></div></td><td><span className="reference-text">{payment.loanId ? `LN-${String(payment.loanId).slice(-6).toUpperCase()}` : '—'}</span></td><td className="date-cell">{formatDate(payment.date)}</td><td className="numeric amount-cell">{formatMoney(payment.amount)}</td></tr>)}
          {!loading && (!data?.recentPayments || data.recentPayments.length === 0) && <tr><td colSpan="4"><div className="table-empty">No repayments recorded yet.</div></td></tr>}
          </tbody></table></div>
      </section>
    </div>
    <div className="dashboard-footnote"><span><ArrowDownRight size={14} /></span> Portfolio figures update when your records change. Demo data is illustrative, not real financial advice.</div>
  </div>;
}
