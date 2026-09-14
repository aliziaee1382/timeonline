import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeftRight, Calendar, Copy, Check, Sparkles, RefreshCw, Cake } from 'lucide-react';
import {
  PERSIAN_MONTH_NAMES,
  GREGORIAN_MONTH_NAMES_FA,
  GREGORIAN_MONTH_NAMES_EN,
  HIJRI_MONTH_NAMES_FA,
  toPersianDigits,
  convertFromJalali,
  convertFromGregorian,
  convertFromHijri,
  getJalaliMonthDays,
  getGregorianMonthDays,
  getHijriMonthDays
} from '../utils/dateConverters';
import { FullDateConversion } from '../types';

export const DateConverter: React.FC = () => {
  const [sourceMode, setSourceMode] = useState<'jalali' | 'gregorian' | 'hijri'>('jalali');

  // Input states
  const [jYear, setJYear] = useState(1405);
  const [jMonth, setJMonth] = useState(6);
  const [jDay, setJDay] = useState(24);

  const [gYear, setGYear] = useState(2026);
  const [gMonth, setGMonth] = useState(9);
  const [gDay, setGDay] = useState(14);

  const [hYear, setHYear] = useState(1448);
  const [hMonth, setHMonth] = useState(3);
  const [hDay, setHDay] = useState(2);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Initialize with current real date
  useEffect(() => {
    const today = new Date();
    const conv = convertFromGregorian(today.getFullYear(), today.getMonth() + 1, today.getDate());
    
    setGYear(today.getFullYear());
    setGMonth(today.getMonth() + 1);
    setGDay(today.getDate());

    setJYear(conv.jalali.year);
    setJMonth(conv.jalali.month);
    setJDay(conv.jalali.day);

    setHYear(conv.hijri.year);
    setHMonth(conv.hijri.month);
    setHDay(conv.hijri.day);
  }, []);

  // Compute conversion result based on sourceMode
  const result: FullDateConversion = useMemo(() => {
    if (sourceMode === 'jalali') {
      const maxDays = getJalaliMonthDays(jYear, jMonth);
      const safeDay = Math.min(jDay, maxDays);
      return convertFromJalali(jYear, jMonth, safeDay);
    } else if (sourceMode === 'gregorian') {
      const maxDays = getGregorianMonthDays(gYear, gMonth);
      const safeDay = Math.min(gDay, maxDays);
      return convertFromGregorian(gYear, gMonth, safeDay);
    } else {
      const maxDays = getHijriMonthDays(hYear, hMonth);
      const safeDay = Math.min(hDay, maxDays);
      return convertFromHijri(hYear, hMonth, safeDay);
    }
  }, [sourceMode, jYear, jMonth, jDay, gYear, gMonth, gDay, hYear, hMonth, hDay]);

  const setToday = () => {
    const today = new Date();
    const conv = convertFromGregorian(today.getFullYear(), today.getMonth() + 1, today.getDate());
    
    setGYear(today.getFullYear());
    setGMonth(today.getMonth() + 1);
    setGDay(today.getDate());

    setJYear(conv.jalali.year);
    setJMonth(conv.jalali.month);
    setJDay(conv.jalali.day);

    setHYear(conv.hijri.year);
    setHMonth(conv.hijri.month);
    setHDay(conv.hijri.day);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const calculateAge = (gy: number, gm: number, gd: number) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const birth = new Date(gy, gm - 1, gd);

    const diffTime = today.getTime() - birth.getTime();
    if (diffTime < 0) {
      const daysFuture = Math.ceil(Math.abs(diffTime) / (1000 * 60 * 60 * 24));
      return `${toPersianDigits(daysFuture)} روز در آینده`;
    }

    let years = today.getFullYear() - birth.getFullYear();
    let lastBirthday = new Date(birth.getFullYear() + years, birth.getMonth(), birth.getDate());

    if (today < lastBirthday) {
      years -= 1;
      lastBirthday = new Date(birth.getFullYear() + years, birth.getMonth(), birth.getDate());
    }

    const daysSinceLastBirthday = Math.floor((today.getTime() - lastBirthday.getTime()) / (1000 * 60 * 60 * 24));

    if (years === 0) {
      return `${toPersianDigits(daysSinceLastBirthday)} روز`;
    }

    if (daysSinceLastBirthday === 0) {
      return `${toPersianDigits(years)} سال تمام`;
    }

    return `${toPersianDigits(years)} سال و ${toPersianDigits(daysSinceLastBirthday)} روز`;
  };

  return (
    <section id="converter" className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
      <div className="rounded-2xl sm:rounded-3xl backdrop-blur-2xl bg-slate-900/70 dark:bg-slate-900/70 light:bg-white/80 border border-violet-500/20 dark:border-violet-500/20 light:border-slate-200 shadow-2xl p-3.5 sm:p-8 md:p-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/20">
                <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h2 className="text-base sm:text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                مبدل پیشرفته و چندجهته تاریخ
              </h2>
            </div>
            <p className="text-[11px] sm:text-sm text-slate-400 mt-1">
              تبدیل دقیق و آنی میان تقویم‌های هجری شمسی، میلادی و هجری قمری به همراه سال کبیسه
            </p>
          </div>

          <button
            onClick={setToday}
            className="flex items-center gap-1 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] sm:text-xs font-medium text-slate-200 border border-slate-700 transition-all self-start sm:self-auto"
          >
            <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
            <span>تنظیم به امروز</span>
          </button>
        </div>

        {/* Source Calendar Tabs */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 my-3 sm:my-6">
          <button
            onClick={() => setSourceMode('jalali')}
            className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-semibold transition-all ${
              sourceMode === 'jalali'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            گاه‌شمار شمسی (مبدأ)
          </button>
          <button
            onClick={() => setSourceMode('gregorian')}
            className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-semibold transition-all ${
              sourceMode === 'gregorian'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/25'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            گاه‌شمار میلادی (مبدأ)
          </button>
          <button
            onClick={() => setSourceMode('hijri')}
            className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-semibold transition-all ${
              sourceMode === 'hijri'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            گاه‌شمار قمری (مبدأ)
          </button>
        </div>

        {/* Input Controls - 3 columns on mobile for compact layout */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/40 dark:bg-slate-950/40 light:bg-slate-100 border border-slate-800/60 mb-4 sm:mb-8">
          {sourceMode === 'jalali' && (
            <>
              <div>
                <label className="block text-[10px] sm:text-xs text-slate-400 mb-1 font-medium">روز شمسی</label>
                <select
                  value={jDay}
                  onChange={(e) => setJDay(Number(e.target.value))}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-white text-slate-100 dark:text-slate-100 light:text-slate-900 border border-slate-700 text-xs sm:text-sm outline-none focus:border-violet-500"
                >
                  {Array.from({ length: getJalaliMonthDays(jYear, jMonth) }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {toPersianDigits(i + 1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs text-slate-400 mb-1 font-medium">ماه شمسی</label>
                <select
                  value={jMonth}
                  onChange={(e) => setJMonth(Number(e.target.value))}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-white text-slate-100 dark:text-slate-100 light:text-slate-900 border border-slate-700 text-xs sm:text-sm outline-none focus:border-violet-500"
                >
                  {PERSIAN_MONTH_NAMES.map((name, i) => (
                    <option key={i + 1} value={i + 1}>
                      {toPersianDigits(i + 1)} - {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs text-slate-400 mb-1 font-medium">سال شمسی</label>
                <input
                  type="number"
                  value={jYear}
                  onChange={(e) => setJYear(Number(e.target.value))}
                  min={1}
                  max={3000}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-white text-slate-100 dark:text-slate-100 light:text-slate-900 border border-slate-700 text-xs sm:text-sm outline-none focus:border-violet-500 font-mono"
                />
              </div>
            </>
          )}

          {sourceMode === 'gregorian' && (
            <>
              <div>
                <label className="block text-[10px] sm:text-xs text-slate-400 mb-1 font-medium">روز (Day)</label>
                <select
                  value={gDay}
                  onChange={(e) => setGDay(Number(e.target.value))}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-white text-slate-100 dark:text-slate-100 light:text-slate-900 border border-slate-700 text-xs sm:text-sm outline-none focus:border-cyan-500"
                >
                  {Array.from({ length: getGregorianMonthDays(gYear, gMonth) }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs text-slate-400 mb-1 font-medium">ماه (Month)</label>
                <select
                  value={gMonth}
                  onChange={(e) => setGMonth(Number(e.target.value))}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-white text-slate-100 dark:text-slate-100 light:text-slate-900 border border-slate-700 text-xs sm:text-sm outline-none focus:border-cyan-500"
                >
                  {GREGORIAN_MONTH_NAMES_EN.map((name, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} - {name} ({GREGORIAN_MONTH_NAMES_FA[i]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs text-slate-400 mb-1 font-medium">سال (Year)</label>
                <input
                  type="number"
                  value={gYear}
                  onChange={(e) => setGYear(Number(e.target.value))}
                  min={622}
                  max={3500}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-white text-slate-100 dark:text-slate-100 light:text-slate-900 border border-slate-700 text-xs sm:text-sm outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </>
          )}

          {sourceMode === 'hijri' && (
            <>
              <div>
                <label className="block text-[10px] sm:text-xs text-slate-400 mb-1 font-medium">روز قمری</label>
                <select
                  value={hDay}
                  onChange={(e) => setHDay(Number(e.target.value))}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-white text-slate-100 dark:text-slate-100 light:text-slate-900 border border-slate-700 text-xs sm:text-sm outline-none focus:border-emerald-500"
                >
                  {Array.from({ length: getHijriMonthDays(hYear, hMonth) }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {toPersianDigits(i + 1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs text-slate-400 mb-1 font-medium">ماه قمری</label>
                <select
                  value={hMonth}
                  onChange={(e) => setHMonth(Number(e.target.value))}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-white text-slate-100 dark:text-slate-100 light:text-slate-900 border border-slate-700 text-xs sm:text-sm outline-none focus:border-emerald-500"
                >
                  {HIJRI_MONTH_NAMES_FA.map((name, i) => (
                    <option key={i + 1} value={i + 1}>
                      {toPersianDigits(i + 1)} - {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs text-slate-400 mb-1 font-medium">سال قمری</label>
                <input
                  type="number"
                  value={hYear}
                  onChange={(e) => setHYear(Number(e.target.value))}
                  min={1}
                  max={3000}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-white text-slate-100 dark:text-slate-100 light:text-slate-900 border border-slate-700 text-xs sm:text-sm outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </>
          )}
        </div>

        {/* Results Dual / Triple Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
          
          {/* Solar Result Card */}
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-gradient-to-br from-violet-950/40 via-slate-900/80 to-slate-900/90 border border-violet-500/30 shadow-lg">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-bold text-violet-400">گاه‌شمار هجری شمسی</span>
              {result.isJalaliLeap ? (
                <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40">
                  سال کبیسه
                </span>
              ) : (
                <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full bg-slate-800 text-slate-400">
                  سال عادی
                </span>
              )}
            </div>

            <div className="text-sm sm:text-lg font-bold text-white mb-0.5 sm:mb-1">
              {result.dayOfWeek.nameFa}، {toPersianDigits(result.jalali.day)} {result.jalaliMonthName}
            </div>
            <div className="text-xs sm:text-sm text-slate-300 font-mono mb-2 sm:mb-4">
              {toPersianDigits(result.jalali.year)}/{toPersianDigits(result.jalali.month)}/{toPersianDigits(result.jalali.day)}
            </div>

            <div className="pt-2 sm:pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-xs text-slate-400">
              <span>روز {toPersianDigits(result.dayOfYearJalali)} سال</span>
              <button
                onClick={() => copyToClipboard(`${result.dayOfWeek.nameFa} ${result.jalali.day} ${result.jalaliMonthName} ${result.jalali.year}`, 'jalali')}
                className="flex items-center gap-1 hover:text-violet-300 transition-colors"
                title="کپی تاریخ"
              >
                {copiedKey === 'jalali' ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                <span>{copiedKey === 'jalali' ? 'کپی شد' : 'کپی'}</span>
              </button>
            </div>
          </div>

          {/* Gregorian Result Card */}
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-gradient-to-br from-cyan-950/40 via-slate-900/80 to-slate-900/90 border border-cyan-500/30 shadow-lg">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-bold text-cyan-400">گاه‌شمار میلادی</span>
              {result.isGregorianLeap ? (
                <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Leap Year
                </span>
              ) : (
                <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full bg-slate-800 text-slate-400">
                  Common Year
                </span>
              )}
            </div>

            <div className="text-sm sm:text-lg font-bold text-white mb-0.5 sm:mb-1">
              {result.dayOfWeek.nameEn}, {result.gregorian.day} {GREGORIAN_MONTH_NAMES_EN[result.gregorian.month - 1]}
            </div>
            <div className="text-xs sm:text-sm text-slate-300 font-mono mb-2 sm:mb-4">
              {result.gregorian.year}-{result.gregorian.month < 10 ? `0${result.gregorian.month}` : result.gregorian.month}-{result.gregorian.day < 10 ? `0${result.gregorian.day}` : result.gregorian.day}
            </div>

            <div className="pt-2 sm:pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-xs text-slate-400">
              <span>{result.gregorianMonthName}</span>
              <button
                onClick={() => copyToClipboard(`${result.gregorian.year}-${result.gregorian.month}-${result.gregorian.day}`, 'gregorian')}
                className="flex items-center gap-1 hover:text-cyan-300 transition-colors"
                title="کپی تاریخ"
              >
                {copiedKey === 'gregorian' ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                <span>{copiedKey === 'gregorian' ? 'کپی شد' : 'کپی'}</span>
              </button>
            </div>
          </div>

          {/* Lunar Result Card */}
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-900/90 border border-emerald-500/30 shadow-lg">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-bold text-emerald-400">گاه‌شمار هجری قمری</span>
              <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Islamic Lunar
              </span>
            </div>

            <div className="text-sm sm:text-lg font-bold text-white mb-0.5 sm:mb-1">
              {toPersianDigits(result.hijri.day)} {result.hijriMonthName}
            </div>
            <div className="text-xs sm:text-sm text-slate-300 font-mono mb-2 sm:mb-4">
              {toPersianDigits(result.hijri.year)}/{toPersianDigits(result.hijri.month)}/{toPersianDigits(result.hijri.day)} هـ.ق
            </div>

            <div className="pt-2 sm:pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-300 font-medium truncate max-w-[200px] sm:max-w-none">
                <Cake className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 flex-shrink-0" />
                <span className="truncate">سن متولد: {calculateAge(result.gregorian.year, result.gregorian.month, result.gregorian.day)}</span>
              </span>
              <button
                onClick={() => copyToClipboard(`${result.hijri.day} ${result.hijriMonthName} ${result.hijri.year}`, 'hijri')}
                className="flex items-center gap-1 hover:text-emerald-300 transition-colors flex-shrink-0"
                title="کپی تاریخ"
              >
                {copiedKey === 'hijri' ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                <span>{copiedKey === 'hijri' ? 'کپی شد' : 'کپی'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
