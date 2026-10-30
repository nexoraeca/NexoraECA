import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, Sparkles, BookOpen, CheckCircle, Award, Compass, GraduationCap } from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'Admissions' | 'Assessment (NACAT)' | 'Scholarships' | 'Counseling';
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Admissions',
    question: 'What is NEXORA Education & Career Academy and how does it assist intermediate (10+2) students?',
    answer: 'NEXORA Education & Career Academy is a centralized higher-education advisory and assessment portal. We connect 12th standard students across CBSE, ICSE, and State Boards with verified, NAAC & NBA accredited universities across Gujarat, Maharashtra, Karnataka, Telangana, Andhra Pradesh, and other premier education hubs, offering verified academic curricula, placement reports, and direct counselor support.'
  },
  {
    id: 'faq-2',
    category: 'Assessment (NACAT)',
    question: 'What is the National Aptitude & Career Assessment Test (NACAT)?',
    answer: 'NACAT is an online, stream-aligned diagnostic evaluation designed to test core reasoning, subject fundamentals, and vocational aptitude. Once submitted, your exam paper is reviewed by academic examiners who grade your responses and generate an AI-powered scorecard recommending high-fit college branches and scholarship tiers.'
  },
  {
    id: 'faq-3',
    category: 'Admissions',
    question: 'What are Specialty & Integrated Degree Tracks (IAS / Bank Exam Focus)?',
    answer: 'Specialty tracks allow students to pursue standard undergraduate degrees (BA, B.Com, B.Sc, BBA) integrated with rigorous 3-4 year foundational mentorship for competitive government exams such as UPSC Civil Services (IAS / IPS / IFS), State PSCs, and Bank PO / Clerk exams, without compromising their graduation degree.'
  },
  {
    id: 'faq-4',
    category: 'Scholarships',
    question: 'How does NEXORA assist with scholarships and education loans?',
    answer: 'We provide comprehensive scholarship discovery across Central & State government schemes (NSP, Post-Matric, AICTE Pragati), corporate CSR grants, and institutional fee waivers. We also guide students in comparing education loan terms, understanding document requirements, and applying through premier nationalized and private banking channels.'
  },
  {
    id: 'faq-4b',
    category: 'Scholarships',
    question: 'Does the platform directly approve or disburse scholarships and loans?',
    answer: 'No. NEXORA Education & Career Academy provides scholarship discovery, education-loan information, and application guidance. All final scholarship awards and loan sanctions are determined solely by the respective government authority, scholarship provider, or lending financial institution.'
  },
  {
    id: 'faq-5',
    category: 'Counseling',
    question: 'How do dedicated admission counselors guide students after registration?',
    answer: 'Upon registration and document approval, an assigned counselor connects with you through our portal chat, phone, or scheduled virtual meetings. They analyze your career goals, evaluate college choices, clarify syllabus structures, and assist with application filings till final enrollment.'
  },
  {
    id: 'faq-6',
    category: 'Assessment (NACAT)',
    question: 'When and how are assessment exam results released?',
    answer: 'After you submit your test, the examination board verifies and evaluates the paper. Once marks are released by the Administrator or Super Admin, your detailed scorecard becomes visible on your Student Dashboard, showing score percentages, examiner feedback, and top matched colleges.'
  }
];

export default function FaqSection() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [openFaqId, setOpenFaqId] = useState<string>('faq-1');

  const categories = ['All', 'Admissions', 'Assessment (NACAT)', 'Scholarships', 'Counseling'];

  const filteredFaqs = activeCategory === 'All' 
    ? FAQS 
    : FAQS.filter(f => f.category === activeCategory);

  const toggleFaq = (id: string) => {
    setOpenFaqId(prev => (prev === id ? '' : id));
  };

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200/80" id="faq-section">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-[#0057D9] text-xs font-bold tracking-wide uppercase">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Got Questions? We Have Answers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Everything intermediate students and parents need to know about college admissions, entrance assessments, and counseling guidance.
          </p>
        </div>

        {/* Category Pill Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-[#0057D9] text-white shadow-sm shadow-[#0057D9]/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div 
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen 
                    ? 'bg-white border-blue-200 shadow-md shadow-blue-500/5 ring-1 ring-blue-100' 
                    : 'bg-white border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider shrink-0">
                      {faq.category}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <div className={`p-1.5 rounded-lg transition-transform duration-200 shrink-0 ${
                    isOpen ? 'bg-blue-50 text-[#0057D9] rotate-180' : 'text-slate-400'
                  }`}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Quick Help Footer Card */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xs">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Still have unanswered questions?</h4>
            <p className="text-xs text-slate-500">Reach out directly to our admissions desk or speak with an assigned counselor.</p>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="#contact-section" 
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Contact Admissions
            </a>
            <a 
              href="#apply-online-section" 
              className="px-4 py-2.5 bg-[#0057D9] hover:bg-[#004dc2] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              Apply Online →
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
