import { CityClock, PrayerTimeData } from '../types';
import { pad2 } from './dateConverters';
import { ALL_WORLD_CAPITALS } from '../data/worldCapitals';

export const CITIES_LIST: CityClock[] = ALL_WORLD_CAPITALS;

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

function sinD(d: number) { return Math.sin(d * DEG_TO_RAD); }
function cosD(d: number) { return Math.cos(d * DEG_TO_RAD); }
function tanD(d: number) { return Math.tan(d * DEG_TO_RAD); }
function arccosD(x: number) { return Math.acos(Math.max(-1, Math.min(1, x))) * RAD_TO_DEG; }

function floatToTimeStr(f: number): string {
  if (isNaN(f)) return '--:--';
  let hours = Math.floor(f);
  let minutes = Math.floor((f - hours) * 60);
  if (minutes === 60) {
    hours = (hours + 1) % 24;
    minutes = 0;
  }
  hours = (hours % 24 + 24) % 24;
  return `${pad2(hours)}:${pad2(minutes)}`;
}

export function calculatePrayerTimes(lat: number, lng: number, date: Date, timezoneOffsetHours?: number): PrayerTimeData {
  // Day of year
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Timezone offset in hours
  let tz = timezoneOffsetHours;
  if (tz === undefined) {
    tz = -date.getTimezoneOffset() / 60;
  }

  // Fractional year in radians
  const gamma = 2 * Math.PI / 365 * (dayOfYear - 1);

  // Equation of time (minutes)
  const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));

  // Solar declination angle (degrees)
  const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
    - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma)
    - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);
  const declDeg = decl * RAD_TO_DEG;

  // Solar Noon (Dhuhr) in local time hours
  const solarNoon = 12 + tz - (lng / 15) - (eqtime / 60);

  // Helper: hour angle for zenith
  function getHourAngle(zenithDeg: number): number {
    const cosHA = (cosD(zenithDeg) - sinD(lat) * sinD(declDeg)) / (cosD(lat) * cosD(declDeg));
    if (cosHA > 1) return 0; // Sun never rises to this zenith
    if (cosHA < -1) return 180; // Sun never sets below this zenith
    return arccosD(cosHA);
  }

  // Fajr: University of Tehran uses 17.7 deg below horizon => zenith = 107.7 deg
  const haFajr = getHourAngle(90 + 17.7);
  const fajr = solarNoon - haFajr / 15;

  // Sunrise: zenith = 90.833 deg
  const haSunrise = getHourAngle(90.833);
  const sunrise = solarNoon - haSunrise / 15;

  // Sunset: zenith = 90.833 deg
  const sunset = solarNoon + haSunrise / 15;

  // Maghrib: Tehran Institute uses 4.5 deg below horizon after sunset => zenith = 94.5 deg
  const haMaghrib = getHourAngle(90 + 4.5);
  const maghrib = solarNoon + haMaghrib / 15;

  // Asr (Standard: shadow = object length + shadow at noon)
  const noonAltitude = 90 - Math.abs(lat - declDeg);
  const asrAltitude = RAD_TO_DEG * Math.atan(1 / (1 + tanD(90 - noonAltitude)));
  const haAsr = getHourAngle(90 - asrAltitude);
  const asr = solarNoon + haAsr / 15;

  // Isha (Standard ~ 14.0 deg below horizon)
  const haIsha = getHourAngle(90 + 14.0);
  const isha = solarNoon + haIsha / 15;

  // Midnight: midpoint between sunset and next fajr (or sunset to sunrise)
  let midnight = sunset + (24 + fajr - sunset) / 2;
  if (midnight >= 24) midnight -= 24;

  const times = {
    fajr: floatToTimeStr(fajr),
    sunrise: floatToTimeStr(sunrise),
    dhuhr: floatToTimeStr(solarNoon),
    asr: floatToTimeStr(asr),
    sunset: floatToTimeStr(sunset),
    maghrib: floatToTimeStr(maghrib),
    isha: floatToTimeStr(isha),
    midnight: floatToTimeStr(midnight),
  };

  // Find next prayer relative to current local time of the target timezone
  const nowHours = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  const schedule = [
    { key: 'fajr', nameFa: 'اذان صبح', val: fajr },
    { key: 'sunrise', nameFa: 'طلوع آفتاب', val: sunrise },
    { key: 'dhuhr', nameFa: 'اذان ظهر', val: solarNoon },
    { key: 'sunset', nameFa: 'غروب آفتاب', val: sunset },
    { key: 'maghrib', nameFa: 'اذان مغرب', val: maghrib },
    { key: 'midnight', nameFa: 'نیمه‌شب شرعی', val: midnight < solarNoon ? midnight + 24 : midnight },
  ];

  let next = schedule.find(item => item.val > nowHours);
  let remMinutes = 0;
  if (!next) {
    // Next day's fajr
    const nextFajrVal = fajr + 24;
    remMinutes = Math.round((nextFajrVal - nowHours) * 60);
    next = schedule[0];
  } else {
    remMinutes = Math.round((next.val - nowHours) * 60);
  }

  return {
    ...times,
    nextPrayer: {
      name: next.key,
      nameFa: next.nameFa,
      time: floatToTimeStr(next.val % 24),
      remainingMinutes: remMinutes
    }
  };
}
