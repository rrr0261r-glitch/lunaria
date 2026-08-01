import styles from '../onboarding.module.css';

/** 頁をめくる影 — 右から左へ柔らかく掃く */
export function PageTurn() {
  return <div className={styles.pageshadow} aria-hidden />;
}
