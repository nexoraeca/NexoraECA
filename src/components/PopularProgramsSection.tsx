import React from 'react';
import { Cpu, Briefcase, Code, HeartPulse, Landmark, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PopularProgramsSectionProps {
  onSelectProgram: (streamCategory: string) => void;
}

export default function PopularProgramsSection({ onSelectProgram }: PopularProgramsSectionProps) {
  const programs = [
    {
      category: 'Engineering',
      badge: 'High Placement Demand',
      description: 'Cutting-edge technical disciplines driving AI, computing, and next-generation engineering systems.',
      icon: Cpu,
      color: 'text-[#0057D9]',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      degrees: ['B.Tech Computer Science', 'B.Tech Artificial Intelligence', 'B.Tech Data Science', 'M.Tech Advanced Systems', 'Mechanical & ECE']
    },
    {
      category: 'Management',
      badge: 'Leadership & Commerce',
      description: 'Strategic business administration, financial analytics, and modern leadership specializations.',
      icon: Briefcase,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      degrees: ['BBA General & Analytics', 'MBA Finance & Strategy', 'MBA Marketing', 'MBA Human Resources', 'BBA International Business']
    },
    {
      category: 'Computer Applications',
      badge: 'Software Development',
      description: 'Applied computing, software engineering, cyber security, and cloud systems foundations.',
      icon: Code,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      degrees: ['BCA Software Systems', 'BCA Cloud Computing & AI', 'MCA Full Stack Applications', 'MCA Cyber Security', 'MCA Data Analytics']
    },
    {
      category: 'Healthcare',
      badge: 'Medical & Clinical Sciences',
      description: 'Patient care, clinical technology, pharmaceuticals, and allied health sciences training.',
      icon: HeartPulse,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      degrees: ['B.Sc Nursing', 'Bachelor of Pharmacy (B.Pharm)', 'BPT Physiotherapy', 'B.Sc Medical Lab Tech', 'Allied Health Sciences']
    },
    {
      category: 'IAS Integrated Degree',
      badge: 'Civil Services & UPSC',
      description: 'Undergraduate degrees integrated with rigorous UPSC, IAS, IPS & State PSC Civil Services mentorship.',
      icon: Landmark,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      degrees: ['BA + Civil Services Foundation (IAS/IPS)', 'B.Sc + UPSC General Studies & CSAT', 'B.Com + State PSC Administration', 'Degree + Current Affairs & Answer Writing', 'Officer Mentorship & Mock Interviews']
    }
  ];

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200/80" id="programs-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#0057D9] text-xs font-bold uppercase tracking-wider">
            Curated Academic Pathways
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Popular Programs
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Explore industry-benchmarked undergraduate and postgraduate degrees offered across verified partner universities.
          </p>
        </div>

        {/* 5 Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {programs.map((prog, idx) => {
            const Icon = prog.icon;
            return (
              <div 
                key={idx}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-lg hover:border-[#0057D9]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${prog.bg} ${prog.border} border flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${prog.color}`} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70">
                      {prog.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#0057D9] transition-colors">
                    {prog.category}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    {prog.description}
                  </p>

                  {/* Degrees List */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Key Specializations</span>
                    {prog.degrees.map((deg, dIdx) => (
                      <div key={dIdx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="line-clamp-1">{deg}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-6 mt-4 border-t border-slate-100">
                  <button 
                    onClick={() => onSelectProgram(prog.category)}
                    className="w-full py-2.5 bg-slate-50 hover:bg-[#0057D9] text-slate-700 hover:text-white font-bold rounded-xl border border-slate-200 hover:border-[#0057D9] text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    Explore Programs
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
