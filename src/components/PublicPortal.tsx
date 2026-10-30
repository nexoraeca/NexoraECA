import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, BookOpen, GraduationCap, MapPin, Building, Trophy, 
  Users, Calendar, CheckCircle, FileText, Phone, Mail, User, 
  Map, Award, ArrowRight, X, ChevronRight, CheckSquare, Sparkles, Filter,
  Globe, ExternalLink, Layers, ShieldCheck, Check, RotateCcw, Heart, Menu
} from 'lucide-react';
import { College, COURSES, Exam, DEFAULT_COURSE_STREAMS, deriveCourseStreamsFromCollege } from '../types';
import HeroSection from './HeroSection';
import NexoraLogo, { NexoraEmblem } from './NexoraLogo';
import TrustMetricsSection from './TrustMetricsSection';
import HowItWorksSection from './HowItWorksSection';
import StudentNeedsSection from './StudentNeedsSection';
import PopularProgramsSection from './PopularProgramsSection';
import SpecialtyProgramsSection from './SpecialtyProgramsSection';
import NiatComparisonSection from './NiatComparisonSection';
import CareerAssessmentSection from './CareerAssessmentSection';
import CertificationsSection from './CertificationsSection';
import MasterclassesAndCounsellorSection from './MasterclassesAndCounsellorSection';
import TestimonialsSection from './TestimonialsSection';
import FinancialSupportSection from './FinancialSupportSection';
import FaqSection from './FaqSection';
import ApplyOnlineFlow from './ApplyOnlineFlow';
import UpcomingExamsSection from './UpcomingExamsSection';
import ContactFormSection from './ContactFormSection';
import FooterSection from './FooterSection';

interface PublicPortalProps {
  onLoginClick: () => void;
  onStudentLoginSuccess: (student: any, username: string) => void;
  onAdminLoginSuccess: (admin: any) => void;
  onProceedToSignIn?: (credentials: { username: string; password?: string }) => void;
}

