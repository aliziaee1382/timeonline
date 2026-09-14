import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Sparkles, AlertCircle, Info } from 'lucide-react';
import {
  PERSIAN_MONTH_NAMES,
  PERSIAN_WEEK_DAYS,
  toPersianDigits,
  getJalaliMonthDays,
  jalaliToGregorian,
  gregorianToHijri,
  getPersianDayOfWeek,
  gregorianToJalali,
  isJalaliLeapYear
} from '../utils/dateConverters';
import { getEventsForDay, CalendarEvent } from '../utils/calendarEvents';

export const MonthlyCalendar: React.FC = () => {
  // Current real date in Jalali
  const today = useMemo(() => {
    const d = new Date();
    return gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }, []);

  const [selectedYear, setSelectedYear] = useState<number>(today.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(today.month);
  const [activeDay, setActiveDay] = useState<number>(today.day);

  // Jump to today
  const goToToday = () => {
    setSelectedYear(today.year);
    setSelectedMonth(today.month);
    setActiveDay(today.day);
  };

  // Previous month
  const prevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedYear(selectedYear - 1);
      setSelectedMonth(12);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  // Next month
  const nextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedYear(selectedYear + 1);
      setSelectedMonth(1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Build calendar matrix
  const daysInMonth = getJalaliMonthDays(selectedYear, selectedMonth);

  // Find starting day of week for day 1 of the month
  const startG = jalaliToGregorian(selectedYear, selectedMonth, 1);
  const startDayOfWeek = getPersianDayOfWeek(startG.year, startG.month, startG.day).index; // 0 = شنبه

  // Days list for this month
  const calendarCells = useMemo(() => {
    const cells = [];
    // Empty prefix cells
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push({ empty: true, key: `empty-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const g = jalaliToGregorian(selectedYear, selectedMonth, day);
      const h = gregorianToHijri(g.year, g.month, g.day);
      const dow = getPersianDayOfWeek(g.year, g.month, g.day).index; // 6 = جمعه (Friday)
      const isFriday = dow === 6;
      const events: CalendarEvent[] = getEventsForDay(selectedMonth, day, h.month, h.day);
      const hasHoliday = isFriday || events.some(e => e.isHoliday);
      const isCurrentDay = selectedYear === today.year && selectedMonth === today.month && day === today.day;

      cells.push({
        empty: false,
        key: `day-${day}`,
        day,
        gregorianDay: g.day,
        hijriDay: h.day,
        isFriday,
        isHoliday: hasHoliday,
        events,
        isCurrentDay,
      });
    }
    return cells;
  }, [selectedYear, selectedMonth, daysInMonth, today]);

  // Events of active day
  const activeDayDetails = useMemo(() => {
    const g = jalaliToGregorian(selectedYear, selectedMonth, activeDay);
    const h = gregorianToHijri(g.year, g.month, g.day);
    const dow = getPersianDayOfWeek(g.year, g.month, g.day);
    const events = getEventsForDay(selectedMonth, activeDay, h.month, h.day);

    return {
      jalaliStr: `${dow.nameFa}، ${toPersianDigits(activeDay)} ${PERSIAN_MONTH_NAMES[selectedMonth - 1]} ${toPersianDigits(selectedYear)}`,
      gregorianStr: `${g.day}/${g.month}/${g.year}`,
      hijriStr: `${toPersianDigits(h.day)}/${toPersianDigits(h.month)}/${toPersianDigits(h.year)} هـ.ق`,
      isFriday: dow.index === 6,
      events,
    };
  }, [selectedYear, selectedMonth, activeDay]);

  // All events of the selected month
  const monthEventsList = useMemo(() => {
    const list: { day: number; event: CalendarEvent }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const g = jalaliToGregorian(selectedYear, selectedMonth, d);
      const h = gregorianToHijri(g.year, g.month, g.day);
      const events = getEventsForDay(selectedMonth, d, h.month, h.day);
      events.forEach(ev => list.push({ day: d, event: ev }));
    }
    return list;
  }, [selectedYear, selectedMonth, daysInMonth]);

  return (
    <section id="calendar" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="rounded-3xl backdrop-blur-2xl bg-slate-900/70 dark:bg-slate-900/70 light:bg-white/80 border border-violet-500/20 dark:border-violet-500/20 light:border-slate-200 shadow-2xl p-6 sm:p-8 md:p-10">
        
        {/* Header Controls */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/20">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                تقویم تعاملی ماهانه خورشیدی
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              مشاهده روزها، تعطیلات رسمی، تقویم همزمان میلادی و قمری به همراه مناسبت‌ها
            </p>
          </div>

          {/* Month / Year Selectors & Navigation */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold transition-all"
            >
              برو به امروز
            </button>

            <div className="flex items-center gap-1 bg-slate-800/80 rounded-xl p-1 border border-slate-700">
              <button
                onClick={nextMonth}
                aria-label="ماه بعد"
                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors"
                title="ماه بعد"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-transparent text-xs sm:text-sm font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 outline-none px-2 cursor-pointer"
              >
                {PERSIAN_MONTH_NAMES.map((name, i) => (
                  <option key={i + 1} value={i + 1} className="bg-slate-900 text-white">
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent text-xs sm:text-sm font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 outline-none px-1 font-mono cursor-pointer"
              >
                {Array.from({ length: 30 }).map((_, i) => {
                  const y = 1390 + i;
                  return (
                    <option key={y} value={y} className="bg-slate-900 text-white">
                      {toPersianDigits(y)} {isJalaliLeapYear(y) ? '(کبیسه)' : ''}
                    </option>
                  );
                })}
              </select>

              <button
                onClick={prevMonth}
                aria-label="ماه قبل"
                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors"
                title="ماه قبل"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Calendar Body: Grid + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          
          {/* Calendar 7-Column Grid */}
          <div className="lg:col-span-8">
            
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
              {PERSIAN_WEEK_DAYS.map((w, idx) => (
                <div
                  key={w.nameFa}
                  className={`py-2 text-xs font-bold rounded-lg ${
                    idx === 6
                      ? 'text-rose-400 bg-rose-500/10'
                      : 'text-slate-400 bg-slate-800/40'
                  }`}
                >
                  <span className="hidden sm:inline">{w.nameFa}</span>
                  <span className="sm:hidden">{w.shortFa}</span>
                </div>
              ))}
            </div>

            {/* Day Cells Matrix */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarCells.map((cell) => {
                if (cell.empty) {
                  return (
                    <div
                      key={cell.key}
                      className="min-h-[52px] sm:min-h-[72px] rounded-xl bg-transparent opacity-0 pointer-events-none"
                    />
                  );
                }

                const isSelected = cell.day === activeDay;

                return (
                  <button
                    key={cell.key}
                    onClick={() => setActiveDay(cell.day!)}
                    className={`relative min-h-[52px] sm:min-h-[72px] p-1.5 sm:p-2 rounded-xl flex flex-col justify-between items-start transition-all duration-200 text-right ${
                      isSelected
                        ? 'bg-gradient-to-br from-violet-600/30 to-cyan-500/20 border-2 border-cyan-400 shadow-md shadow-cyan-500/10'
                        : cell.isCurrentDay
                        ? 'bg-violet-950/40 border border-violet-500/60'
                        : 'bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/40'
                    }`}
                  >
                    {/* Top Row: Solar Day + Indicators */}
                    <div className="w-full flex items-center justify-between">
                      <span
                        className={`text-sm sm:text-base font-bold ${
                          cell.isHoliday
                            ? 'text-rose-400 font-extrabold'
                            : cell.isCurrentDay
                            ? 'text-cyan-300'
                            : 'text-slate-100 dark:text-slate-100 light:text-slate-800'
                        }`}
                      >
                        {toPersianDigits(cell.day!)}
                      </span>

                      {/* Event dot or today indicator */}
                      <div className="flex items-center gap-0.5">
                        {cell.isCurrentDay && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        )}
                        {cell.events && cell.events.length > 0 && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              cell.events.some(e => e.isHoliday) ? 'bg-rose-500' : 'bg-violet-400'
                            }`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Gregorian & Lunar Mini Badges */}
                    <div className="w-full flex items-center justify-between text-[9px] sm:text-[10px] text-slate-400 font-mono mt-1">
                      <span className="text-slate-500">{cell.gregorianDay}</span>
                      <span className="text-emerald-400/80">{toPersianDigits(cell.hijriDay!)}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-4 pt-4 border-t border-slate-800/60">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>امروز</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>تعطیل رسمی / جمعه</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                <span>مناسبت غیرتعطیل</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mr-auto font-mono">
                <span>پایین راست: قمری (سبز)</span>
                <span>•</span>
                <span>پایین چپ: میلادی</span>
              </div>
            </div>

          </div>

          {/* Right Column: Active Day Inspector & Month Events List */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Selected Day Card */}
            <div className="p-4 rounded-2xl bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-100 border border-violet-500/30">
              <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold mb-2">
                <Info className="w-4 h-4" />
                <span>مشخصات روز انتخاب‌شده</span>
              </div>
              <div className="text-base font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 mb-1">
                {activeDayDetails.jalaliStr}
              </div>
              <div className="text-xs text-slate-400 space-y-1 font-mono pt-1">
                <div>میلادی: {activeDayDetails.gregorianStr}</div>
                <div>قمری: {activeDayDetails.hijriStr}</div>
              </div>

              {/* Day Events */}
              <div className="mt-3 pt-3 border-t border-slate-700/60">
                <span className="text-[11px] text-slate-400 font-medium block mb-1.5">مناسبت‌های این روز:</span>
                {activeDayDetails.events.length > 0 ? (
                  <div className="space-y-1.5">
                    {activeDayDetails.events.map((ev, i) => (
                      <div
                        key={i}
                        className={`text-xs p-2 rounded-xl flex items-start gap-2 ${
                          ev.isHoliday
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold'
                            : 'bg-slate-700/40 text-slate-300'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-violet-400" />
                        <span>{ev.title} {ev.isHoliday && '(تعطیل رسمی)'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">برای این روز مناسبت ثبت‌شده‌ای وجود ندارد.</p>
                )}
              </div>
            </div>

            {/* Month's Highlights / Events List */}
            <div className="p-4 rounded-2xl bg-slate-800/40 dark:bg-slate-800/40 light:bg-slate-100 border border-slate-700/60 max-h-72 overflow-y-auto">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2.5">
                <span>مناسبت‌های ماه {PERSIAN_MONTH_NAMES[selectedMonth - 1]}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                  {toPersianDigits(monthEventsList.length)} مورد
                </span>
              </div>

              {monthEventsList.length > 0 ? (
                <div className="space-y-2">
                  {monthEventsList.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveDay(item.day)}
                      className={`cursor-pointer p-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                        item.event.isHoliday
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20'
                          : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-violet-400">{toPersianDigits(item.day)}:</span>
                        <span className="truncate">{item.event.title}</span>
                      </div>
                      {item.event.isHoliday && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 flex-shrink-0">
                          تعطیل
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">مناسبتی برای این ماه ثبت نشده است.</p>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
