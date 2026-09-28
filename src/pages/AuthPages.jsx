import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, CheckCircle2, KeyRound, Shield } from 'lucide-react';
import { useCRM } from '../context/CRMContext';

export const LoginPage = () => {
  const { loginAsRole, teamMembers } = useCRM();
  const navigate = useNavigate();
  const [email, setEmail] = useState('arjun@TechnovaSolutions.in');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes('@') || password.length < 4) {
      setError('Please enter a valid corporate email and password.');
      return;
    }
    const matched = teamMembers.find((m) => m.email.toLowerCase() === email.toLowerCase());
    loginAsRole(matched ? matched.role : 'ADMIN', email);
    navigate('/dashboard');
  };

  const handleQuickRoleLogin = (role) => {
    loginAsRole(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="text-center">
          <Link to="/dashboard" className="text-xl font-bold tracking-tight text-slate-900">
            PulseFlow CRM
          </Link>
          <h1 className="mt-2 text-lg font-bold text-slate-900">
            Sign in to your WhatsApp Sales Workspace
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            AI-powered WhatsApp Cloud API inbox, lead qualification, and sales operations
          </p>
        </div>

        <div className="mt-6 bg-white py-6 px-6 border border-slate-200 rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-slate-600 hover:text-slate-900 underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="text-xs font-semibold text-slate-700 mb-2.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span>Instant Role-Based Demo Access (Phase 2 RBAC Preview)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickRoleLogin('ADMIN')}
                className="py-2 px-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-left transition-colors"
              >
                <div className="text-xs font-bold text-slate-900">ADMIN</div>
                <div className="text-[11px] text-slate-500 truncate">Arjun Nair</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRoleLogin('MANAGER')}
                className="py-2 px-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-left transition-colors"
              >
                <div className="text-xs font-bold text-slate-900">MANAGER</div>
                <div className="text-[11px] text-slate-500 truncate">Meera Krishnan</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRoleLogin('AGENT')}
                className="py-2 px-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-left transition-colors"
              >
                <div className="text-xs font-bold text-slate-900">AGENT</div>
                <div className="text-[11px] text-slate-500 truncate">Rohan Varghese</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('arjun@TechnovaSolutions.in');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="text-center">
          <Link to="/login" className="text-xl font-bold tracking-tight text-slate-900">
            PulseFlow CRM
          </Link>
          <h1 className="mt-2 text-lg font-bold text-slate-900">Reset your account password</h1>
          <p className="mt-1 text-xs text-slate-600">
            Enter your work email and we will send a password recovery link.
          </p>
        </div>

        <div className="mt-6 bg-white py-6 px-6 border border-slate-200 rounded-lg">
          {submitted ? (
            <div className="space-y-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="text-sm font-bold text-slate-900">Recovery link dispatched</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                We have sent a password reset token to <span className="font-mono font-semibold">{email}</span>.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/reset-password"
                  className="w-full py-2 px-4 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Open Reset Password Form (Demo Flow)
                </Link>
                <Link to="/login" className="text-xs text-slate-600 hover:text-slate-900">
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Send Password Reset Link
              </button>
              <div className="text-center pt-2">
                <Link to="/login" className="text-xs text-slate-600 hover:text-slate-900">
                  Return to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { pushToast } = useCRM();
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');

  const handleReset = (e) => {
    e.preventDefault();
    if (newPass.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      setError('Passwords do not match.');
      return;
    }
    pushToast('Password Reset Successful', 'You can now sign in with your updated password.', 'success');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="text-center">
          <KeyRound className="w-7 h-7 text-slate-900 mx-auto" />
          <h1 className="mt-2 text-lg font-bold text-slate-900">Create New Password</h1>
          <p className="mt-1 text-xs text-slate-600">
            Enter a strong password for your PulseFlow CRM account.
          </p>
        </div>

        <div className="mt-6 bg-white py-6 px-6 border border-slate-200 rounded-lg">
          <form onSubmit={handleReset} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Update Password & Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
