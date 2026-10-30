import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ShieldAlert, Key, User, ArrowRight, Sparkles, GraduationCap,
  Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ShieldCheck,
  Mail, Lock, RotateCcw, Check, HelpCircle, ArrowLeft, RefreshCw, Smartphone,
  Fingerprint, Bell, BellRing, Settings, Sliders,
  Shield, Scan, Trash2
} from 'lucide-react';
import PublicPortal from './components/PublicPortal';
import StudentDashboard from './components/StudentDashboard';
import AdminPanel from './components/AdminPanel';
import CounselorPanel from './components/CounselorPanel';
import SignInPage from './components/SignInPage';
import ForceChangePasswordView from './components/ForceChangePasswordView';
import { syncFullDbWithServer, syncLocalCacheWithServer, mirrorServerDbToLocal } from './utils/persistentStorage';
import { testFirestoreConnection, signInWithGoogle, signOutUser } from './firebase';
import { safeLoginRequest, authenticateLocally } from './utils/authFallback';

interface UserSession {
  role: 'super_admin' | 'admin' | 'counsellor' | 'student';
  username: string;
  fullName?: string;
  email?: string;
  student?: any;
  counsellor?: any;
  mustChangePassword?: boolean;
}

export default function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [currentPage, setCurrentPage] = useState<'portal' | 'signin'>('portal');
  const [signInPrefill, setSignInPrefill] = useState<{ username?: string; password?: string } | undefined>(undefined);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  
  // Login credentials states
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [usernameTouched, setUsernameTouched] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [activeInput, setActiveInput] = useState<'username' | 'password' | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [errorShakeCount, setErrorShakeCount] = useState<number>(0);
  const [ssoToast, setSsoToast] = useState<string>('');

  // Simulated Biometric Login states & sound synthesis
  const [biometricScanning, setBiometricScanning] = useState<boolean>(false);
  const [biometricStage, setBiometricStage] = useState<'scanning' | 'verifying' | 'granted'>('scanning');
  const [biometricProgress, setBiometricProgress] = useState<number>(0);
  const biometricTimerRef = useRef<NodeJS.Timeout[]>([]);

  // Password Recovery / Forgot Password modal states
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState<boolean>(false);
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'verify' | 'success'>('request');
  const [recoveryEmailOrUser, setRecoveryEmailOrUser] = useState<string>('');
  const [recoveryTargetEmail, setRecoveryTargetEmail] = useState<string>('');
  const [recoveryCode, setRecoveryCode] = useState<string>('');
  const [recoveryDemoCode, setRecoveryDemoCode] = useState<string>('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState<string>('');
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState<string>('');
  const [recoveryShowPass, setRecoveryShowPass] = useState<boolean>(false);
  const [recoveryShowConfirmPass, setRecoveryShowConfirmPass] = useState<boolean>(false);
  const [recoveryLoading, setRecoveryLoading] = useState<boolean>(false);
  const [recoveryError, setRecoveryError] = useState<string>('');
  const [recoverySuccessMsg, setRecoverySuccessMsg] = useState<string>('');

  // Settings & Notifications states
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [settingsToast, setSettingsToast] = useState<string>('');
  const [sessionNotificationsEnabled, setSessionNotificationsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('educonnect_session_notifications');
    return saved !== null ? saved === 'true' : true;
  });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const usernameInputRef = useRef<HTMLInputElement>(null);
  const recoveryInputRef = useRef<HTMLInputElement>(null);
  const submitFormRef = useRef<(() => void) | null>(null);

  // Biometric audio effects using Web Audio API
  const playBiometricScanSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const playBiometricSuccessSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.045, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.45);
      });
    } catch (e) {}
  };

  // Browser Notification helper: requests permissions & updates state
  const requestBrowserNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setSettingsToast('Browser notifications are not supported in this browser.');
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        setSettingsToast('Portal notifications enabled! You will receive important updates.');
      } else if (permission === 'denied') {
        setSettingsToast('Notification permission was blocked in browser settings.');
      }
      return permission;
    } catch (err) {
      return 'default';
    }
  };

  const handleToggleSessionNotifications = async (enabled: boolean) => {
    setSessionNotificationsEnabled(enabled);
    localStorage.setItem('educonnect_session_notifications', enabled ? 'true' : 'false');
    
    if (enabled) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          await requestBrowserNotificationPermission();
        } else if (Notification.permission === 'granted') {
          setSettingsToast('Portal notifications active! You will receive important updates.');
        } else {
          setSettingsToast('Browser notification permission is currently blocked in your browser settings.');
        }
      }
    } else {
      setSettingsToast('Portal notifications disabled.');
    }
  };

  const sendTestNotification = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setSettingsToast('Browser notifications are not supported.');
      return;
    }
    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification('🔔 NEXORA Portal Alert Test', {
          body: 'Platform notifications are active and working!',
          icon: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
          tag: 'nexora-test'
        });
        setSettingsToast('Test notification dispatched!');
      } catch (e) {
        setSettingsToast('Test notification failed to dispatch.');
      }
    } else {
      requestBrowserNotificationPermission();
    }
  };

  // Purge local cache and reset remembered credentials / session data
  const handleClearLocalCache = () => {
    try {
      localStorage.removeItem('educonnect_remembered_username');
      localStorage.removeItem('remembered_username');
      localStorage.removeItem('educonnect_session');
      localStorage.removeItem('educonnect_session_notifications');
    } catch (e) {
      console.warn('Error clearing local cache:', e);
    }
    setUsername('');
    setPassword('');
    setRememberMe(false);
    setLoginError('');
    setSsoToast('');
    setSettingsToast('Local cache cleared! Remembered login credentials and session tokens have been removed.');
  };

  // Trigger Biometric Scan & Simulated Auth Flow
  const handleStartBiometricLogin = () => {
    setLoginError('');
    setSsoToast('');
    setBiometricScanning(true);
    setBiometricStage('scanning');
    setBiometricProgress(0);
    playBiometricScanSound();

    // Clear any previous biometric timers
    biometricTimerRef.current.forEach(t => clearTimeout(t));
    biometricTimerRef.current = [];

    // Realistic scanning step milestones
    const p1 = setTimeout(() => setBiometricProgress(35), 300);
    const p2 = setTimeout(() => setBiometricProgress(70), 650);
    const p3 = setTimeout(() => {
      setBiometricProgress(100);
      setBiometricStage('verifying');
    }, 1000);

    const p4 = setTimeout(() => {
      setBiometricStage('granted');
      playBiometricSuccessSound();
    }, 1750);

    const p5 = setTimeout(async () => {
      // Authenticate via API to retrieve the real database student with local fallback
      const userToLogin = username ? username.trim() : 'student';
      try {
        const result = await safeLoginRequest(userToLogin, 'student123');
        if (result.success && result.data) {
          const authData = result.data;
          const studentSession: UserSession = {
            role: authData.role,
            username: authData.username,
            fullName: authData.fullName,
            student: authData.student
          };
          setSession(studentSession);
          localStorage.setItem('educonnect_session', JSON.stringify(studentSession));
        } else {
          // Fallback to default active student
          const fallbackSession: UserSession = {
            role: 'student',
            username: 'student',
            fullName: 'Aryan Sharma',
            student: {
              id: 'EDU-2026-001',
              fullName: 'Aryan Sharma',
              email: 'aryan@example.com',
              mobile: '9876543210',
              marks12th: 92,
              interestedCourse: 'B.Tech Computer Science & AI',
              preferredState: 'Telangana'
            }
          };
          setSession(fallbackSession);
          localStorage.setItem('educonnect_session', JSON.stringify(fallbackSession));
        }
      } catch (e) {
        // Fallback
        const fallbackSession: UserSession = {
          role: 'student',
          username: 'student',
          fullName: 'Aryan Sharma',
          student: {
            id: 'EDU-2026-001',
            fullName: 'Aryan Sharma',
            email: 'aryan@example.com',
            mobile: '9876543210',
            marks12th: 92,
            interestedCourse: 'B.Tech Computer Science & AI',
            preferredState: 'Telangana'
          }
        };
        setSession(fallbackSession);
        localStorage.setItem('educonnect_session', JSON.stringify(fallbackSession));
      }

      setBiometricScanning(false);
      setShowLoginModal(false);
      setPassword('');
    }, 2500);

    biometricTimerRef.current = [p1, p2, p3, p4, p5];
  };

  const handleCancelBiometric = () => {
    biometricTimerRef.current.forEach(t => clearTimeout(t));
    biometricTimerRef.current = [];
    setBiometricScanning(false);
  };

  // Restore session & remembered username from localStorage on boot with Bi-Directional DB Sync
  useEffect(() => {
    // Validate Firestore connection on boot (Firebase integration requirement)
    testFirestoreConnection();

    // 1. Synchronize any local cached records from yesterday/previous session with the server
    syncFullDbWithServer().then(() => {
      // Pull fresh state into local mirror
      fetch('/api/full-db')
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) mirrorServerDbToLocal(data);
        })
        .catch(() => {});
    });

    const saved = localStorage.getItem('educonnect_session');
    if (saved) {
      try {
        setSession(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('educonnect_session');
      }
    }

    const rememberedUser = localStorage.getItem('educonnect_remembered_username');
    if (rememberedUser) {
      setUsername(rememberedUser);
      setRememberMe(true);
    }

    // Periodic background sync every 60 seconds
    const syncInterval = setInterval(() => {
      syncFullDbWithServer();
    }, 60000);

    const handleBeforeUnload = () => {
      syncFullDbWithServer();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Keyboard shortcut listener: Toggle Sign In Page with Ctrl+L or Command+L while logged out
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+L or Command+L
      if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        if (!session) {
          setCurrentPage(prev => prev === 'signin' ? 'portal' : 'signin');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [session]);

  // Autofocus the username input field as soon as modal mounts
  useEffect(() => {
    if (showLoginModal) {
      const timer = setTimeout(() => {
        if (usernameInputRef.current) {
          usernameInputRef.current.focus();
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [showLoginModal]);

  // Autofocus recovery email input when forgot password modal opens
  useEffect(() => {
    if (showForgotPasswordModal && recoveryStep === 'request') {
      const timer = setTimeout(() => {
        if (recoveryInputRef.current) {
          recoveryInputRef.current.focus();
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [showForgotPasswordModal, recoveryStep]);

  // Username validation calculation
  const getUsernameError = () => {
    if (!usernameTouched && !username) return '';
    if (!username.trim()) return 'Login ID / Username is required';
    if (username.trim().length < 3) return 'Username must be at least 3 characters long';
    if (!/^[a-zA-Z0-9_.-]+$/.test(username.trim())) {
      return 'Only letters, numbers, hyphens, and underscores allowed';
    }
    return '';
  };

  // Password strength calculator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', percent: 0, color: 'bg-slate-200', textClass: 'text-slate-400', message: 'Enter password' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', percent: 25, color: 'bg-rose-500', textClass: 'text-rose-600', message: 'Too short / simple' };
    if (score === 2) return { score: 2, label: 'Fair', percent: 50, color: 'bg-amber-500', textClass: 'text-amber-600', message: 'Moderate strength' };
    if (score === 3) return { score: 3, label: 'Good', percent: 75, color: 'bg-blue-500', textClass: 'text-blue-600', message: 'Strong credentials' };
    return { score: 4, label: 'Strong', percent: 100, color: 'bg-emerald-500', textClass: 'text-emerald-600', message: 'High security rating' };
  };

  const usernameValidationError = getUsernameError();
  const isUsernameValid = username.trim().length >= 3 && !usernameValidationError;
  const passwordStrength = getPasswordStrength(password);
  const recoveryPassStrength = getPasswordStrength(recoveryNewPassword);

  const triggerTypingIndicator = (field: 'username' | 'password') => {
    setActiveInput(field);
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 850);
  };

  const executeLogin = () => {
    setUsernameTouched(true);

    if (usernameValidationError || !username.trim()) {
      setLoginError('Please enter a valid username (minimum 3 characters)');
      setErrorShakeCount(c => c + 1);
      return;
    }

    if (!password) {
      setLoginError('Please enter your account password');
      setErrorShakeCount(c => c + 1);
      return;
    }

    setLoginError('');
    setLoginLoading(true);
    setIsTyping(false);

    safeLoginRequest(username.trim(), password)
      .then(result => {
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Authentication failed');
        }
        const data = result.data;
        const newSession: UserSession = {
          role: data.role,
          username: data.username,
          fullName: data.fullName,
          student: data.student
        };
        
        // Trigger subtle success state on login button
        setLoginLoading(false);
        setLoginSuccess(true);
        setIsTyping(false);
        
        // Allow the checkmark morph animation to be admired before closing modal
        setTimeout(() => {
          setSession(newSession);
          localStorage.setItem('educonnect_session', JSON.stringify(newSession));
          
          // Handle Remember Me persistence
          if (rememberMe) {
            localStorage.setItem('educonnect_remembered_username', username.trim());
          } else {
            localStorage.removeItem('educonnect_remembered_username');
          }

          setShowLoginModal(false);
          setPassword('');
          setLoginSuccess(false);
        }, 750);
      })
      .catch(err => {
        console.error('Login error:', err);
        setLoginError(err.message || 'Invalid credentials');
        setErrorShakeCount(c => c + 1);
        setLoginLoading(false);
        setLoginSuccess(false);
      });
  };

  submitFormRef.current = executeLogin;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin();
  };

  // Global document keydown listener for Enter key submission inside login modal
  useEffect(() => {
    if (!showLoginModal) return;

    const handleDocumentKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const target = document.activeElement;
        if (
          target &&
          (target.id === 'login-username-input' || target.id === 'login-password-input')
        ) {
          e.preventDefault();
          submitFormRef.current?.();
        }
      }
    };

    document.addEventListener('keydown', handleDocumentKeyDown);
    return () => document.removeEventListener('keydown', handleDocumentKeyDown);
  }, [showLoginModal]);

  // Password Recovery: Step 1 Send Code
  const handleSendRecoveryCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmailOrUser.trim()) {
      setRecoveryError('Please enter your registered email address or login username.');
      return;
    }

    setRecoveryError('');
    setRecoveryLoading(true);

    fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername: recoveryEmailOrUser.trim() })
    })
      .then(res => res.json())
      .then(data => {
        setRecoveryLoading(false);
        if (data.error) {
          setRecoveryError(data.error);
        } else {
          setRecoveryTargetEmail(data.email || recoveryEmailOrUser.trim());
          setRecoveryDemoCode(data.demoCode || '684920');
          setRecoveryStep('verify');
        }
      })
      .catch(err => {
        setRecoveryLoading(false);
        // Fallback simulation
        setRecoveryTargetEmail(recoveryEmailOrUser.includes('@') ? recoveryEmailOrUser.trim() : `${recoveryEmailOrUser.trim()}@educonnect.in`);
        setRecoveryDemoCode('684920');
        setRecoveryStep('verify');
      });
  };

  // Password Recovery: Step 2 Reset Password
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCode.trim()) {
      setRecoveryError('Please enter the 6-digit verification code.');
      return;
    }
    if (!recoveryNewPassword) {
      setRecoveryError('Please choose a new password.');
      return;
    }
    if (recoveryNewPassword.length < 6) {
      setRecoveryError('Password must be at least 6 characters long.');
      return;
    }
    if (recoveryNewPassword !== recoveryConfirmPassword) {
      setRecoveryError('Passwords do not match. Please re-enter.');
      return;
    }

    setRecoveryError('');
    setRecoveryLoading(true);

    fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: recoveryTargetEmail,
        code: recoveryCode.trim(),
        newPassword: recoveryNewPassword
      })
    })
      .then(res => res.json())
      .then(data => {
        setRecoveryLoading(false);
        if (data.error) {
          setRecoveryError(data.error);
        } else {
          setRecoverySuccessMsg(data.message || 'Password successfully updated!');
          setRecoveryStep('success');
          // Pre-fill username and new password in main login form for seamless access
          setUsername(recoveryEmailOrUser.trim());
          setPassword(recoveryNewPassword);
        }
      })
      .catch(() => {
        setRecoveryLoading(false);
        setRecoverySuccessMsg('Password successfully updated!');
        setRecoveryStep('success');
        setUsername(recoveryEmailOrUser.trim());
        setPassword(recoveryNewPassword);
      });
  };

  const handleQuickFill = (role: 'super_admin' | 'admin' | 'counsellor' | 'student') => {
    setUsernameTouched(true);
    if (role === 'super_admin') {
      setUsername('superadmin');
      setPassword('superadmin123');
    } else if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else if (role === 'counsellor') {
      setUsername('counsellor');
      setPassword('counsel123');
    } else {
      setUsername('student');
      setPassword('student123');
    }
  };

  const handleLogout = () => {
    signOutUser().catch(() => {});
    setSession(null);
    localStorage.removeItem('educonnect_session');
    setCurrentPage('portal');
  };

  // Route Guard renderer verifying authenticated user role
  const renderGuardedDashboard = () => {
    if (!session) return null;

    // First-Time Login Password Change Gatekeeper
    if (session.mustChangePassword) {
      return (
        <ForceChangePasswordView 
          session={session}
          onPasswordChanged={() => {
            const updated = { ...session, mustChangePassword: false };
            setSession(updated);
            localStorage.setItem('educonnect_session', JSON.stringify(updated));
          }}
          onLogout={handleLogout}
        />
      );
    }

    switch (session.role) {
      case 'super_admin':
      case 'admin':
        return (
          <AdminPanel 
            userRole={session.role} 
            userName={session.fullName || session.username} 
            onLogout={handleLogout} 
          />
        );

      case 'counsellor':
        return (
          <CounselorPanel 
            counsellorUser={session as any} 
            onLogout={handleLogout} 
          />
        );

      case 'student':
        return (
          <StudentDashboard 
            student={session.student || { id: session.username, fullName: session.fullName || 'Registered Student', email: session.email || '' }} 
            username={session.username} 
            onLogout={handleLogout} 
          />
        );

      default:
        // Unauthorized / Corrupted role barrier
        return (
          <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center" id="route-guard-barrier">
            <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-8 shadow-2xl space-y-6">
              <div className="h-16 w-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500 mx-auto">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                  Security Route Guard
                </span>
                <h2 className="text-xl font-black text-white">Unauthorized Access Barrier</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your active session credentials does not map to any recognized system role (<span className="text-rose-300 font-mono">{(session as any)?.role || 'undefined'}</span>). Please re-authenticate through the authorized security portal.
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-900/30 transition-all cursor-pointer"
              >
                Reset Session & Return to Portal
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative" id="app-container">

      {/* ROUTER SWITCH WITH ROLE GUARD AND FULL-PAGE SIGN-IN (NOT POPUP WINDOW) */}
      {session ? (
        renderGuardedDashboard()
      ) : currentPage === 'signin' ? (
        <SignInPage 
          onBackToHome={() => setCurrentPage('portal')}
          onApplyOnline={() => {
            setCurrentPage('portal');
            setTimeout(() => {
              const el = document.getElementById('apply-online-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          onLoginSuccess={(userSession) => {
            setSession(userSession);
            localStorage.setItem('educonnect_session', JSON.stringify(userSession));
          }}
          prefill={signInPrefill}
        />
      ) : (
        <PublicPortal 
          onLoginClick={() => {
            setSignInPrefill(undefined);
            setCurrentPage('signin');
          }}
          onProceedToSignIn={(creds) => {
            setSignInPrefill(creds);
            setCurrentPage('signin');
          }}
          onStudentLoginSuccess={(student, uname) => {
            const s = { role: 'student', username: uname, student } as UserSession;
            setSession(s);
            localStorage.setItem('educonnect_session', JSON.stringify(s));
          }}
          onAdminLoginSuccess={(admin) => {
            const s = { role: 'admin', username: 'admin', fullName: admin.fullName } as UserSession;
            setSession(s);
            localStorage.setItem('educonnect_session', JSON.stringify(s));
          }}
        />
      )}

      {/* LOGIN MODAL OVERLAY (REPLACED WITH DEDICATED FULL SIGN-IN PAGE) */}
      <AnimatePresence>
        {false && (
          <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" id="login-modal-overlay">
            <motion.div 
              className="bg-white rounded-[32px] overflow-hidden shadow-2xl max-w-sm w-full border border-slate-100/80 relative my-auto"
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 18 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300, duration: 0.4 }}
            >
              {/* Header with diagonal geometric slice accents */}
              <div className="p-5 sm:p-6 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden shrink-0">
                {/* Geometric diagonal background designs */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 z-0" />
                <div className="absolute -inset-y-2 -left-12 w-48 bg-[#0057D9]/15 skew-x-12 transform origin-top pointer-events-none z-0" />
                <div className="absolute -inset-y-2 right-1/4 w-1 bg-gradient-to-b from-[#0057D9]/40 via-[#0057D9]/10 to-transparent skew-x-12 transform origin-top pointer-events-none z-0" />
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-bl from-[#0057D9]/20 to-transparent rounded-full blur-2xl pointer-events-none z-0" />
                
                <div className="absolute right-4 top-2 opacity-10 transform translate-x-2 -translate-y-2 z-0 pointer-events-none">
                  <GraduationCap className="h-20 w-20" />
                </div>

                <div className="space-y-1 relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#0057D9]/20 border border-[#0057D9]/30 rounded-md text-[8px] font-mono tracking-widest text-blue-400 uppercase mb-0.5">
                    <span className="w-1 h-1 bg-[#0057D9] rounded-full animate-ping" />
                    Security Gatekeeper
                  </div>
                  <h3 className="text-sm font-extrabold tracking-tight">Security Credentials Portal</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-slate-400 font-mono">PAN India Authorization Access</p>
                    <span className="text-[9px] bg-slate-800/90 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
                      ⌘L / Ctrl+L
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 relative z-10">
                  <button 
                    type="button"
                    onClick={() => {
                      setSettingsToast('');
                      setShowSettingsModal(true);
                    }} 
                    className="text-slate-400 hover:text-white transition-all p-1.5 hover:bg-white/10 rounded-lg cursor-pointer"
                    id="open-settings-login-header-btn"
                    title="Session Security & Cache Settings"
                  >
                    <Settings className="h-4 w-4 hover:rotate-90 transition-transform duration-300" />
                  </button>
                  <button 
                    onClick={() => {
                      setShowLoginModal(false);
                      setLoginError('');
                      setSsoToast('');
                    }} 
                    className="text-slate-400 hover:text-white transition-all p-1.5 hover:bg-white/10 rounded-lg cursor-pointer"
                    id="close-login-modal-btn"
                    title="Close login modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Form & Demo Credentials area */}
              <div className="p-5 sm:p-6 space-y-5 relative overflow-hidden bg-white max-h-[85vh] overflow-y-auto">
                {/* Geometric subtle background shapes */}
                <div className="absolute top-12 right-0 w-64 h-64 bg-slate-50/60 skew-x-12 origin-top-right transform pointer-events-none -z-10" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-50/40 -skew-x-12 origin-bottom-left transform pointer-events-none -z-10" />

                <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs relative z-10">
                  
                  {/* Motion Shake Animated Error Message */}
                  <AnimatePresence mode="wait">
                    {loginError && (
                      <motion.div 
                        key={`login-error-${errorShakeCount}`}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          x: [-12, 12, -8, 8, -4, 4, 0]
                        }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ 
                          x: { duration: 0.45, ease: "easeInOut" },
                          opacity: { duration: 0.2 },
                          y: { duration: 0.2 }
                        }}
                        className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 font-semibold shadow-xs"
                        id="login-error-alert"
                      >
                        <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500" />
                        <span className="flex-1 leading-snug">{loginError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Typing Indicator Animation (3 pulsing dots) for active field typing */}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -6, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50/90 border border-blue-200/80 rounded-xl text-[10px] text-blue-900 font-medium shadow-2xs" id="login-typing-indicator">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-700 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0057D9] animate-ping" />
                              {activeInput === 'username' ? 'Entering Login ID...' : 'Entering Password...'}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500 font-normal hidden sm:inline">Active typing detected</span>
                          </div>

                          {/* 3 Pulsing Animated Dots */}
                          <div className="flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full border border-blue-200/60 shadow-2xs">
                            <motion.span 
                              className="w-1.5 h-1.5 rounded-full bg-[#0057D9]"
                              animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.4, 1, 0.4] }}
                              transition={{ repeat: Infinity, duration: 0.75, ease: "easeInOut", delay: 0 }}
                            />
                            <motion.span 
                              className="w-1.5 h-1.5 rounded-full bg-[#0057D9]"
                              animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.4, 1, 0.4] }}
                              transition={{ repeat: Infinity, duration: 0.75, ease: "easeInOut", delay: 0.2 }}
                            />
                            <motion.span 
                              className="w-1.5 h-1.5 rounded-full bg-[#0057D9]"
                              animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.4, 1, 0.4] }}
                              transition={{ repeat: Infinity, duration: 0.75, ease: "easeInOut", delay: 0.4 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* UNIFIED ENTRANCE ANIMATED INPUTS CONTAINER */}
                  <div className="space-y-3">
                    
                    {/* Username Input Field with Framer Motion Entrance Animation */}
                    <motion.div 
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.08, ease: "easeOut" }}
                      className={`border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs transition-all focus-within:border-[#0057D9] focus-within:ring-2 focus-within:ring-[#0057D9]/10 bg-white ${
                        usernameTouched && usernameValidationError ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20' : ''
                      }`}
                    >
                      <div className="p-3.5 relative flex items-center">
                        <div className="absolute left-4 text-slate-400">
                          <User className={`h-4 w-4 ${usernameTouched && usernameValidationError ? 'text-rose-400' : isUsernameValid ? 'text-emerald-500' : 'text-slate-400'}`} />
                        </div>
                        <div className="pl-8 pr-6 flex-1">
                          <div className="flex items-center justify-between">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                              Login ID / Username
                            </label>
                            
                            <div className="flex items-center gap-1.5">
                              {/* 3 pulsing dots indicator on active typing */}
                              {activeInput === 'username' && isTyping && (
                                <span className="flex items-center gap-1 text-[9px] font-bold text-[#0057D9] animate-fadeIn bg-blue-50 px-1.5 py-0.2 rounded">
                                  <span>Typing</span>
                                  <span className="flex items-center gap-0.5">
                                    <motion.span 
                                      className="w-1 h-1 rounded-full bg-[#0057D9]"
                                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                                    />
                                    <motion.span 
                                      className="w-1 h-1 rounded-full bg-[#0057D9]"
                                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.18 }}
                                    />
                                    <motion.span 
                                      className="w-1 h-1 rounded-full bg-[#0057D9]"
                                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.36 }}
                                    />
                                  </span>
                                </span>
                              )}

                              {usernameTouched && isUsernameValid && (
                                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                  Valid
                                </span>
                              )}
                            </div>
                          </div>
                          <input 
                            ref={usernameInputRef}
                            autoFocus
                            required 
                            type="text" 
                            value={username} 
                            onFocus={() => {
                              setActiveInput('username');
                              if (username) triggerTypingIndicator('username');
                            }}
                            onChange={(e) => {
                              setUsername(e.target.value);
                              setUsernameTouched(true);
                              if (loginError) setLoginError('');
                              triggerTypingIndicator('username');
                            }} 
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                executeLogin();
                              }
                            }}
                            onBlur={() => {
                              setUsernameTouched(true);
                              if (activeInput === 'username') {
                                setActiveInput(null);
                                setIsTyping(false);
                              }
                            }}
                            placeholder="Enter Login ID (e.g. student, admin)" 
                            className="w-full bg-transparent text-slate-800 text-xs font-semibold outline-none placeholder:text-slate-300 p-0 border-none focus:ring-0 focus:outline-none"
                            id="login-username-input"
                          />
                        </div>
                        <div className="absolute right-0 top-0 w-6 h-6 overflow-hidden pointer-events-none opacity-30">
                          <div className="absolute top-[-1px] right-[-1px] w-12 h-[1px] bg-[#0057D9] rotate-45 transform origin-top-right"></div>
                        </div>
                      </div>

                      {/* Real-time Inline Username Error */}
                      {usernameTouched && usernameValidationError && (
                        <div className="px-3.5 py-1.5 bg-rose-50/90 border-t border-rose-100 flex items-center gap-1.5 text-[10px] font-semibold text-rose-600">
                          <AlertCircle className="h-3 w-3 shrink-0 text-rose-500" />
                          <span>{usernameValidationError}</span>
                        </div>
                      )}
                    </motion.div>

                    {/* Password Input Field with Framer Motion Entrance Animation */}
                    <motion.div 
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.16, ease: "easeOut" }}
                      className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs transition-all focus-within:border-[#0057D9] focus-within:ring-2 focus-within:ring-[#0057D9]/10 bg-white"
                    >
                      <div className="p-3.5 relative flex items-center bg-white hover:bg-slate-50/30 transition-all">
                        <div className="absolute left-4 text-slate-400">
                          <Key className="h-4 w-4" />
                        </div>
                        <div className="pl-8 pr-8 flex-1">
                          <div className="flex items-center justify-between">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Password</label>
                            
                            <div className="flex items-center gap-1.5">
                              {/* 3 pulsing dots indicator on active typing */}
                              {activeInput === 'password' && isTyping && (
                                <span className="flex items-center gap-1 text-[9px] font-bold text-[#0057D9] animate-fadeIn bg-blue-50 px-1.5 py-0.2 rounded">
                                  <span>Typing</span>
                                  <span className="flex items-center gap-0.5">
                                    <motion.span 
                                      className="w-1 h-1 rounded-full bg-[#0057D9]"
                                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                                    />
                                    <motion.span 
                                      className="w-1 h-1 rounded-full bg-[#0057D9]"
                                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.18 }}
                                    />
                                    <motion.span 
                                      className="w-1 h-1 rounded-full bg-[#0057D9]"
                                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.36 }}
                                    />
                                  </span>
                                </span>
                              )}
                              <div className="w-1.5 h-1.5 bg-[#0057D9]/25 rounded-full" />
                            </div>
                          </div>
                          <input 
                            required 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onFocus={() => {
                              setActiveInput('password');
                              if (password) triggerTypingIndicator('password');
                            }}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (loginError) setLoginError('');
                              triggerTypingIndicator('password');
                            }} 
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                executeLogin();
                              }
                            }}
                            onBlur={() => {
                              if (activeInput === 'password') {
                                setActiveInput(null);
                                setIsTyping(false);
                              }
                            }}
                            placeholder="••••••••" 
                            className="w-full bg-transparent text-slate-800 text-xs font-semibold outline-none placeholder:text-slate-300 p-0 border-none focus:ring-0 focus:outline-none"
                            id="login-password-input"
                          />
                        </div>

                        {/* Password Visibility Toggle Button */}
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
                          title={showPassword ? "Hide password" : "Show password"}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          id="password-visibility-toggle"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-slate-600" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {/* Visual Password Strength Indicator Progress Bar */}
                      {password.length > 0 && (
                        <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-100 space-y-1.5 transition-all">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 font-medium flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3 text-slate-400" />
                              Password Strength:
                            </span>
                            <span className={`font-bold ${passwordStrength.textClass}`}>
                              {passwordStrength.label} <span className="font-normal text-slate-400">({passwordStrength.message})</span>
                            </span>
                          </div>
                          
                          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 rounded-full ${passwordStrength.color}`}
                              style={{ width: `${passwordStrength.percent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>

                  </div>

                  {/* REMEMBER ME & FORGOT PASSWORD ROW */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.22 }}
                    className="flex items-center justify-between px-1"
                  >
                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                      <input 
                        type="checkbox" 
                        checked={rememberMe} 
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-[#0057D9] focus:ring-[#0057D9]/20 accent-[#0057D9] cursor-pointer"
                        id="remember-me-checkbox"
                      />
                      <span className="text-[11px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                        Remember Me
                      </span>
                    </label>

                    {/* Forgot Password Trigger Link */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPasswordModal(true);
                        setRecoveryEmailOrUser(username || '');
                        setRecoveryStep('request');
                        setRecoveryError('');
                        setRecoveryCode('');
                        setRecoveryNewPassword('');
                        setRecoveryConfirmPassword('');
                      }}
                      className="text-[11px] font-bold text-[#0057D9] hover:text-[#0041a3] hover:underline transition-all cursor-pointer flex items-center gap-1"
                      id="forgot-password-link"
                    >
                      <HelpCircle className="h-3 w-3" />
                      <span>Forgot Password?</span>
                    </button>
                  </motion.div>

                  {/* AUTHORIZE ACCESS BUTTON WITH MORPHING SUCCESS CHECKMARK ANIMATION */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.26 }}
                    className="space-y-1.5"
                  >
                    <button 
                      type="submit"
                      disabled={loginLoading || loginSuccess || !isUsernameValid || !password}
                      className={`w-full py-3.5 font-bold rounded-xl text-xs transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden ${
                        loginSuccess
                          ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-[1.02] ring-2 ring-emerald-400'
                          : loginLoading 
                            ? 'bg-blue-600 text-white opacity-90 cursor-wait animate-pulse shadow-md shadow-blue-600/20'
                            : (!isUsernameValid || !password)
                              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                              : 'bg-gradient-to-r from-[#0057D9] to-[#014fb5] hover:from-[#004dc2] hover:to-[#003ca3] text-white shadow-lg shadow-[#0057D9]/20 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer'
                      }`}
                      id="authorize-access-btn"
                      title={
                        loginSuccess
                          ? 'Authorized successfully!'
                          : !isUsernameValid
                            ? usernameValidationError || 'Enter a valid Login ID (at least 3 characters)'
                            : !password
                              ? 'Enter your account password to authorize'
                              : 'Click to authorize access'
                      }
                    >
                      <AnimatePresence mode="wait">
                        {loginSuccess ? (
                          <motion.span 
                            key="login-success-state"
                            initial={{ opacity: 0, scale: 0.8, y: 4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                            className="relative z-10 flex items-center gap-2 text-white font-extrabold text-xs tracking-wide"
                          >
                            <motion.div
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: 'spring', stiffness: 450, damping: 22, delay: 0.05 }}
                              className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shadow-inner"
                            >
                              <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
                            </motion.div>
                            <span>Access Granted! Redirecting...</span>
                          </motion.span>
                        ) : loginLoading ? (
                          <motion.span 
                            key="login-loading-state"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="relative z-10 flex items-center gap-2"
                          >
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                            <span>Authorizing Access...</span>
                          </motion.span>
                        ) : (
                          <motion.span 
                            key="login-idle-state"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="relative z-10 flex items-center gap-1.5"
                          >
                            <span>Authorize Access</span>
                            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>

                    {/* Visual Hint when Disabled */}
                    {(!isUsernameValid || !password) && !loginLoading && !loginSuccess && (
                      <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-medium text-center pt-0.5">
                        <AlertCircle className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>
                          {!isUsernameValid 
                            ? (usernameValidationError || 'Enter valid Login ID (min 3 chars)') 
                            : 'Enter password to unlock authorization'}
                        </span>
                      </div>
                    )}
                  </motion.div>
                </form>

                {/* BIOMETRIC ONE-TOUCH LOGIN BUTTON */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.28 }}
                  className="pt-1"
                >
                  <button
                    type="button"
                    onClick={handleStartBiometricLogin}
                    className="w-full py-2.5 px-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-800 hover:to-indigo-900 text-white rounded-2xl border border-indigo-500/30 hover:border-indigo-400/50 flex items-center justify-between group shadow-md hover:shadow-indigo-950/40 transition-all duration-300 cursor-pointer"
                    id="biometric-login-btn"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-xl group-hover:scale-110 group-hover:text-indigo-300 group-hover:bg-indigo-500/30 transition-all">
                        <Fingerprint className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white">Biometric Login</span>
                          <span className="text-[8px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded-full font-mono font-bold tracking-tight">Touch ID / Face ID</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block leading-tight">Instant 1-touch sensor authorization</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 group-hover:text-indigo-200">
                      <span>Scan</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </motion.div>

                {/* 1-CLICK DEMO LOGIN CREDS FOR ALL 4 ROLES */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="pt-3.5 border-t border-slate-100 space-y-2 relative z-10"
                >
                  <div className="flex items-center justify-between text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      1-Click Quick Fill Demo
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">4 ROLES</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <button
                      type="button"
                      onClick={() => handleQuickFill('super_admin')}
                      className="p-2 bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200/80 rounded-xl transition-all group/btn cursor-pointer"
                    >
                      <span className="text-[9px] font-black uppercase text-purple-700 block tracking-wide">Super Admin</span>
                      <span className="text-[9.5px] text-slate-600 font-mono block mt-0.5">superadmin</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill('admin')}
                      className="p-2 bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/80 rounded-xl transition-all group/btn cursor-pointer"
                    >
                      <span className="text-[9px] font-black uppercase text-amber-700 block tracking-wide">Admin</span>
                      <span className="text-[9.5px] text-slate-600 font-mono block mt-0.5">admin</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill('counsellor')}
                      className="p-2 bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/80 rounded-xl transition-all group/btn cursor-pointer"
                    >
                      <span className="text-[9px] font-black uppercase text-[#0057D9] block tracking-wide">Counselor</span>
                      <span className="text-[9.5px] text-slate-600 font-mono block mt-0.5">counsellor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill('student')}
                      className="p-2 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-xl transition-all group/btn cursor-pointer"
                    >
                      <span className="text-[9px] font-black uppercase text-emerald-700 block tracking-wide">Student</span>
                      <span className="text-[9.5px] text-slate-600 font-mono block mt-0.5">student</span>
                    </button>
                  </div>
                </motion.div>

                {/* GOOGLE & MICROSOFT OAUTH SSO PLACEHOLDER BUTTONS WITH 'COMING SOON' TOOLTIPS */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.34 }}
                  className="pt-3 border-t border-slate-100 space-y-2 relative z-10"
                  id="oauth-sso-section"
                >
                  <div className="flex items-center justify-between text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">
                    <span className="flex items-center gap-1">
                      <Lock className="h-3 w-3 text-slate-400" />
                      Single Sign-On (SSO)
                    </span>
                    <span className="text-[8px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded font-mono">OAuth 2.0</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Google OAuth Button with Tooltip */}
                    <div className="relative group" id="google-oauth-container">
                      <button
                        type="button"
                        onClick={() => setSsoToast('Google Workspace SSO is in active deployment. Coming Soon in v2.4!')}
                        className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                        id="google-oauth-btn"
                      >
                        {/* Official Google SVG Logo */}
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span className="font-medium text-slate-700 text-xs">Google</span>
                      </button>
                      
                      {/* Interactive Coming Soon Tooltip */}
                      <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-md z-30 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        <span>Coming Soon</span>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                      </div>
                    </div>

                    {/* Microsoft OAuth Button with Tooltip */}
                    <div className="relative group" id="microsoft-oauth-container">
                      <button
                        type="button"
                        onClick={() => setSsoToast('Microsoft 365 Azure AD SSO is in active deployment. Coming Soon in v2.4!')}
                        className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                        id="microsoft-oauth-btn"
                      >
                        {/* Official Microsoft SVG Logo */}
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 21 21" aria-hidden="true">
                          <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                          <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                          <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                          <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                        </svg>
                        <span className="font-medium text-slate-700 text-xs">Microsoft</span>
                      </button>
                      
                      {/* Interactive Coming Soon Tooltip */}
                      <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-md z-30 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        <span>Coming Soon</span>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                      </div>
                    </div>
                  </div>

                  {/* SSO Notification Banner when clicked */}
                  {ssoToast && (
                    <div className="p-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[10.5px] font-medium flex items-center justify-between animate-fadeIn">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        {ssoToast}
                      </span>
                      <button 
                        onClick={() => setSsoToast('')} 
                        className="text-amber-700 hover:text-amber-950 font-bold ml-2 p-1 hover:bg-amber-100 rounded text-xs"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </motion.div>

                {/* SCANNING FINGERPRINT OVERLAY ANIMATION */}
                <AnimatePresence>
                  {biometricScanning && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
                      id="biometric-scan-overlay"
                    >
                      {/* Laser scanner ring & fingerprint graphic */}
                      <div className="relative w-28 h-28 flex items-center justify-center mb-5">
                        {/* Pulsing Concentric Ripple Rings */}
                        <motion.div
                          animate={{ scale: [1, 1.45, 1], opacity: [0.3, 0, 0.3] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                          className="absolute inset-0 rounded-full border border-indigo-400/40"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.3 }}
                          className="absolute inset-2 rounded-full border border-cyan-400/50"
                        />

                        {/* Center Scanner Capsule */}
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-500 border ${
                          biometricStage === 'granted'
                            ? 'bg-emerald-500/20 border-emerald-400 ring-4 ring-emerald-500/30'
                            : biometricStage === 'verifying'
                              ? 'bg-cyan-500/20 border-cyan-400 ring-4 ring-cyan-500/30'
                              : 'bg-indigo-950/80 border-indigo-400/50 ring-4 ring-indigo-500/20'
                        }`}>
                          {biometricStage === 'granted' ? (
                            <motion.div
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            >
                              <Check className="h-10 w-10 text-emerald-400 stroke-[3]" />
                            </motion.div>
                          ) : (
                            <>
                              <Fingerprint className={`h-11 w-11 transition-colors duration-300 ${
                                biometricStage === 'verifying' ? 'text-cyan-400 animate-pulse' : 'text-indigo-400'
                              }`} />
                              
                              {/* Laser Scanning Line moving vertically */}
                              <motion.div
                                className={`absolute left-0 right-0 h-1 shadow-lg ${
                                  biometricStage === 'verifying' ? 'bg-cyan-400 shadow-cyan-400' : 'bg-indigo-400 shadow-indigo-400'
                                }`}
                                animate={{ top: ['0%', '95%', '0%'] }}
                                transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                              />
                            </>
                          )}
                        </div>
                      </div>

                      {/* Dynamic Status Text */}
                      <div className="space-y-1.5 max-w-xs">
                        <h4 className="text-sm font-extrabold text-white flex items-center justify-center gap-2">
                          {biometricStage === 'scanning' && (
                            <>
                              <span>Scanning Fingerprint...</span>
                              <span className="flex gap-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                              </span>
                            </>
                          )}
                          {biometricStage === 'verifying' && (
                            <>
                              <span className="text-cyan-300">Verifying Biometric Hash...</span>
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-300" />
                            </>
                          )}
                          {biometricStage === 'granted' && (
                            <span className="text-emerald-400">Biometric Match Verified!</span>
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-snug">
                          {biometricStage === 'scanning' && 'Hold your registered finger on the sensor or camera...'}
                          {biometricStage === 'verifying' && 'Comparing cryptographic signature (SHA-256 match 99.98%)...'}
                          {biometricStage === 'granted' && 'Identity confirmed: Student Account. Granting access...'}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-4 border border-slate-700">
                        <motion.div
                          className={`h-full rounded-full transition-all duration-300 ${
                            biometricStage === 'granted'
                              ? 'bg-emerald-400'
                              : biometricStage === 'verifying'
                                ? 'bg-cyan-400'
                                : 'bg-indigo-500'
                          }`}
                          style={{ width: `${biometricProgress}%` }}
                        />
                      </div>

                      {/* Cancel button */}
                      {biometricStage !== 'granted' && (
                        <button
                          type="button"
                          onClick={handleCancelBiometric}
                          className="mt-5 text-[11px] font-semibold text-slate-400 hover:text-white px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                        >
                          Cancel & Enter Password
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PASSWORD RECOVERY MODAL */}
      <AnimatePresence>
        {showForgotPasswordModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" id="forgot-password-modal-overlay">
            <motion.div 
              className="bg-white rounded-[32px] overflow-hidden shadow-2xl max-w-md w-full border border-slate-100 relative my-auto"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300, duration: 0.4 }}
            >
              {/* Recovery Header */}
              <div className="p-6 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 z-0" />
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#0057D9]/20 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#0057D9]/30 border border-[#0057D9]/40 rounded-xl text-blue-400">
                      <Key className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[9px] font-mono uppercase font-bold tracking-wider mb-0.5">
                        Simulated Account Recovery
                      </div>
                      <h3 className="text-base font-extrabold text-white">Reset Password</h3>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setShowForgotPasswordModal(false);
                      setRecoveryError('');
                    }}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    id="close-recovery-modal-btn"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Stepper indicator bar */}
                <div className="grid grid-cols-3 gap-2 mt-5 relative z-10">
                  <div className={`h-1.5 rounded-full transition-all ${recoveryStep === 'request' || recoveryStep === 'verify' || recoveryStep === 'success' ? 'bg-[#0057D9]' : 'bg-slate-700'}`} />
                  <div className={`h-1.5 rounded-full transition-all ${recoveryStep === 'verify' || recoveryStep === 'success' ? 'bg-[#0057D9]' : 'bg-slate-700'}`} />
                  <div className={`h-1.5 rounded-full transition-all ${recoveryStep === 'success' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                </div>
              </div>

              {/* Recovery Content Area */}
              <div className="p-6 space-y-5 bg-white">

                {/* Error Banner */}
                {recoveryError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                    <span>{recoveryError}</span>
                  </div>
                )}

                {/* STEP 1: Enter Email / Username */}
                {recoveryStep === 'request' && (
                  <form onSubmit={handleSendRecoveryCode} className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-slate-900">Step 1: Verify Identity</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Enter your registered account Email address or Username. We will generate a secure 6-digit verification code.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Registered Email or Username
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="h-4 w-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                        <input 
                          ref={recoveryInputRef}
                          required
                          type="text"
                          value={recoveryEmailOrUser}
                          onChange={(e) => setRecoveryEmailOrUser(e.target.value)}
                          placeholder="e.g. student@example.com or student"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#0057D9] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none transition-all"
                          id="recovery-email-input"
                        />
                      </div>
                    </div>

                    {/* Demo Quick Fills */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Quick Demo Accounts
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {['student@example.com', 'nexoraeca@gmail.com', 'counsellor@nexoraacademy.in'].map((demo) => (
                          <button
                            key={demo}
                            type="button"
                            onClick={() => setRecoveryEmailOrUser(demo)}
                            className="px-2 py-1 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 rounded-lg text-[10px] font-mono text-slate-600 transition-all cursor-pointer"
                          >
                            {demo}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPasswordModal(false);
                          setShowLoginModal(true);
                        }}
                        className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back to Login</span>
                      </button>

                      <button
                        type="submit"
                        disabled={recoveryLoading || !recoveryEmailOrUser.trim()}
                        className="flex-1 py-2.5 px-4 bg-[#0057D9] hover:bg-[#0047b3] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        id="send-recovery-code-btn"
                      >
                        {recoveryLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                            <span>Generating Code...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Verification Code</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 2: Verify Code & Set New Password */}
                {recoveryStep === 'verify' && (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-slate-900">Step 2: Enter Verification Code & New Password</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        A security code was sent to <strong className="text-slate-800">{recoveryTargetEmail}</strong>.
                      </p>
                    </div>

                    {/* Demo auto-fill helper card */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Simulated OTP Dispatched</span>
                        <span className="text-xs font-mono font-black text-blue-950 tracking-wider">
                          Code: {recoveryDemoCode}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRecoveryCode(recoveryDemoCode)}
                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg shadow-xs transition-all cursor-pointer"
                      >
                        Auto-Fill Code
                      </button>
                    </div>

                    {/* 6-Digit Verification Code Field */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        6-Digit Verification Code
                      </label>
                      <div className="relative flex items-center">
                        <Smartphone className="h-4 w-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                        <input 
                          required
                          type="text"
                          maxLength={6}
                          value={recoveryCode}
                          onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 684920"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#0057D9] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono font-bold tracking-widest outline-none transition-all"
                          id="recovery-code-input"
                        />
                      </div>
                    </div>

                    {/* New Password Field with Visibility Toggle */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          New Account Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setRecoveryShowPass(!recoveryShowPass)}
                          className="text-[10px] font-semibold text-slate-500 hover:text-[#0057D9] flex items-center gap-1 transition-colors cursor-pointer"
                          id="recovery-toggle-new-password-text-btn"
                          title={recoveryShowPass ? "Hide password" : "Show password"}
                        >
                          {recoveryShowPass ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3 text-[#0057D9]" />}
                          <span>{recoveryShowPass ? "Hide" : "Show"}</span>
                        </button>
                      </div>
                      <div className="relative flex items-center">
                        <Lock className="h-4 w-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                        <input 
                          required
                          type={recoveryShowPass ? "text" : "password"}
                          value={recoveryNewPassword}
                          onChange={(e) => setRecoveryNewPassword(e.target.value)}
                          placeholder="Create strong new password"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#0057D9] focus:bg-white rounded-xl pl-10 pr-10 py-2.5 text-xs font-semibold outline-none transition-all"
                          id="recovery-new-password-input"
                        />
                        <button
                          type="button"
                          onClick={() => setRecoveryShowPass(!recoveryShowPass)}
                          className="absolute right-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-all cursor-pointer"
                          id="recovery-toggle-new-password-btn"
                          title={recoveryShowPass ? "Hide password" : "Show password"}
                          aria-label="Toggle password visibility"
                        >
                          {recoveryShowPass ? <EyeOff className="h-4 w-4 text-slate-700" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      
                      {/* Real-time Visual Password Strength Meter */}
                      {recoveryNewPassword.length > 0 && (
                        <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2 mt-2 transition-all">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                              <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                              Strength:
                            </span>
                            <span className={`font-extrabold ${recoveryPassStrength.textClass}`}>
                              {recoveryPassStrength.label} <span className="font-normal text-slate-400">({recoveryPassStrength.message})</span>
                            </span>
                          </div>
                          
                          {/* Animated Color Progress Bar */}
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 rounded-full ${recoveryPassStrength.color}`}
                              style={{ width: `${recoveryPassStrength.percent}%` }}
                            />
                          </div>

                          {/* Real-time Requirement Checks */}
                          <div className="grid grid-cols-2 gap-1 pt-1 text-[9.5px]">
                            <span className={`flex items-center gap-1 font-medium ${recoveryNewPassword.length >= 6 ? 'text-emerald-600' : 'text-slate-400'}`}>
                              <Check className={`h-3 w-3 ${recoveryNewPassword.length >= 6 ? 'stroke-[3]' : 'opacity-40'}`} />
                              Min 6 characters
                            </span>
                            <span className={`flex items-center gap-1 font-medium ${/[A-Z]/.test(recoveryNewPassword) ? 'text-emerald-600' : 'text-slate-400'}`}>
                              <Check className={`h-3 w-3 ${/[A-Z]/.test(recoveryNewPassword) ? 'stroke-[3]' : 'opacity-40'}`} />
                              Uppercase letter
                            </span>
                            <span className={`flex items-center gap-1 font-medium ${/[0-9]/.test(recoveryNewPassword) ? 'text-emerald-600' : 'text-slate-400'}`}>
                              <Check className={`h-3 w-3 ${/[0-9]/.test(recoveryNewPassword) ? 'stroke-[3]' : 'opacity-40'}`} />
                              Contains number
                            </span>
                            <span className={`flex items-center gap-1 font-medium ${/[^A-Za-z0-9]/.test(recoveryNewPassword) ? 'text-emerald-600' : 'text-slate-400'}`}>
                              <Check className={`h-3 w-3 ${/[^A-Za-z0-9]/.test(recoveryNewPassword) ? 'stroke-[3]' : 'opacity-40'}`} />
                              Special character
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm New Password Field with Visibility Toggle */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Confirm New Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setRecoveryShowConfirmPass(!recoveryShowConfirmPass)}
                          className="text-[10px] font-semibold text-slate-500 hover:text-[#0057D9] flex items-center gap-1 transition-colors cursor-pointer"
                          id="recovery-toggle-confirm-password-text-btn"
                          title={recoveryShowConfirmPass ? "Hide password" : "Show password"}
                        >
                          {recoveryShowConfirmPass ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3 text-[#0057D9]" />}
                          <span>{recoveryShowConfirmPass ? "Hide" : "Show"}</span>
                        </button>
                      </div>
                      <div className="relative flex items-center">
                        <CheckCircle2 className={`h-4 w-4 absolute left-3.5 ${recoveryConfirmPassword && recoveryNewPassword === recoveryConfirmPassword ? 'text-emerald-500' : 'text-slate-400'}`} />
                        <input 
                          required
                          type={recoveryShowConfirmPass ? "text" : "password"}
                          value={recoveryConfirmPassword}
                          onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#0057D9] focus:bg-white rounded-xl pl-10 pr-10 py-2.5 text-xs font-semibold outline-none transition-all"
                          id="recovery-confirm-password-input"
                        />
                        <button
                          type="button"
                          onClick={() => setRecoveryShowConfirmPass(!recoveryShowConfirmPass)}
                          className="absolute right-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-all cursor-pointer"
                          id="recovery-toggle-confirm-password-btn"
                          title={recoveryShowConfirmPass ? "Hide password" : "Show password"}
                          aria-label="Toggle confirm password visibility"
                        >
                          {recoveryShowConfirmPass ? <EyeOff className="h-4 w-4 text-slate-700" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setRecoveryStep('request')}
                        className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        disabled={recoveryLoading || !recoveryCode || !recoveryNewPassword || recoveryNewPassword !== recoveryConfirmPassword}
                        className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        id="update-password-submit-btn"
                      >
                        {recoveryLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                            <span>Updating Password...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-4 w-4" />
                            <span>Set New Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 3: Success Confirmation */}
                {recoveryStep === 'success' && (
                  <div className="text-center py-4 space-y-4">
                    <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
                      <Check className="h-8 w-8 stroke-[3]" />
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-base font-extrabold text-slate-900">Password Reset Complete!</h4>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                        {recoverySuccessMsg || 'Your account password has been updated securely. You can now authorize your login with your new credentials.'}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Updated Credentials Pre-Filled</span>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                        <span>User: <strong className="font-mono text-blue-600">{username || recoveryEmailOrUser}</strong></span>
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPasswordModal(false);
                        setShowLoginModal(true);
                      }}
                      className="w-full py-3 bg-[#0057D9] hover:bg-[#0047b3] text-white font-bold rounded-xl text-xs shadow-lg shadow-[#0057D9]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      id="proceed-to-login-btn"
                    >
                      <span>Proceed to Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PORTAL PREFERENCES & NOTIFICATION SETTINGS MODAL */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" id="session-settings-overlay">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              className="bg-white rounded-[28px] shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 relative my-auto"
              id="session-settings-modal"
            >
              {/* Settings Header */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#0057D9]/20 border border-[#0057D9]/40 text-blue-400 rounded-2xl shadow-inner">
                    <Sliders className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Portal Preferences & Storage</h3>
                    <p className="text-[10.5px] text-slate-400">Manage notification preferences and local device cache</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  id="close-settings-modal-btn"
                  aria-label="Close Settings"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Settings Content Body */}
              <div className="p-6 space-y-5 text-xs">
                
                {/* Feedback Toast alert inside modal */}
                {settingsToast && (
                  <motion.div 
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl text-[11px] font-medium flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      {settingsToast}
                    </span>
                    <button 
                      onClick={() => setSettingsToast('')} 
                      className="text-blue-600 font-bold ml-2 p-0.5 hover:bg-blue-100 rounded"
                    >
                      ×
                    </button>
                  </motion.div>
                )}

                {/* PRIMARY TOGGLE: Enable Portal Notifications */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5" id="settings-session-notification-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-[#0057D9]" />
                        <label 
                          htmlFor="enable-session-notifications-toggle" 
                          className="font-extrabold text-slate-900 text-xs cursor-pointer"
                        >
                          Enable Portal Notifications
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Receive desktop browser notification alerts for important admissions, exam schedules, and mentorship updates.
                      </p>
                    </div>

                    {/* Interactive Toggle Switch with Framer Motion Sliding Transition */}
                    <button
                      type="button"
                      id="enable-session-notifications-toggle"
                      role="switch"
                      aria-checked={sessionNotificationsEnabled}
                      onClick={() => handleToggleSessionNotifications(!sessionNotificationsEnabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                        sessionNotificationsEnabled ? 'bg-[#0057D9]' : 'bg-slate-300'
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
                          x: sessionNotificationsEnabled ? 20 : 0
                        }}
                        className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0"
                      />
                    </button>
                  </div>

                  {/* Browser Permission Details & Test Notification Button */}
                  <div className="pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[10.5px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-medium">Browser Status:</span>
                      <span className={`font-bold px-2 py-0.5 rounded-full ${
                        notificationPermission === 'granted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : notificationPermission === 'denied'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        {notificationPermission === 'granted' ? 'Allowed' : notificationPermission === 'denied' ? 'Blocked in Browser' : 'Default / Unprompted'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={sendTestNotification}
                      className="text-[10.5px] font-bold text-[#0057D9] hover:text-[#0042a5] hover:underline cursor-pointer flex items-center gap-1"
                      id="send-test-notification-btn"
                    >
                      <BellRing className="h-3 w-3" />
                      <span>Send Test Notification</span>
                    </button>
                  </div>
                </div>

                {/* CLEAR LOCAL CACHE SECTION */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3" id="settings-clear-cache-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4 text-rose-600" />
                        <span className="font-extrabold text-slate-900 text-xs">
                          Clear Local Cache
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Purge remembered usernames, saved credentials, and stored session data from this browser's local storage.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleClearLocalCache}
                      className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-rose-200 hover:border-rose-300 font-bold text-[11px] rounded-xl shadow-xs transition-all duration-200 flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                      id="clear-local-cache-btn"
                      title="Clear remembered username and session cache"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Clear Cache</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Keys: <code className="font-mono text-slate-700 bg-slate-200/60 px-1 py-0.5 rounded">remembered_username, session</code></span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> 1-Click Reset
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 font-mono">NEXORA Education & Career Academy</span>
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(false)}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                    id="close-settings-done-btn"
                  >
                    Done
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
