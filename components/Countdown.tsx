
import React, { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: string;
}

export const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    // We construct the date using arguments to ensure it treats it as local time midnight
    // Input format expected: YYYY-MM-DD
    if (!targetDate) return null;
    
    const [year, month, day] = targetDate.split('-').map(Number);
    // Month is 0-indexed in JS Date
    const target = new Date(year, month - 1, day);
    const now = new Date();
    
    const difference = +target - +now;
    
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
      return timeLeft;
    }
    
    // Date passed
    return null;
  };

  const [timeLeft, setTimeLeft] = useState<any>(calculateTimeLeft());
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!hasMounted) return null;

  if (!timeLeft) {
    return (
      <div className="text-center animate-bounce-slow py-6">
        <div className="inline-block p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
            <div className="text-3xl md:text-5xl font-bold text-party-300 drop-shadow-sm font-script">
            🎉 Happy Birthday! 🎂
            </div>
            <p className="text-white/80 mt-2">Today is the big day!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
        <p className="text-white/70 uppercase tracking-widest text-xs font-bold mb-4">Countdown to Celebration</p>
        <div className="flex justify-center flex-wrap gap-3 md:gap-6">
            {Object.keys(timeLeft).map((interval) => {
                const value = timeLeft[interval];
                return (
                <div key={interval} className="flex flex-col items-center">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-white/10 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/20 flex items-center justify-center text-white font-bold text-2xl md:text-4xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
                        <span className="relative z-10 font-mono drop-shadow-md">{value < 10 ? `0${value}` : value}</span>
                    </div>
                    <span className="text-[10px] md:text-xs text-party-300 uppercase mt-2 font-bold tracking-widest">{interval}</span>
                </div>
                );
            })}
        </div>
    </div>
  );
};
