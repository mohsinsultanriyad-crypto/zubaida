
import React, { useState, useEffect, useRef } from 'react';
import { User, Shift, Leave, SitePost, AdvanceRequest, Announcement } from './types';

import WorkerApp from './components/WorkerApp';
import AdminApp from './components/AdminApp';
import Login from './components/Login';
import { Language } from './translations';
import { Loader2, Cloud } from 'lucide-react';
import { apiGet } from './api';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [posts, setPosts] = useState<SitePost[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [advanceRequests, setAdvanceRequests] = useState<AdvanceRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  // 1. Initial Data Fetch from MongoDB + Session Restoration
  useEffect(() => {
    const initData = async () => {
      try {
        const [users, shifts, leaves, posts, advances, announcements] = await Promise.all([
          apiGet('/api/users'),
          apiGet('/api/attendance'),
          apiGet('/api/leave'),
          apiGet('/api/sitefeed'),
          apiGet('/api/advance'),
          apiGet('/api/reports/monthly'),
        ]);
        setWorkers(users || []);
        setShifts((shifts && shifts.attendance) || []);
        setLeaves((leaves && leaves.leaves) || []);
        setPosts(posts || []);
        setAdvanceRequests((advances && advances.advances) || []);
        setAnnouncements((announcements && announcements.announcements) || []);
      } catch (e) {
        console.error('API fetch failed', e);
      } finally {
        setIsLoaded(true);
      }
    };
    initData();
  }, []);

  // 2. State-to-MongoDB Sync Wrappers
  const updateShifts: React.Dispatch<React.SetStateAction<Shift[]>> = (val) => {
    setShifts(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      setIsSyncing(true);
      db.saveBatch('shifts', next).finally(() => setIsSyncing(false));
      return next;
    });
  };

  const updateLeaves: React.Dispatch<React.SetStateAction<Leave[]>> = (val) => {
    setLeaves(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      setIsSyncing(true);
      db.saveBatch('leaves', next).finally(() => setIsSyncing(false));
      return next;
    });
  };

  const updateWorkers: React.Dispatch<React.SetStateAction<User[]>> = (val) => {
    setWorkers(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      setIsSyncing(true);
      db.saveBatch('workers', next).finally(() => setIsSyncing(false));
      return next;
    });
  };

  const updatePosts: React.Dispatch<React.SetStateAction<SitePost[]>> = (val) => {
    setPosts(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      setIsSyncing(true);
      db.saveBatch('posts', next).finally(() => setIsSyncing(false));
      return next;
    });
  };

  const updateAdvanceRequests: React.Dispatch<React.SetStateAction<AdvanceRequest[]>> = (val) => {
    setAdvanceRequests(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      setIsSyncing(true);
      db.saveBatch('advanceRequests', next).finally(() => setIsSyncing(false));
      return next;
    });
  };

  const updateAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>> = (val) => {
    setAnnouncements(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      setIsSyncing(true);
      db.saveBatch('announcements', next).finally(() => setIsSyncing(false));
      return next;
    });
  };

  const handleLogin = (user: User, token?: string) => {
    // Only store session token and minimal info
    if (token) localStorage.setItem('fw_session_token', token);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('fw_session_token');
    setCurrentUser(null);
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Synchronizing Cloud Data...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} workers={workers} />;
  }

  return (
    <div 
      className={`min-h-screen max-w-md mx-auto bg-white shadow-xl relative overflow-hidden flex flex-col`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Cloud Sync Status Overlay */}
      <div className="fixed top-4 right-4 z-[200] pointer-events-none">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all duration-500 shadow-sm ${isSyncing ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>
          <Cloud size={10} className={isSyncing ? 'animate-bounce' : ''} />
          {isSyncing ? 'Syncing...' : 'MongoDB Live'}
        </div>
      </div>

      {currentUser.role === 'admin' ? (
        <AdminApp 
          user={currentUser} 
          shifts={shifts} 
          setShifts={updateShifts} 
          leaves={leaves} 
          setLeaves={updateLeaves}
          workers={workers}
          setWorkers={updateWorkers}
          posts={posts}
          setPosts={updatePosts}
          advanceRequests={advanceRequests}
          setAdvanceRequests={updateAdvanceRequests}
          announcements={announcements}
          setAnnouncements={updateAnnouncements}
          onLogout={handleLogout}
          language={language}
          setLanguage={handleSetLanguage}
        />
      ) : (
        <WorkerApp 
          user={currentUser} 
          shifts={shifts} 
          setShifts={updateShifts} 
          leaves={leaves} 
          setLeaves={updateLeaves}
          posts={posts}
          setPosts={updatePosts}
          advanceRequests={advanceRequests}
          setAdvanceRequests={updateAdvanceRequests}
          announcements={announcements}
          workers={workers}
          onLogout={handleLogout}
          language={language}
          setLanguage={handleSetLanguage}
        />
      )}
    </div>
  );
};

export default App;
