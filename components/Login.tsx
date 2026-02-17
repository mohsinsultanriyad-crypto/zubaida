
import React, { useState } from 'react';
import { User } from '../types';
import { APP_NAME } from '../constants';
import { apiPost, API_BASE } from '../api';

interface LoginProps {
  onLogin: (user: User) => void;
  workers: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, workers }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      console.log('API_BASE', API_BASE);
      const res = await apiPost('/api/login', {
        email: isAdmin ? userId : undefined,
        workerId: !isAdmin ? userId : undefined,
        password,
        role: isAdmin ? 'admin' : 'worker',
      });
      if (res && res.token && res.user) {
        onLogin(res.user, res.token);
      } else {
        setError('Invalid credentials');
      }
    } catch (err: any) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-blue-600 tracking-tight">{APP_NAME}</h1>
          <p className="text-gray-500 text-sm mt-2">Workforce Management System</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => { setIsAdmin(false); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isAdmin ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              Worker
            </button>
            <button 
              onClick={() => { setIsAdmin(true); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isAdmin ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">
                {isAdmin ? 'Admin ID' : 'Worker ID'}
              </label>
              <input 
                type="text" 
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={isAdmin ? "FSA101" : "FS1001"}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
              />
            </div>

            {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 active:scale-95 transition-all mt-4 shadow-lg shadow-blue-100"
            >
              Log In
            </button>
          </form>
        </div>
        
        <p className="text-center text-gray-400 text-xs mt-8">
          © 2024 FASTEP WORK. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
