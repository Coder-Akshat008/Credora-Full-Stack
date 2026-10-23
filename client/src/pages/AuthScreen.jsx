import { useState } from 'react';
import { ArrowUpRight, BarChart3, ShieldCheck, Sparkles, WalletCards } from 'lucide-react';
import { api, jsonRequest } from '../lib/api.js';

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const payload = mode === 'register' ? { name, email, password } : { email, password };
      const result = await api(`/auth/${mode}`, jsonRequest('POST', payload));
      localStorage.setItem('credora_token', result.token);
      localStorage.setItem('credora_user', JSON.stringify(result.user));
      onAuthenticated(result.user);
    } catch (exception) {
      setError(exception.message);
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-screen">
    <section className="auth-showcase">
      <div className="auth-brand"><span className="brand-symbol"><WalletCards size={23} /></span><span>credora<span className="brand-dot">.</span></span></div>
      <div className="showcase-copy">
        <div className="showcase-kicker"><Sparkles size={14} /> LENDING OPERATIONS, REIMAGINED</div>
        <h1>Clarity for every<br /><em>financial decision.</em></h1>
        <p>One calm workspace for customer records, loan servicing, repayment tracking, and early risk signals.</p>
        <div className="showcase-points">
          <div><span><BarChart3 size={17} /></span><div><strong>Portfolio visibility</strong><small>See the numbers that matter, at a glance.</small></div></div>
          <div><span><ShieldCheck size={17} /></span><div><strong>Responsible operations</strong><small>Keep repayments and risk follow-ups organised.</small></div></div>
        </div>
      </div>
      <div className="showcase-footer"><span>BUILT FOR BETTER LENDING</span><span>DEMO WORKSPACE · 2026</span></div>
      <div className="auth-orb auth-orb-one" /><div className="auth-orb auth-orb-two" />
    </section>
    <section className="auth-panel">
      <div className="auth-form-wrap">
        <div className="mobile-auth-brand"><span className="brand-symbol"><WalletCards size={22} /></span><span>credora<span className="brand-dot">.</span></span></div>
        <div className="auth-heading"><span className="mini-label">YOUR OPERATIONS HUB</span><h2>{mode === 'login' ? 'Welcome back' : 'Create your workspace'}</h2><p>{mode === 'login' ? 'Sign in to continue to your lending dashboard.' : 'Set up an account to start managing the demo portfolio.'}</p></div>
        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && <label>Full name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Akshat Thakur" minLength={2} required /></label>}
          <label>Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required /></label>
          <label>Password<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" minLength={8} required /></label>
          {error && <div className="inline-error" role="alert">{error}</div>}
          <button type="submit" className="btn btn-primary auth-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in to Credora' : 'Create account'}<ArrowUpRight size={17} /></button>
        </form>
        <div className="auth-switch">{mode === 'login' ? 'New to Credora?' : 'Already have an account?'} <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} type="button">{mode === 'login' ? 'Create account' : 'Sign in'}</button></div>
        <div className="auth-security"><ShieldCheck size={16} /><span>Password-protected access · Token-based sessions</span></div>
      </div>
    </section>
  </main>;
}
