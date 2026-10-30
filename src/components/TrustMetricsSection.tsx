import React from 'react';
import { Users, Building2, BookOpen, Globe2 } from 'lucide-react';

export default function TrustMetricsSection() {
  const metrics = [
    {
      value: '5,000+',
      label: 'Students Guided',
      icon: Users,
      color: 'text-[#0057D9]',
      bg: 'bg-blue-50/70',
      border: 'border-blue-100'
    },
    {
      value: '100+',
      label: 'Partner Colleges',
      icon: Building2,
      color: 'text-slate-900',
      bg: 'bg-slate-50',
      border: 'border-slate-200/80'
    },
    {
      value: '15+',
      label: 'Programs',
      icon: BookOpen,
      color: 'text-amber-600',
      bg: 'bg-amber-50/70',
      border: 'border-amber-100'
    },
    {
      value: 'PAN INDIA',
      label: 'Admission Reach',
      icon: Globe2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-100'
    }
  ];

  return (
    <section className="bg-white border-y border-slate-200/80 py-10 relative z-20" id="trust-metrics-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div 
                key={idx}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-[#0057D9]/30 transition-all flex flex-col items-center sm:items-start text-center sm:text-left group"
              >
                <div className={`p-2.5 rounded-xl ${m.bg} ${m.border} border mb-3 flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${m.color}`} />
                </div>
                <div className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${m.color}`}>
                  {m.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                  {m.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
