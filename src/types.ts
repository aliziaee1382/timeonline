export type ThemeMode = 'dark' | 'light';

export interface CityClock {
  id: string;
  nameFa: string;
  nameEn: string;
  countryFa: string;
  continentFa?: string;
  timezone: string; // e.g. 'Asia/Tehran'
  lat: number;
  lng: number;
  isPopular?: boolean;
}

export interface JalaliDate {
  year: number;
  month: number;
  day: number;
}

export interface GregorianDate {
  year: number;
  month: number;
  day: number;
}

export interface HijriDate {
  year: number;
  month: number;
  day: number;
}

export interface FullDateConversion {
  jalali: JalaliDate;
  gregorian: GregorianDate;
  hijri: HijriDate;
  dayOfWeek: {
    index: number; // 0 = شنبه, 6 = جمعه
    nameFa: string;
    nameEn: string;
  };
  jalaliMonthName: string;
  gregorianMonthName: string;
  hijriMonthName: string;
  isJalaliLeap: boolean;
  isGregorianLeap: boolean;
  dayOfYearJalali: number;
  daysRemainingJalali: number;
}

export interface CalendarDayInfo {
  jalaliDay: number;
  jalaliMonth: number;
  jalaliYear: number;
  gregorianDay: number;
  gregorianMonth: number;
  gregorianYear: number;
  hijriDay: number;
  hijriMonth: number;
  dayOfWeekIndex: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  isHoliday: boolean;
  events: string[];
}

export interface PrayerTimeData {
  fajr: string;      // اذان صبح
  sunrise: string;   // طلوع آفتاب
  dhuhr: string;     // اذان ظهر
  asr: string;       // عصر
  sunset: string;    // غروب آفتاب
  maghrib: string;   // اذان مغرب
  isha: string;      // عشاء
  midnight: string;  // نیمه‌شب شرعی
  nextPrayer: {
    name: string;
    nameFa: string;
    time: string;
    remainingMinutes: number;
  };
}

export interface StopwatchLap {
  id: number;
  lapTime: number;
  overallTime: number;
}
