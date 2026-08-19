'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/',           label: '今日',   en: 'TODAY', mark: '○' },
  { href: '/calendar',   label: '暦',     en: 'CALENDAR', mark: '◐' },
  { href: '/fortune',    label: '星読み', en: 'FORTUNE', mark: '✦' },
  { href: '/reflection', label: '振り返り', en: 'REFLECT', mark: '◇' },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/result') ||
    pathname.startsWith('/intro')
  ) {
    return null;
  }

  return (
    <nav className="app-bottom-nav" aria-label="メインナビゲーション">
      {LINKS.map(l => {
        const active =
          pathname === l.href ||
          (l.href !== '/' && pathname.startsWith(l.href));
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`app-bottom-link ${active ? 'active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <span className="app-bottom-mark" aria-hidden="true">{l.mark}</span>
            <span className="app-bottom-label">
              {l.label}
            </span>
            <span className="app-bottom-en">
              {l.en}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
