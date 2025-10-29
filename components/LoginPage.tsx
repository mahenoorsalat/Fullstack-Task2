import React, { useState } from 'react';

type UserRole = 'seeker' | 'company' | 'admin';

interface LoginPageProps {
  onLogin: (email: string, password: string, role: UserRole) => void;
  error: string | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserRole>('seeker');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate network delay for better UX
    setTimeout(() => {
        onLogin(email, password, userType);
        setIsSubmitting(false);
    }, 300);
  };
  
  const handleQuickLogin = (role: 'seeker' | 'company') => {
    let quickEmail = '';
    const quickPassword = 'password123';
    
    if (role === 'seeker') {
      quickEmail = 'alex.doe@example.com';
    } else if (role === 'company') {
      quickEmail = 'contact@innovate.com';
    }
    
    setIsSubmitting(true);
    setEmail(quickEmail);
    setPassword(quickPassword);
    setUserType(role);
    
    // Simulate network delay for better UX
    setTimeout(() => {
        onLogin(quickEmail, quickPassword, role);
        setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white/80 backdrop-blur-md shadow-interactive-lg rounded-2xl border border-white/50">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Job Executive
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            For demonstration, use the quick login buttons below.
          </p>
        </div>

        <div className="space-y-4">
            <button
              type="button"
              onClick={() => handleQuickLogin('seeker')}
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-indigo-300"
            >
              Login as Job Seeker
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('company')}
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:bg-green-300"
            >
              Login as Company
            </button>
        </div>

        <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500 bg-white/80 rounded-full">Or sign in manually</span>
            </div>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">{error}</div>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">Sign in as:</label>
              <div className="mt-2 flex justify-center space-x-8">
                <label className="inline-flex items-center">
                  <input type="radio" className="form-radio text-primary" name="userType" value="seeker" checked={userType === 'seeker'} onChange={() => setUserType('seeker')} />
                  <span className="ml-2">Job Seeker</span>
                </label>
                 <label className="inline-flex items-center">
                  <input type="radio" className="form-radio text-primary" name="userType" value="company" checked={userType === 'company'} onChange={() => setUserType('company')} />
                  <span className="ml-2">Company</span>
                </label>
              </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-indigo-300"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;