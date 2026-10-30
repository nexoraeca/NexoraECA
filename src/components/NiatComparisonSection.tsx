import React from 'react';
import { Check, Sparkles, ArrowRight, ShieldCheck, X } from 'lucide-react';

interface ComparisonRow {
  parameter: string;
  nexoraValue: string;
  traditionalValue: string;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    parameter: 'College Discovery',
    nexoraValue: 'Personalized recommendations',
    traditionalValue: 'Manual search'
  },
  {
    parameter: 'Guidance',
    nexoraValue: 'Personalized counselling',
    traditionalValue: 'Limited guidance'
  },
  {
    parameter: 'Learning',
    nexoraValue: 'Practical and career-focused',
    traditionalValue: 'Often theory-focused'
  },
  {
    parameter: 'Technology',
    nexoraValue: 'Modern digital platform',
    traditionalValue: 'Varies'
  },
  {
    parameter: 'Career Assessment',
    nexoraValue: 'Integrated',
    traditionalValue: 'Often separate'
  },
  {
    parameter: 'College Comparison',
    nexoraValue: 'Easy comparison',
    traditionalValue: 'Time-consuming'
  },
  {
    parameter: 'Application Support',
    nexoraValue: 'Guided process',
    traditionalValue: 'Student-managed'
  }
];

export default function NiatComparisonSection() {
  return (
    <section className="py-20 bg-slate-50/70 relative overflow-hidden border-t border-slate-200/80" id="why-nexora-section">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-blue-100/40 via-sky-50/30 to-indigo-50/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/70 text-[#0057D9] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Transparent Comparison
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Why Choose <span className="text-[#0057D9]">NEXORA Academy?</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto">
            A smarter approach to college discovery, career planning, and admission guidance.
          </p>
        </div>

        {/* COMPARISON TABLE CONTAINER */}
        <div className="relative">
          
          {/* DESKTOP & TABLET VIEW */}
          <div className="hidden md:block relative">
            
            {/* Outer Table Base Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              
              {/* Table Header */}
              <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50/90 font-bold text-sm">
                <div className="col-span-4 py-4 px-6 text-slate-700 uppercase text-xs tracking-wider">
                  Parameter
                </div>
                {/* Center Column Reserved for NEXORA */}
                <div className="col-span-4 py-4 px-6 text-center text-[#0057D9] uppercase text-xs tracking-wider font-extrabold">
                  NEXORA Academy
                </div>
                <div className="col-span-4 py-4 px-6 text-center text-slate-500 uppercase text-xs tracking-wider font-semibold">
                  Traditional Approach
                </div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100">
                {COMPARISON_DATA.map((row, idx) => {
                  const isTinted = idx % 2 === 1;
                  return (
                    <div 
                      key={row.parameter}
                      className={`grid grid-cols-12 items-center min-h-[64px] transition-colors ${
                        isTinted ? 'bg-slate-50/30' : 'bg-white'
                      } hover:bg-blue-50/30`}
                    >
                      {/* Parameter */}
                      <div className="col-span-4 py-3.5 px-6 font-semibold text-slate-800 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0057D9]" />
                        {row.parameter}
                      </div>

                      {/* NEXORA Value */}
                      <div className="col-span-4 py-3.5 px-6 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50/80 border border-blue-200/60 rounded-xl text-[#0057D9] font-bold text-xs">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{row.nexoraValue}</span>
                        </div>
                      </div>

                      {/* Traditional Value */}
                      <div className="col-span-4 py-3.5 px-6 text-center text-xs text-slate-500 font-medium">
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                          <span className="text-slate-400">•</span>
                          {row.traditionalValue}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* MOBILE RESPONSIVE VIEW (Stacked Cards) */}
          <div className="md:hidden space-y-4">
            {COMPARISON_DATA.map((row) => (
              <div key={row.parameter} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2.5">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  {row.parameter}
                </span>
                
                {/* NEXORA Value */}
                <div className="bg-blue-50/80 border border-blue-200/60 p-2.5 rounded-xl flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#0057D9] block uppercase">NEXORA Academy</span>
                    <span className="text-xs font-bold text-slate-900">{row.nexoraValue}</span>
                  </div>
                </div>

                {/* Traditional Approach */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center shrink-0 text-xs">
                    ✕
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 block uppercase">Traditional</span>
                    <span className="text-xs text-slate-600">{row.traditionalValue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Action Callout Button */}
        <div className="mt-12 text-center">
          <a 
            href="#apply-online-section"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#0057D9] hover:bg-[#004dc2] text-white font-bold rounded-2xl shadow-lg shadow-[#0057D9]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
          >
            Apply With Confidence
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

      </div>
    </section>
  );
}

