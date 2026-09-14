import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Globe2, Sun, Moon, Plus, Search, Check, X, Sparkles, Filter } from 'lucide-react';
import { CityClock } from '../types';
import { ALL_WORLD_CAPITALS } from '../data/worldCapitals';
import { pad2, toPersianDigits } from '../utils/dateConverters';

export const WorldClockGrid: React.FC = () => {
  const [selectedCities, setSelectedCities] = useState<CityClock[]>([
    ALL_WORLD_CAPITALS.find(c => c.id === 'tehran')!,
    ALL_WORLD_CAPITALS.find(c => c.id === 'london')!,
    ALL_WORLD_CAPITALS.find(c => c.id === 'paris')!,
    ALL_WORLD_CAPITALS.find(c => c.id === 'tokyo')!,
    ALL_WORLD_CAPITALS.find(c => c.id === 'washington') || ALL_WORLD_CAPITALS.find(c => c.id === 'newyork')!,
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeContinent, setActiveContinent] = useState<string>('همه');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsAddOpen(false);
      }
    };
    if (isAddOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddOpen]);

  const getCityTimeData = (timezone: string) => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      const parts = formatter.formatToParts(currentTime);
      const h = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
      const m = parts.find(p => p.type === 'minute')?.value || '00';
      const s = parts.find(p => p.type === 'second')?.value || '00';
      const weekday = parts.find(p => p.type === 'weekday')?.value || '';
      const month = parts.find(p => p.type === 'month')?.value || '';
      const day = parts.find(p => p.type === 'day')?.value || '';

      // GMT Offset calculation
      const offsetFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'shortOffset'
      });
      const tzOffset = offsetFormatter.formatToParts(currentTime).find(p => p.type === 'timeZoneName')?.value || 'GMT';

      const isDay = h >= 6 && h < 18;

      return {
        hours: pad2(h),
        minutes: m,
        seconds: s,
        isDay,
        gmtOffset: tzOffset,
        dateStr: `${weekday}, ${day} ${month}`,
      };
    } catch {
      return {
        hours: '--',
        minutes: '--',
        seconds: '--',
        isDay: true,
        gmtOffset: 'GMT',
        dateStr: '',
      };
    }
  };

  const toggleCity = (city: CityClock) => {
    if (selectedCities.some(c => c.id === city.id)) {
      if (selectedCities.length > 1) {
        setSelectedCities(selectedCities.filter(c => c.id !== city.id));
      }
    } else {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const removeCity = (cityId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedCities.length > 1) {
      setSelectedCities(selectedCities.filter(c => c.id !== cityId));
    }
  };

  const continents = ['همه', 'آسیا', 'اروپا', 'آمریکا', 'آفریقا', 'اقیانوسیه'];

  const filteredCapitals = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return ALL_WORLD_CAPITALS.filter(c => {
      const matchContinent = activeContinent === 'همه' || c.continentFa === activeContinent;
      const matchSearch =
        !term ||
        c.nameFa.toLowerCase().includes(term) ||
        c.nameEn.toLowerCase().includes(term) ||
        c.countryFa.toLowerCase().includes(term);
      return matchContinent && matchSearch;
    });
  }, [searchTerm, activeContinent]);

  return (
    <section id="world-grid" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
              شبکه ساعت جهانی پایتخت‌ها
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            دسترسی به تمام پایتخت‌های کشورهای جهان در قاره‌های آسیا، اروپا، آمریکا، آفریقا و اقیانوسیه
          </p>
        </div>

        {/* Add/Manage City Trigger & Popover */}
        <div className="relative" ref={popoverRef}>
          <button
            id="manage-cities-btn"
            onClick={() => setIsAddOpen(!isAddOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600/30 to-cyan-600/30 hover:from-violet-600/50 hover:to-cyan-600/50 border border-violet-500/40 text-xs sm:text-sm font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900 transition-all shadow-lg shadow-violet-900/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>انتخاب پایتخت‌های جهان ({toPersianDigits(selectedCities.length)})</span>
          </button>

          {/* Expanded World Capitals Selector Modal / Popover */}
          {isAddOpen && (
            <div className="absolute left-0 sm:right-0 top-12 z-50 w-[330px] sm:w-[460px] p-4 rounded-3xl bg-slate-900/95 dark:bg-slate-900/95 light:bg-white/95 border border-violet-500/40 shadow-2xl backdrop-blur-2xl">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                    فهرست جامع پایتخت‌های جهان
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                  {toPersianDigits(filteredCapitals.length)} مورد یافت شد
                </span>
              </div>

              {/* Search Bar */}
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 border border-slate-700/60 focus-within:border-cyan-400 transition-all">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="جستجوی نام پایتخت یا کشور (فارسی یا انگلیسی)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-100 dark:text-slate-100 light:text-slate-900 outline-none placeholder:text-slate-500"
                  autoFocus
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Continents Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none">
                {continents.map((continent) => (
                  <button
                    key={continent}
                    onClick={() => setActiveContinent(continent)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                      activeContinent === continent
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-sm'
                        : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 border border-transparent'
                    }`}
                  >
                    {continent}
                  </button>
                ))}
              </div>

              {/* Capitals Scrollable List */}
              <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                {filteredCapitals.length > 0 ? (
                  filteredCapitals.map((city) => {
                    const isSelected = selectedCities.some(c => c.id === city.id);
                    return (
                      <button
                        key={city.id}
                        onClick={() => toggleCity(city)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-violet-950/70 to-indigo-950/70 text-cyan-300 border border-cyan-500/40 shadow-sm font-medium'
                            : 'hover:bg-slate-800/70 text-slate-300 border border-slate-800/60'
                        }`}
                      >
                        <div className="flex flex-col items-start gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                              {city.nameFa}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({city.countryFa})
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-sans">
                            {city.nameEn} • {city.continentFa || 'جهان'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400">
                            {city.timezone.split('/')[1]?.replace('_', ' ') || city.timezone}
                          </span>
                          <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300'
                              : 'border-slate-700 text-transparent'
                          }`}>
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-xs text-slate-500">
                    پایتختی با عنوان «{searchTerm}» یافت نشد.
                  </div>
                )}
              </div>

              {/* Bottom Hint */}
              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>تعداد پایتخت‌های فعال روی داشبورد:</span>
                <span className="font-bold text-cyan-400">{toPersianDigits(selectedCities.length)} پایتخت</span>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Grid of City Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {selectedCities.map((city) => {
          const { hours, minutes, seconds, isDay, gmtOffset, dateStr } = getCityTimeData(city.timezone);
          const isTehran = city.id === 'tehran';

          return (
            <div
              key={city.id}
              className={`relative group overflow-hidden rounded-2xl p-4 sm:p-5 backdrop-blur-xl transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl ${
                isTehran
                  ? 'bg-gradient-to-br from-violet-950/40 via-slate-900/80 to-slate-900/90 border-violet-500/40 shadow-lg shadow-violet-500/10'
                  : 'bg-slate-900/60 dark:bg-slate-900/60 light:bg-white/80 border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 shadow-md'
              } border`}
            >
              {/* Delete Button (visible on hover or focus, minimum 2 cities kept) */}
              {selectedCities.length > 1 && (
                <button
                  onClick={(e) => removeCity(city.id, e)}
                  title="حذف از داشبورد"
                  className="absolute top-2 left-2 w-5 h-5 rounded-full bg-slate-800/80 hover:bg-rose-500/80 text-slate-400 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* Top Row: Name and Day/Night badge */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                      {city.nameFa}
                    </h3>
                    {isTehran && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        مبدأ
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">{city.countryFa} • {city.nameEn}</p>
                </div>

                {/* Day / Night pill */}
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                    isDay
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                  }`}
                >
                  {isDay ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-indigo-400" />}
                  <span>{isDay ? 'روز' : 'شب'}</span>
                </div>
              </div>

              {/* Digital Time - Left to Right standard display with English font */}
              <div dir="ltr" style={{ direction: 'ltr' }} className="my-2 text-center font-en-num font-mono">
                <div className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-white to-slate-300 dark:from-slate-100 dark:to-slate-300 light:from-slate-900 light:to-slate-700 bg-clip-text text-transparent">
                  <span>{hours}</span>
                  <span className="text-cyan-400 font-sans mx-0.5 animate-pulse">:</span>
                  <span>{minutes}</span>
                  <span className="text-xs text-violet-400 font-normal ml-1">
                    :{seconds}
                  </span>
                </div>
              </div>

              {/* Footer: Date and GMT Offset */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                <span>{dateStr}</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-300 text-[10px]">
                  {gmtOffset}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
