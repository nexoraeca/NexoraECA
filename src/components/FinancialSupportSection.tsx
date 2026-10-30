import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, Landmark, CheckCircle2, ArrowRight, Search, 
  FileText, Calendar, ShieldCheck, Sparkles, Building2, 
  Percent, ChevronRight, X, Info, PhoneCall, Check,
  Layers, Clock, Award, HelpCircle, BadgeCheck, AlertTriangle
} from 'lucide-react';

interface FinancialSupportSectionProps {
  onRequestGuidance?: (type: 'scholarship' | 'loan', itemTitle?: string) => void;
}

export function ScholarshipsEducationLoanSupport({ onRequestGuidance }: FinancialSupportSectionProps) {
  const [activeModal, setActiveModal] = useState<'scholarship' | 'loan' | null>(null);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [scholarshipFilter, setScholarshipFilter] = useState<'all' | 'govt' | 'merit' | 'csr'>('all');
  const [selectedItemForGuidance, setSelectedItemForGuidance] = useState<string | null>(null);
  const [guidanceFormSuccess, setGuidanceFormSuccess] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentStream, setStudentStream] = useState('Engineering');

  // Sample Pan-India Scholarships database for discovery
  const scholarshipsList = [
    {
      id: 'nsp-central',
      title: 'Central Sector Scheme of Scholarships (NSP)',
      provider: 'Ministry of Education, Govt. of India',
      category: 'govt',
      categoryLabel: 'Government Scheme',
      award: '₹12,000 – ₹20,000 / year',
      eligibility: 'Above 80th percentile in Class 12 / Intermediate board exams. Family income < ₹4.5 LPA.',
      deadline: 'October 31 (Annual Cycle)',
      documents: ['12th Marksheet', 'Income Certificate', 'Aadhaar Card', 'Bank Passbook', 'College Admission Proof'],
      type: 'Direct Bank Transfer (DBT)'
    },
    {
      id: 'state-post-matric',
      title: 'State Post-Matric & Fee Reimbursement Scheme',
      provider: 'State Social Welfare Departments (TS / AP / MH / KA)',
      category: 'govt',
      categoryLabel: 'State Government',
      award: 'Up to 100% Tuition Fee Reimbursement',
      eligibility: 'SC / ST / BC / EBC students enrolled in recognized professional degree colleges. State domicile required.',
      deadline: 'Varies by State (Aug – Nov)',
      documents: ['Caste Certificate', 'Income Certificate', 'Domicile Proof', 'CET / Admission Allotment Letter'],
      type: 'Tuition Fee Waiver / Direct Reimbursement'
    },
    {
      id: 'pragati-saksham',
      title: 'AICTE Pragati & Saksham Scholarship',
      provider: 'All India Council for Technical Education (AICTE)',
      category: 'merit',
      categoryLabel: 'Girl Child & Differently Abled',
      award: '₹50,000 / year for all 4 years',
      eligibility: 'Female students & differently-abled students admitted to 1st year AICTE approved degree/diploma programs.',
      deadline: 'December 31 (Annual)',
      documents: ['AICTE College Admission Slip', 'Family Income Certificate (< ₹8 LPA)', 'Disability Certificate (if applicable)'],
      type: 'Direct Scholarship'
    },
    {
      id: 'csr-reliance-hdfc',
      title: 'Corporate CSR Merit & Need Scholarships (HDFC / Reliance / Tata)',
      provider: 'Leading Corporate Foundations (CSR Initiatives)',
      category: 'csr',
      categoryLabel: 'Private / CSR Grants',
      award: '₹35,000 – ₹1,00,000 / year',
      eligibility: 'Meritorious students pursuing undergraduate degrees (B.Tech, BBA, BCA, B.Sc) with minimum 75% in Class 12.',
      deadline: 'Rolling Deadlines (Aug – Dec)',
      documents: ['10th & 12th Marksheets', 'Current Fee Receipt', 'Parental Income Proof', 'Statement of Purpose / Essay'],
      type: 'Merit-cum-Need Grant'
    },
    {
      id: 'institutional-merit',
      title: 'Partner University Merit & Sports Fee Concessions',
      provider: 'NEXORA Partner Autonomous Universities & Colleges',
      category: 'merit',
      categoryLabel: 'Institutional Waiver',
      award: '25% to 75% Tuition Fee Waiver',
      eligibility: 'High scores in NACAT / Intermediate Board (>85%) or State / National level sports representation.',
      deadline: 'During Admission Counseling',
      documents: ['Class 12 Scorecard', 'NACAT Scorecard', 'Sports Achievement Certificates'],
      type: 'Direct Institutional Concession'
    }
  ];

  // Sample Pan-India Education Loan Guidance Directory
  const loanPartnersList = [
    {
      id: 'sbi-student-loan',
      bankName: 'State Bank of India (SBI) Scholar & Student Loan',
      type: 'Nationalized Bank',
      interestRange: '8.15% – 9.80% p.a.',
      maxAmount: 'Up to ₹20 Lakhs (Without Tangible Collateral for listed institutions)',
      moratorium: 'Course duration + 12 months grace period',
      repayment: 'Up to 15 years post moratorium',
      keyFeatures: [
        'Concessional interest rate for girl students (0.50% concession)',
        'Eligible under Central Sector Interest Subsidy (CSIS) scheme',
        'Covers 100% of college tuition fees, books, and hostel charges'
      ]
    },
    {
      id: 'canara-vidya',
      bankName: 'Canara Bank Vidya Turant & General Education Loan',
      type: 'Nationalized Bank',
      interestRange: '8.40% – 10.15% p.a.',
      maxAmount: 'Up to ₹40 Lakhs for Premier Institutions / ₹7.5L Collateral-free',
      moratorium: 'Course period + 1 year',
      repayment: '10 to 15 years flexible EMI structure',
      keyFeatures: [
        'Zero processing charges for loans up to ₹7.5 Lakhs',
        'Prompt digital sanction through Vidya Lakshmi Portal integration',
        'Co-borrower flexibility (Parent / Guardian / Spouse)'
      ]
    },
    {
      id: 'hdfc-credila',
      bankName: 'HDFC Credila & Private Banking Education Finance',
      type: 'Specialized Education NBFC / Bank',
      interestRange: '9.25% – 11.75% p.a.',
      maxAmount: 'Customized as per university guidelines (Up to ₹50 Lakhs+)',
      moratorium: 'Flexible partial simple interest during study period',
      repayment: 'Up to 12 – 14 years',
      keyFeatures: [
        'Doorstep document pickup and fast pre-admission sanction letter',
        'Income Tax Benefit under Section 80E on total interest paid',
        'Customized funding for living expenses, laptops, and study materials'
      ]
    },
    {
      id: 'union-bank-education',
      bankName: 'Union Bank of India Union Education Scheme',
      type: 'Public Sector Bank',
      interestRange: '8.50% – 10.35% p.a.',
      maxAmount: 'Up to ₹7.5 Lakhs (No collateral, only parent co-obligation)',
      moratorium: 'Course period + 6 to 12 months',
      repayment: 'Up to 15 years',
      keyFeatures: [
        'Simple interest charged during study and moratorium period',
        'Covers exam fees, library, laboratory, hostel, and travel expenses',
        'Fast verification with official university admission offer letter'
      ]
    }
  ];

  const handleOpenModal = (type: 'scholarship' | 'loan', itemTitle?: string) => {
    setActiveModal(type);
    if (itemTitle) {
      setSelectedItemForGuidance(itemTitle);
    } else {
      setSelectedItemForGuidance(null);
    }
    setGuidanceFormSuccess(false);
  };

  const handleGuidanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGuidanceFormSuccess(true);
    setTimeout(() => {
      // Keep state clear after submission
    }, 2000);
  };

  const filteredScholarships = scholarshipFilter === 'all'
    ? scholarshipsList
    : scholarshipsList.filter(s => s.category === scholarshipFilter);

  return (
    <section className="py-20 bg-gradient-to-b from-white via-slate-50/60 to-white border-b border-slate-200/80 relative overflow-hidden" id="scholarships-loans-section">
      {/* Background Decorative Grid Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#0057D9_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ================= SECTION HEADER ================= */}
        <div className="text-center max-w-3xl mx-auto space-y-3.5 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/90 text-[#0057D9] text-xs font-extrabold uppercase tracking-wider shadow-2xs">
            <Landmark className="h-3.5 w-3.5 text-[#0057D9]" />
            <span>Scholarships & Education Loan Support</span>
            
            {/* Small Info Icon / Tooltip Trigger */}
            <button
              type="button"
              onClick={() => setShowDisclaimerModal(true)}
              className="ml-1 p-1 hover:bg-blue-100 rounded-full text-blue-700 hover:text-blue-900 transition-colors cursor-pointer"
              title="Click to view NEXORA Education & Career Academy Funding & Approval Policy"
              aria-label="NEXORA Education & Career Academy Funding & Approval Policy"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Financial Support for Your Education
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            <strong>Scholarships + Education Loans</strong> — We help you find the right financial support and guide you through the application process.
          </p>

          {/* Quick Advisory Capsule */}
          <div className="pt-1 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setShowDisclaimerModal(true)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#0057D9] bg-slate-100/80 hover:bg-blue-50 px-3 py-1 rounded-full border border-slate-200/80 transition-colors cursor-pointer group"
            >
              <Info className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#0057D9]" />
              <span className="font-semibold">NEXORA Academy provides guidance & discovery (Non-lender notice)</span>
              <span className="text-[#0057D9] font-bold text-[11px] underline">Learn more</span>
            </button>
          </div>
        </div>

        {/* ================= TWO-COLUMN CARD LAYOUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
          
          {/* SERVICE CARD 1: 🎓 SCHOLARSHIP SUPPORT */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-7 sm:p-9 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden" id="scholarship-support-card">
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-50/90 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110" />

            <div className="relative z-10 space-y-6">
              {/* Card Header & Illustrative Icon */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-[#0057D9] text-xs font-black">
                    <GraduationCap className="h-4 w-4" />
                    <span>Scholarship Support</span>
                  </div>

                  {/* Small info icon */}
                  <button
                    type="button"
                    onClick={() => setShowDisclaimerModal(true)}
                    className="p-1.5 text-slate-400 hover:text-[#0057D9] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="View scholarship guidance disclaimer"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <div className="p-3.5 bg-gradient-to-br from-blue-600 to-[#0057D9] text-white rounded-2xl shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform shrink-0">
                    <GraduationCap className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-[#0057D9] transition-colors">
                      Scholarship Support
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      Discovery, eligibility evaluation & deadline management
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature Points List */}
              <div className="space-y-3.5 pt-2">
                {[
                  'Find scholarships available across India',
                  'Check eligibility requirements',
                  'Get guidance on scholarship applications',
                  'Understand required documents',
                  'Track important application deadlines',
                  'Support for government, bank, private, and institutional scholarships'
                ].map((point, pIdx) => (
                  <div key={pIdx} className="flex items-start gap-3 text-xs sm:text-[13px] text-slate-700 font-medium">
                    <div className="p-0.5 bg-emerald-50 text-emerald-600 rounded-full shrink-0 mt-0.5 border border-emerald-200">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span className="leading-snug">{point}</span>
                  </div>
                ))}
              </div>

              {/* Supported Scholarship Types Pills */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Coverage Types Guided
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Government (NSP)', 'State Welfare / Post-Matric', 'AICTE Pragati / Saksham', 'Corporate CSR', 'University Merit Waivers'].map((tag, tIdx) => (
                    <span key={tIdx} className="bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer CTA */}
            <div className="pt-6 mt-6 border-t border-slate-100 relative z-10 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => handleOpenModal('scholarship')}
                className="w-full sm:flex-1 py-3.5 bg-[#0057D9] hover:bg-[#004dc2] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-[#0057D9]/15 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:scale-[1.01]"
                id="btn-find-scholarships"
              >
                <span>Find Scholarships</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleOpenModal('scholarship', 'General Scholarship Guidance')}
                className="w-full sm:w-auto px-4 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                <span>Eligibility Help</span>
              </button>
            </div>
          </div>

          {/* SERVICE CARD 2: 🏦 EDUCATION LOAN SUPPORT */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-7 sm:p-9 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden" id="loan-support-card">
            <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-50/90 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110" />

            <div className="relative z-10 space-y-6">
              {/* Card Header & Illustrative Icon */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black">
                    <Landmark className="h-4 w-4" />
                    <span>Education Loan Support</span>
                  </div>

                  {/* Small info icon */}
                  <button
                    type="button"
                    onClick={() => setShowDisclaimerModal(true)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    title="View education loan guidance disclaimer"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <div className="p-3.5 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-600/25 group-hover:scale-105 transition-transform shrink-0">
                    <Landmark className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                      Education Loan Support
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      Banking options, document preparation & terms guidance
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature Points List */}
              <div className="space-y-3.5 pt-2">
                {[
                  'Explore education loan options from banks and financial institutions',
                  'Understand loan eligibility and requirements',
                  'Guidance on required documents',
                  'Support with the loan application process',
                  'Guidance for admission/offer-letter related requirements',
                  'Help students understand loan terms, repayment, and applicable interest rates'
                ].map((point, pIdx) => (
                  <div key={pIdx} className="flex items-start gap-3 text-xs sm:text-[13px] text-slate-700 font-medium">
                    <div className="p-0.5 bg-indigo-50 text-indigo-600 rounded-full shrink-0 mt-0.5 border border-indigo-200">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span className="leading-snug">{point}</span>
                  </div>
                ))}
              </div>

              {/* Supported Banks & Portals Pills */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Institutions & Facilitations Guided
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['State Bank of India (SBI)', 'Canara Bank (Vidya Turant)', 'HDFC Credila', 'Union Bank', 'Vidya Lakshmi Portal Support'].map((tag, tIdx) => (
                    <span key={tIdx} className="bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer CTA */}
            <div className="pt-6 mt-6 border-t border-slate-100 relative z-10 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => handleOpenModal('loan')}
                className="w-full sm:flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/15 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:scale-[1.01]"
                id="btn-explore-loans"
              >
                <span>Explore Education Loans</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleOpenModal('loan', 'General Loan Process Support')}
                className="w-full sm:w-auto px-4 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                <span>Document Checklist</span>
              </button>
            </div>
          </div>

        </div>

        {/* ================= VISUALLY DISTINCT HIGHLIGHT BANNER (AT THE BOTTOM OF SECTION) ================= */}
        <div className="mb-10 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-7 sm:p-9 border border-slate-800 shadow-2xl relative overflow-hidden group" id="financial-highlight-banner">
          {/* Ambient Glows */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#0057D9]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-bold">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>One-Stop Financial Support Ecosystem</span>
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                One Platform for Your Education Funding Needs
              </h3>
              
              <div className="text-indigo-200/90 text-sm font-bold tracking-wide flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="bg-white/10 hover:bg-white/15 px-3 py-1 rounded-xl border border-white/15 transition-colors">
                  Scholarships
                </span>
                <span className="text-indigo-400 font-black">•</span>
                <span className="bg-white/10 hover:bg-white/15 px-3 py-1 rounded-xl border border-white/15 transition-colors">
                  Education Loans
                </span>
                <span className="text-indigo-400 font-black">•</span>
                <span className="bg-white/10 hover:bg-white/15 px-3 py-1 rounded-xl border border-white/15 transition-colors">
                  Application Guidance
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenModal('scholarship')}
                className="px-6 py-3.5 bg-[#0057D9] hover:bg-[#004dc2] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                id="banner-find-scholarships-btn"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Find Scholarships</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleOpenModal('loan')}
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-extrabold text-xs sm:text-sm rounded-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                id="banner-explore-loans-btn"
              >
                <Landmark className="h-4 w-4 text-cyan-300" />
                <span>Explore Education Loans</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= COMPLIANCE & LEGAL CLARITY DISCLAIMER ================= */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 sm:p-6 text-slate-600 text-xs leading-relaxed" id="financial-support-disclaimer">
          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-700 rounded-xl shrink-0 mt-0.5">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Important Advisory & Transparency Notice
                </span>
                <button
                  type="button"
                  onClick={() => setShowDisclaimerModal(true)}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Info className="h-3 w-3" />
                  <span>Click for Full Policy Details</span>
                </button>
              </div>
              <p className="text-[11.5px] text-slate-600">
                <strong>NEXORA Education & Career Academy</strong> provides <strong>scholarship discovery, education-loan information, and application guidance/support</strong>. We do not directly provide or issue scholarships or loans, nor do we guarantee approval, sanction, or funding amounts. Final approval, eligibility verification, scholarship sanction, and loan disbursement are strictly subject to the independent policies, criteria, and terms of the respective scholarship provider, government portal, bank, or financial institution.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ================= DISCLAIMER MODAL (WHEN INFO ICON IS CLICKED) ================= */}
      <AnimatePresence>
        {showDisclaimerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto" id="policy-disclaimer-modal-overlay">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ duration: 0.22 }}
              className="bg-white rounded-[28px] max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 text-slate-900 flex flex-col my-auto"
              id="policy-disclaimer-modal"
            >
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      Funding & Approval Notice
                    </h3>
                    <p className="text-xs text-slate-300">
                      NEXORA Education & Career Academy Advisory & Transparency Policy
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDisclaimerModal(false)}
                  className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  aria-label="Close disclaimer modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl space-y-1 text-slate-800">
                  <span className="font-extrabold text-blue-900 text-xs block">
                    What NEXORA Academy Provides:
                  </span>
                  <p className="text-xs leading-relaxed text-blue-950">
                    NEXORA Education & Career Academy provides <strong>scholarship discovery, education-loan information, and end-to-end application guidance & document preparation support</strong> for aspiring college students.
                  </p>
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1.5 text-amber-950">
                  <span className="font-extrabold text-amber-900 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    Important Clarification & Policy:
                  </span>
                  <p className="text-xs leading-relaxed">
                    NEXORA Education & Career Academy <strong>does not directly provide or issue scholarships or loans</strong>, nor do we guarantee approval, sanction, or funding amounts.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="font-bold text-slate-900 text-xs block">
                    Key Transparency Highlights:
                  </span>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Free Guidance & Counseling:</strong> Our platform facilitates document discovery, admission offer letter bundling, and portal navigation without charging approval kickbacks.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Independent Evaluation:</strong> All scholarship sanctions, eligibility determinations, and disbursements are decided solely by the respective government ministries, corporate CSR trusts, or autonomous colleges.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Banking Terms Authority:</strong> Loan eligibility, interest concessions, processing waivers, and loan sanctions rest solely with the respective lending bank or NBFC as per RBI regulations.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDisclaimerModal(false)}
                  className="px-5 py-2.5 bg-[#0057D9] hover:bg-[#004dc2] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= INTERACTIVE DISCOVERY MODAL (SCHOLARSHIPS & LOANS) ================= */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto" id="funding-guidance-modal-overlay">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-[28px] max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 text-slate-900 flex flex-col my-auto"
              id="funding-guidance-modal"
            >
              {/* Modal Header */}
              <div className={`p-6 text-white flex items-center justify-between ${
                activeModal === 'scholarship'
                  ? 'bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900'
                  : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${activeModal === 'scholarship' ? 'bg-blue-600' : 'bg-indigo-600'}`}>
                    {activeModal === 'scholarship' ? <GraduationCap className="h-6 w-6 text-white" /> : <Landmark className="h-6 w-6 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      {activeModal === 'scholarship' ? 'Pan-India Scholarships Directory & Guidance' : 'Education Loan Information & Guidance'}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {activeModal === 'scholarship'
                        ? 'Explore government, CSR, and institutional scholarship schemes with document support.'
                        : 'Review bank offerings, eligibility benchmarks, required papers, and loan terms.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-6 max-h-[calc(90vh-140px)]">
                
                {/* ----------------- SCHOLARSHIP TAB CONTENT ----------------- */}
                {activeModal === 'scholarship' && (
                  <div className="space-y-6">
                    
                    {/* Filter Pills Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <Search className="h-4 w-4 text-[#0057D9]" />
                        <span>Filter Schemes:</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'all', label: 'All Schemes' },
                          { key: 'govt', label: 'Government & State Welfare' },
                          { key: 'merit', label: 'Merit & Girl Child' },
                          { key: 'csr', label: 'CSR & Private Foundations' }
                        ].map(f => (
                          <button
                            key={f.key}
                            type="button"
                            onClick={() => setScholarshipFilter(f.key as any)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              scholarshipFilter === f.key
                                ? 'bg-[#0057D9] text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scholarships Card Directory */}
                    <div className="space-y-4">
                      {filteredScholarships.map(s => (
                        <div key={s.id} className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="bg-blue-50 text-[#0057D9] text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                                  {s.categoryLabel}
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium">
                                  {s.type}
                                </span>
                              </div>
                              <h4 className="text-base font-extrabold text-slate-900">{s.title}</h4>
                              <p className="text-xs text-slate-500 font-semibold">{s.provider}</p>
                            </div>

                            <div className="text-left sm:text-right shrink-0">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Est. Financial Grant</span>
                              <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                                {s.award}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                              <span className="text-[10.5px] font-bold text-slate-700 block flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                Eligibility Criteria
                              </span>
                              <p className="text-slate-600 leading-relaxed text-[11.5px]">{s.eligibility}</p>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                              <span className="text-[10.5px] font-bold text-slate-700 block flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-amber-600" />
                                Deadline & Frequency
                              </span>
                              <p className="text-slate-600 leading-relaxed text-[11.5px]">{s.deadline}</p>
                            </div>
                          </div>

                          {/* Documents List */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-[10.5px] font-bold text-slate-500">Key Required Documents:</span>
                            {s.documents.map((doc, dIdx) => (
                              <span key={dIdx} className="bg-slate-100 text-slate-700 text-[10.5px] font-medium px-2 py-0.5 rounded-md">
                                {doc}
                              </span>
                            ))}
                          </div>

                          {/* Item Action */}
                          <div className="pt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setSelectedItemForGuidance(s.title)}
                              className="px-4 py-2 bg-blue-50 hover:bg-[#0057D9] text-[#0057D9] hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <span>Request Application Support for this Scheme</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                )}

                {/* ----------------- EDUCATION LOAN TAB CONTENT ----------------- */}
                {activeModal === 'loan' && (
                  <div className="space-y-6">
                    
                    {/* Loan Overview Notice */}
                    <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-start gap-3">
                      <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0">
                        <Landmark className="h-4 w-4" />
                      </div>
                      <div className="space-y-1 text-xs text-indigo-950">
                        <span className="font-extrabold text-sm block">How Education Loan Guidance Works</span>
                        <p className="text-[11.5px] leading-relaxed">
                          We guide you in comparing banking loan terms, assembling your admission offer letter bundle, understanding collateral exemptions up to ₹7.5L – ₹40L, and navigating the official Vidya Lakshmi Portal for faster sanction processing.
                        </p>
                      </div>
                    </div>

                    {/* Bank Guidance Cards */}
                    <div className="space-y-4">
                      {loanPartnersList.map(loan => (
                        <div key={loan.id} className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div>
                              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                                {loan.type}
                              </span>
                              <h4 className="text-base font-extrabold text-slate-900 mt-1">{loan.bankName}</h4>
                            </div>

                            <div className="text-left sm:text-right shrink-0">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Indicative Interest Rate</span>
                              <span className="text-sm font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 inline-block font-mono">
                                {loan.interestRange}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="bg-slate-50 p-3 rounded-xl">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Max Limit / Collateral</span>
                              <span className="text-xs font-bold text-slate-800">{loan.maxAmount}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Moratorium Period</span>
                              <span className="text-xs font-bold text-slate-800">{loan.moratorium}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Repayment Tenure</span>
                              <span className="text-xs font-bold text-slate-800">{loan.repayment}</span>
                            </div>
                          </div>

                          {/* Key Highlights */}
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-bold text-slate-700">Bank Guidance Features:</span>
                            {loan.keyFeatures.map((feat, fIdx) => (
                              <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>

                          {/* Item Action */}
                          <div className="pt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setSelectedItemForGuidance(loan.bankName)}
                              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <span>Request Loan Document & Application Guidance</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                )}

                {/* ----------------- INLINE 1-ON-1 GUIDANCE REQUEST FORM ----------------- */}
                <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 shadow-lg border border-slate-800" id="guidance-inquiry-box">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0057D9]/30 text-blue-300 text-[10px] font-bold uppercase">
                        <PhoneCall className="h-3 w-3" />
                        <span>Dedicated Financial Counselor Desk</span>
                      </div>
                      <h4 className="text-base font-extrabold text-white mt-1">
                        Need 1-on-1 Guidance with {selectedItemForGuidance || (activeModal === 'scholarship' ? 'Scholarship Applications' : 'Education Loans')}?
                      </h4>
                    </div>
                  </div>

                  {guidanceFormSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-5 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-center space-y-2 text-emerald-200"
                    >
                      <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                      <h5 className="font-extrabold text-sm text-white">Guidance Request Received!</h5>
                      <p className="text-xs text-emerald-300 max-w-md mx-auto">
                        Our student funding advisor will contact you within 24 business hours with document checklists and step-by-step guidance.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleGuidanceSubmit} className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">Student Full Name *</label>
                          <input
                            type="text"
                            required
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            placeholder="e.g. Rahul Sharma"
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 outline-none focus:border-[#0057D9]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">Contact Phone Number *</label>
                          <input
                            type="tel"
                            required
                            value={studentPhone}
                            onChange={(e) => setStudentPhone(e.target.value)}
                            placeholder="e.g. 9876543210"
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 outline-none focus:border-[#0057D9]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">Email Address</label>
                          <input
                            type="email"
                            value={studentEmail}
                            onChange={(e) => setStudentEmail(e.target.value)}
                            placeholder="e.g. rahul@example.com"
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 outline-none focus:border-[#0057D9]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">Target Stream / Degree</label>
                          <select
                            value={studentStream}
                            onChange={(e) => setStudentStream(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 outline-none focus:border-[#0057D9]"
                          >
                            <option value="Engineering">Engineering (B.Tech)</option>
                            <option value="Management">Management (BBA/MBA)</option>
                            <option value="Computer Applications">Computer Apps (BCA/MCA)</option>
                            <option value="Commerce">Commerce & Accounts (B.Com)</option>
                            <option value="Medical & Pharmacy">Pharmacy & Medical</option>
                            <option value="Integrated IAS">Integrated IAS Prep Degree</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <p className="text-[11px] text-slate-400">
                          * Complimentary advisory support with no consultation fees.
                        </p>

                        <button
                          type="submit"
                          className="w-full sm:w-auto px-6 py-2.5 bg-[#0057D9] hover:bg-[#004dc2] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Submit Guidance Request</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Modal Footer Disclaimer */}
                <div className="p-3.5 rounded-xl bg-slate-100 text-[11px] text-slate-500 leading-snug flex items-center gap-2">
                  <Info className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>
                    NEXORA Education & Career Academy provides educational counseling and documentation facilitation. All scholarship sanctions and loan approvals are determined solely by respective providers and lending institutions.
                  </span>
                </div>

              </div>

              {/* Modal Footer Action */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">
                  {activeModal === 'scholarship' ? '5 Active Scholarship Categories Listed' : '4 National & Private Banking Frameworks Analyzed'}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}

export default ScholarshipsEducationLoanSupport;
