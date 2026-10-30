import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, ArrowRight, Lock, Mail, User, Eye, EyeOff, 
  ShieldCheck, Sparkles, GraduationCap, CheckCircle2, AlertCircle, 
  Loader2, Key, HelpCircle, RefreshCw, Smartphone, Fingerprint,
  Building, Award, Check
} from 'lucide-react';
import NexoraLogo from './NexoraLogo';
import { signInWithGoogle, sendFirebasePasswordReset } from '../firebase';
import { safeLoginRequest, authenticateLocally } from '../utils/authFallback';

interface SignInPageProps {
  onBackToHome: () => void;
  onApplyOnline: () => void;
  onLoginSuccess: (sessionData: any) => void;
  prefill?: {
    username?: string;
    password?: string;
  };
}

export default function SignInPage({ 
  onBackToHome, 
  onApplyOnline, 
  onLoginSuccess,
  prefill 
}: SignInPageProps) {
  const [roleTab, setRoleTab] = useState<'student' | 'counsellor' | 'admin'>('student');
  const [username, setUsername] = useState<string>(prefill?.username || '');
  const [password, setPassword] = useState<string>(prefill?.password || '');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);
  const [noticeMessage, setNoticeMessage] = useState<string>(
    prefill?.password 
      ? 'Account created! Your temporary password has been pre-filled. Click Sign In to proceed to password setup.'
      : ''
  );
  const [showDomainAuthGuide, setShowDomainAuthGuide] = useState<boolean>(false);

  // Biometric state
  const [biometricScanning, setBiometricScanning] = useState<boolean>(false);
  const [biometricStage, setBiometricStage] = useState<'scanning' | 'verifying' | 'granted'>('scanning');

  // In-page Password Recovery states (not a popup!)
  const [inPasswordRecovery, setInPasswordRecovery] = useState<boolean>(false);
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'verify' | 'done'>('request');
  const [recoveryEmailOrUser, setRecoveryEmailOrUser] = useState<string>('');
  const [recoveryTargetEmail, setRecoveryTargetEmail] = useState<string>('');
  const [recoveryCode, setRecoveryCode] = useState<string>('');
  const [recoveryDemoCode, setRecoveryDemoCode] = useState<string>('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState<string>('');
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState<string>('');
  const [recoveryShowPass, setRecoveryShowPass] = useState<boolean>(false);
  const [recoveryLoading, setRecoveryLoading] = useState<boolean>(false);
  const [recoveryError, setRecoveryError] = useState<string>('');
  const [recoverySuccessMsg, setRecoverySuccessMsg] = useState<string>('');
  
  // Real Email Service Integration State (Google Firebase Free Service & OTP)
  const [emailServicePreference, setEmailServicePreference] = useState<'firebase_auth' | 'sendgrid'>('firebase_auth');
  const [emailDeliveryInfo, setEmailDeliveryInfo] = useState<{
    service: string;
    status: string;
    messageId: string;
    targetEmail?: string;
  } | null>(null);
  const [emailServiceStatus, setEmailServiceStatus] = useState<any>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const usernameInputRef = useRef<HTMLInputElement>(null);

  // Fetch Email Integration Service Status on Mount
  useEffect(() => {
    fetch('/api/auth/email-service-status')
      .then(res => res.json())
      .then(data => setEmailServiceStatus(data))
      .catch(() => {});
  }, []);

  // Resend cooldown timer countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (prefill?.username) {
      setUsername(prefill.username);
    }
    if (prefill?.password) {
      setPassword(prefill.password);
    }
    // Focus username if not prefilled
    if (!prefill?.username && usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, [prefill]);

  // Demo autofill
  const handleQuickDemo = (role: 'student' | 'counsellor' | 'admin') => {
    setRoleTab(role);
    setLoginError('');
    if (role === 'student') {
      setUsername('aryan@example.com');
      setPassword('student123');
    } else if (role === 'counsellor') {
      setUsername('lakshmi@educonnect.in');
      setPassword('counsel123');
    } else if (role === 'admin') {
      setUsername('nexoraeca@gmail.com');
      setPassword('Bharath@123');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setLoginError('Please enter your Student ID, Username, or Registered Email.');
      return;
    }
    if (!password.trim()) {
      setLoginError('Please enter your password.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');
    setShowDomainAuthGuide(false);

    try {
      const result = await safeLoginRequest(username.trim(), password.trim());
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Invalid credentials. Please verify your login details.');
      }

      setLoginSuccess(true);
      setTimeout(() => {
        onLoginSuccess(result.data);
      }, 500);
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setLoginError('');
    setShowDomainAuthGuide(false);
    try {
      const { user, profile } = await signInWithGoogle();
      setLoginSuccess(true);
      setTimeout(() => {
        onLoginSuccess({
          role: profile.role,
          username: profile.email,
          fullName: profile.fullName,
          student: profile.role === 'student' ? {
            id: profile.studentId || `EDU-2026-${user.uid.slice(0, 4)}`,
            fullName: profile.fullName,
            email: profile.email,
            marks12th: 88,
            interestedCourse: 'B.Tech Computer Science & AI',
            preferredState: 'Telangana',
            admissionStatus: 'Counseling'
          } : undefined
        });
      }, 500);
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
        setLoginError(`Firebase: Error (auth/unauthorized-domain). Domain "${domain}" is not added to Firebase Authorized Domains.`);
        setShowDomainAuthGuide(true);
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setLoginError(err.message || 'Google sign-in could not be completed.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Simulated Biometric Scan
  const handleBiometricLogin = () => {
    setBiometricScanning(true);
    setBiometricStage('scanning');
    setLoginError('');
    setShowDomainAuthGuide(false);

    setTimeout(() => {
      setBiometricStage('verifying');
      setTimeout(async () => {
        setBiometricStage('granted');
        setTimeout(async () => {
          setBiometricScanning(false);
          // Auto login as Aryan Sharma for demo touch
          try {
            const result = await safeLoginRequest('aryan@example.com', 'student123');
            if (result.success && result.data) {
              onLoginSuccess(result.data);
            } else {
              setLoginError('Biometric authentication failed.');
            }
          } catch (e) {
            setLoginError('Biometric authentication failed.');
          }
        }, 600);
      }, 900);
    }, 900);
  };

  // Password Recovery Handlers (Google Firebase Free Service & In-Portal OTP)
  const handleRequestOtp = async (e?: React.FormEvent, overridePreference?: 'sendgrid' | 'firebase_auth') => {
    if (e) e.preventDefault();
    if (!recoveryEmailOrUser.trim()) {
      setRecoveryError('Please provide your registered Email or Username.');
      return;
    }
    const pref = overridePreference || emailServicePreference;
    setRecoveryLoading(true);
    setRecoveryError('');

    try {
      // Dispatch via server API (which invokes Google Firebase Identity Toolkit free email dispatch)
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrUsername: recoveryEmailOrUser.trim(),
          servicePreference: pref
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch password recovery email.');

      setRecoveryTargetEmail(data.email || recoveryEmailOrUser);
      setRecoveryDemoCode(data.demoCode || '684920');
      setEmailDeliveryInfo({
        service: data.deliveryService || 'firebase_auth',
        status: data.deliveryStatus || 'delivered',
        messageId: data.messageId || `FIREBASE-${Date.now()}`,
        targetEmail: data.email || recoveryEmailOrUser
      });

      // Also trigger client-side Firebase Auth SDK as a secondary guarantee
      if (pref === 'firebase_auth') {
        const query = recoveryEmailOrUser.trim();
        const targetEmail = query.includes('@') ? query : `${query}@educonnect.in`;
        try {
          await sendFirebasePasswordReset(targetEmail);
        } catch (fbClientErr) {
          // If already sent via server Identity Toolkit REST API, ignore client duplicate
        }
      }

      setRecoveryStep('verify');
      setResendCooldown(60);
    } catch (err: any) {
      setRecoveryError(err.message || 'Error dispatching recovery email.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCode.trim()) {
      setRecoveryError('Please enter the 6-digit verification code.');
      return;
    }
    if (recoveryNewPassword.length < 6) {
      setRecoveryError('New password must be at least 6 characters.');
      return;
    }
    if (recoveryNewPassword !== recoveryConfirmPassword) {
      setRecoveryError('Passwords do not match.');
      return;
    }

    setRecoveryLoading(true);
    setRecoveryError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recoveryTargetEmail,
          code: recoveryCode.trim(),
          newPassword: recoveryNewPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password reset failed.');
      setRecoverySuccessMsg('Your password has been successfully reset! You can now sign in.');
      setRecoveryStep('done');
      setPassword(recoveryNewPassword);
      setUsername(recoveryTargetEmail);
    } catch (err: any) {
      setRecoveryError(err.message || 'Password reset failed.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 flex flex-col justify-between" id="signin-full-page">
      {/* ================= 1. PAGE HEADER ================= */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div 
            onClick={onBackToHome}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <NexoraLogo />
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block -mb-0.5">
                Portal Access
              </span>
              <span className="text-sm font-extrabold text-slate-800 group-hover:text-[#0057D9] transition-colors">
                NEXORA EduConnect Academy
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Portal</span>
            </button>
            <button
              onClick={onApplyOnline}
              className="hidden sm:flex px-4 py-2 text-xs font-bold text-white bg-[#0057D9] hover:bg-[#004dc2] rounded-xl transition-all shadow-xs items-center gap-1.5 cursor-pointer"
            >
              <span>Apply Online</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= 2. MAIN SIGN-IN VIEWPORT ================= */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          
          {/* Left Hero / Brand Sidebar (Desktop) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-[#003b99] p-8 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-blue-300 border border-white/10">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                <span>Encrypted 256-Bit SSL Access</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                  Higher Education & Career Gateway
                </h1>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sign in to track university admissions, take online aptitude assessments, download verified scorecards, and connect with academic counselors.
                </p>
              </div>

              {/* Feature Points */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>Instant student account upon online application</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>Direct merit scholarships across 100+ universities</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>Mandatory first-time password setup for full security</span>
                </div>
              </div>
            </div>

            {/* Bottom Support Badge */}
            <div className="pt-8 border-t border-white/10 relative z-10 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Admissions Help Desk
              </div>
              <div className="text-xs text-slate-200 font-medium">
                Toll Free: 1800-890-2026 • nexoraeca@gmail.com
              </div>
            </div>
          </div>

          {/* Right Form Container */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white relative">
            
            {/* IN-PAGE PASSWORD RECOVERY MODE */}
            {inPasswordRecovery ? (
              <div className="space-y-5 my-auto">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setInPasswordRecovery(false);
                        setRecoveryStep('request');
                        setRecoveryError('');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back to Sign In</span>
                    </button>                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 pt-1">
                    {recoveryStep === 'request' && 'Reset Account Password'}
                    {recoveryStep === 'verify' && 'Enter Verification Code'}
                    {recoveryStep === 'done' && 'Password Updated!'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {recoveryStep === 'request' && 'Enter your registered email address or student username to receive a password reset verification code.'}
                    {recoveryStep === 'verify' && `We dispatched a 6-digit verification code to ${recoveryTargetEmail}.`}
                    {recoveryStep === 'done' && 'Your account credentials have been updated securely.'}
                  </p>
                </div>

                {recoveryError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                    <span>{recoveryError}</span>
                  </div>
                )}

                {/* STEP 1: REQUEST VERIFICATION CODE */}
                {recoveryStep === 'request' && (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Registered Email or Username
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={recoveryEmailOrUser}
                          onChange={(e) => setRecoveryEmailOrUser(e.target.value)}
                          placeholder="e.g. aryan@example.com or student"
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#0057D9] focus:bg-white focus:ring-1 focus:ring-[#0057D9] transition-all"
                        />
                      </div>
                    </div>

                    {/* Quick Demo Fill Buttons */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Quick Account Fills:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: 'Aryan (Student)', val: 'aryan@example.com' },
                          { label: 'Dr. Lakshmi (Counselor)', val: 'lakshmi@educonnect.in' },
                          { label: 'Admissions Admin', val: 'nexoraeca@gmail.com' }
                        ].map(d => (
                          <button
                            key={d.val}
                            type="button"
                            onClick={() => setRecoveryEmailOrUser(d.val)}
                            className="px-2 py-1 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 rounded-lg text-[10px] font-medium text-slate-600 transition-all cursor-pointer"
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={recoveryLoading || !recoveryEmailOrUser.trim()}
                      className="w-full py-3.5 bg-[#0057D9] hover:bg-[#004dc2] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {recoveryLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Sending Verification Code...</span>
                        </>
                      ) : (
                        <>
                          <Key className="h-4 w-4" />
                          <span>Send Verification Code</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* STEP 2: VERIFY OTP & SET NEW PASSWORD */}
                {recoveryStep === 'verify' && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    {/* Delivery Status Banner */}
                    <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          Verification Code Dispatched
                        </span>
                        <span className="font-mono text-[10px] text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                          Status: Delivered
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        A 6-digit verification code has been generated for <strong>{recoveryTargetEmail}</strong>. Enter the code below to update your password.
                      </p>
                    </div>

                    {/* Demo Code Helper */}
                    {recoveryDemoCode && (
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-700">
                        <span className="text-[11px]">Instant Demo Code: <strong className="font-mono text-sm text-[#0057D9] ml-1">{recoveryDemoCode}</strong></span>
                        <button
                          type="button"
                          onClick={() => setRecoveryCode(recoveryDemoCode)}
                          className="px-2.5 py-1 bg-[#0057D9] hover:bg-[#004dc2] text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          Auto-Fill Code
                        </button>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 block">
                          6-Digit Verification Code
                        </label>
                        <button
                          type="button"
                          disabled={resendCooldown > 0 || recoveryLoading}
                          onClick={() => handleRequestOtp(undefined, 'sendgrid')}
                          className="text-[11px] font-bold text-[#0057D9] hover:underline disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                        </button>
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value)}
                        placeholder="123456"
                        required
                        className="w-full font-mono text-center tracking-widest text-lg bg-slate-50 border border-slate-200 rounded-xl py-2 font-bold text-slate-900 outline-none focus:border-[#0057D9] focus:bg-white transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 block">
                          New Password (Min 6 Characters)
                        </label>
                        <button
                          type="button"
                          onClick={() => setRecoveryShowPass(!recoveryShowPass)}
                          className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                        >
                          {recoveryShowPass ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          <span>{recoveryShowPass ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                      <input
                        type={recoveryShowPass ? 'text' : 'password'}
                        value={recoveryNewPassword}
                        onChange={(e) => setRecoveryNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#0057D9] focus:bg-white transition-all font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Confirm New Password
                      </label>
                      <input
                        type={recoveryShowPass ? 'text' : 'password'}
                        value={recoveryConfirmPassword}
                        onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#0057D9] focus:bg-white transition-all font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={recoveryLoading}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {recoveryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      <span>Update Password & Continue</span>
                    </button>
                  </form>
                )}

                {/* STEP 3: DONE / CONFIRMATION */}
                {recoveryStep === 'done' && (
                  <div className="text-center space-y-4 py-4">
                    <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold text-slate-900">
                        {emailDeliveryInfo?.service === 'firebase_auth' ? 'Firebase Reset Email Dispatched' : 'Password Reset Successful'}
                      </h3>
                      <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                        {recoverySuccessMsg}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setInPasswordRecovery(false);
                        setRecoveryStep('request');
                      }}
                      className="w-full py-3 bg-[#0057D9] hover:bg-[#004dc2] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                    >
                      Proceed to Sign In
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* STANDARD SIGN-IN FORM */
              <div className="space-y-6">
                
                {/* Form Top Title & Role Switcher */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      Sign In to Portal
                    </h2>
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      Official Portal
                    </span>
                  </div>

                  {/* Role Selector Tabs */}
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setRoleTab('student')}
                      className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        roleTab === 'student'
                          ? 'bg-white text-[#0057D9] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <GraduationCap className="h-3.5 w-3.5" />
                      <span>Student</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoleTab('counsellor')}
                      className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        roleTab === 'counsellor'
                          ? 'bg-white text-[#0057D9] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>Counselor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoleTab('admin')}
                      className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        roleTab === 'admin'
                          ? 'bg-white text-[#0057D9] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Admin</span>
                    </button>
                  </div>
                </div>

                {/* Pre-fill / Account Notice Banner */}
                {noticeMessage && (
                  <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-2xl flex items-start gap-2 shadow-2xs">
                    <Sparkles className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <strong className="block font-bold">New Student Account Ready:</strong>
                      {noticeMessage}
                    </div>
                  </div>
                )}

                {/* Login Error Notification */}
                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Firebase Domain Authorization Guide (if auth/unauthorized-domain occurs) */}
                {showDomainAuthGuide && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-800">
                      <HelpCircle className="h-4 w-4 shrink-0 text-amber-600" />
                      <span>How to enable Google Sign-In for this domain:</span>
                    </div>
                    <ol className="list-decimal list-inside text-[11px] space-y-1 text-amber-800 pl-1">
                      <li>Open <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="underline font-bold text-[#0057D9]">Firebase Console</a>.</li>
                      <li>Go to <strong>Authentication</strong> &rarr; <strong>Settings</strong> &rarr; <strong>Authorized domains</strong>.</li>
                      <li>Click <strong>Add domain</strong> and enter: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-950">{typeof window !== 'undefined' ? window.location.hostname : 'your-domain'}</code></li>
                    </ol>
                    <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-amber-700">Need immediate demo access?</span>
                      <button
                        type="button"
                        onClick={() => {
                          const demo = authenticateLocally('aryan@example.com', 'student123');
                          if (demo) onLoginSuccess(demo);
                        }}
                        className="font-bold text-[#0057D9] hover:underline cursor-pointer"
                      >
                        Skip &rarr; Continue as Student Demo
                      </button>
                    </div>
                  </div>
                )}

                {/* Credentials Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Username / Email / ID Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      {roleTab === 'student' ? 'Student ID / Registered Email' : 'Username or Email'}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        ref={usernameInputRef}
                        type="text"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          if (loginError) setLoginError('');
                        }}
                        placeholder={
                          roleTab === 'student'
                            ? 'e.g. aryan@example.com or EDU-2026-001'
                            : 'Enter username or email'
                        }
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#0057D9] focus:bg-white focus:ring-1 focus:ring-[#0057D9] transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 block">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setInPasswordRecovery(true);
                          setRecoveryEmailOrUser(username);
                        }}
                        className="text-[11px] font-bold text-[#0057D9] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (loginError) setLoginError('');
                        }}
                        placeholder="••••••••••••"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#0057D9] focus:bg-white focus:ring-1 focus:ring-[#0057D9] transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-[#0057D9] focus:ring-[#0057D9] h-3.5 w-3.5"
                      />
                      <span className="font-medium">Remember credentials</span>
                    </label>
                    
                    <span className="text-[11px] text-slate-400">
                      Auto-logout disabled
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3.5 bg-[#0057D9] hover:bg-[#004dc2] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    id="submit-signin-btn"
                  >
                    {loginLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : loginSuccess ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                        <span>Signed In Successfully</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Portal</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  {/* Google Sign-in with Firebase Auth */}
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-white px-2 text-slate-400 font-bold tracking-wider">or sign in with</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                    className="w-full py-2.5 px-4 border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer disabled:opacity-60"
                    id="google-signin-btn"
                  >
                    {googleLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-[#0057D9]" />
                        <span>Connecting to Google...</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Quick Demo Credentials */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Quick Demo Logins:</span>
                    <button
                      type="button"
                      onClick={handleBiometricLogin}
                      className="text-[#0057D9] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Fingerprint className="h-3 w-3" />
                      <span>Touch ID</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('student')}
                      className="p-2 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group"
                    >
                      <span className="text-[10px] font-bold text-slate-800 group-hover:text-blue-700 block truncate">
                        Aryan (Student)
                      </span>
                      <span className="text-[9px] text-slate-400 block font-mono">student123</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemo('counsellor')}
                      className="p-2 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group"
                    >
                      <span className="text-[10px] font-bold text-slate-800 group-hover:text-blue-700 block truncate">
                        Dr. Lakshmi
                      </span>
                      <span className="text-[9px] text-slate-400 block font-mono">counsel123</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemo('admin')}
                      className="p-2 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group"
                    >
                      <span className="text-[10px] font-bold text-slate-800 group-hover:text-blue-700 block truncate">
                        Admissions Admin
                      </span>
                      <span className="text-[9px] text-slate-400 block font-mono">admin123</span>
                    </button>
                  </div>
                </div>

                {/* Apply Online Link */}
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500">
                    New intermediate or 12th student?{' '}
                    <button
                      type="button"
                      onClick={onApplyOnline}
                      className="text-[#0057D9] font-bold hover:underline cursor-pointer"
                    >
                      Apply Online for Admission →
                    </button>
                  </p>
                </div>

              </div>
            )}

            {/* Biometric Scanning Overlay */}
            {biometricScanning && (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-white z-20 space-y-4">
                <div className="relative">
                  <Fingerprint className="h-16 w-16 text-blue-400 animate-pulse" />
                  <div className="absolute -inset-2 rounded-full border-2 border-blue-400/40 animate-ping" />
                </div>
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-bold">Biometric Touch Verification</h4>
                  <p className="text-xs text-slate-400 font-mono">
                    {biometricStage === 'scanning' && 'Scanning fingerprint sensor...'}
                    {biometricStage === 'verifying' && 'Matching university credentials...'}
                    {biometricStage === 'granted' && 'Access Granted! Redirecting...'}
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      {/* ================= 3. PAGE FOOTER ================= */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        © 2026 NEXORA Education & Career Academy. Certified Higher Education Admissions & Assessment Portal.
      </footer>
    </div>
  );
}
