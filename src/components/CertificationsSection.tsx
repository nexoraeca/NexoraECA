import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NexoraEmblem } from './NexoraLogo';

interface UniversityCertificate {
  id: string;
  universityName: string;
  universitySubtext: string;
  facultyName: string;
  certifyText: string;
  degreeName: string;
  branchName: string;
  examMonthYear: string;
  locationDetails: string;
  webUrl: string;
  logoInitial: string;
  badgeColor: string;
}

const CERTIFICATE_LIST: UniversityCertificate[] = [
  {
    id: 'yenepoya',
    universityName: 'YENEPOYA',
    universitySubtext: '(Deemed to be University)\nRECOGNIZED UNDER SEC 3(A) OF THE UGC ACT 1956\nACCREDITED BY NAAC WITH "A" GRADE',
    facultyName: 'FACULTY OF ENGINEERING AND TECHNOLOGY',
    certifyText: 'The executive council of Yenepoya (deemed to be University) do hereby certify that',
    degreeName: 'BACHELOR OF TECHNOLOGY',
    branchName: 'COMPUTER SCIENCE & ENGINEERING',
    examMonthYear: 'held in April 2025 with Reg. No',
    locationDetails: 'Date of certification:\nDeralakatte\nMangaluru-575018',
    webUrl: 'www.yenepoya.edu.in',
    logoInitial: 'YENEPOYA',
    badgeColor: '#0ea5e9'
  },
  {
    id: 'klu',
    universityName: 'K L UNIVERSITY',
    universitySubtext: '(Koneru Lakshmaiah Education Foundation)\nCATEGORY-1 DEEMED UNIVERSITY • NAAC GRADE "A++"\nAPPROVED BY UGC & AICTE',
    facultyName: 'COLLEGE OF ENGINEERING & ADVANCED COMPUTING',
    certifyText: 'The Board of Management of K L University hereby confers upon',
    degreeName: 'BACHELOR OF TECHNOLOGY',
    branchName: 'ARTIFICIAL INTELLIGENCE & DATA SCIENCE',
    examMonthYear: 'held in May 2025 with Reg. No',
    locationDetails: 'Date of certification:\nVaddeswaram, Guntur\nAndhra Pradesh-522502',
    webUrl: 'www.kluniversity.in',
    logoInitial: 'KLU',
    badgeColor: '#0284c7'
  },
  {
    id: 'dsu',
    universityName: 'DAYANANDA SAGAR UNIVERSITY',
    universitySubtext: 'ESTABLISHED UNDER KARNATAKA ACT NO. 20 OF 2013\nRECOGNIZED BY UGC, AICTE & GOVERNMENT OF KARNATAKA',
    facultyName: 'SCHOOL OF ENGINEERING & TECHNOLOGY',
    certifyText: 'The Senate and Syndicate of Dayananda Sagar University certify that',
    degreeName: 'BACHELOR OF TECHNOLOGY',
    branchName: 'ELECTRONICS & COMMUNICATION ENGINEERING',
    examMonthYear: 'held in June 2025 with Reg. No',
    locationDetails: 'Date of certification:\nKanakapura Road Campus\nBengaluru-560078',
    webUrl: 'www.dsu.edu.in',
    logoInitial: 'DSU',
    badgeColor: '#2563eb'
  },
  {
    id: 'nexora',
    universityName: 'NEXORA EDUCATION & CAREER ACADEMY',
    universitySubtext: 'NATIONAL SKILLS & ADVANCED TECHNOLOGY UPSKILLING COUNCIL\nACCREDITED INDUSTRY CREDENTIALS & PLACEMENT PROGRAM',
    facultyName: 'DIVISION OF ADVANCED ENGINEERING & AI SYSTEMS',
    certifyText: 'The Academic Council of NEXORA Academy certifies that',
    degreeName: 'INDUSTRY-READY ADVANCED CERTIFICATION',
    branchName: 'FULL STACK AI & CLOUD ENGINEERING',
    examMonthYear: 'awarded in batch of 2025 with Credential ID',
    locationDetails: 'Verified Credential:\nNEXORA Academic HQ\nBengaluru / Hyderabad',
    webUrl: 'www.nexoraacademy.in',
    logoInitial: 'NEX',
    badgeColor: '#0057D9'
  }
];

