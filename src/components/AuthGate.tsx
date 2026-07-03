import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Mail, KeyRound, Eye, EyeOff } from 'lucide-react';

interface AuthGateProps {
  role: 'admin' | 'kitchen';
  onSuccess: () => void;
}

const AuthGate: React.FC<AuthGateProps> = ({ role, onSuccess }) => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Local simulated mail configurations
  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [simulatedInbox, setSimulatedInbox] = useState<{ to: string; link: string } | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check local storage users if updated via password reset
    const storedUsers = localStorage.getItem('svd_users_v2');
    let users = storedUsers ? JSON.parse(storedUsers) : [
      { email: 'joelramireddy@gmail.com', password: 'Joel@2007', role: 'admin' },
      { email: 'admin@srvijayadurga.com', password: '123456', role: 'admin' },
      { email: 'pardhusadhu5@gmail.com', password: 'Pardhu62815', role: 'kitchen' },
      { email: 'kitchen@srvijayadurga.com', password: '654321', role: 'kitchen' }
    ];

    const matchedUser = users.find((u: any) => u.email.toLowerCase() === email.trim().toLowerCase() && u.role === role);

    if (!matchedUser) {
      setError('Account not registered for this portal.');
      return;
    }

    if (matchedUser.password !== password) {
      setError('Invalid password.');
      return;
    }

    login(role, email);
    onSuccess();
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedUsers = localStorage.getItem('svd_users_v2');
    const users = storedUsers ? JSON.parse(storedUsers) : [
      { email: 'joelramireddy@gmail.com', password: 'Joel@2007', role: 'admin' },
      { email: 'admin@srvijayadurga.com', password: '123456', role: 'admin' },
      { email: 'pardhusadhu5@gmail.com', password: 'Pardhu62815', role: 'kitchen' },
      { email: 'kitchen@srvijayadurga.com', password: '654321', role: 'kitchen' }
    ];

    const userExists = users.some((u: any) => u.email.toLowerCase() === forgotEmail.trim().toLowerCase() && u.role === role);

    if (!userExists) {
      alert('Email not registered for this role.');
      return;
    }

    setShowForgotModal(false);
    setSimulatedInbox({
      to: forgotEmail,
      link: `reset-pw-${role}`
    });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    const storedUsers = localStorage.getItem('svd_users_v2');
    let users = storedUsers ? JSON.parse(storedUsers) : [
      { email: 'joelramireddy@gmail.com', password: 'Joel@2007', role: 'admin' },
      { email: 'admin@srvijayadurga.com', password: '123456', role: 'admin' },
      { email: 'pardhusadhu5@gmail.com', password: 'Pardhu62815', role: 'kitchen' },
      { email: 'kitchen@srvijayadurga.com', password: '654321', role: 'kitchen' }
    ];

    const idx = users.findIndex((u: any) => u.email.toLowerCase() === forgotEmail.trim().toLowerCase() && u.role === role);
    if (idx > -1) {
      users[idx].password = newPassword;
      localStorage.setItem('svd_users_v2', JSON.stringify(users));
      alert('Password updated successfully! Please log in.');
      setSimulatedInbox(null);
      setShowResetModal(false);
      setPassword('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-white dark:bg-bg-dark rounded-2xl shadow-xl border border-maroon/10 dark:border-saffron/10 overflow-hidden relative glass">
        
        {/* Decorative Top Border */}
        <div className="h-2 bg-gradient-to-r from-maroon to-saffron"></div>
        
        <div className="p-8">
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="w-14 h-14 rounded-full bg-maroon/5 dark:bg-saffron/5 flex items-center justify-center border border-maroon/20 dark:border-saffron/20 mb-3 text-maroon dark:text-saffron">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="font-logo font-extrabold text-2xl text-maroon dark:text-saffron">
              {role === 'admin' ? 'Administrative Control' : 'Kitchen Dashboard'}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Authorized personnel credentials required</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/20 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">Mail ID</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'admin' ? 'joelramireddy@gmail.com' : 'pardhusadhu5@gmail.com'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:border-maroon dark:focus:border-saffron outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  maxLength={32}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:border-maroon dark:focus:border-saffron outline-none transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-maroon text-white dark:bg-saffron dark:text-maroon font-bold text-sm rounded-xl hover:opacity-90 transition-all shadow-md mt-6"
            >
              Access Dashboard
            </button>
          </form>

          <div className="text-center mt-5">
            <button 
              onClick={() => setShowForgotModal(true)}
              className="text-xs font-semibold text-maroon dark:text-saffron hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        </div>

      </div>

      {/* Simulated Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-bg-dark border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 relative">
            <h3 className="font-logo font-bold text-lg text-maroon dark:text-saffron mb-2">Simulate Reset Link</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">Enter registered email for a simulated client password reset.</p>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <input 
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder={role === 'admin' ? 'joelramireddy@gmail.com' : 'pardhusadhu5@gmail.com'}
                className="w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:border-maroon dark:focus:border-saffron outline-none"
              />
              <div className="flex gap-2 justify-end mt-4">
                <button 
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-maroon text-white dark:bg-saffron dark:text-maroon rounded-xl text-xs font-bold"
                >
                  Get Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulated Inbox Overlay */}
      {simulatedInbox && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-bg-dark border-2 border-saffron rounded-2xl shadow-2xl p-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4">
              <h3 className="font-logo font-bold text-lg text-saffron flex items-center gap-1.5">
                <span>📨</span> Client Mailbox (Simulated)
              </h3>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800/50 border-l-4 border-maroon dark:border-saffron p-4 rounded-xl space-y-3">
              <div className="text-xs text-neutral-500">
                <strong>From:</strong> security@srivijayadurga.com<br />
                <strong>To:</strong> {simulatedInbox.to}<br />
                <strong>Subject:</strong> Password Reset Request
              </div>
              <div className="text-sm border-t border-neutral-200 dark:border-neutral-800 pt-3">
                <p>Hello Durga Portal Employee,</p>
                <p className="mt-1.5">Click the link below to set a new access credential for the portal.</p>
                <div className="text-center my-4">
                  <button 
                    onClick={() => {
                      setSimulatedInbox(null);
                      setShowResetModal(true);
                    }}
                    className="px-4 py-2 bg-maroon text-white dark:bg-saffron dark:text-maroon font-bold text-xs rounded-xl shadow-md"
                  >
                    Change Password Link
                  </button>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setSimulatedInbox(null)}
              className="w-full mt-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold rounded-xl"
            >
              Close Inbox
            </button>
          </div>
        </div>
      )}

      {/* Actual Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-bg-dark border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6">
            <h3 className="font-logo font-bold text-lg text-maroon dark:text-saffron mb-3">Set New Password</h3>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">New Password</label>
                <input 
                  type="password"
                  required
                  maxLength={32}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:border-maroon dark:focus:border-saffron outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">Confirm Password</label>
                <input 
                  type="password"
                  required
                  maxLength={32}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:border-maroon dark:focus:border-saffron outline-none"
                />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button 
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-maroon text-white dark:bg-saffron dark:text-maroon rounded-xl text-xs font-bold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AuthGate;
