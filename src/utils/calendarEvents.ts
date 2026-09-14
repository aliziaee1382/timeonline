export interface CalendarEvent {
  title: string;
  isHoliday: boolean;
}

// Fixed Solar events (month: 1-12, day: 1-31)
const SOLAR_EVENTS: Record<string, CalendarEvent[]> = {
  '1-1': [{ title: 'آغاز سال نو / جشن نوروز', isHoliday: true }],
  '1-2': [{ title: 'عید نوروز', isHoliday: true }],
  '1-3': [{ title: 'عید نوروز', isHoliday: true }],
  '1-4': [{ title: 'عید نوروز', isHoliday: true }],
  '1-12': [{ title: 'روز جمهوری اسلامی ایران', isHoliday: true }],
  '1-13': [{ title: 'روز طبیعت (سیزده‌بدر)', isHoliday: true }],
  '1-25': [{ title: 'روز بزرگداشت عطار نیشابوری', isHoliday: false }],
  '2-1': [{ title: 'روز بزرگداشت سعدی شیرازی', isHoliday: false }],
  '2-2': [{ title: 'جشن اردیبهشت‌گان', isHoliday: false }],
  '2-25': [{ title: 'روز بزرگداشت حکیم ابوالقاسم فردوسی', isHoliday: false }],
  '2-28': [{ title: 'روز بزرگداشت حکیم عمر خیام', isHoliday: false }],
  '3-1': [{ title: 'روز بزرگداشت ملاصدرا', isHoliday: false }],
  '3-3': [{ title: 'فتح خرمشهر / روز مقاومت', isHoliday: false }],
  '3-14': [{ title: 'رحلت امام خمینی', isHoliday: true }],
  '3-15': [{ title: 'قیام خونین ۱۵ خرداد', isHoliday: true }],
  '4-1': [{ title: 'جشن آب‌پاشونک / آغاز تابستان', isHoliday: false }],
  '4-10': [{ title: 'جشن نیلوفر / تیرگان', isHoliday: false }],
  '4-14': [{ title: 'روز قلم', isHoliday: false }],
  '5-8': [{ title: 'روز بزرگداشت شیخ شهاب‌الدین سهروردی', isHoliday: false }],
  '5-21': [{ title: 'روز حمایت از صنایع کوچک', isHoliday: false }],
  '6-1': [{ title: 'روز پزشک (بزرگداشت ابوعلی سینا)', isHoliday: false }],
  '6-5': [{ title: 'روز داروساز (بزرگداشت زکریای رازی)', isHoliday: false }],
  '6-27': [{ title: 'روز شعر و ادب فارسی (بزرگداشت شهریار)', isHoliday: false }],
  '7-1': [{ title: 'آغاز سال تحصیلی / جشن مهرگان', isHoliday: false }],
  '7-8': [{ title: 'روز بزرگداشت مولوی بلخی', isHoliday: false }],
  '7-20': [{ title: 'روز بزرگداشت خواجه حافظ شیرازی', isHoliday: false }],
  '8-7': [{ title: 'روز بزرگداشت کوروش بزرگ', isHoliday: false }],
  '8-24': [{ title: 'روز کتاب و کتابخوانی', isHoliday: false }],
  '9-16': [{ title: 'روز دانشجو', isHoliday: false }],
  '9-25': [{ title: 'روز پژوهش', isHoliday: false }],
  '9-30': [{ title: 'جشن شب یلدا (طولانی‌ترین شب سال)', isHoliday: false }],
  '10-1': [{ title: 'جشن خرم‌روز / آغاز زمستان', isHoliday: false }],
  '11-12': [{ title: 'آغاز دهه فجر', isHoliday: false }],
  '11-22': [{ title: 'پیروزی انقلاب اسلامی ایران', isHoliday: true }],
  '11-29': [{ title: 'جشن سپندارمذگان (روز مهر و عشق ایرانی)', isHoliday: false }],
  '12-15': [{ title: 'روز درختکاری و هفته منابع طبیعی', isHoliday: false }],
  '12-29': [{ title: 'روز ملی شدن صنعت نفت ایران', isHoliday: true }],
};

// Fixed Lunar (Hijri) events
const LUNAR_EVENTS: Record<string, CalendarEvent[]> = {
  '1-9': [{ title: 'تاسوعای حسینی', isHoliday: true }],
  '1-10': [{ title: 'عاشورای حسینی', isHoliday: true }],
  '2-20': [{ title: 'اربعین حسینی', isHoliday: true }],
  '2-28': [{ title: 'رحلت رسول اکرم (ص) و شهادت امام حسن (ع)', isHoliday: true }],
  '2-29': [{ title: 'شهادت امام رضا (ع)', isHoliday: true }],
  '3-17': [{ title: 'ولادت رسول اکرم (ص) و امام جعفر صادق (ع)', isHoliday: true }],
  '6-3': [{ title: 'شهادت حضرت فاطمه زهرا (س)', isHoliday: true }],
  '7-13': [{ title: 'ولادت امام علی (ع) / روز پدر', isHoliday: true }],
  '7-27': [{ title: 'مبعث حضرت رسول اکرم (ص)', isHoliday: true }],
  '8-15': [{ title: 'ولادت حضرت مهدی (عج) / نیمه شعبان', isHoliday: true }],
  '9-21': [{ title: 'شهادت امام علی (ع)', isHoliday: true }],
  '10-1': [{ title: 'عید سعید فطر', isHoliday: true }],
  '10-2': [{ title: 'تعطیلی به مناسبت عید سعید فطر', isHoliday: true }],
  '10-25': [{ title: 'شهادت امام جعفر صادق (ع)', isHoliday: true }],
  '12-10': [{ title: 'عید سعید قربان', isHoliday: true }],
  '12-18': [{ title: 'عید سعید غدیر خم', isHoliday: true }],
};

export function getEventsForDay(jMonth: number, jDay: number, hMonth?: number, hDay?: number): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const solarKey = `${jMonth}-${jDay}`;
  if (SOLAR_EVENTS[solarKey]) {
    events.push(...SOLAR_EVENTS[solarKey]);
  }

  if (hMonth && hDay) {
    const lunarKey = `${hMonth}-${hDay}`;
    if (LUNAR_EVENTS[lunarKey]) {
      events.push(...LUNAR_EVENTS[lunarKey]);
    }
  }

  return events;
}
