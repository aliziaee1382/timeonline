import { JalaliDate, GregorianDate, HijriDate, FullDateConversion } from '../types';

export const PERSIAN_MONTH_NAMES = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند'
];

export const GREGORIAN_MONTH_NAMES_FA = [
  'ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن',
  'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
];

export const GREGORIAN_MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const HIJRI_MONTH_NAMES_FA = [
  'محرم', 'صفر', 'ربیع‌الاول', 'ربیع‌الثانی',
  'جمادی‌الاول', 'جمادی‌الثانی', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذی‌القعده', 'ذی‌الحجه'
];

export const PERSIAN_WEEK_DAYS = [
  { nameFa: 'شنبه', shortFa: 'ش', nameEn: 'Saturday' },
  { nameFa: 'یکشنبه', shortFa: 'ی', nameEn: 'Sunday' },
  { nameFa: 'دوشنبه', shortFa: 'د', nameEn: 'Monday' },
  { nameFa: 'سه‌شنبه', shortFa: 'س', nameEn: 'Tuesday' },
  { nameFa: 'چهارشنبه', shortFa: 'چ', nameEn: 'Wednesday' },
  { nameFa: 'پنج‌شنبه', shortFa: 'پ', nameEn: 'Thursday' },
  { nameFa: 'جمعه', shortFa: 'ج', nameEn: 'Friday' },
];

export function toPersianDigits(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d, 10)]);
}

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function isJalaliLeapYear(jy: number): boolean {
  const rem = jy % 33;
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(rem);
}

export function isGregorianLeapYear(gy: number): boolean {
  return (gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0);
}

export function getJalaliMonthDays(jy: number, jm: number): number {
  if (jm >= 1 && jm <= 6) return 31;
  if (jm >= 7 && jm <= 11) return 30;
  if (jm === 12) return isJalaliLeapYear(jy) ? 30 : 29;
  return 30;
}

export function getGregorianMonthDays(gy: number, gm: number): number {
  const daysInMonth = [0, 31, isGregorianLeapYear(gy) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return daysInMonth[gm] || 30;
}

export function getHijriMonthDays(hy: number, hm: number): number {
  // Odd months have 30 days, even months 29; month 12 has 30 in leap years
  if (hm % 2 === 1) return 30;
  if (hm === 12) {
    const isLeap = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29].includes(hy % 30);
    return isLeap ? 30 : 29;
  }
  return 29;
}

// Jalali to Gregorian
export function jalaliToGregorian(jy: number, jm: number, jd: number): GregorianDate {
  jy = Math.floor(jy);
  jm = Math.floor(jm);
  jd = Math.floor(jd);
  let gy: number;
  if (jy > 979) {
    gy = 1600;
    jy -= 979;
  } else {
    gy = 621;
  }
  const days = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + 78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
  gy += 400 * Math.floor(days / 146097);
  let daysRem = days % 146097;
  if (daysRem > 36524) {
    gy += 100 * Math.floor(--daysRem / 36524);
    daysRem %= 36524;
    if (daysRem >= 365) daysRem++;
  }
  gy += 4 * Math.floor(daysRem / 1461);
  daysRem %= 1461;
  if (daysRem > 365) {
    gy += Math.floor((daysRem - 1) / 365);
    daysRem = (daysRem - 1) % 365;
  }
  const gd = daysRem + 1;
  const salA = [0, 31, isGregorianLeapYear(gy) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 1;
  let d = gd;
  for (let m = 1; m <= 12; m++) {
    if (d <= salA[m]) {
      gm = m;
      break;
    }
    d -= salA[m];
    gm = m;
  }
  return {
    year: gy,
    month: Math.max(1, Math.min(12, gm)),
    day: Math.max(1, Math.min(31, d))
  };
}

// Gregorian to Jalali
export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  gy = Math.floor(gy);
  gm = Math.floor(gm);
  gd = Math.floor(gd);
  const g_d_m = [0, 31, isGregorianLeapYear(gy) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let jy: number;
  if (gy > 1600) {
    jy = 979;
    gy -= 1600;
  } else {
    jy = 0;
    gy -= 621;
  }
  const gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd;
  for (let i = 1; i < gm; ++i) days += g_d_m[i];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const rawJm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const rawJd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  const safeJm = Math.max(1, Math.min(12, isNaN(rawJm) ? 1 : rawJm));
  const safeJd = Math.max(1, Math.min(31, isNaN(rawJd) ? 1 : rawJd));
  return { year: jy, month: safeJm, day: safeJd };
}

// Gregorian to Hijri
export function gregorianToHijri(gy: number, gm: number, gd: number): HijriDate {
  let m = gm;
  let y = gy;
  if (m < 3) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + gd + b - 1524.5;
  
  const l = Math.floor(jd - 1948439.5) + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2) / 17719)) + (Math.floor(l2 / 5670)) * (Math.floor((43 * l2) / 15238));
  const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  const rawHm = Math.floor((24 * l3) / 709);
  const rawHd = l3 - Math.floor((709 * rawHm) / 24);
  const hy = 30 * n + j - 30;
  const safeHm = Math.max(1, Math.min(12, isNaN(rawHm) ? 1 : rawHm));
  const safeHd = Math.max(1, Math.min(30, isNaN(rawHd) ? 1 : rawHd));
  return { year: hy, month: safeHm, day: safeHd };
}

