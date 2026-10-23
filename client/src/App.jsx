import { useEffect, useState } from 'react';
import { Activity, Bell, ChevronDown, CircleHelp, Command, CreditCard, LayoutDashboard, LogOut, Menu, Search, ShieldAlert, UsersRound, WalletCards, X } from 'lucide-react';
import AuthScreen from './pages/AuthScreen.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Customers from './pages/Customers.jsx';
import Loans from './pages/Loans.jsx';
import Repayments from './pages/Repayments.jsx';
import Risks from './pages/Risks.jsx';

const navigation = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, section: 'WORKSPACE' },
  { id: 'customers', label: 'Customers', icon: UsersRound },
  { id: 'loans', label: 'Loan portfolio', icon: CreditCard },
  { id: 'repayments', label: 'Repayments', icon: WalletCards, section: 'SERVICING' },
  { id: 'risks', label: 'Risk monitor', icon: ShieldAlert, alert: true }
];
const pageNames = { dashboard: 'Overview', customers: 'Customer directory', loans: 'Loan portfolio', repayments: 'Repayment centre', risks: 'Risk monitor' };

function readUser() {
  try { return JSON.parse(localStorage.getItem('credora_user') || 'null'); } catch { return null; }
}

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem('credora_token') ? readUser() : null);
  const [active, setActive] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  function notify(message, type = 'success') {
    setToast({ message, type, key: Date.now() });
  }
  function logout() {
    localStorage.removeItem('credora_token');
    localStorage.removeItem('credora_user');
    setUser(null); setProfileOpen(false); setActive('dashboard');
  }
  function navigate(id) { setActive(id); setMobileNavOpen(false); }

  useEffect(() => {
    const handler = () => { setUser(null); setActive('dashboard'); };
    window.addEventListener('credora:unauthorized', handler);
    return () => window.removeEventListener('credora:unauthorized', handler);
  }, []);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!user) return <AuthScreen onAuthenticated={(nextUser) => { setUser(nextUser); setActive('dashboard'); }} />;

  const contentProps = { onToast: notify };
  return <div className="app-shell">
    {mobileNavOpen && <button className="mobile-nav-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
    <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand"><span className="brand-symbol"><WalletCards size={21} /></span><span>credora<span className="brand-dot">.</span></span><button className="sidebar-close icon-button" aria-label="Close menu" onClick={() => setMobileNavOpen(false)}><X size={18} /></button></div>
      <div className="workspace-switcher"><span className="workspace-avatar">C</span><span className="workspace-name"><strong>Credora Finance</strong><small>Operations workspace</small></span><ChevronDown size={14} /></div>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {navigation.map((item) => <div key={item.id}>
          {item.section && <div className="nav-section-label">{item.section}</div>}
          <button className={`nav-item ${active === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)} aria-current={active === item.id ? 'page' : undefined}>
            <item.icon size={18} strokeWidth={1.8} /><span>{item.label}</span>{item.alert && <span className="nav-status-dot" />}
          </button>
        </div>)}
      </nav>
      <div className="sidebar-lower">
        <div className="sidebar-help"><div className="help-icon"><CircleHelp size={17} /></div><div><strong>Need a hand?</strong><span>Explore the project guide</span></div><button title="Open project guide" onClick={() => notify('See README.md in the project package for setup and demo instructions.', 'info')}><ChevronDown size={14} /></button></div>
        <div className="sidebar-footer"><div className="online-indicator" /> <span>System operational</span><span className="version-tag">v1.0</span></div>
      </div>
    </aside>

    <div className="app-main">
      <header className="topbar">
        <div className="topbar-left"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button><div className="breadcrumb"><span>Credora</span><span className="breadcrumb-slash">/</span><strong>{pageNames[active]}</strong></div></div>
        <div className="topbar-right"><div className="topbar-date"><span className="date-dot" /> SECURE WORKSPACE</div><button className="header-icon-button" title="Go to risk monitor" aria-label="Open risk monitor" onClick={() => navigate('risks')}><Bell size={18} /><span className="notification-mark" /></button><div className="topbar-divider" />
          <div className="profile-wrapper"><button className="profile-button" onClick={() => setProfileOpen((current) => !current)} aria-expanded={profileOpen}><span className="avatar profile-avatar">{(user.name || 'U').split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')}</span><span className="profile-words"><strong>{user.name || 'User'}</strong><small>Signed-in user</small></span><ChevronDown size={14} /></button>
            {profileOpen && <div className="profile-menu"><div className="profile-menu-heading">Signed in as<strong>{user.email}</strong></div><button onClick={logout}><LogOut size={15} /> Sign out</button></div>}
          </div>
        </div>
      </header>
      <main key={active} className="main-stage" onClick={() => profileOpen && setProfileOpen(false)}>
        {active === 'dashboard' && <Dashboard onNavigate={navigate} />}
        {active === 'customers' && <Customers {...contentProps} />}
        {active === 'loans' && <Loans {...contentProps} />}
        {active === 'repayments' && <Repayments {...contentProps} />}
        {active === 'risks' && <Risks {...contentProps} />}
        <footer className="app-footer"><span>© 2026 Credora Finance</span><span><ShieldAlert size={13} /> Demo workspace · Use synthetic data only</span><button onClick={() => notify('Credora is an educational full-stack demo, not a production lending platform.', 'info')}>About this demo <Activity size={13} /></button></footer>
      </main>
    </div>
    {toast && <div className={`toast toast-${toast.type}`} role="status"><span className="toast-icon">{toast.type === 'success' ? '✓' : toast.type === 'error' ? '!' : 'i'}</span><span>{toast.message}</span><button aria-label="Dismiss notification" onClick={() => setToast(null)}><X size={15} /></button></div>}
  </div>;
}
