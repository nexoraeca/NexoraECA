import React, { useState } from 'react';
import { ArrowRight, Sparkles, Building, Search, GraduationCap, Award, MapPin, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  onQuickSearch: (filters: { course: string; state: string; score: string; budget?: string }) => void;
}

export default function HeroSection({ onQuickSearch }: HeroSectionProps) {
  const [studyField, setStudyField] = useState('Engineering');
  const [preferredState, setPreferredState] = useState('Telangana');
  const [score, setScore] = useState('85%');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onQuickSearch({
      course: studyField,
      state: preferredState,
      score
    });
    const collegeSection = document.getElementById('colleges-section');
    if (collegeSection) {
      collegeSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero-section" className="relative bg-gradient-to-b from-white via-slate-50/40 to-white pt-12 pb-20 overflow-hidden">
      {/* Subtle geometric dot grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#0057D9 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT COLUMN: HERO HEADLINE, VALUE PROP & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#0057D9] text-xs font-bold uppercase tracking-wider shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              EMPOWERING 10,000+ INDIAN ASPIRANTS
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Build Your Future with <br className="hidden sm:inline" />
              India's <span className="text-[#0057D9] relative inline-block">
                Best Colleges
                <span className="absolute bottom-1 left-0 w-full h-1.5 bg-[#0057D9]/15 rounded-full -z-10" />
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Discover the right college, compare programs, assess your strengths, and get personalized admission guidance — all in one platform.
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-2">
              <a 
                href="#apply-online-section" 
                className="px-7 py-3.5 bg-[#0057D9] hover:bg-[#004dc2] text-white font-bold rounded-xl shadow-md shadow-[#0057D9]/20 hover:shadow-lg hover:shadow-[#0057D9]/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm"
                id="hero-apply-btn"
              >
                Apply Online
                <ArrowRight className="h-4 w-4" />
              </a>
              <a 
                href="#colleges-section" 
                className="px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm"
                id="hero-explore-btn"
              >
                <Building className="h-4 w-4 text-slate-500" />
                Explore Colleges
              </a>
            </div>

            {/* Pan-India Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Verified Partner Universities</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Zero Admission Middlemen</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Free Expert Counselling</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: INTERACTIVE "FIND YOUR RIGHT COLLEGE" CARD */}
          <div className="lg:col-span-5 relative">
            
            {/* Ambient subtle glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#0057D9]/10 to-amber-500/10 rounded-3xl blur-xl opacity-70 pointer-events-none" />

            <div className="relative bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-7 space-y-5">
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0057D9]">
                    <Search className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Find Your Right College</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Quick Pan-India Matching</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  2026 Admissions
                </span>
              </div>

              {/* Form Inputs */}
              <form onSubmit={handleHeroSearch} className="space-y-3.5 text-left">
                
                {/* 1. What do you want to study? */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    What do you want to study?
                  </label>
                  <select 
                    value={studyField}
                    onChange={(e) => setStudyField(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0057D9] focus:bg-white focus:ring-1 focus:ring-[#0057D9] transition-all cursor-pointer"
                  >
                    <option value="Engineering">Engineering (B.Tech / AI / CSE)</option>
                    <option value="Management">Management (BBA / MBA)</option>
                    <option value="Computer Applications">Computer Applications (BCA / MCA)</option>
                    <option value="Commerce">Commerce & Analytics (B.Com / BBA)</option>
                    <option value="Healthcare">Healthcare & Allied Sciences</option>
                    <option value="Sciences">Sciences & Creative Design</option>
                  </select>
                </div>

                {/* 2. Preferred State */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Preferred State
                  </label>
                  <select 
                    value={preferredState}
                    onChange={(e) => setPreferredState(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0057D9] focus:bg-white focus:ring-1 focus:ring-[#0057D9] transition-all cursor-pointer"
                  >
                    <option value="Telangana">Telangana</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="All">All States (Pan-India)</option>
                  </select>
                </div>

                {/* 3. Your Score */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Your Score
                  </label>
                  <input 
                    type="text"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="e.g. 85%"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0057D9] focus:bg-white focus:ring-1 focus:ring-[#0057D9] transition-all"
                  />
                </div>

                {/* Primary Find Colleges CTA */}
                <button 
                  type="submit"
                  className="w-full py-3.5 bg-[#0057D9] hover:bg-[#004dc2] text-white font-bold rounded-xl shadow-md shadow-[#0057D9]/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider pt-3"
                  id="hero-find-colleges-btn"
                >
                  Find Colleges
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Supporting Statistics below card */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="block text-xs font-extrabold text-slate-900">100+</span>
                  <span className="text-[10px] text-slate-500 font-medium leading-none">Partner Colleges</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="block text-xs font-extrabold text-slate-900">35+</span>
                  <span className="text-[10px] text-slate-500 font-medium leading-none">Programs</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="block text-xs font-extrabold text-[#0057D9]">Pan-India</span>
                  <span className="text-[10px] text-slate-500 font-medium leading-none">Reach</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
