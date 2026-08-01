export default function Header() {
  return (
    <header className="site-header">
      <a href="/" className="header-logo">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="7.2" stroke="#D4AF37" strokeWidth=".5"/>
          <circle cx="8" cy="8" r="3.8" stroke="#D4AF37" strokeWidth=".35" strokeDasharray="1.3 1.3"/>
          <circle cx="8" cy="8" r="1" fill="#D4AF37"/>
          <line x1="8" y1=".8"   x2="8"    y2="2.8"  stroke="#D4AF37" strokeWidth=".5"/>
          <line x1="8" y1="13.2" x2="8"    y2="15.2" stroke="#D4AF37" strokeWidth=".5"/>
          <line x1=".8"  y1="8"  x2="2.8"  y2="8"    stroke="#D4AF37" strokeWidth=".5"/>
          <line x1="13.2" y1="8" x2="15.2" y2="8"    stroke="#D4AF37" strokeWidth=".5"/>
        </svg>
        LUNARIA
      </a>
      <nav className="header-nav">
        <a href="/">今日</a>
        <a href="/calendar">暦</a>
        <a href="/chart">出生図</a>
      </nav>
    </header>
  )
}