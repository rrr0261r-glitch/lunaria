'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './onboarding.module.css';
import { TIMING, type Phase } from '@/lib/onboarding-timing';
import { useReducedMotion } from '@/lib/use-reduced-motion';

import { AtlasBackground } from './components/AtlasBackground';
import { PressedFlowers } from './components/PressedFlowers';
import { Moonlight } from './components/Moonlight';
import { PoeticPanel } from './components/PoeticPanel';
import { PageTurn } from './components/PageTurn';

export default function OnboardingPage() {
  const [phase, setPhase] = useState<Phase>('silent');
  const reducedMotion = useReducedMotion();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const skippedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (reducedMotion) {
      setPhase('inked');
      return;
    }
    const at = (ms: number, fn: () => void) => {
      timers.current.push(setTimeout(fn, ms));
    };
    at(TIMING.moonlightStart,  () => setPhase('moonlit'));
    at(TIMING.resurfaceStart,  () => setPhase('resurfaced'));
    at(TIMING.titleStart,      () => setPhase('titled'));
    at(TIMING.inkedStart,      () => setPhase('inked'));
    return () => timers.current.forEach(clearTimeout);
  }, [reducedMotion]);

  function handleSkip(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('[data-no-skip]')) return;
    if (skippedRef.current || phase === 'turning') return;
    skippedRef.current = true;
    timers.current.forEach(clearTimeout);
    setPhase('inked');
  }

  function handleSubmit(star: string, _birthInfo: any) {
    setPhase('turning');
    setTimeout(() => {
      router.push(`/result/${encodeURIComponent(star)}`);
    }, 1000);
  }

  return (
    <div className={styles.root} data-phase={phase} onClick={handleSkip}>
      <div className={styles.book}>
        <AtlasBackground />
        <PressedFlowers />
        <Moonlight />
        <div data-no-skip>
          <PoeticPanel phase={phase} onSubmit={handleSubmit} />
        </div>
      </div>
      <PageTurn />
    </div>
  );
}