import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, ChevronLeft, ChevronRight, Quote, GraduationCap, Building, Award, CheckCircle2 } from 'lucide-react';
import { Testimonial } from '../types';

const TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Ananya Deshmukh',
    school12th: 'Narayana Junior College, Hyderabad',
    city: 'Hyderabad, Telangana',
    admittedCollege: 'Parul University (CSE - AI & ML)',
    course: 'B.Tech Computer Science',
    packageOrRank: 'Offered ₹18 LPA in Campus Drive',
    rating: 5,
    initials: 'AD',
    badgeColor: 'from-blue-600 to-indigo-600',
    quote: 'NEXORA made my college transition seamless. After clearing NACAT, my counselor explained curriculum differences and helped me secure a 35% merit scholarship at Parul University.',
    year: 'Batch of 2025'
  },
  {
    id: 'test-2',
    name: 'Karthik Varma',
    school12th: 'Sri Chaitanya College, Vijayawada',
    city: 'Vijayawada, Andhra Pradesh',
    admittedCollege: 'Ganpat University (Integrated Degree)',
    course: 'BA + Civil Services (IAS Focus)',
    packageOrRank: 'Cleared UPSC Foundation Prelims Mock Rank 4',
    rating: 5,
    initials: 'KV',
    badgeColor: 'from-emerald-600 to-teal-700',
    quote: 'I wanted to prepare for Civil Services right after 12th. NEXORA helped me find an accredited university offering structured UPSC coaching along with my graduation degree.',
    year: 'Batch of 2026'
  },
  {
    id: 'test-3',
    name: 'Rohan Sharma',
    school12th: 'Delhi Public School, Ahmedabad',
    city: 'Ahmedabad, Gujarat',
    admittedCollege: 'Marwadi University (BBA Business Analytics)',
    course: 'BBA Analytics & Finance',
    packageOrRank: 'Secured ₹12.5 LPA Placement at Deloitte',
    rating: 5,
    initials: 'RS',
    badgeColor: 'from-violet-600 to-purple-700',
    quote: 'The direct paper evaluation and prompt release of marks gave my parents confidence in NEXORA. The counselor followed up regularly until my admission was confirmed.',
    year: 'Batch of 2025'
  },
  {
    id: 'test-4',
    name: 'Sneha Kulkarni',
    school12th: 'Fergusson College Jr Wing, Pune',
    city: 'Pune, Maharashtra',
    admittedCollege: 'ITM Skills University (B.Sc Data Science)',
    course: 'B.Sc Computer Science & Data',
    packageOrRank: 'Internship at Amazon AWS with PPO',
    rating: 5,
    initials: 'SK',
    badgeColor: 'from-amber-600 to-orange-600',
    quote: 'Comparing colleges across Gujarat, Maharashtra, and Karnataka on a single verified platform saved our family weeks of travel and uncertainty.',
    year: 'Batch of 2026'
  }
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-20 bg-white border-b border-slate-200/80" id="testimonials-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold tracking-wide uppercase">
              <Award className="h-3.5 w-3.5 text-amber-500" />
              <span>Student Success Stories & Verified Reviews</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Trusted by 10,000+ Intermediate Students Across India
            </h2>
            <p className="text-slate-500 text-sm">
              Authentic reviews from 12th standard students who secured admissions, scholarships, and career milestones through NEXORA.
            </p>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2 self-start md:self-end">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs cursor-pointer"
              aria-label="Previous Testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs cursor-pointer"
              aria-label="Next Testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-50/80 rounded-3xl p-6 border border-slate-200/90 flex flex-col justify-between hover:shadow-lg hover:border-blue-200 hover:bg-white hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="space-y-4">
                {/* Header Rating & Quote icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-[11px] font-bold text-slate-600 ml-1">5.0</span>
                  </div>
                  <Quote className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>

                {/* Testimonial Quote */}
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{t.quote}"
                </p>

                {/* College / Achievement Badge */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200/80 space-y-1 shadow-2xs group-hover:border-blue-100 transition-colors">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900">
                    <Building className="h-3.5 w-3.5 text-[#0057D9] shrink-0" />
                    <span className="truncate">{t.admittedCollege}</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                    <span className="truncate">{t.packageOrRank}</span>
                  </div>
                </div>
              </div>

              {/* Student Profile Footer - Clean Initials Badge (NO PHOTO) */}
              <div className="pt-4 mt-4 border-t border-slate-200/80 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${t.badgeColor || 'from-[#0057D9] to-blue-700'} text-white flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0 tracking-wider`}>
                  {t.initials || t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-extrabold text-slate-900 truncate">{t.name}</h4>
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      Verified
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{t.school12th}</p>
                  <p className="text-[9px] text-slate-400 font-medium truncate">{t.city} • {t.year}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
