import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const useCountdown = (initialTime: TimeLeft, onTimeEnd?: () => void) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(initialTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        const totalSeconds = 
          prevTime.days * 24 * 60 * 60 +
          prevTime.hours * 60 * 60 +
          prevTime.minutes * 60 +
          prevTime.seconds;

        if (totalSeconds <= 1) {
          clearInterval(timer);
          onTimeEnd?.();
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        const newTotalSeconds = totalSeconds - 1;
        return {
          days: Math.floor(newTotalSeconds / (24 * 60 * 60)),
          hours: Math.floor((newTotalSeconds % (24 * 60 * 60)) / (60 * 60)),
          minutes: Math.floor((newTotalSeconds % (60 * 60)) / 60),
          seconds: newTotalSeconds % 60
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeEnd]);

  const formatTime = (time: number): string => {
    return time.toString().padStart(2, '0');
  };

  return { timeLeft, formatTime };
};