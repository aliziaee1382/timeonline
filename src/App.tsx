import React, { useState, useEffect } from 'react';
import { ThemeMode } from './types';
import { ThreeBackground } from './components/ThreeBackground';
import { Navbar } from './components/Navbar';
import { HeroClock } from './components/HeroClock';
import { WorldClockGrid } from './components/WorldClockGrid';
import { DateConverter } from './components/DateConverter';
import { MonthlyCalendar } from './components/MonthlyCalendar';
import { PrayerTimesModule } from './components/PrayerTimesModule';
import { TimeTools } from './components/TimeTools';
import { Footer } from './components/Footer';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [activeSection, setActiveSection] = useState<string>('hero-clock');

  // Handle Theme switching on <html> tag & browser theme-color
  useEffect(() => {
    const root = document.documentElement;
    const themeColor = theme === 'dark' ? '#07090e' : '#f8fafc';
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColor);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      
      {/* 3D Three.js Interactive Wireframe Globe & Particles Background */}
      <ThreeBackground theme={theme} />

      {/* Main App Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Navbar */}
        <Navbar
          theme={theme}
          onToggleTheme={toggleTheme}
          activeSection={activeSection}
          onSelectSection={scrollToSection}
        />

        {/* Main Content Sections */}
        <main className="flex-1 flex flex-col space-y-4 sm:space-y-6">
          {/* 1. Hero Section: Live Digital Clock & 3D Analog Chronometer */}
          <HeroClock />

          {/* 2. World Clock Grid */}
          <WorldClockGrid />

          {/* 3. Bi-Directional Date Converter */}
          <DateConverter />

          {/* 4. Smart Monthly Calendar & Events */}
          <MonthlyCalendar />

          {/* 5. Islamic Prayer Times Module */}
          <PrayerTimesModule />

          {/* 6. Precision Stopwatch & Countdown Timer */}
          <TimeTools />
        </main>

        {/* Footer */}
        <Footer />

      </div>
    </div>
  );
}
