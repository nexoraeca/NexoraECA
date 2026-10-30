import React, { useState } from 'react';
import { ArrowRight, PhoneCall, Sparkles, CheckCircle2, User, Building2 } from 'lucide-react';

interface CompanyLogo {
  name: string;
  badgeBg: string;
  textColor: string;
  symbol: string;
}

const COMPANIES: CompanyLogo[] = [
  { name: 'amazon', badgeBg: 'bg-white', textColor: 'text-slate-900', symbol: 'amazon' },
  { name: 'CRED', badgeBg: 'bg-white', textColor: 'text-slate-900', symbol: 'CRED' },
  { name: 'Flipkart', badgeBg: 'bg-white', textColor: 'text-[#2874F0]', symbol: 'Flipkart 🛍️' },
  { name: 'meesho', badgeBg: 'bg-white', textColor: 'text-[#9b2c7e]', symbol: 'meesho' },
  { name: 'Google', badgeBg: 'bg-white', textColor: 'text-[#EA4335]', symbol: 'Google' },
  { name: 'Microsoft', badgeBg: 'bg-white', textColor: 'text-[#00A4EF]', symbol: 'Microsoft' },
  { name: 'Swiggy', badgeBg: 'bg-white', textColor: 'text-[#FC8019]', symbol: 'Swiggy 🛵' },
  { name: 'Uber', badgeBg: 'bg-white', textColor: 'text-slate-900', symbol: 'Uber' },
  { name: 'Zomato', badgeBg: 'bg-white', textColor: 'text-[#E23744]', symbol: 'zomato' },
  { name: 'Razorpay', badgeBg: 'bg-white', textColor: 'text-[#0C2340]', symbol: 'Razorpay' }
];

interface MasterclassesAndCounsellorSectionProps {
  onTalkToCounsellor?: () => void;
}

