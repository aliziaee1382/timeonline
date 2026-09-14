import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Sparkles, Copy, Check, Clock3, Compass } from 'lucide-react';
import { toPersianDigits, pad2, convertFromGregorian } from '../utils/dateConverters';

export const HeroClock: React.FC = () => {
  const [timeState, setTimeState] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });

  const [dateInfo, setDateInfo] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [usePersianDigitsInClock, setUsePersianDigitsInClock] = useState(true);

  // Smooth continuous analog sweep using requestAnimationFrame
  const reqRef = useRef<number | null>(null);
  const [smoothSeconds, setSmoothSeconds] = useState(0);

  useEffect(() => {
    const updateSmooth = () => {
      const now = new Date();
      const ms = now.getMilliseconds();
      const s = now.getSeconds();
      const m = now.getMinutes();
      const h = now.getHours();

      setTimeState({
        hours: h,
        minutes: m,
        seconds: s,
        milliseconds: ms,
      });

      setSmoothSeconds(s + ms / 1000);
      reqRef.current = requestAnimationFrame(updateSmooth);
    };

    reqRef.current = requestAnimationFrame(updateSmooth);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, []);

  // Update date conversions once per second or when minute changes
  useEffect(() => {
    const now = new Date();
    const conv = convertFromGregorian(now.getFullYear(), now.getMonth() + 1, now.getDate());
    setDateInfo(conv);

    const interval = setInterval(() => {
      const n = new Date();
      const c = convertFromGregorian(n.getFullYear(), n.getMonth() + 1, n.getDate());
      setDateInfo(c);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const { hours, minutes, seconds } = timeState;
  const isDay = hours >= 6 && hours < 18;

  // Angles for analog clock
  const secAngle = (smoothSeconds / 60) * 360;
  const minAngle = ((minutes + seconds / 60) / 60) * 360;
  const hourAngle = (((hours % 12) + minutes / 60) / 12) * 360;

  const copyTimeString = () => {
    const timeStr = `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
    navigator.clipboard?.writeText(timeStr);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <section id="hero-clock" className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-2xl bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-950/80 dark:from-slate-900/90 dark:via-slate-950/90 dark:to-[#090d16] light:from-white/90 light:via-slate-50/90 light:to-slate-100/90 border border-violet-500/20 dark:border-violet-500/15 shadow-2xl p-6 sm:p-8 md:p-12">
        
        {/* Ambient Glow in the background */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column (Digital Display & Dates) */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-right space-y-6">
            
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 dark:bg-violet-500/15 border border-violet-500/30 text-violet-600 dark:text-violet-300 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span>زمان رسمی و هماهنگ ایران و جهان</span>
              <span className="text-slate-400 dark:text-slate-500">|</span>
              <div className="flex items-center gap-1">
                {isDay ? (
                  <span className="flex items-center gap-1 text-amber-500 dark:text-amber-400 text-[11px]">
                    <Sun className="w-3 h-3" /> روز
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-indigo-400 text-[11px]">
                    <Moon className="w-3 h-3" /> شب
                  </span>
                )}
              </div>
            </div>

            {/* Main Digital Clock Display */}
            <div className="flex flex-col items-center lg:items-start">
              <div 
                id="digital-clock-display"
                onClick={copyTimeString}
                className="group relative cursor-pointer select-none"
                title="کلیک برای کپی زمان"
              >
                <div 
                  dir="ltr"
                  style={{ direction: 'ltr' }}
                  className="flex items-baseline justify-center lg:justify-start font-mono tracking-tight font-extrabold text-5xl sm:text-7xl md:text-8xl bg-gradient-to-b from-white via-slate-100 to-slate-400 dark:from-white dark:via-slate-100 dark:to-slate-300 light:from-slate-900 light:via-slate-800 light:to-slate-700 bg-clip-text text-transparent drop-shadow-sm"
                >
                  <span>{usePersianDigitsInClock ? toPersianDigits(pad2(hours)) : pad2(hours)}</span>
                  <span className="mx-1 text-cyan-400/80 animate-pulse font-sans">:</span>
                  <span>{usePersianDigitsInClock ? toPersianDigits(pad2(minutes)) : pad2(minutes)}</span>
                  <span className="mx-1 text-cyan-400/80 animate-pulse font-sans">:</span>
                  <span className="text-violet-400 dark:text-violet-400">
                    {usePersianDigitsInClock ? toPersianDigits(pad2(seconds)) : pad2(seconds)}
                  </span>
                </div>

                {/* Micro tooltip / copy button */}
                <div className="absolute -top-3 -left-6 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-800/90 text-slate-200 text-[10px] px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1 pointer-events-none">
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" /> کپی شد
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" /> کپی
                    </>
                  )}
                </div>
              </div>

              {/* Digits format toggle */}
              <button
                id="toggle-digits-format-btn"
                onClick={() => setUsePersianDigitsInClock(!usePersianDigitsInClock)}
                className="mt-2 text-xs text-slate-500 hover:text-cyan-400 dark:text-slate-400 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>نمایش ارقام: {usePersianDigitsInClock ? 'فارسی (۱۲:۳۴)' : 'لاتین (12:34)'}</span>
              </button>
            </div>

            {/* Real-time Triple Date Badges */}
            {dateInfo && (
              <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* Solar Hijri */}
                <div className="p-3.5 rounded-2xl bg-slate-800/40 dark:bg-slate-800/50 light:bg-white/80 border border-violet-500/20 dark:border-violet-500/20 shadow-sm flex flex-col justify-between text-right">
                  <div className="flex items-center justify-between text-[11px] text-violet-400 font-medium mb-1">
                    <span>گاه‌شمار خورشیدی</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-500/10">هجری شمسی</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                    {dateInfo.dayOfWeek.nameFa}، {toPersianDigits(dateInfo.jalali.day)} {dateInfo.jalaliMonthName}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    سال {toPersianDigits(dateInfo.jalali.year)} {dateInfo.isJalaliLeap ? '(کبیسه)' : ''}
                  </div>
                </div>

                {/* Gregorian */}
                <div className="p-3.5 rounded-2xl bg-slate-800/40 dark:bg-slate-800/50 light:bg-white/80 border border-cyan-500/20 dark:border-cyan-500/20 shadow-sm flex flex-col justify-between text-right">
                  <div className="flex items-center justify-between text-[11px] text-cyan-400 font-medium mb-1">
                    <span>گاه‌شمار میلادی</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10">Gregorian</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                    {dateInfo.gregorian.day} {dateInfo.gregorianMonthName}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {dateInfo.gregorian.year} {dateInfo.isGregorianLeap ? '(Leap)' : ''}
                  </div>
                </div>

                {/* Islamic Lunar */}
                <div className="p-3.5 rounded-2xl bg-slate-800/40 dark:bg-slate-800/50 light:bg-white/80 border border-emerald-500/20 dark:border-emerald-500/20 shadow-sm flex flex-col justify-between text-right">
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 font-medium mb-1">
                    <span>گاه‌شمار قمری</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10">هجری قمری</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                    {toPersianDigits(dateInfo.hijri.day)} {dateInfo.hijriMonthName}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    سال {toPersianDigits(dateInfo.hijri.year)} هـ.ق
                  </div>
                </div>
              </div>
            )}

            {/* Day of Year Progress */}
            {dateInfo && (
              <div className="w-full pt-1">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Clock3 className="w-3.5 h-3.5 text-violet-400" />
                    روز {toPersianDigits(dateInfo.dayOfYearJalali)} از سال جاری
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {toPersianDigits(dateInfo.daysRemainingJalali)} روز باقی‌مانده تا سال تحویل
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${(dateInfo.dayOfYearJalali / (dateInfo.isJalaliLeap ? 366 : 365)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Sleek 3D-styled SVG Analog Chronometer */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 flex items-center justify-center">
              
              {/* Outer Glow Halo */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-600/30 via-indigo-500/15 to-cyan-400/25 blur-xl pointer-events-none" />

              {/* Analog SVG Face */}
              <svg
                id="analog-clock-svg"
                viewBox="0 0 300 300"
                className="w-full h-full drop-shadow-2xl select-none"
              >
                <defs>
                  {/* Outer Bezel Gradients */}
                  <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="50%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#020617" />
                  </linearGradient>

                  <linearGradient id="ringGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
                  </linearGradient>

                  <linearGradient id="secondHandGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>

                  <filter id="handShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="1" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
                  </filter>
                  <filter id="secondGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#06b6d4" floodOpacity="0.9" />
                  </filter>
                </defs>

                {/* Dial Base */}
                <circle cx="150" cy="150" r="142" fill="url(#bezelGrad)" stroke="#334155" strokeWidth="2.5" />
                <circle cx="150" cy="150" r="138" fill="none" stroke="url(#ringGlow)" strokeWidth="1.2" strokeDasharray="3 4" opacity="0.6" />
                <circle cx="150" cy="150" r="130" fill="none" stroke="#1e293b" strokeWidth="1" />

                {/* Minute / Second Tick marks */}
                {Array.from({ length: 60 }).map((_, i) => {
                  const isHour = i % 5 === 0;
                  const angle = (i * 6) * (Math.PI / 180);
                  const innerR = isHour ? 116 : 124;
                  const outerR = 128;
                  const x1 = 150 + innerR * Math.sin(angle);
                  const y1 = 150 - innerR * Math.cos(angle);
                  const x2 = 150 + outerR * Math.sin(angle);
                  const y2 = 150 - outerR * Math.cos(angle);

                  return (
                    <line
                      key={`tick-${i}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isHour ? (i % 15 === 0 ? '#06b6d4' : '#94a3b8') : '#475569'}
                      strokeWidth={isHour ? (i % 15 === 0 ? 2.5 : 2) : 1}
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* Hour Numbers (12, 3, 6, 9) */}
                <text x="150" y="52" textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="bold" fontFamily="Vazirmatn, sans-serif">۱۲</text>
                <text x="248" y="155" textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="bold" fontFamily="Vazirmatn, sans-serif">۳</text>
                <text x="150" y="258" textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="bold" fontFamily="Vazirmatn, sans-serif">۶</text>
                <text x="52" y="155" textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="bold" fontFamily="Vazirmatn, sans-serif">۹</text>

                {/* Subdial decorative ring */}
                <circle cx="150" cy="150" r="45" fill="none" stroke="#334155" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.5" />
                <circle cx="150" cy="190" r="18" fill="#0f172a" stroke="#334155" strokeWidth="0.8" opacity="0.7" />
                <text x="150" y="194" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="JetBrains Mono, monospace">SEC</text>

                {/* Hour Hand */}
                <g transform={`rotate(${hourAngle} 150 150)`} filter="url(#handShadow)">
                  <polygon
                    points="146,150 148,80 150,72 152,80 154,150 152,165 148,165"
                    fill="#e2e8f0"
                  />
                  <line x1="150" y1="90" x2="150" y2="145" stroke="#94a3b8" strokeWidth="1.2" />
                </g>

                {/* Minute Hand */}
                <g transform={`rotate(${minAngle} 150 150)`} filter="url(#handShadow)">
                  <polygon
                    points="147,150 148.5,50 150,42 151.5,50 153,150 151.5,170 148.5,170"
                    fill="#cbd5e1"
                  />
                  <line x1="150" y1="58" x2="150" y2="145" stroke="#8b5cf6" strokeWidth="1.5" />
                </g>

                {/* Smooth Continuous Second Hand */}
                <g transform={`rotate(${secAngle} 150 150)`} filter="url(#secondGlow)">
                  <line x1="150" y1="180" x2="150" y2="30" stroke="url(#secondHandGrad)" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="150" cy="40" r="3.5" fill="#06b6d4" />
                  <line x1="150" y1="150" x2="150" y2="182" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
                </g>

                {/* Central Cap & Pivot */}
                <circle cx="150" cy="150" r="7" fill="#0f172a" stroke="#06b6d4" strokeWidth="2.5" />
                <circle cx="150" cy="150" r="3" fill="#ec4899" />
              </svg>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
