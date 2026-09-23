'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

export default function Counter({
  value,
  duration = 900,
}: {
  value: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  // Khởi tạo luôn bằng value thật để Server và Client khớp 100%, chống lỗi Hydration
  const [display, setDisplay] = useState(value);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Nếu người dùng bật giảm chuyển động hoặc đã animate rồi thì không chạy lại
    if (reduce || !inView || hasAnimated.current) return;

    hasAnimated.current = true;
    let frame = 0;
    const start = performance.now();
    setDisplay(0);

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduce, value, duration]);

  return (
    <span ref={ref} suppressHydrationWarning>
      {display.toLocaleString('en-US')}
    </span>
  );
}