export default function CertificationsSection() {
  const [activeIdx, setActiveIdx] = useState<number>(0);

  // Auto slide every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % CERTIFICATE_LIST.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const cert = CERTIFICATE_LIST[activeIdx];

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + CERTIFICATE_LIST.length) % CERTIFICATE_LIST.length);
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % CERTIFICATE_LIST.length);
  };

  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden border-t border-slate-200/80" id="certifications-section">
      {/* Light subtle grid background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#0057D9 1px, transparent 1px), linear-gradient(90deg, #0057D9 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Soft rounded container matching EduConnect styling */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-6 sm:p-10 lg:p-14 shadow-sm">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: SIMPLE, ELEGANT CERTIFICATE PREVIEW WITH DOTS SCROLLING */}
            <div className="lg:col-span-7 flex flex-col items-center">
              
              {/* Outer Certificate Frame */}
              <div className="w-full max-w-lg bg-white rounded-2xl border-2 border-slate-900 shadow-xl overflow-hidden relative">
                
                {/* Certificate Inner Canvas */}
                <div className="p-6 sm:p-8 flex flex-col justify-between min-h-[380px] sm:min-h-[430px] bg-white text-center select-none relative">
                  
                  {/* Top University Logo & Accreditations */}
                  <div className="space-y-1.5 pb-2">
                    {/* Emblem Logo */}
                    <div className="mx-auto flex flex-col items-center">
                      <div className="flex items-center gap-1.5 font-bold">
                        {cert.id === 'nexora' ? (
                          <NexoraEmblem sizePx={26} className="shadow-xs" />
                        ) : (
                          <div className="w-6 h-6 rounded bg-[#0057D9] flex items-center justify-center text-white text-[9px] font-black shadow-sm">
                            {cert.logoInitial.slice(0, 2)}
                          </div>
                        )}
                        <span className="font-serif text-xl sm:text-2xl font-black text-slate-900 tracking-wider">
                          {cert.universityName}
                        </span>
                      </div>
                      <div className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase leading-tight whitespace-pre-line tracking-wide mt-1">
                        {cert.universitySubtext}
                      </div>
                    </div>
                  </div>

                  {/* Cyan / Blue Banner Strip for Faculty */}
                  <div className="bg-[#0057D9] text-white py-1.5 px-3 rounded text-[10px] sm:text-[11px] font-black uppercase tracking-wider my-2 shadow-xs">
                    {cert.facultyName}
                  </div>

                  {/* Middle Certificate Text */}
                  <div className="space-y-2 my-auto py-2 text-slate-700">
                    <p className="text-[9px] sm:text-[10px] italic font-serif text-slate-500">
                      {cert.certifyText}
                    </p>

                    {/* Candidate Photo Box */}
                    <div className="mx-auto w-14 h-16 sm:w-16 sm:h-20 border border-slate-300 rounded bg-slate-50 flex items-center justify-center shadow-inner my-1">
                      <span className="text-[8px] text-slate-400 font-sans">Photo</span>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[11px] sm:text-xs font-serif font-bold text-slate-900">
                        Name of the Candidate
                      </p>
                      <p className="text-[8px] sm:text-[9px] italic font-serif text-slate-500">
                        has been awarded the Degree of
                      </p>
                      <h4 className="text-xs sm:text-sm font-serif font-black text-slate-950 uppercase tracking-wide">
                        {cert.degreeName} {cert.branchName}
                      </h4>
                      <p className="text-[8px] sm:text-[9px] font-serif text-slate-500">
                        on being duly certified to have passed the prescribed examination {cert.examMonthYear}
                      </p>
                      <p className="text-[8px] sm:text-[9px] italic font-serif text-slate-400">
                        Given under the seal of the University
                      </p>
                    </div>
                  </div>

                  {/* Certificate Bottom Signatures & Dots */}
                  <div className="pt-3 border-t border-slate-100 flex items-end justify-between text-[8px] sm:text-[9px] font-serif text-slate-500">
                    
                    {/* Left details */}
                    <div className="text-left leading-tight whitespace-pre-line text-slate-500 text-[8px]">
                      {cert.locationDetails}
                    </div>

                    {/* Center dots controller inside certificate */}
                    <div className="flex items-center gap-1.5 py-1 px-3 bg-slate-100 rounded-full border border-slate-200">
                      {CERTIFICATE_LIST.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveIdx(i)}
                          className={`h-2 rounded-full transition-all ${
                            activeIdx === i ? 'w-5 bg-[#0057D9]' : 'w-2 bg-slate-300 hover:bg-slate-500'
                          }`}
                          aria-label={`Go to certificate ${i + 1}`}
                        />
                      ))}
                    </div>

                    {/* Right Authority signature */}
                    <div className="text-right">
                      <div className="h-4 border-b border-slate-300 mb-0.5 w-20 ml-auto"></div>
                      <span className="font-bold text-slate-900 uppercase text-[8px]">VICE-CHANCELLOR</span>
                    </div>

                  </div>

                </div>

                {/* Bottom URL bar */}
                <div className="bg-[#0057D9] py-1 px-4 text-center text-[9px] font-mono font-bold text-white">
                  {cert.webUrl}
                </div>

                {/* Subtle side navigation chevrons */}
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white hover:text-[#0057D9] hover:scale-105 transition-all z-10"
                  aria-label="Previous Certificate"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white hover:text-[#0057D9] hover:scale-105 transition-all z-10"
                  aria-label="Next Certificate"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

              </div>

            </div>

            {/* RIGHT COLUMN: CLEAN, EXACT TITLE & POINTS AS IN IMAGE */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Heading */}
              <div>
                <h2 className="text-4xl sm:text-5xl font-sans tracking-tight">
                  <span className="text-[#0057D9] font-bold">Certifications</span>{' '}
                  <span className="text-[#0B192C] font-bold">You Get</span>
                </h2>
              </div>

              {/* Exact Bullets */}
              <div className="space-y-6">
                
                {/* Bullet 1 */}
                <div className="flex items-start gap-3">
                  <span className="text-[#0057D9] text-xl font-black leading-none shrink-0 mt-0.5">
                    ✦
                  </span>
                  <div className="space-y-1 text-slate-800">
                    <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      UGC-recognised/AICTE-approved B.Tech from university
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                      (Valid for all govt. & private jobs and higher studies abroad)
                    </p>
                  </div>
                </div>

                {/* Bullet 2 */}
                <div className="flex items-start gap-3">
                  <span className="text-[#0057D9] text-xl font-black leading-none shrink-0 mt-0.5">
                    ✦
                  </span>
                  <div className="space-y-1 text-slate-800">
                    <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      Industry-ready Certification from NEXORA Academy
                    </p>
                  </div>
                </div>

              </div>

              {/* Call to action */}
              <div className="pt-2">
                <a
                  href="#registration-section"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0057D9] hover:bg-[#004dc2] text-white font-bold rounded-xl shadow-md shadow-[#0057D9]/15 hover:shadow-lg transition-all text-xs"
                >
                  Apply to Earn These Certifications
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
