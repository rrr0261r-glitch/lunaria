'use client';

import { useEffect, useRef } from 'react';

export default function LunariaBackdrop({ opacity = 1 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let t = 0;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // ── ベース：早朝の湖、霞がかった空気
      const base = ctx.createLinearGradient(0, 0, 0, h);
      base.addColorStop(0,   '#2C3440'); // 空の深み（森の上）
      base.addColorStop(0.3, '#3D4A52'); // 水平線
      base.addColorStop(0.6, '#8A9BA8'); // 湖面
      base.addColorStop(1,   '#C4BFB4'); // 手前の光
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);

      // ── 水面の揺らぎ：光の反射
      const rippleY = h * 0.58;
      for (let i = 0; i < 5; i++) {
        const phase = t * 0.0008 + i * 0.7;
        const x = w * (0.2 + i * 0.15 + Math.sin(phase) * 0.04);
        const ry = rippleY + Math.sin(t * 0.001 + i) * 6;
        const rw = w * (0.08 + Math.sin(phase * 0.7) * 0.02);
        const rh = rw * 0.18;

        const rippleGrad = ctx.createRadialGradient(x, ry, 0, x, ry, rw);
        rippleGrad.addColorStop(0,   'rgba(255,248,235,0.22)');
        rippleGrad.addColorStop(0.4, 'rgba(220,210,190,0.10)');
        rippleGrad.addColorStop(1,   'rgba(220,210,190,0)');

        ctx.save();
        ctx.scale(1, rh / rw);
        ctx.beginPath();
        ctx.arc(x, ry * (rw / rh), rw, 0, Math.PI * 2);
        ctx.fillStyle = rippleGrad;
        ctx.fill();
        ctx.restore();
      }

      // ── 光源：水平線の光（夜明け・夕暮れ）
      const sunY = h * 0.38 + Math.sin(t * 0.0003) * 4;
      const sunX = w * 0.62;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, w * 0.45);
      sunGrad.addColorStop(0,   'rgba(255,240,210,0.28)');
      sunGrad.addColorStop(0.3, 'rgba(240,220,180,0.12)');
      sunGrad.addColorStop(0.7, 'rgba(200,190,170,0.05)');
      sunGrad.addColorStop(1,   'rgba(200,190,170,0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, w, h);

      // ── 絹のような光の帯：斜めに流れる
      ctx.save();
      ctx.globalAlpha = 0.06 + Math.sin(t * 0.0005) * 0.02;
      const silkGrad = ctx.createLinearGradient(0, h * 0.2, w, h * 0.8);
      silkGrad.addColorStop(0,   'rgba(255,252,240,0)');
      silkGrad.addColorStop(0.4, 'rgba(255,252,240,0.8)');
      silkGrad.addColorStop(0.6, 'rgba(255,252,240,0.8)');
      silkGrad.addColorStop(1,   'rgba(255,252,240,0)');
      ctx.fillStyle = silkGrad;
      ctx.beginPath();
      ctx.moveTo(w * 0.1, 0);
      ctx.lineTo(w * 0.5, 0);
      ctx.lineTo(w * 0.9, h);
      ctx.lineTo(w * 0.5, h);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // ── 霞：空気感
      const mistGrad = ctx.createLinearGradient(0, h * 0.3, 0, h * 0.7);
      mistGrad.addColorStop(0,   'rgba(200,210,215,0)');
      mistGrad.addColorStop(0.5, 'rgba(200,210,215,0.08)');
      mistGrad.addColorStop(1,   'rgba(200,210,215,0)');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, 0, w, h);

      // ── 手前の暗み（没入感）
      const vigGrad = ctx.createRadialGradient(w/2, h/2, h*0.2, w/2, h/2, h*0.9);
      vigGrad.addColorStop(0,   'rgba(0,0,0,0)');
      vigGrad.addColorStop(1,   'rgba(10,12,18,0.45)');
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, w, h);

      t++;
      animFrame = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity,
      }}
    />
  );
}