'use client';
import { MoodCircle } from '../components/MoodCircle';

export default function MoodTestPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 130% 95% at 50% 32%, #F5F0E4 0%, #EEE6D4 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 40,
    }}>
      <MoodCircle />
    </div>
  );
}