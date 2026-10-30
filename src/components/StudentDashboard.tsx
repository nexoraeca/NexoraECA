import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadarChart
} from 'recharts';
import { 
  GraduationCap, LayoutDashboard, FileText, BarChart2, Sparkles, User, 
  Bell, LogOut, Clock, Play, CheckCircle, AlertCircle, ChevronRight, 
  ArrowRight, Download, Award, MapPin, DollarSign, Building, BookOpen, RefreshCw,
  MessageSquare, Send, Phone, Mail, CheckCheck, Menu, X, ChevronLeft,
  ShieldCheck, ShieldAlert, CreditCard, Lock, Calendar, CheckCircle2, Info, Eye, ExternalLink, AlertTriangle
} from 'lucide-react';
import { Student, Exam, ExamAttempt, ExamSlot, ExamRegistration, CollegeRecommendation, type Notification as AppNotification } from '../types';
import { NexoraEmblem } from './NexoraLogo';
import { persistExamAttempt } from '../utils/persistentStorage';
import { syncRecordToFirestore } from '../firebase';

interface StudentDashboardProps {
  student: Student;
  username: string;
  onLogout: () => void;
}

export default function StudentDashboard({ student, username, onLogout }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('student_active_tab');
      if (saved) return saved;
    } catch (e) {}
    return 'dashboard';
  });

  useEffect(() => {
    try {
      localStorage.setItem('student_active_tab', activeTab);
    } catch (e) {}
  }, [activeTab]);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [exam, setExam] = useState<Exam | null>(null);
  const [examStarted, setExamStarted] = useState<boolean>(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<{ [qId: string]: number[] }>({});
  const [examTimer, setExamTimer] = useState<number>(7200); // Default 120 mins (2 hrs)
  const [examCompleted, setExamCompleted] = useState<boolean>(false);
  const [resultsPublished, setResultsPublished] = useState<{ [examId: string]: boolean }>({});
  const [results, setResults] = useState<ExamAttempt[]>([]);

  // Exam Scheduling, Payment & Slot Selection States (Spec #1, #3, #4, #5, #6, #7)
  const [examRegistration, setExamRegistration] = useState<ExamRegistration | null>(null);
  const [availableSlots, setAvailableSlots] = useState<ExamSlot[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [showSlotModal, setShowSlotModal] = useState<boolean>(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [bookingSlot, setBookingSlot] = useState<boolean>(false);
  const [showSecurityWarningModal, setShowSecurityWarningModal] = useState<boolean>(false);
  const [rulesAgreed, setRulesAgreed] = useState<boolean>(false);
  const [examViolationDetected, setExamViolationDetected] = useState<boolean>(false);
  const [violationReason, setViolationReason] = useState<string>('');
  const [timeNotStartedModal, setTimeNotStartedModal] = useState<{ open: boolean; message: string; scheduledStartTime?: string }>({
    open: false,
    message: ''
  });

  // Human College Recommendations State (Spec #13, #14, #15)
  const [humanRecommendations, setHumanRecommendations] = useState<CollegeRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState<boolean>(false);
  
  // Counselor & Messages State
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsgText, setNewMsgText] = useState<string>('');
  const [sendingMsg, setSendingMsg] = useState<boolean>(false);

  // Portal Notifications state
  const [sessionNotifsEnabled, setSessionNotifsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('educonnect_session_notifications');
    return saved !== null ? saved === 'true' : true;
  });
  const [notifPermissionState, setNotifPermissionState] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });
  const [notifFeedbackToast, setNotifFeedbackToast] = useState<string>('');

  const handleToggleSessionNotifs = async (val: boolean) => {
    setSessionNotifsEnabled(val);
    localStorage.setItem('educonnect_session_notifications', val ? 'true' : 'false');
    if (val) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          const res = await Notification.requestPermission();
          setNotifPermissionState(res);
          if (res === 'granted') {
            setNotifFeedbackToast('Portal notifications enabled! You will receive updates about admissions & exams.');
          } else {
            setNotifFeedbackToast('Notification permission not granted.');
          }
        } else if (Notification.permission === 'granted') {
          setNotifFeedbackToast('Portal notifications active! You will receive updates about admissions & exams.');
        } else {
          setNotifFeedbackToast('Notification permission is blocked in your browser settings.');
        }
      }
    } else {
      setNotifFeedbackToast('Portal notifications disabled.');
    }
  };

  const handleTestAlert = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification('🔔 NEXORA Portal Notification Test', {
            body: 'Platform notifications are active and working!',
            icon: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png'
          });
          setNotifFeedbackToast('Test notification dispatched!');
        } catch (e) {
          setNotifFeedbackToast('Failed to trigger test notification.');
        }
      } else {
        Notification.requestPermission().then(perm => {
          setNotifPermissionState(perm);
        });
      }
    }
  };
  const [counsellorDetails, setCounsellorDetails] = useState<any | null>(null);

  // AI Recommendation States
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [budgetRange, setBudgetRange] = useState<string>('Standard (1 - 2 Lakhs/year)');

  // Escape key listener for drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load Initial Student Data
  useEffect(() => {
    // Notifications
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        const studentNotifs = data.filter((n: any) => !n.targetStudentId || n.targetStudentId === student.id);
        setNotifications(studentNotifs);
      });

    // Get assigned Exam
    fetch('/api/exams')
      .then(res => res.json())
      .then(data => {
        const assigned = data.find((e: any) => e.id === student.assignedExamId || e.id === 'exam-aptitude-01') || data[0];
        if (assigned) {
          setExam(assigned);
          loadRegistration(assigned.id);
          loadSlots(assigned.id);
        }
      });

    // Check Results Published
    fetch('/api/exams/published-status')
      .then(res => res.json())
      .then(data => setResultsPublished(data));

    // Get Student Results
    fetch(`/api/results/${student.id}`)
      .then(res => res.json())
      .then(data => setResults(data));

    // Load Counselor Recommendations
    loadHumanRecommendations();

    // Load Counselor Messages
    loadMessages();

    // Fetch Counselor info
    fetch('/api/counsellors')
      .then(res => res.json())
      .then((cList: any[]) => {
        const found = cList.find(c => c.fullName === student.assignedCounsellor || c.id === student.assignedCounsellor);
        if (found) setCounsellorDetails(found);
      })
      .catch(err => console.error("Error fetching counsellor details:", err));
  }, [student.id, student.assignedExamId, student.assignedCounsellor, examCompleted]);

  const loadRegistration = (examId: string) => {
    fetch(`/api/exams/${examId}/registration/${student.id}`)
      .then(res => res.json())
      .then(data => {
        if (data && (data.registered || data.paymentStatus)) {
          setExamRegistration(data);
          if (data.selectedSlotId) {
            setSelectedSlotId(data.selectedSlotId);
          }
        }
      })
      .catch(err => console.error("Error loading exam registration:", err));
  };

  const loadSlots = (examId: string) => {
    fetch(`/api/exams/${examId}/slots`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAvailableSlots(data);
        }
      })
      .catch(err => console.error("Error loading exam slots:", err));
  };

  const loadHumanRecommendations = () => {
    setLoadingRecs(true);
    fetch(`/api/recommendations/${student.id}`)
      .then(res => res.json())
      .then(data => {
        setHumanRecommendations(Array.isArray(data) ? data : []);
        setLoadingRecs(false);
      })
      .catch(err => {
        console.error("Error loading recommendations:", err);
        setLoadingRecs(false);
      });
  };

  const loadMessages = () => {
    fetch(`/api/messages/${student.id}`)
      .then(res => res.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error loading messages:", err));
  };

  // Poll messages every 5 seconds when on messages tab
  useEffect(() => {
    if (activeTab === 'messages') {
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, student.id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText.trim() || sendingMsg) return;

    setSendingMsg(true);
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student.id,
        senderId: student.id,
        senderName: student.fullName,
        senderRole: 'student',
        message: newMsgText.trim()
      })
    })
      .then(res => res.json())
      .then(data => {
        setSendingMsg(false);
        setNewMsgText('');
        if (data.message) {
          setMessages(prev => [...prev, data.message]);
        } else {
          loadMessages();
        }
      })
      .catch(err => {
        console.error("Error sending message:", err);
        setSendingMsg(false);
      });
  };

  // Autosave answers to localStorage so answers are never lost (Spec #8)
  useEffect(() => {
    if (examStarted && exam) {
      try {
        localStorage.setItem(`nexora_draft_answers_${student.id}_${exam.id}`, JSON.stringify(answers));
      } catch (e) {}
    }
  }, [answers, examStarted, exam]);

  // Exam timer logic
  useEffect(() => {
    let interval: any;
    if (examStarted && examTimer > 0) {
      interval = setInterval(() => {
        setExamTimer(prev => prev - 1);
      }, 1000);
    } else if (examTimer === 0 && examStarted) {
      handleExamSubmit(true, 'Timer expired (automated submission)');
    }
    return () => clearInterval(interval);
  }, [examStarted, examTimer]);

  // STRICT ANTI-CHEATING / SECURITY MONITORING (Spec #7, #8)
  // Detects tab switching, browser minimize, window blur / application switch.
  // Immediately suspends attempt and submits with security violation.
  useEffect(() => {
    if (!examStarted || !exam) return;

    const triggerSecurityTermination = (reason: string) => {
      console.warn("Security violation detected:", reason);
      setExamStarted(false);
      setExamViolationDetected(true);
      setViolationReason(reason);

      // Auto submit suspended attempt immediately
      fetch('/api/exams/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          examId: exam.id,
          answers,
          securityViolation: true,
          violationCount: 1,
          autoSubmitReason: `Terminated due to exam violation (${reason})`
        })
      })
        .then(res => res.json())
        .then(data => {
          setExamCompleted(true);
          try {
            localStorage.removeItem(`nexora_draft_answers_${student.id}_${exam.id}`);
          } catch (e) {}
          if (data.attempt) {
            persistExamAttempt(data.attempt);
            setResults(prev => [...prev.filter(r => r.examId !== exam.id), data.attempt]);
          }
        })
        .catch(err => console.error("Error auto-submitting violated exam:", err));
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerSecurityTermination("Browser tab switch or window departure detected");
      }
    };

    const handleWindowBlur = () => {
      triggerSecurityTermination("Application switch or browser focus lost");
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Monitored exam in progress. Leaving will suspend and submit your attempt.';
      return e.returnValue;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [examStarted, exam, answers]);

  // Payment Verification Handler (Spec #3)
  const handleVerifyPayment = (method: 'upi' | 'card' | 'netbanking') => {
    if (!exam) return;
    setPaymentProcessing(true);
    const simulatedTxn = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);

    fetch('/api/exams/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student.id,
        examId: exam.id,
        amount: exam.fee || 500,
        paymentId: simulatedTxn,
        paymentMethod: method === 'upi' ? 'UPI / QR Instant Pay' : method === 'card' ? 'Debit/Credit Card' : 'Net Banking'
      })
    })
      .then(res => res.json())
      .then(data => {
        setPaymentProcessing(false);
        setShowPaymentModal(false);
        if (data.success && data.registration) {
          setExamRegistration(data.registration);
          // Directly open Slot Selection once payment succeeds
          setShowSlotModal(true);
        }
      })
      .catch(err => {
        console.error("Payment verification failed:", err);
        setPaymentProcessing(false);
      });
  };

  // Slot Selection Handler (Spec #4)
  const handleBookSlot = (slotId: string) => {
    if (!exam || !slotId) return;
    setBookingSlot(true);
    fetch('/api/exams/slots/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student.id,
        examId: exam.id,
        slotId
      })
    })
      .then(res => res.json())
      .then(data => {
        setBookingSlot(false);
        if (data.success && data.registration) {
          setExamRegistration(data.registration);
          setShowSlotModal(false);
        } else if (data.error) {
          alert(data.error);
        }
      })
      .catch(err => {
        console.error("Slot booking failed:", err);
        setBookingSlot(false);
      });
  };

  // Check Slot Time & Start Exam (Spec #5, #6, #7)
  const handleCheckAndStartExam = async (bypassTime = false) => {
    if (!exam) return;
    try {
      const res = await fetch(`/api/exams/${exam.id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          bypassTimeCheck: bypassTime
        })
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'EXAM_NOT_STARTED_YET') {
          setTimeNotStartedModal({
            open: true,
            message: data.error || `Your examination has not started yet. Your scheduled start time is ${examRegistration?.scheduledStartTime || '10:00 AM'}.`,
            scheduledStartTime: data.scheduledStartTime
          });
          return;
        }
        if (data.code === 'ATTEMPT_SUSPENDED') {
          alert("Your examination attempt was permanently suspended due to security violations and cannot be resumed.");
          return;
        }
        alert(data.error || 'Cannot start examination at this time.');
        return;
      }

      // Slot is valid! Show monitored exam security rules warning
      setShowSecurityWarningModal(true);
    } catch (err) {
      console.error("Error validating exam start:", err);
    }
  };

  const enterStrictExamMode = () => {
    setShowSecurityWarningModal(false);
    // Calculated from admin-configured duration (Spec #5)
    setExamTimer((exam?.durationMinutes || 120) * 60);
    setExamStarted(true);
    setCurrentQuestionIdx(0);

    // Retrieve saved draft answers if any (Spec #8)
    try {
      const saved = localStorage.getItem(`nexora_draft_answers_${student.id}_${exam?.id}`);
      if (saved) {
        setAnswers(JSON.parse(saved));
      } else {
        setAnswers({});
      }
    } catch (e) {
      setAnswers({});
    }

    // Attempt fullscreen mode
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}
  };

  const handleAnswerSelect = (optionIdx: number, type: string) => {
    if (!exam) return;
    const qId = exam.questions[currentQuestionIdx].id;
    const currentAns = answers[qId] || [];

    if (type === 'multiple-choice') {
      if (currentAns.includes(optionIdx)) {
        setAnswers({
          ...answers,
          [qId]: currentAns.filter(x => x !== optionIdx)
        });
      } else {
        setAnswers({
          ...answers,
          [qId]: [...currentAns, optionIdx]
        });
      }
    } else {
      setAnswers({
        ...answers,
        [qId]: [optionIdx]
      });
    }
  };

  const handleExamSubmit = (isAutoSubmit = false, reason = 'Manual submission by candidate') => {
    if (!exam) return;
    setExamStarted(false);

    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}

    fetch('/api/exams/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student.id,
        examId: exam.id,
        answers,
        autoSubmitReason: isAutoSubmit ? reason : "Candidate manual submission"
      })
    })
      .then(res => res.json())
      .then(data => {
        setExamCompleted(true);
        try {
          localStorage.removeItem(`nexora_draft_answers_${student.id}_${exam.id}`);
        } catch (e) {}
        if (data.attempt) {
          persistExamAttempt(data.attempt);
          syncRecordToFirestore('attempts', `${data.attempt.studentId}_${data.attempt.examId}`, data.attempt);
          setResults(prev => [...prev.filter(r => r.examId !== exam.id), data.attempt]);
        }
        setActiveTab('results');
      })
      .catch(err => console.error('Error submitting exam:', err));
  };

  const loadAIRecommendations = () => {
    setAiLoading(true);
    const attempt = results.find(r => r.examId === (exam?.id || 'exam-aptitude-01'));
    
    fetch('/api/gemini/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student.id,
        marks12th: student.marks12th,
        score: attempt?.score || 8,
        maxScore: attempt?.maxScore || 10,
        percentage: attempt?.percentage || 80,
        interestedCourse: student.interestedCourse,
        preferredState: student.preferredState,
        budgetRange: budgetRange
      })
    })
      .then(res => res.json())
      .then(data => {
        setAiAdvice(data.analysis);
        setAiRecommendations(data.recommendations);
        setAiLoading(false);
      })
      .catch(err => {
        console.error('Error loading AI recommendations:', err);
        setAiLoading(false);
      });
  };

  useEffect(() => {
    if (activeTab === 'recommendations' && results.length > 0 && aiRecommendations.length === 0) {
      loadAIRecommendations();
    }
  }, [activeTab]);

  // Format Timer
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const activeAttempt = results.find(r => r.examId === (exam?.id || 'exam-aptitude-01'));
  const isResultPublished = (exam && resultsPublished[exam.id]) || (activeAttempt && activeAttempt.isPublished);

  return (
    <div className="flex bg-slate-50 h-screen overflow-hidden text-slate-800 font-sans relative" id="student-dashboard-root">
      
      {/* DESKTOP PERSISTENT SIDEBAR (Smooth Scrolling with Pinned Header & Footer) */}
      <aside className="hidden lg:flex w-64 bg-[#0A192F] text-slate-300 shrink-0 flex-col h-full max-h-screen shadow-2xl border-r border-slate-800/80" id="student-desktop-sidebar">
        {/* Pinned Header */}
        <div className="p-5 border-b border-slate-800/80 bg-[#0A192F] shrink-0 space-y-4">
          <div className="flex items-center gap-3">
            <NexoraEmblem sizePx={38} className="shadow-md" />
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-none">NEXORA</span>
              <p className="text-[9px] text-amber-400 font-bold uppercase tracking-wider font-mono mt-1">Student Portal</p>
            </div>
          </div>

          {/* Quick Profile Badge */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="h-9 w-9 bg-amber-400/20 border border-amber-400/40 rounded-xl flex items-center justify-center text-xs font-bold text-amber-300 shrink-0">
              {student.fullName ? student.fullName.charAt(0) : 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold truncate text-white">{student.fullName}</h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-slate-400 font-mono truncate">{student.id}</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 font-semibold rounded">
                  {student.admissionStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-1.5 dark-sidebar-scroll">
          <nav className="space-y-1.5" id="student-desktop-nav-menu">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-[#1E3A8A]/80 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-amber-400" />
              <span>Dashboard Home</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('exams')} 
              className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'exams' ? 'bg-[#1E3A8A]/80 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FileText className="h-4 w-4 text-blue-400" />
              <span>My Exams & Tests</span>
            </button>

            <button 
              onClick={() => setActiveTab('results')} 
              className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'results' ? 'bg-[#1E3A8A]/80 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <BarChart2 className="h-4 w-4 text-emerald-400" />
              <span>My Results</span>
            </button>

            <button 
              onClick={() => setActiveTab('recommendations')} 
              className={`w-full py-2.5 px-3.5 rounded-xl flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'recommendations' ? 'bg-[#1E3A8A]/80 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>AI Recommendations</span>
              </div>
              <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 text-[9px] font-mono font-bold rounded">
                AI Match
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('messages')} 
              className={`w-full py-2.5 px-3.5 rounded-xl flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'messages' ? 'bg-[#1E3A8A]/80 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 text-emerald-400" />
                <span>Counselor Desk</span>
              </div>
              {messages.length > 0 && (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full font-mono">
                  {messages.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('profile')} 
              className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'profile' ? 'bg-[#1E3A8A]/80 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <User className="h-4 w-4 text-slate-400" />
              <span>My Profile</span>
            </button>
          </nav>
        </div>

        {/* Pinned Logout Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0A192F] shrink-0 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-amber-400/15 border border-amber-400/30 rounded-xl flex items-center justify-center text-xs font-bold text-amber-300 shrink-0">
              {student.fullName ? student.fullName.charAt(0) : 'S'}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold truncate text-white">{student.fullName}</h4>
              <p className="text-[10px] text-slate-400 truncate font-mono">{student.id}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-rose-500/20 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* MOBILE SLIDE-OUT DRAWER MENU */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div 
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs"
              id="student-drawer-backdrop"
            />

            {/* Slide-Out Drawer Panel */}
            <motion.aside 
              key="student-drawer-panel"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-[#0A192F] text-white flex flex-col h-full max-h-screen shadow-2xl border-r border-slate-800/80"
              id="student-sidebar"
            >
              {/* Drawer Pinned Header with Close Button */}
              <div className="p-5 border-b border-slate-800/80 bg-[#0A192F] shrink-0 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <NexoraEmblem sizePx={38} className="shadow-md" />
                    <div>
                      <span className="text-base font-bold tracking-tight text-white block leading-none">NEXORA</span>
                      <p className="text-[9px] text-amber-400 font-bold uppercase tracking-wider font-mono mt-1">Student Desk</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Close navigation drawer"
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    id="student-drawer-close-btn"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Student Quick Profile Card in Drawer */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <div className="h-9 w-9 bg-amber-400/20 border border-amber-400/40 rounded-xl flex items-center justify-center text-xs font-bold text-amber-300 shrink-0">
                    {student.fullName ? student.fullName.charAt(0) : 'S'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold truncate text-white">{student.fullName}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-slate-400 font-mono truncate">{student.id}</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 font-semibold rounded">
                        {student.admissionStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Nav links */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-1.5 dark-sidebar-scroll">
                <nav className="space-y-1.5" id="student-nav-menu">
                  <button 
                    onClick={() => { setActiveTab('dashboard'); setDrawerOpen(false); }} 
                    className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 text-xs font-semibold transition-colors cursor-pointer ${
                      activeTab === 'dashboard' ? 'bg-[#1E3A8A]/80 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4 text-amber-400" />
                    <span>Dashboard Home</span>
                  </button>
                  
                  <button 
                    onClick={() => { setActiveTab('exams'); setDrawerOpen(false); }} 
                    className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 text-xs font-semibold transition-colors cursor-pointer ${
                      activeTab === 'exams' ? 'bg-[#1E3A8A]/80 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <FileText className="h-4 w-4 text-blue-400" />
                    <span>My Exams & Tests</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('results'); setDrawerOpen(false); }} 
                    className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 text-xs font-semibold transition-colors cursor-pointer ${
                      activeTab === 'results' ? 'bg-[#1E3A8A]/80 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <BarChart2 className="h-4 w-4 text-emerald-400" />
                    <span>My Results</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('recommendations'); setDrawerOpen(false); }} 
                    className={`w-full py-2.5 px-3.5 rounded-xl flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer ${
                      activeTab === 'recommendations' ? 'bg-[#1E3A8A]/80 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <span>AI Recommendations</span>
                    </div>
                    <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 text-[9px] font-mono font-bold rounded">
                      AI Match
                    </span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('messages'); setDrawerOpen(false); }} 
                    className={`w-full py-2.5 px-3.5 rounded-xl flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer ${
                      activeTab === 'messages' ? 'bg-[#1E3A8A]/80 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4 text-emerald-400" />
                      <span>Counselor Desk</span>
                    </div>
                    {messages.length > 0 && (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full font-mono">
                        {messages.length}
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => { setActiveTab('profile'); setDrawerOpen(false); }} 
                    className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 text-xs font-semibold transition-colors cursor-pointer ${
                      activeTab === 'profile' ? 'bg-[#1E3A8A]/80 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    <span>My Profile</span>
                  </button>
                </nav>
              </div>

              {/* User Session Pinned Footer inside Drawer */}
              <div className="p-4 border-t border-slate-800/80 bg-[#0A192F] shrink-0 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 bg-amber-400/15 border border-amber-400/30 rounded-xl flex items-center justify-center text-xs font-bold text-amber-300 shrink-0">
                    {student.fullName ? student.fullName.charAt(0) : 'S'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold truncate text-white">{student.fullName}</h4>
                    <p className="text-[10px] text-slate-400 truncate font-mono">{student.id}</p>
                  </div>
                </div>
                <button 
                  onClick={onLogout}
                  className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-rose-500/20 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout Account</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 w-full" id="student-main-workspace">
        {/* TOP STATUS HEADER BAR */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200/70 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Drawer Toggle Button (Visible on mobile/tablet) */}
            <button 
              type="button"
              id="student-drawer-toggle-btn"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu drawer"
              className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#0A192F] hover:bg-[#1E3A8A] text-white text-xs font-bold shadow-md transition-all border border-slate-800 cursor-pointer"
            >
              <Menu className="h-4 w-4 text-amber-400" />
              <span>Menu</span>
              {messages.length > 0 && (
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            {/* Brand Logo & Current Section */}
            <div className="flex items-center gap-3">
              <NexoraEmblem sizePx={32} className="shadow-xs hidden xs:block" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-[#0B192C] font-bold">NEXORA Student Portal</span>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="hidden sm:inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 capitalize">
                    {activeTab}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 capitalize tracking-tight">
                  {activeTab === 'dashboard' && 'Dashboard Home'}
                  {activeTab === 'exams' && 'My Exams & Tests'}
                  {activeTab === 'results' && 'My Evaluation Results'}
                  {activeTab === 'recommendations' && 'AI College Recommendations'}
                  {activeTab === 'messages' && 'Counselor Desk Chat'}
                  {activeTab === 'profile' && 'My Student Profile'}
                </h1>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Counselor Messages Chip */}
            <button 
              onClick={() => setActiveTab('messages')}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'messages' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
              }`}
              title="Chat with Counselor"
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden md:inline">Counselor</span>
              {messages.length > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-500 text-white text-[10px] font-bold rounded-full font-mono">
                  {messages.length}
                </span>
              )}
            </button>

            {/* Quick Profile Chip */}
            <button 
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-colors cursor-pointer"
              title="View student profile"
            >
              <div className="h-7 w-7 rounded-lg bg-amber-400/20 text-amber-700 font-bold text-xs flex items-center justify-center">
                {student.fullName ? student.fullName.charAt(0) : 'S'}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-bold text-slate-800 truncate max-w-[110px]">{student.fullName}</p>
                <p className="text-[9px] text-slate-400 font-mono">{student.id}</p>
              </div>
            </button>

            {/* System Status */}
            <div className="hidden xl:flex bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 items-center gap-2 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Status: Active</span>
            </div>

            {/* Compact Logout */}
            <button 
              onClick={onLogout}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Logout Account"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE PAGES */}
        <div className="space-y-8">
          
          {/* TAB 1: DASHBOARD HOME */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8" id="student-tab-dashboard">
              {/* Greetings */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
                  <GraduationCap className="h-64 w-64 text-[#0B192C]" />
                </div>
                <div className="space-y-2 relative">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-widest font-mono">Academics counseling</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Welcome back, {student.fullName}!</h2>
                  <p className="text-sm text-slate-500 max-w-xl">
                    Your intermediate counseling file is active. Track evaluation tests, check published college results, and engage directly with counselors.
                  </p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 px-5 py-3 rounded-2xl shrink-0">
                  <span className="text-[10px] uppercase font-bold text-amber-600 block tracking-wider">Counseling State</span>
                  <span className="text-sm font-bold text-amber-800">{student.admissionStatus}</span>
                </div>
              </div>

              {/* Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="h-10 w-10 bg-[#0B192C]/5 text-[#0B192C] rounded-xl flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Assigned Test</span>
                    <span className="text-sm font-extrabold text-slate-800">National Aptitude (NACAT)</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="h-10 w-10 bg-purple-500/5 text-purple-600 rounded-xl flex items-center justify-center">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Test Status</span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {activeAttempt ? "Completed" : "Pending"}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="h-10 w-10 bg-emerald-500/5 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Results Status</span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {!activeAttempt ? "Exam Pending" : (isResultPublished ? "Published" : "Evaluating")}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="h-10 w-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Assigned Advisor</span>
                    <span className="text-sm font-extrabold text-slate-800 truncate block">{student.assignedCounsellor || "Dr. Lakshmi Prasad"}</span>
                  </div>
                </div>
              </div>

              {/* Counselor Note & Notification Box */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Counselor note */}
                <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-base border-l-4 border-[#0B192C] pl-3">Counseling Counselor Logs</h3>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-[#0B192C]/10 text-[#0B192C] rounded-full flex items-center justify-center text-xs font-bold">
                        LP
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{student.assignedCounsellor || "Dr. Lakshmi Prasad"}</h4>
                        <p className="text-[10px] text-slate-400">Head of Admission counseling</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      "{student.counsellorNotes || "Awaiting your first aptitude test credentials to generate dynamic recommendations. Please login to My Exams tab to finish."}"
                    </p>
                  </div>
                </div>

                {/* Notifications Panel */}
                <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-base border-l-4 border-amber-500 pl-3 flex items-center gap-1.5">
                    <Bell className="h-4.5 w-4.5 text-amber-500" />
                    In-App Notifications
                  </h3>
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {notifications.map(notif => (
                      <div key={notif.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                          notif.type === 'alert' ? 'bg-rose-100 text-rose-600' : 'bg-[#0B192C]/10 text-[#0B192C]'
                        }`}>
                          <Bell className="h-3.5 w-3.5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                          <p className="text-[11px] text-slate-500 leading-normal">{notif.message}</p>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-8">No notifications received.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY EXAMS (Spec #1, #3, #4, #5, #6, #7, #8, #9) */}
          {activeTab === 'exams' && (
            <div className="space-y-8" id="student-tab-exams">
              {/* Active Attempt / Completed / Suspended States */}
              {activeAttempt ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm max-w-2xl mx-auto space-y-6">
                  {activeAttempt.status === 'Suspended' || activeAttempt.securityViolation ? (
                    <div className="space-y-5">
                      <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto border border-rose-200">
                        <ShieldAlert className="h-8 w-8" />
                      </div>
                      <div className="text-center space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
                          Attempt Status: Suspended / Terminated
                        </span>
                        <h3 className="text-2xl font-black text-slate-900">Examination Session Terminated</h3>
                        <p className="text-xs text-rose-600 font-semibold max-w-md mx-auto">
                          {activeAttempt.autoSubmitReason || "Terminated due to exam window violation or application switch."}
                        </p>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="font-semibold text-slate-500">Security Violation State:</span>
                          <span className="font-bold text-rose-700 font-mono">Suspended (Code: SEC-403)</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="font-semibold text-slate-500">Attempt Recorded At:</span>
                          <span className="font-bold text-slate-800">{new Date(activeAttempt.attemptedAt).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="font-semibold text-slate-500">Resume Policy:</span>
                          <span className="font-bold text-slate-800">Locked — In accordance with anti-cheating regulations, terminated attempts cannot be restarted.</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => setActiveTab('results')}
                        className="w-full py-3.5 bg-[#0B192C] hover:bg-[#1E293B] text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <Award className="h-4 w-4 text-amber-400" />
                        View Official Record in Results Tab
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6 text-center">
                      <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                          Attempt Status: {activeAttempt.status || 'Submitted'}
                        </span>
                        <h3 className="text-2xl font-black text-slate-900">Examination Successfully Submitted</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          Your responses have been recorded on the secure evaluation server. Official verified results will be released on the publication date.
                        </p>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-600 text-left space-y-2">
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Assessment Code:</span>
                          <span className="font-bold text-slate-900 font-mono">{exam?.id || activeAttempt.examId}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Scheduled Date & Time:</span>
                          <span className="font-bold text-slate-900">{examRegistration?.scheduledDate || '20 October 2026'} ({examRegistration?.scheduledStartTime || '10:00 AM'})</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Result Publication Date:</span>
                          <span className="font-bold text-amber-700 font-mono">{exam?.resultPublishAt ? new Date(exam.resultPublishAt).toLocaleDateString() : '25 October 2026'}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => setActiveTab('results')}
                        className="w-full py-3.5 bg-[#0B192C] hover:bg-[#1E293B] text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <Award className="h-4 w-4 text-amber-400" />
                        Check Results / Scorecard Status
                      </button>
                    </div>
                  )}
                </div>
              ) : examStarted && exam ? (
                // ACTIVE MONITORED TEST TAKING ENVIRONMENT (Spec #7, #8)
                <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[580px] ring-2 ring-[#0057D9]/20" id="monitored-exam-window">
                  {/* Left panel: Proctoring details & Question navigator */}
                  <div className="w-full md:w-80 bg-slate-900 text-white p-6 flex flex-col justify-between shrink-0 border-r border-slate-800">
                    <div className="space-y-6">
                      {/* Proctoring Active Banner */}
                      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs font-bold text-slate-300">Monitored Mode Active</span>
                        </div>
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      </div>

                      {/* Server-Controlled Countdown Timer (Spec #5) */}
                      <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Remaining Duration</span>
                        <div className="flex items-center gap-2 text-2xl font-black text-amber-400 font-mono">
                          <Clock className="h-5 w-5 text-amber-400 animate-spin" />
                          {formatTime(examTimer)}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">Server controlled &bull; Modification locked</p>
                      </div>

                      {/* Anti-Cheating Warning Reminder */}
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>Do not switch tabs, minimize, or click outside the examination window. Violations trigger automatic termination.</span>
                      </div>

                      {/* Question Navigator Grid */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-300">Question Navigator</span>
                          <span className="text-[10px] text-slate-400">
                            {Object.keys(answers).length} / {exam.questions.length} Answered
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
                          {exam.questions.map((q, idx) => {
                            const isAnswered = answers[q.id]?.length > 0;
                            const isActive = idx === currentQuestionIdx;
                            return (
                              <button
                                key={q.id}
                                onClick={() => setCurrentQuestionIdx(idx)}
                                className={`h-9 rounded-lg text-xs font-bold transition-all border flex items-center justify-center cursor-pointer ${
                                  isActive ? 'bg-amber-400 text-slate-950 border-amber-400 font-black shadow-md' :
                                  isAnswered ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold' :
                                  'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                                }`}
                              >
                                {idx + 1}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleExamSubmit(false)}
                      className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Submit & Finalize Exam
                    </button>
                  </div>

                  {/* Center & Right: Question Display */}
                  <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto bg-white">
                    {/* Header */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-400">
                        <span className="text-[#0057D9] font-extrabold uppercase">
                          Question {currentQuestionIdx + 1} of {exam.questions.length}
                        </span>
                        <span className="capitalize text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md text-[10px] font-bold">
                          {exam.questions[currentQuestionIdx].type.replace('-', ' ')}
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#0057D9] transition-all duration-300" 
                          style={{ width: `${((currentQuestionIdx + 1) / exam.questions.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Question text */}
                    <div className="my-6 space-y-5">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                        {exam.questions[currentQuestionIdx].text}
                      </h3>

                      {/* Options List */}
                      <div className="space-y-3">
                        {exam.questions[currentQuestionIdx].options.map((option, oIdx) => {
                          const qId = exam.questions[currentQuestionIdx].id;
                          const isSelected = answers[qId]?.includes(oIdx);
                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleAnswerSelect(oIdx, exam.questions[currentQuestionIdx].type)}
                              className={`w-full p-4 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                                isSelected 
                                  ? 'bg-blue-50/70 border-[#0057D9] text-[#0057D9] ring-1 ring-[#0057D9]' 
                                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <span>{option}</span>
                              <div className={`h-4.5 w-4.5 rounded-full border shrink-0 flex items-center justify-center ${
                                isSelected ? 'bg-[#0057D9] border-[#0057D9]' : 'border-slate-300'
                              }`}>
                                {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom Controls */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      <button
                        disabled={currentQuestionIdx === 0}
                        onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                      >
                        &larr; Previous Question
                      </button>
                      <button
                        onClick={() => {
                          if (currentQuestionIdx < exam.questions.length - 1) {
                            setCurrentQuestionIdx(prev => prev + 1);
                          } else {
                            handleExamSubmit(false);
                          }
                        }}
                        className="px-5 py-2.5 bg-[#0057D9] hover:bg-[#004dc2] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        {currentQuestionIdx === exam.questions.length - 1 ? "Review & Submit" : "Next Question"}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // PRE-EXAM SCHEDULING & REGISTRATION FLOW (Spec #1, #3, #4, #5, #6)
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Exam Summary Banner Card */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                      <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0057D9] text-[10px] font-bold uppercase tracking-wider">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>Official Entrance Assessment</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">{exam?.title || "NACAT Scholarship Assessment"}</h2>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                          {exam?.description || "National Aptitude & Career Assessment Test for higher education degree admissions, academic stream counseling, and institutional merit scholarship allocation."}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 self-start">
                        {exam?.status || 'Registration Open'}
                      </span>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 text-xs">
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Exam Duration</span>
                        <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                          <Clock className="h-4 w-4 text-[#0057D9]" />
                          <span>{exam?.durationMinutes || 120} Minutes</span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Assessment Fee</span>
                        <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                          <CreditCard className="h-4 w-4 text-emerald-600" />
                          <span>₹{exam?.fee || 500}</span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Passing Threshold</span>
                        <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                          <Award className="h-4 w-4 text-amber-500" />
                          <span>{exam?.passPercentage || 50}%</span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Result Release</span>
                        <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          <span>{exam?.resultPublishAt ? new Date(exam.resultPublishAt).toLocaleDateString() : '25 Oct 2026'}</span>
                        </div>
                      </div>
                    </div>

                    {/* PROGRESS STEPS: Released Exam -> Apply -> Payment -> Slot Selection -> Scheduled */}
                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-4">
                        <span className="uppercase text-[10px] tracking-wider text-slate-400">Enrollment Journey</span>
                        <span className="text-[#0057D9]">
                          {examRegistration?.selectedSlotId ? 'Step 3 of 3: Scheduled' : 
                           examRegistration?.paymentStatus === 'completed' ? 'Step 2 of 3: Slot Selection' : 
                           'Step 1 of 3: Fee Payment'}
                        </span>
                      </div>

                      {/* STEP 1: Fee Payment Required (If fee > 0 and payment not completed) */}
                      {(!examRegistration || examRegistration.paymentStatus !== 'completed') && (exam?.fee !== 0 && exam?.fee !== undefined) && (
                        <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
                              <Lock className="h-5 w-5" />
                            </div>
                            <div className="space-y-1 flex-1">
                              <h4 className="font-extrabold text-slate-900 text-sm">Exam Fee Payment Required Before Slot Booking</h4>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                Under NEXORA examination guidelines, slot selection is unlocked after verification of the assessment fee (₹{exam?.fee || 500}).
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                            <div className="text-xs text-slate-500">
                              Amount: <strong className="text-slate-900 font-bold">₹{exam?.fee || 500}</strong> (Zero Gateway Charges)
                            </div>
                            <button
                              onClick={() => setShowPaymentModal(true)}
                              className="w-full sm:w-auto px-6 py-3 bg-[#0057D9] hover:bg-[#004dc2] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <CreditCard className="h-4 w-4" />
                              Pay Exam Fee (₹{exam?.fee || 500}) & Unlock Slots
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP 2: Free Assessment or Payment Done — Choose Super Admin Slot */}
                      {((examRegistration?.paymentStatus === 'completed') || exam?.fee === 0) && !examRegistration?.selectedSlotId && (
                        <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-blue-100 text-[#0057D9] rounded-xl shrink-0 mt-0.5">
                              <Calendar className="h-5 w-5" />
                            </div>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-slate-900 text-sm">
                                  {exam?.fee === 0 ? 'Sponsored Assessment — Choose Your Time Slot' : 'Payment Verified — Select Date & Time Slot'}
                                </h4>
                                {examRegistration?.paymentId && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                    Ref: {examRegistration.paymentId}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                Select an available slot configured by the Super Administrator. Once chosen, the date and start time will be locked for your monitored test session.
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (exam?.id) loadSlots(exam.id);
                              setShowSlotModal(true);
                            }}
                            className="w-full py-3 bg-[#0057D9] hover:bg-[#004dc2] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Calendar className="h-4 w-4" />
                            Choose Examination Slot Now ({availableSlots.length || exam?.slots?.length || 0} Slots Configured)
                          </button>
                        </div>
                      )}

                      {/* STEP 3: Slot Confirmed — Ready for Monitored Exam (Spec #4, #5, #6) */}
                      {examRegistration?.selectedSlotId && (
                        <div className="space-y-4">
                          <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-slate-900 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                Slot Confirmed & Locked
                              </span>
                              <button
                                onClick={() => setShowSlotModal(true)}
                                className="text-[11px] font-bold text-[#0057D9] hover:underline"
                              >
                                Change Slot
                              </button>
                            </div>

                            <div className="space-y-1">
                              <p className="text-xs text-slate-500 font-semibold">Your examination is scheduled for:</p>
                              <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                                {examRegistration.scheduledDate} at {examRegistration.scheduledStartTime}
                              </h3>
                              <p className="text-xs text-slate-600">
                                Assigned Slot Duration: <strong>{exam?.durationMinutes || 120} Minutes</strong> &bull; Window Closing: {examRegistration.scheduledEndTime || '12:00 PM'}
                              </p>
                            </div>

                            <div className="p-3 bg-white rounded-xl border border-emerald-200/80 text-xs text-slate-600 space-y-1">
                              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                                <Info className="h-3.5 w-3.5 text-blue-600" />
                                Monitored Slot Window Enforcement:
                              </p>
                              <p className="text-[11px] text-slate-500">
                                The examination environment opens strictly during your scheduled slot. Attempts before your slot will show a start-time notification.
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-2">
                            <button
                              onClick={() => handleCheckAndStartExam(false)}
                              className="w-full py-4 bg-[#0B192C] hover:bg-[#1E293B] text-white font-extrabold rounded-2xl shadow-xl shadow-[#0B192C]/20 flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
                            >
                              <Play className="h-4.5 w-4.5 text-amber-400" />
                              Enter Monitored Examination Mode
                            </button>

                            {/* Demo / Flexible Window Testing helper */}
                            <button
                              onClick={() => handleCheckAndStartExam(true)}
                              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5 text-[#0057D9]" />
                              Instant Access Mode (Test Monitored Exam Engine)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RESULTS (Spec #10, #11, #12) */}
          {activeTab === 'results' && (
            <div className="space-y-8" id="student-tab-results">
              {!activeAttempt ? (
                // Exam not taken
                <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm max-w-md mx-auto text-center space-y-4">
                  <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-900">No Assessment Records Found</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    You have not attempted the scheduled assessment yet. Please go to the "My Exams" tab, complete fee payment, book your slot, and appear for the examination.
                  </p>
                  <button 
                    onClick={() => setActiveTab('exams')}
                    className="px-6 py-2.5 bg-[#0B192C] text-white text-xs font-bold rounded-xl"
                  >
                    Go to My Exams
                  </button>
                </div>
              ) : !isResultPublished ? (
                // SPEC #10: Result Pending screen
                <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm max-w-lg mx-auto text-center space-y-6">
                  <div className="h-16 w-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto border border-amber-200">
                    <Clock className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                      Evaluation In Progress
                    </span>
                    <h3 className="text-2xl font-black text-slate-900">Result Pending</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Your examination has been successfully submitted and received by the Central Evaluation Committee.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-700 text-left space-y-2.5">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Student ID:</span>
                      <span className="font-bold text-slate-900 font-mono">{student.id}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Submission Date:</span>
                      <span className="font-bold text-slate-900">{new Date(activeAttempt.attemptedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Official Result Release:</span>
                      <span className="font-extrabold text-amber-700 font-mono">
                        {exam?.resultPublishAt ? new Date(exam.resultPublishAt).toLocaleDateString() : '25 October 2026'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Results will become visible on <strong>{exam?.resultPublishAt ? new Date(exam.resultPublishAt).toLocaleDateString() : '25 October 2026'}</strong>. Administrators may publish earlier.
                  </p>
                </div>
              ) : (
                // SPEC #11 & #12: PUBLISHED SCORECARD VIEW
                // Rule 1: Every student who attempts the examination is considered PASS.
                // Rule 2: Score >= 50% -> Show actual marks, percentage, question analysis, scorecard download.
                // Rule 3: Score < 50% -> ONLY show PASS. Do NOT display numerical marks or breakdown!
                <div className="space-y-8" id="student-published-scorecard">
                  {/* SCORECARD PANEL */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm relative overflow-hidden" id="printable-scorecard">
                    <div className="space-y-6">
                      {/* Top Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {/* Every student who attempts is PASS (Spec #11) */}
                            <span className="px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                              PASS
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-[#0057D9] text-[10px] font-bold">
                              Verified Official Result
                            </span>
                          </div>
                          <h2 className="text-2xl font-black text-slate-950">Official Assessment Scorecard</h2>
                          <p className="text-xs text-slate-500 font-mono">
                            Exam: {exam?.title || "NACAT Assessment"} &bull; Attempt Date: {new Date(activeAttempt.attemptedAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="text-right space-y-1">
                          <p className="text-xs font-bold text-slate-800">{student.fullName}</p>
                          <p className="text-[10px] font-mono text-slate-400">ID: {student.id}</p>
                          <p className="text-[10px] text-slate-500">Stream: {student.interestedCourse}</p>
                        </div>
                      </div>

                      {/* CONDITIONAL METRICS: >= 50% vs < 50% (Spec #11, #12) */}
                      {(activeAttempt.percentage || 0) >= 50 ? (
                        // STUDENTS SCORING >= 50%: Show numerical score & percentage
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Awarded Score</span>
                              <span className="text-2xl font-black text-slate-900">{activeAttempt.score} / {activeAttempt.maxScore}</span>
                            </div>
                            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100">
                              <span className="text-[10px] uppercase font-bold text-[#0057D9] tracking-wider block">Percentage Marks</span>
                              <span className="text-2xl font-black text-[#0057D9]">{activeAttempt.percentage}%</span>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">National Rank</span>
                              <span className="text-2xl font-black text-amber-500">#{activeAttempt.rank || 1}</span>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">Admission Status</span>
                              <span className="text-2xl font-black text-emerald-800">QUALIFIED</span>
                            </div>
                          </div>

                          {/* Evaluator Remarks */}
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
                            <span className="font-bold text-slate-900 block">Academic Board Evaluation:</span>
                            <p className="italic text-slate-600">
                              "{activeAttempt.evaluatorRemarks || 'Student demonstrated strong competence and has cleared the assessment criteria.'}"
                            </p>
                          </div>

                          {/* Download Scorecard Action */}
                          <button 
                            onClick={() => window.print()}
                            className="px-6 py-3 bg-[#0B192C] hover:bg-[#1E293B] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                          >
                            <Download className="h-4 w-4 text-amber-400" />
                            Download Official Scorecard (PDF)
                          </button>
                        </div>
                      ) : (
                        // STUDENTS SCORING < 50%: ONLY show PASS (Spec #11, #12)
                        // Do NOT display numerical score, percentage, or question breakdown!
                        <div className="p-6 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-center space-y-3">
                          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-2xl font-black text-emerald-900 tracking-tight">STATUS: PASS</h3>
                            <p className="text-xs text-emerald-800 font-semibold max-w-md mx-auto">
                              Candidate has cleared the entrance evaluation and is eligible for undergraduate admissions counseling.
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-500 pt-2">
                            Assigned Counselor will reach out directly to guide you through partner college admissions and seat allocation.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AI COLLEGE RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="space-y-8" id="student-tab-recommendations">
              {/* Header Banner */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0057D9] text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI Smart Recommendation Engine</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">AI College Recommendations</h2>
                  <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                    Personalized partner institutions curated based on your examination score, aptitude percentile, and academic stream merit.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs shrink-0 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Assigned Academic Guide</span>
                  <span className="font-extrabold text-slate-900 block">{student.assignedCounsellor || 'Academic Counselor'}</span>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="text-[11px] text-[#0057D9] hover:underline font-bold flex items-center gap-1 cursor-pointer mt-1"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>Chat with Counselor</span>
                  </button>
                </div>
              </div>

              {/* Recommendations List */}
              {loadingRecs ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0057D9]" />
                </div>
              ) : humanRecommendations.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto">
                  <div className="h-16 w-16 bg-blue-50 text-[#0057D9] rounded-2xl flex items-center justify-center mx-auto">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-extrabold text-slate-900">AI Recommendations Under Evaluation</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Our AI recommendation engine is currently analyzing your examination marks and academic profile. Need immediate guidance or priority college options?
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="px-5 py-2.5 bg-[#0057D9] hover:bg-[#004dc2] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Redirect to Counselor Chat</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {humanRecommendations.map((rec) => {
                    const col = rec.college;
                    if (!col) return null;
                    return (
                      <div 
                        key={rec.id} 
                        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
                      >
                        <div>
                          {/* Campus Image */}
                          <div className="relative h-44 bg-slate-100 overflow-hidden">
                            <img 
                              src={col.imageUrl} 
                              alt={col.name} 
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800";
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-extrabold text-slate-800 border border-slate-100 shadow-sm flex items-center gap-1">
                              <Award className="h-3 w-3 text-amber-500" />
                              <span>NAAC: {col.naacGrade}</span>
                            </div>

                            <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm text-white font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-amber-400" />
                              <span>{col.city}, {col.state}</span>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="p-6 space-y-4">
                            <div className="space-y-1">
                              <span className="text-[10px] text-[#0057D9] font-extrabold uppercase tracking-wider block flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                AI Match: 96% Compatibility
                              </span>
                              <h3 className="text-base font-extrabold text-slate-950 leading-snug">{col.name}</h3>
                            </div>

                            {/* AI Recommendation Reasoning */}
                            <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-1">
                              <span className="text-[9px] uppercase font-bold text-[#0057D9] tracking-wider block">AI Academic Evaluation</span>
                              <p className="text-xs text-slate-700 italic leading-relaxed">
                                "{rec.note || "Recommended based on admission merit and stream suitability."}"
                              </p>
                            </div>

                            {/* Key Metrics - NO FEES */}
                            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                              <div className="p-2.5 bg-slate-50 rounded-xl">
                                <span className="text-[9px] text-slate-400 uppercase font-bold block">Avg Package</span>
                                <span className="font-extrabold text-slate-900">{col.averagePackage}</span>
                              </div>
                              <div className="p-2.5 bg-slate-50 rounded-xl">
                                <span className="text-[9px] text-slate-400 uppercase font-bold block">Placement Rate</span>
                                <span className="font-extrabold text-emerald-600">{col.placementRate || '94%+ Placed'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer action */}
                        <div className="px-6 pb-6 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              setActiveTab('messages');
                            }}
                            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Redirect to Counselor Chat regarding this AI match"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Counselor Chat</span>
                          </button>

                          <button
                            onClick={() => {
                              alert(`Application interest registered for ${col.name}! Your admissions coordinator has been notified.`);
                            }}
                            className="px-4 py-2 bg-[#0057D9] hover:bg-[#004dc2] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                          >
                            Apply to Campus
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: COUNSELOR DESK & MESSAGES */}
          {activeTab === 'messages' && (
            <div className="space-y-6" id="student-tab-messages">
              {/* Counselor Header Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 rounded-2xl flex items-center justify-center text-2xl font-bold text-[#1E3A8A] shrink-0">
                    {student.assignedCounsellor ? student.assignedCounsellor.charAt(0) : 'C'}
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Assigned Academic Counselor
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      {student.assignedCounsellor || "Dr. Lakshmi Prasad"}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {counsellorDetails?.specialization || "Engineering, Medical & Integrated Career Guidance Specialist"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {counsellorDetails?.mobile && (
                    <a 
                      href={`tel:${counsellorDetails.mobile}`}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
                    >
                      <Phone className="h-3.5 w-3.5 text-slate-600" />
                      +91 {counsellorDetails.mobile}
                    </a>
                  )}
                  {counsellorDetails?.email && (
                    <a 
                      href={`mailto:${counsellorDetails.email}`}
                      className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl flex items-center gap-2 transition-all border border-blue-200"
                    >
                      <Mail className="h-3.5 w-3.5 text-blue-600" />
                      {counsellorDetails.email}
                    </a>
                  )}
                </div>
              </div>

              {/* Counselor Guidance Notes Alert */}
              {student.counsellorNotes && (
                <div className="p-4 sm:p-5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 shadow-xs">
                  <Award className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">Official Counselor Advisory Note</h4>
                    <p className="text-xs font-medium text-amber-800 mt-1 leading-relaxed">
                      "{student.counsellorNotes}"
                    </p>
                  </div>
                </div>
              )}

              {/* Two-Way Message Log & Chat Interface */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[520px]">
                <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="h-5 w-5 text-amber-400" />
                    <div>
                      <h3 className="text-sm font-bold">Admissions & Guidance Chat Log</h3>
                      <p className="text-[10px] text-slate-400 font-mono">Direct Communication with {student.assignedCounsellor || 'Counselor'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={loadMessages}
                    className="p-2 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-lg transition-all text-xs flex items-center gap-1.5"
                    title="Refresh Chat"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-[11px] font-semibold">Sync</span>
                  </button>
                </div>

                {/* Message Stream */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/60">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                      <MessageSquare className="h-12 w-12 text-slate-300 mb-3 stroke-[1.5]" />
                      <h4 className="text-sm font-bold text-slate-700">No Messages Yet</h4>
                      <p className="text-xs text-slate-500 max-w-sm mt-1">
                        Send a message below to ask your counselor about college admissions, test paper evaluations, cutoffs, or scholarships!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isStudent = msg.senderRole === 'student' || msg.senderId === student.id;
                      return (
                        <div 
                          key={msg.id || idx}
                          className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span className="text-[10px] font-bold text-slate-500">
                              {isStudent ? 'You (Student)' : msg.senderName || 'Academic Counselor'}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                            isStudent 
                              ? 'bg-[#0057D9] text-white rounded-tr-xs' 
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                          }`}>
                            {msg.message}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input Box */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
                  <input 
                    type="text"
                    value={newMsgText}
                    onChange={(e) => setNewMsgText(e.target.value)}
                    placeholder={`Reply to ${student.assignedCounsellor || 'Counselor'} (e.g., questions on cutoff, course suitability, or exam feedback)...`}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0057D9]/20 focus:border-[#0057D9] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={sendingMsg || !newMsgText.trim()}
                    className={`px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      sendingMsg || !newMsgText.trim()
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-[#0057D9] hover:bg-[#0047b3] text-white shadow-md shadow-[#0057D9]/20 hover:-translate-y-0.5'
                    }`}
                  >
                    {sendingMsg ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      <>
                        <span>Send</span>
                        <Send className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-8" id="student-tab-profile">
              <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm max-w-2xl mx-auto space-y-8">
                <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                  <div className="h-16 w-16 bg-[#0B192C]/10 text-[#0B192C] rounded-2xl flex items-center justify-center text-xl font-bold">
                    {student.fullName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-950">{student.fullName}</h2>
                    <p className="text-xs text-slate-400 font-mono">Assigned Counseling ID: {student.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Email</span>
                    <span className="text-slate-800 font-semibold">{student.email}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Mobile</span>
                    <span className="text-slate-800 font-semibold">+91 {student.mobile}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Gender</span>
                    <span className="text-slate-800 font-semibold">{student.gender}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">DOB</span>
                    <span className="text-slate-800 font-semibold">{student.dob}</span>
                  </div>
                    <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">11th School / College</span>
                    <span className="text-slate-800 font-semibold">{student.college12th}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">11th / Inter 1st Yr Score</span>
                    <span className="text-slate-800 font-semibold">{student.marks12th}% Marks</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Interested Course</span>
                    <span className="text-slate-800 font-semibold text-amber-600 font-bold">{student.interestedCourse}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Preferred state</span>
                    <span className="text-slate-800 font-semibold">{student.preferredState}</span>
                  </div>
                </div>

                {/* Session Security & Notifications Settings */}
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-[#0057D9]" />
                        Session Security & Notification Preferences
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Manage desktop browser alerts triggered 60 seconds before session inactivity logout.
                      </p>
                    </div>
                  </div>

                  {notifFeedbackToast && (
                    <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl text-xs font-medium flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                        {notifFeedbackToast}
                      </span>
                      <button onClick={() => setNotifFeedbackToast('')} className="text-blue-600 font-bold ml-2">×</button>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="font-bold text-xs text-slate-800 block">Enable Portal Notifications</span>
                      <span className="text-[11px] text-slate-500 block">
                        Status: <strong className={sessionNotifsEnabled ? 'text-emerald-700' : 'text-slate-500'}>{sessionNotifsEnabled ? 'Enabled' : 'Disabled'}</strong>
                        {' '}&bull; Permission: <strong className="text-slate-700 capitalize">{notifPermissionState}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleTestAlert}
                        className="text-xs font-bold text-[#0057D9] hover:underline"
                      >
                        Send Test Alert
                      </button>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={sessionNotifsEnabled}
                        onClick={() => handleToggleSessionNotifs(!sessionNotifsEnabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                          sessionNotifsEnabled ? 'bg-[#0057D9]' : 'bg-slate-300'
                        }`}
                      >
                        <motion.span
                          layout
                          transition={{
                            type: "spring",
                            stiffness: 650,
                            damping: 32
                          }}
                          animate={{
                            x: sessionNotifsEnabled ? 20 : 0
                          }}
                          className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODAL 1: EXAM FEE PAYMENT (Spec #3) */}
      <AnimatePresence>
        {showPaymentModal && exam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-600/30 rounded-xl text-blue-400 border border-blue-500/30">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">NEXORA Secure Exam Payment</h3>
                    <p className="text-[11px] text-slate-400">Payment Gateway Simulation &bull; Ref: {student.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Order Summary */}
              <div className="p-6 space-y-5">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Candidate:</span>
                    <span className="font-bold text-slate-900">{student.fullName} ({student.id})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Examination:</span>
                    <span className="font-bold text-slate-900">{exam.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration:</span>
                    <span className="font-bold text-slate-900">{exam.durationMinutes} Minutes</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                    <span className="font-extrabold text-slate-900">Total Payable:</span>
                    <span className="font-black text-[#0057D9] text-base">₹{exam.fee || 500}</span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Choose Payment Method:</span>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'upi' ? 'bg-blue-50 border-[#0057D9] text-[#0057D9] font-bold shadow-xs' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="text-xs block font-bold">UPI / QR</span>
                      <span className="text-[10px] text-slate-400">GPay, PhonePe</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'card' ? 'bg-blue-50 border-[#0057D9] text-[#0057D9] font-bold shadow-xs' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="text-xs block font-bold">Cards</span>
                      <span className="text-[10px] text-slate-400">Debit / Credit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('netbanking')}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'netbanking' ? 'bg-blue-50 border-[#0057D9] text-[#0057D9] font-bold shadow-xs' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="text-xs block font-bold">Net Banking</span>
                      <span className="text-[10px] text-slate-400">All Banks</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>256-bit encrypted checkout. Upon verification, date & time slot selection unlocks instantly.</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={paymentProcessing}
                    onClick={() => handleVerifyPayment(paymentMethod)}
                    className="flex-2 py-3 bg-[#0057D9] hover:bg-[#004dc2] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {paymentProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Verifying Transaction...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Pay ₹{exam.fee || 500} & Confirm</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: DATE & TIME SLOT SELECTION (Spec #4) */}
      <AnimatePresence>
        {showSlotModal && exam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-600/30 rounded-xl text-blue-400 border border-blue-500/30">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Select Examination Slot</h3>
                    <p className="text-[11px] text-slate-400">Payment Confirmed &bull; Choose one available slot</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSlotModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Slot Options List */}
              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-500">
                  Select your preferred examination time. The examination portal will unlock strictly during this assigned schedule.
                </p>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {(() => {
                    const displaySlots = availableSlots.length > 0 ? availableSlots : (exam?.slots && exam.slots.length > 0 ? exam.slots : []);
                    if (displaySlots.length === 0) {
                      return (
                        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2 text-xs">
                          <Clock className="h-6 w-6 text-slate-400 mx-auto" />
                          <p className="font-bold text-slate-700">No examination slots have been published yet.</p>
                          <p className="text-slate-500 text-[11px]">The Examination Authority is finalizing timings. Please check back shortly.</p>
                        </div>
                      );
                    }
                    return displaySlots.map((slot) => {
                      const isSelected = selectedSlotId === slot.id;
                      const seatsLeft = Math.max(0, slot.capacity - (slot.bookedCount || 0));
                      const isFull = seatsLeft === 0;
                      return (
                        <div
                          key={slot.id}
                          onClick={() => !isFull && setSelectedSlotId(slot.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isFull ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed' :
                            isSelected ? 'bg-blue-50/80 border-[#0057D9] ring-2 ring-[#0057D9]/20 shadow-xs' :
                            'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-sm">{slot.date}</span>
                              {slot.id === 'slot-now' && (
                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                                  Instant Demo
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-[#0057D9]" />
                              {slot.startTime} – {slot.endTime}
                            </p>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Seats: {isFull ? 'Slot Full' : `${seatsLeft} seats remaining (${slot.capacity} max)`}
                            </span>
                          </div>

                          <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-[#0057D9] border-[#0057D9]' : 'border-slate-300'
                          }`}>
                            {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    onClick={() => setShowSlotModal(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!selectedSlotId || bookingSlot}
                    onClick={() => handleBookSlot(selectedSlotId)}
                    className="flex-2 py-3 bg-[#0057D9] hover:bg-[#004dc2] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {bookingSlot ? 'Locking Slot...' : 'Lock & Confirm Slot'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: STRICT MONITORED EXAM RULES WARNING (Spec #7) */}
      <AnimatePresence>
        {showSecurityWarningModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-500/30">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Important Examination Rules</h3>
                    <p className="text-[11px] text-amber-300 font-mono">Strict Proctored Security Environment</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSecurityWarningModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Warning Content */}
              <div className="p-6 space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-950">
                  <h4 className="font-extrabold text-sm text-amber-900">Mandatory Conduct Policy:</h4>
                  <p className="leading-relaxed">
                    This is a monitored examination. Leaving the examination window, switching applications/tabs, or attempting to access another application may result in automatic suspension and submission of your examination.
                  </p>
                  <p className="font-semibold text-amber-800">
                    Please remain on the examination screen until submission is completed.
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Duration: <strong>{exam?.durationMinutes || 120} Minutes</strong> continuous timer.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Real-time Answer Preservation: answers auto-saved to prevent data loss.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Zero Tolerance: Window blur or tab changes automatically terminate attempt.</span>
                  </li>
                </ul>

                <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rulesAgreed}
                    onChange={(e) => setRulesAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#0057D9] focus:ring-[#0057D9]"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    I have read, understood, and agree to the strict examination rules. I will remain on the test screen until submission.
                  </span>
                </label>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowSecurityWarningModal(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Go Back
                  </button>
                  <button
                    disabled={!rulesAgreed}
                    onClick={enterStrictExamMode}
                    className="flex-2 py-3 bg-[#0B192C] hover:bg-[#1E293B] disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Play className="h-4 w-4 text-amber-400" />
                    Enter Monitored Exam Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: TIME NOT STARTED WARNING (Spec #6) */}
      <AnimatePresence>
        {timeNotStartedModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-center space-y-5"
            >
              <div className="h-16 w-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto border border-amber-200">
                <Clock className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">Examination Not Started Yet</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {timeNotStartedModal.message}
                </p>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 font-semibold">
                  Scheduled Start Time: <strong className="text-slate-950">{timeNotStartedModal.scheduledStartTime || '10:00 AM'}</strong>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setTimeNotStartedModal({ open: false, message: '' });
                    handleCheckAndStartExam(true); // Instant test bypass
                  }}
                  className="w-full py-3 bg-[#0057D9] hover:bg-[#004dc2] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  Bypass for Testing / Demo Mode
                </button>

                <button
                  onClick={() => setTimeNotStartedModal({ open: false, message: '' })}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                >
                  Understood, Return to Portal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: VIOLATION NOTICE MODAL (Spec #7) */}
      <AnimatePresence>
        {examViolationDetected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-md w-full p-6 text-center space-y-5"
            >
              <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto border border-rose-200">
                <ShieldAlert className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-mono font-bold uppercase">
                  Security Violation Logged
                </span>
                <h3 className="text-xl font-black text-slate-900">Attempt Suspended & Submitted</h3>
                <p className="text-xs text-rose-600 font-semibold leading-relaxed">
                  Reason: {violationReason}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  In accordance with anti-cheating regulations, your examination has been automatically submitted and permanently locked.
                </p>
              </div>

              <button
                onClick={() => {
                  setExamViolationDetected(false);
                  setActiveTab('results');
                }}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Go to Evaluation Results
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
