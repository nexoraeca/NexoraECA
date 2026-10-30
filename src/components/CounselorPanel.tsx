import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, MessageSquare, CheckCircle, Clock, BookOpen, Search, 
  Send, Phone, Mail, Award, Filter, RefreshCw, ChevronRight, 
  UserCheck, AlertCircle, FileText, CheckCircle2, Star, Sparkles,
  LogOut, GraduationCap, Building, Calendar, Edit3, Trash2, MapPin, Plus, ShieldAlert,
  X, Check, Info, ArrowRight, BarChart2
} from 'lucide-react';
import { Student, ExamAttempt, ChatMessage, Counsellor, College, CollegeRecommendation } from '../types';
import { NexoraEmblem } from './NexoraLogo';
import { mirrorServerDbToLocal, syncFullDbWithServer, persistRecommendation } from '../utils/persistentStorage';
import { syncRecordToFirestore } from '../firebase';

interface CounselorPanelProps {
  counsellorUser: {
    fullName: string;
    username: string;
    email: string;
    counsellor?: Counsellor;
  };
  onLogout: () => void;
}

export default function CounselorPanel({ counsellorUser, onLogout }: CounselorPanelProps) {
  // Navigation tab
  const [counselorTab, setCounselorTab] = useState<'suggest_colleges' | 'counseling_chat'>(() => {
    try {
      const saved = localStorage.getItem('counselor_active_tab');
      if (saved === 'suggest_colleges' || saved === 'counseling_chat') return saved;
    } catch (e) {}
    return 'suggest_colleges';
  });

  useEffect(() => {
    try {
      localStorage.setItem('counselor_active_tab', counselorTab);
    } catch (e) {}
  }, [counselorTab]);

  const [students, setStudents] = useState<Student[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [allRecommendations, setAllRecommendations] = useState<CollegeRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filters for Suggest Colleges tab
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [examStatusFilter, setExamStatusFilter] = useState<'all' | 'completed' | 'pending' | 'suggested' | 'not_suggested'>('all');

  // Filters for Chat tab
  const [chatSearchQuery, setChatSearchQuery] = useState<string>('');
  const [chatStatusFilter, setChatStatusFilter] = useState<string>('All');
  
  // Active student selected for messaging / follow-up pane
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [sendingMsg, setSendingMsg] = useState<boolean>(false);
  const [counsellorNotes, setCounsellorNotes] = useState<string>('');
  const [isUpdatingNotes, setIsUpdatingNotes] = useState<boolean>(false);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState<string>('');

  // Suggest College Modal State
  const [modalStudent, setModalStudent] = useState<Student | null>(null);
  const [modalStudentRecs, setModalStudentRecs] = useState<CollegeRecommendation[]>([]);
  const [selectedCollegeIds, setSelectedCollegeIds] = useState<string[]>([]);
  const [customGuidanceNote, setCustomGuidanceNote] = useState<string>('');
  const [collegeSearchFilter, setCollegeSearchFilter] = useState<string>('');
  const [savingRecs, setSavingRecs] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsRes, attemptsRes, collegesRes, recsRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/attempts'),
        fetch('/api/colleges'),
        fetch('/api/recommendations')
      ]);
      const [studentsData, attemptsData, collegesData, recsData] = await Promise.all([
        studentsRes.json(),
        attemptsRes.json(),
        collegesRes.json(),
        recsRes.json()
      ]);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setAttempts(Array.isArray(attemptsData) ? attemptsData : []);
      setColleges(Array.isArray(collegesData) ? collegesData : []);
      setAllRecommendations(Array.isArray(recsData) ? recsData : []);

      // Mirror to local cache for instant recovery
      mirrorServerDbToLocal({
        students: Array.isArray(studentsData) ? studentsData : [],
        attempts: Array.isArray(attemptsData) ? attemptsData : [],
        colleges: Array.isArray(collegesData) ? collegesData : [],
        collegeRecommendations: Array.isArray(recsData) ? recsData : []
      });
    } catch (err) {
      console.error('Failed to load counselor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch messages when active student is selected in Chat tab
  useEffect(() => {
    if (activeStudent) {
      setCounsellorNotes(activeStudent.counsellorNotes || '');
      fetch(`/api/messages/${activeStudent.id}`)
        .then(res => res.json())
        .then(data => setMessages(data))
        .catch(err => console.error('Error fetching messages:', err));
    }
  }, [activeStudent]);

  // Load student recommendations for modal
  const loadStudentRecsForModal = async (studentId: string) => {
    try {
      const res = await fetch(`/api/recommendations/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setModalStudentRecs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load student recommendations:', err);
    }
  };

  // Open Suggest College Modal
  const openSuggestModal = (student: Student) => {
    setModalStudent(student);
    const attempt = attempts.find(a => a.studentId === student.id);
    setSelectedCollegeIds([]);
    
    // Generate helpful default note for student AI recommendation view
    if (attempt && attempt.percentage) {
      setCustomGuidanceNote(
        `Selected based on your NACAT score (${attempt.percentage}%) and 12th merit (${student.marks12th}%). High placement compatibility for ${student.interestedCourse || 'Undergraduate programs'}.`
      );
    } else {
      setCustomGuidanceNote(
        `Selected based on your 12th academic percentage (${student.marks12th}%) and preference for ${student.interestedCourse || 'Degree courses'}.`
      );
    }

    setCollegeSearchFilter('');
    loadStudentRecsForModal(student.id);
  };

  const closeSuggestModal = () => {
    setModalStudent(null);
    setSelectedCollegeIds([]);
    setCustomGuidanceNote('');
  };

  // Toggle selection of a college for suggestion
  const toggleSelectCollege = (collegeId: string) => {
    setSelectedCollegeIds(prev => 
      prev.includes(collegeId) ? prev.filter(id => id !== collegeId) : [...prev, collegeId]
    );
  };

  // Save selected colleges as suggestions
  const handleSaveCollegeSuggestions = async () => {
    if (!modalStudent || selectedCollegeIds.length === 0) return;

    setSavingRecs(true);
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: modalStudent.id,
          collegeIds: selectedCollegeIds,
          note: customGuidanceNote.trim() || 'Curated based on academic score and stream eligibility.',
          recommendedBy: counsellorUser.fullName,
          recommendedByRole: 'counsellor'
        })
      });

      const data = await res.json();
      if (data.success) {
        setToastMessage(`Successfully suggested ${selectedCollegeIds.length} college(s) to ${modalStudent.fullName}!`);
        // Refresh all recommendations
        const recsRes = await fetch('/api/recommendations');
        if (recsRes.ok) {
          const recsData = await recsRes.json();
          setAllRecommendations(Array.isArray(recsData) ? recsData : []);
        }
        await loadStudentRecsForModal(modalStudent.id);
        // Sync each recommendation directly to Firestore
        selectedCollegeIds.forEach(colId => {
          syncRecordToFirestore('recommendations', `${modalStudent.id}_${colId}`, {
            id: `rec-${Date.now()}-${colId}`,
            studentId: modalStudent.id,
            collegeId: colId,
            note: customGuidanceNote.trim() || 'Curated based on academic score and stream eligibility.',
            recommendedBy: counsellorUser.fullName,
            recommendedByRole: 'counsellor',
            createdAt: new Date().toISOString()
          });
        });
        setSelectedCollegeIds([]);
        setTimeout(() => setToastMessage(''), 4000);
        // Persist globally
        syncFullDbWithServer();
      }
    } catch (err) {
      console.error('Failed to suggest colleges:', err);
    } finally {
      setSavingRecs(false);
    }
  };

  // Remove single recommendation
  const handleRemoveRecommendation = async (recId: string) => {
    if (!modalStudent) return;
    try {
      const res = await fetch(`/api/recommendations/${recId}`, { method: 'DELETE' });
      if (res.ok) {
        setModalStudentRecs(prev => prev.filter(r => r.id !== recId));
        setAllRecommendations(prev => prev.filter(r => r.id !== recId));
      }
    } catch (err) {
      console.error('Failed to remove recommendation:', err);
    }
  };

  // Chat message sending
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeStudent) return;

    setSendingMsg(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: activeStudent.id,
          senderId: counsellorUser.username,
          senderName: counsellorUser.fullName,
          senderRole: 'counsellor',
          message: newMessage.trim()
        })
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMsg(false);
    }
  };

  // Save counselor notes
  const handleSaveNotes = async () => {
    if (!activeStudent) return;
    setIsUpdatingNotes(true);
    try {
      const res = await fetch(`/api/students/${activeStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          counsellorNotes,
          assignedCounsellor: counsellorUser.fullName
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
        setActiveStudent(updated);
        setUpdateSuccessMsg('Counseling remarks saved successfully!');
        setTimeout(() => setUpdateSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setIsUpdatingNotes(false);
    }
  };

  // Update admission status
  const handleUpdateStatus = async (newStatus: any) => {
    if (!activeStudent) return;
    try {
      const res = await fetch(`/api/students/${activeStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admissionStatus: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
        setActiveStudent(updated);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Filter students for Suggest Colleges tab
  const filteredSuggestStudents = students.filter(student => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (student.fullName || '').toLowerCase().includes(q) ||
      (student.id || '').toLowerCase().includes(q) ||
      (student.email || '').toLowerCase().includes(q) ||
      (student.mobile || '').includes(q) ||
      (student.interestedCourse || '').toLowerCase().includes(q);

    const attempt = attempts.find(a => a.studentId === student.id);
    const recsCount = allRecommendations.filter(r => r.studentId === student.id).length;

    if (examStatusFilter === 'completed') {
      return matchesSearch && !!attempt;
    }
    if (examStatusFilter === 'pending') {
      return matchesSearch && !attempt;
    }
    if (examStatusFilter === 'suggested') {
      return matchesSearch && recsCount > 0;
    }
    if (examStatusFilter === 'not_suggested') {
      return matchesSearch && recsCount === 0;
    }
    return matchesSearch;
  });

  // Filter students for Chat tab
  const filteredChatStudents = students.filter(student => {
    const q = chatSearchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (student.fullName || '').toLowerCase().includes(q) ||
      (student.id || '').toLowerCase().includes(q) ||
      (student.interestedCourse || '').toLowerCase().includes(q);

    const matchesStatus = chatStatusFilter === 'All' || student.admissionStatus === chatStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter colleges inside the modal
  const filteredCollegesForModal = colleges.filter(col => {
    const q = collegeSearchFilter.toLowerCase().trim();
    if (!q) return true;
    return (
      (col.name || '').toLowerCase().includes(q) ||
      (col.city || '').toLowerCase().includes(q) ||
      (col.state || '').toLowerCase().includes(q) ||
      (col.courses || []).some(c => (c.name || '').toLowerCase().includes(q))
    );
  });

  const studentsWithAttemptsCount = students.filter(s => attempts.some(a => a.studentId === s.id)).length;
  const studentsWithRecsCount = students.filter(s => allRecommendations.some(r => r.studentId === s.id)).length;
  const myAssignedCount = students.filter(s => s.assignedCounsellor === counsellorUser.fullName || s.assignedCounsellor === counsellorUser.counsellor?.fullName).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NexoraEmblem sizePx={40} className="shadow-xs" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-950">
                  NEXORA<span className="text-[#0057D9]">.</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold uppercase tracking-wider">
                  Counselor Workspace
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Student Assessment & College Recommendation Desk</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setCounselorTab('suggest_colleges')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                counselorTab === 'suggest_colleges'
                  ? 'bg-white text-[#0057D9] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-[#0057D9]" />
              <span>Suggest Colleges (Exam Merit)</span>
              {studentsWithAttemptsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-blue-100 text-[#0057D9] text-[10px] font-mono rounded-full font-bold">
                  {studentsWithAttemptsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCounselorTab('counseling_chat')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                counselorTab === 'counseling_chat'
                  ? 'bg-white text-[#0057D9] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
              <span>Student Chat & Desk</span>
            </button>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900">{counsellorUser.fullName}</span>
              <span className="text-[10px] text-slate-500">{counsellorUser.email}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs border border-purple-200">
              {counsellorUser.fullName.charAt(0)}
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* ================= TAB 1: SUGGEST COLLEGES TO STUDENTS (MAIN REQUIREMENT) ================= */}
        {counselorTab === 'suggest_colleges' && (
          <div className="space-y-6">
            
            {/* Page Header Banner */}
            <div className="bg-gradient-to-r from-[#0A192F] to-[#1E3A8A] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-400/30">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>College Suggestion & Merit Matching Desk</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Suggest Verified Colleges to Students
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Review student marks, 12th percentage, and examination results. Click <strong>"Suggest College to Student"</strong> to curate partner campuses. Selected colleges will dynamically appear in the student's <strong>AI College Recommendations</strong> portal.
                </p>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-3 gap-3 shrink-0 z-10">
                <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
                  <span className="text-[10px] text-slate-300 uppercase font-bold block">Exams Done</span>
                  <span className="text-xl font-black text-amber-400">{studentsWithAttemptsCount}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
                  <span className="text-[10px] text-slate-300 uppercase font-bold block">Colleges Sent</span>
                  <span className="text-xl font-black text-emerald-400">{studentsWithRecsCount}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
                  <span className="text-[10px] text-slate-300 uppercase font-bold block">Total Pool</span>
                  <span className="text-xl font-black text-white">{students.length}</span>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="relative w-full md:w-96">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student by name, ID, course, or mobile..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0057D9]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-600">Filter By:</span>
                
                <button
                  onClick={() => setExamStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    examStatusFilter === 'all'
                      ? 'bg-[#0057D9] text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  All ({students.length})
                </button>

                <button
                  onClick={() => setExamStatusFilter('completed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    examStatusFilter === 'completed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Exam Completed ({studentsWithAttemptsCount})
                </button>

                <button
                  onClick={() => setExamStatusFilter('suggested')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    examStatusFilter === 'suggested'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Colleges Suggested ({studentsWithRecsCount})
                </button>

                <button
                  onClick={() => setExamStatusFilter('not_suggested')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    examStatusFilter === 'not_suggested'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Pending Suggestions ({students.length - studentsWithRecsCount})
                </button>

                <button
                  onClick={loadData}
                  className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                  title="Refresh Directory"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Students Table / Grid */}
            {filteredSuggestStudents.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <Users className="h-10 w-10 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">No students match your criteria</h4>
                <p className="text-xs text-slate-500">Try changing your search term or filter selection.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-4">Student Profile</th>
                        <th className="px-5 py-4">12th Marks & College</th>
                        <th className="px-5 py-4">Target Course</th>
                        <th className="px-5 py-4">Exam Status & Marks</th>
                        <th className="px-5 py-4">Colleges Suggested</th>
                        <th className="px-5 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSuggestStudents.map((student) => {
                        const studentAttempt = attempts.find(a => a.studentId === student.id);
                        const studentRecs = allRecommendations.filter(r => r.studentId === student.id);
                        const hasCompletedExam = !!studentAttempt;

                        return (
                          <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Student Info */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-700 font-extrabold flex items-center justify-center border border-purple-200 text-xs shrink-0">
                                  {student.fullName ? student.fullName.charAt(0) : 'S'}
                                </div>
                                <div>
                                  <span className="font-extrabold text-slate-900 block">{student.fullName}</span>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{student.id}</span>
                                    <span>•</span>
                                    <span>{student.mobile}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* 12th Marks */}
                            <td className="px-5 py-4">
                              <div>
                                <span className="font-extrabold text-slate-900 block text-sm">
                                  {student.marks12th}%
                                </span>
                                <span className="text-[11px] text-slate-500 truncate max-w-[180px] block">
                                  {student.college12th}
                                </span>
                              </div>
                            </td>

                            {/* Target Course */}
                            <td className="px-5 py-4">
                              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0057D9] font-bold text-[11px] border border-blue-100 block max-w-fit">
                                {student.interestedCourse || 'Undergraduate'}
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5 block">
                                Pref: {student.preferredState}
                              </span>
                            </td>

                            {/* Exam Status & Marks */}
                            <td className="px-5 py-4">
                              {hasCompletedExam ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                      <CheckCircle className="h-3 w-3" />
                                      Exam Completed
                                    </span>
                                  </div>
                                  <div className="text-xs font-bold text-slate-800">
                                    Score: <span className="text-[#0057D9] font-extrabold">{studentAttempt.score}/{studentAttempt.maxScore}</span>
                                    <span className="text-slate-500 ml-1">({studentAttempt.percentage}%)</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                                    <Clock className="h-3 w-3" />
                                    Exam Pending
                                  </span>
                                  <span className="text-[10px] text-slate-400 block italic">Awaiting submission</span>
                                </div>
                              )}
                            </td>

                            {/* Current Recommendations */}
                            <td className="px-5 py-4">
                              {studentRecs.length > 0 ? (
                                <div className="space-y-1">
                                  <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-extrabold text-[11px] inline-flex items-center gap-1">
                                    <Building className="h-3 w-3" />
                                    {studentRecs.length} College{studentRecs.length > 1 ? 's' : ''}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block">Shown in student AI portal</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">0 Colleges Suggested</span>
                              )}
                            </td>

                            {/* Action Button */}
                            <td className="px-5 py-4 text-right">
                              <button
                                onClick={() => openSuggestModal(student)}
                                className="px-3.5 py-2 bg-[#0057D9] hover:bg-[#004dc2] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 ml-auto cursor-pointer group"
                              >
                                <Sparkles className="h-3.5 w-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
                                <span>Suggest College to Student</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= TAB 2: COUNSELING & CHAT FOLLOW-UP ================= */}
        {counselorTab === 'counseling_chat' && (
          <div className="space-y-6">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Assigned Mentees</span>
                  <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{myAssignedCount} Students</h4>
                  <p className="text-[10px] text-purple-600 font-semibold mt-0.5">Assigned by Administration</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <UserCheck className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Exams Completed</span>
                  <h4 className="text-2xl font-extrabold text-[#0057D9] mt-1">{studentsWithAttemptsCount} Students</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Ready for admission shortlisting</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0057D9] flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Total In Pool</span>
                  <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{students.length}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">10+2 Intermediate Applicants</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="relative w-full md:w-96">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  placeholder="Search students..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0057D9]"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-600">Stage:</span>
                <select
                  value={chatStatusFilter}
                  onChange={(e) => setChatStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#0057D9]"
                >
                  <option value="All">All Stages</option>
                  <option value="Applied">Applied</option>
                  <option value="Counseling">In Counseling</option>
                  <option value="Exam Pending">Exam Pending</option>
                  <option value="Exam Completed">Exam Completed</option>
                  <option value="Offered">Offered</option>
                  <option value="Confirmed">Confirmed</option>
                </select>
                <button
                  onClick={loadData}
                  className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                  title="Refresh"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* 2-Column Chat Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Student List (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Student Directory ({filteredChatStudents.length})
                  </h3>
                  <span className="text-[11px] text-slate-500">Select student to chat or follow up</span>
                </div>

                <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
                  {filteredChatStudents.map((student) => {
                    const isSelected = activeStudent?.id === student.id;
                    const studentAttempt = attempts.find(a => a.studentId === student.id);
                    const studentRecs = allRecommendations.filter(r => r.studentId === student.id);

                    return (
                      <div
                        key={student.id}
                        onClick={() => setActiveStudent(student)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/50 border-[#0057D9] shadow-sm ring-1 ring-[#0057D9]/30'
                            : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                                {student.fullName}
                              </h4>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
                                {student.id}
                              </span>
                            </div>
                            
                            <p className="text-[11px] text-slate-500">
                              12th: <span className="font-semibold text-slate-700">{student.marks12th}%</span> • Aiming: <span className="font-semibold text-slate-700">{student.interestedCourse}</span>
                            </p>

                            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-slate-400" />
                                {student.mobile}
                              </span>
                              {studentRecs.length > 0 && (
                                <span className="text-purple-600 font-bold flex items-center gap-1">
                                  <Sparkles className="h-3 w-3" />
                                  {studentRecs.length} colleges suggested
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right space-y-1 shrink-0">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              student.admissionStatus === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                              student.admissionStatus === 'Exam Completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {student.admissionStatus}
                            </span>

                            {studentAttempt && (
                              <div className="text-[11px] font-bold text-slate-700">
                                NACAT: <span className="text-[#0057D9]">{studentAttempt.score}/{studentAttempt.maxScore}</span> ({studentAttempt.percentage}%)
                              </div>
                            )}

                            <div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openSuggestModal(student);
                                }}
                                className="text-[10px] text-[#0057D9] hover:underline font-bold flex items-center gap-0.5 ml-auto mt-1 cursor-pointer"
                              >
                                <Sparkles className="h-2.5 w-2.5" />
                                Suggest Colleges
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Chat & Remarks Pane (5 cols) */}
              <div className="lg:col-span-5">
                {activeStudent ? (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[700px] overflow-hidden">
                    
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900">{activeStudent.fullName}</h4>
                          <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {activeStudent.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{activeStudent.interestedCourse} • {activeStudent.preferredState}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openSuggestModal(activeStudent)}
                          className="px-2.5 py-1 bg-[#0057D9] hover:bg-[#004dc2] text-white text-[11px] font-bold rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Suggest</span>
                        </button>
                        
                        <select
                          value={activeStudent.admissionStatus}
                          onChange={(e) => handleUpdateStatus(e.target.value)}
                          className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                        >
                          <option value="Applied">Applied</option>
                          <option value="Counseling">In Counseling</option>
                          <option value="Exam Pending">Exam Pending</option>
                          <option value="Exam Completed">Exam Completed</option>
                          <option value="Offered">Offered</option>
                          <option value="Confirmed">Confirmed</option>
                        </select>
                      </div>
                    </div>

                    {/* Counselor Remarks */}
                    <div className="p-3 bg-purple-50/50 border-b border-purple-100/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1">
                          <Edit3 className="h-3 w-3 text-purple-600" />
                          Counselor Guidance Remarks
                        </span>
                        <button
                          onClick={handleSaveNotes}
                          disabled={isUpdatingNotes}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {isUpdatingNotes ? 'Saving...' : 'Save Notes'}
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={counsellorNotes}
                        onChange={(e) => setCounsellorNotes(e.target.value)}
                        placeholder="Enter counseling summary, student preferences, cutoff notes..."
                        className="w-full p-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-400 resize-none"
                      />
                      {updateSuccessMsg && (
                        <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {updateSuccessMsg}
                        </p>
                      )}
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
                      <div className="text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-full">
                          Direct Student Guidance Chat
                        </span>
                      </div>

                      {messages.length === 0 ? (
                        <div className="py-12 text-center space-y-2 text-slate-400">
                          <MessageSquare className="h-8 w-8 mx-auto text-slate-300" />
                          <p className="text-xs">No messages yet. Send a follow-up greeting.</p>
                        </div>
                      ) : (
                        messages.map((msg) => {
                          const isMe = msg.senderRole === 'counsellor' || msg.senderRole === 'admin';
                          return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] font-bold text-slate-500">{msg.senderName}</span>
                                <span className="text-[9px] text-slate-400">
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                                isMe 
                                  ? 'bg-[#0057D9] text-white rounded-br-xs shadow-xs' 
                                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'
                              }`}>
                                {msg.message}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type counseling advice, exam guidance..."
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0057D9]"
                      />
                      <button
                        type="submit"
                        disabled={sendingMsg || !newMessage.trim()}
                        className="p-2.5 bg-[#0057D9] hover:bg-[#004dc2] disabled:opacity-50 text-white rounded-xl transition-colors shadow-xs cursor-pointer"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </form>

                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 h-[500px] flex flex-col items-center justify-center text-slate-400">
                    <MessageSquare className="h-12 w-12 text-slate-200" />
                    <h4 className="text-sm font-bold text-slate-700">Select a student to view details & chat</h4>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Review their marks, chat in real-time, and suggest verified partner colleges.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>

      {/* ================= MODAL: SUGGEST COLLEGES TO STUDENT (STUDENT MARKS + DETAILS + COLLEGE SELECTION) ================= */}
      {modalStudent && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeSuggestModal();
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#0A192F] text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-400/30">
                    Academic Suggestion Desk
                  </span>
                  <span className="text-slate-400 text-xs font-mono">{modalStudent.id}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Suggest Colleges for {modalStudent.fullName}
                </h3>
                <p className="text-xs text-slate-300">
                  Target Program: <span className="font-bold text-amber-300">{modalStudent.interestedCourse}</span> • State: <span className="text-white">{modalStudent.preferredState}</span>
                </p>
              </div>

              <button
                onClick={closeSuggestModal}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 dark-sidebar-scroll">
              
              {/* SECTION 1: STUDENT MARKS & EXAM DETAILS */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-[#0057D9]" />
                    <span>Student Academic Record & Marks Details</span>
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500">Verified Credentials</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">12th Marks</span>
                    <span className="text-base font-black text-slate-900">{modalStudent.marks12th}%</span>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">{modalStudent.college12th}</span>
                  </div>

                  {(() => {
                    const studentAttempt = attempts.find(a => a.studentId === modalStudent.id);
                    return (
                      <>
                        <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Exam Score</span>
                          {studentAttempt ? (
                            <div>
                              <span className="text-base font-black text-[#0057D9]">
                                {studentAttempt.score} / {studentAttempt.maxScore}
                              </span>
                              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                                {studentAttempt.percentage}% Score
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-amber-600 block mt-1">Pending Exam</span>
                          )}
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Merit Category</span>
                          <span className="text-xs font-extrabold text-purple-700 block mt-1">
                            {studentAttempt 
                              ? (studentAttempt.percentage >= 80 ? 'Tier 1 / Distinction' : studentAttempt.percentage >= 60 ? 'Tier 2 / First Class' : 'Qualified')
                              : (modalStudent.marks12th >= 80 ? 'High 12th Merit' : 'General')}
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {studentAttempt?.examTitle || 'NACAT 2026'}
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Admission Stage</span>
                          <span className="text-xs font-extrabold text-emerald-700 block mt-1">
                            {modalStudent.admissionStatus}
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {modalStudent.mobile}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* SECTION 2: AI REASONING NOTE */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#0057D9]" />
                    AI Recommendation Matching Reasoning (Shown to Student as AI Evaluation)
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Student will see this as smart AI algorithm insight</span>
                </label>
                <textarea
                  rows={2}
                  value={customGuidanceNote}
                  onChange={(e) => setCustomGuidanceNote(e.target.value)}
                  placeholder="Reasoning for this college match (e.g., strong marks in Mathematics, suitability for Engineering, etc.)..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0057D9] focus:bg-white resize-none"
                />
              </div>

              {/* SECTION 3: CURRENTLY ACTIVE SUGGESTIONS (WITH REMOVE OPTION) */}
              {modalStudentRecs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Currently Recommended Colleges ({modalStudentRecs.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {modalStudentRecs.map((rec) => {
                      const col = rec.college;
                      if (!col) return null;
                      return (
                        <div key={rec.id} className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200 flex items-center justify-between text-xs">
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <span className="font-extrabold text-purple-950 block truncate">{col.name}</span>
                            <span className="text-[10px] text-slate-500 block">{col.city}, {col.state} • NAAC: {col.naacGrade}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveRecommendation(rec.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-lg ml-2 cursor-pointer transition-colors"
                            title="Remove Recommendation"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 4: SELECT NEW COLLEGES TO SUGGEST */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Select Colleges to Suggest
                    </h4>
                    <p className="text-[11px] text-slate-500">Pick one or more partner institutions from verified directory</p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={collegeSearchFilter}
                      onChange={(e) => setCollegeSearchFilter(e.target.value)}
                      placeholder="Search college or city..."
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0057D9]"
                    />
                  </div>
                </div>

                {/* Colleges Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {filteredCollegesForModal.map((col) => {
                    const isSelected = selectedCollegeIds.includes(col.id);
                    const isAlreadyRecommended = modalStudentRecs.some(r => r.collegeId === col.id);

                    return (
                      <div
                        key={col.id}
                        onClick={() => {
                          if (!isAlreadyRecommended) toggleSelectCollege(col.id);
                        }}
                        className={`p-3.5 rounded-2xl border transition-all text-xs flex flex-col justify-between ${
                          isAlreadyRecommended
                            ? 'bg-slate-100/70 border-slate-200 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-blue-50 border-[#0057D9] shadow-xs ring-1 ring-[#0057D9] cursor-pointer'
                            : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs cursor-pointer'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-extrabold text-slate-900 leading-snug">{col.name}</h5>
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-extrabold text-[10px] shrink-0 border border-amber-200/60">
                              {col.naacGrade}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <span>{col.city}, {col.state}</span>
                          </p>

                          <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-600 font-semibold">
                            <span>Avg: <strong className="text-slate-800">{col.averagePackage}</strong></span>
                            <span>•</span>
                            <span>Highest: <strong className="text-[#0057D9]">{col.highestPackage}</strong></span>
                          </div>
                        </div>

                        {/* Bottom action state */}
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            {col.courses?.length || 0} Programs
                          </span>

                          {isAlreadyRecommended ? (
                            <span className="text-[10px] font-bold text-slate-500">Already Suggested</span>
                          ) : isSelected ? (
                            <span className="text-[11px] font-bold text-[#0057D9] flex items-center gap-1">
                              <Check className="h-3.5 w-3.5" />
                              Selected
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-800 flex items-center gap-0.5">
                              <Plus className="h-3.5 w-3.5" />
                              Select
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="text-xs">
                {selectedCollegeIds.length > 0 ? (
                  <span className="font-bold text-[#0057D9]">
                    {selectedCollegeIds.length} College{selectedCollegeIds.length > 1 ? 's' : ''} Selected to Suggest
                  </span>
                ) : (
                  <span className="text-slate-500">
                    Select colleges above to suggest to {modalStudent.fullName}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeSuggestModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveCollegeSuggestions}
                  disabled={savingRecs || selectedCollegeIds.length === 0}
                  className="px-5 py-2.5 bg-[#0057D9] hover:bg-[#004dc2] disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>{savingRecs ? 'Dispatching...' : 'Save & Send to Student AI Portal'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
