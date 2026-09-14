import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Flag, Bell, Sparkles } from 'lucide-react';
import { StopwatchLap } from '../types';
import { toPersianDigits, pad2 } from '../utils/dateConverters';

export const TimeTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stopwatch' | 'timer'>('stopwatch');

  // --- STOPWATCH STATE ---
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchTime, setStopwatchTime] = useState(0); // in ms
  const [laps, setLaps] = useState<StopwatchLap[]>([]);
  const stopwatchRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (stopwatchRunning) {
      lastTimeRef.current = performance.now() - stopwatchTime;
      const step = () => {
        setStopwatchTime(performance.now() - lastTimeRef.current);
        stopwatchRef.current = requestAnimationFrame(step);
      };
      stopwatchRef.current = requestAnimationFrame(step);
    } else {
      if (stopwatchRef.current) cancelAnimationFrame(stopwatchRef.current);
    }
    return () => {
      if (stopwatchRef.current) cancelAnimationFrame(stopwatchRef.current);
    };
  }, [stopwatchRunning]);

  const toggleStopwatch = () => setStopwatchRunning(!stopwatchRunning);

  const resetStopwatch = () => {
    setStopwatchRunning(false);
    setStopwatchTime(0);
    setLaps([]);
  };

  const addLap = () => {
    const prevOverall = laps.length > 0 ? laps[0].overallTime : 0;
    const lapTime = stopwatchTime - prevOverall;
    const newLap: StopwatchLap = {
      id: laps.length + 1,
      lapTime,
      overallTime: stopwatchTime,
    };
    setLaps([newLap, ...laps]);
  };

  const formatStopwatchTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return {
      minutes: pad2(m),
      seconds: pad2(s),
      centiseconds: pad2(centiseconds),
    };
  };

  // --- COUNTDOWN TIMER STATE ---
  const [totalTimerSeconds, setTotalTimerSeconds] = useState(300); // 5 mins default
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('5');
  const [customSeconds, setCustomSeconds] = useState('0');
  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setTimerRunning(false);
            playVintageMechanicalAlarmSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerRunning]);

  // Audio synthesis: Authentic vintage mechanical wind-up alarm clock (ساعت کوکی مکانیکی دوزنگه)
  const playVintageMechanicalAlarmSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const strikeRate = 22; // ~22 strikes per second (rapid oscillating hammer between twin brass bells)
      const totalStrikes = 66; // ~3 seconds of authentic mechanical ringing

      for (let i = 0; i < totalStrikes; i++) {
        const strikeTime = now + (i / strikeRate);
        const isBellOne = i % 2 === 0;
        const baseFreq = isBellOne ? 2080 : 2520; // twin metallic bells frequencies
        const overtoneFreq = isBellOne ? 4160 : 5040;

        // Primary metallic bell oscillator
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(baseFreq, strikeTime);

        // High harmonic metallic overtone
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(overtoneFreq, strikeTime);

        // Clang hammer impact
        const oscBody = ctx.createOscillator();
        const gainBody = ctx.createGain();
        oscBody.type = 'square';
        oscBody.frequency.setValueAtTime(isBellOne ? 640 : 720, strikeTime);

        const strikeDuration = 0.052;
        gain1.gain.setValueAtTime(0.3, strikeTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, strikeTime + strikeDuration);

        gain2.gain.setValueAtTime(0.12, strikeTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, strikeTime + strikeDuration);

        gainBody.gain.setValueAtTime(0.06, strikeTime);
        gainBody.gain.exponentialRampToValueAtTime(0.001, strikeTime + 0.025);

        osc1.connect(gain1);
        osc2.connect(gain2);
        oscBody.connect(gainBody);

        gain1.connect(ctx.destination);
        gain2.connect(ctx.destination);
        gainBody.connect(ctx.destination);

        osc1.start(strikeTime);
        osc1.stop(strikeTime + strikeDuration + 0.01);

        osc2.start(strikeTime);
        osc2.stop(strikeTime + strikeDuration + 0.01);

        oscBody.start(strikeTime);
        oscBody.stop(strikeTime + 0.03);
      }
    } catch {
      // AudioContext handling
    }
  };

  const applyCustomTimer = () => {
    const mins = parseInt(customMinutes, 10) || 0;
    const secs = parseInt(customSeconds, 10) || 0;
    const total = mins * 60 + secs;
    if (total > 0) {
      setTotalTimerSeconds(total);
      setRemainingSeconds(total);
      setTimerRunning(false);
    }
  };

  const setPreset = (secs: number) => {
    setTotalTimerSeconds(secs);
    setRemainingSeconds(secs);
    setTimerRunning(false);
  };

  const toggleTimer = () => {
    if (remainingSeconds === 0) {
      setRemainingSeconds(totalTimerSeconds);
    }
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setRemainingSeconds(totalTimerSeconds);
  };

  // Timer Progress Calculation
  const progressRatio = totalTimerSeconds > 0 ? remainingSeconds / totalTimerSeconds : 0;
  const radius = 96;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const timerMins = Math.floor(remainingSeconds / 60);
  const timerSecs = remainingSeconds % 60;

  const sw = formatStopwatchTime(stopwatchTime);

  return (
    <section id="time-tools" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="rounded-3xl backdrop-blur-2xl bg-slate-900/70 dark:bg-slate-900/70 light:bg-white/80 border border-violet-500/20 dark:border-violet-500/20 light:border-slate-200 shadow-2xl p-6 sm:p-8 md:p-10">
        
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/20">
                <Timer className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                ابزارهای دقیق سنجش زمان
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              کرنومتر با دقت صدم ثانیه و تایمر شمارش معکوس با نمودار دایره‌ای پیوسته
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-800/90 rounded-2xl border border-slate-700 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('stopwatch')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'stopwatch'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              کرنومتر (Stopwatch)
            </button>
            <button
              onClick={() => setActiveTab('timer')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'timer'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              تایمر معکوس (Timer)
            </button>
          </div>
        </div>

        {/* STOPWATCH TAB */}
        {activeTab === 'stopwatch' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">
            {/* Display & Controls */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-slate-950/40 border border-slate-800/80">
              
              <div dir="ltr" style={{ direction: 'ltr' }} className="font-en-num font-mono tracking-wider font-extrabold text-5xl sm:text-6xl md:text-7xl text-white my-6 drop-shadow-md">
                <span>{sw.minutes}</span>
                <span className="text-cyan-400 mx-1">:</span>
                <span>{sw.seconds}</span>
                <span className="text-xl sm:text-2xl text-violet-400 ml-2">
                  .{sw.centiseconds}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  id="stopwatch-start-pause-btn"
                  onClick={toggleStopwatch}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg ${
                    stopwatchRunning
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                      : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/30'
                  }`}
                >
                  {stopwatchRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{stopwatchRunning ? 'توقف' : 'شروع'}</span>
                </button>

                <button
                  id="stopwatch-lap-btn"
                  onClick={addLap}
                  disabled={!stopwatchRunning && stopwatchTime === 0}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 disabled:opacity-40 transition-all"
                >
                  <Flag className="w-4 h-4 text-cyan-400" />
                  <span>ثبت دور (Lap)</span>
                </button>

                <button
                  id="stopwatch-reset-btn"
                  onClick={resetStopwatch}
                  disabled={stopwatchTime === 0}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 disabled:opacity-40 transition-all"
                  title="بازنشانی"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Laps Table */}
            <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-3 border-b border-slate-700 mb-2">
                <span>شماره دور</span>
                <span>زمان دور</span>
                <span>زمان کل</span>
              </div>

              {laps.length > 0 ? (
                <div className="space-y-1.5">
                  {laps.map((lap) => {
                    const lFmt = formatStopwatchTime(lap.lapTime);
                    const oFmt = formatStopwatchTime(lap.overallTime);
                    return (
                      <div
                        key={lap.id}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/60 text-xs font-mono font-en-num border border-slate-700/40"
                      >
                        <span className="text-violet-400 font-bold font-sans">
                          دور #{toPersianDigits(lap.id)}
                        </span>
                        <span className="text-slate-200">
                          {lFmt.minutes}:{lFmt.seconds}.{lFmt.centiseconds}
                        </span>
                        <span className="text-slate-400">
                          {oFmt.minutes}:{oFmt.seconds}.{oFmt.centiseconds}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs italic">
                  هنوز دوری ثبت نشده است. با زدن دکمه «ثبت دور» می‌توانید رکوردگیری کنید.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TIMER TAB */}
        {activeTab === 'timer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">
            
            {/* Circular Progress Gauge */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                
                {/* SVG Progress Circle */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    className="stroke-slate-800"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="url(#timerGradient)"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                  <defs>
                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Inner Time Display */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <div dir="ltr" style={{ direction: 'ltr' }} className="font-en-num font-mono font-extrabold text-4xl sm:text-5xl text-white">
                    <span>{pad2(timerMins)}</span>
                    <span className="text-cyan-400 mx-1 animate-pulse">:</span>
                    <span>{pad2(timerSecs)}</span>
                  </div>
                  <span className="text-xs text-slate-400 mt-1">
                    {remainingSeconds === 0 ? 'زمان به پایان رسید!' : 'شمارش معکوس'}
                  </span>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  id="timer-start-pause-btn"
                  onClick={toggleTimer}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg ${
                    timerRunning
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/30'
                  }`}
                >
                  {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{timerRunning ? 'توقف' : 'شروع'}</span>
                </button>

                <button
                  id="timer-reset-btn"
                  onClick={resetTimer}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm transition-all"
                  title="بازنشانی"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>تنظیم مجدد</span>
                </button>
              </div>
            </div>

            {/* Presets & Custom Input */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Presets */}
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  زمان‌های از پیش تعیین‌شده:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '۱ دقیقه', sec: 60 },
                    { label: '۵ دقیقه', sec: 300 },
                    { label: '۱۰ دقیقه', sec: 600 },
                    { label: '۱۵ دقیقه', sec: 900 },
                    { label: '۲۵ دقیقه (پومودورو)', sec: 1500 },
                    { label: '۴۵ دقیقه', sec: 2700 },
                  ].map((preset) => (
                    <button
                      key={preset.sec}
                      onClick={() => setPreset(preset.sec)}
                      className={`p-2.5 rounded-xl text-xs font-semibold transition-all border ${
                        totalTimerSeconds === preset.sec
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
                <span className="text-xs font-semibold text-slate-300 block mb-3">
                  تنظیم زمان دلخواه:
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-400 block mb-1">دقیقه</label>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-mono text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-400 block mb-1">ثانیه</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={customSeconds}
                      onChange={(e) => setCustomSeconds(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-mono text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                  <button
                    onClick={applyCustomTimer}
                    className="self-end px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    اعمال
                  </button>
                </div>
              </div>

              {/* Alert Note */}
              <div className="flex items-center gap-2.5 text-xs text-amber-200/90 bg-amber-500/10 p-3 rounded-xl border border-amber-500/25">
                <Bell className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>با اتمام زمان صدا پخش میشه تا متوجه بشید!</span>
              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
};
