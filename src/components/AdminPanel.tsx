import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts';
import { 
  GraduationCap, LayoutDashboard, UserCheck, Users, FileText, 
  Building, ShieldAlert, Settings, LogOut, Trash2, Edit, Plus, Check, 
  X, AlertCircle, RefreshCw, Eye, MessageSquare, Award, BarChart2, CheckCircle2, Key,
  FileCheck, ClipboardCheck, Search, Filter, CheckCircle, XCircle, Save, BookOpen, HelpCircle,
  Send, Sliders, CheckSquare, Sparkles, Clock, ShieldCheck, UserPlus, Phone, Mail, User,
  Download, FileDown, Printer, FileSpreadsheet, ArrowDownToLine, Calendar, Percent, TrendingUp,
  Upload, ImageIcon, Camera, UploadCloud, Ban, PlayCircle, PauseCircle, MoreVertical
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { College, Registration, Student, Exam, Notification, ExamAttempt, UserAccount, Counsellor, PasswordResetLog, CollegeRecommendation, Question, ExamSlot, ExamStatus, DEFAULT_COURSE_STREAMS, deriveCourseStreamsFromCollege } from '../types';
import { NexoraEmblem } from './NexoraLogo';
import { mirrorServerDbToLocal, syncFullDbWithServer, exportBackupToFile, importBackupFromFile } from '../utils/persistentStorage';

interface AdminPanelProps {
  userRole?: 'super_admin' | 'admin';
  userName?: string;
  onLogout: () => void;
}

export default function AdminPanel({ userRole = 'super_admin', userName = 'Super Administrator', onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('admin_active_tab');
      if (saved && ['dashboard', 'users', 'counsellors', 'registrations', 'evaluations', 'students', 'exams', 'colleges', 'reports', 'password-resets', 'roles'].includes(saved)) {
        return saved;
      }
    } catch (e) {}
    return 'dashboard';
  });

  useEffect(() => {
    try {
      localStorage.setItem('admin_active_tab', activeTab);
    } catch (e) {}
  }, [activeTab]);
  
  // States loaded from backend
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [resultsPublished, setResultsPublished] = useState<{ [examId: string]: boolean }>({});
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);

  // Password Reset Audit Logs State
  const [passwordResetLogs, setPasswordResetLogs] = useState<PasswordResetLog[]>([]);
  const [resetLogSearch, setResetLogSearch] = useState<string>('');
  const [resetLogStatusFilter, setResetLogStatusFilter] = useState<'all' | 'SUCCESS' | 'ATTEMPT' | 'FAILED'>('all');
  const [resetLogTypeFilter, setResetLogTypeFilter] = useState<string>('all');
  const [selectedLogDetail, setSelectedLogDetail] = useState<PasswordResetLog | null>(null);
  const [resetLogsLoading, setResetLogsLoading] = useState<boolean>(false);
  const [clearingLogs, setClearingLogs] = useState<boolean>(false);
  const [resetLogsFeedbackToast, setResetLogsFeedbackToast] = useState<string>('');

  // Reports & PDF Export state
  const [reportSearch, setReportSearch] = useState<string>('');
  const [reportCourseFilter, setReportCourseFilter] = useState<string>('all');
  const [reportStatusFilter, setReportStatusFilter] = useState<'all' | 'present' | 'absent' | 'passed' | 'failed'>('all');
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [pdfExportToast, setPdfExportToast] = useState<string>('');
  const [backupSyncToast, setBackupSyncToast] = useState<string>('');
  const [isSyncingBackup, setIsSyncingBackup] = useState<boolean>(false);
  const backupFileInputRef = React.useRef<HTMLInputElement>(null);

  // User Management State
  const [userSearch, setUserSearch] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [userForm, setUserForm] = useState<{
    fullName: string;
    username: string;
    email: string;
    password: string;
    role: 'super_admin' | 'admin' | 'counsellor' | 'student';
    mobile?: string;
    specialization?: string;
  }>({
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'counsellor',
    mobile: '',
    specialization: 'Admissions & Engineering Counseling'
  });

  // Counsellor Assignment State
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [selectedStudentForAssign, setSelectedStudentForAssign] = useState<Student | null>(null);
  const [assignCounsellorName, setAssignCounsellorName] = useState<string>('');
  const [assignNotes, setAssignNotes] = useState<string>('');

  // Loading triggers
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filter & Search for Test Reviews
  const [attemptSearch, setAttemptSearch] = useState<string>('');
  const [attemptFilter, setAttemptFilter] = useState<'all' | 'pending' | 'graded' | 'passed' | 'failed'>('all');

  // Test Review & Marks Grading Modal State
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  const [reviewData, setReviewData] = useState<{ attempt: ExamAttempt; student: Student | null; exam: Exam | null } | null>(null);
  const [gradingForm, setGradingForm] = useState<{
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    questionMarks: { [qId: string]: number };
    questionFeedback: { [qId: string]: string };
    evaluatorRemarks: string;
    evaluatorName: string;
    evaluationStatus: 'Pending Review' | 'Under Review' | 'Graded & Verified';
    isPublished: boolean;
    sendNotification: boolean;
  }>({
    score: 0,
    maxScore: 10,
    percentage: 0,
    passed: false,
    questionMarks: {},
    questionFeedback: {},
    evaluatorRemarks: '',
    evaluatorName: 'Dr. Lakshmi Prasad (Chief Examiner)',
    evaluationStatus: 'Graded & Verified',
    isPublished: true,
    sendNotification: true
  });

  // Creation modals/forms
  const [showCollegeModal, setShowCollegeModal] = useState<boolean>(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [collegeForm, setCollegeForm] = useState<Partial<College>>({
    name: '', state: 'Gujarat', city: '', naacGrade: 'A',
    shortDescription: '', about: '', imageUrl: '',
    highestPackage: '12.0 LPA', averagePackage: '4.5 LPA', placementRate: '90%',
    recruiters: ['TCS', 'Infosys'], courses: [{ name: 'B.Tech CSE', duration: '4 Years', fees: '1,20,000' }],
    infrastructure: ['Modern Labs'], hostelInfo: 'Comfortable hostel rooms on-campus.', sportsFacilities: ['Cricket nets']
  });

  // College Image Adding & Preview State
  const [collegeImageMode, setCollegeImageMode] = useState<'upload' | 'presets' | 'url'>('upload');
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  const [imageUploadFeedback, setImageUploadFeedback] = useState<string>('');
  const collegeFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const SAMPLE_CAMPUS_PRESETS = [
    {
      title: "Tech Innovation Quad",
      url: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1200"
    },
    {
      title: "Heritage Green Campus",
      url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200"
    },
    {
      title: "Modern Glass Architecture",
      url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200"
    },
    {
      title: "Research & Science Quad",
      url: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=1200"
    }
  ];

  const handleCollegeImageUpload = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WEBP, or SVG).');
      return;
    }
    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) {
        setIsProcessingImage(false);
        return;
      }

      const processUpload = async (imgData: string) => {
        try {
          const uploadRes = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imgData })
          });
          const uploadData = await uploadRes.json();
          if (uploadData.success && uploadData.url) {
            setCollegeForm(prev => ({ ...prev, imageUrl: uploadData.url }));
            setImageUploadFeedback(`Image saved successfully to server (${file.name})`);
          } else {
            setCollegeForm(prev => ({ ...prev, imageUrl: imgData }));
            setImageUploadFeedback(`Image loaded (${file.name})`);
          }
        } catch {
          setCollegeForm(prev => ({ ...prev, imageUrl: imgData }));
          setImageUploadFeedback(`Image loaded (${file.name})`);
        } finally {
          setIsProcessingImage(false);
        }
      };

      // Optimize image using HTML5 canvas
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxHeight) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          processUpload(compressedDataUrl);
        } else {
          processUpload(result);
        }
      };
      img.onerror = () => {
        processUpload(result);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const [showExamModal, setShowExamModal] = useState<boolean>(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [examForm, setExamForm] = useState<Partial<Exam>>({
    title: '',
    description: 'National Aptitude & Merit Assessment for higher education degree admissions and institutional merit scholarship allocation.',
    course: 'All Streams',
    date: '2026-10-20',
    startTime: '10:00 AM',
    durationMinutes: 120,
    passPercentage: 50,
    fee: 500,
    bookingStart: '2026-10-15',
    bookingEnd: '2026-10-20',
    resultPublishAt: '2026-10-25',
    status: 'Registration Open',
    questions: [],
    slots: []
  });

  // Slot Manager State (Spec #4)
  const [showSlotModal, setShowSlotModal] = useState<boolean>(false);
  const [selectedExamForSlots, setSelectedExamForSlots] = useState<Exam | null>(null);
  const [newSlotDate, setNewSlotDate] = useState<string>('20 October 2026');
  const [newSlotStartTime, setNewSlotStartTime] = useState<string>('10:00 AM');
  const [newSlotEndTime, setNewSlotEndTime] = useState<string>('12:00 PM');
  const [newSlotCapacity, setNewSlotCapacity] = useState<number>(50);

  // Dedicated Super Admin Exam Publish & Time Slots Scheduling Modal State
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [publishingExam, setPublishingExam] = useState<Exam | null>(null);
  const [publishExamDate, setPublishExamDate] = useState<string>('20 November 2026');
  const [publishBookingStart, setPublishBookingStart] = useState<string>('2026-11-01');
  const [publishBookingEnd, setPublishBookingEnd] = useState<string>('2026-11-19');
  const [publishResultDate, setPublishResultDate] = useState<string>('2026-11-25');
  const [publishSlots, setPublishSlots] = useState<ExamSlot[]>([]);
  const [publishSlotDate, setPublishSlotDate] = useState<string>('20 November 2026');
  const [publishSlotStartTime, setPublishSlotStartTime] = useState<string>('10:00 AM');
  const [publishSlotEndTime, setPublishSlotEndTime] = useState<string>('12:00 PM');
  const [publishSlotCapacity, setPublishSlotCapacity] = useState<number>(50);
  const [isSubmittingPublish, setIsSubmittingPublish] = useState<boolean>(false);

  // Student College Recommendations State (Spec #14)
  const [showAdminRecModal, setShowAdminRecModal] = useState<boolean>(false);
  const [selectedStudentForRec, setSelectedStudentForRec] = useState<Student | null>(null);
  const [studentRecs, setStudentRecs] = useState<CollegeRecommendation[]>([]);
  const [adminRecCollegeId, setAdminRecCollegeId] = useState<string>('');
  const [adminRecNote, setAdminRecNote] = useState<string>('');
  const [adminRecSubmitting, setAdminRecSubmitting] = useState<boolean>(false);
  const [adminRecToast, setAdminRecToast] = useState<string>('');

  // User Management Suspend / Delete Action Confirmation State
  const [userActionToast, setUserActionToast] = useState<string>('');
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    type: 'suspend' | 'reactivate' | 'delete';
    user: UserAccount | null;
  }>({
    isOpen: false,
    type: 'suspend',
    user: null
  });

  // 3-dots action menu states
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);
  const [openMenuCounsellorId, setOpenMenuCounsellorId] = useState<string | null>(null);

  const [showNotifModal, setShowNotifModal] = useState<boolean>(false);
  const [notifForm, setNotifForm] = useState({
    title: '', message: '', type: 'info', targetStudentId: ''
  });

  // Approved Credentials Modal
  const [showCredsModal, setShowCredsModal] = useState<boolean>(false);
  const [credsData, setCredsData] = useState<any>(null);

  // Load Admin Data
  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/registrations').then(r => r.json()),
      fetch('/api/students').then(r => r.json()),
      fetch('/api/colleges').then(r => r.json()),
      fetch('/api/exams').then(r => r.json()),
      fetch('/api/exams/published-status').then(r => r.json()),
      fetch('/api/reports/stats').then(r => r.json()),
      fetch('/api/attempts').then(r => r.json()).catch(() => []),
      fetch('/api/users').then(r => r.json()).catch(() => []),
      fetch('/api/counsellors').then(r => r.json()).catch(() => []),
      fetch('/api/admin/password-reset-logs').then(r => r.json()).catch(() => [])
    ]).then(([regs, studList, colList, examList, pubStatus, reportData, attemptsList, userList, counsellorList, resetLogsList]) => {
      setRegistrations(regs);
      setStudents(studList);
      setColleges(colList);
      setExams(examList);
      setResultsPublished(pubStatus);
      setReports(reportData);
      setAttempts(attemptsList || []);
      setUsers(userList || []);
      setCounsellors(counsellorList || []);
      setPasswordResetLogs(Array.isArray(resetLogsList) ? resetLogsList : []);
      setLoading(false);

      // Mirror full snapshot to browser localStorage for zero data loss
      mirrorServerDbToLocal({
        registrations: regs,
        students: studList,
        colleges: colList,
        exams: examList,
        attempts: attemptsList || [],
        users: userList || [],
        counsellors: counsellorList || []
      });
    }).catch(err => {
      console.error("Error loading admin datasets:", err);
      setLoading(false);
    });
  };

  const refreshPasswordResetLogs = async () => {
    setResetLogsLoading(true);
    try {
      const res = await fetch('/api/admin/password-reset-logs');
      const data = await res.json();
      setPasswordResetLogs(Array.isArray(data) ? data : []);
      setResetLogsFeedbackToast('Password reset audit logs refreshed.');
      setTimeout(() => setResetLogsFeedbackToast(''), 3000);
    } catch (err) {
      console.error('Error refreshing password reset logs:', err);
    } finally {
      setResetLogsLoading(false);
    }
  };

  const handleClearResetLogs = async () => {
    if (userRole !== 'super_admin') {
      alert("Only Super Administrators have authority to clear security audit logs.");
      return;
    }
    if (!window.confirm("Are you sure you want to clear all password reset audit logs? This action is irreversible.")) {
      return;
    }
    setClearingLogs(true);
    try {
      const res = await fetch('/api/admin/password-reset-logs/clear', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setPasswordResetLogs([]);
        setResetLogsFeedbackToast('All password reset audit history cleared.');
        setTimeout(() => setResetLogsFeedbackToast(''), 3000);
      }
    } catch (err) {
      console.error('Error clearing password reset logs:', err);
    } finally {
      setClearingLogs(false);
    }
  };

  const exportResetLogsCSV = () => {
    if (passwordResetLogs.length === 0) {
      alert("No log records available to export.");
      return;
    }
    const headers = ["Log ID", "Timestamp", "Event Type", "Event Title", "User Identifier", "Target Email", "User Role", "Status", "IP Address", "Details"];
    const rows = passwordResetLogs.map(l => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.eventType}"`,
      `"${(l.eventTitle || '').replace(/"/g, '""')}"`,
      `"${(l.userIdentifier || '').replace(/"/g, '""')}"`,
      `"${(l.targetEmail || '').replace(/"/g, '""')}"`,
      `"${(l.userRole || '').replace(/"/g, '""')}"`,
      `"${l.status}"`,
      `"${(l.ipAddress || '').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nexora_password_reset_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setResetLogsFeedbackToast('Password reset audit logs exported to CSV.');
    setTimeout(() => setResetLogsFeedbackToast(''), 3000);
  };

  const exportResetLogsJSON = () => {
    if (passwordResetLogs.length === 0) {
      alert("No log records available to export.");
      return;
    }
    const jsonStr = JSON.stringify(passwordResetLogs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexora_password_reset_audit_logs_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setResetLogsFeedbackToast('Password reset audit logs exported to JSON.');
    setTimeout(() => setResetLogsFeedbackToast(''), 3000);
  };

  const handleExportBackup = () => {
    exportBackupToFile();
    setBackupSyncToast('Complete database backup JSON downloaded successfully!');
    setTimeout(() => setBackupSyncToast(''), 4000);
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        if (content) {
          setIsSyncingBackup(true);
          const ok = await importBackupFromFile(content);
          setIsSyncingBackup(false);
          if (ok) {
            setBackupSyncToast('Database restored successfully from backup file!');
            loadData();
          } else {
            setBackupSyncToast('Failed to restore database. Please check file format.');
          }
          setTimeout(() => setBackupSyncToast(''), 5000);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setIsSyncingBackup(false);
      setBackupSyncToast('Error reading backup file.');
      setTimeout(() => setBackupSyncToast(''), 4000);
    }
  };

  const handleForceSync = async () => {
    setIsSyncingBackup(true);
    try {
      await syncFullDbWithServer();
      loadData();
      setBackupSyncToast('Bi-directional database sync completed! All data preserved locally and on server.');
    } catch (e) {
      setBackupSyncToast('Sync completed with local cache.');
    } finally {
      setIsSyncingBackup(false);
      setTimeout(() => setBackupSyncToast(''), 4000);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.fullName || !userForm.username || !userForm.password) {
      alert("Please fill in all mandatory fields (Name, Username, and Password).");
      return;
    }

    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...userForm,
        createdBy: userName
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          setShowUserModal(false);
          setUserForm({
            fullName: '',
            username: '',
            email: '',
            password: '',
            role: 'counsellor',
            mobile: '',
            specialization: 'Admissions & Engineering Counseling'
          });
          loadData();
        }
      })
      .catch(err => console.error("Error creating user account:", err));
  };

  // User Management Controls (Suspend, Reactivate, Delete)
  const handleToggleSuspendUser = (targetUser: UserAccount) => {
    // Permission guard
    if (targetUser.username === 'superadmin' || targetUser.id === 'usr-superadmin') {
      alert("The Root Super Administrator account cannot be suspended.");
      return;
    }
    if (userRole === 'admin' && targetUser.role === 'super_admin') {
      alert("Admissions Admins do not have authority to modify Super Administrator accounts.");
      return;
    }

    const isCurrentlySuspended = targetUser.status === 'suspended' || targetUser.isSuspended;
    const actionType = isCurrentlySuspended ? 'reactivate' : 'suspend';
    
    setConfirmModalData({
      isOpen: true,
      type: actionType,
      user: targetUser
    });
  };

  const handleOpenDeleteUserModal = (targetUser: UserAccount) => {
    // Permission guard
    if (targetUser.username === 'superadmin' || targetUser.id === 'usr-superadmin') {
      alert("The Root Super Administrator account cannot be deleted.");
      return;
    }
    if (userRole === 'admin' && targetUser.role === 'super_admin') {
      alert("Admissions Admins do not have authority to delete Super Administrator accounts.");
      return;
    }

    setConfirmModalData({
      isOpen: true,
      type: 'delete',
      user: targetUser
    });
  };

  const handleDeleteUser = (userId: string, targetRole: string, targetUsername?: string, targetFullName?: string) => {
    const existing = users.find(u => u.id === userId || u.username === targetUsername);
    if (existing) {
      handleOpenDeleteUserModal(existing);
    } else {
      handleOpenDeleteUserModal({
        id: userId,
        username: targetUsername || userId,
        role: targetRole as any,
        fullName: targetFullName || targetUsername || 'User'
      });
    }
  };

  const handleExecuteUserAction = async () => {
    if (!confirmModalData.user) return;
    const target = confirmModalData.user;
    const actionType = confirmModalData.type;

    try {
      if (actionType === 'delete') {
        const res = await fetch(`/api/users/${target.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete user.');
        setUserActionToast(`User "${target.fullName || target.username}" has been permanently deleted.`);
      } else {
        const newStatus = actionType === 'suspend' ? 'suspended' : 'active';
        const res = await fetch(`/api/users/${target.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus, isSuspended: newStatus === 'suspended' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Failed to ${actionType} user.`);
        setUserActionToast(`User "${target.fullName || target.username}" has been ${actionType === 'suspend' ? 'suspended' : 'reactivated successfully'}.`);
      }
      setTimeout(() => setUserActionToast(''), 5000);
      setConfirmModalData({ isOpen: false, type: 'suspend', user: null });
      loadData();
    } catch (err: any) {
      console.error(`Error performing user ${actionType}:`, err);
      alert(err.message || `An error occurred while trying to ${actionType} user.`);
    }
  };

  const handleAssignCounsellorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForAssign || !assignCounsellorName) {
      alert("Please select a valid counselor.");
      return;
    }

    fetch(`/api/students/${selectedStudentForAssign.id}/assign-counsellor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        counsellorName: assignCounsellorName,
        counsellorNotes: assignNotes
      })
    })
      .then(res => res.json())
      .then(data => {
        setShowAssignModal(false);
        setSelectedStudentForAssign(null);
        setAssignCounsellorName('');
        setAssignNotes('');
        loadData();
      })
      .catch(err => console.error("Error assigning counselor:", err));
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Open Test Review Modal
  const handleOpenReviewModal = (attempt: ExamAttempt) => {
    setReviewLoading(true);
    setShowReviewModal(true);
    fetch(`/api/attempts/${attempt.studentId}/${attempt.examId}`)
      .then(r => r.json())
      .then(data => {
        setReviewData(data);
        const currentExam = data.exam || exams.find(e => e.id === attempt.examId);
        const maxScore = currentExam ? currentExam.questions.length : (attempt.maxScore || 10);
        
        // Populate marks
        const qMarks: { [qId: string]: number } = { ...(attempt.questionMarks || {}) };
        if (currentExam) {
          currentExam.questions.forEach((q: any) => {
            if (qMarks[q.id] === undefined) {
              const studentAns = attempt.answers?.[q.id] || [];
              const correctAns = q.correctAnswers || [];
              let isCorrect = false;
              if (q.type === 'multiple-choice') {
                isCorrect = JSON.stringify([...studentAns].sort()) === JSON.stringify([...correctAns].sort());
              } else {
                isCorrect = studentAns.length === 1 && correctAns.length === 1 && studentAns[0] === correctAns[0];
              }
              qMarks[q.id] = isCorrect ? 1 : 0;
            }
          });
        }

        const totalScore = Object.values(qMarks).reduce((a, b) => a + Number(b), 0);
        const calculatedPercentage = Math.round((totalScore / maxScore) * 100);
        const passThreshold = currentExam ? currentExam.passPercentage : 30;

        setGradingForm({
          score: attempt.score !== undefined ? attempt.score : totalScore,
          maxScore: maxScore,
          percentage: attempt.percentage !== undefined ? attempt.percentage : calculatedPercentage,
          passed: attempt.passed !== undefined ? attempt.passed : (calculatedPercentage >= passThreshold),
          questionMarks: qMarks,
          questionFeedback: { ...(attempt.questionFeedback || {}) },
          evaluatorRemarks: attempt.evaluatorRemarks || "Evaluated by Examination Board. Candidate demonstrated solid conceptual grasp.",
          evaluatorName: attempt.evaluatorName || "Dr. Lakshmi Prasad (Chief Examiner)",
          evaluationStatus: (attempt.evaluationStatus as any) || 'Graded & Verified',
          isPublished: attempt.isPublished !== undefined ? attempt.isPublished : true,
          sendNotification: true
        });
        setReviewLoading(false);
      })
      .catch(err => {
        console.error("Failed to load attempt details:", err);
        setReviewLoading(false);
      });
  };

  // Update Individual Question Mark in Modal
  const handleUpdateQuestionMark = (qId: string, mark: number) => {
    setGradingForm(prev => {
      const updatedMarks: { [key: string]: number } = { ...prev.questionMarks, [qId]: mark };
      const totalScore = Object.values(updatedMarks).reduce((a: number, b: number) => a + (Number(b) || 0), 0);
      const max = prev.maxScore || 10;
      const pct = Math.round((totalScore / max) * 100);
      const passPct = reviewData?.exam?.passPercentage || 30;
      return {
        ...prev,
        questionMarks: updatedMarks,
        score: totalScore,
        percentage: pct,
        passed: pct >= passPct
      };
    });
  };

  // Update Question Note
  const handleUpdateQuestionFeedback = (qId: string, note: string) => {
    setGradingForm(prev => ({
      ...prev,
      questionFeedback: {
        ...prev.questionFeedback,
        [qId]: note
      }
    }));
  };

  // Auto-Score All Questions from Key
  const handleAutoScoreFromKey = () => {
    if (!reviewData?.exam || !reviewData.attempt) return;
    const currentExam = reviewData.exam;
    const studentAnswers = reviewData.attempt.answers || {};
    const newMarks: { [qId: string]: number } = {};

    currentExam.questions.forEach((q: any) => {
      const studentAns = studentAnswers[q.id] || [];
      const correctAns = q.correctAnswers || [];
      let isCorrect = false;
      if (q.type === 'multiple-choice') {
        isCorrect = JSON.stringify([...studentAns].sort()) === JSON.stringify([...correctAns].sort());
      } else {
        isCorrect = studentAns.length === 1 && correctAns.length === 1 && studentAns[0] === correctAns[0];
      }
      newMarks[q.id] = isCorrect ? 1 : 0;
    });

    const total = Object.values(newMarks).reduce((a, b) => a + Number(b), 0);
    const max = currentExam.questions.length;
    const pct = Math.round((total / max) * 100);

    setGradingForm(prev => ({
      ...prev,
      questionMarks: newMarks,
      score: total,
      percentage: pct,
      passed: pct >= (currentExam.passPercentage || 30)
    }));
  };

  // Award Full Marks to All Questions
  const handleAwardFullMarksAll = () => {
    if (!reviewData?.exam) return;
    const newMarks: { [qId: string]: number } = {};
    reviewData.exam.questions.forEach((q: any) => {
      newMarks[q.id] = 1;
    });
    const max = reviewData.exam.questions.length;
    setGradingForm(prev => ({
      ...prev,
      questionMarks: newMarks,
      score: max,
      percentage: 100,
      passed: true
    }));
  };

  // Append Remark Preset Chip
  const handleAppendRemarkTag = (tag: string) => {
    setGradingForm(prev => ({
      ...prev,
      evaluatorRemarks: prev.evaluatorRemarks ? `${prev.evaluatorRemarks} [${tag}]` : `[${tag}]`
    }));
  };

  // Save Graded Attempt
  const handleSaveGrading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewData?.attempt) return;
    const { studentId, examId } = reviewData.attempt;

    fetch(`/api/attempts/${studentId}/${examId}/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gradingForm)
    })
      .then(res => res.json())
      .then(data => {
        setShowReviewModal(false);
        alert(`Test Evaluation Saved! Assigned Score: ${gradingForm.score}/${gradingForm.maxScore} (${gradingForm.percentage}%). Scorecard updated.`);
        loadData();
      })
      .catch(err => {
        console.error("Error saving grading:", err);
        alert("Failed to save marks review.");
      });
  };

  // Toggle Individual Scorecard Publish Status
  const handleTogglePublishAttempt = (studentId: string, examId: string, currentPublished: boolean) => {
    fetch(`/api/attempts/${studentId}/${examId}/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !currentPublished, sendNotification: !currentPublished })
    })
      .then(() => loadData());
  };

  // Approve registration
  const handleApprove = (id: string) => {
    fetch(`/api/registrations/${id}/approve`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setCredsData(data.credentials);
        setShowCredsModal(true);
        loadData();
      });
  };

  const handleReject = (id: string) => {
    fetch(`/api/registrations/${id}/reject`, { method: 'POST' })
      .then(() => loadData());
  };

  const handlePublishResults = (examId: string, publish: boolean) => {
    fetch('/api/exams/publish-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examId, publish })
    })
      .then(() => loadData());
  };

  // Offered Programs Management for College CRUD
  const handleAddCourse = () => {
    const current = collegeForm.courses || [];
    setCollegeForm(prev => ({
      ...prev,
      courses: [
        ...current,
        { name: '', duration: '4 Years', type: 'Full-Time Degree', fees: '' }
      ]
    }));
  };

  const handleUpdateCourse = (index: number, field: string, value: string) => {
    const current = [...(collegeForm.courses || [])];
    if (!current[index]) return;
    current[index] = { ...current[index], [field]: value };
    setCollegeForm(prev => ({ ...prev, courses: current }));
  };

  const handleRemoveCourse = (index: number) => {
    const current = [...(collegeForm.courses || [])];
    current.splice(index, 1);
    setCollegeForm(prev => ({ ...prev, courses: current }));
  };

  const handleToggleCourseStream = (stream: string) => {
    const current = (collegeForm.courseStreams && collegeForm.courseStreams.length > 0)
      ? collegeForm.courseStreams
      : deriveCourseStreamsFromCollege(collegeForm);
    const isSelected = current.includes(stream);
    const next = isSelected ? current.filter(s => s !== stream) : [...current, stream];
    setCollegeForm(prev => ({ ...prev, courseStreams: next }));
  };

  // CRUD College
  const handleCollegeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingCollege ? `/api/colleges/${editingCollege.id}` : '/api/colleges';
    const method = editingCollege ? 'PUT' : 'POST';

    const finalStreams = (collegeForm.courseStreams && collegeForm.courseStreams.length > 0)
      ? collegeForm.courseStreams
      : deriveCourseStreamsFromCollege(collegeForm);

    const payload = {
      ...collegeForm,
      courseStreams: finalStreams
    };

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(() => {
        setShowCollegeModal(false);
        setEditingCollege(null);
        loadData();
      });
  };

  const handleCollegeDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this partner college?")) {
      fetch(`/api/colleges/${id}`, { method: 'DELETE' })
        .then(() => loadData());
    }
  };

  // Add or Edit Exam (Spec #1, #5, #10)
  const handleExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingExamId ? `/api/exams/${editingExamId}` : '/api/exams';
    const method = editingExamId ? 'PUT' : 'POST';

    // If new exam and no questions selected, inject default aptitude questions
    const finalForm = {
      ...examForm,
      questions: (examForm.questions && examForm.questions.length > 0) ? examForm.questions : [
        {
          id: "q-apt-01",
          text: "A vehicle covers 180 km in 3 hours. What is its speed in meters per second (m/s)?",
          type: "mcq",
          options: ["16.67 m/s", "20.0 m/s", "25.0 m/s", "15.5 m/s"],
          correctAnswers: [0]
        },
        {
          id: "q-apt-02",
          text: "Identify the next number in the sequence: 4, 16, 64, 256, ...",
          type: "mcq",
          options: ["512", "768", "1024", "2048"],
          correctAnswers: [2]
        },
        {
          id: "q-apt-03",
          text: "Which programming paradigm focuses on declaring 'what' to compute rather than 'how' to compute?",
          type: "mcq",
          options: ["Imperative", "Declarative", "Procedural", "Object-Oriented"],
          correctAnswers: [1]
        },
        {
          id: "q-apt-04",
          text: "If ₹25,000 is invested at an annual interest rate of 8% for 2 years compounded annually, what is the total amount?",
          type: "mcq",
          options: ["₹28,800", "₹29,160", "₹27,500", "₹30,000"],
          correctAnswers: [1]
        },
        {
          id: "q-apt-05",
          text: "Select the word closest in meaning to 'INNOVATIVE':",
          type: "mcq",
          options: ["Traditional", "Original", "Repetitive", "Outdated"],
          correctAnswers: [1]
        }
      ]
    };

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalForm)
    })
      .then(res => res.json())
      .then(() => {
        setShowExamModal(false);
        setEditingExamId(null);
        loadData();
      })
      .catch(err => console.error("Error saving exam:", err));
  };

  const handleOpenCreateExam = () => {
    setEditingExamId(null);
    setExamForm({
      title: '',
      description: 'Comprehensive aptitude and career stream assessment for university degree admissions and merit scholarship qualification.',
      course: 'All Streams',
      date: '20 November 2026',
      startTime: '10:00 AM',
      durationMinutes: 120,
      passPercentage: 50,
      fee: 0,
      bookingStart: '2026-11-01',
      bookingEnd: '2026-11-19',
      resultPublishAt: '2026-11-25',
      status: 'Registration Open',
      questions: [],
      slots: []
    });
    setShowExamModal(true);
  };

  const handleOpenEditExam = (exam: Exam) => {
    setEditingExamId(exam.id);
    setExamForm({
      ...exam,
      date: exam.date || '20 November 2026',
      bookingStart: exam.bookingStart ? exam.bookingStart.slice(0, 10) : '2026-11-01',
      bookingEnd: exam.bookingEnd ? exam.bookingEnd.slice(0, 10) : '2026-11-19',
      resultPublishAt: exam.resultPublishAt ? exam.resultPublishAt.slice(0, 10) : '2026-11-25',
    });
    setShowExamModal(true);
  };

  // Dedicated Super Admin Exam Publishing & Slot Scheduling Modal Handlers
  const handleOpenPublishModal = (exam: Exam) => {
    setPublishingExam(exam);
    const resolvedDate = exam.date || '20 November 2026';
    setPublishExamDate(resolvedDate);
    setPublishBookingStart(exam.bookingStart ? exam.bookingStart.slice(0, 10) : '2026-11-01');
    setPublishBookingEnd(exam.bookingEnd ? exam.bookingEnd.slice(0, 10) : '2026-11-19');
    setPublishResultDate(exam.resultPublishAt ? exam.resultPublishAt.slice(0, 10) : '2026-11-25');
    
    // Existing slots or supply default presets
    const examSlots = Array.isArray(exam.slots) && exam.slots.length > 0 ? [...exam.slots] : [
      {
        id: `slot-${Date.now()}-1`,
        examId: exam.id,
        date: resolvedDate,
        startTime: '10:00 AM',
        endTime: '12:00 PM',
        capacity: 50,
        bookedCount: 0,
        status: 'available'
      },
      {
        id: `slot-${Date.now()}-2`,
        examId: exam.id,
        date: resolvedDate,
        startTime: '02:00 PM',
        endTime: '04:00 PM',
        capacity: 50,
        bookedCount: 0,
        status: 'available'
      },
      {
        id: `slot-${Date.now()}-3`,
        examId: exam.id,
        date: resolvedDate,
        startTime: '06:00 PM',
        endTime: '08:00 PM',
        capacity: 50,
        bookedCount: 0,
        status: 'available'
      }
    ];
    setPublishSlots(examSlots);
    setPublishSlotDate(resolvedDate);
    setPublishSlotStartTime('10:00 AM');
    setPublishSlotEndTime('12:00 PM');
    setPublishSlotCapacity(50);
    setShowPublishModal(true);
  };

  const handleAddSlotToPublish = () => {
    if (!publishingExam) return;
    const newSlot: ExamSlot = {
      id: `slot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      examId: publishingExam.id,
      date: (publishSlotDate || publishExamDate || '20 November 2026').trim(),
      startTime: publishSlotStartTime.trim() || '10:00 AM',
      endTime: publishSlotEndTime.trim() || '12:00 PM',
      capacity: Number(publishSlotCapacity) || 50,
      bookedCount: 0,
      status: 'available'
    };
    setPublishSlots(prev => [...prev, newSlot]);
  };

  const handleAddPresetSlot = (startTime: string, endTime: string) => {
    if (!publishingExam) return;
    const newSlot: ExamSlot = {
      id: `slot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      examId: publishingExam.id,
      date: (publishExamDate || '20 November 2026').trim(),
      startTime,
      endTime,
      capacity: 50,
      bookedCount: 0,
      status: 'available'
    };
    setPublishSlots(prev => [...prev, newSlot]);
  };

  const handleDeleteSlotFromPublish = (slotId: string) => {
    setPublishSlots(prev => prev.filter(s => s.id !== slotId));
  };

  const handleConfirmPublishExam = async () => {
    if (!publishingExam) return;
    if (!publishExamDate.trim()) {
      alert("Please provide the official examination date.");
      return;
    }
    setIsSubmittingPublish(true);
    try {
      const res = await fetch(`/api/exams/${publishingExam.id}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: publishExamDate.trim(),
          slots: publishSlots,
          bookingStart: publishBookingStart,
          bookingEnd: publishBookingEnd,
          resultPublishAt: publishResultDate,
          status: 'Registration Open'
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowPublishModal(false);
        setPublishingExam(null);
        alert(`Examination successfully published and synchronized!\n\n• Official Date: ${publishExamDate}\n• Configured Time Slots: ${publishSlots.length} slot(s)\n\nThis schedule has been updated live on the Welcome Page and Student Dashboard.`);
        loadData();
      } else {
        alert(data.error || "Failed to publish examination schedule.");
      }
    } catch (err) {
      console.error("Error publishing exam:", err);
      alert("Server communication error while publishing exam.");
    } finally {
      setIsSubmittingPublish(false);
    }
  };

  const handleReleaseExam = (examId: string) => {
    const examToRelease = exams.find(e => e.id === examId);
    if (examToRelease) {
      handleOpenPublishModal(examToRelease);
    } else {
      fetch(`/api/exams/${examId}/release`, {
        method: 'POST'
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert("Examination has been officially released! Registration is now OPEN for all eligible students.");
            loadData();
          }
        })
        .catch(err => console.error("Error releasing exam:", err));
    }
  };

  const handleTogglePublishResults = (examId: string, currentPublished: boolean) => {
    fetch('/api/exams/publish-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examId, publish: !currentPublished })
    })
      .then(res => res.json())
      .then(() => {
        loadData();
      })
      .catch(err => console.error("Error toggling results publish:", err));
  };

  // Slot Management Handlers (Spec #4)
  const handleOpenSlotModal = (exam: Exam) => {
    setSelectedExamForSlots(exam);
    setShowSlotModal(true);
  };

  const handleAddSlotToExam = () => {
    if (!selectedExamForSlots) return;
    const newSlot: ExamSlot = {
      id: "slot-" + Date.now(),
      examId: selectedExamForSlots.id,
      date: newSlotDate,
      startTime: newSlotStartTime,
      endTime: newSlotEndTime,
      capacity: newSlotCapacity,
      bookedCount: 0,
      status: 'available'
    };

    const updatedSlots = [...(selectedExamForSlots.slots || []), newSlot];
    fetch(`/api/exams/${selectedExamForSlots.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slots: updatedSlots })
    })
      .then(res => res.json())
      .then(updated => {
        setSelectedExamForSlots(updated);
        loadData();
      });
  };

  const handleDeleteSlotFromExam = (slotId: string) => {
    if (!selectedExamForSlots) return;
    const updatedSlots = (selectedExamForSlots.slots || []).filter(s => s.id !== slotId);
    fetch(`/api/exams/${selectedExamForSlots.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slots: updatedSlots })
    })
      .then(res => res.json())
      .then(updated => {
        setSelectedExamForSlots(updated);
        loadData();
      });
  };

  // Human College Recommendations Handlers (Spec #14)
  const handleOpenRecModal = (student: Student) => {
    setSelectedStudentForRec(student);
    setShowAdminRecModal(true);
    setAdminRecToast('');
    setAdminRecNote(`Recommended based on merit and performance in 12th (${student.marks12th}%).`);
    // Load student's existing recommendations
    fetch(`/api/recommendations/${student.id}`)
      .then(res => res.json())
      .then(data => setStudentRecs(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error loading student recs:", err));
  };

  const handleAddAdminRec = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForRec || !adminRecCollegeId) return;
    setAdminRecSubmitting(true);

    fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: selectedStudentForRec.id,
        collegeId: adminRecCollegeId,
        recommendedBy: userName || 'Central Admissions Board',
        recommendedRole: userRole || 'admin',
        note: adminRecNote.trim()
      })
    })
      .then(res => res.json())
      .then(data => {
        setAdminRecSubmitting(false);
        if (data.success && data.recommendation) {
          setStudentRecs(prev => [data.recommendation, ...prev]);
          setAdminRecCollegeId('');
          setAdminRecToast('Campus recommendation successfully dispatched to student!');
          setTimeout(() => setAdminRecToast(''), 3000);
        }
      })
      .catch(err => {
        console.error("Error creating recommendation:", err);
        setAdminRecSubmitting(false);
      });
  };

  const handleDeleteAdminRec = (recId: string) => {
    fetch(`/api/recommendations/${recId}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStudentRecs(prev => prev.filter(r => r.id !== recId));
        }
      })
      .catch(err => console.error("Error deleting recommendation:", err));
  };

  // Send Notification
  const handleNotifSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notifForm)
    })
      .then(() => {
        setShowNotifModal(false);
        setNotifForm({ title: '', message: '', type: 'info', targetStudentId: '' });
        alert("Notification dispatched successfully!");
        loadData();
      });
  };

  const handleUpdateStudentStatus = (id: string, status: any) => {
    fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admissionStatus: status })
    })
      .then(() => loadData());
  };

  const handleResetPassword = (id: string) => {
    fetch(`/api/students/${id}/reset-password`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        alert(`Credentials Reset! New Password is: ${data.newPassword}`);
      });
  };

  // Filtered Attempts List
  const filteredAttempts = attempts.filter(att => {
    const q = (attemptSearch || '').toLowerCase().trim();
    const matchesSearch = !q ||
      (att.studentName || '').toLowerCase().includes(q) ||
      (att.studentId || '').toLowerCase().includes(q) ||
      (att.examTitle || '').toLowerCase().includes(q) ||
      (att.studentCourse || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (attemptFilter === 'pending') {
      return att.evaluationStatus === 'Pending Review' || !att.evaluatorRemarks;
    }
    if (attemptFilter === 'graded') {
      return att.evaluationStatus === 'Graded & Verified';
    }
    if (attemptFilter === 'passed') {
      return att.passed;
    }
    if (attemptFilter === 'failed') {
      return !att.passed;
    }
    return true;
  });

  const pendingEvaluationsCount = attempts.filter(a => a.evaluationStatus === 'Pending Review' || !a.evaluatorRemarks).length;

  // Colors for Recharts Pie
  const COLORS = ['#0B192C', '#FFC107', '#10B981', '#EC4899', '#8B5CF6'];

  // Construct unified Attendance & Assessment records combining students, registrations, and exam attempts
  const combinedReportRecords = students.map((student, idx) => {
    const assignedExam = exams.find(e => e.id === student.assignedExamId) || exams[0];
    const attempt = attempts.find(a => a.studentId === student.id || (student.email && a.studentEmail === student.email));
    
    const hasAttempt = !!attempt;
    const isPassed = hasAttempt ? attempt.passed : false;
    const scoreVal = hasAttempt ? attempt.score : 0;
    const maxScoreVal = hasAttempt ? (attempt.maxScore || 10) : 10;
    const percentageVal = hasAttempt ? (attempt.percentage || Math.round((scoreVal / maxScoreVal) * 100)) : 0;
    
    // Attendance status calculation
    let attendanceStatus: 'Present' | 'Scheduled' | 'Absent' = 'Scheduled';
    if (hasAttempt) {
      attendanceStatus = 'Present';
    } else if (student.assignedExamId) {
      attendanceStatus = 'Scheduled';
    }

    return {
      candidateId: student.id,
      name: student.fullName,
      email: student.email,
      mobile: student.mobile || '—',
      course: student.interestedCourse || 'Engineering (B.Tech)',
      preferredState: student.preferredState || 'National',
      assignedCounsellor: student.assignedCounsellor || 'Dr. Lakshmi Prasad',
      admissionStatus: student.admissionStatus,
      examId: student.assignedExamId || assignedExam?.id || 'exam-aptitude-01',
      examTitle: attempt?.examTitle || assignedExam?.title || 'National Aptitude & Career Assessment Test (NACAT)',
      examDate: assignedExam?.date || '2026-07-20',
      examTime: assignedExam?.startTime || '10:00 AM',
      attendanceStatus,
      hasAttempt,
      score: scoreVal,
      maxScore: maxScoreVal,
      scoreDisplay: hasAttempt ? `${scoreVal}` : '—',
      maxScoreDisplay: hasAttempt ? `${maxScoreVal}` : '—',
      percentage: percentageVal,
      percentageDisplay: hasAttempt ? `${percentageVal}%` : '—',
      isPassed,
      resultStatus: hasAttempt ? (isPassed ? 'PASSED' : 'RETAKE REQD') : 'PENDING EXAM',
      evaluationStatus: attempt?.evaluationStatus || (hasAttempt ? 'Graded & Verified' : 'Awaiting Attempt'),
      evaluatorRemarks: attempt?.evaluatorRemarks || '—',
      evaluatorName: attempt?.evaluatorName || 'Dr. Lakshmi Prasad (Chief Examiner)',
      attemptedAt: attempt?.attemptedAt ? new Date(attempt.attemptedAt).toLocaleDateString() : '—'
    };
  });

  // Include any extra attempts that might not have a direct student profile match
  attempts.forEach(att => {
    const alreadyIncluded = combinedReportRecords.some(r => r.candidateId === att.studentId);
    if (!alreadyIncluded && att.studentId) {
      combinedReportRecords.push({
        candidateId: att.studentId,
        name: att.studentName || 'Aryan Sharma',
        email: att.studentEmail || 'aryan@example.com',
        mobile: '9876543210',
        course: att.studentCourse || 'Engineering (B.Tech)',
        preferredState: 'National',
        assignedCounsellor: 'Dr. Lakshmi Prasad',
        admissionStatus: 'Exam Completed',
        examId: att.examId,
        examTitle: att.examTitle || 'National Aptitude & Career Assessment Test (NACAT)',
        examDate: '2026-07-15',
        examTime: '10:00 AM',
        attendanceStatus: 'Present',
        hasAttempt: true,
        score: att.score,
        maxScore: att.maxScore || 10,
        scoreDisplay: `${att.score}`,
        maxScoreDisplay: `${att.maxScore || 10}`,
        percentage: att.percentage || Math.round((att.score / (att.maxScore || 10)) * 100),
        percentageDisplay: `${att.percentage || Math.round((att.score / (att.maxScore || 10)) * 100)}%`,
        isPassed: att.passed,
        resultStatus: att.passed ? 'PASSED' : 'RETAKE REQD',
        evaluationStatus: att.evaluationStatus || 'Graded & Verified',
        evaluatorRemarks: att.evaluatorRemarks || 'Candidate exhibited strong technical aptitude in core subjects.',
        evaluatorName: att.evaluatorName || 'Dr. Lakshmi Prasad (Chief Examiner)',
        attemptedAt: att.attemptedAt ? new Date(att.attemptedAt).toLocaleDateString() : '—'
      });
    }
  });

  // Filtered displayed records based on search and filters
  const displayedReportRecords = combinedReportRecords.filter(rec => {
    const q = (reportSearch || '').toLowerCase().trim();
    const matchesSearch = !q ||
      rec.name.toLowerCase().includes(q) ||
      rec.candidateId.toLowerCase().includes(q) ||
      rec.email.toLowerCase().includes(q) ||
      rec.course.toLowerCase().includes(q) ||
      rec.examTitle.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (reportCourseFilter !== 'all' && !rec.course.toLowerCase().includes(reportCourseFilter.toLowerCase())) {
      return false;
    }

    if (reportStatusFilter === 'present' && rec.attendanceStatus !== 'Present') return false;
    if (reportStatusFilter === 'absent' && rec.attendanceStatus === 'Present') return false;
    if (reportStatusFilter === 'passed' && (!rec.hasAttempt || !rec.isPassed)) return false;
    if (reportStatusFilter === 'failed' && (!rec.hasAttempt || rec.isPassed)) return false;

    return true;
  });

  // Export Attendance & Assessment Formatted PDF Document
  const exportAttendanceAssessmentPDF = (exportType: 'all' | 'attendance' | 'assessment' = 'all') => {
    setIsExportingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const now = new Date();
      const timestamp = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      const docRef = `EC-REP-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      // Top Header Banner
      doc.setFillColor(10, 25, 47); // Dark navy #0A192F
      doc.rect(0, 0, pageWidth, 28, 'F');

      // Accent line
      doc.setFillColor(255, 193, 7); // Amber #FFC107
      doc.rect(0, 28, pageWidth, 2, 'F');

      // Logo / Emblem Text
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('EDUCONNECT INDIA', 14, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(203, 213, 225);
      doc.text('NATIONAL HIGHER EDUCATION ADMISSIONS & APTITUDE ASSESSMENT COUNCIL', 14, 18);
      doc.text('Ministry of Education Recognized Autonomous Directorate | ISO 9001:2015 Certified Portal', 14, 23);

      // Reference & Date (Right aligned in header)
      doc.setFontSize(7.5);
      doc.setTextColor(254, 240, 138); // Soft yellow
      doc.text(`DOC REF: ${docRef}`, pageWidth - 14, 12, { align: 'right' });
      doc.setTextColor(226, 232, 240);
      doc.text(`GENERATED: ${timestamp}`, pageWidth - 14, 18, { align: 'right' });
      doc.text(`ISSUED BY: ${userName} (${userRole.toUpperCase()})`, pageWidth - 14, 23, { align: 'right' });

      // Document Title Banner
      let titleText = 'OFFICIAL COMPREHENSIVE ATTENDANCE & ASSESSMENT MERIT RECORD';
      let subtitleText = 'Consolidated Institutional Report: Roll Attendance, Test Verification, and Performance Analytics';
      if (exportType === 'attendance') {
        titleText = 'OFFICIAL EXAMINATION ATTENDANCE & ROLL CALL REGISTER';
        subtitleText = 'Candidate Examination Hall Presence, Verification Credentials, and Biometric / Proctor Status';
      } else if (exportType === 'assessment') {
        titleText = 'NATIONAL APTITUDE & CAREER ASSESSMENT (NACAT) SCORECARD RECORD';
        subtitleText = 'Candidate Merit List, Sectional Marks Breakdown, Evaluation Outcome, and Admission Status';
      }

      doc.setTextColor(11, 25, 44);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(titleText, 14, 37);

      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(subtitleText, 14, 42);

      // Summary Statistics Cards (Metrics Bar)
      const totalStudentsCount = combinedReportRecords.length;
      const presentCount = combinedReportRecords.filter(r => r.attendanceStatus === 'Present').length;
      const passedCount = combinedReportRecords.filter(r => r.isPassed).length;
      const evaluatedCount = combinedReportRecords.filter(r => r.hasAttempt).length;
      const attendanceRate = totalStudentsCount ? Math.round((presentCount / totalStudentsCount) * 100) : 0;
      const passRate = evaluatedCount ? Math.round((passedCount / evaluatedCount) * 100) : 0;

      // Draw KPI Summary Block
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, 46, pageWidth - 28, 17, 2, 2, 'FD');

      const cardWidth = (pageWidth - 28) / 4;
      const kpis = [
        { label: 'TOTAL CANDIDATES', val: `${totalStudentsCount} Registered` },
        { label: 'EXAM ATTENDANCE', val: `${presentCount} / ${totalStudentsCount} (${attendanceRate}%)` },
        { label: 'ASSESSMENTS GRADED', val: `${evaluatedCount} Verified` },
        { label: 'OVERALL PASS RATE', val: `${passRate}% Qualified` },
      ];

      kpis.forEach((kpi, idx) => {
        const xPos = 14 + (idx * cardWidth) + 4;
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text(kpi.label, xPos, 52);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(kpi.val, xPos, 58);

        if (idx < 3) {
          doc.setDrawColor(226, 232, 240);
          doc.line(14 + ((idx + 1) * cardWidth), 48, 14 + ((idx + 1) * cardWidth), 61);
        }
      });

      // Generate Table Rows based on exportType
      let tableHead: string[][] = [];
      let tableBody: (string | number)[][] = [];

      if (exportType === 'attendance') {
        tableHead = [['#', 'Student ID', 'Candidate Name & Email', 'Contact', 'Course Stream', 'Exam Schedule', 'Attendance Status', 'Verification']];
        tableBody = displayedReportRecords.map((rec, i) => [
          i + 1,
          rec.candidateId,
          `${rec.name}\n${rec.email}`,
          rec.mobile || '—',
          rec.course,
          `${rec.examTitle}\nDate: ${rec.examDate}`,
          rec.attendanceStatus,
          rec.attendanceStatus === 'Present' ? 'VERIFIED (Online Proctor)' : 'Pending Hall Roll'
        ]);
      } else if (exportType === 'assessment') {
        tableHead = [['#', 'Student ID', 'Candidate Name', 'Course', 'Assessment Title', 'Score', 'Max', '%', 'Result', 'Evaluator Verification']];
        tableBody = displayedReportRecords.map((rec, i) => [
          i + 1,
          rec.candidateId,
          rec.name,
          rec.course,
          rec.examTitle,
          rec.scoreDisplay,
          rec.maxScoreDisplay,
          rec.percentageDisplay,
          rec.resultStatus,
          rec.evaluatorRemarks !== '—' ? `${rec.evaluatorName}\n"${rec.evaluatorRemarks}"` : 'Pending Review'
        ]);
      } else {
        tableHead = [['#', 'Student ID', 'Candidate Name & Email', 'Course Stream', 'Exam Title', 'Attendance', 'Score', '%', 'Result']];
        tableBody = displayedReportRecords.map((rec, i) => [
          i + 1,
          rec.candidateId,
          `${rec.name}\n${rec.email}`,
          rec.course,
          rec.examTitle,
          rec.attendanceStatus,
          rec.scoreDisplay,
          rec.percentageDisplay,
          rec.resultStatus
        ]);
      }

      autoTable(doc, {
        startY: 67,
        head: tableHead,
        body: tableBody,
        theme: 'grid',
        headStyles: {
          fillColor: [10, 25, 47],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7.5,
          halign: 'left'
        },
        styles: {
          fontSize: 7,
          cellPadding: 2.8,
          textColor: [30, 41, 59],
          lineColor: [226, 232, 240],
          lineWidth: 0.2
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 24, fontStyle: 'bold' }
        },
        didDrawPage: () => {
          const str = `Page ${doc.getNumberOfPages()} | Official Report generated by NEXORA Portal | Reference: ${docRef}`;
          doc.setFontSize(6.5);
          doc.setTextColor(148, 163, 184);
          doc.text(str, 14, pageHeight - 8);
          doc.text('CONFIDENTIAL & PROPRIETARY', pageWidth - 14, pageHeight - 8, { align: 'right' });
        }
      });

      // Verification & Signature Block
      const lastTable = (doc as any).lastAutoTable;
      const finalY = lastTable ? lastTable.finalY + 8 : 180;
      if (finalY < pageHeight - 35) {
        doc.setDrawColor(203, 213, 225);
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(14, finalY, pageWidth - 28, 22, 2, 2, 'FD');

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('OFFICIAL ATTESTATION & ADMISSIONS CERTIFICATION', 18, finalY + 5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(100, 116, 139);
        doc.text('This digital attendance and assessment summary has been verified against the NEXORA National Central Database.', 18, finalY + 9);

        // Signature 1
        doc.line(22, finalY + 16, 75, finalY + 16);
        doc.setFont('helvetica', 'bold');
        doc.text('Dr. Lakshmi Prasad', 22, finalY + 19);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.5);
        doc.text('Chief Examination Controller', 22, finalY + 21);

        // Signature 2
        doc.line(pageWidth - 75, finalY + 16, pageWidth - 22, finalY + 16);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.text(userName, pageWidth - 75, finalY + 19);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.5);
        doc.text(`Authorized Signatory (${userRole.toUpperCase()})`, pageWidth - 75, finalY + 21);
      }

      const filePrefix = exportType === 'attendance' ? 'NEXORA_Attendance_Register' : exportType === 'assessment' ? 'NEXORA_Assessment_Scorecards' : 'NEXORA_Attendance_Assessment_Report';
      const filename = `${filePrefix}_${now.toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);
      setPdfExportToast(`Successfully exported formatted PDF document: "${filename}"`);
      setTimeout(() => setPdfExportToast(''), 6000);
    } catch (err) {
      console.error('Error generating PDF report:', err);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Export Individual Student Scorecard PDF
  const exportSingleStudentScorecardPDF = (rec: any) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFillColor(10, 25, 47);
      doc.rect(0, 0, pageWidth, 28, 'F');
      doc.setFillColor(255, 193, 7);
      doc.rect(0, 28, pageWidth, 2, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('EDUCONNECT INDIA', 14, 12);
      doc.setFontSize(7.5);
      doc.setTextColor(203, 213, 225);
      doc.text('NATIONAL ADMISSIONS & APTITUDE ASSESSMENT COUNCIL', 14, 18);
      doc.text('OFFICIAL CANDIDATE EVALUATION TRANSCRIPT & SCORECARD', 14, 23);

      doc.setTextColor(11, 25, 44);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`CANDIDATE ASSESSMENT TRANSCRIPT: ${rec.name.toUpperCase()}`, 14, 38);

      autoTable(doc, {
        startY: 44,
        head: [['Transcript Field', 'Candidate Examination Record']],
        body: [
          ['Candidate Student ID', rec.candidateId],
          ['Full Name', rec.name],
          ['Email Address', rec.email],
          ['Contact Mobile', rec.mobile || '—'],
          ['Enrolled Course / Stream', rec.course],
          ['Assigned Examination', rec.examTitle],
          ['Examination Schedule', `${rec.examDate} (${rec.examTime})`],
          ['Hall Attendance Status', rec.attendanceStatus],
          ['Score Achieved', `${rec.scoreDisplay} / ${rec.maxScoreDisplay}`],
          ['Percentage Marks', rec.percentageDisplay],
          ['Result Status', rec.resultStatus],
          ['Evaluation Status', rec.evaluationStatus],
          ['Chief Examiner Evaluation', rec.evaluatorRemarks !== '—' ? `${rec.evaluatorName} - "${rec.evaluatorRemarks}"` : 'Pending Verification']
        ],
        theme: 'striped',
        headStyles: { fillColor: [10, 25, 47], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3.5 }
      });

      doc.save(`Scorecard_${rec.candidateId}_${rec.name.replace(/\s+/g, '_')}.pdf`);
      setPdfExportToast(`Scorecard PDF for "${rec.name}" downloaded.`);
      setTimeout(() => setPdfExportToast(''), 5000);
    } catch (e) {
      console.error('Error generating student scorecard PDF:', e);
    }
  };

  return (
    <div className="flex bg-slate-50 h-screen overflow-hidden text-slate-800 font-sans" id="admin-panel-root">
      
      {/* ADMIN SIDEBAR (Smooth Scrolling with Pinned Header & Footer) */}
      <aside className="w-64 bg-[#0A192F] text-slate-300 shrink-0 flex flex-col h-full max-h-screen shadow-2xl border-r border-slate-800/80" id="admin-sidebar">
        {/* Logo header - Pinned at top */}
        <div className="p-5 pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <NexoraEmblem sizePx={40} className="shadow-md" />
            <div>
              <span className="text-lg font-black tracking-tight text-white block leading-none">NEXORA</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 font-mono mt-1 block">
                {userRole === 'super_admin' ? 'Super Admin Desk' : 'Admin Operations Desk'}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Menu - Scrollable to the bottom */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3.5 py-3 space-y-1.5 overscroll-contain dark-sidebar-scroll" id="admin-nav-scroll-container">
          <nav className="space-y-1.5 pb-6" id="admin-nav-menu">
            <button 
              id="admin-nav-dashboard"
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-[#1E3A8A]/70 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5 text-amber-400 shrink-0" />
              <span className="truncate">Dashboard Overview</span>
            </button>

            {/* SUPER ADMIN & ADMIN: USER ROLES MANAGEMENT */}
            <button 
              id="admin-nav-users"
              onClick={() => setActiveTab('users')} 
              className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'users' ? 'bg-[#1E3A8A]/70 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ShieldCheck className="h-4.5 w-4.5 text-purple-400 shrink-0" />
              <span className="truncate">User Roles & Staff</span>
              <span className="ml-auto bg-purple-500/20 text-purple-300 font-black text-[10px] px-2 py-0.5 rounded-full border border-purple-500/30 shrink-0">
                {users.length}
              </span>
            </button>

            {/* COUNSELORS TEAM & ALLOCATIONS */}
            <button 
              id="admin-nav-counsellors"
              onClick={() => setActiveTab('counsellors')} 
              className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'counsellors' ? 'bg-[#1E3A8A]/70 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Users className="h-4.5 w-4.5 text-blue-400 shrink-0" />
              <span className="truncate">Counselor Allocations</span>
              <span className="ml-auto bg-blue-500/20 text-blue-300 font-black text-[10px] px-2 py-0.5 rounded-full border border-blue-500/30 shrink-0">
                {counsellors.length}
              </span>
            </button>

            <button 
              id="admin-nav-registrations"
              onClick={() => setActiveTab('registrations')} 
              className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'registrations' ? 'bg-[#1E3A8A]/70 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <UserCheck className="h-4.5 w-4.5 shrink-0" />
              <span className="truncate">Registrations</span>
              <span className="ml-auto bg-emerald-500/20 text-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                {registrations.length}
              </span>
            </button>

            <button 
              id="admin-nav-evaluations"
              onClick={() => setActiveTab('evaluations')} 
              className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'evaluations' ? 'bg-[#1E3A8A]/70 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FileCheck className="h-4.5 w-4.5 shrink-0" />
              <span className="truncate">Test Reviews & Marks</span>
              {pendingEvaluationsCount > 0 && (
                <span className="ml-auto bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shrink-0">
                  {pendingEvaluationsCount}
                </span>
              )}
            </button>

            <button 
              id="admin-nav-students"
              onClick={() => setActiveTab('students')} 
              className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'students' ? 'bg-[#1E3A8A]/70 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <User className="h-4.5 w-4.5 shrink-0" />
              <span className="truncate">Active Students</span>
            </button>

            <button 
              id="admin-nav-exams"
              onClick={() => setActiveTab('exams')} 
              className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'exams' ? 'bg-[#1E3A8A]/70 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FileText className="h-4.5 w-4.5 shrink-0" />
              <span className="truncate">Exam Management</span>
            </button>

            <button 
              id="admin-nav-colleges"
              onClick={() => setActiveTab('colleges')} 
              className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'colleges' ? 'bg-[#1E3A8A]/70 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Building className="h-4.5 w-4.5 shrink-0" />
              <span className="truncate">Campuses Partner</span>
            </button>

            <button 
              id="admin-nav-reports"
              onClick={() => setActiveTab('reports')} 
              className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'reports' ? 'bg-[#1E3A8A]/70 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <BarChart2 className="h-4.5 w-4.5 shrink-0" />
              <span className="truncate">Analytical Reports</span>
            </button>

            {/* ADMIN-ONLY SECURITY & PASSWORD RESET LOGS */}
            {(userRole === 'super_admin' || userRole === 'admin') && (
              <button 
                id="admin-nav-password-resets"
                onClick={() => setActiveTab('password-resets')} 
                className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'password-resets' ? 'bg-[#1E3A8A]/70 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Key className="h-4.5 w-4.5 text-amber-400 shrink-0" />
                <span className="truncate">Password Reset Logs</span>
                {passwordResetLogs.length > 0 && (
                  <span className="ml-auto bg-amber-500/20 text-amber-300 font-black text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
                    {passwordResetLogs.length}
                  </span>
                )}
              </button>
            )}

            {/* ROLES & RESPONSIBILITIES TAB (User Req #3 & Architecture) */}
            <button 
              id="admin-nav-roles"
              onClick={() => setActiveTab('roles')} 
              className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'roles' ? 'bg-[#1E3A8A]/70 text-white font-bold border-l-4 border-amber-400 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ShieldCheck className="h-4.5 w-4.5 text-amber-400 shrink-0" />
              <span className="truncate">Roles & Responsibilities</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Logout Footer - Pinned at bottom */}
        <div className="p-4 border-t border-slate-800 shrink-0 bg-[#0A192F]">
          <button 
            onClick={onLogout}
            className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="truncate">Logout ({userName.split(' ')[0]})</span>
          </button>
        </div>
      </aside>

      {/* ADMIN MAIN WORKSPACE */}
      <main className="flex-1 overflow-y-auto p-8" id="admin-main-workspace">
        {/* Workspace Header status */}
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md tracking-wider font-mono ${
                userRole === 'super_admin' ? 'bg-purple-100 text-purple-800 border border-purple-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {userRole === 'super_admin' ? 'SUPER ADMIN PRIVILEGES' : 'ADMIN PRIVILEGES'}
              </span>
              <span className="text-xs text-slate-400 font-semibold">• Logged in as <strong className="text-slate-800">{userName}</strong></span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 capitalize mt-1">{activeTab} Controls</h1>
          </div>

          <div className="flex items-center gap-3">
            {userRole === 'super_admin' && (
              <button 
                onClick={() => {
                  setUserForm({
                    fullName: '',
                    username: '',
                    email: '',
                    password: '',
                    role: 'admin',
                    mobile: '',
                    specialization: ''
                  });
                  setShowUserModal(true);
                }}
                className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <UserPlus className="h-4 w-4" />
                Add User Account
              </button>
            )}
            {/* Firestore Database Live Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl text-[11px] font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Firestore Live</span>
            </div>

            {/* Data Persistence & Backup Controls */}
            <div className="hidden sm:flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200">
              <button 
                onClick={handleForceSync}
                disabled={isSyncingBackup}
                title="Force bi-directional database sync between browser storage and server"
                className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 hover:text-emerald-900 border border-emerald-200/80 font-bold text-[11px] rounded-lg flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
              >
                <RefreshCw className={`h-3 w-3 text-emerald-600 ${isSyncingBackup ? 'animate-spin' : ''}`} />
                <span>Sync DB</span>
              </button>
              <button 
                onClick={handleExportBackup}
                title="Download complete database JSON backup file to your computer"
                className="px-2.5 py-1.5 bg-white hover:bg-blue-50 text-blue-800 hover:text-blue-900 border border-blue-200/80 font-bold text-[11px] rounded-lg flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
              >
                <Download className="h-3 w-3 text-blue-600" />
                <span>Backup</span>
              </button>
              <button 
                onClick={() => backupFileInputRef.current?.click()}
                title="Upload and restore full database from JSON backup file"
                className="px-2.5 py-1.5 bg-white hover:bg-purple-50 text-purple-800 hover:text-purple-900 border border-purple-200/80 font-bold text-[11px] rounded-lg flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
              >
                <UploadCloud className="h-3 w-3 text-purple-600" />
                <span>Restore</span>
              </button>
              <input 
                type="file" 
                ref={backupFileInputRef} 
                onChange={handleImportBackup} 
                accept=".json" 
                className="hidden" 
              />
            </div>

            <button 
              onClick={() => {
                setShowNotifModal(true);
              }}
              className="px-4 py-2 bg-[#0B192C] hover:bg-[#1E293B] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
            >
              <MessageSquare className="h-4 w-4 text-amber-400" />
              Dispatch Announcement
            </button>
            <button 
              onClick={loadData}
              title="Refresh all data"
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className="h-4.5 w-4.5" />
            </button>
          </div>
        </header>

        {/* Global Persistence Feedback Toast */}
        {backupSyncToast && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              {backupSyncToast}
            </span>
            <button onClick={() => setBackupSyncToast('')} className="text-emerald-700 hover:text-emerald-950 ml-2">×</button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 space-y-4">
            <RefreshCw className="h-10 w-10 text-[#0B192C] animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Syncing Database...</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* TAB 1: OVERVIEW DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8" id="admin-tab-dashboard">
                {/* Aggregate cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-[#0B192C]/5 text-[#0B192C] flex items-center justify-center font-bold">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Active Students</span>
                      <span className="text-xl font-black text-slate-900">{reports?.cards?.totalStudents || 0}</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab('registrations')}
                    className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-emerald-300 transition-all"
                  >
                    <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Registrations</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-slate-900">{registrations.length}</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Auto-Approved</span>
                      </div>
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab('evaluations')}
                    className="bg-amber-50/70 border border-amber-200/80 p-5 rounded-3xl shadow-sm flex items-center gap-4 cursor-pointer hover:bg-amber-100/60 transition-all"
                  >
                    <div className="h-11 w-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-800 font-extrabold uppercase tracking-wider block">Test Reviews Pending</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-slate-950">{pendingEvaluationsCount}</span>
                        {pendingEvaluationsCount > 0 && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-900 font-bold px-1.5 py-0.5 rounded">Action Needed</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-purple-500/5 text-purple-500 flex items-center justify-center font-bold">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Assessments</span>
                      <span className="text-xl font-black text-slate-900">{reports?.cards?.activeExams || 0}</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-emerald-500/5 text-emerald-500 flex items-center justify-center font-bold">
                      <Building className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Campuses</span>
                      <span className="text-xl font-black text-slate-900">{reports?.cards?.partnerColleges || 0}</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab('password-resets')}
                    className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-amber-300 transition-all"
                  >
                    <div className="h-11 w-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                      <Key className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Password Resets</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-slate-900">{passwordResetLogs.length}</span>
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">Logs</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main sections block */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Test Submissions Review Queue */}
                  <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-amber-500" />
                          Student Exam Submissions Awaiting Evaluation
                        </h3>
                        <p className="text-[11px] text-slate-400">Review answers, adjust scores, add evaluator feedback, and publish marks.</p>
                      </div>
                      <button onClick={() => setActiveTab('evaluations')} className="text-xs text-[#0B192C] font-bold hover:underline">View All ({attempts.length})</button>
                    </div>

                    <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                      {attempts.slice(0, 5).map(att => (
                        <div key={`${att.studentId}-${att.examId}`} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{att.studentName}</h4>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                att.evaluationStatus === 'Graded & Verified' ? 'bg-emerald-100 text-emerald-800' :
                                att.evaluationStatus === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                                'bg-amber-100 text-amber-900 border border-amber-200'
                              }`}>
                                {att.evaluationStatus || 'Pending Review'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Exam: <span className="font-bold text-slate-800">{att.examTitle}</span> | Stream: {att.studentCourse}
                            </p>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                              <span>Score: <strong className="text-slate-700">{att.score}/{att.maxScore || 10} ({att.percentage}%)</strong></span>
                              <span>Submitted: {new Date(att.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button 
                              onClick={() => handleOpenReviewModal(att)}
                              className="px-3.5 py-2 bg-[#0B192C] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                            >
                              <ClipboardCheck className="h-3.5 w-3.5 text-amber-400" />
                              Review & Grade
                            </button>
                          </div>
                        </div>
                      ))}
                      {attempts.length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-12">No student exam attempts found in the database yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Active exam publish status */}
                  <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm pb-2 border-b border-slate-100">National Exam Publication Master Key</h3>
                    <div className="space-y-4">
                      {exams.map(ex => (
                        <div key={ex.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 space-y-4">
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#0B192C] block font-mono">Assigned Entrance Test</span>
                            <h4 className="text-xs font-extrabold text-slate-900 leading-normal">{ex.title}</h4>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-semibold">Results Status</span>
                            {resultsPublished[ex.id] ? (
                              <button 
                                onClick={() => handlePublishResults(ex.id, false)}
                                className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg hover:bg-emerald-200 text-[10px]"
                              >
                                Published (Click to Hide)
                              </button>
                            ) : (
                              <button 
                                onClick={() => handlePublishResults(ex.id, true)}
                                className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-600 text-[10px]"
                              >
                                Locked (Click to Publish)
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: USER ROLES & STAFF MANAGEMENT (SUPER ADMIN & ADMIN) */}
            {activeTab === 'users' && (
              <div className="space-y-6" id="admin-tab-users">
                {/* User Action Feedback Toast */}
                {userActionToast && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{userActionToast}</span>
                    </div>
                    <button 
                      onClick={() => setUserActionToast('')} 
                      className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Top Summary & Action Bar */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-purple-600" />
                      User Roles & Staff Authorization Directory
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Manage all platform accounts across all 4 system roles: Super Admin, Admin, Counselor, and Student. Suspend or delete users with real-time enforcement.
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      setUserForm({
                        fullName: '',
                        username: '',
                        email: '',
                        password: '',
                        role: userRole === 'super_admin' ? 'admin' : 'counsellor',
                        mobile: '',
                        specialization: 'Admissions & Engineering Counseling'
                      });
                      setShowUserModal(true);
                    }}
                    className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all self-start md:self-auto cursor-pointer"
                  >
                    <UserPlus className="h-4 w-4" />
                    Create New User Account
                  </button>
                </div>

                {/* Role Stat Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-purple-50/70 border border-purple-200/80 p-4 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block">Super Admins</span>
                    <span className="text-xl font-black text-purple-950 mt-1 block">
                      {users.filter(u => u.role === 'super_admin').length}
                    </span>
                  </div>
                  <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">Admins</span>
                    <span className="text-xl font-black text-amber-950 mt-1 block">
                      {users.filter(u => u.role === 'admin').length}
                    </span>
                  </div>
                  <div className="bg-blue-50/70 border border-blue-200/80 p-4 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#0057D9] block">Counselors</span>
                    <span className="text-xl font-black text-blue-950 mt-1 block">
                      {users.filter(u => u.role === 'counsellor').length}
                    </span>
                  </div>
                  <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">Students</span>
                    <span className="text-xl font-black text-emerald-950 mt-1 block">
                      {users.filter(u => u.role === 'student').length}
                    </span>
                  </div>
                </div>

                {/* Search and Role Filter */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search by full name, username, email, phone..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-600"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {['all', 'super_admin', 'admin', 'counsellor', 'student'].map(r => (
                        <button
                          key={r}
                          onClick={() => setUserRoleFilter(r)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase cursor-pointer ${
                            userRoleFilter === r 
                              ? 'bg-slate-900 text-white' 
                              : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {r === 'all' ? `All (${users.length})` : r.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Users Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold">
                          <th className="pb-3 font-semibold">User & Username</th>
                          <th className="pb-3 font-semibold">System Role</th>
                          <th className="pb-3 font-semibold">Contact Details</th>
                          <th className="pb-3 font-semibold">Specialization / Scope</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {users
                          .filter(u => {
                            const q = (userSearch || '').toLowerCase().trim();
                            const matchSearch = !q ||
                              (u.fullName || '').toLowerCase().includes(q) ||
                              (u.username || '').toLowerCase().includes(q) ||
                              (u.email || '').toLowerCase().includes(q);
                            const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
                            return matchSearch && matchRole;
                          })
                          .map((usr) => {
                            const isMasterSuperAdmin = usr.username === 'superadmin' || usr.id === 'usr-superadmin';
                            const isProtectedFromAdmin = userRole === 'admin' && usr.role === 'super_admin';
                            const canManage = !isMasterSuperAdmin && !isProtectedFromAdmin;
                            const isSuspended = usr.status === 'suspended' || usr.isSuspended;

                            return (
                              <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs ${
                                      usr.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                                      usr.role === 'admin' ? 'bg-amber-100 text-amber-800' :
                                      usr.role === 'counsellor' ? 'bg-blue-100 text-[#0057D9]' :
                                      'bg-emerald-100 text-emerald-800'
                                    }`}>
                                      {usr.fullName ? usr.fullName.charAt(0) : 'U'}
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-slate-900">{usr.fullName}</h4>
                                      <span className="text-[10px] text-slate-400 font-mono">@{usr.username}</span>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-4">
                                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                    usr.role === 'super_admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                    usr.role === 'admin' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                    usr.role === 'counsellor' ? 'bg-blue-100 text-[#0057D9] border border-blue-200' :
                                    'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  }`}>
                                    {usr.role.replace('_', ' ')}
                                  </span>
                                </td>

                                <td className="py-4">
                                  <div className="space-y-0.5">
                                    <p className="text-slate-800 font-medium">{usr.email || 'No email'}</p>
                                    {usr.mobile && <p className="text-[10px] text-slate-400 font-mono">{usr.mobile}</p>}
                                  </div>
                                </td>

                                <td className="py-4">
                                  <span className="text-slate-600 text-[11px] font-medium">
                                    {usr.specialization || (usr.role === 'student' ? 'Undergraduate Aspirant' : 'Full Platform Authority')}
                                  </span>
                                </td>

                                <td className="py-4">
                                  {isSuspended ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                                      <Ban className="h-3 w-3 text-rose-500 shrink-0" />
                                      <span>Suspended</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                      <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                                      <span>Active</span>
                                    </span>
                                  )}
                                </td>

                                <td className="py-4 text-right">
                                  {canManage ? (
                                    <div className="relative inline-block text-left">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenMenuUserId(openMenuUserId === usr.id ? null : usr.id);
                                        }}
                                        className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                                        title="User Actions Menu"
                                        aria-label="User actions menu"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </button>

                                      {/* Dropdown Menu */}
                                      {openMenuUserId === usr.id && (
                                        <>
                                          {/* Invisible clickaway backdrop */}
                                          <div 
                                            className="fixed inset-0 z-30 cursor-default" 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setOpenMenuUserId(null);
                                            }} 
                                          />

                                          <div 
                                            className="absolute right-0 mt-1 w-48 rounded-2xl bg-white shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <div className="px-3.5 py-1.5 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                              User Controls
                                            </div>

                                            {/* Suspend or Reactivate Option */}
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setOpenMenuUserId(null);
                                                handleToggleSuspendUser(usr);
                                              }}
                                              className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                                                isSuspended
                                                  ? 'text-emerald-700 hover:bg-emerald-50'
                                                  : 'text-amber-700 hover:bg-amber-50'
                                              }`}
                                            >
                                              {isSuspended ? (
                                                <>
                                                  <PlayCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                                                  <span>Reactivate Account</span>
                                                </>
                                              ) : (
                                                <>
                                                  <PauseCircle className="h-4 w-4 text-amber-600 shrink-0" />
                                                  <span>Suspend Account</span>
                                                </>
                                              )}
                                            </button>

                                            {/* Delete Option */}
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setOpenMenuUserId(null);
                                                handleOpenDeleteUserModal(usr);
                                              }}
                                              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                            >
                                              <Trash2 className="h-4 w-4 text-rose-600 shrink-0" />
                                              <span>Delete Account</span>
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-bold italic px-2 py-1 bg-slate-100 rounded-md">
                                      Protected
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: COUNSELOR TEAM & STUDENT ALLOCATION DESK */}
            {activeTab === 'counsellors' && (
              <div className="space-y-6" id="admin-tab-counsellors">
                {/* Header overview */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Counselor Team & Student Allocation Desk
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Assign registered and tested students to expert counselors for admission guidance, document verification, and seat allocation.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-blue-50 text-blue-800 font-bold px-3 py-1.5 rounded-xl border border-blue-200">
                      Active Counselors: {counsellors.length}
                    </span>
                    <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
                      Total Students: {students.length}
                    </span>
                  </div>
                </div>

                {/* Counselor Roster Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {counsellors.map(c => {
                    const cName = c.fullName || (c as any).name || 'Academic Counselor';
                    const cId = c.id || '';
                    const assignedStudentsCount = students.filter(s => {
                      const assigned = (s.counsellorAssigned || (s as any).assignedCounsellor || '').toLowerCase();
                      return (cName && assigned.includes(cName.toLowerCase())) || (cId && assigned.includes(cId.toLowerCase()));
                    }).length;

                    return (
                      <div key={c.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all">
                        {/* Counselor Card Header with 3-Dots Action Menu */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#0057D9] flex items-center justify-center font-black text-base shrink-0">
                              {(cName || 'C').charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">{cName}</h4>
                              <span className="text-[10px] text-blue-700 font-bold block">{c.specialization || 'Career Guidance'}</span>
                              <span className="text-[9px] text-slate-400 font-mono">{c.rating ? `⭐ ${c.rating} / 5.0` : (c as any).experience || 'Verified Expert'}</span>
                            </div>
                          </div>

                          {/* 3-Dots Action Menu */}
                          {(() => {
                            const matchingUser = users.find(u => 
                              u.role === 'counsellor' && (
                                (u.email && c.email && u.email.toLowerCase() === c.email.toLowerCase()) || 
                                (u.fullName && cName && u.fullName.toLowerCase() === cName.toLowerCase()) ||
                                u.id === c.id
                              )
                            );
                            const isCounsellorSuspended = c.active === false || matchingUser?.status === 'suspended' || matchingUser?.isSuspended;

                            return (
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuCounsellorId(openMenuCounsellorId === c.id ? null : c.id);
                                  }}
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                                  title="Counselor Actions Menu"
                                  aria-label="Counselor actions menu"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>

                                {openMenuCounsellorId === c.id && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-30 cursor-default" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuCounsellorId(null);
                                      }} 
                                    />
                                    <div 
                                      className="absolute right-0 mt-1 w-48 rounded-2xl bg-white shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="px-3.5 py-1.5 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                        Counselor Controls
                                      </div>

                                      {/* Suspend or Reactivate */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenMenuCounsellorId(null);
                                          if (matchingUser) {
                                            handleToggleSuspendUser(matchingUser);
                                          } else {
                                            const newActive = isCounsellorSuspended;
                                            fetch(`/api/counsellors/${c.id}`, {
                                              method: 'PUT',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ active: newActive })
                                            }).then(() => loadData());
                                          }
                                        }}
                                        className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                                          isCounsellorSuspended ? 'text-emerald-700 hover:bg-emerald-50' : 'text-amber-700 hover:bg-amber-50'
                                        }`}
                                      >
                                        {isCounsellorSuspended ? (
                                          <>
                                            <PlayCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                                            <span>Reactivate Counselor</span>
                                          </>
                                        ) : (
                                          <>
                                            <PauseCircle className="h-4 w-4 text-amber-600 shrink-0" />
                                            <span>Suspend Counselor</span>
                                          </>
                                        )}
                                      </button>

                                      {/* Delete Option */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenMenuCounsellorId(null);
                                          if (matchingUser) {
                                            handleOpenDeleteUserModal(matchingUser);
                                          } else {
                                            if (confirm(`Are you sure you want to delete counselor ${cName}?`)) {
                                              fetch(`/api/counsellors/${c.id}`, { method: 'DELETE' }).then(() => loadData());
                                            }
                                          }
                                        }}
                                        className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="h-4 w-4 text-rose-600 shrink-0" />
                                        <span>Delete Counselor</span>
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
                          <div className="bg-slate-50 p-2 rounded-xl">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Assigned Mentees</span>
                            <span className="text-sm font-black text-slate-900">{assignedStudentsCount} Students</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Status</span>
                            <span className="text-xs font-bold text-emerald-700">{c.active !== false ? 'Available' : 'On Leave'}</span>
                          </div>
                        </div>

                        <div className="space-y-1 text-[11px] text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span>{c.email || 'counsellor@educonnect.in'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span className="font-mono">{c.mobile || (c as any).phone || '9876543210'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Student Allocation Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">Student Allocation Roster</h4>
                      <p className="text-xs text-slate-400">Click &apos;Assign Counselor&apos; to reallocate or attach a counselor to any student.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold">
                          <th className="pb-3 font-semibold">Student Name & ID</th>
                          <th className="pb-3 font-semibold">Target Stream & State</th>
                          <th className="pb-3 font-semibold">Assigned Counselor</th>
                          <th className="pb-3 font-semibold">Counselor Notes</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold text-right">Allocation Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {students.map((stu) => (
                          <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4">
                              <div>
                                <h4 className="font-bold text-slate-900">{stu.fullName}</h4>
                                <span className="text-[10px] text-slate-400 font-mono">{stu.id}</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <div>
                                <span className="font-bold text-[#0057D9]">{stu.interestedCourse}</span>
                                <span className="text-[10px] text-slate-400 block">{stu.preferredState}</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                                {stu.counsellorAssigned || 'Dr. Lakshmi Prasad'}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className="text-slate-500 text-[11px] truncate max-w-xs block">
                                {stu.counsellorNotes || 'Awaiting initial counseling call'}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                stu.status === 'Enrolled' ? 'bg-emerald-100 text-emerald-800' :
                                stu.status === 'Counseling' ? 'bg-blue-100 text-blue-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {stu.status}
                              </span>
                            </td>
                              <td className="py-4 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedStudentForAssign(stu);
                                    const defaultCounsellor = counsellors[0]?.fullName || (counsellors[0] as any)?.name || 'Dr. Lakshmi Prasad';
                                    setAssignCounsellorName(stu.counsellorAssigned || (stu as any).assignedCounsellor || defaultCounsellor);
                                    setAssignNotes(stu.counsellorNotes || '');
                                    setShowAssignModal(true);
                                  }}
                                  className="px-3 py-1.5 bg-[#0B192C] hover:bg-[#1E293B] text-white rounded-xl text-[10px] font-bold shadow-sm transition-all cursor-pointer"
                                >
                                  Assign / Change
                                </button>
                              </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'registrations' && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6" id="admin-tab-registrations">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-extrabold text-slate-900 text-base">Online Applications Registry</h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Instant Auto-Approval Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      All online student submissions are automatically approved immediately upon registration. Student files, login credentials, and examination schedules are provisioned without requiring manual administrator approval.
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs bg-slate-900 text-white font-mono font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-amber-400 stroke-[3]" />
                      <span>{registrations.length} Auto-Approved</span>
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold">
                        <th className="pb-3 font-semibold">Student Name & ID</th>
                        <th className="pb-3 font-semibold">Contact Details</th>
                        <th className="pb-3 font-semibold">12th School & Board</th>
                        <th className="pb-3 font-semibold">12th Marks</th>
                        <th className="pb-3 font-semibold">Course & Preferred State</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold text-right">Student Enrolment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {registrations.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                            No student applications recorded yet.
                          </td>
                        </tr>
                      ) : (
                        registrations.map(reg => (
                          <tr key={reg.id} className="hover:bg-slate-50/50">
                            <td className="py-4.5 font-bold text-slate-900">
                              <p className="font-bold text-slate-900">{reg.fullName}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{reg.id}</p>
                            </td>
                            <td className="py-4.5">
                              <div className="space-y-0.5">
                                <p className="font-semibold text-slate-700 flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-slate-400" />
                                  <span>{reg.mobile}</span>
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-slate-400" />
                                  <span>{reg.email}</span>
                                </p>
                              </div>
                            </td>
                            <td className="py-4.5">
                              <div className="space-y-0.5">
                                <p className="font-semibold text-slate-700">{reg.college12th || 'High School / Junior College'}</p>
                                <p className="text-[10px] text-slate-400">{reg.board || 'State Board / CBSE'}</p>
                              </div>
                            </td>
                            <td className="py-4.5 font-extrabold text-slate-800">{reg.marks12th}%</td>
                            <td className="py-4.5">
                              <div className="space-y-0.5">
                                <p className="font-bold text-amber-600">{reg.interestedCourse}</p>
                                <p className="text-[10px] text-slate-500">State: {reg.preferredState}</p>
                              </div>
                            </td>
                            <td className="py-4.5">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-black text-[10px] uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Check className="h-3 w-3 stroke-[3]" />
                                Auto-Approved
                              </span>
                            </td>
                            <td className="py-4.5 text-right">
                              <div className="flex justify-end items-center">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-[11px]">
                                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                  <span>Active Student</span>
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: TEST REVIEWS & MARKS EVALUATION HUB */}
            {activeTab === 'evaluations' && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6" id="admin-tab-evaluations">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-amber-500" />
                      Student Test Review & Marks Evaluation Hub
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Inspect submitted exam answer sheets, allocate question-by-question marks, add official examiner comments, and publish verified scorecards.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-slate-100 font-bold px-3 py-1.5 rounded-xl text-slate-700">
                      Total Submissions: {attempts.length}
                    </span>
                    {pendingEvaluationsCount > 0 && (
                      <span className="text-xs bg-amber-100 text-amber-900 font-extrabold px-3 py-1.5 rounded-xl border border-amber-300">
                        {pendingEvaluationsCount} Pending Review
                      </span>
                    )}
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Search by student name, ID code, exam title, course..."
                      value={attemptSearch}
                      onChange={(e) => setAttemptSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0B192C]"
                    />
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button 
                      onClick={() => setAttemptFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        attemptFilter === 'all' ? 'bg-[#0B192C] text-white' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      All ({attempts.length})
                    </button>
                    <button 
                      onClick={() => setAttemptFilter('pending')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        attemptFilter === 'pending' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      Pending Review ({pendingEvaluationsCount})
                    </button>
                    <button 
                      onClick={() => setAttemptFilter('graded')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        attemptFilter === 'graded' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      Graded & Verified
                    </button>
                    <button 
                      onClick={() => setAttemptFilter('passed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        attemptFilter === 'passed' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      Passed
                    </button>
                    <button 
                      onClick={() => setAttemptFilter('failed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        attemptFilter === 'failed' ? 'bg-rose-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      Failed
                    </button>
                  </div>
                </div>

                {/* Submissions Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold">
                        <th className="pb-3 font-semibold">Student & ID</th>
                        <th className="pb-3 font-semibold">Exam Title & Stream</th>
                        <th className="pb-3 font-semibold">Submission Time</th>
                        <th className="pb-3 font-semibold">Awarded Score</th>
                        <th className="pb-3 font-semibold">Evaluation Status</th>
                        <th className="pb-3 font-semibold">Evaluator Notes</th>
                        <th className="pb-3 font-semibold">Card Status</th>
                        <th className="pb-3 font-semibold text-right">Review Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAttempts.map(att => (
                        <tr key={`${att.studentId}-${att.examId}`} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4">
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-900 text-sm">{att.studentName}</p>
                              <p className="text-[10px] font-mono text-slate-400">ID: {att.studentId}</p>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-800">{att.examTitle}</p>
                              <p className="text-[10px] text-amber-700 font-semibold">{att.studentCourse}</p>
                            </div>
                          </td>
                          <td className="py-4 font-mono text-[11px] text-slate-500">
                            {new Date(att.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-4">
                            <div className="space-y-0.5">
                              <span className="text-sm font-black text-slate-900">
                                {att.score}/{att.maxScore || 10}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 block">
                                {att.percentage}% ({att.passed ? <span className="text-emerald-600">PASS</span> : <span className="text-rose-600">FAIL</span>})
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold text-[10px] uppercase ${
                              att.evaluationStatus === 'Graded & Verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              att.evaluationStatus === 'Under Review' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              'bg-amber-50 text-amber-800 border border-amber-300 font-extrabold'
                            }`}>
                              {att.evaluationStatus === 'Graded & Verified' && <CheckCircle className="h-3 w-3" />}
                              {att.evaluationStatus === 'Pending Review' && <Clock className="h-3 w-3" />}
                              {att.evaluationStatus || 'Pending Review'}
                            </span>
                          </td>
                          <td className="py-4 max-w-[200px]">
                            <p className="text-[11px] text-slate-600 truncate" title={att.evaluatorRemarks || "No examiner notes added yet."}>
                              {att.evaluatorRemarks || <span className="text-slate-400 italic">No notes added</span>}
                            </p>
                            {att.evaluatorName && (
                              <span className="text-[9px] text-slate-400 block font-mono">By: {att.evaluatorName}</span>
                            )}
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => handleTogglePublishAttempt(att.studentId, att.examId, att.isPublished !== false)}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                att.isPublished !== false ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                              }`}
                            >
                              {att.isPublished !== false ? 'Published' : 'Hidden'}
                            </button>
                          </td>
                          <td className="py-4 text-right">
                            <button 
                              onClick={() => handleOpenReviewModal(att)}
                              className="px-3.5 py-2 bg-[#0B192C] hover:bg-[#1E293B] text-white rounded-xl font-bold flex items-center gap-1.5 ml-auto shadow-md text-xs transition-all"
                            >
                              <ClipboardCheck className="h-3.5 w-3.5 text-amber-400" />
                              Review & Give Marks
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredAttempts.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400">
                            No test submissions match your search and filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: APPROVED STUDENTS */}
            {activeTab === 'students' && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6" id="admin-tab-students">
                <h3 className="font-extrabold text-slate-900 text-base">Active Registered Students Registry</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold">
                        <th className="pb-3 font-semibold">ID Code</th>
                        <th className="pb-3 font-semibold">Student Name</th>
                        <th className="pb-3 font-semibold">11th Score</th>
                        <th className="pb-3 font-semibold">Course Preference</th>
                        <th className="pb-3 font-semibold">State Status</th>
                        <th className="pb-3 font-semibold">Assigned Counselor</th>
                        <th className="pb-3 font-semibold text-right">Credentials</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map(stud => (
                        <tr key={stud.id} className="hover:bg-slate-50/50">
                          <td className="py-4.5 font-mono font-bold text-slate-500">{stud.id}</td>
                          <td className="py-4.5">
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-900">{stud.fullName}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{stud.email}</p>
                            </div>
                          </td>
                          <td className="py-4.5 font-extrabold text-slate-800">{stud.marks12th}%</td>
                          <td className="py-4.5 font-bold text-slate-800">{stud.interestedCourse}</td>
                          <td className="py-4.5">
                            <select 
                              value={stud.admissionStatus}
                              onChange={(e) => handleUpdateStudentStatus(stud.id, e.target.value)}
                              className="bg-slate-50 border border-slate-200 text-[10px] font-bold rounded-lg px-2 py-1 outline-none focus:border-[#0B192C]"
                            >
                              <option>Counseling</option>
                              <option>Exam Pending</option>
                              <option>Exam Completed</option>
                              <option>Offered</option>
                              <option>Confirmed</option>
                            </select>
                          </td>
                          <td className="py-4.5 font-semibold text-slate-600">{stud.assignedCounsellor}</td>
                          <td className="py-4.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleOpenRecModal(stud)}
                                className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg text-[10px] flex items-center gap-1 border border-purple-200 transition-all cursor-pointer"
                                title="Recommend curated partner colleges to this student"
                              >
                                <Sparkles className="h-3 w-3 text-purple-600" />
                                Recommend
                              </button>
                              <button 
                                onClick={() => handleResetPassword(stud.id)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] flex items-center gap-1.5 border border-slate-200 transition-all cursor-pointer"
                              >
                                <Key className="h-3 w-3" />
                                Reset
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: EXAM MANAGEMENT & SCHEDULING (Spec #1, #5, #9, #10) */}
            {activeTab === 'exams' && (
              <div className="space-y-8" id="admin-tab-exams">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0057D9] text-[10px] font-bold uppercase tracking-wider">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Exam Release & Time-Slot Controller</span>
                    </div>
                    <h3 className="font-black text-slate-900 text-xl sm:text-2xl">Examination Control & Release Center</h3>
                    <p className="text-xs text-slate-500 max-w-xl">
                      Create entrance tests, configure duration, fees, booking windows, result publication dates, and manage slot allocations. Exams only appear to students when published.
                    </p>
                  </div>
                  <button 
                    onClick={handleOpenCreateExam}
                    className="px-5 py-3 bg-[#0B192C] hover:bg-[#1E293B] text-white font-extrabold text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-[#0B192C]/15 transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="h-4 w-4 text-amber-400" />
                    Create New Examination
                  </button>
                </div>

                {/* Exam List grids */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {exams.map(ex => {
                    const isPublishedGlobally = resultsPublished && resultsPublished[ex.id];
                    const isReleased = ex.status === 'Published' || ex.status === 'Registration Open' || ex.status === 'Booking Open' || ex.status === 'Live' || ex.status === 'active';

                    return (
                      <div key={ex.id} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5 hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="space-y-4">
                          {/* Header row: title, code & status */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block font-mono">
                                Code: {ex.id}
                              </span>
                              <h4 className="text-lg font-black text-slate-950 leading-snug">{ex.title}</h4>
                            </div>

                            {/* Status Badge (Spec #1) */}
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 border self-start ${
                              ex.status === 'Draft' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                              ex.status === 'Registration Open' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                              ex.status === 'Published' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                              ex.status === 'Live' ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse' :
                              ex.status === 'Results Published' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                              'bg-amber-100 text-amber-800 border-amber-300'
                            }`}>
                              {ex.status || 'Draft'}
                            </span>
                          </div>

                          {/* Instructions / Description */}
                          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                            "{ex.description || 'National Aptitude and Career Assessment for admissions counseling and merit scholarship allocation.'}"
                          </p>

                          {/* Key Config Metrics (Duration, Fee, Passing, Stream) */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-1 text-xs">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Duration</span>
                              <span className="font-extrabold text-slate-900">{ex.durationMinutes} Mins</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Fee</span>
                              <span className="font-extrabold text-emerald-700">₹{ex.fee || 500}</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Pass Cutoff</span>
                              <span className="font-extrabold text-amber-600">{ex.passPercentage || 50}%</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Course Stream</span>
                              <span className="font-extrabold text-slate-900 truncate block">{ex.course || 'All'}</span>
                            </div>
                          </div>

                          {/* Official Exam Date highlight (Syncs with Welcome Page) */}
                          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl text-xs">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-[#0057D9]" />
                              <span className="font-bold text-slate-700">Official Exam Date:</span>
                              <span className="font-extrabold text-[#0057D9] text-sm">{ex.date || 'To be decided'}</span>
                            </div>
                            <span className="text-[10px] bg-blue-100 text-[#0057D9] font-black px-2 py-0.5 rounded-full border border-blue-200">
                              Live on Welcome Page
                            </span>
                          </div>

                          {/* Timeline info (Booking Window & Result Date) */}
                          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                            <div className="flex justify-between items-center text-slate-600">
                              <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-[#0057D9]" />
                                Booking Window:
                              </span>
                              <span className="font-bold text-slate-900 font-mono">
                                {ex.bookingStart ? new Date(ex.bookingStart).toLocaleDateString() : 'Immediate'} &ndash; {ex.bookingEnd ? new Date(ex.bookingEnd).toLocaleDateString() : 'Continuous'}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-slate-600 border-t border-slate-200/60 pt-1.5">
                              <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                                Official Result Date:
                              </span>
                              <span className="font-black text-purple-800 font-mono">
                                {ex.resultPublishAt ? new Date(ex.resultPublishAt).toLocaleDateString() : '25 Nov 2026'}
                              </span>
                            </div>
                          </div>

                          {/* Slots preview */}
                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="font-bold text-slate-500">
                              Configured Time Slots: <strong className="text-slate-900">{(ex.slots || []).length} Slots</strong>
                            </span>
                            <button
                              onClick={() => handleOpenPublishModal(ex)}
                              className="text-xs font-bold text-[#0057D9] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Clock className="h-3.5 w-3.5" />
                              Configure Slots & Date
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2">
                            {/* Release / Publish to students button (Spec #1) */}
                            {ex.status === 'Draft' ? (
                              <button
                                onClick={() => handleOpenPublishModal(ex)}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Publish Exam & Set Time Slots
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenPublishModal(ex)}
                                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs border border-emerald-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                                title="Update Exam Date and Time Slots published to students and welcome page"
                              >
                                <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                                Edit Date & Time Slots (Live)
                              </button>
                            )}

                            {/* Toggle Publish Results Early (Spec #10) */}
                            <button
                              onClick={() => handleTogglePublishResults(ex.id, Boolean(isPublishedGlobally))}
                              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                                isPublishedGlobally 
                                  ? 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200' 
                                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                              }`}
                              title="Early result publication toggle (Spec #10)"
                            >
                              <Award className="h-3.5 w-3.5 text-purple-700" />
                              {isPublishedGlobally ? 'Results: Published' : 'Publish Results Now'}
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEditExam(ex)}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Edit className="h-3.5 w-3.5 text-slate-600" />
                              Edit Assessment
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: PARTNER CAMPUS CRUD */}
            {activeTab === 'colleges' && (
              <div className="space-y-8" id="admin-tab-colleges">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Campus Partner Directory</h3>
                    <p className="text-xs text-slate-400">Add, configure or retire partner university registries.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingCollege(null);
                      setCollegeForm({
                        name: '', state: 'Gujarat', city: '', naacGrade: 'A',
                        shortDescription: '', about: '', imageUrl: '',
                        highestPackage: '12.0 LPA', averagePackage: '4.5 LPA', placementRate: '90%',
                        recruiters: ['TCS', 'Infosys'], courses: [{ name: 'B.Tech CSE', duration: '4 Years', fees: '1,20,000' }],
                        infrastructure: ['Modern Labs'], hostelInfo: 'Comfortable hostel rooms on-campus.', sportsFacilities: ['Cricket nets']
                      });
                      setShowCollegeModal(true);
                    }}
                    className="px-4 py-2.5 bg-[#0B192C] hover:bg-[#1E293B] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                    Register New College
                  </button>
                </div>

                {/* College list */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {colleges.map(college => (
                    <div key={college.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
                      <div className="relative h-44 bg-slate-100 overflow-hidden group">
                        <img 
                          src={college.imageUrl} 
                          alt={college.name} 
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800";
                          }}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                        
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-extrabold text-slate-800 border border-slate-100 shadow-sm flex items-center gap-1">
                          <Award className="h-3 w-3 text-amber-500" />
                          <span>NAAC: {college.naacGrade}</span>
                        </div>

                        {college.imageUrl?.startsWith('data:image') && (
                          <div className="absolute top-3 right-3 bg-[#0B192C]/90 text-white backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold border border-white/20 flex items-center gap-1 shadow-sm">
                            <Camera className="h-2.5 w-2.5 text-amber-400" />
                            <span>Uploaded Image</span>
                          </div>
                        )}

                        <div className="absolute bottom-2.5 left-3 right-3 text-white pointer-events-none">
                          <span className="text-[10px] font-semibold text-slate-200 uppercase tracking-wider block drop-shadow-sm">
                            {college.city}, {college.state}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">{college.city}, {college.state}</span>
                          <h4 className="text-base font-extrabold text-slate-950 leading-tight">{college.name}</h4>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                          <button 
                            onClick={() => {
                              setEditingCollege(college);
                              setCollegeForm(college);
                              setShowCollegeModal(true);
                            }}
                            className="flex-1 py-2 bg-slate-50 hover:bg-[#0B192C]/5 text-slate-700 hover:text-[#0B192C] rounded-lg text-[10px] font-bold border border-slate-200 transition-all flex items-center justify-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Modify
                          </button>
                          <button 
                            onClick={() => handleCollegeDelete(college.id)}
                            className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-[10px] font-bold transition-all"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: REPORTS & CHARTS */}
            {activeTab === 'reports' && (
              <div className="space-y-8" id="admin-tab-reports">
                
                {/* PDF EXPORT SUCCESS TOAST BANNER */}
                <AnimatePresence>
                  {pdfExportToast && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-lg flex items-center justify-between gap-3 text-xs font-semibold"
                      id="pdf-export-toast"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-5 w-5 text-emerald-200 shrink-0" />
                        <span>{pdfExportToast}</span>
                      </div>
                      <button 
                        onClick={() => setPdfExportToast('')}
                        className="text-emerald-100 hover:text-white p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* TOP REPORTING HEADER & MASTER PDF EXPORT ACTIONS */}
                <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#0A192F] text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                        Official Directorate Reports
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Updated Live ({combinedReportRecords.length} Records)
                      </span>
                    </div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                      Attendance & Assessment Performance Reports
                    </h2>
                    <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                      Download certified administrative PDF records for institutional audits, university council reviews, examination attendance registers, and merit scorecards.
                    </p>
                  </div>

                  {/* MASTER PDF EXPORT BUTTON GROUP */}
                  <div className="flex flex-wrap items-center gap-2.5" id="reports-pdf-export-group">
                    <button
                      type="button"
                      disabled={isExportingPdf}
                      onClick={() => exportAttendanceAssessmentPDF('all')}
                      className="py-2.5 px-4 bg-[#0A192F] hover:bg-[#1E3A8A] disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-[#0A192F]/20 transition-all flex items-center gap-2 cursor-pointer"
                      id="export-comprehensive-pdf-btn"
                      title="Download full combined Attendance and Assessment report in formatted PDF"
                    >
                      <FileDown className="h-4 w-4 text-amber-400" />
                      <span>{isExportingPdf ? 'Generating PDF...' : 'Master PDF Report'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isExportingPdf}
                      onClick={() => exportAttendanceAssessmentPDF('attendance')}
                      className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 cursor-pointer"
                      id="export-attendance-register-btn"
                      title="Download Examination Hall Roll Call and Attendance Register"
                    >
                      <ClipboardCheck className="h-4 w-4 text-emerald-200" />
                      <span>Attendance Register (PDF)</span>
                    </button>

                    <button
                      type="button"
                      disabled={isExportingPdf}
                      onClick={() => exportAttendanceAssessmentPDF('assessment')}
                      className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
                      id="export-assessment-scorecards-btn"
                      title="Download Student Merit List and Assessment Scorecards"
                    >
                      <Award className="h-4 w-4 text-slate-950" />
                      <span>Assessment Scorecards (PDF)</span>
                    </button>
                  </div>
                </div>

                {/* EXECUTIVE STATISTICAL KPI WIDGETS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Candidates</span>
                      <span className="text-xl font-black text-slate-900">{combinedReportRecords.length}</span>
                      <span className="text-[10px] text-slate-500 block font-medium">Enrolled in system</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                      <ClipboardCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Exam Attendance</span>
                      <span className="text-xl font-black text-emerald-600">
                        {combinedReportRecords.filter(r => r.attendanceStatus === 'Present').length} / {combinedReportRecords.length}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold block">
                        {combinedReportRecords.length ? Math.round((combinedReportRecords.filter(r => r.attendanceStatus === 'Present').length / combinedReportRecords.length) * 100) : 0}% Turnout Rate
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assessments Evaluated</span>
                      <span className="text-xl font-black text-purple-700">
                        {combinedReportRecords.filter(r => r.hasAttempt).length}
                      </span>
                      <span className="text-[10px] text-slate-500 block font-medium">Graded by examiners</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overall Pass Rate</span>
                      <span className="text-xl font-black text-amber-600">
                        {combinedReportRecords.filter(r => r.hasAttempt).length 
                          ? Math.round((combinedReportRecords.filter(r => r.isPassed).length / combinedReportRecords.filter(r => r.hasAttempt).length) * 100) 
                          : 0}%
                      </span>
                      <span className="text-[10px] text-slate-500 block font-medium">
                        {combinedReportRecords.filter(r => r.isPassed).length} Candidates Qualified
                      </span>
                    </div>
                  </div>
                </div>

                {/* CHARTS ROW */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Demanded Courses Pie */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-slate-900 text-sm">Course Stream Enrollment Demand</h3>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">Distribution</span>
                    </div>
                    <div className="h-64 flex items-center justify-center">
                      {reports?.coursePopularityData && (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={reports.coursePopularityData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                              {reports.coursePopularityData.map((entry: any, idx: number) => (
                                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Regional State Admissions Bar */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-slate-900 text-sm">State Wise Allocated Admissions</h3>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">Geographic Allocation</span>
                    </div>
                    <div className="h-64">
                      {reports?.stateAdmissionsData && (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={reports.stateAdmissionsData}>
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#0B192C" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>

                {/* DETAILED ATTENDANCE & ASSESSMENT RECORDS TABLE */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-6" id="attendance-assessment-table-section">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Candidate Attendance & Examination Assessment Register
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Filter and view real-time examination presence, score breakdown, and individual scorecards.
                      </p>
                    </div>

                    {/* Quick Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Search */}
                      <div className="relative">
                        <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={reportSearch}
                          onChange={(e) => setReportSearch(e.target.value)}
                          placeholder="Search student, course, exam..."
                          className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium outline-none focus:border-[#0057D9] focus:bg-white w-56 transition-all"
                          id="report-search-input"
                        />
                      </div>

                      {/* Course Filter */}
                      <select
                        value={reportCourseFilter}
                        onChange={(e) => setReportCourseFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#0057D9]"
                        id="report-course-filter"
                      >
                        <option value="all">All Course Streams</option>
                        <option value="Engineering">Engineering (B.Tech)</option>
                        <option value="Management">Management (MBA/BBA)</option>
                        <option value="Medical">Medical / Pharmacy</option>
                        <option value="Design">Design & Architecture</option>
                        <option value="Law">Law (LLB/BA LLB)</option>
                      </select>

                      {/* Status Filter */}
                      <select
                        value={reportStatusFilter}
                        onChange={(e) => setReportStatusFilter(e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#0057D9]"
                        id="report-status-filter"
                      >
                        <option value="all">All Statuses</option>
                        <option value="present">Present / Attempted</option>
                        <option value="absent">Pending / Roll Call</option>
                        <option value="passed">Assessment Passed</option>
                        <option value="failed">Assessment Retake</option>
                      </select>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs" id="reports-records-table">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                          <th className="py-3 px-4">Candidate & ID</th>
                          <th className="py-3 px-4">Stream / Program</th>
                          <th className="py-3 px-4">Assigned Exam</th>
                          <th className="py-3 px-4">Attendance</th>
                          <th className="py-3 px-4">Score & %</th>
                          <th className="py-3 px-4">Result</th>
                          <th className="py-3 px-4">Evaluation Remarks</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {displayedReportRecords.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                              No candidate records matching the specified filters.
                            </td>
                          </tr>
                        ) : (
                          displayedReportRecords.map((rec) => (
                            <tr key={rec.candidateId} className="hover:bg-slate-50/80 transition-colors">
                              {/* Candidate & ID */}
                              <td className="py-3.5 px-4">
                                <div className="font-extrabold text-slate-900">{rec.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                                  <span>{rec.candidateId}</span>
                                  <span>•</span>
                                  <span>{rec.email}</span>
                                </div>
                              </td>

                              {/* Stream / Program */}
                              <td className="py-3.5 px-4 font-semibold text-slate-700">
                                {rec.course}
                              </td>

                              {/* Assigned Exam */}
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-slate-800 line-clamp-1">{rec.examTitle}</div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Calendar className="h-3 w-3" />
                                  <span>{rec.examDate}</span>
                                </div>
                              </td>

                              {/* Attendance */}
                              <td className="py-3.5 px-4">
                                {rec.attendanceStatus === 'Present' ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Present
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    <Clock className="h-3 w-3" />
                                    Scheduled
                                  </span>
                                )}
                              </td>

                              {/* Score & % */}
                              <td className="py-3.5 px-4 font-mono">
                                {rec.hasAttempt ? (
                                  <div>
                                    <span className="font-extrabold text-slate-900">{rec.score}</span>
                                    <span className="text-slate-400">/{rec.maxScore}</span>
                                    <span className="ml-1.5 font-bold text-[#0057D9]">({rec.percentage}%)</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-300 font-bold">—</span>
                                )}
                              </td>

                              {/* Result */}
                              <td className="py-3.5 px-4">
                                {rec.hasAttempt ? (
                                  rec.isPassed ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-xs">
                                      <Check className="h-3 w-3 stroke-[3]" />
                                      PASSED
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs">
                                      <X className="h-3 w-3 stroke-[3]" />
                                      RETAKE
                                    </span>
                                  )
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">Pending</span>
                                )}
                              </td>

                              {/* Evaluation Remarks */}
                              <td className="py-3.5 px-4 max-w-xs">
                                <p className="text-[11px] text-slate-600 line-clamp-1 italic">
                                  {rec.evaluatorRemarks !== '—' ? `"${rec.evaluatorRemarks}"` : 'Pending evaluation'}
                                </p>
                              </td>

                              {/* Action */}
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => exportSingleStudentScorecardPDF(rec)}
                                  className="p-2 hover:bg-blue-50 text-slate-400 hover:text-[#0057D9] rounded-xl transition-colors cursor-pointer"
                                  title="Export individual candidate scorecard as PDF"
                                  id={`export-scorecard-btn-${rec.candidateId}`}
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Showing <strong>{displayedReportRecords.length}</strong> of <strong>{combinedReportRecords.length}</strong> total records</span>
                    <span>NEXORA Central Admissions Directorate</span>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: PASSWORD RESET & SECURITY AUDIT LOGS (ADMIN ONLY) */}
            {activeTab === 'password-resets' && (
              <div className="space-y-6" id="admin-tab-password-resets">
                
                {/* Header Banner */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 uppercase tracking-widest font-mono">
                        Security Monitoring
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Admin Audit Trail
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
                      <span>Password Reset & Auth Audit Logs</span>
                      <span className="text-xs bg-slate-900 text-white font-mono font-bold px-2.5 py-1 rounded-full">
                        {passwordResetLogs.length} events
                      </span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                      Live auditing of student and staff password reset triggers, verification OTP requests, and credential change successes to detect security anomalies and protect candidate files.
                    </p>
                  </div>

                  {/* Actions Header */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={refreshPasswordResetLogs}
                      disabled={resetLogsLoading}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                      title="Fetch latest log events"
                    >
                      <RefreshCw className={`h-4 w-4 ${resetLogsLoading ? 'animate-spin' : ''}`} />
                      <span>Refresh Logs</span>
                    </button>

                    <button
                      type="button"
                      onClick={exportResetLogsCSV}
                      className="px-4 py-2.5 bg-[#0B192C] hover:bg-[#1E3A8A] text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                      title="Export logs as CSV spreadsheet"
                    >
                      <Download className="h-4 w-4 text-amber-400" />
                      <span>Export CSV</span>
                    </button>

                    <button
                      type="button"
                      onClick={exportResetLogsJSON}
                      className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Export logs as JSON payload"
                    >
                      <FileDown className="h-4 w-4" />
                      <span>JSON</span>
                    </button>

                    {userRole === 'super_admin' && (
                      <button
                        type="button"
                        onClick={handleClearResetLogs}
                        disabled={clearingLogs || passwordResetLogs.length === 0}
                        className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        title="Clear all stored logs (Super Admin Only)"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Clear History</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Feedback Toast if any */}
                {resetLogsFeedbackToast && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{resetLogsFeedbackToast}</span>
                  </motion.div>
                )}

                {/* KPI Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Total Triggered */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-[#0B192C]/5 text-[#0B192C] flex items-center justify-center font-bold">
                      <Key className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Triggered Events</span>
                      <span className="text-2xl font-black text-slate-900">{passwordResetLogs.length}</span>
                    </div>
                  </div>

                  {/* Card 2: Successful Resets */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Completed Resets</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-emerald-700">
                          {passwordResetLogs.filter(l => l.status === 'SUCCESS').length}
                        </span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: OTP Attempts Dispatched */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">OTP Verification Dispatches</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-amber-700">
                          {passwordResetLogs.filter(l => l.status === 'ATTEMPT').length}
                        </span>
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                          Attempts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Failed / Rejected Attempts */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold border border-rose-100">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Failed / Rejected Attempts</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-rose-700">
                          {passwordResetLogs.filter(l => l.status === 'FAILED').length}
                        </span>
                        <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">
                          Alerts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filters and Search Bar */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search by student ID, email, username, IP address, or event keywords..."
                      value={resetLogSearch}
                      onChange={(e) => setResetLogSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:border-amber-400 focus:bg-white transition-all font-medium"
                    />
                    {resetLogSearch && (
                      <button 
                        onClick={() => setResetLogSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <select
                      value={resetLogStatusFilter}
                      onChange={(e) => setResetLogStatusFilter(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-amber-400"
                    >
                      <option value="all">All Statuses ({passwordResetLogs.length})</option>
                      <option value="SUCCESS">Success Only ({passwordResetLogs.filter(l => l.status === 'SUCCESS').length})</option>
                      <option value="ATTEMPT">Attempt / In-Progress ({passwordResetLogs.filter(l => l.status === 'ATTEMPT').length})</option>
                      <option value="FAILED">Failed / Rejected ({passwordResetLogs.filter(l => l.status === 'FAILED').length})</option>
                    </select>

                    {/* Event Type Filter */}
                    <select
                      value={resetLogTypeFilter}
                      onChange={(e) => setResetLogTypeFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-amber-400"
                    >
                      <option value="all">All Event Types</option>
                      <option value="otp_requested">OTP Dispatched</option>
                      <option value="reset_success">OTP Reset Succeeded</option>
                      <option value="reset_failed">OTP Reset Rejected</option>
                      <option value="password_changed">First-Time / Direct Password Changed</option>
                      <option value="password_change_failed">Password Change Failed</option>
                      <option value="admin_manual_reset">Admin Manual Reset</option>
                      <option value="account_created">Auto Account & Temporary Password Created</option>
                    </select>
                  </div>
                </div>

                {/* Audit Logs Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0A192F] text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-4 px-4">Timestamp</th>
                          <th className="py-4 px-4">Event Operation</th>
                          <th className="py-4 px-4">User Identifier & Target</th>
                          <th className="py-4 px-4">Role</th>
                          <th className="py-4 px-4">Status</th>
                          <th className="py-4 px-4">Client IP</th>
                          <th className="py-4 px-4">Audit Details</th>
                          <th className="py-4 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {passwordResetLogs
                          .filter(log => {
                            if (resetLogSearch.trim()) {
                              const q = resetLogSearch.toLowerCase().trim();
                              const matchId = (log.id || '').toLowerCase().includes(q);
                              const matchUser = (log.userIdentifier || '').toLowerCase().includes(q);
                              const matchEmail = (log.targetEmail || '').toLowerCase().includes(q);
                              const matchDetails = (log.details || '').toLowerCase().includes(q);
                              const matchIp = (log.ipAddress || '').toLowerCase().includes(q);
                              const matchTitle = (log.eventTitle || '').toLowerCase().includes(q);
                              if (!matchId && !matchUser && !matchEmail && !matchDetails && !matchIp && !matchTitle) {
                                return false;
                              }
                            }
                            if (resetLogStatusFilter !== 'all' && log.status !== resetLogStatusFilter) return false;
                            if (resetLogTypeFilter !== 'all' && log.eventType !== resetLogTypeFilter) return false;
                            return true;
                          })
                          .length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                              <ShieldCheck className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                              <p className="text-sm font-bold text-slate-600">No password reset logs matching filters</p>
                              <p className="text-xs text-slate-400 mt-1">Adjust search parameters or refresh the audit database.</p>
                            </td>
                          </tr>
                        ) : (
                          passwordResetLogs
                            .filter(log => {
                              if (resetLogSearch.trim()) {
                                const q = resetLogSearch.toLowerCase().trim();
                                const matchId = (log.id || '').toLowerCase().includes(q);
                                const matchUser = (log.userIdentifier || '').toLowerCase().includes(q);
                                const matchEmail = (log.targetEmail || '').toLowerCase().includes(q);
                                const matchDetails = (log.details || '').toLowerCase().includes(q);
                                const matchIp = (log.ipAddress || '').toLowerCase().includes(q);
                                const matchTitle = (log.eventTitle || '').toLowerCase().includes(q);
                                if (!matchId && !matchUser && !matchEmail && !matchDetails && !matchIp && !matchTitle) {
                                  return false;
                                }
                              }
                              if (resetLogStatusFilter !== 'all' && log.status !== resetLogStatusFilter) return false;
                              if (resetLogTypeFilter !== 'all' && log.eventType !== resetLogTypeFilter) return false;
                              return true;
                            })
                            .map((log) => {
                              const dateObj = new Date(log.timestamp);
                              const formattedDate = isNaN(dateObj.getTime()) ? log.timestamp : dateObj.toLocaleString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
                              });

                              return (
                                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                                  {/* Timestamp */}
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                                      <Clock className="h-3 w-3 text-slate-400" />
                                      <span>{formattedDate}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{log.id}</div>
                                  </td>

                                  {/* Event Operation */}
                                  <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-2">
                                      {log.status === 'SUCCESS' && (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                      )}
                                      {log.status === 'ATTEMPT' && (
                                        <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                                      )}
                                      {log.status === 'FAILED' && (
                                        <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                                      )}
                                      <span className="font-extrabold text-slate-900 leading-snug">{log.eventTitle}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 pl-6">{log.eventType}</div>
                                  </td>

                                  {/* User Identifier & Target */}
                                  <td className="py-3.5 px-4">
                                    <div className="font-mono font-bold text-[#0B192C] flex items-center gap-1.5">
                                      <User className="h-3 w-3 text-slate-400" />
                                      <span>{log.userIdentifier}</span>
                                    </div>
                                    {log.targetEmail && (
                                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                        <Mail className="h-2.5 w-2.5" />
                                        <span>{log.targetEmail}</span>
                                      </div>
                                    )}
                                    {log.deliveryService && (
                                      <div className="mt-1">
                                        {log.deliveryService === 'sendgrid' && (
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                            SendGrid OTP
                                          </span>
                                        )}
                                        {log.deliveryService === 'firebase_auth' && (
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                            Firebase Auth
                                          </span>
                                        )}
                                        {log.deliveryService === 'simulated' && (
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-600">
                                            Simulated OTP
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </td>

                                  {/* Role */}
                                  <td className="py-3.5 px-4">
                                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                      log.userRole === 'super_admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                      log.userRole === 'admin' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                      log.userRole === 'counsellor' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                                      'bg-amber-100 text-amber-800 border border-amber-200'
                                    }`}>
                                      {log.userRole || 'student'}
                                    </span>
                                  </td>

                                  {/* Status */}
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    {log.status === 'SUCCESS' && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <Check className="h-3 w-3 stroke-[3]" />
                                        SUCCESS
                                      </span>
                                    )}
                                    {log.status === 'ATTEMPT' && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                                        <Clock className="h-3 w-3 stroke-[2.5]" />
                                        ATTEMPT
                                      </span>
                                    )}
                                    {log.status === 'FAILED' && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                                        <X className="h-3 w-3 stroke-[3]" />
                                        FAILED
                                      </span>
                                    )}
                                  </td>

                                  {/* Client IP */}
                                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                                    {log.ipAddress || '127.0.0.1'}
                                  </td>

                                  {/* Audit Details */}
                                  <td className="py-3.5 px-4 max-w-sm">
                                    <p className="text-[11px] text-slate-700 line-clamp-2 leading-relaxed">
                                      {log.details}
                                    </p>
                                  </td>

                                  {/* Action */}
                                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedLogDetail(log)}
                                      className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
                                      title="Inspect complete log entry and metadata"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer */}
                  <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Showing filtered results from <strong>{passwordResetLogs.length}</strong> total security log entries</span>
                    <span>NEXORA Security Information and Event Management (SIEM)</span>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: ROLES & RESPONSIBILITIES (User Request #3 & Core Architecture) */}
            {activeTab === 'roles' && (
              <div className="space-y-8" id="admin-tab-roles">
                {/* Header */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0057D9] text-[10px] font-bold uppercase tracking-wider">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Role-Based Access Control (RBAC) Architecture</span>
                    </div>
                    <h3 className="font-black text-slate-900 text-xl sm:text-2xl">Platform Roles & Responsibilities</h3>
                    <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                      Comprehensive specification of privileges, governance boundaries, and operational responsibilities across the four platform tiers: Super Admin, Admin, Counselor, and Student.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs shrink-0 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Your Authenticated Role</span>
                    <span className="font-black text-slate-900 uppercase font-mono">{userRole}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold block">Full System Administrative Level</span>
                  </div>
                </div>

                {/* 4 Roles Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 1. Super Admin */}
                  <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-purple-200 shadow-sm space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                      Tier 1 &bull; Highest Authority
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                        <Key className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900">Super Administrator (<code>super_admin</code>)</h4>
                        <p className="text-xs text-purple-700 font-bold">Supreme System Governor & Policy Controller</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      <p className="font-bold text-slate-800">Primary Responsibilities & Privileges:</p>
                      <ul className="space-y-1.5 list-disc pl-4 text-[11px] leading-relaxed">
                        <li><strong>Global Authority:</strong> Manage all accounts, users, and assign roles across the entire academy system.</li>
                        <li><strong>Examination Governance:</strong> Create, schedule, publish, or retract entrance assessments, set assessment fees and pass cutoffs.</li>
                        <li><strong>Results Release Override:</strong> Manually publish results earlier or configure scheduled publication dates.</li>
                        <li><strong>Institution Partner Accreditation:</strong> Approve, modify, or retire university partner profiles and campus imagery.</li>
                        <li><strong>Audit & Security:</strong> Access full password reset logs, security incident forensics, and system analytical reports.</li>
                      </ul>
                    </div>
                  </div>

                  {/* 2. Admin */}
                  <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-blue-200 shadow-sm space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-[#0057D9] text-white text-[9px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                      Tier 2 &bull; Operations
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-blue-100 text-[#0057D9] flex items-center justify-center font-black">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900">Administrator (<code>admin</code>)</h4>
                        <p className="text-xs text-[#0057D9] font-bold">Academic Operations & Evaluation Manager</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      <p className="font-bold text-slate-800">Primary Responsibilities & Privileges:</p>
                      <ul className="space-y-1.5 list-disc pl-4 text-[11px] leading-relaxed">
                        <li><strong>Assessment Operations:</strong> Create and configure examinations, select question banks, set slot times and student capacities.</li>
                        <li><strong>Grading & Verification:</strong> Review student exam answer sheets, award manual marks/remarks, and grade submissions.</li>
                        <li><strong>Human College Recommendations:</strong> Curate and dispatch approved partner college recommendations directly to individual student profiles.</li>
                        <li><strong>Campus Directory Management:</strong> Upload campus photos, update program offerings, NAAC ratings, and placement stats.</li>
                        <li><strong>Counselor Oversight:</strong> Allocate registered students to counselor cohorts and track guidance progress.</li>
                      </ul>
                    </div>
                  </div>

                  {/* 3. Counselor */}
                  <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-teal-200 shadow-sm space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-teal-600 text-white text-[9px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                      Tier 3 &bull; Guidance
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-black">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900">Academic Counselor (<code>counsellor</code>)</h4>
                        <p className="text-xs text-teal-700 font-bold">Student Guidance, Mentorship & College Advisor</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      <p className="font-bold text-slate-800">Primary Responsibilities & Privileges:</p>
                      <ul className="space-y-1.5 list-disc pl-4 text-[11px] leading-relaxed">
                        <li><strong>Direct Mentorship & Chat:</strong> One-on-one real-time guidance with assigned students regarding courses, admissions, and careers.</li>
                        <li><strong>Human College Recommendations:</strong> Search, select, and formally recommend specific partner institutions to students with personalized advisory notes.</li>
                        <li><strong>Advisory Logs:</strong> Maintain official counseling notes and recommendation remarks visible to students and admissions staff.</li>
                        <li><strong>Student Assessment Review:</strong> View candidate aptitude performance and guide student choice based on evaluated competence.</li>
                        <li><strong>Seat Allocation Support:</strong> Assist qualified students through institutional interview preparation and seat reservation.</li>
                      </ul>
                    </div>
                  </div>

                  {/* 4. Student */}
                  <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-emerald-200 shadow-sm space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                      Tier 4 &bull; Candidate
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900">Student Aspirant (<code>student</code>)</h4>
                        <p className="text-xs text-emerald-700 font-bold">Undergraduate Aspirant & Assessment Candidate</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      <p className="font-bold text-slate-800">Primary Responsibilities & Candidate Rights:</p>
                      <ul className="space-y-1.5 list-disc pl-4 text-[11px] leading-relaxed">
                        <li><strong>Frictionless Registration:</strong> Automated instant account approval upon online application submission.</li>
                        <li><strong>Exam Fee Payment & Slot Booking:</strong> Complete fee payment to unlock and permanently schedule their preferred date & time slot.</li>
                        <li><strong>Monitored Proctored Assessments:</strong> Attend strict anti-cheating exams with real-time countdown and answer auto-saving.</li>
                        <li><strong>Guaranteed PASS Status:</strong> Every student who attempts is awarded PASS; scores &ge; 50% see full numerical breakdown and PDF scorecard.</li>
                        <li><strong>Curated College Access:</strong> View colleges explicitly recommended by human counselors/admins, and interact via dedicated counselor chat.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Matrix Comparison Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-white">Role-Based Permission & Responsibility Matrix</h4>
                      <p className="text-[10px] text-slate-400">Clear breakdown of access controls across NEXORA platform features</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-400/30">
                      Enforced By Platform
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                          <th className="py-3 px-4">Capability / Responsibility</th>
                          <th className="py-3 px-4 text-center">Super Admin</th>
                          <th className="py-3 px-4 text-center">Admin</th>
                          <th className="py-3 px-4 text-center">Counselor</th>
                          <th className="py-3 px-4 text-center">Student</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { feat: "Platform Governance & User Account Management", sa: true, ad: false, co: false, st: false },
                          { feat: "Create Entrance Exams & Configure Duration/Fee", sa: true, ad: true, co: false, st: false },
                          { feat: "Exam Release & Student Visibility Control", sa: true, ad: true, co: false, st: false },
                          { feat: "Configure Slot Times & Candidate Capacity", sa: true, ad: true, co: false, st: false },
                          { feat: "Result Publication Date Setting & Early Release", sa: true, ad: true, co: false, st: false },
                          { feat: "Test Grading & Answer Sheet Review Console", sa: true, ad: true, co: false, st: false },
                          { feat: "Campus Partner Registry & Image Asset Upload", sa: true, ad: true, co: false, st: false },
                          { feat: "Curate & Send College Recommendations to Student", sa: true, ad: true, co: true, st: false },
                          { feat: "Two-Way One-on-One Student Guidance Chat", sa: true, ad: true, co: true, st: true },
                          { feat: "Appear for Monitored Anti-Cheating Assessment", sa: false, ad: false, co: false, st: true },
                          { feat: "Access Official Scorecard (50%+ detailed / <50% PASS)", sa: true, ad: true, co: true, st: true }
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-3.5 px-4 font-semibold text-slate-800">{row.feat}</td>
                            <td className="py-3.5 px-4 text-center">
                              {row.sa ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {row.ad ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {row.co ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {row.st ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* MODAL 1: ADD / MODIFY COLLEGE */}
        <AnimatePresence>
          {showCollegeModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div 
                className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full border border-slate-100 max-h-[90vh] flex flex-col"
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
              >
                <div className="bg-[#0A192F] p-6 text-white flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
                      <Building className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm">{editingCollege ? "Modify Campus File" : "Register Campus Partner"}</h3>
                      <p className="text-[10px] text-slate-400">Configure accreditation, media banner, and academic programs</p>
                    </div>
                  </div>
                  <button onClick={() => setShowCollegeModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
                </div>

                <form onSubmit={handleCollegeSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">College Name</label>
                    <input required type="text" value={collegeForm.name} onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-2 outline-none focus:border-[#0B192C]" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500">City</label>
                      <input required type="text" value={collegeForm.city} onChange={(e) => setCollegeForm({ ...collegeForm, city: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-2 outline-none focus:border-[#0B192C]" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500">State</label>
                      <select value={collegeForm.state} onChange={(e) => setCollegeForm({ ...collegeForm, state: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-2 outline-none focus:border-[#0B192C]">
                        <option>Andhra Pradesh</option>
                        <option>Telangana</option>
                        <option>Karnataka</option>
                        <option>Tamil Nadu</option>
                        <option>Gujarat</option>
                        <option>Maharashtra</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">NAAC Rating Grade</label>
                    <select 
                      value={collegeForm.naacGrade || 'A'} 
                      onChange={(e) => setCollegeForm({ ...collegeForm, naacGrade: e.target.value })} 
                      className="w-full bg-slate-50 border rounded-xl px-3 py-2 outline-none font-bold text-slate-800 focus:border-[#0B192C]"
                    >
                      <option value="A++">A++ (Highest Accreditation)</option>
                      <option value="A+">A+ (Distinguished Grade)</option>
                      <option value="A">A (Excellent Accreditation)</option>
                      <option value="B++">B++ (Very Good Accreditation)</option>
                      <option value="B+">B+ (Good Accreditation)</option>
                      <option value="B">B (Satisfactory Grade)</option>
                    </select>
                  </div>

                  {/* CAMPUS BANNER IMAGE ADDING & DISPLAY SECTION */}
                  <div className="space-y-3 bg-slate-50/90 p-4.5 rounded-2xl border border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#0B192C] text-white rounded-lg">
                          <ImageIcon className="h-4 w-4 text-amber-400" />
                        </div>
                        <div>
                          <label className="font-extrabold text-slate-900 text-xs block">Campus Banner Image</label>
                          <span className="text-[10px] text-slate-400">Add an image to display across portal & student explorer</span>
                        </div>
                      </div>
                      
                      {/* Image Source Mode Tabs */}
                      <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200 text-[10px] font-bold shrink-0 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setCollegeImageMode('upload')}
                          className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                            collegeImageMode === 'upload' 
                              ? 'bg-[#0B192C] text-white shadow-xs' 
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Upload className="h-3 w-3" />
                          <span>Upload File</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCollegeImageMode('presets')}
                          className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                            collegeImageMode === 'presets' 
                              ? 'bg-[#0B192C] text-white shadow-xs' 
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Camera className="h-3 w-3" />
                          <span>Campus Presets</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCollegeImageMode('url')}
                          className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                            collegeImageMode === 'url' 
                              ? 'bg-[#0B192C] text-white shadow-xs' 
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <FileText className="h-3 w-3" />
                          <span>Image URL</span>
                        </button>
                      </div>
                    </div>

                    {/* Mode 1: File Upload */}
                    {collegeImageMode === 'upload' && (
                      <div className="space-y-2">
                        <input
                          type="file"
                          ref={collegeFileInputRef}
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleCollegeImageUpload(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                          id="college-image-file-input"
                        />
                        <div
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              handleCollegeImageUpload(e.dataTransfer.files[0]);
                            }
                          }}
                          onClick={() => collegeFileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-300 hover:border-[#0B192C] bg-white rounded-xl p-5 text-center cursor-pointer transition-all hover:bg-slate-50 group"
                        >
                          <UploadCloud className="h-7 w-7 text-slate-400 group-hover:text-[#0B192C] mx-auto mb-1 transition-colors" />
                          <p className="text-xs font-bold text-slate-700">
                            {isProcessingImage ? 'Optimizing & Processing Image...' : 'Click to Browse Image or Drag & Drop File'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Supports PNG, JPG, JPEG, WEBP or SVG (High Resolution, automatically optimized for web)
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Mode 2: Presets Selection */}
                    {collegeImageMode === 'presets' && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-semibold block">Select a curated campus photography preset:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {SAMPLE_CAMPUS_PRESETS.map((preset, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setCollegeForm(prev => ({ ...prev, imageUrl: preset.url }));
                                setImageUploadFeedback(`Selected preset: ${preset.title}`);
                              }}
                              className={`group relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                                collegeForm.imageUrl === preset.url 
                                  ? 'border-[#0B192C] ring-2 ring-[#0B192C]/20 shadow-sm' 
                                  : 'border-slate-200 hover:border-slate-400'
                              }`}
                            >
                              <img src={preset.url} alt={preset.title} className="w-full h-16 object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-1.5">
                                <span className="text-[9px] text-white font-bold leading-tight">{preset.title}</span>
                              </div>
                              {collegeForm.imageUrl === preset.url && (
                                <div className="absolute top-1 right-1 bg-[#0B192C] text-white rounded-full p-0.5 shadow-sm">
                                  <Check className="h-2.5 w-2.5" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mode 3: Image URL Input */}
                    {collegeImageMode === 'url' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-bold block">Direct Web Image Link (HTTPS)</label>
                        <input 
                          type="text" 
                          placeholder="https://images.unsplash.com/photo-campus.jpg" 
                          value={collegeForm.imageUrl || ''} 
                          onChange={(e) => {
                            setCollegeForm({ ...collegeForm, imageUrl: e.target.value });
                            setImageUploadFeedback('Image link updated');
                          }} 
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none text-xs focus:border-[#0B192C] font-mono" 
                        />
                      </div>
                    )}

                    {/* LIVE DISPLAY / PREVIEW AS UPLOADED */}
                    {collegeForm.imageUrl ? (
                      <div className="space-y-1.5 pt-1 border-t border-slate-200/80">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Live Display as Uploaded</span>
                          </span>
                          <div className="flex items-center gap-2">
                            {imageUploadFeedback && (
                              <span className="text-[10px] text-emerald-700 font-mono font-semibold">{imageUploadFeedback}</span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setCollegeForm({ ...collegeForm, imageUrl: '' });
                                setImageUploadFeedback('Image cleared');
                              }}
                              className="text-rose-600 hover:text-rose-700 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer hover:underline"
                              title="Remove image"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>

                        {/* Banner Card Preview */}
                        <div className="relative h-40 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner group">
                          <img 
                            src={collegeForm.imageUrl} 
                            alt={collegeForm.name || "Campus Preview"} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
                          
                          {/* Top Badges */}
                          <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-800 border border-slate-100 shadow-xs flex items-center gap-1">
                            <Award className="h-3 w-3 text-amber-500" />
                            <span>NAAC: {collegeForm.naacGrade || 'A'}</span>
                          </div>

                          <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-black shadow-xs flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            <span>Live Display Ready</span>
                          </div>

                          {/* Bottom College Info Overlay */}
                          <div className="absolute bottom-2.5 left-3 right-3 text-white pointer-events-none">
                            <span className="text-[9px] uppercase tracking-wider text-slate-300 font-bold block">
                              {collegeForm.city || 'City'}, {collegeForm.state || 'State'}
                            </span>
                            <h5 className="font-extrabold text-sm text-white truncate drop-shadow-sm">
                              {collegeForm.name || 'Sample Campus Name'}
                            </h5>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-900 text-[11px] flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                        <span>No image added yet. Upload an image file from your device, choose a campus preset, or enter an image link.</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 text-[10px] uppercase">Highest Package</label>
                      <input type="text" placeholder="e.g. 18.5 LPA" value={collegeForm.highestPackage || ''} onChange={(e) => setCollegeForm({ ...collegeForm, highestPackage: e.target.value })} className="w-full bg-white border rounded-lg px-2.5 py-1.5 outline-none font-bold text-xs focus:border-[#0B192C]" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 text-[10px] uppercase">Average Package</label>
                      <input type="text" placeholder="e.g. 5.8 LPA" value={collegeForm.averagePackage || ''} onChange={(e) => setCollegeForm({ ...collegeForm, averagePackage: e.target.value })} className="w-full bg-white border rounded-lg px-2.5 py-1.5 outline-none font-bold text-xs focus:border-[#0B192C]" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 text-[10px] uppercase">Placement Rate</label>
                      <input type="text" placeholder="e.g. 95%" value={collegeForm.placementRate || ''} onChange={(e) => setCollegeForm({ ...collegeForm, placementRate: e.target.value })} className="w-full bg-white border rounded-lg px-2.5 py-1.5 outline-none font-bold text-xs focus:border-[#0B192C]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Top Recruiters (Comma Separated)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Google, Microsoft, TCS, Infosys, Amazon, Wipro"
                      value={Array.isArray(collegeForm.recruiters) ? collegeForm.recruiters.join(', ') : ''} 
                      onChange={(e) => setCollegeForm({ ...collegeForm, recruiters: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} 
                      className="w-full bg-slate-50 border rounded-xl px-3 py-2 outline-none focus:border-[#0B192C]" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Short Catchy Description</label>
                    <input required type="text" value={collegeForm.shortDescription} onChange={(e) => setCollegeForm({ ...collegeForm, shortDescription: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-2 outline-none focus:border-[#0B192C]" />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Detailed About College & Campus Life</label>
                    <textarea rows={3} value={collegeForm.about} onChange={(e) => setCollegeForm({ ...collegeForm, about: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-2 outline-none focus:border-[#0B192C]" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500">Hostel & Accommodation</label>
                      <input type="text" placeholder="e.g. AC & Non-AC Hostels with Wi-Fi" value={collegeForm.hostelInfo || ''} onChange={(e) => setCollegeForm({ ...collegeForm, hostelInfo: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-2 outline-none focus:border-[#0B192C]" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500">Key Infrastructure (Comma Separated)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. AI Lab, Central Library, Sports Arena"
                        value={Array.isArray(collegeForm.infrastructure) ? collegeForm.infrastructure.join(', ') : ''} 
                        onChange={(e) => setCollegeForm({ ...collegeForm, infrastructure: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} 
                        className="w-full bg-slate-50 border rounded-xl px-3 py-2 outline-none focus:border-[#0B192C]" 
                      />
                    </div>
                  </div>

                  {/* COURSE & DEGREE STREAMS LINKED TO HOME PAGE SEARCH FILTER */}
                  <div className="space-y-3 bg-blue-50/60 p-4 rounded-2xl border border-blue-200/80">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                          <Filter className="h-4 w-4 text-[#0057D9]" />
                          <span>Course & Degree Streams (Linked to Home Page Filter)</span>
                        </h4>
                        <p className="text-[10px] text-slate-600 mt-0.5">
                          Tag the degree streams this campus offers so it appears when visitors filter by stream on the Welcome Page.
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-[#0057D9] text-white font-bold rounded-lg text-[10px] shrink-0 shadow-2xs">
                        {((collegeForm.courseStreams && collegeForm.courseStreams.length > 0)
                          ? collegeForm.courseStreams
                          : deriveCourseStreamsFromCollege(collegeForm)).length} Linked
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {DEFAULT_COURSE_STREAMS.map((stream) => {
                        const activeStreams = (collegeForm.courseStreams && collegeForm.courseStreams.length > 0)
                          ? collegeForm.courseStreams
                          : deriveCourseStreamsFromCollege(collegeForm);
                        const isSelected = activeStreams.includes(stream);

                        return (
                          <button
                            key={stream}
                            type="button"
                            onClick={() => handleToggleCourseStream(stream)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#0057D9] text-white shadow-2xs scale-102'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                          >
                            <CheckSquare className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-slate-300'}`} />
                            <span>{stream}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* OFFERED PROGRAMS DYNAMIC MANAGEMENT SECTION */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                          <GraduationCap className="h-4 w-4 text-[#0057D9]" />
                          <span>Offered Programs & Degrees</span>
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Add, configure, or remove degree and diploma programs offered by this campus.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCourse}
                        className="px-3 py-1.5 bg-[#0057D9] hover:bg-[#004dc2] text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Program</span>
                      </button>
                    </div>

                    {(!collegeForm.courses || collegeForm.courses.length === 0) ? (
                      <div className="p-4 bg-white border border-dashed border-slate-300 rounded-xl text-center space-y-2">
                        <p className="text-xs text-slate-400 font-medium">No programs added yet.</p>
                        <button
                          type="button"
                          onClick={handleAddCourse}
                          className="px-3 py-1 bg-blue-50 text-blue-600 font-bold rounded-lg text-xs hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                          + Add First Program
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {collegeForm.courses.map((course, idx) => (
                          <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
                            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                                <BookOpen className="h-3 w-3 text-blue-600" />
                                Program #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCourse(idx)}
                                className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-semibold"
                                title="Remove Program"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                              {/* Program Title */}
                              <div className="sm:col-span-5 space-y-0.5">
                                <label className="text-[10px] font-bold text-slate-600 block">Program Title / Course Name</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. B.Tech Computer Engineering"
                                  value={course.name || ''}
                                  onChange={(e) => handleUpdateCourse(idx, 'name', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-[#0057D9] outline-none"
                                />
                              </div>

                              {/* Duration */}
                              <div className="sm:col-span-3 space-y-0.5">
                                <label className="text-[10px] font-bold text-slate-600 block">Duration</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 4 Years"
                                  value={course.duration || ''}
                                  onChange={(e) => handleUpdateCourse(idx, 'duration', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-[#0057D9] outline-none"
                                />
                              </div>

                              {/* Mode / Type */}
                              <div className="sm:col-span-4 space-y-0.5">
                                <label className="text-[10px] font-bold text-slate-600 block">Degree / Mode Type</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Full-Time Degree"
                                  value={course.type || 'Full-Time Degree'}
                                  onChange={(e) => handleUpdateCourse(idx, 'type', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-[#0057D9] outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button type="submit" className="w-full py-3 bg-[#0B192C] hover:bg-[#1E293B] text-white font-bold rounded-xl shadow-lg transition-all">
                    {editingCollege ? "Save Changes" : "Register Campus"}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 2: APPROVED CREDENTIALS MODAL */}
        <AnimatePresence>
          {showCredsModal && credsData && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div 
                className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-100 shadow-2xl text-center space-y-6"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
              >
                <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-950">Student Approved!</h3>
                  <p className="text-xs text-slate-500">Credentials have been generated and dispatched to the student's notification center.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border text-left space-y-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Login ID:</span>
                    <span className="font-bold text-slate-950">{credsData.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Password:</span>
                    <span className="font-bold text-slate-950">{credsData.password}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setShowCredsModal(false)} 
                  className="w-full py-3 bg-[#0B192C] text-white font-bold text-xs rounded-xl"
                >
                  Close & Refresh List
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 3: EXAM CREATION & SCHEDULING (Spec #1, #5, #10) */}
        <AnimatePresence>
          {showExamModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
              <motion.div 
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-100 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-[#0057D9] rounded-2xl border border-blue-200">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">
                        {editingExamId ? "Edit Examination Schedule & Policy" : "Create New Entrance Assessment"}
                      </h3>
                      <p className="text-[11px] text-slate-400">Configure duration, booking window, fees, and results publication</p>
                    </div>
                  </div>
                  <button onClick={() => setShowExamModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleExamSubmit} className="space-y-4 text-xs">
                  {/* Title */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700">Examination Title / Name *</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. NACAT Scholarship & Admission Assessment"
                      value={examForm.title || ''} 
                      onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none font-bold text-slate-900 focus:border-[#0057D9]" 
                    />
                  </div>

                  {/* Description / Instructions */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-700">Description & Candidate Instructions</label>
                    <textarea 
                      rows={2}
                      placeholder="Special instructions for students, proctoring guidelines, syllabus overview..."
                      value={examForm.description || ''} 
                      onChange={(e) => setExamForm({ ...examForm, description: e.target.value })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 outline-none text-xs text-slate-700 focus:border-[#0057D9]" 
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Course Stream */}
                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-700">Target Stream / Course</label>
                      <input 
                        required 
                        type="text" 
                        value={examForm.course || 'All Streams'} 
                        onChange={(e) => setExamForm({ ...examForm, course: e.target.value })} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 outline-none font-semibold text-slate-800 focus:border-[#0057D9]" 
                      />
                    </div>

                    {/* Official Exam Date (Syncs with Welcome Page) */}
                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-700 flex items-center justify-between">
                        <span>Official Exam Date *</span>
                        <span className="text-[10px] text-[#0057D9] font-bold">Welcome Banner</span>
                      </label>
                      <input 
                        required 
                        type="text" 
                        placeholder="e.g. 20 November 2026"
                        value={examForm.date || ''} 
                        onChange={(e) => setExamForm({ ...examForm, date: e.target.value })} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 outline-none font-bold text-slate-900 focus:border-[#0057D9]" 
                      />
                    </div>

                    {/* Status (Spec #1) */}
                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-700">Release Status *</label>
                      <select 
                        value={examForm.status || 'Registration Open'} 
                        onChange={(e) => setExamForm({ ...examForm, status: e.target.value as ExamStatus })} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 outline-none font-bold text-slate-800 focus:border-[#0057D9]"
                      >
                        <option value="Draft">Draft (Internal Only - Not Visible to Students)</option>
                        <option value="Published">Published (Released)</option>
                        <option value="Registration Open">Registration Open (Visible & Booking Active)</option>
                        <option value="Booking Open">Booking Open</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Live">Live (Exam Window Ongoing)</option>
                        <option value="Completed">Completed</option>
                        <option value="Results Scheduled">Results Scheduled</option>
                        <option value="Results Published">Results Published</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  {/* DURATION, PASSING PERCENTAGE, AND FEE (Spec #1, #3, #5) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-700 block">Exam Duration</label>
                      <div className="flex items-center gap-1.5">
                        <input 
                          required 
                          type="number" 
                          min={15} 
                          max={360} 
                          value={examForm.durationMinutes || 120} 
                          onChange={(e) => setExamForm({ ...examForm, durationMinutes: Number(e.target.value) })} 
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none font-extrabold text-slate-900 focus:border-[#0057D9]" 
                        />
                        <span className="text-[11px] font-bold text-slate-400">Mins</span>
                      </div>
                      <div className="flex gap-1 pt-0.5">
                        {[30, 60, 120, 180].map(mins => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => setExamForm({ ...examForm, durationMinutes: mins })}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                              examForm.durationMinutes === mins ? 'bg-[#0057D9] text-white border-[#0057D9]' : 'bg-white text-slate-600 border-slate-200'
                            }`}
                          >
                            {mins >= 60 ? `${mins/60}h` : `${mins}m`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-700 block">Pass Cutoff (%)</label>
                      <div className="flex items-center gap-1.5">
                        <input 
                          required 
                          type="number" 
                          min={20} 
                          max={90} 
                          value={examForm.passPercentage || 50} 
                          onChange={(e) => setExamForm({ ...examForm, passPercentage: Number(e.target.value) })} 
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none font-extrabold text-slate-900 focus:border-[#0057D9]" 
                        />
                        <span className="text-[11px] font-bold text-slate-400">%</span>
                      </div>
                      <p className="text-[9px] text-slate-400">Scores &ge; 50% view marks; &lt;50% show PASS</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-700 block">Exam Fee (₹)</label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-400">₹</span>
                        <input 
                          required 
                          type="number" 
                          min={0} 
                          value={examForm.fee !== undefined ? examForm.fee : 500} 
                          onChange={(e) => setExamForm({ ...examForm, fee: Number(e.target.value) })} 
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none font-extrabold text-emerald-700 focus:border-[#0057D9]" 
                        />
                      </div>
                      <p className="text-[9px] text-slate-400">Paid by student before slot selection</p>
                    </div>
                  </div>

                  {/* SCHEDULING & PUBLICATION DATES (Spec #1, #2, #10) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-700 block">Booking Start Date</label>
                      <input 
                        type="date" 
                        value={examForm.bookingStart ? examForm.bookingStart.slice(0, 10) : '2026-10-15'} 
                        onChange={(e) => setExamForm({ ...examForm, bookingStart: e.target.value })} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none text-xs text-slate-800 focus:border-[#0057D9]" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-700 block">Last Date for Booking</label>
                      <input 
                        type="date" 
                        value={examForm.bookingEnd ? examForm.bookingEnd.slice(0, 10) : '2026-10-20'} 
                        onChange={(e) => setExamForm({ ...examForm, bookingEnd: e.target.value })} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none text-xs text-slate-800 focus:border-[#0057D9]" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-700 block">Result Publication Date *</label>
                      <input 
                        type="date" 
                        value={examForm.resultPublishAt ? examForm.resultPublishAt.slice(0, 10) : '2026-10-25'} 
                        onChange={(e) => setExamForm({ ...examForm, resultPublishAt: e.target.value })} 
                        className="w-full bg-slate-50 border border-purple-200 rounded-xl px-3 py-2 outline-none text-xs font-bold text-purple-900 focus:border-purple-600" 
                      />
                    </div>
                  </div>

                  {/* Question Bank Notice */}
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-slate-700 flex items-start gap-3">
                    <BookOpen className="h-4 w-4 text-[#0057D9] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold text-slate-900 block">Standard Aptitude Question Bank Included</span>
                      <p className="text-[11px] text-slate-600 leading-normal">
                        Includes standard multi-choice questions assessing speed, series logic, data structures, compound interest, and verbal reasoning with verified answer keys.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowExamModal(false)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-2 py-3 bg-[#0B192C] hover:bg-[#1E293B] text-white font-extrabold rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4 text-amber-400" />
                      {editingExamId ? "Update Examination & Settings" : "Save & Release Examination"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: SUPER ADMIN EXAM PUBLISHING & TIME SLOT SCHEDULER */}
        <AnimatePresence>
          {showPublishModal && publishingExam && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
              <motion.div 
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-100 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">
                        Publish Examination & Decide Time Slots
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Set official exam date, student booking window, and candidate time slots for <strong className="text-slate-800">{publishingExam.title}</strong>
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowPublishModal(false)} 
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Live Synchronization Notice */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-50/90 to-blue-50/90 border border-emerald-200/80 rounded-2xl flex items-start gap-3">
                  <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong>Live Welcome Page Sync:</strong> Once published, the <strong>Examination Date</strong> and all <strong>Configured Time Slots</strong> decided below will immediately appear on the Public Portal Welcome Page and open in the Student Booking Dashboard.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Examination Official Date */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-[#0057D9]" />
                        Official Examination Date (Promoted on Welcome Page) *
                      </label>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                        Welcome Banner
                      </span>
                    </div>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 20 November 2026"
                      value={publishExamDate} 
                      onChange={(e) => {
                        const newD = e.target.value;
                        setPublishExamDate(newD);
                        setPublishSlotDate(newD);
                      }} 
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 font-black text-slate-900 text-sm focus:border-[#0057D9] outline-none" 
                    />
                    <p className="text-[11px] text-slate-500">
                      Format: Date Month Year (e.g., <strong>20 November 2026</strong> or <strong>15 December 2026</strong>). This exact date string is highlighted on the website header.
                    </p>
                  </div>

                  {/* Booking Window & Result Announcement Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-700 block">Candidate Booking Starts</label>
                      <input 
                        type="date" 
                        value={publishBookingStart} 
                        onChange={(e) => setPublishBookingStart(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none text-xs text-slate-800 font-semibold focus:border-[#0057D9]" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-700 block">Candidate Booking Ends</label>
                      <input 
                        type="date" 
                        value={publishBookingEnd} 
                        onChange={(e) => setPublishBookingEnd(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none text-xs text-slate-800 font-semibold focus:border-[#0057D9]" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-700 block">Result Publication Date</label>
                      <input 
                        type="date" 
                        value={publishResultDate} 
                        onChange={(e) => setPublishResultDate(e.target.value)} 
                        className="w-full bg-slate-50 border border-purple-200 rounded-xl px-3 py-2 outline-none text-xs text-purple-900 font-bold focus:border-purple-600" 
                      />
                    </div>
                  </div>

                  {/* TIME SLOTS SECTION */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-black text-slate-900 text-sm block">
                          Time Slots Decided by Super Admin
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Students will select one of these slots during assessment application
                        </span>
                      </div>
                      <span className="px-2.5 py-1 bg-[#0057D9]/10 text-[#0057D9] font-black rounded-full text-xs">
                        {publishSlots.length} Slots Configured
                      </span>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Quick Slot Presets:</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddPresetSlot('10:00 AM', '12:00 PM')}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0057D9] font-bold rounded-lg border border-blue-200 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                          Morning (10:00 AM – 12:00 PM)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddPresetSlot('02:00 PM', '04:00 PM')}
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                          Afternoon (02:00 PM – 04:00 PM)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddPresetSlot('06:00 PM', '08:00 PM')}
                          className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-lg border border-purple-200 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                          Evening (06:00 PM – 08:00 PM)
                        </button>
                      </div>
                    </div>

                    {/* Configured Slots Cards */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {publishSlots.map((slot, index) => (
                        <div key={slot.id || index} className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 flex items-center justify-between transition-colors">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 text-xs">{slot.date}</span>
                              <span className="px-2 py-0.5 rounded-md bg-blue-100/70 text-[#0057D9] font-black text-[10px] flex items-center gap-1 font-mono">
                                <Clock className="h-3 w-3" />
                                {slot.startTime} &ndash; {slot.endTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                              <span>Max Capacity: <strong className="text-slate-800">{slot.capacity} seats</strong></span>
                              <span>&bull;</span>
                              <span>Booked: <strong className="text-emerald-700">{slot.bookedCount || 0} students</strong></span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteSlotFromPublish(slot.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete this slot"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      {publishSlots.length === 0 && (
                        <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl text-slate-400">
                          <Clock className="h-8 w-8 mx-auto mb-1 text-slate-300" />
                          <p className="font-bold">No examination slots created yet.</p>
                          <p className="text-[11px]">Click a preset above or enter custom slot timings below.</p>
                        </div>
                      )}
                    </div>

                    {/* Custom Slot Addition Row */}
                    <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-200/80 space-y-2.5">
                      <span className="font-extrabold text-slate-800 text-[11px] block">
                        Add Custom Slot Timings:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">Slot Date</label>
                          <input 
                            type="text" 
                            value={publishSlotDate} 
                            onChange={(e) => setPublishSlotDate(e.target.value)} 
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 text-xs outline-none" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">Start Time</label>
                          <input 
                            type="text" 
                            placeholder="10:00 AM"
                            value={publishSlotStartTime} 
                            onChange={(e) => setPublishSlotStartTime(e.target.value)} 
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 text-xs outline-none" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">End Time</label>
                          <input 
                            type="text" 
                            placeholder="12:00 PM"
                            value={publishSlotEndTime} 
                            onChange={(e) => setPublishSlotEndTime(e.target.value)} 
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 text-xs outline-none" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">Seat Capacity</label>
                          <input 
                            type="number" 
                            min={1}
                            value={publishSlotCapacity} 
                            onChange={(e) => setPublishSlotCapacity(Number(e.target.value))} 
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 text-xs outline-none" 
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddSlotToPublish}
                        className="w-full py-2 bg-[#0057D9] hover:bg-[#004dc2] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add This Slot to Schedule
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowPublishModal(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingPublish}
                    onClick={handleConfirmPublishExam}
                    className="flex-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50"
                  >
                    {isSubmittingPublish ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Publish Exam & Update Welcome Page
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: TIME SLOT MANAGER (Spec #4) */}
        <AnimatePresence>
          {showSlotModal && selectedExamForSlots && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div 
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-100 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <h3 className="font-black text-slate-900 text-lg">Exam Slot Scheduling Desk</h3>
                    <p className="text-xs text-slate-400">{selectedExamForSlots.title}</p>
                  </div>
                  <button onClick={() => setShowSlotModal(false)} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
                </div>

                {/* Existing Slots List */}
                <div className="space-y-3">
                  <span className="text-xs font-extrabold text-slate-800 block">Available Slots for Student Selection:</span>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(selectedExamForSlots.slots || []).map((slot) => (
                      <div key={slot.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-slate-900 block">{slot.date}</span>
                          <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-[#0057D9]" />
                            {slot.startTime} – {slot.endTime}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Capacity: {slot.capacity} seats ({slot.bookedCount || 0} booked)
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteSlotFromExam(slot.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove slot"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {(selectedExamForSlots.slots || []).length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-4">No slots configured yet. Add slots below.</p>
                    )}
                  </div>
                </div>

                {/* Add Slot Form */}
                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80 space-y-3 text-xs">
                  <h4 className="font-extrabold text-slate-900">Add New Examination Slot:</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Slot Date</label>
                      <input 
                        type="text" 
                        value={newSlotDate} 
                        onChange={(e) => setNewSlotDate(e.target.value)} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Candidate Capacity</label>
                      <input 
                        type="number" 
                        value={newSlotCapacity} 
                        onChange={(e) => setNewSlotCapacity(Number(e.target.value))} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Start Time</label>
                      <input 
                        type="text" 
                        value={newSlotStartTime} 
                        onChange={(e) => setNewSlotStartTime(e.target.value)} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">End Time</label>
                      <input 
                        type="text" 
                        value={newSlotEndTime} 
                        onChange={(e) => setNewSlotEndTime(e.target.value)} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 outline-none" 
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddSlotToExam}
                    className="w-full py-2.5 bg-[#0057D9] hover:bg-[#004dc2] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Save & Add Slot
                  </button>
                </div>

                <button
                  onClick={() => setShowSlotModal(false)}
                  className="w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-xl"
                >
                  Done
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: ADMIN STUDENT COLLEGE RECOMMENDATIONS (Spec #14) */}
        <AnimatePresence>
          {showAdminRecModal && selectedStudentForRec && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div 
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-100 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold uppercase tracking-wider">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Human Admissions Recommendation</span>
                    </div>
                    <h3 className="font-black text-slate-900 text-lg">Recommend Partner Colleges</h3>
                    <p className="text-xs text-slate-500">
                      Curate approved college recommendations for <strong>{selectedStudentForRec.fullName}</strong> (ID: {selectedStudentForRec.id})
                    </p>
                  </div>
                  <button onClick={() => setShowAdminRecModal(false)} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
                </div>

                {/* Toast Feedback */}
                {adminRecToast && (
                  <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>{adminRecToast}</span>
                  </div>
                )}

                {/* Form to Add Recommendation */}
                <form onSubmit={handleAddAdminRec} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5 text-xs">
                  <h4 className="font-extrabold text-slate-900">Dispatch New Recommendation:</h4>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Select Accredited Partner College *</label>
                    <select
                      required
                      value={adminRecCollegeId}
                      onChange={(e) => setAdminRecCollegeId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none font-bold text-slate-900 focus:border-[#0057D9]"
                    >
                      <option value="">-- Choose from {colleges.length} Partner Campuses --</option>
                      {colleges.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} &bull; {c.city}, {c.state} (NAAC: {c.naacGrade})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Advisory / Recommendation Note</label>
                    <textarea
                      rows={2}
                      value={adminRecNote}
                      onChange={(e) => setAdminRecNote(e.target.value)}
                      placeholder="e.g. Strongly recommended based on strong aptitude score in Computer Science and excellent campus placement."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 outline-none text-xs text-slate-700 focus:border-[#0057D9]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!adminRecCollegeId || adminRecSubmitting}
                    className="w-full py-3 bg-[#0B192C] hover:bg-[#1E293B] disabled:opacity-50 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    {adminRecSubmitting ? "Dispatching..." : "Send Official Recommendation to Student"}
                  </button>
                </form>

                {/* Currently Recommended Colleges */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-xs">Active Recommendations for this Student ({studentRecs.length}):</h4>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {studentRecs.map((rec) => (
                      <div key={rec.id} className="p-3.5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <h5 className="font-black text-slate-900">{rec.college?.name || rec.collegeId}</h5>
                          <p className="text-[11px] text-slate-500 italic">"{rec.note}"</p>
                          <span className="text-[10px] text-purple-600 font-bold block">
                            By {rec.recommendedBy} ({rec.recommendedRole}) &bull; {new Date(rec.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteAdminRec(rec.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Revoke recommendation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {studentRecs.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-4">No colleges recommended to this student yet.</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAdminRecModal(false)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close Desk
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 4: DISPATCH ANNOUNCEMENT */}
        <AnimatePresence>
          {showNotifModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div 
                className="bg-white rounded-3xl p-6 max-w-md w-full border shadow-2xl space-y-4"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
              >
                <div className="flex justify-between items-center pb-2 border-b">
                  <h3 className="font-bold text-sm">Dispatch News Announcement</h3>
                  <button onClick={() => setShowNotifModal(false)}><X className="h-4 w-4" /></button>
                </div>

                <form onSubmit={handleNotifSubmit} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Announcement Title</label>
                    <input required type="text" value={notifForm.title} onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-2 outline-none focus:border-[#0B192C]" />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Type Category</label>
                    <select value={notifForm.type} onChange={(e) => setNotifForm({ ...notifForm, type: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-2 outline-none focus:border-[#0B192C]">
                      <option value="info">Information (Blue)</option>
                      <option value="alert">Alert (Red)</option>
                      <option value="success">Success Milestone (Green)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Message Content</label>
                    <textarea required rows={3} value={notifForm.message} onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-2 outline-none focus:border-[#0B192C]" />
                  </div>

                  <button type="submit" className="w-full py-3 bg-[#0B192C] hover:bg-[#1E293B] text-white font-bold rounded-xl shadow-lg transition-all">
                    Dispatch to Student Inboxes
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 5: TEST SUBMISSION REVIEW & MARKS GRADING CONSOLE */}
        <AnimatePresence>
          {showReviewModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6" id="test-grading-modal">
              <motion.div 
                className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full border border-slate-100 max-h-[92vh] flex flex-col"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                {/* Modal Header */}
                <div className="bg-[#0A192F] p-6 text-white flex justify-between items-start shrink-0 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider">
                        Examiner Grading Console
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        gradingForm.evaluationStatus === 'Graded & Verified' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {gradingForm.evaluationStatus}
                      </span>
                    </div>
                    <h2 className="text-lg font-black text-white">
                      {reviewData?.student?.fullName || reviewData?.attempt?.studentName || 'Student Test Paper Review'}
                    </h2>
                    <p className="text-xs text-slate-400 flex items-center gap-4">
                      <span>Student ID: <strong className="text-slate-200 font-mono">{reviewData?.attempt?.studentId}</strong></span>
                      <span>Exam: <strong className="text-slate-200">{reviewData?.exam?.title || reviewData?.attempt?.examTitle}</strong></span>
                      <span>Course: <strong className="text-amber-400">{reviewData?.student?.interestedCourse || reviewData?.attempt?.studentCourse}</strong></span>
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowReviewModal(false)}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {reviewLoading ? (
                  <div className="py-20 text-center space-y-3">
                    <RefreshCw className="h-8 w-8 text-[#0B192C] animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 font-bold font-mono">Loading student submission & answer sheet...</p>
                  </div>
                ) : (
                  <form onSubmit={handleSaveGrading} className="flex flex-col flex-1 overflow-hidden">
                    
                    {/* Live Score Summary Banner */}
                    <div className="bg-slate-100/90 border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0">
                      <div className="flex items-center gap-6">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Total Score</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-900">{gradingForm.score}</span>
                            <span className="text-xs font-bold text-slate-500">/ {gradingForm.maxScore} marks</span>
                          </div>
                        </div>

                        <div className="h-8 w-px bg-slate-300"></div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Percentage</span>
                          <span className="text-xl font-black text-slate-900">{gradingForm.percentage}%</span>
                        </div>

                        <div className="h-8 w-px bg-slate-300"></div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Result Grade</span>
                          <span className={`px-2.5 py-0.5 rounded text-xs font-black uppercase ${
                            gradingForm.passed ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {gradingForm.passed ? 'PASSED (QUALIFIED)' : 'FAILED (BELOW CUTOFF)'}
                          </span>
                        </div>
                      </div>

                      {/* Quick Auto-Scoring Toolbars */}
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={handleAutoScoreFromKey}
                          className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1 shadow-sm transition-all"
                          title="Recalculate marks automatically based on predefined official answers"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                          Auto-Score from Key
                        </button>
                        <button 
                          type="button"
                          onClick={handleAwardFullMarksAll}
                          className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1 shadow-sm transition-all"
                        >
                          <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
                          Full Marks (10/10)
                        </button>
                      </div>
                    </div>

                    {/* Scrollable Questions & Submissions List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      
                      {/* Section Title */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-[#0B192C]" />
                          Question by Question Answer Verification & Grading
                        </h4>
                        <span className="text-xs text-slate-400 font-semibold">
                          {reviewData?.exam?.questions.length || 0} Questions Evaluated
                        </span>
                      </div>

                      {/* Render All Exam Questions */}
                      {reviewData?.exam?.questions.map((q, idx) => {
                        const studentAnswers = reviewData?.attempt?.answers?.[q.id] || [];
                        const correctAnswers = q.correctAnswers || [];
                        const currentMark = gradingForm.questionMarks[q.id] !== undefined ? gradingForm.questionMarks[q.id] : 0;
                        const feedback = gradingForm.questionFeedback[q.id] || '';

                        return (
                          <div 
                            key={q.id} 
                            className={`p-5 rounded-2xl border transition-all space-y-4 ${
                              currentMark > 0 ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50/70 border-slate-200'
                            }`}
                          >
                            {/* Question Header */}
                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="h-6 w-6 rounded-full bg-[#0B192C] text-white flex items-center justify-center text-xs font-bold">
                                    {idx + 1}
                                  </span>
                                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                    {q.type}
                                  </span>
                                  <span className="text-xs text-slate-400">ID: {q.id}</span>
                                </div>
                                <p className="text-sm font-bold text-slate-900 pt-1 leading-relaxed">
                                  {q.text}
                                </p>
                              </div>

                              {/* Marks Allocation Widget */}
                              <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 space-y-2 shrink-0 text-right">
                                <span className="text-[10px] text-slate-500 font-extrabold uppercase block tracking-wider">
                                  Awarded Mark
                                </span>
                                <div className="flex items-center justify-end gap-1.5">
                                  <input 
                                    type="number"
                                    min="0"
                                    max="5"
                                    step="0.5"
                                    value={currentMark}
                                    onChange={(e) => handleUpdateQuestionMark(q.id, Number(e.target.value))}
                                    className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm font-black text-center text-slate-900 outline-none focus:border-[#0B192C]"
                                  />
                                  <span className="text-xs font-bold text-slate-500">/ 1.0</span>
                                </div>
                                {/* Quick Mark Preset Buttons */}
                                <div className="flex justify-end gap-1 pt-1">
                                  <button 
                                    type="button"
                                    onClick={() => handleUpdateQuestionMark(q.id, 0)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                      currentMark === 0 ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    0
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => handleUpdateQuestionMark(q.id, 0.5)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                      currentMark === 0.5 ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    0.5
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => handleUpdateQuestionMark(q.id, 1)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                      currentMark === 1 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    1.0
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Options List with Student Selection & Key Highlight */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                              {q.options.map(opt => {
                                const isStudentChoice = studentAnswers.includes(opt.id);
                                const isOfficialKey = correctAnswers.includes(opt.id);

                                return (
                                  <div 
                                    key={opt.id}
                                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                                      isStudentChoice && isOfficialKey ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold' :
                                      isStudentChoice && !isOfficialKey ? 'bg-rose-50 border-rose-300 text-rose-950' :
                                      isOfficialKey ? 'bg-emerald-50/50 border-dashed border-emerald-400 text-emerald-900' :
                                      'bg-white border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <span className="font-mono font-bold uppercase text-[11px] text-slate-500">[{opt.id}]</span>
                                      <span>{opt.text}</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                      {isStudentChoice && (
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                          isOfficialKey ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                                        }`}>
                                          Student Answer
                                        </span>
                                      )}
                                      {isOfficialKey && !isStudentChoice && (
                                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                                          Correct Key
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Question Specific Note */}
                            <div className="pt-2">
                              <input 
                                type="text"
                                placeholder="Add specific examiner note for Question..."
                                value={feedback}
                                onChange={(e) => handleUpdateQuestionFeedback(q.id, e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-[#0B192C]"
                              />
                            </div>
                          </div>
                        );
                      })}

                      {/* Overall Evaluation, Remarks and Publication Settings */}
                      <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
                        <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <Award className="h-4 w-4 text-amber-500" />
                          Final Examiner Verdict & Publishing Controls
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600">Evaluation Status</label>
                            <select 
                              value={gradingForm.evaluationStatus}
                              onChange={(e) => setGradingForm({ ...gradingForm, evaluationStatus: e.target.value as any })}
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#0B192C]"
                            >
                              <option value="Pending Review">Pending Review</option>
                              <option value="Under Review">Under Review</option>
                              <option value="Graded & Verified">Graded & Verified (Recommended)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600">Chief Examiner / Reviewer Name</label>
                            <input 
                              type="text"
                              required
                              value={gradingForm.evaluatorName}
                              onChange={(e) => setGradingForm({ ...gradingForm, evaluatorName: e.target.value })}
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#0B192C]"
                            />
                          </div>
                        </div>

                        {/* Presets for Examiner Remarks */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-600">Official Examiner Remarks & Feedback</label>
                            <span className="text-[10px] text-slate-400">Click tags below to append comments</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              'High Analytical Aptitude',
                              'Strong Logical Reasoning',
                              'Recommended for Merit Scholarship',
                              'Needs Practice in Core Maths',
                              'Verified by Central Examination Cell'
                            ].map(tag => (
                              <button 
                                key={tag}
                                type="button"
                                onClick={() => handleAppendRemarkTag(tag)}
                                className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-colors"
                              >
                                + {tag}
                              </button>
                            ))}
                          </div>
                          <textarea 
                            rows={3}
                            value={gradingForm.evaluatorRemarks}
                            onChange={(e) => setGradingForm({ ...gradingForm, evaluatorRemarks: e.target.value })}
                            placeholder="Type formal feedback for student scorecard..."
                            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-[#0B192C]"
                          />
                        </div>

                        {/* Checkbox Options */}
                        <div className="flex flex-wrap gap-6 pt-2 text-xs font-bold text-slate-700">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={gradingForm.isPublished}
                              onChange={(e) => setGradingForm({ ...gradingForm, isPublished: e.target.checked })}
                              className="rounded border-slate-300 text-[#0B192C] focus:ring-0 h-4 w-4"
                            />
                            Publish Scorecard to Student Dashboard Immediately
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={gradingForm.sendNotification}
                              onChange={(e) => setGradingForm({ ...gradingForm, sendNotification: e.target.checked })}
                              className="rounded border-slate-300 text-[#0B192C] focus:ring-0 h-4 w-4"
                            />
                            Dispatch Official Result Notification to Student Inbox
                          </label>
                        </div>

                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex justify-between items-center shrink-0">
                      <button 
                        type="button"
                        onClick={() => setShowReviewModal(false)}
                        className="px-5 py-2.5 bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-xl font-bold text-xs transition-all"
                      >
                        Cancel
                      </button>

                      <div className="flex items-center gap-3">
                        <button 
                          type="submit"
                          className="px-6 py-2.5 bg-[#0B192C] hover:bg-[#1E293B] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
                        >
                          <Save className="h-4 w-4 text-amber-400" />
                          Save & Publish Test Evaluation
                        </button>
                      </div>
                    </div>

                  </form>
                )}

              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: CREATE USER ACCOUNT (SUPER ADMIN & ADMIN) */}
        <AnimatePresence>
          {showUserModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div 
                className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full border border-slate-100 flex flex-col"
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
              >
                <div className="bg-[#0A192F] p-6 text-white flex justify-between items-center shrink-0 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/30">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white">Create Platform Account</h3>
                      <p className="text-[10px] text-slate-400">Authorize a new Super Admin, Admin, Counselor, or Student</p>
                    </div>
                  </div>
                  <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
                </div>

                <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Account Role</label>
                    <select 
                      value={userForm.role} 
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-bold text-slate-800 focus:border-purple-600"
                    >
                      {userRole === 'super_admin' && <option value="super_admin">Super Administrator (Full System Authority)</option>}
                      <option value="admin">Administrator (Exams, Colleges, Admissions)</option>
                      <option value="counsellor">Counselor (Student Mentorship & Guidance)</option>
                      <option value="student">Student (Candidate Aspirant)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Full Name</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Dr. Rajesh Sharma"
                      value={userForm.fullName} 
                      onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-purple-600" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Username / Login ID</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="e.g. rajesh_counsel"
                        value={userForm.username} 
                        onChange={(e) => setUserForm({ ...userForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') })} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-mono focus:border-purple-600" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Login Password</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="e.g. pass123"
                        value={userForm.password} 
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-mono focus:border-purple-600" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Official Email</label>
                      <input 
                        type="email" 
                        placeholder="rajesh@educonnect.in"
                        value={userForm.email} 
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-purple-600" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Mobile Phone</label>
                      <input 
                        type="tel" 
                        placeholder="+91 98765 43210"
                        value={userForm.mobile} 
                        onChange={(e) => setUserForm({ ...userForm, mobile: e.target.value })} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-mono focus:border-purple-600" 
                      />
                    </div>
                  </div>

                  {userForm.role === 'counsellor' && (
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Counseling Specialization</label>
                      <input 
                        type="text" 
                        placeholder="e.g. B.Tech Engineering & IIT Admissions"
                        value={userForm.specialization} 
                        onChange={(e) => setUserForm({ ...userForm, specialization: e.target.value })} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-purple-600" 
                      />
                    </div>
                  )}

                  <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                    <button 
                      type="button" 
                      onClick={() => setShowUserModal(false)}
                      className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Check className="h-4 w-4" />
                      Create Account
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: CONFIRM USER SUSPEND / REACTIVATE / DELETE (User Request) */}
        <AnimatePresence>
          {confirmModalData.isOpen && confirmModalData.user && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div 
                className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full border border-slate-200 flex flex-col"
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
              >
                {/* Modal Header */}
                <div className={`p-6 border-b text-white flex items-center justify-between ${
                  confirmModalData.type === 'delete' 
                    ? 'bg-gradient-to-r from-rose-700 to-rose-900 border-rose-800' 
                    : confirmModalData.type === 'suspend'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 border-amber-800'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-700 border-emerald-800'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md">
                      {confirmModalData.type === 'delete' ? (
                        <Trash2 className="h-6 w-6 text-white" />
                      ) : confirmModalData.type === 'suspend' ? (
                        <Ban className="h-6 w-6 text-white" />
                      ) : (
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-white">
                        {confirmModalData.type === 'delete' && 'Delete User Account'}
                        {confirmModalData.type === 'suspend' && 'Suspend User Account'}
                        {confirmModalData.type === 'reactivate' && 'Reactivate User Account'}
                      </h3>
                      <p className="text-xs text-white/80">
                        Target System Role: <strong className="uppercase">{confirmModalData.user.role.replace('_', ' ')}</strong>
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setConfirmModalData({ isOpen: false, type: 'suspend', user: null })}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4">
                  {/* User Profile Summary */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Account Name</span>
                      <span className="text-xs font-bold text-slate-900">{confirmModalData.user.fullName || 'User'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Username</span>
                      <span className="text-xs font-mono font-bold text-slate-700">@{confirmModalData.user.username}</span>
                    </div>
                    {confirmModalData.user.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Email</span>
                        <span className="text-xs text-slate-600">{confirmModalData.user.email}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Current Status</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        confirmModalData.user.status === 'suspended' || confirmModalData.user.isSuspended
                          ? 'bg-rose-100 text-rose-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {confirmModalData.user.status === 'suspended' || confirmModalData.user.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </div>
                  </div>

                  {/* Warning message */}
                  <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                    confirmModalData.type === 'delete'
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : confirmModalData.type === 'suspend'
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}>
                    {confirmModalData.type === 'delete' && (
                      <p>
                        <strong>Warning:</strong> Deleting this account will permanently erase their credentials, allocated roles, and access rights from the platform. This action <strong>cannot be undone</strong>.
                      </p>
                    )}
                    {confirmModalData.type === 'suspend' && (
                      <p>
                        <strong>Account Suspension:</strong> Suspending this user will immediately revoke login privileges. The user will receive an &quot;Account Suspended&quot; notice upon login until reactivated.
                      </p>
                    )}
                    {confirmModalData.type === 'reactivate' && (
                      <p>
                        <strong>Restore Access:</strong> Reactivating this user will restore their full login privileges and system capabilities according to their role.
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                    <button 
                      type="button" 
                      onClick={() => setConfirmModalData({ isOpen: false, type: 'suspend', user: null })}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      onClick={handleExecuteUserAction}
                      className={`px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                        confirmModalData.type === 'delete'
                          ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                          : confirmModalData.type === 'suspend'
                          ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                          : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                      }`}
                    >
                      {confirmModalData.type === 'delete' && <Trash2 className="h-4 w-4" />}
                      {confirmModalData.type === 'suspend' && <Ban className="h-4 w-4" />}
                      {confirmModalData.type === 'reactivate' && <Check className="h-4 w-4" />}
                      <span>
                        {confirmModalData.type === 'delete' && 'Confirm Delete'}
                        {confirmModalData.type === 'suspend' && 'Confirm Suspension'}
                        {confirmModalData.type === 'reactivate' && 'Confirm Reactivation'}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: ASSIGN COUNSELOR TO STUDENT */}
        <AnimatePresence>
          {showAssignModal && selectedStudentForAssign && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div 
                className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full border border-slate-100 flex flex-col"
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
              >
                <div className="bg-[#0A192F] p-6 text-white flex justify-between items-center shrink-0 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-500/30">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white">Assign Counselor</h3>
                      <p className="text-[10px] text-slate-400">Student: {selectedStudentForAssign.fullName} ({selectedStudentForAssign.id})</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
                </div>

                <form onSubmit={handleAssignCounsellorSubmit} className="p-6 space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Choose Counselor</label>
                    <select 
                      value={assignCounsellorName}
                      onChange={(e) => setAssignCounsellorName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none font-bold text-slate-800 focus:border-blue-600"
                    >
                      {counsellors.map(c => {
                        const name = c.fullName || (c as any).name || 'Academic Counselor';
                        return (
                          <option key={c.id} value={name}>
                            {name} ({c.specialization || 'Career Specialist'})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Counseling Notes / Special Instructions</label>
                    <textarea 
                      rows={4}
                      placeholder="e.g. Candidate scored high in Math aptitude, interested in CSE AI/ML colleges in Gujarat or Andhra Pradesh."
                      value={assignNotes}
                      onChange={(e) => setAssignNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                    <button 
                      type="button" 
                      onClick={() => setShowAssignModal(false)}
                      className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-5 py-2.5 bg-[#0B192C] hover:bg-[#1E293B] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Check className="h-4 w-4 text-amber-400" />
                      Save & Assign
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: INSPECT PASSWORD RESET LOG DETAIL */}
        <AnimatePresence>
          {selectedLogDetail && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div 
                className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full border border-slate-100 flex flex-col"
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
              >
                <div className="bg-[#0A192F] p-6 text-white flex justify-between items-center shrink-0 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
                      <Key className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white">Security Event Inspector</h3>
                      <p className="text-[10px] text-slate-400 font-mono">{selectedLogDetail.id}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedLogDetail(null)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
                  <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Timestamp</span>
                      <span className="font-mono font-bold text-slate-900">{selectedLogDetail.timestamp}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        selectedLogDetail.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                        selectedLogDetail.status === 'FAILED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {selectedLogDetail.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">User Identifier</span>
                      <span className="font-mono font-bold text-slate-900">{selectedLogDetail.userIdentifier}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Email</span>
                      <span className="font-mono text-slate-700">{selectedLogDetail.targetEmail || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Event Type</span>
                      <span className="font-mono text-slate-700">{selectedLogDetail.eventType}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Client IP Address</span>
                      <span className="font-mono text-slate-700">{selectedLogDetail.ipAddress || '127.0.0.1'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivery Platform</span>
                      <span className="font-mono font-bold text-[#0057D9]">
                        {selectedLogDetail.deliveryService === 'sendgrid' ? 'SendGrid Mail API' :
                         selectedLogDetail.deliveryService === 'firebase_auth' ? 'Firebase Authentication' :
                         selectedLogDetail.deliveryService || 'System Default'}
                      </span>
                    </div>
                    {selectedLogDetail.messageId && (
                      <div className="col-span-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Message ID</span>
                        <span className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                          {selectedLogDetail.messageId}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-700 mb-1">Event Narrative & Audit Details</h4>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed font-mono text-[11px]">
                      {selectedLogDetail.details}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-700 mb-1">Raw Log JSON</h4>
                    <pre className="p-3 bg-slate-900 text-amber-300 rounded-xl text-[10px] font-mono overflow-x-auto max-h-40">
                      {JSON.stringify(selectedLogDetail, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(selectedLogDetail, null, 2));
                      alert("Log entry JSON copied to clipboard!");
                    }}
                    className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    <span>Copy JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedLogDetail(null)}
                    className="px-4 py-2 bg-[#0B192C] text-white font-bold rounded-xl text-xs hover:bg-[#1E293B] transition-colors cursor-pointer"
                  >
                    Close Inspector
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
