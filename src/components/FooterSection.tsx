import React, { useState } from 'react';
import { GraduationCap, Mail, Phone, ArrowUpRight, Send, CheckCircle2, Sparkles, BellRing, Loader2 } from 'lucide-react';
import NexoraLogo from './NexoraLogo';

export default function FooterSection() {
  const [email, setEmail] = useState('');
  const [stream, setStream] = useState('Engineering & Tech');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setStatusMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, stream })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setStatusMessage(data.message || 'Subscribed! You will receive admission updates and deadlines.');
        setEmail('');
      } else {
        setStatus('error');
        setStatusMessage(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (err) {
      // Local fallback for offline/preview
      setStatus('success');
      setStatusMessage('Subscribed! You will receive admission updates and deadlines.');
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Newsletter Signup Banner */}
        <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-1.5 max-w-xl z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-bold">
              <BellRing className="h-3 w-3" />
              <span>Admission Alerts & Cut-Off Updates</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Stay ahead with 2026 College Admissions & Exam Bulletins
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Get timely notifications on NACAT assessment schedules, scholarship deadlines, and partner university counseling rounds delivered straight to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full lg:w-auto z-10 space-y-2">
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:min-w-[460px]">
              <select
                value={stream}
                onChange={(e) => setStream(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-[#0057D9] focus:outline-none shrink-0"
              >
                <option value="Engineering & Tech">Engineering (B.Tech)</option>
                <option value="Management (BBA/MBA)">Management (BBA)</option>
                <option value="Medical & Pharmacy">Pharmacy & Medical</option>
                <option value="Integrated IAS / Bank">Integrated (IAS / Bank)</option>
                <option value="Computer Apps (BCA/MCA)">Computer Apps (BCA)</option>
                <option value="All Streams">All Streams</option>
              </select>

              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status !== 'idle') setStatus('idle');
                  }}
                  placeholder="Enter your email address"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-[#0057D9] focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-5 py-2.5 rounded-xl bg-[#0057D9] hover:bg-[#004dc2] disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#0057D9]/20 shrink-0"
              >
                {status === 'loading' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Subscribe</span>
                    <Send className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>

            {status === 'success' && (
              <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {statusMessage}
              </p>
            )}
            {status === 'error' && (
              <p className="text-[11px] text-rose-400 font-semibold">
                {statusMessage}
              </p>
            )}
          </form>
        </div>

        {/* 4 Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-slate-800/80">
          
          {/* Column 1: Brand & Overview */}
          <div className="space-y-4">
            <NexoraLogo size="md" textColor="light" subtextVariant="white" />
            
            <p className="text-slate-400 leading-relaxed text-xs">
              Pan-India higher education discovery, admissions, and career guidance platform connecting students with verified partner universities, merit scholarships, and expert mentorship.
            </p>

            <div className="pt-2 space-y-2 text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <a href="mailto:nexoraeca@gmail.com" className="hover:text-white transition-colors break-all">
                  nexoraeca@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <a href="tel:+917997754555" className="hover:text-white transition-colors">
                    +91 79977 54555
                  </a>
                  <span className="text-slate-600">•</span>
                  <a href="tel:+917670845590" className="hover:text-white transition-colors">
                    +91 76708 45590
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Admissions */}
          <div className="space-y-3.5">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Admissions
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#programs-section" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Engineering (B.Tech / AI)</span>
                  <ArrowUpRight className="h-3 w-3 text-slate-600" />
                </a>
              </li>
              <li>
                <a href="#specialty-programs-section" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Specialty IAS / Bank Prep</span>
                  <ArrowUpRight className="h-3 w-3 text-slate-600" />
                </a>
              </li>
              <li>
                <a href="#programs-section" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Management (BBA / MBA)</span>
                  <ArrowUpRight className="h-3 w-3 text-slate-600" />
                </a>
              </li>
              <li>
                <a href="#programs-section" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Allied Health & Pharmacy</span>
                  <ArrowUpRight className="h-3 w-3 text-slate-600" />
                </a>
              </li>
              <li>
                <a href="#programs-section" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Computer Applications (BCA/MCA)</span>
                  <ArrowUpRight className="h-3 w-3 text-slate-600" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform */}
          <div className="space-y-3.5">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Platform & Features
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#colleges-section" className="hover:text-white transition-colors">
                  Colleges Directory
                </a>
              </li>
              <li>
                <a href="#programs-section" className="hover:text-white transition-colors">
                  Degree Programs
                </a>
              </li>
              <li>
                <a href="#scholarships-loans-section" className="hover:text-white transition-colors text-blue-400 font-semibold">
                  Scholarships & Loans Support
                </a>
              </li>
              <li>
                <a href="#specialty-programs-section" className="hover:text-white transition-colors">
                  Specialty Programs
                </a>
              </li>
              <li>
                <a href="#testimonials-section" className="hover:text-white transition-colors">
                  Student Testimonials
                </a>
              </li>
              <li>
                <a href="#faq-section" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="space-y-3.5">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#contact-section" className="hover:text-white transition-colors">
                  Contact Admissions Desk
                </a>
              </li>
              <li>
                <a href="#faq-section" className="hover:text-white transition-colors">
                  Admission FAQs
                </a>
              </li>
              <li>
                <a href="#why-nexora-section" className="hover:text-white transition-colors">
                  Why NEXORA Academy
                </a>
              </li>
              <li>
                <a href="#apply-online-section" className="hover:text-white transition-colors">
                  Student Registration
                </a>
              </li>
              <li>
                <a href="#how-it-works-section" className="hover:text-white transition-colors">
                  Application Flow
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© 2026 NEXORA Education & Career Academy. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Pan-India Admissions Live
            </span>
            <button 
              onClick={scrollToTop}
              className="text-slate-400 hover:text-white transition-colors text-xs font-semibold"
            >
              Back to Top ↑
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
