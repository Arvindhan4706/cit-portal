'use client';

import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

interface NumberTickerProps {
  value: number;
  duration?: number;
  suffix?: string;
}

export function NumberTicker({ value, duration = 2, suffix = '' }: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: duration,
      ease: "easeOut",
      onUpdate(val) {
        setDisplayValue(Math.round(val));
      }
    });
    return () => controls.stop();
  }, [value, duration]);

  return <span>{displayValue}{suffix}</span>;
}
