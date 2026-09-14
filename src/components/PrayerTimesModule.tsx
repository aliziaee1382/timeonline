import React, { useState, useEffect, useMemo } from 'react';
import { Compass, Sun, Moon, Sunrise, Sunset, Clock, MapPin } from 'lucide-react';
import { CITIES_LIST, calculatePrayerTimes } from '../utils/prayerTimes';
import { toPersianDigits } from '../utils/dateConverters';

export const PrayerTimesModule: React.FC = () => {
  const [selectedCityId, setSelectedCityId] = useState<string>('tehran');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedCity = useMemo(() => {
    return CITIES_LIST.find(c => c.id === selectedCityId) || CITIES_LIST[0];
  }, [selectedCityId]);

  // Calculate prayer times for city
  const prayerTimes = useMemo(() => {
    return calculatePrayerTimes(selectedCity.lat, selectedCity.lng, currentDate);
  }, [selectedCity, currentDate]);

  const prayerCards = [
    { key: 'fajr', titleFa: 'اذان صبح', time: prayerTimes.fajr, icon: Sunrise, color: 'text-indigo-400', border: 'border-indigo-500/30' },
    { key: 'sunrise', titleFa: 'طلوع آفتاب', time: prayerTimes.sunrise, icon: Sun, color: 'text-amber-400', border: 'border-amber-500/30' },
    { key: 'dhuhr', titleFa: 'اذان ظهر', time: prayerTimes.dhuhr, icon: Sun, color: 'text-yellow-400', border: 'border-yellow-500/30' },
    { key: 'sunset', titleFa: 'غروب آفتاب', time: prayerTimes.sunset, icon: Sunset, color: 'text-orange-400', border: 'border-orange-500/30' },
    { key: 'maghrib', titleFa: 'اذان مغرب', time: prayerTimes.maghrib, icon: Moon, color: 'text-violet-400', border: 'border-violet-500/30' },
    { key: 'midnight', titleFa: 'نیمه‌شب شرعی', time: prayerTimes.midnight, icon: Clock, color: 'text-cyan-400', border: 'border-cyan-500/30' },
  ];

  const formatRemainingMinutes = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) {
      return `${toPersianDigits(h)} ساعت و ${toPersianDigits(m)} دقیقه`;
    }
    return `${toPersianDigits(m)} دقیقه`;
  };

  return (
    <section id="prayer-times" className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      <div className="rounded-2xl sm:rounded-3xl backdrop-blur-2xl bg-slate-900/70 dark:bg-slate-900/70 light:bg-white/80 border border-violet-500/20 dark:border-violet-500/20 light:border-slate-200 shadow-2xl p-3.5 sm:p-8 md:p-10">
        
        {/* Header with City Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/20">
                <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h2 className="text-base sm:text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                محاسبه آنلاین و نجومی اوقات شرعی
              </h2>
            </div>
            <p className="text-[11px] sm:text-sm text-slate-400 mt-1">
              مبتنی بر استانداردهای ژئوفیزیک دانشگاه تهران با زاویه دقیق خورشیدی
            </p>
          </div>

          {/* City Dropdown */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-800/80 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-slate-700 self-start sm:self-auto">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 flex-shrink-0" />
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 outline-none cursor-pointer max-w-[200px] sm:max-w-[320px]"
            >
              {['ایران', 'آسیا', 'اروپا', 'آمریکا', 'آفریقا', 'اقیانوسیه'].map((group) => {
                const groupCities = group === 'ایران'
                  ? CITIES_LIST.filter(c => c.countryFa === 'ایران')
                  : CITIES_LIST.filter(c => c.continentFa === group && c.countryFa !== 'ایران');
                if (groupCities.length === 0) return null;
                return (
                  <optgroup key={group} label={`پایتخت‌ها و شهرهای ${group}`} className="bg-slate-950 text-cyan-400 font-bold">
                    {groupCities.map((city) => (
                      <option key={city.id} value={city.id} className="bg-slate-900 text-slate-100 font-normal">
                        {city.nameFa} ({city.countryFa})
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>
        </div>

        {/* Next Prayer Live Banner */}
        <div className="my-3 sm:my-6 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-violet-900/40 via-indigo-900/30 to-cyan-900/30 border border-violet-500/30 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-violet-600/30 border border-violet-400/40 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-slate-400">وقت شرعی بعدی:</span>
              <div className="text-sm sm:text-lg font-bold text-white flex items-center gap-1.5 sm:gap-2">
                <span>{prayerTimes.nextPrayer.nameFa}</span>
                <span className="text-cyan-400 font-mono">({toPersianDigits(prayerTimes.nextPrayer.time)})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl bg-slate-800/80 text-[10px] sm:text-xs font-semibold text-violet-300 border border-violet-500/30 self-start sm:self-auto">
            <span>زمان باقی‌مانده:</span>
            <span className="text-cyan-300">{formatRemainingMinutes(prayerTimes.nextPrayer.remainingMinutes)}</span>
          </div>
        </div>

        {/* 6 Prayer Times Cards Grid - 3 columns on mobile */}
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
          {prayerCards.map((item) => {
            const Icon = item.icon;
            const isNext = prayerTimes.nextPrayer.name === item.key;

            return (
              <div
                key={item.key}
                className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-2 sm:p-4 flex flex-col justify-between items-center text-center transition-all duration-300 ${
                  isNext
                    ? 'bg-gradient-to-b from-violet-950/60 to-slate-900/90 border-2 border-cyan-400 shadow-lg shadow-cyan-500/10 scale-[1.02]'
                    : 'bg-slate-800/40 dark:bg-slate-800/40 light:bg-slate-100 border border-slate-700/50'
                }`}
              >
                {isNext && (
                  <span className="absolute top-0.5 right-1 sm:top-1 sm:right-2 text-[8px] sm:text-[9px] font-bold text-cyan-400 uppercase tracking-widest">
                    بعدی
                  </span>
                )}

                <div className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-800/70 border border-slate-700 mb-1 sm:mb-2 ${item.color}`}>
                  <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </div>

                <span className="text-[10px] sm:text-xs font-medium text-slate-300 mb-0.5 sm:mb-1 truncate w-full">
                  {item.titleFa}
                </span>

                <div className="text-sm sm:text-2xl font-mono font-extrabold text-white tracking-tight">
                  {toPersianDigits(item.time)}
                </div>
              </div>
            );
          })}
        </div>

        {/* City Location Coordinates Meta */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-500 font-mono">
          <span>موقعیت: {selectedCity.nameFa}</span>
          <span className="truncate">عرض: {selectedCity.lat.toFixed(2)}° | طول: {selectedCity.lng.toFixed(2)}°</span>
        </div>

      </div>
    </section>
  );
};