export default function PublicPortal({ onLoginClick, onStudentLoginSuccess, onAdminLoginSuccess, onProceedToSignIn }: PublicPortalProps) {
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedCourse, setSelectedCourse] = useState<string>('All');
  const [selectedQualification, setSelectedQualification] = useState<string>('All');
  const [selectedBudget, setSelectedBudget] = useState<string>('All');
  const [selectedCollegeType, setSelectedCollegeType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [showShortlistModal, setShowShortlistModal] = useState<boolean>(false);
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const [selectedExamForApplication, setSelectedExamForApplication] = useState<Exam | null>(null);

  // Load Colleges from server
  useEffect(() => {
    fetch('/api/colleges')
      .then(res => res.json())
      .then(data => setColleges(data))
      .catch(err => console.error('Error fetching colleges:', err));
  }, []);

  const toggleShortlist = (collegeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShortlistedIds(prev => 
      prev.includes(collegeId) ? prev.filter(id => id !== collegeId) : [...prev, collegeId]
    );
  };

  const handleQuickSearch = (filters: { course: string; state: string; score: string; budget?: string }) => {
    if (filters.state && filters.state !== 'All') {
      setSelectedState(filters.state);
    }
    if (filters.course) {
      setSelectedCourse(filters.course);
    }
    if (filters.budget) {
      setSelectedBudget(filters.budget);
    }
  };

  const handleProgramSelect = (programCategory: string) => {
    setSelectedCourse(programCategory);
    const collegesSection = document.getElementById('colleges-section');
    if (collegesSection) {
      collegesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToColleges = () => {
    const collegesSection = document.getElementById('colleges-section');
    if (collegesSection) {
      collegesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // States & Filter options
  const states = ['All', 'Telangana', 'Andhra Pradesh', 'Karnataka', 'Maharashtra', 'Gujarat', 'Tamil Nadu'];
  
  const cities = [
    'All',
    'Hyderabad',
    'Vijayawada',
    'Guntur',
    'Bengaluru',
    'Nashik',
    'Mehsana',
    'Siddhpur',
    'Maisammaguda',
    'Medchal'
  ];

  const courseStreams = [
    'All',
    ...DEFAULT_COURSE_STREAMS
  ];

  const qualifications = [
    'All',
    '10+2 / Intermediate (MPC, BiPC, MEC, CEC)',
    'CBSE Class XII',
    'ICSE / ISC Class XII',
    'State Board / Open School'
  ];

  const resetFilters = () => {
    setSelectedState('All');
    setSelectedCity('All');
    setSelectedCourse('All');
    setSelectedQualification('All');
    setSelectedBudget('All');
    setSelectedCollegeType('All');
    setSearchQuery('');
  };

  // Filter Colleges
  const filteredColleges = colleges.filter(c => {
    const cState = (c.state || '').toLowerCase();
    const cCity = (c.city || '').toLowerCase();
    const cName = (c.name || '').toLowerCase();
    const cShortDesc = (c.shortDescription || '').toLowerCase();
    const cAbout = (c.about || '').toLowerCase();
    const cNaac = (c.naacGrade || '');
    const sState = (selectedState || 'All').toLowerCase();
    const sCity = (selectedCity || 'All').toLowerCase();

    // Derive active streams tagged or inferred
    const collegeStreams = (Array.isArray(c.courseStreams) && c.courseStreams.length > 0)
      ? c.courseStreams
      : deriveCourseStreamsFromCollege(c);

    // State matching
    const matchesState = selectedState === 'All' || 
      cState.includes(sState) ||
      (sState === 'andhra pradesh' && (
        cCity.includes('vijayawada') || 
        cCity.includes('andhra') ||
        (Array.isArray(c.campusLocations) && c.campusLocations.some(l => (l || '').toLowerCase().includes('andhra') || (l || '').toLowerCase().includes('vijayawada')))
      )) ||
      (sState === 'telangana' && (
        cCity.includes('hyderabad') ||
        cCity.includes('telangana') ||
        (Array.isArray(c.campusLocations) && c.campusLocations.some(l => (l || '').toLowerCase().includes('telangana') || (l || '').toLowerCase().includes('hyderabad')))
      ));

    // City matching
    const matchesCity = selectedCity === 'All' ||
      cCity.includes(sCity) ||
      (Array.isArray(c.campusLocations) && c.campusLocations.some(loc => (loc || '').toLowerCase().includes(sCity)));

    // Course / Stream matching
    const matchesCourse = selectedCourse === 'All' ||
      collegeStreams.includes(selectedCourse) ||
      (Array.isArray(c.courses) && c.courses.some(co => {
        const coName = (co?.name || '').toLowerCase();
        const coType = (co?.type || '').toLowerCase();
        const sCourse = (selectedCourse || '').toLowerCase();

        if (sCourse === 'engineering' || sCourse.includes('b.tech')) {
          return coName.includes('b.tech') || coName.includes('cse') || coName.includes('engineering') || coName.includes('ai') || coName.includes('it');
        }
        if (sCourse === 'management' || sCourse.includes('bba')) {
          return coName.includes('bba') || coName.includes('mba') || coName.includes('management') || coName.includes('business');
        }
        if (sCourse === 'computer applications' || sCourse.includes('b.sc computer')) {
          return coName.includes('bca') || coName.includes('mca') || coName.includes('software') || coName.includes('computer');
        }
        if (sCourse === 'commerce' || sCourse.includes('b.com')) {
          return coName.includes('b.com') || coName.includes('commerce') || coName.includes('finance') || coName.includes('accounting');
        }
        if (sCourse === 'healthcare') {
          return coName.includes('nursing') || coName.includes('pharma') || coName.includes('health') || coName.includes('medical') || coName.includes('ayurveda') || coName.includes('physiotherapy');
        }
        if (sCourse.includes('ias') || sCourse.includes('civil') || sCourse.includes('integrated') || sCourse.includes('bank')) {
          return coName.includes('ias') || coName.includes('ips') || coName.includes('civil') || coName.includes('upsc') || coName.includes('integrated') || coName.includes('bank');
        }
        if (sCourse.includes('fashion') || sCourse.includes('interior')) {
          return coName.includes('fashion') || coName.includes('design') || coName.includes('interior');
        }
        if (sCourse.includes('economics')) {
          return coName.includes('economics') || coName.includes('b.sc');
        }
        return coName.includes(sCourse) || coType.includes(sCourse);
      }));

    // College type matching
    const matchesType = selectedCollegeType === 'All' ||
      (selectedCollegeType === 'NAAC A/A+' && (cNaac.includes('A') || cNaac.includes('A+'))) ||
      (selectedCollegeType === 'Autonomous' && (cShortDesc.includes('autonomous') || cAbout.includes('autonomous')));

    // Free text keyword search
    const q = (searchQuery || '').toLowerCase().trim();
    const matchesSearch = !q ||
      cName.includes(q) ||
      cCity.includes(q) ||
      cState.includes(q) ||
      cShortDesc.includes(q) ||
      collegeStreams.some(cs => cs.toLowerCase().includes(q)) ||
      (Array.isArray(c.campusLocations) && c.campusLocations.some(l => (l || '').toLowerCase().includes(q))) ||
      (Array.isArray(c.courses) && c.courses.some(co => (co?.name || '').toLowerCase().includes(q) || (co?.type || '').toLowerCase().includes(q))) ||
      (Array.isArray(c.recruiters) && c.recruiters.some(r => (r || '').toLowerCase().includes(q)));

    return matchesState && matchesCity && matchesCourse && matchesType && matchesSearch;
  });

  const shortlistedColleges = colleges.filter(c => shortlistedIds.includes(c.id));

  return (
    <div className="bg-white min-h-screen text-slate-800 font-sans antialiased selection:bg-[#0057D9]/10 selection:text-[#0057D9]" id="public-portal-root">
      
      {/* ================= 1. GLOBAL NAVIGATION ================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-100" id="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <a href="#hero-section" className="flex items-center gap-3 group" title="NEXORA Education & Career Academy">
            <NexoraLogo size="md" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-semibold text-slate-700">
            <a href="#hero-section" className="hover:text-[#0057D9] transition-colors py-1">Home</a>
            <a href="#why-nexora-section" className="hover:text-[#0057D9] transition-colors py-1">About</a>
            <a href="#upcoming-exams-section" className="hover:text-[#0057D9] transition-colors py-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              Exams
            </a>
            <a href="#colleges-section" className="hover:text-[#0057D9] transition-colors py-1">Colleges</a>
            <a href="#contact-section" className="hover:text-[#0057D9] transition-colors py-1 text-[#0057D9] font-bold">Contact</a>
          </nav>

          {/* Right Action Side */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Shortlist Badge Pill */}
            {shortlistedIds.length > 0 && (
              <button 
                onClick={() => setShowShortlistModal(true)}
                className="px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-rose-100 transition-all shadow-2xs"
                title="View Shortlisted Colleges"
              >
                <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                <span className="hidden sm:inline">Shortlist</span> ({shortlistedIds.length})
              </button>
            )}

            <button 
              onClick={onLoginClick}
              className="px-3.5 sm:px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all text-xs flex items-center gap-2"
              id="header-login-btn"
            >
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>Sign In</span>
            </button>

            {/* Single Primary Header CTA */}
            <a 
              href="#apply-online-section"
              className="hidden sm:flex px-4 sm:px-5 py-2.5 bg-[#0057D9] hover:bg-[#004dc2] text-white font-bold rounded-xl shadow-md shadow-[#0057D9]/15 hover:shadow-lg hover:-translate-y-0.5 transition-all text-xs items-center gap-2"
              id="header-apply-btn"
            >
              <span>Apply Online</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>

            {/* Mobile Hamburger Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              aria-label="Toggle mobile navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-xl">
            <nav className="flex flex-col space-y-1.5 text-sm font-semibold text-slate-700">
              <a 
                href="#hero-section" 
                onClick={() => setMobileMenuOpen(false)} 
                className="px-3 py-2.5 rounded-xl hover:bg-slate-50 hover:text-[#0057D9] transition-colors"
              >
                Home
              </a>
              <a 
                href="#why-nexora-section" 
                onClick={() => setMobileMenuOpen(false)} 
                className="px-3 py-2.5 rounded-xl hover:bg-slate-50 hover:text-[#0057D9] transition-colors"
              >
                About NEXORA Academy
              </a>
              <a 
                href="#colleges-section" 
                onClick={() => setMobileMenuOpen(false)} 
                className="px-3 py-2.5 rounded-xl hover:bg-slate-50 hover:text-[#0057D9] transition-colors"
              >
                Colleges Directory
              </a>
              <a 
                href="#upcoming-exams-section" 
                onClick={() => setMobileMenuOpen(false)} 
                className="px-3 py-2.5 rounded-xl hover:bg-slate-50 hover:text-[#0057D9] transition-colors flex items-center justify-between"
              >
                <span>Upcoming Examinations</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">New</span>
              </a>
              <a 
                href="#contact-section" 
                onClick={() => setMobileMenuOpen(false)} 
                className="px-3 py-2.5 rounded-xl bg-blue-50/70 text-[#0057D9] font-bold hover:bg-blue-100 transition-colors"
              >
                Contact Admissions Desk
              </a>
            </nav>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <a 
                href="#apply-online-section"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 bg-[#0057D9] text-white text-center font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <span>Apply Online for Admission</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ================= 2. HOMEPAGE HERO ================= */}
      <HeroSection onQuickSearch={handleQuickSearch} />

      {/* ================= 3. TRUST METRICS ================= */}
      <TrustMetricsSection />

      {/* ================= 4. HOW EDUCONNECT WORKS ================= */}
      <HowItWorksSection />

      {/* ================= UPCOMING / RELEASED EXAMINATIONS (Spec #2, #20) ================= */}
      <UpcomingExamsSection 
        onApplyOrBook={(exam) => {
          setSelectedExamForApplication(exam);
          setShowApplyModal(true);
        }} 
      />

      {/* ================= 5. ONE PLATFORM. MULTIPLE STUDENT NEEDS ================= */}
      <StudentNeedsSection />

      {/* ================= 6. FIND YOUR COLLEGE DIRECTORY SECTION ================= */}
      <section className="py-20 bg-slate-50/70 border-b border-slate-200/80" id="colleges-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#0057D9] text-xs font-bold uppercase tracking-wider">
                <Building className="h-3.5 w-3.5" />
                Verified University Admissions
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Find the Right College for Your Future
              </h2>
              <p className="text-slate-600 text-sm">
                Search, compare, shortlist, and discover colleges based on your goals.
              </p>
            </div>
            
            {/* Search Box */}
            <div className="relative w-full md:w-80 shrink-0">
              <input 
                type="text" 
                placeholder="Search college, city, or stream..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-[#0057D9] focus:ring-1 focus:ring-[#0057D9] rounded-xl pl-9 pr-8 py-2.5 text-xs font-semibold outline-none transition-all shadow-2xs"
              />
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* ADVANCED MULTI-CRITERIA FILTERS BAR */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 mb-8 space-y-4 shadow-sm" id="college-filters-bar">
            
            {/* State Pills Row */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-700 uppercase tracking-wider mr-2">
                <MapPin className="h-3.5 w-3.5 text-[#0057D9]" />
                State:
              </div>
              {states.map(state => (
                <button
                  key={state}
                  onClick={() => setSelectedState(state)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedState === state 
                      ? 'bg-[#0057D9] text-white shadow-xs' 
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              
              {/* City Filter */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">City / Campus</label>
                <select 
                  value={selectedCity} 
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-[#0057D9]"
                >
                  <option value="All">All Cities</option>
                  {cities.filter(c => c !== 'All').map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Course Stream Filter */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Course / Degree</label>
                <select 
                  value={selectedCourse} 
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-[#0057D9]"
                >
                  <option value="All">All Degree Streams</option>
                  {courseStreams.filter(cs => cs !== 'All').map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>

              {/* College Type Filter */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Accreditation</label>
                <select 
                  value={selectedCollegeType} 
                  onChange={(e) => setSelectedCollegeType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-[#0057D9]"
                >
                  <option value="All">All Accreditations</option>
                  <option value="NAAC A/A+">NAAC Grade A / A+ / A++</option>
                  <option value="Autonomous">Autonomous Universities</option>
                </select>
              </div>

              {/* Reset & Count Action */}
              <div className="flex items-end gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-slate-700">
                  <span>Found: <strong className="text-[#0057D9] font-bold">{filteredColleges.length}</strong> colleges</span>
                  {(selectedState !== 'All' || selectedCity !== 'All' || selectedCourse !== 'All' || searchQuery !== '') && (
                    <button 
                      onClick={resetFilters}
                      className="text-[#0057D9] hover:underline font-bold flex items-center gap-1 text-[11px]"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* COLLEGE CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredColleges.map(college => {
              const isShortlisted = shortlistedIds.includes(college.id);
              return (
                <div 
                  key={college.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:shadow-xl hover:border-[#0057D9]/30 hover:-translate-y-1 transition-all duration-300 group"
                >
                  {/* Image & Badges */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img 
                      src={college.imageUrl} 
                      alt={college.name} 
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800";
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    
                    {/* NAAC Badge */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm border border-slate-100 flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-[11px] font-extrabold text-slate-900">NAAC: {college.naacGrade}</span>
                    </div>

                    {/* Shortlist Heart Button */}
                    <button 
                      onClick={(e) => toggleShortlist(college.id, e)}
                      className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all shadow-sm ${
                        isShortlisted 
                          ? 'bg-rose-500 text-white' 
                          : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white'
                      }`}
                      title={isShortlisted ? 'Remove from shortlist' : 'Shortlist college'}
                    >
                      <Heart className={`h-4 w-4 ${isShortlisted ? 'fill-white' : ''}`} />
                    </button>

                    {/* Location Badge */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="font-semibold flex items-center gap-1 drop-shadow-md">
                        <MapPin className="h-3.5 w-3.5 text-amber-400" />
                        {college.city}, {college.state}
                      </span>
                      {college.campusLocations && (
                        <span className="bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                          TS & AP Campuses
                        </span>
                      )}
                    </div>
                  </div>

                  {/* College Card Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-base font-extrabold text-slate-950 leading-snug group-hover:text-[#0057D9] transition-colors">
                        {college.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {college.shortDescription}
                      </p>

                      {/* Course Pills */}
                      <div className="pt-1 flex flex-wrap gap-1.5">
                        {college.courses.slice(0, 3).map((co, idx) => (
                          <span key={idx} className="bg-slate-50 border border-slate-200/80 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                            {co.name.split('(')[0].replace('—', '-').trim()}
                          </span>
                        ))}
                        {college.courses.length > 3 && (
                          <span className="bg-blue-50 text-[#0057D9] text-[10px] font-bold px-2 py-0.5 rounded-md">
                            +{college.courses.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Salary & Eligibility Markers */}
                    <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Avg Package</span>
                        <span className="text-xs font-extrabold text-slate-900">{college.averagePackage}</span>
                      </div>
                      <div className="bg-blue-50/70 p-2 rounded-xl border border-blue-100/60">
                        <span className="text-[10px] uppercase font-bold text-[#0057D9] tracking-wider block">Highest Package</span>
                        <span className="text-xs font-extrabold text-[#0057D9]">{college.highestPackage}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-1 flex gap-2">
                      <button
                        id={`college-know-more-${college.id}`}
                        onClick={() => setSelectedCollege(college)}
                        className="flex-1 py-2.5 bg-slate-900 hover:bg-[#0057D9] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Know More</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => toggleShortlist(college.id, e)}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                          isShortlisted 
                            ? 'bg-rose-50 border-rose-200 text-rose-600' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isShortlisted ? 'fill-rose-600 text-rose-600' : 'text-slate-400'}`} />
                        <span className="hidden sm:inline">{isShortlisted ? 'Saved' : 'Shortlist'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredColleges.length === 0 && (
              <div className="col-span-full py-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200">
                <Building className="h-12 w-12 text-slate-300 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">No colleges found matching criteria</h3>
                  <p className="text-slate-500 text-xs">Try adjusting your state, city, or course stream filter options.</p>
                </div>
                <button 
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-[#0057D9] text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ================= 7. POPULAR PROGRAMS ================= */}
      <PopularProgramsSection onSelectProgram={handleProgramSelect} />

      {/* ================= 8. SPECIALTY PROGRAMS (IAS INTEGRATED DEGREE) ================= */}
      <SpecialtyProgramsSection onLearnMore={handleProgramSelect} />

      {/* ================= 9. WHY CHOOSE EDUCONNECT? (COMPARISON) ================= */}
      <NiatComparisonSection />

      {/* ================= 10. CAREER ASSESSMENT ================= */}
      <CareerAssessmentSection />

      {/* ================= 11. INDUSTRY TESTIMONIALS ================= */}
      <TestimonialsSection />

      {/* ================= 12. CERTIFICATIONS & MASTERCLASSES ================= */}
      <CertificationsSection />
      <MasterclassesAndCounsellorSection />

      {/* ================= 13. SCHOLARSHIPS & EDUCATION LOAN SUPPORT ================= */}
      <FinancialSupportSection />

      {/* ================= 14. FREQUENTLY ASKED QUESTIONS (FAQ) ================= */}
      <FaqSection />

      {/* ================= 14. REGISTRATION / APPLY ONLINE (3-STEP FLOW) ================= */}
      <ApplyOnlineFlow 
        selectedExam={selectedExamForApplication}
        onExploreColleges={scrollToColleges} 
        onProceedToSignIn={onProceedToSignIn} 
      />

      {/* ================= 15. DIRECT CONTACT FORM & ADMISSIONS DESK ================= */}
      <ContactFormSection />

      {/* ================= 16. FOOTER ================= */}
      <FooterSection />

      {/* ================= CAMPUS DETAILS MODAL ================= */}
      {selectedCollege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in zoom-in duration-200 my-8">
            
            {/* Modal Header Cover */}
            <div className="relative h-48 bg-slate-900">
              <img 
                src={selectedCollege.imageUrl} 
                alt={selectedCollege.name}
                className="w-full h-full object-cover opacity-80" 
              />
              <button 
                onClick={() => setSelectedCollege(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-all"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-4 left-6 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0057D9] px-2.5 py-1 rounded-md mb-1 inline-block">
                  NAAC: {selectedCollege.naacGrade}
                </span>
                <h3 className="text-xl font-extrabold drop-shadow-md">{selectedCollege.name}</h3>
                <p className="text-xs text-white/90 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  {selectedCollege.city}, {selectedCollege.state}
                </p>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* About Section */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900">About Campus & Accreditation</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedCollege.about || selectedCollege.shortDescription}
                </p>
              </div>

              {/* Placement Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Average Package</span>
                  <span className="text-sm font-extrabold text-slate-900">{selectedCollege.averagePackage}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#0057D9] block">Highest Package</span>
                  <span className="text-sm font-extrabold text-[#0057D9]">{selectedCollege.highestPackage}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">Placement Rate</span>
                  <span className="text-sm font-extrabold text-emerald-600">{selectedCollege.placementRate}</span>
                </div>
              </div>

              {/* Offered Programs List */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900">Offered Programs</h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {selectedCollege.courses.map((co, idx) => (
                    <div key={idx} className="p-3.5 bg-white flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{co.name}</span>
                        <span className="text-slate-500 text-[11px] font-medium">Duration: {co.duration}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                        {co.type || 'Full-Time Degree'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Recruiters */}
              {selectedCollege.recruiters && selectedCollege.recruiters.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900">Key Recruiters</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCollege.recruiters.map((rec, rIdx) => (
                      <span key={rIdx} className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg">
                        {rec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Infrastructure & Hostel Details */}
              {(selectedCollege.hostelInfo || (selectedCollege.infrastructure && selectedCollege.infrastructure.length > 0)) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {selectedCollege.hostelInfo && (
                    <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-2xl space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">Hostel & Accommodation</span>
                      <p className="text-xs text-amber-950 font-medium">{selectedCollege.hostelInfo}</p>
                    </div>
                  )}
                  {selectedCollege.infrastructure && selectedCollege.infrastructure.length > 0 && (
                    <div className="bg-blue-50/70 border border-blue-200/80 p-3.5 rounded-2xl space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 block">Campus Amenities</span>
                      <p className="text-xs text-blue-950 font-medium">{selectedCollege.infrastructure.join(', ')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Modal CTAs */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3 border-t border-slate-100">
                <a 
                  href="#apply-online-section"
                  onClick={() => setSelectedCollege(null)}
                  className="flex-1 py-3 bg-[#0057D9] hover:bg-[#004dc2] text-white text-xs font-bold rounded-xl text-center shadow-md"
                >
                  Apply to {selectedCollege.name.split(' ')[0]} →
                </a>
                {selectedCollege.websiteUrl && (
                  <a 
                    href={selectedCollege.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-slate-200"
                  >
                    <Globe className="h-4 w-4" />
                    Official Website
                  </a>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {showShortlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
                <h3 className="text-base font-extrabold text-slate-900">Your Shortlisted Colleges ({shortlistedColleges.length})</h3>
              </div>
              <button 
                onClick={() => setShowShortlistModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
              {shortlistedColleges.map(c => (
                <div key={c.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{c.name}</h5>
                    <p className="text-[11px] text-slate-500">{c.city}, {c.state} • Highest: {c.highestPackage}</p>
                  </div>
                  <button 
                    onClick={() => toggleShortlist(c.id)}
                    className="text-rose-500 hover:text-rose-700 text-xs font-bold p-1"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex gap-3">
              <a 
                href="#apply-online-section"
                onClick={() => setShowShortlistModal(false)}
                className="flex-1 py-3 bg-[#0057D9] text-white text-xs font-bold rounded-xl text-center shadow-md"
              >
                Apply to Shortlisted Colleges →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ================= APPLY ONLINE FOR ADMISSION COUNSELLING MODAL ================= */}
      {showApplyModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowApplyModal(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95 duration-200 my-auto">
            <ApplyOnlineFlow 
              isModal={true}
              onClose={() => setShowApplyModal(false)}
              selectedExam={selectedExamForApplication}
              onExploreColleges={() => {
                setShowApplyModal(false);
                scrollToColleges();
              }} 
              onProceedToSignIn={(creds) => {
                setShowApplyModal(false);
                if (onProceedToSignIn) {
                  onProceedToSignIn(creds);
                } else {
                  onLoginClick();
                }
              }} 
            />
          </div>
        </div>
      )}

    </div>
  );
}