export default function MasterclassesAndCounsellorSection({ onTalkToCounsellor }: MasterclassesAndCounsellorSectionProps) {
  const [showCounsellorModal, setShowCounsellorModal] = useState<boolean>(false);
  const [counsellorForm, setCounsellorForm] = useState({ name: '', phone: '', email: '', preferredCourse: 'Computer Science & AI' });
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleCounsellorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setShowCounsellorModal(false);
      alert('Thank you! Our Senior Academic Counsellor will call you within 15 minutes.');
    }, 1200);
  };

  return (
    <section className="py-14 bg-white relative overflow-hidden border-t border-slate-100" id="masterclasses-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* TOP CARD: MASTERCLASSES LED BY ENGINEERS */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-[32px] p-6 sm:p-10 lg:p-12 shadow-sm relative overflow-hidden">
          <div className="space-y-6 max-w-4xl">
            
            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold text-slate-900 tracking-tight leading-tight">
              Masterclasses Led by <span className="text-[#0057D9] font-bold">Engineers</span> from Top Tech Companies like
            </h2>

            {/* HORIZONTAL CONTINUOUS SCROLLING COMPANY LOGOS MARQUEE */}
            <div className="relative py-2 overflow-hidden w-full">
              {/* Gradient fade masks on left and right edges */}
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

              {/* Animated Marquee Strip */}
              <div className="flex items-center gap-3 animate-marquee whitespace-nowrap will-change-transform">
                {/* Doubled list to ensure seamless infinite scroll */}
                {[...COMPANIES, ...COMPANIES].map((comp, idx) => (
                  <div 
                    key={`${comp.name}-${idx}`}
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all shrink-0 cursor-default select-none group"
                  >
                    {comp.name === 'amazon' && (
                      <div className="flex items-center gap-1 font-bold text-slate-900 text-sm">
                        <span className="font-extrabold tracking-tight">amazon</span>
                        <span className="text-amber-500 font-black text-xs">smile</span>
                      </div>
                    )}
                    {comp.name === 'CRED' && (
                      <div className="flex items-center gap-1 font-mono font-black text-slate-900 text-xs tracking-wider">
                        <span className="px-1 py-0.5 border border-slate-900 rounded">C</span>
                        <span>CRED</span>
                      </div>
                    )}
                    {comp.name === 'Flipkart' && (
                      <div className="flex items-center gap-1 font-bold text-[#2874F0] text-xs">
                        <span>Flipkart</span>
                        <span className="text-amber-400 font-black text-xs">🛍️</span>
                      </div>
                    )}
                    {comp.name === 'meesho' && (
                      <div className="font-extrabold text-[#9b2c7e] text-xs tracking-wide">
                        meesho
                      </div>
                    )}
                    {comp.name === 'Google' && (
                      <div className="font-bold text-slate-800 text-xs flex items-center gap-0.5">
                        <span className="text-[#4285F4]">G</span>
                        <span className="text-[#EA4335]">o</span>
                        <span className="text-[#FBBC05]">o</span>
                        <span className="text-[#4285F4]">g</span>
                        <span className="text-[#34A853]">l</span>
                        <span className="text-[#EA4335]">e</span>
                      </div>
                    )}
                    {comp.name === 'Microsoft' && (
                      <div className="font-semibold text-slate-700 text-xs flex items-center gap-1">
                        <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
                          <span className="bg-[#F25022]"></span>
                          <span className="bg-[#7FBA00]"></span>
                          <span className="bg-[#00A4EF]"></span>
                          <span className="bg-[#FFB900]"></span>
                        </div>
                        <span>Microsoft</span>
                      </div>
                    )}
                    {comp.name === 'Swiggy' && (
                      <div className="font-bold text-[#FC8019] text-xs tracking-tight">
                        SWIGGY
                      </div>
                    )}
                    {comp.name === 'Uber' && (
                      <div className="font-black text-slate-900 text-xs tracking-widest uppercase">
                        Uber
                      </div>
                    )}
                    {comp.name === 'Zomato' && (
                      <div className="font-black italic text-[#E23744] text-xs">
                        zomato
                      </div>
                    )}
                    {comp.name === 'Razorpay' && (
                      <div className="font-black text-[#0C2340] text-xs">
                        Razorpay
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Know More Button */}
            <div className="pt-2">
              <a
                href="#courses-section"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#0057D9] text-[#0057D9] hover:bg-[#0057D9] hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs group"
              >
                Know More
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

          </div>
        </div>

        {/* BOTTOM CARD: NEED HELP CHOOSING THE RIGHT UNIVERSITY BANNER */}
        <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 border border-blue-100 rounded-[32px] p-8 sm:p-12 text-center relative overflow-hidden shadow-sm">
          
          {/* Decorative Delicate Curved Accent Lines */}
          <svg 
            className="absolute left-0 top-0 bottom-0 h-full w-48 text-[#0057D9]/15 pointer-events-none"
            viewBox="0 0 200 200" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.2"
          >
            <path d="M-20,180 Q60,120 40,60 T140,-20" />
            <path d="M-40,160 Q80,140 60,40 T160,-40" />
          </svg>

          <svg 
            className="absolute right-0 top-0 bottom-0 h-full w-48 text-[#0057D9]/15 pointer-events-none rotate-180"
            viewBox="0 0 200 200" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.2"
          >
            <path d="M-20,180 Q60,120 40,60 T140,-20" />
            <path d="M-40,160 Q80,140 60,40 T160,-40" />
          </svg>

          {/* Content */}
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <p className="text-[#0057D9] text-xs sm:text-sm font-semibold uppercase tracking-wider">
              Our expert counsellors are just a click away
            </p>
            
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-bold text-slate-900 tracking-tight">
              Need Help Choosing the Right University for You?
            </h3>

            <div className="pt-2">
              <button
                onClick={() => setShowCounsellorModal(true)}
                className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#0057D9] hover:bg-[#004dc2] text-white font-bold rounded-xl shadow-md hover:shadow-lg shadow-[#0057D9]/20 transition-all text-xs sm:text-sm cursor-pointer"
              >
                <span>Talk to a Counsellor</span>
                <PhoneCall className="h-4 w-4 text-amber-300" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* COUNSELLOR POPUP MODAL */}
      {showCounsellorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] bg-blue-50 text-[#0057D9] font-bold px-2.5 py-0.5 rounded-full uppercase border border-blue-100">
                  Free 1-on-1 Academic Counselling
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-1">Talk to an Academic Expert</h4>
              </div>
              <button 
                onClick={() => setShowCounsellorModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Get personalized guidance on university cutoffs, syllabus comparison, scholarships, and career roadmap.
            </p>

            <form onSubmit={handleCounsellorSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Student Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Rahul Verma"
                  value={counsellorForm.name}
                  onChange={(e) => setCounsellorForm({ ...counsellorForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#0057D9]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Mobile / WhatsApp Number</label>
                <input 
                  type="tel" 
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={counsellorForm.phone}
                  onChange={(e) => setCounsellorForm({ ...counsellorForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#0057D9]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Preferred Engineering Branch</label>
                <select 
                  value={counsellorForm.preferredCourse}
                  onChange={(e) => setCounsellorForm({ ...counsellorForm, preferredCourse: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#0057D9]"
                >
                  <option value="Computer Science & AI">Computer Science & AI</option>
                  <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                  <option value="Data Science & Big Data">Data Science & Big Data</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitted}
                className="w-full py-3 bg-[#0057D9] hover:bg-[#004dc2] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-[#0057D9]/20 transition-all"
              >
                {isSubmitted ? 'Connecting with Counsellor...' : 'Request Instant Callback 📞'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Marquee Animation Keyframes injected in CSS */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 22s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

    </section>
  );
}
