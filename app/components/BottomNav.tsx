'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/',           label: '今日',   en: 'TODAY' },
  { href: '/calendar',   label: '暦',     en: 'CALENDAR' },
  { href: '/fortune',    label: '星読み', en: 'FORTUNE' },
  { href: '/reflection', label: '振り返り', en: 'REFLECT' },
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
    <nav
      aria-label="メインナビゲーション"
      style={{
        position: 'fixed', bottom: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '100%', maxWidth: 560, zIndex: 100,
        display: 'flex',
        background: 'rgba(180,180,180,0.15)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.12)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {LINKS.map(l => {
        const active =
          pathname === l.href ||
          (l.href !== '/' && pathname.startsWith(l.href));
        return (
          <Link
            key={l.href}
            href={l.href}
            style={{
              flex: 1, padding: '12px 4px 10px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 5,
              textDecoration: 'none',
              position: 'relative',
            }}
          >
            {/* アクティブの上ライン */}
            <span style={{
              position: 'absolute', top: 0,
              width: 20, height: 2, borderRadius: 2,
              background: active ? '#8C816C' : 'transparent',
              transition: 'background .3s ease',
            }} />

            {/* 日本語ラベル（主役・読める大きさ） */}
            <span style={{
              fontFamily: "'Shippori Mincho', serif",
              fontSize: 13,
              letterSpacing: '0.1em',
              color: active ? '#5A5142' : '#A89B82',
              transition: 'color .3s ease',
              fontWeight: active ? 500 : 400,
            }}>
              {l.label}
            </span>

            {/* 英字（小さく添える・字間で品を出す） */}
            <span style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 7,
              letterSpacing: '0.25em',
              color: active ? '#8C816C' : '#CBBFA6',
              transition: 'color .3s ease',
              paddingLeft: '0.25em',
            }}>
              {l.en}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
