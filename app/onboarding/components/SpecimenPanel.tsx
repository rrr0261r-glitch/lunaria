'use client';
import type { ReactNode } from 'react';
import styles from '../onboarding.module.css';

interface SpecimenPanelProps {
  children: ReactNode;
  /** trueのときフェードイン表示。標本ラベルの枠。 */
  visible: boolean;
}

/**
 * 標本ラベルの枠 — 二重罫・象牙地94%・柔らかい影。
 * オンボーディングの詩+生年月日入力と、今後の鑑定文表示の両方で使う共通コンポーネント。
 */
export function SpecimenPanel({ children, visible }: SpecimenPanelProps) {
  return (
    <div className={styles.panel} data-visible={visible} style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}>
      {children}
    </div>
  );
}