// Hijri to Gregorian
export function hijriToGregorian(hy: number, hm: number, hd: number): GregorianDate {
  const jd = Math.floor((11 * hy + 3) / 30) + 354 * hy + 30 * hm - Math.floor((hm - 1) / 2) + hd + 1948440 - 385;
  const z = Math.floor(jd + 0.5);
  let a = Math.floor((z - 1867216.25) / 36524.25);
  a = z + 1 + a - Math.floor(a / 4);
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e);
  const month = (e < 14) ? (e - 1) : (e - 13);
  const year = (month > 2) ? (c - 4716) : (c - 4715);
  const safeMonth = Math.max(1, Math.min(12, isNaN(month) ? 1 : month));
  const safeDay = Math.max(1, Math.min(31, isNaN(day) ? 1 : day));
  return { year, month: safeMonth, day: safeDay };
}

// Get day of week for Gregorian date (0 = شنبه Saturday, ..., 6 = جمعه Friday)
export function getPersianDayOfWeek(gy: number, gm: number, gd: number) {
  const date = new Date(gy, gm - 1, gd);
  const jsDay = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // Persian week starts on Saturday (0)
  const persianIndex = (jsDay + 1) % 7;
  return {
    index: persianIndex,
    nameFa: PERSIAN_WEEK_DAYS[persianIndex].nameFa,
    nameEn: PERSIAN_WEEK_DAYS[persianIndex].nameEn
  };
}

export function convertFromJalali(jy: number, jm: number, jd: number): FullDateConversion {
  const safeJm = Math.max(1, Math.min(12, Math.floor(jm) || 1));
  const safeJd = Math.max(1, Math.min(31, Math.floor(jd) || 1));
  const safeJy = Math.floor(jy) || 1405;
  const g = jalaliToGregorian(safeJy, safeJm, safeJd);
  const h = gregorianToHijri(g.year, g.month, g.day);
  const dow = getPersianDayOfWeek(g.year, g.month, g.day);

  // Day of year in Jalali
  let dayOfYear = safeJd;
  if (safeJm <= 6) {
    dayOfYear += (safeJm - 1) * 31;
  } else {
    dayOfYear += 6 * 31 + (safeJm - 7) * 30;
  }
  const totalDays = isJalaliLeapYear(safeJy) ? 366 : 365;
  const remaining = totalDays - dayOfYear;

  return {
    jalali: { year: safeJy, month: safeJm, day: safeJd },
    gregorian: g,
    hijri: h,
    dayOfWeek: dow,
    jalaliMonthName: PERSIAN_MONTH_NAMES[safeJm - 1] || '',
    gregorianMonthName: GREGORIAN_MONTH_NAMES_FA[g.month - 1] || '',
    hijriMonthName: HIJRI_MONTH_NAMES_FA[h.month - 1] || '',
    isJalaliLeap: isJalaliLeapYear(safeJy),
    isGregorianLeap: isGregorianLeapYear(g.year),
    dayOfYearJalali: dayOfYear,
    daysRemainingJalali: remaining
  };
}

export function convertFromGregorian(gy: number, gm: number, gd: number): FullDateConversion {
  const j = gregorianToJalali(gy, gm, gd);
  return convertFromJalali(j.year, j.month, j.day);
}

export function convertFromHijri(hy: number, hm: number, hd: number): FullDateConversion {
  const g = hijriToGregorian(hy, hm, hd);
  return convertFromGregorian(g.year, g.month, g.day);
}
