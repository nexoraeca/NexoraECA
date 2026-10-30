import React from 'react';
import { Building, Compass, Award, Video, ArrowRight, Landmark } from 'lucide-react';

export default function StudentNeedsSection() {
  const needs = [
    {
      title: 'College Admissions',
      desc: 'Find and apply to suitable colleges with verified academic curriculum and recognized degree options.',
      icon: Building,
      href: '#colleges-section',
      badge: 'Core Gateway',
      color: 'text-[#0057D9]',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    {
      title: 'Scholarships & Loans',
      desc: 'Discover government/CSR scholarships and compare bank education loan guidance for your higher education funding.',
      icon: Landmark,
      href: '#scholarships-loans-section',
      badge: 'Funding Desk',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200'
    },
    {
      title: 'Career Assessment',
      desc: 'Understand your strengths and explore suitable career paths with structured psychometric evaluation.',
      icon: Compass,
      href: '#career-assessment-section',
      badge: 'Diagnostics',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200'
    },
    {
      title: 'Industry Certifications',
      desc: 'Build practical, job-ready skills with dual certifications recognized by premier enterprise employers.',
      icon: Award,
      href: '#certifications-section',
      badge: 'Upskilling',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200'
    },
    {
      title: 'Masterclasses',
      desc: 'Learn directly from industry professionals working at Google, Amazon, Microsoft, and leading tech companies.',
      icon: Video,
      href: '#masterclasses-section',
      badge: 'Mentorship',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200'
    }
  ];

  return (
    <section className="py-20 bg-white border-b border-slate-200/80" id="services-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
            All-In-One Ecosystem
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            One Platform. Multiple Student Needs.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Everything you need to navigate the transition from intermediate to top university, scholarships, funding, and successful professional career.
          </p>
        </div>

        {/* 5 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {needs.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-lg hover:border-[#0057D9]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${item.bg} ${item.border} border flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#0057D9] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100">
                  <a 
                    href={item.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0057D9] group-hover:text-[#004dc2] transition-colors"
                  >
                    Learn More
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
