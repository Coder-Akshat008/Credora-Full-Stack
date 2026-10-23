export default function StatusPill({ value }) {
  const key = String(value || '').toLowerCase().replaceAll('_', '-');
  const label = String(value || 'Unknown').toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  return <span className={`status-pill status-${key}`}>{label}</span>;
}
