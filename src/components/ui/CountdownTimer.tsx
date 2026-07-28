'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  days: number;
}

function getTimeLeft(endTime: string): TimeLeft {
  const diff = new Date(endTime).getTime() - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export default function CountdownTimer({
  endTime,
  onExpired,
  size = 'md',
}: {
  endTime: string;
  onExpired?: () => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(endTime));
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const t = getTimeLeft(endTime);
      setTimeLeft(t);

      if (t.days === 0 && t.hours === 0 && t.minutes === 0 && t.seconds === 0) {
        setExpired(true);
        clearInterval(interval);
        onExpired?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onExpired]);

  if (expired) {
    return <span className="text-xs font-medium text-red-500">Sale ended</span>;
  }

  const sizes = {
    sm: { box: 'text-sm px-1.5 py-0.5', label: 'text-[9px]' },
    md: { box: 'text-base px-2 py-1', label: 'text-[10px]' },
    lg: { box: 'text-2xl px-3 py-2', label: 'text-xs' },
  };

  const s = sizes[size];

  const units =
    timeLeft.days > 0
      ? [
          { value: timeLeft.days, label: 'Days' },
          { value: timeLeft.hours, label: 'Hrs' },
          { value: timeLeft.minutes, label: 'Min' },
          { value: timeLeft.seconds, label: 'Sec' },
        ]
      : [
          { value: timeLeft.hours, label: 'Hrs' },
          { value: timeLeft.minutes, label: 'Min' },
          { value: timeLeft.seconds, label: 'Sec' },
        ];

  return (
    <div className="flex items-center gap-1">
      <Clock className={`${size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5'} text-current`} />
      <div className="flex items-center gap-1">
        {units.map((unit, i) => (
          <div key={unit.label} className="flex items-center gap-1">
            <div className="flex flex-col items-center">
              <span
                className={`${s.box} min-w-[2ch] rounded bg-current/10 text-center font-bold tabular-nums`}
              >
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className={`${s.label} text-current/70`}>{unit.label}</span>
            </div>
            {i < units.length - 1 && <span className="mb-3 font-bold">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
