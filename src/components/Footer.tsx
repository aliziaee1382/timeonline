import React from 'react';
import { ArrowUp, Clock, Heart, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-xl mt-16 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-violet-400" />
          <span className="font-semibold text-slate-200">
            سامانه ساعت جهانی، تقویم و مبدل تاریخ آنلاین
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-500">
            طراحی و توسعه توسط{' '}
            <a
              href="https://ali0003.ir"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-mono font-semibold underline underline-offset-4 decoration-cyan-500/40 hover:decoration-cyan-400 transition-colors"
            >
              0003
            </a>
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span>محاسبات نجومی دقیق تقویم جلالی و اوقات شرعی</span>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-all text-xs"
            title="بازگشت به ابتدای صفحه"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>بالا</span>
          </button>
        </div>

      </div>
    </footer>
  );
};
