import React from 'react';
import { UserCheck, Search, Compass, Headphones, CheckCircle2, ArrowRight } from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Tell Us About Yourself',
      desc: 'Submit your academic profile and preferences.',
      icon: UserCheck,
      color: 'text-[#0057D9]',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    {
      num: '02',
      title: 'Discover Colleges',
      desc: 'Find colleges and programs matching your profile.',
      icon: Search,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200'
    },
    {
      num: '03',
      title: 'Take Career Assessment',
      desc: 'Understand your strengths, interests, and career direction.',
      icon: Compass,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200'
    },
    {
      num: '04',
      title: 'Get Admission Guidance',
      desc: 'Receive personalized counselling and application support.',
      icon: Headphones,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200'
    },
    {
      num: '05',
      title: 'Apply With Confidence',
      desc: 'Shortlist and apply to the right institution.',
      icon: CheckCircle2,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200'
    }
  ];

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200/80" id="services-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#0057D9] text-xs font-bold uppercase tracking-wider">
            Clear 5-Step Process
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How NEXORA Works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            From initial discovery to final college admission, experience a seamless, student-first journey.
          </p>
        </div>

        {/* 5-Step Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx}
                className="relative bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-[#0057D9]/40 transition-all flex flex-col justify-between group"
              >
                {/* Step Number Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${step.bg} ${step.border} border flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${step.color}`} />
                  </div>
                  <span className="text-xs font-mono font-extrabold text-slate-400 group-hover:text-[#0057D9] transition-colors">
                    {step.num}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-2 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Connecting arrow indicator for desktop except last */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 bg-white border border-slate-200 rounded-full p-1 shadow-xs text-slate-400">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}
