import React, { useState, useEffect } from 'react';
import { Clock, Moon, Sun, Globe2, Sparkles, Calendar as CalendarIcon, Compass, Timer } from 'lucide-react';
import { ThemeMode } from '../types';
import { pad2, toPersianDigits, convertFromGregorian } from '../utils/dateConverters';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  activeSection,
  onSelectSection
}) => {
  const [utcTime, setUtcTime] = useState('');
  const [todaySolarStr, setTodaySolarStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const uHours = pad2(now.getUTCHours());
      const uMinutes = pad2(now.getUTCMinutes());
      const uSeconds = pad2(now.getUTCSeconds());
      setUtcTime(`${uHours}:${uMinutes}:${uSeconds}`);

      const conv = convertFromGregorian(now.getFullYear(), now.getMonth() + 1, now.getDate());
      setTodaySolarStr(`${conv.dayOfWeek.nameFa} ${toPersianDigits(conv.jalali.day)} ${conv.jalaliMonthName} ${toPersianDigits(conv.jalali.year)}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'hero-clock', label: 'ساعت و زمان', icon: Clock },
    { id: 'world-grid', label: 'ساعت جهانی', icon: Globe2 },
    { id: 'converter', label: 'مبدل تاریخ', icon: CalendarIcon },
    { id: 'calendar', label: 'تقویم ماهانه', icon: Sparkles },
    { id: 'prayer-times', label: 'اوقات شرعی', icon: Compass },
    { id: 'time-tools', label: 'کرنومتر و تایمر', icon: Timer },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto backdrop-blur-xl border border-white/10 dark:border-slate-800/80 rounded-2xl bg-white/70 dark:bg-slate-900/70 shadow-lg dark:shadow-2xl shadow-purple-500/5 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectSection('hero-clock')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-md shadow-violet-500/20">
            <div className="w-full h-full rounded-[10px] bg-slate-950 dark:bg-slate-950 flex items-center justify-center">
              <Clock className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-400 opacity-40 blur-sm -z-10" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="hidden sm:block text-base sm:text-lg font-bold bg-gradient-to-l from-violet-400 via-indigo-300 to-cyan-400 dark:from-violet-400 dark:via-indigo-300 dark:to-cyan-300 bg-clip-text text-transparent">
                سامانه ساعت و تقویم
              </h1>
              <span className="text-[10px] font-semibold font-mono tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                0003
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              {todaySolarStr}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/60 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 text-xs font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => onSelectSection(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-600/30 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right side controls: UTC Chip + Dark/Light Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live UTC Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans font-medium">UTC:</span>
            <span dir="ltr" style={{ direction: 'ltr' }} className="font-semibold text-cyan-600 dark:text-cyan-400 tracking-wider">{utcTime || '00:00:00'}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label="تغییر حالت شب و روز"
            className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 transition-all duration-300 shadow-sm hover:scale-105 active:scale-95"
            title={theme === 'dark' ? 'حالت روز' : 'حالت شب'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-violet-600 transition-transform -rotate-12 hover:rotate-0" />
            )}
          </button>
        </div>

      </div>

      {/* Mobile Nav Bar */}
      <div className="flex md:hidden overflow-x-auto py-2 gap-1.5 scrollbar-none mt-2 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={`m-${item.id}`}
              id={`mobile-nav-${item.id}`}
              onClick={() => onSelectSection(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-violet-600 text-white font-medium shadow'
                  : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
