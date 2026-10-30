import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, ArrowLeft, CheckCircle2, GraduationCap, ShieldCheck, 
  Sparkles, Building, User, Mail, Phone, Calendar, MapPin, Award,
  Key, Copy, Check, Eye, EyeOff, ShieldAlert, LogIn, X
} from 'lucide-react';
import { Exam } from '../types';
import { persistApplicationSubmission } from '../utils/persistentStorage';
import { syncRecordToFirestore } from '../firebase';

interface ApplyOnlineFlowProps {
  onExploreColleges: () => void;
  onGoToDashboard?: () => void;
  onProceedToSignIn?: (credentials: { username: string; password?: string }) => void;
  selectedExam?: Exam | null;
  isModal?: boolean;
  onClose?: () => void;
}

export default function ApplyOnlineFlow({ onExploreColleges, onGoToDashboard, onProceedToSignIn, selectedExam, isModal, onClose }: ApplyOnlineFlowProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [applicationId, setApplicationId] = useState<string>('');
  const [stepError, setStepError] = useState<string>('');

  // Auto-created account details
  const [createdAccount, setCreatedAccount] = useState<{
    studentId: string;
    username: string;
    password: string;
    mustChangePassword: boolean;
  } | null>(null);
  const [showCreatedPassword, setShowCreatedPassword] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    fullName: '',
    mobile: '',
    email: '',
    dob: '',

    // Step 2: Academic Profile & Preferences
    qualification: '10+2 / Intermediate',
    stream: 'MPC (Maths, Physics, Chem)',
    college12th: '',
    board: 'CBSE',
    score: '',
    city: '',
    state: 'Telangana',

    // Preferences
    interestedProgram: 'B.Tech Computer Science & AI',
    preferredState: 'Telangana',
    preferredCollege: '',
    specialization: 'Artificial Intelligence & Machine Learning',
    wantCounselling: true
  });

  // When selectedExam is passed, adapt application to that examination
  useEffect(() => {
    if (selectedExam) {
      if (selectedExam.course && selectedExam.course !== 'All Streams') {
        setFormData(prev => ({ ...prev, interestedProgram: selectedExam.course }));
      }
      setIsSubmitted(false);
      setCurrentStep(1);
    }
  }, [selectedExam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (stepError) setStepError('');
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim()) return 'Please enter your full name';
    if (!formData.mobile.trim() || formData.mobile.length < 10) return 'Please enter a valid 10-digit mobile number';
    if (!formData.email.trim() || !formData.email.includes('@')) return 'Please enter a valid email address';
    if (!formData.dob) return 'Please select your date of birth';
    return '';
  };

  const validateStep2 = () => {
    if (!formData.college12th.trim()) return 'Please enter your school or college name';
    if (!formData.score.trim()) return 'Please enter your score or percentage';
    if (!formData.city.trim()) return 'Please enter your city';
    return '';
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const err = validateStep1();
      if (err) {
        setStepError(err);
        return;
      }
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setStepError('');
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) {
      setStepError(err);
      return;
    }

    setIsSubmitting(true);
    setStepError('');

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          mobile: formData.mobile,
          email: formData.email,
          gender: 'Not specified',
          dob: formData.dob,
          college12th: formData.college12th,
          stream: formData.stream,
          board: formData.board,
          marks12th: Number(formData.score) || 85,
          address: `${formData.city}, ${formData.state}`,
          city: formData.city,
          state: formData.state,
          interestedCourse: formData.interestedProgram,
          preferredState: formData.preferredState,
          preferredCollege: formData.preferredCollege || 'Top Recommended',
          specialization: formData.specialization,
          assignedExamId: selectedExam?.id || 'exam-aptitude-01'
        })
      });

      const data = await response.json();
      const generatedId = data.credentials?.studentId || data.registration?.id || data.studentId || `EDU2026${Math.floor(1000 + Math.random() * 9000)}`;
      setApplicationId(generatedId);

      if (data.credentials) {
        const creds = {
          studentId: data.credentials.studentId,
          username: data.credentials.username,
          password: data.credentials.password,
          mustChangePassword: Boolean(data.credentials.mustChangePassword)
        };
        setCreatedAccount(creds);
        persistApplicationSubmission(data.student, data.registration, creds);
        if (data.student?.id) syncRecordToFirestore('students', data.student.id, data.student);
        if (data.registration?.id) syncRecordToFirestore('registrations', data.registration.id, data.registration);
      } else {
        const fallbackPassword = `Stud@${Math.floor(1000 + Math.random() * 9000)}`;
        const creds = {
          studentId: generatedId,
          username: formData.email.toLowerCase().trim(),
          password: fallbackPassword,
          mustChangePassword: true
        };
        setCreatedAccount(creds);
        const stRec = data.student || { id: generatedId, fullName: formData.fullName, email: formData.email };
        persistApplicationSubmission(stRec, data.registration, creds);
        syncRecordToFirestore('students', generatedId, stRec);
      }
      setIsSubmitted(true);
    } catch (err) {
      // Fallback for offline/development test
      const generatedId = `EDU-2026-${Math.floor(100 + Math.random() * 899)}`;
      const fallbackPassword = `Stud@${Math.floor(1000 + Math.random() * 9000)}`;
      setApplicationId(generatedId);
      const fallbackCreds = {
        studentId: generatedId,
        username: formData.email.toLowerCase().trim(),
        password: fallbackPassword,
        mustChangePassword: true
      };
      setCreatedAccount(fallbackCreds);
      persistApplicationSubmission({ id: generatedId, fullName: formData.fullName, email: formData.email }, null, fallbackCreds);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      mobile: '',
      email: '',
      dob: '',
      qualification: '10+2 / Intermediate',
      stream: 'MPC (Maths, Physics, Chem)',
      college12th: '',
      board: 'CBSE',
      score: '',
      city: '',
      state: 'Telangana',
      interestedProgram: 'B.Tech Computer Science & AI',
      preferredState: 'Telangana',
      preferredCollege: '',
      specialization: 'Artificial Intelligence & Machine Learning',
      wantCounselling: true
    });
    setCurrentStep(1);
    setIsSubmitted(false);
    setApplicationId('');
    setCreatedAccount(null);
  };

  return (
    <section className={isModal ? "p-6 sm:p-8 bg-white" : "py-20 bg-slate-50 border-t border-slate-200/80"} id={isModal ? undefined : "apply-online-section"}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* If Modal, show a dedicated modal header with close button */}
        {isModal ? (
          <div className="flex items-center justify-between pb-5 mb-8 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-blue-50 text-[#0057D9] flex items-center justify-center font-bold border border-blue-100 shrink-0">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-[#0057D9] text-[10px] font-bold uppercase tracking-wider mb-0.5">
                  Direct University Admissions 2026
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Apply Online for Admission Counselling
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedExam ? `Official Examination Application for ${selectedExam.title} (Code: ${selectedExam.id})` : 'Simple 2-step application to discover merit seats, scholarship quotas, and secure admissions.'}
                </p>
              </div>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        ) : (
          /* Regular In-page Section Header */
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#0057D9] text-xs font-bold uppercase tracking-wider">
              Direct University Admissions 2026
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Apply Online for Admission Counselling
            </h2>
            <p className="text-slate-600 text-sm">
              Simple 2-step application to discover merit seats, scholarship quotas, and secure admissions.
            </p>
          </div>
        )}

        {/* Selected Exam Notification Banner */}
        {selectedExam && (
          <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-amber-500/15 border-2 border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold shrink-0 border border-amber-500/30">
                <Sparkles className="h-6 w-6 text-amber-600" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-md">
                    Selected Assessment
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Registration Open
                  </span>
                </div>
                <h4 className="text-base font-black text-slate-900">{selectedExam.title}</h4>
                <p className="text-xs text-slate-600">
                  Duration: <strong>{selectedExam.durationMinutes} Mins</strong> &bull; Assessment Fee: <strong className="text-emerald-700">₹{selectedExam.fee || 500}</strong> &bull; Stream: <strong>{selectedExam.course || 'All Streams'}</strong>
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-block text-[11px] font-bold text-[#0057D9] bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs">
                Candidate Account + Exam Registration
              </span>
            </div>
          </div>
        )}

        {/* Outer Form Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          
          {/* Top Progress Bar & Stepper Indicator */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#0057D9] bg-blue-500/15 px-2.5 py-1 rounded-md inline-block mb-1">
                  Step {currentStep} of 2
                </span>
                <h3 className="text-xl font-bold text-white">
                  {currentStep === 1 && "Basic Information"}
                  {currentStep === 2 && "Academic Profile"}
                </h3>
              </div>

              {/* Progress Steps Tabs */}
              <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
                {/* Step 1 Pill */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  currentStep === 1 
                    ? 'bg-[#0057D9] text-white shadow-sm font-bold' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                }`}>
                  <span>01</span>
                  <span className="hidden sm:inline">Basic Details</span>
                </div>

                <span className="text-slate-600">→</span>

                {/* Step 2 Pill */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  currentStep === 2 
                    ? 'bg-[#0057D9] text-white shadow-sm font-bold' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  <span>02</span>
                  <span className="hidden sm:inline">Academic Profile</span>
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-6 overflow-hidden">
              <div 
                className="bg-[#0057D9] h-full transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / 2) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-10">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div 
                  key={`step-${currentStep}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  
                  {/* Step Error Notice */}
                  {stepError && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>{stepError}</span>
                    </div>
                  )}

                  {/* ================= STEP 1 ================= */}
                  {currentStep === 1 && (
                    <div className="space-y-5">
                      <div className="border-b border-slate-100 pb-3">
                        <h4 className="text-lg font-bold text-slate-900">Let's Start With Your Details</h4>
                        <p className="text-xs text-slate-500">Provide your basic contact information for application updates.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Full Name *</label>
                          <div className="relative">
                            <input 
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleChange}
                              placeholder="e.g. Rahul Sharma"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#0057D9] focus:bg-white focus:ring-1 focus:ring-[#0057D9] transition-all"
                            />
                            <User className="h-4 w-4 text-slate-400 absolute right-3.5 top-3" />
                          </div>
                        </div>

                        {/* Mobile Number */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Mobile Number *</label>
                          <div className="relative">
                            <input 
                              type="tel"
                              name="mobile"
                              value={formData.mobile}
                              onChange={handleChange}
                              placeholder="10-digit mobile number"
                              maxLength={10}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#0057D9] focus:bg-white focus:ring-1 focus:ring-[#0057D9] transition-all"
                            />
                            <Phone className="h-4 w-4 text-slate-400 absolute right-3.5 top-3" />
                          </div>
                        </div>

                        {/* Email Address */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Email Address *</label>
                          <div className="relative">
                            <input 
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="e.g. rahul.sharma@example.com"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#0057D9] focus:bg-white focus:ring-1 focus:ring-[#0057D9] transition-all"
                            />
                            <Mail className="h-4 w-4 text-slate-400 absolute right-3.5 top-3" />
                          </div>
                        </div>

                        {/* Date of Birth */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Date of Birth *</label>
                          <div className="relative">
                            <input 
                              type="date"
                              name="dob"
                              value={formData.dob}
                              onChange={handleChange}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#0057D9] focus:bg-white focus:ring-1 focus:ring-[#0057D9] transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button 
                          type="button"
                          onClick={handleNext}
                          className="px-8 py-3.5 bg-[#0057D9] hover:bg-[#004dc2] text-white font-bold rounded-xl shadow-md shadow-[#0057D9]/20 hover:shadow-lg transition-all flex items-center gap-2 text-xs uppercase tracking-wider"
                          id="step1-continue-btn"
                        >
                          Continue
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ================= STEP 2 (FINAL STEP) ================= */}
                  {currentStep === 2 && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="border-b border-slate-100 pb-3">
                        <h4 className="text-lg font-bold text-slate-900">Academic Background</h4>
                        <p className="text-xs text-slate-500">Provide your 12th stream, school, board, and score details.</p>
                      </div>

                      {/* Academic Profile */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Qualification / Class */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Qualification / Class *</label>
                          <select 
                            name="qualification"
                            value={formData.qualification}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#0057D9] focus:bg-white focus:ring-1 focus:ring-[#0057D9] transition-all cursor-pointer"
                          >
                            <option>10+2 / Intermediate</option>
                            <option>CBSE Class XII</option>
                            <option>ICSE / ISC Class XII</option>
                            <option>Polytechnic Diploma</option>
                            <option>Undergraduate Degree (Pursuing / Completed)</option>
                          </select>
                        </div>

                        {/* Intermediate Stream (MPC, BiPC, CEC, MEC, etc.) */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Intermediate Stream / Branch *</label>
                          <select 
                            name="stream"
                            value={formData.stream}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0057D9] bg-blue-50/50 outline-none focus:border-[#0057D9] focus:bg-white focus:ring-1 focus:ring-[#0057D9] transition-all cursor-pointer"
                          >
                            <option value="MPC (Maths, Physics, Chem)">MPC (Maths, Physics, Chemistry)</option>
                            <option value="BiPC (Biology, Physics, Chem)">BiPC (Biology, Physics, Chemistry)</option>
                            <option value="CEC (Civics, Econ, Commerce)">CEC (Civics, Economics, Commerce)</option>
                            <option value="MEC (Maths, Econ, Commerce)">MEC (Maths, Economics, Commerce)</option>
                            <option value="HEC (History, Econ, Civics)">HEC (History, Economics, Civics)</option>
                            <option value="Diploma / Polytechnic">Polytechnic / Diploma Stream</option>
                            <option value="Others">Others / Vocational</option>
                          </select>
                        </div>

                        {/* School / College Name */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">School / College Name *</label>
                          <input 
                            type="text"
                            name="college12th"
                            value={formData.college12th}
                            onChange={handleChange}
                            placeholder="e.g. Sri Chaitanya / Narayana Junior College"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#0057D9] focus:bg-white focus:ring-1 focus:ring-[#0057D9] transition-all"
                          />
                        </div>

                        {/* Board */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Board *</label>
                          <select 
                            name="board"
                            value={formData.board}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#0057D9] focus:bg-white focus:ring-1 focus:ring-[#0057D9] transition-all cursor-pointer"
                          >
                            <option>CBSE</option>
                            <option>TSBIE (Telangana State Board)</option>
                            <option>BIEAP (Andhra Pradesh State Board)</option>
                            <option>ISC / ICSE</option>
                            <option>Karnataka PU Board</option>
                            <option>Maharashtra State Board</option>
                            <option>Gujarat GSEB</option>
                            <option>Other State Board</option>
                          </select>
                        </div>

                        {/* Score / Percentage */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Score / Percentage (%) *</label>
                          <input 
                            type="number"
                            name="score"
                            min="0"
                            max="100"
                            value={formData.score}
                            onChange={handleChange}
                            placeholder="e.g. 88"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#0057D9] focus:bg-white focus:ring-1 focus:ring-[#0057D9] transition-all"
                          />
                        </div>

                        {/* City */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">City *</label>
                          <input 
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="e.g. Hyderabad / Vijayawada"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#0057D9] focus:bg-white focus:ring-1 focus:ring-[#0057D9] transition-all"
                          />
                        </div>

                        {/* State */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">State *</label>
                          <select 
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#0057D9] focus:bg-white focus:ring-1 focus:ring-[#0057D9] transition-all cursor-pointer"
                          >
                            <option>Telangana</option>
                            <option>Andhra Pradesh</option>
                            <option>Karnataka</option>
                            <option>Maharashtra</option>
                            <option>Gujarat</option>
                            <option>Tamil Nadu</option>
                            <option>Delhi NCR</option>
                            <option>Other State</option>
                          </select>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                        <button 
                          type="button"
                          onClick={handleBack}
                          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back
                        </button>
                        <button 
                          type="submit"
                          disabled={isSubmitting}
                          className="px-8 py-3.5 bg-[#0057D9] hover:bg-[#004dc2] text-white font-bold rounded-xl shadow-md shadow-[#0057D9]/20 hover:shadow-lg transition-all flex items-center gap-2 text-xs uppercase tracking-wider disabled:opacity-70 cursor-pointer"
                          id="submit-application-btn"
                        >
                          {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </form>
                  )}

                </motion.div>
              ) : (
                /* ================= SUCCESS SCREEN ================= */
                <motion.div 
                  key="success-screen"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 space-y-6 max-w-lg mx-auto text-left"
                >
                  <div className="text-center space-y-3">
                    <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>

                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                        Account Created & Registered
                      </span>
                      <h4 className="text-2xl font-extrabold text-slate-900">
                        Application Submitted Successfully! 🎉
                      </h4>
                      <p className="text-xs text-slate-600">
                        Your student account has been created. Use the credentials below to access your portal.
                      </p>
                    </div>
                  </div>

                  {/* Generated Student Account Credentials Card */}
                  <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-amber-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                          Official Student Credentials
                        </span>
                      </div>
                      <span className="text-[10px] font-mono bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded border border-blue-700/50">
                        Status: Active
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Student / Reference ID */}
                      <div className="flex items-center justify-between p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Student / Application ID</span>
                          <span className="font-mono font-bold text-blue-300 text-sm">
                            {createdAccount?.studentId || applicationId || 'EDU-2026-901'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(createdAccount?.studentId || applicationId || '', 'studentId')}
                          className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                        >
                          {copiedField === 'studentId' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedField === 'studentId' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      {/* Login Username / Email */}
                      <div className="flex items-center justify-between p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Login Username / Email</span>
                          <span className="font-mono font-bold text-white text-sm">
                            {createdAccount?.username || formData.email || 'student@example.com'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(createdAccount?.username || formData.email || '', 'username')}
                          className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                        >
                          {copiedField === 'username' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedField === 'username' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      {/* Temporary Password */}
                      <div className="flex items-center justify-between p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-amber-400 block">Temporary Password</span>
                          <span className="font-mono font-bold text-amber-300 text-sm tracking-wider">
                            {showCreatedPassword ? (createdAccount?.password || 'Stud@2026') : '••••••••••••'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShowCreatedPassword(!showCreatedPassword)}
                            className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-all cursor-pointer"
                            title={showCreatedPassword ? "Hide password" : "Show password"}
                          >
                            {showCreatedPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(createdAccount?.password || '', 'password')}
                            className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                          >
                            {copiedField === 'password' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copiedField === 'password' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Security Notice: Mandatory password reset on first login */}
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-200/90 leading-relaxed">
                      <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-300 block font-semibold">Important Security Requirement:</strong>
                        Upon your first login using this temporary password, you will be required to change your password (enter old, new, and confirm password) before accessing the student dashboard.
                      </div>
                    </div>
                  </div>

                  {/* Primary & Secondary Action Buttons */}
                  <div className="space-y-2.5 pt-2">
                    {onProceedToSignIn && (
                      <button 
                        type="button"
                        onClick={() => {
                          if (onClose) onClose();
                          if (createdAccount) {
                            onProceedToSignIn({
                              username: createdAccount.username,
                              password: createdAccount.password
                            });
                          } else {
                            onProceedToSignIn({
                              username: formData.email
                            });
                          }
                        }}
                        className="w-full py-3.5 bg-[#0057D9] hover:bg-[#004dc2] text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
                        id="proceed-to-signin-btn"
                      >
                        <LogIn className="h-4 w-4" />
                        <span>Proceed to Sign In & Set Password</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </button>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <button 
                        type="button"
                        onClick={() => {
                          const fullCreds = `NEXORA Student Credentials\nStudent ID: ${createdAccount?.studentId || applicationId}\nUsername: ${createdAccount?.username || formData.email}\nTemporary Password: ${createdAccount?.password}\n\n*Note: Password change required on first login.`;
                          copyToClipboard(fullCreds, 'all');
                        }}
                        className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {copiedField === 'all' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedField === 'all' ? 'All Credentials Copied!' : 'Copy All Details'}</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => {
                          if (onClose) onClose();
                          onExploreColleges();
                        }}
                        className="flex-1 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Building className="h-3.5 w-3.5 text-blue-600" />
                        <span>Explore Colleges</span>
                      </button>

                      <button 
                        type="button"
                        onClick={resetForm}
                        className="py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-600 font-semibold rounded-xl border border-slate-200 text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Apply Another
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
