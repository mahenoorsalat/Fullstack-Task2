import React, { useState } from 'react';

type UserRole = 'seeker' | 'company' | 'admin';

interface RegisterPageProps {
  onRegister: (name: string, email: string, password: string, role: UserRole) => void;
  onSwitchToLogin: () => void; // Prop to switch back to login view
  error: string | null;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onSwitchToLogin, error }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserRole>('seeker');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate network delay for better UX
    setTimeout(() => {
        onRegister(name, email, password, userType);
        setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white/80 backdrop-blur-md shadow-interactive-lg rounded-2xl border border-white/50">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Your Job Executive Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign up to find or post jobs.
          </p>
        </div>

        {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">{error}</div>}
        
        <form className="space-y-6" onSubmit={handleRegister}>
          <div className="rounded-md shadow-sm -space-y-px">
             <div>
              <label htmlFor="full-name" className="sr-only">Full Name</label>
              <input
                id="full-name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
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
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">Register as:</label>
              <div className="mt-2 flex justify-center space-x-4">
                <label className="inline-flex items-center">
                  <input type="radio" className="form-radio text-primary" name="userType" value="seeker" checked={userType === 'seeker'} onChange={() => setUserType('seeker')} />
                  <span className="ml-2">Job Seeker</span>
                </label>
                 <label className="inline-flex items-center">
                  <input type="radio" className="form-radio text-primary" name="userType" value="company" checked={userType === 'company'} onChange={() => setUserType('company')} />
                  <span className="ml-2">Company</span>
                </label>
                {/* FIX: Added Admin radio button for consistency with UserRole type */}
                <label className="inline-flex items-center">
                  <input type="radio" className="form-radio text-primary" name="userType" value="admin" checked={userType === 'admin'} onChange={() => setUserType('admin')} />
                  <span className="ml-2">Admin</span>
                </label>
              </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:bg-green-300"
            >
              {isSubmitting ? 'Registering...' : 'Register Account'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
                Already have an account? 
                <button 
                    type="button" 
                    onClick={onSwitchToLogin}
                    className="ml-1 font-medium text-primary hover:text-primary-focus"
                >
                    Sign in here
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;