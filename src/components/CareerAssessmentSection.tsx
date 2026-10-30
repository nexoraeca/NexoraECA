import React, { useState } from 'react';
import { Compass, Sparkles, ArrowRight, Brain, Target, Award, CheckCircle, ChevronRight, BookOpen, Building } from 'lucide-react';

interface CareerAssessmentSectionProps {
  onStartAssessment?: () => void;
}

export default function CareerAssessmentSection({ onStartAssessment }: CareerAssessmentSectionProps) {
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [sampleStep, setSampleStep] = useState(1);
  const [sampleAnswer, setSampleAnswer] = useState<number | null>(null);

  const flowSteps = [
    { name: 'Assessment', desc: 'Psychometric & Aptitude', icon: Brain, color: 'bg-blue-50 text-[#0057D9] border-blue-200' },
    { name: 'Strengths', desc: 'Core Competency Mapping', icon: Sparkles, color: 'bg-amber-50 text-amber-600 border-amber-200' },
    { name: 'Career Options', desc: 'Industry Roles & Trajectory', icon: Target, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    { name: 'Programs', desc: 'Matching Degree Streams', icon: BookOpen, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    { name: 'Colleges', desc: 'Accredited Universities', icon: Building, color: 'bg-rose-50 text-rose-600 border-rose-200' }
  ];

  const handleStart = () => {
    if (onStartAssessment) {
      onStartAssessment();
    } else {
      setShowSampleModal(true);
    }
  };

  return (
    <section className="py-20 bg-white border-b border-slate-200/80 relative overflow-hidden" id="career-assessment-section">
      {/* Background Accent */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-blue-50/70 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Content Box */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 rounded-3xl p-8 sm:p-12 lg:p-14 text-white shadow-xl relative overflow-hidden border border-slate-800">
          
          {/* Subtle decorative elements */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
            <Compass className="h-96 w-96 text-white" />
          </div>

          <div className="max-w-3xl space-y-5 relative z-10 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5" />
              Scientific Career Guidance
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Not Sure What Career Is Right for You?
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Take a structured career assessment, understand your strengths, explore suitable career options, and discover matching programs and colleges.
            </p>

            {/* Structured 5-Phase Horizontal Flow */}
            <div className="py-6">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-left">
                Your 5-Step Career Mapping Flow:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {flowSteps.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div 
                      key={idx}
                      className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-left flex flex-col justify-between space-y-2 hover:bg-white/15 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-xl border ${step.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">0{idx + 1}</span>
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-white block">{step.name}</span>
                        <span className="text-[10px] text-slate-300 line-clamp-1">{step.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={handleStart}
                className="px-8 py-4 bg-[#0057D9] hover:bg-[#004dc2] text-white font-bold rounded-2xl shadow-lg shadow-[#0057D9]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 text-sm"
                id="career-assessment-start-btn"
              >
                Start Career Assessment
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
              <a 
                href="#apply-online-section"
                className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-2xl border border-white/20 transition-all flex items-center justify-center gap-2 text-sm"
              >
                Request 1-on-1 Counselling
              </a>
            </div>

          </div>

        </div>

      </div>

      {/* SAMPLE ASSESSMENT MODAL */}
      {showSampleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 text-slate-900 animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-[#0057D9]">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">NEXORA Career Aptitude Sample</h3>
                  <p className="text-xs text-slate-500">Quick Skill & Interest Diagnostic</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSampleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-xs font-bold text-[#0057D9] uppercase tracking-wider">
                Question 01 of 03
              </div>
              <p className="text-sm font-bold text-slate-800">
                When faced with a complex problem in school or daily life, which activity energizes you most?
              </p>

              <div className="space-y-2.5">
                {[
                  'Breaking it down logically into step-by-step algorithms or code.',
                  'Collaborating with peers, organizing teams, and pitching viable solutions.',
                  'Analyzing market trends, financial balance sheets, and numerical outcomes.',
                  'Designing visual sketches, creative user experiences, or physical models.'
                ].map((opt, i) => (
                  <button 
                    key={i}
                    onClick={() => setSampleAnswer(i)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                      sampleAnswer === i 
                        ? 'bg-blue-50 border-[#0057D9] text-[#0057D9] font-bold shadow-xs' 
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                    }`}
                  >
                    <span>{opt}</span>
                    {sampleAnswer === i && <CheckCircle className="h-4 w-4 text-[#0057D9] shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-500">
                {sampleAnswer !== null ? 'Ready to evaluate!' : 'Select an answer to proceed'}
              </span>
              <a 
                href="#apply-online-section"
                onClick={() => setShowSampleModal(false)}
                className="px-6 py-2.5 bg-[#0057D9] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#004dc2] transition-all flex items-center gap-1.5"
              >
                Continue Full Assessment
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
