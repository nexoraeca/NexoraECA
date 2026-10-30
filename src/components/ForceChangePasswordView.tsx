import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Key, Lock, ShieldCheck, AlertCircle, CheckCircle2, 
  Eye, EyeOff, Loader2, LogOut, ArrowRight, ShieldAlert, Sparkles 
} from 'lucide-react';
import NexoraLogo from './NexoraLogo';

interface ForceChangePasswordViewProps {
  session: {
    username: string;
    fullName?: string;
    email?: string;
    role: string;
    student?: any;
    mustChangePassword?: boolean;
  };
  onPasswordChanged: (newPassword: string) => void;
  onLogout: () => void;
}

export default function ForceChangePasswordView({
  session,
  onPasswordChanged,
  onLogout
}: ForceChangePasswordViewProps) {
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [showOldPass, setShowOldPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  // Compute password strength
  const getPasswordStrength = () => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!oldPassword.trim()) {
      setError('Please enter your current/temporary password.');
      return;
    }
    if (!newPassword.trim()) {
      setError('Please enter your new password.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters in length.');
      return;
    }
    if (newPassword === oldPassword) {
      setError('New password must be different from your old temporary password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: session.username || session.email || session.student?.id,
          oldPassword: oldPassword.trim(),
          newPassword: newPassword.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setSuccess(true);
      setTimeout(() => {
        onPasswordChanged(newPassword);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error updating password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex flex-col justify-between text-white" id="force-change-password-screen">
      
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NexoraLogo />
            <div>
              <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase block">
                Security Gatekeeper
              </span>
              <span className="text-sm font-extrabold text-white">
                NEXORA Student Verification
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="max-w-md w-full bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6 relative overflow-hidden">
          
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-[#0057D9] to-emerald-500" />

          {/* Heading */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-amber-200/60">
              <Key className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full inline-block">
                First-Time Login Security Setup
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Change Temporary Password
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                Welcome, <strong>{session.fullName || session.username}</strong>! For the protection of your admission records and scholarship status, please set a new personal password before accessing the student portal.
              </p>
            </div>
          </div>

          {/* Student Identity Pill */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex items-center justify-between text-xs">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Student Account</span>
              <span className="font-bold text-slate-900 truncate block">
                {session.fullName || 'Registered Student'}
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 shrink-0">
              {session.student?.id || session.username}
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-start gap-2 shadow-2xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 shadow-2xs">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <div className="font-bold">Password updated successfully! Entering student dashboard...</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 1. Old / Temporary Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  1. Old / Temporary Password *
                </label>
                <button
                  type="button"
                  onClick={() => setShowOldPass(!showOldPass)}
                  className="text-[11px] font-semibold text-[#0057D9] hover:underline cursor-pointer flex items-center gap-1"
                >
                  {showOldPass ? (
                    <>
                      <EyeOff className="h-3 w-3" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3" />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type={showOldPass ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => {
                    setOldPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter the password provided to you"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#0057D9] focus:bg-white focus:ring-1 focus:ring-[#0057D9] transition-all font-mono"
                />
                <button
                  type="button"
                  id="toggle-old-password-visibility"
                  aria-label={showOldPass ? "Hide old password" : "Show old password"}
                  title={showOldPass ? "Hide password" : "Show password"}
                  onClick={() => setShowOldPass(!showOldPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer z-10"
                >
                  {showOldPass ? <EyeOff className="h-4 w-4 text-[#0057D9]" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* 2. New Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  2. Create New Password *
                </label>
                <div className="flex items-center gap-2">
                  {newPassword && (
                    <span className="text-[10px] font-bold text-slate-500">
                      {strengthLabels[strength - 1] || 'Weak'}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="text-[11px] font-semibold text-[#0057D9] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    {showNewPass ? (
                      <>
                        <EyeOff className="h-3 w-3" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3" />
                        <span>Show</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="At least 6 characters"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#0057D9] focus:bg-white focus:ring-1 focus:ring-[#0057D9] transition-all font-mono"
                />
                <button
                  type="button"
                  id="toggle-new-password-visibility"
                  aria-label={showNewPass ? "Hide new password" : "Show new password"}
                  title={showNewPass ? "Hide password" : "Show password"}
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer z-10"
                >
                  {showNewPass ? <EyeOff className="h-4 w-4 text-[#0057D9]" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {newPassword.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 rounded-full transition-all ${
                          strength >= step
                            ? strengthColors[Math.min(strength, 4)]
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Use letters, numbers, and special symbols for maximum security.
                  </span>
                </div>
              )}
            </div>

            {/* 3. Confirm New Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  3. Confirm New Password *
                </label>
                <div className="flex items-center gap-2">
                  {confirmPassword && (
                    <span className={`text-[10px] font-bold ${
                      confirmPassword === newPassword ? 'text-emerald-600' : 'text-rose-500'
                    }`}>
                      {confirmPassword === newPassword ? '✓ Match' : '✗ Differ'}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="text-[11px] font-semibold text-[#0057D9] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    {showConfirmPass ? (
                      <>
                        <EyeOff className="h-3 w-3" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3" />
                        <span>Show</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Re-enter your new password"
                  required
                  className={`w-full bg-slate-50 border rounded-xl pl-10 pr-11 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:ring-1 transition-all font-mono ${
                    confirmPassword && confirmPassword === newPassword
                      ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500'
                      : 'border-slate-200 focus:border-[#0057D9] focus:ring-[#0057D9]'
                  }`}
                />
                <button
                  type="button"
                  id="toggle-confirm-password-visibility"
                  aria-label={showConfirmPass ? "Hide confirm password" : "Show confirm password"}
                  title={showConfirmPass ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer z-10"
                >
                  {showConfirmPass ? <EyeOff className="h-4 w-4 text-[#0057D9]" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3.5 bg-[#0057D9] hover:bg-[#004dc2] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 pt-3"
              id="confirm-password-change-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating Credentials...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <span>Password Updated!</span>
                </>
              ) : (
                <>
                  <span>Save Password & Open Student Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Password Security Policy</span>
            </div>
            <p>
              Your updated credentials will be required for subsequent logins, examination results viewing, and counseling sessions. Keep your password confidential.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-800">
        NEXORA Central Examination & Admissions Security Gatekeeper • 2026
      </footer>
    </div>
  );
}
