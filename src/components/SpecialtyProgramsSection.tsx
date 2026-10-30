import React from 'react';
import { Landmark, ArrowRight, CheckCircle2, Award, ShieldCheck, Sparkles, BookOpen, Clock, Target } from 'lucide-react';

interface SpecialtyProgramsSectionProps {
  onLearnMore?: (programTitle: string) => void;
}

export default function SpecialtyProgramsSection({ onLearnMore }: SpecialtyProgramsSectionProps) {
  const handleSelect = (stream: string) => {
    if (onLearnMore) {
      onLearnMore(stream);
    } else {
      const el = document.getElementById('colleges-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white via-slate-50/60 to-white border-b border-slate-200/80" id="specialty-programs-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/80 text-purple-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            Specialized Career Tracks
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Specialty Programs & Civil Services Tracks
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            High-impact academic degrees integrated with specialized competitive exam preparation, civil service foundations, and global industry leadership tracks.
          </p>
        </div>

        {/* Priority Specialty Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* HIGH PRIORITY CARD: IAS Integrated Degree */}
          <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950 rounded-3xl p-7 sm:p-9 text-white relative overflow-hidden shadow-xl border border-purple-500/30 flex flex-col justify-between group">
            
            {/* Ambient Background Accents */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Badge & Rating */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs font-extrabold uppercase tracking-wide">
                  <Landmark className="h-3.5 w-3.5 text-purple-300" />
                  Flagship Specialty Program
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-mono text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                  ★ High Selection Rate
                </span>
              </div>

              {/* Title & Tagline */}
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white group-hover:text-purple-200 transition-colors">
                  IAS Integrated Degree
                </h3>
                <p className="text-purple-200/90 text-sm leading-relaxed">
                  Earn a fully accredited Undergraduate Degree (BA / B.Sc / B.Com) while simultaneously completing a structured 3-year UPSC Civil Services Foundation taught by retired civil servants and expert faculty.
                </p>
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-xs">
                  <BookOpen className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-white block">UPSC Prelims + Mains Syllabus</span>
                    <span className="text-purple-200/70 text-[11px]">Integrated General Studies & CSAT modules</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-xs">
                  <Target className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-white block">Daily Answer Writing & Tests</span>
                    <span className="text-purple-200/70 text-[11px]">Mentored evaluations and mock interviews</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-xs">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-white block">Accredited UGC Degree</span>
                    <span className="text-purple-200/70 text-[11px]">Dual graduation safety net</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-xs">
                  <Clock className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-white block">Save 2-3 Years of Prep</span>
                    <span className="text-purple-200/70 text-[11px]">Ready for UPSC right after graduation</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA row */}
            <div className="pt-8 mt-6 border-t border-purple-500/20 flex flex-wrap items-center justify-between gap-4 relative z-10">
              <div className="text-xs text-purple-200">
                <span className="font-mono text-white font-bold block text-sm">3 Years Full-Time</span>
                Degree + IAS Coaching
              </div>
              <button
                onClick={() => handleSelect('IAS Integrated Degree')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-purple-600/30 hover:scale-105 cursor-pointer"
                id="ias-specialty-learn-more-btn"
              >
                Learn More →
              </button>
            </div>

          </div>

          {/* SECONDARY SPECIALTY CARDS */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Card 2: AI & Cloud Computing Super-Specialization */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-[#0057D9] text-[11px] font-extrabold uppercase">
                    Tech & AI Frontier
                  </span>
                  <span className="text-xs font-semibold text-slate-500">4 Years</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  B.Tech in Artificial Intelligence & Robotics
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Project-first engineering curriculum with hands-on GPU labs, prompt engineering, and industrial robotics integration.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">Deep Learning</span>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">LLM Systems</span>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">Robotics Lab</span>
                </div>
              </div>
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#0057D9]">High Corporate Hiring</span>
                <button
                  onClick={() => handleSelect('Engineering')}
                  className="text-xs font-bold text-slate-900 hover:text-[#0057D9] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Learn More →
                </button>
              </div>
            </div>

            {/* Card 3: International Business & Fintech Leadership */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-[11px] font-extrabold uppercase">
                    Management & Fintech
                  </span>
                  <span className="text-xs font-semibold text-slate-500">3 Years</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  BBA in Global Finance & Business Analytics
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dual qualification program with Harvard Business Publishing case studies, Bloomberg Terminal analytics, and startup incubator access.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">Financial Modeling</span>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">Global Trade</span>
                </div>
              </div>
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600">Global Certifications</span>
                <button
                  onClick={() => handleSelect('Management')}
                  className="text-xs font-bold text-slate-900 hover:text-[#0057D9] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Learn More →
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
